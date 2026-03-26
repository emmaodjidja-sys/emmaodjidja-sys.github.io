(function() {
  'use strict';

  var h = React.createElement;
  var useReducer = React.useReducer;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  function App() {
    var result = useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = result[0];
    var dispatch = result[1];

    // Auto-persist to localStorage (debounced)
    var persistRef = useRef(PraxisUtils.debounce(function(ctx) {
      try {
        localStorage.setItem('praxis-workbench', JSON.stringify(ctx));
      } catch (e) {
        console.warn('Failed to persist to localStorage:', e.message);
      }
    }, 500));

    useEffect(function() {
      if (state.ui.projectLoaded) {
        persistRef.current(state.context);
      }
    }, [state.context]);

    if (!state.ui.projectLoaded) {
      return h(PraxisEntryModal, { state: state, dispatch: dispatch });
    }

    return h(PraxisShell, { state: state, dispatch: dispatch });
  }

  // Mount
  try {
    var root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(h(App));
  } catch (e) {
    document.getElementById('root').innerHTML = '<pre style="color:red;padding:20px;font-family:monospace">' +
      'PRAXIS Workbench failed to load:\n' + e.message + '\n\n' + e.stack + '</pre>';
  }

})();
