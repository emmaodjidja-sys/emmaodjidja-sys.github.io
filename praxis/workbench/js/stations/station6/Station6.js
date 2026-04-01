/**
 * Station6.js — Analysis Framework
 * Two-panel (Quantitative | Qualitative) analysis plan with per-EQ cards,
 * disaggregation chips, editable notes, and Word export.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  // ── Standard disaggregation dimensions for M&E ──

  var DEFAULT_DISAGGREGATIONS = [
    { id: 'gender', label: 'Gender' },
    { id: 'age', label: 'Age' },
    { id: 'geography', label: 'Geography' },
    { id: 'disability', label: 'Disability' },
    { id: 'ses', label: 'Socioeconomic status' },
    { id: 'urban_rural', label: 'Urban/Rural' }
  ];

  // ── Analysis method suggestion engine ──

  var METHOD_RULES = {
    relevance: {
      default: 'Document review + stakeholder interviews',
      type: 'qualitative',
      withIndicators: function (inds) {
        var hasPerception = inds.some(function (i) { return /perception|satisfaction|opinion|attitude/i.test(i.name || ''); });
        if (hasPerception) return { method: 'Survey analysis (Likert scales) + qualitative interviews', type: 'qualitative' };
        return { method: 'Document review + key informant interviews', type: 'qualitative' };
      }
    },
    coherence: {
      default: 'Policy mapping + portfolio analysis',
      type: 'qualitative',
      withIndicators: function () { return { method: 'Policy/programme document analysis + stakeholder mapping', type: 'qualitative' }; }
    },
    effectiveness: {
      default: 'Mixed methods: quantitative outcome analysis + qualitative contribution tracing',
      type: 'quantitative',
      withIndicators: function (inds, design) {
        var hasQuantitative = inds.some(function (i) { return /rate|percentage|number|ratio|count|proportion/i.test(i.name || ''); });
        if (design && /rct|clusterRCT|did|its|rdd/i.test(design)) {
          if (hasQuantitative) return { method: 'Quasi-experimental/experimental analysis (treatment vs comparison)', type: 'quantitative' };
          return { method: 'Mixed methods: experimental design + process tracing', type: 'quantitative' };
        }
        if (hasQuantitative) return { method: 'Descriptive statistics + trend analysis + contribution analysis', type: 'quantitative' };
        return { method: 'Contribution analysis + qualitative comparative analysis', type: 'qualitative' };
      }
    },
    efficiency: {
      default: 'Cost-effectiveness analysis + value for money assessment',
      type: 'quantitative',
      withIndicators: function (inds) {
        var hasCost = inds.some(function (i) { return /cost|expenditure|budget|resource|unit cost/i.test(i.name || ''); });
        if (hasCost) return { method: 'Cost-effectiveness analysis + budget variance analysis', type: 'quantitative' };
        return { method: 'Value for money assessment (4Es framework) + process review', type: 'quantitative' };
      }
    },
    impact: {
      default: 'Theory-based impact evaluation + counterfactual analysis',
      type: 'quantitative',
      withIndicators: function (inds, design) {
        if (design && /rct|clusterRCT/i.test(design)) return { method: 'Intent-to-treat analysis + subgroup analysis', type: 'quantitative' };
        if (design && /did/i.test(design)) return { method: 'Difference-in-differences estimation', type: 'quantitative' };
        if (design && /its/i.test(design)) return { method: 'Interrupted time series analysis', type: 'quantitative' };
        if (design && /rdd/i.test(design)) return { method: 'Regression discontinuity analysis', type: 'quantitative' };
        return { method: 'Contribution analysis + process tracing + most significant change', type: 'qualitative' };
      }
    },
    sustainability: {
      default: 'Institutional capacity assessment + stakeholder analysis',
      type: 'qualitative',
      withIndicators: function () { return { method: 'Institutional analysis + financial sustainability modelling + stakeholder interviews', type: 'qualitative' }; }
    }
  };

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
      var result = rule.withIndicators(indicators, selectedDesign);
      return { method: result.method, type: result.type };
    }
    return { method: rule.default, type: rule.type || 'qualitative' };
  }

  // ── Classify indicator type ──

  function classifyIndicatorType(ind) {
    if (/rate|percentage|number|ratio|count|proportion|score|cost|unit|days/i.test(ind.name || '')) {
      return 'quantitative';
    }
    if (/perception|satisfaction|attitude|opinion|qualitative|narrative|experience/i.test(ind.name || '')) {
      return 'qualitative';
    }
    return 'quantitative';
  }

  // ── Build analysis cards from matrix ──

  function buildCards(matrix, selectedDesign) {
    var rows = matrix.rows || [];
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map(function (eq, i) {
      var result = suggestMethod(eq.criterion, eq.indicators, selectedDesign);
      var software = suggestSoftware(result.method);
      var indicators = (eq.indicators || []).map(function (ind) {
        return Object.assign({}, ind, { indType: classifyIndicatorType(ind) });
      });
      return {
        id: (typeof PraxisUtils !== 'undefined' ? PraxisUtils.uid('af') : 'af-' + i),
        eqNumber: eq.number || eq.id || (i + 1),
        question: eq.question || eq.text || '',
        criterion: eq.criterion || '',
        indicators: indicators,
        dataSources: eq.dataSources || [],
        method: result.method,
        analysisType: result.type,
        software: software,
        disaggregations: ['gender', 'age', 'geography'],
        notes: ''
      };
    });
  }

  // ── Disaggregation Chip ──

  function DisaggChip(props) {
    var active = props.active;
    var label = props.label;
    var onToggle = props.onToggle;
    return h('button', {
      type: 'button',
      className: 'wb-btn wb-btn-xs' + (active ? ' wb-btn--active' : ''),
      style: { fontSize: '10px', padding: '2px 8px', borderRadius: '12px', margin: '2px' },
      onClick: onToggle
    }, label);
  }

  // ── Per-EQ Analysis Card ──

  function AnalysisCard(props) {
    var card = props.card;
    var index = props.index;
    var onUpdate = props.onUpdate;

    var toggleDisagg = useCallback(function (disaggId) {
      var current = card.disaggregations || [];
      var next = current.indexOf(disaggId) >= 0
        ? current.filter(function (d) { return d !== disaggId; })
        : current.concat([disaggId]);
      onUpdate(index, 'disaggregations', next);
    }, [card.disaggregations, index, onUpdate]);

    var eqLabel = (typeof card.eqNumber === 'string' && card.eqNumber.indexOf('eq_') === 0)
      ? card.eqNumber.replace('eq_', '')
      : card.eqNumber;

    return h('div', { className: 'wb-card', style: { marginBottom: '12px' } },
      // Header: EQ number + criterion badge
      h('div', { className: 'wb-toolbar', style: { marginBottom: '8px' } },
        h('span', {
          style: { fontSize: '14px', fontWeight: 700, color: 'var(--navy)', marginRight: '8px' }
        }, 'EQ ' + eqLabel),
        h('span', {
          className: 'wb-criterion wb-criterion--' + (card.criterion || 'effectiveness')
        }, (card.criterion || '').charAt(0).toUpperCase() + (card.criterion || '').slice(1)),
        h('span', { className: 'wb-toolbar-spacer' }),
        h('span', {
          className: 'wb-context-badge',
          style: {
            fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04em', padding: '2px 8px', borderRadius: '3px',
            background: card.analysisType === 'quantitative' ? '#DBEAFE' : '#FCE7F3',
            color: card.analysisType === 'quantitative' ? '#1E40AF' : '#9D174D'
          }
        }, card.analysisType === 'quantitative' ? 'QUANT' : 'QUAL')
      ),

      // Question text
      h('p', {
        style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.5, margin: '0 0 12px 0' }
      }, card.question),

      // Two-column detail grid
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },

        // Left column
        h('div', null,
          // Indicators
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Linked Indicators'),
            (card.indicators && card.indicators.length > 0)
              ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text)' } },
                  card.indicators.map(function (ind, j) {
                    return h('li', { key: j },
                      h('span', { style: { fontWeight: 500 } }, ind.code ? '[' + ind.code + '] ' : ''),
                      ind.name,
                      h('span', {
                        style: {
                          marginLeft: '6px', fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase', padding: '1px 5px', borderRadius: '3px',
                          background: ind.indType === 'quantitative' ? '#EFF6FF' : '#FDF2F8',
                          color: ind.indType === 'quantitative' ? '#3B82F6' : '#DB2777'
                        }
                      }, ind.indType === 'quantitative' ? 'NUM' : 'QUAL')
                    );
                  })
                )
              : h('span', { className: 'wb-td--meta' }, 'No indicators linked')
          ),

          // Data Sources
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Data Sources'),
            (card.dataSources && card.dataSources.length > 0)
              ? h('ul', { style: { margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '12px', lineHeight: 1.6, color: 'var(--text)' } },
                  card.dataSources.map(function (ds, j) {
                    return h('li', { key: j }, ds);
                  })
                )
              : h('span', { className: 'wb-td--meta' }, 'No data sources specified')
          )
        ),

        // Right column
        h('div', null,
          // Method
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Suggested Method'),
            h('textarea', {
              className: 'wb-input wb-textarea',
              rows: 2,
              value: card.method,
              onChange: function (e) { onUpdate(index, 'method', e.target.value); },
              style: { fontSize: '12px', width: '100%', boxSizing: 'border-box' }
            })
          ),

          // Software
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Software'),
            h('input', {
              className: 'wb-input',
              value: card.software,
              onChange: function (e) { onUpdate(index, 'software', e.target.value); },
              style: { fontSize: '12px', width: '100%', boxSizing: 'border-box' }
            })
          ),

          // Disaggregation chips
          h('div', { className: 'wb-field', style: { marginBottom: '10px' } },
            h('label', { className: 'wb-field-label' }, 'Disaggregation Dimensions'),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' } },
              DEFAULT_DISAGGREGATIONS.map(function (dim) {
                var active = (card.disaggregations || []).indexOf(dim.id) >= 0;
                return h(DisaggChip, {
                  key: dim.id,
                  label: dim.label,
                  active: active,
                  onToggle: function () { toggleDisagg(dim.id); }
                });
              })
            )
          ),

          // Notes
          h('div', { className: 'wb-field' },
            h('label', { className: 'wb-field-label' }, 'Notes'),
            h('input', {
              className: 'wb-input',
              value: card.notes,
              placeholder: 'Analysis notes...',
              onChange: function (e) { onUpdate(index, 'notes', e.target.value); },
              style: { fontSize: '12px', width: '100%', boxSizing: 'border-box' }
            })
          )
        )
      )
    );
  }

  // ── Summary Bar ──

  function SummaryBar(props) {
    var cards = props.cards;
    var quantCount = 0;
    var qualCount = 0;
    var allDisaggs = {};

    cards.forEach(function (c) {
      if (c.analysisType === 'quantitative') quantCount++;
      else qualCount++;
      (c.disaggregations || []).forEach(function (d) { allDisaggs[d] = true; });
    });

    var disaggCount = Object.keys(allDisaggs).length;

    return h('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        padding: '10px 16px', marginBottom: '16px',
        background: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border)'
      }
    },
      h('span', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--navy)' } },
        cards.length + ' EQ' + (cards.length !== 1 ? 's' : '')),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: '#1E40AF', fontWeight: 500 } },
        quantCount + ' quantitative'),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: '#9D174D', fontWeight: 500 } },
        qualCount + ' qualitative'),
      h('span', { style: { width: '1px', height: '16px', background: 'var(--border)' } }),
      h('span', { style: { fontSize: '12px', color: 'var(--slate)', fontWeight: 500 } },
        disaggCount + ' disaggregation dimension' + (disaggCount !== 1 ? 's' : ''))
    );
  }

  // ── Word Export ──

  function exportAnalysisPlan(cards, programmeName) {
    var title = programmeName || 'Evaluation Programme';

    var quantCards = cards.filter(function (c) { return c.analysisType === 'quantitative'; });
    var qualCards = cards.filter(function (c) { return c.analysisType !== 'quantitative'; });

    function disaggLabel(ids) {
      var labels = [];
      DEFAULT_DISAGGREGATIONS.forEach(function (d) {
        if (ids.indexOf(d.id) >= 0) labels.push(d.label);
      });
      return labels.join(', ') || 'None specified';
    }

    function buildTable(rows) {
      if (rows.length === 0) return '<p style="font-size:10pt;color:#888"><em>No evaluation questions in this category.</em></p>';
      var t = '<table><tr>' +
        '<th style="width:5%">EQ</th>' +
        '<th style="width:30%">Method</th>' +
        '<th style="width:25%">Data Sources</th>' +
        '<th style="width:20%">Disaggregation</th>' +
        '<th style="width:20%">Software</th>' +
        '</tr>';
      rows.forEach(function (card) {
        var eqLabel = (typeof card.eqNumber === 'string' && card.eqNumber.indexOf('eq_') === 0)
          ? card.eqNumber.replace('eq_', '')
          : card.eqNumber;
        t += '<tr>' +
          '<td style="text-align:center;font-weight:bold">' + eqLabel + '</td>' +
          '<td>' + (card.method || '') + '</td>' +
          '<td>' + (card.dataSources || []).join('; ') + '</td>' +
          '<td>' + disaggLabel(card.disaggregations || []) + '</td>' +
          '<td>' + (card.software || '') + '</td>' +
          '</tr>';
      });
      t += '</table>';
      return t;
    }

    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">' +
      '<head><meta charset="UTF-8"><style>' +
      'body{font-family:Calibri,sans-serif;font-size:10pt;color:#333}' +
      'h1{font-size:16pt;color:#0B1A2E;margin-bottom:4pt}' +
      'h2{font-size:13pt;color:#0B1A2E;margin-top:20pt;margin-bottom:6pt;border-bottom:2px solid #0B1A2E;padding-bottom:4pt}' +
      'table{border-collapse:collapse;width:100%;margin-bottom:16pt}' +
      'th{background:#0B1A2E;color:#fff;padding:6px 8px;text-align:left;font-size:9pt}' +
      'td{border:1px solid #ccc;padding:5px 8px;vertical-align:top;font-size:10pt}' +
      'tr:nth-child(even){background:#f9f9f9}' +
      '.footer{font-size:8pt;color:#999;margin-top:24pt;border-top:1px solid #ddd;padding-top:8pt}' +
      '</style></head><body>' +
      '<h1>Analysis Framework &mdash; ' + title + '</h1>' +
      '<p style="font-size:10pt;color:#666;margin-bottom:16pt">' +
        cards.length + ' evaluation questions &middot; ' +
        quantCards.length + ' quantitative &middot; ' +
        qualCards.length + ' qualitative' +
      '</p>' +
      '<h2>Quantitative Methods</h2>' +
      buildTable(quantCards) +
      '<h2>Qualitative Methods</h2>' +
      buildTable(qualCards) +
      '<p class="footer">Generated by PRAXIS Evaluation Workbench &mdash; ' + new Date().toISOString().slice(0, 10) + '</p>' +
      '</body></html>';

    var blob = new Blob([html], { type: 'application/msword' });
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.downloadBlob) {
      PraxisUtils.downloadBlob(blob, 'analysis-framework.doc');
    } else {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'analysis-framework.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  // ── Tab Button ──

  function TabButton(props) {
    var active = props.active;
    var label = props.label;
    var count = props.count;
    var onClick = props.onClick;
    var color = props.color;

    return h('button', {
      type: 'button',
      className: 'wb-btn' + (active ? ' wb-btn--active' : ''),
      style: active ? { background: color || 'var(--navy)', borderColor: color || 'var(--navy)' } : {},
      onClick: onClick
    },
      label + ' (' + count + ')'
    );
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
    var programmeName = (context.project_meta && context.project_meta.programme_name) ||
      (matrix && matrix.context && matrix.context.programmeName) || '';

    var hasMatrix = matrix && matrix.rows && Array.isArray(matrix.rows) && matrix.rows.length > 0;

    // Initialise cards from saved data or empty
    var initialCards = savedPlan && savedPlan.cards && savedPlan.cards.length > 0
      ? savedPlan.cards
      : (savedPlan && savedPlan.rows && savedPlan.rows.length > 0 ? savedPlan.rows : []);

    var _cards = useState(initialCards);
    var cards = _cards[0];
    var setCards = _cards[1];

    var _generated = useState(initialCards.length > 0);
    var generated = _generated[0];
    var setGenerated = _generated[1];

    var _activeTab = useState('quantitative');
    var activeTab = _activeTab[0];
    var setActiveTab = _activeTab[1];

    // Derived: split cards by type
    var quantCards = useMemo(function () {
      return cards.filter(function (c) { return c.analysisType === 'quantitative'; });
    }, [cards]);

    var qualCards = useMemo(function () {
      return cards.filter(function (c) { return c.analysisType !== 'quantitative'; });
    }, [cards]);

    var visibleCards = activeTab === 'quantitative' ? quantCards : qualCards;

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

    // ── Card update handler ──
    var updateCard = useCallback(function (index, field, value) {
      // index is the position in the FULL cards array, not the filtered view.
      // We need to map visible index back to the full array index.
      var visibleType = activeTab;
      var count = 0;
      var fullIndex = -1;
      for (var i = 0; i < cards.length; i++) {
        var cardType = cards[i].analysisType === 'quantitative' ? 'quantitative' : 'qualitative';
        if (cardType === visibleType) {
          if (count === index) { fullIndex = i; break; }
          count++;
        }
      }
      if (fullIndex < 0) return;

      setCards(function (prev) {
        var next = prev.slice();
        next[fullIndex] = Object.assign({}, next[fullIndex]);
        next[fullIndex][field] = value;
        return next;
      });
    }, [activeTab, cards]);

    // ── Generate analysis plan ──
    var handleGenerate = useCallback(function () {
      var newCards = buildCards(matrix, selectedDesign);
      setCards(newCards);
      setGenerated(true);
      // Default to the tab with more cards
      var qn = newCards.filter(function (c) { return c.analysisType === 'quantitative'; }).length;
      var ql = newCards.length - qn;
      setActiveTab(qn >= ql ? 'quantitative' : 'qualitative');
    }, [matrix, selectedDesign]);

    // ── Save draft ──
    var handleSave = useCallback(function () {
      dispatch({
        type: 'SAVE_STATION',
        stationId: 6,
        data: {
          analysis_plan: {
            cards: cards,
            rows: cards,
            completed_at: new Date().toISOString()
          }
        }
      });
      if (typeof dispatch === 'function') {
        dispatch({ type: 'SHOW_TOAST', message: 'Analysis framework saved', toastType: 'success' });
      }
    }, [dispatch, cards]);

    // ── Export handler ──
    var handleExport = useCallback(function () {
      exportAnalysisPlan(cards, programmeName);
    }, [cards, programmeName]);

    // ── Render ──
    return h('div', null,
      // Design context banner
      selectedDesign ? h('div', {
        className: 'wb-guidance wb-guidance--neutral',
        style: { padding: '10px 16px', marginBottom: '16px', borderRadius: '6px', border: '1px solid var(--border)' }
      },
        h('span', { className: 'wb-guidance-text' },
          h('strong', null, 'Evaluation design: '),
          selectedDesign.toUpperCase(),
          ' \u2014 analysis method suggestions are tailored to this design.'
        )
      ) : null,

      // Main card container
      h('div', { className: 'wb-card' },
        // Toolbar
        h('div', { className: 'wb-toolbar' },
          h('h4', { className: 'wb-station-title' }, 'Analysis Framework'),
          h('span', { className: 'wb-toolbar-spacer' }),
          generated ? h('div', { style: { display: 'flex', gap: '8px' } },
            h('button', {
              className: 'wb-btn',
              onClick: handleExport,
              title: 'Export as Word document'
            }, 'Export Analysis Plan'),
            h('button', {
              className: 'wb-btn',
              onClick: handleGenerate
            }, 'Regenerate')
          ) : null
        ),

        !generated
          ? h('div', { className: 'wb-station-empty' },
              h('p', { className: 'wb-station-empty-desc' },
                'Generate an analysis framework from your ' + (matrix.rows || []).length +
                ' evaluation questions. Each question receives a tailored method, software recommendation, and disaggregation plan based on its criterion, indicators, and your selected evaluation design.'),
              h('button', {
                className: 'wb-btn wb-btn-primary',
                onClick: handleGenerate
              }, 'Generate Analysis Framework')
            )
          : h('div', null,
              // Summary bar
              h(SummaryBar, { cards: cards }),

              // Tab buttons
              h('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
                h(TabButton, {
                  active: activeTab === 'quantitative',
                  label: 'Quantitative',
                  count: quantCards.length,
                  color: '#1E40AF',
                  onClick: function () { setActiveTab('quantitative'); }
                }),
                h(TabButton, {
                  active: activeTab === 'qualitative',
                  label: 'Qualitative',
                  count: qualCards.length,
                  color: '#9D174D',
                  onClick: function () { setActiveTab('qualitative'); }
                })
              ),

              // Panel heading
              h('div', {
                style: {
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.06em', marginBottom: '12px',
                  color: activeTab === 'quantitative' ? '#1E40AF' : '#9D174D'
                }
              }, activeTab === 'quantitative'
                ? 'Quantitative Analysis Methods — statistical and numerical approaches'
                : 'Qualitative Analysis Methods — interpretive and thematic approaches'),

              // EQ cards
              visibleCards.length > 0
                ? visibleCards.map(function (card, i) {
                    return h(AnalysisCard, {
                      key: card.id,
                      card: card,
                      index: i,
                      onUpdate: updateCard
                    });
                  })
                : h('div', {
                    style: {
                      textAlign: 'center', padding: '32px', fontSize: '13px',
                      color: 'var(--slate)', fontStyle: 'italic'
                    }
                  }, 'No ' + activeTab + ' evaluation questions in this analysis plan.')
            )
      ),

      // Action bar
      generated ? h('div', { className: 'wb-action-bar' },
        h('button', {
          className: 'wb-btn wb-btn-teal',
          onClick: handleSave
        }, 'Save Draft'),
        h('button', {
          className: 'wb-btn',
          onClick: handleExport
        }, 'Export as Word')
      ) : null,

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 6, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station6 = Station6;
})();
