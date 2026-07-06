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
  var PRAXIS_VERSION = '1.4.0';

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

  function createEmptyContext() {
    return {
      version: PRAXIS_VERSION,
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
      // (commissioner.timeline retired). Item shape:
      //   { id, code, title, description, due_date, station_ids:[Int], payment_percent,
      //     status: not_started|in_progress|submitted|accepted|revise, submitted_at, accepted_at,
      //     type, reviewers, reviewer_email, alert:{ lead_days, emails:[] },
      //     rating:{ scores, comment, rated_at }|null, notes, ported_from }
      // The C3 schedule status (planned|in_review|late|accepted) is DERIVED, never stored.
      planning: { contract: {}, budget_lines: [], deliverables: [], invoices: [], completed_at: null },

      // Optional Commissioner surface (index 10): a utilization-focused commissioning
      // cockpit over the shared evaluation context, reached through the role switch.
      // Rail: Overview + C0 Commission -> C1 Contract -> C2 Assure -> C3 Deliver ->
      // C4 Use -> C5 Follow-up. Lifecycle states: Originate/Procure/Gate/Endorse/Track.
      commissioner: {
        governance: {
          funder_profile: '', oversight_body: '', evaluation_manager: '',
          decision_clock: '', lifecycle_stage: '',
          purpose: '',      // the evaluation's purpose in one or two sentences
          primary_use: ''   // the single headline intended use (the decision it serves)
        },
        // Intended-user register (utilization-focused evaluation): the named primary
        // and secondary users, the use each will make of the evaluation, when they
        // need it, and their influence/interest for engagement planning.
        users: [],          // [{ id, name, role, tier, intended_use, decision_window, influence, interest, engagement, eq_refs:[] }]
        // Inception design-assurance gate. C2 rates ANSWERABILITY / design-confidence per
        // question (not strength of evidence, which does not exist yet). Independence and
        // ethics are formal inception checkpoints for IEP/EAC-grade work.
        gate: {
          decision: '', decided_by: '', decided_at: null, note: '', conditions: [],
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
        completed_at: null
      },

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
    }
  };

  // Bring a validated context up to PRAXIS_VERSION. Contexts without a
  // usable version string are treated as 1.0. Unknown (newer) versions are
  // returned unchanged rather than guessed at.
  function migrate(context) {
    if (!context || typeof context !== 'object') return context;
    var ctx = context;
    if (typeof ctx.version !== 'string' || (!MIGRATIONS[ctx.version] && ctx.version !== PRAXIS_VERSION)) {
      // Lexicographic compare, correct for the current 1.0 / 1.1 / 1.1.0 line.
      // Switch to a numeric (component-wise) compare before any 1.10-style bump,
      // where "1.9" would sort after "1.10" as strings.
      var isKnownNewer = typeof ctx.version === 'string' && ctx.version > PRAXIS_VERSION;
      if (isKnownNewer) return ctx;
      ctx = deepDefault({}, ctx);
      ctx.version = '1.0';
    }
    var guard = 0;
    while (MIGRATIONS[ctx.version] && guard < 20) {
      ctx = MIGRATIONS[ctx.version](ctx);
      guard += 1;
    }
    return ctx;
  }

  window.PraxisSchema = {
    PRAXIS_VERSION: PRAXIS_VERSION,
    MAX_STATION: MAX_STATION,
    MAX_CSTATION: MAX_CSTATION,
    STATION_LABELS: STATION_LABELS,
    STATION_FIELDS: STATION_FIELDS,
    createEmptyContext: createEmptyContext,
    validateContext: validateContext,
    migrate: migrate
  };
})();
