'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;
var C = W.PraxisScreenCore;

H.assert(!!C, 'PraxisScreenCore loaded');

function byId(items, id) {
  for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
  return null;
}

// ---- degraded: empty context ------------------------------------------------
var empty = S.createEmptyContext();
var bare = C.buildScreenItems(empty, { deliverable: null, todayIso: '2026-07-11' });
H.assert(byId(bare, 'eq:none') != null, 'empty ctx gets the generic EQ item');
H.eq(byId(bare, 'eq:none').severity, 'critical', 'generic EQ item is critical');
H.assert(byId(bare, 'uneg:limitations') != null, 'UNEG core always present');
H.assert(byId(bare, 'ethics:consent') != null, 'ethics screen always present');
H.assert(byId(bare, 'timing:window') == null, 'no timing item without a dated window');
H.assert(byId(bare, 'design:fidelity') == null, 'no design item without a selected design');
H.assert(byId(bare, 'sample:achieved') == null, 'no sample item without a planned sample');
H.assert(byId(bare, 'structure:agreed') == null, 'no structure item without agreed sections');

// ---- full context -------------------------------------------------------------
var full = S.createEmptyContext();
full.evaluation_matrix.rows = [
  { id: 'q1', number: 1, question: 'To what extent did the programme improve vaccination coverage among zero dose children?' },
  { id: 'q2', number: 2, question: 'How efficiently were resources converted into outputs?' },
  { id: 'q3', number: 3, question: 'Is the intervention sustainable after donor exit?' }
];
full.commissioner.appraisal.evidence = [{ eq_id: 'q1', rating: 3, justification: '' }];
full.design_recommendation.ranked_designs = [{ id: 'd1', name: 'Difference in differences', family: 'Quasi-experimental' }];
full.design_recommendation.selected_design = 'd1';
full.sample_parameters.result = { primary: 240, label: '240 households' };
full.report_structure.sections = [
  { id: 's1', title: 'Executive Summary' }, { id: 's2', title: 'Methodology' }, { id: 's3', title: 'Findings' }
];
full.commissioner.governance.decision_window_closes = '2026-09-30';
full.commissioner.governance.decision_clock = 'Board replenishment';

var items = C.buildScreenItems(full, { deliverable: null, todayIso: '2026-07-11' });
H.eq(items.filter(function(it) { return it.source === 'eq'; }).length, 3, 'one item per live matrix EQ');
H.eq(byId(items, 'eq:q1').answerability, 3, 'eq item carries C2 answerability');
H.eq(byId(items, 'eq:q2').answerability, null, 'unrated eq has null answerability');
H.eq(byId(items, 'eq:q1').severity, 'critical', 'eq items are critical');
H.assert(byId(items, 'design:fidelity').detail.indexOf('Difference in differences') !== -1, 'design item names the agreed design');
H.assert(byId(items, 'sample:achieved').detail.indexOf('240') !== -1, 'sample item carries planned n');
H.eq(byId(items, 'sample:achieved').severity, 'major', 'sample item is major');
H.eq(byId(items, 'structure:agreed').severity, 'major', 'structure item is major');

// ---- snapshot beats live matrix -----------------------------------------------
full.commissioner.gate.eq_snapshot = [
  { eq_id: 'q1', number: 1, question: 'Original wording of question one?' },
  { eq_id: 'q9', number: 9, question: 'A question later deleted from the matrix?' }
];
var snapItems = C.buildScreenItems(full, { deliverable: null, todayIso: '2026-07-11' });
H.eq(snapItems.filter(function(it) { return it.source === 'eq'; }).length, 2, 'snapshot EQs used when snapped');
H.assert(byId(snapItems, 'eq:q9') != null, 'deleted-from-matrix question still screened from snapshot');
H.assert(byId(snapItems, 'eq:q1').text.indexOf('Original wording') !== -1, 'snapshot wording wins');
H.eq(C.eqRows(full).fromSnapshot, true, 'eqRows reports snapshot source');

