(function() {
  'use strict';
  var h = React.createElement;

  function Station2(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context, tier = state.ui.experienceTier || 'foundation';
    var meta = context.project_meta || {}, toc = context.toc || {}, em = context.evaluation_matrix || {};

    var rs = React.useState(function() { return (em.rows || []).slice(); }), rows = rs[0], setRows = rs[1];
    var ss = React.useState(null), selectedId = ss[0], setSelectedId = ss[1];
    var fs = React.useState(null), criterionFilter = fs[0], setCriterionFilter = fs[1];
    var ms = React.useState(false), showAddModal = ms[0], setShowAddModal = ms[1];
    var is = React.useState(null), indBankEqId = is[0], setIndBankEqId = is[1];
    var es = React.useState(false), showExport = es[0], setShowExport = es[1];

    // Upstream gate
    if (!meta.programme_name) {
      return h('div', { className: 'wb-station-empty' },
        h('div', { className: 'wb-station-empty-title' }, 'Complete Station 0 first'),
        h('div', { className: 'wb-station-empty-desc' },
          'The Evaluation Matrix requires programme details and evaluability assessment from Station 0.'),
        h('button', { className: 'wb-btn wb-btn-primary',
          onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: 0 }); } }, 'Go to Station 0'));
    }

    function generate() {
      var matrixToc = MatrixGenerator.praxisTocToMatrixToc(toc);
      var matrixCtx = MatrixGenerator.praxisContextToMatrixContext(context);
      setRows(MatrixGenerator.generateMatrix(matrixToc, matrixCtx));
    }

    function saveStation() {
      var mc = MatrixGenerator.praxisContextToMatrixContext(context);
      var mt = MatrixGenerator.praxisTocToMatrixToc(toc);
      dispatch({ type: PraxisContext.ACTION_TYPES.SAVE_STATION, stationId: 2,
        payload: { evaluation_matrix: { context: mc, toc_summary: mt, rows: rows, completed_at: new Date().toISOString() } } });
      dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Evaluation matrix saved', toastType: 'success' });
    }

    function handleExport(fmt) {
      var mc = MatrixGenerator.praxisContextToMatrixContext(context);
      if (fmt === 'word') MatrixExport.exportAsWord(rows, mc);
      else if (fmt === 'excel') MatrixExport.exportAsExcel(rows, mc);
      else MatrixExport.exportAsJSON(rows, mc);
      setShowExport(false);
    }

    function addIndicator(indicator) {
      if (!indBankEqId) return;
      setRows(function(prev) {
        return prev.map(function(r) {
          if (r.id !== indBankEqId) return r;
          if ((r.indicators || []).some(function(i) { return i.id === indicator.id; })) return r;
          return Object.assign({}, r, { indicators: (r.indicators || []).concat([indicator]) });
        });
      });
    }

    // Empty state
    if (rows.length === 0) {
      return h('div', { className: 'wb-station-empty' },
        h('div', { className: 'wb-station-empty-title' }, 'Build Your Evaluation Matrix'),
        h('div', { className: 'wb-station-empty-desc' },
          'Generate evaluation questions matched to your Theory of Change and DAC criteria, with auto-linked indicators from the PRAXIS indicator bank.'),
        h('button', { className: 'wb-btn wb-btn-primary', onClick: generate }, 'Generate Matrix'));
    }

    var indCount = rows.reduce(function(s, r) { return s + (r.indicators || []).length; }, 0);
    var critSet = {}; rows.forEach(function(r) { critSet[r.criterion] = true; });
    var selRow = selectedId ? rows.filter(function(r) { return r.id === selectedId; })[0] : null;

    return h('div', null,
      h('div', { className: 'wb-toolbar' },
        h('span', { className: 'wb-field-helper', style: { margin: 0 } },
          rows.length + ' EQs \u00b7 ' + indCount + ' indicators \u00b7 ' + Object.keys(critSet).length + ' criteria'),
        h('div', { className: 'wb-toolbar-spacer' }),
        h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', onClick: saveStation }, 'Save Matrix')),
      h(MatrixTable, { rows: rows, selectedId: selectedId, criterionFilter: criterionFilter,
        onSelect: function(id) { setSelectedId(selectedId === id ? null : id); }, onFilterChange: setCriterionFilter,
        onAdd: function() { setShowAddModal(true); }, onExport: function() { setShowExport(!showExport); } }),
      showExport ? h('div', { style: { position: 'relative' } },
        h('div', { className: 'wb-export-menu' },
          ['word', 'excel', 'json'].map(function(f) {
            var labels = { word: 'Export as Word', excel: 'Export as Excel', json: 'Export as .praxis' };
            return h('button', { key: f, className: 'wb-btn wb-btn-sm wb-btn-ghost wb-export-menu-item',
              onClick: function() { handleExport(f); } }, labels[f]);
          }))) : null,
      selRow ? h(MatrixInlineEditor, { key: selectedId, row: selRow, tier: tier,
        onSave: function(u) { setRows(function(p) { return p.map(function(r) { return r.id === u.id ? u : r; }); }); setSelectedId(null); },
        onCancel: function() { setSelectedId(null); },
        onOpenIndicatorBank: function(eqId) { setIndBankEqId(eqId); } }) : null,
      showAddModal ? h(AddEQModal, { toc: toc, context: context, existingRows: rows,
        onAdd: function(nr) { setRows(function(p) { return p.concat(nr); }); setShowAddModal(false); },
        onClose: function() { setShowAddModal(false); } }) : null,
      indBankEqId ? h(IndicatorSelector, { eqId: indBankEqId, context: context,
        currentIndicators: (function() { var bankRow = indBankEqId ? rows.filter(function(r) { return r.id === indBankEqId; })[0] : null; return bankRow ? bankRow.indicators : []; })(),
        onAdd: addIndicator, onClose: function() { setIndBankEqId(null); } }) : null,
      typeof StationNav !== 'undefined' ? h(StationNav, { stationId: 2, dispatch: dispatch, onSave: saveStation }) : null);
  }

  window.Station2 = Station2;
})();
