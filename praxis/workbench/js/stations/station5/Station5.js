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

    function saveInstruments(items) {
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
      saveInstruments(next);
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
    var badges = h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 } },
      matrixRows.length ? h('span', { style: { fontSize: 11, padding: '2px 8px', background: '#EBF8FF', color: '#2B6CB0', borderRadius: 10 } }, 'Matrix: ' + matrixRows.length + ' EQs') : null,
      h('span', { style: { fontSize: 11, padding: '2px 8px', background: '#F0FFF4', color: '#276749', borderRadius: 10 } }, 'Design: ' + designMethod),
      sampleInfo ? h('span', { style: { fontSize: 11, padding: '2px 8px', background: '#FEFCBF', color: '#744210', borderRadius: 10 } }, 'Sample: ' + sampleInfo) : null);

    // EMPTY STATE
    if (!localInst.length) {
      return h('div', null, badges,
        matrixRows.length ? h('div', { style: { textAlign: 'center', padding: '48px 24px' } },
          h('div', { style: { fontSize: 40, marginBottom: 12 } }, '\uD83D\uDCDD'),
          h('h3', { style: { fontSize: 16, fontWeight: 600, marginBottom: 6 } }, 'Generate Data Collection Instruments'),
          h('p', { style: { fontSize: 13, color: 'var(--slate)', maxWidth: 420, margin: '0 auto 20px' } },
            'Scaffold survey, KII, and FGD instruments from your evaluation matrix with auto-suggested response types.'),
          h('button', { className: 'wb-btn wb-btn-teal', onClick: generate }, 'Generate Instruments'))
        : h('div', { style: { textAlign: 'center', padding: '48px 24px' } },
          h('h3', { style: { fontSize: 16, fontWeight: 600, marginBottom: 6 } }, 'Complete Station 2 first'),
          h('p', { style: { fontSize: 13, color: 'var(--slate)' } }, 'Instruments require an evaluation matrix.'),
          h('button', { className: 'wb-btn wb-btn-primary', style: { marginTop: 12 },
            onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: 2 }); } }, 'Go to Station 2')));
    }

    // INSTRUMENT CARDS
    var cards = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 20 } },
      localInst.map(function(inst) {
        var qCount = (inst.sections || []).reduce(function(s, sec) { return s + (sec.questions || []).length; }, 0);
        var secCount = (inst.sections || []).length;
        var eqIds = {}; (inst.sections || []).forEach(function(sec) { if (sec.eqId) eqIds[sec.eqId] = true; });
        return h('div', { key: inst.id, className: 'wb-card', style: { padding: 16, cursor: 'pointer', transition: 'box-shadow 0.15s' },
          onClick: function() { setEditingId(inst.id); } },
          h('div', { style: { fontSize: 14, fontWeight: 600, color: '#1F2937', marginBottom: 4 } }, inst.name),
          h('div', { style: { fontSize: 12, color: '#6B7280', marginBottom: 8 } }, inst.method),
          h('div', { style: { display: 'flex', gap: 8, fontSize: 11, color: '#4A5568' } },
            h('span', null, qCount + ' questions'), h('span', null, secCount + ' sections')),
          h('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 } },
            Object.keys(eqIds).map(function(eqId) { return h('span', { key: eqId, style: { fontSize: 10, padding: '1px 6px', background: '#E6FFFA', color: '#234E52', borderRadius: 8 } }, eqId); })));
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
      h('h4', { style: { fontSize: 14, fontWeight: 600, marginBottom: 8 } }, 'EQ Coverage Matrix'),
      uncoveredCount > 0 ? h('div', { style: { fontSize: 12, color: '#92400E', background: '#FFFBEB', padding: '6px 10px', borderRadius: 6, marginBottom: 8 } },
        uncoveredCount + ' evaluation question(s) not covered by any instrument') : null,
      h('div', { style: { overflowX: 'auto' } },
        h('table', { style: { width: '100%', fontSize: 12, borderCollapse: 'collapse' } },
          h('thead', null, h('tr', null,
            h('th', { style: { textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #E2E8F0', fontSize: 11, color: '#6B7280' } }, 'EQ'),
            localInst.map(function(inst) { return h('th', { key: inst.id, style: { textAlign: 'center', padding: '6px 8px', borderBottom: '2px solid #E2E8F0', fontSize: 11, color: '#6B7280' } }, inst.type.toUpperCase()); }))),
          h('tbody', null, eqCoverage.map(function(ec) {
            var noCoverage = Object.keys(ec.covered).length === 0;
            return h('tr', { key: ec.row.id, style: { background: noCoverage ? '#FFFBEB' : 'transparent' } },
              h('td', { style: { padding: '5px 8px', borderBottom: '1px solid #E2E8F0', color: noCoverage ? '#92400E' : '#374151', fontWeight: noCoverage ? 600 : 400 } },
                (ec.row.question || ec.row.text || ec.row.id || '').slice(0, 50)),
              localInst.map(function(inst) {
                return h('td', { key: inst.id, style: { textAlign: 'center', padding: '5px 8px', borderBottom: '1px solid #E2E8F0' } },
                  ec.covered[inst.id] ? h('span', { style: { color: '#319795', fontWeight: 700 } }, '\u2713') : '\u2014');
              }));
          }))))) : null;

    // SKIP LOGIC BOUNDARY
    var skipLogic = h('div', { className: 'wb-card', style: { padding: 16, marginBottom: 16 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
        h('h4', { style: { fontSize: 14, fontWeight: 600, margin: 0 } }, 'Skip Logic & Branching'),
        h('span', { style: { fontSize: 10, padding: '2px 8px', background: '#EDF2F7', color: '#4A5568', borderRadius: 10, fontWeight: 600 } }, 'Handled in KoboToolbox')),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 } },
        h('div', { style: { background: '#F0FFF4', padding: 10, borderRadius: 6 } },
          h('strong', { style: { color: '#276749' } }, 'What we do here'),
          h('ul', { style: { margin: '4px 0 0', paddingLeft: 16, color: '#2D3748' } },
            h('li', null, 'Structure questions in logical sections'),
            h('li', null, 'Set required/optional flags'),
            h('li', null, 'Define response types and constraints'))),
        h('div', { style: { background: '#EBF8FF', padding: 10, borderRadius: 6 } },
          h('strong', { style: { color: '#2B6CB0' } }, 'What KoboToolbox does'),
          h('ul', { style: { margin: '4px 0 0', paddingLeft: 16, color: '#2D3748' } },
            h('li', null, 'Skip logic (relevant column)'),
            h('li', null, 'Cascading selects'),
            h('li', null, 'Validation constraints & calculations')))),
      h('div', { style: { fontSize: 11, color: '#718096', marginTop: 8 } }, 'The exported XLSForm includes empty relevant and constraint columns, ready for skip logic configuration in KoboToolbox.'));

    return h('div', null, badges, cards, coverageTable, skipLogic);
  }

  window.Station5 = Station5;
})();
