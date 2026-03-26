(function(global) {
  'use strict';
  var h = React.createElement;
  function TopBar(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var title = state.context.project_meta.title || PraxisI18n.t('topbar.untitled');
    function handleSave() {
      var filename = (state.context.project_meta.title || 'untitled').replace(/\s+/g, '_').toLowerCase() + '.praxis';
      PraxisUtils.downloadJSON(state.context, filename);
    }
    function handleOpen(file) {
      PraxisUtils.readFileAsJSON(file).then(function(data) {
        if (data.schema === 'praxis-workbench') {
          dispatch({ type: PraxisContext.ACTION.LOAD_FILE, payload: data });
        } else {
          alert(PraxisI18n.t('file.invalid'));
        }
      });
    }
    return h('div', { className: 'wb-topbar' },
      h('div', { className: 'wb-topbar-brand' },
        h('img', { src: '../logo.svg', alt: '' }),
        'PRAXIS',
        h('span', { className: 'wb-topbar-sep' }, '/'),
        'Workbench'
      ),
      h('div', { className: 'wb-topbar-title' }, title),
      h('div', { className: 'wb-topbar-actions' },
        h('span', { className: 'wb-badge wb-badge-teal' }, PraxisI18n.t('tier.' + state.ui.tier)),
        h('button', { className: 'wb-btn wb-btn-navy wb-btn-sm', onClick: handleSave },
          PraxisI18n.t('topbar.save')
        ),
        h('button', { className: 'wb-btn wb-btn-ghost wb-btn-sm', onClick: function() {
          var input = document.createElement('input');
          input.type = 'file';
          input.accept = '.praxis,.json';
          input.onchange = function(e) { if (e.target.files[0]) handleOpen(e.target.files[0]); };
          input.click();
        }}, PraxisI18n.t('topbar.open'))
      )
    );
  }
  global.PraxisTopBar = TopBar;
})(window);
