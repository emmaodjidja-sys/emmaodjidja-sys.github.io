/**
 * Station8.js — Deck Generator
 * Structured presentation summary from workbench context.
 * Provides sessionStorage bridge to standalone deck tool.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  function formatDesignName(id) {
    if (!id) return 'Not selected';
    return id.replace(/[_-]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function getTopDesign(rec) {
    if (!rec) return null;
    if (rec.ranked_designs && rec.ranked_designs.length > 0) return rec.ranked_designs[0];
    if (rec.selected_design) return { id: rec.selected_design };
    return null;
  }

  // ── Build structured slide data ──

  function buildSlides(context) {
    var meta = context.project_meta || {};
    var matrix = context.evaluation_matrix || {};
    var designRec = context.design_recommendation || {};
    var sampleParams = context.sample_parameters || {};
    var instruments = (context.instruments || {}).items || [];
    var topDesign = getTopDesign(designRec);
    var rows = matrix.rows || [];
    var result = sampleParams.result || {};

    return [
      {
        id: uid('s'), title: 'Programme Overview',
        fields: [
          { label: 'Programme', value: meta.programme_name || 'Not specified' },
          { label: 'Organisation', value: meta.organisation || 'Not specified' },
          { label: 'Country / Region', value: meta.country || 'Not specified' },
          { label: 'Sectors', value: (meta.health_areas || []).join(', ') || meta.sector || 'Not specified' },
          { label: 'Operating Context', value: meta.operating_context ? meta.operating_context.charAt(0).toUpperCase() + meta.operating_context.slice(1) : 'Not specified' },
          { label: 'Budget', value: meta.budget ? meta.budget.charAt(0).toUpperCase() + meta.budget.slice(1) : 'Not specified' }
        ].filter(function (f) { return f.value !== 'Not specified'; })
      },
      {
        id: uid('s'), title: 'Evaluation Questions',
        items: rows.length > 0
          ? rows.map(function (eq, i) {
              var num = eq.number || eq.id || (i + 1);
              var numStr = (typeof num === 'string' && num.indexOf('eq_') === 0) ? num.replace('eq_', '') : num;
              return { num: numStr, text: eq.question || eq.text || '', criterion: eq.criterion || '' };
            })
          : null,
        emptyMessage: 'Complete Station 2 to define evaluation questions.'
      },
      {
        id: uid('s'), title: 'Evaluation Design',
        fields: topDesign
          ? [
              { label: 'Design', value: formatDesignName(topDesign.id || topDesign.design_id || '') },
              topDesign.family ? { label: 'Family', value: topDesign.family } : null,
              topDesign.score != null ? { label: 'Score', value: (typeof topDesign.score === 'number' ? topDesign.score.toFixed(1) : topDesign.score) + '/100' } : null
            ].filter(Boolean)
          : null,
        emptyMessage: 'Complete Station 3 to select an evaluation design.'
      },
      {
        id: uid('s'), title: 'Sample Strategy',
        fields: (result.primary || sampleParams.design_id)
          ? [
              result.primary ? { label: 'Sample Size', value: String(result.primary) } : null,
              result.label ? { label: 'Design', value: result.label } : (sampleParams.design_id ? { label: 'Design', value: formatDesignName(sampleParams.design_id) } : null),
              sampleParams.qualitative_plan && sampleParams.qualitative_plan.breakdown && sampleParams.qualitative_plan.breakdown.length > 0
                ? { label: 'Qualitative', value: sampleParams.qualitative_plan.breakdown.map(function (b) { return b.method + ' (' + b.count + ')'; }).join(', ') }
                : null
            ].filter(Boolean)
          : null,
        emptyMessage: 'Complete Station 4 to define sample parameters.'
      },
      instruments.length > 0 ? {
        id: uid('s'), title: 'Data Collection',
        items: instruments.map(function (inst) {
          return { num: '', text: (inst.title || inst.name || 'Untitled') + ' \u2014 ' + (inst.questions ? inst.questions.length : 0) + ' questions', criterion: '' };
        })
      } : null
    ].filter(Boolean);
  }

  var CRITERION_COLORS = {
    relevance: { bg: '#DBEAFE', text: '#1E40AF' }, coherence: { bg: '#E0E7FF', text: '#3730A3' },
    effectiveness: { bg: '#D1FAE5', text: '#065F46' }, efficiency: { bg: '#FEF3C7', text: '#92400E' },
    impact: { bg: '#FCE7F3', text: '#9D174D' }, sustainability: { bg: '#CCFBF1', text: '#115E59' }
  };

  // ── Station 8 Component ──

  function Station8(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var _slides = useState(function () { return buildSlides(context); });
    var slides = _slides[0]; var setSlides = _slides[1];

    var handleRegenerate = useCallback(function () { setSlides(buildSlides(context)); }, [context]);

    var handleSave = useCallback(function () {
      dispatch({ type: 'SAVE_STATION', stationId: 8, data: { presentation: { slides: slides, completed_at: new Date().toISOString() } } });
      dispatch({ type: 'SHOW_TOAST', message: 'Presentation saved', toastType: 'success' });
    }, [dispatch, slides]);

    var handleOpenDeckTool = useCallback(function () {
      try {
        sessionStorage.setItem('praxis-deck-context', JSON.stringify({
          project_meta: context.project_meta,
          evaluation_matrix: context.evaluation_matrix,
          design_recommendation: context.design_recommendation,
          sample_parameters: context.sample_parameters,
          instruments: context.instruments,
          generated_at: new Date().toISOString()
        }));
      } catch (e) { /* ignore */ }
      window.open('/praxis/tools/deck-generator/', '_blank');
    }, [context]);

    // ── Render ──
    return h('div', null,
      // Slide cards
      h('div', { style: { display: 'grid', gap: 12 } },
        slides.map(function (slide, si) {
          return h('div', {
            key: slide.id,
            style: {
              background: 'var(--surface, #fff)', border: '1px solid var(--border, #E2E8F0)',
              borderRadius: 6, overflow: 'hidden'
            }
          },
            // Card header
            h('div', {
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderBottom: '1px solid var(--border, #E2E8F0)',
                background: '#FAFBFC'
              }
            },
              h('span', { style: { fontSize: 12, fontWeight: 600, color: 'var(--text, #0F172A)' } }, slide.title),
              h('span', { style: { fontSize: 10, color: 'var(--slate, #64748B)', fontWeight: 500 } }, 'Slide ' + (si + 1))
            ),

            // Card body
            h('div', { style: { padding: '12px 14px' } },
              // Fields layout (key-value pairs)
              slide.fields
                ? h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 } },
                    slide.fields.map(function (f, fi) {
                      return h('div', { key: fi },
                        h('div', { style: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--slate, #64748B)', marginBottom: 2 } }, f.label),
                        h('div', { style: { fontSize: 13, fontWeight: 500, color: 'var(--text, #0F172A)' } }, f.value)
                      );
                    })
                  )
                : null,

              // Items layout (numbered list — for EQs, instruments)
              slide.items
                ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
                    slide.items.map(function (item, ii) {
                      var cc = item.criterion ? CRITERION_COLORS[item.criterion] : null;
                      return h('div', {
                        key: ii,
                        style: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.5 }
                      },
                        item.num ? h('span', { style: { fontWeight: 700, color: 'var(--slate, #64748B)', flexShrink: 0, minWidth: 20 } }, item.num + '.') : null,
                        cc ? h('span', {
                          style: { display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', background: cc.bg, color: cc.text, flexShrink: 0, marginTop: 2 }
                        }, item.criterion.substring(0, 5)) : null,
                        h('span', { style: { color: 'var(--text, #0F172A)' } }, item.text)
                      );
                    })
                  )
                : null,

              // Empty message
              !slide.fields && !slide.items && slide.emptyMessage
                ? h('p', { style: { fontSize: 12, color: 'var(--slate, #64748B)', fontStyle: 'italic', margin: 0 } }, slide.emptyMessage)
                : null
            )
          );
        })
      ),

      // Actions
      h('div', {
        style: { display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }
      },
        h('button', { className: 'wb-btn wb-btn-primary', onClick: handleOpenDeckTool, title: 'Opens deck tool with data via sessionStorage' }, 'Open Deck Tool \u2197'),
        h('button', { className: 'wb-btn', onClick: function () { window.print(); } }, 'Download PDF'),
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save'),
        h('button', { className: 'wb-btn', style: { fontSize: 11 }, onClick: handleRegenerate }, 'Regenerate')
      ),

      h('p', { style: { marginTop: 10, fontSize: 10, color: 'var(--slate, #64748B)' } },
        'Data is passed to the Deck Tool via sessionStorage \u2014 nothing leaves your browser.'),

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 8, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station8 = Station8;
})();
