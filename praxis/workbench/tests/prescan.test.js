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

// ---- THE MIXED-SCRIPT REPORT: what documents in this domain actually look like --
// The fixtures above are the easy case, a report in ONE script the scanner cannot
// read. The realistic case is a report whose BODY is in another script and which
// carries, in Latin, exactly the furniture that every institutional report carries:
// an English cover page, a list of acronyms (WHO, UNICEF, MoH, EPI), and often an
// English reference list. That paste is 7 to 19 percent Latin letters. A gate at a
// GLOBAL Latin share of 0.05, which is what this scanner used to have, waves it
// through, and the scan then emits its full set of signals, of which the ones that
// matter are not_found on uneg:methods and uneg:limitations: both CRITICAL, both
// non-ethics, so both render the one-click "I checked. Record No". That is the
// harmful chain in one hop: Record No -> critical red flags -> recommendVerdict
// returns 'return' -> the one-click "Request revision on the deliverable", which
// flips the deliverable and writes the audit log. The scanner would be asserting an
// ABSENCE in a document it could not read. These fixtures are the ones that catch it.
function latinShare(s) {
  var n = String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  var letters = (n.match(/[a-z]/g) || []).length;
  var solid = n.replace(/\s+/g, '').length;
  return solid ? letters / solid : 0;
}
function notFoundKeys(r) {
  return Object.keys(r.signals).filter(function(k) { return r.signals[k].signal === 'not_found'; });
}
// Null-safe, because half of what these tests check is that a key is ABSENT: a
// bare r.signals[id].signal would throw on exactly the outcome under test, and a
// thrown TypeError names no assertion. null means "no key", which is a value the
// assertions can compare.
function sigOf(r, id) { return r.signals[id] ? r.signals[id].signal : null; }

// A full-length Arabic evaluation report body. No Latin word anywhere in it: every
// Latin character in the fixtures below comes from the English furniture.
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

// The English furniture. Note what is NOT in it: no "method", no "limitation", no
// "recommendation", no "consent". Those sections exist, in Arabic, in the body
// above. A scanner that says "not detected" about them is describing itself.
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

// Row 3 of the review table: body + cover + acronyms. Row 4: and a reference list.
var MIXED_COVER = EN_COVER + '\n\n' + EN_ACRONYMS + '\n\n' + AR_BODY;
var MIXED_COVER_REFS = EN_COVER + '\n\n' + EN_ACRONYMS + '\n\n' + AR_BODY + '\n\n' + EN_REFS;

[
  ['non-Latin body + English cover + acronym list', MIXED_COVER],
  ['the same, plus an English reference list', MIXED_COVER_REFS]
].forEach(function(pair) {
  var name = pair[0], paste = pair[1];
  var r = C.prescan(paste, nlCtx);
  // The fixture is only a regression witness if it really is the paste the old
  // gate let through: above the OLD 0.05 line, below the NEW one.
  H.assert(latinShare(paste) > 0.05, name + ': the fixture clears the old 0.05 Latin gate, which is why that gate missed it');
  H.assert(latinShare(paste) < 0.35, name + ': and it sits below the 0.35 gate, inside the band where no real EN/FR text lives');
  H.assert(r.ok, name + ': scans without error');
  H.eq(r.meta.unreadable, true, name + ': too little readable English or French to say anything');
  H.eq(Object.keys(r.signals).length, 0, name + ': ZERO signals');
  H.eq(notFoundKeys(r).length, 0, name + ': NO not_found signal is emitted for ANY item');
  H.assert(r.signals['uneg:methods'] === undefined, name + ': uneg:methods carries NO KEY, so no chip and no one-click Record No on a CRITICAL item');
  H.assert(r.signals['uneg:limitations'] === undefined, name + ': uneg:limitations carries NO KEY, so no chip and no one-click Record No on a CRITICAL item');
  H.assert(r.signals['ethics:consent'] === undefined, name + ': no fabricated absence on the consent item either');
  H.assert(r.signals['eq:n1'] === undefined, name + ': no fabricated absence on an evaluation question');
  H.assert(r.signals['sample:achieved'] === undefined, name + ': no fabricated absence on the sample item');
  H.assert(r.signals['structure:agreed'] === undefined, name + ': no fabricated absence on the agreed structure');
});

