# PRAXIS Workbench Phase 2: Station 0 (Evaluability & Scoping) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Station 0 — the primary entry point where evaluators set project metadata, classify sensitivity, screen for conflict, and assess evaluability. When complete, an evaluator fills out a multi-step form and sees an evaluability score, with all data flowing into the shared .praxis context.

**Architecture:** Station 0 is a React component (`PraxisStation0`) that renders a 4-step form. It reads nothing from other stations (it's the first). On save, it dispatches `SAVE_STATION(0, { project_meta, tor_constraints, evaluability, protection })` to the context reducer, which triggers staleness on all downstream stations (1-8). A pure `EvaluabilityScorer` function computes the score from inputs.

**Tech Stack:** React 18 via CDN, React.createElement (no JSX), vanilla JS.

**Dependencies:** Phase 1 complete (schema.js, context.js, Shell.js, all CSS).

---

## File Structure

| File | Responsibility |
|---|---|
| `js/stations/station0/EvaluabilityScorer.js` | Pure scoring function: inputs -> { score, data_readiness, blockers, recommendations } |
| `js/stations/station0/Station0.js` | Multi-step form UI: project intake, TOR constraints, sensitivity/conflict, evaluability results |
| `js/shell/Shell.js` | MODIFY: render Station0 when activeStation === 0 instead of placeholder |
| `index.html` | MODIFY: add Station0 script tags |
| `lang/en.json` | MODIFY: add Station 0 form labels and guidance strings |
| `css/stations.css` | CREATE: Station-specific form styles |

---

### Task 1: Evaluability Scorer (pure function)

**Files:**
- Create: `praxis/workbench/js/stations/station0/EvaluabilityScorer.js`

- [ ] **Step 1: Create EvaluabilityScorer.js**

Pure function with zero DOM dependency. Takes project_meta and tor_constraints, returns evaluability assessment.

```javascript
(function(global) {
  'use strict';

  function scoreEvaluability(projectMeta, torConstraints) {
    var score = 0;
    var blockers = [];
    var recommendations = [];

    // Data availability (25 points)
    var dataScore = 0;
    switch (torConstraints.data_available) {
      case 'baseline_endline': dataScore = 25; break;
      case 'timeseries': dataScore = 20; break;
      case 'routine_only': dataScore = 15; break;
      case 'minimal': dataScore = 5; break;
      default: dataScore = 0;
    }
    score += dataScore;
    var dataReadiness = dataScore >= 20 ? 'good' : dataScore >= 10 ? 'partial' : 'none';
    if (dataScore < 10) {
      blockers.push('Limited existing data. Primary data collection will be essential.');
      recommendations.push('Plan for baseline data collection before programme midpoint.');
    }

    // ToC clarity (20 points)
    var tocScore = 0;
    if (torConstraints.evaluation_questions_raw && torConstraints.evaluation_questions_raw.length > 0) {
      tocScore += 10;
    }
    if (projectMeta.evaluation_type) {
      tocScore += 5;
    }
    if (torConstraints.evaluation_purpose && torConstraints.evaluation_purpose.length > 0) {
      tocScore += 5;
    }
    score += tocScore;
    var tocClarity = tocScore >= 15 ? 'good' : tocScore >= 8 ? 'partial' : 'none';
    if (tocScore < 8) {
      recommendations.push('Clarify evaluation questions and purpose before proceeding to the Theory of Change.');
    }

    // Timeline adequacy (20 points)
    var timelineScore = 0;
    var timeline = projectMeta.timeline;
    var complexity = torConstraints.programme_complexity;
    if (timeline === 'long') {
      timelineScore = 20;
    } else if (timeline === 'medium') {
      timelineScore = complexity === 'complex' ? 10 : 15;
    } else if (timeline === 'short') {
      timelineScore = complexity === 'complex' ? 0 : complexity === 'complicated' ? 5 : 10;
      if (complexity === 'complex') {
        blockers.push('Short timeline with complex programme. Consider Quick Inception or phased approach.');
      }
    }
    score += timelineScore;
    var timelineAdequate = timelineScore >= 15;

    // Operating context (15 points)
    var contextScore = 0;
    switch (projectMeta.operating_context) {
      case 'stable': contextScore = 15; break;
      case 'fragile': contextScore = 8; break;
      case 'humanitarian': contextScore = 3; break;
      default: contextScore = 10;
    }
    score += contextScore;
    if (projectMeta.operating_context === 'humanitarian') {
      recommendations.push('Humanitarian context may limit methodological options. Consider rapid evaluation approaches.');
    }

    // Comparison feasibility (20 points)
    var comparisonScore = 0;
    switch (torConstraints.comparison_feasibility) {
      case 'randomisable': comparisonScore = 20; break;
      case 'natural': comparisonScore = 15; break;
      case 'threshold': comparisonScore = 12; break;
      case 'none': comparisonScore = 5; break;
      default: comparisonScore = 10;
    }
    score += comparisonScore;
    if (comparisonScore <= 5) {
      recommendations.push('No comparison group available. Theory-based or contribution analysis approaches recommended.');
    }

    // Stakeholder access estimate
    var stakeholderAccess = 'partial';
    if (projectMeta.operating_context === 'stable' && timeline !== 'short') {
      stakeholderAccess = 'good';
    } else if (projectMeta.operating_context === 'humanitarian' || timeline === 'short') {
      stakeholderAccess = 'none';
      recommendations.push('Limited stakeholder access expected. Plan remote data collection methods as backup.');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      data_readiness: dataReadiness,
      toc_clarity: tocClarity,
      stakeholder_access: stakeholderAccess,
      timeline_adequate: timelineAdequate,
      blockers: blockers,
      recommendations: recommendations,
      completed_at: new Date().toISOString()
    };
  }

  global.PraxisEvaluabilityScorer = { scoreEvaluability: scoreEvaluability };

})(window);
```

- [ ] **Step 2: Commit**

```bash
git add praxis/workbench/js/stations/station0/EvaluabilityScorer.js
git commit -m "Phase 2.1: EvaluabilityScorer pure function"
```

---

### Task 2: Station 0 form UI

**Files:**
- Create: `praxis/workbench/js/stations/station0/Station0.js`
- Create: `praxis/workbench/css/stations.css`

- [ ] **Step 1: Create css/stations.css**

```css
/* Station form layout */
.station-form {
  max-width: 640px;
}

.station-form-section {
  margin-bottom: var(--wb-space-xl);
}

.station-form-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--wb-space-md);
  padding-bottom: var(--wb-space-sm);
  border-bottom: 1px solid var(--wb-border);
}

.station-form-row {
  margin-bottom: var(--wb-space-md);
}

.station-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--wb-space-md);
}

@media (max-width: 640px) {
  .station-form-grid { grid-template-columns: 1fr; }
}

.station-form-hint {
  font-size: 12px;
  color: var(--wb-text-muted);
  margin-top: 4px;
}

/* Select */
.wb-select {
  width: 100%;
  padding: 8px 12px;
  font-family: var(--wb-font);
  font-size: 14px;
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius-sm);
  background: var(--wb-surface);
  color: var(--wb-text);
  cursor: pointer;
}
.wb-select:focus { outline: none; border-color: var(--wb-teal); }

/* Textarea */
.wb-textarea {
  width: 100%;
  padding: 8px 12px;
  font-family: var(--wb-font);
  font-size: 14px;
  border: 1px solid var(--wb-border);
  border-radius: var(--wb-radius-sm);
  background: var(--wb-surface);
  color: var(--wb-text);
  resize: vertical;
  min-height: 80px;
}
.wb-textarea:focus { outline: none; border-color: var(--wb-teal); }

/* Steps indicator */
.station-steps {
  display: flex;
  gap: 2px;
  margin-bottom: var(--wb-space-xl);
}

.station-step {
  flex: 1;
  height: 3px;
  background: var(--wb-border);
  transition: background 0.3s;
}

.station-step-active {
  background: var(--wb-teal);
}

.station-step-done {
  background: var(--wb-complete);
}

/* Evaluability result */
.evaluability-score {
  font-family: var(--wb-font-mono);
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.evaluability-score-high { color: var(--wb-complete); }
.evaluability-score-mid { color: var(--wb-stale); }
.evaluability-score-low { color: var(--wb-sens-highly); }

.evaluability-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--wb-border);
  font-size: 14px;
}

.evaluability-item-label { color: var(--wb-text-secondary); }

.evaluability-item-value {
  font-weight: 500;
}

.evaluability-blocker {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--wb-sens-highly-bg);
  color: #991B1B;
  font-size: 13px;
  border-left: 3px solid var(--wb-sens-highly);
}

.evaluability-rec {
  padding: 8px 12px;
  margin-bottom: 8px;
  background: var(--wb-sens-sensitive-bg);
  color: #92400E;
  font-size: 13px;
  border-left: 3px solid var(--wb-sens-sensitive);
}

/* Sensitivity selector */
.sensitivity-option {
  padding: 12px 16px;
  border: 1px solid var(--wb-border);
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.sensitivity-option:hover { border-color: var(--wb-teal); }

.sensitivity-option-active {
  border-color: var(--wb-teal);
  background: var(--wb-teal-dim);
}

.sensitivity-option-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.sensitivity-option-desc {
  font-size: 12px;
  color: var(--wb-text-secondary);
}

/* Conflict screening */
.conflict-question {
  margin-bottom: var(--wb-space-md);
}

.conflict-question label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--wb-text);
  cursor: pointer;
}

.conflict-question input[type="checkbox"] {
  margin-top: 3px;
  accent-color: var(--wb-teal);
}

/* Navigation buttons */
.station-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--wb-space-xl);
  padding-top: var(--wb-space-md);
  border-top: 1px solid var(--wb-border);
}
```

- [ ] **Step 2: Create Station0.js**

The main Station 0 component. 4 steps: (1) Project Info, (2) TOR Constraints, (3) Sensitivity & Conflict, (4) Evaluability Results.

This is a large component. Create it at `praxis/workbench/js/stations/station0/Station0.js`:

```javascript
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
    { value: 'simple', label: 'Simple (single activity, clear logic)' },
    { value: 'complicated', label: 'Complicated (multiple components, known pathways)' },
    { value: 'complex', label: 'Complex (adaptive, emergent outcomes)' }
  ];

  var DATA_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'baseline_endline', label: 'Baseline and endline data available' },
    { value: 'timeseries', label: 'Time series / routine monitoring data' },
    { value: 'routine_only', label: 'Routine programme data only' },
    { value: 'minimal', label: 'Minimal or no existing data' }
  ];

  var COMPARISON_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'randomisable', label: 'Randomisation is feasible' },
    { value: 'natural', label: 'Natural comparison group exists' },
    { value: 'threshold', label: 'Eligibility threshold exists (regression discontinuity)' },
    { value: 'none', label: 'No comparison group possible' }
  ];

  var CAUSAL_OPTIONS = [
    { value: '', label: 'Select...' },
    { value: 'attribution', label: 'Attribution (prove the programme caused the change)' },
    { value: 'contribution', label: 'Contribution (show the programme plausibly contributed)' },
    { value: 'description', label: 'Description (document what happened and how)' }
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
        h('h3', null, 'Evaluation Parameters'),
        h(SelectField, { label: 'Causal Inference Level', value: localTor.causal_inference_level, options: CAUSAL_OPTIONS, onChange: function(v) { updateTor('causal_inference_level', v); }, hint: 'What level of evidence does the commissioner need?' }),
        h(SelectField, { label: 'Comparison Group Feasibility', value: localTor.comparison_feasibility, options: COMPARISON_OPTIONS, onChange: function(v) { updateTor('comparison_feasibility', v); } }),
        h(SelectField, { label: 'Data Availability', value: localTor.data_available, options: DATA_OPTIONS, onChange: function(v) { updateTor('data_available', v); } }),
        h(SelectField, { label: 'Programme Complexity', value: localTor.programme_complexity, options: COMPLEXITY, onChange: function(v) { updateTor('programme_complexity', v); } }),
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
          ['Project Information', 'Evaluation Parameters', 'Sensitivity & Conflict', 'Evaluability Results'][currentStep]
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
```

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/js/stations/station0/Station0.js praxis/workbench/css/stations.css
git commit -m "Phase 2.2: Station 0 form UI with 4-step wizard and station CSS"
```

---

### Task 3: Wire Station 0 into the shell

**Files:**
- Modify: `praxis/workbench/js/shell/Shell.js`
- Modify: `praxis/workbench/index.html`
- Modify: `praxis/workbench/css/layout.css` (add stations.css import note)

- [ ] **Step 1: Update index.html to load Station 0 scripts and stations.css**

In `praxis/workbench/index.html`, add `stations.css` to the head:

After the line `<link rel="stylesheet" href="css/sensitivity.css">`, add:
```html
  <link rel="stylesheet" href="css/stations.css">
```

Add Station 0 scripts before the Shell scripts. After the SensitivityBanner script line, add:
```html
  <!-- Station 0 -->
  <script src="js/stations/station0/EvaluabilityScorer.js"></script>
  <script src="js/stations/station0/Station0.js"></script>
```

- [ ] **Step 2: Update Shell.js to render Station 0**

Replace the `StationPlaceholder` usage in Shell.js. Change the Shell function so that when `activeStation === 0`, it renders `PraxisStation0` instead of `StationPlaceholder`:

In the Shell function, replace:
```javascript
h(StationPlaceholder, { station: activeStation, context: state.context })
```

with:
```javascript
activeStation === 0
  ? h(PraxisStation0, { state: state, dispatch: dispatch })
  : h(StationPlaceholder, { station: activeStation, context: state.context })
```

- [ ] **Step 3: Verify in browser**

Open `praxis/workbench/index.html`. Click "New Project". Expected:
1. Station 0 shows: "Station 0: Evaluability & Scoping" with step progress bar
2. Step 1: Project Information form with title, programme name, org, country, context, maturity, budget, timeline
3. Click "Continue" -> Step 2: Evaluation Parameters with causal inference, comparison, data, complexity, evaluation questions
4. Click "Continue" -> Step 3: Sensitivity classification with 3 clickable options. If context = fragile, conflict screening checkboxes appear.
5. Click "Continue" -> Step 4: Evaluability score (0-100) with breakdown, blockers, recommendations
6. Click "Save & Continue" -> data saved to context, downstream stations flagged stale (check rail dots)

- [ ] **Step 4: Commit**

```bash
git add praxis/workbench/index.html praxis/workbench/js/shell/Shell.js
git commit -m "Phase 2.3: wire Station 0 into shell — first working station"
```

---

### Task 4: Station 0 tests

**Files:**
- Create: `praxis/workbench/test/station0.test.html`

- [ ] **Step 1: Create station0.test.html**

```html
<!DOCTYPE html>
<html>
<head>
  <title>PRAXIS Station 0 Tests</title>
  <script src="../js/schema.js"></script>
  <script src="../js/utils.js"></script>
  <script src="../js/staleness.js"></script>
  <script src="../js/protection.js"></script>
  <script src="../js/stations/station0/EvaluabilityScorer.js"></script>
  <style>
    body { font-family: monospace; padding: 20px; background: #1a1f2e; color: #e8e4df; }
    .pass { color: #10B981; }
    .fail { color: #EF4444; }
    pre { margin: 4px 0; }
  </style>
</head>
<body>
  <h1>PRAXIS Station 0 Tests</h1>
  <div id="results"></div>
  <script>
  (function() {
    var results = document.getElementById('results');
    var passed = 0;
    var failed = 0;

    function test(name, fn) {
      try { fn(); results.innerHTML += '<pre class="pass">PASS: ' + name + '</pre>'; passed++; }
      catch (e) { results.innerHTML += '<pre class="fail">FAIL: ' + name + ' — ' + e.message + '</pre>'; failed++; }
    }
    function assert(cond, msg) { if (!cond) throw new Error(msg || 'Assertion failed'); }

    test('scorer returns valid structure', function() {
      var meta = { operating_context: 'stable', timeline: 'medium', budget: 'medium', evaluation_type: 'process_and_outcome' };
      var tor = { data_available: 'baseline_endline', comparison_feasibility: 'natural', programme_complexity: 'complicated', evaluation_purpose: ['accountability'], evaluation_questions_raw: ['EQ1', 'EQ2'] };
      var result = PraxisEvaluabilityScorer.scoreEvaluability(meta, tor);
      assert(typeof result.score === 'number', 'score should be number');
      assert(result.score >= 0 && result.score <= 100, 'score should be 0-100');
      assert(result.completed_at, 'should have completed_at');
      assert(Array.isArray(result.blockers), 'blockers should be array');
      assert(Array.isArray(result.recommendations), 'recommendations should be array');
    });

    test('high evaluability: stable + good data + long timeline', function() {
      var meta = { operating_context: 'stable', timeline: 'long', evaluation_type: 'impact' };
      var tor = { data_available: 'baseline_endline', comparison_feasibility: 'randomisable', programme_complexity: 'simple', evaluation_purpose: ['learning'], evaluation_questions_raw: ['EQ1'] };
      var result = PraxisEvaluabilityScorer.scoreEvaluability(meta, tor);
      assert(result.score >= 80, 'should score high: ' + result.score);
      assert(result.blockers.length === 0, 'no blockers expected');
    });

    test('low evaluability: humanitarian + minimal data + short timeline + complex', function() {
      var meta = { operating_context: 'humanitarian', timeline: 'short', evaluation_type: '' };
      var tor = { data_available: 'minimal', comparison_feasibility: 'none', programme_complexity: 'complex', evaluation_purpose: [], evaluation_questions_raw: [] };
      var result = PraxisEvaluabilityScorer.scoreEvaluability(meta, tor);
      assert(result.score < 30, 'should score low: ' + result.score);
      assert(result.blockers.length > 0, 'should have blockers');
      assert(result.recommendations.length > 0, 'should have recommendations');
    });

    test('data readiness maps correctly', function() {
      var meta = { operating_context: 'stable', timeline: 'medium' };
      var good = PraxisEvaluabilityScorer.scoreEvaluability(meta, { data_available: 'baseline_endline', comparison_feasibility: '', programme_complexity: '', evaluation_purpose: [], evaluation_questions_raw: [] });
      var bad = PraxisEvaluabilityScorer.scoreEvaluability(meta, { data_available: 'minimal', comparison_feasibility: '', programme_complexity: '', evaluation_purpose: [], evaluation_questions_raw: [] });
      assert(good.data_readiness === 'good', 'baseline_endline -> good');
      assert(bad.data_readiness === 'none', 'minimal -> none');
    });

    test('conflict context triggers blocker for short+complex', function() {
      var meta = { operating_context: 'fragile', timeline: 'short' };
      var tor = { data_available: 'routine_only', comparison_feasibility: 'none', programme_complexity: 'complex', evaluation_purpose: [], evaluation_questions_raw: [] };
      var result = PraxisEvaluabilityScorer.scoreEvaluability(meta, tor);
      assert(result.blockers.some(function(b) { return b.indexOf('Short timeline') > -1; }), 'should flag timeline blocker');
    });

    test('staleness propagation after Station 0 save', function() {
      var staleness = { 0:false, 1:false, 2:false, 3:false, 4:false, 5:false, 6:false, 7:false, 8:false };
      var result = PraxisStaleness.computeStaleness(0, staleness);
      assert(result[0] === false, 'station 0 not stale');
      assert(result[1] === true, 'station 1 stale (reads project_meta)');
      assert(result[2] === true, 'station 2 stale (reads project_meta + tor_constraints + evaluability)');
      assert(result[3] === true, 'station 3 stale (reads tor_constraints + project_meta)');
    });

    results.innerHTML += '<hr style="border-color:#333;margin:16px 0"><pre style="font-size:16px">' + passed + ' passed, ' + failed + ' failed</pre>';
    document.title = (failed > 0 ? 'FAIL' : 'PASS') + ' — Station 0 Tests';
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Open test/station0.test.html in browser**

Expected: All 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add praxis/workbench/test/station0.test.html
git commit -m "Phase 2.4: Station 0 tests — 6 test cases for evaluability scoring and staleness"
```
