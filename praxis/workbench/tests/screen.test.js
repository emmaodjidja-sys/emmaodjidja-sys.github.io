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

H.summary('screen.test');
