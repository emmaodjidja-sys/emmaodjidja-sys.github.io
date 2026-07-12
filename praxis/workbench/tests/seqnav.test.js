/* SequenceNavCore: prev/next derivation for both lenses, and the invariants that
   pin the three bugs found in the old StationNav. */
'use strict';
var H = require('./helpers');
var wb = H.loadWorkbench();
var C = wb.SequenceNavCore;
var D = wb.CockpitData;
var eq = H.eq;
var assert = H.assert;

/* ---- fixtures ---- */

// Cockpit: 7 steps, Overview is home (id 0).
var COCKPIT = D.STATIONS.map(function(s) {
  return { id: s.idx, code: s.code, label: s.label };
});

// Evaluator: 9 steps, no home.
var EVAL = C.buildStationSteps(function(id) { return 'LBL' + id; });

/* ---- cockpit sequence ---- */

var cockpitExpect = [
  // currentId, prevId, nextId, nextKind
  [0, null, 1, 'start'],
  [1, 0, 2, 'continue'],
  [2, 1, 3, 'continue'],
  [3, 2, 4, 'continue'],
  [4, 3, 5, 'continue'],
  [5, 4, 6, 'continue'],
  [6, 5, 0, 'home']
];

cockpitExpect.forEach(function(row) {
  var cur = row[0], wantPrev = row[1], wantNext = row[2], wantKind = row[3];
  var r = C.derive(COCKPIT, cur, 0);
  eq(r.prev ? r.prev.id : null, wantPrev, 'cockpit ' + cur + ': prev');
  eq(r.next ? r.next.id : null, wantNext, 'cockpit ' + cur + ': next');
  eq(r.nextKind, wantKind, 'cockpit ' + cur + ': nextKind');
});

// Overview has no back button; C5 wraps home rather than dead-ending.
assert(C.derive(COCKPIT, 0, 0).prev === null, 'cockpit Overview has no prev');
eq(C.derive(COCKPIT, 6, 0).next.label, 'Overview', 'cockpit C5 next is Overview');

/* ---- evaluator sequence ---- */

eq(EVAL.length, 9, 'evaluator has 9 steps');
assert(C.derive(EVAL, 0, null).prev === null, 'evaluator station 0 has no prev');
assert(C.derive(EVAL, 8, null).next === null, 'evaluator station 8 has no next');
eq(C.derive(EVAL, 8, null).nextKind, null, 'evaluator station 8 nextKind is null');

for (var i = 1; i <= 7; i++) {
  var r = C.derive(EVAL, i, null);
  eq(r.prev.id, i - 1, 'evaluator ' + i + ': prev is ' + (i - 1));
  eq(r.next.id, i + 1, 'evaluator ' + i + ': next is ' + (i + 1));
  eq(r.nextKind, 'continue', 'evaluator ' + i + ': nextKind');
}

/* ---- regression: bug 1, the back button's number must equal its destination ----
   The old StationNav navigated to stationId - 1 while printing stationId, so on
   Station 3 the back button read "Station 3: Evaluation Matrix" and went to
   Station 2. The component now prints step.id of the very object it navigates to,
   so the number and the destination cannot disagree. Pin that. */
[EVAL, COCKPIT].forEach(function(steps, si) {
  var home = si === 1 ? 0 : null;
  steps.forEach(function(s) {
    var prev = C.derive(steps, s.id, home).prev;
    if (prev) {
      eq(prev.id, s.id - 1, 'seq' + si + ' ' + s.id + ': prev.id is the true predecessor');
    }
  });
});

/* ---- regression: bugs 2 and 3, labels are injected, never hardcoded ----
   The old StationNav held a private English LABELS array, so it bypassed i18n
   (French rail, English nav bar) and duplicated PraxisSchema.STATION_LABELS.
   buildStationSteps takes the label source as a parameter; if anyone reintroduces
   a hardcoded array, these sentinel labels stop coming through. */
EVAL.forEach(function(s) {
  eq(s.label, 'LBL' + s.id, 'evaluator step ' + s.id + ': label is injected');
  eq(s.code, '', 'evaluator step ' + s.id + ': code is empty');
});

/* ---- guards ---- */
assert(C.derive(EVAL, 99, null).prev === null, 'unknown id yields null prev');
assert(C.derive(EVAL, 99, null).next === null, 'unknown id yields null next');

H.summary('seqnav');
