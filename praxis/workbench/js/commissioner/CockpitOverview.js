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
        }))));
  }

  window.CockpitOverview = Overview;
})();
