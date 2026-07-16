/* Contract test between the Workbench's canonical design vocabulary and the
   Evaluation Design Advisor that actually scores with it.

   The two apps deploy together but share no runtime code: the advisor is a public
   standalone tool and must not depend on /praxis/workbench/. So the guarantee is
   enforced here instead, against the advisor's real source, on three fronts:

     1. the advisor's QUESTIONS options == ANSWER_ENUMS  (what the UI can produce)
     2. every literal its scoring rules compare an answer to is in ANSWER_ENUMS
        (what the engine actually reacts to)
     3. every enum value is reachable by the bridge without being rejected

   (2) is the one that matters. scoreDesigns is ~30 lines of `if (answers.x ===
   "literal")` with no else and no validation, so a rule written against a literal
   that no enum contains is dead code that nothing else would ever report, and a
   value the enums allow but no rule matches scores zero and silently re-ranks. */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var H = require('./helpers');

var ADVISOR = path.join(__dirname, '..', '..', 'tools', 'evaluation-design-advisor', 'index.html');
var src = fs.readFileSync(ADVISOR, 'utf8');

var sandbox = { window: {}, console: console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'design-vocab.js'), 'utf8'), sandbox, { filename: 'design-vocab.js' });
var V = sandbox.window.PraxisDesignVocab;

H.assert(!!V, 'design-vocab.js exposes PraxisDesignVocab');

// ── 1. Advisor QUESTIONS options == ANSWER_ENUMS ───────────────────────────
// QUESTIONS is plain object/array literals (no JSX), so it evaluates as-is.
var qStart = src.indexOf('const QUESTIONS = [');
H.assert(qStart > 0, 'advisor source still declares QUESTIONS');
var qEnd = src.indexOf('\n];', qStart);
H.assert(qEnd > qStart, 'advisor QUESTIONS array terminates');
var qBox = { QUESTIONS: null };
vm.createContext(qBox);
vm.runInContext(src.slice(qStart, qEnd + 3).replace('const QUESTIONS', 'QUESTIONS'), qBox, { filename: 'advisor-questions' });
var QUESTIONS = qBox.QUESTIONS;

H.eq(QUESTIONS.length, V.ANSWER_KEYS.length, 'advisor asks exactly as many questions as there are canonical keys');

QUESTIONS.forEach(function(q) {
  var canonical = V.ANSWER_ENUMS[q.id];
  H.assert(!!canonical, 'advisor question "' + q.id + '" has a canonical enum');
  if (!canonical) return;
  var advisorVals = q.options.map(function(o) { return o.value; });
  H.eq(advisorVals.join(','), canonical.join(','),
    'enum matches advisor options for "' + q.id + '"');
});

// ── 2. Every literal the scoring rules test is a canonical value ────────────
var sStart = src.indexOf('function scoreDesigns(');
var sEnd = src.indexOf('\n}', src.indexOf('return Object.entries(scores)', sStart));
H.assert(sStart > 0 && sEnd > sStart, 'advisor source still declares scoreDesigns');
var rules = src.slice(sStart, sEnd);

var re = /answers\.([a-zA-Z_]+)\s*===\s*"([^"]+)"/g;
var m, seen = {}, bad = [];
while ((m = re.exec(rules)) !== null) {
  var key = m[1], lit = m[2];
  var canon = V.ANSWER_ENUMS[key];
  if (!canon) { bad.push('rule reads unknown key answers.' + key); continue; }
  if (canon.indexOf(lit) < 0) bad.push('rule tests answers.' + key + ' === "' + lit + '" which is not a canonical value');
  (seen[key] || (seen[key] = [])).push(lit);
}
H.eq(bad.length, 0, 'no scoring rule tests a non-canonical literal' + (bad.length ? ': ' + bad.join('; ') : ''));
H.assert(Object.keys(seen).length > 0, 'scoring rules were actually parsed (guards against a silently-passing regex)');

// A key the engine never reads cannot influence the ranking. That is allowed,
// but it must be a decision on the record, not an accident, so it is pinned here.
var INERT_KEYS = ['timeline'];   // timeline reads d.timeNeeded, never a literal
V.ANSWER_KEYS.forEach(function(k) {
  if (INERT_KEYS.indexOf(k) >= 0) return;
  H.assert(!!seen[k], 'scoring rules react to answers.' + k);
});

// ── 3. Every canonical value survives the bridge ────────────────────────────
V.ANSWER_KEYS.forEach(function(key) {
  V.ANSWER_ENUMS[key].forEach(function(val) {
    var r = V.normalizeValue(key, val);
    H.assert(r.ok && r.value === val, 'canonical value ' + key + '=' + val + ' normalizes to itself');
  });
});

// ── 4. The exact defect this all exists to prevent ──────────────────────────
// These two shipped in both demo fixtures and every .praxis file cut from them.
// They are not in any enum, so the engine scored them as zero and the ranking moved.
H.eq(V.normalizeValue('data', 'routine_monitoring').value, 'routine_only',
  'legacy data value routine_monitoring resolves to routine_only');
H.eq(V.normalizeValue('unit', 'facility').value, 'cluster',
  'Station 0 unit value facility resolves to cluster');
