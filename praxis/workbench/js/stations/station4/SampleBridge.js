/**
 * SampleBridge.js
 * Bridges Station 3 Design Advisor output to the Sample Size Calculator.
 * Maps design IDs and manages postMessage communication with the calculator iframe.
 */
(function () {
  'use strict';

  var h = React.createElement;

  // ── Design ID mapping: Design Advisor → Sample Calculator ──
  var DESIGN_MAP = {
    rct:                      'twoProportions',
    cluster_rct:              'clusterRCT',
    clusterRCT:               'clusterRCT',
    stepped_wedge:            'steppedWedge',
    steppedWedge:             'steppedWedge',
    did:                      'did',
    diff_in_diff:             'did',
    its:                      'its',
    interrupted_time_series:  'its',
    psm:                      'twoProportions',
    propensity_score:         'twoProportions',
    rdd:                      'twoProportions',
    regression_discontinuity: 'twoProportions',
    pre_post:                 'singleProportion',
    prePost:                  'singleProportion',
    case_study:               'singleProportion',
    caseStudy:                'singleProportion'
  };

  var DEFAULT_CALCULATOR_ID = 'twoProportions';

  /**
   * Takes the design_recommendation object from Station 3 and returns
   * the corresponding Sample Calculator design ID.
   *
   * @param {Object} designRec - state.context.design_recommendation
   * @returns {string} Calculator design ID
   */
  function designToCalculatorId(designRec) {
    if (!designRec) return DEFAULT_CALCULATOR_ID;

    // Find top-ranked design. Station 3 saves ranked_designs (scored, sorted)
    // and selected_design; older shapes used ranked/designs/selected.
    var topDesign = null;

    if (designRec.ranked_designs && Array.isArray(designRec.ranked_designs) && designRec.ranked_designs.length > 0) {
      topDesign = designRec.ranked_designs[0];
    } else if (designRec.ranked && Array.isArray(designRec.ranked) && designRec.ranked.length > 0) {
      topDesign = designRec.ranked[0];
    } else if (designRec.designs && Array.isArray(designRec.designs) && designRec.designs.length > 0) {
      // Sort by score descending, pick first
      var sorted = designRec.designs.slice().sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      });
      topDesign = sorted[0];
    } else if (designRec.selected_design) {
      topDesign = (typeof designRec.selected_design === 'object')
        ? designRec.selected_design
        : { id: designRec.selected_design };
    } else if (designRec.selected) {
      topDesign = designRec.selected;
    }

    if (!topDesign) return DEFAULT_CALCULATOR_ID;

    var designId = topDesign.id || topDesign.design_id || topDesign.designId || '';
    return DESIGN_MAP[designId] || DEFAULT_CALCULATOR_ID;
  }

  /**
   * React hook that manages postMessage communication between the workbench
   * and the Sample Size Calculator iframe.
   *
   * @param {React.RefObject} iframeRef - ref to the calculator iframe element
   * @param {string} designId - raw design ID from Station 3
   * @param {Function} onExport - callback when calculator exports sample parameters
   */
  function useSampleBridge(iframeRef, designId, onExport) {
    var calculatorDesignId = designToCalculatorId(
      designId ? { selected: { id: designId } } : null
    );

    var readyState = React.useState(false);
    var ready = readyState[0];
    var setReady = readyState[1];

    React.useEffect(function () {
      function handleMessage(event) {
        if (event.origin !== window.location.origin) return;
        if (!event.data || typeof event.data !== 'object') return;

        var type = event.data.type;

        if (type === 'SAMPLE_READY') {
          setReady(true);
          // Calculator is ready, send initial configuration
          var iframe = iframeRef.current;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
              type: 'PRAXIS_INIT',
              payload: { design: calculatorDesignId }
            }, window.location.origin);
          }
        }

        if (type === 'SAMPLE_EXPORT') {
          if (typeof onExport === 'function') {
            onExport(event.data.payload || event.data);
          }
        }
      }

      window.addEventListener('message', handleMessage);
      return function () {
        window.removeEventListener('message', handleMessage);
      };
    }, [iframeRef, calculatorDesignId, onExport]);

    // The calculator iframe unmounts when its overlay closes; callers reset the
    // ready flag before re-mounting so the loading state reflects reality.
    var resetReady = React.useCallback(function () { setReady(false); }, []);

    return { calculatorDesignId: calculatorDesignId, ready: ready, resetReady: resetReady };
  }

  // ── Public API ──
  window.designToCalculatorId = designToCalculatorId;
  window.useSampleBridge = useSampleBridge;
})();
