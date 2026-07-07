/**
 * CockpitData: constants and pure helpers shared across the commissioner cockpit
 * (Overview + C0 Commission, C1 Contract, C2 Assure, C3 Deliver, C4 Use, C5 Follow-up).
 * No React, no DOM. window.CockpitData. Date math delegates to the fixed local-date
 * helpers in PraxisUtils (never new Date('YYYY-MM-DD'), which is UTC midnight).
 */
(function() {
  'use strict';
  var U = window.PraxisUtils;

  // ---- funder profiles ----------------------------------------------------
  var PROFILES = {
    global_fund: {
      key: 'global_fund', label: 'Global Fund', accent: 'var(--blue)',
      oversight: 'Independent Evaluation Panel (IEP)', manager: 'ELO Evaluation Manager',
      gateReviewers: 'ELO, Secretariat Teams, External Reference Group and IEP',
      dualOwners: false
    },
    gavi: {
      key: 'gavi', label: 'Gavi', accent: 'var(--teal-ink)',
      oversight: 'Evaluation Advisory Committee (EAC)', manager: 'Central Evaluation Team',
      gateReviewers: 'Central Evaluation Team, steering committee and EAC',
      dualOwners: true
    }
  };
  var GENERIC_PROFILE = {
    key: '', label: 'Commissioner', accent: 'var(--slate)',
    oversight: 'Independent oversight body', manager: 'Evaluation manager',
    gateReviewers: 'the commissioner and its oversight body', dualOwners: false
  };
  function profileOf(gov) { return PROFILES[gov && gov.funder_profile] || GENERIC_PROFILE; }

  // Commissioning lifecycle STATE (distinct vocabulary from the C0-C5 rail so the
  // spine reads as process state, not a copy of the navigation).
  var LIFECYCLE = [
    { key: 'originate', label: 'Originate' },
    { key: 'procure', label: 'Procure' },
    { key: 'gate', label: 'Gate' },
    { key: 'endorse', label: 'Endorse' },
    { key: 'track', label: 'Track' }
  ];

  // Cockpit rail: 0 = Overview, 1..6 = C0..C5.
  var STATIONS = [
    { idx: 0, key: 'overview', code: '', label: 'Overview', stage: null },
    { idx: 1, key: 'commission', code: 'C0', label: 'Commission', stage: 'originate' },
    { idx: 2, key: 'contract', code: 'C1', label: 'Contract', stage: 'procure' },
    { idx: 3, key: 'assure', code: 'C2', label: 'Assure', stage: 'gate' },
    { idx: 4, key: 'deliver', code: 'C3', label: 'Deliver', stage: 'endorse' },
    { idx: 5, key: 'use', code: 'C4', label: 'Use', stage: 'endorse' },
    { idx: 6, key: 'followup', code: 'C5', label: 'Follow-up', stage: 'track' }
  ];

  // C2 inception rating: ANSWERABILITY / design-confidence (not strength of evidence,
  // which cannot exist before fieldwork). Higher = more answerable.
  var ANSW = [
    { v: 4, label: 'High confidence', desc: 'Method and source clearly answer the question', color: 'var(--green-strong)' },
    { v: 3, label: 'Adequate', desc: 'Answerable with minor design gaps', color: 'var(--teal-ink)' },
    { v: 2, label: 'At risk', desc: 'Method or source is thin', color: 'var(--amber-dark)' },
    { v: 1, label: 'Not answerable', desc: 'No credible method or source yet', color: 'var(--red-strong)' }
  ];

  // C3 report-acceptance rating: STRENGTH OF EVIDENCE, assessed where evidence exists.
  // Higher = stronger (corrects the previously inverted 1=strongest scale).
  var SOE = [
    { v: 4, label: 'Well triangulated', desc: 'Multiple independent sources agree', color: 'var(--green-strong)' },
    { v: 3, label: 'Reasonably strong', desc: 'Some triangulation; minor gaps', color: 'var(--teal-ink)' },
    { v: 2, label: 'Limited', desc: 'Single source or thin evidence', color: 'var(--amber-dark)' },
    { v: 1, label: 'Weak / unproven', desc: 'Unreliable or absent evidence', color: 'var(--red-strong)' }
  ];

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
  var ETHICS_STATUS = {
    none: { label: 'Not started', badge: '' },
    pending: { label: 'Pending', badge: 'wb-badge-amber' },
    cleared: { label: 'Cleared', badge: 'wb-badge-green' },
    na: { label: 'Not applicable', badge: '' }
  };
  // Management-response disposition, GF/UN vocabulary.
  var DISPOSITION = {
    agree: { label: 'Agree', badge: 'wb-badge-green' },
    partial: { label: 'Partially agree', badge: 'wb-badge-amber' },
    reject: { label: 'Do not agree', badge: 'wb-badge-red' }
  };
  // C5 implementation status of an accepted management action.
  var IMPL_STATUS = {
    not_started: { label: 'Not started', badge: '' },
    in_progress: { label: 'In progress', badge: 'wb-badge-navy' },
    implemented: { label: 'Implemented', badge: 'wb-badge-green' },
    blocked: { label: 'Blocked', badge: 'wb-badge-red' },
    superseded: { label: 'Superseded', badge: '' }
  };
  // C1 deliverable workflow status (canonical, stored).
  var DELIV_STATUS = {
    not_started: { label: 'Not started', badge: '' },
    in_progress: { label: 'In progress', badge: 'wb-badge-navy' },
    submitted: { label: 'Submitted', badge: 'wb-badge-amber' },
    accepted: { label: 'Accepted', badge: 'wb-badge-green' },
    revise: { label: 'Revision requested', badge: 'wb-badge-red' }
  };
  // C3 schedule status (DERIVED from workflow status + due date, never stored).
  var DELIV_SCHED = {
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
  var CADENCE = [{ v: 3, label: 'Quarterly' }, { v: 6, label: 'Semi-annual' }, { v: 12, label: 'Annual' }];
  var TIER = { primary: 'Primary', secondary: 'Secondary' };
  var LEVELS = ['low', 'medium', 'high'];

  // ---- pure helpers -------------------------------------------------------
  function fdate(iso) { if (!iso) return '-'; try { return U.formatDate(iso); } catch (e) { return iso; } }
  function levelIdx(level) { var i = LEVELS.indexOf(level); return i < 0 ? 1 : i; }
  function daysUntil(iso) { return U.daysUntilLocal(iso); }

  function evidenceMap(list) {
    var m = {};
    (list || []).forEach(function(e) { if (e && e.eq_id != null) m[e.eq_id] = e; });
    return m;
  }
  // Mean of a 1..4 rating list ('rating' for answerability, 'strength' for SoE).
  function meanRating(list, key) {
    var rated = (list || []).filter(function(e) { return typeof e[key] === 'number'; });
    if (!rated.length) return null;
    return rated.reduce(function(a, e) { return a + e[key]; }, 0) / rated.length;
  }
  function hasMethod(row) { return !!(row.indicators && row.indicators.length); }
  function hasSource(row) { return !!(row.dataSources && row.dataSources.length); }

  function servedEqIds(users) {
    var s = {};
    (users || []).forEach(function(u) { (u.eq_refs || []).forEach(function(id) { s[id] = true; }); });
    return s;
  }
  // Primary intended users with a stated use but no evaluation question serving it:
  // the sharpest utilization-focused failure (an orphaned user).
  function orphanUsers(users) {
    return (users || []).filter(function(u) {
      return u.tier === 'primary' && (u.intended_use || '').trim() && !(u.eq_refs || []).length;
    });
  }
  function refsToNumbers(refs, rows) {
    var byId = {}; rows.forEach(function(r) { byId[r.id] = r.number; });
    return (refs || []).map(function(id) { return byId[id]; }).filter(function(n) { return n != null; }).sort(function(a, b) { return a - b; });
  }
  function numbersToRefs(text, rows) {
    var wanted = {};
    String(text || '').split(/[^0-9]+/).forEach(function(t) { if (t !== '') wanted[parseInt(t, 10)] = true; });
    return rows.filter(function(r) { return wanted[r.number]; }).map(function(r) { return r.id; });
  }

  // Derived C3 schedule status from a deliverable's canonical workflow status + due date.
  function deliverableStatus(d) {
    if (!d) return 'planned';
    if (d.status === 'accepted') return 'accepted';
    if (d.status === 'submitted') return 'in_review';
    var n = U.daysUntilLocal(d.due_date);
    if (n != null && n < 0) return 'late';
    return 'planned';
  }
  // Days until an accepted management action's next review, or null when there is
  // nothing left to follow up (implemented / superseded / not agreed / no date).
  function reviewDaysUntil(r) {
    if (!r) return null;
    if (r.implementation_status === 'implemented' || r.implementation_status === 'superseded') return null;
    if (r.disposition === 'reject') return null;
    return U.daysUntilLocal(r.next_review);
  }
  function isReviewOpen(r) {
    return !!r && r.disposition !== 'reject' && r.implementation_status !== 'implemented' && r.implementation_status !== 'superseded';
  }

  function defaultCommissioner() { return PraxisSchema.createEmptyContext().commissioner; }

  window.CockpitData = {
    PROFILES: PROFILES, GENERIC_PROFILE: GENERIC_PROFILE, profileOf: profileOf,
    LIFECYCLE: LIFECYCLE, STATIONS: STATIONS, ANSW: ANSW, SOE: SOE, INCEPTION: INCEPTION,
    GATE_DECISION: GATE_DECISION, ETHICS_STATUS: ETHICS_STATUS, DISPOSITION: DISPOSITION,
    IMPL_STATUS: IMPL_STATUS, DELIV_STATUS: DELIV_STATUS, DELIV_SCHED: DELIV_SCHED,
    DIS_STATUS: DIS_STATUS, RISK_STATUS: RISK_STATUS, CADENCE: CADENCE, TIER: TIER, LEVELS: LEVELS,
    fdate: fdate, levelIdx: levelIdx, daysUntil: daysUntil,
    evidenceMap: evidenceMap, meanRating: meanRating, hasMethod: hasMethod, hasSource: hasSource,
    servedEqIds: servedEqIds, orphanUsers: orphanUsers, refsToNumbers: refsToNumbers, numbersToRefs: numbersToRefs,
    deliverableStatus: deliverableStatus, reviewDaysUntil: reviewDaysUntil, isReviewOpen: isReviewOpen,
    defaultCommissioner: defaultCommissioner
  };
})();
