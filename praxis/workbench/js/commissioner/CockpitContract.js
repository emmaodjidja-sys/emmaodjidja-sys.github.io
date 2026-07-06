/**
 * CockpitContract: the C1 Contract station of the commissioner cockpit. Procure and manage
 * the contract: the budget burn (committed / paid / remaining), the deliverable schedule with
 * commissioner acceptance and the harmonized quality rubric, and invoices whose payment is
 * gated on deliverable acceptance. Ported from the original Station9 commissioner view.
 *
 * Consumes window.PlanningShared for all money/status/rubric logic and window.CockpitSave for
 * the id-keyed save contract: deliverable FIELD edits (status, payment, rating) go through the
 * id-keyed PATCH_DELIVERABLE path; structural edits (budget lines, invoices, add/remove
 * deliverable) save the full planning object. Renders only the station body (no cockpit
 * header). No-JSX React.createElement. window.CockpitContract. Rendered by CockpitShell (C1).
 */
(function() {
  'use strict';
  var h = React.createElement;

  var BUDGET_CATEGORIES = ['Personnel', 'Travel and DSA', 'Data collection', 'Translation',
    'Dissemination', 'Management and overhead', 'Contingency'];

  function kv(k, v) { var o = {}; o[k] = v; return o; }
  function numOrNull(v) { if (v === '' || v == null) return null; var n = parseFloat(v); return isNaN(n) ? null : n; }

  function CockpitContract(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context;
    var PS = window.PlanningShared;
    var A = window.CockpitAtoms;
    var I = window.PraxisIcons;
    var U = window.PraxisUtils;
    var AT = PraxisContext.ACTION_TYPES;

    var api = window.CockpitSave.make(context, dispatch);
    var planning = context.planning || {};
    var deliverables = planning.deliverables || [];
    var invoices = planning.invoices || [];
    var budget = planning.budget_lines || [];
    var contract = planning.contract || {};
    var cur = contract.currency || 'USD';

    var rr = React.useState(null), ratingId = rr[0], setRatingId = rr[1];

    function toast(msg, t) { if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: t || 'success' }); }

    // ---- mutations --------------------------------------------------------
    // Deliverable field edits use the id-keyed reducer path so C1 (payment/quality facet)
    // and C3 (schedule facet) can never clobber each other.
    function acceptDeliverable(d) { api.patchDeliverable(d.id, { status: 'accepted', accepted_at: new Date().toISOString() }); toast('Accepted ' + PS.delTitle(d)); }
    function reviseDeliverable(d) { api.patchDeliverable(d.id, { status: 'revise' }); toast('Requested revision of ' + PS.delTitle(d)); }
    function setPayment(id, v) { var n = numOrNull(v); api.patchDeliverable(id, { payment_percent: n == null ? 0 : n }); }
    function addDeliverable() {
      api.addDeliverable({
        id: U.uid('del_'), code: '', title: 'New deliverable', description: '', due_date: '',
        station_ids: [], payment_percent: 0, status: 'not_started', submitted_at: null, accepted_at: null,
        type: '', reviewers: [], reviewer_email: '', alert: { lead_days: 14, emails: [] }, rating: null, notes: ''
      }, 'Deliverable added');
    }
    function removeDeliverable(d) { api.removeDeliverable(d.id, 'Removed ' + PS.delTitle(d)); }

    // Rating writes go through the id-keyed deliverable patch (quiet, like the team view).
    var ratingApi = {
      setRating: function(id, key, value) {
        var del = deliverables.filter(function(d) { return d.id === id; })[0];
        var scores = Object.assign({}, (del && del.rating && del.rating.scores) || {});
        scores[key] = value;
        api.patchDeliverable(id, { rating: Object.assign({}, del && del.rating, { scores: scores, rated_at: new Date().toISOString() }) });
      },
      setRatingComment: function(id, comment) {
        var del = deliverables.filter(function(d) { return d.id === id; })[0];
        api.patchDeliverable(id, { rating: Object.assign({}, del && del.rating, { comment: comment, rated_at: new Date().toISOString() }) });
      }
    };

    // Structural edits save the full planning object.
    function saveBudget(next, msg) { api.savePlanning(Object.assign({}, planning, { budget_lines: next }), msg); }
    function editBudget(id, field, value) { saveBudget(budget.map(function(l) { return l.id === id ? Object.assign({}, l, kv(field, value)) : l; }), 'Budget updated'); }
    function addBudget() { saveBudget(budget.concat([{ id: U.uid('bl_'), category: BUDGET_CATEGORIES[0], role: '', description: '', unit: '', quantity: null, rate: null, amount: 0 }]), 'Budget line added'); }
    function removeBudget(id) { saveBudget(budget.filter(function(l) { return l.id !== id; }), 'Budget line removed'); }

    function saveInvoices(next, msg) { api.savePlanning(Object.assign({}, planning, { invoices: next }), msg); }
    function patchInvoice(id, patch, msg) { saveInvoices(invoices.map(function(iv) { return iv.id === id ? Object.assign({}, iv, patch) : iv; }), msg); }
    function approveInvoice(iv) { patchInvoice(iv.id, { status: 'approved' }, 'Approved ' + iv.number); }
    function payInvoice(iv) { patchInvoice(iv.id, { status: 'paid', paid_date: new Date().toISOString() }, 'Marked ' + iv.number + ' paid'); }

    var head = A.moveHead('C1', 'Contract', 'Procure and manage the contract',
      'Budget, deliverables, invoices and quality review. The commissioner accepts deliverables and gates payment on acceptance.');

    // ---- empty state ------------------------------------------------------
    if (!deliverables.length && !budget.length) {
      return h('div', { className: 'wb-cm-contract' }, head,
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'No contract set up yet'),
          h('div', { className: 'wb-station-empty-desc' }, 'Open a worked example to see a complete budget, deliverable schedule, invoices and quality ratings, or add the first deliverable to build the schedule.'),
          h('div', { className: 'wb-cm-add' },
            h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: addDeliverable }, 'Add deliverable'))));
    }

    // ---- derived figures --------------------------------------------------
    var budgetTotal = contract.total_budget || PS.sum(budget, function(l) { return l.amount; });
    var committed = PS.sum(invoices.filter(function(i) { return i.status === 'approved' || i.status === 'paid'; }), function(i) { return i.amount; });
    var paid = PS.sum(invoices.filter(function(i) { return i.status === 'paid'; }), function(i) { return i.amount; });
    var remaining = budgetTotal - committed;
    var toReview = deliverables.filter(function(d) { return d.status === 'submitted'; }).length;

    // ---- burn strip + contract summary ------------------------------------
    var stats = h('div', { className: 'wb-plan-stats' },
      PS.statTile('Contract value', PS.money(budgetTotal, cur), null),
      PS.statTile('Committed', PS.money(committed, cur), Math.round(budgetTotal ? 100 * committed / budgetTotal : 0) + '% of value'),
      PS.statTile('Paid', PS.money(paid, cur), Math.round(budgetTotal ? 100 * paid / budgetTotal : 0) + '% of value'),
      PS.statTile('Remaining', PS.money(remaining, cur), null));

    var contractStrip = h('div', { className: 'wb-plan-contract' },
      PS.contractField('Commissioner', contract.commissioner),
      PS.contractField('Evaluation team', contract.evaluator),
      PS.contractField('Reference', contract.reference),
      PS.contractField('Period', PS.fdate(contract.start_date) + ' to ' + PS.fdate(contract.end_date)));

    // ---- budget lines (editable) ------------------------------------------
    var budgetRows = budget.map(function(l) {
      var cats = BUDGET_CATEGORIES.slice();
      if (l.category && cats.indexOf(l.category) < 0) cats = [l.category].concat(cats);
      return h('tr', { key: l.id },
        h('td', null, h('select', { className: 'wb-input', style: { minWidth: 150 }, 'aria-label': 'Category',
          key: 'cat:' + l.id + ':' + (l.category || ''), defaultValue: l.category || '',
          onChange: function(e) { editBudget(l.id, 'category', e.target.value); } },
          cats.map(function(c) { return h('option', { key: c, value: c }, c); }))),
        h('td', null,
          h('input', { className: 'wb-input', type: 'text', placeholder: 'Role or line item', 'aria-label': 'Role or line',
            key: 'role:' + l.id + ':' + (l.role || ''), defaultValue: l.role || '',
            onBlur: function(e) { editBudget(l.id, 'role', e.target.value); } }),
          h('input', { className: 'wb-input', type: 'text', placeholder: 'Description (optional)', 'aria-label': 'Description',
            key: 'desc:' + l.id + ':' + (l.description || ''), defaultValue: l.description || '', style: { marginTop: 4 },
            onBlur: function(e) { editBudget(l.id, 'description', e.target.value); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input', type: 'number', 'aria-label': 'Quantity', style: { width: 80, textAlign: 'right' },
          key: 'qty:' + l.id + ':' + (l.quantity == null ? '' : l.quantity), defaultValue: l.quantity == null ? '' : l.quantity,
          onBlur: function(e) { editBudget(l.id, 'quantity', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input', type: 'number', 'aria-label': 'Rate', style: { width: 96, textAlign: 'right' },
          key: 'rate:' + l.id + ':' + (l.rate == null ? '' : l.rate), defaultValue: l.rate == null ? '' : l.rate,
          onBlur: function(e) { editBudget(l.id, 'rate', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input', type: 'number', 'aria-label': 'Amount', style: { width: 110, textAlign: 'right' },
          key: 'amt:' + l.id + ':' + (l.amount == null ? '' : l.amount), defaultValue: l.amount == null ? '' : l.amount,
          onBlur: function(e) { editBudget(l.id, 'amount', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-td--num wb-th--center' }, budgetTotal ? Math.round(100 * (l.amount || 0) / budgetTotal) + '%' : '-'),
        h('td', { className: 'wb-th--center' }, h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove budget line', title: 'Remove budget line', onClick: function() { removeBudget(l.id); } }, I.close(14))));
    });

    var budgetSection = h(SectionCard, { title: 'Budget', badge: PS.money(budgetTotal, cur) },
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-plan-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Category'), h('th', null, 'Role / line'),
            h('th', { className: 'wb-th--center' }, 'Quantity'),
            h('th', { className: 'wb-th--center' }, 'Rate'),
            h('th', { className: 'wb-th--center' }, 'Amount'),
            h('th', { className: 'wb-th--center' }, 'Share'),
            h('th', { className: 'wb-th--center' }, ''))),
          h('tbody', null, budgetRows),
          h('tfoot', null, h('tr', { className: 'wb-plan-total-row' },
            h('td', { colSpan: 4 }, 'Total contract value'),
            h('td', { className: 'wb-td--num wb-th--center' }, PS.money(budgetTotal, cur)),
            h('td', { className: 'wb-td--num wb-th--center' }, '100%'),
            h('td', null, ''))))),
      h('div', { className: 'wb-cm-add' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm', onClick: addBudget }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add budget line'))),
      h('div', { className: 'wb-plan-budgetbar' },
        h('div', { className: 'wb-plan-budgetbar-row' }, h('span', null, 'Committed'), h('span', null, PS.money(committed, cur) + ' of ' + PS.money(budgetTotal, cur))),
        PS.progressBar(budgetTotal ? 100 * committed / budgetTotal : 0, 'high')),
      h('div', { className: 'wb-plan-budgetbar' },
        h('div', { className: 'wb-plan-budgetbar-row' }, h('span', null, 'Paid to date'), h('span', null, PS.money(paid, cur) + ' of ' + PS.money(budgetTotal, cur))),
        PS.progressBar(budgetTotal ? 100 * paid / budgetTotal : 0, 'high')));

    // ---- deliverables (commissioner review) -------------------------------
    var delRows = deliverables.map(function(d) {
      var mean = PS.ratingMean(d.rating);
      var band = PS.ratingBand(mean);
      var expanded = ratingId === d.id;
      var canRate = d.status === 'accepted' || !!d.rating;
      var reviewCell = h('td', null,
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' } },
          d.status === 'submitted' ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { acceptDeliverable(d); } }, 'Accept') : null,
          d.status === 'submitted' ? h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { reviseDeliverable(d); } }, 'Request revision') : null,
          (d.status === 'accepted' && d.accepted_at) ? h('span', { className: 'wb-plan-del-desc' }, 'Accepted ' + PS.fdate(d.accepted_at)) : null,
          d.status === 'revise' ? h('span', { className: 'wb-plan-del-desc' }, 'Awaiting resubmission') : null,
          (d.status === 'not_started' || d.status === 'in_progress') ? h('span', { className: 'wb-plan-del-desc' }, 'Awaiting submission') : null,
          canRate ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', style: { display: 'inline-flex', alignItems: 'center', gap: 6 }, onClick: function() { setRatingId(expanded ? null : d.id); } },
            (mean != null ? 'Edit quality rating' : 'Rate quality'), expanded ? I.chevronUp(12) : I.chevronDown(12)) : null,
          (mean != null) ? h('span', { className: 'wb-badge ' + PS.bandBadge(band), title: band }, mean.toFixed(1) + ' / 4') : null));
      var main = h('tr', { key: d.id },
        h('td', null,
          h('div', { className: 'wb-plan-del-title' }, d.code ? (d.code + '  ') : '', PS.delTitle(d)),
          d.description ? h('div', { className: 'wb-plan-del-desc' }, d.description) : null),
        h('td', { className: 'wb-td--meta' }, PS.fdate(d.due_date)),
        h('td', null, PS.statusPill(PS.DELIV_STATUS, d.status)),
        h('td', { className: 'wb-th--center' },
          h('input', { className: 'wb-input', type: 'number', min: 0, max: 100, step: 5, 'aria-label': 'Payment percent for ' + PS.delTitle(d),
            key: 'pay:' + d.id + ':' + (d.payment_percent == null ? '' : d.payment_percent), defaultValue: d.payment_percent == null ? '' : d.payment_percent,
            style: { width: 64, textAlign: 'right', display: 'inline-block' }, onBlur: function(e) { setPayment(d.id, e.target.value); } }),
          h('span', { className: 'wb-plan-del-desc', style: { display: 'inline', marginLeft: 4 } }, '%')),
        reviewCell,
        h('td', { className: 'wb-th--center' }, h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove ' + PS.delTitle(d), title: 'Remove deliverable', onClick: function() { removeDeliverable(d); } }, I.close(14))));
      if (!expanded) return main;
      var detail = h('tr', { key: d.id + '_rate', className: 'wb-plan-review-detail' },
        h('td', { colSpan: 6 }, PS.ratingPanel(d, ratingApi)));
      return [main, detail];
    });

    var delSection = h(SectionCard, { title: 'Deliverables and quality review', badge: toReview ? toReview + ' to review' : deliverables.length + ' items', variant: toReview ? 'warning' : null },
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-plan-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Deliverable'), h('th', null, 'Due'), h('th', null, 'Status'),
            h('th', { className: 'wb-th--center' }, 'Payment'), h('th', null, 'Review'),
            h('th', { className: 'wb-th--center' }, ''))),
          h('tbody', null, delRows))),
      h('div', { className: 'wb-cm-add' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm', onClick: addDeliverable }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add deliverable'))));

    // ---- invoices (payment gated on acceptance) ---------------------------
    var invRows = invoices.map(function(iv) {
      var del = deliverables.filter(function(d) { return d.id === iv.deliverable_id; })[0];
      var linkedAccepted = !!del && del.status === 'accepted';
      return h('tr', { key: iv.id },
        h('td', { className: 'wb-td--meta' }, iv.number),
        h('td', null, del ? (del.code || PS.delTitle(del)) : '-'),
        h('td', { className: 'wb-td--meta' }, PS.fdate(iv.issued_date)),
        h('td', { className: 'wb-td--num wb-th--center' }, PS.money(iv.amount, cur)),
        h('td', null, PS.statusPill(PS.INVOICE_STATUS, iv.status)),
        h('td', { className: 'wb-th--center' },
          iv.status === 'submitted'
            ? (linkedAccepted
                ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { approveInvoice(iv); } }, 'Approve')
                : h('span', { className: 'wb-plan-lock', title: 'Payment is released only after the linked deliverable is accepted' }, 'Locked until accepted'))
            : iv.status === 'approved'
                ? h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { payInvoice(iv); } }, 'Mark paid')
                : h('span', { className: 'wb-plan-del-desc' }, iv.paid_date ? PS.fdate(iv.paid_date) : '')));
    });

    var invSection = h(SectionCard, { title: 'Invoices', badge: PS.money(paid, cur) + ' paid' },
      invoices.length
        ? h('div', { className: 'wb-table-container' },
            h('table', { className: 'wb-table wb-plan-table' },
              h('thead', null, h('tr', null,
                h('th', null, 'Invoice'), h('th', null, 'Deliverable'), h('th', null, 'Issued'),
                h('th', { className: 'wb-th--center' }, 'Amount'), h('th', null, 'Status'),
                h('th', { className: 'wb-th--center' }, 'Action'))),
              h('tbody', null, invRows)))
        : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No invoices submitted.')));

    return h('div', { className: 'wb-cm-contract' }, head, stats, contractStrip, budgetSection, delSection, invSection);
  }

  window.CockpitContract = CockpitContract;
})();
