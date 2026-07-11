'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;

H.eq(S.PRAXIS_VERSION, '1.7.0', 'PRAXIS_VERSION bumped');

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
H.eq(up.version, '1.7.0', '1.5.0 migrates to 1.7.0');
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

// Chain from 1.4.0 still lands on 1.7.0.
var chain = S.createEmptyContext();
chain.version = '1.4.0';
H.eq(S.migrate(chain).version, '1.7.0', '1.4.0 chains to 1.7.0');

// ---- 1.7.0: report_screens ------------------------------------------------
H.assert(Array.isArray(S.createEmptyContext().report_screens), 'empty ctx has report_screens array');

var v16 = S.createEmptyContext();
v16.version = '1.6.0';
delete v16.report_screens;
var up17 = S.migrate(v16);
H.eq(up17.version, '1.7.0', '1.6.0 migrates to 1.7.0');
H.assert(Array.isArray(up17.report_screens) && up17.report_screens.length === 0, 'report_screens defaulted empty');

// Existing runs survive a migration untouched.
var withRun = S.createEmptyContext();
withRun.version = '1.6.0';
withRun.report_screens = [{ id: 'scr_1', role: 'commissioner', deliverable_id: null,
  reviewer: 'Jane', started_at: '2026-07-01T00:00:00.000Z', completed_at: null,
  items: [], prescan: null, verdict: null, verdict_recommended: null, note: '' }];
var kept17 = S.migrate(withRun);
H.eq(kept17.report_screens.length, 1, 'existing screen run preserved');
H.eq(kept17.report_screens[0].reviewer, 'Jane', 'screen run fields preserved');

// ---- 1.7.0: machine_evidence is scrubbed at rest ---------------------------
// The shipped code never writes item.machine_evidence: a pre-scan's quoted line
// is body text of a confidential report and lives only in ephemeral React state.
// But an intermediate build DID persist it, and validateContext preserves unknown
// keys, so a .praxis file from that build carries those lines at rest. The
// migration scrubs the field, which makes the invariant true of the DATA and not
// only of the write path. SECRET is the worst case, and is the same line the
// privacy test uses.
var SECRET = 'Consent was refused by Mary Akol, age 14, of Kotido village.';
var dirty = S.createEmptyContext();
dirty.version = '1.6.0';
dirty.report_screens = [
  { id: 'scr_dirty', role: 'commissioner', deliverable_id: null, reviewer: 'Jane',
    started_at: '2026-07-01T00:00:00.000Z', completed_at: '2026-07-02T00:00:00.000Z',
    items: [
      { id: 'ethics:consent', source: 'ethics', severity: 'critical', text: 'Consent and data protection are described',
        answer: 'yes', note: 'p.21', machine_signal: 'found', machine_evidence: SECRET },
      { id: 'uneg:methods', source: 'uneg', severity: 'critical', text: 'The methodology is transparent',
        answer: null, note: '', machine_signal: 'weak', machine_evidence: 'Mixed methods with a household survey (n=236).' },
      { id: 'timing:window', source: 'timing', severity: 'critical', auto: true, text: 'The report is in time for the decision',
        answer: 'yes', note: '', machine_signal: null, machine_evidence: '' }
    ],
    prescan: { ran_at: '2026-07-01T09:00:00.000Z', chars: 90000, words: 14000 },
    verdict: 'proceed', verdict_recommended: 'proceed', note: '' },
  // A malformed run must not throw the migration: items missing entirely.
  { id: 'scr_bare', role: 'team' }
];
var clean = S.migrate(dirty);
var cleanJson = JSON.stringify(clean);
H.assert(cleanJson.indexOf(SECRET) === -1, 'migration scrubs the confidential evidence line out of the context');
H.assert(cleanJson.indexOf('household survey') === -1, 'migration scrubs every evidence snippet, not just the worst one');
var scrubbed = clean.report_screens[0];
H.assert(scrubbed.items.every(function(it) { return it.machine_evidence === ''; }), 'every item comes out with machine_evidence emptied');
H.eq(clean.report_screens.length, 2, 'a run with no items array does not break the migration');
// The scrub takes the evidence and NOTHING else: signals, counts, answers and
// notes are legitimate persisted state.
H.eq(scrubbed.items[0].machine_signal, 'found', 'the machine signal survives the scrub');
H.eq(scrubbed.items[0].answer, 'yes', "the reviewer's own answer survives the scrub");
H.eq(scrubbed.items[0].note, 'p.21', "the reviewer's own note survives the scrub");
H.eq(scrubbed.prescan.words, 14000, 'the prescan word count survives the scrub');
H.eq(scrubbed.verdict, 'proceed', 'the recorded verdict survives the scrub');

H.summary('migration.test');
