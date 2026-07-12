/**
 * StationNav.js - the evaluator lens adapter over SequenceNav.
 * Public props are unchanged ({stationId, dispatch, onSave}), so all nine station
 * files keep working untouched.
 *
 * This replaces an earlier implementation that held a private English LABELS
 * array. That array duplicated PraxisSchema.STATION_LABELS, the same source
 * every other evaluator surface reads (StationHeader, SummaryBar, EntryLanding,
 * Shell, StationRail, context.js), and it drove an off-by-one: the back button
 * navigated to stationId - 1 while printing stationId. Labels are now injected
 * from PraxisSchema.STATION_LABELS via the same buildStationSteps callback, and
 * the back button prints the id of the step it navigates to, so the number and
 * the destination cannot disagree.
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

    // Station names come from PraxisSchema.STATION_LABELS, the same source the rail,
    // the station header, the summary bar and the landing page all read. They are
    // English across the whole suite today; the station.N.name i18n keys exist but
    // are consumed nowhere, so translating only this bar would make the nav disagree
    // with the heading directly above it. Injecting the source (rather than keeping a
    // private copy, as this component used to) is what keeps the label and the
    // destination in step.
    var steps = window.SequenceNavCore.buildStationSteps(function(id) {
      return (window.PraxisSchema && window.PraxisSchema.STATION_LABELS && window.PraxisSchema.STATION_LABELS[id]) || ('Station ' + id);
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
