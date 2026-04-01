(function() {
  'use strict';
  var h = React.createElement;
  var BANK = (typeof window !== 'undefined' && window.PRAXIS_INDICATOR_BANK) || {};
  var OECD_DAC = BANK.OECD_DAC || {};
  var DAC_KEYS = Object.keys(OECD_DAC);

  function MatrixTable(props) {
    var rows = props.rows || [];
    var selectedId = props.selectedId;
    var filter = props.criterionFilter;

    // Count per criterion
    var counts = {};
    DAC_KEYS.forEach(function(k) { counts[k] = 0; });
    rows.forEach(function(r) { if (counts[r.criterion] !== undefined) counts[r.criterion]++; });
    var coveredCount = DAC_KEYS.filter(function(k) { return counts[k] > 0; }).length;
    var gapCount = DAC_KEYS.length - coveredCount;

    var filtered = filter ? rows.filter(function(r) { return r.criterion === filter; }) : rows;

    // Column defs
    var cols = [
      { label: '#', w: '32px' },
      { label: 'Criterion', w: '70px' },
      { label: 'Evaluation Question', w: 'auto' },
      { label: 'Indicators', w: '130px' },
      { label: 'Data Sources', w: '110px' },
      { label: 'Judgement Criteria', w: '120px' }
    ];

    // Toolbar
    var toolbar = h('div', { className: 'wb-toolbar' },
      // View toggle
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary' }, 'Table'),
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost' }, 'Cards'),
      h('span', { className: 'wb-toolbar-divider' }),
      // Criterion filter pills
      h('button', {
        className: 'wb-btn wb-btn-sm' + (!filter ? ' wb-btn--active' : ' wb-btn-ghost'),
        onClick: function() { props.onFilterChange(null); }
      }, 'All (' + rows.length + ')'),
      DAC_KEYS.map(function(k) {
        var dac = OECD_DAC[k];
        var active = filter === k;
        return h('button', {
          key: k,
          className: 'wb-btn wb-btn-sm' + (active ? ' wb-btn--active' : ' wb-btn-ghost'),
          onClick: function() { props.onFilterChange(active ? null : k); }
        }, dac.name + ' (' + (counts[k] || 0) + ')');
      }),
      h('span', { className: 'wb-toolbar-spacer' }),
      // Coverage gap nudge
      gapCount > 0 ? h('span', { className: 'wb-badge wb-badge-amber' },
        gapCount + ' criteria not yet covered') : null,
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-teal', onClick: props.onAdd }, '+ Add EQ'),
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: props.onExport }, 'Export')
    );

    // Table header
    var thead = h('thead', null,
      h('tr', null, cols.map(function(c, i) {
        return h('th', {
          key: i,
          style: c.w !== 'auto' ? { width: c.w } : undefined
        }, c.label);
      }))
    );

    // Table rows
    var tbody = h('tbody', null, filtered.map(function(row, idx) {
      var sel = row.id === selectedId;
      var dacInfo = OECD_DAC[row.criterion] || {};
      var indText = (row.indicators || []).slice(0, 3).map(function(ind) { return ind.code || ind.name; }).join(', ');
      var srcText = (row.dataSources || []).join(', ');
      var jcText = row.judgementCriteria || '';
      var trunc = function(s, n) { return s && s.length > n ? s.substring(0, n) + '\u2026' : (s || ''); };

      var rowClass = 'wb-table-row' + (sel ? ' wb-table-row--selected' : '');

      return h('tr', {
        key: row.id,
        className: rowClass,
        onClick: function() { props.onSelect(row.id); }
      },
        h('td', { className: 'wb-td--num' }, idx + 1),
        h('td', null,
          h('span', { className: 'wb-criterion wb-criterion--' + (row.criterion || '') },
            (dacInfo.name || row.criterion || '').substring(0, 5).toUpperCase())
        ),
        h('td', { className: 'wb-td--text' }, row.question),
        h('td', { className: 'wb-td--badges', title: (row.indicators || []).map(function(i) { return i.name; }).join(', ') },
          (row.indicators || []).slice(0, 2).map(function(ind, j) {
            return h('span', { key: j, className: 'wb-badge wb-badge-teal' }, ind.code || trunc(ind.name, 12));
          })
        ),
        h('td', { className: 'wb-td--meta', title: srcText }, trunc(srcText, 40)),
        h('td', { className: 'wb-td--meta', title: jcText }, trunc(jcText, 45))
      );
    }));

    return h('div', null,
      toolbar,
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table' }, thead, tbody)
      )
    );
  }

  window.MatrixTable = MatrixTable;
})();
