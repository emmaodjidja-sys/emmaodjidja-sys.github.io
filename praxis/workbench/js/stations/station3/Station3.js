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

  var QUESTION_OPTIONS = {
    purpose: [
      { value: 'impact', label: 'Impact', desc: 'Did the programme cause the change?' },
      { value: 'outcome', label: 'Outcome', desc: 'Did the expected changes occur?' },
      { value: 'process', label: 'Process', desc: 'How was it implemented?' },
      { value: 'learning', label: 'Learning', desc: 'How should the programme adapt?' }
    ],
    causal: [
      { value: 'attribution', label: 'Attribution', desc: 'Prove the programme caused the change' },
      { value: 'contribution', label: 'Contribution', desc: 'Show plausible contribution' },
      { value: 'description', label: 'Description', desc: 'Document what happened' }
    ],
    comparison: [
      { value: 'randomisable', label: 'Random assignment possible', desc: 'Can randomly assign programme' },
      { value: 'natural', label: 'Natural comparison exists', desc: 'Similar groups not receiving programme' },
      { value: 'threshold', label: 'Eligibility threshold', desc: 'Score/cutoff for selection' },
      { value: 'none', label: 'No comparison group', desc: 'Universal or no feasible comparison' }
    ],
    data: [
      { value: 'baseline_endline', label: 'Baseline + endline', desc: 'Collected for both groups' },
      { value: 'timeseries', label: 'Routine time series', desc: 'Regular data over time (HMIS, DHIS2)' },
      { value: 'routine_only', label: 'Routine data only', desc: 'Admin/monitoring, no formal baseline' },
      { value: 'minimal', label: 'Minimal / none', desc: 'Need to collect from scratch' }
    ],
    context: [
      { value: 'stable', label: 'Stable', desc: 'Normal development, good access' },
      { value: 'fragile', label: 'Fragile / conflict', desc: 'Security constraints, limited access' },
      { value: 'humanitarian', label: 'Humanitarian', desc: 'Acute crisis, displacement' }
    ],
    budget: [
      { value: 'low', label: 'Low (<$50K)', desc: 'Internal or light-touch' },
      { value: 'medium', label: 'Medium ($50-200K)', desc: 'Standard commissioned evaluation' },
      { value: 'high', label: 'High ($200K+)', desc: 'Large-scale or multi-country' }
    ],
    timeline: [
      { value: 'short', label: 'Short (<3 months)', desc: 'Rapid assessment' },
      { value: 'medium', label: 'Medium (3-12 months)', desc: 'Standard evaluation' },
      { value: 'long', label: 'Long (12+ months)', desc: 'Multi-year evaluation' }
    ],
    maturity: [
      { value: 'pilot', label: 'Pilot / early', desc: 'Testing new approach' },
      { value: 'scaling', label: 'Scaling up', desc: 'Expanding to new areas' },
      { value: 'mature', label: 'Mature / ongoing', desc: 'Established for years' },
      { value: 'completed', label: 'Completed', desc: 'Retrospective evaluation' }
    ],
    complexity: [
      { value: 'simple', label: 'Simple / linear', desc: 'Clear causal chain' },
      { value: 'complicated', label: 'Complicated', desc: 'Multiple components, predictable' },
      { value: 'complex', label: 'Complex / adaptive', desc: 'Emergent, feedback loops' }
    ],
    unit: [
      { value: 'individual', label: 'Individual / household', desc: 'Direct service to people' },
      { value: 'cluster', label: 'Facility / community', desc: 'Targets groups/institutions' },
      { value: 'system', label: 'System / policy', desc: 'National reform, governance' }
    ]
  };

  // ── Option Card (selectable during edit) ────────────────────────────
  function OptionCard(props) {
    var opt = props.option;
    var selected = props.selected;
    var cardClass = 'wb-select-card' + (selected ? ' wb-select-card--active' : '');

    return h('div', {
      onClick: props.onSelect,
      className: cardClass
    },
      h('div', { className: 'wb-option-label' + (selected ? ' wb-option-label--selected' : '') }, opt.label),
      opt.desc && h('div', { className: 'wb-option-desc' }, opt.desc)
    );
  }

  // ── Question Card ──────────────────────────────────────────────────
  function QuestionCard(props) {
    var id = props.id;
    var value = props.value;
    var filled = value != null;
    var onChangeAnswer = props.onChangeAnswer;

    var editState = React.useState(false);
    var editing = editState[0];
    var setEditing = editState[1];

    // Find display label for the current value
    var displayLabel = value;
    if (value && QUESTION_OPTIONS[id]) {
      var matchOpt = QUESTION_OPTIONS[id].find(function(o) { return o.value === value; });
      if (matchOpt) displayLabel = matchOpt.label;
    }

    function handleSelect(optValue) {
      if (onChangeAnswer) onChangeAnswer(id, optValue);
      setEditing(false);
    }

    // Editing mode: show option cards
    if (editing && QUESTION_OPTIONS[id]) {
      return h('div', {
        className: 'wb-card wb-question-card wb-question-card--editing'
      },
        h('div', {
          className: 'wb-question-card-header wb-question-card-header--editing'
        },
          h('div', {
            className: 'wb-question-card-title wb-question-card-title--editing'
          }, QUESTION_LABELS[id]),
          h('button', {
            onClick: function() { setEditing(false); },
            className: 'wb-btn wb-btn-ghost wb-btn-sm'
          }, 'Cancel')
        ),
        QUESTION_OPTIONS[id].map(function(opt) {
          return h(OptionCard, {
            key: opt.value,
            option: opt,
            selected: opt.value === value,
            onSelect: function() { handleSelect(opt.value); }
          });
        })
      );
    }

    // Read-only mode
    var cardClass = 'wb-card wb-question-card' + (filled ? ' wb-question-card--filled' : ' wb-question-card--empty');

    return h('div', {
      className: cardClass
    },
      h('div', {
        className: 'wb-question-card-header'
      },
        h('div', {
          className: 'wb-question-card-title'
        }, QUESTION_LABELS[id]),
        filled && onChangeAnswer
          ? h('button', {
              onClick: function() { setEditing(true); },
              'aria-label': 'Edit ' + QUESTION_LABELS[id],
              className: 'wb-btn wb-btn-outline wb-btn-sm'
            }, 'Edit')
          : null
      ),
      filled
        ? h('div', { className: 'wb-question-card-value' }, displayLabel)
        : h('div', { className: 'wb-question-card-hint' }, 'Your input needed')
    );
  }

  // ── Design Summary Card ────────────────────────────────────────────
  function DesignSummaryCard(props) {
    var design = props.design;
    var rank = props.rank;
    var isTop = rank === 1;

    return h('div', {
      className: 'wb-card wb-design-result' + (isTop ? ' wb-design-result--top' : '')
    },
      h('div', { className: 'wb-design-result-header' },
        h('span', {
          className: 'wb-design-rank' + (isTop ? ' wb-design-rank--top' : '')
        }, '#' + rank),
        h('span', {
          className: 'wb-design-result-name'
        }, design.name || design.label || 'Design ' + rank)
      ),
      design.score != null && h('div', {
        className: 'wb-design-result-score'
      }, 'Score: ' + design.score),
      design.rationale && h('div', {
        className: 'wb-design-result-rationale'
      }, design.rationale)
    );
  }

  // ── Canvas Mode (iframe overlay) ──────────────────────────────────
  var DESIGN_TOOL_SRC = '/praxis/tools/evaluation-design-advisor/';

  function CanvasMode(props) {
    var prefillAnswers = props.prefillAnswers;
    var onSave = props.onSave;
    var onClose = props.onClose;
    var iframeRef = React.useRef(null);

    // Bump reloadKey to re-mount the iframe (Retry).
    var reloadSt = React.useState(0);
    var reloadKey = reloadSt[0];
    var setReloadKey = reloadSt[1];

    // After 10s without a ready signal from the tool, surface an error fallback.
    var timedOutSt = React.useState(false);
    var timedOut = timedOutSt[0];
    var setTimedOut = timedOutSt[1];

    var bridge = window.useDesignBridge(iframeRef, prefillAnswers, function(payload) {
      onSave(payload);
    });
    var ready = bridge.ready;

    React.useEffect(function() {
      if (ready) return undefined;
      setTimedOut(false);
      var timer = setTimeout(function() { setTimedOut(true); }, 10000);
      return function() { clearTimeout(timer); };
    }, [ready, reloadKey]);

    var statusPanel = null;
    if (!ready && timedOut) {
      statusPanel = h('div', { className: 'wb-iframe-status', role: 'alert' },
        h('div', { className: 'wb-iframe-status-title' }, 'Design Advisor did not load'),
        h('div', { className: 'wb-iframe-status-desc' },
          'The embedded tool did not respond. Check your connection and retry, or open the Design Advisor in a new tab.'),
        h('div', { className: 'wb-iframe-status-actions' },
          h('button', {
            className: 'wb-btn wb-btn-primary wb-btn-sm',
            onClick: function() { setTimedOut(false); setReloadKey(function(k) { return k + 1; }); }
          }, 'Retry'),
          h('a', {
            className: 'wb-btn wb-btn-outline wb-btn-sm',
            href: DESIGN_TOOL_SRC, target: '_blank', rel: 'noopener'
          }, 'Open in new tab')
        )
      );
    } else if (!ready) {
      statusPanel = h('div', { className: 'wb-iframe-status', role: 'status', 'aria-live': 'polite' },
        h('div', { className: 'wb-spinner', 'aria-hidden': 'true' }),
        h('div', { className: 'wb-iframe-status-title' }, 'Loading Design Advisor...')
      );
    }

    return h('div', { className: 'wb-canvas-overlay' },
      // Header bar
      h('div', { className: 'wb-canvas-header' },
        h('span', { className: 'wb-canvas-header-title' }, 'Evaluation Design Advisor'),
        h('div', { className: 'wb-canvas-header-actions' },
          h('button', {
            className: 'wb-btn wb-btn-primary',
            onClick: function() {
              // Request export from iframe
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({ type: 'PRAXIS_REQUEST_EXPORT' }, window.location.origin);
              }
            }
          }, 'Save to Workbench'),
          h('button', {
            className: 'wb-btn wb-btn-ghost',
            onClick: onClose
          }, 'Close')
        )
      ),
      // Iframe with loading / error overlay
      h('div', { className: 'wb-iframe-wrap' },
        h('iframe', {
          key: reloadKey,
          ref: iframeRef,
          src: DESIGN_TOOL_SRC,
          className: 'wb-canvas-iframe',
          title: 'Evaluation Design Advisor'
        }),
        statusPanel
      )
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
    var basePrefill = React.useMemo(function() {
      return window.torToDesignAnswers(
        context.tor_constraints || {},
        context.project_meta || {}
      );
    }, [context.tor_constraints, context.project_meta]);

    // Local overrides for edited answers
    var overrideState = React.useState({});
    var overrides = overrideState[0];
    var setOverrides = overrideState[1];

    // Answers previously persisted to design_recommendation.answers (either by
    // an advisor save or by handleChangeAnswer below); they survive navigation.
    var savedAnswers = (context.design_recommendation && context.design_recommendation.answers) || {};

    // Merge base prefill with persisted answers, then any session overrides
    var prefillAnswers = React.useMemo(function() {
      var merged = {};
      Object.keys(basePrefill).forEach(function(k) { merged[k] = basePrefill[k]; });
      Object.keys(savedAnswers).forEach(function(k) { if (savedAnswers[k] != null) merged[k] = savedAnswers[k]; });
      Object.keys(overrides).forEach(function(k) { merged[k] = overrides[k]; });
      return merged;
    }, [basePrefill, savedAnswers, overrides]);

    function handleChangeAnswer(questionId, newValue) {
      setOverrides(function(prev) {
        var next = {};
        Object.keys(prev).forEach(function(k) { next[k] = prev[k]; });
        next[questionId] = newValue;
        return next;
      });
      // Persist edited answers so they survive navigation (previously they lived
      // only in local overrides state). deepMerge preserves ranked_designs.
      var mergedAnswers = Object.assign({}, prefillAnswers);
      mergedAnswers[questionId] = newValue;
      dispatch({
        type: 'SAVE_STATION',
        stationId: 3,
        data: { design_recommendation: { answers: mergedAnswers } }
      });
    }

    // Existing design recommendation from state
    var designRec = context.design_recommendation || null;

    // Count pre-filled
    var filledCount = Object.keys(prefillAnswers).length;

    function handleSave(payload) {
      // Stamp completed_at on save (the sole completion signal StationRail and
      // Station 9 consume), but only when the export carries ranked designs;
      // an early save with no results must not mark the station complete.
      var hasDesigns = payload && payload.ranked_designs && payload.ranked_designs.length;
      var record = Object.assign({}, payload, { completed_at: hasDesigns ? new Date().toISOString() : null });
      dispatch({ type: 'SAVE_STATION', stationId: 3, data: { design_recommendation: record } });
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
      h('div', { className: 'wb-station-header' },
        h('h2', { className: 'wb-station-title' }, 'Evaluation Design'),
        h('p', { className: 'wb-station-desc' },
          filledCount + ' of 10 questions pre-filled from your evaluability assessment'
        )
      ),

      // Question grid
      h(SectionCard, { title: 'Design Parameters' },
        h('div', { className: 'wb-question-grid' },
          ALL_QUESTION_IDS.map(function(id) {
            return h(QuestionCard, {
              key: id,
              id: id,
              value: prefillAnswers[id] || null,
              onChangeAnswer: handleChangeAnswer
            });
          })
        )
      ),

      // Existing design results summary
      rankedDesigns.length > 0 && h(SectionCard, { title: 'Recommended Designs' },
        h('div', { className: 'wb-design-results' },
          rankedDesigns.map(function(design, i) {
            return h(DesignSummaryCard, { key: i, design: design, rank: i + 1 });
          })
        )
      ),

      // Primary action
      h('button', {
        className: 'wb-btn wb-btn-primary',
        onClick: function() { setMode('canvas'); }
      }, rankedDesigns.length > 0 ? 'Revise Design Scoring' : 'Review & Score Designs'),

      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 3, dispatch: dispatch }) : null
    );
  }

  // Expose to global scope
  window.Station3 = Station3;
})();
