(function() {
  'use strict';

  var PRAXIS_VERSION = '1.0';

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
    8: ['presentation']
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

      staleness: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false },
      reviews: []
    };
  }

  window.PraxisSchema = {
    PRAXIS_VERSION: PRAXIS_VERSION,
    STATION_LABELS: STATION_LABELS,
    STATION_FIELDS: STATION_FIELDS,
    createEmptyContext: createEmptyContext
  };
})();
