(function() {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function isMultiCountry(meta) {
    return (meta.country || '').split(',').filter(function(s) { return s.trim(); }).length > 1;
  }

  // ── Dimension rubrics ────────────────────────────────────────────────────────
  // Each rubric is a pure function: (tor, meta) → raw numeric score (before clamp)

  var RUBRICS = {

    comparison: function(tor, meta) {
      var base = { randomisable: 20, natural: 14, threshold: 10, none: 3 };
      var score = base[tor.comparison_feasibility] !== undefined ? base[tor.comparison_feasibility] : 3;

      // Cross-dimension modifiers
      if (tor.comparison_feasibility === 'randomisable' && meta.operating_context === 'humanitarian') score -= 3;
      if (tor.comparison_feasibility === 'natural' && meta.operating_context === 'fragile' && isMultiCountry(meta)) score -= 2;
      if (tor.comparison_feasibility === 'threshold' && tor.data_available === 'baseline_endline') score += 2;
      if (tor.comparison_feasibility === 'none' && tor.causal_inference_level === 'description') score += 2;

      return PraxisUtils.clamp(score, 0, 20);
    },

    data: function(tor, meta) {
      // Data existence (max 15)
      var existBase = { baseline_endline: 15, timeseries: 11, routine_only: 7, minimal: 3 };
      var exist = existBase[tor.data_available] !== undefined ? existBase[tor.data_available] : 3;
      if (tor.data_available === 'routine_only' && meta.programme_maturity === 'mature') exist += 2;
      if (tor.data_available === 'minimal' && meta.operating_context === 'humanitarian') exist += 1;

      // Data quality/usability penalty (max -5 from the 15)
      // Systems-level programmes have fragmented data across multiple platforms
      var qualPenalty = 0;
      if (tor.unit_of_intervention === 'system') qualPenalty -= 2; // system-level = fragmented data
      if (tor.programme_complexity === 'complex') qualPenalty -= 1; // complex programmes = harder to attribute
      if (meta.operating_context === 'fragile' || meta.operating_context === 'humanitarian') qualPenalty -= 1; // data quality lower in challenging contexts

      return PraxisUtils.clamp(exist + qualPenalty, 0, 15);
    },

    toc: function(tor, meta) {
      // Proxy score — full ToC assessment happens in Station 1
      var score = 12; // base: partial clarity assumed

      if (tor.evaluation_purpose && tor.evaluation_purpose.length > 0) score += 3;
      if (tor.causal_inference_level === 'attribution' || tor.causal_inference_level === 'contribution') score += 3;
      if (meta.programme_maturity === 'mature' || meta.programme_maturity === 'completed') score += 2;

      return PraxisUtils.clamp(score, 0, 20);
    },

    timeline: function(tor, meta) {
      var base = { long: 20, medium: 15, short: 8 };
      var score = base[meta.timeline] !== undefined ? base[meta.timeline] : 12;

      // Cross-dimension modifiers
      if (meta.timeline === 'short' && tor.comparison_feasibility === 'randomisable') score -= 4;
      if (meta.timeline === 'long' && meta.programme_maturity === 'pilot') score += 2;

      return PraxisUtils.clamp(score, 0, 20);
    },

    context: function(tor, meta) {
      var base = { stable: 15, fragile: 8, humanitarian: 4 };
      var score = base[meta.operating_context] !== undefined ? base[meta.operating_context] : 10;

      // Cross-dimension modifiers
      if (meta.operating_context === 'fragile' && tor.comparison_feasibility === 'randomisable') score -= 2;
      if (meta.operating_context === 'humanitarian' && meta.timeline === 'short') score -= 1;

      return PraxisUtils.clamp(score, 0, 15);
    },

    // Attribution complexity: how hard is it to isolate programme contribution?
    // Systems-level interventions in complex environments are inherently harder to evaluate
    complexity: function(tor, meta) {
      var score = 10; // start at full marks

      // Programme complexity
      if (tor.programme_complexity === 'complex') score -= 3;
      else if (tor.programme_complexity === 'complicated') score -= 1;

      // Unit of intervention — system-level is hardest to attribute
      if (tor.unit_of_intervention === 'system') score -= 2;
      else if (tor.unit_of_intervention === 'cluster') score -= 1;

      // Causal inference ambition vs design feasibility
      if (tor.causal_inference_level === 'attribution' && tor.comparison_feasibility === 'none') score -= 3;
      if (tor.causal_inference_level === 'attribution' && tor.comparison_feasibility === 'natural') score -= 1;

      return PraxisUtils.clamp(score, 0, 10);
    }
  };

  // ── Dimension metadata ───────────────────────────────────────────────────────
  // Order matches PraxisSchema evaluability.dimensions order

  var DIMENSION_META = [
    { id: 'data',       label: 'Data Availability & Quality', max: 15 },
    { id: 'toc',        label: 'ToC Clarity',                 max: 20 },
    { id: 'timeline',   label: 'Timeline Adequacy',           max: 20 },
    { id: 'context',    label: 'Operating Context',           max: 15 },
    { id: 'comparison', label: 'Comparison Feasibility',      max: 20 },
    { id: 'complexity', label: 'Attribution Complexity',      max: 10 }
  ];

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Score a single dimension.
   * @param {string} dimensionId  — one of data | toc | timeline | context | comparison
   * @param {object} tor          — tor_constraints object (PraxisSchema shape)
   * @param {object} meta         — project_meta object (PraxisSchema shape)
   * @returns {number}            — clamped score
   */
  function scoreDimension(dimensionId, tor, meta) {
    var rubric = RUBRICS[dimensionId];
    return rubric ? rubric(tor, meta) : 0;
  }

  /**
   * Compute the full evaluability score.
   * @param {object} tor   — tor_constraints object
   * @param {object} meta  — project_meta object
   * @returns {{
   *   score: number,
   *   dimensions: Array,
   *   blockers: Array,
   *   recommendations: Array
   * }}
   */
  function score(tor, meta) {
    // Score each dimension
    var dimensions = DIMENSION_META.map(function(dim) {
      var systemScore = scoreDimension(dim.id, tor, meta);
      return {
        id: dim.id,
        label: dim.label,
        max: dim.max,
        system_score: systemScore,
        adjusted_score: null,
        justification: null
      };
    });

    // Total score is sum of dimension scores
    var totalScore = dimensions.reduce(function(sum, d) { return sum + d.system_score; }, 0);

    // Blockers: any dimension below 40% of its max
    var blockers = [];
    dimensions.forEach(function(d) {
      if (d.system_score / d.max < 0.4) {
        blockers.push({
          dimension: d.id,
          label: d.label,
          score: d.system_score,
          max: d.max
        });
      }
    });

    // Rule-based recommendations
    var recommendations = [];

    if (tor.data_available === 'minimal' || tor.data_available === 'routine_only') {
      recommendations.push(
        'Strengthen data readiness by incorporating routine MEAL data from implementing partners.'
      );
    }
    if (tor.comparison_feasibility === 'none' && tor.causal_inference_level !== 'description') {
      recommendations.push(
        'Consider contribution analysis or theory-based approach rather than experimental design.'
      );
    }
    if (meta.operating_context === 'fragile' || meta.operating_context === 'humanitarian') {
      recommendations.push(
        'Adapt methods for the operating context \u2014 consider remote data collection and safety protocols.'
      );
    }
    if (meta.timeline === 'short' && tor.comparison_feasibility === 'randomisable') {
      recommendations.push(
        'The short timeline may not allow for a randomised design. Consider quasi-experimental alternatives.'
      );
    }
    if (meta.timeline === 'short') {
      recommendations.push(
        'Consider rapid evaluation methods suited to the short timeline \u2014 real-time evaluation, rapid assessment protocols, or a focused evaluability assessment before a full evaluation.'
      );
    }
    if (meta.operating_context === 'humanitarian' && isMultiCountry(meta) && tor.comparison_feasibility === 'randomisable') {
      recommendations.push(
        'Randomisation across multiple countries in a humanitarian context faces severe feasibility constraints. Consider a multi-site contribution analysis with nested quasi-experimental components where conditions allow.'
      );
    }

    return {
      score: totalScore,
      dimensions: dimensions,
      blockers: blockers,
      recommendations: recommendations
    };
  }

  // ── Export ───────────────────────────────────────────────────────────────────

  window.EvaluabilityScorer = {
    score: score,
    scoreDimension: scoreDimension,
    DIMENSION_META: DIMENSION_META
  };

})();
