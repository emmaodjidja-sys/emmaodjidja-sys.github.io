'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var D = W.CockpitData;
var day = H.isoDaysFromNow;

function ctx(over) {
  var c = W.PraxisSchema.createEmptyContext();
  Object.keys(over || {}).forEach(function(k) { c[k] = over[k]; });
  return c;
}

// ---- USER_STATUS ----
H.assert(D.USER_STATUS && D.USER_STATUS.in_post && D.USER_STATUS.handing_over && D.USER_STATUS.left, 'USER_STATUS exported with three states');

// ---- finalReportDeliverable ----
H.eq(D.finalReportDeliverable([]), null, 'finalReport: none');
H.eq(D.finalReportDeliverable([{ id: 'a', type: 'Final report', title: 'X' }]).id, 'a', 'finalReport: by type');
H.eq(D.finalReportDeliverable([{ id: 'b', type: 'Draft', title: 'Year 3 Final Report' }]).id, 'b', 'finalReport: by title fallback');
H.eq(D.finalReportDeliverable([{ id: 'c', type: 'Draft', title: 'Draft report' }]), null, 'finalReport: draft is not final');

// ---- decisionWindowFit ----
H.eq(D.decisionWindowFit(ctx()), null, 'fit: null when nothing dated');

var c1 = ctx();
c1.commissioner.users = [
  { id: 'p1', tier: 'primary', name: 'Board', window_closes: day(60) },
  { id: 'p2', tier: 'primary', name: 'Strategy', window_closes: day(30) },
  { id: 's1', tier: 'secondary', name: 'Partners', window_closes: day(5) }
];
c1.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(10) }];
var f1 = D.decisionWindowFit(c1);
H.eq(f1.window.label, 'Strategy', 'fit: earliest PRIMARY window wins (secondary ignored)');
H.eq(f1.status, 'on_course', 'fit: on course when due before close');
H.eq(f1.marginDays, 20, 'fit: margin is close minus due');

c1.planning.deliverables[0].due_date = day(45);
H.eq(D.decisionWindowFit(c1).status, 'at_risk', 'fit: at risk when due after close');

var c2 = ctx();
c2.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(-10) }];
H.eq(D.decisionWindowFit(c2).status, 'missed', 'fit: missed when window passed with no accepted report');

var c3 = ctx();
c3.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: '2026-06-30' }];
c3.commissioner.report_review = { accepted: true, accepted_at: '2026-06-01T10:00:00.000Z', evidence: [] };
var f3 = D.decisionWindowFit(c3);
H.eq(f3.status, 'landed', 'fit: landed when accepted before close');
H.eq(f3.reportAccepted, true, 'fit: reportAccepted flag');

c3.commissioner.report_review.accepted_at = '2026-07-04T10:00:00.000Z';
H.eq(D.decisionWindowFit(c3).status, 'missed', 'fit: missed when accepted after close');

var c4 = ctx();
c4.commissioner.governance.decision_clock = 'GC8 requests';
c4.commissioner.governance.decision_window_closes = day(90);
var f4 = D.decisionWindowFit(c4);
H.eq(f4.window.label, 'GC8 requests', 'fit: governance window is the fallback');
H.eq(f4.status, 'undated', 'fit: undated when no report date exists yet');

// ---- decisionWindowDisplay ----
H.eq(D.decisionWindowDisplay(null), null, 'display: null when fit is null');

// landed, positive margin: settled success reads as "early", not a countdown.
var dl1 = D.decisionWindowDisplay({ window: { label: 'Board' }, marginDays: 8, status: 'landed', reportDate: '2026-01-01', reportAccepted: true });
H.eq(dl1.value, '8d early', 'display: landed with margin shows days early');
H.eq(dl1.sub, 'Board · Landed in window', 'display: landed sub carries label and phrase');

// landed, margin exactly 0: must not read "0d early".
var dl2 = D.decisionWindowDisplay({ window: { label: 'Board' }, marginDays: 0, status: 'landed', reportDate: '2026-01-01', reportAccepted: true });
H.eq(dl2.value, 'On the closing day', 'display: landed with zero margin does not say 0d early');
H.eq(dl2.sub, 'Board · Landed in window', 'display: landed zero-margin sub unchanged');

// landed, marginDays null: must not read "nulld early".
var dl3 = D.decisionWindowDisplay({ window: { label: 'Board' }, marginDays: null, status: 'landed', reportDate: '2026-01-01', reportAccepted: true });
H.eq(dl3.value, 'Landed', 'display: landed with null margin does not say nulld early');
H.eq(dl3.sub, 'Board · Landed in window', 'display: landed null-margin sub unchanged');

