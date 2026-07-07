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

  function uid(prefix) {
    if (typeof PraxisUtils !== 'undefined' && PraxisUtils.uid) return PraxisUtils.uid(prefix);
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  }

  // ── Word count guidance ──

  var WORD_GUIDANCE = {
    executive_summary: { min: 500,  max: 800,  label: '500-800 words' },
    introduction:      { min: 800,  max: 1200, label: '800-1,200 words' },
    methodology:       { min: 1500, max: 2500, label: '1,500-2,500 words' },
    finding:           { min: 1000, max: 2000, label: '1,000-2,000 words' },
    conclusions:       { min: 800,  max: 1500, label: '800-1,500 words' },
    recommendations:   { min: 600,  max: 1200, label: '600-1,200 words' },
    annexes:           { min: 0,    max: 0,    label: 'Variable' }
  };

  // ── Safe accessors ──

  function safe(v, fallback) { return v != null && v !== '' ? v : (fallback || '-'); }
  function list(arr) { return Array.isArray(arr) && arr.length > 0 ? arr.join(', ') : '-'; }
  function purposeLabel(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return '-';
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
        'Country and scope: ' + safe(meta.country) + ', ' + safe(tor.geographic_scope),
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
        'Qualitative methods: ' + (qualBreakdown || '-'),
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
        title: 'Findings: EQ' + (eq.number || i + 1) + '. ' + eqText,
        criterion: criterion,
        eqId: eq.id,
        eqNumber: eq.number || i + 1,
        autoContent: [
          'Question: ' + eqText,
          'Criterion: ' + criterion,
          subQs ? 'Sub-questions:\n' + subQs : null,
          'Indicators: ' + (indicators || '-'),
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
        '  • ' + (rows.map(function (r) { return r.criterion; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ') || 'N/A'),
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
        '  • Be linked to specific finding(s) and conclusion(s)',
        '  • Identify the responsible actor/stakeholder',
        '  • Be prioritised by urgency (immediate / short-term / medium-term)',
        '  • Be specific and actionable',
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
    var esc = window.PraxisExportUtils.escHtml;
    var title = (programmeName || 'Evaluation') + ': Draft Evaluation Report Outline';
    var html = [
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
      '<head><meta charset="utf-8"><title>' + esc(title) + '</title>',
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
      '<h1>' + esc(programmeName || 'Evaluation Programme') + '</h1>',
      '<p>Draft Evaluation Report Outline</p>',
      '<p style="font-size:11pt;color:#94A3B8;">Generated by PRAXIS Workbench</p>',
      '</div>'
    ];

    sections.forEach(function (sec, i) {
      var wg = WORD_GUIDANCE[sec.sectionType] || WORD_GUIDANCE.finding || {};
      html.push('<h1>' + (i + 1) + '. ' + esc(sec.title) + '</h1>');
      if (wg.label) {
        html.push('<p class="word-count">[Suggested length: ' + esc(wg.label) + ']</p>');
      }
      if (sec.autoContent) {
        var acText = Array.isArray(sec.autoContent) ? sec.autoContent.join('\n') : String(sec.autoContent);
        html.push('<div class="auto-content">' + esc(acText) + '</div>');
      }
      if (sec.draftContent) {
        html.push('<div class="draft-content">' + esc(sec.draftContent) + '</div>');
      }
    });

    html.push('</body></html>');

    var blob = new Blob([html.join('\n')], { type: 'application/msword' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = window.PraxisExportUtils.exportFilename(programmeName, 'report-outline', 'doc');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Progress bar component ──

  function ProgressBar(props) {
    var sections = props.sections;
    // A section is "auto-drafted" once it carries content pulled from upstream
    // stations (autoContent) or hand-written notes (draftContent); it is
    // "finalized" only once an evaluator has written draft content. Counting
    // auto-drafted sections toward the meter keeps it honest: with the worked
    // examples every section arrives auto-populated, so the report is fully
    // drafted even though none has been finalized yet.
    function hasAuto(s) {
      if (!s.autoContent) return false;
      return Array.isArray(s.autoContent)
        ? s.autoContent.length > 0
        : String(s.autoContent).trim().length > 0;
    }
    function hasDraft(s) { return s.draftContent && s.draftContent.trim().length > 0; }
    var drafted = sections.filter(function (s) { return hasAuto(s) || hasDraft(s); }).length;
    var finalized = sections.filter(hasDraft).length;
    var total = sections.length;
    var pct = total > 0 ? Math.round((drafted / total) * 100) : 0;
    var complete = finalized === total && total > 0;

    return h('div', { className: 'wb-report-progress' },
      h('div', { className: 'wb-report-progress-header' },
        h('span', { className: 'wb-report-progress-label' }, 'Report completeness'),
        h('span', {
          className: 'wb-report-progress-count' + (complete ? ' wb-report-progress-count--complete' : '')
        }, drafted + ' of ' + total + ' sections auto-drafted, ' + finalized + ' finalized')
      ),
      h('div', {
        className: 'wb-progress-bar',
        role: 'progressbar',
        'aria-valuenow': pct,
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-label': 'Report completeness'
      },
        h('div', {
          className: 'wb-progress-bar-fill' + (complete ? ' wb-progress-bar-fill--high' : ''),
          style: { width: pct + '%' }
        })
      )
    );
  }

  // ── Type badge ──

  function TypeBadge(props) {
    var labels = {
      executive_summary: 'Standard',
      introduction: 'Standard',
      methodology: 'Standard',
      finding: 'Finding',
      conclusions: 'Standard',
      recommendations: 'Standard',
      annexes: 'Annex'
    };
    var sectionType = props.sectionType;
    var variant = sectionType === 'finding' ? 'finding' : (sectionType === 'annexes' ? 'annex' : 'standard');
    var label = labels[sectionType] || 'Standard';
    return h('span', { className: 'wb-section-type wb-section-type--' + variant }, label);
  }

  // ── Section card component ──

  function ReportSectionCard(props) {
    var sec = props.section;
    var index = props.index;
    var total = props.total;
    var isEditing = props.isEditing;
    var onEdit = props.onEdit;
    var onDone = props.onDone;
    var onUpdate = props.onUpdate;
    var onRemove = props.onRemove;
    var onMove = props.onMove;

    var wg = WORD_GUIDANCE[sec.sectionType] || {};
    var hasDraft = sec.draftContent && sec.draftContent.trim().length > 0;

    var cardCls = 'wb-section-card';
    if (isEditing) cardCls += ' wb-section-card--editing';
    if (sec.type === 'finding') cardCls += ' wb-section-card--finding';
    if (sec.type === 'annex') cardCls += ' wb-section-card--annex';
    if (sec.criterion) cardCls += ' wb-section-card--' + sec.criterion;

    var statusDotCls = 'wb-status-dot ' + (hasDraft ? 'wb-status-dot--complete' : 'wb-status-dot--draft');

    return h('div', { className: cardCls, key: sec.id },
      // Reorder + status column
      h('div', { className: 'wb-reorder-col' },
        h('button', {
          className: 'wb-reorder-btn',
          onClick: function () { onMove(sec.id, -1); },
          disabled: index === 0,
          title: 'Move up',
          'aria-label': 'Move section up'
        }, PraxisIcons.chevronUp(14)),
        h('span', { className: 'wb-reorder-index' }, index + 1),
        h('button', {
          className: 'wb-reorder-btn',
          onClick: function () { onMove(sec.id, 1); },
          disabled: index === total - 1,
          title: 'Move down',
          'aria-label': 'Move section down'
        }, PraxisIcons.chevronDown(14)),
        h('span', {
          className: statusDotCls,
          title: hasDraft ? 'Has draft content' : 'No draft content yet',
          'aria-label': hasDraft ? 'complete status' : 'draft status'
        })
      ),

      // Main content area
      h('div', { className: 'wb-section-card-main' },
        h('div', { className: 'wb-section-card-meta' },
          h(TypeBadge, { sectionType: sec.sectionType }),
          sec.criterion
            ? h('span', { className: 'wb-criterion wb-criterion--' + sec.criterion }, sec.criterion)
            : null,
          wg.label
            ? h('span', { className: 'wb-section-card-word-guide' }, wg.label)
            : null
        ),

        // Title (display vs edit)
        isEditing
          ? h('input', {
              className: 'wb-input wb-section-card-title-input',
              value: sec.title,
              onChange: function (e) { onUpdate(sec.id, 'title', e.target.value); },
              autoFocus: true
            })
          : h('div', {
              className: 'wb-section-card-title',
              onClick: onEdit
            }, sec.title),

        // Auto-content preview
        sec.autoContent
          ? h('div', {
              className: 'wb-auto-content' + (isEditing ? ' wb-auto-content--expanded' : '')
            },
              h('div', { className: 'wb-auto-content-overline' }, 'Auto-populated from upstream data'),
              sec.autoContent,
              !isEditing ? h('div', { className: 'wb-auto-content-fade' }) : null
            )
          : null,

        // Draft editor or preview
        isEditing
          ? h('div', { className: 'wb-draft-editor' },
              h('label', { className: 'wb-draft-editor-label' }, 'Draft content / notes'),
              h('textarea', {
                className: 'wb-input wb-textarea wb-draft-textarea',
                value: sec.draftContent || '',
                onChange: function (e) { onUpdate(sec.id, 'draftContent', e.target.value); },
                placeholder: 'Write your draft content for this section here…'
              })
            )
          : hasDraft
            ? h('div', { className: 'wb-draft-preview' },
                h('span', { className: 'wb-draft-preview-overline' }, 'Draft'),
                sec.draftContent.length > 200 ? sec.draftContent.substring(0, 200) + '…' : sec.draftContent
              )
            : null,

        // Linked EQ for findings
        sec.type === 'finding' && sec.eqNumber
          ? h('div', { className: 'wb-section-card-linked' },
              h('span', { className: 'wb-section-card-linked-label' }, 'Linked:'),
              h('span', { className: 'wb-criterion wb-criterion--' + (sec.criterion || 'relevance') },
                'EQ' + sec.eqNumber)
            )
          : null
      ),

      // Actions column
      h('div', { className: 'wb-section-card-actions' },
        isEditing
          ? h('button', {
              className: 'wb-icon-action-btn wb-icon-action-btn--primary',
              onClick: onDone
            }, 'Done')
          : h('button', {
              className: 'wb-icon-action-btn',
              onClick: onEdit,
              title: 'Edit',
              'aria-label': 'Edit section'
            }, PraxisIcons.edit(14)),
        h('button', {
          className: 'wb-icon-action-btn wb-icon-action-btn--danger',
          onClick: function () { onRemove(sec.id); },
          title: 'Remove section',
          'aria-label': 'Remove section'
        }, PraxisIcons.close(14))
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
        h(SectionCard, { title: 'Report Structure', bodyType: 'empty' },
          h('div', { className: 'wb-station-empty' },
            h('div', { className: 'wb-station-empty-title' }, 'Report Builder'),
            h('p', { className: 'wb-station-empty-desc' },
              hasMatrix
                ? 'Generate a structured evaluation report outline pre-populated with data from all upstream stations. Your ' + matrix.rows.length + ' evaluation questions will become findings sections with linked indicators, data sources, and judgement criteria.'
                : 'Complete Station 2 (Evaluation Matrix) first to generate an outline from your evaluation questions.'
            ),
            hasMatrix
              ? h('button', { className: 'wb-btn wb-btn-primary', onClick: handleGenerate }, 'Generate Outline')
              : h('button', { className: 'wb-btn wb-btn-primary', onClick: function () { dispatch({ type: 'SET_ACTIVE_STATION', station: 2 }); } }, 'Go to Station 2')
          )
        ),
        typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch }) : null
      );
    }

    // ── Generated report builder ──

    var findingsCount = sections.filter(function (s) { return s.type === 'finding'; }).length;
    var standardCount = sections.filter(function (s) { return s.type === 'standard'; }).length;
    var annexCount = sections.filter(function (s) { return s.type === 'annex'; }).length;

    return h('div', null,
      h(SectionCard, {
        title: 'Report Structure',
        badge: sections.length + ' sections'
      },
        h(ProgressBar, { sections: sections }),

        h('div', { className: 'wb-report-header-row' },
          h('div', { className: 'wb-report-header-stats' },
            h('span', { className: 'wb-report-header-stats-primary' },
              sections.length + ' sections'),
            h('span', { className: 'wb-report-header-stats-meta' },
              standardCount + ' standard · ' + findingsCount + ' findings · ' + annexCount + ' annex')
          ),
          h('div', { className: 'wb-report-header-actions' },
            h('button', { className: 'wb-btn wb-btn-sm', onClick: addSection }, '+ Add Section'),
            h('button', { className: 'wb-btn wb-btn-sm', onClick: handleGenerate }, 'Regenerate'),
            h('button', { className: 'wb-btn wb-btn-primary wb-btn-sm', onClick: handleExport }, 'Export Outline')
          )
        ),

        sections.map(function (sec, i) {
          return h(ReportSectionCard, {
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
        })
      ),

      // Save bar
      h('div', { className: 'wb-action-bar' },
        h('button', { className: 'wb-btn wb-btn-teal', onClick: handleSave }, 'Save Report Structure'),
        h('button', { className: 'wb-btn', onClick: handleExport }, 'Export as Word Outline')
      ),

      // Navigation
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 7, dispatch: dispatch, onSave: handleSave }) : null
    );
  }

  window.Station7 = Station7;
})();