// ---- timing auto item -----------------------------------------------------------
function timingFor(closes, submittedAt, todayIso) {
  var ctx = S.createEmptyContext();
  ctx.commissioner.governance.decision_window_closes = closes;
  var del = submittedAt ? { id: 'del_1', submitted_at: submittedAt } : null;
  var out = C.buildScreenItems(ctx, { deliverable: del, todayIso: todayIso });
  return byId(out, 'timing:window');
}
H.eq(timingFor('2026-09-30', '2026-10-05T09:00:00.000Z', '2026-07-11').answer, 'no', 'submitted after close = no');
H.eq(timingFor('2026-09-30', '2026-09-20T09:00:00.000Z', '2026-07-11').answer, 'partial', 'submitted within 14 days of close = partial');
H.eq(timingFor('2026-09-30', '2026-07-01T09:00:00.000Z', '2026-07-11').answer, 'yes', 'submitted well before close = yes');
H.eq(timingFor('2026-09-30', null, '2026-10-02').answer, 'no', 'unattached run falls back to today');
H.eq(timingFor('2026-09-30', '2026-09-16T00:00:00.000Z', '2026-07-11').answer, 'partial', 'exactly 14 days = partial');
H.eq(timingFor('2026-09-30', '2026-09-15T00:00:00.000Z', '2026-07-11').answer, 'yes', '15 days = yes');
H.assert(timingFor('2026-09-30', '2026-10-05T09:00:00.000Z', '2026-07-11').auto === true, 'timing item is auto');

// Primary user window beats governance window when earlier.
var uctx = S.createEmptyContext();
uctx.commissioner.governance.decision_window_closes = '2026-12-31';
uctx.commissioner.users = [{ id: 'u1', tier: 'primary', name: 'Board', window_closes: '2026-08-15' }];
var uTiming = byId(C.buildScreenItems(uctx, { deliverable: { id: 'd', submitted_at: '2026-08-20T00:00:00.000Z' }, todayIso: '2026-07-11' }), 'timing:window');
H.eq(uTiming.answer, 'no', 'earliest primary user window governs the timing check');
H.assert(uTiming.detail.indexOf('Board') !== -1, 'timing detail names the window owner');

// ---- ethics sharpening -----------------------------------------------------------
var sens = S.createEmptyContext();
sens.protection.sensitivity = 'highly_sensitive';
var sharp = byId(C.buildScreenItems(sens, { deliverable: null, todayIso: '2026-07-11' }), 'ethics:consent');
var standard = byId(C.buildScreenItems(S.createEmptyContext(), { deliverable: null, todayIso: '2026-07-11' }), 'ethics:consent');
H.assert(sharp.detail !== standard.detail, 'ethics detail sharpened when sensitivity heightened');
H.assert(sharp.detail.indexOf('highly sensitive') !== -1, 'sharpened detail names the sensitivity level');

// ---- item hygiene ---------------------------------------------------------------
items.forEach(function(it) {
  H.assert(it.answer === null || it.auto, 'non-auto item ' + it.id + ' starts unanswered');
  H.assert(it.severity === 'critical' || it.severity === 'major', it.id + ' has a valid severity');
  H.assert(it.machine_signal === null, it.id + ' starts with no machine signal');
});

// ---- red flags, ambers, verdict --------------------------------------------
function it(id, sev, answer, auto) {
  return { id: id, source: 'uneg', ref: null, severity: sev, text: id, detail: '',
    auto: !!auto, answer: answer === undefined ? null : answer, note: '', machine_signal: null, machine_evidence: '' };
}
var mix = [
  it('a', 'critical', 'yes'), it('b', 'critical', 'no'), it('c', 'critical', 'cant_tell'),
  it('d', 'major', 'no'), it('e', 'major', 'cant_tell'), it('f', 'major', 'partial'),
  it('g', 'critical', 'partial'), it('h', 'major', 'yes')
];
var flags = C.computeRedFlags(mix);
H.eq(flags.length, 3, 'red flags: critical no, critical cant_tell, major no');
H.eq(flags.map(function(x) { return x.id; }).join(','), 'b,c,d', 'red flag identity');
var ambers = C.computeAmbers(mix);
H.eq(ambers.map(function(x) { return x.id; }).join(','), 'e,f,g', 'ambers: major cant_tell plus any partial');

H.eq(C.recommendVerdict(mix).verdict, 'return', 'any red flag recommends return');
var soft = [it('a', 'critical', 'yes'), it('f', 'major', 'partial')];
H.eq(C.recommendVerdict(soft).verdict, 'reserved', 'ambers only recommends reserved');
var clean = [it('a', 'critical', 'yes'), it('h', 'major', 'yes')];
H.eq(C.recommendVerdict(clean).verdict, 'proceed', 'clean and complete recommends proceed');
var incomplete = [it('a', 'critical', 'yes'), it('x', 'major', null)];
H.eq(C.recommendVerdict(incomplete).verdict, null, 'clean but incomplete recommends nothing yet');
H.eq(C.recommendVerdict(incomplete).unanswered.length, 1, 'unanswered surfaced');
var autoDone = [it('a', 'critical', 'yes'), it('t', 'critical', 'yes', true)];
H.eq(C.recommendVerdict(autoDone).verdict, 'proceed', 'auto items never count as unanswered');
var autoUnanswered = [it('a', 'critical', 'yes'), it('h', 'major', 'yes'), it('t', 'critical', null, true)];
var autoUnansweredResult = C.recommendVerdict(autoUnanswered);
H.eq(autoUnansweredResult.verdict, 'proceed', 'an unanswered auto item still recommends proceed');
H.eq(autoUnansweredResult.unanswered.length, 0, 'an unanswered auto item is excluded from unanswered');

