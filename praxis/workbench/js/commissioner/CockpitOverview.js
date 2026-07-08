/**
 * CockpitOverview: the commissioner flight-deck (rail index 0). The reading surface:
 * full KPI grid, the alerts module, and deep-link cards into each working station.
 * A fresh project shows a guided "start here". window.CockpitOverview.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var A = window.CockpitAtoms;
  var D = window.CockpitData;

  // Read-only accountability panel: who is acting, a segregation-of-duties check, and the
  // append-only log of governance and payment acts.
  function accountability(context, api) {
    var cm = context.commissioner || {}, pl = context.planning || {};
    var log = (cm.audit_log || []).slice().reverse();
    var acting = (cm.acting_officer || '').trim();
    var invoices = pl.invoices || [], dels = pl.deliverables || [];
    var payConflicts = invoices.filter(function(iv) { return iv.approved_by && iv.paid_by && iv.approved_by.trim() && iv.approved_by.trim() === iv.paid_by.trim(); });
    var acceptConflicts = dels.filter(function(d) { return d.accepted_by && d.rating && d.rating.rated_by && d.accepted_by.trim() && d.accepted_by.trim() === d.rating.rated_by.trim(); });
    var flags = [];
    if (!acting) flags.push('No acting officer is set, so new actions are logged as "Unattributed". Name the acting officer below.');
    if (payConflicts.length) flags.push(payConflicts.length + ' invoice(s) were approved and paid by the same officer (no separation between approval and payment).');
    if (acceptConflicts.length) flags.push(acceptConflicts.length + ' deliverable(s) were quality-rated and accepted by the same officer.');
    return h(SectionCard, { title: 'Accountability', badge: log.length ? log.length + ' logged' : 'No log yet', variant: flags.length ? 'warning' : null },
      h('div', { className: 'wb-cm-focus-field', style: { maxWidth: 380, marginBottom: 12 } },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-acting' }, 'Acting officer (attributed on every logged action)'),
        h('input', { id: 'cm-acting', className: 'wb-input wb-cm-focus-input', type: 'text', placeholder: 'name and role of the officer acting now',
          key: 'acting:' + acting, defaultValue: cm.acting_officer || '', 'aria-label': 'Acting officer',
          onBlur: function(e) { api.setField('acting_officer', e.target.value); } })),
      flags.length
        ? flags.map(function(f, i) { return h('div', { key: 'f' + i, className: 'wb-cm-over', role: 'status', style: { marginTop: i ? 6 : 0 } }, f); })
        : h('p', { className: 'wb-cm-hint' }, 'No segregation-of-duties conflicts detected across acceptance, approval and payment.'),
      log.length
        ? h('div', { className: 'wb-cm-log', role: 'log', 'aria-label': 'Decision and payment log' }, log.map(function(e) {
            return h('div', { key: e.id, className: 'wb-cm-logrow' },
              h('span', { className: 'wb-cm-logrow-when' }, D.fdate(e.at) + ' ' + String(e.at || '').slice(11, 16)),
              h('span', { className: 'wb-cm-logrow-actor' }, e.actor || 'Unattributed'),
              h('span', { className: 'wb-cm-logrow-detail' }, e.detail || e.action));
          }))
        : h('p', { className: 'wb-cm-hint', style: { marginTop: 10 } }, 'No decisions logged yet. Gate decisions, acceptances, endorsements and payments are recorded here, append-only, as they happen.'));
  }

  var CARDS = [
    { idx: 1, code: 'C0', label: 'Commission', desc: 'Name the intended users and the decisions they must make.' },
    { idx: 2, code: 'C1', label: 'Contract', desc: 'Budget, deliverables, invoices and quality review.' },
    { idx: 3, code: 'C2', label: 'Assure', desc: 'Quality-gate the design at inception, before spend.' },
    { idx: 4, code: 'C3', label: 'Deliver', desc: 'Hold deliverables to schedule; accept the final report.' },
    { idx: 5, code: 'C4', label: 'Use', desc: 'Record the management response and dissemination.' },
    { idx: 6, code: 'C5', label: 'Follow-up', desc: 'Track implementation of accepted actions, six-monthly.' }
  ];

  function go(dispatch, cstation) { dispatch({ type: AT.SET_COMMISSIONER_STATION, station: cstation }); }

  function tile(k, dispatch) {
    return h('button', { key: k.key, type: 'button', className: 'wb-cm-otile' + (k.tone ? ' wb-cm-otile--' + k.tone : ''), onClick: function() { go(dispatch, k.cstation); }, 'aria-label': k.label + ': ' + k.value + ', ' + k.sub },
      typeof k.frac === 'number' ? h('div', { className: 'wb-cm-otile-ring' }, A.ring(k.frac, k.tone)) : h('div', { className: 'wb-cm-otile-v' }, k.value),
      h('div', { className: 'wb-cm-otile-l' }, k.label),
      h('div', { className: 'wb-cm-otile-s' }, k.sub));
  }

  function Overview(props) {
    var context = props.state.context, dispatch = props.dispatch, alerts = props.alerts || [];
    var api = window.CockpitSave.make(context, dispatch);
    var cm = context.commissioner || {}, gov = cm.governance || {};
    var pl = context.planning || {};
    var hasData = (cm.users || []).length || (pl.deliverables || []).length || (cm.management_response || []).length || gov.funder_profile;

    if (!hasData) {
      return h('div', { className: 'wb-cm-overview' },
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Set up the commissioning'),
          h('div', { className: 'wb-station-empty-desc' }, 'Start in Commission: name who this evaluation is for and the decisions it must serve. The design-assurance gate, delivery schedule and follow-up register then track against that.'),
          h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: function() { go(dispatch, 1); } }, 'Start in C0 Commission'))));
    }

    var kpis = CockpitHeader.deriveKpis(context);
    return h('div', { className: 'wb-cm-overview' },
      h('header', { className: 'wb-cm-move-head' },
        h('div', null,
          h('div', { className: 'wb-cm-move-kicker' }, 'Flight deck'),
          h('h3', { className: 'wb-cm-move-title' }, 'Where this evaluation stands'),
          h('p', { className: 'wb-cm-move-desc' }, 'A live read of the commissioning: who it is for, whether the design is assured, what is on schedule, and what needs the commissioner now.'))),
      h('div', { className: 'wb-cm-otiles' }, kpis.map(function(k) { return tile(k, dispatch); })),
      h(SectionCard, { title: 'Alerts', badge: alerts.length ? CockpitAlerts.summarize(alerts).overdue + ' overdue' : 'Clear', variant: (alerts.length && alerts[0].severity === 0) ? 'warning' : null },
        CockpitHeader.alertList(alerts, dispatch)),
      h(SectionCard, { title: 'Stations' },
        h('div', { className: 'wb-cm-navcards' }, CARDS.map(function(c) {
          return h('button', { key: c.idx, type: 'button', className: 'wb-cm-navcard', onClick: function() { go(dispatch, c.idx); } },
            h('span', { className: 'wb-cm-navcard-code' }, c.code),
            h('span', { className: 'wb-cm-navcard-label' }, c.label),
            h('span', { className: 'wb-cm-navcard-desc' }, c.desc));
        }))),
      accountability(context, api));
  }

  window.CockpitOverview = Overview;
})();
