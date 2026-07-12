(function() {
  'use strict';
  var h = React.createElement;

  var PHASE_LABELS = ['Programme Details', 'Terms of Reference', 'Evaluability Assessment'];

  function generateEarlySignals(meta, tor) {
    var signals = [];
    if (meta.operating_context === 'fragile' && meta.programme_maturity === 'scaling') {
      signals.push('Fragile context with a scaling programme. Experimental designs may face feasibility constraints.');
    }
    if (meta.operating_context === 'humanitarian' && tor.comparison_feasibility === 'randomisable') {
      signals.push('Randomisation is rarely feasible in humanitarian contexts.');
    }
    if (tor.data_available === 'minimal' && tor.causal_inference_level === 'attribution') {
      signals.push('Attribution requires strong baseline data. Current data availability is minimal.');
    }
    if (meta.timeline === 'short' && tor.programme_complexity === 'complex') {
      signals.push('A short timeline with a complex programme may limit depth of evaluation.');
    }
    return signals;
  }

  function Station0(props) {
    var state = props.state;
    var dispatch = props.dispatch;

    var phaseState = React.useState(1);
    var currentPhase = phaseState[0];
    var setCurrentPhase = phaseState[1];

    var reviewState = React.useState(false);
    var showReview = reviewState[0];
    var setShowReview = reviewState[1];

    var metaState = React.useState(function() {
      var ctx = state.context.project_meta;
      return {
        programme_name: ctx.programme_name || '',
        organisation: ctx.organisation || '',
        sectors: ctx.sectors || [],
        country: ctx.country || '',
        budget: ctx.budget || '',
        operating_context: ctx.operating_context || '',
        programme_maturity: ctx.programme_maturity || '',
        timeline: ctx.timeline || ''
      };
    });
    var projectMeta = metaState[0];
    var setProjectMeta = metaState[1];

    var torState = React.useState(function() {
      var ctx = state.context.tor_constraints;
      return {
        raw_text: ctx.raw_text || '',
        evaluation_purpose: ctx.evaluation_purpose || [],
        causal_inference_level: ctx.causal_inference_level || '',
        comparison_feasibility: ctx.comparison_feasibility || '',
        data_available: ctx.data_available || '',
        unit_of_intervention: ctx.unit_of_intervention || '',
        programme_complexity: ctx.programme_complexity || '',
        geographic_scope: ctx.geographic_scope || '',
        target_population: ctx.target_population || '',
        evaluation_questions_raw: ctx.evaluation_questions_raw || []
      };
    });
    var torConstraints = torState[0];
    var setTorConstraints = torState[1];

    // The decision this evaluation serves lives on the commissioner governance block:
    // one shared truth, two lenses. Drafted here like the rest of Phase 2 and written on
    // Save as its own commissioner partial (disjoint subtree: governance only, never
    // users, so this draft's save can never clobber a users list edited elsewhere).
    var decisionState = React.useState(function() {
      var gov = ((state.context.commissioner || {}).governance) || {};
      return {
        decision_clock: gov.decision_clock || '',
        decision_window_opens: gov.decision_window_opens || '',
        decision_window_closes: gov.decision_window_closes || ''
      };
    });
    var decisionDraft = decisionState[0];
    var setDecisionDraft = decisionState[1];

    var overridesState = React.useState({});
    var overrides = overridesState[0];
    var setOverrides = overridesState[1];

    function handleMetaChange(field, value) {
      setProjectMeta(function(prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
    }

    function handleTorChange(field, value) {
      setTorConstraints(function(prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
    }

    function handleDecisionChange(field, value) {
      setDecisionDraft(function(prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
    }

    // Sensitivity applies immediately (it is safeguarding metadata, not a
    // draft field), rather than waiting for the Phase 1 "Save" action.
    function handleSensitivityChange(level) {
      dispatch({ type: PraxisContext.ACTION_TYPES.SET_SENSITIVITY, level: level });
    }

    function handleOverride(dimId, adjustedScore, justification) {
      setOverrides(function(prev) {
        var next = Object.assign({}, prev);
        next[dimId] = { adjustedScore: adjustedScore, justification: justification };
        return next;
      });
    }

    // Compute scoring result for Phase 3
    var scoringResult = EvaluabilityScorer.score(torConstraints, projectMeta);

    // Build review data for Phase 1
    var phase1ReviewData = {
      programme_name: projectMeta.programme_name,
      organisation: projectMeta.organisation,
      sectors: projectMeta.sectors,
      country: projectMeta.country,
      budget: projectMeta.budget,
      operating_context: projectMeta.operating_context,
      programme_maturity: projectMeta.programme_maturity,
      timeline: projectMeta.timeline
    };

    // Build review data for Phase 2
    var phase2ReviewData = {
      evaluation_purpose: torConstraints.evaluation_purpose,
      causal_inference_level: torConstraints.causal_inference_level,
      comparison_feasibility: torConstraints.comparison_feasibility,
      data_available: torConstraints.data_available,
      unit_of_intervention: torConstraints.unit_of_intervention,
      programme_complexity: torConstraints.programme_complexity,
      geographic_scope: torConstraints.geographic_scope,
      target_population: torConstraints.target_population
    };

    function handleSave() {
      var dims = scoringResult.dimensions.map(function(d) {
        var ov = overrides[d.id];
        return Object.assign({}, d, {
          adjusted_score: ov && ov.adjustedScore != null ? ov.adjustedScore : null,
          justification: ov && ov.justification ? ov.justification : null
        });
      });
      var adjustedTotal = dims.reduce(function(sum, d) {
        return sum + (d.adjusted_score != null ? d.adjusted_score : d.system_score);
      }, 0);

      dispatch({
        type: PraxisContext.ACTION_TYPES.SAVE_STATION,
        stationId: 0,
        payload: {
          project_meta: projectMeta,
          tor_constraints: torConstraints,
          evaluability: {
            score: adjustedTotal,
            dimensions: dims,
            blockers: scoringResult.blockers,
            recommendations: scoringResult.recommendations,
            completed_at: new Date().toISOString()
          }
        }
      });
      // Disjoint subtree from the station-0 payload above (project_meta / tor_constraints /
      // evaluability, never commissioner) and from the users list (governance only), so
      // neither this dispatch nor an in-progress primary-user quick-add can clobber the other.
      dispatch({
        type: PraxisContext.ACTION_TYPES.SAVE_STATION,
        stationId: 10,
        payload: { commissioner: { governance: {
          decision_clock: decisionDraft.decision_clock,
          decision_window_opens: decisionDraft.decision_window_opens,
          decision_window_closes: decisionDraft.decision_window_closes
        } } }
      });
      dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: 1 });
    }

    // Phase indicator bar
    var phaseBar = h('div', { className: 'wb-phases', style: { marginBottom: 20 } },
      PHASE_LABELS.map(function(label, i) {
        var num = i + 1;
        var isCurrent = currentPhase === num && !showReview;
        var isCompleted = currentPhase > num || (currentPhase === num && showReview);
        var cls = 'wb-phase' + (isCurrent ? ' wb-phase--current' : '') + (isCompleted ? ' wb-phase--completed' : '') + (!isCurrent && !isCompleted ? ' wb-phase--upcoming' : '');
        return h('div', { key: num, className: cls },
          h('span', { className: 'wb-phase-num' }, isCompleted ? PraxisIcons.check(12) : num),
          h('span', { style: { fontSize: '12px' } }, label)
        );
      })
    );

    // Render appropriate phase content
    var content;
    if (showReview && currentPhase === 1) {
      var signals1 = generateEarlySignals(projectMeta, torConstraints);
      content = h(PhaseReview, {
        phaseNumber: 1,
        phaseTitle: 'Programme Details',
        data: phase1ReviewData,
        earlySignals: signals1,
        onEdit: function() { setShowReview(false); },
        onContinue: function() { setCurrentPhase(2); setShowReview(false); },
        continueLabel: 'Continue to Phase 2'
      });
    } else if (showReview && currentPhase === 2) {
      var signals2 = generateEarlySignals(projectMeta, torConstraints);
      content = h(PhaseReview, {
        phaseNumber: 2,
        phaseTitle: 'Terms of Reference',
        data: phase2ReviewData,
        earlySignals: signals2,
        onEdit: function() { setShowReview(false); },
        onContinue: function() { setCurrentPhase(3); setShowReview(false); },
        continueLabel: 'Continue to Phase 3'
      });
    } else if (currentPhase === 1) {
      content = h(Phase1Programme, {
        data: projectMeta,
        onChange: handleMetaChange,
        onContinue: function() { setShowReview(true); },
        tier: state.ui.experienceTier,
        sensitivity: state.context.protection.sensitivity,
        onSensitivityChange: handleSensitivityChange
      });
    } else if (currentPhase === 2) {
      content = h(Phase2ToR, {
        data: torConstraints,
        onChange: handleTorChange,
        decision: decisionDraft,
        onDecisionChange: handleDecisionChange,
        primaryUsers: ((state.context.commissioner || {}).users || []).filter(function(u) { return u && u.tier === 'primary'; }),
        usersApi: (typeof CockpitSave !== 'undefined') ? CockpitSave.make(state.context, dispatch).listSetter('users') : null,
        onContinue: function() { setShowReview(true); },
        onBack: function() { setCurrentPhase(1); setShowReview(false); },
        tier: state.ui.experienceTier
      });
    } else if (currentPhase === 3) {
      content = h(Phase3Assessment, {
        scoringResult: scoringResult,
        overrides: overrides,
        onOverride: handleOverride,
        onSave: handleSave,
        onBack: function() { setCurrentPhase(2); setShowReview(false); }
      });
    }

    return h('div', null, phaseBar, content,
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 0, dispatch: dispatch, onSave: handleSave }) : null);
  }

  window.Station0 = Station0;
})();
