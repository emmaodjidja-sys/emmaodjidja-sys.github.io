/* The privacy guarantee of the paste-text pre-scan, tested against the REAL
   FirstReview component rather than a restatement of its logic.

   The promise this file exists to keep: an evaluation report is confidential and
   is often GBV-adjacent, and the evidence snippet a signal carries is, by
   construction, the single most sensitive line in it (prescan quotes the first
   line that matches a question's terms, so a question about consent quotes the
   line about consent). Anything written onto an item or onto the run flows into
   localStorage, into the downloadable .praxis project file, and into exports.
   Therefore the run may carry the SIGNAL and the matched-term COUNTS, which are
   derived facts about the text, and never the text.

   FirstReview is a React component, so the other test files' loader is not
   enough: this one stubs React (a two-hook shim, since the component is a pure
   function of props) and the browser globals, renders the panel, pastes a report
   into the box, clicks Run pre-scan, and reads the payload that reaches
   SAVE_STATION. A regression that persists a snippet fails here loudly. */
'use strict';
var H = require('./helpers');
var fs = require('fs');
var path = require('path');
var vm = require('vm');

// ---- React and browser shim --------------------------------------------------
var hookState = [];
var hookIdx = 0;
function useState(init) {
  var i = hookIdx++;
  if (!(i in hookState)) hookState[i] = (typeof init === 'function') ? init() : init;
  return [hookState[i], function(v) { hookState[i] = v; }];
}
function useRef(init) {
  var i = hookIdx++;
  if (!(i in hookState)) hookState[i] = { current: init };
  return hookState[i];
}
function createElement(type, props) {
  var el = { type: type, props: props || {}, children: Array.prototype.slice.call(arguments, 2) };
  // Stand-in DOM node for a ref'd host element, so pasteRef.current.value works.
  if (props && props.ref && typeof type === 'string') props.ref.current = { tag: type, value: '' };
  return el;
}

var sandbox = {};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.console = console;
sandbox.React = { createElement: createElement, useState: useState, useRef: useRef };
sandbox.PraxisContext = { ACTION_TYPES: { SAVE_STATION: 'SAVE_STATION', SHOW_TOAST: 'SHOW_TOAST' } };
sandbox.SectionCard = function SectionCard() {};
// The component defers the scan across a frame and a task so the UI can paint;
// here both run straight through.
sandbox.requestAnimationFrame = function(fn) { fn(); };
sandbox.setTimeout = function(fn) { fn(); };
vm.createContext(sandbox);
['js/utils.js', 'js/schema.js', 'js/export-utils.js', 'js/commissioner/CockpitData.js',
 'js/commissioner/CockpitAlerts.js', 'js/review/ScreenCore.js', 'js/review/ScreenExport.js',
 'js/review/FirstReview.js'].forEach(function(f) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), sandbox, { filename: f });
});
var S = sandbox.PraxisSchema;
var C = sandbox.PraxisScreenCore;
var X = sandbox.PraxisScreenExport;

// ---- a confidential report ---------------------------------------------------
// SECRET_LINE is the worst case and is not decoration: EQ3's distinctive terms
// (consent, kotido) both land on it, so prescan lifts it verbatim as that
// signal's evidence. If the component ever persists evidence again, this exact
// string is what leaks into the project file.
var SECRET_LINE = 'Consent was refused by Mary Akol, age 14, of Kotido village.';
var BODY_MARKER = 'zebra quantum paragraph nobody may ever persist';
var REPORT = [
  'FINAL EVALUATION REPORT', '',
  'Executive Summary',
  'Vaccination coverage among zero dose children in Karamoja improved by 18 points.', '',
  '1. Methodology',
  'Mixed methods with a household survey (n=236) and key informant interviews.', '',
  '2. Limitations',
  'Security constraints restricted access to two districts.', '',
  '3. Ethics and consent',
  SECRET_LINE, '',
  '4. Findings',
  BODY_MARKER, '',
  '5. Recommendations',
  'Scale the outreach model.'
].join('\n');

var ctx = S.createEmptyContext();
ctx.evaluation_matrix.rows = [
  { id: 'q1', number: 1, question: 'To what extent did the programme improve vaccination coverage among zero dose children in Karamoja?' },
  { id: 'q3', number: 2, question: 'How was informed consent obtained from adolescent survivors interviewed in Kotido?' }
];
ctx.report_structure.sections = [{ id: 's1', title: 'Executive Summary' }, { id: 's2', title: 'Methodology' }, { id: 's3', title: 'Findings' }];
ctx.sample_parameters.result = { primary: 240, label: '240 households' };
ctx.report_screens = [C.newScreenRun(ctx, 'team', null)];

var dispatched = [];
function dispatch(a) {
  dispatched.push(a);
  if (a.type === 'SAVE_STATION' && a.payload && a.payload.report_screens) ctx.report_screens = a.payload.report_screens;
}

