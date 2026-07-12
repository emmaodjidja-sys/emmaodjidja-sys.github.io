/**
 * demo-report-gf.js - the Global Fund SNT worked example's OWN draft final
 * report, provided so the First Review screen can be demonstrated end to end:
 * the reviewer loads it into the pre-scan box, scans, and watches the screen
 * catch what is wrong with it.
 *
 * This text is a FIXTURE, not a model report. Its flaws are deliberate and they
 * are properties of the text, not statements about it:
 *   - no limitations are disclosed anywhere (the headline red flag);
 *   - the achieved sample fell short of plan (71 of approximately 90 KIIs, 4 of
 *     6 country insights) and the shortfall is reported flatly, with nothing
 *     said about what it does to the findings;
 *   - two real evaluation questions are never answered (EQ2, on community and
 *     private-sector data integration, and EQ24, on climate and environmental
 *     management engagement);
 *   - the recommendations are generic and addressed to nobody;
 *   - consent gets one passing mention, in an annex line.
 * The methodology IS described and the executive summary DOES stand alone: a
 * report that fails everything is a boring demo.
 *
 * Registered by the demo's EXACT programme_name, which is the only key
 * FirstReview will look it up by, so it can never surface on a real evaluation.
 * ASCII only. No em dashes, no en dashes.
 */
