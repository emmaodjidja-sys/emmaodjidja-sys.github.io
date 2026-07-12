/**
 * demo-report-zd.js - the Gavi zero-dose worked example's OWN draft final
 * report, provided so the First Review screen can be demonstrated end to end.
 *
 * A FIXTURE, not a model report, and a deliberately STRONGER one than the
 * Global Fund draft: its methodology, its limitations and its consent procedure
 * are all disclosed properly, so the screen has something to pass as well as
 * something to catch. Its flaws are properties of the text:
 *   - the conclusions overreach the evidence (the findings establish association
 *     and plausible contribution; the conclusions say the grants "drove" and
 *     "caused" the reductions), and one conclusion rests on an outcome the
 *     findings never present (the DTP1 to DTP3 dropout claim);
 *   - the recommendations are actionable but addressed to no named body;
 *   - three evaluation questions (EQ6, EQ7, EQ8) are touched but never answered;
 *   - a health worker is quoted in a way that names her facility and her
 *     district, which is an identifiability problem in a small site.
 * Its headline problem is not in the text at all: it is the date. The report
 * lands long after the decision window closed, and the screen computes that
 * itself from the project's own dates.
 *
 * Registered by the demo's EXACT programme_name, which is the only key
 * FirstReview will look it up by, so it can never surface on a real evaluation.
 * ASCII only. No em dashes, no en dashes.
 */
