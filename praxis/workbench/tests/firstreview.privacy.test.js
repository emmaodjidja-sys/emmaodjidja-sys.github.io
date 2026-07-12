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

// ============================================================================
// THE CENTRAL INVARIANT: NO ABSENCE, ANYWHERE, EVER OFFERS A ONE-CLICK ANSWER
// ============================================================================
// A `not_found` is an ABSENCE CLAIM, and a keyword scanner cannot earn one. It means
// "my regex did not match a heading", never "the report omits this". It is wrong on a
// perfectly good English report whose limitations section is called "Caveats and what
// we could not do". It is meaningless on a report in any language the patterns do not
// cover. And the chip it used to render was RED and said "not detected", with a
// one-click "I checked. Record No" beside it: one click -> a critical red flag ->
// recommendVerdict returns 'return' -> the commissioner's one-click "Request revision
// on the deliverable", which flips the deliverable and writes the audit log.
//
// Three builds tried to make that safe by DETECTING, from the text, whether the scan
// had read the document (a Latin-script share, a mixed-script rule, an EN/FR
// function-word density floor). Each closed its own fixture and each was defeated by
// the next input class: a German report with an English cover page, a Dutch one, an
// Italian one, pure Tagalog, and finally Spanish and Portuguese themselves as soon as
// the report carried an English reference list. The guess was the wrong kind of thing.
//
// So the guess is gone and the DEPENDENCY is gone with it. The invariant below is
// STRUCTURAL: the signal map in machineChip gives not_found no answer to record, so
// there is no code path that can render a confirm button on one. It holds in every
// language and every script without the scanner knowing anything about either. This is
// the assertion that must fail if anyone ever puts it back.
//
// Asserted against the REAL rendered panel, not against a restatement of its logic:
// each fixture is pasted into the real textarea, the real Run pre-scan button is
// clicked, and the real tree is searched for the affordance.

// A context that fires every signal family at once: evaluation questions, an agreed
// structure, a planned sample. The more families fire, the more absences a foreign
// report collects, and the more one-clicks there would be to find.
function invariantCtx() {
  var c = S.createEmptyContext();
  c.evaluation_matrix.rows = [
    { id: 'i1', number: 1, question: 'To what extent did the programme improve vaccination coverage among children?' },
    { id: 'i2', number: 2, question: 'Was procurement of bednets cost efficient across implementing partners?' }
  ];
  c.report_structure.sections = [
    { id: 't1', title: 'Executive Summary' }, { id: 't2', title: 'Methodology' }, { id: 't3', title: 'Recommendations' }
  ];
  c.sample_parameters.result = { primary: 240, label: '240 households' };
  return c;
}

// Render the panel, paste, click Run pre-scan, render again, and report what the panel
// actually put on the screen.
function scanThroughPanel(ctx, text) {
  var log = [];
  function disp(a) {
    log.push(a);
    if (a.type === 'SAVE_STATION' && a.payload && a.payload.report_screens) ctx.report_screens = a.payload.report_screens;
  }
  ctx.report_screens = [C.newScreenRun(ctx, 'team', null)];
  hookState = []; hookIdx = 0;
  var t0 = sandbox.FirstReview({ context: ctx, dispatch: disp, role: 'team' });
  findAll(t0, function(el) {
    return el.type === 'textarea' && String(el.props.className || '').indexOf('wb-fr-paste') !== -1;
  })[0].props.ref.current.value = text;
  findAll(t0, function(el) { return el.type === 'button' && el.children[0] === 'Run pre-scan'; })[0].props.onClick();

  hookIdx = 0;
  var tree = sandbox.FirstReview({ context: ctx, dispatch: disp, role: 'team' });
  var saved = ctx.report_screens[0];
  var items = saved.items || [];
  var confirms = findAll(tree, function(el) {
    return el.type === 'button' && String(el.props.className || '').indexOf('wb-fr-chip-confirm') !== -1;
  });
  function labelOf(b) { return String(b.props['aria-label'] || ''); }
  // Which item a confirm button belongs to, read off the aria-label the panel writes
  // ("Record No as my answer for: <item text>"). That is the affordance a screen-reader
  // user hears and a mouse user clicks, so it is the right thing to attribute.
  function confirmsFor(sig) {
    return confirms.filter(function(b) {
      return items.some(function(it) {
        return it.machine_signal === sig && it.text && labelOf(b).indexOf(it.text) !== -1;
      });
    });
  }
  return {
    ctx: ctx, tree: tree, run: saved, items: items, dispatched: log,
    toast: log.filter(function(a) { return a.type === 'SHOW_TOAST'; }).pop(),
    signals: items.filter(function(it) { return it.machine_signal; }),
    notFound: items.filter(function(it) { return it.machine_signal === 'not_found'; }),
    confirms: confirms,
    // Every way of counting the forbidden affordance, because one of them alone could
    // be satisfied by an accident: (1) buttons that would record a No, by their label;
    // (2) buttons attached to an item whose signal is an absence, by attribution.
    recordNo: confirms.filter(function(b) { return labelOf(b).indexOf('Record No as my answer') === 0; }),
    confirmsOnAbsences: confirmsFor('not_found'),
    recordYes: confirms.filter(function(b) { return labelOf(b).indexOf('Record Yes as my answer') === 0; }),
    recordPartial: confirms.filter(function(b) { return labelOf(b).indexOf('Record Partial as my answer') === 0; })
  };
}

