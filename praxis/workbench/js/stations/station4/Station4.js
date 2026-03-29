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
    if (designRec.ranked && designRec.ranked.length > 0) return designRec.ranked[0];
    if (designRec.designs && designRec.designs.length > 0) {
      return designRec.designs.slice().sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      })[0];
    }
    if (designRec.selected) return designRec.selected;
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
      return h('div', { className: 'wb-card', style: { textAlign: 'center', padding: '3rem 2rem' } },
        h('div', { style: { fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 } }, '\u{1F4CA}'),
        h('h3', { style: { marginBottom: '0.75rem', color: 'var(--text-primary, #1a1a2e)' } },
          'No Evaluation Design Selected'),
        h('p', { className: 'wb-helper', style: { marginBottom: '1.5rem' } },
          'Complete Station 3 first to select an evaluation design.'),
        h('button', {
          className: 'wb-btn wb-btn-primary',
          onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', stationId: 3 }); }
        }, 'Go to Station 3: Design Advisor')
      );
    }

    // ── Calculator overlay ──
    var calculatorOverlay = null;
    if (showCalculator) {
      var calculatorId = typeof window.designToCalculatorId === 'function'
        ? window.designToCalculatorId(designRec)
        : 'twoProportions';

      calculatorOverlay = h('div', {
        style: {
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }
      },
        h('div', {
          style: {
            width: '90vw', maxWidth: '1100px', height: '85vh',
            background: 'var(--bg-primary, #fff)',
            borderRadius: '12px', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)'
          }
        },
          // Header
          h('div', {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border, #e2e8f0)',
              background: 'var(--bg-secondary, #f8fafc)'
            }
          },
            h('h3', { style: { margin: 0, fontSize: '1.1rem' } }, 'Sample Size Calculator'),
            h('div', { style: { display: 'flex', gap: '0.75rem' } },
              h('button', {
                className: 'wb-btn wb-btn-teal wb-btn-sm',
                onClick: function () {
                  // Request export from calculator
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
            style: { flex: 1, border: 'none', width: '100%' },
            title: 'Sample Size Calculator'
          })
        )
      );
    }

    // ── Main layout ──
    return h('div', null,
      // Selected design card
      h('div', { className: 'wb-card', style: { marginBottom: '1.5rem' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' } },
          h('div', {
            style: {
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.25rem', flexShrink: 0
            }
          }, '\u{1F3AF}'),
          h('div', null,
            h('h3', { style: { margin: 0, fontSize: '1.15rem', color: 'var(--text-primary, #1a1a2e)' } },
              formatDesignName(designId)),
            topDesign.family
              ? h('span', { className: 'wb-badge', style: { marginTop: '0.25rem', display: 'inline-block' } },
                  topDesign.family)
              : null,
            topDesign.score != null
              ? h('span', { className: 'wb-pill', style: { marginLeft: '0.5rem' } },
                  'Score: ' + (typeof topDesign.score === 'number' ? topDesign.score.toFixed(1) : topDesign.score))
              : null
          )
        ),
        h('p', { className: 'wb-helper' },
          'This design was selected in Station 3. Use the calculator below to determine appropriate sample sizes.')
      ),

      // Action button
      h('div', { style: { marginBottom: '1.5rem' } },
        h('button', {
          className: 'wb-btn wb-btn-primary',
          onClick: function () { setShowCalculator(true); },
          style: { marginRight: '0.75rem' }
        }, sampleParams ? 'Recalculate' : 'Open Calculator')
      ),

      // Sample parameters summary (if saved)
      sampleParams ? h('div', { className: 'wb-card', style: { marginBottom: '1.5rem' } },
        h('h4', { style: { marginTop: 0, marginBottom: '1rem' } }, 'Sample Parameters Summary'),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' } },
          // Design
          h('div', { className: 'wb-card', style: { padding: '1rem', background: 'var(--bg-secondary, #f8fafc)' } },
            h('div', { className: 'wb-label', style: { marginBottom: '0.25rem' } }, 'Design'),
            h('div', { style: { fontWeight: 600 } },
              sampleParams.design || sampleParams.designType || formatDesignName(designId))
          ),
          // Sample size
          sampleParams.sampleSize != null || sampleParams.total_sample != null
            ? h('div', { className: 'wb-card', style: { padding: '1rem', background: 'var(--bg-secondary, #f8fafc)' } },
                h('div', { className: 'wb-label', style: { marginBottom: '0.25rem' } }, 'Total Sample Size'),
                h('div', { style: { fontWeight: 600, fontSize: '1.5rem', color: 'var(--teal, #0d9488)' } },
                  sampleParams.sampleSize || sampleParams.total_sample || 'N/A')
              )
            : null,
          // Power
          sampleParams.power != null
            ? h('div', { className: 'wb-card', style: { padding: '1rem', background: 'var(--bg-secondary, #f8fafc)' } },
                h('div', { className: 'wb-label', style: { marginBottom: '0.25rem' } }, 'Statistical Power'),
                h('div', { style: { fontWeight: 600 } }, (sampleParams.power * 100).toFixed(0) + '%')
              )
            : null,
          // Qualitative
          sampleParams.qualitative
            ? h('div', { className: 'wb-card', style: { padding: '1rem', background: 'var(--bg-secondary, #f8fafc)' } },
                h('div', { className: 'wb-label', style: { marginBottom: '0.25rem' } }, 'Qualitative Plan'),
                h('div', { style: { fontWeight: 600 } },
                  typeof sampleParams.qualitative === 'string'
                    ? sampleParams.qualitative
                    : JSON.stringify(sampleParams.qualitative))
              )
            : null
        )
      ) : null,

      // Calculator overlay
      calculatorOverlay,

      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 4, dispatch: dispatch }) : null
    );
  }

  window.Station4 = Station4;
})();
