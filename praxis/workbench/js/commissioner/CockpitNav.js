/**
 * CockpitNav.js - the commissioner lens adapter over SequenceNav.
 * Overview (cs 0) is home: it has no back button and its primary button starts
 * the sequence at C0. C5 (cs 6) closes the loop back to Overview rather than
 * dead-ending. Nothing gates advancing: the cockpit is an oversight surface, not
 * a wizard, and the C2 blockers gate the approve action, not movement.
 * Mounted once by CockpitShell, so every cockpit screen carries it.
 * window.CockpitNav.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var D = window.CockpitData;

  function CockpitNav(props) {
    var t = PraxisI18n.t;
    var cs = props.cs;
    var dispatch = props.dispatch;

    // Labels come from i18n, not from CockpitData's hardcoded English, so the
    // nav bar translates. CockpitRail resolves the same keys for its tooltips.
    var steps = D.STATIONS.map(function(s) {
      return { id: s.idx, code: s.code, label: t('cstation.' + s.idx + '.name') };
    });

    // "C2 Assure" for the C-stations; plain "Overview" for home (empty code).
    function stepName(step) {
      return step.code ? step.code + ' ' + step.label : step.label;
    }

    function formatStep(step) { return stepName(step); }

    function onNavigate(id) {
      dispatch({ type: AT.SET_COMMISSIONER_STATION, station: id });
    }

    // cs doubles as the 1-of-6 ordinal: C0 is cs 1 ... C5 is cs 6.
    var positionText = cs === 0
      ? stepName(steps[0])
      : t('nav.position_cockpit', { step: stepName(steps[cs]), n: cs });

    return h(window.SequenceNav, {
      steps: steps,
      currentId: cs,
      homeId: 0,
      positionText: positionText,
      formatStep: formatStep,
      onNavigate: onNavigate
    });
  }

  window.CockpitNav = CockpitNav;
})();
