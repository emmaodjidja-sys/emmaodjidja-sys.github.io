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

    // Move focus to the station content region when the station changes so
    // keyboard and screen-reader users land in the new content. Skipped on
    // first mount to avoid stealing focus from the initial load.
    var mainRef = React.useRef(null);
    var mountedRef = React.useRef(false);
    React.useEffect(function() {
      if (!mountedRef.current) { mountedRef.current = true; return; }
      if (mainRef.current) mainRef.current.focus();
    }, [activeStation]);

    function handleStaleDismiss(action) {
      if (action === 'dismiss') {
        dispatch({ type: PraxisContext.ACTION_TYPES.CLEAR_STALE, stationId: activeStation });
      } else if (action === 'review') {
        // Navigate to the upstream station that changed
        var deps = PraxisStaleness.UPSTREAM_DEPS[activeStation] || [];
        var fields = PraxisSchema.STATION_FIELDS;
        for (var s = 0; s <= 8; s++) {
          if (s === activeStation) continue;
          var written = fields[s] || [];
          for (var i = 0; i < written.length; i++) {
            if (deps.indexOf(written[i]) !== -1) {
              dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: s });
              return;
            }
          }
        }
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
    } else if (activeStation === 9 && typeof Station9 !== 'undefined') {
      stationContent = h(Station9, { state: state, dispatch: dispatch });
    } else if (activeStation === 10 && typeof Commissioner !== 'undefined') {
      stationContent = h(Commissioner, { state: state, dispatch: dispatch });
    } else {
      stationContent = h('div', { className: 'wb-station-empty' },
        h('h3', { className: 'wb-station-empty-title' },
          'Station ' + activeStation + ': ' + stationName
        ),
        h('p', { className: 'wb-station-empty-desc' },
          PraxisI18n.t('empty.desc')
        )
      );
    }

    return h(React.Fragment, null,
      h('a', { className: 'wb-skip-link', href: '#wb-station-main' }, 'Skip to station content'),
      h(SensitivityBanner, { context: context }),
      h(TopBar, { state: state, dispatch: dispatch }),
      h('div', { className: 'wb-shell' },
        h(StationRail, { state: state, dispatch: dispatch, onHelpToggle: function() { setHelpOpen(!helpOpen); } }),
        h('div', { className: 'wb-main' },
          h('div', { className: 'wb-panel' },
            // Planning (index 9) and Commissioner (index 10) are optional surfaces that
            // render their own header; they opt out of the shared header/summary/staleness.
            (activeStation !== 9 && activeStation !== 10) ? h(StationHeader, { stationId: activeStation, context: context }) : null,
            (activeStation !== 9 && activeStation !== 10) ? h(StalenessWarning, { stationId: activeStation, staleness: context.staleness, onDismiss: handleStaleDismiss }) : null,
            (activeStation !== 9 && activeStation !== 10 && typeof SummaryBar !== 'undefined')
              ? h('div', { className: 'wb-summary-bar-wrap' },
                  h(SummaryBar, { stationId: activeStation, context: context }))
              : null,
            h('div', { className: 'wb-panel-content', id: 'wb-station-main', tabIndex: -1, ref: mainRef }, stationContent)
          )
        ),
        h(ContextDrawer, { state: state, dispatch: dispatch })
      ),
      h(HelpSidebar, { stationId: activeStation, tier: state.ui.experienceTier, open: helpOpen, onClose: function() { setHelpOpen(false); } })
    );
  }

  window.Shell = Shell;
})();
