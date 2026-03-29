/**
 * StationNav.js — Bottom navigation bar for every station.
 * Shows: ← Previous Station | Station N of 9 | Save & Continue →
 */
(function() {
  'use strict';
  var h = React.createElement;

  var LABELS = [
    'Evaluability & Scoping',
    'Theory of Change',
    'Evaluation Matrix',
    'Design Advisor',
    'Sample Size',
    'Instrument Builder',
    'Analysis Framework',
    'Report Builder',
    'Deck Generator'
  ];

  function StationNav(props) {
    var stationId = props.stationId;
    var dispatch = props.dispatch;
    var onSave = props.onSave; // optional save callback before navigation

    var hasPrev = stationId > 0;
    var hasNext = stationId < 8;

    function goTo(id) {
      dispatch({ type: 'SET_ACTIVE_STATION', station: id });
    }

    function handleNext() {
      if (onSave) onSave();
      if (hasNext) goTo(stationId + 1);
    }

    return h('div', {
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', marginTop: 24,
        borderTop: '1px solid var(--border, #E2E8F0)'
      }
    },
      // Back
      hasPrev
        ? h('button', {
            className: 'wb-btn',
            style: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
            onClick: function() { goTo(stationId - 1); }
          },
            '\u2190 Station ' + stationId + ': ' + LABELS[stationId - 1]
          )
        : h('div'),

      // Position indicator
      h('span', {
        style: { fontSize: 11, color: 'var(--slate, #64748B)', fontWeight: 500 }
      }, 'Station ' + stationId + ' of 9'),

      // Next
      hasNext
        ? h('button', {
            className: 'wb-btn wb-btn-primary',
            style: { fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 },
            onClick: handleNext
          },
            'Continue to Station ' + (stationId + 1) + ' \u2192'
          )
        : onSave
          ? h('button', {
              className: 'wb-btn wb-btn-teal',
              style: { fontSize: 12 },
              onClick: onSave
            }, 'Save & Finish')
          : h('div')
    );
  }

  window.StationNav = StationNav;
})();
