/* The invariant, stated as a test: a stored design recommendation must be one the
   advisor's own engine reproduces from the answers stored beside it.

   The bug this exists to prevent: both demo fixtures shipped a hand-written
   ranking (Contribution Analysis, Process Tracing, Case Study) that the engine
   could not produce from their answers, because two of the ten answers were slugs
   no scoring rule matched and were therefore scored as nothing. Opening Station 3
   showed the hand-written list; clicking "Revise Design Scoring" ran the real
   engine for the first time and silently replaced it with a different one. Nothing
   in the app or the suite could tell the two apart, because nothing ever compared
   the stored ranking to the answers it claimed to come from.

   This runs the real scoreDesigns, lifted from the advisor's source, against every
   shipped fixture. A fixture that a user could not have produced by pressing the
   button fails here. */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var H = require('./helpers');

var W = H.loadWorkbench(['js/demo-data-gf.js', 'js/demo-data-zd.js']);
var V = W.PraxisDesignVocab;

// Lift the live scoring engine out of the advisor. No copy, no re-implementation:
// a re-implementation here would agree with itself and prove nothing.
var advisorSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', 'tools', 'evaluation-design-advisor', 'index.html'), 'utf8');
var from = advisorSrc.indexOf('const DESIGNS = {');
var to = advisorSrc.indexOf('// ── Questions');
H.assert(from > 0 && to > from, 'advisor scoring engine located in source');
var engine = { console: console };
vm.createContext(engine);
vm.runInContext(advisorSrc.slice(from, to), engine, { filename: 'advisor-engine' });
H.assert(typeof engine.scoreDesigns === 'function', 'advisor scoreDesigns is callable');

function check(name, ctx) {
  H.assert(!!ctx, name + ' fixture is present');
  if (!ctx) return;
  var rec = ctx.design_recommendation;
  H.assert(!!rec, name + ': has a design_recommendation');
  if (!rec) return;

  // 1. Every stored answer is a value the engine actually reacts to.
  var norm = V.normalizeAnswers(rec.answers);
  H.eq(norm.rejected.length, 0,
    name + ': no stored answer is unscoreable' +
    (norm.rejected.length ? ' (' + norm.rejected.map(function(r) { return r.key + '=' + r.raw; }).join(', ') + ')' : ''));
  H.eq(Object.keys(norm.answers).length, 10, name + ': all ten design parameters are answered');

  // 2. The stored ranking is exactly what the engine produces from those answers.
  //    This is the assertion that would have caught the original defect.
  var fresh = engine.scoreDesigns(norm.answers);
  H.eq(rec.ranked_designs.length, fresh.length, name + ': stored ranking has the full design set');
  H.eq(
    rec.ranked_designs.map(function(d) { return d.id + ':' + d.score; }).join(','),
    fresh.map(function(d) { return d.id + ':' + d.score; }).join(','),
    name + ': stored ranking is byte-for-byte what a re-score produces');

  // 3. The fingerprint vouches for the answers it was actually scored from.
  H.eq(rec.answers_fingerprint, V.fingerprintAnswers(norm.answers),
    name + ': fingerprint matches the stored answers, so Station 3 reads it as current');

  // 4. The selected design is one the engine ranked, and the justification is real.
  H.assert(fresh.some(function(d) { return d.id === rec.selected_design; }),
    name + ': selected_design exists in the ranking');
  H.assert((rec.justification || '').length > 80, name + ': carries a written justification');

  // 5. Ties are real here and must not be silently ranked. If the top two are
  //    level, the justification has to account for the second, not leave a reader
  //    to assume the order meant something.
  if (fresh[0].score === fresh[1].score) {
    var second = fresh[1].name.split(' ')[0];
    H.assert(rec.justification.indexOf(second) >= 0,
      name + ': justification addresses "' + fresh[1].name + '", which scores level with the top design');
  }

  // 6. ToR and the stored answers must not contradict each other.
  var bridged = V.torToDesignAnswers(ctx.tor_constraints, ctx.project_meta);
  H.eq(bridged.rejected.length, 0,
    name + ': ToR block carries no unscoreable values' +
    (bridged.rejected.length ? ' (' + bridged.rejected.map(function(r) { return r.key + '=' + r.raw; }).join(', ') + ')' : ''));
  Object.keys(bridged.answers).forEach(function(k) {
    H.eq(norm.answers[k], bridged.answers[k],
      name + ': stored answer "' + k + '" agrees with the ToR it was derived from');
  });
}

check('GF demo', W.PRAXIS_DEMO_GF);
check('ZD demo', W.PRAXIS_DEMO_ZD);

// The ICT-DF file is a real deliverable rather than a fixture in this repo, so it
// is checked only when present on disk. Same invariant, no exceptions for it.
var ICTDF = 'C:/Users/emmao/OneDrive/Desktop/Projects/Marc+ITU/ICT-DF-Evaluation.praxis';
if (fs.existsSync(ICTDF)) {
  check('ICT-DF file', JSON.parse(fs.readFileSync(ICTDF, 'utf8')));
} else {
  console.log('skip - ICT-DF .praxis not on this machine');
}

H.summary('design-fixtures');
