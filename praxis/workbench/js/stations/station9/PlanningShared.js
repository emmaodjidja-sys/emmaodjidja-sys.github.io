/**
 * PlanningShared: view-agnostic helpers for the Planning / contract model, shared by the
 * evaluation-team Planning station (Station9) and the commissioner C1 Contract station
 * (CockpitContract) so the two surfaces never duplicate the money, status and quality-rubric
 * logic. Extracted verbatim from the original Station9. No-JSX React.createElement.
 * window.PlanningShared.
 *
 * Deliverables live in planning.deliverables (the single source of truth). A deliverable's
 * display title is read as (d.title || d.name || '') because the pre-1.4.0 model stored .name.
 */
(function() {
  'use strict';
  var h = React.createElement;

  // Fields that mark each of the 9 core stations complete (mirrors StationRail).
  var STATION_FIELDS = ['evaluability', 'toc', 'evaluation_matrix', 'design_recommendation',
    'sample_parameters', 'instruments', 'analysis_plan', 'report_structure', 'presentation'];
  var STATION_SHORT = ['Scoping', 'ToC', 'Matrix', 'Design', 'Sample', 'Instruments', 'Analysis', 'Report', 'Deck'];

  // Deliverable quality rubrics, TAILORED to the kind of deliverable being reviewed. A data
  // collection instrument is judged on validity, coverage and ethics, not on "validity of
  // findings"; an inception report on design and the evaluation matrix, not on conclusions.
  // Each rubric's criteria are harmonized from the Global Fund QAF, UNEG Quality Checklist and
  // OECD-DAC Quality Standards; weights sum to 1; mustPass names the criteria whose failure a
  // compensatory mean cannot excuse (flagged as a "critical gap" and used for the provisional
  // guard). All rubrics share the 1-4 SCALE below.
  var RUBRICS = {
    report: {
      key: 'report', label: 'Evaluation report',
      blurb: 'Draft or final evaluation report.',
      mustPass: ['methodology', 'evidence'],
      criteria: [
        { key: 'purpose', label: 'Clarity of purpose and scope', weight: 0.10 },
        { key: 'methodology', label: 'Robustness of methodology', weight: 0.20 },
        { key: 'evidence', label: 'Evidentiary basis and rigour', weight: 0.20 },
        { key: 'findings', label: 'Validity of findings', weight: 0.15 },
        { key: 'conclusions', label: 'Quality of conclusions', weight: 0.10 },
        { key: 'recommendations', label: 'Usefulness of recommendations', weight: 0.15 },
        { key: 'communication', label: 'Structure and writing', weight: 0.05 },
        { key: 'principles', label: 'Gender, equity and human rights', weight: 0.05 }
      ]
    },
    inception: {
      key: 'inception', label: 'Inception report / design',
      blurb: 'Inception report, evaluation design or workplan (no findings yet).',
      mustPass: ['design', 'matrix'],
      criteria: [
        { key: 'purpose_scope', label: 'Clarity of purpose, scope and evaluation questions', weight: 0.12 },
        { key: 'design', label: 'Soundness of the evaluation design and approach', weight: 0.22 },
        { key: 'matrix', label: 'Quality of the evaluation matrix (questions, indicators, methods, sources)', weight: 0.18 },
        { key: 'methods_plan', label: 'Sampling and data-collection strategy', weight: 0.15 },
        { key: 'stakeholder', label: 'Stakeholder mapping and engagement plan', weight: 0.08 },
        { key: 'workplan', label: 'Workplan, timeline and feasibility', weight: 0.10 },
        { key: 'ethics', label: 'Ethics, safeguarding and risk management', weight: 0.10 },
        { key: 'gesi', label: 'Gender, equity and human-rights integration', weight: 0.05 }
      ]
    },
    instruments: {
      key: 'instruments', label: 'Data collection tools',
      blurb: 'Questionnaires, interview and FGD guides, observation checklists, protocols.',
      mustPass: ['validity', 'coverage'],
      criteria: [
        { key: 'coverage', label: 'Alignment to the evaluation questions and indicators', weight: 0.20 },
        { key: 'validity', label: 'Construct validity (measures what it intends to)', weight: 0.20 },
        { key: 'clarity', label: 'Question clarity and non-leading wording', weight: 0.15 },
        { key: 'scales', label: 'Response options and measurement scales', weight: 0.10 },
        { key: 'translation', label: 'Translation and cultural / linguistic appropriateness', weight: 0.10 },
        { key: 'ethics', label: 'Consent, sensitivity, do-no-harm and data protection', weight: 0.12 },
        { key: 'piloting', label: 'Evidence of pilot-testing and refinement', weight: 0.08 },
        { key: 'usability', label: 'Field practicality (length, flow, skip logic)', weight: 0.05 }
      ]
    },
    fieldwork: {
      key: 'fieldwork', label: 'Data collection / fieldwork',
      blurb: 'Datasets, transcripts, field reports and fieldwork outputs.',
      mustPass: ['completeness', 'data_quality'],
      criteria: [
        { key: 'completeness', label: 'Completeness against the sampling plan (coverage, response)', weight: 0.22 },
        { key: 'data_quality', label: 'Data quality and cleaning (consistency, missingness)', weight: 0.22 },
        { key: 'documentation', label: 'Documentation and metadata (codebooks, provenance)', weight: 0.16 },
        { key: 'protocol', label: 'Adherence to protocol and field ethics', weight: 0.15 },
        { key: 'security', label: 'Data security and confidentiality', weight: 0.15 },
        { key: 'qa', label: 'Fieldwork QA (back-checks, supervision)', weight: 0.10 }
      ]
    },
    analysis: {
      key: 'analysis', label: 'Analysis / preliminary findings',
      blurb: 'Analysis outputs, emerging or preliminary findings.',
      mustPass: ['methods_fit', 'rigour'],
      criteria: [
        { key: 'methods_fit', label: 'Appropriateness of the analytical methods to the questions', weight: 0.22 },
        { key: 'rigour', label: 'Analytical rigour and transparency (triangulation)', weight: 0.20 },
        { key: 'evidence', label: 'Strength of evidence for emerging findings', weight: 0.18 },
        { key: 'interpretation', label: 'Validity of interpretation', weight: 0.15 },
        { key: 'disaggregation', label: 'Equity and gender-disaggregated analysis', weight: 0.10 },
        { key: 'limitations', label: 'Limitations acknowledged', weight: 0.15 }
      ]
    },
    dissemination: {
      key: 'dissemination', label: 'Dissemination product',
      blurb: 'Decks, policy briefs, summaries and learning products.',
      mustPass: ['accuracy', 'audience_fit'],
      criteria: [
        { key: 'audience_fit', label: 'Fitness for the target audience and intended use', weight: 0.22 },
        { key: 'accuracy', label: 'Accuracy and faithfulness to the report evidence', weight: 0.20 },
        { key: 'clarity', label: 'Clarity and accessibility of key messages', weight: 0.18 },
        { key: 'actionability', label: 'Actionability for that audience', weight: 0.15 },
        { key: 'design', label: 'Design, structure and communication quality', weight: 0.15 },
        { key: 'framing', label: 'Appropriate framing (no overclaiming)', weight: 0.10 }
      ]
    },
    generic: {
      key: 'generic', label: 'General deliverable',
      blurb: 'Any other contract deliverable.',
      mustPass: ['quality'],
      criteria: [
        { key: 'purpose', label: 'Clarity of purpose and scope', weight: 0.20 },
        { key: 'quality', label: 'Technical quality and completeness of content', weight: 0.30 },
        { key: 'usefulness', label: 'Usefulness for its intended purpose', weight: 0.25 },
        { key: 'communication', label: 'Structure and communication', weight: 0.15 },
        { key: 'compliance', label: 'Compliance with the ToR and timeliness', weight: 0.10 }
      ]
    }
  };
  // Ordered list for the rubric selector (label + one-line blurb).
  var DELIV_RUBRICS = ['report', 'inception', 'instruments', 'fieldwork', 'analysis', 'dissemination', 'generic']
    .map(function(k) { return { key: k, label: RUBRICS[k].label, blurb: RUBRICS[k].blurb }; });
  // Keyword auto-detection from a deliverable's title/type when no explicit rubric is set.
  // First match wins; order matters (instruments before report so "data collection tools"
  // does not fall through to the report rubric).
  var RUBRIC_HINTS = [
    { key: 'instruments', re: /instrument|data collection tool|questionnaire|survey tool|interview guide|kii guide|fgd guide|focus group guide|protocol|checklist/i },
    { key: 'inception', re: /inception|scoping|evaluation design|design report|work ?plan|methodology report|evaluation plan|design gate/i },
    { key: 'dissemination', re: /dissemination|deck|slide|presentation|policy brief|\bbrief\b|policy note|learning product|summary note|infographic|webinar/i },
    { key: 'fieldwork', re: /field ?work|dataset|data set|transcript|data quality|raw data|coding/i },
    { key: 'analysis', re: /prelim|emerging finding|analysis|analytic|synthesis/i },
    { key: 'report', re: /report/i }
  ];
  // The rubric that applies to a deliverable: an explicit d.rubric wins; else keyword-match the
  // title then the type; else the general evaluation-report rubric as a safe default.
  function rubricFor(d) {
    if (d && d.rubric && RUBRICS[d.rubric]) return RUBRICS[d.rubric];
    var hay = ((d && d.title) || '') + ' ' + ((d && d.type) || '');
    for (var i = 0; i < RUBRIC_HINTS.length; i++) if (RUBRIC_HINTS[i].re.test(hay)) return RUBRICS[RUBRIC_HINTS[i].key];
    // Unrecognized kinds fall back to the neutral general rubric, never to the most demanding
    // evaluation-report rubric (which would judge, say, a workshop note on "validity of findings").
    return RUBRICS.generic;
  }
  // Backward-compatible alias: the default report rubric's criteria array.
  var RUBRIC = RUBRICS.report.criteria;
  var SCALE = [
    { v: 1, label: 'Unsatisfactory', desc: 'Does not meet the standard; major rework needed' },
    { v: 2, label: 'Partially satisfactory', desc: 'Important gaps; revisions required before acceptance' },
    { v: 3, label: 'Satisfactory', desc: 'Meets the standard; minor gaps only' },
    { v: 4, label: 'Highly satisfactory', desc: 'Fully meets the standard; no or trivial gaps' }
  ];
  // Per-value colour for the score buttons, so the rubric editor uses the same band-coloured
  // control as the C2 answerability and C3 strength-of-evidence tables (one scoring vocabulary).
  var SCALE_COLOR = { 1: 'var(--red-strong)', 2: 'var(--amber-dark)', 3: 'var(--teal-ink)', 4: 'var(--green-strong)' };

  // Canonical deliverable workflow status (stored). Reconciled to the five states shared
  // with CockpitData: not_started | in_progress | submitted | accepted | revise.
  var DELIV_STATUS = {
    not_started: { label: 'Not started', badge: '' },
    in_progress: { label: 'In progress', badge: 'wb-badge-navy' },
    submitted:   { label: 'Submitted', badge: 'wb-badge-amber' },
    accepted:    { label: 'Accepted', badge: 'wb-badge-green' },
    revise:      { label: 'Revision requested', badge: 'wb-badge-red' }
  };
  var INVOICE_STATUS = {
    draft:     { label: 'Draft', badge: '' },
    submitted: { label: 'Submitted', badge: 'wb-badge-teal' },
    approved:  { label: 'Approved', badge: 'wb-badge-navy' },
    paid:      { label: 'Paid', badge: 'wb-badge-green' },
    returned:  { label: 'Returned', badge: 'wb-badge-red' }
  };
  // Invoice types. A milestone invoice is gated on its linked deliverable being accepted;
  // advance/mobilization/retainer invoices are paid outside the acceptance gate under a
  // separate authorization, so they are not locked behind a deliverable.
  var INVOICE_TYPES = [
    { key: 'milestone', label: 'Milestone', gated: true },
    { key: 'advance', label: 'Advance / mobilization', gated: false },
    { key: 'retainer', label: 'Retainer / period fee', gated: false },
    { key: 'final', label: 'Final / balance', gated: true }
  ];
  function invoiceType(iv) {
    var t = (iv && iv.type) || 'milestone';
    for (var i = 0; i < INVOICE_TYPES.length; i++) if (INVOICE_TYPES[i].key === t) return INVOICE_TYPES[i];
    return INVOICE_TYPES[0];
  }

  // ---- value helpers ------------------------------------------------------
  function money(n, cur) {
    if (n == null || isNaN(n)) return '-';
    return (cur || 'USD') + ' ' + Math.round(n).toLocaleString('en-US');
  }
  function fdate(iso) {
    if (!iso) return '-';
    try { return PraxisUtils.formatDate(iso); } catch (e) { return iso; }
  }
  function sum(arr, f) { return (arr || []).reduce(function(a, x) { return a + (f(x) || 0); }, 0); }
  // Display title for a deliverable; falls back to the pre-1.4.0 .name field.
  function delTitle(d) { return (d && (d.title || d.name)) || ''; }

  function stationDone(context) {
    return STATION_FIELDS.map(function(f) { return !!(context[f] && context[f].completed_at != null); });
  }
  // Deliverable completion % from linked workbench stations (0 linked -> null = manual).
  function deliverableProgress(context, del) {
    var ids = (del && del.station_ids) || [];
    if (!ids.length) return null;
    var done = stationDone(context);
    var n = ids.filter(function(i) { return done[i]; }).length;
    return Math.round(100 * n / ids.length);
  }

  // ---- rubric math --------------------------------------------------------
  // Resolve the criteria/mustPass to use: a passed rubric object, else the default report rubric.
  function rubricOf(rubric) {
    if (rubric && rubric.criteria) return rubric;
    return RUBRICS.report;
  }
  // Weighted mean of scored criteria within the applicable rubric, re-normalized to exclude
  // unscored ones. Scores keyed for a different rubric simply do not match and are ignored.
  function ratingMean(rating, rubric) {
    if (!rating || !rating.scores) return null;
    var wsum = 0, tot = 0;
    rubricOf(rubric).criteria.forEach(function(c) {
      var v = rating.scores[c.key];
      if (typeof v === 'number') { wsum += v * c.weight; tot += c.weight; }
    });
    if (!tot) return null;
    return wsum / tot;
  }
  // Band cut points aligned to the scale anchors: 3 = "Meets the standard", so "Satisfactory"
  // starts at the 3.0 anchor (not the old 2.75, which labelled a sub-anchor mean as meeting
  // the standard).
  function ratingBand(mean) {
    if (mean == null) return null;
    if (mean >= 3.5) return 'Highly satisfactory';
    if (mean >= 3.0) return 'Satisfactory';
    if (mean >= 2.0) return 'Partially satisfactory';
    return 'Unsatisfactory';
  }
  // True when a must-pass criterion of the applicable rubric is scored below the "meets the
  // standard" anchor. A compensatory mean can otherwise hide a fatal weakness.
  function mustPassFail(rating, rubric) {
    if (!rating || !rating.scores) return false;
    return rubricOf(rubric).mustPass.some(function(k) { var v = rating.scores[k]; return typeof v === 'number' && v < 3; });
  }
  // A rating is provisional until every must-pass (high-weight) criterion of the applicable
  // rubric is scored AND enough of the rubric's weight has been scored (>= 0.8), so a confident
  // band can never rest on a small slice of criteria. Before that the headline band is shown as
  // "Provisional".
  function ratingProvisional(rating, rubric) {
    if (!rating || !rating.scores) return true;
    var rb = rubricOf(rubric);
    if (rb.mustPass.some(function(k) { return typeof rating.scores[k] !== 'number'; })) return true;
    var scoredWeight = 0;
    rb.criteria.forEach(function(c) { if (typeof rating.scores[c.key] === 'number') scoredWeight += c.weight; });
    return scoredWeight < 0.8;
  }
  function bandBadge(band) {
    if (band === 'Highly satisfactory') return 'wb-badge-green';
    if (band === 'Satisfactory') return 'wb-badge-teal';
    if (band === 'Partially satisfactory') return 'wb-badge-amber';
    if (band === 'Unsatisfactory') return 'wb-badge-red';
    return '';
  }
  // Short key per band for the quality-mark meter/word classes (kept distinct from the
  // status-badge colors so a quality band is never confused with a workflow status).
  function bandKey(band) {
    if (band === 'Highly satisfactory') return 'high';
    if (band === 'Satisfactory') return 'sat';
    if (band === 'Partially satisfactory') return 'part';
    if (band === 'Unsatisfactory') return 'unsat';
    return '';
  }
  // How many of the applicable rubric's criteria were actually scored (mean is renormalized
  // over these).
  function ratingScored(rating, rubric) {
    if (!rating || !rating.scores) return 0;
    return rubricOf(rubric).criteria.filter(function(c) { return typeof rating.scores[c.key] === 'number'; }).length;
  }

  // ---- view atoms ---------------------------------------------------------
  function statusPill(statusMap, key) {
    var s = statusMap[key] || { label: key, badge: '' };
    return h('span', { className: 'wb-badge ' + (s.badge || ''), style: s.badge ? null : { background: 'var(--surface-muted)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' } }, s.label);
  }
  function progressBar(pct, tone) {
    var fill = tone || (pct >= 100 ? 'high' : pct >= 50 ? 'mid' : 'low');
    return h('div', { className: 'wb-plan-bar' },
      h('div', { className: 'wb-plan-bar-fill wb-plan-bar-fill--' + fill, style: { width: Math.max(0, Math.min(100, pct || 0)) + '%' } }));
  }
  function statTile(label, value, sub) {
    return h('div', { className: 'wb-plan-stat' },
      h('div', { className: 'wb-plan-stat-value' }, value),
      h('div', { className: 'wb-plan-stat-label' }, label),
      sub ? h('div', { className: 'wb-plan-stat-sub' }, sub) : null);
  }
  function contractField(label, value) {
    return h('div', { className: 'wb-plan-contract-field' },
      h('div', { className: 'wb-plan-contract-label' }, label),
      h('div', { className: 'wb-plan-contract-value' }, value || '-'));
  }

  // Compact quality mark for the deliverables table. A discrete 4-tick meter (its fill length
  // encodes the 1-4 weighted mean), the value, the band word, and a criteria-count sub-line
  // that exposes partial ratings and the rated-on date for the audit trail. Deliberately NOT a
  // .wb-badge pill, so an editorial quality band is never mistaken for a workflow status. The
  // empty ('Not rated') state keeps the column slot identical across un-rated rows.
  function qualityMark(d) {
    var rating = d && d.rating;
    var rubric = rubricFor(d);
    var tag = h('span', { className: 'wb-qual-rubric', title: 'Assessment rubric: ' + rubric.label }, rubric.label);
    var mean = ratingMean(rating, rubric);
    if (mean == null) {
      return h('div', { className: 'wb-qual-wrap' },
        h('span', { className: 'wb-qual-empty', 'aria-label': 'Quality: not rated yet on the ' + rubric.label + ' rubric' },
          h('span', { className: 'wb-qmeter wb-qmeter--empty' }, h('span', { className: 'wb-qmeter-ticks' })),
          'Not rated'),
        tag);
    }
    var band = ratingBand(mean);
    var key = bandKey(band);
    var total = rubric.criteria.length;
    var scored = ratingScored(rating, rubric);
    var partial = scored < total;
    var provisional = ratingProvisional(rating, rubric);
    var critFail = mustPassFail(rating, rubric);
    // Non-compensatory gate: a must-pass criterion below the standard caps the band so strong
    // criteria elsewhere cannot average away a fatal weakness. The mean/number are still shown.
    if (critFail && !provisional && (band === 'Satisfactory' || band === 'Highly satisfactory')) {
      band = 'Partially satisfactory';
      key = 'part';
    }
    // Suppress a confident band word until the two high-weight criteria are scored; a mean
    // built from low-weight criteria alone is not a defensible quality verdict.
    var bandLabel = provisional ? 'Provisional' : band;
    var subText = scored + ' of ' + total + ' criteria'
      + (provisional ? ' · provisional' : '')
      + (rating && rating.rated_at ? ' · rated ' + fdate(rating.rated_at) : '')
      + (rating && rating.rated_by ? ' by ' + rating.rated_by : '');
    return h('div', { className: 'wb-qual-wrap' },
      h('span', { className: 'wb-qual', role: 'img',
        'aria-label': 'Quality: ' + bandLabel + ', ' + mean.toFixed(1) + ' out of 4, weighted mean of ' + scored + ' of ' + total + ' criteria'
          + (critFail ? ', a critical criterion is below the standard' : '') },
        h('span', { className: 'wb-qmeter' },
          h('span', { className: 'wb-qmeter-fill wb-qmeter-fill--' + (provisional ? 'prov' : key), style: { width: (mean / 4 * 100) + '%' } }),
          h('span', { className: 'wb-qmeter-ticks' })),
        h('span', { className: 'wb-qual-num' }, mean.toFixed(1), h('span', { className: 'wb-qual-of' }, '/4')),
        h('span', { className: 'wb-qual-band wb-qual-band--' + (provisional ? 'prov' : key) }, bandLabel),
        critFail ? h('span', { className: 'wb-qual-flag', title: 'A must-pass criterion for this rubric is below the standard' }, 'critical gap') : null),
      h('span', { className: 'wb-qual-sub' + (partial || critFail ? ' wb-qual-sub--warn' : '') }, subText),
      tag);
  }

  // Quality rubric editor for one deliverable, using the rubric TAILORED to its kind. api must
  // expose setRating(id, key, value) and setRatingComment(id, comment); optionally setRubric(id,
  // rubricKey) to render a rubric override selector. The caller owns how those persist.
  function ratingPanel(d, api) {
    var scores = (d.rating && d.rating.scores) || {};
    var rubric = rubricFor(d);
    var selector = (api && api.setRubric)
      ? h('div', { className: 'wb-plan-rubric-pick' },
          h('label', { className: 'wb-cm-cfield-label', htmlFor: 'rubric-' + d.id }, 'Assessment rubric'),
          h('select', { id: 'rubric-' + d.id, className: 'wb-input wb-cm-select', value: rubric.key,
            'aria-label': 'Assessment rubric for this deliverable',
            onChange: function(e) { api.setRubric(d.id, e.target.value); } },
            DELIV_RUBRICS.map(function(r) { return h('option', { key: r.key, value: r.key }, r.label); })),
          h('span', { className: 'wb-plan-rubric-blurb' }, rubric.blurb))
      : h('div', { className: 'wb-plan-rubric-blurb', style: { marginBottom: 8 } }, 'Rubric: ' + rubric.label);
    return h('div', { className: 'wb-plan-rubric' },
      selector,
      h('table', { className: 'wb-table wb-cm-table wb-plan-rubric-table' },
        h('thead', null, h('tr', null,
          h('th', null, 'Criterion'),
          h('th', { className: 'wb-th--center', style: { minWidth: 172 } }, 'Score'))),
        h('tbody', null, rubric.criteria.map(function(c) {
          var must = rubric.mustPass.indexOf(c.key) >= 0;
          return h('tr', { key: c.key },
            h('td', null, c.label, must ? h('span', { className: 'wb-plan-rubric-must', title: 'Must-pass criterion' }, 'must-pass') : null),
            h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-soe' },
              SCALE.map(function(s) {
                var on = scores[c.key] === s.v;
                return h('button', { key: s.v, type: 'button',
                  className: 'wb-cm-soe-btn' + (on ? ' wb-cm-soe-btn--on' : ''),
                  style: on ? { background: SCALE_COLOR[s.v], borderColor: 'transparent', color: '#fff' } : null,
                  title: s.v + ' - ' + s.label + ': ' + s.desc,
                  'aria-label': c.label + ': ' + s.label,
                  'aria-pressed': on ? 'true' : 'false',
                  onClick: function() { api.setRating(d.id, c.key, s.v); } }, String(s.v));
              }))));
        }))),
      h('div', { className: 'wb-plan-rubric-scale' }, SCALE.map(function(s) { return h('span', { key: s.v, className: 'wb-plan-rubric-scale-item' }, s.v + ' ' + s.label); })),
      h('textarea', { className: 'wb-input wb-plan-rubric-comment', rows: 2, placeholder: 'Overall comment on quality (optional)',
        defaultValue: (d.rating && d.rating.comment) || '',
        onBlur: function(e) { api.setRatingComment(d.id, e.target.value); } }));
  }

  window.PlanningShared = {
    STATION_FIELDS: STATION_FIELDS, STATION_SHORT: STATION_SHORT,
    RUBRIC: RUBRIC, RUBRICS: RUBRICS, DELIV_RUBRICS: DELIV_RUBRICS, rubricFor: rubricFor,
    SCALE: SCALE, DELIV_STATUS: DELIV_STATUS, INVOICE_STATUS: INVOICE_STATUS,
    INVOICE_TYPES: INVOICE_TYPES, invoiceType: invoiceType,
    money: money, fdate: fdate, sum: sum, delTitle: delTitle,
    stationDone: stationDone, deliverableProgress: deliverableProgress,
    ratingMean: ratingMean, ratingBand: ratingBand, bandBadge: bandBadge,
    mustPassFail: mustPassFail, ratingProvisional: ratingProvisional,
    bandKey: bandKey, ratingScored: ratingScored, qualityMark: qualityMark,
    statusPill: statusPill, progressBar: progressBar, statTile: statTile,
    contractField: contractField, ratingPanel: ratingPanel
  };
})();
