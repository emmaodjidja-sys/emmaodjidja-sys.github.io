(function() {
  'use strict';
  var h = React.createElement;

  function Modal(props) {
    if (!props.isOpen) return null;

    var width = props.width || '520px';
    var title = props.title || '';

    function handleOverlayClick() {
      if (typeof props.onClose === 'function') props.onClose();
    }

    function handleModalClick(e) {
      e.stopPropagation();
    }

    return h('div', { className: 'wb-modal-overlay', onClick: handleOverlayClick },
      h('div', {
        className: 'wb-modal',
        style: { width: width },
        onClick: handleModalClick
      },
        h('div', { className: 'wb-modal-header' },
          h('span', { style: { fontSize: '14px', fontWeight: 700, color: 'var(--navy)' } }, title),
          h('button', {
            className: 'wb-btn wb-btn-ghost',
            onClick: handleOverlayClick,
            style: { padding: '2px 8px', fontSize: '18px', lineHeight: 1 }
          }, '\u00D7')
        ),
        h('div', { className: 'wb-modal-body' }, props.children)
      )
    );
  }

  window.Modal = Modal;
})();
