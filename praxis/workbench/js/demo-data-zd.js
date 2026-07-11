/**
 * demo-data-zd.js - Gavi Zero-Dose evaluation.
 * Regenerated at schema 1.6.0 (dated decision windows, gate lock, user status).
 */
(function() {
  'use strict';
  window.PRAXIS_DEMO_ZD = {
  "version": "1.6.0",
  "schema": "praxis-workbench",
  "created_at": "2024-01-15T09:00:00.000Z",
  "updated_at": "2024-03-28T14:30:00.000Z",
  "project_meta": {
    "title": "Gavi Zero-Dose Evaluation",
    "programme_name": "Gavi's contribution to reaching zero-dose and missed communities (5.0/5.1 ZD Agenda)",
    "organisation": "Gavi, the Vaccine Alliance (independent evaluator: Ipsos)",
    "country": "Multi-country (8 case studies: Afghanistan, Cambodia, Cote d'Ivoire, Djibouti, Ethiopia, India, Pakistan, South Sudan)",
    "sector_template": "health",
    "sectors": [
      "Health"
    ],
    "primary_sector": "Health",
    "health_areas": [
      "health_systems"
    ],
    "frameworks": [],
    "evaluation_type": "summative",
    "operating_context": "fragile",
    "budget": "high",
    "timeline": "long",
    "programme_maturity": "scaling",
    "languages": [
      "en"
    ],
    "sector": "health"
  },
  "protection": {
    "sensitivity": "standard",
    "ai_permitted": true,
    "sharing_guidance": "",
    "encryption_recommended": false,
    "access_notes": "Report classified as Internal by Gavi. KII informant lists kept confidential to the evaluation team for ethical reasons."
  },
  "tor_constraints": {
    "raw_text": "Gavi commissioned Ipsos to provide robust, credible evidence of how its funding and non-funding instruments contribute to reaching zero-dose children and missed communities between September 2022 and October 2025. The evaluation is theory-based and utilisation-focused, with both summative (accountability) and formative (learning) aims, and looks back to Gavi 4.0 and forward to Gavi 6.0. Year 1 establishes a baseline in eight case-study countries.",
    "evaluation_purpose": [
      "accountability",
      "learning",
      "programme_improvement"
    ],
    "causal_inference_level": "contribution",
    "comparison_feasibility": "none",
    "data_available": "routine_monitoring",
    "unit_of_intervention": "system",
    "programme_complexity": "complex",
    "geographic_scope": "Multi-country: 8 case studies across High-Impact (Ethiopia, India, Pakistan), Core (Cambodia, Cote d'Ivoire, Djibouti) and Fragile/Conflict-Affected (Afghanistan, South Sudan) segments.",
    "target_population": "Zero-dose children and missed communities in Gavi-eligible countries: remote/rural/nomadic groups, marginalised urban communities, and fragile/conflict-affected populations.",
    "evaluation_questions_raw": [
      "How relevant is Gavi 5.0/5.1's focus on zero-dose children and missed communities to countries' needs?",
      "How relevant are the Gavi funding levers to the needs of countries with regard to reaching zero-dose children and missed communities?",
      "How coherent is Gavi's ZD agenda with the focus of other international and national actors?",
      "To what extent have Gavi 5.0/5.1 funding levers, processes and guidance enabled countries to focus their support towards reaching zero-dose children and missed communities?",
      "How have Gavi grants initiated under Gavi 4.0, with continued implementation in 5.0/5.1, contributed to delivery of the ZD agenda at country level?",
      "How have Gavi grants initiated in Gavi 5.0/5.1 contributed to delivery of the ZD agenda at country level?",
      "To what extent are the theory of action and theory of change for the ZD agenda fit for purpose?",
      "To what extent, and how, is sustainability addressed in Gavi's approach to reaching zero-dose children and missed communities?"
    ]
  },
  "evaluability": {
    "score": 62,
    "dimensions": [
      {
        "id": "data",
        "label": "Data Availability",
        "max": 25,
        "system_score": 13,
        "adjusted_score": null,
        "justification": "Internal and country data systems are weak and patchy; the MPM system is incomplete, population data are poor, and much 4.0 evidence is single-datapoint or activity-level. WUENIC/eJRF provide usable secondary coverage data."
      },
      {
        "id": "toc",
        "label": "ToC Clarity",
        "max": 20,
        "system_score": 16,
        "adjusted_score": null,
        "justification": "A detailed theory of change and an extensive assumptions register were developed in the Inception Phase, with country-specific ToCs, giving strong causal-logic clarity to test over time."
      },
      {
        "id": "timeline",
        "label": "Timeline Adequacy",
        "max": 20,
        "system_score": 16,
        "adjusted_score": null,
        "justification": "A three-phase, three-year longitudinal design (2022-2025) is well matched to tracking grant progress from approval through implementation, though outcome-level change will only be visible in later phases."
      },
      {
        "id": "context",
        "label": "Operating Context",
        "max": 15,
        "system_score": 9,
        "adjusted_score": null,
        "justification": "Case studies span stable Core and Fragile/Conflict-Affected settings; Afghanistan and South Sudan were 'limited' due to access constraints, and fieldwork was delayed with four 'Wave 2' countries."
      },
      {
        "id": "comparison",
        "label": "Comparison Feasibility",
        "max": 20,
        "system_score": 8,
        "adjusted_score": null,
        "justification": "No counterfactual is available; the design relies on theory-based contribution analysis. Formal contribution analysis of 4.0 grants was scaled back due to pooled funding and data limitations."
      }
    ],
    "blockers": [
      {
        "dimension": "data",
        "label": "Data Availability",
        "score": 13,
        "max": 25
      }
    ],
    "recommendations": [
      "Maximise use of alternative country-level data sources (Gavi and external) and adjust expected depth of contribution assessment to actual data availability.",
      "Assess strength of evidence explicitly at the level of each evaluation question and flag where evidence will be strengthened in Phases 2-3.",
      "Complement global cross-country analysis with co-created 'deep dives' on priority topics (PHC/UHC integration, pooled funds, working with CSOs)."
    ],
    "completed_at": "2024-01-10T10:00:00.000Z"
  },
  "toc": {
    "title": "Gavi Zero-Dose Agenda - Theory of Change",
    "narrative": {
      "description": "Gavi 5.0/5.1 aims to leave no one behind with immunisation by reaching zero-dose children and missed communities through updated funding levers and the IRMMA framework.",
      "context": "Gavi operates through a country-led business model across diverse segments (High-Impact, Core, Fragile/Conflict). ZD prevalence concentrates in remote/rural/nomadic, marginalised urban, and fragile/conflict-affected populations.",
      "theory": "By directing funding levers (HSS, EAF, ZIP, TCA, CCEOP) and IRMMA strategies to identify and reach ZD communities, strengthen supply chains and generate demand, Gavi expects improved immunisation coverage and equity, and ultimately a reduction in zero-dose children.",
      "systemAssumptions": [
        "Countries can identify ZD communities despite weak population and routine data.",
        "Funding levers are understood and used as intended rather than merged into general immunisation budgets.",
        "CSO and community engagement translates into sustained demand generation, including addressing gender barriers."
      ]
    },
    "nodes": [
      {
        "id": "n1",
        "title": "Reduced number of zero-dose children (Gavi mission: -25% by 2025)",
        "level": "impact",
        "x": 400,
        "y": 100
      },
      {
        "id": "n2",
        "title": "Improved immunisation coverage and equity for ZD and missed communities",
        "level": "outcome",
        "x": 200,
        "y": 500
      },
      {
        "id": "n3",
        "title": "ZD children and missed communities identified and reached",
        "level": "outcome",
        "x": 600,
        "y": 500
      },
      {
        "id": "n4",
        "title": "IRMMA strategies embedded in country grants",
        "level": "output",
        "x": 100,
        "y": 900
      },
      {
        "id": "n5",
        "title": "Funding levers (HSS, EAF, ZIP, TCA, CCEOP) directed to ZD priorities",
        "level": "output",
        "x": 350,
        "y": 900
      },
      {
        "id": "n6",
        "title": "Strengthened supply chain and cold chain in hard-to-reach areas",
        "level": "output",
        "x": 600,
        "y": 900
      },
      {
        "id": "n7",
        "title": "Demand generation and CSO/community engagement scaled",
        "level": "output",
        "x": 850,
        "y": 900
      },
      {
        "id": "n8",
        "title": "Full Portfolio Planning and micro-planning",
        "level": "activity",
        "x": 100,
        "y": 1300
      },
      {
        "id": "n9",
        "title": "Grant design, approval and disbursement",
        "level": "activity",
        "x": 350,
        "y": 1300
      },
      {
        "id": "n10",
        "title": "Non-state partner (CSO/NGO) contracting via EAF/ZIP",
        "level": "activity",
        "x": 600,
        "y": 1300
      },
      {
        "id": "n11",
        "title": "Advocacy for the ZD agenda (global and national)",
        "level": "activity",
        "x": 850,
        "y": 1300
      }
    ],
    "connections": [
      {
        "id": "c1",
        "sourceId": "n2",
        "targetId": "n1",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c2",
        "sourceId": "n3",
        "targetId": "n1",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c3",
        "sourceId": "n4",
        "targetId": "n3",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c4",
        "sourceId": "n5",
        "targetId": "n2",
        "evidence": {
          "strength": "weak"
        }
      },
      {
        "id": "c5",
        "sourceId": "n6",
        "targetId": "n2",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c6",
        "sourceId": "n7",
        "targetId": "n3",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c7",
        "sourceId": "n8",
        "targetId": "n4",
        "evidence": {
          "strength": "strong"
        }
      },
      {
        "id": "c8",
        "sourceId": "n9",
        "targetId": "n5",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c9",
        "sourceId": "n10",
        "targetId": "n7",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c10",
        "sourceId": "n11",
        "targetId": "n4",
        "evidence": {
          "strength": "weak"
        }
      }
    ],
    "knowledge_sources": {},
    "completed_at": "2024-02-10T10:00:00.000Z"
  },
  "evaluation_matrix": {
    "context": {
      "programmeName": "Gavi 5.0/5.1 Zero-Dose Agenda",
      "sectorTemplate": "health",
      "healthAreas": [
        "health_systems"
      ],
      "frameworks": [],
      "evaluationType": "summative",
      "operatingContext": "fragile",
      "dacCriteria": [
        "relevance",
        "coherence",
        "effectiveness",
        "sustainability"
      ]
    },
    "toc_summary": {
      "goal": "Reduced number of zero-dose children (Gavi mission indicator: -25% by 2025)",
      "outcomes": [
        {
          "text": "Improved immunisation coverage and equity for ZD and missed communities",
          "outputs": [
            "IRMMA strategies embedded in country grants",
            "Strengthened supply chain and cold chain"
          ]
        },
        {
          "text": "ZD children and missed communities identified and reached",
          "outputs": [
            "Demand generation and CSO/community engagement scaled",
            "Funding levers directed to ZD priorities"
          ]
        }
      ],
      "assumptions": [],
      "inputMode": "structured",
      "freeText": ""
    },
    "rows": [
      {
        "id": "eq_1",
        "number": 1,
        "criterion": "relevance",
        "question": "How relevant is Gavi 5.0/5.1's focus on zero-dose children and missed communities to countries' needs?",
        "subQuestions": [
          "How relevant are the IRMMA framework and each of its intervention areas to countries' needs, and is it the right approach to deliver the ZD agenda?",
          "What effect did the COVID-19 disruption have on Gavi's ability to move forward with the ZD agenda?"
        ],
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and country immunisation priorities (case-study rating)",
            "code": "REL-1",
            "source": "KII + document review"
          },
          {
            "name": "Share of SCM survey respondents rating IRMMA elements as aligned to country needs",
            "code": "REL-2",
            "source": "SCM survey"
          }
        ],
        "dataSources": [
          "Country case studies (70 KIIs)",
          "FPP and grant application documents",
          "SCM online survey (n=35)"
        ],
        "judgementCriteria": "Strong (SoE 1-2): ZD focus consistently relevant across diverse country contexts with triangulated evidence. Weak (SoE 3-4): relevance perception-based or contested."
      },
      {
        "id": "eq_2",
        "number": 2,
        "criterion": "relevance",
        "question": "How relevant are the Gavi funding levers to the needs of countries with regard to reaching zero-dose children and missed communities?",
        "subQuestions": [
          "Do countries distinguish between HSS, EAF and other levers, and are the levers fit for ZD targeting?",
          "Where do the levers add value versus create bureaucratic burden?"
        ],
        "indicators": [
          {
            "name": "Extent to which funding levers (HSS, EAF, ZIP, TCA, CCEOP) are directed to ZD-relevant investment areas",
            "code": "REL-3",
            "source": "FPP budgets + document review"
          },
          {
            "name": "Number of countries seeking EAF allocations",
            "code": "REL-4",
            "source": "Gavi Secretariat data"
          }
        ],
        "dataSources": [
          "FPP documentation and budget sheets",
          "Global and country KIIs",
          "Gavi grant tracking data"
        ],
        "judgementCriteria": "Strong: levers demonstrably tailored to ZD needs with clear country uptake. Weak: levers merged/confused or seen as adding administrative burden."
      },
      {
        "id": "eq_3",
        "number": 3,
        "criterion": "coherence",
        "question": "How coherent is Gavi's ZD agenda with the focus of other international and national actors?",
        "subQuestions": [
          "How aligned is the ZD agenda with IA2030, WHO GPW13, SDG3 GAP and regional frameworks?",
          "How coherent is the ZD agenda with national vaccination strategies and wider HSS/PHC/UHC agendas?"
        ],
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and partner/national strategic frameworks",
            "code": "COH-1",
            "source": "Document review"
          },
          {
            "name": "Evidence of coordination mechanisms with active Gavi participation at country level",
            "code": "COH-2",
            "source": "KII + institutional review"
          }
        ],
        "dataSources": [
          "Global strategy documents (IA2030, GPW13, SDG3 GAP)",
          "National immunisation strategies",
          "Global stakeholder KIIs (56)"
        ],
        "judgementCriteria": "Strong: documented alignment with partner and national frameworks and functioning coordination. Weak: alignment nominal, or incoherence in resource-constrained/fragile settings."
      },
      {
        "id": "eq_4",
        "number": 4,
        "criterion": "effectiveness",
        "question": "To what extent have Gavi 5.0/5.1 funding levers, processes and guidance enabled countries to focus their support towards reaching zero-dose children and missed communities?",
        "subQuestions": [
          "What are the main drivers and barriers to these processes and levers being used?",
          "To what extent are the ZD working groups and Secretariat architecture coherently designed and contributing to operationalisation?"
        ],
        "indicators": [
          {
            "name": "Change in prevalence of IRMMA-associated ZD strategies in grant applications (4.0 vs 5.0/5.1)",
            "code": "EFF-1",
            "source": "Grant application analysis"
          },
          {
            "name": "Average time from FPP start to IRC decision and to first disbursement (months)",
            "code": "EFF-2",
            "source": "Gavi process data"
          },
          {
            "name": "Share of HSS/EAF funds allocated to demand generation, supply chain and data systems",
            "code": "EFF-3",
            "source": "FPP budget analysis"
          }
        ],
        "dataSources": [
          "Grant applications (8 case studies)",
          "FPP/IRC process data",
          "MPM dashboard",
          "Country and global KIIs"
        ],
        "judgementCriteria": "Strong: clear increase in ZD-focused strategies and timely operationalisation. Weak (current baseline): operationalisation slow, levers merged, weak Secretariat oversight."
      },
      {
        "id": "eq_5",
        "number": 5,
        "criterion": "effectiveness",
        "question": "How have Gavi grants initiated under Gavi 4.0, with continued implementation in 5.0/5.1, contributed to delivery of the ZD agenda at country level?",
        "subQuestions": [
          "To what extent did the Maintain, Restore and Strengthen (MRS) response reach ZD children and missed communities?",
          "Which IRMMA elements did 4.0 grants contribute to most?"
        ],
        "indicators": [
          {
            "name": "Plausible contribution of Gavi 4.0 pro-equity grants to ZD outcomes (contribution rating)",
            "code": "EFF-4",
            "source": "Contribution analysis"
          },
          {
            "name": "Trend in number of zero-dose children in supported countries (2015-2022)",
            "code": "EFF-5",
            "source": "WUENIC / eJRF"
          }
        ],
        "dataSources": [
          "Gavi 4.0 grant documents and reports",
          "WUENIC/eJRF harmonised indicator database",
          "Country case-study KIIs"
        ],
        "judgementCriteria": "Partial contribution: 4.0 grants contributed more to Identify and Reach than to Monitor, Measure or Advocate; formal contribution analysis constrained by data limitations."
      },
      {
        "id": "eq_6",
        "number": 6,
        "criterion": "effectiveness",
        "question": "How have Gavi grants initiated in Gavi 5.0/5.1 contributed to delivery of the ZD agenda at country level?",
        "subQuestions": [
          "What early evidence exists of 5.0/5.1 grants shifting country approaches to ZD?",
          "What, if any, are the unintended consequences of targeting ZD and missed communities?"
        ],
        "indicators": [
          {
            "name": "Share of 5.0/5.1 grants disbursing and implementing ZD-targeted activities",
            "code": "EFF-6",
            "source": "Grant tracking + KII"
          },
          {
            "name": "Evidence of increased resource allocation to non-state actors (local CSOs) for demand generation",
            "code": "EFF-7",
            "source": "FPP budget analysis"
          }
        ],
        "dataSources": [
          "5.0/5.1 grant applications and disbursement data",
          "MPM dashboard",
          "Country KIIs"
        ],
        "judgementCriteria": "Baseline: few 5.0/5.1 grants have disbursed; early signals of increased IRMMA strategies and CSO engagement, limited implementation evidence to date."
      },
      {
        "id": "eq_7",
        "number": 7,
        "criterion": "effectiveness",
        "question": "To what extent are the theory of action and theory of change for the ZD agenda fit for purpose?",
        "subQuestions": [
          "Did implementation reflect the causal pathways and underlying assumptions in the theory of change?",
          "Which assumptions are holding true, and which are at risk?"
        ],
        "indicators": [
          {
            "name": "Proportion of ToC causal links with supporting evidence at baseline",
            "code": "EFF-8",
            "source": "Process tracing / ToC test"
          },
          {
            "name": "Number of ToC assumptions assessed as holding / not holding",
            "code": "EFF-9",
            "source": "Assumption testing"
          }
        ],
        "dataSources": [
          "Inception-phase ToC and assumptions register",
          "Case-study country ToCs",
          "Triangulated findings across EQs"
        ],
        "judgementCriteria": "Prioritised in Years 2-3; baseline establishes the ToC and assumptions against which causal pathways will be tested longitudinally."
      },
      {
        "id": "eq_8",
        "number": 8,
        "criterion": "sustainability",
        "question": "To what extent, and how, is sustainability addressed in Gavi's approach to reaching zero-dose children and missed communities?",
        "subQuestions": [
          "What sustainability plans, if any, were incorporated into pro-equity and ZD programmes and workplans?",
          "Is government co-financing and institutional integration increasing?"
        ],
        "indicators": [
          {
            "name": "Presence and quality of sustainability/transition plans in ZD grant documentation",
            "code": "SUS-1",
            "source": "Document review"
          },
          {
            "name": "Trend in government co-financing and integration of ZD functions into national systems",
            "code": "SUS-2",
            "source": "Financial + institutional review"
          }
        ],
        "dataSources": [
          "Grant and transition-plan documents",
          "National health financing data",
          "Country KIIs"
        ],
        "judgementCriteria": "Prioritised in Years 2-3; baseline notes limited explicit sustainability planning and reliance on external technical assistance."
      }
    ],
    "completed_at": "2024-02-10T10:00:00.000Z"
  },
  "design_recommendation": {
    "answers": {
      "purpose": "accountability",
      "causal": "contribution",
      "comparison": "none",
      "data": "routine_monitoring",
      "context": "fragile",
      "budget": "high",
      "timeline": "long",
      "maturity": "scaling",
      "complexity": "complex",
      "unit": "system"
    },
    "ranked_designs": [
      {
        "id": "contributionAnalysis",
        "name": "Contribution Analysis",
        "family": "Theory-Based",
        "score": 90
      },
      {
        "id": "processTracing",
        "name": "Process Tracing",
        "family": "Theory-Based",
        "score": 84
      },
      {
        "id": "caseStudy",
        "name": "Comparative Case Study",
        "family": "Case-Based",
        "score": 80
      }
    ],
    "selected_design": "contributionAnalysis",
    "justification": "The intervention is highly complex and system-level with no counterfactual, so a theory-based contribution analysis is the appropriate design: it interrogates the causal logic of the ToC over time, tests assumptions, and triangulates qualitative and secondary quantitative evidence. Process tracing and comparative case study across the eight countries support causal inference where formal counterfactual methods are infeasible.",
    "completed_at": "2024-02-10T10:00:00.000Z"
  },
  "sample_parameters": {
    "design_id": "contributionAnalysis",
    "params": {},
    "result": {
      "primary": 126,
      "label": "Theory-based, qualitative-dominant: 126 key informant interviews across 8 case-study countries plus SCM survey (n=35) and desk review (118 documents)"
    },
    "qualitative_plan": {
      "purpose": "Establish an in-depth baseline and test the ToC and its assumptions by triangulating stakeholder perspectives with secondary coverage data across diverse country contexts.",
      "methods": [
        "Key Informant Interviews",
        "Online survey",
        "Document review",
        "Secondary data analysis",
        "Country case studies"
      ],
      "contexts": {},
      "breakdown": [
        {
          "method": "Global stakeholder KIIs",
          "count": 56,
          "notes": "Gavi Secretariat, Alliance partners and global immunisation stakeholders (includes one joint interview)."
        },
        {
          "method": "Country stakeholder KIIs",
          "count": 70,
          "notes": "National stakeholders across the eight case-study countries; recorded with informed consent, informant lists confidential."
        },
        {
          "method": "SCM online survey",
          "count": 35,
          "notes": "Senior Country Managers across High-Impact, Core and Fragile/Conflict countries."
        },
        {
          "method": "Desk review",
          "count": 118,
          "notes": "Programme documents, academic literature, evaluation reports and secondary data sources (Annex 1 bibliography)."
        },
        {
          "method": "Country case studies",
          "count": 8,
          "notes": "Afghanistan, Cambodia, Cote d'Ivoire, Djibouti, Ethiopia, India, Pakistan, South Sudan; country-specific ToCs and grant timelines."
        }
      ]
    },
    "completed_at": "2024-02-10T10:00:00.000Z"
  },
  "instruments": {
    "items": [
      {
        "id": "inst_1",
        "title": "Global Stakeholder KII Guide",
        "name": "Global Stakeholder KII Guide",
        "type": "kii",
        "method": "Semi-structured interview",
        "targetSample": "56 global KIIs",
        "sections": [
          {
            "id": "sec_1",
            "label": "Relevance & Coherence (EQ1, EQ3)",
            "eqId": "eq_1",
            "questions": [
              {
                "id": "q1",
                "text": "How relevant is Gavi 5.0/5.1's focus on zero-dose children to the countries you work with?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q2",
                "text": "How coherent is the ZD agenda with IA2030, WHO GPW13 and other partners' strategies?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_2",
            "label": "Operationalisation (EQ4)",
            "eqId": "eq_4",
            "questions": [
              {
                "id": "q3",
                "text": "What are the main drivers and barriers to countries using the new funding levers and IRMMA framework?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q4",
                "text": "How well are ZD working groups and Secretariat architecture supporting operationalisation?",
                "responseType": "text",
                "responseConfig": {},
                "required": false
              }
            ]
          }
        ],
        "questions": [
          {
            "id": "q1",
            "text": "Relevance of ZD focus",
            "responseType": "text"
          },
          {
            "id": "q2",
            "text": "Coherence with partners",
            "responseType": "text"
          },
          {
            "id": "q3",
            "text": "Drivers/barriers to lever use",
            "responseType": "text"
          },
          {
            "id": "q4",
            "text": "ZD working-group architecture",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_2",
        "title": "Country Stakeholder KII Guide",
        "name": "Country Stakeholder KII Guide",
        "type": "kii",
        "method": "Semi-structured interview",
        "targetSample": "70 country KIIs (8 countries)",
        "sections": [
          {
            "id": "sec_3",
            "label": "Funding levers & relevance (EQ2)",
            "eqId": "eq_2",
            "questions": [
              {
                "id": "q5",
                "text": "Which Gavi funding levers (HSS, EAF, ZIP, TCA) do you use, and how relevant are they to reaching ZD children here?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q6",
                "text": "Do you distinguish between HSS and EAF in planning and budgeting? Why or why not?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_4",
            "label": "Contribution of grants (EQ5, EQ6)",
            "eqId": "eq_5",
            "questions": [
              {
                "id": "q7",
                "text": "How have Gavi 4.0 grants contributed to identifying and reaching ZD and missed communities?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q8",
                "text": "What early changes, if any, have 5.0/5.1 grants brought to your ZD approach?",
                "responseType": "text",
                "responseConfig": {},
                "required": false
              }
            ]
          },
          {
            "id": "sec_5",
            "label": "Sustainability (EQ8)",
            "eqId": "eq_8",
            "questions": [
              {
                "id": "q9",
                "text": "What sustainability or transition plans exist for ZD activities after Gavi support?",
                "responseType": "text",
                "responseConfig": {},
                "required": false
              }
            ]
          }
        ],
        "questions": [
          {
            "id": "q5",
            "text": "Lever relevance",
            "responseType": "text"
          },
          {
            "id": "q6",
            "text": "HSS/EAF distinction",
            "responseType": "text"
          },
          {
            "id": "q7",
            "text": "4.0 grant contribution",
            "responseType": "text"
          },
          {
            "id": "q8",
            "text": "5.0/5.1 early changes",
            "responseType": "text"
          },
          {
            "id": "q9",
            "text": "Sustainability plans",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_3",
        "title": "Senior Country Manager (SCM) Online Survey",
        "name": "Senior Country Manager (SCM) Online Survey",
        "type": "survey",
        "method": "Online self-completion survey",
        "targetSample": "35 SCMs",
        "sections": [
          {
            "id": "sec_6",
            "label": "IRMMA alignment (EQ1)",
            "eqId": "eq_1",
            "questions": [
              {
                "id": "q10",
                "text": "How aligned is each IRMMA element (Identify, Reach, Monitor & Measure, Advocate) to your countries' needs?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q11",
                "text": "Overall, how well do the Gavi 5.0/5.1 funding levers support ZD targeting?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q12",
                "text": "What are the main barriers to operationalising the ZD agenda in your countries?",
                "responseType": "text",
                "responseConfig": {
                  "maxLength": 500
                },
                "required": false
              }
            ]
          }
        ],
        "questions": [
          {
            "id": "q10",
            "text": "IRMMA element alignment",
            "responseType": "likert"
          },
          {
            "id": "q11",
            "text": "Lever support for ZD",
            "responseType": "likert"
          },
          {
            "id": "q12",
            "text": "Barriers to operationalisation",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_4",
        "title": "Desk Review & Secondary Data Extraction Protocol",
        "name": "Desk Review & Secondary Data Extraction Protocol",
        "type": "document_review",
        "method": "Structured document review and indicator extraction",
        "targetSample": "118 documents + WUENIC/eJRF/MPM",
        "sections": [
          {
            "id": "sec_7",
            "label": "Grant & policy documents (EQ4, EQ5, EQ6)",
            "eqId": "eq_4",
            "questions": [
              {
                "id": "q13",
                "text": "Which IRMMA-associated strategies are present in the grant application?",
                "responseType": "select_multiple",
                "responseConfig": {
                  "options": [
                    "Identify",
                    "Reach",
                    "Monitor & Measure",
                    "Advocate"
                  ]
                },
                "required": true
              },
              {
                "id": "q14",
                "text": "FPP-to-IRC and IRC-to-disbursement duration (months)",
                "responseType": "numeric",
                "responseConfig": {
                  "min": 0,
                  "max": 60,
                  "unit": "months"
                },
                "required": false
              },
              {
                "id": "q15",
                "text": "Share of HSS/EAF budget to demand generation, supply chain and data systems (%)",
                "responseType": "numeric",
                "responseConfig": {
                  "min": 0,
                  "max": 100,
                  "unit": "%"
                },
                "required": false
              }
            ]
          }
        ],
        "questions": [
          {
            "id": "q13",
            "text": "IRMMA strategies present",
            "responseType": "select_multiple"
          },
          {
            "id": "q14",
            "text": "FPP/IRC durations",
            "responseType": "numeric"
          },
          {
            "id": "q15",
            "text": "Budget shares",
            "responseType": "numeric"
          }
        ]
      }
    ],
    "completed_at": "2024-03-10T10:00:00.000Z"
  },
  "analysis_plan": {
    "quantitative": [],
    "qualitative": [],
    "completed_at": "2024-03-10T10:00:00.000Z",
    "cards": [
      {
        "id": "af_1",
        "eqNumber": 1,
        "question": "How relevant is Gavi 5.0/5.1's focus on zero-dose children and missed communities to countries' needs?",
        "criterion": "relevance",
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and country immunisation priorities (case-study rating)",
            "code": "REL-1",
            "source": "KII + document review",
            "indType": "qualitative"
          },
          {
            "name": "Share of SCM survey respondents rating IRMMA elements as aligned to country needs",
            "code": "REL-2",
            "source": "SCM survey",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Country case studies (70 KIIs)",
          "FPP and grant application documents",
          "SCM online survey (n=35)"
        ],
        "method": "Framework analysis of relevance across case studies, triangulated with SCM survey descriptives",
        "steps": "1. Code KII transcripts against IRMMA relevance themes. 2. Rate relevance per country. 3. Cross-tabulate with SCM survey items. 4. Triangulate and assign strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "NVivo; Excel",
        "threats": "Perception bias in KIIs; uneven country coverage (Wave 2 and 'limited' countries).",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_2",
        "eqNumber": 2,
        "question": "How relevant are the Gavi funding levers to the needs of countries with regard to reaching zero-dose children and missed communities?",
        "criterion": "relevance",
        "indicators": [
          {
            "name": "Extent to which funding levers (HSS, EAF, ZIP, TCA, CCEOP) are directed to ZD-relevant investment areas",
            "code": "REL-3",
            "source": "FPP budgets + document review",
            "indType": "qualitative"
          },
          {
            "name": "Number of countries seeking EAF allocations",
            "code": "REL-4",
            "source": "Gavi Secretariat data",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "FPP documentation and budget sheets",
          "Global and country KIIs",
          "Gavi grant tracking data"
        ],
        "method": "Document analysis of FPP budgets and levers combined with KII thematic analysis",
        "steps": "1. Map lever allocations in FPP budgets. 2. Assess ZD-relevance of investment areas. 3. Thematically analyse KII views on lever fit and burden. 4. Triangulate.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Misallocated budget lines; HSS/EAF frequently merged, limiting attribution to specific levers.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_3",
        "eqNumber": 3,
        "question": "How coherent is Gavi's ZD agenda with the focus of other international and national actors?",
        "criterion": "coherence",
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and partner/national strategic frameworks",
            "code": "COH-1",
            "source": "Document review",
            "indType": "quantitative"
          },
          {
            "name": "Evidence of coordination mechanisms with active Gavi participation at country level",
            "code": "COH-2",
            "source": "KII + institutional review",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "Global strategy documents (IA2030, GPW13, SDG3 GAP)",
          "National immunisation strategies",
          "Global stakeholder KIIs (56)"
        ],
        "method": "Coherence mapping against global/national frameworks with document review and stakeholder KIIs",
        "steps": "1. Map ZD agenda against IA2030/GPW13/SDG3 GAP and national strategies. 2. Assess coordination mechanisms. 3. Triangulate with global KIIs.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Coherence in fragile/conflict settings hard to assess; partner-landscape complexity.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_4",
        "eqNumber": 4,
        "question": "To what extent have Gavi 5.0/5.1 funding levers, processes and guidance enabled countries to focus their support towards reaching zero-dose children and missed communities?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Change in prevalence of IRMMA-associated ZD strategies in grant applications (4.0 vs 5.0/5.1)",
            "code": "EFF-1",
            "source": "Grant application analysis",
            "indType": "quantitative"
          },
          {
            "name": "Average time from FPP start to IRC decision and to first disbursement (months)",
            "code": "EFF-2",
            "source": "Gavi process data",
            "indType": "quantitative"
          },
          {
            "name": "Share of HSS/EAF funds allocated to demand generation, supply chain and data systems",
            "code": "EFF-3",
            "source": "FPP budget analysis",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Grant applications (8 case studies)",
          "FPP/IRC process data",
          "MPM dashboard",
          "Country and global KIIs"
        ],
        "method": "Grant-application content analysis plus process-timing analysis of FPP-to-disbursement pathway",
        "steps": "1. Code applications for IRMMA strategies (4.0 vs 5.0/5.1). 2. Compute FPP-to-IRC and IRC-to-disbursement durations. 3. Analyse budget shares. 4. Triangulate with KIIs on drivers/barriers.",
        "analysisType": "quantitative",
        "software": "Excel; Stata",
        "threats": "Incomplete MPM data; country application cycles not aligned to strategy cycle confound timing.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_5",
        "eqNumber": 5,
        "question": "How have Gavi grants initiated under Gavi 4.0, with continued implementation in 5.0/5.1, contributed to delivery of the ZD agenda at country level?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Plausible contribution of Gavi 4.0 pro-equity grants to ZD outcomes (contribution rating)",
            "code": "EFF-4",
            "source": "Contribution analysis",
            "indType": "qualitative"
          },
          {
            "name": "Trend in number of zero-dose children in supported countries (2015-2022)",
            "code": "EFF-5",
            "source": "WUENIC / eJRF",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Gavi 4.0 grant documents and reports",
          "WUENIC/eJRF harmonised indicator database",
          "Country case-study KIIs"
        ],
        "method": "Contribution analysis of Gavi 4.0 pro-equity grants against IRMMA elements",
        "steps": "1. Reconstruct 4.0 grant contribution claims. 2. Assemble evidence per IRMMA element. 3. Test rival explanations. 4. Assign plausible-contribution rating and strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "NVivo; Excel",
        "threats": "Formal contribution analysis infeasible: pooled funds, recall gaps, single-datapoint indicators, activity- not outcome-level data.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_6",
        "eqNumber": 6,
        "question": "How have Gavi grants initiated in Gavi 5.0/5.1 contributed to delivery of the ZD agenda at country level?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Share of 5.0/5.1 grants disbursing and implementing ZD-targeted activities",
            "code": "EFF-6",
            "source": "Grant tracking + KII",
            "indType": "quantitative"
          },
          {
            "name": "Evidence of increased resource allocation to non-state actors (local CSOs) for demand generation",
            "code": "EFF-7",
            "source": "FPP budget analysis",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "5.0/5.1 grant applications and disbursement data",
          "MPM dashboard",
          "Country KIIs"
        ],
        "method": "Early-implementation review of 5.0/5.1 grants with secondary data on disbursement",
        "steps": "1. Track 5.0/5.1 grant approval and disbursement status. 2. Review implemented ZD activities. 3. Assess CSO/demand-generation allocations. 4. Note unintended consequences.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Few 5.0/5.1 grants disbursed at baseline; limited implementation evidence.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_7",
        "eqNumber": 7,
        "question": "To what extent are the theory of action and theory of change for the ZD agenda fit for purpose?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Proportion of ToC causal links with supporting evidence at baseline",
            "code": "EFF-8",
            "source": "Process tracing / ToC test",
            "indType": "quantitative"
          },
          {
            "name": "Number of ToC assumptions assessed as holding / not holding",
            "code": "EFF-9",
            "source": "Assumption testing",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Inception-phase ToC and assumptions register",
          "Case-study country ToCs",
          "Triangulated findings across EQs"
        ],
        "method": "Process tracing and assumption testing against the inception-phase theory of change",
        "steps": "1. Specify causal pathways and assumptions. 2. Gather evidence for each link. 3. Classify assumptions as holding/at-risk. 4. Document evidence gaps for Years 2-3.",
        "analysisType": "qualitative",
        "software": "NVivo",
        "threats": "Baseline evidence thin on causal links; longitudinal testing required.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_8",
        "eqNumber": 8,
        "question": "To what extent, and how, is sustainability addressed in Gavi's approach to reaching zero-dose children and missed communities?",
        "criterion": "sustainability",
        "indicators": [
          {
            "name": "Presence and quality of sustainability/transition plans in ZD grant documentation",
            "code": "SUS-1",
            "source": "Document review",
            "indType": "qualitative"
          },
          {
            "name": "Trend in government co-financing and integration of ZD functions into national systems",
            "code": "SUS-2",
            "source": "Financial + institutional review",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Grant and transition-plan documents",
          "National health financing data",
          "Country KIIs"
        ],
        "method": "Sustainability review of transition plans and co-financing trends",
        "steps": "1. Extract sustainability/transition content from grant documents. 2. Compile co-financing and integration indicators. 3. Triangulate with KIIs. 4. Rate strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Limited explicit sustainability planning; reliance on external technical assistance.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      }
    ],
    "rows": [
      {
        "id": "af_1",
        "eqNumber": 1,
        "question": "How relevant is Gavi 5.0/5.1's focus on zero-dose children and missed communities to countries' needs?",
        "criterion": "relevance",
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and country immunisation priorities (case-study rating)",
            "code": "REL-1",
            "source": "KII + document review",
            "indType": "qualitative"
          },
          {
            "name": "Share of SCM survey respondents rating IRMMA elements as aligned to country needs",
            "code": "REL-2",
            "source": "SCM survey",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Country case studies (70 KIIs)",
          "FPP and grant application documents",
          "SCM online survey (n=35)"
        ],
        "method": "Framework analysis of relevance across case studies, triangulated with SCM survey descriptives",
        "steps": "1. Code KII transcripts against IRMMA relevance themes. 2. Rate relevance per country. 3. Cross-tabulate with SCM survey items. 4. Triangulate and assign strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "NVivo; Excel",
        "threats": "Perception bias in KIIs; uneven country coverage (Wave 2 and 'limited' countries).",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_2",
        "eqNumber": 2,
        "question": "How relevant are the Gavi funding levers to the needs of countries with regard to reaching zero-dose children and missed communities?",
        "criterion": "relevance",
        "indicators": [
          {
            "name": "Extent to which funding levers (HSS, EAF, ZIP, TCA, CCEOP) are directed to ZD-relevant investment areas",
            "code": "REL-3",
            "source": "FPP budgets + document review",
            "indType": "qualitative"
          },
          {
            "name": "Number of countries seeking EAF allocations",
            "code": "REL-4",
            "source": "Gavi Secretariat data",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "FPP documentation and budget sheets",
          "Global and country KIIs",
          "Gavi grant tracking data"
        ],
        "method": "Document analysis of FPP budgets and levers combined with KII thematic analysis",
        "steps": "1. Map lever allocations in FPP budgets. 2. Assess ZD-relevance of investment areas. 3. Thematically analyse KII views on lever fit and burden. 4. Triangulate.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Misallocated budget lines; HSS/EAF frequently merged, limiting attribution to specific levers.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_3",
        "eqNumber": 3,
        "question": "How coherent is Gavi's ZD agenda with the focus of other international and national actors?",
        "criterion": "coherence",
        "indicators": [
          {
            "name": "Degree of alignment between the ZD agenda and partner/national strategic frameworks",
            "code": "COH-1",
            "source": "Document review",
            "indType": "quantitative"
          },
          {
            "name": "Evidence of coordination mechanisms with active Gavi participation at country level",
            "code": "COH-2",
            "source": "KII + institutional review",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "Global strategy documents (IA2030, GPW13, SDG3 GAP)",
          "National immunisation strategies",
          "Global stakeholder KIIs (56)"
        ],
        "method": "Coherence mapping against global/national frameworks with document review and stakeholder KIIs",
        "steps": "1. Map ZD agenda against IA2030/GPW13/SDG3 GAP and national strategies. 2. Assess coordination mechanisms. 3. Triangulate with global KIIs.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Coherence in fragile/conflict settings hard to assess; partner-landscape complexity.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_4",
        "eqNumber": 4,
        "question": "To what extent have Gavi 5.0/5.1 funding levers, processes and guidance enabled countries to focus their support towards reaching zero-dose children and missed communities?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Change in prevalence of IRMMA-associated ZD strategies in grant applications (4.0 vs 5.0/5.1)",
            "code": "EFF-1",
            "source": "Grant application analysis",
            "indType": "quantitative"
          },
          {
            "name": "Average time from FPP start to IRC decision and to first disbursement (months)",
            "code": "EFF-2",
            "source": "Gavi process data",
            "indType": "quantitative"
          },
          {
            "name": "Share of HSS/EAF funds allocated to demand generation, supply chain and data systems",
            "code": "EFF-3",
            "source": "FPP budget analysis",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Grant applications (8 case studies)",
          "FPP/IRC process data",
          "MPM dashboard",
          "Country and global KIIs"
        ],
        "method": "Grant-application content analysis plus process-timing analysis of FPP-to-disbursement pathway",
        "steps": "1. Code applications for IRMMA strategies (4.0 vs 5.0/5.1). 2. Compute FPP-to-IRC and IRC-to-disbursement durations. 3. Analyse budget shares. 4. Triangulate with KIIs on drivers/barriers.",
        "analysisType": "quantitative",
        "software": "Excel; Stata",
        "threats": "Incomplete MPM data; country application cycles not aligned to strategy cycle confound timing.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_5",
        "eqNumber": 5,
        "question": "How have Gavi grants initiated under Gavi 4.0, with continued implementation in 5.0/5.1, contributed to delivery of the ZD agenda at country level?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Plausible contribution of Gavi 4.0 pro-equity grants to ZD outcomes (contribution rating)",
            "code": "EFF-4",
            "source": "Contribution analysis",
            "indType": "qualitative"
          },
          {
            "name": "Trend in number of zero-dose children in supported countries (2015-2022)",
            "code": "EFF-5",
            "source": "WUENIC / eJRF",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Gavi 4.0 grant documents and reports",
          "WUENIC/eJRF harmonised indicator database",
          "Country case-study KIIs"
        ],
        "method": "Contribution analysis of Gavi 4.0 pro-equity grants against IRMMA elements",
        "steps": "1. Reconstruct 4.0 grant contribution claims. 2. Assemble evidence per IRMMA element. 3. Test rival explanations. 4. Assign plausible-contribution rating and strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "NVivo; Excel",
        "threats": "Formal contribution analysis infeasible: pooled funds, recall gaps, single-datapoint indicators, activity- not outcome-level data.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_6",
        "eqNumber": 6,
        "question": "How have Gavi grants initiated in Gavi 5.0/5.1 contributed to delivery of the ZD agenda at country level?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Share of 5.0/5.1 grants disbursing and implementing ZD-targeted activities",
            "code": "EFF-6",
            "source": "Grant tracking + KII",
            "indType": "quantitative"
          },
          {
            "name": "Evidence of increased resource allocation to non-state actors (local CSOs) for demand generation",
            "code": "EFF-7",
            "source": "FPP budget analysis",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "5.0/5.1 grant applications and disbursement data",
          "MPM dashboard",
          "Country KIIs"
        ],
        "method": "Early-implementation review of 5.0/5.1 grants with secondary data on disbursement",
        "steps": "1. Track 5.0/5.1 grant approval and disbursement status. 2. Review implemented ZD activities. 3. Assess CSO/demand-generation allocations. 4. Note unintended consequences.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Few 5.0/5.1 grants disbursed at baseline; limited implementation evidence.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_7",
        "eqNumber": 7,
        "question": "To what extent are the theory of action and theory of change for the ZD agenda fit for purpose?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Proportion of ToC causal links with supporting evidence at baseline",
            "code": "EFF-8",
            "source": "Process tracing / ToC test",
            "indType": "quantitative"
          },
          {
            "name": "Number of ToC assumptions assessed as holding / not holding",
            "code": "EFF-9",
            "source": "Assumption testing",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Inception-phase ToC and assumptions register",
          "Case-study country ToCs",
          "Triangulated findings across EQs"
        ],
        "method": "Process tracing and assumption testing against the inception-phase theory of change",
        "steps": "1. Specify causal pathways and assumptions. 2. Gather evidence for each link. 3. Classify assumptions as holding/at-risk. 4. Document evidence gaps for Years 2-3.",
        "analysisType": "qualitative",
        "software": "NVivo",
        "threats": "Baseline evidence thin on causal links; longitudinal testing required.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_8",
        "eqNumber": 8,
        "question": "To what extent, and how, is sustainability addressed in Gavi's approach to reaching zero-dose children and missed communities?",
        "criterion": "sustainability",
        "indicators": [
          {
            "name": "Presence and quality of sustainability/transition plans in ZD grant documentation",
            "code": "SUS-1",
            "source": "Document review",
            "indType": "qualitative"
          },
          {
            "name": "Trend in government co-financing and integration of ZD functions into national systems",
            "code": "SUS-2",
            "source": "Financial + institutional review",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Grant and transition-plan documents",
          "National health financing data",
          "Country KIIs"
        ],
        "method": "Sustainability review of transition plans and co-financing trends",
        "steps": "1. Extract sustainability/transition content from grant documents. 2. Compile co-financing and integration indicators. 3. Triangulate with KIIs. 4. Rate strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Limited explicit sustainability planning; reliance on external technical assistance.",
        "disaggregations": [
          "gender",
          "age",
          "geography"
        ],
        "notes": ""
      }
    ]
  },
  "report_structure": {
    "sections": [
      {
        "id": "sec_executive_summary",
        "sectionType": "executive_summary",
        "type": "standard",
        "title": "Executive summary",
        "autoContent": [
          "Purpose: inform the Gavi Board, Secretariat and Alliance partners on Gavi's contribution to immunising children in the poorest and most marginalised communities.",
          "Year 1 (Phase 1) establishes an in-depth baseline in eight case-study countries against which Phases 2-3 will track change.",
          "Structured around findings for Objectives 1-3; Objective 3 (Gavi 4.0 contribution) presented first."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_background_and_context",
        "sectionType": "introduction",
        "type": "standard",
        "title": "Background and context",
        "autoContent": [
          "Since 2000 Gavi has helped vaccinate over a billion children and averted 17M+ deaths; in 2022 ~10M zero-dose children remained in Gavi countries.",
          "Gavi 5.0 (2019) and 5.1 (2022) made reaching ZD children and missed communities an explicit strategic focus.",
          "New levers and frameworks: IRMMA, Full Portfolio Planning (FPP), Equity Accelerator Fund (EAF), Zero-Dose Immunization Programme (ZIP)."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_methodology,_scope_and_t",
        "sectionType": "methodology",
        "type": "standard",
        "title": "Methodology, scope and timeline",
        "autoContent": [
          "Theory-based, mixed-methods, utilisation-focused evaluation across three phases (Sept 2022 - Oct 2025).",
          "Methods: desk review (118 documents), secondary data analysis (WUENIC/eJRF, MPM dashboard), 56 global + 70 country KIIs, SCM survey (n=35), 8 country case studies.",
          "Frameworks: process tracing, contribution analysis, triangulation; strength-of-evidence rated per evaluation question.",
          "Case-study countries: Afghanistan, Cambodia, Cote d'Ivoire, Djibouti, Ethiopia, India, Pakistan, South Sudan."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_-_objective_3:_",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Objective 3: Contribution of Gavi 4.0 pro-equity grants",
        "autoContent": [
          "Evidence suggests a partial contribution of Gavi 4.0 funds to ZD outcomes; global ZD numbers fell 23% (2015-2019), most where Gavi support was greatest.",
          "4.0 grants contributed more to IRMMA Identify and Reach than to Monitor, Measure or Advocate.",
          "Formal contribution analysis was infeasible due to pooled funds, recall gaps and activity-level data."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_-_objective_1:_",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Objective 1: Relevance and coherence of the ZD agenda",
        "autoContent": [
          "The ZD agenda is relevant to all case studies for increasing immunisation equity, though not every 4.0-to-5.0/5.1 shift resonates everywhere.",
          "Countries are hampered by inadequate data systems and poor population data for identifying ZD communities.",
          "The agenda is coherent with IA2030/GPW13/SDG3 GAP and national strategies, but lacks nuance on resource-allocation trade-offs in constrained settings."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_-_objective_2:_",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Objective 2: Operationalisation of the ZD agenda",
        "autoContent": [
          "New levers and guidance have placed ZD at the centre of grant proposals, but operationalisation is slow and not yet changing implementation at country level.",
          "FPP-to-approval averaged ~15 months and ~8 months to disbursement across the eight countries.",
          "HSS and EAF are frequently merged into a single immunisation budget; the lever architecture is seen as complex and burdensome."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_insights_and_implication",
        "sectionType": "conclusions",
        "type": "standard",
        "title": "Insights and implications",
        "autoContent": [
          "Gavi and Alliance partners make a significant contribution to vaccination outcomes, including reaching ZD children, especially in low-income/fragile settings.",
          "5.0/5.1 grants and processes are relevant, coherent and flexible, but funding-lever complexity and weak oversight hinder transformational change.",
          "IRMMA and CSO inputs are improving community engagement and demand generation; gender-barrier interventions lag."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_recommendations",
        "sectionType": "recommendations",
        "type": "standard",
        "title": "Recommendations",
        "autoContent": [
          "Strategic (Gavi 6.0): simplify funding levers/guidance; work through broader HSS/PHC/UHC processes; clarify non-traditional-partner roles; develop a nuanced resource-allocation framework.",
          "Operational: intensify focus on disbursement and grant absorption; reinstate the Joint Appraisal process; invest in internal data systems; clarify expectations for non-state partners.",
          "Evaluation (Year 2): adjust deliverables to data availability; enhance utilisation focus with topic 'deep dives'; build Secretariat/country ownership of the evaluation."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_annexes",
        "sectionType": "standard",
        "type": "standard",
        "title": "Annexes",
        "autoContent": [
          "Annex 1: Bibliography (118 documents). Annex 2: Evaluation framework and assumptions register.",
          "Annex 3: Country case-study summaries. Annex 4: Strength-of-evidence framework.",
          "Annex 5: Grant status by country (FPP/EAF/HSS/CCEOP/TCA)."
        ],
        "draftContent": ""
      }
    ],
    "completed_at": "2024-03-10T10:00:00.000Z"
  },
  "presentation": {
    "slides": [
      {
        "title": "Title Slide",
        "included": true,
        "talkingPoints": "Evaluation of Gavi's contribution to reaching zero-dose and missed communities - Year 1 Annual Report (baseline). Commissioned by Gavi; conducted by Ipsos, March 2024.",
        "order": 0
      },
      {
        "title": "Programme Overview",
        "included": true,
        "talkingPoints": "Gavi 5.0/5.1 Zero-Dose Agenda: reach children who have never received any vaccination and missed communities across three priority groups (remote/rural/nomadic; marginalised urban; fragile/conflict-affected). New levers: IRMMA, FPP, EAF, ZIP.",
        "order": 1
      },
      {
        "title": "Evaluation Purpose & Scope",
        "included": true,
        "talkingPoints": "Inform Board, Secretariat and Alliance partners; enable programmatic improvement under 5.0/5.1 and shape Gavi 6.0. Four objectives (relevance/coherence, operationalisation, contribution, lessons learnt); 8 evaluation questions; Year 1 focus on EQ1-6.",
        "order": 2
      },
      {
        "title": "Theory of Change Summary",
        "included": true,
        "talkingPoints": "Funding levers + IRMMA strategies -> ZD communities identified and reached, supply chain strengthened, demand generated -> improved coverage and equity -> reduced zero-dose children (Gavi mission: -25% by 2025). Assumptions tested longitudinally over three phases.",
        "order": 3
      },
      {
        "title": "Evaluation Questions",
        "included": true,
        "talkingPoints": "8 EQs across relevance (EQ1-2), coherence (EQ3), effectiveness/operationalisation and contribution (EQ4-6), ToC fitness (EQ7) and sustainability (EQ8). Strength of evidence rated per question.",
        "order": 4
      },
      {
        "title": "Methodology",
        "included": true,
        "talkingPoints": "Theory-based, mixed-methods, utilisation-focused. Desk review (118 docs), secondary data (WUENIC/eJRF, MPM), 56 global + 70 country KIIs, SCM survey (n=35), 8 country case studies. Frameworks: process tracing, contribution analysis, triangulation.",
        "order": 5
      },
      {
        "title": "Sampling Strategy",
        "included": true,
        "talkingPoints": "Purposive: 8 case-study countries across High-Impact (Ethiopia, India, Pakistan), Core (Cambodia, Cote d'Ivoire, Djibouti) and Fragile/Conflict (Afghanistan, South Sudan). 126 KIIs total; SCM survey n=35. Afghanistan and South Sudan 'limited' for access/ethical reasons.",
        "order": 6
      },
      {
        "title": "Data Collection",
        "included": true,
        "talkingPoints": "Global and country KIIs (recorded with informed consent; informant lists confidential), online SCM survey, desk review, and secondary indicator database assembly. Fieldwork delayed; four countries in 'Wave 2' from late August 2023.",
        "order": 7
      },
      {
        "title": "Analysis Approach",
        "included": true,
        "talkingPoints": "Per-EQ analysis with agreed judgement criteria and strength-of-evidence rating (4-point scale). Contribution analysis of Gavi 4.0 grants (scaled back due to data limits); process tracing of ToC assumptions; triangulation across sources.",
        "order": 8
      },
      {
        "title": "Evaluability Assessment",
        "included": true,
        "talkingPoints": "Baseline evaluability: strongest evidence for Objective 1; limited for Objectives 2-3. Key constraints: weak/patchy internal and country data systems, poor population data, recall gaps, and pooled-fund complexity limiting attribution.",
        "order": 9
      }
    ],
    "completed_at": "2024-03-10T10:00:00.000Z"
  },
  "planning": {
    "contract": {
      "reference": "GAVI-EVAL-ZD-2022",
      "commissioner": "Gavi, the Vaccine Alliance (Evaluation Advisory Committee)",
      "evaluator": "Independent evaluation consortium",
      "currency": "USD",
      "start_date": "2022-09-01",
      "end_date": "2026-10-31",
      "total_budget": 646218
    },
    "budget_lines": [
      {
        "id": "bl_1",
        "category": "Personnel",
        "role": "Team Leader",
        "description": "",
        "unit": "days",
        "quantity": 120,
        "rate": 800,
        "amount": 96000
      },
      {
        "id": "bl_2",
        "category": "Personnel",
        "role": "Senior Evaluators (three)",
        "description": "",
        "unit": "days",
        "quantity": 300,
        "rate": 600,
        "amount": 180000
      },
      {
        "id": "bl_3",
        "category": "Personnel",
        "role": "QA and peer reviewer",
        "description": "",
        "unit": "days",
        "quantity": 20,
        "rate": 800,
        "amount": 16000
      },
      {
        "id": "bl_4",
        "category": "Personnel",
        "role": "Research analysts (two)",
        "description": "",
        "unit": "days",
        "quantity": 180,
        "rate": 300,
        "amount": 54000
      },
      {
        "id": "bl_5",
        "category": "Data collection",
        "role": "Country case-study fieldwork",
        "description": "",
        "unit": "countries",
        "quantity": 8,
        "rate": 8000,
        "amount": 64000
      },
      {
        "id": "bl_6",
        "category": "Data collection",
        "role": "Transcription",
        "description": "",
        "unit": "interviews",
        "quantity": 126,
        "rate": 40,
        "amount": 5040
      },
      {
        "id": "bl_7",
        "category": "Data collection",
        "role": "Translation",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 10000,
        "amount": 10000
      },
      {
        "id": "bl_8",
        "category": "Data collection",
        "role": "SCM survey platform",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 4000,
        "amount": 4000
      },
      {
        "id": "bl_9",
        "category": "Travel and DSA",
        "role": "International airfare",
        "description": "",
        "unit": "trips",
        "quantity": 12,
        "rate": 2000,
        "amount": 24000
      },
      {
        "id": "bl_10",
        "category": "Travel and DSA",
        "role": "In-country transport",
        "description": "",
        "unit": "trips",
        "quantity": 8,
        "rate": 2500,
        "amount": 20000
      },
      {
        "id": "bl_11",
        "category": "Travel and DSA",
        "role": "DSA and per diem",
        "description": "",
        "unit": "nights",
        "quantity": 200,
        "rate": 190,
        "amount": 38000
      },
      {
        "id": "bl_12",
        "category": "Dissemination",
        "role": "Annual learning and validation workshops",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 20000,
        "amount": 20000
      },
      {
        "id": "bl_13",
        "category": "Dissemination",
        "role": "Editing, design and briefs",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 12000,
        "amount": 12000
      },
      {
        "id": "bl_14",
        "category": "Management and overhead",
        "role": "Management fee (12% of direct cost)",
        "description": "",
        "unit": "",
        "quantity": null,
        "rate": null,
        "amount": 65165
      },
      {
        "id": "bl_15",
        "category": "Contingency",
        "role": "Contingency (7% of direct cost)",
        "description": "",
        "unit": "",
        "quantity": null,
        "rate": null,
        "amount": 38013
      }
    ],
    "deliverables": [
      {
        "id": "del_1",
        "code": "D1",
        "title": "Inception Report",
        "description": "Evaluation framework, theory of change, methodology and country-study protocols across three phases.",
        "due_date": "2022-11-30",
        "station_ids": [
          0,
          1,
          2,
          3,
          4
        ],
        "payment_percent": 15,
        "status": "accepted",
        "submitted_at": "2022-11-25T10:00:00.000Z",
        "accepted_at": "2022-12-05T10:00:00.000Z",
        "notes": "",
        "rating": {
          "scores": {
            "purpose_scope": 4,
            "design": 4,
            "matrix": 4,
            "methods_plan": 4,
            "stakeholder": 3,
            "workplan": 3,
            "ethics": 4,
            "gesi": 4
          },
          "comment": "Detailed assumptions register and country-specific theories of change. Strong basis for the longitudinal design.",
          "rated_at": "2024-04-10T10:00:00.000Z"
        },
        "type": "Design gate",
        "reviewers": "EAC",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_2",
        "code": "D2",
        "title": "Data Collection Tools",
        "description": "Global and country KII guides, SCM online survey and desk-review protocol.",
        "due_date": "2022-12-15",
        "station_ids": [
          5
        ],
        "payment_percent": 0,
        "status": "accepted",
        "submitted_at": "2022-12-10T10:00:00.000Z",
        "accepted_at": "2022-12-18T10:00:00.000Z",
        "notes": "",
        "rating": {
          "scores": {
            "coverage": 4,
            "validity": 4,
            "clarity": 3,
            "scales": 3,
            "translation": 4,
            "ethics": 4,
            "piloting": 3,
            "usability": 3
          },
          "comment": "Guides map cleanly to the evaluation questions and translation into local languages is handled. Add explicit assent procedures for community respondents and pilot the SCM online survey.",
          "rated_at": "2022-12-18T10:00:00.000Z",
          "rated_by": "Central Evaluation Team"
        },
        "type": "Milestone",
        "reviewers": "Central Evaluation Team",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_3",
        "code": "D3",
        "title": "Year 1 Annual Report (baseline)",
        "description": "Baseline findings across the eight case-study countries against the theory of change.",
        "due_date": "2024-03-31",
        "station_ids": [
          6,
          7,
          8
        ],
        "payment_percent": 25,
        "status": "accepted",
        "submitted_at": "2024-03-28T10:00:00.000Z",
        "accepted_at": "2024-04-08T10:00:00.000Z",
        "notes": "",
        "rating": {
          "scores": {
            "purpose": 4,
            "methodology": 3,
            "evidence": 3,
            "findings": 3,
            "conclusions": 3,
            "recommendations": 3,
            "communication": 4,
            "principles": 4
          },
          "comment": "Clear baseline and utilisation focus. Note the data-availability constraints for Objectives 2 and 3 in Year 2.",
          "rated_at": "2024-04-10T10:00:00.000Z"
        },
        "type": "Draft",
        "reviewers": "EAC",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_4",
        "code": "D4",
        "title": "Year 2 Annual Report",
        "description": "Mid-line tracking of change against the baseline and assumptions.",
        "due_date": "2024-10-31",
        "station_ids": [
          7
        ],
        "payment_percent": 25,
        "status": "accepted",
        "submitted_at": "2024-10-29T10:00:00.000Z",
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Draft",
        "reviewers": "EAC",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_5",
        "code": "D5",
        "title": "Year 3 Final Report",
        "description": "Summative final report with conclusions and recommendations for Gavi 6.0.",
        "due_date": "2026-06-15",
        "station_ids": [
          7
        ],
        "payment_percent": 30,
        "status": "in_progress",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Final report",
        "reviewers": "EAC, Secretariat",
        "reviewer_email": "r.alemu@example.org",
        "alert": {
          "lead_days": 14,
          "emails": [
            "r.alemu@example.org"
          ]
        }
      },
      {
        "id": "del_6",
        "code": "D6",
        "title": "Learning Products and Deck",
        "description": "Summative slide deck, evaluation brief and learning products.",
        "due_date": "2026-09-30",
        "station_ids": [
          8
        ],
        "payment_percent": 5,
        "status": "not_started",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Governance",
        "reviewers": "Central Evaluation Team",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      }
    ],
    "invoices": [
      {
        "id": "inv_1",
        "number": "INV-2022-001",
        "deliverable_id": "del_1",
        "amount": 96933,
        "currency": "USD",
        "issued_date": "2022-12-06",
        "status": "paid",
        "paid_date": "2022-12-20"
      },
      {
        "id": "inv_2",
        "number": "INV-2024-001",
        "deliverable_id": "del_3",
        "amount": 161554,
        "currency": "USD",
        "issued_date": "2024-04-09",
        "status": "approved",
        "paid_date": null
      },
      {
        "id": "inv_3",
        "number": "INV-2024-002",
        "deliverable_id": "del_4",
        "amount": 161554,
        "currency": "USD",
        "issued_date": "2024-11-01",
        "status": "submitted",
        "paid_date": null
      }
    ],
    "completed_at": "2024-04-10T10:00:00.000Z"
  },
  "commissioner": {
    "governance": {
      "funder_profile": "gavi",
      "oversight_body": "Evaluation Advisory Committee (EAC)",
      "evaluation_manager": "Central Evaluation Team (Head of Evaluation)",
      "decision_clock": "Gavi 6.0 design and 5.0/5.1 course-correction",
      "decision_window_opens": "2025-06-01",
      "decision_window_closes": "2025-12-10",
      "lifecycle_stage": "track",
      "purpose": "A real-time evaluation of Gavi's zero-dose agenda (IRMMA framework) to test relevance, coherence and early contribution, and to feed course-correction while the strategy is still being delivered.",
      "primary_use": "Course-correct Gavi 5.0/5.1 delivery and shape the Gavi 6.0 design so the Alliance reaches and sustains zero-dose and under-immunised children."
    },
    "users": [
      {
        "id": "usr_board",
        "name": "Gavi Board",
        "role": "Strategic governance",
        "tier": "primary",
        "intended_use": "Decide Gavi 6.0 strategic direction and hold the Secretariat to account for the zero-dose agenda.",
        "decision_window": "Gavi 6.0 design decisions",
        "window_opens": "2025-06-02",
        "window_closes": "2025-12-10",
        "status": "in_post",
        "successor": "",
        "influence": "high",
        "interest": "medium",
        "eq_refs": [
          "eq_1",
          "eq_5",
          "eq_8"
        ]
      },
      {
        "id": "usr_prog",
        "name": "Secretariat Programme Team",
        "role": "Programme delivery",
        "tier": "primary",
        "intended_use": "Course-correct country support and grant operationalisation for zero-dose during 5.0/5.1.",
        "decision_window": "Ongoing 5.0/5.1 delivery",
        "window_opens": "2023-01-09",
        "window_closes": "2026-12-31",
        "status": "left",
        "successor": "Deputy Director, Country Programmes (incoming)",
        "influence": "high",
        "interest": "high",
        "eq_refs": [
          "eq_4",
          "eq_5",
          "eq_7"
        ]
      },
      {
        "id": "usr_strat",
        "name": "Secretariat Strategy Team",
        "role": "Strategy and monitoring",
        "tier": "primary",
        "intended_use": "Embed zero-dose indicators and a value-for-money lens into the Gavi 6.0 monitoring framework.",
        "decision_window": "Gavi 6.0 measurement design",
        "window_opens": "2025-01-15",
        "window_closes": "2025-10-31",
        "status": "in_post",
        "successor": "",
        "influence": "high",
        "interest": "high",
        "eq_refs": [
          "eq_3",
          "eq_6",
          "eq_8"
        ]
      },
      {
        "id": "usr_country",
        "name": "National immunisation programmes",
        "role": "Implementers",
        "tier": "secondary",
        "intended_use": "Operationalise grants and prioritise zero-dose communities in national plans.",
        "decision_window": "Country grant cycles",
        "window_opens": "2024-01-08",
        "window_closes": "2026-12-31",
        "status": "in_post",
        "successor": "",
        "influence": "medium",
        "interest": "high",
        "eq_refs": [
          "eq_2",
          "eq_4",
          "eq_7"
        ]
      },
      {
        "id": "usr_partners",
        "name": "Alliance partners (WHO, UNICEF)",
        "role": "Technical and delivery partners",
        "tier": "secondary",
        "intended_use": "Align technical support and equity programming with the zero-dose agenda.",
        "decision_window": "Partner planning",
        "window_opens": "2024-06-03",
        "window_closes": "2026-06-30",
        "status": "in_post",
        "successor": "",
        "influence": "medium",
        "interest": "medium",
        "eq_refs": [
          "eq_2",
          "eq_3"
        ]
      },
      {
        "id": "usr_eac",
        "name": "Evaluation Advisory Committee (EAC)",
        "role": "Independent oversight",
        "tier": "secondary",
        "intended_use": "Assure evaluation quality and the strength of evidence behind conclusions.",
        "decision_window": "EAC review points",
        "window_opens": "2023-03-01",
        "window_closes": "2026-09-30",
        "status": "in_post",
        "successor": "",
        "influence": "high",
        "interest": "high",
        "eq_refs": [
          "eq_5",
          "eq_6"
        ]
      }
    ],
    "gate": {
      "decision": "conditions",
      "decided_by": "Central Evaluation Team and EAC",
      "decided_at": "2023-02-20T10:00:00.000Z",
      "eq_snapshot": [
        {
          "eq_id": "eq_1",
          "number": 1,
          "question": "How relevant is Gavi 5.0/5.1's focus on zero-dose children and missed communities to countries' needs?"
        },
        {
          "eq_id": "eq_2",
          "number": 2,
          "question": "How relevant are the Gavi funding levers to the needs of countries with regard to reaching zero-dose children and missed communities?"
        },
        {
          "eq_id": "eq_3",
          "number": 3,
          "question": "How coherent is Gavi's ZD agenda with the focus of other international and national actors?"
        },
        {
          "eq_id": "eq_4",
          "number": 4,
          "question": "To what extent have Gavi 5.0/5.1 funding levers, processes and guidance enabled countries to focus their support towards reaching zero-dose children and missed communities?"
        },
        {
          "eq_id": "eq_5",
          "number": 5,
          "question": "How have Gavi grants initiated under Gavi 4.0, with continued implementation in 5.0/5.1, contributed to delivery of the ZD agenda at country level?"
        },
        {
          "eq_id": "eq_6",
          "number": 6,
          "question": "What impact have Gavi grants initiated in Gavi 5.0/5.1 had on delivery of the ZD agenda at country level, established through formal contribution analysis?"
        },
        {
          "eq_id": "eq_7",
          "number": 7,
          "question": "To what extent are the theory of action and theory of change for the ZD agenda fit for purpose?"
        },
        {
          "eq_id": "eq_8",
          "number": 8,
          "question": "To what extent, and how, is sustainability addressed in Gavi's approach to reaching zero-dose children and missed communities?"
        }
      ],
      "snapped_at": "2023-02-20T10:00:00.000Z",
      "note": "Inception framework, ToC assumptions and an evaluability assessment per question reviewed with the Central Evaluation Team, the expert steering committee and the EAC. Approved to proceed, subject to the conditions below.",
      "conditions": [
        {
          "id": "cond_zd_1",
          "text": "Confirm grant-implementation data are adequate for the O3 plausible-contribution analysis before fieldwork. (Data limitations later made formal contribution analysis unfeasible.)",
          "resolved": false
        },
        {
          "id": "cond_zd_2",
          "text": "Strengthen the gender dimension of the equity analysis; the EAC noted equity focuses mainly on socio-economic factors.",
          "resolved": true
        }
      ],
      "independence": {
        "attested": true,
        "statement": "The Evaluation Advisory Committee confirms the evaluation was conducted independently of Gavi Secretariat management, and that the independent evaluator (Ipsos) and EAC members declared no conflicts of interest bearing on the zero-dose investments assessed.",
        "conflicts": [
          "One EAC member holds an advisory role with a core Alliance partner and recused from conclusions concerning that partner's contribution."
        ],
        "attested_by": "EAC Chair",
        "attested_at": "2023-03-10"
      },
      "ethics": {
        "status": "cleared",
        "body": "Ipsos independent research ethics review",
        "note": "Informed consent and confidential informant lists applied, with data protection under GDPR and safeguarding measures ensuring zero-dose children as a vulnerable group are represented only through adult key informants and secondary coverage data, never interviewed directly.",
        "cleared_at": "2023-03-10"
      }
    },
    "appraisal": {
      "profile": "gavi",
      "evidence": [
        {
          "eq_id": "eq_1",
          "rating": 4,
          "justification": "Answerable from the eight country case studies and the SCM survey; a direct method with clear relevance criteria."
        },
        {
          "eq_id": "eq_2",
          "rating": 3,
          "justification": "Answerable via case studies and document review; the HSS and EAF lever definitions need tightening so respondents apply them consistently."
        },
        {
          "eq_id": "eq_3",
          "rating": 4,
          "justification": "Answerable from a document review against IA2030, GPW13 and national strategies; sources are available and criteria clear."
        },
        {
          "eq_id": "eq_4",
          "rating": 3,
          "justification": "Answerable through case studies and interviews; operationalisation coverage is uneven across countries, so the country sample and interview coverage must be confirmed at inception."
        },
        {
          "eq_id": "eq_5",
          "rating": 2,
          "justification": "Contribution analysis is the proposed method, but it depends on grant-implementation data whose availability is uncertain; secure the source or specify a fallback design before fieldwork."
        },
        {
          "eq_id": "eq_6",
          "rating": 2,
          "justification": "Attribution is confounded by pooled Alliance funding; the design needs an explicit approach to isolate the Gavi contribution before this can be answered."
        },
        {
          "eq_id": "eq_7",
          "rating": 3,
          "justification": "Answerable via a theory-based assessment; interim evidence is limited at Year 2, so the judgement criteria for an early-stage assessment must be set."
        },
        {
          "eq_id": "eq_8",
          "rating": 3,
          "justification": "Answerable through document review and interviews; sustainability is prioritised in later phases, so the inception design should define which early indicators are in scope."
        }
      ]
    },
    "report_review": {
      "accepted": true,
      "accepted_by": "Evaluation Advisory Committee (EAC)",
      "accepted_at": "2026-06-24",
      "evidence": [
        {
          "eq_id": "eq_1",
          "strength": 3,
          "note": "IRMMA relevance triangulated across the eight case studies and the SCM survey."
        },
        {
          "eq_id": "eq_2",
          "strength": 3,
          "note": "Lever relevance evidenced; countries confuse HSS/EAF in places."
        },
        {
          "eq_id": "eq_3",
          "strength": 3,
          "note": "Coherence with IA2030, GPW13 and national strategies documented."
        },
        {
          "eq_id": "eq_4",
          "strength": 2,
          "note": "Operationalisation evidence partial and uneven across countries."
        },
        {
          "eq_id": "eq_5",
          "strength": 1,
          "note": "Contribution unproven. Formal contribution analysis was abandoned: grant-implementation data absent."
        },
        {
          "eq_id": "eq_6",
          "strength": 1,
          "note": "Plausible contribution not established; pooled Alliance funding masks attribution."
        },
        {
          "eq_id": "eq_7",
          "strength": 2,
          "note": "ToC/ToA fitness assessed from Year 2; interim evidence limited."
        },
        {
          "eq_id": "eq_8",
          "strength": 2,
          "note": "Sustainability prioritised in later phases; evidence thin so far."
        }
      ]
    },
    "management_response": [
      {
        "id": "rec_zd_1",
        "code": "I1",
        "recommendation": "Improve the granularity of grant financial and implementation data so contribution can be assessed.",
        "disposition": "agree",
        "owner": "Programme Team",
        "secondary_owner": "national immunisation programmes",
        "due_date": "2024-12-31",
        "status": "in_progress",
        "actions": "Cross-Secretariat data and analytics initiative scoped.",
        "evidence_note": "",
        "next_review": "2026-06-20",
        "implementation_status": "in_progress",
        "progress": 45,
        "review_interval_months": 3,
        "review_history": [
          {
            "id": "rev_mr8wd245lxt3tbi366s",
            "review_date": "2026-03-20",
            "status": "in_progress",
            "note": "Cross-Secretariat data and analytics initiative moved from scoping to build, but grant financial-data granularity remains below the level needed for contribution assessment.",
            "evidence_label": "Data initiative status update (Q1 2026)",
            "evidence_url": ""
          }
        ],
        "owner_email": "r.alemu@example.org"
      },
      {
        "id": "rec_zd_2",
        "code": "I2",
        "recommendation": "Strengthen Alliance support to countries for prioritising immunisation programming.",
        "disposition": "agree",
        "owner": "Programme Team",
        "secondary_owner": "national immunisation programmes",
        "due_date": "2024-09-30",
        "status": "overdue",
        "actions": "",
        "evidence_note": "",
        "next_review": "2026-06-05",
        "implementation_status": "blocked",
        "progress": 25,
        "review_interval_months": 3,
        "review_history": [
          {
            "id": "rev_mr8wd245e26mlu3vnk7",
            "review_date": "2026-03-05",
            "status": "blocked",
            "note": "Country-prioritisation support stalled amid competing Secretariat priorities and partner-coordination gaps; no substantive progress since the previous checkpoint.",
            "evidence_label": "Management response tracker (Q1 2026)",
            "evidence_url": ""
          }
        ],
        "owner_email": "t.bello@example.org"
      },
      {
        "id": "rec_zd_3",
        "code": "I3",
        "recommendation": "Reinforce communication so in-country stakeholders understand the zero-dose agenda.",
        "disposition": "agree",
        "owner": "Strategy Team",
        "secondary_owner": "national immunisation programmes",
        "due_date": "2025-03-31",
        "status": "planned",
        "actions": "",
        "evidence_note": "",
        "next_review": null,
        "implementation_status": "implemented",
        "progress": 100,
        "review_interval_months": 6,
        "review_history": [
          {
            "id": "rev_mr8wd245s3yh1u329pm",
            "review_date": "2026-01-31",
            "status": "in_progress",
            "note": "Zero-dose communications products drafted and country roll-out begun; assessed as on track to complete, and since verified as implemented.",
            "evidence_label": "Comms roll-out plan (Q4 2025)",
            "evidence_url": ""
          }
        ],
        "owner_email": "l.moreau@example.org"
      },
      {
        "id": "rec_zd_4",
        "code": "I4",
        "recommendation": "Adopt a value-for-money framework to guide difficult resource-allocation choices.",
        "disposition": "partial",
        "owner": "Strategy Team",
        "secondary_owner": "",
        "due_date": "2025-03-31",
        "status": "planned",
        "actions": "Equitable programming is by nature expensive; a pure VfM lens risks de-prioritising the hardest-to-reach. Equity remains the organising principle of Gavi 5.0.",
        "evidence_note": "",
        "next_review": null,
        "implementation_status": "superseded",
        "progress": 30,
        "review_interval_months": 12,
        "review_history": [
          {
            "id": "rev_mr8wd245pd393p8wire",
            "review_date": "2026-01-31",
            "status": "superseded",
            "note": "Standalone value-for-money framework folded into the equity-anchored Gavi 6.0 investment approach; management held equity as the organising principle, superseding a separate VfM instrument.",
            "evidence_label": "Gavi 6.0 investment approach note",
            "evidence_url": ""
          }
        ],
        "owner_email": "s.haddad@example.org"
      },
      {
        "id": "rec_zd_5",
        "code": "I5",
        "recommendation": "Support country teams to operationalise their grants more effectively.",
        "disposition": "agree",
        "owner": "Programme Team",
        "secondary_owner": "national immunisation programmes",
        "due_date": "2024-12-31",
        "status": "in_progress",
        "actions": "",
        "evidence_note": "",
        "next_review": "2026-07-20",
        "implementation_status": "in_progress",
        "progress": 60,
        "review_interval_months": 6,
        "review_history": [
          {
            "id": "rev_mr8wd245udef6l7xx3",
            "review_date": "2026-01-20",
            "status": "in_progress",
            "note": "Country operational-support package deployed in a first tranche of countries; uptake uneven in fragile and conflict-affected settings.",
            "evidence_label": "Country support tracker (Q4 2025)",
            "evidence_url": ""
          }
        ],
        "owner_email": "r.alemu@example.org"
      },
      {
        "id": "rec_zd_6",
        "code": "I6",
        "recommendation": "Invest in zero-dose-specific indicators and embed them in the Gavi 6.0 monitoring frameworks.",
        "disposition": "agree",
        "owner": "Programme Team",
        "secondary_owner": "",
        "due_date": "2025-06-30",
        "status": "planned",
        "actions": "",
        "evidence_note": "",
        "next_review": "2026-10-31",
        "implementation_status": "in_progress",
        "progress": 45,
        "review_interval_months": 6,
        "review_history": [
          {
            "id": "rev_mr8wd246p1qh20nirt",
            "review_date": "2026-04-30",
            "status": "in_progress",
            "note": "Zero-dose indicator set defined and under integration into the Gavi 6.0 monitoring framework; formal endorsement still pending.",
            "evidence_label": "Gavi 6.0 monitoring framework draft",
            "evidence_url": ""
          }
        ],
        "owner_email": "r.alemu@example.org"
      },
      {
        "id": "rec_zd_7",
        "code": "I7",
        "recommendation": "Roll out a cross-Secretariat initiative to enhance the use of data and analytics for management.",
        "disposition": "agree",
        "owner": "Strategy Team",
        "secondary_owner": "",
        "due_date": "2024-12-31",
        "status": "in_progress",
        "actions": "Weak grant-implementation data flagged relative to peers such as the Global Fund.",
        "evidence_note": "",
        "next_review": "2026-07-28",
        "implementation_status": "in_progress",
        "progress": 55,
        "review_interval_months": 6,
        "review_history": [
          {
            "id": "rev_mr8wd246wn86knpmuco",
            "review_date": "2026-01-28",
            "status": "in_progress",
            "note": "Data-and-analytics initiative rolled out to a first set of Secretariat teams; grant-implementation data still weak relative to peers such as the Global Fund.",
            "evidence_label": "Analytics initiative review (Q1 2026)",
            "evidence_url": ""
          }
        ],
        "owner_email": "s.haddad@example.org"
      }
    ],
    "dissemination": [
      {
        "id": "dis_deck",
        "product": "Year 2 findings slide deck",
        "format": "Slide deck",
        "audience": "Board and EAC",
        "due_date": "2024-05-31",
        "status": "delivered",
        "note": ""
      },
      {
        "id": "dis_brief",
        "product": "Evaluation brief with management response",
        "format": "Brief",
        "audience": "Board and Secretariat",
        "due_date": "2024-06-30",
        "status": "delivered",
        "note": ""
      },
      {
        "id": "dis_country",
        "product": "Country feedback sessions on real-time findings",
        "format": "Workshop",
        "audience": "National immunisation programmes",
        "due_date": "2024-08-31",
        "status": "in_progress",
        "note": ""
      },
      {
        "id": "dis_learn",
        "product": "Zero-dose learning brief for Gavi 6.0 design",
        "format": "Learning brief",
        "audience": "Strategy Team and Alliance partners",
        "due_date": "2024-10-31",
        "status": "planned",
        "note": ""
      }
    ],
    "risks": [
      {
        "id": "rsk_data",
        "risk": "Grant-implementation data too coarse for a formal contribution analysis.",
        "category": "Data",
        "likelihood": "high",
        "impact": "high",
        "mitigation": "Shift O3 to a plausible-contribution narrative; report the data gap to the EAC. (Materialised: formal contribution analysis was abandoned.)",
        "owner": "Central Evaluation Team",
        "status": "open"
      },
      {
        "id": "rsk_attr",
        "risk": "Pooled Alliance funding masks attribution to Gavi specifically.",
        "category": "Method",
        "likelihood": "high",
        "impact": "medium",
        "mitigation": "Frame contribution at Alliance level; avoid single-actor attribution claims.",
        "owner": "Team Leader",
        "status": "mitigating"
      },
      {
        "id": "rsk_equity",
        "risk": "Equity analysis skews to socio-economic factors, under-weighting gender.",
        "category": "Scope",
        "likelihood": "medium",
        "impact": "medium",
        "mitigation": "Strengthen the gender dimension at EAC request (inception condition, now cleared).",
        "owner": "Supplier",
        "status": "closed"
      }
    ],
    "completed_at": "2024-05-10T10:00:00.000Z"
  },
  "staleness": {
    "0": false,
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false,
    "8": false,
    "9": false,
    "10": false
  },
  "reviews": []
};
})();