// missed WITH a report date: late report, not a countdown against today.
var dm1 = D.decisionWindowDisplay({ window: { label: 'Board' }, marginDays: -5, status: 'missed', reportDate: '2026-07-05', reportAccepted: true });
H.eq(dm1.value, '5d late', 'display: missed with report date shows days late');
H.eq(dm1.sub, 'Board · Window missed', 'display: missed sub carries label and phrase');

// missed with NO report date at all (no final-report deliverable exists): window
// closed with nothing accepted, distinct from "late". Built via the real
// decisionWindowFit, not a hand-made fit literal, to prove the shape is reachable.
var c11 = ctx();
c11.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(-10) }];
var f11 = D.decisionWindowFit(c11);
H.eq(f11.status, 'missed', 'display: no-deliverable fixture is missed');
H.eq(f11.reportAccepted, false, 'display: no-deliverable fixture has no accepted report');
H.eq(f11.reportDate, null, 'display: no-deliverable fixture has no report date at all');
var dm2 = D.decisionWindowDisplay(f11);
H.eq(dm2.value, '10d since close, no report accepted', 'display: missed without any report date states the window fact, not lateness');
H.assert(dm2.value.indexOf('late') === -1, 'display: missed without any report date never says "late"');
H.eq(dm2.sub, 'Board · Window missed', 'display: missed-no-report sub matches missed-with-report');

// missed with a final-report deliverable that has a due_date, but NO accepted
// report review: this is the due-date-fallback shape that produced the bug, since
// decisionWindowFit populates reportDate from the due_date even though nothing
// was ever accepted. The old code tested reportDate truthiness and printed a
// fabricated "-70d late". Built via the real decisionWindowFit against a context
// with a closed window, a final-report deliverable, and no accepted report.
var c12 = ctx();
c12.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(-10) }];
c12.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(-80) }];
var f12 = D.decisionWindowFit(c12);
H.eq(f12.status, 'missed', 'display: due-date-fallback fixture is missed');
H.eq(f12.reportAccepted, false, 'display: due-date-fallback fixture has no accepted report');
H.assert(!!f12.reportDate, 'display: due-date-fallback fixture has a truthy reportDate (the due date, not an acceptance)');
var dm3 = D.decisionWindowDisplay(f12);
H.assert(dm3.value.indexOf('late') === -1, 'display: due-date-fallback shape never claims a report landed late');
H.eq(dm3.value, '10d since close, no report accepted', 'display: due-date-fallback shape states the window fact, matching the no-deliverable shape exactly');
H.eq(dm3.value, dm2.value, 'display: missed-not-accepted reads identically whether or not a final-report deliverable exists');
H.eq(dm3.sub, 'Board · Window missed', 'display: due-date-fallback sub matches missed-with-report');

// at_risk: still live, forward countdown against today.
var c8 = ctx();
c8.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(30) }];
c8.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(45) }];
var atRiskFit = D.decisionWindowFit(c8);
H.eq(atRiskFit.status, 'at_risk', 'display: fixture is at_risk');
var dar = D.decisionWindowDisplay(atRiskFit);
H.eq(dar.value, '30d left', 'display: at_risk counts down to the close, not the due date');
H.eq(dar.sub, 'Board · At risk', 'display: at_risk sub carries label and phrase');

// on_course: still live, forward countdown against today.
var c9 = ctx();
c9.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(30) }];
c9.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(10) }];
var onCourseFit = D.decisionWindowFit(c9);
H.eq(onCourseFit.status, 'on_course', 'display: fixture is on_course');
var doc = D.decisionWindowDisplay(onCourseFit);
H.eq(doc.value, '30d left', 'display: on_course counts down to the close');
H.eq(doc.sub, 'Board · On course', 'display: on_course sub carries label and phrase');

// undated: no report date, window still open, forward countdown.
var c10 = ctx();
c10.commissioner.governance.decision_clock = 'GC8 requests';
c10.commissioner.governance.decision_window_closes = day(90);
var undatedFit = D.decisionWindowFit(c10);
H.eq(undatedFit.status, 'undated', 'display: fixture is undated');
var du = D.decisionWindowDisplay(undatedFit);
H.eq(du.value, '90d left', 'display: undated counts down to the close');
H.eq(du.sub, 'GC8 requests · Report undated', 'display: undated sub carries label and phrase');

