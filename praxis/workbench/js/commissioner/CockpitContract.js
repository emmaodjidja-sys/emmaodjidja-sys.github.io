/**
 * CockpitContract: the C1 Contract station of the commissioner cockpit. Procure and manage
 * the contract as a self-sufficient system of record: the contract header (parties, period,
 * ceiling, currency) and its amendments; the budget burn (committed / paid / remaining) with
 * over-commitment guardrails; the deliverable schedule with in-place authoring, a canonical
 * workflow-status control, governed acceptance and the harmonized quality rubric; and an
 * invoice ledger with create / edit / return / approve / pay, whose milestone payments are
 * gated on deliverable acceptance while advances are not.
 *
 * Consumes window.PlanningShared for money/status/rubric logic and window.CockpitSave for the
 * save contract: deliverable FIELD edits (identity, status, payment, rating) go through the
 * id-keyed PATCH_DELIVERABLE path so this station and C3 Deliver can never clobber each other;
 * structural edits (contract header, amendments, budget lines, invoices, add/remove deliverable)
 * save the full planning object. C1 owns the canonical deliverable workflow status; C3 derives
 * a read-only schedule status from it. Renders only the station body (no cockpit header).
 * No-JSX React.createElement. window.CockpitContract. Rendered by CockpitShell (C1).
 */
