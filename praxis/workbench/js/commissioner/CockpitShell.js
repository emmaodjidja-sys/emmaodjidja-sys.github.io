/**
 * CockpitShell: composing container for the Commissioner lens. Computes the derived
 * alerts once, renders the persistent CockpitHeader, then the active sub-station body
 * (0 Overview, 1-6 = C0-C5). Tolerant of station modules that are not yet loaded.
 * window.CockpitShell. Rendered by Shell.js when ui.role === 'commissioner'.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var D = window.CockpitData;

  var STATION_COMPONENT = {
    1: 'CockpitCommission', 2: 'CockpitContract', 3: 'CockpitAssure',
    4: 'CockpitDeliver', 5: 'CockpitUse', 6: 'CockpitFollowup'
  };

  function placeholder(cs) {
    var s = D.STATIONS[cs] || { label: 'Station' };
    return h('div', { className: 'wb-station-empty' },
      h('div', { className: 'wb-station-empty-title' }, (s.code ? s.code + ' ' : '') + s.label),
      h('div', { className: 'wb-station-empty-desc' }, 'This station is loading.'));
  }

  function CockpitShell(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context;
    var cs = state.ui.commissionerStation;
    var alerts = window.CockpitAlerts.computeAlerts(context);
    var childProps = { state: state, dispatch: dispatch, alerts: alerts };

    var body;
    if (cs === 0) {
      body = h(window.CockpitOverview, childProps);
    } else {
      var name = STATION_COMPONENT[cs];
      var Comp = name ? window[name] : null;
      body = Comp ? h(Comp, childProps) : (cs >= 1 && cs <= 6 ? placeholder(cs) : h(window.CockpitOverview, childProps));
    }

    // On the Overview (cs === 0) the flight-deck tiles already carry the five KPIs (with
    // rings and concrete counts), so suppress the header's condensed KPI strip there to
    // avoid showing the same five metrics twice. The strip returns on every C-station.
    return h('div', { className: 'wb-cm' },
      h(window.CockpitHeader, { context: context, dispatch: dispatch, alerts: alerts, hideKpis: cs === 0 }),
      h('div', { className: 'wb-cm-body', id: 'wb-cm-body' }, body),
      h(window.CockpitNav, { cs: cs, dispatch: dispatch }));
  }

  window.CockpitShell = CockpitShell;
})();