// ---- regime (b): it may report what it FOUND, never what it did not find --------
// A bilingual report: an English half the scanner reads perfectly, and an Arabic
// half it cannot read at all. The Latin share is high enough that the text is not
// "unreadable", so this is the regime the DIRECTION rule exists for. Affirmative
// signals are earned (the scanner really did see the word "Methods" on a heading
// line) and are emitted. Absence claims are not earned, because a third of the
// document is invisible to it, and are suppressed with no key.
var AR_ANNEX = [
  'ملحق: ملاحظات الفريق الميداني',
  'حسنت الحملة تغطية التطعيم بين الأطفال في المناطق الشمالية خلال فترة التقييم. وقد شملت الأنشطة حملات التوعية المجتمعية وتدريب العاملين الصحيين وتوفير سلسلة التبريد في المرافق الصحية النائية.',
  'واعتمد الفريق على مسح للأسر المعيشية ومقابلات مع مخبرين رئيسيين ومجموعات النقاش المركزة في ست مقاطعات. وجرى تثليث البيانات الكمية مع البيانات النوعية على مستوى المرفق الصحي.',
  'وارتفعت التغطية في المناطق التي شملتها الحملة وتحسن انتظام سلسلة التبريد في المرافق الصحية النائية خلال فترة التقييم الممتدة على مدى ثلاث سنوات كاملة.'
].join('\n');
// English, and deliberately WITHOUT a limitations section, a recommendations
// section, a consent passage or an n= figure: on its own, all four are not_found.
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
H.assert(latinShare(BILINGUAL) > 0.35, 'the bilingual fixture has real Latin content: it is above the readability gate');
H.eq(bmix.meta.unreadable, false, 'regime (b): the bilingual report is readable, so the scan is allowed to speak');
H.eq(bmix.meta.mixed_script, true, 'regime (b): a substantial part of it is in a script the scan cannot read');
// The point of the whole fix: the DETECTIONS survive.
H.eq(sigOf(bmix, 'uneg:methods'), 'found', 'regime (b) STILL DETECTS: the English Methods heading is reported found');
H.eq(sigOf(bmix, 'uneg:exec'), 'found', 'regime (b) still detects the English executive summary heading');
H.eq(sigOf(bmix, 'eq:n1'), 'found', 'regime (b) still reports EQ topic coverage seen in the English passages');
H.assert(Object.keys(bmix.signals).length >= 3, 'regime (b) is not a silent regime: it emits its affirmative signals');
// And the absence claims do not.
H.eq(notFoundKeys(bmix).length, 0, 'regime (b) emits NO not_found signal for any item');

// The paired proof that the suppression is what removed them. The SAME English
// text, scanned ALONE, is regime (c) and reports all four absences. Put the Arabic
// annex back and those four keys disappear: the fix suppresses the absence claims,
// it does not disable the checks.
var enHalf = C.prescan(EN_HALF, nlCtx);
H.eq(enHalf.meta.unreadable, false, 'the English half alone is readable');
H.eq(enHalf.meta.mixed_script, false, 'the English half alone is not mixed-script: regime (c)');
H.eq(sigOf(enHalf, 'uneg:limitations'), 'not_found', 'regime (c) on the English half: limitations genuinely absent, reported not_found');
H.eq(sigOf(enHalf, 'uneg:recommendations'), 'not_found', 'regime (c) on the English half: recommendations genuinely absent, reported not_found');
H.eq(sigOf(enHalf, 'ethics:consent'), 'not_found', 'regime (c) on the English half: nothing on consent, reported not_found');
H.eq(sigOf(enHalf, 'sample:achieved'), 'not_found', 'regime (c) on the English half: no n= figure, reported not_found');
['uneg:limitations', 'uneg:recommendations', 'ethics:consent', 'sample:achieved'].forEach(function(id) {
  H.assert(bmix.signals[id] === undefined,
    'regime (b): ' + id + ' carries NO KEY (it is not_found on the same English text alone), so no chip and no one-click Record No');
});

