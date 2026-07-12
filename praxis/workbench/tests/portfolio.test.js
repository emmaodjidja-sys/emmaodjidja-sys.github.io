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
H.eq(snap.reached_use, true, 'movement counts as reaching use');

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
