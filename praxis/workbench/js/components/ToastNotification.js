(function() {
  'use strict';
  var h = React.createElement;

  function ToastNotification(props) {
    var toasts = props.toasts || [];
    var dispatch = props.dispatch;

    React.useEffect(function() {
      if (!toasts.length) return;
      var timers = toasts.map(function(toast) {
        return setTimeout(function() {
          if (typeof dispatch === 'function') {
            dispatch({ type: PraxisContext.ACTION_TYPES.DISMISS_TOAST, id: toast.id });
          }
        }, 4000);
      });
      return function() {
        timers.forEach(function(t) { clearTimeout(t); });
      };
    }, [toasts.map(function(t) { return t.id; }).join(',')]);

    if (!toasts.length) return null;

    var typeColors = {
      success: { background: '#059669', color: 'white' },
      error:   { background: 'var(--red)', color: 'white' },
      warning: { background: 'var(--amber)', color: '#78350F' },
      info:    { background: 'var(--navy)', color: 'white' }
    };

    return h('div', { className: 'wb-toast-container' },
      toasts.map(function(toast) {
        var style = typeColors[toast.type] || typeColors.info;
        return h('div', {
          key: toast.id,
          className: 'wb-toast',
          style: style
        }, toast.message);
      })
    );
  }

  window.ToastNotification = ToastNotification;
})();
