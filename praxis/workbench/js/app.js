(function() {
  'use strict';
  var h = React.createElement;

  function App() {
    var stateAndDispatch = React.useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = stateAndDispatch[0];
    var dispatch = stateAndDispatch[1];

    // Auto-persist to localStorage (debounced 500ms)
    var persistRef = React.useRef(PraxisUtils.debounce(function(ctx, ui) {
      try {
        var json = JSON.stringify(ctx);
        if (json.length > 4 * 1024 * 1024) {
          dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Project data is large. Consider downloading your .praxis file.', toastType: 'warning' });
        }
        localStorage.setItem('praxis-workbench', json);
        // Persist UI state separately so refresh resumes where you left off
        localStorage.setItem('praxis-workbench-ui', JSON.stringify({
          activeStation: ui.activeStation,
          experienceTier: ui.experienceTier
        }));
      } catch (e) { /* quota exceeded */ }
    }, 500));

    React.useEffect(function() {
      if (state.ui.projectLoaded) {
        persistRef.current(state.context, state.ui);
      }
    }, [state.context, state.ui.projectLoaded, state.ui.activeStation, state.ui.experienceTier]);

    // Auto-resume: if there's a saved project, load it immediately
    var hasAutoResumed = React.useRef(false);
    React.useEffect(function() {
      if (!hasAutoResumed.current && !state.ui.projectLoaded && PraxisContext.hasSavedProject()) {
        hasAutoResumed.current = true;
        var ctx = PraxisContext.loadSavedProject();
        if (ctx) {
          var savedUI = {};
          try { savedUI = JSON.parse(localStorage.getItem('praxis-workbench-ui') || '{}'); } catch (e) {}
          dispatch({
            type: PraxisContext.ACTION_TYPES.INIT,
            context: ctx,
            station: savedUI.activeStation || 0,
            tier: savedUI.experienceTier || 'foundation'
          });
        }
      }
    }, []);

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
