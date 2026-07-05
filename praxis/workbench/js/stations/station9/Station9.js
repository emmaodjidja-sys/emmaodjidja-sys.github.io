/**
 * Station 9 - Planning (optional).
 * Manages the evaluation as a contract: budget, deliverables (completion tied to
 * workbench station progress), invoices, and commissioner quality ratings.
 * Two role views: Evaluation Team and Commissioner.
 * No-JSX React.createElement, follows workbench house style. window.Station9.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;

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

  var DELIV_STATUS = {
    not_started: { label: 'Not started', dot: 'draft', badge: '' },
    in_progress: { label: 'In progress', dot: 'partial', badge: 'wb-badge-navy' },
    submitted:   { label: 'Submitted', dot: 'partial', badge: 'wb-badge-teal' },
    accepted:    { label: 'Accepted', dot: 'complete', badge: 'wb-badge-green' },
    revise:      { label: 'Revision requested', dot: 'partial', badge: 'wb-badge-amber' }
  };
  var INVOICE_STATUS = {
    draft:     { label: 'Draft', badge: '' },
    submitted: { label: 'Submitted', badge: 'wb-badge-teal' },
    approved:  { label: 'Approved', badge: 'wb-badge-navy' },
    paid:      { label: 'Paid', badge: 'wb-badge-green' }
  };
  var BUDGET_CATEGORIES = ['Personnel', 'Travel and DSA', 'Data collection', 'Translation', 'Dissemination', 'Management and overhead', 'Contingency'];

  // ---- helpers ------------------------------------------------------------
  function defaultPlanning() {
    return { contract: {}, budget_lines: [], deliverables: [], invoices: [], completed_at: null };
  }
  function money(n, cur) {
    if (n == null || isNaN(n)) return '-';
    var s = Math.round(n).toLocaleString('en-US');
    return (cur || 'USD') + ' ' + s;
  }
  function fdate(iso) {
    if (!iso) return '-';
    try { return PraxisUtils.formatDate(iso); } catch (e) { return iso; }
  }
  function stationDone(context) {
    return STATION_FIELDS.map(function(f) { return !!(context[f] && context[f].completed_at != null); });
  }
  // Deliverable completion % from linked workbench stations (0 linked -> null = manual).
  function deliverableProgress(context, del) {
    var ids = del.station_ids || [];
    if (!ids.length) return null;
    var done = stationDone(context);
    var n = ids.filter(function(i) { return done[i]; }).length;
    return Math.round(100 * n / ids.length);
  }
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
  function sum(arr, f) { return arr.reduce(function(a, x) { return a + (f(x) || 0); }, 0); }

  // ---- small view atoms ---------------------------------------------------
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

  // ========================================================================
  function Station9(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context;
    var planning = context.planning || defaultPlanning();
    var contract = planning.contract || {};
    var cur = contract.currency || 'USD';

    var vw = React.useState('evaluator'), view = vw[0], setView = vw[1];
    var rr = React.useState(null), ratingId = rr[0], setRatingId = rr[1]; // deliverable id being rated

    function save(next) {
      dispatch({ type: AT.SAVE_STATION, stationId: 9, payload: { planning: next } });
    }
    function toast(msg, t) {
      dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: t || 'success' });
    }
    function patchDeliverable(id, patch, quiet, msg) {
      var next = Object.assign({}, planning, {
        deliverables: (planning.deliverables || []).map(function(d) { return d.id === id ? Object.assign({}, d, patch) : d; }),
        completed_at: planning.completed_at || new Date().toISOString()
      });
      save(next);
      if (!quiet) toast(msg || 'Planning updated');
    }
    function patchInvoice(id, patch, msg) {
      var next = Object.assign({}, planning, {
        invoices: (planning.invoices || []).map(function(iv) { return iv.id === id ? Object.assign({}, iv, patch) : iv; }),
        completed_at: planning.completed_at || new Date().toISOString()
      });
      save(next);
      toast(msg || 'Invoice updated');
    }
    function setRating(id, criterionKey, value) {
      var del = (planning.deliverables || []).filter(function(d) { return d.id === id; })[0];
      var scores = Object.assign({}, (del && del.rating && del.rating.scores) || {});
      scores[criterionKey] = value;
      var rating = Object.assign({}, del && del.rating, { scores: scores, rated_at: new Date().toISOString() });
      patchDeliverable(id, { rating: rating }, true);
    }
    function setRatingComment(id, comment) {
      var del = (planning.deliverables || []).filter(function(d) { return d.id === id; })[0];
      var rating = Object.assign({}, del && del.rating, { comment: comment, rated_at: new Date().toISOString() });
      patchDeliverable(id, { rating: rating }, true);
    }

    // gate: no planning data yet
    var hasData = (planning.deliverables && planning.deliverables.length) || (planning.budget_lines && planning.budget_lines.length);

    // ---- custom header (Shell suppresses StationHeader/SummaryBar for index 9) ----
    var header = h('div', { className: 'wb-panel-header wb-plan-header' },
      h('div', null,
        h('div', { className: 'wb-station-label' }, 'OPTIONAL STATION'),
        h('h2', { className: 'wb-station-title' }, 'Planning and Contract Management'),
        h('p', { className: 'wb-station-desc' }, 'Budget, deliverables, invoices and quality review. Deliverable completion tracks your workbench progress.')),
      h('div', { className: 'wb-plan-viewtabs', role: 'tablist', 'aria-label': 'Planning view' },
        [['evaluator', 'Evaluation Team'], ['commissioner', 'Commissioner']].map(function(pair) {
          var active = view === pair[0];
          return h('button', { key: pair[0], role: 'tab', 'aria-selected': active ? 'true' : 'false',
            className: 'wb-plan-viewtab' + (active ? ' wb-plan-viewtab--active' : ''),
            onClick: function() { setView(pair[0]); } }, pair[1]);
        })));

    if (!hasData) {
      return h('div', { className: 'wb-plan' }, header,
        h(SectionCard, { title: 'Planning', bodyType: 'empty' },
          h('div', { className: 'wb-station-empty' },
            h('div', { className: 'wb-station-empty-title' }, 'No planning data yet'),
            h('div', { className: 'wb-station-empty-desc' }, 'Open a worked example to see a complete budget, deliverable schedule, invoices and quality ratings, or open a saved .praxis project.'))));
    }

    var body = view === 'evaluator'
      ? evaluatorView(context, planning, cur, { patchDeliverable: patchDeliverable, toast: toast })
      : commissionerView(context, planning, cur, { patchDeliverable: patchDeliverable, patchInvoice: patchInvoice, setRating: setRating, setRatingComment: setRatingComment, ratingId: ratingId, setRatingId: setRatingId });

    return h('div', { className: 'wb-plan' }, header, body);
  }

  // ======================= EVALUATION TEAM VIEW ===========================
  function evaluatorView(context, planning, cur, api) {
    var contract = planning.contract || {};
    var dels = planning.deliverables || [];
    var lines = planning.budget_lines || [];
    var invoices = planning.invoices || [];

    var accepted = dels.filter(function(d) { return d.status === 'accepted'; }).length;
    var budgetTotal = contract.total_budget || sum(lines, function(l) { return l.amount; });
    var paid = sum(invoices.filter(function(i) { return i.status === 'paid'; }), function(i) { return i.amount; });
    // overall completion = mean of deliverable progress (station-linked) or accepted share
    var progs = dels.map(function(d) { var p = deliverableProgress(context, d); return p == null ? (d.status === 'accepted' ? 100 : 0) : p; });
    var overall = progs.length ? Math.round(sum(progs, function(x) { return x; }) / progs.length) : 0;
    var upcoming = dels.filter(function(d) { return d.status !== 'accepted' && d.due_date; }).sort(function(a, b) { return a.due_date < b.due_date ? -1 : 1; })[0];

    var summary = h('div', { className: 'wb-plan-stats' },
      statTile('Overall completion', overall + '%', null),
      statTile('Deliverables accepted', accepted + ' / ' + dels.length, null),
      statTile('Contract value', money(budgetTotal, cur), null),
      statTile('Paid to date', money(paid, cur), Math.round(budgetTotal ? 100 * paid / budgetTotal : 0) + '% of value'),
      statTile('Next deadline', upcoming ? fdate(upcoming.due_date) : 'None', upcoming ? upcoming.code : null));

    var contractStrip = h('div', { className: 'wb-plan-contract' },
      contractField('Commissioner', contract.commissioner),
      contractField('Evaluation team', contract.evaluator),
      contractField('Reference', contract.reference),
      contractField('Period', (fdate(contract.start_date) + ' to ' + fdate(contract.end_date))));

    // deliverables table
    var delTable = h(SectionCard, { title: 'Deliverables', badge: dels.length + ' items' },
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-plan-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Deliverable'),
            h('th', null, 'Due'),
            h('th', null, 'Linked stations'),
            h('th', { style: { minWidth: 120 } }, 'Completion'),
            h('th', null, 'Status'),
            h('th', { className: 'wb-th--center' }, 'Payment'),
            h('th', { className: 'wb-th--center' }, 'Action'))),
          h('tbody', null, dels.map(function(d) {
            var p = deliverableProgress(context, d);
            var pct = p == null ? (d.status === 'accepted' ? 100 : 0) : p;
            var canSubmit = (d.status === 'not_started' || d.status === 'in_progress' || d.status === 'revise') && pct >= 100;
            return h('tr', { key: d.id },
              h('td', null, h('div', { className: 'wb-plan-del-title' }, d.title),
                d.description ? h('div', { className: 'wb-plan-del-desc' }, d.description) : null),
              h('td', { className: 'wb-td--meta' }, fdate(d.due_date)),
              h('td', null, h('div', { className: 'wb-plan-chips' },
                (d.station_ids || []).length
                  ? (d.station_ids).map(function(i) {
                      var done = stationDone(context)[i];
                      return h('span', { key: i, className: 'wb-plan-chip' + (done ? ' wb-plan-chip--done' : '') }, i + ' ' + STATION_SHORT[i]);
                    })
                  : h('span', { className: 'wb-plan-del-desc' }, 'Manual'))),
              h('td', null, h('div', { className: 'wb-plan-prog' }, progressBar(pct), h('span', { className: 'wb-plan-prog-num' }, pct + '%'))),
              h('td', null, statusPill(DELIV_STATUS, d.status)),
              h('td', { className: 'wb-td--num wb-th--center' }, (d.payment_percent != null ? d.payment_percent + '%' : '-')),
              h('td', { className: 'wb-th--center' },
                canSubmit
                  ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { api.patchDeliverable(d.id, { status: 'submitted', submitted_at: new Date().toISOString() }, false, 'Submitted ' + d.code + ' to commissioner'); } }, 'Submit')
                  : (d.status === 'not_started'
                      ? h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { api.patchDeliverable(d.id, { status: 'in_progress' }, false, 'Marked ' + d.code + ' in progress'); } }, 'Start')
                      : h('span', { className: 'wb-plan-del-desc' }, d.submitted_at ? fdate(d.submitted_at) : ''))));
          })))));

    // budget table
    var budgetRows = lines.map(function(l) {
      return h('tr', { key: l.id },
        h('td', null, l.category),
        h('td', null, h('div', { className: 'wb-plan-del-title' }, l.role || l.description),
          (l.role && l.description) ? h('div', { className: 'wb-plan-del-desc' }, l.description) : null),
        h('td', { className: 'wb-td--num wb-th--center' }, l.quantity != null ? (l.quantity + (l.unit ? ' ' + l.unit : '')) : '-'),
        h('td', { className: 'wb-td--num wb-th--center' }, l.rate != null ? money(l.rate, cur) : '-'),
        h('td', { className: 'wb-td--num wb-th--center' }, money(l.amount, cur)),
        h('td', { className: 'wb-td--num wb-th--center' }, budgetTotal ? Math.round(100 * l.amount / budgetTotal) + '%' : '-'));
    });
    var budgetTable = h(SectionCard, { title: 'Budget', badge: money(budgetTotal, cur) },
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-plan-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Category'), h('th', null, 'Role / line'),
            h('th', { className: 'wb-th--center' }, 'Quantity'),
            h('th', { className: 'wb-th--center' }, 'Rate'),
            h('th', { className: 'wb-th--center' }, 'Amount'),
            h('th', { className: 'wb-th--center' }, 'Share'))),
          h('tbody', null, budgetRows),
          h('tfoot', null, h('tr', { className: 'wb-plan-total-row' },
            h('td', { colSpan: 4 }, 'Total contract value'),
            h('td', { className: 'wb-td--num wb-th--center' }, money(budgetTotal, cur)),
            h('td', { className: 'wb-td--num wb-th--center' }, '100%'))))),
      h('div', { className: 'wb-plan-budgetbar' },
        h('div', { className: 'wb-plan-budgetbar-row' },
          h('span', null, 'Paid to date'), h('span', null, money(paid, cur) + ' of ' + money(budgetTotal, cur))),
        progressBar(budgetTotal ? 100 * paid / budgetTotal : 0, 'high')));

    return h('div', null, summary, contractStrip, delTable, budgetTable);
  }

  function contractField(label, value) {
    return h('div', { className: 'wb-plan-contract-field' },
      h('div', { className: 'wb-plan-contract-label' }, label),
      h('div', { className: 'wb-plan-contract-value' }, value || '-'));
  }

  // ========================= COMMISSIONER VIEW ============================
  function commissionerView(context, planning, cur, api) {
    var dels = planning.deliverables || [];
    var invoices = planning.invoices || [];
    var lines = planning.budget_lines || [];
    var contract = planning.contract || {};
    var budgetTotal = contract.total_budget || sum(lines, function(l) { return l.amount; });

    var queue = dels.filter(function(d) { return d.status === 'submitted' || d.status === 'accepted' || d.status === 'revise'; });
    var toReview = dels.filter(function(d) { return d.status === 'submitted'; }).length;
    var rated = dels.filter(function(d) { return ratingMean(d.rating) != null; });
    var avgQuality = rated.length ? (sum(rated, function(d) { return ratingMean(d.rating); }) / rated.length) : null;
    var invApproved = sum(invoices.filter(function(i) { return i.status === 'approved' || i.status === 'paid'; }), function(i) { return i.amount; });
    var invPaid = sum(invoices.filter(function(i) { return i.status === 'paid'; }), function(i) { return i.amount; });

    var summary = h('div', { className: 'wb-plan-stats' },
      statTile('Awaiting review', String(toReview), 'submitted deliverables'),
      statTile('Average quality', avgQuality != null ? avgQuality.toFixed(1) + ' / 4' : 'Not rated', avgQuality != null ? ratingBand(avgQuality) : null),
      statTile('Approved', money(invApproved, cur), Math.round(budgetTotal ? 100 * invApproved / budgetTotal : 0) + '% of value'),
      statTile('Paid', money(invPaid, cur), null));

    // review queue with rating
    var reviewCards = queue.length ? queue.map(function(d) {
      var mean = ratingMean(d.rating);
      var band = ratingBand(mean);
      var expanded = api.ratingId === d.id;
      return h('div', { key: d.id, className: 'wb-plan-review' },
        h('div', { className: 'wb-plan-review-head' },
          h('div', null,
            h('div', { className: 'wb-plan-del-title' }, d.code ? (d.code + '  ') : '', d.title),
            h('div', { className: 'wb-plan-del-desc' }, 'Submitted ' + fdate(d.submitted_at))),
          h('div', { className: 'wb-plan-review-head-right' },
            mean != null ? h('span', { className: 'wb-badge ' + bandBadge(band), title: band }, mean.toFixed(1) + ' / 4') : null,
            statusPill(DELIV_STATUS, d.status))),
        // accept / revise actions
        d.status === 'submitted' ? h('div', { className: 'wb-plan-review-actions' },
          h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { api.patchDeliverable(d.id, { status: 'accepted', accepted_at: new Date().toISOString() }, false, 'Accepted ' + (d.code || d.title)); } }, 'Accept'),
          h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { api.patchDeliverable(d.id, { status: 'revise' }, false, 'Requested revision of ' + (d.code || d.title)); } }, 'Request revision')) : null,
        // rating toggle
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost wb-plan-rate-toggle', style: { display: 'inline-flex', alignItems: 'center', gap: 6 }, onClick: function() { api.setRatingId(expanded ? null : d.id); } },
          (mean != null ? 'Edit quality rating' : 'Rate quality'),
          expanded ? PraxisIcons.chevronUp(12) : PraxisIcons.chevronDown(12)),
        expanded ? ratingPanel(d, api) : null);
    }) : h('div', { className: 'wb-station-empty' },
        h('div', { className: 'wb-station-empty-title' }, 'Nothing submitted yet'),
        h('div', { className: 'wb-station-empty-desc' }, 'When the evaluation team submits a deliverable it appears here for review, acceptance and quality rating.'));

    var reviewSection = h(SectionCard, { title: 'Deliverable review and quality rating', badge: toReview ? toReview + ' to review' : 'Up to date', variant: toReview ? 'warning' : null }, reviewCards);

    // invoices
    var invSection = h(SectionCard, { title: 'Invoices', badge: money(invPaid, cur) + ' paid' },
      invoices.length ? h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-plan-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Invoice'), h('th', null, 'Deliverable'), h('th', null, 'Issued'),
            h('th', { className: 'wb-th--center' }, 'Amount'), h('th', null, 'Status'),
            h('th', { className: 'wb-th--center' }, 'Action'))),
          h('tbody', null, invoices.map(function(iv) {
            var del = dels.filter(function(d) { return d.id === iv.deliverable_id; })[0];
            return h('tr', { key: iv.id },
              h('td', { className: 'wb-td--meta' }, iv.number),
              h('td', null, del ? (del.code || del.title) : '-'),
              h('td', { className: 'wb-td--meta' }, fdate(iv.issued_date)),
              h('td', { className: 'wb-td--num wb-th--center' }, money(iv.amount, cur)),
              h('td', null, statusPill(INVOICE_STATUS, iv.status)),
              h('td', { className: 'wb-th--center' },
                iv.status === 'submitted'
                  ? ((del && del.status === 'accepted')
                      ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { api.patchInvoice(iv.id, { status: 'approved' }, 'Approved ' + iv.number); } }, 'Approve')
                      : h('span', { className: 'wb-plan-lock', title: 'Payment is released only after the linked deliverable is accepted' }, 'Locked until accepted'))
                  : iv.status === 'approved'
                      ? h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { api.patchInvoice(iv.id, { status: 'paid', paid_date: new Date().toISOString() }, 'Marked ' + iv.number + ' paid'); } }, 'Mark paid')
                      : h('span', { className: 'wb-plan-del-desc' }, iv.paid_date ? fdate(iv.paid_date) : '')));
          }))))
      : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No invoices submitted.')));

    return h('div', null, summary, reviewSection, invSection);
  }

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

  window.Station9 = Station9;
})();
