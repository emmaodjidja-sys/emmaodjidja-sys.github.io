(function() {
  'use strict';
  var h = React.createElement;

  var ACTION_TYPES = {
    INIT: 'INIT',
    LOAD_FILE: 'LOAD_FILE',
    SAVE_STATION: 'SAVE_STATION',
    SET_SENSITIVITY: 'SET_SENSITIVITY',
    SET_TIER: 'SET_TIER',
    SET_ACTIVE_STATION: 'SET_ACTIVE_STATION',
    TOGGLE_DRAWER: 'TOGGLE_DRAWER',
    UPDATE_PROJECT_META: 'UPDATE_PROJECT_META',
    SET_PROJECT_LOADED: 'SET_PROJECT_LOADED',
    CLEAR_PROJECT: 'CLEAR_PROJECT',
    SHOW_TOAST: 'SHOW_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    CLEAR_STALE: 'CLEAR_STALE'
  };

  var defaultUI = {
    projectLoaded: false,
    activeStation: 0,
    experienceTier: 'foundation',
    drawerOpen: false,
    toasts: []
  };

  function reducer(state, action) {
    switch (action.type) {

      case ACTION_TYPES.INIT:
        return {
          context: action.context || PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, defaultUI, {
            projectLoaded: true,
            experienceTier: action.tier || 'foundation',
            activeStation: action.station != null ? action.station : 0
          })
        };

      case ACTION_TYPES.LOAD_FILE:
        if (!action.context || action.context.schema !== 'praxis-workbench') {
          var toasts2 = state.ui.toasts.concat([{ id: PraxisUtils.uid('toast_'), message: 'Invalid file format. Expected a .praxis file.', type: 'error' }]);
          return { context: state.context, ui: Object.assign({}, state.ui, { toasts: toasts2 }) };
        }
        return {
          context: action.context,
          ui: Object.assign({}, state.ui, { projectLoaded: true })
        };

      case ACTION_TYPES.SAVE_STATION:
        var newContext = PraxisUtils.deepMerge(state.context, action.payload || action.data);
        newContext.updated_at = new Date().toISOString();
        newContext.staleness = PraxisStaleness.computeStaleness(action.stationId, newContext.staleness);
        return { context: newContext, ui: state.ui };

      case ACTION_TYPES.SET_SENSITIVITY:
        var sensContext = PraxisUtils.deepMerge(state.context, {
          protection: { sensitivity: action.level }
        });
        return { context: sensContext, ui: state.ui };

      case ACTION_TYPES.SET_TIER:
        return { context: state.context, ui: Object.assign({}, state.ui, { experienceTier: action.tier }) };

      case ACTION_TYPES.SET_ACTIVE_STATION:
        return { context: state.context, ui: Object.assign({}, state.ui, { activeStation: action.station }) };

      case ACTION_TYPES.TOGGLE_DRAWER:
        return { context: state.context, ui: Object.assign({}, state.ui, { drawerOpen: !state.ui.drawerOpen }) };

      case ACTION_TYPES.UPDATE_PROJECT_META:
        var metaContext = PraxisUtils.deepMerge(state.context, { project_meta: action.meta });
        metaContext.updated_at = new Date().toISOString();
        return { context: metaContext, ui: state.ui };

      case ACTION_TYPES.SET_PROJECT_LOADED:
        return { context: state.context, ui: Object.assign({}, state.ui, { projectLoaded: action.loaded }) };

      case ACTION_TYPES.CLEAR_PROJECT:
        // Note: localStorage cleanup is handled by the useEffect in app.js
        // (when projectLoaded becomes false, persist stops; next INIT creates fresh state)
        try { localStorage.removeItem('praxis-workbench'); localStorage.removeItem('praxis-workbench-ui'); } catch(e) {}
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, defaultUI)
        };

      case ACTION_TYPES.SHOW_TOAST:
        var toasts = state.ui.toasts.concat([{ id: PraxisUtils.uid('toast_'), message: action.message, type: action.toastType || 'info' }]);
        return { context: state.context, ui: Object.assign({}, state.ui, { toasts: toasts }) };

      case ACTION_TYPES.DISMISS_TOAST:
        return { context: state.context, ui: Object.assign({}, state.ui, {
          toasts: state.ui.toasts.filter(function(t) { return t.id !== action.id; })
        })};

      case ACTION_TYPES.CLEAR_STALE:
        var clearedStaleness = Object.assign({}, state.context.staleness);
        clearedStaleness[action.stationId] = false;
        return { context: Object.assign({}, state.context, { staleness: clearedStaleness }), ui: state.ui };

      default:
        return state;
    }
  }

  function getInitialState() {
    return { context: PraxisSchema.createEmptyContext(), ui: Object.assign({}, defaultUI) };
  }

  function hasSavedProject() {
    try {
      var saved = localStorage.getItem('praxis-workbench');
      if (saved) {
        var parsed = JSON.parse(saved);
        // Must have valid schema AND actual project data (not just an empty context)
        return parsed && parsed.schema === 'praxis-workbench' && parsed.project_meta && parsed.project_meta.programme_name !== '';
      }
    } catch (e) {}
    return false;
  }

  function getSavedProjectMeta() {
    try {
      var saved = localStorage.getItem('praxis-workbench');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.schema === 'praxis-workbench' && parsed.project_meta && parsed.project_meta.programme_name) {
          // Find last active station (highest completed or first incomplete)
          var lastStation = 0;
          for (var i = 8; i >= 0; i--) {
            var fields = PraxisSchema.STATION_FIELDS[i];
            for (var j = 0; j < fields.length; j++) {
              if (parsed[fields[j]] && parsed[fields[j]].completed_at) {
                lastStation = Math.min(i + 1, 8);
                break;
              }
            }
            if (lastStation > 0) break;
          }
          return {
            name: parsed.project_meta.programme_name || parsed.project_meta.title || 'Untitled',
            station: lastStation,
            stationName: PraxisSchema.STATION_LABELS[lastStation],
            updatedAt: parsed.updated_at
          };
        }
      }
    } catch (e) {}
    return null;
  }

  function loadSavedProject() {
    try {
      var saved = localStorage.getItem('praxis-workbench');
      if (saved) {
        var context = JSON.parse(saved);
        if (context && context.schema === 'praxis-workbench') return context;
      }
    } catch (e) {}
    return null;
  }

  window.PraxisContext = {
    ACTION_TYPES: ACTION_TYPES,
    reducer: reducer,
    getInitialState: getInitialState,
    hasSavedProject: hasSavedProject,
    getSavedProjectMeta: getSavedProjectMeta,
    loadSavedProject: loadSavedProject,
    defaultUI: defaultUI
  };
})();
