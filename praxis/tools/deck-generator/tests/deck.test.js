/* Deck Generator node test. No dependencies. Run: node praxis/tools/deck-generator/tests/deck.test.js
   Loads vendored React plus the compiled bundle from index.html in a vm sandbox
   (same pattern as praxis/workbench/tests/helpers.js) and checks the slide
   registries, the worked-example consistency, import migration, and the slop guard. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const REACT = path.join(ROOT, '..', 'vendor', 'react.production.min.js');

let failures = 0;
function assert(cond, msg) {
  if (cond) { console.log('ok - ' + msg); }
  else { failures += 1; process.exitCode = 1; console.error('FAIL - ' + msg); }
}

/* ---- extract compiled bundle ---- */
const html = fs.readFileSync(INDEX, 'utf8');
const marker = '/* BUILD:JS */';
const mi = html.indexOf(marker);
assert(mi !== -1, 'index.html contains the BUILD:JS marker');
const scriptClose = html.indexOf('</script>', mi);
const bundle = html.slice(mi + marker.length, scriptClose);
assert(bundle.length > 10000, 'compiled bundle is present and non-trivial (' + bundle.length + ' chars)');
assert(bundle.indexOf('React.createElement') !== -1, 'bundle is precompiled (no JSX at runtime)');
assert(html.indexOf('babel') === -1, 'no runtime Babel reference in index.html');

/* ---- slop guard: banned characters in the whole shipped file ---- */
const bannedChars = [
  ['—', 'em dash'], ['–', 'en dash'],
  ['←', 'left arrow'], ['→', 'right arrow'], ['↺', 'reset glyph'],
  ['▶', 'play glyph'], ['⤓', 'down arrow glyph'], ['⤒', 'up arrow glyph'],
  ['⎙', 'print glyph'], ['⏚', 'earth glyph']
];
bannedChars.forEach(function (pair) {
  const idx = html.indexOf(pair[0]);
  assert(idx === -1, 'shipped index.html has no ' + pair[1] + (idx !== -1 ? ' (found at char ' + idx + ': "' + html.slice(Math.max(0, idx - 40), idx + 40).replace(/\s+/g, ' ') + '")' : ''));
});

/* ---- run the bundle ---- */
const sandbox = {};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.console = console;
sandbox.setTimeout = setTimeout; sandbox.clearTimeout = clearTimeout;
sandbox.setInterval = setInterval; sandbox.clearInterval = clearInterval;
sandbox.document = { readyState: 'complete', getElementById: function () { return null; }, addEventListener: function () {}, removeEventListener: function () {} };
sandbox.location = { hash: '', pathname: '/', search: '' };
sandbox.navigator = { userAgent: 'node' };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(REACT, 'utf8'), sandbox, { filename: 'react.production.min.js' });
assert(!!sandbox.React, 'vendored React loads in the sandbox');
vm.runInContext(bundle, sandbox, { filename: 'deck-bundle.js' });
const T = sandbox.__DECK_TEST__;
assert(!!T, 'bundle exposes __DECK_TEST__');

/* ---- slide registries ---- */
const inc = T.buildInceptionSlides(T.DEMO_CONTEXT);
assert(inc.length === 16, 'inception deck has 16 slides (got ' + inc.length + ')');
assert(inc[0].isDivider && inc[0].type === 'cover', 'inception starts with the ink cover');
assert(inc[inc.length - 1].type === 'qa', 'inception ends with Q and A');
assert(inc.every(function (s, i) { return s.num === i + 1 && s.total === 16; }), 'inception numbering is consistent');

const crits = T.distinctCriteria(T.DEMO_CONTEXT);
assert(crits.length === 5, 'sample programme covers 5 distinct criteria (got ' + crits.length + ')');
const fnd = T.buildFindingsSlides(T.DEMO_CONTEXT);
assert(fnd.length === 11 + crits.length, 'findings deck has 11 fixed + one slide per criterion (got ' + fnd.length + ')');
assert(fnd[4].type === 'performance', 'performance summary is slide 5');
assert(fnd[5].type === 'headline-findings', 'headline findings is slide 6');
const critSlides = fnd.filter(function (s) { return s.type === 'finding-criterion'; });
assert(critSlides.length === crits.length, 'one criterion slide per distinct criterion');
const order = ['relevance', 'coherence', 'effectiveness', 'efficiency', 'impact', 'sustainability'];
const critOrderOk = critSlides.every(function (s, i) {
  return i === 0 || order.indexOf(critSlides[i - 1].criterion) <= order.indexOf(s.criterion);
});
assert(critOrderOk, 'criterion slides follow OECD DAC order');
assert(fnd[fnd.length - 1].type === 'qa', 'findings deck ends with Q and A');

/* ---- worked-example consistency ---- */
const F = T.DEMO_FINDINGS;
const planned = T.DEMO_CONTEXT.sample_parameters.result.primary;
const qualPlanned = T.DEMO_CONTEXT.sample_parameters.qualitative_plan.breakdown.reduce(function (s, b) { return s + b.count; }, 0);
assert(F.sample_achieved.quant <= planned, 'achieved quant sample does not exceed planned');
assert(F.sample_achieved.qual <= qualPlanned, 'achieved qual sample does not exceed planned');
assert(Math.abs(F.sample_achieved.quant / planned - 0.931) < 0.001, 'quant achievement matches the 93.1 percent narrative');
F.effects.forEach(function (e) {
  assert(e.lo <= e.est && e.est <= e.hi, 'effect interval contains its estimate: ' + e.label);
});
assert(F.headline.length === 3, 'three headline findings are seeded');
F.headline.forEach(function (h, i) {
  assert(h.title && h.body && h.strength, 'headline finding ' + (i + 1) + ' has title, body, and evidence strength');
});
crits.forEach(function (cr) {
  const c = F.criteria[cr];
  assert(!!c, 'criterion "' + cr + '" has seeded findings');
  if (c) assert(c.takeaway && c.key && c.evidence && c.strength, 'criterion "' + cr + '" is fully populated');
  const r = F.ratings[cr];
  assert(r >= 1 && r <= 4, 'criterion "' + cr + '" has a rating in 1..4');
});
assert(F.recommendations.length >= 3, 'at least three recommendations are seeded');
F.recommendations.forEach(function (r, i) {
  assert(r.rec && r.pri && r.own && r.tl, 'recommendation ' + (i + 1) + ' has action, priority, owner, timeline');
});

/* ---- import migration ---- */
let ok = true;
try { T.migrateImport({ praxis_version: 'deck-generator-1.0', template: 'findings', overrides: { a: 'b' } }); }
catch (e) { ok = false; }
assert(ok, 'v1.0 deck JSON imports');
ok = true;
try { T.migrateImport({ template: 'inception', overrides: {} }); } catch (e) { ok = false; }
assert(ok, 'unversioned legacy deck JSON imports');
let threw = false;
try { T.migrateImport({ praxis_version: 'deck-generator-9.9', template: 'x', overrides: {} }); } catch (e) { threw = true; }
assert(threw, 'unknown version is rejected');
threw = false;
try { T.migrateImport({ praxis_version: 'deck-generator-2.0' }); } catch (e) { threw = true; }
assert(threw, 'missing overrides is rejected');

console.log(failures === 0 ? '\nAll deck tests passed.' : '\n' + failures + ' failure(s).');
