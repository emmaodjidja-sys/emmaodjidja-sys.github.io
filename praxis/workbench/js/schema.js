(function() {
  'use strict';

  // Schema version history:
  //   1.0  original nine-station context
  //   1.1  adds the optional Planning station (planning field, station index 9)
  var PRAXIS_VERSION = '1.1';

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
    9: ['planning']
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
      planning: { contract: {}, budget_lines: [], deliverables: [], invoices: [], completed_at: null },

      staleness: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false },
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
    }
  };

  // Bring a validated context up to PRAXIS_VERSION. Contexts without a
  // usable version string are treated as 1.0. Unknown (newer) versions are
  // returned unchanged rather than guessed at.
  function migrate(context) {
    if (!context || typeof context !== 'object') return context;
    var ctx = context;
    if (typeof ctx.version !== 'string' || (!MIGRATIONS[ctx.version] && ctx.version !== PRAXIS_VERSION)) {
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
    STATION_LABELS: STATION_LABELS,
    STATION_FIELDS: STATION_FIELDS,
    createEmptyContext: createEmptyContext,
    validateContext: validateContext,
    migrate: migrate
  };
})();