// ---- run lifecycle -----------------------------------------------------------
var run = C.newScreenRun(full, 'commissioner', { id: 'del_9', submitted_at: '2026-07-10T00:00:00.000Z' }, '2026-07-11');
H.eq(run.role, 'commissioner', 'run role');
H.eq(run.deliverable_id, 'del_9', 'run linked to deliverable');
H.assert(run.items.length > 5, 'run carries generated items');
H.eq(run.verdict, null, 'run starts with no verdict');
H.eq(run.prescan, null, 'run starts with no prescan');
H.assert(typeof run.id === 'string' && run.id.indexOf('scr_') === 0, 'run id prefixed');

var run2 = C.setItemAnswer(run, run.items[0].id, { answer: 'no', note: 'missing' });
H.eq(run2.items[0].answer, 'no', 'setItemAnswer patches the item');
H.eq(run.items[0].answer, null, 'setItemAnswer does not mutate the original');
H.eq(run2.items[0].note, 'missing', 'note patched too');

// setItemAnswer on an auto item: the computed answer cannot be hand-edited,
// but other patched fields (e.g. note) still apply.
var tctx = S.createEmptyContext();
tctx.commissioner.governance.decision_window_closes = '2026-09-30';
var trun = C.newScreenRun(tctx, 'commissioner', { id: 'del_x', submitted_at: '2026-10-05T00:00:00.000Z' }, '2026-07-11');
var timingBefore = byId(trun.items, 'timing:window');
H.eq(timingBefore.answer, 'no', 'timing item computed answer before any patch');
var trun2 = C.setItemAnswer(trun, 'timing:window', { answer: 'yes', note: 'reviewer note' });
var timingAfter = byId(trun2.items, 'timing:window');
H.eq(timingAfter.answer, 'no', 'setItemAnswer cannot override an auto item computed answer');
H.eq(timingAfter.note, 'reviewer note', 'setItemAnswer still applies note to an auto item');

var list = C.upsertRun([], run);
H.eq(list.length, 1, 'upsert appends new run');
var list2 = C.upsertRun(list, run2);
H.eq(list2.length, 1, 'upsert replaces by id');
H.eq(list2[0].items[0].answer, 'no', 'replacement carries the edit');
H.eq(list.length, 1, 'upsert does not mutate the input list');

// ---- export builder ----------------------------------------------------------
var X = W.PraxisScreenExport;
H.assert(!!X, 'PraxisScreenExport loaded');
var xr = C.newScreenRun(full, 'commissioner', null, '2026-07-11');
xr.reviewer = 'Jane Doe <script>';
xr = C.setItemAnswer(xr, 'uneg:limitations', { answer: 'no', note: 'No limitations section at all' });
xr = C.setItemAnswer(xr, 'uneg:exec', { answer: 'partial' });
xr.verdict = 'return';
xr.completed_at = '2026-07-11T10:00:00.000Z';
var html = X.buildHtml(xr, full);
H.assert(html.indexOf('<script>') === -1, 'reviewer name is escaped');
H.assert(html.indexOf('Limitations are disclosed') !== -1, 'red flag appears in the note');
H.assert(html.indexOf('Return for revision') !== -1, 'verdict label appears');
H.assert(html.indexOf('Red flags') < html.indexOf('All screening items'), 'red flags section comes before the full table');
H.assert(html.indexOf('machine') === -1 || html.indexOf('No machine signals were used') !== -1, 'prescan disclosure states machine signals were not used');
xr.prescan = { ran_at: '2026-07-11T09:00:00.000Z', chars: 90000, words: 14000 };
H.assert(X.buildHtml(xr, full).indexOf('Machine signals from a pasted-text pre-scan were used') !== -1, 'prescan disclosure flips when a prescan ran');
H.assert(X.buildHtml(xr, full).indexOf('First review') !== -1, 'titled as a first review');

// ---- latestCompleted: selection by completed_at, not array position ---------
// upsertRun replaces an existing run IN PLACE by id, so array order tracks
// CREATION order, not completion order. A reviewer can reopen and re-complete
// an earlier run after a later one was completed; the run's array position
// never moves, only its completed_at does. arr[arr.length - 1] would then
// silently return the wrong run. latestCompleted must compare completed_at.
function stubRun(id, role, completedAt) {
  return { id: id, role: role, completed_at: completedAt, items: [] };
}

