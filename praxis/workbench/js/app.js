(function() {
  'use strict';
  var h = React.createElement;

  function App() {
    var stateAndDispatch = React.useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = stateAndDispatch[0];
    var dispatch = stateAndDispatch[1];

    // Auto-persist to localStorage (debounced 500ms)
    var persistRef = React.useRef(PraxisUtils.debounce(function(ctx) {
      try {
        var size = PraxisUtils.estimateJSONSize(ctx);
        if (size > 4 * 1024 * 1024) {
          dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Project data is large. Consider downloading your .praxis file.', toastType: 'warning' });
        }
        localStorage.setItem('praxis-workbench', JSON.stringify(ctx));
      } catch (e) { /* quota exceeded */ }
    }, 500));

    React.useEffect(function() {
      if (state.ui.projectLoaded) {
        persistRef.current(state.context);
      }
    }, [state.context, state.ui.projectLoaded]);

    // Render entry landing or shell
    if (!state.ui.projectLoaded) {
      return h(EntryLanding, { state: state, dispatch: dispatch });
    }
    return h('div', { className: 'wb-app' },
      h(Shell, { state: state, dispatch: dispatch }),
      h(ToastNotification, { toasts: state.ui.toasts, dispatch: dispatch })
    );
  }

  // Mount
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(App));
})();
