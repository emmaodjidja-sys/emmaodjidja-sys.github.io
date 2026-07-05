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
    CLEAR_STALE: 'CLEAR_STALE',
    SET_PERSIST_STATUS: 'SET_PERSIST_STATUS',
    SET_LOCALE: 'SET_LOCALE'
  };

  var defaultUI = {
    projectLoaded: false,
    activeStation: 0,
    experienceTier: 'foundation',
    drawerOpen: false,
    toasts: [],
    // 'saved' | 'saving' | 'error' | 'conflict', driven by the persist logic in app.js
    persistStatus: 'saved',
    lastSavedAt: null,
    // Interface language. Mirrors PraxisI18n's own locale state; changing it
    // via SET_LOCALE forces a re-render so every t() call re-evaluates.
    locale: (window.PraxisI18n && window.PraxisI18n.getLocale) ? window.PraxisI18n.getLocale() : 'en'
  };

  function pushToast(ui, message, type) {
    return Object.assign({}, ui, {
      toasts: ui.toasts.concat([{ id: PraxisUtils.uid('toast_'), message: message, type: type || 'info' }])
    });
  }

  // Station label for a top-level context field (for merge messages).
  function fieldStationLabel(field) {
    var ids = Object.keys(PraxisSchema.STATION_FIELDS);
    for (var i = 0; i < ids.length; i++) {
      if (PraxisSchema.STATION_FIELDS[ids[i]].indexOf(field) !== -1) {
        return PraxisSchema.STATION_LABELS[ids[i]] || 'Planning';
      }
    }
    return field;
  }

  function reducer(state, action) {
    switch (action.type) {

      case ACTION_TYPES.INIT:
        var initContext = PraxisSchema.createEmptyContext();
        var initFellBack = false;
        if (action.context) {
          var initCheck = PraxisSchema.validateContext(action.context);
          if (initCheck.ok && !initCheck.partial) {
            initContext = PraxisSchema.migrate(initCheck.context);
          } else {
            initFellBack = true;
          }
        }
        var initUI = Object.assign({}, defaultUI, {
          projectLoaded: true,
          experienceTier: action.tier || 'foundation',
          activeStation: action.station != null ? action.station : 0
        });
        if (initFellBack) {
          initUI = pushToast(initUI, 'The provided project data could not be read. A blank project was created instead.', 'warning');
        }
        return { context: initContext, ui: initUI };

      case ACTION_TYPES.LOAD_FILE:
        var check = PraxisSchema.validateContext(action.context);
        if (!check.ok) {
          var failMsg = (check.errors && check.errors[0]) || 'Invalid file format. Expected a .praxis file.';
          return { context: state.context, ui: pushToast(state.ui, failMsg, 'error') };
        }

        if (check.partial) {
          // Station-level export: merge its station fields into a full
          // project instead of replacing the whole context. The merge base
          // is the live context when a project is open. In a fresh session
          // the call site passes the saved project as action.base, so the
          // import never merges onto an empty context and then overwrites
          // the saved project on the next autosave.
          var mergeBase = state.context;
          var baseKind = state.ui.projectLoaded ? 'current' : 'new';
          if (!state.ui.projectLoaded && action.base) {
            var baseCheck = PraxisSchema.validateContext(action.base);
            if (baseCheck.ok && !baseCheck.partial) {
              mergeBase = PraxisSchema.migrate(baseCheck.context);
              baseKind = 'saved';
            }
          }
          var mergePayload = {};
          var mergedLabels = [];
          Object.keys(PraxisSchema.STATION_FIELDS).forEach(function(id) {
            PraxisSchema.STATION_FIELDS[id].forEach(function(field) {
              if (check.context[field] !== undefined) {
                mergePayload[field] = check.context[field];
                if (mergedLabels.indexOf(fieldStationLabel(field)) === -1) mergedLabels.push(fieldStationLabel(field));
              }
            });
          });
          if (!mergedLabels.length) {
            return { context: state.context, ui: pushToast(state.ui, 'This partial file contains no station data that can be merged.', 'error') };
          }
          var mergedContext = PraxisUtils.deepMerge(mergeBase, mergePayload);
          mergedContext.updated_at = new Date().toISOString();
          var partialStation = typeof check.context._station === 'number' ? check.context._station : null;
          if (partialStation != null && PraxisSchema.STATION_FIELDS[partialStation]) {
            mergedContext.staleness = PraxisStaleness.computeStaleness(partialStation, mergedContext.staleness);
          }
          var mergeMsg;
          if (baseKind === 'current') {
            mergeMsg = 'Merged ' + mergedLabels.join(', ') + ' data into the current project. Other stations were not changed.';
          } else if (baseKind === 'saved') {
            mergeMsg = 'Merged ' + mergedLabels.join(', ') + ' data into your saved project. Other stations were not changed.';
          } else {
            mergeMsg = 'Created a new project from the imported ' + mergedLabels.join(', ') + ' data.';
          }
          var mergedUI = pushToast(state.ui, mergeMsg, 'success');
          return { context: mergedContext, ui: Object.assign({}, mergedUI, { projectLoaded: true }) };
        }

        var loadedContext = PraxisSchema.migrate(check.context);
        var loadedUI = Object.assign({}, state.ui, { projectLoaded: true });
        if (typeof action.station === 'number' && action.station >= 0 && action.station <= 9) {
          loadedUI.activeStation = action.station;
        }
        if (action.tier === 'foundation' || action.tier === 'practitioner' || action.tier === 'advanced') {
          loadedUI.experienceTier = action.tier;
        }
        if (check.errors && check.errors.length) {
          loadedUI = pushToast(loadedUI, 'Some fields in the file could not be read and were reset to defaults: ' + check.errors.length + ' field(s) affected.', 'warning');
        }
        return { context: loadedContext, ui: loadedUI };

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
        // Pure state reset. Callers that intend to delete the saved copy must
        // remove the localStorage keys themselves before dispatching.
        return {
          context: PraxisSchema.createEmptyContext(),
          ui: Object.assign({}, defaultUI)
        };

      case ACTION_TYPES.SET_PERSIST_STATUS:
        return { context: state.context, ui: Object.assign({}, state.ui, {
          persistStatus: action.status,
          lastSavedAt: action.at !== undefined ? action.at : state.ui.lastSavedAt
        })};

      case ACTION_TYPES.SET_LOCALE:
        // PraxisI18n.setLocale already persisted the locale and updated its own
        // state; storing it here only forces the re-render that refreshes t().
        return { context: state.context, ui: Object.assign({}, state.ui, { locale: action.locale }) };

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
          // Find last active station (highest completed or first incomplete).
          // Includes the optional Planning station (9) defensively.
          var lastStation = 0;
          for (var i = 9; i >= 0; i--) {
            var fields = PraxisSchema.STATION_FIELDS[i];
            if (!fields) continue;
            for (var j = 0; j < fields.length; j++) {
              if (parsed[fields[j]] && parsed[fields[j]].completed_at) {
                lastStation = (i === 9) ? 9 : Math.min(i + 1, 8);
                break;
              }
            }
            if (lastStation > 0) break;
          }
          return {
            name: parsed.project_meta.programme_name || parsed.project_meta.title || 'Untitled',
            station: lastStation,
            stationName: PraxisSchema.STATION_LABELS[lastStation] || 'Planning',
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
        var check = PraxisSchema.validateContext(JSON.parse(saved));
        if (check.ok && !check.partial) return PraxisSchema.migrate(check.context);
      }
    } catch (e) {}
    return null;
  }

  // Saved UI state (active station, experience tier), validated.
  function getSavedUIState() {
    try {
      var raw = localStorage.getItem('praxis-workbench-ui');
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      var out = {};
      if (typeof parsed.activeStation === 'number' && parsed.activeStation >= 0 && parsed.activeStation <= 9) {
        out.activeStation = parsed.activeStation;
      }
      if (parsed.experienceTier === 'foundation' || parsed.experienceTier === 'practitioner' || parsed.experienceTier === 'advanced') {
        out.experienceTier = parsed.experienceTier;
      }
      return out;
    } catch (e) {}
    return null;
  }

  // Single rotating backup slot. Copies the current saved blob (whatever its
  // state, including unparseable data) so one destructive replacement is
  // always recoverable. Returns true when a backup was written.
  function writeBackup(reason) {
    try {
      var current = localStorage.getItem('praxis-workbench');
      if (!current) return false;
      localStorage.setItem('praxis-workbench-backup', current);
      localStorage.setItem('praxis-workbench-backup-meta', JSON.stringify({
        backedUpAt: new Date().toISOString(),
        reason: reason || ''
      }));
      return true;
    } catch (e) { return false; }
  }

  // Metadata for the backup slot, or null when there is no backup, the
  // backup is unreadable, or it is identical to the current saved blob.
  function getBackupMeta() {
    try {
      var raw = localStorage.getItem('praxis-workbench-backup');
      if (!raw) return null;
      if (raw === localStorage.getItem('praxis-workbench')) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.schema !== 'praxis-workbench') return null;
      var meta = null;
      try { meta = JSON.parse(localStorage.getItem('praxis-workbench-backup-meta')); } catch (e2) {}
      return {
        name: (parsed.project_meta && (parsed.project_meta.programme_name || parsed.project_meta.title)) || 'Untitled',
        updatedAt: parsed.updated_at || null,
        backedUpAt: (meta && meta.backedUpAt) || null,
        reason: (meta && meta.reason) || ''
      };
    } catch (e) {}
    return null;
  }

  function loadBackup() {
    try {
      var raw = localStorage.getItem('praxis-workbench-backup');
      if (raw) {
        var check = PraxisSchema.validateContext(JSON.parse(raw));
        if (check.ok && !check.partial) return PraxisSchema.migrate(check.context);
      }
    } catch (e) {}
    return null;
  }

  // Removes every localStorage key this app owns (project, UI state, backup
  // and its metadata), except the interface locale preference so a full
  // reset does not also reset the user's chosen language. Used by the
  // "Delete all workbench data" control (AboutModal). Pure side effect, no
  // dispatch: callers still need to dispatch CLEAR_PROJECT to reset the
  // in-memory state.
  var LOCALE_KEY_EXCEPTION = 'praxis-workbench-locale';
  function clearAllData() {
    var removed = [];
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('praxis-workbench') === 0 && k !== LOCALE_KEY_EXCEPTION) keys.push(k);
      }
      keys.forEach(function(k) {
        localStorage.removeItem(k);
        removed.push(k);
      });
    } catch (e) {}
    return removed;
  }

  // Raw saved blob that exists but cannot be read as a workbench project
  // (corrupt JSON or wrong schema). Lets the landing page offer a raw
  // download instead of silently hiding recoverable data.
  function getUnreadableSavedData() {
    var raw = null;
    try { raw = localStorage.getItem('praxis-workbench'); } catch (e) { return null; }
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.schema === 'praxis-workbench') return null;
    } catch (e2) {}
    return raw;
  }

  window.PraxisContext = {
    ACTION_TYPES: ACTION_TYPES,
    reducer: reducer,
    getInitialState: getInitialState,
    hasSavedProject: hasSavedProject,
    getSavedProjectMeta: getSavedProjectMeta,
    loadSavedProject: loadSavedProject,
    getSavedUIState: getSavedUIState,
    writeBackup: writeBackup,
    getBackupMeta: getBackupMeta,
    loadBackup: loadBackup,
    clearAllData: clearAllData,
    getUnreadableSavedData: getUnreadableSavedData,
    defaultUI: defaultUI
  };
})();
