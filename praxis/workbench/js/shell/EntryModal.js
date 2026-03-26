(function(global) {
  'use strict';
  var h = React.createElement;
  function EntryModal(props) {
    var dispatch = props.dispatch;
    var hasSaved = props.state.context.project_meta.title !== '';
    function handleNew() {
      dispatch({ type: PraxisContext.ACTION.INIT });
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
    function handleContinue() {
      dispatch({ type: PraxisContext.ACTION.LOAD_FILE, payload: props.state.context });
    }
    return h('div', { className: 'wb-modal-overlay' },
      h('div', { className: 'wb-modal', style: { maxWidth: '480px' } },
        h('div', { style: { textAlign: 'center', marginBottom: '24px' } },
          h('img', { src: '../logo.svg', alt: '', style: { width: '40px', height: '40px', marginBottom: '12px' } }),
          h('h1', { style: { fontSize: '20px', fontWeight: '600', marginBottom: '4px' } },
            PraxisI18n.t('entry.title')
          ),
          h('p', { style: { fontSize: '14px', color: 'var(--wb-text-secondary)' } },
            PraxisI18n.t('entry.subtitle')
          )
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          h('button', {
            className: 'wb-btn wb-btn-primary',
            style: { width: '100%', justifyContent: 'center', padding: '12px' },
            onClick: handleNew
          }, PraxisI18n.t('entry.new')),
          h(PraxisFileDropZone, { onFile: handleOpen }),
          hasSaved ? h('button', {
            className: 'wb-btn wb-btn-ghost',
            style: { width: '100%', justifyContent: 'center', padding: '12px' },
            onClick: handleContinue
          }, PraxisI18n.t('entry.continue') + ': ' + (props.state.context.project_meta.title || 'Untitled')) : null
        )
      )
    );
  }
  global.PraxisEntryModal = EntryModal;
})(window);
