/* 1.8.0 -> 1.9.0 design-vocabulary reconciliation, and the invariant it protects:
   the Workbench must never present a design ranking its own engine would not
   reproduce from the answers shown next to it. */
'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;
var V = W.PraxisDesignVocab;

H.assert(!!V, 'design vocab loads in the sandbox before schema');

/* A file as actually shipped: both demo fixtures and every .praxis cut from them
   carried these values, none of which the advisor's rules match. */
function legacyFile() {
  var c = S.createEmptyContext();
  c.version = '1.8.0';
  c.tor_constraints.evaluation_purpose = ['accountability', 'learning', 'programme_improvement'];
  c.tor_constraints.causal_inference_level = 'contribution';
  c.tor_constraints.comparison_feasibility = 'none';
  c.tor_constraints.data_available = 'routine_monitoring';
  c.tor_constraints.unit_of_intervention = 'facility';
  c.tor_constraints.programme_complexity = 'complicated';
  c.design_recommendation = {
    answers: { purpose: 'accountability', causal: 'contribution', comparison: 'none',
               data: 'routine_monitoring', context: 'stable', budget: 'high',
               timeline: 'medium', maturity: 'mature', complexity: 'complicated', unit: 'system' },
    ranked_designs: [{ id: 'contributionAnalysis', name: 'Contribution Analysis', score: 88 },
                     { id: 'processTracing', name: 'Process Tracing', score: 84 }],
    selected_design: 'contributionAnalysis',
    justification: 'hand written',
    completed_at: '2026-07-16T09:00:00.000Z'
  };
  return c;
}

var m = S.migrate(legacyFile());

H.eq(m.version, '1.9.0', 'migrates to 1.9.0');

// Exact synonyms are rewritten.
H.eq(m.tor_constraints.data_available, 'routine_only', 'ToR data_available renamed to the value the engine matches');
H.eq(m.tor_constraints.unit_of_intervention, 'cluster', 'ToR unit_of_intervention renamed to cluster');
H.eq(m.design_recommendation.answers.data, 'routine_only', 'stored answer data renamed');
H.eq(m.design_recommendation.answers.unit, 'system', 'an already-canonical answer is left alone');
H.eq(m.tor_constraints.evaluation_purpose.indexOf('learning'), 1, 'mappable purpose survives migration');

// Values with no honest counterpart are preserved for the user, not guessed away.
H.eq(m.design_recommendation.answers.purpose, 'accountability',
  'unmappable purpose is left in place rather than invented into an enum');
H.assert(m.tor_constraints.evaluation_purpose.indexOf('accountability') >= 0,
  'unmappable ToR purpose is preserved, not deleted');

// ...and it is still refused at the point it would influence a score.
H.eq(V.normalizeAnswers(m.design_recommendation.answers).answers.purpose, undefined,
  'the unmappable purpose never reaches the engine');
H.eq(V.normalizeAnswers(m.design_recommendation.answers).rejected.length, 1,
  'and is reported exactly once');

// The ranking survives, but unvouched-for.
H.eq(m.design_recommendation.ranked_designs.length, 2, 'existing ranking is preserved');
H.eq(m.design_recommendation.answers_fingerprint, null,
  'migration does not mint a fingerprint for a ranking whose true inputs are unknown');

// Idempotence: re-running migrate on the output changes nothing.
var again = S.migrate(m);
H.eq(JSON.stringify(again.tor_constraints), JSON.stringify(m.tor_constraints), 'migration is idempotent on tor_constraints');
H.eq(again.version, '1.9.0', 'migrating a 1.9.0 file is a no-op');

// A clean 1.9.0 file round-trips through validateContext untouched.
var fresh = S.createEmptyContext();
fresh.design_recommendation.answers = { purpose: 'outcome', causal: 'contribution' };
fresh.design_recommendation.answers_fingerprint = V.fingerprintAnswers(fresh.design_recommendation.answers);
var v = S.validateContext(JSON.parse(JSON.stringify(fresh)));
H.assert(v.ok, 'a 1.9.0 context validates');
H.eq(v.context.design_recommendation.answers_fingerprint, fresh.design_recommendation.answers_fingerprint,
  'fingerprint survives validateContext');

// Titlecase purpose from Station 0's form.
var tc = S.createEmptyContext();
tc.version = '1.8.0';
tc.tor_constraints.evaluation_purpose = ['Outcome', 'Process'];
var tcm = S.migrate(tc);
H.eq(tcm.tor_constraints.evaluation_purpose.join(','), 'outcome,process',
  'Station 0 title-case purposes are normalized to slugs');


// ── File header ────────────────────────────────────────────────────────────
// The header travels with the file to machines with no Workbench association.
// It must never become load-bearing: validateContext keys off `schema`, and a
// file with no header at all must still open exactly as before.
var hdr = S.withFileHeader(S.createEmptyContext());
H.eq(Object.keys(hdr)[0], '_praxis', 'header is first in key order, so an editor shows it first');
H.eq(hdr._praxis.schema_version, S.PRAXIS_VERSION, 'header states the schema version it was written at');
H.assert(hdr._praxis.open_at.indexOf('/praxis/workbench/') > 0, 'header says where to open the file');

var vh = S.validateContext(JSON.parse(JSON.stringify(hdr)));
H.assert(vh.ok, 'a headered file validates');
H.eq(vh.context.title, undefined, 'header does not leak into project fields');

// Re-stamping replaces rather than nests, so the header can never describe a file
// it no longer heads.
var restamped = S.withFileHeader(hdr);
H.eq(JSON.stringify(restamped._praxis), JSON.stringify(hdr._praxis), 'restamping is idempotent');
H.eq(restamped._praxis._praxis, undefined, 'restamping does not nest the old header');

// A file written before headers existed still opens.
var noHdr = S.createEmptyContext();
H.assert(S.validateContext(JSON.parse(JSON.stringify(noHdr))).ok, 'a header-less file still validates');

H.summary('design-migration');
