/**
 * Station7.js — Report Builder
 * Editable section scaffold for evaluation report structure.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  // ── Build default sections from evaluation matrix ──

  function buildDefaultSections(matrix) {
    var sections = [
      { id: uid('sec'), title: 'Executive Summary', description: 'High-level overview of evaluation purpose, methodology, key findings, and recommendations.' },
      { id: uid('sec'), title: 'Introduction', description: 'Background, evaluation purpose, scope, and intended audience.' },
      { id: uid('sec'), title: 'Methodology', description: 'Evaluation design, sampling strategy, data collection methods, analytical approach, limitations, and ethical considerations.' }
    ];

    // One section per evaluation question
    if (matrix && matrix.questions && Array.isArray(matrix.questions)) {
      matrix.questions.forEach(function (q, i) {
        var eqText = q.text || q.question || ('Evaluation Question ' + (i + 1));
        sections.push({
          id: uid('sec'),
          title: 'Findings: ' + eqText,
          description: 'Data presentation, analysis, and interpretation for this evaluation question.'
        });
      });
    }

    sections.push(
      { id: uid('sec'), title: 'Conclusions', description: 'Synthesis of findings, assessment of programme performance against criteria.' },
      { id: uid('sec'), title: 'Recommendations', description: 'Actionable, evidence-based recommendations prioritised by urgency and feasibility.' },
      { id: uid('sec'), title: 'Annexes', description: 'ToR, data collection instruments, additional tables, methodology details.' }
    );

    return sections;
  }

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  // ── Station 7 Component ──

  function Station7(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};

    var matrix = context.evaluation_matrix || null;
    var savedStructure = context.report_structure || null;

    var initialSections = savedStructure && savedStructure.sections
      ? savedStructure.sections
      : [];

    var _sections = useState(initialSections);
    var sections = _sections[0];
    var setSections = _sections[1];

    var _generated = useState(initialSections.length > 0);
    var generated = _generated[0];
    var setGenerated = _generated[1];

    // ── Generate outline ──
    var handleGenerate = useCallback(function () {
      var newSections = buildDefaultSections(matrix);
      setSections(newSections);
      setGenerated(true);
    }, [matrix]);

    // ── Update section ──
    var updateSection = useCallback(function (index, field, value) {
      setSections(function (prev) {
        var next = prev.slice();
        next[index] = Object.assign({}, next[index]);
        next[index][field] = value;
        return next;
      });
    }, []);

    // ── Save ──
    var handleSave = useCallback(function () {
      dispatch({
        type: 'SAVE_STATION',
        stationId: 7,
        data: { report_structure: { sections: sections } }
      });
    }, [dispatch, sections]);

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

      // Generate button (if no sections yet)
      !generated
        ? h('div', { className: 'wb-card', style: { textAlign: 'center', padding: '3rem 2rem' } },
            h('div', { style: { fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 } }, '\u{1F4DD}'),
            h('h3', { style: { marginBottom: '0.75rem' } }, 'Report Structure'),
            h('p', { className: 'wb-helper', style: { marginBottom: '1.5rem' } },
              'Generate a report outline based on your evaluation questions and methodology.'),
            h('button', {
              className: 'wb-btn wb-btn-primary',
              onClick: handleGenerate
            }, 'Generate Outline')
          )
        : null,

      // Section list
      generated
        ? h('div', null,
            h('h4', { style: { marginBottom: '1rem' } },
              'Report Sections (' + sections.length + ')'),
            sections.map(function (sec, i) {
              return h('div', {
                key: sec.id,
                className: 'wb-card',
                style: {
                  marginBottom: '0.75rem', display: 'flex', gap: '1rem',
                  alignItems: 'flex-start'
                }
              },
                // Drag handle (visual only)
                h('div', {
                  style: {
                    cursor: 'grab', color: 'var(--text-tertiary, #94a3b8)',
                    fontSize: '1.2rem', lineHeight: '2.2rem', userSelect: 'none',
                    flexShrink: 0
                  },
                  title: 'Drag to reorder (coming soon)'
                }, '\u2261'),

                // Section content
                h('div', { style: { flex: 1, minWidth: 0 } },
                  // Section number
                  h('span', {
                    className: 'wb-pill',
                    style: { marginBottom: '0.5rem', display: 'inline-block', fontSize: '0.75rem' }
                  }, 'Section ' + (i + 1)),

                  // Editable title
                  h('input', {
                    className: 'wb-input',
                    style: {
                      width: '100%', fontWeight: 600, fontSize: '1rem',
                      marginBottom: '0.5rem'
                    },
                    value: sec.title,
                    onChange: function (e) { updateSection(i, 'title', e.target.value); }
                  }),

                  // Editable description
                  h('textarea', {
                    className: 'wb-textarea',
                    style: { width: '100%', minHeight: '60px', resize: 'vertical' },
                    value: sec.description,
                    onChange: function (e) { updateSection(i, 'description', e.target.value); }
                  })
                )
              );
            }),

            // Actions
            h('div', { style: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' } },
              h('button', {
                className: 'wb-btn wb-btn-teal',
                onClick: handleSave
              }, 'Save Report Structure'),
              h('button', {
                className: 'wb-btn wb-btn-outline',
                onClick: handleGenerate
              }, 'Regenerate Outline')
            )
          )
        : null
    );
  }

  window.Station7 = Station7;
})();
