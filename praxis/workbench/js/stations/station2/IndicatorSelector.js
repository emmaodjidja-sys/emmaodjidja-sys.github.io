(function() {
  'use strict';
  var h = React.createElement;
  var BANK = (typeof window !== 'undefined' && window.PRAXIS_INDICATOR_BANK) || {};
  var ALL_INDICATORS = BANK.INDICATOR_BANK || [];
  var FRAMEWORKS = BANK.FRAMEWORKS || {};

  function IndicatorSelector(props) {
    var searchState = React.useState('');
    var search = searchState[0];
    var setSearch = searchState[1];
    var fwFilterState = React.useState(null);
    var fwFilter = fwFilterState[0];
    var setFwFilter = fwFilterState[1];
    var sectorState = React.useState(null);
    var sectorFilter = sectorState[0];
    var setSectorFilter = sectorState[1];

    var currentIds = {};
    (props.currentIndicators || []).forEach(function(ind) { currentIds[ind.id] = true; });

    // Collect unique frameworks and sectors from indicators
    var fwSet = {};
    var sectorSet = {};
    ALL_INDICATORS.forEach(function(ind) {
      (ind.frameworks || []).forEach(function(f) { fwSet[f] = true; });
      (ind.healthAreas || []).forEach(function(s) { sectorSet[s] = true; });
    });
    var fwKeys = Object.keys(fwSet);
    var sectorKeys = Object.keys(sectorSet);

    // Filter indicators
    var filtered = ALL_INDICATORS.filter(function(ind) {
      if (search) {
        var q = search.toLowerCase();
        var text = ((ind.name || '') + ' ' + (ind.code || '') + ' ' + (ind.definition || '')).toLowerCase();
        if (text.indexOf(q) < 0) return false;
      }
      if (fwFilter && (ind.frameworks || []).indexOf(fwFilter) < 0) return false;
      if (sectorFilter && (ind.healthAreas || []).indexOf(sectorFilter) < 0) return false;
      return true;
    }).slice(0, 30);

    return h(Modal, { isOpen: true, onClose: props.onClose, title: 'Indicator Bank', width: '600px' },
      // Search
      h('input', { className: 'wb-input', placeholder: 'Search indicators\u2026', value: search, style: { marginBottom: 10 },
        onChange: function(e) { setSearch(e.target.value); } }),
      // Framework filter pills
      h('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 } },
        h('span', { style: { fontSize: 10, color: 'var(--slate)', lineHeight: '24px', marginRight: 4 } }, 'Framework:'),
        fwKeys.slice(0, 8).map(function(fw) {
          var active = fwFilter === fw;
          var label = (FRAMEWORKS[fw] && FRAMEWORKS[fw].name) || fw.toUpperCase();
          return h('button', {
            key: fw,
            className: 'wb-btn wb-btn-sm ' + (active ? 'wb-btn-primary' : 'wb-btn-ghost'),
            onClick: function() { setFwFilter(active ? null : fw); }
          }, label);
        })
      ),
      // Sector filter pills
      h('div', { style: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 } },
        h('span', { style: { fontSize: 10, color: 'var(--slate)', lineHeight: '24px', marginRight: 4 } }, 'Sector:'),
        sectorKeys.slice(0, 10).map(function(s) {
          var active = sectorFilter === s;
          return h('button', {
            key: s,
            className: 'wb-btn wb-btn-sm ' + (active ? 'wb-btn-primary' : 'wb-btn-ghost'),
            onClick: function() { setSectorFilter(active ? null : s); }
          }, s.replace(/_/g, ' '));
        })
      ),
      // Indicator list
      h('div', { style: { maxHeight: 340, overflowY: 'auto' } },
        filtered.length === 0
          ? h('p', { style: { fontSize: 12, color: 'var(--slate)', padding: 12, textAlign: 'center' } }, 'No indicators match your filters.')
          : filtered.map(function(ind) {
            var added = !!currentIds[ind.id];
            return h('div', {
              key: ind.id, className: 'wb-card',
              style: { marginBottom: 8, opacity: added ? 0.6 : 1 }
            },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                h('div', { style: { flex: 1 } },
                  h('div', { style: { display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 } },
                    ind.code ? h('span', { className: 'wb-badge wb-badge-navy', style: { fontSize: 9 } }, ind.code) : null,
                    (ind.frameworks || []).slice(0, 2).map(function(f) {
                      return h('span', { key: f, className: 'wb-badge wb-badge-teal', style: { fontSize: 8 } },
                        (FRAMEWORKS[f] && FRAMEWORKS[f].name) || f);
                    })
                  ),
                  h('p', { style: { fontSize: 12, margin: 0, lineHeight: 1.4 } }, ind.name),
                  h('div', { style: { display: 'flex', gap: 3, marginTop: 4 } },
                    (ind.healthAreas || []).map(function(s) {
                      return h('span', { key: s, className: 'wb-pill', style: { fontSize: 9 } }, s.replace(/_/g, ' '));
                    })
                  )
                ),
                added
                  ? h('span', { className: 'wb-badge wb-badge-green', style: { fontSize: 10, marginLeft: 8 } }, 'Added')
                  : h('button', { className: 'wb-btn wb-btn-sm wb-btn-teal', style: { marginLeft: 8 },
                      onClick: function() { props.onAdd(ind); } }, 'Add')
              )
            );
          })
      )
    );
  }

  window.IndicatorSelector = IndicatorSelector;
})();
