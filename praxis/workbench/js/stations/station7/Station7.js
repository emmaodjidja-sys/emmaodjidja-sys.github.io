/**
 * Station7.js — Report Builder
 * Generates a structured evaluation report outline pre-populated with
 * upstream workbench data.  Sections are editable, reorderable, and
 * exportable as a Word document outline.
 */
(function () {
  'use strict';

  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;
  var useMemo = React.useMemo;

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  // ── Criterion colours ──

  var CRITERION_COLORS = {
    relevance:      { bg: '#DBEAFE', text: '#1E40AF' },
    coherence:      { bg: '#E0E7FF', text: '#3730A3' },
    effectiveness:  { bg: '#D1FAE5', text: '#065F46' },
    efficiency:     { bg: '#FEF3C7', text: '#92400E' },
    impact:         { bg: '#FCE7F3', text: '#9D174D' },
    sustainability: { bg: '#CCFBF1', text: '#115E59' }
  };

  // ── Word count guidance ──

  var WORD_GUIDANCE = {
    executive_summary: { min: 500,  max: 800,  label: '500\u2013800 words' },
    introduction:      { min: 800,  max: 1200, label: '800\u20131,200 words' },
    methodology:       { min: 1500, max: 2500, label: '1,500\u20132,500 words' },
    finding:           { min: 1000, max: 2000, label: '1,000\u20132,000 words' },
    conclusions:       { min: 800,  max: 1500, label: '800\u20131,500 words' },
    recommendations:   { min: 600,  max: 1200, label: '600\u20131,200 words' },
    annexes:           { min: 0,    max: 0,    label: 'Variable' }
  };

  // ── Safe accessors ──

  function safe(v, fallback) { return v != null && v !== '' ? v : (fallback || '\u2014'); }
  function list(arr) { return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : '\u2014'; }
  function purposeLabel(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return '\u2014';
    return arr.map(function (p) {
      return p.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }).join(', ');
  }

  // ── Build sections from upstream context ──

  function buildSections(ctx) {
    var meta    = ctx.project_meta || {};
    var tor     = ctx.tor_constraints || {};
    var evb     = ctx.evaluability || {};
    var matrix  = ctx.evaluation_matrix || {};
    var design  = ctx.design_recommendation || {};
    var sample  = ctx.sample_parameters || {};
    var instr   = ctx.instruments || {};
    var analysis = ctx.analysis_plan || {};

    var rows    = (matrix && matrix.rows) || [];
    var ranked  = (design.ranked_designs || []);
    var topDesign = ranked.length > 0 ? ranked[0] : {};
    var selectedId = design.selected_design || '';
    var selectedDesign = ranked.find(function (d) { return d.id === selectedId; }) || topDesign;
    var instrItems = (instr && instr.items) || [];
    var analysisRows = (analysis && analysis.rows) || [];

    var sections = [];

    // 1. Executive Summary
    sections.push({
      id: uid('sec'), sectionType: 'executive_summary', type: 'standard',
      title: 'Executive Summary',
      autoContent: [
        'Programme: ' + safe(meta.programme_name),
        'Organisation: ' + safe(meta.organisation),
        'Country: ' + safe(meta.country),
        'Evaluation type: ' + safe(meta.evaluation_type),
        'Evaluability score: ' + safe(evb.score) + '/100',
        'Selected design: ' + safe(selectedDesign.name) + ' (' + safe(selectedDesign.family) + ')',
        'Sample size: ' + safe(sample.result && sample.result.primary),
        'Evaluation questions: ' + rows.length
      ].join('\n'),
      draftContent: ''
    });

    // 2. Introduction
    var purposeText = purposeLabel(tor.evaluation_purpose);
    sections.push({
      id: uid('sec'), sectionType: 'introduction', type: 'standard',
      title: 'Introduction',
      autoContent: [
        'Programme: ' + safe(meta.programme_name),
        'Sector: ' + safe(meta.sector),
        'Country and scope: ' + safe(meta.country) + ' \u2014 ' + safe(tor.geographic_scope),
        'Target population: ' + safe(tor.target_population),
        'Evaluation purpose: ' + purposeText,
        'Causal inference level: ' + safe(tor.causal_inference_level),
        'Number of evaluation questions: ' + rows.length
      ].join('\n'),
      draftContent: ''
    });

    // 3. Methodology
    var qualPlan = sample.qualitative_plan || {};
    var qualBreakdown = (qualPlan.breakdown || []).map(function (b) {
      return b.method + ' (' + b.count + ')';
    }).join('; ');
    var analysisMethods = analysisRows.length > 0
      ? analysisRows.map(function (r) { return (r.method || '') + (r.software ? ' [' + r.software + ']' : ''); }).filter(Boolean).join('; ')
      : 'Not yet specified (complete Station 6)';

    sections.push({
      id: uid('sec'), sectionType: 'methodology', type: 'standard',
      title: 'Methodology',
      autoContent: [
        'Design: ' + safe(selectedDesign.name) + ' (' + safe(selectedDesign.family) + ')',
        'Justification: ' + safe(design.justification),
        'Quantitative sample: ' + safe(sample.result && sample.result.label),
        'Power parameters: effect size ' + safe(sample.params && sample.params.effect_size) +
          ', power ' + safe(sample.params && sample.params.power) +
          ', alpha ' + safe(sample.params && sample.params.alpha) +
          ', ICC ' + safe(sample.params && sample.params.icc),
        'Qualitative methods: ' + (qualBreakdown || '\u2014'),
        'Instruments: ' + instrItems.length + ' (' + instrItems.map(function (i) { return i.title || i.name; }).join('; ') + ')',
        'Analysis methods: ' + analysisMethods,
        'Comparison feasibility: ' + safe(tor.comparison_feasibility),
        'Data availability: ' + safe(tor.data_available)
      ].join('\n'),
      draftContent: ''
    });

    // 4. Findings sections (one per EQ)
    rows.forEach(function (eq, i) {
      var eqText = eq.question || eq.text || ('Evaluation Question ' + (i + 1));
      var criterion = eq.criterion || '';
      var indicators = (eq.indicators || []).map(function (ind) { return (ind.code || '') + ' ' + (ind.name || ''); }).join('; ');
      var sources = list(eq.dataSources);
      var judgement = safe(eq.judgementCriteria);
      var subQs = (eq.subQuestions || []).map(function (sq, j) { return '  ' + (j + 1) + '. ' + sq; }).join('\n');

      sections.push({
        id: uid('sec'), sectionType: 'finding', type: 'finding',
        title: 'Findings: EQ' + (eq.number || i + 1) + ' \u2014 ' + eqText,
        criterion: criterion,
        eqId: eq.id,
        eqNumber: eq.number || i + 1,
        autoContent: [
          'Question: ' + eqText,
          'Criterion: ' + criterion,
          subQs ? 'Sub-questions:\n' + subQs : null,
          'Indicators: ' + (indicators || '\u2014'),
          'Data sources: ' + sources,
          'Judgement criteria: ' + judgement
        ].filter(Boolean).join('\n'),
        draftContent: ''
      });
    });

    // 5. Conclusions
    sections.push({
      id: uid('sec'), sectionType: 'conclusions', type: 'standard',
      title: 'Conclusions',
      autoContent: [
        'This section should synthesise findings across all ' + rows.length + ' evaluation questions.',
        'Assess overall programme performance against each DAC criterion covered:',
        '  \u2022 ' + (rows.map(function (r) { return r.criterion; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') || 'N/A'),
        'Draw together cross-cutting themes and unexpected findings.',
        'Distinguish between conclusions that are strongly evidenced vs. those that are indicative.'
      ].join('\n'),
      draftContent: ''
    });

    // 6. Recommendations
    sections.push({
      id: uid('sec'), sectionType: 'recommendations', type: 'standard',
      title: 'Recommendations',
      autoContent: [
        'Each recommendation should:',
        '  \u2022 Be linked to specific finding(s) and conclusion(s)',
        '  \u2022 Identify the responsible actor/stakeholder',
        '  \u2022 Be prioritised by urgency (immediate / short-term / medium-term)',
        '  \u2022 Be specific and actionable',
        'Target audience: ' + safe(meta.organisation)
      ].join('\n'),
      draftContent: ''
    });

    // 7. Annexes
    sections.push({
      id: uid('sec'), sectionType: 'annexes', type: 'annex',
      title: 'Annexes',
      autoContent: [
        'Include the following annexes:',
        '  A. Terms of Reference',
        '  B. Evaluation Matrix (' + rows.length + ' evaluation questions)',
        '  C. Data collection instruments (' + instrItems.length + ' instruments)',
        instrItems.map(function (inst, i) {
          return '     ' + String.fromCharCode(105 + i) + '. ' + (inst.title || inst.name);
        }).join('\n'),
        '  D. List of persons interviewed',
        '  E. Additional statistical tables',
        '  F. Bibliography / documents reviewed'
      ].join('\n'),
      draftContent: ''
    });

    return sections;
  }

  // ── Export as Word outline (docx via HTML) ──

  function exportWordOutline(sections, programmeName) {
    var title = (programmeName || 'Evaluation') + ' \u2014 Draft Evaluation Report Outline';
    var html = [
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
      '<head><meta charset="utf-8"><title>' + title + '</title>',
      '<style>',
      'body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; margin: 2.54cm; }',
      'h1 { font-size: 18pt; color: #0B1A2E; page-break-before: always; }',
      'h1:first-of-type { page-break-before: auto; }',
      'h2 { font-size: 14pt; color: #0B1A2E; margin-top: 24pt; }',
      '.title-page { text-align: center; padding-top: 200px; page-break-after: always; }',
      '.title-page h1 { font-size: 24pt; page-break-before: auto; }',
      '.title-page p { font-size: 14pt; color: #64748B; }',
      '.auto-content { background: #F8FAFC; border-left: 3px solid #2EC4B6; padding: 10px 14px; margin: 8px 0 16px; font-size: 10pt; color: #475569; white-space: pre-line; }',
      '.word-count { font-size: 9pt; color: #94A3B8; font-style: italic; margin-bottom: 8px; }',
      '.draft-content { margin: 8px 0; font-size: 11pt; white-space: pre-line; }',
      '.badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 8pt; font-weight: bold; text-transform: uppercase; }',
      '</style></head><body>',
      '<div class="title-page">',
      '<h1>' + (programmeName || 'Evaluation Programme') + '</h1>',
      '<p>Draft Evaluation Report Outline</p>',
      '<p style="font-size:11pt;color:#94A3B8;">Generated by PRAXIS Workbench</p>',
      '</div>'
    ];

    sections.forEach(function (sec, i) {
      var wg = WORD_GUIDANCE[sec.sectionType] || WORD_GUIDANCE.finding || {};
      html.push('<h1>' + (i + 1) + '. ' + sec.title + '</h1>');
      if (wg.label) {
        html.push('<p class="word-count">[Suggested length: ' + wg.label + ']</p>');
      }
      if (sec.autoContent) {
        html.push('<div class="auto-content">' + sec.autoContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>');
      }
      if (sec.draftContent) {
        html.push('<div class="draft-content">' + sec.draftContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>');
      }
    });

    html.push('</body></html>');

    var blob = new Blob([html.join('\n')], { type: 'application/msword' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (programmeName || 'evaluation').replace(/[^a-zA-Z0-9]/g, '_') + '_report_outline.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Progress bar component ──

  function ProgressBar(props) {
    var sections = props.sections;
    var withContent = sections.filter(function (s) { return s.draftContent && s.draftContent.trim().length > 0; }).length;
    var total = sections.length;
    var pct = total > 0 ? Math.round((withContent / total) * 100) : 0;

    return h('div', { className: 'wb-card', style: { padding: '12px 16px', marginBottom: 12 } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
        h('span', { style: { fontSize: 11, fontWeight: 600, color: 'var(--text, #0F172A)' } },
          'Report completeness'),
        h('span', { style: { fontSize: 11, fontWeight: 700, color: withContent === total ? 'var(--green-dark, #065F46)' : 'var(--slate, #64748B)' } },
          withContent + ' of ' + total + ' sections have draft content')
      ),
      h('div', { style: { height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' } },
        h('div', { style: {
          height: '100%', borderRadius: 3,
          width: pct + '%',
          background: withContent === total ? '#059669' : 'var(--teal, #2EC4B6)',
          transition: 'width 0.4s ease'
        } })
      )
    );
  }

  // ── Type badge ──

  function typeBadge(sectionType) {
    var labels = {
      executive_summary: 'Standard',
      introduction: 'Standard',
      methodology: 'Standard',
      finding: 'Finding',
      conclusions: 'Standard',
      recommendations: 'Standard',
      annexes: 'Annex'
    };
    var colors = {
      standard: { bg: '#F1F5F9', text: '#475569' },
      finding: { bg: '#DBEAFE', text: '#1E40AF' },
      annex: { bg: '#F5F3FF', text: '#6D28D9' }
    };
    var type = sectionType === 'finding' ? 'finding' : (sectionType === 'annexes' ? 'annex' : 'standard');
    var label = labels[sectionType] || 'Standard';
    var cc = colors[type];

    return h('span', {
      style: {
        display: 'inline-block', padding: '1px 7px', borderRadius: 3,
        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.04em', background: cc.bg, color: cc.text,
        flexShrink: 0
      }
    }, label);
  }

  // ── Section card component ──

  function SectionCard(props) {
    var sec = props.section;
    var index = props.index;
    var total = props.total;
    var isEditing = props.isEditing;
    var onEdit = props.onEdit;
    var onDone = props.onDone;
    var onUpdate = props.onUpdate;
    var onRemove = props.onRemove;
    var onMove = props.onMove;

    var cc = sec.criterion ? (CRITERION_COLORS[sec.criterion] || { bg: '#F1F5F9', text: '#475569' }) : null;
    var wg = WORD_GUIDANCE[sec.sectionType] || {};
    var hasDraft = sec.draftContent && sec.draftContent.trim().length > 0;

    return h('div', {
      className: 'wb-section-card' + (isEditing ? ' wb-section-card--editing' : '') + (sec.type === 'finding' ? ' wb-section-card--finding' : ''),
      key: sec.id,
      style: {
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px', marginBottom: 6,
        background: isEditing ? '#FAFBFC' : 'var(--surface, #fff)',
        border: '1px solid ' + (isEditing ? 'var(--teal, #2EC4B6)' : 'var(--border, #E2E8F0)'),
        borderLeft: sec.type === 'finding' && cc ? '3px solid ' + cc.text : (sec.type === 'annex' ? '3px solid #6D28D9' : '3px solid var(--border, #E2E8F0)'),
        borderRadius: 6, transition: 'border-color 0.15s'
      }
    },
      // Order controls
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, paddingTop: 2, alignItems: 'center' } },
        h('button', {
          style: { border: 'none', background: 'none', cursor: index > 0 ? 'pointer' : 'default', color: index > 0 ? 'var(--slate, #64748B)' : '#E2E8F0', fontSize: 10, padding: 2, lineHeight: 1 },
          onClick: function () { onMove(sec.id, -1); },
          disabled: index === 0, title: 'Move up'
        }, '\u25B2'),
        h('span', { style: { fontSize: 10, fontWeight: 700, color: 'var(--slate, #64748B)', textAlign: 'center', lineHeight: 1 } }, index + 1),
        h('button', {
          style: { border: 'none', background: 'none', cursor: index < total - 1 ? 'pointer' : 'default', color: index < total - 1 ? 'var(--slate, #64748B)' : '#E2E8F0', fontSize: 10, padding: 2, lineHeight: 1 },
          onClick: function () { onMove(sec.id, 1); },
          disabled: index === total - 1, title: 'Move down'
        }, '\u25BC'),
        // Status dot
        h('div', {
          style: {
            width: 8, height: 8, borderRadius: '50%', marginTop: 4,
            background: hasDraft ? '#059669' : '#CBD5E1'
          },
          title: hasDraft ? 'Has draft content' : 'No draft content yet'
        })
      ),

      // Main content area
      h('div', { style: { flex: 1, minWidth: 0 } },
        // Header: badges + title
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' } },
          typeBadge(sec.sectionType),
          cc ? h('span', { className: 'wb-criterion wb-criterion--' + sec.criterion }, sec.criterion) : null,
          wg.label ? h('span', { style: { fontSize: 9, color: 'var(--slate, #64748B)', fontStyle: 'italic' } }, wg.label) : null
        ),

        // Title
        isEditing
          ? h('input', {
              className: 'wb-input',
              style: { width: '100%', fontWeight: 600, fontSize: 13, marginBottom: 8 },
              value: sec.title,
              onChange: function (e) { onUpdate(sec.id, 'title', e.target.value); },
              autoFocus: true
            })
          : h('div', {
              style: { fontSize: 13, fontWeight: 600, color: 'var(--text, #0F172A)', marginBottom: 6, cursor: 'pointer' },
              onClick: onEdit
            }, sec.title),

        // Auto-populated content preview (read-only)
        sec.autoContent
          ? h('div', {
              style: {
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 4,
                padding: '10px 12px', marginBottom: 8,
                fontSize: 11, color: '#475569', lineHeight: 1.6,
                whiteSpace: 'pre-line', maxHeight: isEditing ? 'none' : 120,
                overflow: isEditing ? 'visible' : 'hidden',
                position: 'relative'
              }
            },
              h('div', { style: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', marginBottom: 4 } }, 'Auto-populated from upstream data'),
              sec.autoContent,
              !isEditing ? h('div', { style: {
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 24,
                background: 'linear-gradient(transparent, #F8FAFC)'
              } }) : null
            )
          : null,

        // Editable draft content area
        isEditing
          ? h('div', { style: { marginTop: 4 } },
              h('label', { style: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--slate, #64748B)', display: 'block', marginBottom: 4 } }, 'Draft content / notes'),
              h('textarea', {
                className: 'wb-input',
                style: { width: '100%', minHeight: 80, resize: 'vertical', fontSize: 12, lineHeight: 1.6 },
                value: sec.draftContent || '',
                onChange: function (e) { onUpdate(sec.id, 'draftContent', e.target.value); },
                placeholder: 'Write your draft content for this section here\u2026'
              })
            )
          : hasDraft
            ? h('div', { style: { fontSize: 11, color: 'var(--text, #0F172A)', lineHeight: 1.5, marginTop: 4, borderTop: '1px solid #E2E8F0', paddingTop: 6 } },
                h('span', { style: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#94A3B8', marginRight: 6 } }, 'Draft'),
                sec.draftContent.length > 200 ? sec.draftContent.substring(0, 200) + '\u2026' : sec.draftContent
              )
            : null,

        // Linked EQs for findings
        sec.type === 'finding' && sec.eqNumber
          ? h('div', { style: { marginTop: 6, display: 'flex', gap: 4, alignItems: 'center' } },
              h('span', { style: { fontSize: 9, color: '#94A3B8' } }, 'Linked:'),
              h('span', { className: 'wb-criterion wb-criterion--' + (sec.criterion || 'relevance') },
                'EQ' + sec.eqNumber)
            )
          : null
      ),

      // Actions column
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 } },
        isEditing
          ? h('button', {
              style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--teal, #2EC4B6)', fontSize: 11, fontWeight: 600, padding: '4px 8px' },
              onClick: onDone
            }, 'Done')
          : h('button', {
              style: { border: 'none', background: 'none', cursor: 'pointer', color: 'var(--slate, #64748B)', fontSize: 11, padding: '4px 6px' },
              onClick: onEdit, title: 'Edit'
            }, '\u270E'),
        h('button', {
          style: { border: 'none', background: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 11, padding: '4px 6px', opacity: 0.5 },
          onClick: function () { onRemove(sec.id); }, title: 'Remove section',
          onMouseEnter: function (e) { e.currentTarget.style.opacity = 1; },
          onMouseLeave: function (e) { e.currentTarget.style.opacity = 0.5; }
        }, '\u2715')
      )
    );
  }

  // ── Station 7 main component ──

  function Station7(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = (state && state.context) || {};
    var meta = context.project_meta || {};
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
      setSections(buildSections(context));
      setGenerated(true);
    }, [context]);

    var updateSection = useCallback(function (id, field, value) {
      setSections(function (prev) {
        return prev.map(function (s) {
          if (s.id !== id) return s;
          var upd = {};
          upd[field] = value;
          return Object.assign({}, s, upd);
        });
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
        return prev.concat([{
          id: uid('sec'), sectionType: 'standard', type: 'standard',
          title: 'New Section', autoContent: '', draftContent: ''
        }]);
      });
    }, []);

    var handleSave = useCallback(function () {
      dispatch({ type: 'SAVE_STATION', stationId: 7, data: { report_structure: { sections: sections, completed_at: new Date().toISOString() } } });
      dispatch({ type: 'SHOW_TOAST', message: 'Report structure saved', toastType: 'success' });
    }, [dispatch, sections]);

    var handleExport = useCallback(function () {
      exportWordOutline(sections, meta.programme_name);
      dispatch({ type: 'SHOW_TOAST', message: 'Word outline exported', toastType: 'success' });
    }, [sections, meta.programme_name, dispatch]);

    // ── Empty state ──
    if (!generated) {
      return h('div', null,
        h('div', { className: 'wb-card wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Report Builder'),
          h('p', { className: 'wb-station-empty-desc' },
            hasMatrix
              ? 'Generate a structured evaluation report outline pre-populated with data from all upstream stations. Your ' + matrix.rows.length + ' evaluation questions will become findings sections with linked indicators, data sources, and judgement criteria.'
              : 'Complete Station 2 (Evaluation Matrix) first to generate an outline from your evaluation questions.'
          ),
          hasMatrix
            ? h('button', { className: 'wb-btn wb-btn-primary', onClick: handleGenerate }, 'Generate Outline')
            : h('button', { className: 'wb-btn wb-btn-primary', onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 2 }); } }, 'Go to Station 2')
        ),
        typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch }) : null
      );
    }

    // ── Generated report builder ──

    var findingsCount = sections.filter(function (s) { return s.type === 'finding'; }).length;
    var standardCount = sections.filter(function (s) { return s.type === 'standard'; }).length;
    var annexCount = sections.filter(function (s) { return s.type === 'annex'; }).length;

    return h('div', null,
      // Progress bar
      h(ProgressBar, { sections: sections }),

      // Header row
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 } },
        h('div', null,
          h('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--text, #0F172A)' } },
            sections.length + ' sections'),
          h('span', { style: { fontSize: 11, color: 'var(--slate, #64748B)', marginLeft: 8 } },
            standardCount + ' standard \u00B7 ' + findingsCount + ' findings \u00B7 ' + annexCount + ' annex')
        ),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap' } },
          h('button', { className: 'wb-btn', style: { fontSize: 11 }, onClick: addSection }, '+ Add Section'),
          h('button', { className: 'wb-btn', style: { fontSize: 11 }, onClick: handleGenerate }, 'Regenerate'),
          h('button', { className: 'wb-btn wb-btn-primary', style: { fontSize: 11 }, onClick: handleExport }, 'Export Outline')
        )
      ),

      // Section cards
      sections.map(function (sec, i) {
        return h(SectionCard, {
          key: sec.id,
          section: sec,
          index: i,
          total: sections.length,
          isEditing: editingId === sec.id,
          onEdit: function () { setEditingId(sec.id); },
          onDone: function () { setEditingId(null); },
          onUpdate: updateSection,
          onRemove: removeSection,
          onMove: moveSection
        });
      }),

      // Save bar
      h('div', { className: 'wb-action-bar', style: { marginTop: 16 } },
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save Report Structure'),
        h('button', { className: 'wb-btn', onClick: handleExport }, 'Export as Word Outline')
      ),

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station7 = Station7;
})();
