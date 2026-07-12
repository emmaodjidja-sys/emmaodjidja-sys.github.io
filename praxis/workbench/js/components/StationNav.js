/**
 * StationNav.js - the evaluator lens adapter over SequenceNav.
 * Public props are unchanged ({stationId, dispatch, onSave}), so all nine station
 * files keep working untouched.
 *
 * This replaces an earlier implementation that held a private English LABELS
 * array. That array duplicated PraxisSchema.STATION_LABELS, bypassed i18n (the
 * rail translated, the nav bar beneath it did not), and drove an off-by-one: the
 * back button navigated to stationId - 1 while printing stationId. Labels are now
 * injected from t(), and the back button prints the id of the step it navigates
 * to, so the number and the destination cannot disagree.
 *
 * Station 9 (Planning) is optional and sits off the main sequence; it renders no
 * nav bar, which is why the sequence is stations 0 to 8.
 * window.StationNav.
 */
(function() {
  'use strict';
  var h = React.createElement;

  function StationNav(props) {
    var t = PraxisI18n.t;
    var stationId = props.stationId;
    var dispatch = props.dispatch;

    var steps = window.SequenceNavCore.buildStationSteps(function(id) {
      return t('station.' + id + '.name');
    });

    // The evaluator words its two buttons differently, and that shipped copy is
    // preserved: back carries the name, continue carries only the number.
    function formatStep(step, slot) {
      if (slot === 'prev') return 'Station ' + step.id + ': ' + step.label;
      return 'Station ' + step.id;
    }

    function onNavigate(id) {
      dispatch({ type: 'SET_ACTIVE_STATION', station: id });
    }

    return h(window.SequenceNav, {
      steps: steps,
      currentId: stationId,
      homeId: null,
      positionText: t('nav.position_station', { n: stationId }),
      formatStep: formatStep,
      onNavigate: onNavigate,
      onSave: props.onSave
    });
  }

  window.StationNav = StationNav;
})();