// ---- a mostly-numeric English annex: fails safe, and the copy must not lie -------
// The gate is a share of LATIN LETTERS, so a table of figures trips it even though
// the text is English. Zero signals is the right outcome (there is nothing to read),
// but it is NOT a wrong-script case: mixed_script is false, and the panel copy must
// therefore speak about not finding enough readable English or French text, not
// about the script the text is in.
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
H.eq(numeric.meta.unreadable, true, 'a mostly-numeric English annex trips the readability gate');
H.eq(Object.keys(numeric.signals).length, 0, 'and it fails safe: zero signals, no fabricated absence');
H.eq(numeric.meta.mixed_script, false, 'but it is NOT a wrong-script case: the text was English, and the copy must not say otherwise');

// The gate must not swallow real reports: the English and French fixtures above
// are readable, and they still emit signals.
H.eq(res.meta.unreadable, false, 'the English report is readable');
H.eq(fres.meta.unreadable, false, 'the French report, diacritics and all, is readable');
H.assert(Object.keys(res.signals).length > 4, 'the readable English report still emits its signals');
H.assert(Object.keys(fres.signals).length > 4, 'the readable French report still emits its signals');

// ---- and a normal EN/FR report is COMPLETELY UNAFFECTED --------------------------
// This is the assertion that stops the fix from quietly disabling the scanner's one
// useful negative: on ordinary Latin-script text it must still be able to say that a
// section really is missing. If a future change widens the suppression, these fail.
H.eq(res.meta.mixed_script, false, 'the English report is regime (c): not mixed-script');
H.eq(fres.meta.mixed_script, false, 'the French report is regime (c): diacritics are Latin, not another script');
H.eq(sigOf(res, 'ethics:consent'), 'not_found', 'the English report STILL reports a genuine absence: it says nothing about consent');
H.eq(sigOf(res, 'eq:q2'), 'not_found', 'the English report still reports a genuinely uncovered evaluation question');
H.eq(sigOf(fres, 'ethics:consent'), 'not_found', 'the French report still reports a genuine absence: it says nothing about consent');
H.assert(notFoundKeys(res).length > 0, 'not_found is alive and well on a normal English report');
H.assert(notFoundKeys(fres).length > 0, 'not_found is alive and well on a normal French report');

