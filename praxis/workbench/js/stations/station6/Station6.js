/**
 * Station6.js — Analysis Framework
 * Provides an editable analysis plan scaffold drawn from the evaluation matrix.
 * "Generate Analysis Plan" suggests methods and software based on EQ criterion,
 * indicator types, and the selected evaluation design from Station 3.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  // ── Analysis method suggestion engine ──

  // Maps DAC criterion + indicator characteristics to recommended analysis methods
  var METHOD_RULES = {
    relevance: {
      default: 'Document review + stakeholder interviews',
      withIndicators: function (inds) {
        var hasPerception = inds.some(function (i) { return /perception|satisfaction|opinion|attitude/i.test(i.name || ''); });
        if (hasPerception) return 'Survey analysis (Likert scales) + qualitative interviews';
        return 'Document review + key informant interviews';
      }
    },
    coherence: {
      default: 'Policy mapping + portfolio analysis',
      withIndicators: function () { return 'Policy/programme document analysis + stakeholder mapping'; }
    },
    effectiveness: {
      default: 'Mixed methods: quantitative outcome analysis + qualitative contribution tracing',
      withIndicators: function (inds, design) {
        var hasQuantitative = inds.some(function (i) { return /rate|percentage|number|ratio|count|proportion/i.test(i.name || ''); });
        if (design && /rct|clusterRCT|did|its|rdd/i.test(design)) {
          if (hasQuantitative) return 'Quasi-experimental/experimental analysis (treatment vs comparison)';
          return 'Mixed methods: experimental design + process tracing';
        }
        if (hasQuantitative) return 'Descriptive statistics + trend analysis + contribution analysis';
        return 'Contribution analysis + qualitative comparative analysis';
      }
    },
    efficiency: {
      default: 'Cost-effectiveness analysis + value for money assessment',
      withIndicators: function (inds) {
        var hasCost = inds.some(function (i) { return /cost|expenditure|budget|resource|unit cost/i.test(i.name || ''); });
        if (hasCost) return 'Cost-effectiveness analysis + budget variance analysis';
        return 'Value for money assessment (4Es framework) + process review';
      }
    },
    impact: {
      default: 'Theory-based impact evaluation + counterfactual analysis',
      withIndicators: function (inds, design) {
        if (design && /rct|clusterRCT/i.test(design)) return 'Intent-to-treat analysis + subgroup analysis';
        if (design && /did/i.test(design)) return 'Difference-in-differences estimation';
        if (design && /its/i.test(design)) return 'Interrupted time series analysis';
        if (design && /rdd/i.test(design)) return 'Regression discontinuity analysis';
        return 'Contribution analysis + process tracing + most significant change';
      }
    },
    sustainability: {
      default: 'Institutional capacity assessment + stakeholder analysis',
      withIndicators: function () { return 'Institutional analysis + financial sustainability modelling + stakeholder interviews'; }
    }
  };

  // Maps analysis method keywords to suggested software
  var SOFTWARE_MAP = [
    { pattern: /regression|did|its|rdd|experimental|treatment|intent.to.treat|subgroup/i, software: 'Stata or R' },
    { pattern: /cost.effective|budget|variance|financial/i, software: 'Excel + Stata' },
    { pattern: /survey analysis|descriptive|trend|likert/i, software: 'Stata, R, or SPSS' },
    { pattern: /qualitative|thematic|contribution|process tracing|most significant/i, software: 'NVivo or ATLAS.ti' },
    { pattern: /mixed method/i, software: 'Stata/R (quant) + NVivo (qual)' },
    { pattern: /document review|policy|portfolio|mapping|institutional/i, software: 'NVivo or manual coding framework' },
    { pattern: /stakeholder/i, software: 'Stakeholder mapping template (Excel)' },
    { pattern: /comparative/i, software: 'QCA software (fsQCA) or NVivo' }
  ];

  function suggestSoftware(method) {
    for (var i = 0; i < SOFTWARE_MAP.length; i++) {
      if (SOFTWARE_MAP[i].pattern.test(method)) return SOFTWARE_MAP[i].software;
    }
    return 'To be determined';
  }

  function suggestMethod(criterion, indicators, selectedDesign) {
    var rule = METHOD_RULES[criterion] || METHOD_RULES.effectiveness;
    if (indicators && indicators.length > 0) {
      return rule.withIndicators(indicators, selectedDesign);
    }
    return rule.default;
  }

  // ── Build rows from matrix data ──

  function buildRows(matrix, selectedDesign) {
    var rows = matrix.rows || [];
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(function (eq, i) {
      var method = suggestMethod(eq.criterion, eq.indicators, selectedDesign);
      var software = suggestSoftware(method);
      return {
        id: (typeof PraxisUtils !== 'undefined' ? PraxisUtils.uid('aq') : 'aq-' + i),
        eqNumber: eq.number || eq.id || (i + 1),
        question: eq.question || eq.text || '',
        criterion: eq.criterion || '',
        method: method,
        software: software,
        notes: ''
      };
    });
  }

  // ── Station 6 Component ──

  function Station6(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var matrix = context.evaluation_matrix || null;
    var savedPlan = context.analysis_plan || null;
    var designRec = context.design_recommendation || {};
    var selectedDesign = designRec.selected_design || null;

    var hasMatrix = matrix && matrix.rows && Array.isArray(matrix.rows) && matrix.rows.length > 0;

    // Initialise rows from saved data or empty
    var initialRows = savedPlan && savedPlan.rows && savedPlan.rows.length > 0
      ? savedPlan.rows
      : [];

    var _rows = useState(initialRows);
    var rows = _rows[0];
    var setRows = _rows[1];

    var _generated = useState(initialRows.length > 0);
    var generated = _generated[0];
    var setGenerated = _generated[1];

    // ── No matrix data ──
    if (!hasMatrix) {
      return h('div', { className: 'wb-station-empty' },
        h('div', { className: 'wb-station-empty-title' },
          'No Evaluation Matrix Available'),
        h('p', { className: 'wb-station-empty-desc' },
          'Complete Station 2 first to define your evaluation questions. The analysis framework will suggest methods based on your matrix.'),
        h('button', {
          className: 'wb-btn wb-btn-primary',
          onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 2 }); }
        }, 'Go to Station 2')
      );
    }

    // ── Row update handler ──
    var updateRow = useCallback(function (index, field, value) {
      setRows(function (prev) {
        var next = prev.slice();
        next[index] = Object.assign({}, next[index]);
        next[index][field] = value;
        return next;
      });
    }, []);

    // ── Generate analysis plan with real suggestions ──
    var handleGenerate = useCallback(function () {
      var newRows = buildRows(matrix, selectedDesign);
      setRows(newRows);
      setGenerated(true);
    }, [matrix, selectedDesign]);

    // ── Save draft ──
    var handleSave = useCallback(function () {
      dispatch({
        type: 'SAVE_STATION',
        stationId: 6,
        data: { analysis_plan: { rows: rows, completed_at: new Date().toISOString() } }
      });
      if (typeof dispatch === 'function') {
        dispatch({ type: 'SHOW_TOAST', message: 'Analysis plan saved', toastType: 'success' });
      }
    }, [dispatch, rows]);

    // ── Render ──
    return h('div', null,
      // Design context (if available)
      selectedDesign ? h('div', { className: 'wb-guidance wb-guidance--neutral' },
        h('span', { className: 'wb-guidance-text' },
          h('strong', null, 'Evaluation design: '),
          selectedDesign,
          ' \u2014 analysis method suggestions are tailored to this design.'
        )
      ) : null,

      // Table scaffold
      h('div', { className: 'wb-card' },
        h('div', { className: 'wb-toolbar' },
          h('h4', { className: 'wb-station-title' }, 'Analysis Framework'),
          h('span', { className: 'wb-toolbar-spacer' }),
          generated ? h('span', { className: 'wb-td--meta' },
            rows.length + ' evaluation question' + (rows.length !== 1 ? 's' : '')
          ) : null
        ),

        !generated
          ? h('div', { className: 'wb-station-empty' },
              h('p', { className: 'wb-station-empty-desc' },
                'Generate an analysis plan from your ' + (matrix.rows || []).length + ' evaluation questions. Methods and software will be suggested based on each question\'s criterion, indicators, and your selected evaluation design.'),
              h('button', {
                className: 'wb-btn wb-btn-primary',
                onClick: handleGenerate
              }, 'Generate Analysis Plan')
            )
          : h('table', { className: 'wb-table wb-table--analysis' },
              h('thead', null,
                h('tr', null,
                  h('th', { className: 'wb-th--eq' }, 'EQ'),
                  h('th', { className: 'wb-th--criterion' }, 'Criterion'),
                  h('th', { className: 'wb-th--question' }, 'Evaluation Question'),
                  h('th', null, 'Method'),
                  h('th', { className: 'wb-th--software' }, 'Software'),
                  h('th', { className: 'wb-th--notes' }, 'Notes')
                )
              ),
              h('tbody', null,
                rows.map(function (row, i) {
                  return h('tr', { key: row.id },
                    // EQ #
                    h('td', { className: 'wb-td--center-bold' },
                      (typeof row.eqNumber === 'string' && row.eqNumber.indexOf('eq_') === 0)
                        ? row.eqNumber.replace('eq_', '')
                        : row.eqNumber),
                    // Criterion badge
                    h('td', { className: 'wb-td--center' },
                      h('span', {
                        className: 'wb-criterion wb-criterion--' + (row.criterion || 'effectiveness')
                      }, (row.criterion || '').substring(0, 5))
                    ),
                    // Question (read-only)
                    h('td', { className: 'wb-td--question' },
                      row.question),
                    // Method (editable)
                    h('td', null,
                      h('textarea', {
                        className: 'wb-input wb-textarea',
                        rows: 2,
                        value: row.method,
                        onChange: function (e) { updateRow(i, 'method', e.target.value); }
                      })
                    ),
                    // Software (editable)
                    h('td', null,
                      h('input', {
                        className: 'wb-input',
                        value: row.software,
                        placeholder: 'e.g., Stata, R',
                        onChange: function (e) { updateRow(i, 'software', e.target.value); }
                      })
                    ),
                    // Notes (editable)
                    h('td', null,
                      h('input', {
                        className: 'wb-input',
                        value: row.notes,
                        placeholder: 'Notes\u2026',
                        onChange: function (e) { updateRow(i, 'notes', e.target.value); }
                      })
                    )
                  );
                })
              )
            )
      ),

      // Actions
      generated ? h('div', { className: 'wb-action-bar' },
        h('button', {
          className: 'wb-btn',
          onClick: handleGenerate
        }, 'Regenerate Suggestions'),
        h('button', {
          className: 'wb-btn wb-btn-teal',
          onClick: handleSave
        }, 'Save Draft')
      ) : null,

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 6, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station6 = Station6;
})();
