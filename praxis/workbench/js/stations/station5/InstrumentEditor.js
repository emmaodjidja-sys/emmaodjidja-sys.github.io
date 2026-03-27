(function() {
  'use strict';
  var h = React.createElement;

  function InstrumentEditor(props) {
    var inst = props.instrument, matrixRows = props.matrixRows || [], tier = props.tier;
    var onChange = props.onChange, onExport = props.onExport, onBack = props.onBack;

    var aq = React.useState(null), activeQId = aq[0], setActiveQId = aq[1];
    var cs = React.useState({}), collapsed = cs[0], setCollapsed = cs[1];

    // Find active question and its section
    var activeQuestion = null, activeSection = null, nextQuestion = null;
    var allQuestions = [];
    (inst.sections || []).forEach(function(sec) {
      (sec.questions || []).forEach(function(q) { allQuestions.push({ q: q, sec: sec }); });
    });
    for (var i = 0; i < allQuestions.length; i++) {
      if (allQuestions[i].q.id === activeQId) {
        activeQuestion = allQuestions[i].q;
        activeSection = allQuestions[i].sec;
        if (i + 1 < allQuestions.length) nextQuestion = allQuestions[i + 1].q;
        break;
      }
    }

    // Auto-select first question if none active (effect must be at top level — no conditional)
    React.useEffect(function() {
      if (!activeQId && allQuestions.length) {
        setActiveQId(allQuestions[0].q.id);
      }
    }, [allQuestions.length]);

    if (!activeQuestion && allQuestions.length) {
      activeQuestion = allQuestions[0].q;
      activeSection = allQuestions[0].sec;
      if (allQuestions.length > 1) nextQuestion = allQuestions[1].q;
    }

    function toggleSection(secId) {
      setCollapsed(function(prev) { var n = Object.assign({}, prev); n[secId] = !n[secId]; return n; });
    }

    function handleQuestionChange(updated) {
      var newSections = inst.sections.map(function(sec) {
        return Object.assign({}, sec, {
          questions: sec.questions.map(function(q) { return q.id === updated.id ? updated : q; })
        });
      });
      onChange(Object.assign({}, inst, { sections: newSections }));
    }

    // Find linked EQ info
    var eqRow = null;
    if (activeSection && activeSection.eqId) {
      eqRow = matrixRows.filter(function(r) { return r.id === activeSection.eqId; })[0];
    }

    // Suggested type for active question
    var suggested = null;
    if (activeQuestion && activeQuestion.linkedIndicatorId && eqRow) {
      var linked = (eqRow.indicators || []).filter(function(ind) { return ind.id === activeQuestion.linkedIndicatorId; })[0];
      if (linked) suggested = InstrumentScaffold.suggestResponseType(linked);
    }

    // Question count
    var qCount = allQuestions.length;

    // LEFT SIDEBAR
    var sidebar = h('div', { style: { width: 240, minWidth: 240, background: '#F8FAFC', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' } },
      h('div', { style: { padding: '14px 12px 10px', borderBottom: '1px solid #E2E8F0' } },
        h('div', { style: { fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 2 } }, inst.name),
        h('div', { style: { fontSize: 11, color: '#6B7280' } }, inst.method + ' \u00b7 ' + inst.targetSample)),
      h('div', { style: { flex: 1, overflowY: 'auto', padding: '6px 0' } },
        (inst.sections || []).map(function(sec) {
          var isCollapsed = collapsed[sec.id];
          return h('div', { key: sec.id },
            h('div', { style: { padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
              onClick: function() { toggleSection(sec.id); } },
              h('span', { style: { fontSize: 10, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.15s', display: 'inline-block' } }, '\u25BC'),
              sec.label),
            !isCollapsed ? (sec.questions || []).map(function(q) {
              var isActive = q.id === (activeQuestion && activeQuestion.id);
              return h('div', { key: q.id, style: { padding: '4px 12px 4px 20px', fontSize: 11, color: isActive ? '#1a365d' : '#4A5568', cursor: 'pointer', borderLeft: isActive ? '3px solid #3182CE' : '3px solid transparent', background: isActive ? '#EBF8FF' : 'transparent', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
                onClick: function() { setActiveQId(q.id); } },
                (q.text || '').slice(0, 40) + (q.text && q.text.length > 40 ? '...' : ''));
            }) : null);
        })),
      // Export bar
      h('div', { style: { padding: 10, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 4, flexWrap: 'wrap' } },
        h('button', { className: 'wb-btn wb-btn-sm', style: { background: '#1a365d', color: '#fff', flex: 1 },
          onClick: function() { onExport('xlsform'); } }, 'XLSForm'),
        h('button', { className: 'wb-btn wb-btn-sm', style: { flex: 1 },
          onClick: function() { onExport('word'); } }, 'Word'),
        h('button', { className: 'wb-btn wb-btn-sm', style: { flex: 1 },
          onClick: function() { onExport('pdf'); } }, 'PDF')));

    // RIGHT PANEL
    var eqBanner = eqRow ? h('div', { style: { background: '#EBF8FF', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12 } },
      h('strong', { style: { color: '#2B6CB0' } }, 'EQ: '), eqRow.question || eqRow.text || '',
      eqRow.indicators && eqRow.indicators.length ? h('span', { style: { color: '#718096', marginLeft: 8 } }, '\u2192 ' + eqRow.indicators.length + ' indicator(s)') : null) : null;

    var rightPanel = h('div', { style: { flex: 1, padding: '16px 20px', overflowY: 'auto' } },
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost', onClick: onBack, style: { marginBottom: 12 } }, '\u2190 Back to instruments'),
      eqBanner,
      activeQuestion ? h('div', null,
        h('div', { style: { marginBottom: 8 } },
          h('label', { style: { fontSize: 12, fontWeight: 600, color: '#374151' } }, 'Question text'),
          h('textarea', { value: activeQuestion.text, rows: 2, style: { width: '100%', fontSize: 13, padding: '6px 8px', border: '1px solid #CBD5E0', borderRadius: 4, resize: 'vertical', marginTop: 4 },
            onChange: function(e) { handleQuestionChange(Object.assign({}, activeQuestion, { text: e.target.value })); } })),
        h(QuestionConfigurator, { question: activeQuestion, suggestedType: suggested, tier: tier, onChange: handleQuestionChange })) : null,
      nextQuestion ? h('div', { style: { marginTop: 16, padding: '8px 12px', background: '#F7FAFC', borderRadius: 6, fontSize: 12, color: '#718096' } },
        h('strong', null, 'Next: '), (nextQuestion.text || '').slice(0, 60) + '...') : null);

    return h('div', { style: { display: 'flex', height: 'calc(100vh - 200px)', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' } },
      sidebar, rightPanel);
  }

  window.InstrumentEditor = InstrumentEditor;
})();
