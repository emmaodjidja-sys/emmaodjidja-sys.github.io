(function() {
  'use strict';

  // ============================================================================
  // MatrixGenerator — Ported from eval-matrix-builder + adapters + EQ engine
  // ============================================================================

  // Pull references from PRAXIS_INDICATOR_BANK (loaded via data/indicator_bank.js)
  var BANK = (typeof window !== 'undefined' && window.PRAXIS_INDICATOR_BANK) || {};
  var INDICATOR_BANK = BANK.INDICATOR_BANK || [];
  var OECD_DAC = BANK.OECD_DAC || {};
  var FRAMEWORKS = BANK.FRAMEWORKS || {};
  var KEYWORD_INDICATOR_MAP = BANK.KEYWORD_INDICATOR_MAP || {};

  // ============================================================================
  // Adapter: praxisTocToMatrixToc
  //   Converts workbench .praxis.toc (nodes/connections) to the flat format
  //   expected by generateEvaluationQuestions:
  //     { goal: String, outcomes: [{ text, outputs: [String] }], assumptions: [String] }
  // ============================================================================
  function praxisTocToMatrixToc(praxisToc) {
    if (!praxisToc) return { goal: '', outcomes: [], assumptions: [] };

    var nodes = praxisToc.nodes || [];
    var connections = praxisToc.connections || [];

    // Find the goal node (type === 'goal' or 'impact')
    var goalNode = nodes.filter(function(n) {
      return n.type === 'goal' || n.type === 'impact';
    })[0];
    var goal = goalNode ? (goalNode.label || goalNode.text || '') : '';

    // Find outcome nodes
    var outcomeNodes = nodes.filter(function(n) { return n.type === 'outcome'; });
    // Find output nodes
    var outputNodes = nodes.filter(function(n) { return n.type === 'output'; });

    // Build a map of connections: source -> [target]
    var connMap = {};
    connections.forEach(function(c) {
      var src = c.source || c.from;
      var tgt = c.target || c.to;
      if (!connMap[src]) connMap[src] = [];
      connMap[src].push(tgt);
    });

    // Also build reverse map: target -> [source]
    var reverseMap = {};
    connections.forEach(function(c) {
      var src = c.source || c.from;
      var tgt = c.target || c.to;
      if (!reverseMap[tgt]) reverseMap[tgt] = [];
      reverseMap[tgt].push(src);
    });

    // For each outcome, find which outputs connect TO it (output -> outcome)
    var nodeById = {};
    nodes.forEach(function(n) { nodeById[n.id] = n; });

    var outcomes = outcomeNodes.map(function(oc) {
      // Outputs that connect TO this outcome
      var inputIds = reverseMap[oc.id] || [];
      var outputs = inputIds
        .map(function(id) { return nodeById[id]; })
        .filter(function(n) { return n && n.type === 'output'; })
        .map(function(n) { return n.label || n.text || ''; });

      // If no outputs found via connections, try forward connections FROM outputs to this outcome
      if (outputs.length === 0) {
        outputNodes.forEach(function(outNode) {
          var targets = connMap[outNode.id] || [];
          if (targets.indexOf(oc.id) >= 0) {
            outputs.push(outNode.label || outNode.text || '');
          }
        });
      }

      return {
        text: oc.label || oc.text || '',
        outputs: outputs
      };
    });

    // Extract assumptions from nodes of type 'assumption' or from narrative
    var assumptionNodes = nodes.filter(function(n) { return n.type === 'assumption'; });
    var assumptions = assumptionNodes.map(function(n) { return n.label || n.text || ''; });

    // Also pull from narrative if available
    if (praxisToc.narrative && praxisToc.narrative.systemAssumptions) {
      assumptions = assumptions.concat(praxisToc.narrative.systemAssumptions);
    }

    return {
      goal: goal,
      outcomes: outcomes,
      assumptions: assumptions
    };
  }

  // ============================================================================
  // Adapter: praxisContextToMatrixContext
  //   Converts .praxis.project_meta + .praxis.tor_constraints to the
  //   eval-matrix-builder's context shape:
  //     { healthAreas: [], frameworks: [], evaluationType: '', operatingContext: '',
  //       dacCriteria: [] }
  // ============================================================================
  function praxisContextToMatrixContext(praxisContext) {
    if (!praxisContext) return { healthAreas: [], frameworks: [], evaluationType: '', operatingContext: '', dacCriteria: [] };

    var meta = praxisContext.project_meta || praxisContext;
    var tor = praxisContext.tor_constraints || {};

    return {
      healthAreas: meta.health_areas || meta.healthAreas || [],
      frameworks: meta.frameworks || [],
      evaluationType: meta.evaluation_type || meta.evaluationType || '',
      operatingContext: meta.operating_context || meta.operatingContext || '',
      dacCriteria: (praxisContext.evaluation_matrix && praxisContext.evaluation_matrix.context && praxisContext.evaluation_matrix.context.dacCriteria)
        ? praxisContext.evaluation_matrix.context.dacCriteria
        : Object.keys(OECD_DAC)
    };
  }

  // ============================================================================
  // Ported: generateEvaluationQuestions (from eval-matrix-builder)
  //   Faithfully ported — same logic, same structure.
  // ============================================================================
  function generateEvaluationQuestions(toc, context, dacCriteria) {
    var questions = [];
    var eqNum = 1;
    var effSubNum = 0;
    var goalText = toc.goal || "programme objectives";
    var trunc = function(s, n) { return s && s.length > n ? s.substring(0, n) + "\u2026" : (s || ""); };
    var isHealth = context.healthAreas.some(function(a) {
      return ["hiv","tb","malaria","immunisation","rmncah","nutrition","ncd","mental_health","hss"].indexOf(a) >= 0;
    });
    var isFCV = context.operatingContext === "fragile" || context.operatingContext === "humanitarian";
    var isFormative = context.evaluationType === "formative";
    var isProcess = context.evaluationType === "process";
    var isImpact = context.evaluationType === "impact";
    var isMidterm = context.evaluationType === "midterm";

    var achievementVerb = isFormative ? "is progressing toward" : isMidterm ? "is on track to achieve" : "has achieved";
    var framingPrefix = isFormative ? "What is working, what is not, and what adjustments are needed regarding" :
      isProcess ? "How has the programme been implemented with respect to" :
      isMidterm ? "To what extent is the programme on track to achieve" :
      "To what extent has the programme achieved";

    if (dacCriteria.indexOf("relevance") >= 0) {
      questions.push({
        id: "eq_" + eqNum, criterion: "relevance",
        question: "To what extent are the programme's objectives and design responsive to the needs of the target population" + (toc.goal ? ", particularly in relation to " + trunc(goalText, 100) : "") + "?",
        subQuestions: [
          "Are programme objectives aligned with the expressed needs and priorities of beneficiaries?",
          "Is the programme design appropriate for the operating context?"
        ].concat(isHealth ? ["Are the health priorities addressed consistent with the burden of disease and health system gaps?"] : [])
         .concat(isFCV ? ["Has the programme adapted its approach to the fragile/conflict-affected context?"] : [])
         .concat(isMidterm ? ["Are any adjustments needed to the programme design based on emerging evidence?"] : []),
        rationale: "Assesses whether the intervention addresses genuine needs and remains appropriate as context evolves.",
        judgementCriteria: "",
      });
      eqNum++;
      if (toc.outcomes.length > 0) {
        var assumptions = toc.assumptions || [];
        questions.push({
          id: "eq_" + eqNum, criterion: "relevance",
          question: "To what extent does the programme's Theory of Change remain valid, and are the causal assumptions supported by evidence?",
          subQuestions: [
            "Are the key assumptions underlying the ToC still holding?",
            "Have there been changes in the context that affect the programme logic?"
          ].concat(assumptions.slice(0, 3).map(function(a) { return 'Is the assumption "' + trunc(a, 60) + '" still valid?'; })),
          rationale: "Tests the continued validity of the programme's causal model.",
          judgementCriteria: "",
        });
        eqNum++;
      }
    }

    if (dacCriteria.indexOf("coherence") >= 0) {
      questions.push({
        id: "eq_" + eqNum, criterion: "coherence",
        question: "How well does the programme fit with other interventions in the same context, and is it internally coherent?",
        subQuestions: [
          "Does the programme complement or duplicate existing interventions in the same sector?",
          "Is the programme aligned with national policies, strategies, and plans?",
          "Do the programme's components reinforce each other (internal coherence)?"
        ].concat(context.frameworks.length > 1 ? ["Is the programme coherent across donor requirements (" + context.frameworks.map(function(f) { return FRAMEWORKS[f] ? FRAMEWORKS[f].name : f; }).join(", ") + ")?"] : [])
         .concat(context.healthAreas.length > 2 ? ["Is there effective integration across the health areas addressed by the programme?"] : []),
        rationale: "Assesses fit with the broader intervention landscape and internal logic.",
        judgementCriteria: "",
      });
      eqNum++;
    }

    if (dacCriteria.indexOf("effectiveness") >= 0) {
      var effMainNum = eqNum;
      toc.outcomes.forEach(function(outcome, oi) {
        effSubNum++;
        var outcomeText = outcome.text || "Outcome " + (oi + 1);
        var outputTexts = (outcome.outputs || []).filter(function(o) { return o && (o.text || o).toString().trim(); });
        questions.push({
          id: "eq_" + effMainNum + "." + effSubNum, criterion: "effectiveness",
          question: framingPrefix + " " + trunc(outcomeText, 120) + "?",
          subQuestions: outputTexts.slice(0, 4).map(function(o) {
            var t = typeof o === "string" ? o : o.text;
            return 'To what extent has the output "' + trunc(t, 70) + '" been delivered as intended?';
          }).concat(["What are the main factors contributing to or hindering achievement of " + trunc(outcomeText, 60) + "?"])
            .concat(isFormative ? ["What adjustments are needed to improve progress on " + trunc(outcomeText, 50) + "?"] : [])
            .concat(isMidterm ? ["Is the programme on track to achieve " + trunc(outcomeText, 50) + " by endline?"] : []),
          rationale: "Outcome-specific effectiveness question for: " + trunc(outcomeText, 80),
          judgementCriteria: "",
          _outcomeText: outcomeText,
        });
      });
      if (toc.outcomes.length === 0) {
        effSubNum++;
        questions.push({
          id: "eq_" + effMainNum + "." + effSubNum, criterion: "effectiveness",
          question: framingPrefix + " its intended outcomes?",
          subQuestions: ["To what extent have the planned outputs been delivered?", "What are the main factors contributing to or hindering results?"],
          rationale: "Generic effectiveness question (no specific outcomes provided in ToC).",
          judgementCriteria: "",
        });
      }
      eqNum++;
      questions.push({
        id: "eq_" + eqNum, criterion: "effectiveness",
        question: "Are there differential results across population groups, and has the programme contributed to reducing or widening equity gaps?",
        subQuestions: [
          "How do results vary by sex, age, geography, and socioeconomic status?"
        ].concat(isHealth ? ["Is there a pro-poor or pro-equity gradient in programme coverage and outcomes?"] : [])
         .concat(["Were marginalised or hard-to-reach populations adequately served?"])
         .concat(isFCV ? ["Were conflict-affected, displaced, or hard-to-reach populations reached equitably?"] : []),
        rationale: "Equity assessment \u2014 required by OECD-DAC 2019 revision.",
        judgementCriteria: "",
        _isEquity: true,
      });
      eqNum++;
      if (!isProcess) {
        questions.push({
          id: "eq_" + eqNum, criterion: "effectiveness",
          question: "How was the programme implemented, and what explains variation in implementation quality across sites or time periods?",
          subQuestions: [
            "Was the programme implemented with fidelity to the design?",
            "What adaptations were made and were they appropriate?",
            "What were the main barriers and facilitators of implementation?"
          ].concat(isHealth ? ["Were services delivered to minimum quality standards?"] : []),
          rationale: "Process/implementation question \u2014 explains why outcomes were or were not achieved.",
          judgementCriteria: "",
        });
      } else {
        questions.push({
          id: "eq_" + eqNum, criterion: "effectiveness",
          question: "How was the programme implemented, what mechanisms drove or hindered implementation, and what explains variation across sites?",
          subQuestions: [
            "Was the programme implemented with fidelity to the design?",
            "What adaptations were made, by whom, and were they appropriate?",
            "What were the key barriers and facilitators at community, facility, district, and national levels?",
            "How did the programme interact with the existing health system and other concurrent interventions?",
            "What mechanisms explain why the programme worked differently in different settings?"
          ].concat(isFCV ? ["How did the conflict/crisis context affect implementation feasibility and quality?"] : []),
          rationale: "Primary question for a process evaluation \u2014 investigates implementation mechanisms in depth.",
          judgementCriteria: "",
        });
      }
      eqNum++;
    }

    if (dacCriteria.indexOf("efficiency") >= 0) {
      questions.push({
        id: "eq_" + eqNum, criterion: "efficiency",
        question: "How efficiently were resources used, and could the same or better results have been achieved with fewer resources or in less time?",
        subQuestions: [
          "What was the cost per unit of output or outcome?",
          "Were resources allocated optimally across programme components and geographies?",
          "Were there significant implementation delays and what caused them?"
        ].concat(isHealth ? ["How does the programme's cost-efficiency compare with benchmarks or alternative delivery models?"] : [])
         .concat(context.frameworks.indexOf("global_fund") >= 0 || context.frameworks.indexOf("world_bank") >= 0 ? ["Were financial management systems adequate and were audit findings addressed?"] : []),
        rationale: "Assesses resource use relative to results, including timeliness of delivery.",
        judgementCriteria: "",
      });
      eqNum++;
    }

    if (dacCriteria.indexOf("impact") >= 0 && !isProcess) {
      var counterfactualLang = isImpact ? ", and to what extent can observed changes be attributed to the programme compared to what would have occurred without it" : "";
      questions.push({
        id: "eq_" + eqNum, criterion: "impact",
        question: "What higher-level changes has the programme contributed to" + (toc.goal ? ", particularly in relation to " + trunc(goalText, 100) : "") + counterfactualLang + "?",
        subQuestions: [
          "What changes at the population or health system level can be observed during the programme period?",
          "To what extent can these changes be plausibly attributed or linked to the programme?",
          "Were there any unintended effects (positive or negative)?"
        ].concat(isHealth ? ["What changes in health outcomes (morbidity, mortality) or health system performance have occurred?"] : [])
         .concat(isImpact ? ["What rival explanations exist for the observed changes, and how credible are they?"] : []),
        rationale: "Assesses broader, higher-level effects beyond immediate programme outcomes.",
        judgementCriteria: "",
      });
      eqNum++;
    }

    if (dacCriteria.indexOf("sustainability") >= 0) {
      questions.push({
        id: "eq_" + eqNum, criterion: "sustainability",
        question: isFormative ?
          "What factors support or threaten the sustainability of results, and what actions are needed to enhance sustainability?" :
          "Are the programme's benefits likely to continue after external support ends, and what are the main risks to sustainability?",
        subQuestions: [
          "Is there sufficient national/local ownership and political commitment?",
          "Is the programme financially sustainable (government co-financing trajectory, domestic resource mobilisation)?",
          "Is there adequate institutional and technical capacity to sustain results?"
        ].concat(isHealth ? ["Have programme approaches been integrated into national guidelines, protocols, or health system structures?"] : [])
         .concat(["What are the main risks to sustainability and how are they being mitigated?"])
         .concat(isMidterm ? ["What actions should be taken in the remaining programme period to enhance sustainability?"] : []),
        rationale: "Assesses likelihood of continued benefits, including financial, institutional, and political sustainability.",
        judgementCriteria: "",
      });
      eqNum++;
    }

    return questions;
  }

  // ============================================================================
  // Ported: matchIndicators (from eval-matrix-builder)
  //   Uses window.PRAXIS_INDICATOR_BANK.INDICATOR_BANK
  // ============================================================================
  function matchIndicators(eq, context) {
    var keywordBoosts = {};
    var searchText = ((eq._outcomeText || "") + " " + eq.question).toLowerCase();
    Object.keys(KEYWORD_INDICATOR_MAP).forEach(function(keyword) {
      var pattern = new RegExp(keyword.replace(/\./g, ".?").replace(/ /g, "\\s*"), "i");
      if (pattern.test(searchText)) {
        KEYWORD_INDICATOR_MAP[keyword].forEach(function(id) { keywordBoosts[id] = true; });
      }
    });
    return INDICATOR_BANK.map(function(ind) {
      var score = 0;
      if (keywordBoosts[ind.id]) score += 35;
      if (ind.dacCriteria.indexOf(eq.criterion) >= 0) score += 25;
      var areaOverlap = ind.healthAreas.filter(function(a) { return context.healthAreas.indexOf(a) >= 0; }).length;
      score += areaOverlap * 12;
      var frameworkOverlap = ind.frameworks.filter(function(f) { return context.frameworks.indexOf(f) >= 0; }).length;
      score += frameworkOverlap * 8;
      if (ind.tier) {
        context.frameworks.forEach(function(f) {
          if (ind.tier[f] === 1) score += 10;
          else if (ind.tier[f] === 2) score += 4;
        });
      }
      if (eq.criterion === "effectiveness" && (ind.level === "output" || ind.level === "outcome")) score += 8;
      if (eq.criterion === "impact" && ind.level === "impact") score += 18;
      if (eq.criterion === "efficiency" && (ind.level === "process" || ind.level === "output")) score += 8;
      if (eq.criterion === "sustainability" && ind.dacCriteria.indexOf("sustainability") >= 0) score += 10;
      if (eq.criterion === "relevance" && ind.dacCriteria.indexOf("relevance") >= 0) score += 8;
      if (eq.criterion === "coherence" && ind.dacCriteria.indexOf("coherence") >= 0) score += 8;
      if (eq._isEquity) {
        if (ind.id === "gen_008") score += 20;
        if (ind.disaggregation && ind.disaggregation.some(function(d) { return d.indexOf("quintile") >= 0; })) score += 12;
        if (ind.crossDisagg && ind.crossDisagg.some(function(d) { return d.indexOf("quintile") >= 0; })) score += 6;
      }
      if (ind.healthAreas.indexOf("cross_cutting") >= 0) score += 2;
      return Object.assign({}, ind, { matchScore: score, source: "auto" });
    }).filter(function(i) { return i.matchScore > 20; })
      .sort(function(a, b) { return b.matchScore - a.matchScore; })
      .slice(0, 10);
  }

  // ============================================================================
  // Ported: generateJudgementCriteria (from eval-matrix-builder)
  // ============================================================================
  function generateJudgementCriteria(indicators, criterion) {
    if (indicators.length === 0) return "";
    var topInd = indicators[0];
    switch (criterion) {
      case "effectiveness":
        if (topInd.level === "outcome" || topInd.level === "output")
          return '[Set target for ' + topInd.name + '] \u2014 e.g., "' + topInd.name + ' reaches [X]% by [date], with <[Y] pp gap between Q1 and Q5"';
        return "Programme achieves [X]% of planned outputs and [Y]% of intended outcome targets";
      case "efficiency":
        return "Unit cost per beneficiary is within [X]% of comparable programme benchmarks";
      case "impact":
        return '[Specify measurable change expected in ' + topInd.name + '] \u2014 e.g., "[Z]% reduction from baseline by endline"';
      case "sustainability":
        return "Government co-financing reaches [X]% by programme end; key approaches integrated into national guidelines";
      case "relevance":
        return "Programme objectives are aligned with national health sector strategy and target population's expressed priorities";
      case "coherence":
        return "Programme complements (does not duplicate) existing interventions and is aligned with national policies";
      default: return "";
    }
  }

  // ============================================================================
  // Ported: generateMatrix (from eval-matrix-builder)
  // ============================================================================
  function generateMatrix(toc, context) {
    var dacCriteria = context.dacCriteria || Object.keys(OECD_DAC);
    var questions = generateEvaluationQuestions(toc, context, dacCriteria);
    return questions.map(function(eq) {
      var indicators = matchIndicators(eq, context).slice(0, 5);
      var srcSet = {};
      indicators.forEach(function(i) { (i.dataSources || []).forEach(function(s) { srcSet[s] = true; }); });
      var allSources = Object.keys(srcSet).slice(0, 6);
      var disaggSet = {};
      indicators.forEach(function(i) {
        (i.disaggregation || []).forEach(function(d) { disaggSet[d] = true; });
        (i.crossDisagg || []).forEach(function(d) { disaggSet[d] = true; });
      });
      var jc = eq.judgementCriteria || generateJudgementCriteria(indicators, eq.criterion);
      return Object.assign({}, eq, {
        indicators: indicators,
        dataSources: allSources,
        disaggregation: Object.keys(disaggSet),
        judgementCriteria: jc,
      });
    });
  }

  // ============================================================================
  // Ported: flattenMatrixForExport (from eval-matrix-builder)
  // ============================================================================
  function flattenMatrixForExport(matrix) {
    return matrix.map(function(row) {
      return {
        "EQ #": row.id.replace("eq_", "EQ"),
        "OECD-DAC Criterion": OECD_DAC[row.criterion] ? OECD_DAC[row.criterion].name : row.criterion,
        "Evaluation Question": row.question,
        "Sub-Questions": (row.subQuestions || []).map(function(sq, j) { return (j+1) + ". " + sq; }).join("\n"),
        "Judgement Criteria": row.judgementCriteria || "",
        "Indicators": row.indicators.map(function(ind) { return (ind.code ? "[" + ind.code + "] " : "") + ind.name; }).join("\n"),
        "Data Sources": (row.dataSources || []).join("\n"),
        "Disaggregation": (row.disaggregation || []).join(", "),
        "Rationale": row.rationale || "",
      };
    });
  }

  // ============================================================================
  // NEW: EQ Suggestion Engine (spec section 8.3)
  //   generateEQSuggestions(toc, context, existingRows)
  //   Client-side rule engine that suggests new evaluation questions.
  // ============================================================================

  var DAC_TEMPLATES = {
    relevance: function(outcome) {
      return "To what extent has the programme addressed the needs identified in " + outcome + "?";
    },
    effectiveness: function(outcome) {
      return "To what extent has the programme contributed to achieving " + outcome + "?";
    },
    efficiency: function(outcome) {
      return "How efficiently were resources used to deliver " + outcome + "?";
    },
    sustainability: function(outcome) {
      return "To what extent are the results related to " + outcome + " likely to be sustained?";
    },
    impact: function(outcome) {
      return "What broader effects \u2014 intended or unintended \u2014 has the programme had beyond " + outcome + "?";
    },
    coherence: function(outcome) {
      return "To what extent is the programme's approach to " + outcome + " coherent with other interventions?";
    }
  };

  var NORMATIVE_QUESTIONS = [
    {
      criterion: "cross-cutting",
      question: "How do programme outcomes differ by gender, age group, and displacement status?",
      linkedOutcome: null,
      recommended: true,
      isNormative: true
    },
    {
      criterion: "cross-cutting",
      question: "What unintended negative effects has the programme had on communities?",
      linkedOutcome: null,
      recommended: true,
      isNormative: true
    }
  ];

  function generateEQSuggestions(toc, context, existingRows) {
    var suggestions = [];
    existingRows = existingRows || [];

    // Build a set of criteria already covered in existing rows
    var coveredCriteria = {};
    existingRows.forEach(function(row) {
      var key = (row.criterion || '').toLowerCase();
      if (!coveredCriteria[key]) coveredCriteria[key] = [];
      coveredCriteria[key].push(row);
    });

    // Convert toc if it has nodes/connections (workbench format)
    var matrixToc = toc;
    if (toc && toc.nodes) {
      matrixToc = praxisTocToMatrixToc(toc);
    }

    var outcomes = (matrixToc && matrixToc.outcomes) || [];
    var dacKeys = Object.keys(DAC_TEMPLATES);

    // For each outcome, generate one question per uncovered DAC criterion
    outcomes.forEach(function(outcome) {
      var outcomeText = typeof outcome === 'string' ? outcome : (outcome.text || '');
      if (!outcomeText) return;

      dacKeys.forEach(function(criterion) {
        // Check if this criterion is already covered for this outcome
        var existingForCriterion = coveredCriteria[criterion] || [];
        var alreadyCovered = existingForCriterion.some(function(row) {
          // Check if an existing row mentions this outcome
          var qText = (row.question || '').toLowerCase();
          var outcLower = outcomeText.toLowerCase();
          // Consider covered if the question text contains a substantial portion of the outcome text
          return qText.indexOf(outcLower.substring(0, Math.min(30, outcLower.length))) >= 0;
        });

        if (!alreadyCovered) {
          suggestions.push({
            criterion: criterion,
            question: DAC_TEMPLATES[criterion](outcomeText),
            linkedOutcome: outcomeText,
            recommended: true,
            isNormative: false
          });
        }
      });
    });

    // Add normative cross-cutting questions (always added unless already present)
    NORMATIVE_QUESTIONS.forEach(function(nq) {
      var alreadyPresent = existingRows.some(function(row) {
        return (row.question || '').toLowerCase() === nq.question.toLowerCase();
      });
      if (!alreadyPresent) {
        suggestions.push({
          criterion: nq.criterion,
          question: nq.question,
          linkedOutcome: nq.linkedOutcome,
          recommended: nq.recommended,
          isNormative: nq.isNormative
        });
      }
    });

    return suggestions;
  }

  // ============================================================================
  // Export
  // ============================================================================
  window.MatrixGenerator = {
    // Ported functions
    generateMatrix: generateMatrix,
    generateEvaluationQuestions: generateEvaluationQuestions,
    matchIndicators: matchIndicators,
    generateJudgementCriteria: generateJudgementCriteria,
    flattenMatrixForExport: flattenMatrixForExport,

    // Adapter functions
    praxisTocToMatrixToc: praxisTocToMatrixToc,
    praxisContextToMatrixContext: praxisContextToMatrixContext,

    // EQ suggestion engine
    generateEQSuggestions: generateEQSuggestions
  };

})();
