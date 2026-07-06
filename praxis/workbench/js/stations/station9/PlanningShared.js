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

  // Deliverable quality rubric: 8 criteria harmonized across the Global Fund QAF,
  // UNEG Quality Checklist and OECD-DAC Quality Standards. Weights sum to 1.
  var RUBRIC = [
    { key: 'purpose', label: 'Clarity of purpose and scope', weight: 0.10 },
    { key: 'methodology', label: 'Robustness of methodology', weight: 0.20 },
    { key: 'evidence', label: 'Strength of evidence', weight: 0.20 },
    { key: 'findings', label: 'Validity of findings', weight: 0.15 },
    { key: 'conclusions', label: 'Quality of conclusions', weight: 0.10 },
    { key: 'recommendations', label: 'Usefulness of recommendations', weight: 0.15 },
    { key: 'communication', label: 'Structure and writing', weight: 0.05 },
    { key: 'principles', label: 'Gender, equity and human rights', weight: 0.05 }
  ];
  var SCALE = [
    { v: 1, label: 'Unsatisfactory', desc: 'Does not meet the standard; major rework needed' },
    { v: 2, label: 'Partially satisfactory', desc: 'Important gaps; revisions required before acceptance' },
    { v: 3, label: 'Satisfactory', desc: 'Meets the standard; minor gaps only' },
    { v: 4, label: 'Highly satisfactory', desc: 'Fully meets the standard; no or trivial gaps' }
  ];

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
    paid:      { label: 'Paid', badge: 'wb-badge-green' }
  };

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
  // Weighted mean of scored criteria, re-normalized to exclude unscored ones.
  function ratingMean(rating) {
    if (!rating || !rating.scores) return null;
    var wsum = 0, tot = 0;
    RUBRIC.forEach(function(c) {
      var v = rating.scores[c.key];
      if (typeof v === 'number') { wsum += v * c.weight; tot += c.weight; }
    });
    if (!tot) return null;
    return wsum / tot;
  }
  function ratingBand(mean) {
    if (mean == null) return null;
    if (mean >= 3.5) return 'Highly satisfactory';
    if (mean >= 2.75) return 'Satisfactory';
    if (mean >= 2.0) return 'Partially satisfactory';
    return 'Unsatisfactory';
  }
  function bandBadge(band) {
    if (band === 'Highly satisfactory') return 'wb-badge-green';
    if (band === 'Satisfactory') return 'wb-badge-teal';
    if (band === 'Partially satisfactory') return 'wb-badge-amber';
    if (band === 'Unsatisfactory') return 'wb-badge-red';
    return '';
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

  // Quality rubric editor for one deliverable. api must expose setRating(id, key, value)
  // and setRatingComment(id, comment); the caller owns how those persist.
  function ratingPanel(d, api) {
    var scores = (d.rating && d.rating.scores) || {};
    return h('div', { className: 'wb-plan-rubric' },
      h('table', { className: 'wb-table wb-plan-rubric-table' },
        h('thead', null, h('tr', null,
          h('th', null, 'Criterion'),
          SCALE.map(function(s) { return h('th', { key: s.v, className: 'wb-th--center', title: s.label }, String(s.v)); }))),
        h('tbody', null, RUBRIC.map(function(c) {
          return h('tr', { key: c.key },
            h('td', null, c.label),
            SCALE.map(function(s) {
              var on = scores[c.key] === s.v;
              return h('td', { key: s.v, className: 'wb-th--center' },
                h('button', { className: 'wb-plan-score' + (on ? ' wb-plan-score--on' : ''), title: s.label,
                  'aria-label': c.label + ': ' + s.label, onClick: function() { api.setRating(d.id, c.key, s.v); } },
                  on ? PraxisIcons.check(14) : ''));
            }));
        }))),
      h('div', { className: 'wb-plan-rubric-scale' }, SCALE.map(function(s) { return h('span', { key: s.v, className: 'wb-plan-rubric-scale-item' }, s.v + ' ' + s.label); })),
      h('textarea', { className: 'wb-input wb-plan-rubric-comment', rows: 2, placeholder: 'Overall comment on quality (optional)',
        defaultValue: (d.rating && d.rating.comment) || '',
        onBlur: function(e) { api.setRatingComment(d.id, e.target.value); } }));
  }

  window.PlanningShared = {
    STATION_FIELDS: STATION_FIELDS, STATION_SHORT: STATION_SHORT,
    RUBRIC: RUBRIC, SCALE: SCALE, DELIV_STATUS: DELIV_STATUS, INVOICE_STATUS: INVOICE_STATUS,
    money: money, fdate: fdate, sum: sum, delTitle: delTitle,
    stationDone: stationDone, deliverableProgress: deliverableProgress,
    ratingMean: ratingMean, ratingBand: ratingBand, bandBadge: bandBadge,
    statusPill: statusPill, progressBar: progressBar, statTile: statTile,
    contractField: contractField, ratingPanel: ratingPanel
  };
})();
