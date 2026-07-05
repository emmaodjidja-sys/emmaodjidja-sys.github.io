/**
 * Station8.js — Evaluation Design Brief Generator
 * Produces a structured 10-slide presentation deck from workbench context.
 * Slides are reorderable, toggleable, with editable talking points.
 * Export: print-optimised PDF (one slide per page) or sessionStorage bridge to deck tool.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;
  var useEffect = React.useEffect;

  // ── Helpers ──

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  function fmt(id) {
    if (!id) return 'Not specified';
    return id.replace(/[_-]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function safe(v, fallback) { return v || fallback || 'Not specified'; }

  function countByLevel(nodes) {
    var counts = {};
    (nodes || []).forEach(function (n) {
      var lvl = n.level || 'unknown';
      counts[lvl] = (counts[lvl] || 0) + 1;
    });
    return counts;
  }

  function scoreBand(score) {
    if (score >= 80) return { label: 'High', cls: 'wb-score-band--green' };
    if (score >= 50) return { label: 'Moderate', cls: 'wb-score-band--amber' };
    return { label: 'Low', cls: 'wb-score-band--red' };
  }

  function dimensionFillClass(pct) {
    if (pct >= 80) return 'wb-progress-bar-fill--high';
    if (pct >= 50) return 'wb-progress-bar-fill--mid';
    return 'wb-progress-bar-fill--low';
  }

  // ── Print CSS injection ──
  // Every rule is scoped under body.s8-print, a class present only while
  // Station 8 is mounted, so printing any other station is unaffected. The
  // style node itself is also removed on unmount (see the mount effect).

  var PRINT_STYLE_ID = 'station8-print-css';
  var PRINT_BODY_CLASS = 's8-print';

  function ensurePrintCSS() {
    if (document.getElementById(PRINT_STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = PRINT_STYLE_ID;
    style.textContent = [
      '@media print {',
      '  body.s8-print * { visibility: hidden; }',
      '  body.s8-print .s8-print-root, body.s8-print .s8-print-root * { visibility: visible; }',
      '  body.s8-print .s8-print-root { position: absolute; left: 0; top: 0; width: 100%; }',
      '  body.s8-print .s8-slide-card { break-inside: avoid; page-break-inside: avoid; break-after: page; page-break-after: always; margin: 0 0 0 0; border: none !important; box-shadow: none !important; }',
      '  body.s8-print .s8-slide-card:last-child { break-after: auto; page-break-after: auto; }',
      '  body.s8-print .s8-slide-header-print { display: flex !important; align-items: center; padding: 18px 28px; background: #0B1A2E !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
      '  body.s8-print .s8-slide-header-print .s8-slide-num-print { color: var(--teal); font-size: 13px; font-weight: 700; margin-right: 16px; }',
      '  body.s8-print .s8-slide-header-print .s8-slide-title-print { color: #fff; font-size: 18px; font-weight: 700; }',
      '  body.s8-print .s8-slide-body-print { padding: 24px 28px; font-size: 13px; line-height: 1.6; }',
      '  body.s8-print .s8-slide-body-print .wb-param-label { font-size: 10px; }',
      '  body.s8-print .s8-slide-body-print .wb-param-value { font-size: 14px; }',
      '  body.s8-print .s8-talking-points { display: block !important; border-top: 1px solid #E2E8F0; padding: 12px 28px; font-size: 11px; color: #475569; font-style: italic; }',
      '  body.s8-print .s8-no-print { display: none !important; }',
      '  body.s8-print .s8-excluded-slide { display: none !important; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // ── Slide builders ──

  function buildSlides(context) {
    var meta = context.project_meta || {};
    var tor = context.tor_constraints || {};
    var evaluability = context.evaluability || {};
    var toc = context.toc || {};
    var matrix = context.evaluation_matrix || {};
    var designRec = context.design_recommendation || {};
    var sampleParams = context.sample_parameters || {};
    var instruments = (context.instruments || {}).items || [];
    var analysisPlan = context.analysis_plan || {};
    var rows = matrix.rows || [];
    var result = sampleParams.result || {};
    var qualPlan = sampleParams.qualitative_plan || {};
    var topDesign = designRec.ranked_designs && designRec.ranked_designs.length > 0
      ? designRec.ranked_designs[0] : (designRec.selected_design ? { id: designRec.selected_design } : null);
    var nodes = toc.nodes || [];
    var levelCounts = countByLevel(nodes);

    return [
      // 1. Title slide
      {
        id: uid('s'), title: 'Title Slide',
        content: function () {
          return h('div', { className: 's8-title-slide' },
            h('div', { className: 's8-title-org' }, safe(meta.organisation)),
            h('div', { className: 's8-title-name' }, safe(meta.programme_name, 'Evaluation Design Brief')),
            h('div', { className: 's8-title-tag' }, 'Evaluation Design Brief'),
            h('div', { className: 's8-title-date' }, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
          );
        }
      },

      // 2. Programme overview
      {
        id: uid('s'), title: 'Programme Overview',
        content: function () {
          var fields = [
            { label: 'Country / Region', value: safe(meta.country) },
            { label: 'Sectors', value: (meta.health_areas || []).map(fmt).join(', ') || safe(meta.sector) },
            { label: 'Operating Context', value: fmt(meta.operating_context) },
            { label: 'Budget', value: fmt(meta.budget) },
            { label: 'Programme Maturity', value: fmt(meta.programme_maturity) },
            { label: 'Timeline', value: fmt(meta.timeline) }
          ];
          return h('div', { className: 'wb-slide-fields' },
            fields.map(function (f, i) {
              return h('div', { key: i },
                h('div', { className: 'wb-param-label' }, f.label),
                h('div', { className: 'wb-param-value' }, f.value)
              );
            })
          );
        }
      },

      // 3. Evaluation Purpose & Scope
      {
        id: uid('s'), title: 'Evaluation Purpose & Scope',
        content: function () {
          var purposes = tor.evaluation_purpose || [];
          var fields = [
            { label: 'Evaluation Purpose(s)', value: purposes.length > 0 ? purposes.map(fmt).join(', ') : 'Not specified', full: false },
            { label: 'Causal Inference Level', value: fmt(tor.causal_inference_level), full: false },
            { label: 'Geographic Scope', value: safe(tor.geographic_scope), full: true },
            { label: 'Target Population', value: safe(tor.target_population), full: true }
          ];
          return h('div', { className: 'wb-slide-fields' },
            fields.map(function (f, i) {
              return h('div', { key: i, className: f.full ? 'wb-slide-fields--full' : '' },
                h('div', { className: 'wb-param-label' }, f.label),
                h('div', { className: 'wb-param-value' }, f.value)
              );
            })
          );
        }
      },

      // 4. Theory of Change Summary
      {
        id: uid('s'), title: 'Theory of Change Summary',
        content: function () {
          if (nodes.length === 0) {
            return h('p', { className: 's8-slide-empty' }, 'Complete the Theory of Change station to populate this slide.');
          }
          var levels = ['impact', 'outcome', 'output', 'activity'];
          var outcomeNodes = nodes.filter(function (n) { return n.level === 'outcome'; });
          return h('div', null,
            h('div', { className: 'wb-slide-fields wb-slide-fields-bottom-margin' },
              levels.map(function (lvl) {
                return h('div', { key: lvl },
                  h('div', { className: 'wb-param-label' }, fmt(lvl) + 's'),
                  h('div', { className: 'wb-param-value' }, String(levelCounts[lvl] || 0))
                );
              })
            ),
            outcomeNodes.length > 0
              ? h('div', null,
                  h('div', { className: 'wb-param-label' }, 'Key Outcome Areas'),
                  h('div', { className: 's8-bullet-list' },
                    outcomeNodes.map(function (n) {
                      return h('div', { key: n.id, className: 's8-bullet-item' }, '• ' + n.title);
                    })
                  )
                )
              : null
          );
        }
      },

      // 5. Evaluation Questions
      {
        id: uid('s'), title: 'Evaluation Questions',
        content: function () {
          if (rows.length === 0) {
            return h('p', { className: 's8-slide-empty' }, 'Complete Station 2 to define evaluation questions.');
          }
          return h('div', { className: 's8-eq-list' },
            rows.map(function (eq, i) {
              var num = eq.number || (i + 1);
              return h('div', { key: eq.id || i, className: 's8-eq-row' },
                h('span', { className: 's8-eq-num' }, num + '.'),
                eq.criterion
                  ? h('span', { className: 'wb-criterion wb-criterion--' + eq.criterion }, eq.criterion.substring(0, 5).toUpperCase())
                  : null,
                h('span', { className: 's8-eq-text' }, eq.question || '')
              );
            })
          );
        }
      },

      // 6. Methodology
      {
        id: uid('s'), title: 'Methodology',
        content: function () {
          if (!topDesign) {
            return h('p', { className: 's8-slide-empty' }, 'Complete Station 3 to select an evaluation design.');
          }
          var fields = [
            { label: 'Design', value: topDesign.name || fmt(topDesign.id || topDesign.design_id || '') },
            { label: 'Family', value: topDesign.family || 'Not classified' },
            topDesign.score != null ? { label: 'Score', value: (typeof topDesign.score === 'number' ? topDesign.score.toFixed(1) : topDesign.score) + ' / 100' } : null,
            { label: 'Comparison Strategy', value: fmt(tor.comparison_feasibility || (designRec.answers && designRec.answers.comparison)) }
          ].filter(Boolean);

          return h('div', null,
            h('div', { className: 'wb-slide-fields wb-slide-fields-bottom-margin' },
              fields.map(function (f, i) {
                return h('div', { key: i },
                  h('div', { className: 'wb-param-label' }, f.label),
                  h('div', { className: 'wb-param-value' }, f.value)
                );
              })
            ),
            designRec.justification
              ? h('div', null,
                  h('div', { className: 'wb-param-label' }, 'Justification'),
                  h('div', { className: 's8-eq-text' }, designRec.justification)
                )
              : null
          );
        }
      },

      // 7. Sampling Strategy
      {
        id: uid('s'), title: 'Sampling Strategy',
        content: function () {
          if (!result.primary && !sampleParams.design_id) {
            return h('p', { className: 's8-slide-empty' }, 'Complete Station 4 to define sample parameters.');
          }
          var breakdown = qualPlan.breakdown || [];
          var topFields = [
            result.primary ? { label: 'Total Sample', value: String(result.primary), full: false } : null,
            result.label ? { label: 'Design', value: result.label, full: true } : null
          ].filter(Boolean);

          return h('div', null,
            topFields.length > 0
              ? h('div', { className: 'wb-slide-fields wb-slide-fields-bottom-margin' },
                  topFields.map(function (f, i) {
                    return h('div', { key: i, className: f.full ? 'wb-slide-fields--full' : '' },
                      h('div', { className: 'wb-param-label' }, f.label),
                      h('div', { className: 'wb-param-value' }, f.value)
                    );
                  })
                )
              : null,
            breakdown.length > 0
              ? h('div', null,
                  h('div', { className: 'wb-param-label' }, 'Qualitative Breakdown'),
                  breakdown.map(function (b, i) {
                    return h('div', { key: i, className: 's8-list-row' },
                      h('span', { className: 's8-list-label' }, b.method),
                      h('span', { className: 's8-list-value' }, String(b.count))
                    );
                  })
                )
              : null
          );
        }
      },

      // 8. Data Collection
      {
        id: uid('s'), title: 'Data Collection',
        content: function () {
          if (instruments.length === 0) {
            return h('p', { className: 's8-slide-empty' }, 'Complete Station 5 to build instruments.');
          }
          var totalQ = instruments.reduce(function (sum, inst) { return sum + (inst.questions ? inst.questions.length : 0); }, 0);
          var types = {};
          instruments.forEach(function (inst) { var t = inst.type || 'other'; types[t] = (types[t] || 0) + 1; });

          return h('div', null,
            h('div', { className: 'wb-slide-fields wb-slide-fields-bottom-margin' },
              h('div', null,
                h('div', { className: 'wb-param-label' }, 'Instruments'),
                h('div', { className: 'wb-param-value' }, String(instruments.length))
              ),
              h('div', null,
                h('div', { className: 'wb-param-label' }, 'Total Questions'),
                h('div', { className: 'wb-param-value' }, String(totalQ))
              ),
              h('div', null,
                h('div', { className: 'wb-param-label' }, 'Types'),
                h('div', { className: 'wb-param-value' }, Object.keys(types).map(function (t) { return fmt(t) + ' (' + types[t] + ')'; }).join(', '))
              )
            ),
            h('div', null,
              instruments.map(function (inst, i) {
                var qCount = inst.questions ? inst.questions.length : 0;
                return h('div', { key: inst.id || i, className: 's8-list-row' },
                  h('span', { className: 's8-list-label' }, inst.title || inst.name || 'Untitled'),
                  h('span', { className: 's8-list-value--muted' }, qCount + ' questions · ' + fmt(inst.type || 'other'))
                );
              })
            )
          );
        }
      },

      // 9. Analysis Approach
      {
        id: uid('s'), title: 'Analysis Approach',
        content: function () {
          var aRows = analysisPlan.rows || [];
          if (aRows.length === 0 && rows.length > 0) {
            return h('div', null,
              h('div', { className: 'wb-param-label' }, 'Data Sources per Evaluation Question'),
              rows.map(function (eq, i) {
                var num = eq.number || (i + 1);
                var sources = eq.dataSources || [];
                return h('div', { key: eq.id || i, className: 's8-list-row' },
                  h('span', { className: 's8-list-label' }, 'EQ' + num),
                  h('span', { className: 's8-list-value--muted' }, sources.length > 0 ? sources.join(', ') : 'No sources defined')
                );
              }),
              h('p', { className: 's8-slide-empty' }, 'Complete Station 6 for detailed analysis methods.')
            );
          }
          if (aRows.length === 0) {
            return h('p', { className: 's8-slide-empty' }, 'Complete Station 6 to define the analysis plan.');
          }
          return h('div', null,
            aRows.map(function (r, i) {
              return h('div', { key: i, className: 's8-list-row' },
                h('span', { className: 's8-list-label' }, r.eq_label || ('EQ' + (i + 1))),
                h('span', { className: 's8-list-value--muted' }, [r.method, r.software].filter(Boolean).join(' · ') || 'Not specified')
              );
            })
          );
        }
      },

      // 10. Evaluability Assessment
      {
        id: uid('s'), title: 'Evaluability Assessment',
        content: function () {
          var score = evaluability.score;
          var dims = evaluability.dimensions || [];
          var blockers = evaluability.blockers || [];

          if (score == null) {
            return h('p', { className: 's8-slide-empty' }, 'Evaluability assessment not yet completed.');
          }

          var band = scoreBand(score);

          return h('div', null,
            h('div', { className: 's8-score-header' },
              h('span', { className: 'wb-score-number' }, String(score)),
              h('div', { className: 's8-score-band-wrap' },
                h('span', { className: 'wb-score-band ' + band.cls }, band.label),
                h('div', { className: 'wb-score-label' }, 'out of 100')
              )
            ),
            dims.length > 0
              ? h('div', null,
                  dims.map(function (d) {
                    var val = d.adjusted_score != null ? d.adjusted_score : d.system_score;
                    var pct = d.max > 0 ? (val / d.max) * 100 : 0;
                    return h('div', { key: d.id, className: 'wb-dimension' },
                      h('span', { className: 'wb-dimension-label' }, d.label),
                      h('div', { className: 'wb-dimension-bar' },
                        h('div', { className: 'wb-dimension-fill ' + dimensionFillClass(pct), style: { width: pct + '%' } })
                      ),
                      h('span', { className: 'wb-dimension-score' }, val + '/' + d.max)
                    );
                  })
                )
              : null,
            blockers.length > 0
              ? h('div', null,
                  h('div', { className: 'wb-param-label' }, 'Key Constraints'),
                  h('div', { className: 's8-bullet-list' },
                    blockers.map(function (b, i) {
                      return h('div', { key: i, className: 's8-bullet-item' }, '• ' + (typeof b === 'string' ? b : b.label || b.text || JSON.stringify(b)));
                    })
                  )
                )
              : null
          );
        }
      }
    ];
  }

  // ── Station 8 Component ──

  function Station8(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var _slides = useState(function () {
      return buildSlides(context).map(function (s) {
        return Object.assign({}, s, { included: true, talkingPoints: '' });
      });
    });
    var slides = _slides[0];
    var setSlides = _slides[1];

    useEffect(function () {
      document.body.classList.add(PRINT_BODY_CLASS);
      ensurePrintCSS();
      return function () {
        document.body.classList.remove(PRINT_BODY_CLASS);
        var styleEl = document.getElementById(PRINT_STYLE_ID);
        if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      };
    }, []);

    // ── Handlers ──

    var handleRegenerate = useCallback(function () {
      setSlides(buildSlides(context).map(function (s) {
        return Object.assign({}, s, { included: true, talkingPoints: '' });
      }));
    }, [context]);

    var handleToggleInclude = useCallback(function (idx) {
      setSlides(function (prev) {
        return prev.map(function (s, i) {
          if (i !== idx) return s;
          return Object.assign({}, s, { included: !s.included });
        });
      });
    }, []);

    var handleTalkingPointsChange = useCallback(function (idx, val) {
      setSlides(function (prev) {
        return prev.map(function (s, i) {
          if (i !== idx) return s;
          return Object.assign({}, s, { talkingPoints: val });
        });
      });
    }, []);

    var handleMoveUp = useCallback(function (idx) {
      if (idx <= 0) return;
      setSlides(function (prev) {
        var arr = prev.slice();
        var tmp = arr[idx - 1];
        arr[idx - 1] = arr[idx];
        arr[idx] = tmp;
        return arr;
      });
    }, []);

    var handleMoveDown = useCallback(function (idx) {
      setSlides(function (prev) {
        if (idx >= prev.length - 1) return prev;
        var arr = prev.slice();
        var tmp = arr[idx + 1];
        arr[idx + 1] = arr[idx];
        arr[idx] = tmp;
        return arr;
      });
    }, []);

    var handleSave = useCallback(function () {
      var exportSlides = slides.map(function (s, i) {
        return { title: s.title, included: s.included, talkingPoints: s.talkingPoints, order: i };
      });
      dispatch({ type: 'SAVE_STATION', stationId: 8, data: { presentation: { slides: exportSlides, completed_at: new Date().toISOString() } } });
      dispatch({ type: 'SHOW_TOAST', message: 'Presentation saved', toastType: 'success' });
    }, [dispatch, slides]);

    var handleOpenDeckTool = useCallback(function () {
      try {
        sessionStorage.setItem('praxis-deck-context', JSON.stringify({
          project_meta: context.project_meta,
          tor_constraints: context.tor_constraints,
          evaluation_matrix: context.evaluation_matrix,
          design_recommendation: context.design_recommendation,
          sample_parameters: context.sample_parameters,
          instruments: context.instruments,
          evaluability: context.evaluability,
          toc: context.toc,
          analysis_plan: context.analysis_plan,
          generated_at: new Date().toISOString()
        }));
      } catch (e) { /* sessionStorage full or blocked */ }
      window.open('/praxis/tools/deck-generator/', '_blank');
    }, [context]);

    var handlePrint = useCallback(function () {
      window.print();
    }, []);

    // ── Render ──

    var includedCount = slides.filter(function (s) { return s.included; }).length;

    return h('div', { className: 's8-print-root' },

      // Toolbar
      h('div', { className: 'wb-toolbar s8-no-print' },
        h('span', { className: 's8-toolbar-stat' }, includedCount + ' of ' + slides.length + ' slides included'),
        h('span', { className: 'wb-toolbar-spacer' }),
        h('button', { className: 'wb-btn wb-btn-sm', onClick: handleRegenerate, title: 'Regenerate from current data', style: { display: 'flex', alignItems: 'center', gap: 6 } }, PraxisIcons.refresh(14), 'Regenerate'),
        h('span', { className: 'wb-toolbar-divider' }),
        h('button', { className: 'wb-btn wb-btn-sm', onClick: handlePrint, title: 'Print or save as PDF', style: { display: 'flex', alignItems: 'center', gap: 6 } }, PraxisIcons.print(14), 'Download PDF'),
        h('button', { className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: handleOpenDeckTool, title: 'Open in deck generator', style: { display: 'flex', alignItems: 'center', gap: 6 } }, 'Open deck tool', PraxisIcons.externalLink(14))
      ),

      // Slide cards
      h('div', { className: 's8-slide-grid' },
        slides.map(function (slide, si) {
          var excluded = !slide.included;
          var slideCls = 'wb-slide s8-slide-card';
          if (excluded) slideCls += ' wb-slide--excluded s8-excluded-slide';
          return h('div', { key: slide.id, className: slideCls },

            // Header (screen)
            h('div', { className: 'wb-slide-header s8-no-print' },
              h('div', { className: 's8-slide-header-left' },
                h('span', { className: 'wb-slide-num' }, 'Slide ' + (si + 1)),
                h('span', { className: 'wb-slide-title' }, slide.title)
              ),
              h('div', { className: 's8-slide-header-actions' },
                h('button', {
                  className: 'wb-reorder-btn',
                  onClick: function () { handleMoveUp(si); },
                  disabled: si === 0,
                  title: 'Move up',
                  'aria-label': 'Move slide up'
                }, PraxisIcons.chevronUp(14)),
                h('button', {
                  className: 'wb-reorder-btn',
                  onClick: function () { handleMoveDown(si); },
                  disabled: si === slides.length - 1,
                  title: 'Move down',
                  'aria-label': 'Move slide down'
                }, PraxisIcons.chevronDown(14)),
                h('button', {
                  className: 'wb-btn wb-btn-sm s8-include-btn' + (slide.included ? ' wb-btn--active' : ''),
                  onClick: function () { handleToggleInclude(si); },
                  title: slide.included ? 'Exclude from export' : 'Include in export'
                }, slide.included ? 'Included' : 'Excluded')
              )
            ),

            // Header (print — navy bar)
            h('div', { className: 's8-slide-header-print', style: { display: 'none' } },
              h('span', { className: 's8-slide-num-print' }, String(si + 1)),
              h('span', { className: 's8-slide-title-print' }, slide.title)
            ),

            // Body
            h('div', { className: 'wb-slide-body s8-slide-body-print' },
              slide.content()
            ),

            // Talking points (editable on screen)
            h('div', { className: 's8-no-print s8-talking-points-block' },
              h('label', { className: 'wb-overline' }, 'Talking Points'),
              h('textarea', {
                className: 's8-talking-points-textarea',
                value: slide.talkingPoints,
                onChange: function (e) { handleTalkingPointsChange(si, e.target.value); },
                placeholder: 'Add presenter notes for this slide…',
                rows: 2
              })
            ),

            // Talking points (print only)
            slide.talkingPoints
              ? h('div', { className: 's8-talking-points', style: { display: 'none' } }, slide.talkingPoints)
              : null
          );
        })
      ),

      // Bottom actions
      h('div', { className: 'wb-toolbar wb-toolbar--mt s8-no-print' },
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save'),
        h('span', { className: 'wb-toolbar-spacer' }),
        h('p', { className: 's8-footer-note' },
          'Data is passed to the Deck Tool via sessionStorage. Nothing leaves your browser.')
      ),

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 8, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station8 = Station8;
})();
