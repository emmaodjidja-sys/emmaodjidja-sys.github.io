(function() {
  'use strict';
  var h = React.createElement;

  function Shell(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var activeStation = state.ui.activeStation;
    var context = state.context;
    var stationName = PraxisSchema.STATION_LABELS[activeStation] || ('Station ' + activeStation);

    function handleStaleDismiss(action) {
      if (action === 'dismiss') {
        // For now just a no-op; real logic added when stations are wired
      }
    }

    var emptyState = h('div', { className: 'wb-station-empty', style: { textAlign: 'center', padding: '64px 24px' } },
      h('h3', { className: 'wb-station-empty-title', style: { fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: 8 } },
        'Station ' + activeStation + ': ' + stationName
      ),
      h('p', { className: 'wb-station-empty-desc', style: { fontSize: '13px', color: '#6B7280' } },
        'This station will be available soon.'
      )
    );

    return h(React.Fragment, null,
      h(SensitivityBanner, { context: context }),
      h(TopBar, { state: state, dispatch: dispatch }),
      h('div', { className: 'wb-shell' },
        h(StationRail, { state: state, dispatch: dispatch }),
        h('div', { className: 'wb-main' },
          h('div', { className: 'wb-panel' },
            h(StationHeader, { stationId: activeStation, context: context }),
            h(StalenessWarning, { stationId: activeStation, staleness: context.staleness, onDismiss: handleStaleDismiss }),
            h('div', { className: 'wb-panel-content' }, emptyState)
          )
        ),
        h(ContextDrawer, { state: state, dispatch: dispatch })
      )
    );
  }

  window.Shell = Shell;
})();
