// PraxisPortfolio: the commissioner's track record across evaluations. The
// workbench holds one project at a time; this register is what survives from
// each of them. One compact row per project_id in localStorage, updated on
// autosave once a project has a management response to learn from. This is
// the instrument's answer to the portfolio belief in the eval-use model: a
// commissioner who has watched three evaluations go unused should be able to
// see that, not remember it.
(function() {
  'use strict';

  var KEY = 'praxis-workbench-portfolio';

  function store(s) {
    if (s) return s;
    try { return window.localStorage; } catch (e) { return null; }
  }

  function readAll(s) {
    var st = store(s);
    if (!st) return [];
    try {
      var arr = JSON.parse(st.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeAll(entries, s) {
    var st = store(s);
    if (!st) return;
    try { st.setItem(KEY, JSON.stringify(entries)); } catch (e) { /* quota: track record is best effort */ }
  }

  // A row is only worth keeping once there are recommendations whose fate can
  // be tracked. reached_use means at least one accepted action moved.
  function snapshot(context) {
    if (!context || typeof context.project_id !== 'string' || !context.project_id) return null;
    var cm = context.commissioner || {};
    var register = Array.isArray(cm.management_response) ? cm.management_response : [];
    if (!register.length) return null;
    var accepted = 0, moving = 0, implemented = 0;
    register.forEach(function(r) {
      if (!r) return;
      if (r.disposition === 'agree' || r.disposition === 'partial') accepted++;
      if (r.implementation_status === 'in_progress' || r.implementation_status === 'implemented') moving++;
      if (r.implementation_status === 'implemented') implemented++;
    });
    return {
      id: context.project_id,
      title: ((context.project_meta || {}).title || '').trim() || 'Untitled evaluation',
      organisation: ((context.project_meta || {}).organisation || '').trim(),
      updated_at: context.updated_at || '',
      recommendations: register.length,
      accepted: accepted,
      implemented: implemented,
      reached_use: moving > 0
    };
  }

  function record(context, s) {
    var snap = snapshot(context);
    if (!snap) return readAll(s);
    var entries = readAll(s).filter(function(e) { return e && e.id !== snap.id; });
    entries.push(snap);
    entries.sort(function(a, b) { return a.updated_at < b.updated_at ? 1 : (a.updated_at > b.updated_at ? -1 : 0); });
    writeAll(entries, s);
    return entries;
  }

  function remove(id, s) {
    var entries = readAll(s).filter(function(e) { return e && e.id !== id; });
    writeAll(entries, s);
    return entries;
  }

  var PraxisPortfolio = { KEY: KEY, snapshot: snapshot, readAll: readAll, record: record, remove: remove };
  window.PraxisPortfolio = PraxisPortfolio;
})();
