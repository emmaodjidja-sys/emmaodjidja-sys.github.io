'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var S = W.PraxisSchema;
var C = W.PraxisScreenCore;

/* The privacy cap and the signal thresholds are the load-bearing promises of the
   prescan, so they are pinned by value here, never read back from the module:
   EVIDENCE_MAX_CHARS is 150 (a snippet is at most 147 chars plus '...'). If a
   change moves any of these numbers, these tests must fail. */
var EVIDENCE_CAP = 150;

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
H.assert(JSON.stringify(res).indexOf('zebra quantum paragraph') === -1, 'result does not retain arbitrary body text');
H.eq(res.meta.chars, EN_REPORT.length, 'meta counts chars');
H.assert(res.meta.words > 50, 'meta counts words');
H.assert(res.meta.short === true, 'under 500 words flagged short');

// Every EQ signal carries its denominator, so a caller that shows the quoted line
// can always show how thin the basis for it is.
H.eq(res.signals['eq:q1'].hits, 8, 'EQ1 reports how many question terms hit');
H.eq(res.signals['eq:q1'].total, 8, 'EQ1 reports how many question terms there were');
H.assert(typeof res.signals['eq:q2'].hits === 'number' && typeof res.signals['eq:q2'].total === 'number',
  'a not-found EQ still carries hits and total');

// ---- English methods vocabulary (not only the French "methode(s)") -------------
[
  ['Methodology', 'Methodology'],
  ['Methods', 'Methods'],
  ['Evaluation Methods', 'Evaluation Methods'],
  ['Approach and Methods', 'Approach and Methods'],
  ['Data collection methods', 'Data collection methods'],
  ['Methodologie', 'Methodologie'],
  ['Methode', 'Methode'],
  ['Methodes', 'Methodes'],
  ['Approche et methodes', 'Approche et methodes'],
  ['Demarche methodologique', 'Demarche methodologique']
].forEach(function(pair) {
  var r = C.prescan(pair[1] + '\nBody text follows here.', S.createEmptyContext());
  H.eq(r.signals['uneg:methods'].signal, 'found', 'methods heading detected: ' + pair[0]);
});

// French executive-summary and English limitations synonyms.
[
  ['Resume', 'uneg:exec'],
  ['Synthese', 'uneg:exec'],
  ['Resume executif', 'uneg:exec'],
  ['Resume analytique', 'uneg:exec'],
  ['Executive Summary', 'uneg:exec'],
  ['Limitations', 'uneg:limitations'],
  ['Limites', 'uneg:limitations'],
  ['Caveats', 'uneg:limitations'],
  ['Caveat', 'uneg:limitations'],
  ['Constraints', 'uneg:limitations'],
  ['Constraint', 'uneg:limitations']
].forEach(function(pair) {
  var r = C.prescan(pair[0] + '\nBody text follows here.', S.createEmptyContext());
  H.eq(r.signals[pair[1]].signal, 'found', pair[1] + ' heading detected: ' + pair[0]);
});

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

// ---- the privacy cap: EVIDENCE_MAX_CHARS is the whole guarantee ----------------
// A matched line far longer than the cap must come back truncated to exactly the
// cap, ellipsis included. Without this the cap could be raised to any value and
// the suite would not notice.
var LONG_LINE = 'The evaluation team documented that borehole rehabilitation increased household water access across Turkana over the whole period under review, and that district authorities recorded steady gains in service uptake month after month';
var lctx = S.createEmptyContext();
lctx.evaluation_matrix.rows = [
  { id: 'L1', number: 1, question: 'How did borehole rehabilitation change household water access in Turkana?' }
];
var lres = C.prescan(['Findings', LONG_LINE].join('\n'), lctx);
H.assert(LONG_LINE.length > EVIDENCE_CAP * 1.4, 'the long fixture line really is far longer than the cap');
H.eq(lres.signals['eq:L1'].signal, 'found', 'the long line carries the EQ terms');
H.eq(lres.signals['eq:L1'].evidence.length, EVIDENCE_CAP, 'evidence is truncated to exactly the cap');
H.eq(lres.signals['eq:L1'].evidence, LONG_LINE.slice(0, EVIDENCE_CAP - 3) + '...', 'evidence is the head of the line plus the ellipsis marker');
H.assert(lres.signals['eq:L1'].evidence.slice(-3) === '...', 'truncated evidence ends with the ellipsis marker');
H.assert(JSON.stringify(lres).indexOf(LONG_LINE) === -1, 'the full long line never survives into the result');