// The seven inputs. Each of the middle five is a REAL evaluation report with a real
// executive summary, a real methodology section, real limitations and real
// recommendations. The scan matches none of their headings, so each collects a full set
// of absences, and every one of those absences used to carry a one-click "Record No".
var EN_FULL = [
  'FINAL EVALUATION REPORT', '',
  'Executive Summary',
  'The programme raised immunisation coverage among children in the northern districts over the period under review.', '',
  '1. Methodology',
  'A mixed methods design with a household survey (n=236) and key informant interviews in six districts.', '',
  '2. Findings',
  'Coverage improved across the districts the campaign reached, and the cold chain held at the district stores.'
].join('\n');
var FR_FULL = [
  'RAPPORT FINAL D EVALUATION', '',
  'Resume executif',
  'Le programme a ameliore la couverture vaccinale des enfants dans les districts du nord pendant la periode examinee.', '',
  'Methodologie',
  'L equipe a mene une enquete aupres des menages dans six districts, ainsi que des entretiens avec des informateurs cles.', '',
  'Constatations',
  'La couverture a progresse dans les districts atteints par la campagne et la chaine du froid a tenu dans les entrepots.'
].join('\n');
var ES_FULL = [
  'INFORME FINAL DE EVALUACION', '',
  'Resumen Ejecutivo',
  'El programa mejoro la cobertura de vacunacion entre los ninos menores de cinco anos en las regiones del norte.', '',
  'Metodologia de la evaluacion',
  'El equipo adopto un diseno mixto. Se realizo una encuesta de hogares en seis provincias con una muestra estratificada.', '',
  'Limitaciones',
  'Las restricciones de seguridad impidieron el acceso a dos provincias, por lo que los hallazgos no se aplican alli.', '',
  'Recomendaciones',
  'Ampliar el modelo de sensibilizacion comunitaria a las provincias restantes.'
].join('\n');
// German with the ordinary English cover page, acronym list and reference list: the
// paste that cleared the old EN/FR density floor at 0.0965 and collected three critical
// red flags.
var DE_FULL = [
  'REPUBLIC OF EXAMPLE',
  'Ministry of Health',
  'FINAL EVALUATION REPORT',
  'Independent Evaluation of the National Immunisation Programme',
  'Submitted to the Ministry of Health by the Evaluation Team',
  'March 2026', '',
  'LIST OF ACRONYMS',
  'WHO      World Health Organization',
  'UNICEF   United Nations Children Fund',
  'MoH      Ministry of Health',
  'EPI      Expanded Programme on Immunisation', '',
  'Zusammenfassung',
  'Das Programm verbesserte die Impfrate bei Kindern unter fuenf Jahren in den noerdlichen Regionen deutlich.', '',
  'Methodik der Evaluierung',
  'Das Team verwendete ein gemischtes Design. Eine Haushaltsbefragung wurde in sechs Bezirken durchgefuehrt.', '',
  'Einschraenkungen',
  'Sicherheitsbedingte Beschraenkungen verhinderten den Zugang zu zwei Bezirken.', '',
  'Empfehlungen',
  'Das Modell der gemeindenahen Sensibilisierung auf die verbleibenden Bezirke ausweiten.', '',
  'REFERENCES',
  'Abebe T. and Musa K. (2024). Cold chain performance in rural districts. Journal of Global Health, 14, 41 to 58.',
  'Okonkwo A. (2022). Health information systems and data quality. BMJ Open, 12, e0551.'
].join('\n');
// Pure Tagalog, no English at all in the body. It scored 0.1208 against the old density
// floor purely on collisions ("sa" is also French, "at" is also English), higher than a
// thin but perfectly genuine French paste.
var TL_FULL = [
  'PANGWAKAS NA ULAT NG PAGSUSURI', '',
  'Buod ng Pagsusuri',
  'Ang programa ay nagpabuti sa saklaw ng pagbabakuna sa mga bata na wala pang limang taong gulang sa mga hilagang rehiyon.', '',
  'Paraan ng Pagsusuri',
  'Gumamit ang pangkat ng halo-halong disenyo. Isang sarbey sa mga sambahayan ang isinagawa sa anim na lalawigan.', '',
  'Mga Limitasyon',
  'Ang mga paghihigpit sa seguridad ay pumigil sa pagpunta sa dalawang lalawigan.', '',
  'Mga Rekomendasyon',
  'Palawakin ang modelo ng pagpapamalay sa komunidad sa natitirang mga lalawigan.'
].join('\n');
var AR_ONLY = [
  'تقرير التقييم النهائي للبرنامج الوطني للتحصين',
  '',
  'الملخص التنفيذي',
  'حسنت الحملة تغطية التطعيم بين الأطفال دون سن الخامسة في المناطق الشمالية بنسبة ثمانية عشر نقطة مئوية خلال فترة التقييم.',
  '',
  'المنهجية',
  'اعتمد الفريق تصميما مختلطا يجمع بين البيانات الكمية والنوعية. وأجري مسح للأسر المعيشية شمل عينة عشوائية طبقية في ست مقاطعات.',
  '',
  'القيود',
  'حالت القيود الأمنية دون الوصول إلى مقاطعتين في الشمال الشرقي، ولذلك لا تسري النتائج على تلك المناطق.',
  '',
  'التوصيات',
  'توسيع نموذج التوعية المجتمعية ليشمل المقاطعات المتبقية مع تخصيص ميزانية تشغيلية قارة للفرق المتنقلة.'
].join('\n');
var MIXED_FULL = EN_FULL + '\n\n' + AR_ONLY;

