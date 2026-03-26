(function(global) {
  'use strict';

  var ACTION = {
    INIT: 'INIT',
    LOAD_FILE: 'LOAD_FILE',
    SAVE_STATION: 'SAVE_STATION',
    SET_SENSITIVITY: 'SET_SENSITIVITY',
    SET_TIER: 'SET_TIER',
    SET_ACTIVE_STATION: 'SET_ACTIVE_STATION',
    UPDATE_META: 'UPDATE_META',
    CLEAR: 'CLEAR'
  };

  function reducer(state, action) {
    switch (action.type) {

      case ACTION.INIT:
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, state.ui, { projectLoaded: true, activeStation: 0 })
        };

      case ACTION.LOAD_FILE:
        return {
          context: action.payload,
          ui: Object.assign({}, state.ui, { projectLoaded: true, activeStation: 0 })
        };

      case ACTION.SAVE_STATION:
        var newContext = PraxisUtils.deepMerge(state.context, action.payload);
        newContext.updated_at = new Date().toISOString();
        newContext.staleness = PraxisStaleness.computeStaleness(
          action.stationId, newContext.staleness
        );
        return { context: newContext, ui: state.ui };

      case ACTION.SET_SENSITIVITY:
        var prot = Object.assign({}, state.context.protection, {
          sensitivity: action.level,
          ai_permitted: action.level !== 'highly_sensitive',
          encryption_recommended: action.level === 'highly_sensitive',
          sharing_guidance: PraxisProtection.getSharingGuidance(
            { protection: { sensitivity: action.level } }
          )
        });
        return {
          context: Object.assign({}, state.context, { protection: prot }),
          ui: state.ui
        };

      case ACTION.SET_TIER:
        return {
          context: state.context,
          ui: Object.assign({}, state.ui, { tier: action.tier })
        };

      case ACTION.SET_ACTIVE_STATION:
        return {
          context: state.context,
          ui: Object.assign({}, state.ui, { activeStation: action.station })
        };

      case ACTION.UPDATE_META:
        return {
          context: Object.assign({}, state.context, {
            project_meta: Object.assign({}, state.context.project_meta, action.payload)
          }),
          ui: state.ui
        };

      case ACTION.CLEAR:
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: { projectLoaded: false, activeStation: 0, tier: 'practitioner', drawerOpen: false }
        };

      default:
        return state;
    }
  }

  function getInitialState() {
    var saved = null;
    try {
      var raw = localStorage.getItem('praxis-workbench');
      if (raw) saved = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    return {
      context: saved || PraxisSchema.createEmptyContext(),
      ui: {
        projectLoaded: !!saved,
        activeStation: 0,
        tier: 'practitioner',
        drawerOpen: false
      }
    };
  }

  global.PraxisContext = {
    ACTION: ACTION,
    reducer: reducer,
    getInitialState: getInitialState
  };

})(window);