(function() {
  'use strict';
  var h = React.createElement;
  var SectionCard = window.SectionCard;

  var BUDGET_CATEGORIES = ['Personnel', 'Travel and DSA', 'Data collection', 'Translation',
    'Dissemination', 'Management and overhead', 'Contingency'];
  var CURRENCIES = ['USD', 'EUR', 'GBP', 'XOF', 'XAF', 'GHS', 'KES', 'NGN', 'ZAR', 'CHF'];

  function kv(k, v) { var o = {}; o[k] = v; return o; }
  function numOrNull(v) { if (v === '' || v == null) return null; var n = parseFloat(v); return isNaN(n) ? null : n; }
  function clampPct(v) { var n = numOrNull(v); if (n == null) return 0; return Math.max(0, Math.min(100, n)); }

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
    var amendments = contract.amendments || [];
    var cur = contract.currency || 'USD';

    var rr = React.useState(null), ratingId = rr[0], setRatingId = rr[1];
    // Per-row acceptance-override prompt: holds the deliverable id whose block the commissioner
    // is overriding, plus the recorded reason (only one prompt is open at a time).
    var ov = React.useState(null), overrideId = ov[0], setOverrideId = ov[1];
    var orr = React.useState(''), overrideReason = orr[0], setOverrideReason = orr[1];
    // Pending remove confirmation (this is the contract system of record; a stray click must not
    // irreversibly destroy a rated deliverable, an amendment or an invoice). Holds a "kind:id" key.
    var cf = React.useState(null), confirmId = cf[0], setConfirmId = cf[1];

    // Inception gate state (C2 Assure). A design returned for redesign blocks acceptance and
    // invoice approval here, so C2's decision is a real control rather than a note.
    var gate = (context.commissioner || {}).gate || {};
    var gateReturned = gate.decision === 'return';

    function toast(msg, t) { if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: t || 'success' }); }

    // A remove control that requires a confirm click before it destroys the row.
    function removeCell(key, aria, doRemove) {
      if (confirmId === key) {
        return h('div', { className: 'wb-cm-confirm' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-danger', 'aria-label': 'Confirm ' + aria, onClick: function() { setConfirmId(null); doRemove(); } }, 'Remove'),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Cancel', onClick: function() { setConfirmId(null); } }, 'Cancel'));
      }
      return h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': aria, title: aria, onClick: function() { setConfirmId(key); } }, I.close(14));
    }

    // What, if anything, blocks a clean acceptance of this deliverable. null = clean to accept.
    function acceptBlock(d) {
      if (gateReturned) return 'The inception gate returned the design for redesign (C2 Assure).';
      var rubric = PS.rubricFor(d);
      if (PS.ratingMean(d.rating, rubric) == null) return 'This deliverable has not been quality-rated yet.';
      if (PS.mustPassFail(d.rating, rubric)) return 'A must-pass quality criterion is below the standard.';
      return null;
    }

    // ---- contract header + amendments (structural: full planning save) ------
    function saveContract(patch, msg) {
      api.savePlanning(Object.assign({}, planning, { contract: Object.assign({}, contract, patch) }), msg);
    }
    function editContract(field, value) { saveContract(kv(field, value)); } // quiet on field blur
    function addAmendment() {
      saveContract({ amendments: amendments.concat([{ id: U.uid('amd_'), date: '', description: '',
        ceiling_delta: null, new_end_date: '', reason: '' }]) }, 'Amendment added');
    }
    function editAmendment(id, field, value) {
      saveContract({ amendments: amendments.map(function(a) { return a.id === id ? Object.assign({}, a, kv(field, value)) : a; }) });
    }
    function removeAmendment(id) { saveContract({ amendments: amendments.filter(function(a) { return a.id !== id; }) }, 'Amendment removed'); }

    // ---- deliverable mutations (id-keyed, cannot clobber C3) -----------------
    function editDel(id, field, value) { api.patchDeliverable(id, kv(field, value)); } // quiet
    function setDelStatus(d, status) {
      var p = { status: status };
      if (status === 'submitted' && !d.submitted_at) p.submitted_at = new Date().toISOString();
      if (status === 'accepted' && !d.accepted_at) p.accepted_at = new Date().toISOString();
      if (status !== 'accepted') p.accepted_at = (status === 'submitted' || status === 'revise') ? null : d.accepted_at;
      api.patchDeliverable(d.id, p);
      toast('Status set to ' + (PS.DELIV_STATUS[status] ? PS.DELIV_STATUS[status].label : status));
    }
    // Accept a deliverable. If it is clean (rated, no must-pass failure, gate not returned) it
    // accepts directly; otherwise the caller passes an override reason, which is recorded on the
    // deliverable so the exception is attributable and auditable.
    function acceptDeliverable(d, override) {
      var patch = { status: 'accepted', accepted_at: new Date().toISOString() };
      if (override) patch.acceptance_override = { reason: override, at: new Date().toISOString() };
      api.patchDeliverable(d.id, patch);
      setOverrideId(null); setOverrideReason('');
      toast(override ? ('Accepted ' + PS.delTitle(d) + ' with override') : ('Accepted ' + PS.delTitle(d)), override ? 'warning' : 'success');
    }
    // Accept button handler: accept directly when clean, else open the override prompt.
    function tryAccept(d) {
      if (acceptBlock(d)) { setOverrideId(d.id); setOverrideReason(''); }
      else acceptDeliverable(d, null);
    }
    function reviseDeliverable(d) { api.patchDeliverable(d.id, { status: 'revise', accepted_at: null }); toast('Requested revision of ' + PS.delTitle(d)); }
    function undoAcceptance(d) { api.patchDeliverable(d.id, { status: 'submitted', accepted_at: null }); toast('Acceptance withdrawn for ' + PS.delTitle(d), 'warning'); }
    function setPayment(id, v) { api.patchDeliverable(id, { payment_percent: clampPct(v) }); }
    function addDeliverable() {
      api.addDeliverable({
        id: U.uid('del_'), code: '', title: '', description: '', due_date: '',
        station_ids: [], payment_percent: 0, status: 'not_started', submitted_at: null, accepted_at: null,
        type: '', reviewers: '', reviewer_email: '', alert: { lead_days: 14, emails: [] }, rating: null,
        accepted_by: '', acceptance_note: '', revision_reason: '', notes: ''
      }, 'Deliverable added');
    }
    function removeDeliverable(d) {
      var linked = invoices.filter(function(iv) { return iv.deliverable_id === d.id; }).length;
      api.removeDeliverable(d.id, 'Removed ' + PS.delTitle(d) + (linked ? ' (' + linked + ' invoice(s) now unlinked)' : ''));
    }

    // Rating writes go through the id-keyed deliverable patch, carrying the rater identity.
    var ratingApi = {
      setRating: function(id, key, value) {
        var del = deliverables.filter(function(d) { return d.id === id; })[0];
        var scores = Object.assign({}, (del && del.rating && del.rating.scores) || {});
        scores[key] = value;
        var patch = { rating: Object.assign({}, del && del.rating, { scores: scores, rated_at: new Date().toISOString() }) };
        // Pin the resolved rubric on first score so a later title/type edit cannot silently
        // re-scope the criteria the scores were entered against.
        if (del && !del.rubric) patch.rubric = PS.rubricFor(del).key;
        api.patchDeliverable(id, patch);
      },
      setRatingComment: function(id, comment) {
        var del = deliverables.filter(function(d) { return d.id === id; })[0];
        api.patchDeliverable(id, { rating: Object.assign({}, del && del.rating, { comment: comment, rated_at: new Date().toISOString() }) });
      },
      setRatedBy: function(id, by) {
        var del = deliverables.filter(function(d) { return d.id === id; })[0];
        api.patchDeliverable(id, { rating: Object.assign({}, del && del.rating, { rated_by: by }) });
      },
      setRubric: function(id, key) { api.patchDeliverable(id, { rubric: key }); }
    };

    // ---- budget mutations (structural) --------------------------------------
    function saveBudget(next, msg) { api.savePlanning(Object.assign({}, planning, { budget_lines: next }), msg); }
    function editBudget(id, field, value) { saveBudget(budget.map(function(l) { return l.id === id ? Object.assign({}, l, kv(field, value)) : l; })); }
    function addBudget() { saveBudget(budget.concat([{ id: U.uid('bl_'), category: BUDGET_CATEGORIES[0], role: '', description: '', unit: '', quantity: null, rate: null, amount: 0 }]), 'Budget line added'); }
    function removeBudget(id) { saveBudget(budget.filter(function(l) { return l.id !== id; }), 'Budget line removed'); }

    // ---- invoice mutations (structural) -------------------------------------
    function saveInvoices(next, msg) { api.savePlanning(Object.assign({}, planning, { invoices: next }), msg); }
    function patchInvoice(id, patch, msg) { saveInvoices(invoices.map(function(iv) { return iv.id === id ? Object.assign({}, iv, patch) : iv; }), msg); }
    function editInvoice(id, field, value) { patchInvoice(id, kv(field, value)); } // quiet
    function addInvoice() {
      saveInvoices(invoices.concat([{ id: U.uid('inv_'), number: '', deliverable_id: '', issued_date: '',
        amount: null, type: 'milestone', status: 'submitted', approved_by: '', approved_at: null,
        paid_by: '', paid_date: null, note: '' }]), 'Invoice added');
    }
    function removeInvoice(iv) { saveInvoices(invoices.filter(function(x) { return x.id !== iv.id; }), 'Invoice removed'); }
    function submitInvoice(iv) { patchInvoice(iv.id, { status: 'submitted' }, 'Submitted ' + (iv.number || 'invoice')); }
    function approveInvoice(iv) { patchInvoice(iv.id, { status: 'approved', approved_at: new Date().toISOString() }, 'Approved ' + (iv.number || 'invoice')); }
    function returnInvoice(iv) { patchInvoice(iv.id, { status: 'returned', approved_at: null }, 'Returned ' + (iv.number || 'invoice')); }
    function payInvoice(iv) { patchInvoice(iv.id, { status: 'paid', paid_date: new Date().toISOString() }, 'Marked ' + (iv.number || 'invoice') + ' paid'); }

    var head = A.moveHead('C1', 'Contract', 'Procure and manage the contract',
      'The contract of record: parties and ceiling, budget burn, the deliverable schedule with quality review and acceptance, and the invoice ledger. Milestone payment is released on acceptance; advances are not.');

    // ---- derived figures ----------------------------------------------------
    var ceilingDelta = PS.sum(amendments, function(a) { return a.ceiling_delta; });
    var baseBudget = contract.total_budget || PS.sum(budget, function(l) { return l.amount; });
    var budgetTotal = baseBudget + ceilingDelta;
    var budgetLineSum = PS.sum(budget, function(l) { return l.amount; });
    var committed = PS.sum(invoices.filter(function(i) { return i.status === 'approved' || i.status === 'paid'; }), function(i) { return i.amount; });
    var paid = PS.sum(invoices.filter(function(i) { return i.status === 'paid'; }), function(i) { return i.amount; });
    var remaining = budgetTotal - committed;
    var overCommitted = remaining < 0;
    var toReview = deliverables.filter(function(d) { return d.status === 'submitted'; }).length;
    // Latest amendment end date overrides the contract period end.
    var effEnd = amendments.reduce(function(acc, a) { return a.new_end_date || acc; }, contract.end_date);

    // ---- contract header (editable) + amendments ----------------------------
    function cfield(label, field, opts) {
      opts = opts || {};
      var input = opts.type === 'select'
        ? h('select', { className: 'wb-input wb-cm-select', 'aria-label': label,
            key: field + ':' + (contract[field] || ''), defaultValue: contract[field] || opts.def || '',
            onChange: function(e) { editContract(field, e.target.value); } },
            opts.options.map(function(o) { return h('option', { key: o, value: o }, o); }))
        : h('input', { className: 'wb-input wb-cm-inp' + (opts.type === 'number' ? ' wb-cm-inp--num' : '') + (opts.type === 'date' ? ' wb-cm-date' : ''),
            type: opts.type || 'text', placeholder: opts.placeholder || '', 'aria-label': label,
            key: field + ':' + (contract[field] == null ? '' : contract[field]),
            defaultValue: contract[field] == null ? '' : contract[field],
            onBlur: function(e) { editContract(field, opts.type === 'number' ? numOrNull(e.target.value) : e.target.value); } });
      return h('div', { className: 'wb-cm-cfield' + (opts.wide ? ' wb-cm-cfield--wide' : '') },
        h('label', { className: 'wb-cm-cfield-label' }, label), input);
    }

    var amendmentRows = amendments.map(function(a) {
      return h('tr', { key: a.id },
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', 'aria-label': 'Amendment date',
          key: 'ad:' + a.id + ':' + (a.date || ''), defaultValue: a.date || '', onBlur: function(e) { editAmendment(a.id, 'date', e.target.value); } })),
        h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'what changed', 'aria-label': 'Amendment description',
          key: 'adesc:' + a.id + ':' + (a.description || ''), defaultValue: a.description || '', onBlur: function(e) { editAmendment(a.id, 'description', e.target.value); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', placeholder: '0', 'aria-label': 'Ceiling change',
          key: 'acd:' + a.id + ':' + (a.ceiling_delta == null ? '' : a.ceiling_delta), defaultValue: a.ceiling_delta == null ? '' : a.ceiling_delta, style: { width: 110 },
          onBlur: function(e) { editAmendment(a.id, 'ceiling_delta', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', 'aria-label': 'New end date',
          key: 'aend:' + a.id + ':' + (a.new_end_date || ''), defaultValue: a.new_end_date || '', onBlur: function(e) { editAmendment(a.id, 'new_end_date', e.target.value); } })),
        h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'reason / authority', 'aria-label': 'Reason',
          key: 'ar:' + a.id + ':' + (a.reason || ''), defaultValue: a.reason || '', onBlur: function(e) { editAmendment(a.id, 'reason', e.target.value); } })),
        h('td', { className: 'wb-th--center' }, removeCell('amd:' + a.id, 'Remove amendment', function() { removeAmendment(a.id); })));
    });

    var headerCard = h(SectionCard, { title: 'Contract', badge: contract.reference ? contract.reference : 'Set up' },
      h('div', { className: 'wb-cm-cgrid' },
        cfield('Contract reference', 'reference', { placeholder: 'e.g. EVAL-2026-014' }),
        cfield('Commissioner', 'commissioner', { placeholder: 'commissioning body' }),
        cfield('Evaluation team', 'evaluator', { placeholder: 'contracted evaluator' }),
        cfield('Start date', 'start_date', { type: 'date' }),
        cfield('End date', 'end_date', { type: 'date' }),
        cfield('Currency', 'currency', { type: 'select', options: CURRENCIES, def: 'USD' }),
        cfield('Contract ceiling (base)', 'total_budget', { type: 'number', placeholder: '0' })),
      ceilingDelta ? h('div', { className: 'wb-cm-recon' }, 'Ceiling after amendments: ' + PS.money(budgetTotal, cur)
        + (effEnd !== contract.end_date ? ' · period extended to ' + PS.fdate(effEnd) : '')) : null,
      h('div', { style: { marginTop: 16 } },
        h('div', { className: 'wb-cm-cfield-label', style: { marginBottom: 6 } }, 'Amendments and variations'),
        amendments.length
          ? h('div', { className: 'wb-table-container' },
              h('table', { className: 'wb-table wb-cm-table' },
                h('thead', null, h('tr', null,
                  h('th', { className: 'wb-th--center', style: { minWidth: 128 } }, 'Date'),
                  h('th', null, 'Description'),
                  h('th', { className: 'wb-th--center' }, 'Ceiling change'),
                  h('th', { className: 'wb-th--center', style: { minWidth: 128 } }, 'New end date'),
                  h('th', null, 'Reason'),
                  h('th', { className: 'wb-th--center' }, ''))),
                h('tbody', null, amendmentRows)))
          : h('p', { className: 'wb-cm-hint' }, 'No amendments recorded. Log any variation to the ceiling, period or scope here so the contract file stays defensible.'),
        h('div', { className: 'wb-cm-add' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addAmendment }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add amendment')))));

    // ---- burn strip (cockpit KPI family) ------------------------------------
    var stats = h('div', { className: 'wb-cm-kpis' },
      A.kpi('Contract value', PS.money(budgetTotal, cur), ceilingDelta ? 'incl. ' + amendments.length + ' amendment(s)' : null),
      A.kpi('Committed', PS.money(committed, cur), (budgetTotal ? Math.round(100 * committed / budgetTotal) : 0) + '% of value', overCommitted ? 'warn' : null),
      A.kpi('Paid', PS.money(paid, cur), (budgetTotal ? Math.round(100 * paid / budgetTotal) : 0) + '% of value'),
      A.kpi('Remaining', PS.money(remaining, cur), overCommitted ? 'over-committed' : 'uncommitted', overCommitted ? 'warn' : 'good'));

    // ---- budget lines (editable) --------------------------------------------
    var budgetRows = budget.map(function(l) {
      var cats = BUDGET_CATEGORIES.slice();
      if (l.category && cats.indexOf(l.category) < 0) cats = [l.category].concat(cats);
      return h('tr', { key: l.id },
        h('td', null, h('select', { className: 'wb-input wb-cm-select', style: { minWidth: 140 }, 'aria-label': 'Category',
          key: 'cat:' + l.id + ':' + (l.category || ''), defaultValue: l.category || '',
          onChange: function(e) { editBudget(l.id, 'category', e.target.value); } },
          cats.map(function(c) { return h('option', { key: c, value: c }, c); }))),
        h('td', null,
          h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'Role or line item', 'aria-label': 'Role or line',
            key: 'role:' + l.id + ':' + (l.role || ''), defaultValue: l.role || '',
            onBlur: function(e) { editBudget(l.id, 'role', e.target.value); } }),
          h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--sub', type: 'text', placeholder: 'Description (optional)', 'aria-label': 'Description',
            key: 'desc:' + l.id + ':' + (l.description || ''), defaultValue: l.description || '',
            onBlur: function(e) { editBudget(l.id, 'description', e.target.value); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', 'aria-label': 'Quantity', style: { width: 76 },
          key: 'qty:' + l.id + ':' + (l.quantity == null ? '' : l.quantity), defaultValue: l.quantity == null ? '' : l.quantity,
          onBlur: function(e) { editBudget(l.id, 'quantity', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', 'aria-label': 'Rate', style: { width: 92 },
          key: 'rate:' + l.id + ':' + (l.rate == null ? '' : l.rate), defaultValue: l.rate == null ? '' : l.rate,
          onBlur: function(e) { editBudget(l.id, 'rate', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', 'aria-label': 'Amount', style: { width: 108 },
          key: 'amt:' + l.id + ':' + (l.amount == null ? '' : l.amount), defaultValue: l.amount == null ? '' : l.amount,
          onBlur: function(e) { editBudget(l.id, 'amount', numOrNull(e.target.value)); } })),
        h('td', { className: 'wb-td--num wb-th--center' }, budgetTotal ? Math.round(100 * (l.amount || 0) / budgetTotal) + '%' : '-'),
        h('td', { className: 'wb-th--center' }, removeCell('bl:' + l.id, 'Remove budget line', function() { removeBudget(l.id); })));
    });

    var budgetSection = h(SectionCard, { title: 'Budget', badge: PS.money(budgetLineSum, cur), variant: overCommitted ? 'warning' : null },
      budget.length
        ? h('div', { className: 'wb-table-container' },
            h('table', { className: 'wb-table wb-cm-table' },
              h('thead', null, h('tr', null,
                h('th', null, 'Category'), h('th', null, 'Role / line'),
                h('th', { className: 'wb-th--center' }, 'Quantity'),
                h('th', { className: 'wb-th--center' }, 'Rate'),
                h('th', { className: 'wb-th--center' }, 'Amount'),
                h('th', { className: 'wb-th--center' }, 'Share'),
                h('th', { className: 'wb-th--center' }, ''))),
              h('tbody', null, budgetRows),
              h('tfoot', null, h('tr', { className: 'wb-plan-total-row' },
                h('td', { colSpan: 4 }, 'Total of budget lines'),
                h('td', { className: 'wb-td--num wb-th--center' }, PS.money(budgetLineSum, cur)),
                h('td', { className: 'wb-td--num wb-th--center' }, budgetTotal ? Math.round(100 * budgetLineSum / budgetTotal) + '%' : '-'),
                h('td', null, '')))))
        : h('p', { className: 'wb-cm-hint' }, 'No budget lines yet. Add the cost lines that make up the contract ceiling.'),
      (budgetTotal && Math.abs(budgetLineSum - budgetTotal) > 1)
        ? h('div', { className: 'wb-cm-recon' }, 'Budget lines sum to ' + PS.money(budgetLineSum, cur) + ', which differs from the contract ceiling of ' + PS.money(budgetTotal, cur) + '.') : null,
      overCommitted ? h('div', { className: 'wb-cm-over' }, 'Committed ' + PS.money(committed, cur) + ' exceeds the contract ceiling of ' + PS.money(budgetTotal, cur) + ' by ' + PS.money(-remaining, cur) + '.') : null,
      h('div', { className: 'wb-cm-add' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addBudget }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add budget line'))),
      h('div', { className: 'wb-plan-budgetbar', style: { marginTop: 14 } },
        h('div', { className: 'wb-plan-budgetbar-row' }, h('span', null, 'Committed'), h('span', null, PS.money(committed, cur) + ' of ' + PS.money(budgetTotal, cur))),
        A.meterBar(budgetTotal ? 100 * committed / budgetTotal : 0, overCommitted ? 'red' : 'teal', 'Committed')),
      h('div', { className: 'wb-plan-budgetbar' },
        h('div', { className: 'wb-plan-budgetbar-row' }, h('span', null, 'Paid to date'), h('span', null, PS.money(paid, cur) + ' of ' + PS.money(budgetTotal, cur))),
        A.meterBar(budgetTotal ? 100 * paid / budgetTotal : 0, 'green', 'Paid')));

    // ---- deliverables (self-sufficient: author, status, rate, accept) -------
    var delRows = deliverables.map(function(d) {
      var mean = PS.ratingMean(d.rating, PS.rubricFor(d));
      var expanded = ratingId === d.id;
      var canRate = d.status !== 'not_started' || !!d.rating;
      var statusKeys = Object.keys(PS.DELIV_STATUS);

      // The review cell adapts to workflow status: quick accept/revise from submitted, an
      // editable acceptance record once accepted (reversible), a revision reason once returned.
      var reviewBits = [];
      if (d.status === 'submitted') {
        var blk = acceptBlock(d);
        reviewBits.push(h('div', { key: 'act', className: 'wb-cm-acc-row' },
          h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { tryAccept(d); } }, 'Accept'),
          h('button', { className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { reviseDeliverable(d); } }, 'Request revision')));
        if (blk && overrideId !== d.id) {
          reviewBits.push(h('div', { key: 'blk', className: 'wb-cm-recon' }, blk + ' Accepting requires an override.'));
        }
        if (overrideId === d.id) {
          reviewBits.push(h('div', { key: 'ovr', className: 'wb-cm-acc' },
            h('div', { className: 'wb-cm-acc-when', style: { color: 'var(--red-strong)' } }, blk),
            h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'reason for accepting despite this (required)', 'aria-label': 'Override reason',
              value: overrideReason, onChange: function(e) { setOverrideReason(e.target.value); } }),
            h('div', { className: 'wb-cm-acc-row' },
              h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', disabled: !overrideReason.trim(),
                onClick: function() { if (overrideReason.trim()) acceptDeliverable(d, overrideReason.trim()); } }, 'Accept with override'),
              h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { setOverrideId(null); setOverrideReason(''); } }, 'Cancel'))));
        }
      }
      if (d.status === 'accepted') {
        reviewBits.push(h('div', { key: 'accrec', className: 'wb-cm-acc' },
          h('div', { className: 'wb-cm-acc-row' },
            h('span', { className: 'wb-cm-acc-when' }, d.accepted_at ? 'Accepted ' + PS.fdate(d.accepted_at) : 'Accepted, date not recorded'),
            h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { undoAcceptance(d); } }, 'Withdraw')),
          d.acceptance_override ? h('div', { className: 'wb-cm-recon' }, 'Accepted by override: ' + d.acceptance_override.reason) : null,
          h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'accepting officer (name and role)', 'aria-label': 'Accepted by',
            key: 'accby:' + d.id + ':' + (d.accepted_by || ''), defaultValue: d.accepted_by || '',
            onBlur: function(e) { editDel(d.id, 'accepted_by', e.target.value); } }),
          h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'conditions of acceptance (optional)', 'aria-label': 'Acceptance conditions',
            key: 'accnote:' + d.id + ':' + (d.acceptance_note || ''), defaultValue: d.acceptance_note || '',
            onBlur: function(e) { editDel(d.id, 'acceptance_note', e.target.value); } })));
      }
      if (d.status === 'revise') {
        reviewBits.push(h('input', { key: 'rev:' + d.id + ':' + (d.revision_reason || ''), className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'reason revision was requested', 'aria-label': 'Revision reason',
          defaultValue: d.revision_reason || '',
          onBlur: function(e) { editDel(d.id, 'revision_reason', e.target.value); } }));
      }
      if (d.status === 'not_started' || d.status === 'in_progress') {
        reviewBits.push(h('span', { key: 'await', className: 'wb-cm-acc-when' }, 'Awaiting submission'));
      }
      if (canRate) {
        reviewBits.push(h('button', { key: 'rate', className: 'wb-btn wb-btn-sm wb-btn-ghost', style: { display: 'inline-flex', alignItems: 'center', gap: 6 },
          'aria-expanded': expanded ? 'true' : 'false', 'aria-controls': 'rate-' + d.id,
          onClick: function() { setRatingId(expanded ? null : d.id); } },
          (mean != null ? 'Edit quality rating' : 'Rate quality'), expanded ? I.chevronUp(12) : I.chevronDown(12)));
      }
      var reviewCell = h('td', null, h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' } }, reviewBits));

      var main = h('tr', { key: d.id },
        h('td', null,
          h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'deliverable title', 'aria-label': 'Deliverable title',
            key: 'title:' + d.id, defaultValue: PS.delTitle(d), onBlur: function(e) { editDel(d.id, 'title', e.target.value); } }),
          h('div', { style: { display: 'flex', gap: 6, marginTop: 4 } },
            h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'code', 'aria-label': 'Deliverable code', style: { width: 90 },
              key: 'code:' + d.id, defaultValue: d.code || '', onBlur: function(e) { editDel(d.id, 'code', e.target.value); } }),
            h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--sub', type: 'text', placeholder: 'description (optional)', 'aria-label': 'Deliverable description', style: { flex: 1, marginTop: 0 },
              key: 'ddesc:' + d.id, defaultValue: d.description || '', onBlur: function(e) { editDel(d.id, 'description', e.target.value); } }))),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', 'aria-label': 'Due date',
          key: 'due:' + d.id + ':' + (d.due_date || ''), defaultValue: d.due_date || '', onBlur: function(e) { editDel(d.id, 'due_date', e.target.value); } })),
        h('td', null, h('select', { className: 'wb-input wb-cm-select', 'aria-label': 'Workflow status for ' + (PS.delTitle(d) || 'deliverable'),
          value: d.status || 'not_started', onChange: function(e) { setDelStatus(d, e.target.value); } },
          statusKeys.map(function(k) { return h('option', { key: k, value: k }, PS.DELIV_STATUS[k].label); }))),
        h('td', { className: 'wb-th--center' },
          h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', min: 0, max: 100, step: 5, 'aria-label': 'Payment percent for ' + (PS.delTitle(d) || 'deliverable'),
            key: 'pay:' + d.id + ':' + (d.payment_percent == null ? '' : d.payment_percent), defaultValue: d.payment_percent == null ? '' : d.payment_percent,
            style: { width: 60, display: 'inline-block' }, onBlur: function(e) { setPayment(d.id, e.target.value); } }),
          h('span', { className: 'wb-cm-acc-when', style: { marginLeft: 4 } }, '%')),
        h('td', null, PS.qualityMark(d)),
        reviewCell,
        h('td', { className: 'wb-th--center' }, removeCell('del:' + d.id, 'Remove ' + (PS.delTitle(d) || 'deliverable'), function() { removeDeliverable(d); })));
      if (!expanded) return main;
      var detail = h('tr', { key: d.id + '_rate', className: 'wb-plan-review-detail' },
        h('td', { colSpan: 7, id: 'rate-' + d.id },
          PS.ratingPanel(d, ratingApi),
          h('div', { className: 'wb-cm-cfield', style: { marginTop: 10, maxWidth: 340 } },
            h('label', { className: 'wb-cm-cfield-label' }, 'Rated by'),
            h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'reviewer name and role', 'aria-label': 'Rated by',
              key: 'ratedby:' + d.id + ':' + ((d.rating && d.rating.rated_by) || ''), defaultValue: (d.rating && d.rating.rated_by) || '',
              onBlur: function(e) { ratingApi.setRatedBy(d.id, e.target.value); } }))));
      return [main, detail];
    });

    var delSection = h(SectionCard, { title: 'Deliverables and quality review', badge: toReview ? toReview + ' to review' : deliverables.length + ' items', variant: toReview ? 'warning' : null },
      h('p', { className: 'wb-cm-panel-intro' }, 'Author and track each deliverable, set its status, rate its quality against the harmonized rubric to inform the decision, then accept it. Acceptance releases the linked milestone payment.'),
      deliverables.length
        ? h('div', { className: 'wb-table-container' },
            h('table', { className: 'wb-table wb-cm-table' },
              h('thead', null, h('tr', null,
                h('th', null, 'Deliverable'),
                h('th', { className: 'wb-th--center', style: { minWidth: 132 } }, 'Due'),
                h('th', { style: { minWidth: 130 } }, 'Status'),
                h('th', { className: 'wb-th--center' }, 'Payment'),
                h('th', { style: { minWidth: 150 } }, 'Quality'),
                h('th', { style: { minWidth: 180 } }, 'Review and acceptance'),
                h('th', { className: 'wb-th--center' }, ''))),
              h('tbody', null, delRows)))
        : h('p', { className: 'wb-cm-hint' }, 'No deliverables yet. Add the ToR deliverables with their due dates and payment shares to build the schedule.'),
      h('div', { className: 'wb-cm-add' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addDeliverable }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add deliverable'))));

    // ---- invoices (create, edit, return, approve, pay) ----------------------
    var invRows = invoices.map(function(iv) {
      var del = deliverables.filter(function(d) { return d.id === iv.deliverable_id; })[0];
      var typ = PS.invoiceType(iv);
      var linkedAccepted = !!del && del.status === 'accepted';
      var canApprove = (!typ.gated || linkedAccepted) && !gateReturned;
      var lockLabel = gateReturned ? 'On hold (design returned)' : 'Locked until accepted';
      var lockTitle = gateReturned
        ? 'The inception gate returned the design for redesign (C2 Assure); payment is on hold until the gate clears.'
        : 'A milestone payment is released only after the linked deliverable is accepted.';
      var milestoneValue = (del && del.payment_percent != null && budgetTotal) ? budgetTotal * del.payment_percent / 100 : null;
      var overMilestone = milestoneValue != null && iv.amount != null && iv.amount > milestoneValue + 1;

      var actionCell;
      if (iv.status === 'submitted') {
        actionCell = h('div', { className: 'wb-cm-acc-row' },
          canApprove
            ? h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: function() { approveInvoice(iv); } }, 'Approve')
            : h('span', { className: 'wb-plan-lock', title: lockTitle }, lockLabel),
          h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { returnInvoice(iv); } }, 'Return'));
      } else if (iv.status === 'approved') {
        actionCell = h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' } },
          h('div', { className: 'wb-cm-acc-row' },
            h('button', { className: 'wb-btn wb-btn-sm', onClick: function() { payInvoice(iv); } }, 'Mark paid'),
            iv.approved_at ? h('span', { className: 'wb-cm-acc-when' }, 'Approved ' + PS.fdate(iv.approved_at)) : null),
          h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'approved by', 'aria-label': 'Approved by',
            key: 'apby:' + iv.id + ':' + (iv.approved_by || ''), defaultValue: iv.approved_by || '', style: { minWidth: 150 },
            onBlur: function(e) { editInvoice(iv.id, 'approved_by', e.target.value); } }));
      } else if (iv.status === 'paid') {
        actionCell = h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' } },
          h('span', { className: 'wb-cm-acc-when' }, iv.paid_date ? 'Paid ' + PS.fdate(iv.paid_date) : 'Paid'),
          h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'paid by', 'aria-label': 'Paid by',
            key: 'pby:' + iv.id + ':' + (iv.paid_by || ''), defaultValue: iv.paid_by || '', style: { minWidth: 150 },
            onBlur: function(e) { editInvoice(iv.id, 'paid_by', e.target.value); } }));
      } else { // draft or returned
        actionCell = h('button', { className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { submitInvoice(iv); } }, 'Submit');
      }

      return h('tr', { key: iv.id },
        h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'number', 'aria-label': 'Invoice number', style: { minWidth: 100 },
          key: 'num:' + iv.id + ':' + (iv.number || ''), defaultValue: iv.number || '', onBlur: function(e) { editInvoice(iv.id, 'number', e.target.value); } })),
        h('td', null, h('select', { className: 'wb-input wb-cm-select', 'aria-label': 'Linked deliverable',
          value: iv.deliverable_id || '', onChange: function(e) { editInvoice(iv.id, 'deliverable_id', e.target.value); } },
          [h('option', { key: '_none', value: '' }, 'None (advance / period)')].concat(
            deliverables.map(function(d) { return h('option', { key: d.id, value: d.id }, (d.code ? d.code + ' ' : '') + (PS.delTitle(d) || 'deliverable')); })))),
        h('td', null, h('select', { className: 'wb-input wb-cm-select', 'aria-label': 'Invoice type',
          value: iv.type || 'milestone', onChange: function(e) { editInvoice(iv.id, 'type', e.target.value); } },
          PS.INVOICE_TYPES.map(function(t) { return h('option', { key: t.key, value: t.key }, t.label); }))),
        h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', 'aria-label': 'Issued date',
          key: 'iss:' + iv.id + ':' + (iv.issued_date || ''), defaultValue: iv.issued_date || '', onBlur: function(e) { editInvoice(iv.id, 'issued_date', e.target.value); } })),
        h('td', { className: 'wb-th--center' },
          h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--num', type: 'number', 'aria-label': 'Amount', style: { width: 110 },
            key: 'amt:' + iv.id + ':' + (iv.amount == null ? '' : iv.amount), defaultValue: iv.amount == null ? '' : iv.amount,
            onBlur: function(e) { editInvoice(iv.id, 'amount', numOrNull(e.target.value)); } }),
          overMilestone ? h('span', { className: 'wb-cm-recon' }, 'exceeds milestone value ' + PS.money(milestoneValue, cur)) : null),
        h('td', null, PS.statusPill(PS.INVOICE_STATUS, iv.status)),
        h('td', null, actionCell),
        h('td', { className: 'wb-th--center' }, removeCell('inv:' + iv.id, 'Remove invoice', function() { removeInvoice(iv); })));
    });

    var invSection = h(SectionCard, { title: 'Invoices', badge: PS.money(paid, cur) + ' paid' },
      h('p', { className: 'wb-cm-panel-intro' }, 'Record each invoice against the contract. Milestone invoices unlock for approval once the linked deliverable is accepted; advance and retainer invoices are approved under a separate authorization.'),
      invoices.length
        ? h('div', { className: 'wb-table-container' },
            h('table', { className: 'wb-table wb-cm-table' },
              h('thead', null, h('tr', null,
                h('th', null, 'Invoice'), h('th', null, 'Deliverable'), h('th', null, 'Type'),
                h('th', { className: 'wb-th--center', style: { minWidth: 128 } }, 'Issued'),
                h('th', { className: 'wb-th--center' }, 'Amount'), h('th', null, 'Status'),
                h('th', { style: { minWidth: 170 } }, 'Action'),
                h('th', { className: 'wb-th--center' }, ''))),
              h('tbody', null, invRows)))
        : h('p', { className: 'wb-cm-hint' }, 'No invoices recorded. Add an invoice to bill against the contract.'),
      h('div', { className: 'wb-cm-add' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addInvoice }, I.plus(14), h('span', { style: { marginLeft: 6 } }, 'Add invoice'))));

    return h('div', { className: 'wb-cm-contract' }, head, headerCard, stats, budgetSection, delSection, invSection);
  }

  window.CockpitContract = CockpitContract;
})();