(function() {
  'use strict';
  window.PRAXIS_DEMO_REPORTS = window.PRAXIS_DEMO_REPORTS || {};

  window.PRAXIS_DEMO_REPORTS['Global Fund Evaluation: Sub-national Tailoring of Malaria Interventions'] = [
    'EVALUATION OF CAPACITY, QUALITY AND DECISION-MAKING IN SUB-NATIONAL TAILORING OF MALARIA INTERVENTIONS',
    'Draft final report, submitted to the Evaluation and Learning Office (ELO), The Global Fund',
    'Version 1.0, for comment',
    '',
    'Executive summary',
    '',
    'This evaluation asks whether the systems, the data and the decision processes that underpin sub-national tailoring (SNT) of malaria interventions are adequate to the demands now placed on them, and what should change in Grant Cycle 8 (GC8). It covers the 11 High Burden to High Impact (HBHI) countries, with in-depth country insights and a survey of the 28 highest-burden countries.',
    '',
    'Sub-national tailoring has moved in four years from a technical aspiration to an expected feature of a malaria Funding Request. Every country reviewed has produced a sub-national stratification of burden and risk. The Global Fund was decisive in that shift: it asked for stratification in the Funding Request, and it paid for the analytical work that produced it. But the analytical layer has run ahead of the system beneath it, and the districts where tailoring must happen supply the data, do not analyse it, and are told the result rather than consulted on it.',
    '',
    'Funding Requests in GC7 are visibly more SNT-based than those in GC6, and the depth is uneven. In roughly half of them the stratification presented is not the stratification that drives the intervention mix that follows it, and the divergence is not explained. The reason, given consistently in interview, was money. On data, the Global Fund is a strong buyer of quality assurance and a weak buyer of use. The binding issue for GC8 is therefore not whether countries can stratify. It is whether the tailored mix survives contact with the allocation, and whether districts have any part in deciding what survives.',
    '',
    'Background and context',
    '',
    'Malaria transmission is increasingly heterogeneous within countries: national averages conceal districts whose incidence differs by an order of magnitude, so a uniform intervention mix wastes money in low-transmission areas and under-serves high-transmission ones. Sub-national tailoring is the response, using local burden, intervention and contextual data to determine the mix of interventions appropriate to each area and to optimise a finite envelope across them. The Global Fund runs no dedicated SNT programme and has no SNT strategy document. Its influence works through the instruments of the funding model: the Malaria Information Note, the Funding Request and its review by the Technical Review Panel, the indicator framework and the technical assistance it finances.',
    '',
    'Methodology, scope and timeline',
    '',
    'The evaluation is theory-based. Contribution analysis was selected at inception because the intervention is a system-level influence exercised through incentives and technical assistance, no counterfactual is available, and the causal question of interest is therefore contribution rather than attribution. A theory of change was constructed at inception and validated with the Global Fund malaria team, running from data compilation and quality assurance, through stratification and analytical capacity, to a tailored intervention mix, financial optimisation and burden reduction. Each link was treated as a claim to be tested against evidence.',
    '',
    'Four instruments were used: key informant interviews at global, national and sub-national level; an online survey of the 28 highest-burden countries; focus group discussions with community and facility representatives; and a structured document and portfolio review covering Funding Requests from GC6 and GC7, Technical Review Panel observations, Malaria Information Notes, national malaria strategic plans and portfolio data for the eleven HBHI countries. Each evaluation question was assigned to a named analyst and triangulated across at least two instruments before a finding was recorded.',
    '',
    'The achieved sample is as follows. Seventy-one key informant interviews were completed (n = 71) against the approximately 90 planned at inception: 20 at global level, 27 at national level and 24 at sub-national level. Four of the six planned country insights were completed: Burkina Faso, Ghana, Nigeria and Uganda. The Mali and Mozambique country insights were not carried out. Twenty-four of the 28 surveyed countries responded (n = 24). Eleven focus group discussions were held against the 18 planned. The document review covered 163 documents. Fieldwork ran from July to November 2024.',
    '',
    'Findings, Theme A: Adequacy of country sub-national systems',
    '',
    'Sub-national systems capture enough to stratify and not enough to tailor. In all four country insights, DHIS2 holds confirmed malaria cases, tests performed and, more variably, commodities distributed, at district and usually at facility level. That is sufficient for a burden stratification. It is not sufficient for the second half of the SNT question, which is what mix of interventions a given stratum should receive: that needs intervention coverage, vector and contextual data, which sit in parallel systems that do not speak to the routine one. Entomological surveillance is the most consistent missing data point, absent at sub-national level in three of the four countries.',
    '',
    'Data quality at sub-national level is uneven and, more to the point, unowned. Validation and verification happen, and they happen well, but they happen because the Local Fund Agent arrives to do them. District health information officers described data quality as an audit event rather than a management practice. Only one of the four countries ran routine district-level data quality reviews with a documented corrective-action loop. The balance of investment is the visible cause: LFA verification is financed as a grant line, and sub-national data review is financed by nobody.',
    '',
    'Analytical capacity is concentrated and thin. In every country insight the staff able to run a stratification without external technical assistance numbered fewer than ten, and all of them sat at national level. Regional and district staff can read a stratification map and cannot produce one: 19 of the 24 responding countries rated district analytical capacity at the two lowest points of the scale. Awareness of the SNT approach follows the same gradient. In the survey, 21 of 24 countries reported that disaggregated malaria analysis informs stratification, and only 9 that it informs monitoring and quality improvement, which is the difference between an analysis that is produced and one that is used.',
    '',
    'Population denominators are the quiet problem underneath the coverage figures. Sub-national service-coverage estimates are calculated on projections from censuses conducted between 2006 and 2014, growth-adjusted centrally and applied uniformly. Where a district has received substantial displacement the denominator is known to be wrong and is used anyway. On the malaria vaccine, sub-national input into the selection of focus coverage areas was limited to validation: areas were identified nationally on burden and mortality criteria, and no country insight found a district-originated proposal that changed a coverage-area decision.',
    '',
    'Findings, Theme B: Challenges in decision-making',
    '',
    'The decision-making bottleneck is not analytical. It is financial and procedural. The stratification is produced, the optimal intervention mix is modelled against it, the allocation is announced, the modelled mix is found to exceed it, and the mix is reduced in a negotiation between the national malaria control programme, the Principal Recipient and the Country Team in which the stratification plays no formal part. That negotiation is where tailoring is won or lost, and it is the least documented step in the chain: in none of the four countries could the evaluation obtain a written record of the rationale for the reductions made there.',
    '',
    'Global Fund investments have been decisive on the analytical side of this and largely absent from the decision side. The Global Fund financed the data compilation, the repositories and, through partners, most of the modelling. It has not financed, and does not ask for, the sub-national deliberation in which a tailored mix would be chosen, defended and recorded. Nor is sub-national autonomy real. Three of the four countries have decentralised health legislation assigning districts responsibility for planning; in practice districts plan within a national intervention package they did not set and cannot vary, and coordination structures are chaired nationally and attended, in the words of one regional coordinator, to receive information rather than to shape it.',
    '',
    'The contextual factors that shape sub-national decisions are political, legal, economic and social before they are technical. Security determines what can be delivered in the northern regions irrespective of what the stratification says, and one country insight documented a mass-campaign allocation that survived a stratification recommending its withdrawal, because of the political weight of the region concerned. Comparing across countries, the places where sub-national decisions carry weight are distinguished by a financing channel that reaches the district directly and a leadership that treats districts as its constituency rather than as its reporting network. Where neither is present, stratification is a document.',
    '',
    'Findings, Theme C: Funding Requests and SNT',
    '',
    'Malaria Funding Requests are now substantially based on sub-national tailoring. All eleven HBHI Funding Requests reviewed from GC7 present a sub-national stratification of burden, against six of eleven in GC6, and ten of eleven present an intervention mix differentiated by stratum, against four in GC6. Depth is another matter. Each was assessed against the three key concepts the approach requires. Stratification is present in all eleven. A mix that varies by stratum is present in ten. Financial optimisation, meaning an explicit comparison of scenarios and an argued choice between them under the allocation available, is present in three. How far these concepts are reflected in malaria Funding Requests is what must be strengthened in GC8.',
    '',
    'In five of the eleven GC7 Funding Requests the interventions selected do not follow the initial stratification presented in the same document, and the deviation is not explained. National malaria control programmes gave a consistent account of why: the stratification is produced against need and the Funding Request is written against an allocation, and when the second is smaller than the first the mix is trimmed by protecting existing coverage rather than by re-optimising against the strata. Countries plan against an envelope, are held to targets counted in inputs, and are never asked to show what impact a tailored mix is expected to buy, which is why the move from input-based to impact-based programming has not happened.',
    '',
    'Technical assistance for SNT compilation, stratification, scenario-building and modelling was requested by every country insight country and provided to all four. It was also, in every case, external, short and tied to the Funding Request cycle, arriving before the submission and departing after it, which is why the analytical capacity it produces does not stay.',
    '',
    'Findings, Theme D: The Global Fund and high-quality data in SNT',
    '',
    'The Global Fund promotes the generation of high-quality malaria data energetically and the use of it very little. It finances data quality assurance, verification and the creation of malaria data repositories (MDRs). MDRs now exist in nine of the eleven HBHI countries and the Global Fund financed the establishment of seven directly. They draw from DHIS2, from the malaria indicator and demographic health survey series, from commodity and logistics systems, and from climate and geospatial layers where available. Their maintenance is the weak point: established as projects with a defined end, their upkeep depends on the same handful of national analysts who are the bottleneck for everything else, and two of the nine had not been updated in a year.',
    '',
    'Global Fund monitoring frameworks do not support a sub-nationally tailored response and were not built to. The Progress Update and Disbursement Request (PUDR) aggregates to national level, is completed by the Principal Recipient, and asks nothing about whether the tailored mix was implemented as tailored. DHIS district dashboards exist in three of the four countries and are populated by the health information system rather than by the grant, so they carry service data and not grant performance. No informant at any level described using a Global Fund monitoring tool to make a sub-national decision.',
    '',
    'The current indicators point the same way. The malaria indicator set measures coverage and commodity distribution at national level and is not required to be reported sub-nationally. It contains no indicator of tailoring, none of financial optimisation, and none that would move if a country tailored better this year than last. Sub-national teams were close to unanimous that these are national instruments reported through the district rather than district instruments usable at their granularity and periodicity.',
    '',
    'Findings, Theme E: Role of country stakeholders',
    '',
    'The partner landscape around SNT is crowded, capable and poorly coordinated. In each country insight, between four and seven organisations were providing technical assistance touching stratification, modelling or data systems: TA providers, in-country research institutions and partners financed by the Global Fund, by bilateral donors and by philanthropic funders. Programme staff were positive about the quality of this support and negative about its coherence, because partners bring different modelling tools, conventions and reporting demands. National reference groups are the mechanism that ought to resolve this and they are the weakest institution in the chain: the M&E working groups exist in all four countries, two met once in the past year, and none had reviewed a stratification before it was used in a Funding Request.',
    '',
    'Sub-national evidence reaches National Malaria Strategic Plans and does not reach their costing. All four countries have a current NMSP presenting a sub-national stratification, and none costs its interventions by stratum. Costing is done on national unit costs and national coverage targets, so the plan meant to express the tailored strategy is priced as though the strategy were uniform, and the financial optimisation that SNT exists to enable has nowhere to happen. Technical assistance, finally, is scoped to producing the analysis rather than to the local capacity to repeat it, which is how the analytical bottleneck reproduces itself each cycle.',
    '',
    'Insights and implications',
    '',
    'The Global Fund has solved the problem it set out to solve and has arrived at a harder one. Stratification is now routine. What is not routine is the survival of the tailored mix through the allocation negotiation: an undocumented, unmodelled and unaccountable step, and the place where the value of every stratification in the portfolio is currently being lost.',
    '',
    'Sub-national tailoring is also being done above the sub-national level. The analysis is national, the decision is national, the money is national, and the district appears as a data source and an implementer. A tailoring system in which the tailored-to have no voice produces plans that are technically correct and operationally unowned.',
    '',
    'Finally, the instruments the Global Fund controls, the indicators, the PUDR, the Funding Request template and the technical assistance it finances, pull against its own stated purpose. They reward reporting, purchasing and the production of an analysis. None rewards a decision made better because of that analysis.',
    '',
    'Recommendations for GC8',
    '',
    'Stakeholders should strengthen sub-national data systems, with particular attention to entomological surveillance and to the population denominators used for coverage estimation.',
    '',
    'Consideration should be given to rebalancing the investment in data verification toward the routine use of data at sub-national level.',
    '',
    'Efforts should be made to build analytical capacity at regional and district level, so that stratification does not depend on a small number of national analysts.',
    '',
    'The Funding Request process should better incentivise financial optimisation, and greater transparency around the choices made between the stratification and the final intervention mix would be desirable.',
    '',
    'Steps should be taken to ensure that malaria data repositories are maintained beyond the period of their establishment.',
    '',
    'The indicator framework should be reviewed with a view to supporting sub-national tailoring and financial optimisation.',
    '',
    'Technical assistance should be expanded in scope, and greater emphasis should be placed on systematic local capacity-building in preparation for GC8.',
    '',
    'Annexes',
    '',
    'Annex 1. Terms of reference.',
    'Annex 2. Evaluation matrix: the 26 evaluation questions with their indicators, data sources and judgement criteria.',
    'Annex 3. Theory of change and assumptions register.',
    'Annex 4. List of documents reviewed (163 documents).',
    'Annex 5. Topic guides, the country stakeholder survey questionnaire and the focus group discussion guide. Informed consent was obtained verbally at the start of each interview.',
    'Annex 6. Country insight notes: Burkina Faso, Ghana, Nigeria, Uganda.',
    'Annex 7. Funding Request coding framework and the GC6 to GC7 comparison table.',
    'Annex 8. List of persons interviewed, anonymised by role and level.'
  ].join('\n');
})();
