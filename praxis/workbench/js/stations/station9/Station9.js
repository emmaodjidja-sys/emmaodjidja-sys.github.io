/**
 * Station 9 - Planning (optional), Evaluation Team view.
 * The team's read-mostly surface for the evaluation-as-a-contract: budget, the deliverable
 * schedule (completion tied to workbench station progress), and submitting deliverables to
 * the commissioner. Commissioner-side review, acceptance, invoice approval and quality
 * rating now live in the commissioner cockpit's C1 Contract station (CockpitContract).
 * Shared money/status/rubric helpers come from window.PlanningShared (no duplication).
 * No-JSX React.createElement, workbench house style. window.Station9.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;

  // ---- helpers ------------------------------------------------------------
  function defaultPlanning() {
    return { contract: {}, budget_lines: [], deliverables: [], invoices: [], completed_at: null };
  }

  // ========================================================================
  function Station9(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context;
    var planning = context.planning || defaultPlanning();
    var contract = planning.contract || {};
    var cur = contract.currency || 'USD';

    function save(next) {
      dispatch({ type: AT.SAVE_STATION, stationId: 9, payload: { planning: next } });
    }
    function toast(msg, t) {
      dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: t || 'success' });
    }
    // Team-side field edit (submit / start). Saves the whole planning object via the
    // existing SAVE_STATION stationId:9 pattern.
    function patchDeliverable(id, patch, quiet, msg) {
      var next = Object.assign({}, planning, {
        deliverables: (planning.deliverables || []).map(function(d) { return d.id === id ? Object.assign({}, d, patch) : d; }),
        completed_at: planning.completed_at || new Date().toISOString()
      });
      save(next);
      if (!quiet) toast(msg || 'Planning updated');
    }

    // gate: no planning data yet
    var hasData = (planning.deliverables && planning.deliverables.length) || (planning.budget_lines && planning.budget_lines.length);

    // ---- custom header (Shell suppresses StationHeader/SummaryBar for index 9) ----
    var header = h('div', { className: 'wb-panel-header wb-plan-header' },
      h('div', null,
        h('div', { className: 'wb-station-label' }, 'OPTIONAL STATION'),
        h('h2', { className: 'wb-station-title' }, 'Planning and Contract Management'),
        h('p', { className: 'wb-station-desc' }, 'Your budget, deliverable schedule and submissions. Deliverable completion tracks your workbench progress; the commissioner reviews, accepts and rates in the commissioner cockpit.')));

    if (!hasData) {
      return h('div', { className: 'wb-plan' }, header,
        h(SectionCard, { title: 'Planning', bodyType: 'empty' },
          h('div', { className: 'wb-station-empty' },
            h('div', { className: 'wb-station-empty-title' }, 'No planning data yet'),
            h('div', { className: 'wb-station-empty-desc' }, 'Open a worked example to see a complete budget, deliverable schedule, invoices and quality ratings, or open a saved .praxis project.'))));
    }

    var body = evaluatorView(context, planning, cur, { patchDeliverable: patchDeliverable, toast: toast });
    return h('div', { className: 'wb-plan' }, header, body);
  }

  // ======================= EVALUATION TEAM VIEW ===========================
  function evaluatorView(context, planning, cur, api) {
    var PS = window.PlanningShared;
    var contract = planning.contract || {};
    var dels = planning.deliverables || [];
    var lines = planning.budget_lines || [];
    var invoices = planning.invoices || [];
    var doneArr = PS.stationDone(context);

    var accepted = dels.filter(function(d) { return d.status === 'accepted'; }).length;
    var budgetTotal = contract.total_budget || PS.sum(lines, function(l) { return l.amount; });
    var paid = PS.sum(invoices.filter(function(i) { return i.status === 'paid'; }), function(i) { return i.amount; });
    // overall completion = mean of deliverable progress (station-linked) or accepted share
    var progs = dels.map(function(d) { var p = PS.deliverableProgress(context, d); return p == null ? (d.status === 'accepted' ? 100 : 0) : p; });
    var overall = progs.length ? Math.round(PS.sum(progs, function(x) { return x; }) / progs.length) : 0;
    var upcoming = dels.filter(function(d) { return d.status !== 'accepted' && d.due_date; }).sort(function(a, b) { return a.due_date < b.due_date ? -1 : 1; })[0];

    var summary = h('div', { className: 'wb-plan-stats' },
      PS.statTile('Overall completion', overall + '%', null),
      PS.statTile('Deliverables accepted', accepted + ' / ' + dels.length, null),
      PS.statTile('Contract value', PS.money(budgetTotal, cur), null),
      PS.statTile('Paid to date', PS.money(paid, cur), Math.round(budgetTotal ? 100 * paid / budgetTotal : 0) + '% of value'),
      PS.statTile('Next deadline', upcoming ? PS.fdate(upcoming.due_date) : 'None', upcoming ? upcoming.code : null));

    var contractStrip = h('div', { className: 'wb-plan-contract' },
      PS.contractField('Commissioner', contract.commissioner),
      PS.contractField('Evaluation team', contract.evaluator),
      PS.contractField('Reference', contract.reference),
      PS.contractField('Period', (PS.fdate(contract.start_date) + ' to ' + PS.fdate(contract.end_date))));

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
            var p = PS.deliverableProgress(context, d);
            var pct = p == null ? (d.status === 'accepted' ? 100 : 0) : p;
            var canSubmit = (d.status === 'not_started' || d.status === 'in_progress' || d.status === 'revise') && pct >= 100;
            return h('tr', { key: d.id },
              h('td', null, h('div', { className: 'wb-plan-del-title' }, PS.delTitle(d)),
                d.description ? h('div', { className: 'wb-plan-del-desc' }, d.description) : null),
              h('td', { className: 'wb-td--meta' }, PS.fdate(d.due_date)),
              h('td', null, h('div', { className: 'wb-plan-chips' },
                (d.station_ids || []).length
                  ? (d.station_ids).map(function(i) {
                      return h('span', { key: i, className: 'wb-plan-chip' + (doneArr[i] ? ' wb-plan-chip--done' : '') }, i + ' ' + PS.STATION_SHORT[i]);
                    })
                  : h('span', { className: 'wb-plan-del-desc' }, 'Manual'))),
              h('td', null, h('div', { className: 'wb-plan-prog' }, PS.progressBar(pct), h('span', { className: 'wb-plan-prog-num' }, pct + '%'))),
              h('td', null, PS.statusPill(PS.DELIV_STATUS, d.status)),
              h('td', { className: 'wb-td--num wb-th--center' }, (d.payment_percent != null ? d.payment_percent + '%' : '-')),
              h('td', { className: 'wb-th--center' },
                canSubmit
                  ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { api.patchDeliverable(d.id, { status: 'submitted', submitted_at: new Date().toISOString() }, false, 'Submitted ' + d.code + ' to commissioner'); } }, 'Submit')
                  : (d.status === 'not_started'
                      ? h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { api.patchDeliverable(d.id, { status: 'in_progress' }, false, 'Marked ' + d.code + ' in progress'); } }, 'Start')
                      : h('span', { className: 'wb-plan-del-desc' }, d.submitted_at ? PS.fdate(d.submitted_at) : ''))));
          })))));

    // budget table
    var budgetRows = lines.map(function(l) {
      return h('tr', { key: l.id },
        h('td', null, l.category),
        h('td', null, h('div', { className: 'wb-plan-del-title' }, l.role || l.description),
          (l.role && l.description) ? h('div', { className: 'wb-plan-del-desc' }, l.description) : null),
        h('td', { className: 'wb-td--num wb-th--center' }, l.quantity != null ? (l.quantity + (l.unit ? ' ' + l.unit : '')) : '-'),
        h('td', { className: 'wb-td--num wb-th--center' }, l.rate != null ? PS.money(l.rate, cur) : '-'),
        h('td', { className: 'wb-td--num wb-th--center' }, PS.money(l.amount, cur)),
        h('td', { className: 'wb-td--num wb-th--center' }, budgetTotal ? Math.round(100 * l.amount / budgetTotal) + '%' : '-'));
    });
    var budgetTable = h(SectionCard, { title: 'Budget', badge: PS.money(budgetTotal, cur) },
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
            h('td', { className: 'wb-td--num wb-th--center' }, PS.money(budgetTotal, cur)),
            h('td', { className: 'wb-td--num wb-th--center' }, '100%'))))),
      h('div', { className: 'wb-plan-budgetbar' },
        h('div', { className: 'wb-plan-budgetbar-row' },
          h('span', null, 'Paid to date'), h('span', null, PS.money(paid, cur) + ' of ' + PS.money(budgetTotal, cur))),
        PS.progressBar(budgetTotal ? 100 * paid / budgetTotal : 0, 'high')));

    return h('div', null, summary, contractStrip, delTable, budgetTable);
  }

  window.Station9 = Station9;
})();
