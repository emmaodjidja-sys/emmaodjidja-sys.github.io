/* Canonical vocabulary for the ten Evaluation Design Advisor parameters.

   Before this file existed the vocabulary was defined three times over: once in
   Station 0's ToR form, once in DesignBridge's mapping tables, once in the
   advisor's scoring rules, and nothing reconciled them. The advisor scores with
   `if (answers.x === "literal")` and no else branch, so a value none of the three
   agreed on contributed zero and quietly changed the ranking instead of failing.
   That is how a stored recommendation of Contribution Analysis + Process Tracing
   re-scored to Contribution Analysis + Realist without a single answer changing.

   This module is the source of truth on the Workbench side. It does not import
   from the advisor (a public standalone tool must not depend on the Workbench);
   tests/design-vocab.test.js instead parses the advisor and asserts three things
   agree: these enums, the advisor's own QUESTIONS options, and every literal its
   scoring rules compare an answer to. Drift fails the suite rather than silently
   re-ranking someone's evaluation design. */
(function() {
  'use strict';

  // Keyed by advisor answer key. Order is the advisor's question order and is
  // also the fingerprint key order, so it must stay stable.
  var ANSWER_ENUMS = {
    purpose:    ['impact', 'outcome', 'process', 'learning'],
    causal:     ['attribution', 'contribution', 'description'],
    comparison: ['randomisable', 'natural', 'threshold', 'none'],
    data:       ['baseline_endline', 'timeseries', 'routine_only', 'minimal'],
    context:    ['stable', 'fragile', 'humanitarian'],
    budget:     ['low', 'medium', 'high'],
    timeline:   ['short', 'medium', 'long'],
    maturity:   ['pilot', 'scaling', 'mature', 'completed'],
    complexity: ['simple', 'complicated', 'complex'],
    unit:       ['individual', 'cluster', 'system']
  };

  var ANSWER_KEYS = Object.keys(ANSWER_ENUMS);

  // Older slugs for a value already in the enum. ONLY exact synonyms belong here.
  // A legacy value that means something genuinely different (ToR "accountability",
  // which is a use of an evaluation, not a scope of one) must be rejected and put
  // back to the user. Inventing an enum member for it would be a guess wearing a
  // mapping table's clothes, and the ranking would move on the strength of it.
  var ALIASES = {
    purpose: {
      impact_evaluation: 'impact',
      outcome_evaluation: 'outcome',
      process_evaluation: 'process',
      formative: 'learning'
    },
    data: {
      // Shipped in both demo fixtures and every .praxis file cut from them.
      routine_monitoring: 'routine_only'
    },
    unit: {
      // Station 0's option value; 'cluster' is the term the advisor and the
      // evaluability scorer both test against.
      facility: 'cluster'
    },
    context: { conflict: 'fragile', emergency: 'humanitarian' },
    budget: { under_50k: 'low', '50k_200k': 'medium', over_200k: 'high' },
    timeline: { under_6m: 'short', '6m_18m': 'medium', over_18m: 'long' }
  };

  var LABELS = {
    purpose:    { impact: 'Impact', outcome: 'Outcome', process: 'Process', learning: 'Learning' },
    causal:     { attribution: 'Attribution', contribution: 'Contribution', description: 'Description' },
    comparison: { randomisable: 'Random assignment possible', natural: 'Natural comparison exists', threshold: 'Eligibility threshold', none: 'No comparison group' },
    data:       { baseline_endline: 'Baseline + endline', timeseries: 'Routine time series', routine_only: 'Routine data only', minimal: 'Minimal / none' },
    context:    { stable: 'Stable', fragile: 'Fragile / conflict', humanitarian: 'Humanitarian' },
    budget:     { low: 'Low (<$50K)', medium: 'Medium ($50-200K)', high: 'High ($200K+)' },
    timeline:   { short: 'Short (<3 months)', medium: 'Medium (3-12 months)', long: 'Long (12+ months)' },
    maturity:   { pilot: 'Pilot / early', scaling: 'Scaling up', mature: 'Mature / ongoing', completed: 'Completed' },
    complexity: { simple: 'Simple / linear', complicated: 'Complicated', complex: 'Complex / adaptive' },
    unit:       { individual: 'Individual / household', cluster: 'Facility / community', system: 'System / policy' }
  };

  // ToR field -> advisor answer key. Station 0 collects all six; the bridge used
  // to forward only four, so complexity and unit were re-asked in Station 3 even
  // though Station 0 already had them.
  var TOR_FIELD_TO_ANSWER = {
    causal_inference_level: 'causal',
    comparison_feasibility: 'comparison',
    data_available: 'data',
    unit_of_intervention: 'unit',
    programme_complexity: 'complexity'
  };

  // project_meta field -> advisor answer key.
  var META_FIELD_TO_ANSWER = {
    operating_context: 'context',
    budget: 'budget',
    timeline: 'timeline',
    programme_maturity: 'maturity'
  };

  function isBlank(v) {
    return v == null || (typeof v === 'string' && v.trim() === '');
  }

  /* Resolve one raw value for one answer key.
     -> { ok, value, raw, reason }  ok:false means the caller must not score it. */
  function normalizeValue(key, raw) {
    var enumVals = ANSWER_ENUMS[key];
    if (!enumVals) return { ok: false, value: null, raw: raw, reason: 'Unknown design parameter "' + key + '".' };
    if (isBlank(raw)) return { ok: true, value: null, raw: raw, reason: null };
    if (typeof raw !== 'string') {
      return { ok: false, value: null, raw: raw, reason: 'Expected a text value, got ' + typeof raw + '.' };
    }

    var slug = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
    var aliased = (ALIASES[key] && ALIASES[key][slug]) || slug;

    if (enumVals.indexOf(aliased) < 0) {
      return {
        ok: false, value: null, raw: raw,
        reason: '"' + raw + '" is not a recognised ' + key + ' value. Expected one of: ' + enumVals.join(', ') + '.'
      };
    }
    return { ok: true, value: aliased, raw: raw, reason: null };
  }

  /* Normalize a whole answer set.
     -> { answers, rejected:[{key,raw,reason}] }
     Rejected values are dropped, never coerced. The caller is expected to show
     them: a parameter the engine ignored is a parameter the user still owes. */
  function normalizeAnswers(raw) {
    var src = raw || {};
    var answers = {};
    var rejected = [];
    ANSWER_KEYS.forEach(function(key) {
      var r = normalizeValue(key, src[key]);
      if (!r.ok) { rejected.push({ key: key, raw: r.raw, reason: r.reason }); return; }
      if (r.value != null) answers[key] = r.value;
    });
    return { answers: answers, rejected: rejected };
  }

  /* Derive advisor answers from Station 0's ToR block and project_meta.
     -> { answers, rejected, notes }

     purpose is deliberately conservative. Station 0 asks for evaluation purpose
     as a MULTI-select while the advisor scores a single primary purpose. Taking
     [0], as the old bridge did, reads chip click order as primacy, which is a
     guess that moves the ranking. So: pre-fill only when exactly one valid
     purpose survives; otherwise leave it for the user and say why. */
  function torToDesignAnswers(torConstraints, projectMeta) {
    var tor = torConstraints || {};
    var meta = projectMeta || {};
    var answers = {};
    var rejected = [];
    var notes = [];

    function take(srcVal, key) {
      var r = normalizeValue(key, srcVal);
      if (!r.ok) { rejected.push({ key: key, raw: r.raw, reason: r.reason }); return; }
      if (r.value != null) answers[key] = r.value;
    }

    Object.keys(TOR_FIELD_TO_ANSWER).forEach(function(f) { take(tor[f], TOR_FIELD_TO_ANSWER[f]); });
    Object.keys(META_FIELD_TO_ANSWER).forEach(function(f) { take(meta[f], META_FIELD_TO_ANSWER[f]); });

    var rawPurposes = tor.evaluation_purpose;
    if (!Array.isArray(rawPurposes)) rawPurposes = isBlank(rawPurposes) ? [] : [rawPurposes];
    var valid = [];
    rawPurposes.forEach(function(p) {
      var r = normalizeValue('purpose', p);
      if (!r.ok) { rejected.push({ key: 'purpose', raw: r.raw, reason: r.reason }); return; }
      if (r.value != null && valid.indexOf(r.value) < 0) valid.push(r.value);
    });
    if (valid.length === 1) {
      answers.purpose = valid[0];
    } else if (valid.length > 1) {
      notes.push({
        key: 'purpose',
        text: 'Your ToR lists ' + valid.length + ' evaluation purposes (' +
              valid.map(function(v) { return LABELS.purpose[v]; }).join(', ') +
              '). The advisor scores one primary purpose, so choose it here.'
      });
    }

    return { answers: answers, rejected: rejected, notes: notes };
  }

  /* Stable fingerprint of a normalized answer set. Station 3 stamps this next to
     ranked_designs so a stored recommendation can be checked against the answers
     it actually came from. The invariant is that the Workbench never presents
     a ranking its own engine would not reproduce. */
  function fingerprintAnswers(answers) {
    var src = answers || {};
    return ANSWER_KEYS.map(function(k) {
      return k + '=' + (isBlank(src[k]) ? '' : String(src[k]));
    }).join('|');
  }

  function labelFor(key, value) {
    return (LABELS[key] && LABELS[key][value]) || value;
  }

  window.PraxisDesignVocab = {
    ANSWER_ENUMS: ANSWER_ENUMS,
    ANSWER_KEYS: ANSWER_KEYS,
    ALIASES: ALIASES,
    LABELS: LABELS,
    TOR_FIELD_TO_ANSWER: TOR_FIELD_TO_ANSWER,
    META_FIELD_TO_ANSWER: META_FIELD_TO_ANSWER,
    normalizeValue: normalizeValue,
    normalizeAnswers: normalizeAnswers,
    torToDesignAnswers: torToDesignAnswers,
    fingerprintAnswers: fingerprintAnswers,
    labelFor: labelFor
  };
})();