H.eq(V.normalizeValue('purpose', 'Outcome').value, 'outcome',
  'Station 0 title-case purpose resolves (the old PURPOSE_MAP was lowercase-keyed and never matched)');

var acc = V.normalizeValue('purpose', 'accountability');
H.eq(acc.ok, false, 'ToR purpose "accountability" is rejected, not guessed into an enum');
H.assert(acc.reason.indexOf('accountability') >= 0, 'rejection names the offending value');

// ── 5. Bridge: Station 0 output pre-fills without silent drops ──────────────
var station0 = {
  evaluation_purpose: ['Outcome'],
  causal_inference_level: 'contribution',
  comparison_feasibility: 'none',
  data_available: 'routine_only',
  unit_of_intervention: 'facility',
  programme_complexity: 'complicated'
};
var meta = { operating_context: 'stable', budget: 'high', timeline: 'medium', programme_maturity: 'mature' };
var b = V.torToDesignAnswers(station0, meta);
H.eq(b.rejected.length, 0, 'clean Station 0 output yields no rejections');
H.eq(b.answers.purpose, 'outcome', 'purpose pre-fills from a single-purpose ToR');
H.eq(b.answers.unit, 'cluster', 'unit pre-fills (the old bridge never mapped it at all)');
H.eq(b.answers.complexity, 'complicated', 'complexity pre-fills (the old bridge never mapped it at all)');
H.eq(Object.keys(b.answers).length, 10, 'all ten parameters pre-fill from a complete Station 0');

// Multi-purpose ToR: the advisor scores ONE primary purpose. Reading chip order
// as primacy is a guess that moves the ranking, so purpose is left to the user.
var multi = V.torToDesignAnswers(
  Object.assign({}, station0, { evaluation_purpose: ['Outcome', 'Process', 'Learning'] }), meta);
H.eq(multi.answers.purpose, undefined, 'multi-purpose ToR does not guess a primary purpose');
H.eq(multi.notes.length, 1, 'multi-purpose ToR explains why purpose is unanswered');
H.assert(multi.notes[0].text.indexOf('Outcome') >= 0, 'the note names the purposes found');

// Legacy ToR purposes are a different taxonomy (a use, not a scope). Dropping the
// unmappable ones must not promote the survivor into a primary-purpose guess.
var legacy = V.torToDesignAnswers(
  Object.assign({}, station0, { evaluation_purpose: ['accountability', 'learning', 'programme_improvement'] }), meta);
H.eq(legacy.answers.purpose, 'learning', 'a single surviving valid purpose still pre-fills');
H.eq(legacy.rejected.filter(function(r) { return r.key === 'purpose'; }).length, 2,
  'both unmappable legacy purposes are reported, not swallowed');

// ── 6. Station 0's ToR form is the third corner of the old drift triangle ───
// It writes the values everything downstream reads, so its option values must be
// canonical too. Parsed from source for the same reason as the advisor: a
// hand-kept duplicate list is the thing that broke.
var torSrc = fs.readFileSync(path.join(__dirname, '..', 'js', 'stations', 'station0', 'Phase2ToR.js'), 'utf8');
function optionValues(ariaLabel) {
  var at = torSrc.indexOf("ariaLabel: '" + ariaLabel + "'");
  H.assert(at > 0, 'Station 0 still renders the ' + ariaLabel + ' field');
  var open = torSrc.indexOf('options: [', at);
  var close = torSrc.indexOf(']', open);
  var out = [], vre = /value:\s*'([^']+)'/g, mm;
  var chunk = torSrc.slice(open, close);
  while ((mm = vre.exec(chunk)) !== null) out.push(mm[1]);
  return out;
}
[
  ['Causal Inference Level', 'causal'],
  ['Comparison Feasibility', 'comparison'],
  ['Data Availability', 'data'],
  ['Unit of Intervention', 'unit'],
  ['Programme Complexity', 'complexity']
].forEach(function(pair) {
  var vals = optionValues(pair[0]);
  H.eq(vals.join(','), V.ANSWER_ENUMS[pair[1]].join(','),
    'Station 0 "' + pair[0] + '" option values match the canonical ' + pair[1] + ' enum');
});
// Purpose chips are rendered straight from the vocab rather than a literal list,
// which is why there is nothing to compare here. Assert that stays true.
H.assert(torSrc.indexOf('PraxisDesignVocab.ANSWER_ENUMS.purpose.map') > 0,
  'Station 0 purpose chips are driven from the vocabulary, not a hardcoded list');

// ── 7. Fingerprint ─────────────────────────────────────────────────────────
var fpA = V.fingerprintAnswers({ purpose: 'outcome', causal: 'contribution' });
var fpB = V.fingerprintAnswers({ causal: 'contribution', purpose: 'outcome' });
H.eq(fpA, fpB, 'fingerprint is key-order independent');
H.assert(fpA !== V.fingerprintAnswers({ purpose: 'process', causal: 'contribution' }),
  'fingerprint changes when an answer changes');
H.eq(V.fingerprintAnswers({ purpose: 'outcome', causal: null }), V.fingerprintAnswers({ purpose: 'outcome' }),
  'null and absent are the same fingerprint');

H.summary('design-vocab');
