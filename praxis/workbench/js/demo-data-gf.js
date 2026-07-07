/**
 * demo-data-gf.js - Global Fund ELO Malaria Sub-National Tailoring evaluation.
 * Regenerated at schema 1.4.0 (unified deliverables, commissioner cockpit).
 */
(function() {
  'use strict';
  window.PRAXIS_DEMO_GF = {
  "version": "1.4.0",
  "schema": "praxis-workbench",
  "created_at": "2025-03-18T09:00:00.000Z",
  "updated_at": "2025-03-18T09:00:00.000Z",
  "project_meta": {
    "title": "GF SNT Malaria Evaluation",
    "programme_name": "Global Fund Evaluation: Sub-national Tailoring of Malaria Interventions",
    "organisation": "The Global Fund / Evaluation and Learning Office (ELO)",
    "country": "Multi-country (11 HBHI countries)",
    "sector_template": "",
    "sectors": [
      "Health"
    ],
    "primary_sector": null,
    "health_areas": [
      "malaria",
      "health_systems"
    ],
    "frameworks": [],
    "evaluation_type": "summative",
    "operating_context": "fragile",
    "budget": "high",
    "timeline": "medium",
    "programme_maturity": "scaling",
    "languages": [
      "en",
      "fr"
    ],
    "sector": "health"
  },
  "protection": {
    "sensitivity": "standard",
    "ai_permitted": true,
    "sharing_guidance": "Key informant identities and confidential materials must be anonymised in any published output.",
    "encryption_recommended": false,
    "access_notes": "Public Terms of Reference; primary data (KIIs) confidential."
  },
  "tor_constraints": {
    "raw_text": "The Global Fund is commissioning an independent evaluation on Capacity, Quality and Decision-making in Sub-national Tailoring of Malaria Interventions, aligned with the 2023-2028 Global Fund Strategy and the GTS 2016-2030.",
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
    "geographic_scope": "Multi-country: 11 HBHI countries (Burkina Faso, Cameroon, DRC, Ghana, Mali, Mozambique, Niger, Nigeria, Uganda, Tanzania, India); 5-7 selected for country insights; survey of 28 highest-burden countries.",
    "target_population": "National Malaria Control Programmes, Principal Recipients, sub-national malaria managers, Global Fund Secretariat and Country Teams, TRP members, technical partners and community representatives.",
    "evaluation_questions_raw": [
      "How adequate are country sub-national systems for capturing and analysing malaria programming data to support SNT?",
      "To what extent are Global Fund malaria Funding Requests based on sub-national tailoring?",
      "To what degree does the Global Fund promote generation and use of high-quality sub-national malaria data?"
    ]
  },
  "evaluability": {
    "score": 61,
    "dimensions": [
      {
        "id": "data",
        "label": "Data Availability",
        "max": 25,
        "system_score": 13,
        "adjusted_score": null,
        "justification": "Routine surveillance (DHIS2) and malaria data repositories exist but sub-national data quality, completeness and integration of community and private-sector data are uneven. Funding Request and portfolio data are strong secondary sources."
      },
      {
        "id": "toc",
        "label": "ToC Clarity",
        "max": 20,
        "system_score": 13,
        "adjusted_score": null,
        "justification": "There is no dedicated SNT strategy, but the GTS 2016-2030 and 2023-2028 Global Fund Strategy provide a clear framework. The causal logic from data use to financial optimisation and impact can be articulated and tested."
      },
      {
        "id": "timeline",
        "label": "Timeline Adequacy",
        "max": 20,
        "system_score": 13,
        "adjusted_score": null,
        "justification": "An approximately ten-month timeline (workplan to final report) is adequate for systems, Funding Request and portfolio analysis but tight for 5-7 in-depth country insights and process mapping."
      },
      {
        "id": "context",
        "label": "Operating Context",
        "max": 15,
        "system_score": 9,
        "adjusted_score": null,
        "justification": "HBHI countries span stable and fragile or conflict-affected settings (for example DRC, Mali and Niger), with access, security and language considerations affecting country insights."
      },
      {
        "id": "comparison",
        "label": "Comparison Feasibility",
        "max": 20,
        "system_score": 13,
        "adjusted_score": null,
        "justification": "No counterfactual is available; the design relies on theory-based contribution analysis, comparative case analysis across countries and before/after comparison of GC6 and GC7 Funding Requests."
      }
    ],
    "blockers": [
      {
        "dimension": "context",
        "label": "Operating Context",
        "score": 9,
        "max": 15
      }
    ],
    "recommendations": [
      "Conduct sub-national data quality assessments before relying on routine indicators for findings.",
      "Assess and document strength of evidence explicitly for each of the 26 evaluation questions.",
      "Sequence country insights early and adjust depth to access and security conditions in fragile settings."
    ],
    "completed_at": "2025-03-20T10:00:00.000Z"
  },
  "toc": {
    "title": "SNT of Malaria Interventions - Theory of Change",
    "narrative": {
      "description": "Sub-national tailoring uses local data and contextual information to determine the appropriate mix of malaria interventions and delivery strategies for optimum impact on transmission and burden.",
      "context": "Malaria transmission is increasingly localised in hard-to-reach sub-national areas. The 11 HBHI countries pursue High Burden to High Impact strategies; the Global Fund is aiming for 28 countries to submit evidence-based Funding Requests in GC8.",
      "theory": "By compiling and analysing sub-national data, stratifying burden and risk, and modelling intervention mixes and financial scenarios, countries can make data-driven sub-national decisions that optimise the intervention mix and financial allocation, contributing to reduced malaria incidence and mortality.",
      "systemAssumptions": []
    },
    "nodes": [
      {
        "id": "n1",
        "title": "Progress toward GTS incidence and mortality reduction targets",
        "level": "impact",
        "x": 400,
        "y": 100
      },
      {
        "id": "n2",
        "title": "Optimised intervention mix and financial optimisation",
        "level": "outcome",
        "x": 200,
        "y": 500
      },
      {
        "id": "n3",
        "title": "Data-driven sub-national decision-making",
        "level": "outcome",
        "x": 600,
        "y": 500
      },
      {
        "id": "n4",
        "title": "Quality sub-national malaria data compiled",
        "level": "output",
        "x": 100,
        "y": 900
      },
      {
        "id": "n5",
        "title": "Sub-national stratification of burden and risk produced",
        "level": "output",
        "x": 400,
        "y": 900
      },
      {
        "id": "n6",
        "title": "Funding Requests reflect SNT",
        "level": "output",
        "x": 700,
        "y": 900
      },
      {
        "id": "n7",
        "title": "Data compilation, quality assurance and MDR strengthening",
        "level": "activity",
        "x": 100,
        "y": 1300
      },
      {
        "id": "n8",
        "title": "Stratification and analytical capacity building",
        "level": "activity",
        "x": 400,
        "y": 1300
      },
      {
        "id": "n9",
        "title": "Intervention-mix and financial modelling and TA",
        "level": "activity",
        "x": 700,
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
        "targetId": "n2",
        "evidence": {
          "strength": "strong"
        }
      },
      {
        "id": "c3",
        "sourceId": "n4",
        "targetId": "n3",
        "evidence": {
          "strength": "strong"
        }
      },
      {
        "id": "c4",
        "sourceId": "n5",
        "targetId": "n3",
        "evidence": {
          "strength": "strong"
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
        "targetId": "n4",
        "evidence": {
          "strength": "moderate"
        }
      },
      {
        "id": "c7",
        "sourceId": "n8",
        "targetId": "n5",
        "evidence": {
          "strength": "strong"
        }
      },
      {
        "id": "c8",
        "sourceId": "n9",
        "targetId": "n6",
        "evidence": {
          "strength": "moderate"
        }
      }
    ],
    "knowledge_sources": {},
    "completed_at": "2025-03-22T10:00:00.000Z"
  },
  "evaluation_matrix": {
    "context": {
      "programmeName": "Global Fund Evaluation: Sub-national Tailoring of Malaria Interventions",
      "sectorTemplate": "health",
      "healthAreas": [
        "malaria",
        "health_systems"
      ],
      "frameworks": [],
      "evaluationType": "summative",
      "operatingContext": "fragile",
      "dacCriteria": [
        "relevance",
        "coherence",
        "effectiveness",
        "efficiency",
        "sustainability"
      ]
    },
    "toc_summary": {
      "goal": "Progress toward GTS incidence and mortality reduction targets",
      "outcomes": [
        {
          "text": "Optimised intervention mix and financial optimisation",
          "outputs": [
            "Quality sub-national malaria data compiled",
            "Sub-national stratification of burden and risk produced"
          ]
        },
        {
          "text": "Data-driven sub-national decision-making",
          "outputs": [
            "Funding Requests reflect SNT",
            "Analytical capacity strengthened"
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
        "criterion": "effectiveness",
        "question": "How adequate are country sub-national systems in capturing and analysing malaria programming data to support better tailoring and programming of malaria responses, and what systems or data points are missing?",
        "subQuestions": [
          "Which systems and data points are absent that should be considered for the future?"
        ],
        "indicators": [
          {
            "name": "Extent to which sub-national systems capture and analyse the data needed for SNT (case-study rating)",
            "code": "SNT-A1",
            "source": "KII + systems review"
          },
          {
            "name": "Number of critical data gaps identified per country insight",
            "code": "SNT-A2",
            "source": "Systems mapping"
          }
        ],
        "dataSources": [
          "Country insight systems reviews (5-7 countries)",
          "NMCP and sub-national KIIs",
          "DHIS2 and MDR documentation"
        ],
        "judgementCriteria": "Strong: systems capture burden, intervention and contextual data usable for stratification. Weak: major gaps prevent sub-national analysis."
      },
      {
        "id": "eq_2",
        "number": 2,
        "criterion": "effectiveness",
        "question": "What sub-national systems exist for capturing malaria burden data, intervention data and contextual information, and to what extent is community and private-sector data collected, disaggregated and integrated into routine systems?",
        "subQuestions": [
          "Is community and private-sector data available and transcribed into routine systems?"
        ],
        "indicators": [
          {
            "name": "Availability of burden, intervention and contextual data at sub-national level",
            "code": "SNT-A3",
            "source": "Systems review"
          },
          {
            "name": "Share of community and private-sector data integrated into routine reporting",
            "code": "SNT-A4",
            "source": "DHIS2 + facility audit"
          }
        ],
        "dataSources": [
          "DHIS2 completeness reports",
          "Private-sector and community register review",
          "Sub-national data officer KIIs"
        ],
        "judgementCriteria": "Strong: burden, intervention and contextual data collected, disaggregated and integrated. Weak: fragmented or missing data streams."
      },
      {
        "id": "eq_3",
        "number": 3,
        "criterion": "relevance",
        "question": "What input was obtained from sub-national level for malaria vaccine introduction in relevant countries, and how were focus coverage areas identified?",
        "subQuestions": [
          "How were vaccine focus coverage areas selected?"
        ],
        "indicators": [
          {
            "name": "Degree of sub-national input into vaccine coverage-area selection (case-study rating)",
            "code": "SNT-A5",
            "source": "KII + document review"
          }
        ],
        "dataSources": [
          "Vaccine introduction plans",
          "Sub-national and NMCP KIIs"
        ],
        "judgementCriteria": "Strong: documented sub-national input shaped coverage-area choices. Weak: top-down selection with no sub-national input."
      },
      {
        "id": "eq_4",
        "number": 4,
        "criterion": "effectiveness",
        "question": "What is the quality of sub-national data, are validation, verification and quality-improvement processes in place and by whom, and what is the right balance between funding LFAs for verification and supporting sub-national data review and use?",
        "subQuestions": [
          "Who performs validation and quality improvement at sub-national level?",
          "What is the balance between LFA verification and sub-national data use?"
        ],
        "indicators": [
          {
            "name": "Sub-national data quality score (completeness, timeliness, accuracy)",
            "code": "SNT-A6",
            "source": "Data quality assessment"
          },
          {
            "name": "Presence of routine data-quality and verification processes at sub-national level",
            "code": "SNT-A7",
            "source": "KII + DQA"
          }
        ],
        "dataSources": [
          "Register-to-report data quality assessment",
          "LFA verification reports",
          "Sub-national M&E KIIs"
        ],
        "judgementCriteria": "Strong: routine verification and quality improvement embedded sub-nationally. Weak: verification only via LFAs, no sub-national quality use."
      },
      {
        "id": "eq_5",
        "number": 5,
        "criterion": "effectiveness",
        "question": "To what extent are analytical capacities in place at national, regional and district levels to analyse data and inform SNT and programming?",
        "subQuestions": [
          "Where are analytical-capacity gaps most acute?"
        ],
        "indicators": [
          {
            "name": "Analytical capacity index at national, regional and district levels",
            "code": "SNT-A8",
            "source": "Capacity assessment"
          }
        ],
        "dataSources": [
          "Capacity assessment tool",
          "NMCP and regional analyst KIIs"
        ],
        "judgementCriteria": "Strong: capacity present across all three levels. Weak: analysis concentrated nationally with weak district capacity."
      },
      {
        "id": "eq_6",
        "number": 6,
        "criterion": "effectiveness",
        "question": "To what extent do population denominators inform SNT, and what data sources and methods are used for estimating denominators and service coverage at sub-national level?",
        "subQuestions": [
          "How are estimates calculated for service coverage and commodity distribution?"
        ],
        "indicators": [
          {
            "name": "Extent to which robust population denominators inform sub-national coverage estimates",
            "code": "SNT-A9",
            "source": "Methods review"
          }
        ],
        "dataSources": [
          "Population estimation methods review",
          "Coverage-survey documentation",
          "KIIs with statisticians"
        ],
        "judgementCriteria": "Strong: denominators are current and methodologically sound. Weak: outdated or inconsistent denominators distort coverage."
      },
      {
        "id": "eq_7",
        "number": 7,
        "criterion": "relevance",
        "question": "What is the level of awareness of the SNT approach at sub-national and national levels, and how well does disaggregated malaria analysis inform stratification, intervention-mix optimisation, monitoring and quality improvement?",
        "subQuestions": [
          "How adequately does disaggregated analysis inform stratification and intervention mix?"
        ],
        "indicators": [
          {
            "name": "Level of SNT awareness among sub-national and national programme staff",
            "code": "SNT-A10",
            "source": "Survey + KII"
          },
          {
            "name": "Extent to which disaggregated analysis informs stratification and intervention-mix decisions",
            "code": "SNT-A11",
            "source": "Process review"
          }
        ],
        "dataSources": [
          "Country stakeholder survey",
          "Sub-national programme KIIs",
          "Stratification working documents"
        ],
        "judgementCriteria": "Strong: high awareness and analysis routinely drives decisions. Weak: low awareness and analysis not used."
      },
      {
        "id": "eq_8",
        "number": 8,
        "criterion": "effectiveness",
        "question": "What are the challenges related to decision-making in SNT, and how much have Global Fund investments played a role in addressing these challenges?",
        "subQuestions": [
          "What role have Global Fund investments played in addressing decision-making challenges?"
        ],
        "indicators": [
          {
            "name": "Number and severity of decision-making bottlenecks identified per country",
            "code": "SNT-B1",
            "source": "Process mapping"
          },
          {
            "name": "Extent of Global Fund contribution to easing decision-making challenges",
            "code": "SNT-B2",
            "source": "Contribution analysis"
          }
        ],
        "dataSources": [
          "Process mapping exercise",
          "NMCP and CCM KIIs",
          "Global Fund grant documents"
        ],
        "judgementCriteria": "Strong: key bottlenecks identified and Global Fund contribution evidenced. Weak: bottlenecks persist with limited attributable contribution."
      },
      {
        "id": "eq_9",
        "number": 9,
        "criterion": "coherence",
        "question": "What is the degree of autonomy at sub-national level for SNT and malaria-programming decisions, and how adequate are the structures, mandates, guidelines and coordination processes between national and sub-national levels?",
        "subQuestions": [
          "How adequate are coordination structures and mandates across levels?"
        ],
        "indicators": [
          {
            "name": "Degree of sub-national decision-making autonomy (law and practice)",
            "code": "SNT-B3",
            "source": "Governance review"
          },
          {
            "name": "Adequacy of national to sub-national coordination structures and mandates",
            "code": "SNT-B4",
            "source": "Institutional review"
          }
        ],
        "dataSources": [
          "Governance and decentralisation document review",
          "National and sub-national KIIs"
        ],
        "judgementCriteria": "Strong: clear mandates and functioning coordination. Weak: unclear mandates or centralised decision-making."
      },
      {
        "id": "eq_10",
        "number": 10,
        "criterion": "relevance",
        "question": "What contextual factors, including political, legal, economic and social dimensions, affect decision-making at the sub-national level for SNT?",
        "subQuestions": [
          "Which contextual factors most constrain sub-national SNT decisions?"
        ],
        "indicators": [
          {
            "name": "Contextual factors shaping sub-national SNT decisions (thematic synthesis)",
            "code": "SNT-B5",
            "source": "Political-economy analysis"
          }
        ],
        "dataSources": [
          "Political-economy analysis",
          "Country insight KIIs"
        ],
        "judgementCriteria": "Strong: contextual drivers well understood and reflected in programming. Weak: context poorly accounted for."
      },
      {
        "id": "eq_11",
        "number": 11,
        "criterion": "coherence",
        "question": "What political-economy, governance and other factors differ between countries where sub-national decisions are made, in law and/or practice, and where they are not, and how can sub-national decision-making capacity be strengthened short and long term?",
        "subQuestions": [
          "How can sub-national decision-making capacity be strengthened across different systems?"
        ],
        "indicators": [
          {
            "name": "Comparative typology of enabling and constraining governance factors across countries",
            "code": "SNT-B6",
            "source": "Comparative analysis"
          }
        ],
        "dataSources": [
          "Comparative case analysis",
          "Governance KIIs across country insights"
        ],
        "judgementCriteria": "Strong: clear comparative lessons on strengthening capacity. Weak: no transferable lessons identified."
      },
      {
        "id": "eq_12",
        "number": 12,
        "criterion": "effectiveness",
        "question": "What has been the role of Global Fund investments in supporting decision-making for SNT, who makes the key decisions, and what evidence do they use as the basis for decision-making?",
        "subQuestions": [
          "Who makes key SNT decisions and what evidence do they use?"
        ],
        "indicators": [
          {
            "name": "Evidence of Global Fund contribution to strengthened SNT decision-making",
            "code": "SNT-B7",
            "source": "Contribution analysis"
          }
        ],
        "dataSources": [
          "Grant and TA documentation",
          "Decision-maker KIIs"
        ],
        "judgementCriteria": "Strong: decisions evidence-based with a documented Global Fund role. Weak: decisions not evidence-based."
      },
      {
        "id": "eq_13",
        "number": 13,
        "criterion": "relevance",
        "question": "To what extent are the Global Fund malaria Funding Requests based on SNT?",
        "subQuestions": [
          "How consistently is SNT reflected across recent Funding Requests?"
        ],
        "indicators": [
          {
            "name": "Share of malaria Funding Requests demonstrating an SNT basis (GC6, GC7)",
            "code": "SNT-C1",
            "source": "Funding-request analysis"
          }
        ],
        "dataSources": [
          "Funding Request analysis (GC6, GC7)",
          "TRP review documents"
        ],
        "judgementCriteria": "Strong: majority of FRs demonstrate an explicit SNT basis. Weak: SNT largely absent from FRs."
      },
      {
        "id": "eq_14",
        "number": 14,
        "criterion": "relevance",
        "question": "How much have the key concepts of SNT been reflected in malaria Funding Requests, and how can this be strengthened in GC8?",
        "subQuestions": [
          "How can SNT be strengthened in GC8 Funding Requests?"
        ],
        "indicators": [
          {
            "name": "Depth of SNT concepts (stratification, intervention mix, financial optimisation) in FRs",
            "code": "SNT-C2",
            "source": "Funding-request analysis"
          }
        ],
        "dataSources": [
          "Funding Request analysis",
          "Malaria Information Note review",
          "NMCP KIIs"
        ],
        "judgementCriteria": "Strong: SNT concepts fully reflected. Weak: SNT concepts superficial or missing."
      },
      {
        "id": "eq_15",
        "number": 15,
        "criterion": "effectiveness",
        "question": "To what extent do Funding Requests reflect stratification and tailoring of interventions at sub-national level, and why might an initial stratification not reflect the chosen interventions?",
        "subQuestions": [
          "What role do resource constraints play in deviating from ideal interventions?"
        ],
        "indicators": [
          {
            "name": "Consistency between sub-national stratification and interventions selected in FRs",
            "code": "SNT-C3",
            "source": "Document review"
          }
        ],
        "dataSources": [
          "Stratification working documents",
          "Funding Request analysis",
          "NMCP and TRP KIIs"
        ],
        "judgementCriteria": "Strong: interventions align with stratification. Weak: interventions deviate from stratification without clear rationale."
      },
      {
        "id": "eq_16",
        "number": 16,
        "criterion": "effectiveness",
        "question": "What difficulties are faced by countries in moving from input-based to impact-based programming based on SNT, and how can Global Fund processes better incentivise Funding Requests based on SNT and financial optimisation?",
        "subQuestions": [
          "How can Global Fund processes better incentivise SNT and financial optimisation?"
        ],
        "indicators": [
          {
            "name": "Barriers to impact-based, SNT-driven programming (thematic synthesis)",
            "code": "SNT-C4",
            "source": "KII synthesis"
          }
        ],
        "dataSources": [
          "NMCP and Secretariat KIIs",
          "Funding Request analysis"
        ],
        "judgementCriteria": "Strong: clear, actionable incentives identified. Weak: barriers unresolved."
      },
      {
        "id": "eq_17",
        "number": 17,
        "criterion": "efficiency",
        "question": "To what extent have countries requested and been provided resources and technical assistance for sustainable data compilation, stratification, intervention-mix identification, scenario-building and modelling?",
        "subQuestions": [
          "Where TA was requested, was it provided and prioritised?"
        ],
        "indicators": [
          {
            "name": "Share of TA requests for SNT compilation, stratification and modelling that were met",
            "code": "SNT-C5",
            "source": "Portfolio analysis"
          }
        ],
        "dataSources": [
          "Portfolio analysis",
          "TA records",
          "NMCP KIIs"
        ],
        "judgementCriteria": "Strong: SNT-related TA requested and provided. Weak: TA requested but not prioritised or provided."
      },
      {
        "id": "eq_18",
        "number": 18,
        "criterion": "effectiveness",
        "question": "To what degree does the Global Fund promote generation and use of high-quality malaria data at national and sub-national level, and how could it better support countries to manage, analyse and use their sub-national data?",
        "subQuestions": [
          "How could the Global Fund better support sub-national data management and use?"
        ],
        "indicators": [
          {
            "name": "Extent of Global Fund support to high-quality malaria data generation and use",
            "code": "SNT-D1",
            "source": "Portfolio + KII"
          }
        ],
        "dataSources": [
          "Portfolio analysis",
          "Secretariat and partner KIIs"
        ],
        "judgementCriteria": "Strong: active, effective support to data quality and use. Weak: limited or fragmented support."
      },
      {
        "id": "eq_19",
        "number": 19,
        "criterion": "effectiveness",
        "question": "To what extent has the Global Fund facilitated the creation, maintenance and use of sub-national data systems, including consolidated malaria data repositories (MDRs), and what sources do MDRs draw from?",
        "subQuestions": [
          "What data sources do the MDRs draw from?"
        ],
        "indicators": [
          {
            "name": "Extent of Global Fund contribution to MDR creation, maintenance and use",
            "code": "SNT-D2",
            "source": "Document review + KII"
          }
        ],
        "dataSources": [
          "MDR documentation",
          "Grant records",
          "Data-system KIIs"
        ],
        "judgementCriteria": "Strong: MDRs established, maintained and used with Global Fund support. Weak: MDRs absent or unused."
      },
      {
        "id": "eq_20",
        "number": 20,
        "criterion": "coherence",
        "question": "Are the Global Fund monitoring frameworks (PUDRs, DHIS district dashboards and other tools) built in a way that supports a sub-nationally tailored response and encourages data use and action?",
        "subQuestions": [
          "Do PUDRs and district dashboards encourage data use and action?"
        ],
        "indicators": [
          {
            "name": "Degree to which Global Fund monitoring tools support and encourage sub-national data use",
            "code": "SNT-D3",
            "source": "Tools review"
          }
        ],
        "dataSources": [
          "PUDR and dashboard review",
          "M&E KIIs"
        ],
        "judgementCriteria": "Strong: monitoring tools drive sub-national data use. Weak: tools are compliance-oriented, not action-oriented."
      },
      {
        "id": "eq_21",
        "number": 21,
        "criterion": "efficiency",
        "question": "Do current indicators facilitate and incentivise the Secretariat and countries to work towards SNT and financial optimisation, and are the indicators adaptable and usable by sub-national teams at appropriate granularity and periodicity?",
        "subQuestions": [
          "Are indicators adaptable and usable at sub-national granularity?"
        ],
        "indicators": [
          {
            "name": "Suitability of the current malaria indicator set for SNT and financial optimisation",
            "code": "SNT-D4",
            "source": "Indicator review"
          }
        ],
        "dataSources": [
          "Indicator framework review",
          "Sub-national team KIIs"
        ],
        "judgementCriteria": "Strong: indicators incentivise SNT and are usable sub-nationally. Weak: indicators misaligned or unusable at sub-national level."
      },
      {
        "id": "eq_22",
        "number": 22,
        "criterion": "coherence",
        "question": "What is the role of country stakeholders, including partners, TA providers and in-country research institutions, and national structures and strategies in facilitating SNT, and how do partners engage with the country?",
        "subQuestions": [
          "How do partners and TA providers engage with the country on SNT?"
        ],
        "indicators": [
          {
            "name": "Degree of alignment and active engagement of partners and TA providers on SNT",
            "code": "SNT-E1",
            "source": "Institutional review + KII"
          }
        ],
        "dataSources": [
          "Partner mapping",
          "Global and country stakeholder KIIs"
        ],
        "judgementCriteria": "Strong: partners aligned and actively facilitating SNT. Weak: fragmented or duplicative partner engagement."
      },
      {
        "id": "eq_23",
        "number": 23,
        "criterion": "sustainability",
        "question": "To what extent has sub-national evidence informed National Malaria Strategic Plans, National Health Strategic Plans and sub-national plans, and how does the costing of NMSPs consider sub-national needs and use SNT to optimise financial requests?",
        "subQuestions": [
          "Do national plans reflect SNT to optimise financial requests and allocations?"
        ],
        "indicators": [
          {
            "name": "Extent to which sub-national evidence and SNT shape NMSP content and costing",
            "code": "SNT-E2",
            "source": "Plan and costing review"
          }
        ],
        "dataSources": [
          "NMSP and sub-national plan review",
          "Costing documents",
          "Planning KIIs"
        ],
        "judgementCriteria": "Strong: NMSPs are evidence-based and costed with SNT. Weak: plans are top-down and not sub-nationally informed."
      },
      {
        "id": "eq_24",
        "number": 24,
        "criterion": "coherence",
        "question": "What climate-change and environmental-management structures and policies are in place at national and sub-national level, and to what extent have malaria stakeholders engaged with climate-change, environmental-management and disaster-risk-reduction programmes?",
        "subQuestions": [
          "How are malaria stakeholders engaged with climate and DRR programmes?"
        ],
        "indicators": [
          {
            "name": "Degree of malaria stakeholder engagement with climate and environmental structures",
            "code": "SNT-E3",
            "source": "Policy review + KII"
          }
        ],
        "dataSources": [
          "Climate and DRR policy review",
          "Cross-sector KIIs"
        ],
        "judgementCriteria": "Strong: active engagement linking malaria and climate structures. Weak: siloed with no engagement."
      },
      {
        "id": "eq_25",
        "number": 25,
        "criterion": "coherence",
        "question": "How adequate is the guidance and activity level of national reference groups (M&E working group and other relevant technical groups) with regard to SNT and financial optimisation, and how can it be improved?",
        "subQuestions": [
          "How can reference-group guidance on SNT be improved?"
        ],
        "indicators": [
          {
            "name": "Adequacy and activity level of national reference groups on SNT and financial optimisation",
            "code": "SNT-E4",
            "source": "Institutional review"
          }
        ],
        "dataSources": [
          "Reference-group terms of reference and minutes",
          "M&E working-group KIIs"
        ],
        "judgementCriteria": "Strong: active, well-guided reference groups. Weak: inactive or without SNT guidance."
      },
      {
        "id": "eq_26",
        "number": 26,
        "criterion": "efficiency",
        "question": "To what extent does technical assistance focus on SNT, and how can the TA scope be expanded to focus on SNT and related financial optimisation in preparation for GC8 as well as systematic local capacity-building?",
        "subQuestions": [
          "How can TA scope be expanded for GC8 and local capacity-building?"
        ],
        "indicators": [
          {
            "name": "Share of malaria TA with an explicit SNT and financial-optimisation focus",
            "code": "SNT-E5",
            "source": "Portfolio + TA review"
          }
        ],
        "dataSources": [
          "Portfolio analysis",
          "TA provider KIIs"
        ],
        "judgementCriteria": "Strong: TA is SNT-focused and builds local capacity. Weak: TA is generic with no SNT focus."
      }
    ],
    "completed_at": "2025-03-25T10:00:00.000Z"
  },
  "design_recommendation": {
    "answers": {
      "purpose": "accountability",
      "causal": "contribution",
      "comparison": "none",
      "data": "routine_monitoring",
      "context": "fragile",
      "budget": "high",
      "timeline": "medium",
      "maturity": "scaling",
      "complexity": "complex",
      "unit": "system"
    },
    "ranked_designs": [
      {
        "id": "contributionAnalysis",
        "name": "Contribution Analysis",
        "family": "Theory-Based",
        "score": 89
      },
      {
        "id": "processTracing",
        "name": "Process Tracing",
        "family": "Theory-Based",
        "score": 83
      },
      {
        "id": "caseStudy",
        "name": "Comparative Case Study",
        "family": "Case-Based",
        "score": 80
      }
    ],
    "selected_design": "contributionAnalysis",
    "justification": "The evaluation is system-level and complex with no counterfactual, so a theory-based contribution analysis is appropriate: it interrogates the SNT causal logic, tests assumptions and triangulates qualitative evidence with portfolio and Funding Request data. Process tracing and comparative case study across country insights support causal inference where counterfactual methods are infeasible.",
    "completed_at": "2025-03-27T10:00:00.000Z"
  },
  "sample_parameters": {
    "design_id": "contributionAnalysis",
    "params": {},
    "result": {
      "primary": 90,
      "label": "Theory-based, qualitative-dominant: approximately 90 key informant interviews across 6 country insights, plus a 28-country stakeholder survey, 18 FGDs and a portfolio and document review (150+ documents)."
    },
    "qualitative_plan": {
      "purpose": "Establish an evidence base on sub-national data capacity, quality and decision-making by triangulating stakeholder perspectives with portfolio, Funding Request and routine data across diverse HBHI contexts.",
      "methods": [
        "Key Informant Interviews",
        "Online survey",
        "Focus Group Discussions",
        "Document review",
        "Portfolio analysis",
        "Process mapping",
        "Country insights"
      ],
      "contexts": {},
      "breakdown": [
        {
          "method": "Global Fund and global partner KIIs",
          "count": 22,
          "notes": "Global Fund Malaria Team, Country Teams, global malaria partners and TA providers."
        },
        {
          "method": "National stakeholder KIIs",
          "count": 30,
          "notes": "NMCP staff, Principal Recipients, CCM and TRP representatives across country insights."
        },
        {
          "method": "Sub-national stakeholder KIIs",
          "count": 38,
          "notes": "Sub-national malaria managers, health information officers and facility staff."
        },
        {
          "method": "Country stakeholder survey",
          "count": 28,
          "notes": "Online survey of the 28 highest-burden countries on SNT process status."
        },
        {
          "method": "Focus Group Discussions",
          "count": 18,
          "notes": "Community and facility representatives across the country insights."
        },
        {
          "method": "Document and portfolio review",
          "count": 150,
          "notes": "Funding Requests (GC6, GC7), TRP and OIG reports, Malaria Information Notes, portfolio data for 11 HBHI countries."
        },
        {
          "method": "Country insights",
          "count": 6,
          "notes": "Selected on burden, HBHI status, risk profile and SNT implementation spectrum."
        }
      ]
    },
    "completed_at": "2025-03-27T10:00:00.000Z"
  },
  "instruments": {
    "items": [
      {
        "id": "inst_1",
        "name": "KII Guide - Global Fund Malaria Team & Global Partners",
        "type": "kii",
        "method": "Semi-structured interview",
        "targetSample": "22 global KIIs",
        "sections": [
          {
            "id": "sec_1",
            "label": "Theme D - Global Fund role in high-quality data (EQ18)",
            "eqId": "eq_18",
            "questions": [
              {
                "id": "q1",
                "text": "How does the Global Fund currently promote the generation and use of high-quality malaria data at national and sub-national level?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q2",
                "text": "How could the Global Fund better support countries to manage, analyse and use their sub-national malaria data?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q3",
                "text": "How would you rate the current level of Global Fund support to sub-national data quality?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              }
            ]
          },
          {
            "id": "sec_2",
            "label": "Theme B - Role of investments in decision-making (EQ12)",
            "eqId": "eq_12",
            "questions": [
              {
                "id": "q4",
                "text": "What role have Global Fund investments played in supporting SNT decision-making?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q5",
                "text": "Who makes the key SNT decisions, and what evidence do they use?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_3",
            "label": "Theme E - Technical assistance focus (EQ26)",
            "eqId": "eq_26",
            "questions": [
              {
                "id": "q6",
                "text": "To what extent does malaria technical assistance currently focus on SNT?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Strong focus",
                    "Some focus",
                    "Little focus",
                    "No focus"
                  ]
                },
                "required": true
              },
              {
                "id": "q7",
                "text": "How could TA scope be expanded to support SNT and financial optimisation for GC8?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          }
        ],
        "title": "KII Guide - Global Fund Malaria Team & Global Partners",
        "questions": [
          {
            "id": "q1",
            "text": "How does the Global Fund currently promote the generation an",
            "responseType": "text"
          },
          {
            "id": "q2",
            "text": "How could the Global Fund better support countries to manage",
            "responseType": "text"
          },
          {
            "id": "q3",
            "text": "How would you rate the current level of Global Fund support ",
            "responseType": "likert"
          },
          {
            "id": "q4",
            "text": "What role have Global Fund investments played in supporting ",
            "responseType": "text"
          },
          {
            "id": "q5",
            "text": "Who makes the key SNT decisions, and what evidence do they u",
            "responseType": "text"
          },
          {
            "id": "q6",
            "text": "To what extent does malaria technical assistance currently f",
            "responseType": "select_one"
          },
          {
            "id": "q7",
            "text": "How could TA scope be expanded to support SNT and financial ",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_2",
        "name": "KII Guide - National Malaria Programme & Principal Recipients",
        "type": "kii",
        "method": "Semi-structured interview",
        "targetSample": "30 national KIIs",
        "sections": [
          {
            "id": "sec_4",
            "label": "Theme A - Adequacy of sub-national systems (EQ1, EQ5)",
            "eqId": "eq_1",
            "questions": [
              {
                "id": "q8",
                "text": "How adequate are your sub-national systems for capturing and analysing malaria programming data?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q9",
                "text": "Which systems or data points are missing that should be considered for the future?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q10",
                "text": "How many staff at regional and district level are able to independently analyse malaria data for SNT?",
                "responseType": "numeric",
                "responseConfig": {
                  "min": 0,
                  "max": 5000,
                  "unit": "staff"
                },
                "required": true
              }
            ]
          },
          {
            "id": "sec_5",
            "label": "Theme C - Funding Requests and SNT (EQ13, EQ14)",
            "eqId": "eq_13",
            "questions": [
              {
                "id": "q11",
                "text": "To what extent was your most recent malaria Funding Request based on sub-national tailoring?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Fully",
                    "Substantially",
                    "Partially",
                    "Not at all"
                  ]
                },
                "required": true
              },
              {
                "id": "q12",
                "text": "How could SNT be strengthened in your GC8 Funding Request?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_6",
            "label": "Theme E - Evidence into national plans (EQ23)",
            "eqId": "eq_23",
            "questions": [
              {
                "id": "q13",
                "text": "To what extent has sub-national evidence informed your National Malaria Strategic Plan?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q14",
                "text": "How does NMSP costing take account of sub-national needs and interventions?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          }
        ],
        "title": "KII Guide - National Malaria Programme & Principal Recipients",
        "questions": [
          {
            "id": "q8",
            "text": "How adequate are your sub-national systems for capturing and",
            "responseType": "likert"
          },
          {
            "id": "q9",
            "text": "Which systems or data points are missing that should be cons",
            "responseType": "text"
          },
          {
            "id": "q10",
            "text": "How many staff at regional and district level are able to in",
            "responseType": "numeric"
          },
          {
            "id": "q11",
            "text": "To what extent was your most recent malaria Funding Request ",
            "responseType": "select_one"
          },
          {
            "id": "q12",
            "text": "How could SNT be strengthened in your GC8 Funding Request?",
            "responseType": "text"
          },
          {
            "id": "q13",
            "text": "To what extent has sub-national evidence informed your Natio",
            "responseType": "likert"
          },
          {
            "id": "q14",
            "text": "How does NMSP costing take account of sub-national needs and",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_3",
        "name": "KII Guide - Sub-national Malaria Managers & Health Officers",
        "type": "kii",
        "method": "Semi-structured interview",
        "targetSample": "38 sub-national KIIs",
        "sections": [
          {
            "id": "sec_7",
            "label": "Theme A - Sub-national data and quality (EQ2, EQ4)",
            "eqId": "eq_2",
            "questions": [
              {
                "id": "q15",
                "text": "Which malaria burden, intervention and contextual data do you routinely collect at this level?",
                "responseType": "select_multiple",
                "responseConfig": {
                  "options": [
                    "Case and incidence data",
                    "Vector-control coverage",
                    "Diagnosis and treatment",
                    "Entomological data",
                    "Climate and contextual data",
                    "Community and private-sector data"
                  ]
                },
                "required": true
              },
              {
                "id": "q16",
                "text": "Are data validation and quality-improvement processes carried out at this level, and by whom?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q17",
                "text": "In the past 12 months, how many data-quality reviews were conducted at this level?",
                "responseType": "numeric",
                "responseConfig": {
                  "min": 0,
                  "max": 52,
                  "unit": "reviews"
                },
                "required": true
              }
            ]
          },
          {
            "id": "sec_8",
            "label": "Theme A - Awareness of SNT (EQ7)",
            "eqId": "eq_7",
            "questions": [
              {
                "id": "q18",
                "text": "How would you describe your level of awareness of the SNT approach?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q19",
                "text": "How well does disaggregated analysis inform stratification and intervention-mix decisions here?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_9",
            "label": "Theme B - Autonomy and coordination (EQ8, EQ9)",
            "eqId": "eq_9",
            "questions": [
              {
                "id": "q20",
                "text": "What degree of autonomy do you have for SNT and malaria-programming decisions?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Full autonomy",
                    "Shared with national level",
                    "Mostly national-led",
                    "No autonomy"
                  ]
                },
                "required": true
              },
              {
                "id": "q21",
                "text": "What are the main challenges you face in SNT decision-making?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          }
        ],
        "title": "KII Guide - Sub-national Malaria Managers & Health Officers",
        "questions": [
          {
            "id": "q15",
            "text": "Which malaria burden, intervention and contextual data do yo",
            "responseType": "select_multiple"
          },
          {
            "id": "q16",
            "text": "Are data validation and quality-improvement processes carrie",
            "responseType": "text"
          },
          {
            "id": "q17",
            "text": "In the past 12 months, how many data-quality reviews were co",
            "responseType": "numeric"
          },
          {
            "id": "q18",
            "text": "How would you describe your level of awareness of the SNT ap",
            "responseType": "likert"
          },
          {
            "id": "q19",
            "text": "How well does disaggregated analysis inform stratification a",
            "responseType": "text"
          },
          {
            "id": "q20",
            "text": "What degree of autonomy do you have for SNT and malaria-prog",
            "responseType": "select_one"
          },
          {
            "id": "q21",
            "text": "What are the main challenges you face in SNT decision-making",
            "responseType": "text"
          }
        ]
      },
      {
        "id": "inst_4",
        "name": "Country Stakeholder Survey - SNT Process Status",
        "type": "survey",
        "method": "Online survey",
        "targetSample": "28 highest-burden countries",
        "sections": [
          {
            "id": "sec_10",
            "label": "Respondent profile",
            "eqId": "eq_1",
            "questions": [
              {
                "id": "q22",
                "text": "Which country do you represent?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q23",
                "text": "What is your role?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "NMCP staff",
                    "Principal Recipient",
                    "Sub-national manager",
                    "Technical partner",
                    "Other"
                  ]
                },
                "required": true
              },
              {
                "id": "q24",
                "text": "Is your country an HBHI country?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Yes",
                    "No"
                  ]
                },
                "required": true
              }
            ]
          },
          {
            "id": "sec_11",
            "label": "Theme A - Population denominators and systems (EQ6)",
            "eqId": "eq_6",
            "questions": [
              {
                "id": "q25",
                "text": "How robust are the population denominators used for sub-national coverage estimates?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q26",
                "text": "Which methods are used to estimate sub-national denominators and coverage?",
                "responseType": "text",
                "responseConfig": {},
                "required": false
              }
            ]
          },
          {
            "id": "sec_12",
            "label": "Theme D - Indicators and monitoring tools (EQ21)",
            "eqId": "eq_21",
            "questions": [
              {
                "id": "q27",
                "text": "How usable are the current malaria indicators for sub-national teams?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              },
              {
                "id": "q28",
                "text": "At what stage of the SNT process is your country?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Data compilation",
                    "Stratification",
                    "Intervention-mix and delivery",
                    "Financial optimisation",
                    "Full SNT cycle"
                  ]
                },
                "required": true
              }
            ]
          }
        ],
        "title": "Country Stakeholder Survey - SNT Process Status",
        "questions": [
          {
            "id": "q22",
            "text": "Which country do you represent?",
            "responseType": "text"
          },
          {
            "id": "q23",
            "text": "What is your role?",
            "responseType": "select_one"
          },
          {
            "id": "q24",
            "text": "Is your country an HBHI country?",
            "responseType": "select_one"
          },
          {
            "id": "q25",
            "text": "How robust are the population denominators used for sub-nati",
            "responseType": "likert"
          },
          {
            "id": "q26",
            "text": "Which methods are used to estimate sub-national denominators",
            "responseType": "text"
          },
          {
            "id": "q27",
            "text": "How usable are the current malaria indicators for sub-nation",
            "responseType": "likert"
          },
          {
            "id": "q28",
            "text": "At what stage of the SNT process is your country?",
            "responseType": "select_one"
          }
        ]
      },
      {
        "id": "inst_5",
        "name": "FGD Guide - Community & Facility Representatives",
        "type": "fgd",
        "method": "Focus group discussion",
        "targetSample": "18 FGDs across country insights",
        "sections": [
          {
            "id": "sec_13",
            "label": "Theme A - Vaccine coverage input and awareness (EQ3, EQ7)",
            "eqId": "eq_3",
            "questions": [
              {
                "id": "q29",
                "text": "How were malaria vaccine focus coverage areas identified in this community?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q30",
                "text": "How aware are community and facility representatives of tailored malaria approaches?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              }
            ]
          },
          {
            "id": "sec_14",
            "label": "Theme B - Contextual factors (EQ10)",
            "eqId": "eq_10",
            "questions": [
              {
                "id": "q31",
                "text": "Which local factors most affect malaria programming decisions here?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q32",
                "text": "How well do malaria services reflect the specific needs of this community?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              }
            ]
          }
        ],
        "title": "FGD Guide - Community & Facility Representatives",
        "questions": [
          {
            "id": "q29",
            "text": "How were malaria vaccine focus coverage areas identified in ",
            "responseType": "text"
          },
          {
            "id": "q30",
            "text": "How aware are community and facility representatives of tail",
            "responseType": "text"
          },
          {
            "id": "q31",
            "text": "Which local factors most affect malaria programming decision",
            "responseType": "text"
          },
          {
            "id": "q32",
            "text": "How well do malaria services reflect the specific needs of t",
            "responseType": "likert"
          }
        ]
      },
      {
        "id": "inst_6",
        "name": "Document & Portfolio Review Protocol",
        "type": "document_review",
        "method": "Structured document and portfolio review",
        "targetSample": "150+ documents, 11 HBHI portfolios",
        "sections": [
          {
            "id": "sec_15",
            "label": "Theme C - Funding Requests and stratification (EQ15, EQ17)",
            "eqId": "eq_15",
            "questions": [
              {
                "id": "q33",
                "text": "Do the interventions selected in the Funding Request align with the sub-national stratification?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Fully aligned",
                    "Mostly aligned",
                    "Partially aligned",
                    "Not aligned"
                  ]
                },
                "required": true
              },
              {
                "id": "q34",
                "text": "Was technical assistance for SNT compilation, stratification or modelling requested and provided?",
                "responseType": "select_one",
                "responseConfig": {
                  "options": [
                    "Requested and provided",
                    "Requested, not provided",
                    "Not requested"
                  ]
                },
                "required": true
              },
              {
                "id": "q35",
                "text": "Summarise the rationale for any deviation between stratification and chosen interventions.",
                "responseType": "text",
                "responseConfig": {},
                "required": false
              }
            ]
          },
          {
            "id": "sec_16",
            "label": "Theme D - Data repositories and monitoring (EQ19, EQ20)",
            "eqId": "eq_19",
            "questions": [
              {
                "id": "q36",
                "text": "Is a consolidated malaria data repository (MDR) in place, and what sources does it draw from?",
                "responseType": "text",
                "responseConfig": {},
                "required": true
              },
              {
                "id": "q37",
                "text": "Do PUDRs and district dashboards encourage sub-national data use and action?",
                "responseType": "likert",
                "responseConfig": {
                  "points": 5
                },
                "required": true
              }
            ]
          }
        ],
        "title": "Document & Portfolio Review Protocol",
        "questions": [
          {
            "id": "q33",
            "text": "Do the interventions selected in the Funding Request align w",
            "responseType": "select_one"
          },
          {
            "id": "q34",
            "text": "Was technical assistance for SNT compilation, stratification",
            "responseType": "select_one"
          },
          {
            "id": "q35",
            "text": "Summarise the rationale for any deviation between stratifica",
            "responseType": "text"
          },
          {
            "id": "q36",
            "text": "Is a consolidated malaria data repository (MDR) in place, an",
            "responseType": "text"
          },
          {
            "id": "q37",
            "text": "Do PUDRs and district dashboards encourage sub-national data",
            "responseType": "likert"
          }
        ]
      }
    ],
    "completed_at": "2025-03-29T10:00:00.000Z"
  },
  "analysis_plan": {
    "quantitative": [],
    "qualitative": [],
    "completed_at": "2025-04-01T10:00:00.000Z",
    "cards": [
      {
        "id": "af_1",
        "eqNumber": 1,
        "question": "How adequate are country sub-national systems for capturing and analysing malaria data?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Extent to which sub-national systems support SNT (case-study rating)",
            "code": "SNT-A1",
            "source": "Systems review",
            "indType": "qualitative"
          },
          {
            "name": "Number of critical data gaps per country",
            "code": "SNT-A2",
            "source": "Systems mapping",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Country insight systems reviews",
          "Sub-national KIIs",
          "DHIS2 and MDR documentation"
        ],
        "method": "Framework analysis of systems adequacy across country insights, triangulated with DHIS2 completeness data.",
        "steps": "1. Code KII and systems-review data against SNT data requirements. 2. Rate adequacy per country. 3. Cross-tabulate with DHIS2 metrics. 4. Assign strength-of-evidence.",
        "analysisType": "qualitative",
        "software": "NVivo; Excel",
        "threats": "Uneven country coverage; perception bias in KIIs.",
        "disaggregations": [
          "geography",
          "system_level"
        ],
        "notes": ""
      },
      {
        "id": "af_2",
        "eqNumber": 4,
        "question": "What is the quality of sub-national data and are quality-improvement processes in place?",
        "criterion": "effectiveness",
        "indicators": [
          {
            "name": "Sub-national data quality score",
            "code": "SNT-A6",
            "source": "Data quality assessment",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Register-to-report DQA",
          "LFA verification reports",
          "Sub-national M&E KIIs"
        ],
        "method": "Data quality assessment scored against completeness, timeliness and accuracy, triangulated with KII accounts of verification practice.",
        "steps": "1. Sample facilities and registers. 2. Verify report-to-register concordance. 3. Score quality dimensions. 4. Triangulate with KIIs.",
        "analysisType": "mixed",
        "software": "Excel; Stata",
        "threats": "Facility sampling constraints; recall bias in KIIs.",
        "disaggregations": [
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_3",
        "eqNumber": 9,
        "question": "How adequate are structures, mandates and coordination between national and sub-national levels?",
        "criterion": "coherence",
        "indicators": [
          {
            "name": "Sub-national decision-making autonomy (law and practice)",
            "code": "SNT-B3",
            "source": "Governance review",
            "indType": "qualitative"
          },
          {
            "name": "Adequacy of coordination structures",
            "code": "SNT-B4",
            "source": "Institutional review",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "Governance and decentralisation review",
          "National and sub-national KIIs"
        ],
        "method": "Institutional and governance analysis comparing autonomy in law and in practice across country insights.",
        "steps": "1. Map mandates and coordination structures. 2. Compare law vs practice. 3. Synthesise enabling and constraining factors.",
        "analysisType": "qualitative",
        "software": "NVivo",
        "threats": "Sensitivity of governance topics; access to sub-national informants.",
        "disaggregations": [
          "geography",
          "governance_level"
        ],
        "notes": ""
      },
      {
        "id": "af_4",
        "eqNumber": 13,
        "question": "To what extent are Global Fund malaria Funding Requests based on SNT?",
        "criterion": "relevance",
        "indicators": [
          {
            "name": "Share of FRs demonstrating an SNT basis",
            "code": "SNT-C1",
            "source": "Funding-request analysis",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Funding Request analysis (GC6, GC7)",
          "TRP review documents"
        ],
        "method": "Content analysis of Funding Requests scored for SNT basis, benchmarked GC6 vs GC7.",
        "steps": "1. Define SNT scoring rubric. 2. Score each FR. 3. Compare GC6 and GC7. 4. Triangulate with TRP observations.",
        "analysisType": "mixed",
        "software": "Excel; NVivo",
        "threats": "Variable FR documentation quality; scoring subjectivity.",
        "disaggregations": [
          "grant_cycle",
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_5",
        "eqNumber": 17,
        "question": "Was SNT-related resources and TA requested, provided and prioritised?",
        "criterion": "efficiency",
        "indicators": [
          {
            "name": "Share of SNT TA requests met",
            "code": "SNT-C5",
            "source": "Portfolio analysis",
            "indType": "quantitative"
          }
        ],
        "dataSources": [
          "Portfolio analysis",
          "TA records",
          "NMCP KIIs"
        ],
        "method": "Portfolio analysis of TA requests and provision across the 11 HBHI countries.",
        "steps": "1. Extract TA requests from portfolio. 2. Match to provision records. 3. Compute fulfilment rates. 4. Triangulate with KIIs.",
        "analysisType": "quantitative",
        "software": "Excel",
        "threats": "Incomplete TA records; attribution of pooled TA.",
        "disaggregations": [
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_6",
        "eqNumber": 21,
        "question": "Do current indicators incentivise SNT and financial optimisation and are they usable sub-nationally?",
        "criterion": "efficiency",
        "indicators": [
          {
            "name": "Suitability of indicator set for SNT",
            "code": "SNT-D4",
            "source": "Indicator review",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "Indicator framework review",
          "Sub-national team KIIs",
          "Country stakeholder survey"
        ],
        "method": "Indicator suitability review combined with survey descriptives on sub-national usability.",
        "steps": "1. Assess indicators against SNT and financial-optimisation needs. 2. Analyse survey usability items. 3. Synthesise.",
        "analysisType": "mixed",
        "software": "Excel",
        "threats": "Indicator interpretation differs by context.",
        "disaggregations": [
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_7",
        "eqNumber": 23,
        "question": "To what extent has sub-national evidence informed NMSPs and their costing?",
        "criterion": "sustainability",
        "indicators": [
          {
            "name": "Extent to which sub-national evidence and SNT shape NMSP content and costing",
            "code": "SNT-E2",
            "source": "Plan and costing review",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "NMSP and sub-national plan review",
          "Costing documents",
          "Planning KIIs"
        ],
        "method": "Document analysis of NMSPs and costing against SNT criteria, triangulated with planning KIIs.",
        "steps": "1. Review NMSP content and costing methods. 2. Assess use of sub-national evidence. 3. Triangulate with KIIs.",
        "analysisType": "qualitative",
        "software": "NVivo",
        "threats": "Plan vintage varies; costing detail uneven.",
        "disaggregations": [
          "geography"
        ],
        "notes": ""
      },
      {
        "id": "af_8",
        "eqNumber": 22,
        "question": "What is the role of partners and TA providers in facilitating SNT and how do they engage?",
        "criterion": "coherence",
        "indicators": [
          {
            "name": "Degree of partner alignment and engagement on SNT",
            "code": "SNT-E1",
            "source": "Institutional review + KII",
            "indType": "qualitative"
          }
        ],
        "dataSources": [
          "Partner mapping",
          "Global and country stakeholder KIIs"
        ],
        "method": "Partner mapping and coherence analysis against national structures and strategies.",
        "steps": "1. Map partners and TA providers. 2. Assess alignment and engagement. 3. Identify duplication and gaps.",
        "analysisType": "qualitative",
        "software": "Excel; NVivo",
        "threats": "Partner-landscape complexity.",
        "disaggregations": [
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
          "Purpose: provide the Global Fund Secretariat, Strategy Committee, Board and global health community an independent evaluation of data use and decision-making in sub-national tailoring (SNT) of malaria interventions.",
          "Two objectives: (1) assess capacity, quality of data and decision-making in SNT; (2) assess how the Global Fund and national stakeholders can incentivise sub-national data use and financial optimisation.",
          "Findings are organised around the five thematic areas and 26 evaluation questions; intended to inform GC8 Funding Requests."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_background",
        "sectionType": "introduction",
        "type": "standard",
        "title": "Background and context",
        "autoContent": [
          "Malaria transmission is increasingly localised in hard-to-reach sub-national areas; the GTS 2016-2030 targets a 90% reduction in incidence and mortality by 2030.",
          "The High Burden to High Impact (HBHI) approach covers 11 countries (Burkina Faso, Cameroon, DRC, Ghana, Mali, Mozambique, Niger, Nigeria, Uganda, Tanzania, India).",
          "SNT uses local data and contextual information to determine the appropriate mix of interventions and delivery strategies for optimum impact."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_methodology",
        "sectionType": "methodology",
        "type": "standard",
        "title": "Methodology, scope and timeline",
        "autoContent": [
          "Systems approach and mixed-methods design with triangulation across document review, quantitative and qualitative analysis, KIIs, process mapping and country insights.",
          "Country insights in 5-7 selected countries; stakeholder survey of the 28 highest-burden countries; portfolio analysis across the 11 HBHI countries and Funding Requests for GC6 and GC7.",
          "Strength of evidence assessed and documented per evaluation question; evaluation guided by ethical principles and gender sensitivity."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_a",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Theme A: Adequacy of country sub-national systems",
        "autoContent": [
          "Sub-national systems capture core burden and intervention data but community and private-sector data are inconsistently integrated.",
          "Data quality and analytical capacity are concentrated nationally, with weaker district-level verification and analysis.",
          "Population denominators and awareness of SNT vary widely across and within countries."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_b",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Theme B: Challenges in decision-making",
        "autoContent": [
          "Decision-making autonomy at sub-national level is often limited in practice even where devolved in law.",
          "Political-economy and governance factors are decisive; Global Fund investments contribute where they strengthen coordination and evidence use."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_c",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Theme C: Funding Requests and SNT",
        "autoContent": [
          "SNT is partially reflected in GC6 and GC7 Funding Requests; stratification does not always match selected interventions, partly due to resource constraints.",
          "Moving from input-based to impact-based programming is hindered by data and capacity gaps; TA for SNT is unevenly requested and provided."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_d",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Theme D: The Global Fund and high-quality data in SNT",
        "autoContent": [
          "Global Fund support to data generation and MDRs is present but fragmented; monitoring tools remain compliance-oriented rather than action-oriented.",
          "Current indicators only partially incentivise SNT and financial optimisation and are not always usable at sub-national granularity."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_findings_e",
        "sectionType": "finding",
        "type": "finding",
        "title": "Findings - Theme E: Role of country stakeholders",
        "autoContent": [
          "Partners and TA providers facilitate SNT but engagement is fragmented; reference groups vary in activity and guidance.",
          "Sub-national evidence is inconsistently reflected in NMSPs and their costing; malaria and climate structures remain largely siloed."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_conclusions",
        "sectionType": "conclusions",
        "type": "standard",
        "title": "Insights and implications",
        "autoContent": [
          "SNT is a continuous process; the binding constraints are sub-national data quality, analytical capacity and decision-making autonomy rather than the availability of guidance.",
          "The Global Fund can most add value by strengthening sub-national data use, aligning indicators and monitoring tools to SNT, and incentivising SNT in Funding Requests."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_recommendations",
        "sectionType": "recommendations",
        "type": "standard",
        "title": "Recommendations for GC8",
        "autoContent": [
          "Strengthen sub-national data quality, analytical capacity and MDRs, and support routine sub-national data use over LFA-only verification.",
          "Align indicators, monitoring tools and Funding Request processes to incentivise SNT and financial optimisation.",
          "Expand and prioritise SNT-focused technical assistance and local capacity-building ahead of GC8."
        ],
        "draftContent": ""
      },
      {
        "id": "sec_annexes",
        "sectionType": "standard",
        "type": "standard",
        "title": "Annexes",
        "autoContent": [
          "Annex A: Evaluation matrix (26 questions) and strength-of-evidence framework.",
          "Annex B: Country insight summaries and process maps.",
          "Annex C: Bibliography and portfolio-analysis tables."
        ],
        "draftContent": ""
      }
    ],
    "completed_at": "2025-04-03T10:00:00.000Z"
  },
  "presentation": {
    "slides": [
      {
        "title": "Title Slide",
        "included": true,
        "talkingPoints": "Independent evaluation of Capacity, Quality and Decision-making in Sub-national Tailoring of Malaria Interventions. Commissioned by the Global Fund Evaluation and Learning Office (ELO) and overseen by the Independent Evaluation Panel (IEP).",
        "order": 0
      },
      {
        "title": "Programme Overview",
        "included": true,
        "talkingPoints": "Sub-national tailoring (SNT) uses local data and contextual information to determine the appropriate mix of malaria interventions and delivery strategies. Focus on the 11 HBHI countries and the GC8 Funding Request cycle.",
        "order": 1
      },
      {
        "title": "Evaluation Purpose & Scope",
        "included": true,
        "talkingPoints": "Provide the Secretariat, Strategy Committee, Board and global health community an independent evaluation of data use and decision-making in SNT. Two objectives; 26 evaluation questions across five themes; may serve as a baseline for future evaluations.",
        "order": 2
      },
      {
        "title": "Theory of Change Summary",
        "included": true,
        "talkingPoints": "Data compilation and analysis, stratification of burden and risk, and intervention-mix and financial modelling lead to data-driven sub-national decisions, optimised intervention mix and financial optimisation, and ultimately progress toward GTS incidence and mortality targets.",
        "order": 3
      },
      {
        "title": "Evaluation Questions",
        "included": true,
        "talkingPoints": "26 questions across Theme A (sub-national systems), Theme B (decision-making), Theme C (Funding Requests), Theme D (Global Fund and high-quality data) and Theme E (country stakeholders). Strength of evidence rated per question.",
        "order": 4
      },
      {
        "title": "Methodology",
        "included": true,
        "talkingPoints": "Systems approach, mixed-methods and triangulation: document review, quantitative and qualitative analysis, KIIs, process mapping, portfolio analysis of 11 HBHI countries and Funding Requests for GC6 and GC7.",
        "order": 5
      },
      {
        "title": "Sampling Strategy",
        "included": true,
        "talkingPoints": "Purposive: 5-7 country insights selected on burden, HBHI status, risk profile and SNT spectrum; stakeholder survey of the 28 highest-burden countries; approximately 90 KIIs and 18 FGDs across country insights.",
        "order": 6
      },
      {
        "title": "Data Collection",
        "included": true,
        "talkingPoints": "Global, national and sub-national KIIs; country stakeholder survey; community and facility FGDs; structured document and portfolio review. Informant confidentiality preserved; evaluation is gender sensitive and ethically guided.",
        "order": 7
      },
      {
        "title": "Analysis Approach",
        "included": true,
        "talkingPoints": "Per-question analysis with agreed judgement criteria and strength-of-evidence rating. Contribution analysis and process tracing supported by comparative case analysis across country insights and portfolio data.",
        "order": 8
      },
      {
        "title": "Evaluability Assessment",
        "included": true,
        "talkingPoints": "Baseline evaluability moderate: strongest for systems and Funding Request analysis; constrained by sub-national data quality, weak district analytical capacity and the absence of a counterfactual.",
        "order": 9
      }
    ],
    "completed_at": "2025-04-03T10:00:00.000Z"
  },
  "planning": {
    "contract": {
      "reference": "GF-ELO-SNT-2024",
      "commissioner": "The Global Fund, Evaluation and Learning Office (ELO)",
      "evaluator": "Independent evaluation consortium",
      "currency": "USD",
      "start_date": "2024-04-01",
      "end_date": "2026-08-31",
      "total_budget": 387405
    },
    "budget_lines": [
      {
        "id": "bl_1",
        "category": "Personnel",
        "role": "Team Leader",
        "description": "",
        "unit": "days",
        "quantity": 70,
        "rate": 750,
        "amount": 52500
      },
      {
        "id": "bl_2",
        "category": "Personnel",
        "role": "Senior Evaluator - malaria and SNT",
        "description": "",
        "unit": "days",
        "quantity": 60,
        "rate": 600,
        "amount": 36000
      },
      {
        "id": "bl_3",
        "category": "Personnel",
        "role": "Senior Evaluator - health systems and data",
        "description": "",
        "unit": "days",
        "quantity": 60,
        "rate": 600,
        "amount": 36000
      },
      {
        "id": "bl_4",
        "category": "Personnel",
        "role": "Evaluator - political economy",
        "description": "",
        "unit": "days",
        "quantity": 55,
        "rate": 550,
        "amount": 30250
      },
      {
        "id": "bl_5",
        "category": "Personnel",
        "role": "QA and peer reviewer",
        "description": "",
        "unit": "days",
        "quantity": 12,
        "rate": 800,
        "amount": 9600
      },
      {
        "id": "bl_6",
        "category": "Personnel",
        "role": "Research analysts (two)",
        "description": "",
        "unit": "days",
        "quantity": 90,
        "rate": 300,
        "amount": 27000
      },
      {
        "id": "bl_7",
        "category": "Data collection",
        "role": "Country insight fieldwork",
        "description": "",
        "unit": "countries",
        "quantity": 6,
        "rate": 6000,
        "amount": 36000
      },
      {
        "id": "bl_8",
        "category": "Data collection",
        "role": "Transcription",
        "description": "",
        "unit": "interviews",
        "quantity": 90,
        "rate": 40,
        "amount": 3600
      },
      {
        "id": "bl_9",
        "category": "Data collection",
        "role": "Translation, English and French",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 12000,
        "amount": 12000
      },
      {
        "id": "bl_10",
        "category": "Data collection",
        "role": "28-country survey platform",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 3000,
        "amount": 3000
      },
      {
        "id": "bl_11",
        "category": "Travel and DSA",
        "role": "International airfare",
        "description": "",
        "unit": "trips",
        "quantity": 8,
        "rate": 2200,
        "amount": 17600
      },
      {
        "id": "bl_12",
        "category": "Travel and DSA",
        "role": "In-country transport",
        "description": "",
        "unit": "trips",
        "quantity": 6,
        "rate": 2500,
        "amount": 15000
      },
      {
        "id": "bl_13",
        "category": "Travel and DSA",
        "role": "DSA and per diem",
        "description": "",
        "unit": "nights",
        "quantity": 120,
        "rate": 200,
        "amount": 24000
      },
      {
        "id": "bl_14",
        "category": "Dissemination",
        "role": "Recommendations and learning workshops",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 15000,
        "amount": 15000
      },
      {
        "id": "bl_15",
        "category": "Dissemination",
        "role": "Editing, design, brief and deck",
        "description": "",
        "unit": "lump sum",
        "quantity": 1,
        "rate": 8000,
        "amount": 8000
      },
      {
        "id": "bl_16",
        "category": "Management and overhead",
        "role": "Management fee (12% of direct cost)",
        "description": "",
        "unit": "",
        "quantity": null,
        "rate": null,
        "amount": 39066
      },
      {
        "id": "bl_17",
        "category": "Contingency",
        "role": "Contingency (7% of direct cost)",
        "description": "",
        "unit": "",
        "quantity": null,
        "rate": null,
        "amount": 22789
      }
    ],
    "deliverables": [
      {
        "id": "del_1",
        "code": "D1",
        "title": "High-Level Workplan",
        "description": "Proposed workplan and timeline, submitted within 10 working days of contract.",
        "due_date": "2024-04-15",
        "station_ids": [
          0
        ],
        "payment_percent": 10,
        "status": "accepted",
        "submitted_at": "2024-04-11T10:00:00.000Z",
        "accepted_at": "2024-04-18T10:00:00.000Z",
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
            "principles": 3
          },
          "comment": "Clear and well structured. Timeline is realistic against the country-insight schedule.",
          "rated_at": "2024-07-05T10:00:00.000Z"
        },
        "type": "Milestone",
        "reviewers": "ELO",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_2",
        "code": "D2",
        "title": "Inception Report",
        "description": "Context and questions, evaluation framework, methodology, data collection tools and analysis plan. No more than 20 pages.",
        "due_date": "2024-06-28",
        "station_ids": [
          0,
          1,
          2,
          3,
          4
        ],
        "payment_percent": 20,
        "status": "accepted",
        "submitted_at": "2024-06-25T10:00:00.000Z",
        "accepted_at": "2024-07-02T10:00:00.000Z",
        "notes": "",
        "rating": {
          "scores": {
            "purpose": 4,
            "methodology": 4,
            "evidence": 3,
            "findings": 3,
            "conclusions": 4,
            "recommendations": 3,
            "communication": 4,
            "principles": 3
          },
          "comment": "Strong evaluation matrix and country-insight criteria. Strengthen the strength-of-evidence approach before fieldwork.",
          "rated_at": "2024-07-05T10:00:00.000Z"
        },
        "type": "Design gate",
        "reviewers": "ELO, IEP",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_3",
        "code": "D3",
        "title": "Data Collection Tools",
        "description": "KII guides, country stakeholder survey, FGD guides and document and portfolio review protocol.",
        "due_date": "2024-06-28",
        "station_ids": [
          5
        ],
        "payment_percent": 0,
        "status": "accepted",
        "submitted_at": "2024-06-25T10:00:00.000Z",
        "accepted_at": "2024-07-02T10:00:00.000Z",
        "notes": "",
        "rating": null,
        "type": "Milestone",
        "reviewers": "ELO",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_4",
        "code": "D4",
        "title": "Preliminary Findings",
        "description": "Progress and preliminary findings, presented at the IEP meeting in early September.",
        "due_date": "2024-08-30",
        "station_ids": [
          6
        ],
        "payment_percent": 0,
        "status": "accepted",
        "submitted_at": "2024-08-29T10:00:00.000Z",
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Draft",
        "reviewers": "ELO, IEP focal points",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_5",
        "code": "D5",
        "title": "First Draft Report",
        "description": "First draft evaluation report for review by ELO, IEP focal points and Secretariat teams.",
        "due_date": "2024-09-30",
        "station_ids": [
          6,
          7
        ],
        "payment_percent": 30,
        "status": "accepted",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Draft",
        "reviewers": "IEP",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_6",
        "code": "D6",
        "title": "Second Draft Report",
        "description": "Second draft incorporating review comments, ahead of the recommendations workshop.",
        "due_date": "2024-11-15",
        "station_ids": [
          7
        ],
        "payment_percent": 0,
        "status": "accepted",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Draft",
        "reviewers": "IEP",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_7",
        "code": "D7",
        "title": "Final Evaluation Report",
        "description": "Concise final report, 40 to 50 pages including the executive summary, with annexes.",
        "due_date": "2025-01-15",
        "station_ids": [
          7
        ],
        "payment_percent": 30,
        "status": "accepted",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Final report",
        "reviewers": "IEP, Secretariat",
        "reviewer_email": "",
        "alert": {
          "lead_days": 14,
          "emails": []
        }
      },
      {
        "id": "del_8",
        "code": "D8",
        "title": "Learning Products and Summative Deck",
        "description": "Summative slide deck, evaluation brief, learning briefs and storyboard.",
        "due_date": "2026-06-13",
        "station_ids": [
          8
        ],
        "payment_percent": 10,
        "status": "in_progress",
        "submitted_at": null,
        "accepted_at": null,
        "notes": "",
        "rating": null,
        "type": "Governance",
        "reviewers": "ELO",
        "reviewer_email": "k.asante@example.org",
        "alert": {
          "lead_days": 14,
          "emails": [
            "k.asante@example.org"
          ]
        }
      }
    ],
    "invoices": [
      {
        "id": "inv_1",
        "number": "INV-2024-001",
        "deliverable_id": "del_1",
        "amount": 38740,
        "currency": "USD",
        "issued_date": "2024-04-18",
        "status": "paid",
        "paid_date": "2024-04-30"
      },
      {
        "id": "inv_2",
        "number": "INV-2024-002",
        "deliverable_id": "del_2",
        "amount": 77481,
        "currency": "USD",
        "issued_date": "2024-07-03",
        "status": "approved",
        "paid_date": null
      },
      {
        "id": "inv_3",
        "number": "INV-2024-003",
        "deliverable_id": "del_5",
        "amount": 116222,
        "currency": "USD",
        "issued_date": "2024-10-02",
        "status": "submitted",
        "paid_date": null
      }
    ],
    "completed_at": "2024-07-05T10:00:00.000Z"
  },
  "commissioner": {
    "governance": {
      "funder_profile": "global_fund",
      "oversight_body": "Independent Evaluation Panel (IEP)",
      "evaluation_manager": "ELO Evaluation Manager",
      "decision_clock": "Grant Cycle 8 (GC8) funding requests",
      "lifecycle_stage": "track",
      "purpose": "Give the Global Fund Board, Strategy Committee and Secretariat an independent evaluation of data use and decision-making in sub-national tailoring (SNT) for optimal malaria programming, to inform tailored, locally appropriate approaches and related investment and grant design.",
      "primary_use": "Shape GC8 malaria funding-request design, and Secretariat processes and indicators, so investments better incentivise SNT and financial optimisation."
    },
    "users": [
      {
        "id": "usr_board",
        "name": "Global Fund Board",
        "role": "Governance and strategic accountability",
        "tier": "primary",
        "intended_use": "Endorse the strategic direction on SNT and evidence-based malaria investment, and hold the Secretariat to account for acting on the findings.",
        "decision_window": "Board decisions on the malaria portfolio",
        "influence": "high",
        "interest": "medium",
        "eq_refs": [
          "eq_13",
          "eq_18",
          "eq_21"
        ]
      },
      {
        "id": "usr_sc",
        "name": "Strategy Committee (SC)",
        "role": "Oversight of the evaluation function via the IEP",
        "tier": "primary",
        "intended_use": "Steer strategic priorities on SNT and financial optimisation, and oversee that the evaluation is used.",
        "decision_window": "Strategy Committee cycle",
        "influence": "high",
        "interest": "high",
        "eq_refs": [
          "eq_8",
          "eq_13",
          "eq_16",
          "eq_26"
        ]
      },
      {
        "id": "usr_sec",
        "name": "Secretariat, Global Fund Malaria Team",
        "role": "Programme, process and grant design",
        "tier": "primary",
        "intended_use": "Improve grant design, processes and indicators to incentivise SNT and financial optimisation ahead of GC8.",
        "decision_window": "GC8 process and applicant guidance design",
        "influence": "high",
        "interest": "high",
        "eq_refs": [
          "eq_16",
          "eq_18",
          "eq_19",
          "eq_20",
          "eq_21",
          "eq_26"
        ]
      },
      {
        "id": "usr_nmcp",
        "name": "NMCPs and Principal Recipients",
        "role": "Implementers and applicants",
        "tier": "secondary",
        "intended_use": "Strengthen sub-national data generation and use, and reflect SNT and stratification in their funding requests.",
        "decision_window": "GC8 funding requests",
        "influence": "medium",
        "interest": "high",
        "eq_refs": [
          "eq_1",
          "eq_4",
          "eq_5",
          "eq_13",
          "eq_15",
          "eq_23"
        ]
      },
      {
        "id": "usr_ta",
        "name": "Technical partners and TA providers",
        "role": "Technical assistance (WHO, RBM)",
        "tier": "secondary",
        "intended_use": "Align technical assistance to SNT and allocative-efficiency modelling, and inform the WHO SNT guidance under development.",
        "decision_window": "TA planning for GC8",
        "influence": "medium",
        "interest": "medium",
        "eq_refs": [
          "eq_17",
          "eq_22",
          "eq_26"
        ]
      },
      {
        "id": "usr_sub",
        "name": "CCMs and sub-national teams",
        "role": "Sub-national decision-makers",
        "tier": "secondary",
        "intended_use": "Use disaggregated analysis for epidemiological stratification and intervention-mix decisions in their districts.",
        "decision_window": "NMSP and sub-national planning",
        "influence": "low",
        "interest": "high",
        "eq_refs": [
          "eq_7",
          "eq_9",
          "eq_12",
          "eq_23"
        ]
      },
      {
        "id": "usr_donor",
        "name": "Donors and the global malaria community",
        "role": "Co-financiers",
        "tier": "secondary",
        "intended_use": "Inform the malaria funding landscape and complementary investment in SNT and data systems.",
        "decision_window": "Replenishment and co-financing",
        "influence": "medium",
        "interest": "low",
        "eq_refs": [
          "eq_13",
          "eq_18"
        ]
      }
    ],
    "gate": {
      "decision": "conditions",
      "decided_by": "ELO, Secretariat Teams, External Reference Group and IEP",
      "decided_at": "2024-06-28T10:00:00.000Z",
      "note": "Inception report (max 20 pages) reviewed by the ELO, Secretariat Teams, the External Reference Group and the IEP before country-insight fieldwork. Evaluation framework, data-collection tools and country selection (5-7 of the 11 HBHI countries) confirmed.",
      "conditions": [
        {
          "id": "cond_gf_1",
          "text": "Supplier to document how strength of evidence will be assessed and recorded (required in both the bidder and inception requirements).",
          "resolved": true
        },
        {
          "id": "cond_gf_2",
          "text": "Finalise the criteria and shortlist for the 5-7 country insight studies with the ELO before data collection.",
          "resolved": false
        }
      ],
      "independence": {
        "attested": true,
        "statement": "The Independent Evaluation Panel confirms that this evaluation was conducted at arm's length from Global Fund management and the Secretariat, and that panel members and the appointed evaluation team declared no financial or programmatic interest in the malaria investments under review.",
        "conflicts": [
          "One IEP member previously advised a national malaria programme in a shortlisted country insight and recused from that country's review and conclusions."
        ],
        "attested_by": "IEP Chair",
        "attested_at": "2024-06-25"
      },
      "ethics": {
        "status": "cleared",
        "body": "Evaluation supplier institutional review board (IRB)",
        "note": "Adult key informants only; informed consent, anonymisation of informants and confidential handling of KII data applied, consistent with the UNEG Ethical Guidelines for Evaluation (2020), national IRB approval and Global Fund data-protection requirements.",
        "cleared_at": "2024-06-25"
      }
    },
    "appraisal": {
      "profile": "global_fund",
      "evidence": [
        {
          "eq_id": "eq_1",
          "rating": 4,
          "justification": "Answerable from the HBHI portfolio review and country document set; sub-national systems are well documented and the judgement criteria are clear."
        },
        {
          "eq_id": "eq_2",
          "rating": 4,
          "justification": "Country insight studies and routine HMIS give a direct method and source; adequacy criteria are defined in the matrix."
        },
        {
          "eq_id": "eq_3",
          "rating": 3,
          "justification": "Answerable via document review and key-informant interviews; a few countries lack a recent sub-national assessment, a coverage gap to close at inception."
        },
        {
          "eq_id": "eq_4",
          "rating": 2,
          "justification": "Method is sound but sub-national data quality is uneven across countries; a documented completeness and verification check is needed before this can be answered reliably."
        },
        {
          "eq_id": "eq_5",
          "rating": 4,
          "justification": "Contribution analysis with a specified causal claim and triangulated sources; judgement criteria are set."
        },
        {
          "eq_id": "eq_6",
          "rating": 3,
          "justification": "Answerable through contribution analysis; the rival-explanation protocol should be made explicit before fieldwork."
        },
        {
          "eq_id": "eq_7",
          "rating": 4,
          "justification": "Direct documentary and interview method with identified sources and clear criteria."
        },
        {
          "eq_id": "eq_8",
          "rating": 2,
          "justification": "Attribution of decision changes to Global Fund investment is not cleanly separable under the current design; add a process-tracing step and named informants before fieldwork."
        },
        {
          "eq_id": "eq_9",
          "rating": 4,
          "justification": "Answerable from grant documentation and PUDRs; method and criteria are defined."
        },
        {
          "eq_id": "eq_10",
          "rating": 4,
          "justification": "Interviews with named stakeholder groups plus document review; criteria are specified."
        },
        {
          "eq_id": "eq_11",
          "rating": 3,
          "justification": "Method is adequate; the sampling frame for sub-national informants needs finalising to ensure coverage."
        },
        {
          "eq_id": "eq_12",
          "rating": 4,
          "justification": "Answerable from the SNT guidance and the funding-request review against clear criteria."
        },
        {
          "eq_id": "eq_13",
          "rating": 4,
          "justification": "Funding-request review against SNT criteria is a direct method with a complete source (GC6 and GC7 requests) and explicit criteria."
        },
        {
          "eq_id": "eq_14",
          "rating": 3,
          "justification": "Answerable via document review and interviews; some process detail depends on access to Secretariat records, to confirm at inception."
        },
        {
          "eq_id": "eq_15",
          "rating": 4,
          "justification": "Method and source are defined and the criteria are clear."
        },
        {
          "eq_id": "eq_16",
          "rating": 3,
          "justification": "A how and why process question; answerable through interviews and process mapping, but the informant set spanning Secretariat and country teams must be secured to avoid a one-sided view."
        },
        {
          "eq_id": "eq_17",
          "rating": 4,
          "justification": "Answerable from documented processes and interviews; criteria are set."
        },
        {
          "eq_id": "eq_18",
          "rating": 3,
          "justification": "Method is sound; the judgement standard for better incentivised requests needs sharpening at inception."
        },
        {
          "eq_id": "eq_19",
          "rating": 4,
          "justification": "Direct document and data method with an available source and clear criteria."
        },
        {
          "eq_id": "eq_20",
          "rating": 4,
          "justification": "PUDR and DHIS dashboards provide a strong, available source with a defined analytic method and clear criteria."
        },
        {
          "eq_id": "eq_21",
          "rating": 4,
          "justification": "Answerable from routine data and country insights against defined criteria."
        },
        {
          "eq_id": "eq_22",
          "rating": 3,
          "justification": "Method is adequate; disaggregation to sub-national units depends on data availability, to confirm at inception."
        },
        {
          "eq_id": "eq_23",
          "rating": 4,
          "justification": "Document and interview method with an identified source and clear criteria."
        },
        {
          "eq_id": "eq_24",
          "rating": 4,
          "justification": "Answerable from the portfolio review against set criteria."
        },
        {
          "eq_id": "eq_25",
          "rating": 3,
          "justification": "Answerable through interviews and document review; the equity dimension needs a defined judgement standard."
        },
        {
          "eq_id": "eq_26",
          "rating": 3,
          "justification": "TA-focus question answerable via document review and interviews; the source on delivered technical assistance is partial and should be completed before analysis."
        }
      ]
    },
    "report_review": {
      "accepted": true,
      "accepted_by": "Independent Evaluation Panel (IEP)",
      "accepted_at": "2025-02-15",
      "evidence": [
        {
          "eq_id": "eq_1",
          "strength": 3,
          "note": "Sub-national systems adequacy evidenced across the HBHI portfolio analysis and country insights."
        },
        {
          "eq_id": "eq_4",
          "strength": 2,
          "note": "Data quality at sub-national level is uneven; verification varies by country."
        },
        {
          "eq_id": "eq_8",
          "strength": 2,
          "note": "Decision-making challenges documented but attribution to Global Fund investment is limited."
        },
        {
          "eq_id": "eq_13",
          "strength": 3,
          "note": "Extent to which funding requests are based on SNT well evidenced from GC6/GC7 analysis."
        },
        {
          "eq_id": "eq_16",
          "strength": 2,
          "note": "How GF processes can better incentivise SNT-based requests: promising but not yet triangulated."
        },
        {
          "eq_id": "eq_20",
          "strength": 3,
          "note": "PUDR and DHIS dashboard evidence is solid from the portfolio analysis."
        },
        {
          "eq_id": "eq_26",
          "strength": 2,
          "note": "TA focus on SNT is partial; scope for GC8 expansion identified."
        }
      ]
    },
    "management_response": [
      {
        "id": "rec_gf_1",
        "code": "R1",
        "recommendation": "Strengthen sub-national data compilation and analytical capacity ahead of GC8 funding requests.",
        "disposition": "agree",
        "owner": "Global Fund Malaria Team",
        "secondary_owner": "National Malaria Control Programmes",
        "due_date": "2025-03-31",
        "status": "done",
        "actions": "Reflected in GC8 applicant guidance and the SNT technical brief.",
        "evidence_note": "GC8 guidance published Q1 2025.",
        "next_review": null,
        "implementation_status": "implemented",
        "progress": 100,
        "review_interval_months": 12,
        "review_history": [
          {
            "id": "rev_mr8wd244i5b9b6v4dii",
            "review_date": "2025-06-30",
            "status": "implemented",
            "note": "GC8 applicant guidance and the SNT technical brief confirmed as published and disseminated; recommendation verified as fully implemented and closed.",
            "evidence_label": "GC8 applicant guidance (Q1 2025)",
            "evidence_url": ""
          }
        ],
        "owner_email": "k.asante@example.org"
      },
      {
        "id": "rec_gf_2",
        "code": "R2",
        "recommendation": "Adjust Global Fund processes and indicators to incentivise SNT and financial optimisation in funding requests.",
        "disposition": "agree",
        "owner": "MECA / SIID",
        "secondary_owner": "Country Teams",
        "due_date": "2026-09-30",
        "status": "in_progress",
        "actions": "Indicator review underway with the modular framework team.",
        "evidence_note": "",
        "next_review": "2026-07-31",
        "implementation_status": "in_progress",
        "progress": 60,
        "review_interval_months": 6,
        "review_history": [
          {
            "id": "rev_mr8wd244oickyckg3ie",
            "review_date": "2026-01-30",
            "status": "in_progress",
            "note": "Modular-framework indicator review reached draft stage; SNT and financial-optimisation metrics circulated to Country Teams for comment.",
            "evidence_label": "Draft indicator review (Jan 2026)",
            "evidence_url": ""
          }
        ],
        "owner_email": "p.dubois@example.org"
      },
      {
        "id": "rec_gf_3",
        "code": "R3",
        "recommendation": "Expand technical-assistance scope to cover SNT and allocative-efficiency modelling.",
        "disposition": "partial",
        "owner": "Global Fund Malaria Team",
        "secondary_owner": "TA providers",
        "due_date": "2026-12-31",
        "status": "planned",
        "actions": "Feasible within the existing TA envelope for priority countries only.",
        "evidence_note": "",
        "next_review": "2026-06-12",
        "implementation_status": "in_progress",
        "progress": 35,
        "review_interval_months": 3,
        "review_history": [
          {
            "id": "rev_mr8wd2449hvhm2cmud",
            "review_date": "2026-03-12",
            "status": "in_progress",
            "note": "TA scope confirmed feasible for priority countries only; full-portfolio expansion deferred pending the next TA budget envelope.",
            "evidence_label": "TA planning note (Q1 2026)",
            "evidence_url": ""
          }
        ],
        "owner_email": "s.okonkwo@example.org"
      },
      {
        "id": "rec_gf_4",
        "code": "R4",
        "recommendation": "Support countries to consolidate and maintain malaria data repositories (MDRs) linked to DHIS2.",
        "disposition": "agree",
        "owner": "Global Fund Malaria Team",
        "secondary_owner": "WHO / TA providers",
        "due_date": "2027-03-31",
        "status": "planned",
        "actions": "",
        "evidence_note": "",
        "next_review": "2027-01-31",
        "implementation_status": "in_progress",
        "progress": 20,
        "review_interval_months": 12,
        "review_history": [
          {
            "id": "rev_mr8wd244q0ak2modjr",
            "review_date": "2026-01-31",
            "status": "in_progress",
            "note": "MDR consolidation design begun with DHIS2 linkage requirements scoped; rollout sequenced after the sub-national data-quality prerequisites in R1.",
            "evidence_label": "MDR concept note (Q4 2025)",
            "evidence_url": ""
          }
        ],
        "owner_email": "m.diallo@example.org"
      }
    ],
    "dissemination": [
      {
        "id": "dis_deck",
        "product": "Summative slide deck on final findings",
        "format": "Slide deck",
        "audience": "IEP and Secretariat",
        "due_date": "2025-02-15",
        "status": "delivered",
        "note": ""
      },
      {
        "id": "dis_brief",
        "product": "Evaluation brief (findings, recommendations, management response, IEP commentary)",
        "format": "ELO standard brief",
        "audience": "Board and Strategy Committee",
        "due_date": "2025-02-28",
        "status": "delivered",
        "note": ""
      },
      {
        "id": "dis_story",
        "product": "Storyboard for e-learning / multimedia",
        "format": "Storyboard",
        "audience": "Country stakeholders and applicants",
        "due_date": "2025-03-15",
        "status": "in_progress",
        "note": ""
      },
      {
        "id": "dis_learn",
        "product": "Learning brief on confirmed learning topics",
        "format": "Learning brief",
        "audience": "User Group and country teams",
        "due_date": "2025-03-31",
        "status": "planned",
        "note": "Topics to be confirmed with the User Group."
      },
      {
        "id": "dis_ws",
        "product": "Learning and engagement workshop",
        "format": "Workshop",
        "audience": "Secretariat and technical partners",
        "due_date": "2025-03-20",
        "status": "planned",
        "note": ""
      }
    ],
    "risks": [
      {
        "id": "rsk_country",
        "risk": "Delays scheduling and accessing the 5-7 country insight studies.",
        "category": "Delivery",
        "likelihood": "medium",
        "impact": "high",
        "mitigation": "Shortlist countries early with the ELO; report slippage to the Evaluation Manager as it emerges.",
        "owner": "Supplier / ELO",
        "status": "mitigating"
      },
      {
        "id": "rsk_data",
        "risk": "Sub-national data quality and availability limit the portfolio and country analysis.",
        "category": "Data",
        "likelihood": "high",
        "impact": "high",
        "mitigation": "Triangulate DHIS2, MDR and KII evidence; flag data gaps explicitly rather than over-claim.",
        "owner": "Supplier",
        "status": "open"
      },
      {
        "id": "rsk_attr",
        "risk": "Attribution to Global Fund investment cannot be established; only contribution.",
        "category": "Method",
        "likelihood": "medium",
        "impact": "medium",
        "mitigation": "Frame as contribution analysis and state the limits transparently, as the ToR requires.",
        "owner": "Team Leader",
        "status": "mitigating"
      },
      {
        "id": "rsk_access",
        "risk": "Access to, and candour of, sub-national key informants.",
        "category": "Access",
        "likelihood": "medium",
        "impact": "medium",
        "mitigation": "Anonymity assurances and confidentiality of KIIs, consistent with the UNEG Ethical Guidelines for Evaluation (2020).",
        "owner": "Supplier",
        "status": "closed"
      }
    ],
    "completed_at": "2024-08-30T10:00:00.000Z"
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
