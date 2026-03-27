(function() {
  'use strict';
  var h = React.createElement;

  function TopBar(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;
    var meta = context.project_meta || {};
    var titleRef = React.useRef(null);
    var titleVal = React.useState(meta.title || '');
    var title = titleVal[0];
    var setTitle = titleVal[1];

    React.useEffect(function() {
      setTitle(meta.title || '');
    }, [meta.title]);

    function handleBlur() {
      if (title !== (meta.title || '')) {
        dispatch({ type: PraxisContext.ACTION_TYPES.UPDATE_PROJECT_META, meta: { title: title } });
      }
    }

    function handleSave() {
      var fname = (meta.title || 'evaluation') + '.praxis';
      PraxisUtils.downloadJSON(context, fname);
    }

    var logo = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
      h('circle', { cx: 12, cy: 12, r: 10, stroke: '#2EC4B6', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: '#2EC4B6', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );

    return h('div', { className: 'wb-topbar' },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 } },
        logo,
        h('span', { style: { color: '#2EC4B6', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' } }, 'PRAXIS'),
        h('span', { style: { color: 'rgba(255,255,255,0.2)', fontSize: '10px' } }, '\u00B7'),
        h('input', {
          ref: titleRef,
          type: 'text',
          value: title,
          placeholder: 'Untitled evaluation',
          onChange: function(e) { setTitle(e.target.value); },
          onBlur: handleBlur,
          style: {
            background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: '13px', fontWeight: 500,
            flex: 1, minWidth: 0, padding: '2px 4px'
          }
        })
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { className: 'wb-tier-pill', 'data-tier': state.ui.experienceTier },
          (state.ui.experienceTier || 'foundation').toUpperCase()
        ),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm',
          onClick: handleSave,
          style: { color: 'rgba(255,255,255,0.7)', fontSize: '11px' }
        }, 'Save')
      )
    );
  }

  window.TopBar = TopBar;
})();
