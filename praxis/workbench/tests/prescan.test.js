'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;
var C = W.PraxisScreenCore;

var ctx = S.createEmptyContext();
ctx.evaluation_matrix.rows = [
  { id: 'q1', number: 1, question: 'To what extent did the programme improve vaccination coverage among zero dose children in Karamoja?' },
  { id: 'q2', number: 2, question: 'Was procurement of bednets cost efficient across implementing partners?' }
];
ctx.report_structure.sections = [
  { id: 's1', title: 'Executive Summary' }, { id: 's2', title: 'Methodology' }, { id: 's3', title: 'Findings' }
];
ctx.sample_parameters.result = { primary: 240, label: '240 households' };

var EN_REPORT = [
  'FINAL EVALUATION REPORT',
  '',
  'Executive Summary',
  'This evaluation assessed the programme. Vaccination coverage among zero dose children in Karamoja improved by 18 points.',
  '',
  '1. Methodology',
  'We used a mixed methods design with a household survey (n=236) and key informant interviews.',
  '',
  '2. Limitations',
  'Security constraints restricted access to two districts.',
  '',
  '3. Findings',
  'Coverage improved. Zero dose children in Karamoja were reached through outreach.',
  '',
  '4. Recommendations',
  'Scale the outreach model.',
  'The zebra quantum paragraph mentions nothing relevant to any check at all.'
].join('\n');

var res = C.prescan(EN_REPORT, ctx);
H.assert(res.ok, 'prescan runs');
H.eq(res.signals['uneg:exec'].signal, 'found', 'EN executive summary heading detected');
H.eq(res.signals['uneg:methods'].signal, 'found', 'EN methodology heading detected');
H.eq(res.signals['uneg:limitations'].signal, 'found', 'EN limitations heading detected');
H.eq(res.signals['uneg:recommendations'].signal, 'found', 'EN recommendations heading detected');
H.eq(res.signals['eq:q1'].signal, 'found', 'EQ1 tokens found in the text');
H.assert(res.signals['eq:q2'].signal === 'weak' || res.signals['eq:q2'].signal === 'not_found', 'EQ2 barely covered');
H.eq(res.signals['structure:agreed'].signal, 'found', 'agreed structure matched');
H.assert(res.signals['sample:achieved'].signal === 'found', 'n=236 within 10 percent of planned 240');
H.assert(res.signals['uneg:conclusions'] === undefined, 'conclusions-follow-findings never machine-signalled');
H.assert(res.signals['ethics:identifiable'] === undefined, 'identifiability never machine-signalled');
H.assert(res.signals['ethics:harm'] === undefined, 'do-no-harm never machine-signalled');
H.assert(res.signals['design:fidelity'] === undefined, 'design fidelity never machine-signalled');
H.assert(res.signals['timing:window'] === undefined, 'timing is computed elsewhere, never prescanned');
H.assert(!!res.signals['eq:q1'].evidence, 'signals carry an evidence snippet');
H.assert(res.signals['eq:q1'].evidence.length <= 160, 'evidence snippet is capped');
H.assert(JSON.stringify(res).indexOf('zebra quantum paragraph') === -1, 'result does not retain arbitrary body text');
H.eq(res.meta.chars, EN_REPORT.length, 'meta counts chars');
H.assert(res.meta.words > 50, 'meta counts words');
H.assert(res.meta.short === true, 'under 500 words flagged short');

// ---- French, with diacritics -------------------------------------------------
var fctx = S.createEmptyContext();
fctx.evaluation_matrix.rows = [
  { id: 'f1', number: 1, question: 'Dans quelle mesure le programme a-t-il ameliore la couverture vaccinale des enfants zero dose?' }
];
var FR_REPORT = [
  'Résumé exécutif',
  'Le programme a amélioré la couverture vaccinale des enfants zéro dose.',
  'Méthodologie',
  'Enquête auprès des ménages (n=120) et entretiens.',
  'Limites',
  'L\'accès à deux districts était restreint.',
  'Recommandations',
  'Étendre le modèle.'
].join('\n');
var fres = C.prescan(FR_REPORT, fctx);
H.eq(fres.signals['uneg:exec'].signal, 'found', 'FR resume executif detected through diacritics');
H.eq(fres.signals['uneg:methods'].signal, 'found', 'FR methodologie detected');
H.eq(fres.signals['uneg:limitations'].signal, 'found', 'FR limites detected');
H.eq(fres.signals['uneg:recommendations'].signal, 'found', 'FR recommandations detected');
H.eq(fres.signals['eq:f1'].signal, 'found', 'FR EQ coverage found');

// ---- guards --------------------------------------------------------------------
var big = new Array(200).join(new Array(4000).join('aaaaaaaaa '));
H.assert(big.length > C.MAX_PRESCAN_CHARS, 'over-length fixture really exceeds the cap');
var refused = C.prescan(big, ctx);
H.eq(refused.ok, false, 'over-length input refused');
H.eq(refused.error, 'too_long', 'over-length error named');

var mention = C.prescan('The methodology is described in the annex to this letter which is quite long as a body sentence.', S.createEmptyContext());
H.assert(!mention.signals['uneg:methods'] || mention.signals['uneg:methods'].signal === 'weak', 'body-text mention is at most weak, not a heading');

// Empty paste is scannable and simply finds nothing.
var empty = C.prescan('', S.createEmptyContext());
H.assert(empty.ok, 'empty paste still returns ok');
H.eq(empty.meta.words, 0, 'empty paste counts zero words');
H.eq(empty.signals['uneg:limitations'].signal, 'not_found', 'empty paste finds no limitations section');

H.summary('prescan.test');
