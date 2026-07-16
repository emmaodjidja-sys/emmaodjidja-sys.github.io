(function() {
  'use strict';

  // Schema version history:
  //   1.0    original nine-station context
  //   1.1    adds the optional Planning station (planning field, station index 9)
  //   1.1.0  version string switched to semantic-version format (no field changes).
  //          This is also the version displayed in the app (TopBar, About, footer).
  //   1.2.0  adds the optional Commissioner surface (commissioner field, station index 10)
  //   1.3.0  extends the Commissioner surface into a utilization-focused commissioning
  //          cockpit: intended-user register (users), governance purpose/primary_use,
  //          delivery-schedule tracking (timeline), dissemination/use products
  //          (dissemination) and a delivery-risk register (risks). Fully additive.
  //   1.4.0  turns the Commissioner surface into a station-based cockpit (role switch).
  //          Unifies deliverables: planning.deliverables becomes the single source of
  //          truth and commissioner.timeline is retired (migrated into it). Adds the
  //          inception-gate independence + ethics checkpoints, a relocated strength-of-
  //          evidence rating at report acceptance (report_review), and six-monthly
  //          management-action follow-up fields (implementation_status, progress,
  //          review_interval_months, review_history) on management_response. Additive.
  //   1.5.0  adds the per-quadrant stakeholder engagement checklist state
  //          (commissioner.engagement_actions) driving the C0 influence/interest grid.
  //          Fully additive.
  //   1.6.0  dates the decision windows (governance.decision_window_opens/_closes and
  //          users[].window_opens/_closes with the old free text kept as the label),
  //          adds the user register status/successor fields (in_post|handing_over|left)
  //          and the gate pre-commitment lock (gate.eq_snapshot + snapped_at). Additive;
  //          per-user fields are backfilled explicitly since deep-default skips arrays.
  //   1.7.0  adds the top-level report_screens list: First Review rapid red-flag
  //          screening runs over an incoming evaluation report, shared by the
  //          evaluator (Station 7 self-screen) and commissioner (C3) lenses.
  //          Additive, plus one scrub: items[].machine_evidence is forced to ''
  //          so that a file written by any build that persisted pre-scan evidence
  //          snippets (confidential report text) is cleaned at rest on load. The
  //          scrub is VERSION-INDEPENDENT (see scrubScreens and migrate): it runs
  //          on every path through migrate, not inside one version step, because
  //          the builds that persisted snippets already stamped their files 1.7.0.
  //   1.8.0  adds the reasons-for-non-use vocabulary at intended-user level
  //          (users[].use_outcome, '' until recorded) and a stable top-level
  //          project_id so the local portfolio track record can key one entry
  //          per evaluation. Additive; use_outcome is backfilled explicitly
  //          since deep-default skips arrays, project_id is minted on migrate
  //          when absent.
  //   1.9.0  reconciles the ten design parameters onto one vocabulary
  //          (js/design-vocab.js) shared by Station 0's ToR form, the Station 3
  //          bridge and the advisor's scoring rules, which previously each
  //          defined their own and agreed by luck. Rewrites exact legacy synonyms
  //          in tor_constraints and design_recommendation.answers
  //          ('routine_monitoring' -> 'routine_only', 'facility' -> 'cluster',
  //          'Outcome' -> 'outcome'); leaves values with no honest counterpart
  //          alone for the user to resolve. Adds
  //          design_recommendation.answers_fingerprint, which stays null on
  //          migrated files: the answers an existing ranking was scored from are
  //          not recoverable, so it is marked unverified rather than blessed.
  var PRAXIS_VERSION = '1.9.0';

  // Navigation bounds (single source; consumed by router.js and context.js clamps).
  // MAX_STATION: highest evaluator-rail station index (0..9, includes Planning).
  // MAX_CSTATION: highest commissioner sub-station index (0 Overview, 1..6 = C0..C5).
  var MAX_STATION = 9;
  var MAX_CSTATION = 6;

  var STATION_LABELS = [
    'Evaluability & Scoping',
    'Theory of Change',
    'Evaluation Matrix',
    'Design Advisor',
    'Sample Size',
    'Instrument Builder',
    'Analysis Framework',
    'Report Builder',
    'Deck Generator'
  ];

  // The context fields each station owns. Used by SAVE_STATION and, critically,
  // by LOAD_FILE's partial-merge branch, which copies ONLY these keys out of an
  // imported _partial file into the live project.
  //
  // report_screens is DELIBERATELY NOT LISTED under 10 (or anywhere). First Review
  // saves ride on stationId 10 but write the top-level report_screens key, and that
  // asymmetry is load-bearing: because the key is not in STATION_FIELDS, a partial
  // .praxis file cannot inject report_screens (and any machine_evidence snippet of
  // confidential report text it might carry, written by an intermediate build) into
  // somebody else's live project. A full-file import goes through validateContext
  // and migrate, which scrub the field; the partial-merge branch does not, so the
  // only safe posture there is to not copy the key at all.
  // NEXT MAINTAINER: this is not an omission. Do not "fix" it by adding
  // 'report_screens' to key 10. Doing so reopens that injection path.
  var STATION_FIELDS = {
    0: ['project_meta', 'tor_constraints', 'evaluability', 'protection'],
    1: ['toc'],
    2: ['evaluation_matrix'],
    3: ['design_recommendation'],
    4: ['sample_parameters'],
    5: ['instruments'],
    6: ['analysis_plan'],
    7: ['report_structure'],
    8: ['presentation'],
    9: ['planning'],
    10: ['commissioner']
  };

  function newProjectId() {
    return 'prj_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ── File header ──────────────────────────────────────────────────────────
  // A .praxis file is JSON, so a colleague who is emailed one and opens it sees
  // ninety-odd kilobytes of braces with nothing saying what wrote it or where to
  // open it. The Windows file association gives it the Workbench icon on a machine
  // that has been registered; this block is the part that travels WITH the file to
  // machines that have not.
  //
  // It is documentation, not state. Nothing reads it back: validateContext keys off
  // `schema`, as it always has. It is re-stamped from scratch on every export
  // rather than carried through the context, so it can never describe a file it is
  // no longer the head of.
  var FILE_HEADER_KEY = '_praxis';
  var PRAXIS_HOME = 'https://www.emmanuelneneodjidja.org/praxis';

  function fileHeader() {
    return {
      app: 'PRAXIS Evaluation Workbench',
      file_type: 'PRAXIS Workbench evaluation project (.praxis)',
      open_at: PRAXIS_HOME + '/workbench/',
      how_to_open: 'Open the link above, choose "Open .praxis File", and select this file. ' +
                   'Everything below is project data written by the Workbench.',
      logo: PRAXIS_HOME + '/logo.svg',
      schema: 'praxis-workbench',
      schema_version: PRAXIS_VERSION
    };
  }

  // Returns a copy of context with a freshly minted header first in key order, so
  // it is the first thing in the file a text editor shows.
  function withFileHeader(context) {
    var out = {};
    out[FILE_HEADER_KEY] = fileHeader();
    Object.keys(context || {}).forEach(function(k) {
      if (k !== FILE_HEADER_KEY) out[k] = context[k];
    });
    return out;
  }

  function createEmptyContext() {
    return {
      version: PRAXIS_VERSION,
      project_id: newProjectId(),
      schema: 'praxis-workbench',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),

      project_meta: {
        title: '',
        programme_name: '',
        organisation: '',
        country: '',
        sector_template: '',
        sectors: [],
        primary_sector: null,
        health_areas: [],
        frameworks: [],
        evaluation_type: '',
        operating_context: '',
        budget: '',
        timeline: '',
        programme_maturity: '',
        languages: ['en']
      },

      protection: {
        sensitivity: 'standard',
        ai_permitted: true,
        sharing_guidance: '',
        encryption_recommended: false,
        access_notes: ''
      },

      tor_constraints: {
        raw_text: '',
        evaluation_purpose: [],
        causal_inference_level: '',
        comparison_feasibility: '',
        data_available: '',
        unit_of_intervention: '',
        programme_complexity: '',
        geographic_scope: '',
        target_population: '',
        evaluation_questions_raw: []
      },

      evaluability: {
        score: null,
        dimensions: [
          { id: 'data', label: 'Data Availability', max: 25, system_score: null, adjusted_score: null, justification: null },
          { id: 'toc', label: 'ToC Clarity', max: 20, system_score: null, adjusted_score: null, justification: null },
          { id: 'timeline', label: 'Timeline Adequacy', max: 20, system_score: null, adjusted_score: null, justification: null },
          { id: 'context', label: 'Operating Context', max: 15, system_score: null, adjusted_score: null, justification: null },
          { id: 'comparison', label: 'Comparison Feasibility', max: 20, system_score: null, adjusted_score: null, justification: null }
        ],
        blockers: [],
        recommendations: [],
        completed_at: null
      },

      toc: {
        title: '',
        narrative: { description: '', context: '', theory: '', systemAssumptions: [] },
        nodes: [],
        connections: [],
        knowledge_sources: {},
        completed_at: null
      },

      evaluation_matrix: {
        context: { programmeName: '', sectorTemplate: '', healthAreas: [], frameworks: [], evaluationType: '', operatingContext: '', dacCriteria: [] },
        toc_summary: { goal: '', outcomes: [], assumptions: [], inputMode: 'structured', freeText: '' },
        rows: [],
        completed_at: null
      },

      design_recommendation: {
        answers: {},
        ranked_designs: [],
        selected_design: null,
        justification: '',
        // Fingerprint of the answers ranked_designs was actually scored from, so
        // Station 3 can tell a current ranking from one that merely looks current.
        // Null means unverifiable, not valid.
        answers_fingerprint: null,
        completed_at: null
      },

      sample_parameters: {
        design_id: '',
        params: {},
        result: {},
        qualitative_plan: { purpose: '', methods: [], contexts: {}, breakdown: [] },
        completed_at: null
      },

      instruments: { items: [], completed_at: null },
      analysis_plan: { quantitative: [], qualitative: [], completed_at: null },
      report_structure: { sections: [], completed_at: null },
      presentation: { slides: [], completed_at: null },

      // Optional Planning station (index 9): contract, budget, deliverables, invoices, ratings.
      // As of 1.4.0 planning.deliverables is the SINGLE source of truth for deliverables
      // (commissioner.timeline retired). Deliverable item shape:
      //   { id, code, title, description, due_date, station_ids:[Int], payment_percent,
      //     status: not_started|in_progress|submitted|accepted|revise, submitted_at, accepted_at,
      //     accepted_by, acceptance_note, revision_reason, type, reviewers, reviewer_email,
      //     alert:{ lead_days, emails:[] }, rating:{ scores, comment, rated_at, rated_by }|null,
      //     notes, ported_from }
      // The C3 schedule status (planned|in_review|late|accepted) is DERIVED, never stored.
      // contract holds the editable header + amendments (C1 Contract):
      //   { reference, commissioner, evaluator, start_date, end_date, currency, total_budget,
      //     amendments:[{ id, date, description, ceiling_delta, new_end_date, reason }] }
      // Invoice item shape (C1 Contract ledger):
      //   { id, number, deliverable_id, issued_date, amount,
      //     type: milestone|advance|retainer|final, status: draft|submitted|approved|paid|returned,
      //     approved_by, approved_at, paid_by, paid_date, note }
      // These extra deliverable/contract/invoice fields are additive; deep-default preserves
      // them on load and defaults them to empty when absent, so no version bump is required.
      planning: { contract: {}, budget_lines: [], deliverables: [], invoices: [], completed_at: null },

      // Optional Commissioner surface (index 10): a utilization-focused commissioning
      // cockpit over the shared evaluation context, reached through the role switch.
      // Rail: Overview + C0 Commission -> C1 Contract -> C2 Assure -> C3 Deliver ->
      // C4 Use -> C5 Follow-up. Lifecycle states: Originate/Procure/Gate/Endorse/Track.
      commissioner: {
        governance: {
          funder_profile: '', oversight_body: '', evaluation_manager: '',
          decision_clock: '', lifecycle_stage: '',
          decision_window_opens: '',   // when the decision the evaluation serves opens
          decision_window_closes: '',  // and when it closes (date-only, local calendar)
          purpose: '',      // the evaluation's purpose in one or two sentences
          primary_use: ''   // the single headline intended use (the decision it serves)
        },
        // Intended-user register (utilization-focused evaluation): the named primary
        // and secondary users, the use each will make of the evaluation, when they
        // need it, and their influence/interest for engagement planning.
        users: [],          // [{ id, name, role, tier, intended_use, decision_window (label),
                            //    window_opens, window_closes, status: in_post|handing_over|left,
                            //    successor, use_outcome: ''|used|missed_window|attention_lost|
                            //    wrong_questions|not_credible|contact_left,
                            //    influence, interest, engagement, eq_refs:[] }]
        // Per-quadrant engagement checklist state: for each Mendelow strategy, the indices
        // of the completed engagement actions (action lists live in CockpitData.ENGAGEMENT).
        engagement_actions: { manage: [], satisfy: [], inform: [], monitor: [] },
        // Inception design-assurance gate. C2 rates ANSWERABILITY / design-confidence per
        // question (not strength of evidence, which does not exist yet). Independence and
        // ethics are formal inception checkpoints for IEP/EAC-grade work.
        gate: {
          decision: '', decided_by: '', decided_at: null, note: '', conditions: [],
          // Pre-commitment lock: the matrix questions as they stood when the gate
          // decision was recorded. Drift against the live matrix is derived, never stored.
          eq_snapshot: [], snapped_at: null,
          independence: { attested: false, statement: '', conflicts: [], attested_by: '', attested_at: null },
          ethics: { status: 'none', body: '', note: '', cleared_at: null } // none|pending|cleared|na
        },
        appraisal: { profile: '', evidence: [] }, // C2 answerability: [{ eq_id, rating 1..4, justification }]
        // Report acceptance (the Endorse act, C3). The TRUE strength-of-evidence rating
        // lives here, where evidence exists; higher = stronger.
        report_review: { accepted: false, accepted_by: '', accepted_at: null,
          evidence: [] }, // [{ eq_id, strength 1..4 (higher=stronger), note }]
        // Management response + six-monthly implementation follow-up (C4 authors, C5 tracks).
        management_response: [], // [{ id, code, recommendation, disposition agree|partial|reject,
                                 //    owner, secondary_owner, owner_email, due_date,
                                 //    implementation_status not_started|in_progress|implemented|blocked|superseded,
                                 //    progress 0..100, review_interval_months, next_review,
                                 //    review_history:[{ id, review_date, status, note, evidence_url, evidence_label }],
                                 //    actions, evidence_note }]
        // Use and dissemination products keyed to the audiences that must act on them.
        dissemination: [],  // [{ id, product, format, audience, due_date, status, note }]
        // Delivery-risk register: risks reported to the evaluation manager with mitigation.
        risks: [],          // [{ id, risk, category, likelihood, impact, mitigation, owner, status }]
        // Accountability: the officer acting now (attributed on logged actions) and an
        // append-only log of governance and payment acts (never edited or removed).
        acting_officer: '', // name and role of the current acting commissioner officer
        audit_log: [],      // [{ id, at, actor, action, detail }] append-only
        completed_at: null
      },

      // First Review runs (rapid red-flag screen of an incoming report). Shape:
      //   { id, role: 'team'|'commissioner', deliverable_id: string|null, reviewer,
      //     started_at, completed_at: null|iso, items: [see PraxisScreenCore],
      //     prescan: null|{ ran_at, chars, words }  (derived only, NEVER the pasted text),
      //     verdict: null|'return'|'reserved'|'proceed', verdict_recommended: same, note }
      // Persisted item fields written by the optional paste-text pre-scan:
      //   machine_signal  null|'found'|'weak'|'not_found'  the indicative signal for
      //                   this item. A DETECTION (a keyword or heading matched), never
      //                   an approval, and never an answer: only the reviewer's own
      //                   click writes `answer`.
      //   machine_hits    int|null   evaluation-question items only: how many of the
      //   machine_total   int|null   question's distinctive terms matched, out of how
      //                   many were extracted. Counts, never content: they exist so the
      //                   UI and the reader can see how thin the basis is ("matched 3 of
      //                   8 question terms"). A re-scan owns every signal and clears
      //                   these on items the new scan says nothing about.
      //   machine_evidence  ''       TOMBSTONE. The quoted line justifying a signal is
      //                   body text of a confidential report and is NEVER persisted; it
      //                   lives in session state only. The field is retained for shape
      //                   stability and is scrubbed to '' by scrubScreens, which migrate
      //                   runs on EVERY path, whatever version the context carries.
      report_screens: [],

      staleness: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false },
      reviews: []
    };
  }

  // Keys that must never be copied out of untrusted JSON. JSON.parse can
  // produce an own "__proto__" key; assigning it swaps an object's prototype.
  var UNSAFE_KEYS = { '__proto__': true, 'constructor': true, 'prototype': true };

  // Recursively rebuild a parsed value into plain objects and arrays,
  // dropping unsafe keys at every level.
  function stripUnsafeKeys(value) {
    if (Array.isArray(value)) {
      return value.map(stripUnsafeKeys);
    }
    if (value && typeof value === 'object') {
      var out = {};
      Object.keys(value).forEach(function(key) {
        if (UNSAFE_KEYS[key]) return;
        out[key] = stripUnsafeKeys(value[key]);
      });
      return out;
    }
    return value;
  }

  // Deep-default: every key present in base is guaranteed in the result;
  // values from over win where both sides have plain objects, merging
  // recursively. Arrays and scalars from over replace wholesale. Unknown
  // keys in over are preserved for forward compatibility.
  function deepDefault(base, over) {
    var result = {};
    Object.keys(base || {}).forEach(function(key) {
      if (UNSAFE_KEYS[key]) return;
      result[key] = base[key];
    });
    Object.keys(over || {}).forEach(function(key) {
      if (UNSAFE_KEYS[key]) return;
      var b = base ? base[key] : undefined;
      var o = over[key];
      if (o && typeof o === 'object' && !Array.isArray(o) && b && typeof b === 'object' && !Array.isArray(b)) {
        result[key] = deepDefault(b, o);
      } else {
        result[key] = o;
      }
    });
    return result;
  }

  // Validate an untrusted parsed object (localStorage blob or .praxis file).
  // Returns { ok, context, errors, partial }:
  //   ok       false when the object is not a workbench project at all
  //   context  a sanitized, deep-defaulted full context (or the sanitized
  //            partial payload when partial is true)
  //   errors   human-readable notes about fields that were reset to defaults
  //   partial  true when the file is a station-level export (_partial: true)
  //            that should be merged into an existing project, not replace it
  function validateContext(obj) {
    var errors = [];
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, context: null, errors: ['The file does not contain a workbench project.'], partial: false };
    }
    if (obj.schema !== 'praxis-workbench') {
      return { ok: false, context: null, errors: ['Invalid file format. Expected a .praxis file.'], partial: false };
    }

    var clean = stripUnsafeKeys(obj);
    var empty = createEmptyContext();

    if (clean._partial === true) {
      // Station-level export: keep only recognised station fields that are
      // plain objects; the reducer merges them into the current project.
      Object.keys(STATION_FIELDS).forEach(function(id) {
        STATION_FIELDS[id].forEach(function(field) {
          if (!(field in clean)) return;
          var val = clean[field];
          if (!val || typeof val !== 'object' || Array.isArray(val)) {
            delete clean[field];
            errors.push('Field "' + field + '" in the partial file had an unexpected type and was ignored.');
          }
        });
      });
      return { ok: true, context: clean, errors: errors, partial: true };
    }

    // Type-check top-level fields against the empty context shape; invalid
    // values are dropped so the deep-default below restores safe defaults.
    Object.keys(empty).forEach(function(key) {
      if (!(key in clean)) return;
      var expect = empty[key];
      var got = clean[key];
      var bad = false;
      if (Array.isArray(expect)) {
        bad = !Array.isArray(got);
      } else if (expect && typeof expect === 'object') {
        bad = !got || typeof got !== 'object' || Array.isArray(got);
      } else if (typeof expect === 'string') {
        bad = typeof got !== 'string';
      }
      if (bad) {
        delete clean[key];
        errors.push('Field "' + key + '" had an unexpected type and was reset to defaults.');
      }
    });

    return { ok: true, context: deepDefault(empty, clean), errors: errors, partial: false };
  }

  // Stepwise migrations keyed by the version they upgrade FROM.
  var MIGRATIONS = {
    // 1.0 -> 1.1: deep-default against the current empty context, which adds
    // the planning field and staleness key 9.
    '1.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      next.version = '1.1';
      return next;
    },
    // 1.1 -> 1.1.0: version string format change only, no field changes.
    '1.1': function(ctx) {
      var next = Object.assign({}, ctx);
      next.version = '1.1.0';
      return next;
    },
    // 1.1.0 -> 1.2.0: deep-default against the current empty context, which adds
    // the commissioner field and staleness key 10.
    '1.1.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      next.version = '1.2.0';
      return next;
    },
    // 1.2.0 -> 1.3.0: deep-default against the current empty context, which adds
    // the extended commissioner fields (users, timeline, dissemination, risks and
    // governance.purpose / governance.primary_use). Existing commissioner data is
    // preserved; the new fields default to empty.
    '1.2.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      next.version = '1.3.0';
      return next;
    },
    // 1.3.0 -> 1.4.0: unify deliverables. deep-default adds the new gate/report_review/
    // follow-up fields, then port commissioner.timeline into planning.deliverables (the
    // single source of truth) and retire timeline. Integrity-first: enrich an existing
    // deliverable only on an EXACT id match; otherwise append with a fresh uid and
    // ported_from provenance (never fuzzy-merge by name/date). Backfill management_response
    // with implementation_status / progress / review_interval_months / review_history.
    '1.3.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      var cm = next.commissioner || (next.commissioner = {});
      var pl = next.planning || (next.planning = { deliverables: [] });
      var dels = Array.isArray(pl.deliverables) ? pl.deliverables.slice() : [];
      var byId = {};
      dels.forEach(function(d) { if (d && d.id) byId[d.id] = d; });
      var tlStatus = { accepted: 'accepted', in_review: 'submitted', late: 'in_progress', planned: 'not_started' };
      (Array.isArray(cm.timeline) ? cm.timeline : []).forEach(function(t) {
        var m = t.id && byId[t.id];
        if (m) {
          if (!m.type && t.type) m.type = t.type;
          if (!m.reviewers && t.reviewers) m.reviewers = t.reviewers;
          if (!m.due_date && t.due_date) m.due_date = t.due_date;
          if (!m.notes && t.note) m.notes = t.note;
          if (!m.alert) m.alert = { lead_days: 14, emails: [] };
        } else {
          dels.push({
            id: PraxisUtils.uid('del_'), ported_from: t.id || null,
            code: '', title: t.name || '(ported deliverable)', description: '',
            due_date: t.due_date || '', station_ids: [], payment_percent: null,
            status: tlStatus[t.status] || 'not_started', submitted_at: null,
            accepted_at: (t.status === 'accepted' ? (t.accepted_at || null) : null),
            type: t.type || '', reviewers: t.reviewers || '', reviewer_email: '',
            alert: { lead_days: 14, emails: [] }, rating: null, notes: t.note || ''
          });
        }
      });
      pl.deliverables = dels;
      if (cm.timeline !== undefined) delete cm.timeline;
      var mrStatus = { done: 'implemented', in_progress: 'in_progress', planned: 'not_started', overdue: 'in_progress' };
      (Array.isArray(cm.management_response) ? cm.management_response : []).forEach(function(r) {
        if (r.implementation_status == null) r.implementation_status = mrStatus[r.status] || 'not_started';
        if (r.progress == null) r.progress = r.implementation_status === 'implemented' ? 100 : (r.implementation_status === 'in_progress' ? 50 : 0);
        if (r.review_interval_months == null) r.review_interval_months = 6;
        if (!Array.isArray(r.review_history)) r.review_history = [];
        if (r.owner_email == null) r.owner_email = '';
      });
      next.version = '1.4.0';
      return next;
    },
    // 1.4.0 -> 1.5.0: deep-default adds commissioner.engagement_actions (per-quadrant
    // engagement checklist state). Purely additive.
    '1.4.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      next.version = '1.5.0';
      return next;
    },
    // 1.5.0 -> 1.6.0: deep-default adds the dated decision windows (governance) and the
    // gate pre-commitment lock fields. users[] is an array, which deep-default replaces
    // wholesale, so the new per-user fields are backfilled explicitly here.
    '1.5.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      var cm = next.commissioner || (next.commissioner = {});
      (Array.isArray(cm.users) ? cm.users : []).forEach(function(u) {
        if (!u || typeof u !== 'object') return;
        if (u.window_opens == null) u.window_opens = '';
        if (u.window_closes == null) u.window_closes = '';
        if (u.status == null) u.status = 'in_post';
        if (u.successor == null) u.successor = '';
      });
      next.version = '1.6.0';
      return next;
    },
    // 1.6.0 -> 1.7.0: deep-default adds the top-level report_screens list (First
    // Review red-flag screens). New top-level array, so deep-default alone is
    // enough; the explicit guard is belt-and-braces against a non-array value.
    // The machine_evidence scrub does NOT live here: see scrubScreens, which
    // migrate runs on every path, because a version step cannot reach the files
    // that need it (they are already stamped 1.7.0).
    '1.6.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      if (!Array.isArray(next.report_screens)) next.report_screens = [];
      next.version = '1.7.0';
      return next;
    },
    // 1.7.0 -> 1.8.0: deep-default adds nothing structural here; the two new
    // facts are minted or backfilled explicitly. use_outcome is per-user (arrays
    // are replaced wholesale by deep-default) and project_id must survive with
    // whatever the file already carries so the portfolio register stays keyed.
    '1.7.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      if (!next.project_id || typeof next.project_id !== 'string') next.project_id = newProjectId();
      var cm = next.commissioner || (next.commissioner = {});
      (Array.isArray(cm.users) ? cm.users : []).forEach(function(u) {
        if (!u || typeof u !== 'object') return;
        if (u.use_outcome == null) u.use_outcome = '';
      });
      next.version = '1.8.0';
      return next;
    },
    // 1.8.0 -> 1.9.0: reconcile the design vocabulary. Station 0's ToR form, the
    // Station 3 bridge and the advisor's scoring rules each defined these values
    // independently and nothing checked them against each other, so files carry
    // slugs the engine never matched ('routine_monitoring', 'facility') and
    // purposes in a different case ('Outcome') than the tables that read them.
    // The engine scores an unmatched value as zero rather than failing, so those
    // files hold rankings that quietly disagree with their own answers.
    //
    // Two rules here. Rename only exact synonyms: PraxisDesignVocab.ALIASES is
    // the whole of what may be rewritten, and a legacy value meaning something
    // else ('accountability' is a use of an evaluation, not a scope of one) is
    // LEFT IN PLACE for the user to resolve, never guessed into an enum. And do
    // not mint answers_fingerprint for an existing ranking: we cannot know what
    // it was scored from, which is the point, so it stays null and Station 3
    // reports it as unverified rather than vouching for it.
    '1.8.0': function(ctx) {
      var next = deepDefault(createEmptyContext(), ctx);
      var V = window.PraxisDesignVocab;
      if (V) {
        var tor = next.tor_constraints || (next.tor_constraints = {});
        Object.keys(V.TOR_FIELD_TO_ANSWER).forEach(function(field) {
          var r = V.normalizeValue(V.TOR_FIELD_TO_ANSWER[field], tor[field]);
          if (r.ok && r.value != null) tor[field] = r.value;
        });
        if (Array.isArray(tor.evaluation_purpose)) {
          tor.evaluation_purpose = tor.evaluation_purpose.map(function(p) {
            var r = V.normalizeValue('purpose', p);
            return (r.ok && r.value != null) ? r.value : p;
          });
        }
        var dr = next.design_recommendation;
        if (dr && dr.answers && typeof dr.answers === 'object') {
          Object.keys(dr.answers).forEach(function(k) {
            var r = V.normalizeValue(k, dr.answers[k]);
            if (r.ok && r.value != null) dr.answers[k] = r.value;
          });
        }
      }
      next.version = '1.9.0';
      return next;
    }
  };

  // Empty item.machine_evidence on every item of every screening run, whatever
  // version the context carries.
  //
  // The shipped code never writes that field (a pre-scan's quoted line is body
  // text of a confidential report, so it lives in ephemeral React state and dies
  // with the tab), but INTERMEDIATE builds of this feature did persist it, and
  // validateContext preserves unknown keys, so a .praxis file or localStorage blob
  // written by one of those builds carries verbatim lines of a confidential report
  // at rest.
  //
  // WHY THIS IS NOT A VERSION STEP. The obvious home for the scrub is
  // MIGRATIONS['1.6.0'], and that is where it first lived. It was inert. The
  // version bump to 1.7.0 landed in the FIRST commit of the feature, before the
  // pre-scan existed, so every build that persisted an evidence snippet stamped
  // its files 1.7.0. migrate() does nothing at all to a 1.7.0 context: there is no
  // MIGRATIONS['1.7.0'], and the reset-to-1.0 guard is skipped because the version
  // is the current one. The scrub therefore never ran on a single file that
  // actually carried a snippet. Only a scrub that ignores the version stamp can
  // reach them, so this runs on EVERY return path of migrate: the migrated path,
  // the already-at-current-version path, and the newer-than-current early return.
  //
  // Idempotent, and tolerant of anything: a missing report_screens, a non-array
  // report_screens, a run that is null or has no items array, a null item. It
  // touches machine_evidence and nothing else; machine_signal, machine_hits,
  // machine_total, answers, notes, verdicts and prescan counts are legitimate
  // persisted state and must survive untouched.
  function scrubScreens(ctx) {
    if (!ctx || typeof ctx !== 'object') return ctx;
    if (!Array.isArray(ctx.report_screens)) return ctx;
    ctx.report_screens.forEach(function(run) {
      if (!run || typeof run !== 'object' || !Array.isArray(run.items)) return;
      run.items.forEach(function(it) {
        if (it && typeof it === 'object' && it.machine_evidence) it.machine_evidence = '';
      });
    });
    return ctx;
  }

  // Bring a validated context up to PRAXIS_VERSION. Contexts without a
  // usable version string are treated as 1.0. Unknown (newer) versions are
  // returned unchanged rather than guessed at (but still scrubbed).
  function migrate(context) {
    if (!context || typeof context !== 'object') return context;
    var ctx = context;
    if (typeof ctx.version !== 'string' || (!MIGRATIONS[ctx.version] && ctx.version !== PRAXIS_VERSION)) {
      // Lexicographic compare, correct for the current 1.0 / 1.1 / 1.1.0 line.
      // Switch to a numeric (component-wise) compare before any 1.10-style bump,
      // where "1.9" would sort after "1.10" as strings.
      var isKnownNewer = typeof ctx.version === 'string' && ctx.version > PRAXIS_VERSION;
      // A newer file's SHAPE is not guessed at, but its evidence snippets are
      // still scrubbed: the privacy invariant does not wait for a version we know.
      if (isKnownNewer) return scrubScreens(ctx);
      ctx = deepDefault({}, ctx);
      ctx.version = '1.0';
    }
    var guard = 0;
    while (MIGRATIONS[ctx.version] && guard < 20) {
      ctx = MIGRATIONS[ctx.version](ctx);
      guard += 1;
    }
    // Covers both the migrated chain and the context that was already at
    // PRAXIS_VERSION (the loop body never ran), which is the case that matters.
    return scrubScreens(ctx);
  }

  window.PraxisSchema = {
    PRAXIS_VERSION: PRAXIS_VERSION,
    MAX_STATION: MAX_STATION,
    MAX_CSTATION: MAX_CSTATION,
    STATION_LABELS: STATION_LABELS,
    STATION_FIELDS: STATION_FIELDS,
    createEmptyContext: createEmptyContext,
    validateContext: validateContext,
    migrate: migrate,
    withFileHeader: withFileHeader
  };
})();
