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
  // timing:window) get NO key here rather than a fabricated one. A signal is also
  // worth only as much as its DIRECTION allows: a `found` is a detection the scanner
  // earned, a `not_found` is an absence it cannot earn in any language, and the panel
  // treats the two as the different things they are. See the long note below emit.
  //
  // PRIVACY: the pasted report is NEVER stored. prescan takes the text as an
  // argument, derives signals from it, and returns only those signals plus
  // counts. The only body text that survives is a bounded evidence snippet
  // (<= EVIDENCE_MAX_CHARS + 3 chars) per signal, so callers can persist the
  // whole result without persisting the report.
  var MAX_PRESCAN_CHARS = 1500000;   // refuse pastes above this; guards the O(n) scans
  var SHORT_WORDS = 500;             // below this a "report" is probably a fragment
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

  // ---- what a signal is worth, by DIRECTION --------------------------------------
  // Every pattern in this file is an English or French word, so the scan matches
  // English and French keywords and nothing else. That makes the DIRECTION of a
  // signal decisive.
  //
  // `found` and `weak` report what the scanner SAW. They are EARNED on any text that
  // carries the word, whatever the language or the script around it: the word was
  // there, and a reviewer can check that in one glance. So they are safe to act on,
  // and the panel keeps their one-click confirm.
  //
  // `not_found` reports what the scanner DID NOT SEE, and NOTHING in this file can
  // earn that. It is weak even in perfect English: it means "my regex did not match a
  // heading", never "the report has no limitations section". A report whose section is
  // titled "Caveats and what we could not do", or that discusses its limitations in
  // prose under no heading at all, produces a not_found that is simply WRONG. In a
  // language the patterns do not cover it is worse: a fact about the SCANNER wearing
  // the clothes of a fact about the REPORT.
  //
  // WHY THERE IS NO LANGUAGE GATE HERE ANY MORE. This file spent three rounds trying
  // to guess, from the text alone, whether the scanner had actually READ the document,
  // so that an absence could be trusted: a Latin-script share, then a mixed-script
  // suppression, then an English/French function-word density floor. Each closed its
  // own fixture and each was defeated by the next class of input. A GERMAN report
  // carrying the ordinary English cover page, acronym list, reference list and ToR
  // annex cleared the density floor (0.0965) and collected three critical red flags;
  // so did Dutch and Italian; pure TAGALOG scored 0.1208 on collisions alone (its
  // particle "sa" is also French, "at" is also English); and SPANISH and PORTUGUESE,
  // the two languages the floor was built to catch, reopened the moment the report
  // carried an English reference list and ToR annex, because a density measured over
  // the WHOLE PASTE answers "is there English anywhere in this document", not "is the
  // BODY English". The guess was not badly tuned. It was the wrong kind of thing:
  // "did I understand this text" is not something a keyword scanner can know.
  //
  // So the DEPENDENCY was removed instead of the guess being improved a fourth time.
  // An absence is now NON-ACTIONABLE BY CONSTRUCTION. FirstReview renders a not_found
  // as a neutral informational note that says plainly what a keyword scan cannot see,
  // and it offers NO one-click confirm on it, in any language and in any regime: the
  // signal map in machineChip gives not_found no answer to record, so no code path
  // exists that could offer one. tests/firstreview.privacy.test.js pins that against
  // the REAL rendered panel in English, French, Spanish, German, Tagalog, a
  // mixed-script report and a pure non-Latin one. An absence can therefore only ever
  // become an answer through the reviewer's own judgment on the ordinary answer
  // buttons, which is exactly where an absence claim belongs.
  //
  // WHAT SURVIVES: ONE gate, on the one thing the scanner CAN know about itself.
  // Whether there is any text here for a Latin-script keyword scan to work on at all.
  // Below LATIN_MIN_SHARE there is not, and emitting nothing at all for a document the
  // scan plainly cannot read is still correct and still cheap: a page of Arabic, or a
  // page of figures, would otherwise produce a wall of "no keyword match" notes, and
  // that is noise, not information. Above it, all three signal values are emitted, and
  // it is the PANEL, not this gate, that makes the absences inert.
  //
  // WHERE THAT BOUNDARY SITS. A share of the NON-SPACE CHARACTERS that are Latin
  // letters. Measured on real pastes: English prose 0.98, French with diacritics 0.98,
  // an English section heavy with tables 0.64, a numeric-heavy English annex 0.40. On
  // the other side: a pure Arabic body 0.00, Arabic with an English cover page 0.03,
  // the same plus a list of acronyms (WHO, UNICEF, MoH) 0.07, the same plus an English
  // reference list 0.11. Nothing real lives between 0.10 and 0.40, so the boundary
  // belongs inside that empty band and near its top: 0.35 admits the whole readable
  // range and rejects the whole mixed range, with margin on both sides.
  //
  // REMOVED, DELIBERATELY, AND NOT TO BE RE-ADDED: the other-script share
  // (mixed_script) and the EN/FR function-word density with its marker lists and its
  // shared-word subtraction (unknown_language). Both existed for ONE purpose: to
  // decide whether an absence claim was safe to assert. No safety rides on that
  // question any more, and a heuristic kept "just in case" is a heuristic the next
  // reader will re-load with safety duty. If a language heuristic ever returns to this
  // file it may only change HOW A NOTE IS WORDED. It may never gate what is emitted,
  // and it may never be the thing standing between a keyword scan and a red flag.
  var LATIN_MIN_SHARE = 0.35;   // Latin letters / non-space chars: below this, nothing to read

  // THE ONE CHOKEPOINT. Readability is decided here and NOWHERE else. The build before
  // this one returned a verdict from this function AND recomputed the same condition
  // inline at the emit site: one rule written twice, and two places for it to drift
  // apart. Takes the NORMALISED text (lowercased, combining marks stripped), so an
  // accented French report counts as Latin and an Arabic one does not.
  function readability(norm) {
    var toks = norm.match(/[a-z0-9]+/g) || [];
    var letters = (norm.match(/[a-z]/g) || []).length;
    var solid = norm.replace(/\s+/g, '').length;
    var share = solid ? letters / solid : 0;
    // Digits alone never make a text readable, and an empty paste is not readable
    // either. Both fall in with the wrong-script case.
    return {
      words: toks.length,
      latin_share: share,
      readable: toks.length > 0 && letters > 0 && share >= LATIN_MIN_SHARE
    };
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

    // THE ONE GATE, read from THE ONE CHOKEPOINT. There is too little Latin-script
    // text here for a keyword scan to work on, so it says nothing about the report at
    // all. What the caller must SAY about this is a statement about the SCAN ("it did
    // not find enough text it could read"), never about the text ("that is not
    // English"): a nine-tenths-figures English results framework lands here too, and
    // telling that reviewer their English is not English would be false.
    if (!read.readable) {
      return { ok: true, signals: {},
        meta: { chars: text.length, words: words, short: words < SHORT_WORDS,
          unreadable: true, latin_share: read.latin_share, detections: 0, absences: 0 } };
    }

    // The one door every signal walks through, from every family. There is NO
    // suppression rule here any more, and there must never be one again: an absence is
    // made harmless in the PANEL, by construction (a not_found is a neutral note with
    // no one-click confirm, in every language and every regime), not by a guess made
    // here about whether the scanner understood the document. Three guesses of that
    // kind have already been tried and beaten; see the note above. emit is kept as a
    // function because it is also where the meta counts are taken: `detections` is how
    // many signals the scan EARNED, `absences` how many it merely failed to match, and
    // the panel words its note from the pair without needing to know anything about
    // language.
    var detections = 0, absences = 0;
    function emit(id, sig) {
      if (!sig) return;
      if (sig.signal === 'not_found') absences += 1; else detections += 1;
      signals[id] = sig;
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
        emit(itemId, { signal: 'found', evidence: snippet(lines[headingIdx]) });
      } else if (re.test(norm)) {
        emit(itemId, { signal: 'weak', evidence: 'Mentioned in body text but no section heading detected.' });
      } else {
        // Worded as a fact about the SCAN, not about the report. "No matching heading
        // or mention detected" was already close to that; "no keyword match" closes
        // the gap, because it cannot be misread as "the report has no methods
        // section". The panel prints the rest of the caveat next to it.
        emit(itemId, { signal: 'not_found', evidence: 'No keyword match for this section.' });
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
      emit('eq:' + r.eq_id, { signal: sig, evidence: ev, hits: hits, total: toks.length });
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
        var seen = judged - missing.length - proseOnly.length;
        var frac = (judged - missing.length) / judged;
        var ssig, sev;
        if (!missing.length && !proseOnly.length) {
          ssig = 'found';
          sev = 'All agreed section titles detected as headings.';
        } else {
          ssig = frac >= STRUCTURE_WEAK_FRAC ? 'weak' : 'not_found';
          // structure:agreed is the ONE signal that can carry an absence claim inside
          // a DETECTION: a partial match is a 'weak', which keeps its one-click
          // "I checked. Record Partial". So the sentence itself has to be honest,
          // whatever the signal value it rides on. It used to read "Missing:
          // Methodology.", which is an assertion about the REPORT that a keyword scan
          // cannot make: a section called "Our approach" is not missing, and a section
          // written in a language the scan does not read is not missing either. It
          // states what it SAW first, and then names the titles its keywords did not
          // match, as a fact about the keywords.
          var parts = ['Detected as headings: ' + seen + ' of ' + judged + ' agreed section titles.'];
          if (proseOnly.length) parts.push('In body text but not as a heading: ' + proseOnly.join('; ') + '.');
          if (missing.length) parts.push('No keyword match for: ' + missing.join('; ') + '.');
          sev = parts.join(' ');
        }
        emit('structure:agreed', { signal: ssig, evidence: snippet(sev) });
      }
    }

    // Sample numbers: n= style figures against the planned n, within tolerance.
    var plannedN = parseInt((((context || {}).sample_parameters || {}).result || {}).primary, 10);
    if (!isNaN(plannedN) && plannedN > 0) {
      var found = [], m;
      var reN = /\bn\s*=\s*([0-9][0-9,]{0,9})/gi;
      while ((m = reN.exec(text)) !== null) found.push(parseInt(m[1].replace(/,/g, ''), 10));
      var close = found.filter(function(n) { return Math.abs(n - plannedN) / plannedN <= SAMPLE_TOLERANCE; });
      emit('sample:achieved', {
        signal: close.length ? 'found' : (found.length ? 'weak' : 'not_found'),
        evidence: snippet(found.length
          ? 'Sample figures found: ' + found.slice(0, 5).join(', ') + '. Planned: ' + plannedN + '.'
          : 'No n= style sample figure detected. Planned: ' + plannedN + '.')
      });
    }

    // detections and absences are COUNTS of signals, never content. The panel uses
    // them for one honesty nicety and nothing else: a scan that matched NOTHING
    // anywhere (detections 0, absences > 0) is a scan that has told the reviewer
    // nothing, whether because the report really lacks those sections or because it is
    // in a language or a vocabulary these patterns do not cover, and the panel says so
    // rather than presenting a wall of empty notes as if it were a result. It is a
    // WORDING input, not a safety gate: nothing is suppressed on the strength of it,
    // and nothing may ever be.
    return { ok: true, signals: signals,
      meta: { chars: text.length, words: words, short: words < SHORT_WORDS,
        unreadable: false, latin_share: read.latin_share,
        detections: detections, absences: absences } };
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
