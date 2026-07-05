/**
 * Station4.js — Sample Parameters
 * Orchestrates sample size calculation by bridging Station 3 design output
 * to the embedded Sample Size Calculator tool.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useRef = React.useRef;
  var useCallback = React.useCallback;
  var useEffect = React.useEffect;

  var CALCULATOR_SRC = '/praxis/tools/sample-size-calculator/';

  // ── Helpers ──

  function getTopDesign(designRec) {
    if (!designRec) return null;
    if (designRec.ranked_designs && designRec.ranked_designs.length > 0) return designRec.ranked_designs[0];
    if (designRec.ranked && designRec.ranked.length > 0) return designRec.ranked[0];
    if (designRec.selected_design) return { id: designRec.selected_design };
    return null;
  }

  function formatDesignName(id) {
    if (!id) return 'Unknown';
    return id.replace(/[_-]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // ── Station 4 Component ──

  function Station4(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var designRec = context.design_recommendation || null;
    var sampleParams = context.sample_parameters || null;
    var topDesign = getTopDesign(designRec);

    // The schema pre-creates sample_parameters as an empty object, so gate the
    // summary and the Recalculate label on an actual saved result.
    var hasSample = !!(sampleParams && (
      sampleParams.completed_at ||
      sampleParams.sampleSize != null ||
      sampleParams.total_sample != null
    ));

    var iframeRef = useRef(null);
    var _showCalc = useState(false);
    var showCalculator = _showCalc[0];
    var setShowCalculator = _showCalc[1];

    // Bump reloadKey to re-mount the calculator iframe (Retry).
    var _reload = useState(0);
    var reloadKey = _reload[0];
    var setReloadKey = _reload[1];

    // After 10s without a ready signal from the tool, surface an error fallback.
    var _timedOut = useState(false);
    var timedOut = _timedOut[0];
    var setTimedOut = _timedOut[1];

    var designId = topDesign ? (topDesign.id || topDesign.design_id || topDesign.designId || '') : '';

    var handleExport = useCallback(function (payload) {
      // Stamp completed_at on save (the completion signal StationRail and
      // Station 9 consume) at the moment the sample plan is exported.
      var record = Object.assign({}, payload, { completed_at: new Date().toISOString() });
      dispatch({ type: 'SAVE_STATION', stationId: 4, data: { sample_parameters: record } });
      setShowCalculator(false);
    }, [dispatch]);

    // Bridge hook (script order guarantees SampleBridge.js has loaded)
    var bridge = window.useSampleBridge(iframeRef, designId, handleExport);
    var bridgeReady = bridge.ready;

    useEffect(function () {
      if (!showCalculator || bridgeReady) return undefined;
      setTimedOut(false);
      var timer = setTimeout(function () { setTimedOut(true); }, 10000);
      return function () { clearTimeout(timer); };
    }, [showCalculator, bridgeReady, reloadKey]);

    // ── No design selected ──
    if (!topDesign) {
      return h(SectionCard, { title: 'Sample Parameters', bodyType: 'empty' },
        h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' },
            'No Evaluation Design Selected'),
          h('p', { className: 'wb-station-empty-desc' },
            'Complete Station 3 first to select an evaluation design. The sample size calculator will be pre-configured based on your chosen design.'),
          h('button', {
            className: 'wb-btn wb-btn-primary',
            onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 3 }); }
          }, 'Go to Station 3')
        )
      );
    }

    // ── Calculator overlay ──
    var calculatorOverlay = null;
    if (showCalculator) {
      var statusPanel = null;
      if (!bridgeReady && timedOut) {
        statusPanel = h('div', { className: 'wb-iframe-status', role: 'alert' },
          h('div', { className: 'wb-iframe-status-title' }, 'Sample Size Calculator did not load'),
          h('div', { className: 'wb-iframe-status-desc' },
            'The embedded tool did not respond. Check your connection and retry, or open the calculator in a new tab.'),
          h('div', { className: 'wb-iframe-status-actions' },
            h('button', {
              className: 'wb-btn wb-btn-primary wb-btn-sm',
              onClick: function () {
                setTimedOut(false);
                bridge.resetReady();
                setReloadKey(function (k) { return k + 1; });
              }
            }, 'Retry'),
            h('a', {
              className: 'wb-btn wb-btn-outline wb-btn-sm',
              href: CALCULATOR_SRC, target: '_blank', rel: 'noopener'
            }, 'Open in new tab')
          )
        );
      } else if (!bridgeReady) {
        statusPanel = h('div', { className: 'wb-iframe-status', role: 'status', 'aria-live': 'polite' },
          h('div', { className: 'wb-spinner', 'aria-hidden': 'true' }),
          h('div', { className: 'wb-iframe-status-title' }, 'Loading Sample Size Calculator...')
        );
      }

      calculatorOverlay = h('div', { className: 'wb-overlay' },
        h('div', { className: 'wb-overlay-panel' },
          // Header
          h('div', { className: 'wb-overlay-header' },
            h('h3', { className: 'wb-overlay-header-title' }, 'Sample Size Calculator'),
            h('div', { className: 'wb-overlay-header-actions' },
              h('button', {
                className: 'wb-btn wb-btn-teal wb-btn-sm',
                onClick: function () {
                  if (iframeRef.current && iframeRef.current.contentWindow) {
                    iframeRef.current.contentWindow.postMessage({ type: 'PRAXIS_REQUEST_EXPORT' }, window.location.origin);
                  }
                }
              }, 'Save to Workbench'),
              h('button', {
                className: 'wb-btn wb-btn-ghost wb-btn-sm',
                onClick: function () { setShowCalculator(false); },
                'aria-label': 'Close calculator'
              }, PraxisIcons.close(16))
            )
          ),
          // iframe with loading / error overlay
          h('div', { className: 'wb-overlay-body wb-iframe-wrap' },
            h('iframe', {
              key: reloadKey,
              ref: iframeRef,
              src: CALCULATOR_SRC,
              style: { border: 'none', width: '100%', flex: 1 },
              title: 'Sample Size Calculator'
            }),
            statusPanel
          )
        )
      );
    }

    // ── Main layout ──
    return h('div', null,

      h(SectionCard, { title: 'Sample Parameters' },
        // Selected design card
        h('div', { className: 'wb-card' },
          h('div', { className: 'wb-design-card' },
            h('div', { className: 'wb-station-icon' }, 'S4'),
            h('div', null,
              h('div', { className: 'wb-design-card-header' },
                h('h3', { className: 'wb-design-card-title' },
                  topDesign.name || formatDesignName(designId)),
                h('a', {
                  href: '#',
                  className: 'wb-design-card-link',
                  onClick: function (e) {
                    e.preventDefault();
                    dispatch({ type: 'SET_ACTIVE_STATION', station: 3 });
                  }
                }, 'Change design ', PraxisIcons.chevronRight())
              ),
              topDesign.family
                ? h('span', { className: 'wb-badge' }, topDesign.family)
                : null,
              topDesign.score != null
                ? h('span', { className: 'wb-pill' },
                    'Score: ' + (typeof topDesign.score === 'number' ? topDesign.score.toFixed(1) : topDesign.score))
                : null
            )
          ),
          h('p', { className: 'wb-helper' },
            'This design was selected in Station 3. Use the calculator below to determine appropriate sample sizes.')
        ),

        // Action button
        h('div', { className: 'wb-param-grid' },
          h('button', {
            className: 'wb-btn wb-btn-primary',
            onClick: function () {
              // Reset the ready flag so re-opening shows a fresh loading state
              // (the previous iframe unmounted when the overlay closed).
              bridge.resetReady();
              setTimedOut(false);
              setShowCalculator(true);
            }
          }, hasSample ? 'Recalculate' : 'Open Calculator')
        )
      ),

      // Sample parameters summary (if saved)
      hasSample ? h(SectionCard, { title: 'Sample Parameters Summary' },
        h('div', { className: 'wb-param-grid' },
          // Design
          h('div', { className: 'wb-param-card' },
            h('div', { className: 'wb-param-label' }, 'Design'),
            h('div', { className: 'wb-param-value' },
              sampleParams.design || sampleParams.designType || formatDesignName(designId))
          ),
          // Sample size
          sampleParams.sampleSize != null || sampleParams.total_sample != null
            ? h('div', { className: 'wb-param-card' },
                h('div', { className: 'wb-param-label' }, 'Total Sample Size'),
                h('div', { className: 'wb-param-value wb-param-value--highlight' },
                  sampleParams.sampleSize || sampleParams.total_sample || 'N/A')
              )
            : null,
          // Power
          sampleParams.power != null
            ? h('div', { className: 'wb-param-card' },
                h('div', { className: 'wb-param-label' }, 'Statistical Power'),
                h('div', { className: 'wb-param-value' }, (sampleParams.power * 100).toFixed(0) + '%')
              )
            : null,
          // Qualitative
          sampleParams.qualitative
            ? h('div', { className: 'wb-param-card' },
                h('div', { className: 'wb-param-label' }, 'Qualitative Plan'),
                h('div', { className: 'wb-param-value' },
                  typeof sampleParams.qualitative === 'string'
                    ? sampleParams.qualitative
                    : JSON.stringify(sampleParams.qualitative))
              )
            : null
        )
      ) : null,

      // Calculator overlay (full-screen, stays outside SectionCard)
      calculatorOverlay,

      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 4, dispatch: dispatch }) : null
    );
  }

  window.Station4 = Station4;
})();
