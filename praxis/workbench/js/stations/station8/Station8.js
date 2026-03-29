/**
 * Station8.js — Deck Generator
 * Pulls structured summary data from multiple stations to generate
 * a presentation-ready overview. Provides sessionStorage bridge to
 * the standalone deck generator tool.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  // ── Helpers ──

  function getTopDesign(designRec) {
    if (!designRec) return null;
    if (designRec.ranked_designs && designRec.ranked_designs.length > 0) return designRec.ranked_designs[0];
    if (designRec.ranked && designRec.ranked.length > 0) return designRec.ranked[0];
    if (designRec.selected_design) return { id: designRec.selected_design };
    return null;
  }

  function formatDesignName(id) {
    if (!id) return 'Not selected';
    return id.replace(/[_-]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  // ── Station 8 Component ──

  function Station8(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var projectMeta = context.project_meta || {};
    var matrix = context.evaluation_matrix || {};
    var designRec = context.design_recommendation || {};
    var sampleParams = context.sample_parameters || {};
    var reportStructure = context.report_structure || {};

    var topDesign = getTopDesign(designRec);
    var matrixRows = matrix.rows || [];

    // Build slides from available data
    var buildSlides = useCallback(function () {
      var slides = [];

      // Slide 1: Programme overview
      var metaParts = [
        projectMeta.programme_name || '',
        projectMeta.organisation || '',
        projectMeta.country || '',
        (projectMeta.health_areas || projectMeta.sectors || []).join(', ')
      ].filter(Boolean);

      slides.push({
        id: uid('slide'),
        title: 'Programme Overview',
        content: metaParts.length > 0
          ? metaParts.join(' \u2022 ')
          : 'No programme data available. Complete Station 0 to add project metadata.'
      });

      // Slide 2: Evaluation questions
      slides.push({
        id: uid('slide'),
        title: 'Key Evaluation Questions',
        content: matrixRows.length > 0
          ? matrixRows.map(function (eq, i) {
              var num = eq.number || eq.id || (i + 1);
              var numStr = (typeof num === 'string' && num.indexOf('eq_') === 0)
                ? num.replace('eq_', '') : num;
              return numStr + '. ' + (eq.question || eq.text || '');
            }).join('\n')
          : 'No evaluation questions defined. Complete Station 2.'
      });

      // Slide 3: Evaluation design
      slides.push({
        id: uid('slide'),
        title: 'Evaluation Design',
        content: topDesign
          ? formatDesignName(topDesign.id || topDesign.design_id || '') +
            (topDesign.score != null ? ' (Score: ' + (typeof topDesign.score === 'number' ? topDesign.score.toFixed(1) : topDesign.score) + ')' : '') +
            (topDesign.family ? '\nFamily: ' + topDesign.family : '')
          : 'No design selected. Complete Station 3.'
      });

      // Slide 4: Sample strategy
      var result = sampleParams.result || {};
      slides.push({
        id: uid('slide'),
        title: 'Sample Strategy',
        content: result.primary || sampleParams.design_id
          ? [
              result.primary ? 'Sample size: ' + result.primary : null,
              result.label ? 'Design: ' + result.label : (sampleParams.design_id ? 'Design: ' + formatDesignName(sampleParams.design_id) : null),
              sampleParams.qualitative_plan && sampleParams.qualitative_plan.breakdown && sampleParams.qualitative_plan.breakdown.length > 0
                ? 'Qualitative: ' + sampleParams.qualitative_plan.breakdown.map(function (b) { return b.method + ' (' + b.count + ')'; }).join(', ')
                : null
            ].filter(Boolean).join('\n')
          : 'No sample parameters defined. Complete Station 4.'
      });

      // Slide 5: Data collection plan (from instruments if available)
      var instruments = (context.instruments || {}).items || [];
      if (instruments.length > 0) {
        slides.push({
          id: uid('slide'),
          title: 'Data Collection Plan',
          content: instruments.map(function (inst) {
            return (inst.title || inst.name || 'Untitled') +
              ' (' + (inst.questions ? inst.questions.length : 0) + ' questions)';
          }).join('\n')
        });
      }

      return slides;
    }, [projectMeta, matrixRows, topDesign, sampleParams, context.instruments]);

    var _slides = useState(function () { return buildSlides(); });
    var slides = _slides[0];
    var setSlides = _slides[1];

    // ── Open Deck Tool with sessionStorage bridge ──
    var handleOpenDeckTool = useCallback(function () {
      // Store the full context summary in sessionStorage for the deck tool to read
      var deckContext = {
        project_meta: projectMeta,
        evaluation_questions: matrixRows.map(function (eq, i) {
          return {
            number: eq.number || eq.id || (i + 1),
            question: eq.question || eq.text || '',
            criterion: eq.criterion || ''
          };
        }),
        design: topDesign ? {
          id: topDesign.id || topDesign.design_id || '',
          name: formatDesignName(topDesign.id || topDesign.design_id || ''),
          score: topDesign.score,
          family: topDesign.family
        } : null,
        sample: {
          design_id: sampleParams.design_id,
          result: sampleParams.result || {},
          qualitative_plan: sampleParams.qualitative_plan || {}
        },
        instruments: ((context.instruments || {}).items || []).map(function (inst) {
          return { title: inst.title || inst.name, questionCount: (inst.questions || []).length, type: inst.type };
        }),
        generated_at: new Date().toISOString()
      };

      try {
        sessionStorage.setItem('praxis-deck-context', JSON.stringify(deckContext));
      } catch (e) {
        // sessionStorage may be full or unavailable; proceed anyway
      }

      window.open('/praxis/tools/deck-generator/', '_blank');
    }, [projectMeta, matrixRows, topDesign, sampleParams, context.instruments]);

    // ── Other handlers ──
    var handleRegenerate = useCallback(function () {
      setSlides(buildSlides());
    }, [buildSlides]);

    var handleDownloadPDF = useCallback(function () {
      window.print();
    }, []);

    var handleSave = useCallback(function () {
      dispatch({
        type: 'SAVE_STATION',
        stationId: 8,
        data: { presentation: { slides: slides, completed_at: new Date().toISOString() } }
      });
      dispatch({ type: 'SHOW_TOAST', message: 'Presentation saved', toastType: 'success' });
    }, [dispatch, slides]);

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

      // Summary cards
      h('div', { style: { display: 'grid', gap: '1rem' } },
        slides.map(function (slide, i) {
          return h('div', {
            key: slide.id,
            className: 'wb-card',
            style: { position: 'relative' }
          },
            // Slide number chip
            h('span', {
              style: {
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                fontSize: '0.7rem', color: 'var(--slate, #64748b)', opacity: 0.6
              }
            }, 'Slide ' + (i + 1)),

            // Title
            h('h4', {
              style: {
                margin: '0 0 0.75rem 0',
                color: 'var(--text, #0F172A)',
                fontSize: '1.05rem'
              }
            }, slide.title),

            // Content
            h('div', {
              style: {
                whiteSpace: 'pre-line',
                fontSize: '0.9rem',
                color: 'var(--slate, #64748b)',
                lineHeight: '1.6'
              }
            }, slide.content)
          );
        })
      ),

      // Actions
      h('div', {
        style: {
          display: 'flex', gap: '0.75rem', marginTop: '1.5rem',
          flexWrap: 'wrap', alignItems: 'center'
        }
      },
        h('button', {
          className: 'wb-btn wb-btn-primary',
          onClick: handleOpenDeckTool,
          title: 'Opens the Deck Generator tool with your workbench data pre-loaded via sessionStorage'
        }, 'Open Deck Tool \u2197'),
        h('button', {
          className: 'wb-btn',
          onClick: handleDownloadPDF
        }, 'Download Summary PDF'),
        h('button', {
          className: 'wb-btn wb-btn-teal',
          onClick: handleSave
        }, 'Save Presentation'),
        h('button', {
          className: 'wb-btn',
          style: { fontSize: '0.85rem' },
          onClick: handleRegenerate
        }, 'Regenerate Slides')
      ),

      // sessionStorage info
      h('p', {
        style: {
          marginTop: '1rem', fontSize: '0.78rem',
          color: 'var(--slate, #64748b)', fontStyle: 'italic'
        }
      }, 'The Deck Tool receives your evaluation context via sessionStorage \u2014 no data leaves your browser.')
    );
  }

  window.Station8 = Station8;
})();
