/**
 * demo-data.js — Pre-populated workbench context for demo/testing.
 * Based on: Global Fund RSSH Strengthening Grant, Ghana
 */
(function() {
  'use strict';

  window.PRAXIS_DEMO = {
    version: '1.0',
    schema: 'praxis-workbench',
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-03-28T14:30:00.000Z',

    project_meta: {
      title: 'GF RSSH Evaluation',
      programme_name: 'Global Fund RSSH Strengthening Grant',
      organisation: 'Global Fund / Ghana Health Service',
      country: 'Ghana',
      sector: 'health',
      health_areas: ['health_systems', 'malaria', 'hiv'],
      sectors: ['Health'],
      frameworks: [],
      evaluation_type: 'summative',
      operating_context: 'stable',
      budget: 'high',
      timeline: 'long',
      programme_maturity: 'mature',
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
      evaluation_purpose: ['accountability', 'learning', 'programme_improvement'],
      causal_inference_level: 'contribution',
      comparison_feasibility: 'natural',
      data_available: 'baseline_endline',
      unit_of_intervention: 'system',
      programme_complexity: 'complicated',
      geographic_scope: 'National (6 priority regions for phased rollout)',
      target_population: 'Health system actors and service users in 6 priority regions',
      evaluation_questions_raw: [
        'To what extent has the RSSH grant strengthened health commodity supply chains?',
        'How effectively has HMIS data quality and completeness improved?',
        'What has been the contribution of CHW deployment to community health outcomes?'
      ]
    },

    evaluability: {
      score: 68,
      dimensions: [
        { id: 'data', label: 'Data Availability', max: 25, system_score: 15, adjusted_score: null, justification: 'DHIS2 data completeness is high but accuracy varies across districts. GhiLMIS supply chain data is in a separate system. DHS available only every 5 years.' },
        { id: 'toc', label: 'ToC Clarity', max: 20, system_score: 14, adjusted_score: null, justification: 'Programme has a results framework but causal mechanisms between RSSH pillars and health outcomes are underspecified. No documented assumptions.' },
        { id: 'timeline', label: 'Timeline Adequacy', max: 20, system_score: 16, adjusted_score: null, justification: 'Adequate for process and output indicators. U5MR impact measurement requires two DHS rounds (10+ years), exceeding evaluation timeline.' },
        { id: 'context', label: 'Operating Context', max: 15, system_score: 12, adjusted_score: null, justification: 'Stable overall but northern priority regions face staff turnover, road access constraints during rainy season, and language barriers.' },
        { id: 'comparison', label: 'Comparison Feasibility', max: 20, system_score: 11, adjusted_score: null, justification: 'Phased rollout provides a natural experiment, but regions were selected on need (selection bias). Parallel trends assumption needs careful testing.' }
      ],
      blockers: [
        { dimension: 'data', label: 'Data Availability', score: 15, max: 25 }
      ],
      recommendations: [
        'Conduct data quality assessment (register-to-report verification) before relying on DHIS2 indicators.',
        'Use intermediate outcome indicators (case fatality rates, treatment completion) as proxies for impact rather than attempting U5MR attribution.',
        'Test parallel trends at district level within regions rather than across regions to mitigate selection bias.'
      ],
      completed_at: '2026-01-20T10:00:00.000Z'
    },

    toc: {
      title: 'GF RSSH Theory of Change',
      narrative: {
        description: 'The Global Fund grant strengthens Ghana\'s health system across three pillars: supply chain, HMIS, and community health workers.',
        context: 'Ghana has a decentralised health system with regional autonomy. The grant operates through the Ghana Health Service with district-level implementation.',
        theory: 'By strengthening supply chains, improving data systems, and deploying CHWs, the programme will improve service delivery quality, which in turn improves health outcomes.',
        systemAssumptions: []
      },
      nodes: [
        { id: 'n1', title: 'Reduced under-5 mortality', level: 'impact', x: 400, y: 100 },
        { id: 'n2', title: 'Improved health service quality', level: 'outcome', x: 200, y: 500 },
        { id: 'n3', title: 'Increased treatment coverage', level: 'outcome', x: 600, y: 500 },
        { id: 'n4', title: 'Reliable commodity supply', level: 'output', x: 100, y: 900 },
        { id: 'n5', title: 'Functional HMIS reporting', level: 'output', x: 400, y: 900 },
        { id: 'n6', title: 'CHW network deployed', level: 'output', x: 700, y: 900 },
        { id: 'n7', title: 'Supply chain training', level: 'activity', x: 100, y: 1300 },
        { id: 'n8', title: 'DHIS2 rollout', level: 'activity', x: 400, y: 1300 },
        { id: 'n9', title: 'CHW recruitment & training', level: 'activity', x: 700, y: 1300 }
      ],
      connections: [
        { id: 'c1', sourceId: 'n2', targetId: 'n1', evidence: { strength: 'strong' } },
        { id: 'c2', sourceId: 'n3', targetId: 'n1', evidence: { strength: 'moderate' } },
        { id: 'c3', sourceId: 'n4', targetId: 'n2', evidence: { strength: 'moderate' } },
        { id: 'c4', sourceId: 'n5', targetId: 'n2', evidence: { strength: 'moderate' } },
        { id: 'c5', sourceId: 'n6', targetId: 'n3', evidence: { strength: 'strong' } },
        { id: 'c6', sourceId: 'n7', targetId: 'n4', evidence: { strength: 'moderate' } },
        { id: 'c7', sourceId: 'n8', targetId: 'n5', evidence: { strength: 'strong' } },
        { id: 'c8', sourceId: 'n9', targetId: 'n6', evidence: { strength: 'moderate' } }
      ],
      knowledge_sources: {},
      completed_at: '2026-02-01T10:00:00.000Z'
    },

    evaluation_matrix: {
      context: {
        programmeName: 'Global Fund RSSH Strengthening Grant',
        sectorTemplate: 'health',
        healthAreas: ['health_systems', 'malaria', 'hiv'],
        frameworks: [],
        evaluationType: 'summative',
        operatingContext: 'stable',
        dacCriteria: ['relevance', 'coherence', 'effectiveness', 'efficiency', 'impact', 'sustainability']
      },
      toc_summary: {
        goal: 'Reduced under-5 mortality',
        outcomes: [
          { text: 'Improved health service quality', outputs: ['Reliable commodity supply', 'Functional HMIS reporting'] },
          { text: 'Increased treatment coverage', outputs: ['CHW network deployed'] }
        ],
        assumptions: []
      },
      rows: [
        {
          id: 'eq_1', number: 1, criterion: 'relevance',
          question: 'To what extent has the RSSH grant addressed the priority health system gaps identified in Ghana\'s national health strategy?',
          subQuestions: ['How well aligned is the grant with GHS priorities?', 'Are the three pillars the right entry points?'],
          indicators: [
            { name: 'Alignment score with national health strategy priorities', code: 'REL-1', source: 'Custom' },
            { name: 'Stakeholder satisfaction with programme focus areas', code: 'REL-2', source: 'Custom' }
          ],
          dataSources: ['National health strategy document review', 'Key informant interviews with GHS leadership'],
          judgementCriteria: 'Strong: >80% alignment with national priorities'
        },
        {
          id: 'eq_2', number: 2, criterion: 'effectiveness',
          question: 'To what extent has the programme reduced stock-out rates for essential health commodities in target regions?',
          subQuestions: ['What is the trend in stock-out rates?', 'Which commodities show greatest improvement?'],
          indicators: [
            { name: 'Percentage of health facilities reporting zero stock-outs of tracer commodities', code: 'EFF-1', source: 'DHIS2' },
            { name: 'Average days of stock-out per quarter per facility', code: 'EFF-2', source: 'LMIS' }
          ],
          dataSources: ['DHIS2 facility reporting', 'LMIS quarterly reports', 'Facility spot checks'],
          judgementCriteria: 'Strong: <10% facilities with stock-outs; Moderate: 10-25%; Weak: >25%'
        },
        {
          id: 'eq_3', number: 3, criterion: 'effectiveness',
          question: 'How effectively has HMIS data completeness and timeliness improved across the 6 priority regions?',
          subQuestions: ['What is the reporting rate trend?', 'Has data quality improved alongside completeness?'],
          indicators: [
            { name: 'DHIS2 monthly reporting completeness rate', code: 'EFF-3', source: 'DHIS2' },
            { name: 'Timeliness of monthly facility reports', code: 'EFF-4', source: 'DHIS2' }
          ],
          dataSources: ['DHIS2 analytics', 'Data quality assessment reports'],
          judgementCriteria: 'Strong: >90% completeness and >80% timeliness'
        },
        {
          id: 'eq_4', number: 4, criterion: 'impact',
          question: 'What has been the broader health impact of the RSSH investments on under-5 mortality and treatment outcomes?',
          subQuestions: ['Can changes in U5MR be attributed to supply chain improvements?', 'What is the contribution vs. other health programmes?'],
          indicators: [
            { name: 'Under-5 mortality rate (regional)', code: 'IMP-1', source: 'DHS/MICS' },
            { name: 'Treatment success rate for malaria and HIV', code: 'IMP-2', source: 'Programme data' }
          ],
          dataSources: ['DHS/MICS surveys', 'Regional health statistics', 'Programme monitoring data'],
          judgementCriteria: 'Measurable decline in U5MR in intervention regions vs. comparison'
        },
        {
          id: 'eq_5', number: 5, criterion: 'efficiency',
          question: 'How cost-effective is the CHW deployment model compared to facility-based service delivery?',
          subQuestions: ['What is the unit cost per beneficiary reached?', 'How does cost-effectiveness compare across regions?'],
          indicators: [
            { name: 'Unit cost of CHW service delivery per capita', code: 'EFI-1', source: 'Financial data' },
            { name: 'Cost per DALY averted (CHW vs. facility)', code: 'EFI-2', source: 'Modelled' }
          ],
          dataSources: ['Programme financial reports', 'GHS expenditure data', 'Cost-effectiveness modelling'],
          judgementCriteria: 'CHW model is cost-effective if unit cost is <150% of facility-based delivery with comparable outcomes'
        },
        {
          id: 'eq_6', number: 6, criterion: 'coherence',
          question: 'How well does the RSSH grant align with and complement other health programmes operating in Ghana (PEPFAR, PMI, GAVI, bilateral support)?',
          subQuestions: ['Are there areas of duplication or gaps?', 'How effective is coordination through the CCM and sector working groups?'],
          indicators: [
            { name: 'Number of coordination mechanisms with active GF participation', code: 'COH-1', source: 'Institutional assessment' },
            { name: 'Degree of alignment between GF RSSH activities and national health sector plan priorities', code: 'COH-2', source: 'Document review' }
          ],
          dataSources: ['CCM meeting minutes', 'Health sector review documents', 'Partner mapping exercise', 'KIIs with development partners'],
          judgementCriteria: 'Strong: formal coordination mechanisms with documented complementarity. Moderate: informal coordination. Weak: duplication or gaps identified.'
        },
        {
          id: 'eq_7', number: 7, criterion: 'sustainability',
          question: 'Will the health system strengthening gains be sustained after the Global Fund grant period ends?',
          subQuestions: ['Is government co-financing increasing?', 'Are institutional structures being integrated into GHS?'],
          indicators: [
            { name: 'Government co-financing ratio for RSSH activities', code: 'SUS-1', source: 'Financial data' },
            { name: 'Number of RSSH functions formally integrated into GHS structures', code: 'SUS-2', source: 'Institutional assessment' }
          ],
          dataSources: ['GHS budget analysis', 'Institutional capacity assessments', 'Policy document review'],
          judgementCriteria: 'Strong: >60% government co-financing and formal integration plan approved'
        }
      ],
      completed_at: '2026-02-15T10:00:00.000Z'
    },

    design_recommendation: {
      answers: {
        purpose: 'accountability',
        causal: 'contribution',
        comparison: 'natural',
        data: 'baseline_endline',
        context: 'stable',
        budget: 'high',
        timeline: 'long',
        maturity: 'mature',
        complexity: 'complicated',
        unit: 'system'
      },
      ranked_designs: [
        { id: 'did', name: 'Difference-in-Differences', family: 'Quasi-Experimental', score: 87 },
        { id: 'its', name: 'Interrupted Time Series', family: 'Quasi-Experimental', score: 82 },
        { id: 'psm', name: 'Propensity Score Matching', family: 'Quasi-Experimental', score: 74 }
      ],
      selected_design: 'did',
      justification: 'DID exploits the phased rollout across 6 regions as a natural experiment.',
      completed_at: '2026-02-20T10:00:00.000Z'
    },

    sample_parameters: {
      design_id: 'did',
      params: { clusters: 120, effect_size: 0.3, power: 0.8, alpha: 0.05, icc: 0.05 },
      result: { primary: 1440, label: 'Difference-in-Differences (120 facilities, 12 per region)' },
      qualitative_plan: {
        purpose: 'Understand mechanisms of change and contextual factors',
        methods: ['KII', 'FGD', 'Document review'],
        contexts: {},
        breakdown: [
          { method: 'Key Informant Interviews', count: 36, notes: '6 per region: District Health Director, District Pharmacy Technician, District Health Information Officer, Sub-district Head (CHPS Coordinator), facility-in-charge, Regional Health Director' },
          { method: 'Focus Group Discussions', count: 24, notes: '4 per region: CHOs/CHVs (1), community members female (1), community members male (1), facility staff (1). Stratified by urban/rural.' },
          { method: 'Document Review', count: 1, notes: 'National health strategy, GF grant documents, GHS annual reports' }
        ]
      },
      completed_at: '2026-02-25T10:00:00.000Z'
    },

    instruments: {
      items: [
        {
          id: 'inst_1', title: 'Facility Assessment Questionnaire', name: 'Facility Assessment Questionnaire',
          type: 'survey', method: 'Structured questionnaire', targetSample: '120 facilities',
          sections: [
            {
              id: 'sec_1', label: 'Supply Chain (EQ2)', eqId: 'eq_2',
              questions: [
                { id: 'q1', text: 'In the past 3 months, how many days was this facility out of stock of ACTs?', responseType: 'numeric', responseConfig: { min: 0, max: 90, unit: 'days' }, required: true },
                { id: 'q2', text: 'Does this facility have a functioning stock management system?', responseType: 'select_one', responseConfig: { options: ['Yes, electronic', 'Yes, paper-based', 'No'] }, required: true },
                { id: 'q3', text: 'How would you rate the reliability of commodity supply in the past 12 months?', responseType: 'likert', responseConfig: { points: 5 }, required: true }
              ]
            },
            {
              id: 'sec_2', label: 'HMIS Reporting (EQ3)', eqId: 'eq_3',
              questions: [
                { id: 'q4', text: 'Does this facility submit monthly DHIS2 reports?', responseType: 'select_one', responseConfig: { options: ['Yes, always on time', 'Yes, sometimes late', 'No'] }, required: true },
                { id: 'q5', text: 'How many staff have been trained on DHIS2 data entry?', responseType: 'numeric', responseConfig: { min: 0, max: 50, unit: 'staff' }, required: true },
                { id: 'q6', text: 'What are the main barriers to timely reporting?', responseType: 'text', responseConfig: { maxLength: 500 }, required: false }
              ]
            }
          ],
          questions: [
            { id: 'q1', text: 'ACT stock-out days', responseType: 'numeric' },
            { id: 'q2', text: 'Stock management system', responseType: 'select_one' },
            { id: 'q3', text: 'Supply reliability rating', responseType: 'likert' },
            { id: 'q4', text: 'DHIS2 reporting', responseType: 'select_one' },
            { id: 'q5', text: 'DHIS2-trained staff', responseType: 'numeric' },
            { id: 'q6', text: 'Reporting barriers', responseType: 'text' }
          ]
        },
        {
          id: 'inst_2', title: 'KII Guide — District Health Director', name: 'KII Guide — District Health Director',
          type: 'kii', method: 'Semi-structured interview', targetSample: '36 KIIs',
          sections: [
            {
              id: 'sec_3', label: 'Programme Relevance (EQ1)', eqId: 'eq_1',
              questions: [
                { id: 'q7', text: 'How well does the RSSH grant align with your district health priorities?', responseType: 'text', responseConfig: {}, required: true },
                { id: 'q8', text: 'What health system gaps were most critical before the programme?', responseType: 'text', responseConfig: {}, required: true }
              ]
            },
            {
              id: 'sec_4', label: 'Sustainability (EQ6)', eqId: 'eq_7',
              questions: [
                { id: 'q9', text: 'What plans exist to sustain RSSH activities after the grant ends?', responseType: 'text', responseConfig: {}, required: true },
                { id: 'q10', text: 'What proportion of RSSH costs are now covered by government budget?', responseType: 'text', responseConfig: {}, required: false }
              ]
            }
          ],
          questions: [
            { id: 'q7', text: 'Grant alignment', responseType: 'text' },
            { id: 'q8', text: 'Pre-programme gaps', responseType: 'text' },
            { id: 'q9', text: 'Sustainability plans', responseType: 'text' },
            { id: 'q10', text: 'Government cost share', responseType: 'text' }
          ]
        }
      ],
      completed_at: '2026-03-01T10:00:00.000Z'
    },

    analysis_plan: { quantitative: [], qualitative: [], rows: [], completed_at: null },
    report_structure: { sections: [], completed_at: null },
    presentation: { slides: [], completed_at: null },

    staleness: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false },
    reviews: []
  };
})();
