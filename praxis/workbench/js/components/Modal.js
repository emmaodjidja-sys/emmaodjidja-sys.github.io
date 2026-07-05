(function() {
  'use strict';
  var h = React.createElement;
  var useRef = React.useRef, useEffect = React.useEffect;
  var titleSeq = 0;

  function Modal(props) {
    var panelRef = useRef(null);
    var invokerRef = useRef(null);
    var idRef = useRef(null);
    if (idRef.current === null) { titleSeq += 1; idRef.current = 'wb-modal-title-' + titleSeq; }
    var titleId = idRef.current;
    var isOpen = props.isOpen;
    var dismissable = props.dismissable === true;

    useEffect(function() {
      if (!isOpen) return undefined;
      invokerRef.current = document.activeElement;
      var prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      var release = PraxisA11y.trapFocus(panelRef.current);

      function onKeydown(e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          if (typeof props.onClose === 'function') props.onClose();
        }
      }
      document.addEventListener('keydown', onKeydown, true);

      return function() {
        document.removeEventListener('keydown', onKeydown, true);
        if (typeof release === 'function') release();
        document.body.style.overflow = prevOverflow;
        PraxisA11y.restoreFocus(invokerRef.current);
      };
    }, [isOpen]);

    if (!isOpen) return null;
    var width = props.width || '520px';
    var title = props.title || '';

    function onOverlayMouseDown(e) {
      if (e.target !== e.currentTarget) return;
      if (dismissable && typeof props.onClose === 'function') props.onClose();
    }
    function onClose() { if (typeof props.onClose === 'function') props.onClose(); }

    return h('div', { className: 'wb-modal-overlay', onMouseDown: onOverlayMouseDown },
      h('div', {
        className: 'wb-modal', ref: panelRef, style: { width: width },
        role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': title ? titleId : null,
        tabIndex: -1
      },
        h('div', { className: 'wb-modal-header' },
          h('span', { className: 'wb-modal-title', id: titleId }, title),
          h('button', {
            className: 'wb-modal-close', onClick: onClose, 'aria-label': 'Close', type: 'button'
          }, PraxisIcons.close(16))
        ),
        h('div', { className: 'wb-modal-body' }, props.children)
      )
    );
  }

  window.Modal = Modal;
})();
