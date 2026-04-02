(function() {
  'use strict';
  var h = React.createElement;

  function Station5(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context, tier = state.ui.experienceTier || 'foundation';
    var em = context.evaluation_matrix || {}, matrixRows = em.rows || [];
    var instData = context.instruments || {}, instruments = instData.items || [];

    var es = React.useState(null), editingId = es[0], setEditingId = es[1];
    var ls = React.useState(instruments), localInst = ls[0], setLocalInst = ls[1];

    // Sync from context when instruments change externally
    React.useEffect(function() { setLocalInst(instruments); }, [instruments.length]);

    function generate() {
      var sample = context.sampling || {};
      var scaffolded = InstrumentScaffold.scaffoldInstruments(matrixRows, sample);
      setLocalInst(scaffolded);
      saveInstruments(scaffolded);
    }

    // Debounced auto-save — persists silently without toasting on every keystroke
    var saveTimerRef = React.useRef(null);
    function saveInstrumentsSilent(items) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(function() {
        dispatch({ type: PraxisContext.ACTION_TYPES.SAVE_STATION, stationId: 5,
          payload: { instruments: { items: items, completed_at: new Date().toISOString() } } });
      }, 800);
    }

    // Explicit save with toast — called by save button
    function saveInstrumentsExplicit(items) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      dispatch({ type: PraxisContext.ACTION_TYPES.SAVE_STATION, stationId: 5,
        payload: { instruments: { items: items, completed_at: new Date().toISOString() } } });
      dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Instruments saved', toastType: 'success' });
    }

    function handleExport(format) {
      var inst = localInst.filter(function(i) { return i.id === editingId; })[0];
      if (!inst) return;
      if (format === 'xlsform') InstrumentExport.exportAsXLSForm(inst);
      else if (format === 'word') InstrumentExport.exportAsWord(inst);
      else if (format === 'pdf') InstrumentExport.exportAsPDF(inst);
    }

    function handleInstChange(updated) {
      var next = localInst.map(function(i) { return i.id === updated.id ? updated : i; });
      setLocalInst(next);
      saveInstrumentsSilent(next);
    }

    // EDITING MODE
    if (editingId) {
      var editInst = localInst.filter(function(i) { return i.id === editingId; })[0];
      if (!editInst) { setEditingId(null); return null; }
      return h(InstrumentEditor, { instrument: editInst, matrixRows: matrixRows, tier: tier,
        onChange: handleInstChange, onExport: handleExport,
        onBack: function() { setEditingId(null); } });
    }

    // Upstream badges
    var designMethod = (context.design || {}).method || 'contribution analysis';
    var sampleInfo = context.sampling && context.sampling.result ? context.sampling.result.totalSample + ' respondents' : '';
    var badges = h('div', { className: 'wb-context-badges' },
      matrixRows.length ? h('span', { className: 'wb-context-badge' }, 'Matrix: ' + matrixRows.length + ' EQs') : null,
      h('span', { className: 'wb-context-badge' }, 'Design: ' + designMethod),
      sampleInfo ? h('span', { className: 'wb-context-badge' }, 'Sample: ' + sampleInfo) : null);

    // EMPTY STATE
    if (!localInst.length) {
      return h('div', null, badges,
        matrixRows.length ? h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Generate Data Collection Instruments'),
          h('div', { className: 'wb-station-empty-desc' },
            'Scaffold survey, KII, and FGD instruments from your ' + matrixRows.length + ' evaluation questions with auto-suggested response types.'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: generate }, 'Generate Instruments'))
        : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Complete Station 2 first'),
          h('div', { className: 'wb-station-empty-desc' }, 'Instruments require an evaluation matrix.'),
          h('button', { className: 'wb-btn wb-btn-primary',
            onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: 2 }); } }, 'Go to Station 2')));
    }

    // INSTRUMENT CARDS
    var cards = h('div', { className: 'wb-param-grid', style: { marginBottom: 20 } },
      localInst.map(function(inst) {
        var qCount = (inst.sections || []).reduce(function(s, sec) { return s + (sec.questions || []).length; }, 0);
        var secCount = (inst.sections || []).length;
        var eqIds = {}; (inst.sections || []).forEach(function(sec) { if (sec.eqId) eqIds[sec.eqId] = true; });
        return h('div', { key: inst.id, className: 'wb-card wb-card--interactive',
          onClick: function() { setEditingId(inst.id); } },
          h('div', { className: 'wb-action-card-title' }, inst.name),
          h('div', { className: 'wb-action-card-desc', style: { marginBottom: 8 } }, inst.method),
          h('div', { className: 'wb-context-badges' },
            h('span', { className: 'wb-context-badge' }, qCount + ' questions'),
            h('span', { className: 'wb-context-badge' }, secCount + ' sections')),
          Object.keys(eqIds).length > 0 ? h('div', { className: 'wb-context-badges', style: { marginTop: 6 } },
            Object.keys(eqIds).map(function(eqId) { return h('span', { key: eqId, className: 'wb-badge wb-badge-teal' }, eqId); })) : null);
      }));

    // COVERAGE MATRIX
    var eqCoverage = matrixRows.map(function(row) {
      var covered = {};
      localInst.forEach(function(inst) {
        (inst.sections || []).forEach(function(sec) { if (sec.eqId === row.id) covered[inst.id] = true; });
      });
      return { row: row, covered: covered };
    });
    var uncoveredCount = eqCoverage.filter(function(ec) { return Object.keys(ec.covered).length === 0; }).length;

    var coverageTable = matrixRows.length ? h('div', { style: { marginBottom: 20 } },
      h('h4', { className: 'wb-field-label', style: { marginBottom: 8 } }, 'EQ Coverage Matrix'),
      uncoveredCount > 0 ? h('div', { className: 'wb-guidance', style: { background: 'var(--amber-light)', borderColor: 'var(--amber)' } },
        h('span', { className: 'wb-guidance-text', style: { color: '#92400E' } },
          uncoveredCount + ' evaluation question(s) not covered by any instrument')) : null,
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Evaluation Question'),
            localInst.map(function(inst) { return h('th', { key: inst.id, style: { textAlign: 'center' } }, (inst.type || 'survey').toUpperCase()); }))),
          h('tbody', null, eqCoverage.map(function(ec) {
            var noCoverage = Object.keys(ec.covered).length === 0;
            return h('tr', { key: ec.row.id, className: noCoverage ? 'wb-coverage-gap' : '' },
              h('td', { style: { fontWeight: noCoverage ? 600 : 400, color: noCoverage ? '#92400E' : 'var(--text)' } },
                (ec.row.question || ec.row.text || ec.row.id || '').slice(0, 60)),
              localInst.map(function(inst) {
                return h('td', { key: inst.id, style: { textAlign: 'center' } },
                  ec.covered[inst.id] ? h('span', { style: { color: 'var(--teal)', fontWeight: 700 } }, '\u2713') : '\u2014');
              }));
          }))))) : null;

    // SKIP LOGIC BOUNDARY
    var skipLogic = h('div', { className: 'wb-card', style: { marginBottom: 16 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
        h('span', { className: 'wb-field-label', style: { margin: 0 } }, 'Skip Logic & Branching'),
        h('span', { className: 'wb-badge', style: { background: 'var(--bg)', color: 'var(--slate)' } }, 'Handled in KoboToolbox')),
      h('div', { className: 'wb-form-grid', style: { marginBottom: 8, fontSize: 12 } },
        h('div', { style: { background: 'var(--green-light)', padding: 12, borderRadius: 'var(--radius-sm)' } },
          h('strong', { style: { color: '#065F46', fontSize: 11 } }, 'What this builder does'),
          h('ul', { style: { margin: '6px 0 0', paddingLeft: 16, color: 'var(--text)' } },
            h('li', null, 'Structure questions in logical sections'),
            h('li', null, 'Set required/optional flags'),
            h('li', null, 'Define response types and constraints'))),
        h('div', { style: { background: 'var(--blue-light)', padding: 12, borderRadius: 'var(--radius-sm)' } },
          h('strong', { style: { color: '#1E40AF', fontSize: 11 } }, 'Configure in KoboToolbox'),
          h('ul', { style: { margin: '6px 0 0', paddingLeft: 16, color: 'var(--text)' } },
            h('li', null, 'Skip logic (relevant column)'),
            h('li', null, 'Cascading selects'),
            h('li', null, 'Validation constraints & calculations')))),
      h('p', { className: 'wb-field-helper' }, 'The exported XLSForm includes empty relevant and constraint columns, ready for skip logic configuration in KoboToolbox.'));

    return h('div', null, badges, cards, coverageTable, skipLogic,
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 5, dispatch: dispatch }) : null);
  }

  window.Station5 = Station5;
})();
