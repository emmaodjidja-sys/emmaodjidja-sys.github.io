'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;

H.eq(S.PRAXIS_VERSION, '1.9.0', 'PRAXIS_VERSION bumped');

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
H.eq(up.version, '1.9.0', '1.5.0 migrates to 1.9.0');
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

// Chain from 1.4.0 still lands on head.
var chain = S.createEmptyContext();
chain.version = '1.4.0';
H.eq(S.migrate(chain).version, '1.9.0', '1.4.0 chains to 1.9.0');

// ---- 1.7.0: report_screens ------------------------------------------------
H.assert(Array.isArray(S.createEmptyContext().report_screens), 'empty ctx has report_screens array');

var v16 = S.createEmptyContext();
v16.version = '1.6.0';
delete v16.report_screens;
var up17 = S.migrate(v16);
H.eq(up17.version, '1.9.0', '1.6.0 migrates to 1.9.0');
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
// HISTORY: the scrub first lived inside MIGRATIONS['1.6.0'], where it was INERT
// for every file it was written to protect. The version bump to 1.7.0 landed in
// the first commit of the feature, before the pre-scan existed, so the builds
// that persisted snippets stamped their files 1.7.0, never 1.6.0. Back then that
// made 1.7.0 the no-op case: migrate() took no migration step on a 1.7.0 context
// (there was no MIGRATIONS['1.7.0'], and the reset-to-1.0 guard was skipped
// because 1.7.0 WAS the current version), so a version-independent scrub was the
// only thing that could reach those files.
//
// THAT STOPPED BEING TRUE AT 1.8.0. Schema 1.8.0 added MIGRATIONS['1.7.0'] (to
// backfill use_outcome and mint project_id), so a 1.7.0-stamped context now
// takes a real migration step on its way to 1.8.0 instead of passing through
// untouched. The no-op, scrub-only case this suite has to cover is whichever
// version is PRAXIS_VERSION right now, not a version number frozen into the
// test. Fixture (a) below is stamped at S.PRAXIS_VERSION for that reason:
// whoever adds the next migration step should not have to remember to move this
// fixture too. The 1.7.0-to-1.8.0 step itself is still exercised, both by
// fixture (b), which chains through it from 1.6.0, and by the dedicated
// use_outcome/project_id block further down, so it is not retested a third time
// here.
//
// Separately, a 1.6.0 context carrying report_screens is a combination that
// cannot exist in the wild, because 1.6.0 builds had no such field: an old
// fixture once tested that impossible input and passed anyway. Fixture (b) is
// kept regardless, alongside the current-version case and the newer-than-current
// case, for defensive coverage. SECRET is the worst case, and is the same line
// the privacy test uses.
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
// version-independent scrub can clean it. Stamped at S.PRAXIS_VERSION rather
// than a literal so this keeps testing the no-op path even after the next
// migration step moves the goalposts again.
var dirtyCurrent = S.createEmptyContext();
dirtyCurrent.version = S.PRAXIS_VERSION;
dirtyCurrent.report_screens = dirtyScreens();
var cleanCurrent = S.migrate(dirtyCurrent);
H.eq(cleanCurrent.version, S.PRAXIS_VERSION, 'a context already at the current version keeps its version');
assertScrubbed(cleanCurrent, 'current version (no migration step runs, scrub only)');

// (b) the 1.6.0 case kept alongside it: a context that does take a migration step.
var dirty16 = S.createEmptyContext();
dirty16.version = '1.6.0';
dirty16.report_screens = dirtyScreens();
var clean16 = S.migrate(dirty16);
H.eq(clean16.version, '1.9.0', 'a 1.6.0 context migrates to 1.9.0');
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
var twice = S.migrate(S.migrate(dirtyCurrent));
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

// ---- report_screens must appear in NO STATION_FIELDS list -------------------
// report_screens is deliberately NOT listed under any STATION_FIELDS key (see the
// comment on STATION_FIELDS in schema.js). context.js's LOAD_FILE partial-merge
// branch copies ONLY STATION_FIELDS keys out of an imported _partial .praxis file
// into a live project, and that partial-merge branch is the one path into a live
// project that migrate() (and its machine_evidence scrub) never reaches. Leaving
// report_screens out of every STATION_FIELDS list is therefore the ONLY thing
// stopping a partial file from injecting report_screens, and any machine_evidence
// snippet of confidential report text an intermediate build might have left on it,
// into somebody else's live project. Before this test, that exclusion was defended
// by a comment alone: a reviewer added report_screens to STATION_FIELDS[10] and the
// rest of the suite still passed.
Object.keys(S.STATION_FIELDS).forEach(function(id) {
  H.assert(S.STATION_FIELDS[id].indexOf('report_screens') === -1,
    'STATION_FIELDS[' + id + '] does not list report_screens');
});

// ---- 1.7.0 -> 1.8.0: use_outcome backfill + project_id ---------------------
var empty18 = S.createEmptyContext();
H.assert(typeof empty18.project_id === 'string' && empty18.project_id.indexOf('prj_') === 0,
  'empty ctx has a prj_ project_id');
var empty18b = S.createEmptyContext();
H.assert(empty18.project_id !== empty18b.project_id, 'each empty ctx gets its own project_id');

var old17 = S.createEmptyContext();
old17.version = '1.7.0';
delete old17.project_id;
old17.commissioner.users = [{ id: 'u1', name: 'Board', role: '', tier: 'primary',
  intended_use: 'decide', decision_window: 'Q4 board', window_opens: '', window_closes: '',
  status: 'in_post', successor: '', influence: 'high', interest: 'high', eq_refs: [] }];
var up18 = S.migrate(old17);
H.eq(up18.version, '1.9.0', '1.7.0 migrates through to 1.9.0');
H.eq(up18.commissioner.users[0].use_outcome, '', 'user backfilled use_outcome');
H.assert(typeof up18.project_id === 'string' && up18.project_id.indexOf('prj_') === 0,
  '1.7.0 file gains a project_id');

var keep18 = S.createEmptyContext();
keep18.version = '1.7.0';
keep18.project_id = 'prj_fixed';
keep18.commissioner.users = [{ id: 'u2', name: 'Sec', tier: 'primary', use_outcome: 'used', eq_refs: [] }];
var kept18 = S.migrate(keep18);
H.eq(kept18.project_id, 'prj_fixed', 'existing project_id preserved');
H.eq(kept18.commissioner.users[0].use_outcome, 'used', 'existing use_outcome not clobbered');

// project_id is top-level infrastructure: it must not be importable via a
// partial station import, same invariant as report_screens.
Object.keys(S.STATION_FIELDS).forEach(function(k) {
  H.assert(S.STATION_FIELDS[k].indexOf('project_id') === -1,
    'project_id absent from STATION_FIELDS[' + k + ']');
});

H.summary('migration.test');
