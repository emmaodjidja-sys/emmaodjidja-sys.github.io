/**
 * CockpitDeliver: C3 Deliver (rail index 4). "Hold delivery to schedule, endorse the report."
 * Tracks every planned deliverable against its due date and review body so slippage is
 * visible while it can still be managed, surfaces the derived overdue / due-soon alerts with
 * one-click email and calendar actions, keeps a delivery-risk register, and closes with the
 * formal report acceptance where the TRUE strength-of-evidence rating is set per evaluation
 * question (higher is stronger).
 *
 * Reads the unified planning.deliverables (single source of truth; the schedule status is
 * DERIVED via CockpitData.deliverableStatus, never stored here, editing the canonical
 * workflow status is C1 Contract's job) plus commissioner.risks and commissioner.report_review.
 * Returns ONLY the station body; CockpitShell renders the persistent cockpit header above.
 * Ported markup/classes come from the old Commissioner.deliverMovement.
 * window.CockpitDeliver. No-JSX React.createElement house style.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var I = window.PraxisIcons;
  var U = window.PraxisUtils;
  var A = window.CockpitAtoms;
  var D = window.CockpitData;
  var CA = window.CockpitAlerts;
  var SectionCard = window.SectionCard;

  var moveHead = A.moveHead, statusBadge = A.statusBadge, agingChip = A.agingChip;

  // Local-date milliseconds (never new Date('YYYY-MM-DD'), which is UTC midnight and shifts a
  // calendar day west of UTC). Mirrors PraxisUtils.daysUntilLocal so the today marker lines up
  // with the aging chips.
  function ms(iso) { var a = U.ymd(iso); return a ? new Date(a[0], a[1] - 1, a[2]).getTime() : null; }
  function todayMs() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime(); }
  function byDue(a, b) { var x = ms(a.due_date), y = ms(b.due_date); if (x == null) return 1; if (y == null) return -1; return x - y; }

  // Horizontal milestone track with a today marker. Read-only at-a-glance; the table below
  // manages the detail. Dot colour is the DERIVED schedule status of each deliverable.
  // Schedules routinely land two deliverables on the same date, so the shared TimeTrack
  // clusters those onto one dot and packs the labels into non-overlapping lanes.
  function milestoneTrack(dels) {
    var points = dels.filter(function(d) { return ms(d.due_date) != null; }).map(function(d) {
      var sched = D.DELIV_SCHED[D.deliverableStatus(d)] || D.DELIV_SCHED.planned;
      return { t: ms(d.due_date), iso: d.due_date, code: d.title || 'deliverable', color: sched.dot, upcoming: false };
    });
    var clusters = D.clusterTrackPoints(points);
    if (clusters.length < 2) return null;

    function phrase(c) { return c.codes.join('; ') + ', due ' + D.fdate(c.iso); }

    return h(A.TimeTrack, {
      clusters: clusters,
      todayT: todayMs(),
      label: 'Delivery timeline with ' + points.length + ' milestones',
      rowHeight: 42,
      nameLines: 2,
      labelWidth: 104,
      tooltip: phrase,
      sr: phrase
    });
  }

  function CockpitDeliver(props) {
    var context = props.state.context;
    var dispatch = props.dispatch;
    var alerts = props.alerts || [];
    var api = window.CockpitSave.make(context, dispatch);

    var deliverables = (context.planning && context.planning.deliverables) || [];
    var cm = context.commissioner || {};
    var risks = cm.risks || [];
    var rows = (context.evaluation_matrix && context.evaluation_matrix.rows) || [];
    var report = cm.report_review || { evidence: [] };
    var gate = cm.gate || {};

    // Endorsement-override prompt state (the accept toggle opens it when preconditions are unmet).
    var eo = React.useState(false), endorseOverride = eo[0], setEndorseOverride = eo[1];
    var eor = React.useState(''), endorseReason = eor[0], setEndorseReason = eor[1];

    var riskApi = api.listSetter('risks');

    // Deliverables are authored and edited in C1 Contract (the single owner of their identity,
    // due dates, quality and acceptance); C3 is a read-only delivery tracker over the same list.
    var AT = PraxisContext.ACTION_TYPES;
    function goContract() { dispatch({ type: AT.SET_COMMISSIONER_STATION, station: 2 }); }
    function addRisk() {
      riskApi.add({ id: U.uid('rsk_'), risk: '', category: '', likelihood: 'medium', impact: 'medium', mitigation: '', owner: '', status: 'open' }, 'Risk added');
    }

    // The derived deliverable alert (overdue / due-soon) for a deliverable id, matched on the
    // alert's stableId so the row can offer one-click email and calendar actions.
    function deliverableAlert(id) {
      for (var i = 0; i < alerts.length; i++) {
        var a = alerts[i];
        if (a.stableId === id && (a.kind === 'deliverable_overdue' || a.kind === 'deliverable_due')) return a;
      }
      return null;
    }
    function alertCell(a) {
      if (!a) return h('span', { className: 'wb-cm-muted' }, '-');
      return h('div', { className: 'wb-cm-alert-actions', style: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' } },
        h('a', { className: 'wb-btn wb-btn-sm wb-btn-outline', href: CA.mailtoForAlert(a), 'aria-label': 'Email the review body about ' + a.title }, 'Email owner'),
        h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { CA.downloadIcsForAlert(a); } }, 'Add to calendar'));
    }

    // ---- delivery schedule (planning.deliverables; schedule status DERIVED) -----------------
    var scheduleBody = deliverables.length ? h(React.Fragment, null,
      milestoneTrack(deliverables),
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Deliverable'),
            h('th', null, 'Reviewers'),
            h('th', { className: 'wb-th--center', style: { minWidth: 132 } }, 'Due'),
            h('th', { style: { minWidth: 110 } }, 'Status'),
            h('th', { style: { minWidth: 132 } }, 'Alerts'))),
          h('tbody', null, deliverables.slice().sort(byDue).map(function(d) {
            var schedKey = D.deliverableStatus(d);
            var isOpen = schedKey !== 'accepted';
            var lead = (d.alert && typeof d.alert.lead_days === 'number') ? d.alert.lead_days : 14;
            // Title and due date are read-only here (owned by C1 Contract); reviewers, the review
            // body, remain editable on this delivery surface.
            return h('tr', { key: d.id },
              h('td', null,
                h('div', { className: 'wb-cm-inp--strong', style: { color: 'var(--text)' } }, (d.code ? d.code + '  ' : '') + (d.title || '(untitled deliverable)')),
                d.type ? h('span', { className: 'wb-cm-inp--sub wb-cm-muted' }, d.type) : null),
              h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'review body', defaultValue: d.reviewers || '', 'aria-label': 'Reviewers for ' + (d.title || 'deliverable'), onBlur: function(e) { api.patchDeliverable(d.id, { reviewers: e.target.value }); } })),
              h('td', { className: 'wb-th--center' },
                h('span', { className: 'wb-cm-date', style: { display: 'inline-block' } }, D.fdate(d.due_date)),
                agingChip(d.due_date, isOpen, lead)),
              h('td', null, statusBadge(D.DELIV_SCHED, schedKey)),
              h('td', null, alertCell(deliverableAlert(d.id))));
          }))))
    ) : h('div', { className: 'wb-station-empty' },
        h('div', { className: 'wb-station-empty-title' }, 'No delivery schedule yet'),
        h('div', { className: 'wb-station-empty-desc' }, 'Deliverables and their due dates are managed in C1 Contract. Add them there and they appear here to track to on-time delivery.'),
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: goContract }, 'Open C1 Contract')));

    // ---- delivery risks --------------------------------------------------------------------
    var openRisks = risks.filter(function(r) { return r.status !== 'closed'; }).length;
    function riskTable() {
      if (!risks.length) return h('p', { className: 'wb-cm-hint' }, 'No risks logged.');
      return h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Risk'),
            h('th', null, 'Mitigation'),
            h('th', null, 'Owner'),
            h('th', { className: 'wb-th--center', style: { width: 76 } }, 'L / I'),
            h('th', { style: { minWidth: 110 } }, 'Status'),
            h('th', { style: { width: 34 } }, ''))),
          h('tbody', null, risks.map(function(r) {
            return h('tr', { key: r.id },
              h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'risk', defaultValue: r.risk || '', 'aria-label': 'Risk', onBlur: function(e) { riskApi.set(r.id, { risk: e.target.value }); } })),
              h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'mitigation', defaultValue: r.mitigation || '', 'aria-label': 'Mitigation', onBlur: function(e) { riskApi.set(r.id, { mitigation: e.target.value }); } })),
              h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'owner', defaultValue: r.owner || '', 'aria-label': 'Owner', onBlur: function(e) { riskApi.set(r.id, { owner: e.target.value }); } })),
              h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-li' },
                h('span', { className: 'wb-cm-li-b wb-cm-li-b--' + (r.likelihood || 'medium'), title: 'Likelihood: ' + (r.likelihood || 'medium') }, (r.likelihood || 'm').charAt(0).toUpperCase()),
                h('span', { className: 'wb-cm-li-b wb-cm-li-b--' + (r.impact || 'medium'), title: 'Impact: ' + (r.impact || 'medium') }, (r.impact || 'm').charAt(0).toUpperCase()))),
              h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.status || 'open', 'aria-label': 'Risk status', onChange: function(e) { riskApi.set(r.id, { status: e.target.value }); } },
                Object.keys(D.RISK_STATUS).map(function(k) { return h('option', { key: k, value: k }, D.RISK_STATUS[k].label); }))),
              h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove risk', onClick: function() { riskApi.remove(r.id, 'Risk removed'); } }, I.close(14))));
          }))));
    }

    // ---- report acceptance (the Endorse act; TRUE strength of evidence, higher = stronger) --
    var evMap = D.evidenceMap(report.evidence);
    var ratedCount = (report.evidence || []).filter(function(e) { return typeof e.strength === 'number'; }).length;

    // One canonical save shape for every report_review edit; setReportReview merges it in.
    function saveReport(over, msg, log) {
      var next = {
        accepted: !!report.accepted,
        accepted_by: report.accepted_by || '',
        accepted_at: report.accepted_at || null,
        evidence: (report.evidence || []).slice()
      };
      Object.assign(next, over);
      api.setReportReview(next, msg, log);
    }
    function upsertEvidence(eqId, over) {
      var found = false;
      var next = (report.evidence || []).map(function(e) { if (e.eq_id === eqId) { found = true; return Object.assign({}, e, over); } return e; });
      if (!found) next = next.concat([Object.assign({ eq_id: eqId, strength: null, note: '' }, over)]);
      return next;
    }
    // Endorsement preconditions: every evaluation question rated for strength of evidence, the
    // inception gate not returned for redesign, and all gate conditions resolved. Endorsing over
    // an unmet precondition is possible only with a recorded override reason.
    var unresolvedConds = (gate.conditions || []).filter(function(c) { return !c.resolved; }).length;
    var endorseBlockers = [];
    if (!(rows.length && ratedCount === rows.length)) endorseBlockers.push((rows.length - ratedCount) + ' of ' + rows.length + ' questions not yet rated for strength of evidence');
    if (gate.decision === 'return') endorseBlockers.push('the inception gate returned the design for redesign');
    if (unresolvedConds) endorseBlockers.push(unresolvedConds + ' inception condition(s) not resolved');
    var canEndorse = endorseBlockers.length === 0;

    function acceptClean(over) {
      var patch = { accepted: true, accepted_at: new Date().toISOString() };
      if (over) patch.accepted_override = { reason: over, at: new Date().toISOString() };
      saveReport(patch, over ? 'Final report accepted with override' : 'Final report accepted',
        { action: 'endorse', detail: 'Endorsed the final report' + (over ? ' by override: ' + over : '') });
      setEndorseOverride(false); setEndorseReason('');
    }
    function toggleAccepted() {
      if (report.accepted) { saveReport({ accepted: false, accepted_at: null, accepted_override: null }, 'Acceptance cleared', { action: 'withdraw', detail: 'Cleared final-report acceptance' }); return; }
      if (canEndorse) acceptClean(null);
      else { setEndorseOverride(true); setEndorseReason(''); }
    }

    var acceptBlock = h('div', { className: 'wb-cm-decision' },
      h('div', { className: 'wb-cm-decision-head' },
        h('button', { type: 'button', className: 'wb-cm-cond-check' + (report.accepted ? ' wb-cm-cond-check--on' : ''), role: 'checkbox', 'aria-checked': report.accepted ? 'true' : 'false', 'aria-label': 'Final report accepted', onClick: toggleAccepted }, report.accepted ? I.check(12) : ''),
        h('span', { className: 'wb-cm-decision-title' }, 'Final report accepted'),
        report.accepted ? h('span', { className: 'wb-badge wb-badge-green' }, 'Accepted') : null,
        report.accepted && report.accepted_at ? h('span', { className: 'wb-cm-decision-when' }, D.fdate(report.accepted_at)) : null),
      (!report.accepted && !canEndorse && !endorseOverride) ? h('p', { className: 'wb-cm-recon' }, 'Endorsement is blocked: ' + endorseBlockers.join('; ') + '. Resolve these or endorse with a recorded override.') : null,
      (report.accepted && report.accepted_override) ? h('p', { className: 'wb-cm-recon' }, 'Accepted by override: ' + report.accepted_override.reason) : null,
      (!report.accepted && endorseOverride) ? h('div', { className: 'wb-cm-acc' },
        h('div', { className: 'wb-cm-acc-when', style: { color: 'var(--red-strong)' } }, 'Endorsing despite: ' + endorseBlockers.join('; ') + '.'),
        h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'reason for endorsing despite this (required)', 'aria-label': 'Endorsement override reason',
          value: endorseReason, onChange: function(e) { setEndorseReason(e.target.value); } }),
        h('div', { className: 'wb-cm-acc-row' },
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-primary', disabled: !endorseReason.trim(), onClick: function() { if (endorseReason.trim()) acceptClean(endorseReason.trim()); } }, 'Endorse with override'),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: function() { setEndorseOverride(false); setEndorseReason(''); } }, 'Cancel'))) : null,
      h('div', { className: 'wb-cm-focus-field', style: { marginTop: 10 } },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-accepted-by' }, 'Accepted by'),
        h('input', { id: 'cm-accepted-by', className: 'wb-input wb-cm-focus-input', type: 'text', placeholder: 'name and role of the accepting officer', defaultValue: report.accepted_by || '', 'aria-label': 'Accepted by', onBlur: function(e) { saveReport({ accepted_by: e.target.value }); } })));

    var soeTable = rows.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', { style: { width: 34 } }, '#'),
          h('th', null, 'Evaluation question'),
          h('th', { className: 'wb-th--center', style: { minWidth: 150 } }, 'Strength of evidence'),
          h('th', null, 'Note'))),
        h('tbody', null, rows.map(function(r) {
          var ev = evMap[r.id] || {};
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, r.number != null ? r.number : ''),
            h('td', null, h('div', { className: 'wb-cm-eq' }, r.question || '(untitled question)')),
            h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-soe', role: 'group', 'aria-label': 'Strength of evidence for question ' + (r.number != null ? r.number : '') + ': ' + (r.question || 'untitled') },
              D.SOE.map(function(s) {
                var on = ev.strength === s.v;
                // CockpitData.SOE is higher = stronger; colour the on-state directly from the
                // band so the mark never depends on the legacy inverted CSS index.
                return h('button', { key: s.v, type: 'button',
                  className: 'wb-cm-soe-btn' + (on ? ' wb-cm-soe-btn--on' : ''),
                  style: on ? { background: s.color, borderColor: 'transparent', color: '#fff' } : null,
                  title: s.v + ' - ' + s.label + ': ' + s.desc,
                  'aria-label': 'Strength of evidence ' + s.v + ', ' + s.label,
                  'aria-pressed': on ? 'true' : 'false',
                  onClick: function() { saveReport({ evidence: upsertEvidence(r.id, { strength: s.v }) }, 'Strength of evidence rated'); } }, String(s.v));
              }))),
            h('td', null, h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'why this rating', defaultValue: ev.note || '', 'aria-label': 'Evidence note for question ' + (r.number != null ? r.number : ''), onBlur: function(e) { saveReport({ evidence: upsertEvidence(r.id, { note: e.target.value }) }); } })));
        })))) : h('p', { className: 'wb-cm-hint' }, 'No evaluation questions yet. Build the matrix in Station 2, and each question appears here to rate at report acceptance.');

    // ---- empty state: nothing scheduled and nothing accepted yet ---------------------------
    var hasReport = !!(report.accepted || (report.evidence && report.evidence.length) || (report.accepted_by && String(report.accepted_by).trim()));
    if (!deliverables.length && !hasReport) {
      return h('section', { className: 'wb-cm-move', 'aria-label': 'Deliver' },
        moveHead('C3', 'Deliver', 'Hold delivery to schedule', 'Track every deliverable against its due date and review body, so slippage is visible while it can still be managed, then accept the final report.'),
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Set up the delivery schedule'),
          h('div', { className: 'wb-station-empty-desc' }, 'Deliverables and their due dates are managed in C1 Contract. Add them there to track to on-time delivery. The final report is then accepted here, where the strength of evidence is rated per question.'),
          h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: goContract }, 'Open C1 Contract'))));
    }

    var acceptBadge = report.accepted ? 'Accepted' : (rows.length ? (ratedCount + ' / ' + rows.length + ' rated') : 'Pending');

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Deliver' },
      moveHead('C3', 'Deliver', 'Hold delivery to schedule', 'Track every deliverable against its due date and review body, so slippage is visible while it can still be managed, then accept the final report.'),
      h(SectionCard, { title: 'Delivery schedule', badge: deliverables.length ? deliverables.length + ' deliverables' : 'Empty' },
        deliverables.length ? h('p', { className: 'wb-cm-panel-intro' }, 'A read-only view of the deliverables managed in C1 Contract. Track each against its due date and review body; edit titles, dates and acceptance in C1.') : null,
        scheduleBody,
        deliverables.length ? h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: goContract }, 'Manage deliverables in C1 Contract')) : null),
      h(SectionCard, { title: 'Delivery risks', badge: risks.length ? (openRisks + ' open') : 'Empty', variant: openRisks ? 'warning' : null },
        h('p', { className: 'wb-cm-panel-intro' }, 'Risks to timely, credible delivery, reported to the evaluation manager with a mitigation and an owner.'),
        riskTable(),
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: addRisk }, I.plus(14), ' Add risk'))),
      h(SectionCard, { title: 'Report acceptance', badge: acceptBadge },
        h('p', { className: 'wb-cm-panel-intro' }, 'This is where evidence exists. Rate the strength of evidence for each question at report acceptance (higher is stronger).'),
        acceptBlock,
        soeTable));
  }

  window.CockpitDeliver = CockpitDeliver;
})();
