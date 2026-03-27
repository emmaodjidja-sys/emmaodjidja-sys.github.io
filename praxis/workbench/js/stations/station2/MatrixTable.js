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
    var toolbar = h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' } },
      // View toggle
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-primary', style: { cursor: 'default' } }, 'Table'),
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-ghost' }, 'Cards'),
      h('span', { style: { width: 1, height: 20, background: 'var(--border)', margin: '0 4px' } }),
      // Criterion filter pills
      h('button', {
        className: 'wb-btn wb-btn-sm ' + (!filter ? 'wb-btn-outline' : 'wb-btn-ghost'),
        onClick: function() { props.onFilterChange(null); },
        style: !filter ? { borderColor: 'var(--navy)' } : {}
      }, 'All (' + rows.length + ')'),
      DAC_KEYS.map(function(k) {
        var dac = OECD_DAC[k];
        var active = filter === k;
        return h('button', {
          key: k,
          className: 'wb-btn wb-btn-sm ' + (active ? 'wb-btn-outline' : 'wb-btn-ghost'),
          onClick: function() { props.onFilterChange(active ? null : k); },
          style: active ? { borderColor: dac.color, color: dac.color } : {}
        }, dac.name + ' (' + (counts[k] || 0) + ')');
      }),
      h('span', { style: { flex: 1 } }),
      // Coverage gap nudge
      gapCount > 0 ? h('span', { className: 'wb-badge wb-badge-amber', style: { fontSize: 10, marginRight: 4 } },
        gapCount + ' criteria not yet covered') : null,
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-teal', onClick: props.onAdd }, '+ Add EQ'),
      h('button', { className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: props.onExport }, 'Export')
    );

    // Table header
    var thead = h('thead', null,
      h('tr', null, cols.map(function(c, i) {
        return h('th', {
          key: i,
          style: { width: c.w === 'auto' ? undefined : c.w, padding: '8px 6px', fontSize: 10, fontWeight: 700,
            color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em',
            background: '#F8FAFC', position: 'sticky', top: 0, borderBottom: '2px solid var(--border)', textAlign: 'left' }
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

      return h('tr', {
        key: row.id,
        onClick: function() { props.onSelect(row.id); },
        style: {
          cursor: 'pointer', borderLeft: sel ? '3px solid var(--blue)' : '3px solid transparent',
          background: sel ? 'var(--blue-light)' : (idx % 2 === 0 ? 'var(--surface)' : '#FAFBFC'),
          transition: 'background 0.1s'
        }
      },
        h('td', { style: { padding: '7px 6px', fontSize: 11, color: 'var(--slate)' } }, idx + 1),
        h('td', { style: { padding: '7px 6px' } },
          h('span', { className: 'wb-badge', style: { background: dacInfo.color || 'var(--navy)', color: '#fff' } },
            (dacInfo.name || row.criterion || '').substring(0, 5).toUpperCase())
        ),
        h('td', { style: { padding: '7px 6px', fontSize: 12, lineHeight: 1.4 } }, row.question),
        h('td', { style: { padding: '7px 6px', fontSize: 10 }, title: (row.indicators || []).map(function(i) { return i.name; }).join(', ') },
          (row.indicators || []).slice(0, 2).map(function(ind, j) {
            return h('span', { key: j, className: 'wb-badge wb-badge-teal', style: { marginRight: 3, fontSize: 9 } }, ind.code || trunc(ind.name, 12));
          })
        ),
        h('td', { style: { padding: '7px 6px', fontSize: 10, color: 'var(--slate)' }, title: srcText }, trunc(srcText, 40)),
        h('td', { style: { padding: '7px 6px', fontSize: 10, color: 'var(--slate)' }, title: jcText }, trunc(jcText, 45))
      );
    }));

    return h('div', null,
      toolbar,
      h('div', { style: { overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' } },
        h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 12 } }, thead, tbody)
      )
    );
  }

  window.MatrixTable = MatrixTable;
})();
