/**
 * Commissioner surface (optional, station index 10).
 *
 * A utilization-focused commissioning cockpit over the shared evaluation context.
 * Where the evaluator does the craft, the commissioner does the governance: name
 * who the evaluation is FOR and the decisions it must serve, quality-assure the
 * design before fieldwork spend, keep delivery on schedule, and drive findings all
 * the way to implementation and use.
 *
 * The surface is organised as the commissioner's arc, in four movements:
 *   1. COMMISSION - design for use. Primary/secondary intended users, the use each
 *      will make of the evaluation, when they need it, and whether the design (the
 *      evaluation questions) actually serves each use. Grounded in Patton's
 *      utilization-focused evaluation: name the primary intended users and their
 *      intended uses first, and let that shape the design.
 *   2. ASSURE - the inception design-QA gate before money is spent. Per-question
 *      method / source / use coverage, a strength-of-evidence rating, and a recorded
 *      gate decision with conditions.
 *   3. DELIVER - track the ToR deliverables against their due dates and review
 *      bodies, and watch delivery risks.
 *   4. USE - the management-response and recommendation-uptake register tracked to
 *      implementation, and the dissemination products each audience needs to act.
 *
 * Grounded in two real, oversight-body-approved ToRs (Global Fund Malaria SNT,
 * Gavi Zero-Dose). No-JSX React.createElement, workbench house style. window.Commissioner.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var I = window.PraxisIcons;

  // ---- funder profiles ----------------------------------------------------
  // Governance labels + vocabulary per commissioner. GAVI has no two-scorer
  // reconciliation step; the profiles never impose one funder's mechanic on the other.
  var PROFILES = {
    global_fund: {
      key: 'global_fund', label: 'Global Fund', accent: 'var(--blue)',
      oversight: 'Independent Evaluation Panel (IEP)',
      manager: 'ELO Evaluation Manager',
      gateReviewers: 'ELO, Secretariat Teams, External Reference Group and IEP',
      soeNote: 'Strength of evidence, assessed and documented at each evaluation question (bid to inception to appraisal).'
    },
    gavi: {
      key: 'gavi', label: 'Gavi', accent: 'var(--teal-ink)',
      oversight: 'Evaluation Advisory Committee (EAC)',
      manager: 'Central Evaluation Team',
      gateReviewers: 'Central Evaluation Team, steering committee and EAC',
      soeNote: 'Strength-of-evidence rating at the evaluation-question level (EAC-assessed).'
    }
  };
  var GENERIC_PROFILE = {
    key: '', label: 'Commissioner', accent: 'var(--slate)',
    oversight: 'Independent oversight body', manager: 'Evaluation manager',
    gateReviewers: 'the commissioner and its oversight body',
    soeNote: 'Strength-of-evidence rating at the evaluation-question level.'
  };
  function profileOf(gov) { return PROFILES[gov && gov.funder_profile] || GENERIC_PROFILE; }

  // Commissioning lifecycle, the status ribbon across the top of the surface.
  var LIFECYCLE = [
    { key: 'originate', label: 'Originate' },
    { key: 'procure', label: 'Procure' },
    { key: 'gate', label: 'Gate' },
    { key: 'endorse', label: 'Endorse' },
    { key: 'track', label: 'Track' }
  ];

  // Strength-of-evidence scale (1 strongest .. 4 weakest), mirroring the ToR
  // bands the evaluation matrix already references in its judgementCriteria.
  var SOE = [
    { v: 1, label: 'Well triangulated', desc: 'Multiple independent sources agree', color: 'var(--green)' },
    { v: 2, label: 'Reasonably strong', desc: 'Some triangulation; minor gaps', color: 'var(--teal-dark)' },
    { v: 3, label: 'Limited', desc: 'Single source or thin evidence', color: 'var(--amber)' },
    { v: 4, label: 'Weak / unproven', desc: 'Unreliable or absent evidence', color: 'var(--red)' }
  ];

  // The inception package: the design artifacts a commissioner signs off before spend.
  var INCEPTION = [
    { field: 'evaluability', label: 'Evaluability' },
    { field: 'toc', label: 'Theory of Change' },
    { field: 'evaluation_matrix', label: 'Matrix' },
    { field: 'design_recommendation', label: 'Design' },
    { field: 'sample_parameters', label: 'Sample' }
  ];

  var GATE_DECISION = {
    approve: { label: 'Approved', badge: 'wb-badge-green' },
    conditions: { label: 'Approved with conditions', badge: 'wb-badge-amber' },
    return: { label: 'Returned for redesign', badge: 'wb-badge-red' }
  };
  var DISPOSITION = {
    agree: { label: 'Agree', badge: 'wb-badge-green' },
    partial: { label: 'Partially agree', badge: 'wb-badge-amber' },
    reject: { label: 'Reject', badge: 'wb-badge-red' }
  };
  var MR_STATUS = {
    planned: { label: 'Planned', badge: '' },
    in_progress: { label: 'In progress', badge: 'wb-badge-navy' },
    done: { label: 'Implemented', badge: 'wb-badge-green' },
    overdue: { label: 'Overdue', badge: 'wb-badge-red' }
  };
  var TL_STATUS = {
    planned: { label: 'Planned', badge: '', dot: 'var(--border-strong)' },
    in_review: { label: 'In review', badge: 'wb-badge-navy', dot: 'var(--blue)' },
    accepted: { label: 'Accepted', badge: 'wb-badge-green', dot: 'var(--green)' },
    late: { label: 'Late', badge: 'wb-badge-red', dot: 'var(--red)' }
  };
  var DIS_STATUS = {
    planned: { label: 'Planned', badge: '' },
    in_progress: { label: 'In progress', badge: 'wb-badge-navy' },
    delivered: { label: 'Delivered', badge: 'wb-badge-green' }
  };
  var RISK_STATUS = {
    open: { label: 'Open', badge: 'wb-badge-red' },
    mitigating: { label: 'Mitigating', badge: 'wb-badge-amber' },
    closed: { label: 'Closed', badge: 'wb-badge-green' }
  };
  var TIER = { primary: 'Primary', secondary: 'Secondary' };
  var LEVELS = ['low', 'medium', 'high'];

  // ---- helpers ------------------------------------------------------------
  function defaultCommissioner() {
    return {
      governance: { funder_profile: '', oversight_body: '', evaluation_manager: '', decision_clock: '', lifecycle_stage: '', purpose: '', primary_use: '' },
      users: [], gate: { decision: '', decided_by: '', decided_at: null, note: '', conditions: [] },
      appraisal: { profile: '', evidence: [] }, timeline: [], management_response: [],
      dissemination: [], risks: [], completed_at: null
    };
  }
  function fdate(iso) {
    if (!iso) return '-';
    try { return PraxisUtils.formatDate(iso); } catch (e) { return iso; }
  }
  function todayMs() { return Date.now(); }
  function ms(iso) { var t = iso ? new Date(iso).getTime() : NaN; return isNaN(t) ? null : t; }
  function daysUntil(iso) {
    var t = ms(iso); if (t == null) return null;
    return Math.round((t - todayMs()) / 86400000);
  }
  function levelIdx(level) { var i = LEVELS.indexOf(level); return i < 0 ? 1 : i; } // low0 med1 high2

  function evidenceMap(appraisal) {
    var m = {};
    ((appraisal && appraisal.evidence) || []).forEach(function(e) { if (e && e.eq_id != null) m[e.eq_id] = e; });
    return m;
  }
  function meanSoE(appraisal) {
    var ev = (appraisal && appraisal.evidence) || [];
    var rated = ev.filter(function(e) { return typeof e.rating === 'number'; });
    if (!rated.length) return null;
    return rated.reduce(function(a, e) { return a + e.rating; }, 0) / rated.length;
  }
  function soeBand(mean) {
    if (mean == null) return null;
    if (mean <= 1.75) return 'Strong';
    if (mean <= 2.5) return 'Moderate';
    if (mean <= 3.25) return 'Limited';
    return 'Weak';
  }
  function hasMethod(row) { return !!(row.indicators && row.indicators.length); }
  function hasSource(row) { return !!(row.dataSources && row.dataSources.length); }

  // Set of EQ ids that at least one intended user's use depends on.
  function servedEqIds(users) {
    var s = {};
    (users || []).forEach(function(u) { (u.eq_refs || []).forEach(function(id) { s[id] = true; }); });
    return s;
  }
  // Resolve a user's eq_refs (ids) back to their EQ numbers, for display/editing.
  function refsToNumbers(refs, rows) {
    var byId = {}; rows.forEach(function(r) { byId[r.id] = r.number; });
    return (refs || []).map(function(id) { return byId[id]; }).filter(function(n) { return n != null; }).sort(function(a, b) { return a - b; });
  }
  // Parse a comma / space list of EQ numbers into the matching row ids.
  function numbersToRefs(text, rows) {
    var wanted = {};
    String(text || '').split(/[^0-9]+/).forEach(function(t) { if (t !== '') wanted[parseInt(t, 10)] = true; });
    return rows.filter(function(r) { return wanted[r.number]; }).map(function(r) { return r.id; });
  }

  // Effective delivery status: an open item whose due date has passed reads as late.
  function tlEffective(item) {
    if (item.status === 'accepted' || item.status === 'late') return item.status;
    var d = daysUntil(item.due_date);
    if (d != null && d < 0) return 'late';
    return item.status || 'planned';
  }
  function mrEffective(item) {
    if (item.status === 'done' || item.status === 'overdue') return item.status;
    var d = daysUntil(item.due_date);
    if (d != null && d < 0 && item.status !== 'done') return 'overdue';
    return item.status || 'planned';
  }

  // ---- small presentational helpers --------------------------------------
  function statusBadge(map, key) {
    var s = map[key] || { label: key, badge: '' };
    return h('span', { className: 'wb-badge ' + (s.badge || ''), style: s.badge ? null : { background: 'var(--surface-muted)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' } }, s.label);
  }
  function agingChip(iso, openStatuses, status) {
    var d = daysUntil(iso);
    if (d == null) return null;
    var isOpen = openStatuses.indexOf(status) !== -1;
    if (!isOpen) return null;                       // settled items don't age
    if (d < 0) return h('span', { className: 'wb-cm-age wb-cm-age--late' }, Math.abs(d) + 'd over');
    if (d <= 14) return h('span', { className: 'wb-cm-age wb-cm-age--soon' }, 'in ' + d + 'd');
    return h('span', { className: 'wb-cm-age' }, 'in ' + d + 'd');
  }
  function kpi(label, value, sub, tone) {
    return h('div', { className: 'wb-cm-kpi' + (tone ? ' wb-cm-kpi--' + tone : '') },
      h('div', { className: 'wb-cm-kpi-value' }, value),
      h('div', { className: 'wb-cm-kpi-label' }, label),
      sub != null ? h('div', { className: 'wb-cm-kpi-sub' }, sub) : null);
  }
  function govItem(label, value) {
    return h('div', { className: 'wb-cm-govitem' },
      h('span', { className: 'wb-cm-govitem-label' }, label),
      h('span', { className: 'wb-cm-govitem-value' }, value));
  }
  function moveHead(idx, kicker, title, desc) {
    return h('header', { className: 'wb-cm-move-head' },
      h('span', { className: 'wb-cm-move-idx', 'aria-hidden': 'true' }, idx),
      h('div', null,
        h('div', { className: 'wb-cm-move-kicker' }, kicker),
        h('h3', { className: 'wb-cm-move-title' }, title),
        h('p', { className: 'wb-cm-move-desc' }, desc)));
  }
  function meterBar(pct, tone) {
    return h('div', { className: 'wb-cm-meter', role: 'progressbar', 'aria-valuenow': Math.round(pct), 'aria-valuemin': 0, 'aria-valuemax': 100 },
      h('div', { className: 'wb-cm-meter-fill wb-cm-meter-fill--' + (tone || 'teal'), style: { width: Math.max(0, Math.min(100, pct)) + '%' } }));
  }

  // ========================================================================
  function Commissioner(props) {
    var state = props.state, dispatch = props.dispatch;
    var context = state.context;
    var cm = context.commissioner || defaultCommissioner();
    var gov = cm.governance || {};
    var users = cm.users || [];
    var gate = cm.gate || { conditions: [] };
    var appraisal = cm.appraisal || { evidence: [] };
    var register = cm.management_response || [];
    var timeline = cm.timeline || [];
    var dissem = cm.dissemination || [];
    var risks = cm.risks || [];
    var profile = profileOf(gov);
    var rows = (context.evaluation_matrix && context.evaluation_matrix.rows) || [];
    var evMap = evidenceMap(appraisal);
    var servedIds = servedEqIds(users);

    function save(next, msg, quiet) {
      dispatch({ type: AT.SAVE_STATION, stationId: 10, payload: { commissioner: next } });
      if (!quiet && msg) dispatch({ type: AT.SHOW_TOAST, message: msg, toastType: 'success' });
    }
    // Full commissioner object every save (deepMerge replaces arrays wholesale).
    function patch(partial) {
      return Object.assign({}, cm, partial, { completed_at: cm.completed_at || new Date().toISOString() });
    }
    function setGov(p, msg, quiet) { save(patch({ governance: Object.assign({}, gov, p) }), msg, quiet); }

    function setProfile(key) {
      var p = PROFILES[key] || GENERIC_PROFILE;
      setGov({ funder_profile: key, oversight_body: gov.oversight_body || p.oversight, evaluation_manager: gov.evaluation_manager || p.manager }, 'Commissioner profile set to ' + p.label);
      save(patch({ governance: Object.assign({}, gov, { funder_profile: key, oversight_body: gov.oversight_body || p.oversight, evaluation_manager: gov.evaluation_manager || p.manager }), appraisal: Object.assign({}, appraisal, { profile: key }) }), null, true);
    }
    function setStage(k) { setGov({ lifecycle_stage: k }, null, true); }

    // ---- collection setters (generic list edit) --------------------------
    function listSetter(key, arr) {
      return {
        add: function(item, msg) { save(patch(kv(key, arr.concat([item]))), msg); },
        set: function(id, p, quiet) { save(patch(kv(key, arr.map(function(x) { return x.id === id ? Object.assign({}, x, p) : x; }))), null, quiet !== false); },
        remove: function(id) { save(patch(kv(key, arr.filter(function(x) { return x.id !== id; }))), null, true); }
      };
    }
    function kv(k, v) { var o = {}; o[k] = v; return o; }

    var usersApi = listSetter('users', users);
    var tlApi = listSetter('timeline', timeline);
    var disApi = listSetter('dissemination', dissem);
    var riskApi = listSetter('risks', risks);

    function addUser(tier) {
      usersApi.add({ id: PraxisUtils.uid('usr_'), name: '', role: '', tier: tier || 'primary', intended_use: '', decision_window: '', influence: 'medium', interest: 'medium', eq_refs: [] }, 'Intended user added');
    }
    function setUserRefs(id, text) {
      usersApi.set(id, { eq_refs: numbersToRefs(text, rows) });
    }

    // appraisal / gate setters
    function setRating(eqId, v) {
      var ev = (appraisal.evidence || []).slice();
      var idx = ev.findIndex(function(e) { return e.eq_id === eqId; });
      if (idx === -1) ev.push({ eq_id: eqId, rating: v, justification: '' }); else ev[idx] = Object.assign({}, ev[idx], { rating: v });
      save(patch({ appraisal: Object.assign({}, appraisal, { evidence: ev }) }), null, true);
    }
    function setJustification(eqId, text) {
      var ev = (appraisal.evidence || []).slice();
      var idx = ev.findIndex(function(e) { return e.eq_id === eqId; });
      if (idx === -1) ev.push({ eq_id: eqId, rating: null, justification: text }); else ev[idx] = Object.assign({}, ev[idx], { justification: text });
      save(patch({ appraisal: Object.assign({}, appraisal, { evidence: ev }) }), null, true);
    }
    function setGate(decision) { save(patch({ gate: Object.assign({}, gate, { decision: decision, decided_at: new Date().toISOString() }) }), 'Inception decision recorded: ' + (GATE_DECISION[decision] ? GATE_DECISION[decision].label : decision)); }
    function setGateNote(text) { save(patch({ gate: Object.assign({}, gate, { note: text }) }), null, true); }
    function addCondition() { save(patch({ gate: Object.assign({}, gate, { conditions: (gate.conditions || []).concat([{ id: PraxisUtils.uid('cond_'), text: '', resolved: false }]) }) }), null, true); }
    function setCondition(id, p) { save(patch({ gate: Object.assign({}, gate, { conditions: (gate.conditions || []).map(function(c) { return c.id === id ? Object.assign({}, c, p) : c; }) }) }), null, true); }
    function removeCondition(id) { save(patch({ gate: Object.assign({}, gate, { conditions: (gate.conditions || []).filter(function(c) { return c.id !== id; }) }) }), null, true); }

    function addRecommendation() {
      save(patch({ management_response: register.concat([{ id: PraxisUtils.uid('rec_'), code: 'R' + (register.length + 1), recommendation: '', disposition: 'agree', owner: '', secondary_owner: '', due_date: '', status: 'planned', actions: '', evidence_note: '', next_review: '' }]) }), 'Recommendation added');
    }
    function setMR(id, p, msg) { save(patch({ management_response: register.map(function(r) { return r.id === id ? Object.assign({}, r, p) : r; }) }), msg, !msg); }

    function addDeliverable() { tlApi.add({ id: PraxisUtils.uid('del_'), name: '', type: '', due_date: '', reviewers: '', status: 'planned', note: '' }, 'Deliverable added'); }
    function addProduct() { disApi.add({ id: PraxisUtils.uid('dis_'), product: '', format: '', audience: '', due_date: '', status: 'planned', note: '' }, 'Dissemination product added'); }
    function addRisk() { riskApi.add({ id: PraxisUtils.uid('rsk_'), risk: '', category: '', likelihood: 'medium', impact: 'medium', mitigation: '', owner: '', status: 'open' }, 'Risk added'); }

    // ---- derived / cockpit KPIs ------------------------------------------
    var primaryUsers = users.filter(function(u) { return u.tier === 'primary'; });
    var usesDefined = users.filter(function(u) { return (u.intended_use || '').trim(); });
    var usesCovered = usesDefined.filter(function(u) { return (u.eq_refs || []).length; });
    var coveragePct = usesDefined.length ? (usesCovered.length / usesDefined.length) * 100 : 0;

    var noSource = rows.filter(function(r) { return !hasSource(r); }).length;
    var mean = meanSoE(appraisal);
    var band = soeBand(mean);
    var gateLabel = gate.decision && GATE_DECISION[gate.decision] ? GATE_DECISION[gate.decision].label : 'Not decided';
    var gateTone = gate.decision === 'approve' ? 'good' : (gate.decision ? 'warn' : null);

    var tlAccepted = timeline.filter(function(t) { return tlEffective(t) === 'accepted'; }).length;
    var tlLate = timeline.filter(function(t) { return tlEffective(t) === 'late'; }).length;
    var mrDone = register.filter(function(r) { return mrEffective(r) === 'done'; }).length;
    var mrOverdue = register.filter(function(r) { return mrEffective(r) === 'overdue'; }).length;

    var hasAnything = rows.length || register.length || users.length || timeline.length || gov.funder_profile;

    // ---- header -----------------------------------------------------------
    var header = h('div', { className: 'wb-panel-header wb-cm-header' },
      h('div', { className: 'wb-cm-head-l' },
        h('div', { className: 'wb-station-label' }, 'OPTIONAL SURFACE'),
        h('h2', { className: 'wb-station-title' }, 'Commissioner'),
        h('p', { className: 'wb-station-desc' }, 'Own the evaluation as its commissioner: name who it is for and the decisions it must serve, quality-assure the design before spend, hold delivery to schedule, and drive findings to use.')),
      h('div', { className: 'wb-cm-profile' },
        gov.funder_profile
          ? h('span', { className: 'wb-cm-chip', style: { borderColor: profile.accent, color: profile.accent } }, profile.label)
          : h('div', { className: 'wb-cm-profile-pick' },
              h('span', { className: 'wb-cm-profile-pick-label' }, 'Commissioner profile'),
              h('div', { className: 'wb-cm-profile-btns' },
                ['global_fund', 'gavi'].map(function(k) {
                  return h('button', { key: k, className: 'wb-btn wb-btn-sm', onClick: function() { setProfile(k); } }, PROFILES[k].label);
                })))));

    // Decision clock: the north-star the whole evaluation serves.
    var clock = (gov.funder_profile) ? h('div', { className: 'wb-cm-clock' },
      h('div', { className: 'wb-cm-clock-l' },
        h('span', { className: 'wb-cm-clock-eyebrow' }, 'Decision this evaluation serves'),
        h('input', { className: 'wb-cm-clock-input', type: 'text', placeholder: 'e.g. Grant Cycle 8 funding requests',
          defaultValue: gov.decision_clock || '', 'aria-label': 'Decision clock',
          onBlur: function(e) { setGov({ decision_clock: e.target.value }, null, true); } })),
      h('div', { className: 'wb-cm-clock-meta' },
        govItem('Independent oversight', gov.oversight_body || profile.oversight),
        gov.evaluation_manager ? govItem('Day-to-day', gov.evaluation_manager) : null)) : null;

    // ---- lifecycle spine (status ribbon) ---------------------------------
    var reached = {
      originate: !!(gov.purpose || users.length),
      procure: !!(timeline.length),
      gate: !!(gate.decision),
      endorse: !!(register.length),
      track: !!(mrDone || dissem.some(function(d) { return d.status === 'delivered'; }))
    };
    var currentStage = gov.lifecycle_stage || (gate.decision ? (register.length ? 'track' : 'endorse') : (users.length ? 'gate' : 'originate'));
    var spine = h('div', { className: 'wb-cm-spine', role: 'group', 'aria-label': 'Commissioning lifecycle' },
      LIFECYCLE.map(function(s, i) {
        var active = s.key === currentStage;
        var done = reached[s.key] && !active;
        return h(React.Fragment, { key: s.key },
          i ? h('span', { className: 'wb-cm-spine-link', 'aria-hidden': 'true' }) : null,
          h('button', { type: 'button',
            className: 'wb-cm-stage' + (active ? ' wb-cm-stage--active' : '') + (done ? ' wb-cm-stage--done' : ''),
            'aria-pressed': active ? 'true' : 'false',
            onClick: function() { setStage(s.key); } },
            h('span', { className: 'wb-cm-stage-dot' }, done ? I.check(10) : null), s.label));
      }));

    // ---- cockpit KPI row --------------------------------------------------
    var kpis = h('div', { className: 'wb-cm-kpis' },
      kpi('Primary intended users', String(primaryUsers.length), primaryUsers.length ? 'named' : 'name them first', primaryUsers.length ? 'good' : 'warn'),
      kpi('Use-to-question coverage', usesDefined.length ? (usesCovered.length + ' / ' + usesDefined.length) : '-', usesDefined.length ? Math.round(coveragePct) + '% of uses served' : 'no uses yet', usesDefined.length && usesCovered.length < usesDefined.length ? 'warn' : (usesDefined.length ? 'good' : null)),
      kpi('Strength of evidence', mean != null ? mean.toFixed(1) + ' / 4' : '-', band ? band + ' (1 strongest)' : 'not rated', band === 'Weak' || band === 'Limited' ? 'warn' : (band ? 'good' : null)),
      kpi('Inception gate', gateLabel, gate.decided_at ? fdate(gate.decided_at) : 'awaiting decision', gateTone),
      kpi('Deliverables on track', timeline.length ? (tlAccepted + ' / ' + timeline.length) : '-', tlLate ? tlLate + ' late' : (timeline.length ? 'accepted' : 'no schedule'), tlLate ? 'warn' : (timeline.length ? 'good' : null)),
      kpi('Recommendations used', register.length ? (mrDone + ' / ' + register.length) : '-', mrOverdue ? mrOverdue + ' overdue' : (register.length ? 'implemented' : 'none yet'), mrOverdue ? 'warn' : (register.length ? 'good' : null)));

    if (!hasAnything) {
      return h('div', { className: 'wb-cm' }, header,
        h(SectionCard, { title: 'Commissioner', bodyType: 'empty' },
          h('div', { className: 'wb-station-empty' },
            h('div', { className: 'wb-station-empty-title' }, 'Nothing to commission yet'),
            h('div', { className: 'wb-station-empty-desc' }, 'Open a worked example, or build an evaluation matrix in Station 2, and the intended-user register, design-QA gate, delivery schedule and uptake register appear here.'))));
    }

    return h('div', { className: 'wb-cm' },
      header, clock, spine, kpis,
      commissionMovement({ users: users, rows: rows, gov: gov, servedIds: servedIds, usesDefined: usesDefined, usesCovered: usesCovered, coveragePct: coveragePct,
        api: { setGov: setGov, addUser: addUser, setUser: usersApi.set, removeUser: usersApi.remove, setUserRefs: setUserRefs } }),
      assureMovement({ rows: rows, evMap: evMap, gate: gate, profile: profile, context: context, servedIds: servedIds, appraisal: appraisal,
        api: { setRating: setRating, setJustification: setJustification, setGate: setGate, setGateNote: setGateNote, addCondition: addCondition, setCondition: setCondition, removeCondition: removeCondition } }),
      deliverMovement({ timeline: timeline, risks: risks, api: { addDeliverable: addDeliverable, setDeliverable: tlApi.set, removeDeliverable: tlApi.remove, addRisk: addRisk, setRisk: riskApi.set, removeRisk: riskApi.remove } }),
      useMovement({ register: register, dissem: dissem, users: users, profile: profile, api: { setMR: setMR, addRecommendation: addRecommendation, addProduct: addProduct, setProduct: disApi.set, removeProduct: disApi.remove } }));
  }

  // ==================== MOVEMENT 1 - COMMISSION ===========================
  function commissionMovement(p) {
    var users = p.users, rows = p.rows, gov = p.gov, servedIds = p.servedIds, api = p.api;
    var primary = users.filter(function(u) { return u.tier === 'primary'; });
    var secondary = users.filter(function(u) { return u.tier === 'secondary'; });

    var focus = h('div', { className: 'wb-cm-focus' },
      h('div', { className: 'wb-cm-focus-field' },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-purpose' }, 'Evaluation purpose'),
        h('textarea', { id: 'cm-purpose', className: 'wb-input wb-cm-focus-input', rows: 2, placeholder: 'What this evaluation is for, in one or two sentences.',
          defaultValue: gov.purpose || '', onBlur: function(e) { api.setGov({ purpose: e.target.value }, null, true); } })),
      h('div', { className: 'wb-cm-focus-field' },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-use' }, 'Primary intended use'),
        h('textarea', { id: 'cm-use', className: 'wb-input wb-cm-focus-input', rows: 2, placeholder: 'The single most important use, and by whom (the "so that").',
          defaultValue: gov.primary_use || '', onBlur: function(e) { api.setGov({ primary_use: e.target.value }, null, true); } })));

    function userTable(list, tier) {
      if (!list.length) return null;
      return h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table wb-cm-user-table' },
          h('thead', null, h('tr', null,
            h('th', null, tier === 'primary' ? 'Primary intended user' : 'Secondary user'),
            h('th', null, 'Intended use (the decision or action)'),
            h('th', { style: { minWidth: 120 } }, 'Needs it by'),
            h('th', { className: 'wb-th--center', style: { width: 92 } }, 'Serves EQ'),
            h('th', { className: 'wb-th--center', style: { width: 116 } }, 'Influence / interest'),
            h('th', { style: { width: 34 } }, ''))),
          h('tbody', null, list.map(function(u) {
            var nums = refsToNumbers(u.eq_refs, rows);
            return h('tr', { key: u.id },
              h('td', null,
                h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'user / body', defaultValue: u.name || '', 'aria-label': 'User name', onBlur: function(e) { api.setUser(u.id, { name: e.target.value }); } }),
                h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--sub', type: 'text', placeholder: 'role', defaultValue: u.role || '', 'aria-label': 'User role', onBlur: function(e) { api.setUser(u.id, { role: e.target.value }); } })),
              h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'what they will do with the findings', defaultValue: u.intended_use || '', 'aria-label': 'Intended use', onBlur: function(e) { api.setUser(u.id, { intended_use: e.target.value }); } })),
              h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'decision window', defaultValue: u.decision_window || '', 'aria-label': 'Decision window', onBlur: function(e) { api.setUser(u.id, { decision_window: e.target.value }); } })),
              h('td', { className: 'wb-th--center' }, rows.length
                ? h('input', { className: 'wb-input wb-cm-inp wb-cm-eqinp' + (nums.length ? '' : ' wb-cm-eqinp--empty'), type: 'text', placeholder: 'e.g. 1, 13', defaultValue: nums.join(', '), title: 'Evaluation questions that serve this use', 'aria-label': 'Evaluation questions serving this use', onBlur: function(e) { api.setUserRefs(u.id, e.target.value); } })
                : h('span', { className: 'wb-cm-muted' }, '-')),
              h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-lvls' },
                levelSelect(u.influence, 'Influence', function(v) { api.setUser(u.id, { influence: v }); }),
                levelSelect(u.interest, 'Interest', function(v) { api.setUser(u.id, { interest: v }); }))),
              h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove user', onClick: function() { api.removeUser(u.id); } }, I.close(14))));
          }))));
    }

    var body = users.length ? h(React.Fragment, null,
      h('div', { className: 'wb-cm-two' },
        h('div', { className: 'wb-cm-two-main' },
          h('div', { className: 'wb-cm-sub' }, 'Primary intended users', h('span', { className: 'wb-cm-sub-count' }, primary.length)),
          primary.length ? userTable(primary, 'primary') : h('p', { className: 'wb-cm-hint' }, 'Name the users who will act on this evaluation. Their decisions shape the questions.'),
          h('div', { className: 'wb-cm-sub wb-cm-sub--mt' }, 'Secondary users', h('span', { className: 'wb-cm-sub-count' }, secondary.length)),
          userTable(secondary, 'secondary'),
          h('div', { className: 'wb-cm-add' },
            h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { api.addUser('primary'); } }, '+ Primary user'),
            h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { api.addUser('secondary'); } }, '+ Secondary user'))),
        h('div', { className: 'wb-cm-two-side' },
          stakeholderGrid(users),
          coveragePanel(p.usesDefined, p.usesCovered, p.coveragePct)))
    ) : h('div', { className: 'wb-station-empty' },
      h('div', { className: 'wb-station-empty-desc' }, 'No intended users yet. Name who will use this evaluation, and their decisions become the test the design has to pass.'),
      h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { api.addUser('primary'); } }, '+ Add a primary user')));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Commission' },
      moveHead('01', 'Commission', 'Design for use', 'Utilization-focused evaluation starts here: name the primary intended users and the decisions they must make, then make sure the design serves each one.'),
      focus, body);
  }

  function levelSelect(value, label, onChange) {
    return h('select', { className: 'wb-cm-lvl-sel wb-cm-lvl-sel--' + (value || 'medium'), value: value || 'medium', 'aria-label': label, title: label, onChange: function(e) { onChange(e.target.value); } },
      LEVELS.slice().reverse().map(function(l) { return h('option', { key: l, value: l }, label.charAt(0) + ': ' + l.charAt(0).toUpperCase() + l.slice(1)); }));
  }

  // Influence (y) x interest (x) engagement grid. Purposeful: it tells the
  // commissioner who to manage closely versus keep informed.
  function stakeholderGrid(users) {
    var quad = [
      { t: 'Keep satisfied', s: 'high influence, low interest', x: 'l', y: 't' },
      { t: 'Manage closely', s: 'engage as partners', x: 'r', y: 't' },
      { t: 'Monitor', s: 'low effort', x: 'l', y: 'b' },
      { t: 'Keep informed', s: 'show the findings', x: 'r', y: 'b' }
    ];
    var dots = users.map(function(u, i) {
      var xi = levelIdx(u.interest), yi = levelIdx(u.influence);
      var jit = ((i % 3) - 1) * 5;
      var xp = [18, 50, 82][xi] + jit, yp = [18, 50, 82][yi] - jit;
      var primary = u.tier === 'primary';
      return h('span', { key: u.id, className: 'wb-cm-dot' + (primary ? ' wb-cm-dot--primary' : ' wb-cm-dot--secondary'),
        style: { left: xp + '%', bottom: yp + '%' }, title: (u.name || 'user') + ' - ' + TIER[u.tier] });
    });
    return h('div', { className: 'wb-cm-grid-wrap' },
      h('div', { className: 'wb-cm-grid-title' }, 'Engage the right users'),
      h('div', { className: 'wb-cm-grid' },
        quad.map(function(q, i) { return h('div', { key: i, className: 'wb-cm-quad wb-cm-quad--' + q.x + q.y },
          h('span', { className: 'wb-cm-quad-t' }, q.t), h('span', { className: 'wb-cm-quad-s' }, q.s)); }),
        h('div', { className: 'wb-cm-grid-plot' }, dots),
        h('span', { className: 'wb-cm-axis wb-cm-axis--y' }, 'Influence'),
        h('span', { className: 'wb-cm-axis wb-cm-axis--x' }, 'Interest')),
      h('div', { className: 'wb-cm-grid-legend' },
        h('span', null, h('i', { className: 'wb-cm-dot wb-cm-dot--primary wb-cm-dot--static' }), 'Primary'),
        h('span', null, h('i', { className: 'wb-cm-dot wb-cm-dot--secondary wb-cm-dot--static' }), 'Secondary')));
  }

  function coveragePanel(defined, covered, pct) {
    var gap = defined.filter(function(u) { return !(u.eq_refs || []).length; });
    var tone = defined.length ? (covered.length === defined.length ? 'good' : 'warn') : 'teal';
    return h('div', { className: 'wb-cm-cov' },
      h('div', { className: 'wb-cm-cov-head' },
        h('span', { className: 'wb-cm-cov-title' }, 'Use-to-question coverage'),
        h('span', { className: 'wb-cm-cov-num' }, defined.length ? (covered.length + '/' + defined.length) : '-')),
      meterBar(pct, tone === 'good' ? 'green' : (tone === 'warn' ? 'amber' : 'teal')),
      h('p', { className: 'wb-cm-cov-note' }, defined.length
        ? (gap.length
            ? gap.length + ' intended use' + (gap.length > 1 ? 's are' : ' is') + ' not yet served by any evaluation question. Fix the design before the gate.'
            : 'Every named use is served by at least one evaluation question.')
        : 'Add intended uses, then link the questions that serve each. Uncovered uses are design gaps to close before spend.'));
  }

  // ==================== MOVEMENT 2 - ASSURE ===============================
  function assureMovement(p) {
    var rows = p.rows, evMap = p.evMap, gate = p.gate, profile = p.profile, context = p.context, servedIds = p.servedIds, api = p.api;
    var withSource = rows.filter(function(r) { return hasSource(r); }).length;
    var served = rows.filter(function(r) { return servedIds[r.id]; }).length;

    var inceptionChips = h('div', { className: 'wb-cm-inception' },
      h('span', { className: 'wb-cm-inception-label' }, 'Inception package'),
      INCEPTION.map(function(s) {
        var done = !!(context && context[s.field] && context[s.field].completed_at);
        return h('span', { key: s.field, className: 'wb-cm-inception-chip' + (done ? ' wb-cm-inception-chip--done' : '') }, done ? I.check(11) : null, s.label);
      }));

    var table = rows.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', { style: { width: 34 } }, '#'),
          h('th', null, 'Evaluation question'),
          h('th', { className: 'wb-th--center' }, 'Method'),
          h('th', { className: 'wb-th--center' }, 'Source'),
          h('th', { className: 'wb-th--center' }, 'Serves a use'),
          h('th', { className: 'wb-th--center', style: { minWidth: 150 } }, 'Strength of evidence'),
          h('th', null, 'Commissioner note'))),
        h('tbody', null, rows.map(function(r) {
          var ev = evMap[r.id] || {};
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, r.number != null ? r.number : ''),
            h('td', null, h('div', { className: 'wb-cm-eq' }, r.question || '(untitled question)')),
            h('td', { className: 'wb-th--center' }, hasMethod(r) ? okMark() : warnMark('No indicator/method')),
            h('td', { className: 'wb-th--center' }, hasSource(r) ? okMark() : warnMark('No named data source')),
            h('td', { className: 'wb-th--center' }, servedIds[r.id] ? okMark() : dashMark('Not linked to an intended use')),
            h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-soe' },
              SOE.map(function(s) {
                var on = ev.rating === s.v;
                return h('button', { key: s.v, type: 'button', className: 'wb-cm-soe-btn wb-cm-soe-btn--' + s.v + (on ? ' wb-cm-soe-btn--on' : ''), title: s.v + ' - ' + s.label + ': ' + s.desc, 'aria-label': 'Strength of evidence ' + s.v + ', ' + s.label, onClick: function() { api.setRating(r.id, s.v); } }, String(s.v));
              }))),
            h('td', null, h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'why this rating', defaultValue: ev.justification || '', 'aria-label': 'Commissioner note for question ' + (r.number || ''), onBlur: function(e) { api.setJustification(r.id, e.target.value); } })));
        })))) : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No evaluation questions yet. Build the matrix in Station 2 and each question appears here for design QA.'));

    var decided = gate.decision && GATE_DECISION[gate.decision];
    var decisionRow = h('div', { className: 'wb-cm-decision' },
      h('div', { className: 'wb-cm-decision-head' },
        h('span', { className: 'wb-cm-decision-title' }, 'Inception decision'),
        decided ? h('span', { className: 'wb-badge ' + GATE_DECISION[gate.decision].badge }, GATE_DECISION[gate.decision].label) : null,
        gate.decided_at ? h('span', { className: 'wb-cm-decision-when' }, fdate(gate.decided_at)) : null),
      h('p', { className: 'wb-cm-decision-sub' }, 'Reviewed by ' + profile.gateReviewers + ', before fieldwork spend. ' + withSource + ' of ' + rows.length + ' questions have a named data source; ' + served + ' trace to an intended use.'),
      h('div', { className: 'wb-cm-decision-btns' },
        [['approve', 'Approve'], ['conditions', 'Approve with conditions'], ['return', 'Return for redesign']].map(function(pair) {
          var on = gate.decision === pair[0];
          return h('button', { key: pair[0], type: 'button', className: 'wb-btn wb-btn-sm' + (on ? ' wb-btn-primary' : ''), onClick: function() { api.setGate(pair[0]); } }, pair[1]);
        })),
      gate.decision === 'conditions' ? conditionsBlock(gate, api) : null,
      h('textarea', { className: 'wb-input wb-cm-decision-note', rows: 2, placeholder: 'Decision rationale (optional)', defaultValue: gate.note || '', onBlur: function(e) { api.setGateNote(e.target.value); } }));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Assure' },
      moveHead('02', 'Assure', 'Quality-gate before spend', 'The commissioner signs off the design at inception, when course-correction is still cheap. Each question is checked for a method, a named source, and whether it serves a named use.'),
      h('div', { className: 'wb-cm-assure-top' },
        soeDistribution(rows, evMap),
        inceptionChips),
      h(SectionCard, { title: 'Inception design QA', badge: withSource + ' / ' + rows.length + ' sourced', variant: (rows.length && withSource < rows.length) ? 'warning' : null },
        h('p', { className: 'wb-cm-panel-intro' }, profile.soeNote),
        table, decisionRow));
  }

  function soeDistribution(rows, evMap) {
    var counts = [0, 0, 0, 0], rated = 0;
    rows.forEach(function(r) { var ev = evMap[r.id]; if (ev && typeof ev.rating === 'number') { counts[ev.rating - 1]++; rated++; } });
    var max = Math.max(1, counts[0], counts[1], counts[2], counts[3]);
    return h('div', { className: 'wb-cm-dist' },
      h('div', { className: 'wb-cm-dist-head' }, h('span', { className: 'wb-cm-dist-title' }, 'Strength of evidence'), h('span', { className: 'wb-cm-dist-sub' }, rated + ' of ' + rows.length + ' rated')),
      h('div', { className: 'wb-cm-dist-bars' }, SOE.map(function(s, i) {
        return h('div', { key: s.v, className: 'wb-cm-dist-col', title: s.label + ': ' + counts[i] },
          h('div', { className: 'wb-cm-dist-track' }, h('div', { className: 'wb-cm-dist-fill', style: { height: (counts[i] / max * 100) + '%', background: s.color } })),
          h('span', { className: 'wb-cm-dist-n' }, counts[i]),
          h('span', { className: 'wb-cm-dist-x' }, s.v));
      })),
      h('div', { className: 'wb-cm-dist-scale' }, h('span', null, 'Strongest'), h('span', null, 'Weakest')));
  }

  function conditionsBlock(gate, api) {
    var conds = gate.conditions || [];
    return h('div', { className: 'wb-cm-conditions' },
      h('div', { className: 'wb-cm-conditions-label' }, 'Conditions to clear before final acceptance'),
      conds.map(function(c) {
        return h('div', { key: c.id, className: 'wb-cm-condition' },
          h('button', { type: 'button', className: 'wb-cm-cond-check' + (c.resolved ? ' wb-cm-cond-check--on' : ''), 'aria-label': c.resolved ? 'Mark condition unresolved' : 'Mark condition resolved', onClick: function() { api.setCondition(c.id, { resolved: !c.resolved }); } }, c.resolved ? I.check(12) : ''),
          h('input', { className: 'wb-input wb-cm-cond-text', type: 'text', placeholder: 'condition', defaultValue: c.text || '', onBlur: function(e) { api.setCondition(c.id, { text: e.target.value }); } }),
          h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove condition', onClick: function() { api.removeCondition(c.id); } }, I.close(14)));
      }),
      h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: api.addCondition }, '+ Add condition'));
  }

  // ==================== MOVEMENT 3 - DELIVER ==============================
  function deliverMovement(p) {
    var timeline = p.timeline, risks = p.risks, api = p.api;
    var openRisks = risks.filter(function(r) { return r.status !== 'closed'; }).length;

    var body = timeline.length ? h(React.Fragment, null,
      milestoneTrack(timeline),
      h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Deliverable'),
            h('th', null, 'Reviewers'),
            h('th', { className: 'wb-th--center', style: { minWidth: 120 } }, 'Due'),
            h('th', { style: { minWidth: 118 } }, 'Status'),
            h('th', { style: { width: 34 } }, ''))),
          h('tbody', null, timeline.slice().sort(byDue).map(function(t) {
            var eff = tlEffective(t);
            return h('tr', { key: t.id },
              h('td', null,
                h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'deliverable', defaultValue: t.name || '', 'aria-label': 'Deliverable name', onBlur: function(e) { api.setDeliverable(t.id, { name: e.target.value }); } }),
                t.type ? h('span', { className: 'wb-cm-inp--sub wb-cm-muted' }, t.type) : null),
              h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'review body', defaultValue: t.reviewers || '', 'aria-label': 'Reviewers', onBlur: function(e) { api.setDeliverable(t.id, { reviewers: e.target.value }); } })),
              h('td', { className: 'wb-th--center' },
                h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', defaultValue: t.due_date || '', 'aria-label': 'Due date', onBlur: function(e) { api.setDeliverable(t.id, { due_date: e.target.value }); } }),
                agingChip(t.due_date, ['planned', 'in_review'], eff)),
              h('td', null, h('select', { className: 'wb-input wb-cm-select', value: t.status || 'planned', 'aria-label': 'Deliverable status', onChange: function(e) { api.setDeliverable(t.id, { status: e.target.value }); } },
                Object.keys(TL_STATUS).map(function(k) { return h('option', { key: k, value: k }, TL_STATUS[k].label); }))),
              h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove deliverable', onClick: function() { api.removeDeliverable(t.id); } }, I.close(14))));
          }))))
    ) : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No delivery schedule yet. Add the ToR deliverables with their due dates and review bodies to track them to on-time delivery.'));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Deliver' },
      moveHead('03', 'Deliver', 'Hold delivery to schedule', 'Track every deliverable against its due date and review body, so slippage is visible while it can still be managed.'),
      h(SectionCard, { title: 'Delivery schedule', badge: timeline.length ? timeline.length + ' deliverables' : 'Empty' },
        body,
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: api.addDeliverable }, '+ Add deliverable'))),
      h(SectionCard, { title: 'Delivery risks', badge: risks.length ? (openRisks + ' open') : 'Empty', variant: openRisks ? 'warning' : null },
        h('p', { className: 'wb-cm-panel-intro' }, 'Risks to timely, credible delivery, reported to the evaluation manager with a mitigation and an owner.'),
        riskTable(risks, api),
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: api.addRisk }, '+ Add risk'))));
  }

  function byDue(a, b) { var x = ms(a.due_date), y = ms(b.due_date); if (x == null) return 1; if (y == null) return -1; return x - y; }

  // Horizontal milestone track with a today marker. Read-only at-a-glance;
  // the table below manages the detail.
  function milestoneTrack(timeline) {
    var dated = timeline.filter(function(t) { return ms(t.due_date) != null; });
    if (dated.length < 2) return null;
    var times = dated.map(function(t) { return ms(t.due_date); });
    var min = Math.min.apply(null, times), max = Math.max.apply(null, times);
    var span = Math.max(1, max - min);
    var now = todayMs();
    var showToday = now >= min && now <= max;
    var sorted = dated.slice().sort(byDue);
    return h('div', { className: 'wb-cm-track', role: 'img', 'aria-label': 'Delivery timeline with ' + dated.length + ' milestones' },
      h('div', { className: 'wb-cm-track-line' }),
      showToday ? h('div', { className: 'wb-cm-track-today', style: { left: ((now - min) / span * 100) + '%' } }, h('span', { className: 'wb-cm-track-today-lbl' }, 'today')) : null,
      sorted.map(function(t, i) {
        var xp = (ms(t.due_date) - min) / span * 100;
        var eff = tlEffective(t);
        var below = i % 2 === 1;
        return h('div', { key: t.id, className: 'wb-cm-mile' + (below ? ' wb-cm-mile--below' : ''), style: { left: xp + '%' } },
          h('span', { className: 'wb-cm-mile-dot', style: { background: (TL_STATUS[eff] || TL_STATUS.planned).dot } }),
          h('span', { className: 'wb-cm-mile-lbl' },
            h('span', { className: 'wb-cm-mile-name' }, t.name || 'deliverable'),
            h('span', { className: 'wb-cm-mile-date' }, fdate(t.due_date))));
      }));
  }

  function riskTable(risks, api) {
    if (!risks.length) return h('p', { className: 'wb-cm-hint' }, 'No risks logged.');
    return h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', null, 'Risk'),
          h('th', null, 'Mitigation'),
          h('th', null, 'Owner'),
          h('th', { className: 'wb-th--center', style: { width: 76 } }, 'L / I'),
          h('th', { style: { minWidth: 110 } }, 'Status'),
          h('th', { style: { width: 34 } }, ''))),
        h('tbody', null, risks.map(function(r) {
          return h('tr', { key: r.id },
            h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'risk', defaultValue: r.risk || '', 'aria-label': 'Risk', onBlur: function(e) { api.setRisk(r.id, { risk: e.target.value }); } })),
            h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'mitigation', defaultValue: r.mitigation || '', 'aria-label': 'Mitigation', onBlur: function(e) { api.setRisk(r.id, { mitigation: e.target.value }); } })),
            h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'owner', defaultValue: r.owner || '', 'aria-label': 'Owner', onBlur: function(e) { api.setRisk(r.id, { owner: e.target.value }); } })),
            h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-li' },
              h('span', { className: 'wb-cm-li-b wb-cm-li-b--' + (r.likelihood || 'medium'), title: 'Likelihood: ' + (r.likelihood || 'medium') }, (r.likelihood || 'm').charAt(0).toUpperCase()),
              h('span', { className: 'wb-cm-li-b wb-cm-li-b--' + (r.impact || 'medium'), title: 'Impact: ' + (r.impact || 'medium') }, (r.impact || 'm').charAt(0).toUpperCase()))),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.status || 'open', 'aria-label': 'Risk status', onChange: function(e) { api.setRisk(r.id, { status: e.target.value }); } },
              Object.keys(RISK_STATUS).map(function(k) { return h('option', { key: k, value: k }, RISK_STATUS[k].label); }))),
            h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove risk', onClick: function() { api.removeRisk(r.id); } }, I.close(14))));
        }))));
  }

  // ==================== MOVEMENT 4 - USE =================================
  function useMovement(p) {
    var register = p.register, dissem = p.dissem, users = p.users, profile = p.profile, api = p.api;
    var dual = profile.key === 'gavi';
    var counts = { planned: 0, in_progress: 0, done: 0, overdue: 0 };
    register.forEach(function(r) { counts[mrEffective(r)] = (counts[mrEffective(r)] || 0) + 1; });

    var mrBody = register.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', { style: { width: 40 } }, 'Rec'),
          h('th', null, 'Recommendation'),
          h('th', { style: { minWidth: 128 } }, 'Response'),
          h('th', null, dual ? 'Owners (Alliance / national)' : 'Owner'),
          h('th', { className: 'wb-th--center' }, 'Due'),
          h('th', { style: { minWidth: 118 } }, 'Status'),
          h('th', null, 'Action taken / evidence'))),
        h('tbody', null, register.map(function(r) {
          var eff = mrEffective(r);
          return h('tr', { key: r.id },
            h('td', { className: 'wb-td--meta' }, r.code || ''),
            h('td', null, h('div', { className: 'wb-cm-rec' }, r.recommendation || '(recommendation)')),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.disposition || 'agree', 'aria-label': 'Management response for ' + (r.code || ''), onChange: function(e) { api.setMR(r.id, { disposition: e.target.value }); } },
              Object.keys(DISPOSITION).map(function(k) { return h('option', { key: k, value: k }, DISPOSITION[k].label); }))),
            h('td', null, h('div', { className: 'wb-cm-owner' }, r.owner || '-'), dual ? h('div', { className: 'wb-cm-owner wb-cm-owner--sec' }, r.secondary_owner || 'national programme') : null),
            h('td', { className: 'wb-td--meta wb-th--center' }, r.due_date ? fdate(r.due_date) : '-', agingChip(r.due_date, ['planned', 'in_progress'], eff)),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: r.status || 'planned', 'aria-label': 'Status for ' + (r.code || ''), onChange: function(e) { api.setMR(r.id, { status: e.target.value }); } },
              Object.keys(MR_STATUS).map(function(k) { return h('option', { key: k, value: k }, MR_STATUS[k].label); }))),
            h('td', null, h('div', { className: 'wb-cm-mr-act' },
              h('input', { className: 'wb-input wb-cm-note', type: 'text', placeholder: 'action / evidence of implementation', defaultValue: r.actions || '', 'aria-label': 'Action taken for ' + (r.code || ''), onBlur: function(e) { api.setMR(r.id, { actions: e.target.value }); } }),
              h('label', { className: 'wb-cm-mr-review' + (eff === 'done' ? ' wb-cm-mr-review--muted' : '') },
                h('span', null, 'Next review'),
                h('input', { className: 'wb-cm-mr-review-date', type: 'date', defaultValue: r.next_review || '', 'aria-label': 'Next review date for ' + (r.code || ''), onBlur: function(e) { api.setMR(r.id, { next_review: e.target.value }); } })))));
        })))) : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No recommendations tracked yet. Add the evaluation recommendations to record the response and follow each to implementation.'));

    var disBody = dissem.length ? h('div', { className: 'wb-table-container' },
      h('table', { className: 'wb-table wb-cm-table' },
        h('thead', null, h('tr', null,
          h('th', null, 'Product'),
          h('th', null, 'For whom'),
          h('th', { className: 'wb-th--center', style: { minWidth: 120 } }, 'Due'),
          h('th', { style: { minWidth: 118 } }, 'Status'),
          h('th', { style: { width: 34 } }, ''))),
        h('tbody', null, dissem.map(function(d) {
          return h('tr', { key: d.id },
            h('td', null,
              h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'product', defaultValue: d.product || '', 'aria-label': 'Product', onBlur: function(e) { api.setProduct(d.id, { product: e.target.value }); } }),
              d.format ? h('span', { className: 'wb-cm-inp--sub wb-cm-muted' }, d.format) : null),
            h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'audience', defaultValue: d.audience || '', 'aria-label': 'Audience', onBlur: function(e) { api.setProduct(d.id, { audience: e.target.value }); } })),
            h('td', { className: 'wb-th--center' }, h('input', { className: 'wb-input wb-cm-inp wb-cm-date', type: 'date', defaultValue: d.due_date || '', 'aria-label': 'Due date', onBlur: function(e) { api.setProduct(d.id, { due_date: e.target.value }); } })),
            h('td', null, h('select', { className: 'wb-input wb-cm-select', value: d.status || 'planned', 'aria-label': 'Product status', onChange: function(e) { api.setProduct(d.id, { status: e.target.value }); } },
              Object.keys(DIS_STATUS).map(function(k) { return h('option', { key: k, value: k }, DIS_STATUS[k].label); }))),
            h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove product', onClick: function() { api.removeProduct(d.id); } }, I.close(14))));
        })))) : h('div', { className: 'wb-station-empty' }, h('div', { className: 'wb-station-empty-desc' }, 'No dissemination products yet. Findings are only useful once they reach the people who act on them.'));

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Use' },
      moveHead('04', 'Use', 'Drive findings to use', 'A recommendation is not done when it is accepted; it is done when it is implemented. Track uptake to implementation, and make sure each audience gets the product it needs to act.'),
      register.length ? uptakeBar(counts, register.length) : null,
      h(SectionCard, { title: 'Management response and recommendation uptake', badge: register.length ? register.length + ' tracked' : 'Empty' },
        h('p', { className: 'wb-cm-panel-intro' }, 'The commissioner records a response to each recommendation and tracks whether it is acted on' + (dual ? ', across the Alliance and national immunisation programmes.' : '.')),
        mrBody,
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: api.addRecommendation }, '+ Add recommendation'))),
      h(SectionCard, { title: 'Dissemination and use', badge: dissem.length ? dissem.length + ' products' : 'Empty' },
        h('p', { className: 'wb-cm-panel-intro' }, 'The learning and communication products that carry the findings to each intended user, and whether they have been delivered.'),
        disBody,
        h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: api.addProduct }, '+ Add product'))));
  }

  function uptakeBar(counts, total) {
    var order = [
      { k: 'done', label: 'Implemented', color: 'var(--green)' },
      { k: 'in_progress', label: 'In progress', color: 'var(--blue)' },
      { k: 'planned', label: 'Planned', color: 'var(--border-strong)' },
      { k: 'overdue', label: 'Overdue', color: 'var(--red)' }
    ];
    return h('div', { className: 'wb-cm-uptake' },
      h('div', { className: 'wb-cm-uptake-head' },
        h('span', { className: 'wb-cm-uptake-title' }, 'Recommendation uptake'),
        h('span', { className: 'wb-cm-uptake-num' }, (counts.done || 0) + ' of ' + total + ' implemented')),
      h('div', { className: 'wb-cm-uptake-bar' }, order.map(function(o) {
        var n = counts[o.k] || 0; if (!n) return null;
        return h('div', { key: o.k, className: 'wb-cm-uptake-seg', style: { flexGrow: n, background: o.color }, title: o.label + ': ' + n });
      })),
      h('div', { className: 'wb-cm-uptake-legend' }, order.map(function(o) {
        var n = counts[o.k] || 0; if (!n) return null;
        return h('span', { key: o.k, className: 'wb-cm-uptake-leg' }, h('i', { style: { background: o.color } }), o.label, ' ', h('b', null, n));
      })));
  }

  // ---- marks --------------------------------------------------------------
  function okMark() { return h('span', { className: 'wb-cm-mark wb-cm-mark--ok', title: 'Present', 'aria-label': 'present' }, I.check(13)); }
  function warnMark(title) { return h('span', { className: 'wb-cm-mark wb-cm-mark--warn', title: title, 'aria-label': title }, '!'); }
  function dashMark(title) { return h('span', { className: 'wb-cm-mark wb-cm-mark--dash', title: title, 'aria-label': title }, ''); }

  window.Commissioner = Commissioner;
})();