// ---- render, paste, scan -----------------------------------------------------
function walk(el, fn) {
  if (!el || typeof el !== 'object') return;
  if (Array.isArray(el)) { el.forEach(function(c) { walk(c, fn); }); return; }
  fn(el);
  (el.children || []).forEach(function(c) { walk(c, fn); });
}
function findAll(tree, pred) { var out = []; walk(tree, function(el) { if (pred(el)) out.push(el); }); return out; }

hookIdx = 0;
var tree = sandbox.FirstReview({ context: ctx, dispatch: dispatch, role: 'team' });
var paste = findAll(tree, function(el) {
  return el.type === 'textarea' && String(el.props.className || '').indexOf('wb-fr-paste') !== -1;
});
H.eq(paste.length, 1, 'the active run shows exactly one paste box');
var scanBtn = findAll(tree, function(el) { return el.type === 'button' && el.children[0] === 'Run pre-scan'; })[0];
H.assert(!!scanBtn, 'the paste box offers a Run pre-scan button');

paste[0].props.ref.current.value = REPORT;
scanBtn.props.onClick();

var saves = dispatched.filter(function(a) { return a.type === 'SAVE_STATION'; });
H.assert(saves.length > 0, 'scanning persists the run');
var pr = saves[saves.length - 1].payload.report_screens[0];
var json = JSON.stringify(pr);
var ctxJson = JSON.stringify(ctx);          // what localStorage and the .praxis file would hold
function item(id) { return pr.items.filter(function(i) { return i.id === id; })[0]; }

// ---- the guarantee -----------------------------------------------------------
H.assert(json.indexOf(SECRET_LINE) === -1, 'the persisted run does not contain the sensitive evidence line');
H.assert(json.indexOf(BODY_MARKER) === -1, 'the persisted run does not contain report body text');
H.assert(json.indexOf('improved by 18 points') === -1, 'the persisted run does not contain a quoted evidence line');
H.assert(ctxJson.indexOf(SECRET_LINE) === -1, 'the saved context (localStorage, project file) is free of the evidence line');
H.assert(ctxJson.indexOf(BODY_MARKER) === -1, 'the saved context is free of report body text');
H.assert(pr.items.every(function(it) { return !it.machine_evidence; }), 'no item carries a machine_evidence string');
H.eq(Object.keys(pr.prescan).sort().join(','), 'chars,ran_at,words', 'run.prescan holds only ran_at, chars, words');
H.eq(pr.prescan.chars, REPORT.length, 'run.prescan.chars is a count of the text, not the text');
H.assert(paste[0].props.ref.current.value === '', 'the paste box is cleared once the scan ends');
H.assert(dispatched.filter(function(a) { return a.type === 'SHOW_TOAST'; }).every(function(t) {
  return t.message.indexOf(SECRET_LINE) === -1 && t.message.indexOf(BODY_MARKER) === -1;
}), 'no toast carries report text');
H.assert(X.buildHtml(pr, ctx).indexOf(SECRET_LINE) === -1, 'the exported review note is free of the evidence line');

// The snippet must still REACH the reviewer, in session state, or the feature is
// useless: they have to see why a signal fired. This asserts the leak path is
// live and closed, not merely absent.
var session = hookState.filter(function(s) { return s && s.by_item; })[0];
H.assert(!!session && JSON.stringify(session).indexOf(SECRET_LINE) !== -1,
  'the evidence snippet reaches session state, where the reviewer can see it');

// ---- signals are signals, not answers ----------------------------------------
H.eq(item('ethics:consent').machine_signal, 'found', 'ethics:consent carries a signal after a scan');
H.eq(item('ethics:consent').answer, null, 'a signal on a critical ethics item does not answer it');
H.assert(pr.items.every(function(it) { return it.answer === null || it.auto; }), 'no item was answered by the machine');
H.eq(item('eq:q1').machine_total, 8, 'an EQ signal persists its denominator');
H.assert(typeof item('eq:q1').machine_hits === 'number', 'an EQ signal persists its numeric hit count');
var timing = item('timing:window');
H.assert(!timing || !timing.machine_signal, 'the computed timing item never receives a signal');

// ---- no one-click confirm on the three ethics items --------------------------
// A 'found' on ethics:consent means only that a keyword appeared. The line the
// scan quotes as "Basis:" can be a table-of-contents entry ("3. Ethics and
// consent ..... 21") or an annex title ("Annex 4: Consent forms"): it passes
// isHeadingLine, and it LOOKS to a hurried reviewer like corroboration of a
// critical, GBV-adjacent safeguarding claim. The chip and the basis line stay
// (no information is withheld), but the shortcut that turns a keyword into a
// recorded answer with one click does not, and the row says why. The gate is on
// SOURCE, not severity: EQ items are critical too, and they keep their confirm
// because their chip prints a denominator and its own caveat.
var ETHICS_TEXT = { 'ethics:consent': 1, 'ethics:identifiable': 1, 'ethics:harm': 1 };
var ethicsTexts = C.buildScreenItems(ctx, {}).filter(function(it) { return ETHICS_TEXT[it.id]; })
  .map(function(it) { return it.text; });
H.eq(ethicsTexts.length, 3, 'the checklist has the three ethics items');

