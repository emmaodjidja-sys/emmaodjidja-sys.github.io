'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;

H.eq(S.PRAXIS_VERSION, '1.6.0', 'PRAXIS_VERSION bumped');

var empty = S.createEmptyContext();
H.eq(empty.commissioner.governance.decision_window_opens, '', 'empty ctx has governance.decision_window_opens');
H.eq(empty.commissioner.governance.decision_window_closes, '', 'empty ctx has governance.decision_window_closes');
H.assert(Array.isArray(empty.commissioner.gate.eq_snapshot), 'empty ctx has gate.eq_snapshot array');
H.eq(empty.commissioner.gate.snapped_at, null, 'empty ctx has gate.snapped_at');

// A 1.5.0 project with a user that predates the new fields.
var old = S.createEmptyContext();
old.version = '1.5.0';
old.commissioner.users = [{ id: 'u1', name: 'Board', role: '', tier: 'primary',
  intended_use: 'decide', decision_window: 'Q4 board', influence: 'high', interest: 'high', eq_refs: [] }];
delete old.commissioner.governance.decision_window_opens;
delete old.commissioner.governance.decision_window_closes;
delete old.commissioner.gate.eq_snapshot;
delete old.commissioner.gate.snapped_at;

var up = S.migrate(old);
H.eq(up.version, '1.6.0', '1.5.0 migrates to 1.6.0');
var u = up.commissioner.users[0];
H.eq(u.window_opens, '', 'user backfilled window_opens');
H.eq(u.window_closes, '', 'user backfilled window_closes');
H.eq(u.status, 'in_post', 'user backfilled status');
H.eq(u.successor, '', 'user backfilled successor');
H.eq(u.decision_window, 'Q4 board', 'existing decision_window label preserved');
H.eq(up.commissioner.governance.decision_window_opens, '', 'governance window opens defaulted');
H.assert(Array.isArray(up.commissioner.gate.eq_snapshot) && up.commissioner.gate.eq_snapshot.length === 0, 'gate.eq_snapshot defaulted empty');

// A user that already has values must not be clobbered.
var keep = S.createEmptyContext();
keep.version = '1.5.0';
keep.commissioner.users = [{ id: 'u2', tier: 'primary', status: 'left', successor: 'Jane',
  window_opens: '2026-01-01', window_closes: '2026-06-30' }];
var kept = S.migrate(keep).commissioner.users[0];
H.eq(kept.status, 'left', 'existing status preserved');
H.eq(kept.window_closes, '2026-06-30', 'existing window_closes preserved');

// Chain from 1.4.0 still lands on 1.6.0.
var chain = S.createEmptyContext();
chain.version = '1.4.0';
H.eq(S.migrate(chain).version, '1.6.0', '1.4.0 chains to 1.6.0');
H.summary('migration.test');
