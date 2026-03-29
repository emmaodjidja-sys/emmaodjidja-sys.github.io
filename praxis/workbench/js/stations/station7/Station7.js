/**
 * Station7.js — Report Builder
 * Generates a structured report outline from the evaluation matrix.
 * Sections are editable, reorderable (move up/down), and deletable.
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

  // ── Build default sections from evaluation matrix ──

  function buildDefaultSections(matrix) {
    var sections = [
      { id: uid('sec'), title: 'Executive Summary', description: 'High-level overview of evaluation purpose, methodology, key findings, and recommendations.', type: 'standard' },
      { id: uid('sec'), title: 'Introduction', description: 'Background, evaluation purpose, scope, and intended audience.', type: 'standard' },
      { id: uid('sec'), title: 'Methodology', description: 'Evaluation design, sampling strategy, data collection methods, analytical approach, limitations, and ethical considerations.', type: 'standard' }
    ];

    var rows = (matrix && matrix.rows) || [];
    rows.forEach(function (eq, i) {
      var eqText = eq.question || eq.text || ('Evaluation Question ' + (i + 1));
      var criterion = eq.criterion || '';
      sections.push({
        id: uid('sec'),
        title: 'Findings: ' + eqText,
        description: 'Data presentation, analysis, and interpretation for this evaluation question.',
        type: 'finding',
        criterion: criterion
      });
    });

    sections.push(
      { id: uid('sec'), title: 'Conclusions', description: 'Synthesis of findings, assessment of programme performance against evaluation criteria.', type: 'standard' },
      { id: uid('sec'), title: 'Recommendations', description: 'Actionable, evidence-based recommendations prioritised by urgency and feasibility.', type: 'standard' },
      { id: uid('sec'), title: 'Annexes', description: 'Terms of reference, data collection instruments, additional tables, methodology details.', type: 'standard' }
    );

    return sections;
  }

  var CRITERION_COLORS = {
    relevance:     { bg: '#DBEAFE', text: '#1E40AF' },
    coherence:     { bg: '#E0E7FF', text: '#3730A3' },
    effectiveness: { bg: '#D1FAE5', text: '#065F46' },
    efficiency:    { bg: '#FEF3C7', text: '#92400E' },
    impact:        { bg: '#FCE7F3', text: '#9D174D' },
    sustainability:{ bg: '#CCFBF1', text: '#115E59' }
  };

  var SECTION_ICONS = {
    standard: '\u2588',
    finding: '\u25CF'
  };

  // ── Station 7 Component ──

  function Station7(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};
    var matrix = context.evaluation_matrix || {};
    var savedStructure = context.report_structure || {};
    var hasMatrix = matrix.rows && matrix.rows.length > 0;

    var initialSections = savedStructure.sections && savedStructure.sections.length > 0
      ? savedStructure.sections : [];

    var _s = useState(initialSections);
    var sections = _s[0]; var setSections = _s[1];

    var _g = useState(initialSections.length > 0);
    var generated = _g[0]; var setGenerated = _g[1];

    var _editing = useState(null);
    var editingId = _editing[0]; var setEditingId = _editing[1];

    var handleGenerate = useCallback(function () {
      setSections(buildDefaultSections(matrix));
      setGenerated(true);
    }, [matrix]);

    var updateSection = useCallback(function (id, field, value) {
      setSections(function (prev) {
        return prev.map(function (s) { return s.id === id ? Object.assign({}, s, (function() { var o = {}; o[field] = value; return o; })()) : s; });
      });
    }, []);

    var removeSection = useCallback(function (id) {
      setSections(function (prev) { return prev.filter(function (s) { return s.id !== id; }); });
    }, []);

    var moveSection = useCallback(function (id, dir) {
      setSections(function (prev) {
        var idx = prev.findIndex(function (s) { return s.id === id; });
        if (idx < 0) return prev;
        var newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        var next = prev.slice();
        var tmp = next[idx]; next[idx] = next[newIdx]; next[newIdx] = tmp;
        return next;
      });
    }, []);

    var addSection = useCallback(function () {
      setSections(function (prev) {
        return prev.concat([{ id: uid('sec'), title: 'New Section', description: '', type: 'standard' }]);
      });
    }, []);

    var handleSave = useCallback(function () {
      dispatch({ type: 'SAVE_STATION', stationId: 7, data: { report_structure: { sections: sections, completed_at: new Date().toISOString() } } });
      dispatch({ type: 'SHOW_TOAST', message: 'Report structure saved', toastType: 'success' });
    }, [dispatch, sections]);

    // ── Empty state ──
    if (!generated) {
      return h('div', null,
        h('div', { className: 'wb-card', style: { textAlign: 'center', padding: '48px 32px' } },
          h('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text, #0F172A)', marginBottom: 6 } }, 'Report Structure'),
          h('p', { style: { fontSize: 13, color: 'var(--slate, #64748B)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 20px' } },
            hasMatrix
              ? 'Generate a structured report outline from your ' + matrix.rows.length + ' evaluation questions. Sections are fully editable.'
              : 'Complete Station 2 (Evaluation Matrix) first to generate an outline from your evaluation questions.'
          ),
          hasMatrix
            ? h('button', { className: 'wb-btn wb-btn-primary', onClick: handleGenerate }, 'Generate Report Outline')
            : h('button', { className: 'wb-btn wb-btn-primary', onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 2 }); } }, 'Go to Station 2')
        ),
        typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch }) : null
      );
    }

    // ── Section list ──
    return h('div', null,
      // Header row
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
        h('div', null,
          h('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--text, #0F172A)' } },
            sections.length + ' sections'),
          h('span', { style: { fontSize: 11, color: 'var(--slate, #64748B)', marginLeft: 8 } },
            sections.filter(function (s) { return s.type === 'finding'; }).length + ' findings sections')
        ),
        h('div', { style: { display: 'flex', gap: 8 } },
          h('button', { className: 'wb-btn', style: { fontSize: 11 }, onClick: addSection }, '+ Add Section'),
          h('button', { className: 'wb-btn', style: { fontSize: 11 }, onClick: handleGenerate }, 'Regenerate')
        )
      ),

      // Section cards
      sections.map(function (sec, i) {
        var isEditing = editingId === sec.id;
        var cc = sec.criterion ? (CRITERION_COLORS[sec.criterion] || { bg: '#F1F5F9', text: '#475569' }) : null;

        return h('div', {
          key: sec.id,
          style: {
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', marginBottom: 6,
            background: isEditing ? '#FAFBFC' : 'var(--surface, #fff)',
            border: '1px solid ' + (isEditing ? 'var(--teal, #2EC4B6)' : 'var(--border, #E2E8F0)'),
            borderLeft: sec.type === 'finding' && cc ? '3px solid ' + cc.text : '3px solid var(--border, #E2E8F0)',
            borderRadius: 6, transition: 'border-color 0.15s'
          }
        },
          // Order controls
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, paddingTop: 2 } },
            h('button', {
              style: { border: 'none', background: 'none', cursor: i > 0 ? 'pointer' : 'default', color: i > 0 ? 'var(--slate, #64748B)' : '#E2E8F0', fontSize: 10, padding: 2, lineHeight: 1 },
              onClick: function () { moveSection(sec.id, -1); },
              disabled: i === 0, title: 'Move up'
            }, '\u25B2'),
            h('span', { style: { fontSize: 10, fontWeight: 700, color: 'var(--slate, #64748B)', textAlign: 'center', lineHeight: 1 } }, i + 1),
            h('button', {
              style: { border: 'none', background: 'none', cursor: i < sections.length - 1 ? 'pointer' : 'default', color: i < sections.length - 1 ? 'var(--slate, #64748B)' : '#E2E8F0', fontSize: 10, padding: 2, lineHeight: 1 },
              onClick: function () { moveSection(sec.id, 1); },
              disabled: i === sections.length - 1, title: 'Move down'
            }, '\u25BC')
          ),

          // Content
          h('div', { style: { flex: 1, minWidth: 0 } },
            // Title row
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 } },
              cc ? h('span', {
                style: { display: 'inline-block', padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', background: cc.bg, color: cc.text }
              }, sec.criterion.substring(0, 5)) : null,
              isEditing
                ? h('input', {
                    className: 'wb-input',
                    style: { flex: 1, fontWeight: 600, fontSize: 13 },
                    value: sec.title,
                    onChange: function (e) { updateSection(sec.id, 'title', e.target.value); },
                    autoFocus: true
                  })
                : h('span', {
                    style: { fontSize: 13, fontWeight: 600, color: 'var(--text, #0F172A)', cursor: 'pointer' },
                    onClick: function () { setEditingId(sec.id); }
                  }, sec.title)
            ),
            // Description
            isEditing
              ? h('textarea', {
                  className: 'wb-input',
                  style: { width: '100%', minHeight: 48, resize: 'vertical', fontSize: 12, marginTop: 4 },
                  value: sec.description,
                  onChange: function (e) { updateSection(sec.id, 'description', e.target.value); }
                })
              : sec.description
                ? h('p', { style: { fontSize: 11, color: 'var(--slate, #64748B)', lineHeight: 1.5, margin: '2px 0 0' } }, sec.description)
                : null
          ),

          // Actions
          h('div', { style: { display: 'flex', gap: 4, flexShrink: 0 } },
            isEditing
              ? h('button', {
                  style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--teal, #2EC4B6)', fontSize: 11, fontWeight: 600, padding: '4px 8px' },
                  onClick: function () { setEditingId(null); }
                }, 'Done')
              : h('button', {
                  style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--slate, #64748B)', fontSize: 11, padding: '4px 6px' },
                  onClick: function () { setEditingId(sec.id); }, title: 'Edit'
                }, '\u270E'),
            h('button', {
              style: { border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 11, padding: '4px 6px', opacity: 0.5 },
              onClick: function () { removeSection(sec.id); }, title: 'Remove section',
              onMouseEnter: function (e) { e.currentTarget.style.opacity = 1; },
              onMouseLeave: function (e) { e.currentTarget.style.opacity = 0.5; }
            }, '\u2715')
          )
        );
      }),

      // Save bar
      h('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save Report Structure')
      ),

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station7 = Station7;
})();
