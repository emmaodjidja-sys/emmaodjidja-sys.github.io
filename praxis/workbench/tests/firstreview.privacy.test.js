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

H.summary('firstreview.privacy.test');