// ---- THE LATIN-SCRIPT LANGUAGE THE SCANNER DOES NOT KNOW ------------------------
// Every gate above keys on SCRIPT. A Spanish or Portuguese evaluation report (common
// in this domain) is 0.99 Latin and 0.00 other-script, so it sails through all of
// them into the fully-readable regime, and NONE of the patterns match it:
// /(methodolog|\bmethods?\b|\bmethodes?\b)/ does not match "Metodologia de la
// evaluacion", the limitations family does not match "Limitaciones", \bresume\b does
// not match "Resumen Ejecutivo". The fixtures below HAVE all four sections. Before
// the language gate they collected 7 not_found signals, including uneg:methods and
// uneg:limitations, both CRITICAL, each rendering a red "not detected" chip with a
// one-click "I checked. Record No" -> 7 critical red flags -> recommendVerdict
// returns 'return' -> the one-click "Request revision on the deliverable", which
// flips the deliverable and writes the audit log. The same harmful chain the script
// gates exist to close, reached through a different door. These are the fixtures that
// catch it.
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
  'El programa mejoro la cobertura de vacunacion entre los ninos menores de cinco anos en las regiones del norte en dieciocho puntos porcentuales durante el periodo evaluado. Las actividades incluyeron campanas de sensibilizacion comunitaria y la capacitacion del personal de salud.',
  'La evaluacion concluye que el programa alcanzo la mayoria de sus metas a nivel de productos, aunque el avance en los resultados de mediano plazo fue desigual entre las provincias.',
  '',
  'Metodologia de la evaluacion',
  'El equipo adopto un diseno mixto que combina datos cuantitativos y cualitativos. Se realizo una encuesta de hogares con una muestra aleatoria estratificada en seis provincias, junto con entrevistas a informantes clave en los niveles ministerial y provincial.',
  'Se organizaron grupos focales con cuidadores en las comunidades destinatarias y se triangularon los datos de los registros de los establecimientos con los resultados de la encuesta y con el material cualitativo.',
  '',
  'Limitaciones',
  'Las restricciones de seguridad impidieron el acceso a dos provincias del nororiente, por lo que los hallazgos no se aplican a esas zonas. Ademas, los registros de los establecimientos estaban incompletos en algunos casos.',
  '',
  'Hallazgos principales',
  'La cobertura aumento de manera notable en las zonas alcanzadas por las brigadas moviles y mejoro la regularidad de la cadena de frio en los establecimientos rurales.',
  'Los cuidadores senalaron que las visitas de las brigadas moviles se volvieron regulares y previsibles, y que el personal de salud paso a ser conocido por las familias.',
  '',
  'Conclusiones',
  'La evaluacion concluye que el programa fue pertinente para las necesidades de la poblacion y eficaz para elevar la cobertura, pero su sostenibilidad depende de la contratacion de personal.',
  '',
  'Recomendaciones',
  'Ampliar el modelo de sensibilizacion comunitaria a las provincias restantes, con un presupuesto operativo estable para las brigadas moviles.',
  'Fortalecer el sistema de informacion sanitaria para que registre a los ninos que no recibieron ninguna dosis.'
].join('\n');

// The same in Portuguese. Both languages are ordinary in this domain, and both used
// to behave identically to each other and identically badly.
var PT_REPORT = [
  'RELATORIO FINAL DE AVALIACAO',
  'Avaliacao independente do Programa Nacional de Imunizacao',
  '',
  'Sumario Executivo',
  'O programa melhorou a cobertura vacinal entre as criancas menores de cinco anos nas regioes do norte em dezoito pontos percentuais durante o periodo avaliado. As atividades incluiram campanhas de sensibilizacao comunitaria e a formacao dos profissionais de saude.',
  'A avaliacao conclui que o programa alcancou a maioria das suas metas ao nivel dos produtos, embora o progresso ao nivel dos resultados de medio prazo tenha sido desigual entre as provincias.',
  '',
  'Metodologia da avaliacao',
  'A equipa adotou um desenho misto que combina dados quantitativos e qualitativos. Realizou-se um inquerito aos agregados familiares com uma amostra aleatoria estratificada em seis provincias, a par de entrevistas a informantes chave aos niveis ministerial e provincial.',
  'Foram organizados grupos focais com cuidadores nas comunidades visadas e os dados dos registos das unidades foram triangulados com os resultados do inquerito e com o material qualitativo.',
  '',
  'Limitacoes',
  'As restricoes de seguranca impediram o acesso a duas provincias do nordeste, pelo que os achados nao se aplicam a essas zonas. Alem disso, os registos das unidades estavam incompletos nalguns casos.',
  '',
  'Principais achados',
  'A cobertura aumentou de forma notavel nas zonas alcancadas pelas brigadas moveis e melhorou a regularidade da cadeia de frio nas unidades rurais.',
  'Os cuidadores referiram que as visitas das brigadas moveis se tornaram regulares e previsiveis, e que os profissionais de saude passaram a ser conhecidos pelas familias.',
  '',
  'Conclusoes',
  'A avaliacao conclui que o programa foi pertinente para as necessidades da populacao e eficaz para aumentar a cobertura, mas a sua sustentabilidade depende da contratacao de pessoal.',
  '',
  'Recomendacoes',
  'Alargar o modelo de sensibilizacao comunitaria as provincias restantes, com um orcamento operacional estavel para as brigadas moveis.',
  'Reforcar o sistema de informacao sanitaria para que registe as criancas que nao receberam nenhuma dose.'
].join('\n');