hookIdx = 0;
var scanned = sandbox.FirstReview({ context: ctx, dispatch: dispatch, role: 'team' });
var confirms = findAll(scanned, function(el) {
  return el.type === 'button' && String(el.props.className || '').indexOf('wb-fr-chip-confirm') !== -1;
});
H.assert(confirms.length > 0, 'non-ethics items with a signal still offer a one-click confirm');
H.assert(confirms.every(function(b) {
  return ethicsTexts.every(function(t) { return String(b.props['aria-label'] || '').indexOf(t) === -1; });
}), 'no ethics item offers a one-click confirm');

// The chip and its basis line must survive: withholding the shortcut may not cost
// the reviewer information.
var chipText = findAll(scanned, function(el) {
  return el.type === 'span' && String(el.props.className || '').indexOf('wb-fr-chip') !== -1
    && String(el.props.className || '').indexOf('confirm') === -1;
}).map(function(el) { return JSON.stringify(el.children); }).join(' ');
H.assert(chipText.indexOf('Text scan') !== -1, 'signal chips still render');

// The caveat has to be VISIBLE text, not a title tooltip. It rides with the chip,
// so it appears on exactly those ethics rows a scan actually spoke about: only
// ethics:consent has a SECTION_FAMILIES pattern, because no regex can judge
// ethics:identifiable or ethics:harm and prescan deliberately gives them no key
// rather than a fabricated one. A row with no chip has nothing to caveat.
var CAVEAT = 'Safeguarding: the scan can only see the word. Read the section and answer this one yourself.';
var caveats = findAll(scanned, function(el) {
  return el.type === 'p' && (el.children || []).indexOf(CAVEAT) !== -1;
});
var signalledEthics = pr.items.filter(function(it) { return it.source === 'ethics' && it.machine_signal; });
H.assert(signalledEthics.length > 0, 'at least one ethics row carries a signal, so the caveat has something to guard');
H.eq(caveats.length, signalledEthics.length, 'every ethics row with a signal carries the safeguarding caveat as visible text');

// ---- a completed run cannot be re-scanned ------------------------------------
// A scan rewrites every item's machine_signal AND sets run.prescan. On a run
// whose verdict is already signed (and, for a commissioner, already in the audit
// log) that RETROACTIVELY rewrites the exported Method paragraph of a review that
// was completed before any scan existed. So: no paste box on a completed run. To
// scan, the reviewer must Reopen, which is an explicit act that clears the
// verdict. Recorded here through the real flow, by clicking the verdict button.
var proceed = findAll(scanned, function(el) {
  return el.type === 'button' && el.children[0] === 'Proceed to full review';
})[0];
H.assert(!!proceed, 'an open run offers the verdict buttons');
proceed.props.onClick();

hookIdx = 0;
var doneTree = sandbox.FirstReview({ context: ctx, dispatch: dispatch, role: 'team' });
var doneRun = ctx.report_screens[0];
H.assert(!!doneRun.completed_at, 'the run is completed');
H.eq(doneRun.verdict, 'proceed', 'the verdict is recorded');
H.eq(findAll(doneTree, function(el) {
  return el.type === 'textarea' && String(el.props.className || '').indexOf('wb-fr-paste') !== -1;
}).length, 0, 'a completed run renders no paste box');
H.eq(findAll(doneTree, function(el) {
  return el.type === 'button' && el.children[0] === 'Run pre-scan';
}).length, 0, 'a completed run offers no Run pre-scan button');
H.assert(findAll(doneTree, function(el) {
  return el.type === 'button' && el.children[0] === 'Reopen';
}).length === 1, 'the completed run can still be reopened, which is the way back to a scan');

// ---- the short-text warning is not a green success toast ---------------------
// "Is that the whole report?" is a caution. In a feature whose organising
// principle is no false green, it may not arrive in the green of a clean save.
var shortCtx = S.createEmptyContext();
shortCtx.report_screens = [C.newScreenRun(shortCtx, 'team', null)];
var shortDispatched = [];
function shortDispatch(a) {
  shortDispatched.push(a);
  if (a.type === 'SAVE_STATION' && a.payload && a.payload.report_screens) shortCtx.report_screens = a.payload.report_screens;
}
hookState = []; hookIdx = 0;
var shortTree = sandbox.FirstReview({ context: shortCtx, dispatch: shortDispatch, role: 'team' });
var shortPaste = findAll(shortTree, function(el) {
  return el.type === 'textarea' && String(el.props.className || '').indexOf('wb-fr-paste') !== -1;
})[0];
shortPaste.props.ref.current.value = 'Executive Summary\nA very short note, well under five hundred words.';
findAll(shortTree, function(el) { return el.type === 'button' && el.children[0] === 'Run pre-scan'; })[0].props.onClick();
var shortToast = shortDispatched.filter(function(a) { return a.type === 'SHOW_TOAST'; }).pop();
H.assert(shortToast.message.indexOf('under 500 words') !== -1, 'a short paste warns that it may not be the whole report');
H.eq(shortToast.toastType, 'warning', 'the short-text warning is a warning toast, not a green success');

H.summary('firstreview.privacy.test');
