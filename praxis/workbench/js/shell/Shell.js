(function() {
  'use strict';
  var h = React.createElement;

  function Shell(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var activeStation = state.ui.activeStation;
    var context = state.context;
    var helpState = React.useState(false);
    var helpOpen = helpState[0];
    var setHelpOpen = helpState[1];
    var stationName = PraxisSchema.STATION_LABELS[activeStation] || ('Station ' + activeStation);

    function handleStaleDismiss(action) {
      if (action === 'dismiss') {
        // For now just a no-op; real logic added when stations are wired
      }
    }

    var stationContent;
    if (activeStation === 0 && typeof Station0 !== 'undefined') {
      stationContent = h(Station0, { state: state, dispatch: dispatch });
    } else if (activeStation === 2 && typeof Station2 !== 'undefined') {
      stationContent = h(Station2, { state: state, dispatch: dispatch });
    } else if (activeStation === 1 && typeof Station1 !== 'undefined') {
      stationContent = h(Station1, { state: state, dispatch: dispatch });
    } else if (activeStation === 3 && typeof Station3 !== 'undefined') {
      stationContent = h(Station3, { state: state, dispatch: dispatch });
    } else if (activeStation === 4 && typeof Station4 !== 'undefined') {
      stationContent = h(Station4, { state: state, dispatch: dispatch });
    } else if (activeStation === 5 && typeof Station5 !== 'undefined') {
      stationContent = h(Station5, { state: state, dispatch: dispatch });
    } else if (activeStation === 6 && typeof Station6 !== 'undefined') {
      stationContent = h(Station6, { state: state, dispatch: dispatch });
    } else if (activeStation === 7 && typeof Station7 !== 'undefined') {
      stationContent = h(Station7, { state: state, dispatch: dispatch });
    } else if (activeStation === 8 && typeof Station8 !== 'undefined') {
      stationContent = h(Station8, { state: state, dispatch: dispatch });
    } else {
      stationContent = h('div', { className: 'wb-station-empty', style: { textAlign: 'center', padding: '64px 24px' } },
        h('h3', { className: 'wb-station-empty-title', style: { fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: 8 } },
          'Station ' + activeStation + ': ' + stationName
        ),
        h('p', { className: 'wb-station-empty-desc', style: { fontSize: '13px', color: '#6B7280' } },
          'This station will be available soon.'
        )
      );
    }

    return h(React.Fragment, null,
      h(SensitivityBanner, { context: context }),
      h(TopBar, { state: state, dispatch: dispatch }),
      h('div', { className: 'wb-shell' },
        h(StationRail, { state: state, dispatch: dispatch, onHelpToggle: function() { setHelpOpen(!helpOpen); } }),
        h('div', { className: 'wb-main' },
          h('div', { className: 'wb-panel' },
            h(StationHeader, { stationId: activeStation, context: context }),
            h(StalenessWarning, { stationId: activeStation, staleness: context.staleness, onDismiss: handleStaleDismiss }),
            h('div', { className: 'wb-panel-content' }, stationContent)
          )
        ),
        h(ContextDrawer, { state: state, dispatch: dispatch })
      ),
      h(HelpSidebar, { stationId: activeStation, tier: state.ui.experienceTier, open: helpOpen, onClose: function() { setHelpOpen(false); } })
    );
  }

  window.Shell = Shell;
})();