H.eq(C.latestCompleted([]), null, 'no runs at all returns null');
H.eq(C.latestCompleted([], 'commissioner'), null, 'no runs at all returns null (role given)');

var noneCompleted = [stubRun('r1', 'commissioner', null), stubRun('r2', 'commissioner', null)];
H.eq(C.latestCompleted(noneCompleted, 'commissioner'), null, 'no completed runs among the list returns null');

// Runs with a missing or null completed_at must be ignored even alongside a
// genuinely completed run, never mistaken for "most recent".
var withNulls = [
  stubRun('r1', 'commissioner', '2026-07-01T00:00:00.000Z'),
  stubRun('r2', 'commissioner', null),
  { id: 'r3', role: 'commissioner', items: [] } // no completed_at property at all
];
H.eq(C.latestCompleted(withNulls, 'commissioner').id, 'r1', 'runs with missing or null completed_at are ignored');

// Role filtering: a completed 'team' run must not be returned when asking for
// 'commissioner', even when it is the only completed run in the list.
var onlyTeam = [stubRun('team_only', 'team', '2026-07-05T00:00:00.000Z')];
H.eq(C.latestCompleted(onlyTeam, 'commissioner'), null, 'a completed team run is not returned when asking for commissioner');

// Minimal reproduction of the bug: the earlier array position (team1) has the
// LATER completed_at. arr[arr.length - 1] after filtering would wrongly pick
// cm1 (last position); latestCompleted must pick team1 (latest completed_at).
var mixedRoles = [
  stubRun('team1', 'team', '2026-07-05T00:00:00.000Z'),
  stubRun('cm1', 'commissioner', '2026-07-01T00:00:00.000Z')
];
H.eq(C.latestCompleted(mixedRoles, 'commissioner').id, 'cm1', 'role filter selects the matching role even though the other role completed later');
H.eq(C.latestCompleted(mixedRoles, 'team').id, 'team1', 'role filter selects the matching role');
H.eq(C.latestCompleted(mixedRoles).id, 'team1', 'omitted role considers all roles and the later completed_at wins over array position');

// Deterministic tie: identical completed_at (two saves landing in the same
// millisecond) resolves to the LATER array position.
var tie = [
  stubRun('first', 'commissioner', '2026-07-10T12:00:00.000Z'),
  stubRun('second', 'commissioner', '2026-07-10T12:00:00.000Z')
];
H.eq(C.latestCompleted(tie, 'commissioner').id, 'second', 'identical completed_at ties resolve to the later array position');

// The reopen-and-recomplete-an-earlier-run scenario from the bug report: a
// commissioner completes Run A, later completes Run B (a rescreen of a
// revised report), then reopens Run A and re-records its verdict. A is now
// the most recently completed review, but upsertRun keeps A at array index 0
// (it replaces in place; it never moves a run to the end), so array position
// alone still points at B.
var runA = C.newScreenRun(full, 'commissioner', null, '2026-07-01');
runA.id = 'run_a';
var runB = C.newScreenRun(full, 'commissioner', null, '2026-07-01');
runB.id = 'run_b';
var listAB = C.upsertRun([], runA);
listAB = C.upsertRun(listAB, runB);
// Complete A, then complete B (B later than A).
listAB = C.upsertRun(listAB, Object.assign({}, listAB[0], { completed_at: '2026-07-01T09:00:00.000Z', verdict: 'reserved' }));
listAB = C.upsertRun(listAB, Object.assign({}, listAB[1], { completed_at: '2026-07-02T09:00:00.000Z', verdict: 'proceed' }));
H.eq(listAB[listAB.length - 1].id, 'run_b', 'sanity: B sits at the last array position once both are completed in order');
// Reopen A, then re-complete A with a completed_at AFTER B's. A stays at
// array index 0 throughout: upsertRun replaces by id, it does not reorder.
listAB = C.upsertRun(listAB, Object.assign({}, listAB[0], { completed_at: null, verdict: null }));
listAB = C.upsertRun(listAB, Object.assign({}, listAB[0], { completed_at: '2026-07-03T09:00:00.000Z', verdict: 'proceed' }));
H.eq(listAB[0].id, 'run_a', 'sanity: A is still at array index 0 after reopen and re-complete');
H.eq(listAB[listAB.length - 1].id, 'run_b', 'sanity: B is still at the last array position');
H.eq(C.latestCompleted(listAB, 'commissioner').id, 'run_a',
  'reopened-and-recompleted A is selected over B: array position alone would wrongly keep returning B');

H.summary('screen.test');
