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
    DISMISS_TOAST: 'DISMISS_TOAST'
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
          ui: Object.assign({}, defaultUI, { projectLoaded: true, experienceTier: action.tier || 'foundation' })
        };

      case ACTION_TYPES.LOAD_FILE:
        return {
          context: action.context,
          ui: Object.assign({}, state.ui, { projectLoaded: true })
        };

      case ACTION_TYPES.SAVE_STATION:
        var newContext = PraxisUtils.deepMerge(state.context, action.payload);
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
        localStorage.removeItem('praxis-workbench');
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

      default:
        return state;
    }
  }

  function getInitialState() {
    try {
      var saved = localStorage.getItem('praxis-workbench');
      if (saved) {
        var context = JSON.parse(saved);
        if (context && context.schema === 'praxis-workbench') {
          return { context: context, ui: Object.assign({}, defaultUI, { projectLoaded: true }) };
        }
      }
    } catch (e) { }
    return { context: PraxisSchema.createEmptyContext(), ui: Object.assign({}, defaultUI) };
  }

  window.PraxisContext = {
    ACTION_TYPES: ACTION_TYPES,
    reducer: reducer,
    getInitialState: getInitialState,
    defaultUI: defaultUI
  };
})();