var FIXTURES = [
  ['English', EN_FULL],
  ['French', FR_FULL],
  ['Spanish', ES_FULL],
  ['German with English cover and references', DE_FULL],
  ['Tagalog', TL_FULL],
  ['mixed script (English body + non-Latin annex)', MIXED_FULL],
  ['pure non-Latin', AR_ONLY]
];

var invariantRows = [];
FIXTURES.forEach(function(pair) {
  var name = pair[0];
  var r = scanThroughPanel(invariantCtx(), pair[1]);
  invariantRows.push({ name: name, signals: r.signals.length, notFound: r.notFound.length, recordNo: r.recordNo.length });

  // THE INVARIANT, three ways, on the REAL tree.
  H.eq(r.recordNo.length, 0,
    name + ': the panel renders ZERO one-click "Record No" affordances (' + r.notFound.length + ' absence(s) in this scan)');
  H.eq(r.confirmsOnAbsences.length, 0,
    name + ': and ZERO one-click confirms of ANY kind attached to an item whose signal is an absence');
  H.assert(r.confirms.every(function(b) { return String(b.props['aria-label']).indexOf('Record No') !== 0; }),
    name + ': not one confirm button on the panel would record a No');
  // Nothing is answered by the machine, in any language.
  H.assert(r.items.every(function(it) { return it.answer === null || it.auto; }), name + ': and nothing was answered');
  // And so a scan alone can never drive the recommended verdict anywhere.
  H.eq(C.recommendVerdict(r.items).redFlags.length, 0, name + ': a scan alone writes zero red flags');
});

// The absences are real and plentiful: without this the invariant above could pass
// vacuously on a build that simply stopped emitting them.
var withAbsences = invariantRows.filter(function(row) { return row.notFound > 0; });
H.assert(withAbsences.length >= 5,
  'the fixtures really do produce absences to guard: ' + withAbsences.length + ' of ' + invariantRows.length +
  ' rows carry at least one not_found (' + invariantRows.map(function(x) { return x.name + '=' + x.notFound; }).join(', ') + ')');
H.assert(invariantRows.every(function(row) { return row.recordNo === 0; }),
  'and across every row, the one-click Record No count is ZERO');

// ---- the other half of the fix: DETECTIONS keep their one-click -------------------
// The point is not to disable the scanner. Where it genuinely SAW the word, in any
// language, the shortcut is honest and it stays.
var enPanel = scanThroughPanel(invariantCtx(), EN_FULL);
H.assert(enPanel.recordYes.length > 0, 'English: a detection still offers its one-click "Record Yes"');
H.assert(enPanel.signals.length > enPanel.notFound.length, 'English: the scan really did detect things as well as miss them');
var esPanel = scanThroughPanel(invariantCtx(), ES_FULL);
// The Spanish report contains no n= figure and no word the patterns match, so it is all
// absences: the panel must SAY that, and not present a column of empty notes as a result.
H.eq(esPanel.recordNo.length, 0, 'Spanish: still zero one-click Record No');
H.eq(esPanel.toast.toastType, 'warning', 'Spanish: a scan that matched nothing is NOT a green success toast');
H.assert(esPanel.toast.message.indexOf('matched none of its keywords') !== -1,
  'Spanish: the toast says plainly that the scan matched nothing');