// Accented, to prove the gate does not merely key on the absence of diacritics: a
// Spanish report typed properly is still Spanish.
var ES_ACCENTED = [
  'INFORME FINAL DE EVALUACIÓN',
  '',
  'Resumen Ejecutivo',
  'El programa mejoró la cobertura de vacunación entre los niños menores de cinco años en las regiones del norte durante el período evaluado. Las actividades incluyeron campañas de sensibilización comunitaria y la capacitación del personal de salud.',
  '',
  'Metodología de la evaluación',
  'El equipo adoptó un diseño mixto. Se realizó una encuesta de hogares (n=236) con una muestra aleatoria estratificada en seis provincias, junto con entrevistas a informantes clave.',
  '',
  'Limitaciones',
  'Las restricciones de seguridad impidieron el acceso a dos provincias, por lo que los hallazgos no se aplican a esas zonas.',
  '',
  'Recomendaciones',
  'Ampliar el modelo de sensibilización comunitaria a las provincias restantes.'
].join('\n');

[['Spanish', ES_REPORT], ['Portuguese', PT_REPORT], ['Spanish with diacritics', ES_ACCENTED]].forEach(function(pair) {
  var name = pair[0], r = C.prescan(pair[1], esCtx);
  H.assert(r.ok, name + ': scans without error');
  // It really is the paste that every SCRIPT gate waves through: ordinary Latin text.
  H.assert(latinShare(pair[1]) > 0.9, name + ': Latin share is over 0.9, so every script gate passes it');
  H.eq(r.meta.unreadable, false, name + ': it is perfectly legible text, not an unreadable one');
  H.eq(r.meta.mixed_script, false, name + ': and it is not mixed-script, so the previous fix does not touch it');
  // The new gate, and the whole point.
  H.eq(r.meta.unknown_language, true, name + ': but it is not a language this scan can read');
  H.assert(r.meta.enfr_density < 0.08, name + ': its EN/FR function-word density is under the floor (got ' + r.meta.enfr_density.toFixed(4) + ')');
  H.eq(notFoundKeys(r).length, 0, name + ': ZERO not_found signals, though the scan matched none of its headings');
  H.assert(r.signals['uneg:methods'] === undefined,
    name + ': uneg:methods carries NO KEY, so no chip and no one-click "Record No" on a CRITICAL item, though the report HAS a methodology section');
  H.assert(r.signals['uneg:limitations'] === undefined,
    name + ': uneg:limitations carries NO KEY, so no chip and no one-click "Record No" on a CRITICAL item, though the report HAS a limitations section');
  H.assert(r.signals['uneg:exec'] === undefined, name + ': no fabricated absence on the executive summary, which the report HAS');
  H.assert(r.signals['uneg:recommendations'] === undefined, name + ': no fabricated absence on recommendations, which the report HAS');
  H.assert(r.signals['ethics:consent'] === undefined, name + ': no fabricated absence on the critical consent item');
  H.assert(r.signals['eq:e1'] === undefined, name + ': no fabricated absence on an evaluation question');
  H.assert(r.signals['structure:agreed'] === undefined || r.signals['structure:agreed'].signal !== 'not_found',
    name + ': no fabricated absence on the agreed structure');
});

