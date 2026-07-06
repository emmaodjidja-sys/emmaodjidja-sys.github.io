/**
 * CockpitSave: the shared save contract for the commissioner stations, so each station
 * mutates state the same way. window.CockpitSave.make(context, dispatch) returns an API.
 *
 * - commissioner.* fields are saved via SAVE_STATION stationId:10 with the FULL
 *   commissioner object (deepMerge replaces arrays wholesale).
 * - deliverable FIELD edits go through PATCH_DELIVERABLE (id-keyed, reduce-time) so C1
 *   (payment facet) and C3 (schedule facet) can never clobber each other.
 * - structural planning edits (add/remove deliverable, budget, invoices) save the full
 *   planning object via SAVE_STATION stationId:9.
 */
(function() {
  'use strict';
  var AT = PraxisContext.ACTION_TYPES;
  var D = window.CockpitData;

  function kv(k, v) { var o = {}; o[k] = v; return o; }

  function make(context, dispatch) {
    var cm = context.commissioner || D.defaultCommissioner();
    var pl = context.planning || { deliverables: [], budget_lines: [], invoices: [], contract: {} };

    function saveCommissioner(next, msg) {
      dispatch({ type: AT.SAVE_STATION, stationId: 10, payload: { commissioner: next } });
      if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: 'success' });
    }
    function patch(partial) {
      return Object.assign({}, cm, partial, { completed_at: cm.completed_at || new Date().toISOString() });
    }
    function setField(key, value, msg) { saveCommissioner(patch(kv(key, value)), msg); }
    function setGov(p, msg) { saveCommissioner(patch({ governance: Object.assign({}, cm.governance || {}, p) }), msg); }
    function setGate(p, msg) { saveCommissioner(patch({ gate: Object.assign({}, cm.gate || {}, p) }), msg); }
    function setReportReview(p, msg) { saveCommissioner(patch({ report_review: Object.assign({}, cm.report_review || {}, p) }), msg); }

    // Generic id-keyed list editor for a commissioner.* array (users, management_response,
    // dissemination, risks, appraisal.evidence handled separately).
    function listSetter(key) {
      var arr = cm[key] || [];
      return {
        add: function(item, msg) { saveCommissioner(patch(kv(key, arr.concat([item]))), msg); },
        set: function(id, p, msg) { saveCommissioner(patch(kv(key, arr.map(function(x) { return x.id === id ? Object.assign({}, x, p) : x; }))), msg); },
        remove: function(id, msg) { saveCommissioner(patch(kv(key, arr.filter(function(x) { return x.id !== id; }))), msg); }
      };
    }

    // Deliverables live in planning. Field edits use the id-keyed reducer path.
    function patchDeliverable(id, p) { dispatch({ type: AT.PATCH_DELIVERABLE, id: id, patch: p }); }
    function savePlanning(nextPlanning, msg) {
      dispatch({ type: AT.SAVE_STATION, stationId: 9, payload: { planning: nextPlanning } });
      if (msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: 'success' });
    }
    function addDeliverable(item, msg) { savePlanning(Object.assign({}, pl, { deliverables: (pl.deliverables || []).concat([item]) }), msg); }
    function removeDeliverable(id, msg) { savePlanning(Object.assign({}, pl, { deliverables: (pl.deliverables || []).filter(function(d) { return d.id !== id; }) }), msg); }

    return {
      cm: cm, pl: pl,
      saveCommissioner: saveCommissioner, patch: patch, setField: setField,
      setGov: setGov, setGate: setGate, setReportReview: setReportReview,
      listSetter: listSetter, patchDeliverable: patchDeliverable, savePlanning: savePlanning,
      addDeliverable: addDeliverable, removeDeliverable: removeDeliverable
    };
  }

  window.CockpitSave = { make: make };
})();