H.assert(esPanel.toast.message.indexOf('recorded no finding') !== -1,
  'Spanish: and that it has therefore recorded no finding');
// The copy speaks about the SCAN, never asserting what the text IS: an English results
// framework that is mostly tables lands in the same place, and telling that reviewer
// "your text is not English" would be false.
H.assert(esPanel.toast.message.indexOf('does not read as English') === -1,
  'the toast does not assert what the text IS, only what the scan did not do');

// The absence note is VISIBLE text on the row, not a tooltip, and it is the honest
// sentence: a keyword scan cannot see a synonym, a differently titled section, unheaded
// prose, or a language it does not read.
var NOTE_HEAD = 'No keyword match. A keyword scan cannot see';
var esNotes = findAll(esPanel.tree, function(el) {
  return el.type === 'p' && (el.children || []).some(function(c) {
    return typeof c === 'string' && c.indexOf(NOTE_HEAD) === 0;
  });
});
H.eq(esNotes.length, esPanel.notFound.length,
  'every absence row carries the honest note as visible text, one per absence');
H.assert(esNotes.every(function(p) {
  return (p.children || []).some(function(c) {
    return typeof c === 'string' && c.indexOf('not evidence that the report omits it') !== -1
      && c.indexOf('answer this one yourself') !== -1;
  });
}), 'and the note says, in the reviewer\'s own words, that an absence is not evidence and is theirs to judge');

// An absence must not LOOK like a finding. The red chip is gone: an absence renders in
// the neutral class, never the danger class.
var absentChips = findAll(esPanel.tree, function(el) {
  return el.type === 'span' && String(el.props.className || '').indexOf('wb-fr-chip--none') !== -1;
});
H.eq(absentChips.length, esPanel.notFound.length, 'every absence renders the neutral chip class');
H.eq(findAll(esPanel.tree, function(el) {
  return String((el.props || {}).className || '').indexOf('wb-fr-chip--miss') !== -1;
}).length, 0, 'and NOTHING renders the old red "not detected" class anywhere in the panel');
H.assert(JSON.stringify(esPanel.tree).indexOf('not detected') === -1,
  'the words "not detected" appear nowhere in the panel: an absence is a note, not a result');

// ---- the AUTO timing item: no chip, no one-click, even if a signal is forced -------
// prescan emits no key for timing:window, so this is the belt to that brace: even with a
// signal written straight onto the item, the panel must render no chip and no confirm on
// a computed item.
var autoCtx = S.createEmptyContext();
autoCtx.commissioner.governance.decision_clock = 'the board decision';
autoCtx.commissioner.governance.decision_window_closes = '2026-12-31';
var autoRun = C.newScreenRun(autoCtx, 'team', null, '2026-07-11');
var autoItem = autoRun.items.filter(function(it) { return it.id === 'timing:window'; })[0];
H.assert(!!autoItem && autoItem.auto, 'the fixture really does build the computed timing item');
autoRun = C.setItemAnswer(autoRun, 'timing:window', { machine_signal: 'not_found' });
H.eq(autoRun.items.filter(function(it) { return it.id === 'timing:window'; })[0].machine_signal, 'not_found',
  'and a signal really was forced onto it, so the guard has something to guard against');
autoCtx.report_screens = [autoRun];
hookState = []; hookIdx = 0;
var autoTree = sandbox.FirstReview({ context: autoCtx, dispatch: function() {}, role: 'team' });
var autoRow = findAll(autoTree, function(el) { return el.type === 'div' && el.props.key === 'timing:window'; })[0];
H.assert(!!autoRow, 'the timing row renders');
H.eq(findAll(autoRow, function(el) {
  return String((el.props || {}).className || '').indexOf('wb-fr-chip') !== -1;
}).length, 0, 'the computed timing item renders NO chip, even with a signal forced onto it');
H.eq(findAll(autoRow, function(el) {
  return el.type === 'button' && String((el.props || {}).className || '').indexOf('wb-fr-chip-confirm') !== -1;
}).length, 0, 'and no one-click confirm');

H.summary('firstreview.privacy.test');