// Station 6 analysis method suggestion test
var METHOD_RULES = {
  relevance: { withIndicators: function(inds) {
    var hasPerception = inds.some(function(i) { return /perception|satisfaction|opinion|attitude/i.test(i.name || ''); });
    if (hasPerception) return 'Survey analysis (Likert scales) + qualitative interviews';
    return 'Document review + key informant interviews';
  }},
  coherence: { withIndicators: function() { return 'Policy/programme document analysis + stakeholder mapping'; }},
  effectiveness: { withIndicators: function(inds, design) {
    var hasQuantitative = inds.some(function(i) { return /rate|percentage|number|ratio|count|proportion/i.test(i.name || ''); });
    if (design && /rct|clusterRCT|did|its|rdd/i.test(design)) {
      if (hasQuantitative) return 'Quasi-experimental/experimental analysis (treatment vs comparison)';
      return 'Mixed methods: experimental design + process tracing';
    }
    if (hasQuantitative) return 'Descriptive statistics + trend analysis + contribution analysis';
    return 'Contribution analysis + qualitative comparative analysis';
  }},
  efficiency: { withIndicators: function(inds) {
    var hasCost = inds.some(function(i) { return /cost|expenditure|budget|resource|unit cost/i.test(i.name || ''); });
    if (hasCost) return 'Cost-effectiveness analysis + budget variance analysis';
    return 'Value for money assessment (4Es framework) + process review';
  }},
  impact: { withIndicators: function(inds, design) {
    if (design && /rct|clusterRCT/i.test(design)) return 'Intent-to-treat analysis + subgroup analysis';
    if (design && /did/i.test(design)) return 'Difference-in-differences estimation';
    if (design && /its/i.test(design)) return 'Interrupted time series analysis';
    return 'Contribution analysis + process tracing + most significant change';
  }},
  sustainability: { withIndicators: function() { return 'Institutional analysis + financial sustainability modelling + stakeholder interviews'; }}
};

var scenarios = [
  { name: 'Lake Chad Basin', design: 'clusterRCT', rows: [
    { criterion: 'relevance', indicators: [{name:'Beneficiary satisfaction rate'}], question: 'To what extent has the programme addressed food security needs?' },
    { criterion: 'effectiveness', indicators: [{name:'Percentage of households with adequate food consumption'}], question: 'To what extent has the programme improved food security outcomes?' },
    { criterion: 'impact', indicators: [{name:'Resilience capacity score'}], question: 'What broader effects has the programme had on community resilience?' },
    { criterion: 'efficiency', indicators: [{name:'Cost per beneficiary reached'}], question: 'How efficiently were resources used?' },
  ]},
  { name: 'GCERF Sahel', design: null, rows: [
    { criterion: 'relevance', indicators: [{name:'Community perception of programme relevance'}], question: 'To what extent did the programme address drivers of violent extremism?' },
    { criterion: 'effectiveness', indicators: [{name:'Number of youth engaged in peacebuilding activities'}], question: 'To what extent did the programme strengthen community resilience?' },
    { criterion: 'sustainability', indicators: [{name:'Institutional capacity assessment score'}], question: 'Will the community structures continue after programme end?' },
  ]},
  { name: 'Global Fund Ghana', design: 'did', rows: [
    { criterion: 'effectiveness', indicators: [{name:'Percentage of health facilities reporting stock-outs'}], question: 'To what extent has the supply chain been strengthened?' },
    { criterion: 'effectiveness', indicators: [{name:'HMIS data completeness rate'}], question: 'To what extent has HMIS coverage improved?' },
    { criterion: 'impact', indicators: [{name:'Under-5 mortality rate'}], question: 'What has been the broader health impact?' },
    { criterion: 'sustainability', indicators: [{name:'Government co-financing ratio'}], question: 'Will gains be sustained after GF exit?' },
    { criterion: 'efficiency', indicators: [{name:'Unit cost of CHW service delivery'}], question: 'How cost-effective is the CHW model?' },
  ]},
  { name: 'South Sudan pilot', design: null, rows: [
    { criterion: 'relevance', indicators: [{name:'Beneficiary satisfaction with transfer mechanism'}], question: 'Did the cash transfer meet household needs?' },
    { criterion: 'effectiveness', indicators: [{name:'Proportion of transfers successfully delivered'}], question: 'Were transfers delivered as intended?' },
  ]},
  { name: 'Spotlight Uganda', design: 'did', rows: [
    { criterion: 'effectiveness', indicators: [{name:'Number of GBV cases reported through formal channels'}], question: 'To what extent has GBV reporting improved?' },
    { criterion: 'effectiveness', indicators: [{name:'Percentage of districts with functional referral pathways'}], question: 'How effectively were services strengthened?' },
    { criterion: 'impact', indicators: [{name:'Prevalence of intimate partner violence'}], question: 'Has the programme reduced GBV prevalence?' },
    { criterion: 'relevance', indicators: [{name:'Community attitude score on gender equality'}], question: 'Has the programme shifted community norms?' },
    { criterion: 'coherence', indicators: [], question: 'How well did the 6 pillars align with national strategies?' },
    { criterion: 'sustainability', indicators: [{name:'Budget allocation for GBV services in district plans'}], question: 'Will institutional changes persist?' },
  ]},
];

console.log('');
console.log('STATION 6 — ANALYSIS METHOD SUGGESTIONS');
console.log('='.repeat(60));

scenarios.forEach(function(sc) {
  console.log('');
  console.log(sc.name + (sc.design ? ' [Design: ' + sc.design + ']' : ' [No design selected]'));
  console.log('-'.repeat(50));
  sc.rows.forEach(function(row) {
    var rule = METHOD_RULES[row.criterion] || METHOD_RULES.effectiveness;
    var method = rule.withIndicators(row.indicators, sc.design);
    console.log('  ' + row.criterion.toUpperCase().substring(0,5) + ' | ' + method);
    console.log('        Q: ' + row.question);
  });
});
console.log('');
console.log('='.repeat(60));
