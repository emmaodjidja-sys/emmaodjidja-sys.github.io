(function(global) {
  'use strict';
  var h = React.createElement;
  function StationPlaceholder(props) {
    var idx = props.station;
    var label = PraxisSchema.STATION_LABELS[idx];
    var phase = PraxisSchema.STATION_PHASES[idx];
    var isStale = props.context.staleness[idx];
    return h('div', { className: 'wb-panel' },
      h('div', { style: { marginBottom: '24px' } },
        h('span', { className: 'wb-badge wb-badge-teal', style: { marginBottom: '8px', display: 'inline-block' } },
          PraxisI18n.t('phase.' + phase)
        ),
        h('h2', { style: { fontSize: '24px', fontWeight: '600', marginTop: '8px' } },
          'Station ' + idx + ': ' + label
        ),
        isStale ? h('p', { style: { color: 'var(--wb-stale)', fontSize: '13px', marginTop: '8px' } },
          PraxisI18n.t('station.stale')
        ) : null
      ),
      h('p', { style: { color: 'var(--wb-text-secondary)' } },
        idx <= 4 || idx === 8
          ? PraxisI18n.t('station.empty')
          : PraxisI18n.t('station.planned')
      )
    );
  }
  function Shell(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var activeStation = state.ui.activeStation;
    return h('div', { className: 'wb-app' },
      h(PraxisSensitivityBanner, { context: state.context }),
      h(PraxisTopBar, { state: state, dispatch: dispatch }),
      h('div', { className: 'wb-shell' },
        h(PraxisStationRail, { state: state, dispatch: dispatch }),
        h('main', { className: 'wb-main' },
          h(StationPlaceholder, { station: activeStation, context: state.context })
        )
      )
    );
  }
  global.PraxisShell = Shell;
})(window);
