/**
 * PraxisScreenCore: pure logic for the First Review rapid red-flag screen.
 * Generates the screening checklist from the project's own artifacts (matrix or
 * gate snapshot, agreed design, sample plan, report structure, decision window)
 * plus the UNEG/OECD-DAC report-quality core and the ethics screen; computes
 * red flags and the recommended verdict. Phase 2 adds the deterministic
 * paste-text prescan. No React, no DOM: loadable under node by tests/helpers.js.
 * window.PraxisScreenCore.
 */
(function() {
  'use strict';
  var U = window.PraxisUtils;

  var ANSWER_LABELS = { yes: 'Yes', partial: 'Partial', no: 'No', cant_tell: 'Cannot tell' };

  // Recommended-verdict vocabulary. The HUMAN records the actual verdict; these
  // are also the record values. Badges reuse the cockpit badge classes.
  var VERDICTS = {
    return: { label: 'Return for revision', badge: 'wb-badge-red' },
    reserved: { label: 'Accept with reservations', badge: 'wb-badge-amber' },
    proceed: { label: 'Proceed to full review', badge: 'wb-badge-green' }
  };

  // The fixed UNEG / OECD-DAC report-quality core. Ids are stable: answers key
  // off them and the export references them.
  var UNEG_ITEMS = [
    { id: 'uneg:exec', severity: 'major', text: 'The executive summary stands alone',
      detail: 'Findings, conclusions and recommendations are readable without the body of the report.' },
    { id: 'uneg:methods', severity: 'critical', text: 'The methodology is transparent',
      detail: 'Methods, data sources and triangulation are described well enough to judge how much weight the findings can bear.' },
    { id: 'uneg:limitations', severity: 'critical', text: 'Limitations are disclosed',
      detail: 'The report states what the evaluation could not do and how that qualifies the findings.' },
    { id: 'uneg:conclusions', severity: 'critical', text: 'Conclusions follow from findings',
      detail: 'No conclusion rests on evidence the report does not present.' },
    { id: 'uneg:recommendations', severity: 'major', text: 'Recommendations are actionable and addressed',
      detail: 'Each recommendation is specific, prioritised and addressed to a named user or body.' }
  ];

  // machine_evidence is a TOMBSTONE and must stay empty forever. An earlier build
  // did persist the quoted line that justified a signal; that line is body text
  // lifted verbatim from a confidential report (the worst case in the fixtures is
  // "Consent was refused by <name>, age 14, of <village>"), and anything on an
  // item flows into the run, into localStorage, into the .praxis file and into
  // exports. Evidence now lives only in ephemeral React state, for this tab, for
  // this session. The field is KEPT rather than deleted so that the persisted item
  // shape is stable across the versions that had it, and so PraxisSchema's
  // scrubScreens has a known key to empty on data written by those builds. That
  // scrub runs on every path through migrate, whatever version stamp the file
  // carries, because the builds that wrote snippets already stamped them 1.7.0.
  // NOTHING may ever populate it: see tests/firstreview.privacy.test.js.
  function mk(base) {
    return {
      id: base.id, source: base.source, ref: base.ref || null,
      severity: base.severity, text: base.text, detail: base.detail || '',
      auto: !!base.auto, answer: base.answer !== undefined ? base.answer : null,
      note: '', machine_signal: null, machine_evidence: '',
      answerability: base.answerability !== undefined ? base.answerability : undefined
    };
  }

  // The questions to screen against: the gate pre-commitment snapshot when one
  // was taken (checks the report against what was locked, catching drift), else
  // the live matrix.
  function eqRows(context) {
    var cm = (context && context.commissioner) || {};
    var snap = (cm.gate || {}).eq_snapshot;
    if (Array.isArray(snap) && snap.length) {
      return {
        fromSnapshot: true,
        rows: snap.filter(function(s) { return s && s.eq_id != null; }).map(function(s) {
          return { eq_id: s.eq_id, number: s.number, question: s.question || '' };
        })
      };
    }
    var rows = ((context && context.evaluation_matrix) || {}).rows || [];
    return {
      fromSnapshot: false,
      rows: rows.filter(function(r) { return r && r.id != null; }).map(function(r) {
        return { eq_id: r.id, number: r.number, question: r.question || '' };
      })
    };
  }

  function localTodayIso() {
    var n = new Date();
    function p(x) { return String(x).padStart(2, '0'); }
    return n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate());
  }

  // Earliest dated decision window: primary users first, governance fallback.
  // Mirrors the window selection in CockpitData.decisionWindowFit.
  function earliestWindow(context) {
    var cm = (context && context.commissioner) || {};
    var gov = cm.governance || {};
    var wins = (cm.users || []).filter(function(u) { return u && u.tier === 'primary' && u.window_closes; })
      .map(function(u) { return { label: (u.name || '').trim() || 'primary user', closes: u.window_closes }; });
    if (!wins.length && gov.decision_window_closes) {
      wins = [{ label: (gov.decision_clock || '').trim() || 'the decision', closes: gov.decision_window_closes }];
    }
    if (!wins.length) return null;
    wins.sort(function(a, b) { return a.closes < b.closes ? -1 : (a.closes > b.closes ? 1 : 0); });
    return wins[0];
  }

  function ethicsItems(context) {
    var sensitivity = ((context || {}).protection || {}).sensitivity || 'standard';
    var heightened = sensitivity !== 'standard';
    var levelText = sensitivity.replace(/_/g, ' ');
    return [
      mk({ id: 'ethics:consent', source: 'ethics', severity: 'critical',
        text: 'Consent and data protection are described',
        detail: heightened
          ? 'This project is marked ' + levelText + '. Look for a named consent and data-protection protocol, not a general assurance.'
          : 'The report describes how informed consent was obtained and how personal data was protected.' }),
      mk({ id: 'ethics:identifiable', source: 'ethics', severity: 'critical',
        text: 'No participant is identifiable',
        detail: heightened
          ? 'This project is marked ' + levelText + '. Check quotes, photos, case descriptions AND location detail: in a small site, a role plus a district can identify a person.'
          : 'Quotes, photos and case descriptions cannot be traced to individuals without documented consent.' }),
      mk({ id: 'ethics:harm', source: 'ethics', severity: 'critical',
        text: 'Reporting does no harm',
        detail: 'Findings about specific groups, sites or staff are phrased so publication cannot endanger or unfairly expose them.' })
    ];
  }

  // Build the checklist for one screening run. opts:
  //   deliverable  the attached deliverable object or null (unattached run)
  //   todayIso     'YYYY-MM-DD' reference date for the timing fallback; defaults
  //                to the local calendar today. Tests pass it for determinism.
  function buildScreenItems(context, opts) {
    var o = opts || {};
    var items = [];
    var ctx = context || {};

    // --- this evaluation's own artifacts ---------------------------------
    var eq = eqRows(ctx);
    var answMap = {};
    (((ctx.commissioner || {}).appraisal || {}).evidence || []).forEach(function(e) {
      if (e && e.eq_id != null && typeof e.rating === 'number') answMap[e.eq_id] = e.rating;
    });
    if (eq.rows.length) {
      eq.rows.forEach(function(r) {
        items.push(mk({ id: 'eq:' + r.eq_id, source: 'eq', ref: String(r.eq_id), severity: 'critical',
          text: 'EQ' + (r.number != null ? r.number : '') + ' is answered: ' + r.question,
          detail: (eq.fromSnapshot ? 'From the gate pre-commitment snapshot. ' : '') +
            'Findings answer this question and are traceable to presented evidence.',
          answerability: answMap[r.eq_id] != null ? answMap[r.eq_id] : null }));
      });
    } else {
      items.push(mk({ id: 'eq:none', source: 'eq', severity: 'critical',
        text: 'The evaluation questions are answered',
        detail: 'No evaluation matrix exists in this project, so questions cannot be screened one by one. Complete Station 2 to enable per-question screening.',
        answerability: null }));
    }

    var design = ctx.design_recommendation || {};
    var ranked = design.ranked_designs || [];
    var selected = null;
    for (var i = 0; i < ranked.length; i++) { if (ranked[i] && ranked[i].id === design.selected_design) { selected = ranked[i]; break; } }
    if (!selected && ranked.length) selected = ranked[0];
    if (selected && selected.name) {
      items.push(mk({ id: 'design:fidelity', source: 'design', severity: 'critical',
        text: 'Methods used match the agreed design',
        detail: 'The agreed design is ' + selected.name + (selected.family ? ' (' + selected.family + ')' : '') +
          '. The report describes the methods actually used and explains any deviation.' }));
    }

    var sample = ctx.sample_parameters || {};
    var plannedN = sample.result && (sample.result.primary != null ? sample.result.primary : null);
    if (plannedN != null && String(plannedN) !== '') {
      items.push(mk({ id: 'sample:achieved', source: 'sample', severity: 'major',
        text: 'Achieved sample is reported against the plan',
        detail: 'The planned sample was ' + (sample.result.label || ('n = ' + plannedN)) +
          '. The report states the achieved sample and addresses the implications of any shortfall.' }));
    }

    var sections = (ctx.report_structure || {}).sections || [];
    if (sections.length) {
      var titles = sections.map(function(s) { return (s && s.title) || ''; }).filter(Boolean);
      items.push(mk({ id: 'structure:agreed', source: 'structure', severity: 'major',
        text: 'All agreed sections are present',
        detail: 'The agreed outline has ' + titles.length + ' sections: ' + titles.slice(0, 6).join('; ') +
          (titles.length > 6 ? '; and ' + (titles.length - 6) + ' more.' : '.') }));
    }

    // --- timing (auto: computed, never rated by hand) ---------------------
    var win = earliestWindow(ctx);
    if (win) {
      var refIso = (o.deliverable && o.deliverable.submitted_at)
        ? String(o.deliverable.submitted_at).slice(0, 10)
        : (o.todayIso || localTodayIso());
      var margin = U.diffDaysLocal(refIso, win.closes);
      if (margin != null) {
        var answer = margin < 0 ? 'no' : (margin <= 14 ? 'partial' : 'yes');
        items.push(mk({ id: 'timing:window', source: 'timing', severity: 'critical', auto: true, answer: answer,
          text: 'The report is in time for the decision',
          detail: (margin < 0
            ? 'The report arrived ' + Math.abs(margin) + ' days AFTER the decision window for ' + win.label + ' closed'
            : 'The decision window for ' + win.label + ' closes ' + margin + ' days after the report date') +
            ' (window closes ' + win.closes + '). Computed automatically; no reading needed.' }));
      }
    }

    // --- fixed cores -------------------------------------------------------
    UNEG_ITEMS.forEach(function(u) {
      items.push(mk({ id: u.id, source: 'uneg', severity: u.severity, text: u.text, detail: u.detail }));
    });
    ethicsItems(ctx).forEach(function(e) { items.push(e); });

    return items;
  }

  // Red flag: a critical item answered no or cannot-tell, or a major item
  // answered no. Amber: any partial, or a major item answered cannot-tell.
  function computeRedFlags(items) {
    return (items || []).filter(function(it) {
      if (!it || !it.answer) return false;
      if (it.severity === 'critical') return it.answer === 'no' || it.answer === 'cant_tell';
      return it.answer === 'no';
    });
  }
  function computeAmbers(items) {
    return (items || []).filter(function(it) {
      if (!it || !it.answer) return false;
      if (it.answer === 'partial') return true;
      return it.severity === 'major' && it.answer === 'cant_tell';
    });
  }

  // The recommendation only. The reviewer records the actual verdict; the tool
  // never decides. Null verdict = clean so far but not every item is answered.
  function recommendVerdict(items) {
    var redFlags = computeRedFlags(items);
    var ambers = computeAmbers(items);
    var unanswered = (items || []).filter(function(it) { return it && !it.auto && !it.answer; });
    var verdict = null;
    if (redFlags.length) verdict = 'return';
    else if (ambers.length) verdict = 'reserved';
    else if (!unanswered.length) verdict = 'proceed';
    return { verdict: verdict, redFlags: redFlags, ambers: ambers, unanswered: unanswered };
  }

  function newScreenRun(context, role, deliverable, todayIso) {
    return {
      id: U.uid('scr_'),
      role: role === 'commissioner' ? 'commissioner' : 'team',
      deliverable_id: deliverable && deliverable.id ? deliverable.id : null,
      reviewer: '',
      started_at: new Date().toISOString(),
      completed_at: null,
      items: buildScreenItems(context, { deliverable: deliverable || null, todayIso: todayIso }),
      prescan: null,
      verdict: null,
      verdict_recommended: null,
      note: ''
    };
  }

  function upsertRun(list, run) {
    var found = false;
    var next = (list || []).map(function(r) { if (r && r.id === run.id) { found = true; return run; } return r; });
    if (!found) next = next.concat([run]);
    return next;
  }

  // The completed run with the greatest completed_at, optionally restricted to
  // one role; null when there is none. upsertRun replaces a run IN PLACE by id,
  // so array position tracks CREATION order, not completion order: a reopened
  // and re-completed earlier run can end up ahead, in array terms, of a run
  // completed after it. Callers that want "the latest completed review" must
  // compare completed_at, not read arr[arr.length - 1]. completed_at values are
  // ISO 8601 timestamps of one fixed format (new Date().toISOString()), so a
  // plain string comparison orders them chronologically without parsing dates.
  // Runs with a missing or null completed_at are ignored. On a tie (identical
  // completed_at, possible since two saves can land in the same millisecond),
  // the LATER array position wins, so the result is deterministic.
  function latestCompleted(list, role) {
    var best = null;
    (list || []).forEach(function(r) {
      if (!r || !r.completed_at) return;
      if (role && r.role !== role) return;
      if (!best || r.completed_at >= best.completed_at) best = r;
    });
    return best;
  }

  // Every screening item is phrased as an affirmative claim ("Limitations are
  // disclosed", "The report is in time for the decision"). A red flag or amber
  // means the reviewer answered something other than a clean Yes, so printing
  // item.text alone at a listing site reads as if the claim were true. This is
  // the one place that turns an item into a sentence that states what actually
  // happened; every listing site must call it instead of reading item.text
  // directly. Pure: no formatting assumptions beyond string concatenation, so
  // it is identical whether the caller renders it in a React node or writes it
  // into an exported document.
  function flagLabel(item) {
    if (!item || !item.text) return (item && item.text) || '';
    if (!item.answer) return item.text;
    var label = ANSWER_LABELS[item.answer] || item.answer;
    return item.text + ' (answered: ' + label + ')';
  }

  // Immutably patch one item in a run. The timing item is computed, so its
  // answer cannot be hand-edited; its note can.
  function setItemAnswer(run, itemId, patch) {
    var items = (run.items || []).map(function(it) {
      if (!it || it.id !== itemId) return it;
      var p = Object.assign({}, patch);
      if (it.auto && 'answer' in p) delete p.answer;
      return Object.assign({}, it, p);
    });
    return Object.assign({}, run, { items: items });
  }

  // ---- phase 2: deterministic paste-text prescan ---------------------------
  // Indicative machine signals only. A regex can see that a line reading
  // "Limitations" exists; it cannot see whether the limitations disclosed are
  // the ones that matter. So every signal must be confirmed by the reviewer
  // before it becomes an answer, and items whose truth no regex can judge
  // (uneg:conclusions, ethics:identifiable, ethics:harm, design:fidelity,
  // timing:window) get NO key here rather than a fabricated one.
  //
  // PRIVACY: the pasted report is NEVER stored. prescan takes the text as an
  // argument, derives signals from it, and returns only those signals plus
  // counts. The only body text that survives is a bounded evidence snippet
  // (<= EVIDENCE_MAX_CHARS + 3 chars) per signal, so callers can persist the
  // whole result without persisting the report.
  var MAX_PRESCAN_CHARS = 1500000;   // refuse pastes above this; guards the O(n) scans
  var SHORT_WORDS = 500;             // below this a "report" is probably a fragment
  var LATIN_MIN_SHARE = 0.05;        // Latin letters as a share of non-space characters
  var EVIDENCE_MAX_CHARS = 150;      // hard cap on any snippet of body text we keep
  var HEADING_MAX_CHARS = 90;        // a line longer than this reads as prose, not a heading
  var EQ_TOKEN_CAP = 10;             // distinctive terms taken from one evaluation question
  var EQ_FOUND_RATIO = 0.5;          // >= half the question's terms present -> found
  var EQ_WEAK_RATIO = 0.25;          // >= a quarter -> weak
  var EQ_EVIDENCE_MIN_HITS = 2;      // terms on one line before we quote that line
  var EQ_MIN_TERMS = 3;              // a question with fewer distinctive terms cannot reach found
  var EQ_MIN_FOUND_HITS = 2;         // and one term, however distinctive, is never enough
  var TITLE_TOKEN_CAP = 6;           // distinctive terms taken from one agreed section title
  var TITLE_MATCH_RATIO = 0.6;       // share of a title's terms needed on one line to call it present
  var STRUCTURE_WEAK_FRAC = 0.5;     // share of titles present before a partial outline is weak
  var SAMPLE_TOLERANCE = 0.1;        // achieved n within 10 percent of planned n counts as met

  // EN + FR function words and evaluation boilerplate, diacritics pre-stripped.
  // These are stripped from questions and titles so that matching turns on the
  // distinctive terms ("vaccination", "karamoja") and not on "the" or "dans".
  var STOPWORDS = {};
  ('about after against all and any are been before being best between both but can could did does doing down during each evaluation extent few for from further had has have having how into its itself more most not now off once only other our out over own programme program same should some such than that the their theirs them then there these they this those through under until very was were what when where which while who whom why will with would you your ' +
   'ainsi apres aussi autre autres avant avec cela celle celles cette ceux comment dans des elle elles entre etre ils leur leurs mais meme memes mesure notre nous ont par pas peut plus pour quel quelle quelles quels qui quoi sans ses son sont sur tous tout toute toutes une vos votre vous')
    .split(/\s+/).forEach(function(w) { if (w) STOPWORDS[w] = true; });

  // Lowercase and strip combining marks (NFD then drop U+0300..U+036F), so that
  // an accented French heading and the same word typed without accents both
  // match one pattern that is itself written without accents.
  function normText(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function tokensOf(s, cap) {
    var out = [], seen = {};
    normText(s).split(/[^a-z0-9]+/).forEach(function(t) {
      if (t.length < 4 || STOPWORDS[t] || seen[t]) return;
      seen[t] = true;
      if (out.length < (cap || EQ_TOKEN_CAP)) out.push(t);
    });
    return out;
  }
  function snippet(line) {
    var s = String(line || '').trim();
    return s.length > EVIDENCE_MAX_CHARS ? s.slice(0, EVIDENCE_MAX_CHARS - 3) + '...' : s;
  }

  // Patterns are tested against NORMALISED text (lowercased, diacritics stripped),
  // so they are written without accents and match "Resume", "Resume" and "RESUME"
  // alike. Each family carries the EN and the FR heading vocabulary side by side:
  // methodolog* covers "Methodology" and "Methodologie" and "Demarche
  // methodologique"; \bmethods?\b covers the bare English "Methods", "Evaluation
  // Methods", "Approach and Methods" and "Data collection methods"; \bmethodes?\b
  // covers the French "Methode(s)" and "Approche et methodes".
  var SECTION_FAMILIES = {
    'uneg:exec': /(executive\s+summary|sommaire\s+executif|\bresume\b|\bsynthese\b)/,
    'uneg:methods': /(methodolog|\bmethods?\b|\bmethodes?\b)/,
    'uneg:limitations': /(limitation|\blimites\b|\bcaveats?\b|\bconstraints?\b)/,
    'uneg:recommendations': /(recommendation|recommandation)/,
    'ethics:consent': /(ethic|ethique|consent|consentement|safeguard|protection\s+des\s+donnees|do\s+no\s+harm)/
  };

  // A heading is a short line that matches the family and does not read like a
  // sentence. A body-text mention anywhere else degrades to a weak signal.
  function isHeadingLine(rawLine) {
    var t = String(rawLine || '').trim();
    if (!t || t.length > HEADING_MAX_CHARS) return false;
    return !/[.!?]$/.test(t);
  }

  // Count how many of `toks` appear in one normalised line. Matching is
  // deliberately SUBSTRING-based, not word-based: it is a poor man's stemming
  // that lets "improve" match "improved" and "vaccin" match "vaccination", at the
  // cost of letting "dose" match "overdose". That trade is self-consistent because
  // both the token and the line pass through the same normalizer, and the result
  // is only ever an indicative signal a human confirms.
  function hitsInLine(normLine, toks) {
    var c = 0;
    toks.forEach(function(t) { if (normLine.indexOf(t) !== -1) c++; });
    return c;
  }

  // Can this scanner read this text at all? Every pattern in this file is a Latin
  // word and every token is [a-z0-9], so the scan reads English and French and
  // nothing else. On an Arabic, Amharic, Cyrillic or Chinese report it matches
  // nothing, which is NOT the same fact as the report lacking a methods section:
  // it is the fact that the scanner is illiterate in that script. Emitting the
  // usual full set of not_found signals there would put a red "not detected" chip,
  // with a one-click "I checked. Record No", on uneg:methods and uneg:limitations,
  // both CRITICAL. Answering No there writes critical red flags, which drive the
  // recommended verdict to `return`, which surfaces the one-click request for
  // revision on the deliverable. An unearned machine assertion, running in the
  // harmful direction, on text the machine could not read. So: no signals at all,
  // and meta.unreadable so the panel can say why.
  //
  // Two ways to be unreadable: no [a-z0-9] token at all, or a text whose non-space
  // characters are essentially not Latin letters. The second test is what catches
  // a Chinese or Arabic report that still carries Latin page numbers and a stray
  // acronym. Digits alone never make a text readable.
  function readability(norm) {
    var words = (norm.match(/[a-z0-9]+/g) || []).length;
    var letters = (norm.match(/[a-z]/g) || []).length;
    var solid = norm.replace(/\s+/g, '').length;
    var share = solid ? letters / solid : 0;
    return { words: words, unreadable: words === 0 || letters === 0 || share < LATIN_MIN_SHARE };
  }

  function prescan(rawText, context) {
    var text = String(rawText == null ? '' : rawText);
    if (text.length > MAX_PRESCAN_CHARS) return { ok: false, error: 'too_long' };
    var lines = text.split(/\r?\n/);
    var norm = normText(text);
    var normLines = lines.map(normText);
    var read = readability(norm);
    var words = read.words;
    var signals = {};

    // Illegible to this scanner: say so, and say NOTHING about the report.
    if (read.unreadable) {
      return { ok: true, signals: {},
        meta: { chars: text.length, words: words, short: words < SHORT_WORDS, unreadable: true } };
    }

    // Section families -> heading found / body mention weak / absent.
    Object.keys(SECTION_FAMILIES).forEach(function(itemId) {
      var re = SECTION_FAMILIES[itemId];
      var headingIdx = -1;
      for (var i = 0; i < normLines.length; i++) {
        var stripped = normLines[i].replace(/^[0-9ivx]+[\s.):-]+/, '');
        if (re.test(stripped) && isHeadingLine(lines[i])) { headingIdx = i; break; }
      }
      if (headingIdx >= 0) {
        signals[itemId] = { signal: 'found', evidence: snippet(lines[headingIdx]) };
      } else if (re.test(norm)) {
        signals[itemId] = { signal: 'weak', evidence: 'Mentioned in body text but no section heading detected.' };
      } else {
        signals[itemId] = { signal: 'not_found', evidence: 'No matching heading or mention detected.' };
      }
    });

    // Per-EQ coverage: distinctive question terms found in the text. An EQ signal
    // measures TOPIC COVERAGE only. It says the report TALKS ABOUT the question;
    // it can never say the question was ANSWERED, and no reader of these fields
    // may treat it as if it did.
    //
    // FLOOR (why hits and total are both reported): with EQ_FOUND_RATIO at 0.5, a
    // question that tokenises to two terms would reach 'found' on ONE common word
    // ("Was the project relevant?" -> 'project' appears -> 1/2 = 0.5). So 'found'
    // additionally requires at least EQ_MIN_FOUND_HITS terms matched AND at least
    // EQ_MIN_TERMS distinctive terms in the question: a thin question can never be
    // more than 'weak', however generously its one word is echoed. hits and total
    // ride on EVERY eq signal so the caller can always print the denominator next
    // to the quoted line, which otherwise replaces it in `evidence`.
    var eq = eqRows(context || {});
    eq.rows.forEach(function(r) {
      var toks = tokensOf(r.question, EQ_TOKEN_CAP);
      if (!toks.length) return;
      var hits = hitsInLine(norm, toks);
      var ratio = hits / toks.length;
      var canFind = toks.length >= EQ_MIN_TERMS && hits >= EQ_MIN_FOUND_HITS;
      var sig = (canFind && ratio >= EQ_FOUND_RATIO) ? 'found' : (ratio >= EQ_WEAK_RATIO ? 'weak' : 'not_found');
      var ev = 'Matched ' + hits + ' of ' + toks.length + ' question terms.';
      if (sig !== 'not_found') {
        for (var i = 0; i < normLines.length; i++) {
          if (hitsInLine(normLines[i], toks) >= EQ_EVIDENCE_MIN_HITS) { ev = snippet(lines[i]); break; }
        }
      }
      signals['eq:' + r.eq_id] = { signal: sig, evidence: ev, hits: hits, total: toks.length };
    });

    // Agreed structure: each agreed title matched against one line. A title with
    // no distinctive terms of its own cannot be judged either way, so it is left
    // out of the denominator rather than counted as present. A title only counts
    // as PRESENT when it matches a line that reads like a heading: a report whose
    // prose merely says "in our executive summary we noted the findings" has not
    // shipped those sections, so title matches that land only in body text degrade
    // the signal to weak instead of claiming the outline is complete.
    var sections = ((context || {}).report_structure || {}).sections || [];
    var titles = sections.map(function(s) { return (s && s.title) || ''; }).filter(Boolean);
    if (titles.length) {
      var judged = 0;
      var missing = [];
      var proseOnly = [];
      titles.forEach(function(title) {
        var tw = tokensOf(title, TITLE_TOKEN_CAP);
        if (!tw.length) return;
        judged++;
        var need = Math.max(1, Math.ceil(tw.length * TITLE_MATCH_RATIO));
        var asHeading = false, inProse = false;
        for (var i = 0; i < normLines.length && !asHeading; i++) {
          if (hitsInLine(normLines[i], tw) < need) continue;
          if (isHeadingLine(lines[i])) asHeading = true; else inProse = true;
        }
        if (asHeading) return;
        if (inProse) proseOnly.push(title); else missing.push(title);
      });
      if (judged) {
        var frac = (judged - missing.length) / judged;
        var ssig, sev;
        if (!missing.length && !proseOnly.length) {
          ssig = 'found';
          sev = 'All agreed section titles detected as headings.';
        } else {
          ssig = frac >= STRUCTURE_WEAK_FRAC ? 'weak' : 'not_found';
          var parts = [];
          if (missing.length) parts.push('Missing: ' + missing.join('; ') + '.');
          if (proseOnly.length) parts.push('In body text but not as a heading: ' + proseOnly.join('; ') + '.');
          sev = snippet(parts.join(' '));
        }
        signals['structure:agreed'] = { signal: ssig, evidence: sev };
      }
    }

    // Sample numbers: n= style figures against the planned n, within tolerance.
    var plannedN = parseInt((((context || {}).sample_parameters || {}).result || {}).primary, 10);
    if (!isNaN(plannedN) && plannedN > 0) {
      var found = [], m;
      var reN = /\bn\s*=\s*([0-9][0-9,]{0,9})/gi;
      while ((m = reN.exec(text)) !== null) found.push(parseInt(m[1].replace(/,/g, ''), 10));
      var close = found.filter(function(n) { return Math.abs(n - plannedN) / plannedN <= SAMPLE_TOLERANCE; });
      signals['sample:achieved'] = {
        signal: close.length ? 'found' : (found.length ? 'weak' : 'not_found'),
        evidence: snippet(found.length
          ? 'Sample figures found: ' + found.slice(0, 5).join(', ') + '. Planned: ' + plannedN + '.'
          : 'No n= style sample figure detected. Planned: ' + plannedN + '.')
      };
    }

    return { ok: true, signals: signals,
      meta: { chars: text.length, words: words, short: words < SHORT_WORDS, unreadable: false } };
  }

  window.PraxisScreenCore = {
    ANSWER_LABELS: ANSWER_LABELS,
    MAX_PRESCAN_CHARS: MAX_PRESCAN_CHARS,
    prescan: prescan,
    VERDICTS: VERDICTS,
    eqRows: eqRows,
    buildScreenItems: buildScreenItems,
    computeRedFlags: computeRedFlags,
    computeAmbers: computeAmbers,
    recommendVerdict: recommendVerdict,
    flagLabel: flagLabel,
    newScreenRun: newScreenRun,
    upsertRun: upsertRun,
    setItemAnswer: setItemAnswer,
    latestCompleted: latestCompleted
  };
})();