// EVERY signal, not just eq:q1, stays inside the cap.
[res, fres, lres].forEach(function(r, n) {
  Object.keys(r.signals).forEach(function(k) {
    var ev = r.signals[k].evidence;
    H.assert(typeof ev === 'string' && ev.length <= EVIDENCE_CAP,
      'fixture ' + n + ' signal ' + k + ' evidence within the ' + EVIDENCE_CAP + '-char cap (len ' +
      (typeof ev === 'string' ? ev.length : 'n/a') + ')');
  });
});

// The line AFTER a matched heading is body text and must never be quoted. This
// catches a "quote the paragraph under the heading" implementation, which the
// zebra assertion above (a line far from any heading) sails past.
var adj = C.prescan([
  'Limitations',
  'The pangolin telemetry sentence sits directly beneath the heading and is nobody business.',
  'Recommendations',
  'The okapi ledger sentence sits directly beneath that heading too.'
].join('\n'), S.createEmptyContext());
H.eq(adj.signals['uneg:limitations'].signal, 'found', 'adjacency fixture does find the limitations heading');
H.eq(adj.signals['uneg:recommendations'].signal, 'found', 'adjacency fixture does find the recommendations heading');
H.assert(JSON.stringify(adj).indexOf('pangolin telemetry') === -1, 'the sentence adjacent to a matched heading is never quoted');
H.assert(JSON.stringify(adj).indexOf('okapi ledger') === -1, 'nor is the sentence adjacent to the next matched heading');

// ---- EQ bands: found / weak / not_found, and the one-generic-word floor --------
var bctx = S.createEmptyContext();
bctx.evaluation_matrix.rows = [
  // 6 distinctive terms, 4 present -> 0.667, over EQ_FOUND_RATIO.
  { id: 'b1', number: 1, question: 'Was the textbook distribution timely across Kayonza schools?' },
  // 8 distinctive terms, 3 present -> 0.375: over EQ_WEAK_RATIO, under EQ_FOUND_RATIO.
  { id: 'b2', number: 2, question: 'How did the borehole maintenance committees affect water availability during the drought in Turkana?' },
  // nothing present at all -> ratio 0.
  { id: 'b3', number: 3, question: 'Did the vaccination cold chain hold up in the remote uplands of Zambezia?' },
  // 2 distinctive terms, 1 present -> ratio 0.5, but a single generic word must
  // never buy a 'found'.
  { id: 'b4', number: 4, question: 'Was the project relevant?' }
];
var BANDS_REPORT = [
  'Findings',
  'Textbook distribution covered Kayonza schools in the second term.',
  'Water availability in Turkana was outside the scope of this exercise.',
  'The project team met the ministry twice.'
].join('\n');
var bres = C.prescan(BANDS_REPORT, bctx);
H.eq(bres.signals['b1'] === undefined, true, 'signals are keyed eq:<id>');
H.eq(bres.signals['eq:b1'].hits, 4, 'EQ b1 matched 4 terms');
H.eq(bres.signals['eq:b1'].total, 6, 'EQ b1 asked 6 terms');
H.eq(bres.signals['eq:b1'].signal, 'found', 'EQ at 4/6 is found');
H.eq(bres.signals['eq:b2'].hits, 3, 'EQ b2 matched 3 terms');
H.eq(bres.signals['eq:b2'].total, 8, 'EQ b2 asked 8 terms');
H.eq(bres.signals['eq:b2'].signal, 'weak', 'EQ at 3/8 lands in the weak band');
H.eq(bres.signals['eq:b3'].hits, 0, 'EQ b3 matched nothing');
H.eq(bres.signals['eq:b3'].signal, 'not_found', 'EQ with zero hits is not_found, never weak');
H.eq(bres.signals['eq:b4'].hits, 1, 'EQ b4 matched its one generic word');
H.eq(bres.signals['eq:b4'].total, 2, 'EQ b4 tokenises to only 2 terms');
H.assert(bres.signals['eq:b4'].signal !== 'found', 'one generic word on a 2-term question is never found');
H.eq(bres.signals['eq:b4'].signal, 'weak', 'the thin question degrades to weak');