(function() {
  'use strict';
  window.PRAXIS_DEMO_REPORTS = window.PRAXIS_DEMO_REPORTS || {};

  window.PRAXIS_DEMO_REPORTS["Gavi's contribution to reaching zero-dose and missed communities (5.0/5.1 ZD Agenda)"] = [
    'EVALUATION OF GAVI\'S CONTRIBUTION TO REACHING ZERO-DOSE CHILDREN AND MISSED COMMUNITIES',
    'Draft final report (Year 3), submitted to the Gavi Central Evaluation Team',
    'Version 1.0, for comment by the Evaluation Advisory Committee',
    '',
    'Executive summary',
    '',
    'This is the final report of a three-year, theory-based, utilisation-focused evaluation of Gavi\'s zero-dose agenda under Gavi 5.0 and 5.1. It asks whether the agenda is relevant and coherent, whether the funding levers, processes and guidance have enabled countries to focus their support on zero-dose children and missed communities, and what Gavi\'s grants have contributed. It draws on eight country case studies, a survey of Senior Country Managers and a desk review, and is organised around the IRMMA framework: identify, reach, monitor, measure, advocate.',
    '',
    'The agenda is relevant, and relevant in a way country stakeholders had been waiting for. National immunisation staff described the zero-dose framing as the first Gavi language that matched the problem they actually face, which is not low national coverage but a residual population the routine system has never touched. IRMMA is well regarded as an organising logic, and its weakest element in practice is the first one: countries cannot reliably identify zero-dose children, because the denominators are wrong and the communities in question are precisely those the data system does not see.',
    '',
    'The funding levers are relevant and are not well understood. The distinction between health system strengthening (HSS) funding and the Equity Accelerator Fund (EAF) is unclear to most country stakeholders, and in three countries the two were merged into a single immunisation budget line, which is the outcome the EAF was designed to prevent. The process is also slow: a median of 14 months from the start of full portfolio planning to first disbursement, by which point a zero-dose community identified at the outset has frequently moved.',
    '',
    'On contribution, the evaluation finds a consistent association between Gavi 4.0 pro-equity grants and the reduction of zero-dose children, and a plausible contribution story that survives the alternative explanations it was able to test. Pooled Alliance financing and concurrent national reform mean the contribution cannot be isolated, and the evaluation does not claim that it can. Operationalisation is where the agenda is thinnest: grant applications now name zero-dose communities, and implementation has changed less than language has.',
    '',
    'Background and context',
    '',
    'Gavi 5.0 committed the Alliance to leaving no one behind with immunisation, and Gavi 5.1 sharpened that into a measurable commitment: a 25 per cent reduction in the number of zero-dose children by 2025 against a 2019 baseline. A zero-dose child is one who has received no dose of a routine vaccine, taken in practice as no dose of DTP-containing vaccine. Zero-dose children concentrate in remote rural and nomadic populations, in marginalised urban settlements and in fragile and conflict-affected areas.',
    '',
    'IRMMA is the operating logic for reaching them: identify the missed communities, reach them, monitor and measure the results, and advocate for the commitment to sustain it. Gavi acts through its funding levers, principally HSS funding, the EAF, the Zero-dose Immunisation Programme, targeted country assistance and the cold chain equipment platform. The eight case-study countries span the three Gavi segments: High-Impact (Ethiopia, India, Pakistan), Core (Cambodia, Cote d\'Ivoire, Djibouti) and Fragile or Conflict-Affected (Afghanistan, South Sudan).',
    '',
    'Methodology, scope and timeline',
    '',
    'The evaluation is theory-based and uses contribution analysis as its primary design, chosen at inception on three grounds: the intervention is a system-level influence exercised through funding and non-funding instruments; no counterfactual is available, since Gavi support is not randomly assigned; and the causal question the Alliance needs answered is one of contribution rather than attribution. A theory of change and a theory of action were built at inception with an explicit assumptions register, and both were revisited annually.',
    '',
    'Four instruments were used: key informant interviews at global level and in the eight case-study countries; an online survey of Senior Country Managers; a desk review of grant applications, review committee decisions, disbursement records and secondary coverage data; and country-specific theories of change, used as the frame for the within-case contribution analysis.',
    '',
    'The achieved sample is close to plan. One hundred and twenty-four key informant interviews were completed (n = 124) against the 126 planned: 54 at global level and 70 across the eight case-study countries. The Senior Country Manager survey achieved 35 responses (n = 35). The desk review covered 118 documents. All eight case studies were completed, although two of them, Afghanistan and South Sudan, were conducted remotely.',
    '',
    'Ethics and consent',
    '',
    'The evaluation was conducted under the research ethics policy of the commissioning organisation. Informed consent was obtained from every key informant before interview, in the language of the informant\'s choice, and covered the purpose of the evaluation, the use to be made of the interview, the right to decline any question and the right to withdraw. Consent to record was sought separately; eleven informants declined recording, and those interviews were captured in notes only. Interview data was stored encrypted and transcripts were pseudonymised at transcription.',
    '',
    'Limitations',
    '',
    'Four limitations qualify the findings, and the third is material to the contribution question.',
    '',
    'First, coverage data lags. The harmonised estimates on which the zero-dose numbers rest are published roughly a year in arrears, so the most recent grant activity has no outcome data against it, and statements about activity after 2023 rest on qualitative evidence alone.',
    '',
    'Second, two of the eight case studies were conducted remotely. In Afghanistan and South Sudan, security and access made in-country fieldwork impossible. Sub-national informants were reached by telephone where connectivity allowed, community-level informants were not reached at all, and those two case studies rest more heavily on documents and national accounts than the other six.',
    '',
    'Third, and most importantly, grant financial data cannot be disaggregated to zero-dose activity. Gavi funds are pooled at country level with domestic and other partner financing, and grant budget lines are not coded to zero-dose targeting. The evaluation asked for expenditure disaggregated to the activities the theory of change identifies, and it was not available in any of the eight countries. The evaluation can therefore trace the design of an investment and the account stakeholders give of it, and it cannot trace the money. Contribution claims here are theory-based and qualitative, and should be read as such.',
    '',
    'Fourth, the Senior Country Manager survey is a self-report instrument administered to people accountable for the performance it asks about. It has been treated as a source of perception rather than of fact, and triangulated against documents and interviews wherever it is cited.',
    '',
    'Findings, Objective 3: Contribution of Gavi 4.0 pro-equity grants',
    '',
    'The number of zero-dose children in the eight case-study countries fell between 2019 and 2023. The fall is not uniform: it is concentrated in Ethiopia, India and Cote d\'Ivoire, is modest in Cambodia and Djibouti, and is absent in Afghanistan and South Sudan, where the number rose. Across the districts for which sub-national estimates could be constructed, those that received targeted pro-equity investment under Gavi 4.0 show a larger reduction than those that did not, and the difference persists when the comparison is restricted to districts with similar baseline coverage.',
    '',
    'The qualitative account of how this happened is consistent across the six countries with in-country fieldwork, and it is an account of periodic outreach rather than of system change. Gavi 4.0 pro-equity grants financed the extension of outreach sessions into areas the routine system did not serve, the microplanning that identified those areas, and, in four countries, the community mobilisers who preceded the outreach team. Health workers, district managers and civil society informants independently described the same causal chain.',
    '',
    'The evaluation tested three alternative explanations. Concurrent national immunisation reform is a genuine rival in Ethiopia and India and cannot be separated from the Gavi-financed activity. Post-pandemic catch-up explains part of the recovery everywhere and is the dominant explanation in Cambodia. Revision of the population denominator explains a share of the apparent reduction wherever a new census landed in the period. None of the three accounts for the district-level pattern, and the contribution story survives them.',
    '',
    'The Maintain, Restore and Strengthen response mounted during the pandemic reached zero-dose children and missed communities unevenly. It was designed to protect existing coverage and it did so. Informants in five countries said that when the system was under pressure the missed communities were the first thing dropped, because reaching them costs more per child than maintaining coverage where the system already works. As one health worker at Boru Meda Health Centre in South Wollo district put it, "we were told to protect the sessions we could still run. The villages up the mountain, nobody asked about them for two years."',
    '',
    'Findings, Objective 1: Relevance and coherence of the ZD agenda',
    '',
    'The zero-dose focus is relevant to country needs and stakeholders say so without prompting. In all eight case studies, national immunisation programme staff described the shift from a coverage target to a zero-dose target as a shift from a number they could hit without reaching anybody new to a number they could not. In the Senior Country Manager survey, 31 of the 35 respondents rated the zero-dose focus as aligned or strongly aligned with the needs of the countries they manage.',
    '',
    'IRMMA is well regarded as a framework and is unevenly implementable as an operating model. Reach, monitor and advocate are recognised, resourced and under way. Identify is the intervention area countries cannot execute, and it is the one on which everything downstream depends: zero-dose children are missing from the denominators as well as the numerators, living in settlements the census undercounts, in nomadic groups it does not follow and in urban settlements it does not map. Six of the eight countries had no method for identifying zero-dose communities other than the professional judgement of district staff.',
    '',
    'The COVID-19 disruption set the agenda back twice over: directly, by suspending outreach for between four and eleven months, and indirectly, by consuming the attention a new strategy requires. Several global informants dated the effective start of the agenda to 2022 rather than 2021 for this reason.',
    '',
    'The funding levers are relevant to the needs of countries and are not understood as distinct instruments. Country stakeholders used HSS funding and the EAF interchangeably in interview, and in three countries the EAF allocation had been absorbed into the general immunisation budget rather than protected for equity-targeted activity. The intended distinction, that HSS funding builds the system and the EAF buys the extra effort required to reach the communities the system misses, was articulated accurately by only a minority of country informants. The bureaucratic burden falls hardest on the smallest programmes: Djibouti, with an immunisation team of nine people, produced the same volume of application documentation as Pakistan.',
    '',
    'Coherence with the wider architecture is strong on paper and adequate in practice. The agenda aligns explicitly with Immunization Agenda 2030 and its equity goal, and is consistent with the primary health care orientation of the WHO general programme of work and with the health-related sustainable development goals. Seven of the eight countries have incorporated zero-dose language into their national immunisation strategies, and coordination mechanisms exist in all eight, with active Gavi participation in six.',
    '',
    'Findings, Objective 2: Operationalisation of the ZD agenda',
    '',
    'Guidance and process have moved faster than country capacity. The Secretariat has produced a substantial body of zero-dose guidance, and the country teams that must apply it describe it as voluminous, sequential and frequently revised. The zero-dose working groups and the Secretariat architecture around them are coherently designed, and they are the main mechanism by which the agenda reached the country portfolios at all; their weakness is that country stakeholders encounter their output as further requirements rather than as support.',
    '',
    'The process is slow. Across the eight case studies the median elapsed time from the start of full portfolio planning to first disbursement was 14 months, with a range from 9 to 23 months. The review committee decision accounts for a minority of that time and the preparation of the application for the majority of it. In fragile settings the delay carries a direct programmatic cost, because the communities the application identifies are mobile.',
    '',
    'Grant applications have changed. Zero-dose language, IRMMA structure and named target communities are now standard, in contrast with the Gavi 4.0 applications examined for Objective 3. Whether implementation has changed to the same degree is a question this evaluation cannot answer on the evidence available: disbursement against the current generation of grants is recent, and activity reporting for the most recent period was not available in six of the eight countries. The evaluation has therefore not reached a finding on the contribution of grants initiated under Gavi 5.0 and 5.1.',
    '',
    'The theory of change and the theory of action were reviewed annually against the accumulating evidence, and the assumptions register is at Annex 3. The assumption on which the greatest weight rests, that countries can identify zero-dose communities despite weak population and routine data, is the one the Objective 1 findings put under most pressure. A full assessment of whether the theory of change and the theory of action are fit for purpose was scoped for this report and is not included in it.',
    '',
    'Sustainability appears in the grant documentation and does not yet appear in the evidence. Transition and sustainability plans were reviewed in all eight countries and are present in seven, and they are in the main statements of intent naming government co-financing as the mechanism by which zero-dose activity will be sustained. The evaluation sought national health financing data to test whether co-financing and institutional integration into national systems are in fact increasing. That data was obtained for two of the eight countries, and the analysis is not reported here.',
    '',
    'Insights and implications',
    '',
    'The zero-dose agenda has worked, and the evidence assembled by this evaluation shows why. Gavi\'s pro-equity grants drove the reduction in the number of zero-dose children observed across the case-study countries between 2019 and 2023. The targeted outreach those grants financed caused the narrowing of the gap between the districts the immunisation system serves well and those it has never served, and the district-level pattern of that narrowing is the signature of the investment rather than of the national reform, the pandemic recovery or the denominator revision that ran alongside it. The agenda has also delivered a measurable reduction in the dropout between the first and third doses of DTP-containing vaccine across the fragile and conflict-affected segment, which is the clearest available demonstration that the children reached for the first time are being retained in the routine system.',
    '',
    'The second implication is that the binding issue has moved from ambition to identification. The Alliance has persuaded its countries that the missed communities are the problem. It has not given them the means to find them, and every downstream weakness recorded here, the levers merged into general budgets, the guidance that outpaces absorption, the transition plans that name co-financing without a number, traces back to the fact that the population at the centre of the strategy cannot be counted.',
    '',
    'The third is about speed. A fourteen-month median from planning to disbursement assumes the target population stays where it was identified. In the segment where zero-dose prevalence is highest, that assumption is false.',
    '',
    'Recommendations',
    '',
    'It is recommended that the Equity Accelerator Fund be ring-fenced within country budgets and reported against separately from HSS funding, so the allocation cannot be absorbed into the general immunisation budget line.',
    '',
    'It is recommended that the identification of zero-dose communities be treated as a financed activity in its own right, and that the design of Gavi 6.0 carry a specific instrument for it.',
    '',
    'It is recommended that a fast-track application and disbursement pathway be established for the fragile and conflict-affected segment, targeting no more than six months from portfolio planning to first disbursement.',
    '',
    'It is recommended that zero-dose guidance be consolidated into a single sequenced package, and that no further guidance be issued during a planning cycle already under way.',
    '',
    'It is recommended that grant budget lines be coded to zero-dose targeting from the next application cycle, so that the next evaluation can trace the money as well as the intent.',
    '',
    'It is recommended that transition plans be required to state a co-financing figure and a date, and that the figure be tracked in the annual portfolio review.',
    '',
    'Annexes',
    '',
    'Annex 1. Bibliography of the 118 documents reviewed.',
    'Annex 2. Evaluation matrix: the eight evaluation questions with their indicators and data sources.',
    'Annex 3. Theory of change, theory of action and the assumptions register.',
    'Annex 4. Country case-study notes: Afghanistan, Cambodia, Cote d\'Ivoire, Djibouti, Ethiopia, India, Pakistan, South Sudan.',
    'Annex 5. Topic guides and the Senior Country Manager survey questionnaire.',
    'Annex 6. Zero-dose estimates by country and district, with sources and construction notes.',
    'Annex 7. List of persons interviewed, by role and organisation type.'
  ].join('\n');
})();
