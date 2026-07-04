(function() {
  'use strict';
  var h = React.createElement;

  var META = {
    info:    { icon: 'ℹ', cls: 'wb-toast--info' },     // information source
    success: { icon: '✓', cls: 'wb-toast--success' },  // check mark
    warning: { icon: '⚠', cls: 'wb-toast--warning' },  // warning sign
    error:   { icon: '✕', cls: 'wb-toast--error' }     // multiplication x
  };
  var DURATION = { info: 4000, success: 4000, warning: 6000, error: 0 };

  function ToastNotification(props) {
    var toasts = props.toasts || [];
    var dispatch = props.dispatch;
    var pausedRef = React.useRef(false);

    function dismiss(id) {
      if (typeof dispatch === 'function') {
        dispatch({ type: PraxisContext.ACTION_TYPES.DISMISS_TOAST, id: id });
      }
    }

    var idKey = toasts.map(function(t) { return t.id; }).join(',');
    React.useEffect(function() {
      if (!toasts.length) return undefined;
      var timers = toasts.map(function(toast) {
        var ms = DURATION[toast.type] != null ? DURATION[toast.type] : DURATION.info;
        if (!ms) return null; // error persists until dismissed
        return setTimeout(function() {
          if (!pausedRef.current) dismiss(toast.id);
        }, ms);
      });
      return function() { timers.forEach(function(t) { if (t) clearTimeout(t); }); };
    }, [idKey]);

    if (!toasts.length) return null;

    var visible = toasts.slice(-3);
    var hidden = toasts.length - visible.length;

    function pause() { pausedRef.current = true; }
    function resume() { pausedRef.current = false; }

    return h('div', {
      className: 'wb-toast-container', role: 'status', 'aria-live': 'polite',
      onMouseEnter: pause, onMouseLeave: resume, onFocus: pause, onBlur: resume
    },
      hidden > 0 ? h('div', { className: 'wb-toast-more' }, '+' + hidden + ' more') : null,
      visible.map(function(toast) {
        var meta = META[toast.type] || META.info;
        return h('div', { key: toast.id, className: 'wb-toast ' + meta.cls },
          h('span', { className: 'wb-toast-icon', 'aria-hidden': 'true' }, meta.icon),
          h('span', { className: 'wb-toast-msg' }, toast.message),
          h('button', {
            className: 'wb-toast-dismiss', type: 'button',
            'aria-label': 'Dismiss notification',
            onClick: function() { dismiss(toast.id); }
          }, '×')
        );
      })
    );
  }

  window.ToastNotification = ToastNotification;
})();