// ---- structure: agreed titles must appear as HEADINGS --------------------------
var sctx = S.createEmptyContext();
sctx.report_structure.sections = [
  { id: 'x1', title: 'Executive Summary' }, { id: 'x2', title: 'Findings' }, { id: 'x3', title: 'Recommendations' }
];
var PROSE_ONLY = 'In our executive summary we would note that the findings show progress and that our recommendations follow,';
var sres = C.prescan(PROSE_ONLY, sctx);
H.assert(PROSE_ONLY.length > 90, 'the prose fixture line is too long to read as a heading');
H.assert(sres.signals['structure:agreed'].signal !== 'found', 'titles matched only in prose never claim the outline is complete');
H.eq(sres.signals['structure:agreed'].signal, 'weak', 'titles matched only in prose degrade to weak');
var HALF = ['Executive Summary', 'The report opens with a summary of the work.', 'Findings', 'Coverage improved.'].join('\n');
var hres = C.prescan(HALF, sctx);
H.eq(hres.signals['structure:agreed'].signal, 'weak', 'two of three headings present is weak');
H.assert(hres.signals['structure:agreed'].evidence.indexOf('Recommendations') !== -1, 'the missing title is named');

// ---- sample tolerance ----------------------------------------------------------
var samCtx = S.createEmptyContext();
samCtx.sample_parameters.result = { primary: 240, label: '240 households' };
var farOut = C.prescan('The survey achieved n=90 completed interviews.', samCtx);
H.eq(farOut.signals['sample:achieved'].signal, 'weak', 'n=90 against a planned 240 is far outside tolerance: weak, not found');
var justOut = C.prescan('The survey achieved n=265 completed interviews.', samCtx);
H.eq(justOut.signals['sample:achieved'].signal, 'weak', 'n=265 against a planned 240 is just outside the 10 percent tolerance');
var noFigure = C.prescan('The survey reached most of the households we set out to reach.', samCtx);
H.eq(noFigure.signals['sample:achieved'].signal, 'not_found', 'no n= figure at all is not_found');

// ---- heading detection: the two rules, one fixture each -------------------------
// (a) terminal punctuation: a SHORT line that ends in a full stop is a sentence.
var SHORT_SENTENCE = 'We turn now to limitations.';
H.assert(SHORT_SENTENCE.length < 90, 'the punctuation fixture is short enough to pass the length rule');
var punct = C.prescan(SHORT_SENTENCE, S.createEmptyContext());
H.eq(punct.signals['uneg:limitations'].signal, 'weak', 'a short line ending in a full stop is prose, not a heading');
// (b) length: a LONG line with no terminal punctuation is prose too.
var LONG_UNPUNCTUATED = 'The limitations of this exercise are set out at length in the annex which the reader should consult before drawing any conclusion';
H.assert(LONG_UNPUNCTUATED.length > 90, 'the length fixture really is over the heading length rule');
H.assert(!/[.!?]$/.test(LONG_UNPUNCTUATED), 'the length fixture does not end in terminal punctuation, so only the length rule can reject it');
var lengthy = C.prescan(LONG_UNPUNCTUATED, S.createEmptyContext());
H.eq(lengthy.signals['uneg:limitations'].signal, 'weak', 'a long unpunctuated line is prose, not a heading');

// ---- guards --------------------------------------------------------------------
var big = new Array(200).join(new Array(4000).join('aaaaaaaaa '));
H.assert(big.length > C.MAX_PRESCAN_CHARS, 'over-length fixture really exceeds the cap');
var refused = C.prescan(big, ctx);
H.eq(refused.ok, false, 'over-length input refused');
H.eq(refused.error, 'too_long', 'over-length error named');

var mention = C.prescan('The methodology is described in the annex to this letter which is quite long as a body sentence.', S.createEmptyContext());
H.assert(!mention.signals['uneg:methods'] || mention.signals['uneg:methods'].signal === 'weak', 'body-text mention is at most weak, not a heading');

// Empty paste is scannable, is not readable, and says nothing about any item.
var empty = C.prescan('', S.createEmptyContext());
H.assert(empty.ok, 'empty paste still returns ok');
H.eq(empty.meta.words, 0, 'empty paste counts zero words');
H.eq(empty.meta.unreadable, true, 'empty paste is unreadable');
H.eq(Object.keys(empty.signals).length, 0, 'empty paste emits no signals at all');