// THE CHAIN, END TO END. Taking every one-click the panel offers must no longer be
// able to drive the verdict to 'return' on a Spanish report that has every section.
// This is the assertion that speaks about the HARM, not about the plumbing.
var esRun = C.newScreenRun(esCtx, 'team', null, '2026-07-11');
var esScan = C.prescan(ES_REPORT, esCtx);
notFoundKeys(esScan).forEach(function(id) { esRun = C.setItemAnswer(esRun, id, { answer: 'no' }); });
var esRec = C.recommendVerdict(esRun.items);
H.eq(esRec.redFlags.length, 0, 'Spanish report: taking every one-click the scan offers writes ZERO red flags');
H.assert(esRec.verdict !== 'return', 'Spanish report: the scan can no longer drive the recommended verdict to return');

// ---- the fix suppresses ABSENCE CLAIMS ONLY, never DETECTIONS -------------------
// A detection is safe in any language: the scanner genuinely saw the thing it
// reports. Two cases where the words really do coincide, and both must survive.
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
H.eq(notFoundKeys(esConsent).length, 0, 'Spanish: and it still asserts no absence anywhere');

// ---- a NORMAL EN and FR report is COMPLETELY UNAFFECTED --------------------------
// The assertion that stops this fix from silently disabling the scanner's one useful
// negative. If a future change widens the language suppression, these fail.
H.eq(res.meta.unknown_language, false, 'the English report IS recognisably English: regime (c)');
H.eq(fres.meta.unknown_language, false, 'the French report with diacritics IS recognisably French: regime (c)');
H.assert(res.meta.enfr_density >= 0.08, 'the English report clears the density floor (got ' + res.meta.enfr_density.toFixed(4) + ')');
H.assert(fres.meta.enfr_density >= 0.08, 'the French report clears the density floor (got ' + fres.meta.enfr_density.toFixed(4) + ')');
H.eq(sigOf(res, 'ethics:consent'), 'not_found', 'the English report STILL reports its genuinely missing consent section');
H.eq(sigOf(fres, 'ethics:consent'), 'not_found', 'the French report STILL reports its genuinely missing consent section');

// French WITHOUT diacritics, at full length: the same report typed on a keyboard that
// has none must be recognised as French just as well, and must keep its one useful
// negative. It has no consent section and no n= figure; both are genuinely absent.
var FR_PLAIN = [
  'RAPPORT FINAL D EVALUATION',
  '',
  'Resume executif',
  'Le programme a ameliore la couverture vaccinale des enfants zero dose dans les districts du nord. Les equipes mobiles ont atteint des villages que les centres de sante fixes n avaient jamais desservis, et la chaine du froid a tenu dans les entrepots de district pendant toute la campagne.',
  '',
  'Methodologie',
  'L equipe a mene une enquete aupres des menages dans six districts, ainsi que des entretiens avec des informateurs cles dans les bureaux de district. Les donnees quantitatives tirees des registres des centres ont ete triangulees avec le materiel qualitatif.',
  '',
  'Limites',
  'Les contraintes de securite ont empeche l acces a deux districts du nord est, et les resultats ne valent donc pas pour ces zones.',
  '',
  'Constatations',
  'La couverture a progresse dans les districts atteints par la campagne. Les soignants ont indique que les visites des equipes mobiles etaient previsibles et que les agents de sante leur etaient connus.',
  '',
  'Recommandations',
  'Etendre le modele de sensibilisation communautaire aux districts restants avec un budget operationnel stable pour les equipes mobiles.'
].join('\n');
var frPlain = C.prescan(FR_PLAIN, esCtx);
H.eq(frPlain.meta.unknown_language, false, 'unaccented French is still recognised as French');
H.assert(frPlain.meta.enfr_density >= 0.08, 'unaccented French clears the density floor (got ' + frPlain.meta.enfr_density.toFixed(4) + ')');
H.eq(sigOf(frPlain, 'uneg:methods'), 'found', 'unaccented French: the methodologie heading is detected');
H.eq(sigOf(frPlain, 'uneg:limitations'), 'found', 'unaccented French: the limites heading is detected');
H.eq(sigOf(frPlain, 'ethics:consent'), 'not_found',
  'unaccented French STILL reports a genuine absence: it says nothing about consent');
