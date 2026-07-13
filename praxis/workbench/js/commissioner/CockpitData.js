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
  // Intended-user register status. A primary user leaving before their decision
  // window is how utilization quietly dies; the register has to see it coming.
  var USER_STATUS = {
    in_post: { label: 'In post', badge: '' },
    handing_over: { label: 'Handing over', badge: 'wb-badge-amber' },
    left: { label: 'Left post', badge: 'wb-badge-red' }
  };

  // Why an evaluation went unused, recorded per intended user once the story is
  // known. '' means not yet recorded, which is the honest default: the register
  // should never guess. The vocabulary mirrors the departure modes in the
  // eval-use agent trace: windows missed, attention moved, wrong questions,
  // credibility lost, contact gone.
  var USE_OUTCOME = {
    '':               { label: 'Not yet recorded', badge: '' },
    used:             { label: 'Used', badge: 'wb-badge-green' },
    missed_window:    { label: 'Missed the window', badge: 'wb-badge-red' },
    attention_lost:   { label: 'Attention moved on', badge: 'wb-badge-amber' },
    wrong_questions:  { label: 'Wrong questions', badge: 'wb-badge-amber' },
    not_credible:     { label: 'Not seen as credible', badge: 'wb-badge-red' },
    contact_left:     { label: 'Contact left post', badge: 'wb-badge-red' }
  };

  var CADENCE = [{ v: 3, label: 'Quarterly' }, { v: 6, label: 'Semi-annual' }, { v: 12, label: 'Annual' }];
  var TIER = { primary: 'Primary', secondary: 'Secondary' };
  var LEVELS = ['low', 'medium', 'high'];

  // Stakeholder engagement (Mendelow influence x interest). One source of truth for the
  // 2x2 quadrants AND the per-quadrant engagement checklist. `x`/`y` place the cell
  // (l/r + t/b) so the grid and the influence/interest axes agree; `sub` is the terse
  // cell caption (kept from the ported grid); `gloss`/`pos` describe the strategy in the
  // action panel. `actions` are institutional, utilization-focused engagement moves.
  var ENGAGEMENT = [
    { key: 'satisfy', x: 'l', y: 't', label: 'Keep satisfied', sub: 'high influence, low interest',
      gloss: 'powerful but detached, keep warm', pos: 'high influence, low interest', actions: [
      'Brief at milestones, headline level not operational detail',
      'Confirm their decision windows and reporting needs',
      'Surface only material changes in scope, budget or risk',
      'Keep warm with short, periodic updates',
      'Hold a clear path to escalate a high-stakes issue' ] },
    { key: 'manage', x: 'r', y: 't', label: 'Manage closely', sub: 'engage as partners',
      gloss: 'engage as partners', pos: 'high influence, high interest', actions: [
      'Co-design the evaluation questions and success measures',
      'Tie each question to a decision they own',
      'Give standing review points at design, midline and draft',
      'Escalate scope, budget and risk changes early, in writing',
      'Secure sign-off on the evaluation matrix before fieldwork' ] },
    { key: 'monitor', x: 'l', y: 'b', label: 'Monitor', sub: 'low effort',
      gloss: 'minimal effort', pos: 'low influence, low interest', actions: [
      'Keep to minimal, low-cost proactive effort',
      'Re-assess periodically in case influence or interest rises',
      'Point them to public outputs rather than bespoke updates',
      'Watch for any who should move to a more active quadrant' ] },
    { key: 'inform', x: 'r', y: 'b', label: 'Keep informed', sub: 'show the findings',
      gloss: 'show the findings', pos: 'low influence, high interest', actions: [
      'Share plans, timelines and findings in accessible formats',
      'Consult on feasibility and data-collection realities',
      'Open feedback channels and close the loop on what you hear',
      'Manage expectations on what the evaluation can answer',
      'Recognise their contribution in dissemination' ] }
  ];

  // ---- pure helpers -------------------------------------------------------
  function fdate(iso) { if (!iso) return '-'; try { return U.formatDate(iso); } catch (e) { return iso; } }
  function levelIdx(level) { var i = LEVELS.indexOf(level); return i < 0 ? 1 : i; }
  function daysUntil(iso) { return U.daysUntilLocal(iso); }

  // Bucket a user into one engagement quadrant (Mendelow strict: only 'high' is the high
  // side; medium/low/unset are the low side). Returns an ENGAGEMENT key.
  function engagementQuad(user) {
    var infHigh = user && user.influence === 'high';
    var intHigh = user && user.interest === 'high';
    if (infHigh && intHigh) return 'manage';
    if (infHigh) return 'satisfy';
    if (intHigh) return 'inform';
    return 'monitor';
  }

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

  // ---- time-track layout --------------------------------------------------
  // Shared by the C3 delivery track and the C5 review-cadence track. Dates cluster in
  // real evaluations (two reviews logged on the same day, four inside a fortnight), and
  // a label placed at its true time position then collides with its neighbours. These
  // two pure functions fix that without ever moving a dot off its true date.
  //
  // clusterTrackPoints: one dot per calendar date, carrying every code logged on it.
  // packTrackLanes:     pixel layout for the labels. Greedy interval-graph colouring in
  //                     x order, which uses exactly as many lanes as the largest set of
  //                     mutually overlapping labels. Lanes alternate above / below the
  //                     line and stack outward (0 above, 1 below, 2 above, ...), so a
  //                     sparse track stays a single row per side and only a dense one
  //                     grows. Labels clamp inside the track; dots never move.

  // Group points by (date, upcoming) into one cluster each, ascending by time. Points
  // are { t, iso, code, color, upcoming }. Logged and upcoming never merge, so a review
  // logged on the day another falls due stays two dots, not one.
  function clusterTrackPoints(points) {
    var byKey = {}, order = [];
    (points || []).forEach(function(p) {
      if (!p || typeof p.t !== 'number' || isNaN(p.t)) return;
      var key = p.iso + '|' + (p.upcoming ? 'u' : 'l');
      if (!byKey[key]) {
        byKey[key] = { t: p.t, iso: p.iso, upcoming: !!p.upcoming, codes: [], colors: [] };
        order.push(key);
      }
      var c = byKey[key];
      if (p.code != null) c.codes.push(p.code);
      if (p.color && c.colors.indexOf(p.color) < 0) c.colors.push(p.color);
    });
    return order.map(function(k) { return byKey[k]; }).sort(function(a, b) { return a.t - b.t; });
  }

  // Lay the clusters out in pixels. Returns a new array (the input is not mutated) plus
  // the row counts the caller needs to size the track. opts: width, labelWidth, gutter,
  // maxLanes.
  function packTrackLanes(clusters, opts) {
    var o = opts || {};
    var width = Math.max(1, o.width || 880);
    var lw = Math.min(o.labelWidth || 92, width);
    var gutter = o.gutter == null ? 8 : o.gutter;
    var maxLanes = o.maxLanes || 8;
    var list = (clusters || []).slice().sort(function(a, b) { return a.t - b.t; });
    if (!list.length) return { clusters: [], lanes: 0, rowsAbove: 0, rowsBelow: 0, min: null, max: null, span: 1, width: width };

    var times = list.map(function(c) { return c.t; });
    var min = Math.min.apply(null, times), max = Math.max.apply(null, times);
    var span = max - min;
    var laneRight = [];   // right edge in px of the last label placed in each lane

    var out = list.map(function(c) {
      // Every cluster on one date has nowhere to spread, so centre it rather than
      // pinning the whole track to the left edge.
      var x = span > 0 ? (c.t - min) / span * width : width / 2;
      var labelLeft = Math.max(0, Math.min(width - lw, x - lw / 2));
      var lane = -1, i;
      for (i = 0; i < maxLanes; i++) {
        if (laneRight[i] === undefined || labelLeft >= laneRight[i] + gutter) { lane = i; break; }
      }
      if (lane < 0) {                       // more mutually overlapping labels than lanes
        lane = 0;                           // fall back to the lane with the most room left
        for (i = 1; i < maxLanes; i++) { if (laneRight[i] < laneRight[lane]) lane = i; }
      }
      laneRight[lane] = labelLeft + lw;
      return {
        t: c.t, iso: c.iso, upcoming: !!c.upcoming,
        codes: c.codes || [], colors: c.colors || [], count: (c.codes || []).length,
        x: x, labelLeft: labelLeft, labelWidth: lw,
        lane: lane, side: lane % 2 === 0 ? 'above' : 'below', row: Math.floor(lane / 2)
      };
    });

    var lanes = laneRight.length;           // greedy fills lanes 0..n-1 with no gaps
    return {
      clusters: out, lanes: lanes,
      rowsAbove: Math.ceil(lanes / 2), rowsBelow: Math.floor(lanes / 2),
      min: min, max: max, span: Math.max(1, span), width: width
    };
  }

  // x in px for an arbitrary time on a packed track (the today rule). Null when the
  // time falls outside the track, which is when there is nothing to mark.
  function trackX(layout, t) {
    if (!layout || t == null || layout.min == null) return null;
    if (t < layout.min || t > layout.max) return null;
    if (layout.max === layout.min) return layout.width / 2;
    return (t - layout.min) / (layout.max - layout.min) * layout.width;
  }

  // The final-report deliverable: explicit "final report" type match first, then a
  // final+report title. No fuzzy fallback; null when the schedule has none.
  function finalReportDeliverable(dels) {
    var list = dels || [], i, t;
    for (i = 0; i < list.length; i++) {
      if (list[i] && /final\s*report/i.test(String(list[i].type || ''))) return list[i];
    }
    for (i = 0; i < list.length; i++) {
      t = String((list[i] && list[i].title) || '');
      if (/final/i.test(t) && /report/i.test(t)) return list[i];
    }
    return null;
  }

  // Decision-window fit: does the final report land inside the earliest primary
  // user's decision window? The single check most evaluation waste traces to.
  // Null when nothing is dated. status: landed | on_course | at_risk | missed |
  // undated. marginDays is (window close minus report date) in local calendar
  // days, negative = past the close; for undated/missed-without-report it is
  // days until the close (daysUntilLocal semantics).
  function decisionWindowFit(context) {
    var cm = (context && context.commissioner) || {};
    var pl = (context && context.planning) || {};
    var gov = cm.governance || {};
    var wins = (cm.users || []).filter(function(u) { return u && u.tier === 'primary' && u.window_closes; })
      .map(function(u) { return { label: (u.name || '').trim() || 'primary user', closes: u.window_closes, userId: u.id }; });
    if (!wins.length && gov.decision_window_closes) {
      wins = [{ label: (gov.decision_clock || '').trim() || 'the decision', closes: gov.decision_window_closes, userId: null }];
    }
    if (!wins.length) return null;
    wins.sort(function(a, b) { return a.closes < b.closes ? -1 : (a.closes > b.closes ? 1 : 0); });
    var win = wins[0];
    var rr = cm.report_review || {};
    var accepted = !!rr.accepted && !!U.ymd(rr.accepted_at);
    var fr = finalReportDeliverable(pl.deliverables || []);
    var reportDate = accepted ? String(rr.accepted_at).slice(0, 10) : ((fr && fr.due_date) || null);
    var closesIn = U.daysUntilLocal(win.closes);
    var out = { window: win, reportDate: reportDate, reportAccepted: accepted };
    if (!reportDate) {
      out.marginDays = closesIn;
      out.status = (closesIn != null && closesIn < 0) ? 'missed' : 'undated';
      return out;
    }
    var margin = U.diffDaysLocal(reportDate, win.closes);
    out.marginDays = margin;
    if (accepted) out.status = (margin != null && margin >= 0) ? 'landed' : 'missed';
    else if (closesIn != null && closesIn < 0) out.status = 'missed';
    else out.status = (margin != null && margin >= 0) ? 'on_course' : 'at_risk';
    return out;
  }

  // Display strings for the decision-window-fit tile (Station 9 and anywhere else
  // that renders decisionWindowFit). Pure: takes the fit object, returns
  // { value, sub }. Kept separate from decisionWindowFit so a settled window
  // (landed or missed) reports history, not a countdown against today, which is
  // the wrong quantity once the window has closed. Live statuses (on_course,
  // at_risk, undated) still read as a forward countdown.
  var FIT_STATUS_PHRASE = { missed: 'Window missed', at_risk: 'At risk', on_course: 'On course',
    landed: 'Landed in window', undated: 'Report undated' };
  function decisionWindowDisplay(fit) {
    if (!fit) return null;
    var value;
    if (fit.status === 'landed') {
      // Settled success: how many days ahead of the close the report landed.
      value = fit.marginDays == null ? 'Landed' : (fit.marginDays === 0 ? 'On the closing day' : fit.marginDays + 'd early');
    } else if (fit.status === 'missed') {
      // Settled failure, but two different shapes underneath, branched on whether
      // a report was actually ACCEPTED, not on reportDate. reportDate is populated
      // from a deliverable's due date even when nothing was ever accepted (see
      // decisionWindowFit), so testing reportDate would print "Nd late", or even a
      // negative count, for a report that does not exist.
      if (fit.reportAccepted) {
        // A report really did land, but after the close. marginDays is
        // close-minus-report (negative = late), so the days late is the negation.
        value = (fit.marginDays == null ? 'Late' : (-fit.marginDays) + 'd late');
      } else {
        // Nothing was ever accepted. State the fact about the WINDOW, not about a
        // report that does not exist. marginDays cannot be used here: in the
        // due-date-fallback shape it is a due-date-vs-window figure that means
        // nothing to the reader, so derive the count fresh from today vs the
        // close. Reads identically whether or not a final-report deliverable
        // happens to exist, because in both cases the fact is the same: the
        // window closed and nothing was accepted.
        var closedAgo = U.daysUntilLocal(fit.window.closes);
        value = (closedAgo == null ? 'No report accepted' : Math.abs(closedAgo) + 'd since close, no report accepted');
      }
    } else {
      // on_course / at_risk / undated: the window is still live, so a forward
      // countdown against today is the right quantity.
      var daysLeft = U.daysUntilLocal(fit.window.closes);
      value = daysLeft == null ? 'Undated' : (daysLeft < 0 ? Math.abs(daysLeft) + 'd past' : daysLeft + 'd left');
    }
    var phrase = FIT_STATUS_PHRASE[fit.status];
    return { value: value, sub: fit.window.label + (phrase ? ' · ' + phrase : '') };
  }

  function normQuestion(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim().toLowerCase(); }

  // Pre-commitment drift: how the live matrix differs from the questions locked
  // at the gate decision. Null before any snapshot exists.
  function gateDrift(context) {
    var cm = (context && context.commissioner) || {};
    var gate = cm.gate || {};
    var snap = gate.eq_snapshot;
    if (!Array.isArray(snap) || !snap.length) return null;
    var rows = ((context && context.evaluation_matrix) || {}).rows || [];
    var byId = {};
    rows.forEach(function(r) { if (r && r.id) byId[r.id] = r; });
    var inSnap = {}, reworded = [], removed = [];
    snap.forEach(function(s) {
      if (!s || s.eq_id == null) return;
      inSnap[s.eq_id] = true;
      var r = byId[s.eq_id];
      if (!r) removed.push(s);
      else if (normQuestion(r.question) !== normQuestion(s.question)) {
        reworded.push({ eq_id: s.eq_id, number: r.number != null ? r.number : s.number, before: s.question, after: r.question });
      }
    });
    var added = rows.filter(function(r) { return r && r.id && !inSnap[r.id]; });
    return { snapped_at: gate.snapped_at || gate.decided_at || null, count: snap.length,
      added: added, removed: removed, reworded: reworded,
      clean: !added.length && !removed.length && !reworded.length };
  }

  function sumBy(arr, f) { return (arr || []).reduce(function(a, x) { return a + (Number(f(x)) || 0); }, 0); }

  // C4 money-against-use: what the evaluation costs against whether it is used.
  // Reuses the C1 vocabulary exactly: ceiling = contract value (base + amendment
  // deltas, with budget lines as the base fallback); committed = approved plus
  // paid invoices. verdict: used (an accepted action is underway or done),
  // informing (a recommendation is accepted), unused (report accepted, nothing
  // accepted), pending (report not yet accepted).
  function moneyAgainstUse(context) {
    var pl = (context && context.planning) || {};
    var cm = (context && context.commissioner) || {};
    var contract = pl.contract || {};
    var base = Number(contract.total_budget) || sumBy(pl.budget_lines, function(l) { return l && l.amount; });
    var ceiling = base + sumBy(contract.amendments, function(a) { return a && a.ceiling_delta; });
    var committed = sumBy((pl.invoices || []).filter(function(i) { return i && (i.status === 'approved' || i.status === 'paid'); }),
      function(i) { return i.amount; });
    var reg = cm.management_response || [];
    var used = reg.some(function(r) { return r && (r.implementation_status === 'in_progress' || r.implementation_status === 'implemented'); });
    var informing = reg.some(function(r) { return r && (r.disposition === 'agree' || r.disposition === 'partial'); });
    var reportAccepted = !!(cm.report_review && cm.report_review.accepted);
    var verdict = used ? 'used' : (informing ? 'informing' : (reportAccepted ? 'unused' : 'pending'));
    return { ceiling: ceiling, committed: committed, currency: contract.currency || 'USD',
      verdict: verdict, reportAccepted: reportAccepted };
  }

  // One fully-defaulted intended-user record. Single source of the user shape
  // so C0 and the Station 0 quick-add cannot drift apart.
  function newUser(tier) {
    return { id: U.uid('usr_'), name: '', role: '', tier: tier || 'primary', intended_use: '',
      decision_window: '', window_opens: '', window_closes: '', status: 'in_post', successor: '',
      use_outcome: '', influence: 'medium', interest: 'medium', eq_refs: [] };
  }

  function useOutcomeRollup(context) {
    var users = ((context && context.commissioner) || {}).users || [];
    var primaries = users.filter(function(u) { return u && u.tier === 'primary'; });
    var counts = {};
    var recorded = 0, used = 0;
    primaries.forEach(function(u) {
      var k = u.use_outcome || '';
      counts[k] = (counts[k] || 0) + 1;
      if (k) recorded++;
      if (k === 'used') used++;
    });
    return { primaries: primaries.length, recorded: recorded, used: used, counts: counts };
  }

  function defaultCommissioner() { return PraxisSchema.createEmptyContext().commissioner; }

  window.CockpitData = {
    PROFILES: PROFILES, GENERIC_PROFILE: GENERIC_PROFILE, profileOf: profileOf,
    LIFECYCLE: LIFECYCLE, STATIONS: STATIONS, ANSW: ANSW, SOE: SOE, INCEPTION: INCEPTION,
    GATE_DECISION: GATE_DECISION, ETHICS_STATUS: ETHICS_STATUS, DISPOSITION: DISPOSITION,
    IMPL_STATUS: IMPL_STATUS, DELIV_STATUS: DELIV_STATUS, DELIV_SCHED: DELIV_SCHED,
    DIS_STATUS: DIS_STATUS, RISK_STATUS: RISK_STATUS, USER_STATUS: USER_STATUS,
    USE_OUTCOME: USE_OUTCOME,
    CADENCE: CADENCE, TIER: TIER, LEVELS: LEVELS,
    ENGAGEMENT: ENGAGEMENT,
    fdate: fdate, levelIdx: levelIdx, daysUntil: daysUntil, engagementQuad: engagementQuad,
    evidenceMap: evidenceMap, meanRating: meanRating, hasMethod: hasMethod, hasSource: hasSource,
    servedEqIds: servedEqIds, orphanUsers: orphanUsers, refsToNumbers: refsToNumbers, numbersToRefs: numbersToRefs,
    deliverableStatus: deliverableStatus, reviewDaysUntil: reviewDaysUntil, isReviewOpen: isReviewOpen,
    clusterTrackPoints: clusterTrackPoints, packTrackLanes: packTrackLanes, trackX: trackX,
    finalReportDeliverable: finalReportDeliverable, decisionWindowFit: decisionWindowFit,
    decisionWindowDisplay: decisionWindowDisplay,
    gateDrift: gateDrift, moneyAgainstUse: moneyAgainstUse,
    newUser: newUser, useOutcomeRollup: useOutcomeRollup,
    defaultCommissioner: defaultCommissioner
  };
})();