// ---- text this scanner cannot read ---------------------------------------------
// Every pattern here is a Latin word and every token is [a-z0-9]: the scan reads
// English and French and nothing else. On an Arabic, Amharic, Cyrillic or Chinese
// report it matches nothing, and "matched nothing" is a fact about the SCANNER,
// not about the report. Emitting the usual full set of not_found signals there
// would put a red "not detected" chip, with a one-click "I checked. Record No",
// on uneg:methods and uneg:limitations, both CRITICAL: answering No writes
// critical red flags, which drive the recommended verdict to `return`, which
// surfaces the one-click request for revision on the deliverable. So on
// unreadable text: zero signals, and meta.unreadable so the panel can say why.
var nlCtx = S.createEmptyContext();
nlCtx.evaluation_matrix.rows = [
  { id: 'n1', number: 1, question: 'To what extent did the programme improve vaccination coverage?' }
];
nlCtx.report_structure.sections = [{ id: 'z1', title: 'Executive Summary' }, { id: 'z2', title: 'Methodology' }];
nlCtx.sample_parameters.result = { primary: 240, label: '240 households' };

[
  ['Arabic', 'تقرير التقييم النهائي\n\nالملخص التنفيذي\nحسنت الحملة تغطية التطعيم بين الأطفال.\n\nالمنهجية\nمسح للأسر المعيشية ومقابلات مع مخبرين رئيسيين.'],
  ['Amharic', 'የመጨረሻ የግምገማ ሪፖርት\n\nአጭር ማጠቃለያ\nፕሮግራሙ የክትባት ሽፋንን አሻሽሏል።\n\nዘዴ\nየቤተሰብ ዳሰሳ እና ቃለ መጠይቆች።'],
  ['Cyrillic', 'ИТОГОВЫЙ ОТЧЕТ ОБ ОЦЕНКЕ\n\nРезюме\nПрограмма улучшила охват вакцинацией детей.\n\nМетодология\nОбследование домохозяйств и интервью.'],
  ['Chinese', '最终评估报告\n\n执行摘要\n该方案提高了儿童的疫苗接种覆盖率。\n\n方法\n住户调查和关键信息人访谈。']
].forEach(function(pair) {
  var r = C.prescan(pair[1], nlCtx);
  H.assert(r.ok, pair[0] + ' text scans without error');
  H.eq(r.meta.unreadable, true, pair[0] + ' text is reported unreadable');
  H.eq(Object.keys(r.signals).length, 0, pair[0] + ' text produces ZERO signals: no not_found chips are fabricated');
  H.assert(r.signals['uneg:methods'] === undefined, pair[0] + ': no signal on the critical methods item');
  H.assert(r.signals['uneg:limitations'] === undefined, pair[0] + ': no signal on the critical limitations item');
  H.assert(r.signals['eq:n1'] === undefined, pair[0] + ': no signal on an evaluation question');
  H.eq(r.meta.chars, pair[1].length, pair[0] + ': meta still counts the characters');
});

// A non-Latin report carrying a few Latin tokens (page numbers, an acronym, an
// n= figure) is still unreadable: a handful of digits does not make a text
// scannable, and the Latin share stays essentially zero.
var mostlyNonLatin = C.prescan('تقرير التقييم النهائي 2026\n\nالملخص التنفيذي 12\nحسنت الحملة تغطية التطعيم بين الأطفال في المنطقة الشمالية.\n\nالمنهجية 21\nمسح للأسر المعيشية (n=236) ومقابلات مع مخبرين رئيسيين حول التغطية.', nlCtx);
H.eq(mostlyNonLatin.meta.unreadable, true, 'a non-Latin report with a few Latin figures is still unreadable');
H.eq(Object.keys(mostlyNonLatin.signals).length, 0, 'and it still produces no signals, not even a sample signal off its n= figure');

// The gate must not swallow real reports: the English and French fixtures above
// are readable, and they still emit signals.
H.eq(res.meta.unreadable, false, 'the English report is readable');
H.eq(fres.meta.unreadable, false, 'the French report, diacritics and all, is readable');
H.assert(Object.keys(res.signals).length > 4, 'the readable English report still emits its signals');
H.assert(Object.keys(fres.signals).length > 4, 'the readable French report still emits its signals');

// prescan never answers an item: it returns signals only.
H.assert(JSON.stringify(res).indexOf('"answer"') === -1, 'prescan never sets an answer');

H.summary('prescan.test');
