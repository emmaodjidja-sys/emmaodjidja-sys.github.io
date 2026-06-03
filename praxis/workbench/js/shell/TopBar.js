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
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'var(--teal)', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: 'var(--teal)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );

    return h('div', { className: 'wb-topbar' },
      h('div', { className: 'wb-topbar-logo' },
        logo,
        h('span', { className: 'wb-topbar-brand' }, 'PRAXIS'),
        h('span', { className: 'wb-topbar-sep' }, '·'),
        h('input', {
          ref: titleRef,
          type: 'text',
          className: 'wb-topbar-title-input',
          value: title,
          placeholder: 'Untitled evaluation',
          onChange: function(e) { setTitle(e.target.value); },
          onBlur: handleBlur
        })
      ),
      h('div', { className: 'wb-topbar-actions' },
        h(ExperienceTierBadge, { tier: state.ui.experienceTier, dispatch: dispatch }),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm wb-topbar-save',
          onClick: handleSave
        }, 'Save')
      )
    );
  }

  window.TopBar = TopBar;
})();
