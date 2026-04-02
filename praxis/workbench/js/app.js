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

  // Error boundary — catches rendering errors, shows recovery UI instead of white screen
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error: error };
    }
    componentDidCatch(error, info) {
      console.error('PRAXIS Workbench error:', error, info);
    }
    render() {
      if (this.state.hasError) {
        var self = this;
        return h('div', { style: { padding: '48px 32px', maxWidth: 560, margin: '0 auto', fontFamily: 'var(--font-sans)' } },
          h('h1', { style: { fontSize: 18, fontWeight: 700, color: '#0B1A2E', marginBottom: 8 } }, 'Something went wrong'),
          h('p', { style: { fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 } },
            'An error occurred in the workbench. Your data is safe in localStorage. Try refreshing the page, or download your data below.'),
          h('pre', { style: { fontSize: 11, background: '#F1F5F9', padding: 12, borderRadius: 6, overflow: 'auto', marginBottom: 16, color: '#991B1B' } },
            String(this.state.error)),
          h('div', { style: { display: 'flex', gap: 8 } },
            h('button', {
              className: 'wb-btn wb-btn-primary',
              onClick: function() { window.location.reload(); }
            }, 'Refresh Page'),
            h('button', {
              className: 'wb-btn wb-btn-outline',
              onClick: function() {
                try {
                  var data = localStorage.getItem('praxis-workbench');
                  if (data) {
                    var blob = new Blob([data], { type: 'application/json' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url; a.download = 'praxis-recovery.json';
                    document.body.appendChild(a); a.click();
                    document.body.removeChild(a); URL.revokeObjectURL(url);
                  }
                } catch(e) { alert('Could not export data: ' + e.message); }
              }
            }, 'Download Data'),
            h('button', {
              className: 'wb-btn wb-btn-ghost',
              onClick: function() { self.setState({ hasError: false, error: null }); }
            }, 'Try Again')
          )
        );
      }
      return this.props.children;
    }
  }

  // Mount
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(ErrorBoundary, null, h(App)));
})();
