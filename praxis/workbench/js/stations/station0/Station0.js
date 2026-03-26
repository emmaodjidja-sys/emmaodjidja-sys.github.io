(function(global) {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useMemo = React.useMemo;

  var OPERATING_CONTEXTS = [
    { value: '', label: 'Select...' },
    { value: 'stable', label: 'Stable' },
    { value: 'fragile', label: 'Fragile or conflict-affected' },
    { value: 'humanitarian', label: 'Humanitarian / emergency' }
  ];

  var BUDGETS = [
    { value: '', label: 'Select...' },
    { value: 'low', label: 'Low (under $50k)' },
    { value: 'medium', label: 'Medium ($50k-$250k)' },
    { value: 'high', label: 'High (over $250k)' }
  ];

  var TIMELINES = [
    { value: '', label: 'Select...' },
    { value: 'short', label: 'Short (under 6 months)' },
    { value: 'medium', label: 'Medium (6-12 months)' },
    { value: 'long', label: 'Long (over 12 months)' }
  ];

  var MATURITY = [
    { value: '', label: 'Select...' },
    { value: 'pilot', label: 'Pilot / new programme' },
    { value: 'scaling', label: 'Scaling up' },
    { value: 'mature', label: 'Mature / established' },
    { value: 'completed', label: 'Completed / closing' }
  ];

  var COMPLEXITY = [
    { value: '', label: 'Select...' },
    { value: 'simple', label: 'Simple: one main activity with a clear expected result' },
    { value: 'complicated', label: 'Complicated: several activities, but we understand how they connect' },
    { value: 'complex', label: 'Complex: many moving parts, results are hard to predict' }
  ];

  var DATA_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'baseline_endline', label: 'We have data from before and after the programme' },
    { value: 'timeseries', label: 'We have regular monitoring data over time' },
    { value: 'routine_only', label: 'We only have programme reports and records' },
    { value: 'minimal', label: 'We have little or no existing data' }
  ];

  var COMPARISON_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'randomisable', label: 'Yes, we can randomly assign who gets the programme' },
    { value: 'natural', label: 'Yes, there is a similar group that did not receive the programme' },
    { value: 'threshold', label: 'Yes, there is a clear cutoff for who qualifies' },
    { value: 'none', label: 'No, everyone in the area received the programme' }
  ];

  var CAUSAL_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'attribution', label: 'We need to prove the programme caused the change' },
    { value: 'contribution', label: 'We need to show the programme likely contributed to the change' },
    { value: 'description', label: 'We need to document what happened and how' }
  ];

  var CONFLICT_QUESTIONS = [
    'This evaluation involves conflict-affected populations',
    'Data collection could expose respondents to risk',
    'The programme addresses violent extremism or PVE/CVE',
    'Findings could be politically sensitive',
    'Evaluation requires access to areas with security restrictions'
  ];

  function SelectField(props) {
    return h('div', { className: 'station-form-row' },
      h('label', { className: 'wb-label' }, props.label),
      h('select', {
        className: 'wb-select',
        value: props.value,
        onChange: function(e) { props.onChange(e.target.value); }
      }, props.options.map(function(opt) {
        return h('option', { key: opt.value, value: opt.value }, opt.label);
      })),
      props.hint ? h('p', { className: 'station-form-hint' }, props.hint) : null
    );
  }

  function InputField(props) {
    return h('div', { className: 'station-form-row' },
      h('label', { className: 'wb-label' }, props.label),
      h('input', {
        className: 'wb-input',
        type: props.type || 'text',
        value: props.value,
        placeholder: props.placeholder || '',
        onChange: function(e) { props.onChange(e.target.value); }
      }),
      props.hint ? h('p', { className: 'station-form-hint' }, props.hint) : null
    );
  }

  function Station0(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;

    var step = useState(0);
    var currentStep = step[0];
    var setStep = step[1];

    // Local form state (initialized from context)
    var meta = useState(Object.assign({}, context.project_meta));
    var localMeta = meta[0];
    var setMeta = meta[1];

    var tor = useState(Object.assign({}, context.tor_constraints));
    var localTor = tor[0];
    var setTor = tor[1];

    var sensitivity = useState(context.protection.sensitivity);
    var localSens = sensitivity[0];
    var setSens = sensitivity[1];

    var conflicts = useState([false, false, false, false, false]);
    var localConflicts = conflicts[0];
    var setConflicts = conflicts[1];

    var eqs = useState((context.tor_constraints.evaluation_questions_raw || []).join('\n'));
    var localEqs = eqs[0];
    var setEqs = eqs[1];

    // Compute evaluability
    var evaluability = useMemo(function() {
      var torForScoring = Object.assign({}, localTor, {
        evaluation_questions_raw: localEqs.split('\n').filter(function(q) { return q.trim(); })
      });
      return PraxisEvaluabilityScorer.scoreEvaluability(localMeta, torForScoring);
    }, [localMeta, localTor, localEqs]);

    function updateMeta(field, value) {
      setMeta(function(prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
    }

    function updateTor(field, value) {
      setTor(function(prev) {
        var next = Object.assign({}, prev);
        next[field] = value;
        return next;
      });
    }

    function toggleConflict(idx) {
      setConflicts(function(prev) {
        var next = prev.slice();
        next[idx] = !next[idx];
        return next;
      });
    }

    function handleSave() {
      var eqList = localEqs.split('\n').filter(function(q) { return q.trim(); });
      var finalTor = Object.assign({}, localTor, { evaluation_questions_raw: eqList });

      // Determine sensitivity from conflict screening
      var finalSens = localSens;
      var anyConflict = localConflicts.some(function(c) { return c; });
      if (anyConflict && finalSens === 'standard') {
        finalSens = 'sensitive';
      }

      dispatch({
        type: PraxisContext.ACTION.SAVE_STATION,
        stationId: 0,
        payload: {
          project_meta: localMeta,
          tor_constraints: finalTor,
          evaluability: evaluability,
          protection: {
            sensitivity: finalSens,
            ai_permitted: finalSens !== 'highly_sensitive',
            encryption_recommended: finalSens === 'highly_sensitive',
            sharing_guidance: PraxisProtection.getSharingGuidance({ protection: { sensitivity: finalSens } })
          }
        }
      });

      // Also update sensitivity in UI
      dispatch({ type: PraxisContext.ACTION.SET_SENSITIVITY, level: finalSens });
    }

    var totalSteps = 4;
    var needsConflictScreen = localMeta.operating_context === 'fragile' || localMeta.operating_context === 'humanitarian';

    // Step indicators
    var stepIndicators = [];
    for (var s = 0; s < totalSteps; s++) {
      var cls = 'station-step';
      if (s < currentStep) cls += ' station-step-done';
      else if (s === currentStep) cls += ' station-step-active';
      stepIndicators.push(h('div', { key: s, className: cls }));
    }

    // Step content
    var stepContent = null;

    if (currentStep === 0) {
      // Step 1: Project Info
      stepContent = h('div', { className: 'station-form' },
        h('h3', null, 'Project Information'),
        h(InputField, { label: 'Evaluation Title', value: localMeta.title, onChange: function(v) { updateMeta('title', v); }, placeholder: 'e.g., Midterm Evaluation of Resilience Programme' }),
        h(InputField, { label: 'Programme Name', value: localMeta.programme_name, onChange: function(v) { updateMeta('programme_name', v); } }),
        h('div', { className: 'station-form-grid' },
          h(InputField, { label: 'Organisation', value: localMeta.organisation, onChange: function(v) { updateMeta('organisation', v); } }),
          h(InputField, { label: 'Country', value: localMeta.country, onChange: function(v) { updateMeta('country', v); } })
        ),
        h('div', { className: 'station-form-grid' },
          h(SelectField, { label: 'Operating Context', value: localMeta.operating_context, options: OPERATING_CONTEXTS, onChange: function(v) { updateMeta('operating_context', v); } }),
          h(SelectField, { label: 'Programme Maturity', value: localMeta.programme_maturity, options: MATURITY, onChange: function(v) { updateMeta('programme_maturity', v); } })
        ),
        h('div', { className: 'station-form-grid' },
          h(SelectField, { label: 'Budget', value: localMeta.budget, options: BUDGETS, onChange: function(v) { updateMeta('budget', v); } }),
          h(SelectField, { label: 'Timeline', value: localMeta.timeline, options: TIMELINES, onChange: function(v) { updateMeta('timeline', v); } })
        )
      );
    }

    if (currentStep === 1) {
      // Step 2: TOR Constraints
      stepContent = h('div', { className: 'station-form' },
        h('h3', null, 'What do you need from this evaluation?'),
        h(SelectField, { label: 'What does the commissioner need to know?', value: localTor.causal_inference_level, options: CAUSAL_OPTIONS, onChange: function(v) { updateTor('causal_inference_level', v); }, hint: 'This determines which evaluation designs are appropriate.' }),
        h(SelectField, { label: 'Is there a comparison group?', value: localTor.comparison_feasibility, options: COMPARISON_OPTIONS, onChange: function(v) { updateTor('comparison_feasibility', v); }, hint: 'A group that did not receive the programme, to compare results against.' }),
        h(SelectField, { label: 'What data already exists?', value: localTor.data_available, options: DATA_OPTIONS, onChange: function(v) { updateTor('data_available', v); }, hint: 'Existing data reduces the cost and time needed for the evaluation.' }),
        h(SelectField, { label: 'How complex is the programme?', value: localTor.programme_complexity, options: COMPLEXITY, onChange: function(v) { updateTor('programme_complexity', v); }, hint: 'Complex programmes need different evaluation approaches than simple ones.' }),
        h('div', { className: 'station-form-row' },
          h('label', { className: 'wb-label' }, 'Evaluation Questions'),
          h('textarea', {
            className: 'wb-textarea',
            rows: 5,
            value: localEqs,
            placeholder: 'Enter one evaluation question per line...',
            onChange: function(e) { setEqs(e.target.value); }
          }),
          h('p', { className: 'station-form-hint' }, 'From the Terms of Reference or your own formulation. One per line.')
        )
      );
    }

    if (currentStep === 2) {
      // Step 3: Sensitivity & Conflict
      stepContent = h('div', { className: 'station-form' },
        h('h3', null, 'Sensitivity Classification'),
        h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)', marginBottom: '16px' } },
          'This classification governs AI feature availability, sharing guidance, and encryption recommendations.'
        ),
        ['standard', 'sensitive', 'highly_sensitive'].map(function(level) {
          var info = PraxisProtection.SENSITIVITY_LEVELS[level];
          var active = localSens === level;
          return h('div', {
            key: level,
            className: 'sensitivity-option' + (active ? ' sensitivity-option-active' : ''),
            onClick: function() { setSens(level); }
          },
            h('div', { className: 'sensitivity-option-title' }, info.label),
            h('div', { className: 'sensitivity-option-desc' },
              level === 'standard' ? 'No special restrictions. AI features available. Share freely.' :
              level === 'sensitive' ? 'AI disabled by default. Share via encrypted channels. Anonymisation prompts shown.' :
              'AI fully disabled. File encrypted. Share only via secure organisational platforms.'
            )
          );
        }),
        needsConflictScreen ? h('div', { style: { marginTop: '24px' } },
          h('h3', null, 'Conflict Sensitivity Screening'),
          h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)', marginBottom: '16px' } },
            'You indicated a fragile or humanitarian operating context. Please review the following:'
          ),
          CONFLICT_QUESTIONS.map(function(q, i) {
            return h('div', { key: i, className: 'conflict-question' },
              h('label', null,
                h('input', { type: 'checkbox', checked: localConflicts[i], onChange: function() { toggleConflict(i); } }),
                ' ' + q
              )
            );
          })
        ) : null
      );
    }

    if (currentStep === 3) {
      // Step 4: Evaluability Results
      var scoreClass = evaluability.score >= 70 ? 'evaluability-score-high' :
                       evaluability.score >= 40 ? 'evaluability-score-mid' : 'evaluability-score-low';

      stepContent = h('div', { className: 'station-form' },
        h('h3', null, 'Evaluability Assessment'),
        h('div', { style: { marginBottom: '24px' } },
          h('div', { className: 'evaluability-score ' + scoreClass }, evaluability.score),
          h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)', marginTop: '8px' } }, 'Evaluability Score (0-100)')
        ),
        h('div', { style: { marginBottom: '24px' } },
          h('div', { className: 'evaluability-item' },
            h('span', { className: 'evaluability-item-label' }, 'Data Readiness'),
            h('span', { className: 'evaluability-item-value' }, evaluability.data_readiness || 'Not assessed')
          ),
          h('div', { className: 'evaluability-item' },
            h('span', { className: 'evaluability-item-label' }, 'ToC Clarity'),
            h('span', { className: 'evaluability-item-value' }, evaluability.toc_clarity || 'Not assessed')
          ),
          h('div', { className: 'evaluability-item' },
            h('span', { className: 'evaluability-item-label' }, 'Stakeholder Access'),
            h('span', { className: 'evaluability-item-value' }, evaluability.stakeholder_access || 'Not assessed')
          ),
          h('div', { className: 'evaluability-item' },
            h('span', { className: 'evaluability-item-label' }, 'Timeline Adequate'),
            h('span', { className: 'evaluability-item-value' }, evaluability.timeline_adequate ? 'Yes' : 'No')
          )
        ),
        evaluability.blockers.length > 0 ? h('div', { style: { marginBottom: '16px' } },
          h('h4', { style: { fontSize: '14px', fontWeight: '600', marginBottom: '8px' } }, 'Blockers'),
          evaluability.blockers.map(function(b, i) {
            return h('div', { key: i, className: 'evaluability-blocker' }, b);
          })
        ) : null,
        evaluability.recommendations.length > 0 ? h('div', { style: { marginBottom: '16px' } },
          h('h4', { style: { fontSize: '14px', fontWeight: '600', marginBottom: '8px' } }, 'Recommendations'),
          evaluability.recommendations.map(function(r, i) {
            return h('div', { key: i, className: 'evaluability-rec' }, r);
          })
        ) : null
      );
    }

    return h('div', { className: 'wb-panel' },
      h('div', { style: { marginBottom: '24px' } },
        h('span', { className: 'wb-badge wb-badge-teal', style: { display: 'inline-block', marginBottom: '8px' } }, 'Pre-Inception'),
        h('h2', { style: { fontSize: '24px', fontWeight: '600', marginTop: '8px' } }, 'Station 0: Evaluability & Scoping'),
        h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)', marginTop: '4px' } },
          ['Project Information', 'What do you need from this evaluation?', 'Sensitivity & Safety', 'Evaluability Assessment'][currentStep]
        )
      ),
      h('div', { className: 'station-steps' }, stepIndicators),
      stepContent,
      h('div', { className: 'station-nav' },
        currentStep > 0
          ? h('button', { className: 'wb-btn wb-btn-ghost', onClick: function() { setStep(currentStep - 1); } }, 'Back')
          : h('div'),
        currentStep < totalSteps - 1
          ? h('button', { className: 'wb-btn wb-btn-primary', onClick: function() { setStep(currentStep + 1); } }, 'Continue')
          : h('button', { className: 'wb-btn wb-btn-primary', onClick: function() { handleSave(); } }, 'Save & Continue')
      )
    );
  }

  global.PraxisStation0 = Station0;

})(window);
