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
        }, design.name || design.label || 'Design ' + rank),
        // A tie is the difference between "this is second best" and "the sort put
        // this second". Contribution Analysis and Realist Evaluation score
        // identically under almost every answer set, so the distinction is not
        // hypothetical and the user should not have to infer it from the numbers.
        props.tied && h('span', { className: 'wb-design-tie-badge' }, 'Tied')
      ),
      design.score != null && h('div', {
        className: 'wb-design-result-score'
      }, 'Score: ' + design.score),
      props.tied && h('div', { className: 'wb-design-result-rationale' },
        'Scores level with ' + props.tied + '. The order between them is not a ranking. Choose on methodological grounds.'),
      design.rationale && h('div', {
        className: 'wb-design-result-rationale'
      }, design.rationale)
    );
  }

  /* Names of the other designs sharing each design's score, by index. */
  function tiePartners(designs) {
    return designs.map(function(d, i) {
      if (d.score == null) return null;
      var peers = designs.filter(function(o, j) { return j !== i && o.score === d.score; })
        .map(function(o) { return o.name || o.label; });
      return peers.length ? peers.join(' and ') : null;
    });
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
    var V = window.PraxisDesignVocab;
    var bridged = React.useMemo(function() {
      return V.torToDesignAnswers(
        context.tor_constraints || {},
        context.project_meta || {}
      );
    }, [context.tor_constraints, context.project_meta]);
    var basePrefill = bridged.answers;

    // Local overrides for edited answers
    var overrideState = React.useState({});
    var overrides = overrideState[0];
    var setOverrides = overrideState[1];

    // Answers previously persisted to design_recommendation.answers (either by
    // an advisor save or by handleChangeAnswer below); they survive navigation.
    var savedAnswers = (context.design_recommendation && context.design_recommendation.answers) || {};

    // Merge base prefill with persisted answers, then any session overrides, and
    // normalize the result. Saved answers arrive from a .praxis file that may
    // predate this vocabulary or have been hand-edited, so they are untrusted
    // input like any other: a value the engine cannot score must surface as a
    // question the user still owes, not vanish into a zero-weighted rule.
    var resolved = React.useMemo(function() {
      var merged = {};
      Object.keys(basePrefill).forEach(function(k) { merged[k] = basePrefill[k]; });
      Object.keys(savedAnswers).forEach(function(k) { if (savedAnswers[k] != null) merged[k] = savedAnswers[k]; });
      Object.keys(overrides).forEach(function(k) { merged[k] = overrides[k]; });
      return V.normalizeAnswers(merged);
    }, [basePrefill, savedAnswers, overrides]);
    var prefillAnswers = resolved.answers;

    // Everything the user is owed an explanation for: values we could not score,
    // plus parameters the ToR left genuinely ambiguous. A note only stands while
    // its parameter is still unanswered. A multi-purpose ToR raises one, but if
    // the file already carries a chosen purpose then the ambiguity is settled and
    // saying otherwise would be nagging about a decision already made.
    var openIssues = resolved.rejected.concat(
      bridged.notes
        .filter(function(n) { return prefillAnswers[n.key] == null; })
        .map(function(n) { return { key: n.key, raw: null, reason: n.text }; })
    );

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
      var record = Object.assign({}, payload, {
        completed_at: hasDesigns ? new Date().toISOString() : null,
        // Bind the ranking to the answers it came from, so a later render can tell
        // whether it is still the ranking the engine would produce. Without this a
        // stored list is unfalsifiable, which is how a hand-written one survived in
        // the shipped demos and re-scored differently the moment anyone re-opened
        // the advisor.
        answers_fingerprint: V.fingerprintAnswers((payload && payload.answers) || {})
      });
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

    // Is the stored ranking still the one the engine would produce from the
    // answers now on screen? A ranking saved before fingerprints existed cannot
    // vouch for itself either, so it is treated as unverified rather than assumed
    // good. That assumption is exactly what shipped a wrong ranking in the demos.
    var storedFp = designRec && designRec.answers_fingerprint;
    var currentFp = V.fingerprintAnswers(prefillAnswers);
    var rankingState = 'current';
    if (rankedDesigns.length) {
      if (!storedFp) rankingState = 'unverified';
      else if (storedFp !== currentFp) rankingState = 'stale';
    }
    var ties = tiePartners(rankedDesigns);

    var STALE_COPY = {
      stale: 'These recommendations were scored from different design parameters than the ones above. They are shown for reference only. Re-score to bring them in line.',
      unverified: 'These recommendations were not recorded with the parameters they were scored from, so the Workbench cannot confirm they match the answers above. Re-score to confirm them.'
    };

    return h('div', { className: 'wb-station wb-station-3' },
      // Header
      h('div', { className: 'wb-station-header' },
        h('h2', { className: 'wb-station-title' }, 'Evaluation Design'),
        h('p', { className: 'wb-station-desc' },
          filledCount + ' of 10 questions pre-filled from your evaluability assessment'
        )
      ),

      // Parameters we could not carry over, and why. Silence here is what let an
      // unscoreable value look identical to an answered question.
      openIssues.length > 0 && h(SectionCard, { title: 'Needs your input' },
        h('div', { className: 'wb-design-issues', role: 'status' },
          openIssues.map(function(issue, i) {
            return h('div', { key: i, className: 'wb-design-issue' },
              h('span', { className: 'wb-design-issue-key' }, QUESTION_LABELS[issue.key] || issue.key),
              h('span', { className: 'wb-design-issue-reason' }, issue.reason)
            );
          })
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
        rankingState !== 'current' && h('div', {
          className: 'wb-design-stale-notice', role: 'status'
        }, STALE_COPY[rankingState]),
        h('div', {
          className: 'wb-design-results' + (rankingState !== 'current' ? ' wb-design-results--stale' : '')
        },
          rankedDesigns.map(function(design, i) {
            return h(DesignSummaryCard, { key: i, design: design, rank: i + 1, tied: ties[i] });
          })
        )
      ),

      // Primary action
      h('button', {
        className: 'wb-btn wb-btn-primary',
        onClick: function() { setMode('canvas'); }
      }, rankedDesigns.length === 0 ? 'Review & Score Designs'
         : rankingState === 'current' ? 'Revise Design Scoring' : 'Re-score Designs'),

      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 3, dispatch: dispatch }) : null
    );
  }

  // Expose to global scope
  window.Station3 = Station3;
})();
