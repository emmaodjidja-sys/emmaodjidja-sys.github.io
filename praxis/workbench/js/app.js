(function() {
  'use strict';
  var h = React.createElement;

  var AT = PraxisContext.ACTION_TYPES;

  function App() {
    var stateAndDispatch = React.useReducer(PraxisContext.reducer, null, PraxisContext.getInitialState);
    var state = stateAndDispatch[0];
    var dispatch = stateAndDispatch[1];

    // Latest state for event handlers registered once (flush, storage, errors).
    var stateRef = React.useRef(state);
    stateRef.current = state;

    // Router: tracks the station most recently written to the URL hash by
    // OUR OWN navigate() call, so the hashchange listener below can tell an
    // external hash change (back/forward, manual edit, deep link) apart from
    // an echo of a change we made ourselves. Without this a station change
    // would write the hash, the hashchange event would fire, and the
    // listener would dispatch again, in a loop.
    var routeStationRef = React.useRef(null);

    // Tracks whether a project was loaded on the previous render, so the
    // hash-clearing effect below can tell "a project just closed" apart from
    // "no project has been opened yet" (the initial landing-page mount).
    var projectWasLoadedRef = React.useRef(false);

    // Once-per-session flags for persist failure toast and size warning,
    // plus the sticky multi-tab conflict flag and error-toast rate limiter.
    var persistErrorToastRef = React.useRef(false);
    var sizeWarningRef = React.useRef(false);
    var conflictRef = React.useRef(false);
    var lastErrorToastAtRef = React.useRef(0);

    // Synchronous write of context + UI state to localStorage. Reports
    // success or failure into ui.persistStatus so the TopBar can show it.
    function persistNow(ctx, ui) {
      try {
        var json = JSON.stringify(ctx);
        if (json.length > 4 * 1024 * 1024 && !sizeWarningRef.current) {
          sizeWarningRef.current = true;
          var mb = Math.round(json.length / (1024 * 1024) * 10) / 10;
          dispatch({ type: AT.SHOW_TOAST, message: 'Project data is about ' + mb + ' MB, close to browser storage limits. Download your .praxis file regularly.', toastType: 'warning' });
        }
        localStorage.setItem('praxis-workbench', json);
        // Persist UI state separately so refresh resumes where you left off
        localStorage.setItem('praxis-workbench-ui', JSON.stringify({
          activeStation: ui.activeStation,
          experienceTier: ui.experienceTier
        }));
        dispatch({ type: AT.SET_PERSIST_STATUS, status: conflictRef.current ? 'conflict' : 'saved', at: new Date().toISOString() });
        return true;
      } catch (e) {
        console.error('PRAXIS Workbench: autosave failed', e);
        dispatch({ type: AT.SET_PERSIST_STATUS, status: 'error' });
        if (!persistErrorToastRef.current) {
          persistErrorToastRef.current = true;
          dispatch({ type: AT.SHOW_TOAST, message: 'Autosave failed. Your browser storage may be full or unavailable. Download your .praxis file now to keep your work.', toastType: 'error' });
        }
        return false;
      }
    }
    var persistNowRef = React.useRef(persistNow);
    persistNowRef.current = persistNow;

    // Auto-persist to localStorage (debounced 500ms)
    var persistRef = React.useRef(PraxisUtils.debounce(function(ctx, ui) {
      persistNowRef.current(ctx, ui);
    }, 500));

    React.useEffect(function() {
      if (state.ui.projectLoaded) {
        if (!conflictRef.current && state.ui.persistStatus !== 'saving') {
          dispatch({ type: AT.SET_PERSIST_STATUS, status: 'saving' });
        }
        persistRef.current(state.context, state.ui);
      }
    }, [state.context, state.ui.projectLoaded, state.ui.activeStation, state.ui.experienceTier]);

    // Router: reflect the active station into the URL hash so the browser's
    // Back/Forward buttons move between visited stations instead of leaving
    // the app, and so the current station can be shared or bookmarked as a
    // deep link. Runs whenever the active station changes while a project is
    // open (station-rail clicks, staleness "review" jumps, INIT/LOAD_FILE).
    React.useEffect(function() {
      if (!state.ui.projectLoaded) {
        // A project just closed (Back to start, or a delete-all reset):
        // clear any station left in the hash so it cannot leak into
        // whatever opens next (a brand-new project, a worked example, or a
        // hard reload of the empty landing page). replaceState (rather than
        // navigate(), which assigns location.hash) does not push an extra
        // history entry and does not fire a hashchange event, so it cannot
        // trip the loop-guard below.
        if (projectWasLoadedRef.current) {
          routeStationRef.current = null;
          history.replaceState(null, '', location.pathname + location.search);
        }
        projectWasLoadedRef.current = false;
        return;
      }
      projectWasLoadedRef.current = true;
      routeStationRef.current = state.ui.activeStation;
      PraxisRouter.navigate(state.ui.activeStation);
    }, [state.ui.projectLoaded, state.ui.activeStation]);

    // One-time listeners: flush pending saves when the page hides, detect
    // writes from other tabs, surface uncaught errors as toasts, and reflect
    // external hash changes (Back/Forward, manual edit, deep link) back into
    // the active station.
    React.useEffect(function() {
      function onHashChange() {
        var s = PraxisRouter.getGuardedStation();
        // null (no/unparsable station in the hash) or a value that just
        // echoes our own navigate() call above: nothing to do.
        if (s === null || s === routeStationRef.current) return;
        routeStationRef.current = s;
        if (stateRef.current.ui.projectLoaded) {
          dispatch({ type: AT.SET_ACTIVE_STATION, station: s });
        }
      }
      function flush() {
        var s = stateRef.current;
        if (s.ui.projectLoaded) persistNowRef.current(s.context, s.ui);
      }
      function onVisibility() {
        if (document.visibilityState === 'hidden') flush();
      }
      function onPageHide() { flush(); }

      // Fires in THIS tab only when ANOTHER tab writes the key.
      function onStorage(e) {
        if (e.key !== 'praxis-workbench') return;
        if (!stateRef.current.ui.projectLoaded) return;
        if (conflictRef.current) return;
        conflictRef.current = true;
        dispatch({ type: AT.SET_PERSIST_STATUS, status: 'conflict' });
        dispatch({ type: AT.SHOW_TOAST, message: 'This project is open in another tab. Changes made there can overwrite changes made here.', toastType: 'error' });
      }

      // At most one uncaught-error toast per 10 seconds. The error itself is
      // never suppressed; the browser still logs it and we console.error too.
      function showErrorToast() {
        var now = Date.now();
        if (now - lastErrorToastAtRef.current < 10000) return;
        lastErrorToastAtRef.current = now;
        var at = stateRef.current.ui.lastSavedAt;
        var msg = at
          ? 'Something went wrong. Your last saved copy is from ' + PraxisUtils.formatTime(at) + '. If problems persist, download your .praxis file.'
          : 'Something went wrong. If problems persist, download your .praxis file.';
        dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: 'error' });
      }
      function onWindowError(event) {
        console.error('PRAXIS Workbench uncaught error:', event.error || event.message);
        showErrorToast();
      }
      function onRejection(event) {
        console.error('PRAXIS Workbench unhandled rejection:', event.reason);
        showErrorToast();
      }

      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pagehide', onPageHide);
      window.addEventListener('storage', onStorage);
      window.addEventListener('error', onWindowError);
      window.addEventListener('unhandledrejection', onRejection);
      window.addEventListener('hashchange', onHashChange);
      return function() {
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        window.removeEventListener('storage', onStorage);
        window.removeEventListener('error', onWindowError);
        window.removeEventListener('unhandledrejection', onRejection);
        window.removeEventListener('hashchange', onHashChange);
      };
    }, []);

    // Render entry landing or shell. Toasts are mounted on both branches so
    // landing-page errors (bad imports, unreadable saves) are visible.
    if (!state.ui.projectLoaded) {
      return h(React.Fragment, null,
        h(EntryLanding, { state: state, dispatch: dispatch }),
        h(ToastNotification, { toasts: state.ui.toasts, dispatch: dispatch })
      );
    }
    return h('div', { className: 'wb-app' },
      h(Shell, { state: state, dispatch: dispatch }),
      h(ToastNotification, { toasts: state.ui.toasts, dispatch: dispatch })
    );
  }

  // What is actually recoverable from localStorage right now. Checked at
  // render time so the recovery screen never overstates what is safe.
  function getRecoveryInfo() {
    var raw = null;
    try { raw = localStorage.getItem('praxis-workbench'); }
    catch (e) {
      return { available: false, text: 'Saved data could not be checked. Browser storage is unavailable.' };
    }
    if (!raw) {
      return { available: false, text: 'No saved copy was found in this browser. Work entered since your last .praxis download may be lost.' };
    }
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.schema === 'praxis-workbench') {
        var name = (parsed.project_meta && (parsed.project_meta.title || parsed.project_meta.programme_name)) || 'Untitled evaluation';
        var when = parsed.updated_at ? ', last updated ' + PraxisUtils.formatDate(parsed.updated_at) : '';
        return { available: true, text: 'A saved copy of "' + name + '"' + when + ' exists in this browser. Download it below before refreshing.' };
      }
    } catch (e2) {}
    return { available: true, text: 'Saved data was found but could not be read as a project. You can still download the raw file below.' };
  }

  // Error boundary: catches rendering errors, shows recovery UI instead of a
  // white screen, and reports honestly on what is recoverable.
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null, exportMessage: '' };
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
        var recovery = getRecoveryInfo();
        return h('div', { style: { padding: '48px 32px', maxWidth: 560, margin: '0 auto', fontFamily: 'var(--font-sans)' } },
          h('h1', { style: { fontSize: 18, fontWeight: 700, color: '#0B1A2E', marginBottom: 8 } }, 'Something went wrong'),
          h('p', { style: { fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 16 } },
            'An error occurred in the workbench. ' + recovery.text),
          h('pre', { style: { fontSize: 11, background: '#F1F5F9', padding: 12, borderRadius: 6, overflow: 'auto', marginBottom: 16, color: '#991B1B' } },
            String(this.state.error)),
          this.state.exportMessage
            ? h('p', { style: { fontSize: 12, color: '#991B1B', marginBottom: 12 } }, this.state.exportMessage)
            : null,
          h('div', { style: { display: 'flex', gap: 8 } },
            h('button', {
              className: 'wb-btn wb-btn-primary',
              onClick: function() { window.location.reload(); }
            }, 'Refresh Page'),
            recovery.available ? h('button', {
              className: 'wb-btn wb-btn-outline',
              onClick: function() {
                try {
                  var data = localStorage.getItem('praxis-workbench');
                  if (!data) {
                    self.setState({ exportMessage: 'No saved data was found to download.' });
                    return;
                  }
                  var blob = new Blob([data], { type: 'application/json' });
                  var url = URL.createObjectURL(blob);
                  var a = document.createElement('a');
                  a.href = url; a.download = 'praxis-recovery-' + new Date().toISOString().slice(0, 10) + '.json';
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(url);
                } catch (e) {
                  self.setState({ exportMessage: 'Could not export data: ' + e.message });
                }
              }
            }, 'Download Data') : null,
            h('button', {
              className: 'wb-btn wb-btn-ghost',
              onClick: function() { self.setState({ hasError: false, error: null, exportMessage: '' }); }
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
