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

    var iframeRef = useRef(null);
    var _showCalc = useState(false);
    var showCalculator = _showCalc[0];
    var setShowCalculator = _showCalc[1];

    var designId = topDesign ? (topDesign.id || topDesign.design_id || topDesign.designId || '') : '';

    var handleExport = useCallback(function (payload) {
      dispatch({ type: 'SAVE_STATION', stationId: 4, data: { sample_parameters: payload } });
      setShowCalculator(false);
    }, [dispatch]);

    // Bridge hook
    if (typeof window.useSampleBridge === 'function') {
      window.useSampleBridge(iframeRef, designId, handleExport);
    }

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
      var calculatorId = typeof window.designToCalculatorId === 'function'
        ? window.designToCalculatorId(designRec)
        : 'twoProportions';

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
                    iframeRef.current.contentWindow.postMessage({ type: 'REQUEST_EXPORT' }, '*');
                  }
                }
              }, 'Save to Workbench'),
              h('button', {
                className: 'wb-btn wb-btn-ghost wb-btn-sm',
                onClick: function () { setShowCalculator(false); },
                'aria-label': 'Close calculator'
              }, '\u2715')
            )
          ),
          // iframe
          h('iframe', {
            ref: iframeRef,
            src: '/praxis/tools/sample-size-calculator/',
            className: 'wb-overlay-body',
            style: { border: 'none', width: '100%' },
            title: 'Sample Size Calculator'
          })
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
                  formatDesignName(designId)),
                h('a', {
                  href: '#',
                  className: 'wb-design-card-link',
                  onClick: function (e) {
                    e.preventDefault();
                    dispatch({ type: 'SET_ACTIVE_STATION', station: 3 });
                  }
                }, 'Change design \u2192')
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
            onClick: function () { setShowCalculator(true); }
          }, sampleParams ? 'Recalculate' : 'Open Calculator')
        )
      ),

      // Sample parameters summary (if saved)
      sampleParams ? h(SectionCard, { title: 'Sample Parameters Summary' },
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
