(function() {
  'use strict';

  // Mapping tables
  var PURPOSE_MAP = {
    'impact_evaluation': 'impact',
    'impact': 'impact',
    'outcome_evaluation': 'outcome',
    'outcome': 'outcome',
    'process_evaluation': 'process',
    'process': 'process',
    'learning': 'learning',
    'formative': 'learning'
  };

  var CONTEXT_MAP = {
    'stable': 'stable',
    'fragile': 'fragile',
    'conflict': 'fragile',
    'humanitarian': 'humanitarian',
    'emergency': 'humanitarian'
  };

  var BUDGET_MAP = {
    'under_50k': 'low', 'low': 'low',
    '50k_200k': 'medium', 'medium': 'medium',
    'over_200k': 'high', 'high': 'high'
  };

  var TIMELINE_MAP = {
    'under_6m': 'short', 'short': 'short',
    '6m_18m': 'medium', 'medium': 'medium',
    'over_18m': 'long', 'long': 'long'
  };

  function torToDesignAnswers(torConstraints, projectMeta) {
    var answers = {};
    var tor = torConstraints || {};
    var meta = projectMeta || {};

    // purpose — take first from array
    var purpose = Array.isArray(tor.evaluation_purpose) ? tor.evaluation_purpose[0] : tor.evaluation_purpose;
    if (purpose && PURPOSE_MAP[purpose]) answers.purpose = PURPOSE_MAP[purpose];

    // Direct mappings from TOR constraints
    if (tor.causal_inference_level) answers.causal = tor.causal_inference_level;
    if (tor.comparison_feasibility) answers.comparison = tor.comparison_feasibility;
    if (tor.data_available) answers.data = tor.data_available;

    // Project meta mappings
    if (meta.operating_context && CONTEXT_MAP[meta.operating_context]) answers.context = CONTEXT_MAP[meta.operating_context];
    if (meta.budget && BUDGET_MAP[meta.budget]) answers.budget = BUDGET_MAP[meta.budget];
    if (meta.timeline && TIMELINE_MAP[meta.timeline]) answers.timeline = TIMELINE_MAP[meta.timeline];
    if (meta.programme_maturity) answers.maturity = meta.programme_maturity;

    // complexity and unit are NOT pre-filled — user must answer
    return answers;
  }

  function useDesignBridge(iframeRef, prefillAnswers, onExport) {
    var readyState = React.useState(false);
    var ready = readyState[0];
    var setReady = readyState[1];

    React.useEffect(function() {
      function handleMessage(e) {
        if (!e.data || !e.data.type) return;

        if (e.data.type === 'DESIGN_READY') {
          setReady(true);
          // Send pre-filled answers to the Design Advisor iframe
          if (iframeRef.current && prefillAnswers) {
            iframeRef.current.contentWindow.postMessage({
              type: 'PRAXIS_INIT',
              payload: { answers: prefillAnswers }
            }, '*');
          }
        } else if (e.data.type === 'DESIGN_EXPORT' && e.data.payload) {
          if (onExport) onExport(e.data.payload);
        }
      }

      window.addEventListener('message', handleMessage);
      return function() { window.removeEventListener('message', handleMessage); };
    }, [prefillAnswers, onExport]);

    return { ready: ready };
  }

  // Expose to global scope
  window.torToDesignAnswers = torToDesignAnswers;
  window.useDesignBridge = useDesignBridge;
})();
