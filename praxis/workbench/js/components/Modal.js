(function(global) {
  'use strict';
  var h = React.createElement;
  function Modal(props) {
    return h('div', { className: 'wb-modal-overlay', onClick: props.onClose },
      h('div', { className: 'wb-modal', onClick: function(e) { e.stopPropagation(); } },
        props.title ? h('h2', { className: 'wb-modal-title' }, props.title) : null,
        props.children
      )
    );
  }
  global.PraxisModal = Modal;
})(window);
