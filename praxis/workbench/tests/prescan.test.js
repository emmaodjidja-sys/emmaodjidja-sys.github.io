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
H.assert(sigOf(res, 'eq:q2') === 'weak' || sigOf(res, 'eq:q2') === 'not_found', 'EQ2 barely covered');
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
H.assert(!!res.signals['eq:q2'] && typeof res.signals['eq:q2'].hits === 'number' && typeof res.signals['eq:q2'].total === 'number',
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
H.eq(bres.signals['eq:b3'] && bres.signals['eq:b3'].hits, 0, 'EQ b3 matched nothing');
H.eq(sigOf(bres, 'eq:b3'), 'not_found', 'EQ with zero hits is not_found, never weak');
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
H.eq(sigOf(noFigure, 'sample:achieved'), 'not_found', 'no n= figure at all is not_found');

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

// ---- helpers used above and below ----------------------------------------------
// Function declarations, so they hoist: the fixtures at the top of the file call
// sigOf before this point in source order.
function latinShare(s) {
  var n = String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var letters = (n.match(/[a-z]/g) || []).length;
  var solid = n.replace(/\s+/g, '').length;
  return solid ? letters / solid : 0;
}
function notFoundKeys(r) {
  return Object.keys(r.signals).filter(function(k) { return r.signals[k].signal === 'not_found'; });
}
function foundKeys(r) {
  return Object.keys(r.signals).filter(function(k) { return r.signals[k].signal !== 'not_found'; });
}
// Null-safe, because half of what these tests check is that a key is ABSENT: a
// bare r.signals[id].signal would throw on exactly the outcome under test, and a
// thrown TypeError names no assertion. null means "no key", which is a value the
// assertions can compare.
function sigOf(r, id) { return r.signals[id] ? r.signals[id].signal : null; }

// ---- WHAT AN ABSENCE IS WORTH, AND WHERE ITS SAFETY NOW COMES FROM --------------
// A not_found is an ABSENCE CLAIM and this scanner cannot earn one: it means "my
// regex did not match a heading", never "the report omits this". It is wrong on a
// perfectly good English report whose limitations section is titled "Caveats and what
// we could not do", and it is meaningless on a report in a language the patterns do
// not cover.
//
// Three builds tried to make an absence SAFE by detecting, from the text, whether the
// scanner had read the document: a Latin-script share, then a mixed-script rule, then
// an EN/FR function-word density floor. Each closed its own fixture and each was
// defeated by the next input class (German with an English cover page cleared the
// floor at 0.0965; Tagalog scored 0.1208 on collisions alone; Spanish reopened as soon
// as it carried an English reference list). That machinery is GONE. It is not replaced
// by a better guess: the DEPENDENCY is gone. An absence is now non-actionable BY
// CONSTRUCTION, in the panel, in every language and every regime, and the invariant is
// pinned against the real rendered component in tests/firstreview.privacy.test.js:
// NO not_found signal, anywhere, ever offers a one-click "Record No".
//
// So this file no longer asserts that absences are SUPPRESSED. They are emitted, in
// every readable text, and they are inert. What this file still owns is the ONE gate
// that survives, which is about the SCAN and not about the language: below
// LATIN_MIN_SHARE there is too little Latin-script text for a keyword scan to work on
// at all, and the scan emits NOTHING rather than a wall of empty notes.

var nlCtx = S.createEmptyContext();
nlCtx.evaluation_matrix.rows = [
  { id: 'n1', number: 1, question: 'To what extent did the programme improve vaccination coverage?' }
];
nlCtx.report_structure.sections = [{ id: 'z1', title: 'Executive Summary' }, { id: 'z2', title: 'Methodology' }];
nlCtx.sample_parameters.result = { primary: 240, label: '240 households' };

[
  ['Arabic', 'تقرير التقييم النهائي\n\nالملخص التنفيذي\nحسنت الحملة تغطية التطعيم بين الأطفال.\n\nالمنهجية\nمسح للأسر المعيشية ومقابلات مع مخبرين رئيسيين.'],
  ['Amharic', 'የመጨረሻ የግምገማ ሪፖርት\n\nአጭር ማጠቃለያ\nፕሮግራሙ የክትባት ሽፋን አሻሽሏ።\n\nዘኴ\nየቤተሰብ ዳሰሳ እና ቃለ መጠይቆ።'],
  ['Cyrillic', 'ИТОГОВЫЙ ОТЧЕТ ОБ ОЦЕНКЕ\n\nРезюме\nПрограмма улучшила охват вакцинацией детей.\n\nМетодология\nОбследование домохозяйств и интервью.'],
  ['Chinese', '最终评估报告\n\n执行摘要\n该方案提高了儿童的疫苗接种覆盖率。\n\n方法\n住户调查和关键信息人访谈。']
].forEach(function(pair) {
  var r = C.prescan(pair[1], nlCtx);
  H.assert(r.ok, pair[0] + ' text scans without error');
  H.eq(r.meta.unreadable, true, pair[0] + ' text: too little Latin-script text for a keyword scan to work on');
  H.eq(Object.keys(r.signals).length, 0, pair[0] + ' text produces ZERO signals: no wall of empty notes');
  H.assert(r.signals['uneg:methods'] === undefined, pair[0] + ': no signal on the critical methods item');
  H.assert(r.signals['eq:n1'] === undefined, pair[0] + ': no signal on an evaluation question');
  H.eq(r.meta.chars, pair[1].length, pair[0] + ': meta still counts the characters');
  H.eq(r.meta.detections, 0, pair[0] + ': meta reports zero detections');
  H.eq(r.meta.absences, 0, pair[0] + ': meta reports zero absences');
});

// A non-Latin report carrying a few Latin tokens (page numbers, an acronym, an n=
// figure) is still under the gate: a handful of digits does not make a text scannable.
var mostlyNonLatin = C.prescan('تقرير التقييم النهائي 2026\n\nالملخص التنفيذي 12\nحسنت الحملة تغطية التطعيم بين الأطفال في المنطقة الشمالية.\n\nالمنهجية 21\nمسح للأسر المعيشية (n=236) ومقابلات مع مخبرين رئيسيين حول التغطية.', nlCtx);
H.eq(mostlyNonLatin.meta.unreadable, true, 'a non-Latin report with a few Latin figures is still under the gate');
H.eq(Object.keys(mostlyNonLatin.signals).length, 0, 'and it still produces no signals, not even a sample signal off its n= figure');

// ---- THE MIXED-SCRIPT REPORT: what documents in this domain actually look like ----
// A report whose BODY is in another script and which carries, in Latin, exactly the
// furniture every institutional report carries: an English cover page, a list of
// acronyms (WHO, UNICEF, MoH, EPI), an English reference list. That paste is 7 to 19
// percent Latin letters, which is under the gate, so it emits nothing. Note what the
// English furniture does NOT contain: no "method", no "limitation", no
// "recommendation", no "consent". Those sections exist, in the other script, in the
// body. Even now that an absence is inert, a page of "no keyword match" notes on this
// document would be pure noise, so the gate still earns its keep.
var AR_BODY = [
  'تقرير التقييم النهائي للبرنامج الوطني للتحصين',
  '',
  'الملخص التنفيذي',
  'حسنت الحملة تغطية التطعيم بين الأطفال دون سن الخامسة في المناطق الشمالية بنسبة ثمانية عشر نقطة مئوية خلال فترة التقييم الممتدة من مطلع العام الماضي حتى نهاية الربع الأخير. وقد شملت الأنشطة حملات التوعية المجتمعية وتدريب العاملين الصحيين وتوفير سلسلة التبريد في المرافق الصحية النائية.',
  'ويخلص التقييم إلى أن البرنامج حقق معظم أهدافه المعلنة على مستوى المخرجات، غير أن التقدم على مستوى النتائج البعيدة ظل متفاوتا بين المقاطعات، ويعود ذلك في المقام الأول إلى ضعف نظام الإحالة وإلى النقص المزمن في الكوادر الصحية المدربة في المرافق الطرفية.',
  '',
  'مقدمة وخلفية البرنامج',
  'أطلقت وزارة الصحة البرنامج الوطني للتحصين بدعم من الشركاء الدوليين بهدف رفع معدلات التغطية بين الأطفال في المناطق التي يصعب الوصول إليها. ويغطي البرنامج ست مقاطعات يقطنها ما يقارب مليونا ونصف المليون نسمة، منهم نحو مئتي ألف طفل دون سن الخامسة.',
  'وقد جاء البرنامج استجابة لتراجع معدلات التغطية خلال سنوات النزاع، حيث توقفت الخدمات الأساسية في عدد من المرافق وفقدت سلسلة التبريد قدرتها التشغيلية في المناطق الريفية البعيدة عن مراكز المقاطعات.',
  '',
  'أهداف التقييم ونطاقه',
  'يهدف هذا التقييم إلى تقدير مدى ملاءمة البرنامج وفعاليته وكفاءته واستدامته، وإلى استخلاص الدروس التي يمكن أن تفيد المرحلة المقبلة. ويغطي التقييم الفترة الممتدة على مدى ثلاث سنوات كاملة في المقاطعات الست المستهدفة.',
  'ولا يتناول هذا التقييم أنشطة التغذية المدرسية التي ينفذها شريك آخر، ولا يغطي المقاطعتين اللتين تعذر الوصول إليهما لأسباب أمنية على النحو المبين في قسم القيود.',
  '',
  'المنهجية',
  'اعتمد الفريق تصميما مختلطا يجمع بين البيانات الكمية والنوعية. وأجري مسح للأسر المعيشية شمل عينة عشوائية طبقية في ست مقاطعات، إلى جانب مقابلات مع مخبرين رئيسيين على مستوى الوزارة والمقاطعة والمرفق الصحي.',
  'ونظمت مجموعات النقاش المركزة مع مقدمي الرعاية في المجتمعات المستهدفة، وجرى تثليث البيانات المستقاة من سجلات المرافق مع نتائج المسح ومع المادة النوعية بغية التحقق من اتساق النتائج قبل استخلاص أي استنتاج.',
  'واستعرض الفريق كذلك الوثائق البرنامجية والتقارير المرحلية وبيانات نظام المعلومات الصحية على مستوى المقاطعة، مع مراعاة المبادئ الأخلاقية المعمول بها في جمع البيانات من الأسر ومن العاملين الصحيين.',
  '',
  'القيود',
  'حالت القيود الأمنية دون الوصول إلى مقاطعتين في الشمال الشرقي، ولذلك لا تسري النتائج على تلك المناطق. كما كانت سجلات المرافق ناقصة في بعض الحالات، مما يحد من قابلية تعميم النتائج الكمية على مستوى المقاطعة الواحدة.',
  '',
  'النتائج الرئيسية',
  'ارتفعت التغطية بشكل ملحوظ في المناطق التي شملتها الحملات المتنقلة، وتحسن انتظام سلسلة التبريد في المرافق التي تلقت مولدات جديدة ووحدات تبريد تعمل بالطاقة الشمسية خلال السنة الثانية من التنفيذ.',
  'وأفاد مقدمو الرعاية بأن زيارات الفرق المتنقلة أصبحت منتظمة ويمكن التنبؤ بمواعيدها، وأن العاملين الصحيين باتوا معروفين لدى الأسر، وهو ما عزز الثقة في الخدمة بعد سنوات من الانقطاع.',
  'غير أن معدلات إتمام الجرعات ظلت متدنية في المقاطعتين الجنوبيتين، حيث لم يكتمل تعيين الكوادر ولم تفعل آلية الإحالة بين المرافق الطرفية ومستشفى المقاطعة على النحو المتوخى في وثيقة البرنامج.',
  'وتبين كذلك أن نظام المعلومات الصحية لا يلتقط بيانات الأطفال الذين لم يتلقوا أي جرعة، وهو ما يحول دون تتبع الفئة الأشد حرمانا وتوجيه الموارد إليها بدقة.',
  '',
  'الاستنتاجات',
  'يخلص التقييم إلى أن البرنامج كان ملائما لاحتياجات السكان وفعالا في رفع التغطية، لكن استدامته تظل مرهونة بتوظيف الكوادر وبإدماج تكاليف التشغيل في الميزانية الوطنية بدلا من الاعتماد المستمر على التمويل الخارجي.',
  '',
  'التوصيات',
  'توسيع نموذج التوعية المجتمعية ليشمل المقاطعات المتبقية، مع تخصيص ميزانية تشغيلية قارة للفرق المتنقلة ضمن الخطة السنوية للوزارة.',
  'تعزيز نظام المعلومات الصحية بحيث يلتقط بيانات الأطفال الذين لم يتلقوا أي جرعة، وربطه بآلية الإحالة على مستوى المقاطعة.',
  'إدماج تكاليف سلسلة التبريد في الميزانية الوطنية خلال السنتين المقبلتين لضمان استمرار الخدمة بعد انتهاء الدعم الخارجي.',
  '',
  'الدروس المستفادة',
  'أظهرت التجربة أن الاستثمار في الكوادر المحلية وفي صيانة سلسلة التبريد يسبق في الأهمية أي توسع جغرافي جديد، وأن الحملات المتنقلة وحدها لا تعوض غياب الخدمة الثابتة في المرفق الصحي.'
].join('\n');

var EN_COVER = [
  'REPUBLIC OF EXAMPLE',
  'Ministry of Health',
  'FINAL EVALUATION REPORT',
  'Independent Evaluation of the National Immunisation Programme',
  'Submitted to the Ministry of Health by the Evaluation Team',
  'March 2026'
].join('\n');
var EN_ACRONYMS = [
  'LIST OF ACRONYMS',
  'WHO      World Health Organization',
  'UNICEF   United Nations Children Fund',
  'MoH      Ministry of Health',
  'EPI      Expanded Programme on Immunisation',
  'HMIS     Health Management Information System',
  'KII      Key Informant Interview',
  'FGD      Focus Group Discussion',
  'NGO      Non Governmental Organisation',
  'GAVI     Global Alliance for Vaccines and Immunisation',
  'DHIS     District Health Information Software'
].join('\n');
var EN_REFS = [
  'REFERENCES',
  'Abebe T. and Musa K. (2024). Cold chain performance in rural districts. Journal of Global Health, 14, 41 to 58.',
  'Ahmed S. (2023). Community outreach and childhood immunisation uptake. Vaccine Policy Review, 9, 112 to 130.',
  'Diallo M. and Traore B. (2025). Zero dose children in fragile settings. Lancet Public Health, 10, 220 to 234.',
  'Okonkwo A. (2022). Health information systems and data quality. BMJ Open, 12, e0551.'
].join('\n');

var MIXED_COVER = EN_COVER + '\n\n' + EN_ACRONYMS + '\n\n' + AR_BODY;
var MIXED_COVER_REFS = EN_COVER + '\n\n' + EN_ACRONYMS + '\n\n' + AR_BODY + '\n\n' + EN_REFS;

[
  ['non-Latin body + English cover + acronym list', MIXED_COVER],
  ['the same, plus an English reference list', MIXED_COVER_REFS]
].forEach(function(pair) {
  var name = pair[0], paste = pair[1];
  var r = C.prescan(paste, nlCtx);
  H.assert(latinShare(paste) > 0.05, name + ': the fixture clears the old 0.05 Latin gate, which is why that gate missed it');
  H.assert(latinShare(paste) < 0.35, name + ': and it sits below the 0.35 gate, inside the band where no real EN/FR text lives');
  H.assert(r.ok, name + ': scans without error');
  H.eq(r.meta.unreadable, true, name + ': too little text the scan can work on to say anything');
  H.eq(Object.keys(r.signals).length, 0, name + ': ZERO signals');
  H.eq(notFoundKeys(r).length, 0, name + ': not even an inert absence note, because there is nothing to note');
});

// ---- a BILINGUAL report: detections are earned, absences are merely emitted -------
// An English half the scanner reads perfectly, and a non-Latin half it cannot read at
// all. Above the gate, so the scan speaks. What it SAW is real and is reported. What
// it did not see is reported too, now, as an inert note, because suppressing it was a
// guess about language and the guesses all failed; the panel is what makes it
// harmless. What this fixture still pins is that the DETECTIONS survive: the fix must
// not have cost the scanner the half of its job that works.
var AR_ANNEX = [
  'ملحق: ملاحظات الفريق الميداني',
  'حسنت الحملة تغطية التطعيم بين الأطفال في المناطق الشمالية خلال فترة التقييم. وقد شملت الأنشطة حملات التوعية المجتمعية وتدريب العاملين الصحيين.',
  'واعتمد الفريق على مسح للأسر المعيشية ومقابلات مع مخبرين رئيسيين ومجموعات النقاش المركزة في ست مقاطعات. وجرى تثليث البيانات الكمية مع البيانات النوعية.',
  'وارتفعت التغطية في المناطق التي شملتها الحملة وتحسن انتظام سلسلة التبريد في المرافق الصحية النائية خلال فترة التقييم.'
].join('\n');
// English, and deliberately WITHOUT a limitations section, a recommendations section,
// a consent passage or an n= figure: on its own, all four are genuinely not_found.
var EN_HALF = [
  'FINAL EVALUATION REPORT',
  '',
  'Executive Summary',
  'The programme raised immunisation coverage among children in the northern districts over the period under review. Outreach teams reached settlements that the fixed facilities had never served, and the cold chain held at the district stores throughout the campaign.',
  '',
  'Methods',
  'The team ran a household survey in six districts, together with key informant interviews at the district health offices and focus group discussions with caregivers. Quantitative data from the facility registers was triangulated against the qualitative material.',
  '',
  'Findings',
  'Coverage improved across the districts that the campaign reached. Caregivers reported that the outreach visits were predictable and that the health workers were known to them. The district stores kept temperature logs for the whole period.'
].join('\n');
var BILINGUAL = EN_HALF + '\n\n' + AR_ANNEX;

var bmix = C.prescan(BILINGUAL, nlCtx);
H.assert(latinShare(BILINGUAL) > 0.35, 'the bilingual fixture has real Latin content: it is above the gate');
H.eq(bmix.meta.unreadable, false, 'the bilingual report is above the gate, so the scan is allowed to speak');
H.eq(sigOf(bmix, 'uneg:methods'), 'found', 'THE DETECTIONS SURVIVE: the English Methods heading is reported found');
H.eq(sigOf(bmix, 'uneg:exec'), 'found', 'and the English executive summary heading');
H.eq(sigOf(bmix, 'eq:n1'), 'found', 'and EQ topic coverage seen in the English passages');
H.assert(bmix.meta.detections >= 3, 'meta counts the detections it earned');
H.assert(bmix.meta.absences > 0, 'and counts the absences it merely failed to match');
H.eq(bmix.meta.detections + bmix.meta.absences, Object.keys(bmix.signals).length,
  'the two counts partition the signals: nothing is double counted and nothing is lost');

// The absences it emits here are exactly the ones it emits on the English half alone,
// so the emit path is language-blind, which is the point: no guess is being made.
var enHalf = C.prescan(EN_HALF, nlCtx);
H.eq(enHalf.meta.unreadable, false, 'the English half alone is readable');
H.eq(sigOf(enHalf, 'uneg:limitations'), 'not_found', 'the English half genuinely has no limitations section');
H.eq(sigOf(enHalf, 'ethics:consent'), 'not_found', 'and says nothing about consent');
H.eq(sigOf(enHalf, 'sample:achieved'), 'not_found', 'and carries no n= figure');
H.eq(notFoundKeys(bmix).sort().join(','), notFoundKeys(enHalf).sort().join(','),
  'the bilingual paste emits the SAME absences as its English half: emit makes no language judgment at all');

// ---- a mostly-numeric English annex: the copy must not lie about it ---------------
// The gate is a share of LATIN LETTERS, so a table of figures trips it even though the
// text is English. Zero signals is right (there is nothing to read), and the panel copy
// must therefore speak about what the SCAN did not find, never assert what the text IS:
// this input IS English.
var NUMERIC_ANNEX = [
  'ANNEX 3',
  'District  2023  2024  2025  2026',
  '01  1204  1330  1402  1511',
  '02  982   1041  1120  1198',
  '03  2310  2402  2555  2610',
  '04  455   470   512   533',
  '05  1877  1902  2011  2140',
  '06  3021  3155  3288  3390',
  '07  744   790   822   861',
  '08  1650  1702  1798  1855',
  '09  2288  2350  2477  2540',
  '10  512   540   577   601',
  '11  1933  2010  2122  2201',
  '12  866   901   955   988'
].join('\n');
var numeric = C.prescan(NUMERIC_ANNEX, nlCtx);
H.eq(numeric.meta.unreadable, true, 'a mostly-numeric English annex trips the one gate');
H.eq(Object.keys(numeric.signals).length, 0, 'and it fails safe: zero signals');
H.assert(numeric.meta.latin_share < 0.35, 'its Latin-letter share really is under the gate (got ' + numeric.meta.latin_share.toFixed(3) + ')');
H.assert(!('mixed_script' in numeric.meta), 'meta carries no script verdict: the machinery that guessed one is gone');
H.assert(!('unknown_language' in numeric.meta), 'meta carries no language verdict either');
H.assert(!('enfr_density' in numeric.meta), 'and no EN/FR density: the calibrated floor is gone with it');

// ---- a normal EN and FR report is COMPLETELY UNAFFECTED ---------------------------
// The scanner keeps its one useful negative on text it really can read.
H.eq(res.meta.unreadable, false, 'the English report is readable');
H.eq(fres.meta.unreadable, false, 'the French report, diacritics and all, is readable');
H.assert(Object.keys(res.signals).length > 4, 'the readable English report still emits its signals');
H.assert(Object.keys(fres.signals).length > 4, 'the readable French report still emits its signals');
H.eq(sigOf(res, 'ethics:consent'), 'not_found', 'the English report still reports its genuinely missing consent section');
H.eq(sigOf(res, 'eq:q2'), 'not_found', 'and its genuinely uncovered evaluation question');
H.eq(sigOf(fres, 'ethics:consent'), 'not_found', 'the French report still reports its genuinely missing consent section');
H.assert(notFoundKeys(res).length > 0, 'not_found is alive and well on a normal English report');
H.assert(notFoundKeys(fres).length > 0, 'and on a normal French report');
H.assert(foundKeys(res).length > 0, 'and so are the detections');

// ---- the languages that defeated three generations of the language gate -----------
// Spanish, Portuguese, German and Tagalog. Each of them HAS all four sections, and the
// scan matches none of the headings, so each collects a full set of not_found signals.
// That is expected and it is now HARMLESS: the panel renders each of them as a neutral
// note with NO one-click confirm (pinned in tests/firstreview.privacy.test.js), so no
// absence can reach a red flag without a human reading the section and answering.
//
// What this file asserts about them is the OTHER half of the promise: the scan is not
// deaf. Where the words really do coincide, the detection is still made and still
// offered, in every one of these languages.
var esCtx = S.createEmptyContext();
esCtx.evaluation_matrix.rows = [
  { id: 'e1', number: 1, question: 'To what extent did the programme improve vaccination coverage among children?' }
];
esCtx.report_structure.sections = [
  { id: 'y1', title: 'Executive Summary' }, { id: 'y2', title: 'Methodology' }, { id: 'y3', title: 'Recommendations' }
];
esCtx.sample_parameters.result = { primary: 240, label: '240 households' };

var ES_REPORT = [
  'INFORME FINAL DE EVALUACION',
  'Evaluacion independiente del Programa Nacional de Inmunizacion',
  '',
  'Resumen Ejecutivo',
  'El programa mejoro la cobertura de vacunacion entre los ninos menores de cinco anos en las regiones del norte en dieciocho puntos porcentuales durante el periodo evaluado.',
  '',
  'Metodologia de la evaluacion',
  'El equipo adopto un diseno mixto que combina datos cuantitativos y cualitativos. Se realizo una encuesta de hogares con una muestra aleatoria estratificada en seis provincias.',
  '',
  'Limitaciones',
  'Las restricciones de seguridad impidieron el acceso a dos provincias del nororiente, por lo que los hallazgos no se aplican a esas zonas.',
  '',
  'Conclusiones',
  'La evaluacion concluye que el programa fue pertinente para las necesidades de la poblacion y eficaz para elevar la cobertura.',
  '',
  'Recomendaciones',
  'Ampliar el modelo de sensibilizacion comunitaria a las provincias restantes, con un presupuesto operativo estable para las brigadas moviles.'
].join('\n');

var PT_REPORT = [
  'RELATORIO FINAL DE AVALIACAO',
  'Avaliacao independente do Programa Nacional de Imunizacao',
  '',
  'Sumario Executivo',
  'O programa melhorou a cobertura vacinal entre as criancas menores de cinco anos nas regioes do norte em dezoito pontos percentuais durante o periodo avaliado.',
  '',
  'Metodologia da avaliacao',
  'A equipa adotou um desenho misto que combina dados quantitativos e qualitativos. Realizou-se um inquerito aos agregados familiares em seis provincias.',
  '',
  'Limitacoes',
  'As restricoes de seguranca impediram o acesso a duas provincias do nordeste, pelo que os achados nao se aplicam a essas zonas.',
  '',
  'Conclusoes',
  'A avaliacao conclui que o programa foi pertinente para as necessidades da populacao e eficaz para aumentar a cobertura.',
  '',
  'Recomendacoes',
  'Alargar o modelo de sensibilizacao comunitaria as provincias restantes, com um orcamento operacional estavel para as brigadas moveis.'
].join('\n');

// GERMAN, with the ordinary English furniture bolted on. This is the paste that beat
// the density floor: it scored 0.0965, cleared the 0.08 line, was declared readable
// English, and collected three CRITICAL red flags. It is here as the witness that the
// floor is gone and that nothing depends on it any more.
var DE_REPORT = [
  EN_COVER,
  '',
  EN_ACRONYMS,
  '',
  'Zusammenfassung',
  'Das Programm verbesserte die Impfrate bei Kindern unter fuenf Jahren in den noerdlichen Regionen im Bewertungszeitraum um achtzehn Prozentpunkte.',
  '',
  'Methodik der Evaluierung',
  'Das Team verwendete ein gemischtes Design aus quantitativen und qualitativen Daten. Eine Haushaltsbefragung wurde in sechs Bezirken durchgefuehrt.',
  '',
  'Einschraenkungen',
  'Sicherheitsbedingte Zugangsbeschraenkungen verhinderten den Zugang zu zwei Bezirken, sodass die Ergebnisse dort nicht gelten.',
  '',
  'Empfehlungen',
  'Das Modell der gemeindenahen Sensibilisierung auf die verbleibenden Bezirke ausweiten.',
  '',
  EN_REFS
].join('\n');

// TAGALOG, with no English at all in the body. It scored 0.1208 on the density floor
// purely on collisions (the particle "sa" is also a French word, "at" is also an
// English one), which is higher than a thin but perfectly genuine French paste.
var TL_REPORT = [
  'PANGWAKAS NA ULAT NG PAGSUSURI',
  '',
  'Buod ng Pagsusuri',
  'Ang programa ay nagpabuti sa saklaw ng pagbabakuna sa mga bata na wala pang limang taong gulang sa mga hilagang rehiyon sa loob ng panahon ng pagsusuri.',
  '',
  'Paraan ng Pagsusuri',
  'Gumamit ang pangkat ng halo-halong disenyo na pinagsasama ang datos na dami at uri. Isang sarbey sa mga sambahayan ang isinagawa sa anim na lalawigan.',
  '',
  'Mga Limitasyon',
  'Ang mga paghihigpit sa seguridad ay pumigil sa pagpunta sa dalawang lalawigan, kaya ang mga natuklasan ay hindi umaabot doon.',
  '',
  'Mga Rekomendasyon',
  'Palawakin ang modelo ng pagpapamalay sa komunidad sa natitirang mga lalawigan.'
].join('\n');

[['Spanish', ES_REPORT], ['Portuguese', PT_REPORT], ['German with English furniture', DE_REPORT], ['Tagalog', TL_REPORT]].forEach(function(pair) {
  var name = pair[0], r = C.prescan(pair[1], esCtx);
  H.assert(r.ok, name + ': scans without error');
  H.eq(r.meta.unreadable, false, name + ': it is Latin-script text, so the one gate passes it and the scan speaks');
  // It DOES emit absences now. They are notes, not findings, and the panel proves it.
  H.assert(notFoundKeys(r).length > 0, name + ': the scan matches none of its headings, so it emits absences');
  H.eq(r.meta.absences, notFoundKeys(r).length, name + ': meta counts them, so the panel can say the scan matched nothing');
  // And nothing in the RESULT is an answer, in any language. A signal is never an
  // answer: only a human click writes one.
  H.assert(JSON.stringify(r).indexOf('"answer"') === -1, name + ': prescan still never sets an answer');
});

// THE CHAIN, AT THIS LAYER. A signal, whatever its value and whatever the language, is
// not an answer, so a freshly scanned run has ZERO red flags and no recommended
// verdict. Everything downstream of a not_found is a human decision, and the panel
// gives an absence no shortcut into one.
var esRun = C.newScreenRun(esCtx, 'team', null, '2026-07-11');
var esScan = C.prescan(ES_REPORT, esCtx);
var esRec = C.recommendVerdict(esRun.items);
H.eq(esRec.redFlags.length, 0, 'Spanish report: a scan writes ZERO red flags, because a scan writes no answers');
H.assert(esRec.verdict !== 'return', 'Spanish report: and drives no recommended verdict');

// ---- DETECTIONS still work in those same languages -------------------------------
// The scanner is not deaf: where the words coincide it genuinely saw the word, and that
// detection is safe in any language.
var ES_ACCENTED = [
  'INFORME FINAL DE EVALUACIÓN',
  '',
  'Resumen Ejecutivo',
  'El programa mejoró la cobertura de vacunación entre los niños menores de cinco años en las regiones del norte durante el período evaluado.',
  '',
  'Metodología de la evaluación',
  'El equipo adoptó un diseño mixto. Se realizó una encuesta de hogares (n=236) con una muestra aleatoria estratificada en seis provincias.',
  '',
  'Limitaciones',
  'Las restricciones de seguridad impidieron el acceso a dos provincias.',
  '',
  'Recomendaciones',
  'Ampliar el modelo de sensibilización comunitaria a las provincias restantes.'
].join('\n');
var esDetect = C.prescan(ES_ACCENTED, esCtx);
H.eq(sigOf(esDetect, 'sample:achieved'), 'found',
  'Spanish: the n=236 figure IS there and IS within tolerance of the planned 240, so the detection is still reported');
// "consent" is a substring of "consentimiento": the scanner really did see its own
// pattern, so this is a detection, not a guess.
var esConsent = C.prescan([
  'Resumen Ejecutivo',
  'El programa mejoro la cobertura de vacunacion entre los ninos de las regiones del norte.',
  'Consentimiento informado y proteccion de datos',
  'Se obtuvo el consentimiento informado de todos los participantes antes de la encuesta.'
].join('\n'), S.createEmptyContext());
H.eq(sigOf(esConsent, 'ethics:consent'), 'found',
  'Spanish: a heading the pattern really does match is still reported found');

// ---- the structure signal may never call a section MISSING ------------------------
// structure:agreed is the one signal that can carry an absence claim inside a
// DETECTION: a partial match is a 'weak', which keeps its one-click "Record Partial".
// So the SENTENCE has to be honest whatever it rides on. It used to read "Missing:
// Methodology.", which is a claim about the REPORT that a keyword scan cannot make: a
// section called "Our approach" is not missing, and a section in a language the scan
// does not read is not missing either. It states what it SAW, and then names the titles
// its KEYWORDS did not match, as a fact about the keywords.
var stCtx = S.createEmptyContext();
stCtx.report_structure.sections = [{ id: 'm1', title: 'Executive Summary' }, { id: 'm2', title: 'Methodology' }];
var enStruct = C.prescan(EN_HALF, stCtx);
H.eq(sigOf(enStruct, 'structure:agreed'), 'weak', 'one of the two agreed titles IS there as a heading: weak');
var stEv = enStruct.signals['structure:agreed'].evidence;
H.assert(stEv.indexOf('Missing') === -1, 'the structure evidence never says a section is Missing, in ANY regime');
H.assert(stEv.indexOf('Detected as headings: 1 of 2') !== -1, 'it states what it SAW first');
H.assert(stEv.indexOf('No keyword match for: Methodology') !== -1,
  'and names the title its keywords did not match, as a fact about the keywords');
H.assert(stEv.length <= EVIDENCE_CAP, 'the structure evidence still respects the evidence cap');
var mixStruct = C.prescan(BILINGUAL, stCtx);
H.assert(mixStruct.signals['structure:agreed'].evidence.indexOf('Missing') === -1,
  'and it says Missing on the bilingual paste no more than on the English one: one sentence, one rule');

// prescan never answers an item: it returns signals only.
H.assert(JSON.stringify(res).indexOf('"answer"') === -1, 'prescan never sets an answer');

H.summary('prescan.test');