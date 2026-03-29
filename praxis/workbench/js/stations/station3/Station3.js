(function() {
  'use strict';

  var h = React.createElement;

  var QUESTION_LABELS = {
    purpose: 'Evaluation Purpose',
    causal: 'Causal Evidence Level',
    comparison: 'Comparison Group',
    data: 'Data Availability',
    context: 'Operating Context',
    budget: 'Budget',
    timeline: 'Timeline',
    maturity: 'Programme Maturity',
    complexity: 'Programme Complexity',
    unit: 'Unit of Intervention'
  };

  var ALL_QUESTION_IDS = [
    'purpose', 'causal', 'comparison', 'data', 'context',
    'budget', 'timeline', 'maturity', 'complexity', 'unit'
  ];

  // ── Question Card ──────────────────────────────────────────────────
  function QuestionCard(props) {
    var id = props.id;
    var value = props.value;
    var filled = value != null;

    return h('div', {
      className: 'wb-card',
      style: {
        borderLeft: '4px solid ' + (filled ? '#2e7d32' : '#f9a825'),
        padding: '12px 16px',
        marginBottom: '8px'
      }
    },
      h('div', {
        className: 'wb-card-label',
        style: { fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }
      }, QUESTION_LABELS[id]),
      filled
        ? h('div', {
            className: 'wb-card-value',
            style: { fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }
          }, value)
        : h('div', {
            className: 'wb-card-placeholder',
            style: { fontSize: '13px', fontStyle: 'italic', color: '#f57f17' }
          }, 'Your input needed')
    );
  }

  // ── Design Summary Card ────────────────────────────────────────────
  function DesignSummaryCard(props) {
    var design = props.design;
    var rank = props.rank;

    return h('div', {
      className: 'wb-card',
      style: {
        padding: '16px',
        marginBottom: '12px',
        borderLeft: '4px solid ' + (rank === 1 ? '#1565c0' : '#90a4ae')
      }
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' } },
        h('span', {
          className: 'wb-badge',
          style: {
            background: rank === 1 ? '#1565c0' : '#546e7a',
            color: '#fff',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '12px',
            fontWeight: 700
          }
        }, '#' + rank),
        h('span', {
          style: { fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }
        }, design.name || design.label || 'Design ' + rank)
      ),
      design.score != null && h('div', {
        style: { fontSize: '13px', color: '#555' }
      }, 'Score: ' + design.score),
      design.rationale && h('div', {
        style: { fontSize: '13px', color: '#666', marginTop: '4px' }
      }, design.rationale)
    );
  }

  // ── Canvas Mode (iframe overlay) ──────────────────────────────────
  function CanvasMode(props) {
    var prefillAnswers = props.prefillAnswers;
    var onSave = props.onSave;
    var onClose = props.onClose;
    var iframeRef = React.useRef(null);

    var bridge = window.useDesignBridge(iframeRef, prefillAnswers, function(payload) {
      onSave(payload);
    });

    return h('div', {
      className: 'wb-canvas-overlay',
      style: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }
    },
      // Header bar
      h('div', {
        className: 'wb-canvas-header',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid #e0e0e0',
          background: '#fafafa',
          flexShrink: 0
        }
      },
        h('span', {
          style: { fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }
        }, 'Evaluation Design Advisor'),
        h('div', { style: { display: 'flex', gap: '10px' } },
          h('button', {
            className: 'wb-btn wb-btn-primary',
            onClick: function() {
              // Request export from iframe
              if (iframeRef.current) {
                iframeRef.current.contentWindow.postMessage({ type: 'PRAXIS_REQUEST_EXPORT' }, '*');
              }
            },
            style: { fontSize: '13px', padding: '6px 16px' }
          }, 'Save to Workbench'),
          h('button', {
            className: 'wb-btn wb-btn-ghost',
            onClick: onClose,
            style: { fontSize: '13px', padding: '6px 16px' }
          }, 'Close')
        )
      ),
      // Iframe
      h('iframe', {
        ref: iframeRef,
        src: '/praxis/tools/evaluation-design-advisor/',
        style: { flex: 1, border: 'none', width: '100%' },
        title: 'Evaluation Design Advisor'
      })
    );
  }

  // ── Station 3 Main ─────────────────────────────────────────────────
  function Station3(props) {
    var state = props.state;
    var dispatch = props.dispatch;

    var modeState = React.useState('landing');
    var mode = modeState[0];
    var setMode = modeState[1];

    // Derive pre-filled answers from Station 0 context
    var context = (state && state.context) || {};
    var prefillAnswers = React.useMemo(function() {
      return window.torToDesignAnswers(
        context.tor_constraints || {},
        context.project_meta || {}
      );
    }, [context.tor_constraints, context.project_meta]);

    // Existing design recommendation from state
    var designRec = context.design_recommendation || null;

    // Count pre-filled
    var filledCount = Object.keys(prefillAnswers).length;

    function handleSave(payload) {
      dispatch({ type: 'SAVE_STATION', stationId: 3, data: { design_recommendation: payload } });
      setMode('landing');
    }

    // ── Canvas mode ──
    if (mode === 'canvas') {
      return h(CanvasMode, {
        prefillAnswers: prefillAnswers,
        onSave: handleSave,
        onClose: function() { setMode('landing'); }
      });
    }

    // ── Landing mode ──
    var rankedDesigns = (designRec && designRec.ranked_designs) ? designRec.ranked_designs.slice(0, 3) : [];

    return h('div', { className: 'wb-station wb-station-3' },
      // Header
      h('div', { className: 'wb-station-header', style: { marginBottom: '20px' } },
        h('h2', {
          className: 'wb-station-title',
          style: { fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '6px' }
        }, 'Evaluation Design'),
        h('p', {
          className: 'wb-station-subtitle',
          style: { fontSize: '14px', color: '#555', margin: 0 }
        }, filledCount + ' of 10 questions pre-filled from your evaluability assessment')
      ),

      // Question grid
      h('div', {
        className: 'wb-question-grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '8px',
          marginBottom: '24px'
        }
      },
        ALL_QUESTION_IDS.map(function(id) {
          return h(QuestionCard, {
            key: id,
            id: id,
            value: prefillAnswers[id] || null
          });
        })
      ),

      // Existing design results summary
      rankedDesigns.length > 0 && h('div', {
        className: 'wb-design-results',
        style: { marginBottom: '24px' }
      },
        h('h3', {
          style: { fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px' }
        }, 'Recommended Designs'),
        rankedDesigns.map(function(design, i) {
          return h(DesignSummaryCard, { key: i, design: design, rank: i + 1 });
        })
      ),

      // Primary action
      h('button', {
        className: 'wb-btn wb-btn-primary',
        onClick: function() { setMode('canvas'); },
        style: { fontSize: '14px', padding: '10px 24px' }
      }, rankedDesigns.length > 0 ? 'Revise Design Scoring' : 'Review & Score Designs')
    );
  }

  // Expose to global scope
  window.Station3 = Station3;
})();
