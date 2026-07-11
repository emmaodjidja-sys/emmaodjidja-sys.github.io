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

  window.PraxisScreenCore = {
    ANSWER_LABELS: ANSWER_LABELS,
    VERDICTS: VERDICTS,
    eqRows: eqRows,
    buildScreenItems: buildScreenItems,
    computeRedFlags: computeRedFlags,
    computeAmbers: computeAmbers,
    recommendVerdict: recommendVerdict,
    newScreenRun: newScreenRun,
    upsertRun: upsertRun,
    setItemAnswer: setItemAnswer
  };
})();
