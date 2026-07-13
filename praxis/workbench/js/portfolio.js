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
  // be tracked. reached_use is the verdict shown on the track record: it
  // prefers the recorded ground truth from named intended users (use_outcome
  // on commissioner.users, see CockpitData.USE_OUTCOME) over the recommendation-
  // movement proxy, because a recommendation moving is not the same fact as a
  // decision maker actually using the evaluation. use_basis records which one
  // the verdict rests on so the card can render an honest badge instead of
  // reusing the word "use" for the proxy. This module loads right after
  // utils.js, before CockpitData, so the counts below are derived inline
  // rather than through CockpitData.useOutcomeRollup.
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
    var users = Array.isArray(cm.users) ? cm.users : [];
    var usersRecorded = 0, usersUsed = 0;
    users.forEach(function(u) {
      if (!u || u.tier !== 'primary') return;
      var outcome = u.use_outcome || '';
      if (!outcome) return;
      usersRecorded++;
      if (outcome === 'used') usersUsed++;
    });
    var basis = usersRecorded > 0 ? 'users' : 'recommendations';
    var reachedUse = usersRecorded > 0 ? (usersUsed > 0) : (moving > 0);
    return {
      id: context.project_id,
      title: ((context.project_meta || {}).title || '').trim() || 'Untitled evaluation',
      organisation: ((context.project_meta || {}).organisation || '').trim(),
      updated_at: context.updated_at || '',
      recommendations: register.length,
      accepted: accepted,
      implemented: implemented,
      moving: moving,
      users_recorded: usersRecorded,
      users_used: usersUsed,
      use_basis: basis,
      reached_use: reachedUse
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
