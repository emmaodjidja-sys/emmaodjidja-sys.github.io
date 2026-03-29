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
      return h('div', { className: 'wb-card', style: { textAlign: 'center', padding: '3rem 2rem' } },
        h('div', { style: { fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 } }, '\u{1F4CA}'),
        h('h3', { style: { marginBottom: '0.75rem', color: 'var(--text, #1a1a2e)' } },
          'No Evaluation Matrix Available'),
        h('p', { className: 'wb-helper', style: { marginBottom: '1.5rem' } },
          'Complete Station 2 first to define your evaluation questions.'),
        h('button', {
          className: 'wb-btn wb-btn-primary',
          onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', stationId: 2 }); }
        }, 'Go to Station 2: Evaluation Matrix')
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

    // ── DAC criterion badge colors ──
    var CRITERION_COLORS = {
      relevance: { bg: '#DBEAFE', text: '#1E40AF' },
      coherence: { bg: '#E0E7FF', text: '#3730A3' },
      effectiveness: { bg: '#D1FAE5', text: '#065F46' },
      efficiency: { bg: '#FEF3C7', text: '#92400E' },
      impact: { bg: '#FCE7F3', text: '#9D174D' },
      sustainability: { bg: '#CCFBF1', text: '#115E59' }
    };

    // ── Render ──
    return h('div', null,
      // Feature badge
      h('div', { style: { marginBottom: '1.5rem' } },
        h('span', {
          className: 'wb-badge',
          style: {
            background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
            padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 600
          }
        }, 'Full feature coming soon')
      ),

      // Design context (if available)
      selectedDesign ? h('div', {
        style: {
          background: '#F8FAFC', border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1rem',
          fontSize: '0.85rem', color: 'var(--slate, #64748b)'
        }
      },
        h('strong', { style: { color: 'var(--text, #0F172A)' } }, 'Evaluation design: '),
        selectedDesign,
        ' \u2014 analysis method suggestions are tailored to this design.'
      ) : null,

      // Table scaffold
      h('div', { className: 'wb-card', style: { overflowX: 'auto' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' } },
          h('h4', { style: { margin: 0 } }, 'Analysis Framework'),
          generated ? h('span', { style: { fontSize: '0.8rem', color: 'var(--slate, #64748b)' } },
            rows.length + ' evaluation question' + (rows.length !== 1 ? 's' : '')
          ) : null
        ),

        !generated
          ? h('div', { style: { textAlign: 'center', padding: '2rem' } },
              h('p', { style: { fontSize: '0.9rem', color: 'var(--slate, #64748b)', marginBottom: '1rem' } },
                'Generate an analysis plan from your ' + (matrix.rows || []).length + ' evaluation questions. Methods and software will be suggested based on each question\'s criterion, indicators, and your selected evaluation design.'),
              h('button', {
                className: 'wb-btn wb-btn-primary',
                onClick: handleGenerate
              }, 'Generate Analysis Plan')
            )
          : h('table', {
              style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }
            },
              h('thead', null,
                h('tr', { style: { borderBottom: '2px solid var(--border, #e2e8f0)' } },
                  h('th', { style: thStyle({ width: '55px' }) }, 'EQ'),
                  h('th', { style: thStyle({ width: '70px' }) }, 'Criterion'),
                  h('th', { style: thStyle({ maxWidth: '240px' }) }, 'Evaluation Question'),
                  h('th', { style: thStyle() }, 'Method'),
                  h('th', { style: thStyle({ width: '160px' }) }, 'Software'),
                  h('th', { style: thStyle({ width: '140px' }) }, 'Notes')
                )
              ),
              h('tbody', null,
                rows.map(function (row, i) {
                  var cc = CRITERION_COLORS[row.criterion] || { bg: '#F1F5F9', text: '#475569' };
                  return h('tr', { key: row.id, style: { borderBottom: '1px solid var(--border, #e2e8f0)' } },
                    // EQ #
                    h('td', { style: tdStyle({ textAlign: 'center', fontWeight: 600 }) },
                      (typeof row.eqNumber === 'string' && row.eqNumber.indexOf('eq_') === 0)
                        ? row.eqNumber.replace('eq_', '')
                        : row.eqNumber),
                    // Criterion badge
                    h('td', { style: tdStyle({ textAlign: 'center' }) },
                      h('span', {
                        style: {
                          display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.03em', background: cc.bg, color: cc.text
                        }
                      }, (row.criterion || '').substring(0, 5))
                    ),
                    // Question (read-only)
                    h('td', { style: tdStyle({ maxWidth: '240px', fontSize: '0.82rem', lineHeight: 1.4 }) },
                      row.question),
                    // Method (editable)
                    h('td', { style: tdStyle() },
                      h('textarea', {
                        className: 'wb-input',
                        rows: 2,
                        style: { width: '100%', minWidth: '160px', resize: 'vertical', fontSize: '0.82rem' },
                        value: row.method,
                        onChange: function (e) { updateRow(i, 'method', e.target.value); }
                      })
                    ),
                    // Software (editable)
                    h('td', { style: tdStyle() },
                      h('input', {
                        className: 'wb-input',
                        style: { width: '100%', minWidth: '100px', fontSize: '0.82rem' },
                        value: row.software,
                        placeholder: 'e.g., Stata, R',
                        onChange: function (e) { updateRow(i, 'software', e.target.value); }
                      })
                    ),
                    // Notes (editable)
                    h('td', { style: tdStyle() },
                      h('input', {
                        className: 'wb-input',
                        style: { width: '100%', minWidth: '100px', fontSize: '0.82rem' },
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
      generated ? h('div', { style: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' } },
        h('button', {
          className: 'wb-btn',
          style: { fontSize: '0.85rem' },
          onClick: handleGenerate
        }, 'Regenerate Suggestions'),
        h('button', {
          className: 'wb-btn wb-btn-teal',
          onClick: handleSave
        }, 'Save Draft')
      ) : null
    );
  }

  // ── Style helpers ──
  function thStyle(extra) {
    var base = {
      textAlign: 'left', padding: '0.65rem 0.75rem',
      fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '0.04em', color: 'var(--slate, #64748b)',
      background: '#F8FAFC', position: 'sticky', top: 0,
      borderBottom: '2px solid var(--border, #e2e8f0)'
    };
    return extra ? Object.assign(base, extra) : base;
  }

  function tdStyle(extra) {
    var base = { padding: '0.6rem 0.75rem', verticalAlign: 'top' };
    return extra ? Object.assign(base, extra) : base;
  }

  window.Station6 = Station6;
})();
