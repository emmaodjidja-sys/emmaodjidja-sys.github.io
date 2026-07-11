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

// ---- machine_evidence is scrubbed at rest, WHATEVER THE VERSION STAMP -------
// The shipped code never writes item.machine_evidence: a pre-scan's quoted line
// is body text of a confidential report and lives only in ephemeral React state.
// But intermediate builds DID persist it, and validateContext preserves unknown
// keys, so a .praxis file or localStorage blob from one of those builds carries
// those lines at rest. migrate scrubs the field, which makes the invariant true
// of the DATA and not only of the write path.
//
// THE VERSION THAT MATTERS IS 1.7.0, NOT 1.6.0. The scrub first lived inside
// MIGRATIONS['1.6.0'], where it was INERT for every file it was written to
// protect: the version bump to 1.7.0 landed in the first commit of the feature,
// before the pre-scan existed, so the builds that persisted snippets stamped
// their files 1.7.0, and migrate() is a no-op on a 1.7.0 context (no
// MIGRATIONS['1.7.0'], and the reset-to-1.0 guard is skipped because the version
// IS the current one). Worse, a 1.6.0 context carrying report_screens is a
// combination that cannot exist in the wild, because 1.6.0 builds had no such
// field: the old fixture tested an impossible input and passed. So the fixture
// below is stamped 1.7.0, the version that can actually occur, and the 1.6.0 and
// newer-than-current cases are kept alongside it. SECRET is the worst case, and
// is the same line the privacy test uses.
var SECRET = 'Consent was refused by Mary Akol, age 14, of Kotido village.';
var SNIPPET2 = 'Mixed methods with a household survey (n=236).';

function dirtyScreens() {
  return [
    { id: 'scr_dirty', role: 'commissioner', deliverable_id: null, reviewer: 'Jane',
      started_at: '2026-07-01T00:00:00.000Z', completed_at: '2026-07-02T00:00:00.000Z',
      items: [
        { id: 'ethics:consent', source: 'ethics', severity: 'critical', text: 'Consent and data protection are described',
          answer: 'yes', note: 'p.21', machine_signal: 'found', machine_evidence: SECRET },
        { id: 'eq:q1', source: 'eq', severity: 'critical', text: 'EQ1 is answered',
          answer: null, note: '', machine_signal: 'weak', machine_hits: 3, machine_total: 8,
          machine_evidence: SNIPPET2 },
        { id: 'timing:window', source: 'timing', severity: 'critical', auto: true, text: 'The report is in time for the decision',
          answer: 'yes', note: '', machine_signal: null, machine_evidence: '' }
      ],
      prescan: { ran_at: '2026-07-01T09:00:00.000Z', chars: 90000, words: 14000 },
      verdict: 'proceed', verdict_recommended: 'proceed', note: '' },
    // Malformed runs must not throw the scrub: no items array at all, a null run,
    // a non-array items, a null item.
    { id: 'scr_bare', role: 'team' },
    null,
    { id: 'scr_weird', role: 'team', items: 'not an array' },
    { id: 'scr_nullitem', role: 'team', items: [null, { id: 'x', machine_evidence: SECRET }] }
  ];
}

// Everything a scrub must NOT touch, asserted on one migrated context.
function assertScrubbed(clean, label) {
  var json = JSON.stringify(clean);
  H.assert(json.indexOf(SECRET) === -1, label + ': the confidential evidence line is scrubbed out of the context');
  H.assert(json.indexOf('household survey') === -1, label + ': every evidence snippet is scrubbed, not just the worst one');
  var run = clean.report_screens[0];
  H.assert(run.items.every(function(it) { return it.machine_evidence === ''; }), label + ': every item comes out with machine_evidence emptied');
  H.eq(clean.report_screens.length, 5, label + ': malformed runs do not break the migration');
  // The scrub takes the evidence and NOTHING else: signals, counts, answers,
  // notes and verdicts are legitimate persisted state.
  H.eq(run.items[0].machine_signal, 'found', label + ': the machine signal survives the scrub');
  H.eq(run.items[0].answer, 'yes', label + ": the reviewer's own answer survives the scrub");
  H.eq(run.items[0].note, 'p.21', label + ": the reviewer's own note survives the scrub");
  H.eq(run.items[1].machine_hits, 3, label + ': the matched-term hit count survives the scrub');
  H.eq(run.items[1].machine_total, 8, label + ': the matched-term denominator survives the scrub');
  H.eq(run.prescan.words, 14000, label + ': the prescan word count survives the scrub');
  H.eq(run.verdict, 'proceed', label + ': the recorded verdict survives the scrub');
}

// (a) THE CASE THAT ACTUALLY OCCURS: a context already stamped at the current
// version. migrate runs no migration step on it at all, so only a
// version-independent scrub can clean it.
var dirty17 = S.createEmptyContext();
dirty17.version = '1.7.0';
dirty17.report_screens = dirtyScreens();
var clean17 = S.migrate(dirty17);
H.eq(clean17.version, '1.7.0', 'a 1.7.0 context stays at 1.7.0');
assertScrubbed(clean17, '1.7.0 (the version intermediate builds actually stamped)');

// (b) the 1.6.0 case kept alongside it: a context that does take a migration step.
var dirty16 = S.createEmptyContext();
dirty16.version = '1.6.0';
dirty16.report_screens = dirtyScreens();
var clean16 = S.migrate(dirty16);
H.eq(clean16.version, '1.7.0', 'a 1.6.0 context migrates to 1.7.0');
assertScrubbed(clean16, '1.6.0');

// (c) a context NEWER than PRAXIS_VERSION: migrate returns it unchanged in SHAPE
// (it will not guess at a future schema) and that early return is a return path
// like any other, so the snippets must still be gone.
var dirtyNew = S.createEmptyContext();
dirtyNew.version = '9.9.9';
dirtyNew.report_screens = dirtyScreens();
var cleanNew = S.migrate(dirtyNew);
H.assert('9.9.9' > S.PRAXIS_VERSION, 'the fixture version really is newer than the current one');
H.eq(cleanNew.version, '9.9.9', 'a newer context is not migrated backwards or forwards');
assertScrubbed(cleanNew, 'newer than current (the isKnownNewer early return)');

// The scrub is idempotent: a second pass changes nothing and throws nothing.
var twice = S.migrate(S.migrate(dirty17));
H.assert(JSON.stringify(twice).indexOf(SECRET) === -1, 'the scrub is idempotent');
H.eq(twice.report_screens[0].items[0].machine_signal, 'found', 'a second pass still leaves the signal alone');

// A context with no report_screens key at all, and one whose report_screens is
// not an array, must not throw.
var noScreens = S.createEmptyContext();
noScreens.version = '1.7.0';
delete noScreens.report_screens;
H.assert(!!S.migrate(noScreens), 'a context with no report_screens key migrates without throwing');
var badScreens = S.createEmptyContext();
badScreens.version = '9.9.9';
badScreens.report_screens = 'not an array';
H.eq(S.migrate(badScreens).report_screens, 'not an array', 'a non-array report_screens is left alone rather than throwing');

H.summary('migration.test');
