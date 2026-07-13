'use strict';
var H = require('./helpers');
var W = H.loadWorkbench(['js/portfolio.js']);
var S = W.PraxisSchema;
var P = W.PraxisPortfolio;

H.assert(!!P, 'PraxisPortfolio loaded');
H.eq(P.KEY, 'praxis-workbench-portfolio', 'storage key');

function fakeStorage() {
  var store = {};
  return {
    getItem: function(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function(k, v) { store[k] = String(v); },
    _store: store
  };
}

// snapshot: null until there is a use story to record
var c = S.createEmptyContext();
H.eq(P.snapshot(c), null, 'no snapshot without recommendations');
c.commissioner.management_response = [
  { id: 'r1', disposition: 'agree', implementation_status: 'implemented' },
  { id: 'r2', disposition: 'agree', implementation_status: 'in_progress' },
  { id: 'r3', disposition: 'reject', implementation_status: 'not_started' }
];
c.project_meta.title = 'Malaria SNT';
var snap = P.snapshot(c);
H.eq(snap.id, c.project_id, 'snapshot keyed by project_id');
H.eq(snap.title, 'Malaria SNT', 'snapshot carries the title');
H.eq(snap.recommendations, 3, 'snapshot counts recommendations');
H.eq(snap.accepted, 2, 'snapshot counts accepted');
H.eq(snap.implemented, 1, 'snapshot counts implemented');
H.eq(snap.reached_use, true, 'movement counts as reaching use when no outcome is recorded');
H.eq(snap.use_basis, 'recommendations', 'no recorded user outcome falls back to the recommendation proxy');

// ---- verdict semantics: recorded user outcomes outrank the recommendation
// proxy. This is the fix for the Zero-Dose contradiction: a recommendation
// moving must not be reported as "reached use" once a named user's outcome
// is on record and says otherwise.

// Case 1: at least one recorded outcome IS 'used' -> verdict used, basis users.
var cUsed = S.createEmptyContext();
cUsed.commissioner.management_response = [{ id: 'r1', disposition: 'agree', implementation_status: 'not_started' }];
cUsed.commissioner.users = [
  { id: 'u1', tier: 'primary', use_outcome: 'used' },
  { id: 'u2', tier: 'primary', use_outcome: 'missed_window' },
  { id: 'u3', tier: 'secondary', use_outcome: '' }
];
var snapUsed = P.snapshot(cUsed);
H.eq(snapUsed.use_basis, 'users', 'a recorded outcome bases the verdict on users');
H.eq(snapUsed.users_recorded, 2, 'only primary users with a recorded outcome count');
H.eq(snapUsed.users_used, 1, 'only "used" outcomes count as used');
H.eq(snapUsed.reached_use, true, 'one used primary user reaches use');

// Case 2 (the Zero-Dose case): recorded outcomes exist, NONE is 'used', but a
// recommendation IS moving. The proxy must NOT override the recorded truth.
var cZeroDose = S.createEmptyContext();
cZeroDose.commissioner.management_response = [{ id: 'r1', disposition: 'agree', implementation_status: 'implemented' }];
cZeroDose.commissioner.users = [
  { id: 'u1', tier: 'primary', use_outcome: 'missed_window' },
  { id: 'u2', tier: 'primary', use_outcome: 'contact_left' },
  { id: 'u3', tier: 'primary', use_outcome: 'wrong_questions' }
];
var snapZeroDose = P.snapshot(cZeroDose);
H.eq(snapZeroDose.moving, 1, 'zero-dose fixture has a moving recommendation');
H.eq(snapZeroDose.use_basis, 'users', 'recorded outcomes base the verdict on users even though a recommendation moved');
H.eq(snapZeroDose.users_recorded, 3, 'all three primary outcomes are recorded');
H.eq(snapZeroDose.users_used, 0, 'none of the recorded outcomes is used');
H.eq(snapZeroDose.reached_use, false, 'recorded non-use outranks the recommendation-movement proxy: this evaluation did NOT reach use');

// Case 3: no outcome recorded at all, but a recommendation IS moving -> the
// proxy fires, basis recommendations.
var cProxy = S.createEmptyContext();
cProxy.commissioner.management_response = [{ id: 'r1', disposition: 'agree', implementation_status: 'in_progress' }];
cProxy.commissioner.users = [{ id: 'u1', tier: 'primary', use_outcome: '' }];
var snapProxy = P.snapshot(cProxy);
H.eq(snapProxy.users_recorded, 0, 'unset use_outcome does not count as recorded');
H.eq(snapProxy.use_basis, 'recommendations', 'no recorded outcome falls back to the proxy');
H.eq(snapProxy.reached_use, true, 'a moving recommendation reaches use under the proxy');

// Case 4: neither a recorded outcome nor a moving recommendation.
var cNeither = S.createEmptyContext();
cNeither.commissioner.management_response = [{ id: 'r1', disposition: 'reject', implementation_status: 'not_started' }];
var snapNeither = P.snapshot(cNeither);
H.eq(snapNeither.users_recorded, 0, 'neither fixture has no recorded outcomes');
H.eq(snapNeither.use_basis, 'recommendations', 'neither fixture falls back to the proxy');
H.eq(snapNeither.reached_use, false, 'neither recorded use nor movement: did not reach use');

// record: upsert by id, no duplicates
var st = fakeStorage();
P.record(c, st);
P.record(c, st);
H.eq(P.readAll(st).length, 1, 'same project recorded once');
var c2 = S.createEmptyContext();
c2.commissioner.management_response = [{ id: 'x', disposition: 'agree', implementation_status: 'not_started' }];
P.record(c2, st);
var all = P.readAll(st);
H.eq(all.length, 2, 'second project appends');
H.eq(all.filter(function(e) { return e.reached_use; }).length, 1, 'one of two reached use');

// remove + corrupt storage
P.remove(c.project_id, st);
H.eq(P.readAll(st).length, 1, 'remove drops the entry');
st.setItem(P.KEY, '{not json');
H.eq(P.readAll(st).length, 0, 'corrupt storage reads as empty');

// a context with no project_id records nothing
var c3 = S.createEmptyContext();
delete c3.project_id;
c3.commissioner.management_response = [{ id: 'y', disposition: 'agree', implementation_status: 'implemented' }];
var st2 = fakeStorage();
P.record(c3, st2);
H.eq(P.readAll(st2).length, 0, 'no project_id, no entry');

H.summary('portfolio.test');
