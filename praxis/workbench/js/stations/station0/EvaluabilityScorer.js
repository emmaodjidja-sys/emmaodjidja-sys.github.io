(function(global) {
  'use strict';

  function scoreEvaluability(projectMeta, torConstraints) {
    var score = 0;
    var blockers = [];
    var recommendations = [];

    // Data availability (25 points)
    var dataScore = 0;
    switch (torConstraints.data_available) {
      case 'baseline_endline': dataScore = 25; break;
      case 'timeseries': dataScore = 20; break;
      case 'routine_only': dataScore = 15; break;
      case 'minimal': dataScore = 5; break;
      default: dataScore = 0;
    }
    score += dataScore;
    var dataReadiness = dataScore >= 20 ? 'good' : dataScore >= 10 ? 'partial' : 'none';
    if (dataScore < 10) {
      blockers.push('Limited existing data. Primary data collection will be essential.');
      recommendations.push('Plan for baseline data collection before programme midpoint.');
    }

    // ToC clarity (20 points)
    var tocScore = 0;
    if (torConstraints.evaluation_questions_raw && torConstraints.evaluation_questions_raw.length > 0) {
      tocScore += 10;
    }
    if (projectMeta.evaluation_type) {
      tocScore += 5;
    }
    if (torConstraints.evaluation_purpose && torConstraints.evaluation_purpose.length > 0) {
      tocScore += 5;
    }
    score += tocScore;
    var tocClarity = tocScore >= 15 ? 'good' : tocScore >= 8 ? 'partial' : 'none';
    if (tocScore < 8) {
      recommendations.push('Clarify evaluation questions and purpose before proceeding to the Theory of Change.');
    }

    // Timeline adequacy (20 points)
    var timelineScore = 0;
    var timeline = projectMeta.timeline;
    var complexity = torConstraints.programme_complexity;
    if (timeline === 'long') {
      timelineScore = 20;
    } else if (timeline === 'medium') {
      timelineScore = complexity === 'complex' ? 10 : 15;
    } else if (timeline === 'short') {
      timelineScore = complexity === 'complex' ? 0 : complexity === 'complicated' ? 5 : 10;
      if (complexity === 'complex') {
        blockers.push('Short timeline with complex programme. Consider Quick Inception or phased approach.');
      }
    }
    score += timelineScore;
    var timelineAdequate = timelineScore >= 15;

    // Operating context (15 points)
    var contextScore = 0;
    switch (projectMeta.operating_context) {
      case 'stable': contextScore = 15; break;
      case 'fragile': contextScore = 8; break;
      case 'humanitarian': contextScore = 3; break;
      default: contextScore = 10;
    }
    score += contextScore;
    if (projectMeta.operating_context === 'humanitarian') {
      recommendations.push('Humanitarian context may limit methodological options. Consider rapid evaluation approaches.');
    }

    // Comparison feasibility (20 points)
    var comparisonScore = 0;
    switch (torConstraints.comparison_feasibility) {
      case 'randomisable': comparisonScore = 20; break;
      case 'natural': comparisonScore = 15; break;
      case 'threshold': comparisonScore = 12; break;
      case 'none': comparisonScore = 5; break;
      default: comparisonScore = 10;
    }
    score += comparisonScore;
    if (comparisonScore <= 5) {
      recommendations.push('No comparison group available. Theory-based or contribution analysis approaches recommended.');
    }

    // Stakeholder access estimate
    var stakeholderAccess = 'partial';
    if (projectMeta.operating_context === 'stable' && timeline !== 'short') {
      stakeholderAccess = 'good';
    } else if (projectMeta.operating_context === 'humanitarian' || timeline === 'short') {
      stakeholderAccess = 'none';
      recommendations.push('Limited stakeholder access expected. Plan remote data collection methods as backup.');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      data_readiness: dataReadiness,
      toc_clarity: tocClarity,
      stakeholder_access: stakeholderAccess,
      timeline_adequate: timelineAdequate,
      blockers: blockers,
      recommendations: recommendations,
      completed_at: new Date().toISOString()
    };
  }

  global.PraxisEvaluabilityScorer = { scoreEvaluability: scoreEvaluability };

})(window);
