(function() {
  'use strict';
  var h = React.createElement;

  function ContextDrawer(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var isOpen = state.ui.drawerOpen;
    var context = state.context;
    var meta = context.project_meta || {};
    var evaluability = context.evaluability || {};

    function toggle() {
      dispatch({ type: PraxisContext.ACTION_TYPES.TOGGLE_DRAWER });
    }

    function handleExport() {
      var fname = (meta.title || 'evaluation') + '.praxis';
      PraxisUtils.downloadJSON(context, fname);
    }

    if (!isOpen) {
      return h('aside', { className: 'wb-drawer' },
        h('button', {
          onClick: toggle,
          style: {
            width: 28, height: 28, border: '1px solid #E5E7EB', borderRadius: 4,
            background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#6B7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px auto 0'
          }
        }, '{ }')
      );
    }

    var items = [];
    if (meta.programme_name) items.push(h('div', { key: 'prog', style: { fontSize: '11px', marginBottom: 4 } },
      h('strong', null, 'Programme: '), meta.programme_name));
    if (meta.sectors && meta.sectors.length) items.push(h('div', { key: 'sec', style: { fontSize: '11px', marginBottom: 4 } },
      h('strong', null, 'Sectors: '), meta.sectors.join(', ')));
    if (meta.country) items.push(h('div', { key: 'cty', style: { fontSize: '11px', marginBottom: 4 } },
      h('strong', null, 'Country: '), meta.country));
    if (meta.operating_context) items.push(h('div', { key: 'ctx', style: { fontSize: '11px', marginBottom: 4 } },
      h('strong', null, 'Context: '), meta.operating_context));
    if (evaluability.score != null) items.push(h('div', { key: 'eval', style: { fontSize: '11px', marginBottom: 4 } },
      h('strong', null, 'Evaluability: '), evaluability.score + '/100'));

    return h('aside', { className: 'wb-drawer wb-drawer--open' },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #E5E7EB' } },
        h('span', { style: { fontSize: '12px', fontWeight: 600, color: '#1F2937' } }, 'Context'),
        h('button', { onClick: toggle, className: 'wb-btn wb-btn-ghost wb-btn-sm', style: { fontSize: '14px', padding: '2px 6px' } }, '\u00D7')
      ),
      h('div', { style: { padding: '12px', flex: 1, overflow: 'auto' } },
        items.length > 0
          ? items
          : h('p', { style: { fontSize: '11px', color: '#9CA3AF' } }, 'No project metadata yet.')
      ),
      h('div', { style: { padding: '12px', borderTop: '1px solid #E5E7EB' } },
        h('button', { className: 'wb-btn wb-btn-outline wb-btn-sm', onClick: handleExport, style: { width: '100%' } }, 'Export .praxis')
      )
    );
  }

  window.ContextDrawer = ContextDrawer;
})();