H.eq(sigOf(frPlain, 'sample:achieved'), 'not_found',
  'unaccented French STILL reports a genuine absence: it carries no n= figure');
H.assert(notFoundKeys(frPlain).length > 0, 'not_found is alive and well on a normal unaccented French report');
H.assert(notFoundKeys(res).length > 0, 'not_found is alive and well on a normal English report');

// ---- the density is the discriminator, and the SHARED words are why it works ------
// Order-of-magnitude separation, measured. If a future change adds a marker that
// Spanish and Portuguese also use (de, la, que, en, no, se, es, son, por, para, con,
// or a homograph like FR "tres" = ES/PT "three", FR "sur" = ES "south"), the Spanish
// density climbs and this fails before the harm ships.
H.assert(esScan.meta.enfr_density === 0, 'the Spanish report scores EXACTLY zero: no marker is a word Spanish also uses');
H.assert(C.prescan(PT_REPORT, esCtx).meta.enfr_density === 0, 'the Portuguese report scores EXACTLY zero too');
H.assert(res.meta.enfr_density > 0.15, 'the English report is an order of magnitude clear of them (got ' + res.meta.enfr_density.toFixed(4) + ')');
H.assert(frPlain.meta.enfr_density > 0.15, 'so is the French one (got ' + frPlain.meta.enfr_density.toFixed(4) + ')');

// ---- the MINOR: structure:agreed may not assert an absence in its EVIDENCE --------
// structure:agreed is the one signal that can SURVIVE the emit gate while still
// carrying an absence claim, because a partial match is a 'weak', not a 'not_found'.
// Its evidence used to read "Missing: Methodology." even in the mixed-script regime,
// which is an assertion about a section that may sit in the very half of the document
// the scan could not read, and the row it lands on offers a one-click "I checked.
// Record Partial".
var stCtx = S.createEmptyContext();
stCtx.report_structure.sections = [{ id: 'm1', title: 'Executive Summary' }, { id: 'm2', title: 'Methodology' }];
var mixStruct = C.prescan(BILINGUAL, stCtx);
H.eq(mixStruct.meta.mixed_script, true, 'the bilingual fixture is mixed-script, so absences are not allowed');
H.eq(sigOf(mixStruct, 'structure:agreed'), 'weak', 'structure:agreed survives as weak: one of the two titles IS there as a heading');
H.assert(mixStruct.signals['structure:agreed'].evidence.indexOf('Missing') === -1,
  'mixed-script: the structure evidence names NOTHING as missing');
H.assert(mixStruct.signals['structure:agreed'].evidence.indexOf('Methodology') === -1,
  'mixed-script: and it does not name the section it could not find, which may be in the half it could not read');
H.assert(mixStruct.signals['structure:agreed'].evidence.indexOf('Detected as headings: 1 of 2') !== -1,
  'mixed-script: it states only what it SAW (1 of 2 titles detected as headings)');
H.assert(mixStruct.signals['structure:agreed'].evidence.length <= EVIDENCE_CAP,
  'the rewritten structure evidence still respects the evidence cap');
// The paired proof: on the SAME English text alone, regime (c), it still names the
// missing section. The evidence gate suppresses an unearned claim; it does not blind
// the check.
var enStruct = C.prescan(EN_HALF, stCtx);
H.eq(enStruct.meta.mixed_script, false, 'the English half alone is regime (c)');
H.assert(enStruct.signals['structure:agreed'].evidence.indexOf('Missing: Methodology') !== -1,
  'regime (c): the structure evidence DOES still name the genuinely missing section');
// And on a Spanish report the whole signal is gone, not merely its sentence.
H.assert(esScan.signals['structure:agreed'] === undefined || esScan.signals['structure:agreed'].signal !== 'not_found',
  'Spanish: structure:agreed asserts no absence');

// prescan never answers an item: it returns signals only.
H.assert(JSON.stringify(res).indexOf('"answer"') === -1, 'prescan never sets an answer');

H.summary('prescan.test');