// ---- gateDrift ----
H.eq(D.gateDrift(ctx()), null, 'drift: null before snapshot');
var c5 = ctx();
c5.evaluation_matrix.rows = [
  { id: 'q1', number: 1, question: 'Is targeting  effective?' },
  { id: 'q3', number: 3, question: 'Brand new question' }
];
c5.commissioner.gate.eq_snapshot = [
  { eq_id: 'q1', number: 1, question: 'Is targeting effective?' },
  { eq_id: 'q2', number: 2, question: 'Removed question' }
];
c5.commissioner.gate.snapped_at = '2026-01-01T00:00:00.000Z';
var dr = D.gateDrift(c5);
H.eq(dr.reworded.length, 0, 'drift: whitespace-only change is not a reword');
H.eq(dr.removed.length, 1, 'drift: removed detected');
H.eq(dr.added.length, 1, 'drift: added detected');
H.eq(dr.clean, false, 'drift: not clean');
c5.evaluation_matrix.rows = [{ id: 'q1', number: 1, question: 'Is targeting REALLY effective?' }, { id: 'q2', number: 2, question: 'Removed question' }];
var dr2 = D.gateDrift(c5);
H.eq(dr2.reworded.length, 1, 'drift: rewording detected');
H.eq(dr2.reworded[0].before, 'Is targeting effective?', 'drift: before text carried');
c5.evaluation_matrix.rows = [{ id: 'q1', number: 1, question: 'is targeting effective?' }, { id: 'q2', number: 2, question: 'Removed question' }];
H.eq(D.gateDrift(c5).clean, true, 'drift: case-insensitive match is clean');

// ---- moneyAgainstUse ----
var c6 = ctx();
c6.planning.contract = { total_budget: 100000, currency: 'EUR', amendments: [{ id: 'a1', ceiling_delta: 20000 }] };
c6.planning.invoices = [
  { id: 'i1', amount: 30000, status: 'paid' },
  { id: 'i2', amount: 20000, status: 'approved' },
  { id: 'i3', amount: 50000, status: 'submitted' }
];
var m1 = D.moneyAgainstUse(c6);
H.eq(m1.ceiling, 120000, 'money: ceiling includes amendments');
H.eq(m1.committed, 50000, 'money: committed is approved plus paid only');
H.eq(m1.currency, 'EUR', 'money: currency from contract');
H.eq(m1.verdict, 'pending', 'money: pending before report acceptance');

c6.commissioner.report_review = { accepted: true, accepted_at: '2026-01-01T00:00:00.000Z', evidence: [] };
H.eq(D.moneyAgainstUse(c6).verdict, 'unused', 'money: unused after acceptance with no accepted rec');
c6.commissioner.management_response = [{ id: 'r1', disposition: 'agree', implementation_status: 'not_started' }];
H.eq(D.moneyAgainstUse(c6).verdict, 'informing', 'money: informing when a rec is accepted');
c6.commissioner.management_response[0].implementation_status = 'in_progress';
H.eq(D.moneyAgainstUse(c6).verdict, 'used', 'money: used when action underway');

var c7 = ctx();
c7.planning.budget_lines = [{ id: 'b1', amount: 40000 }, { id: 'b2', amount: 10000 }];
H.eq(D.moneyAgainstUse(c7).ceiling, 50000, 'money: budget lines fallback when no total_budget');

// ---- use outcome vocabulary + rollup ---------------------------------------
var UO = W.CockpitData.USE_OUTCOME;
H.assert(!!UO, 'USE_OUTCOME exported');
['', 'used', 'missed_window', 'attention_lost', 'wrong_questions', 'not_credible', 'contact_left']
  .forEach(function(k) { H.assert(!!UO[k] && typeof UO[k].label === 'string', 'USE_OUTCOME has ' + (k || 'unset')); });

var nu = W.CockpitData.newUser('primary');
H.eq(nu.tier, 'primary', 'newUser sets tier');
H.eq(nu.use_outcome, '', 'newUser defaults use_outcome');
H.eq(nu.status, 'in_post', 'newUser defaults status');
H.assert(nu.id.indexOf('usr_') === 0, 'newUser mints a usr_ id');
H.assert(Array.isArray(nu.eq_refs), 'newUser has eq_refs array');

var cRoll = W.PraxisSchema.createEmptyContext();
cRoll.commissioner.users = [
  { id: 'a', tier: 'primary', use_outcome: 'used' },
  { id: 'b', tier: 'primary', use_outcome: 'missed_window' },
  { id: 'c', tier: 'primary', use_outcome: '' },
  { id: 'd', tier: 'secondary', use_outcome: 'used' }
];
var roll = W.CockpitData.useOutcomeRollup(cRoll);
H.eq(roll.primaries, 3, 'rollup counts primary users only');
H.eq(roll.recorded, 2, 'rollup counts recorded outcomes');
H.eq(roll.used, 1, 'rollup counts used');
H.eq(roll.counts.missed_window, 1, 'rollup tallies reasons');

H.summary('derive.test');
