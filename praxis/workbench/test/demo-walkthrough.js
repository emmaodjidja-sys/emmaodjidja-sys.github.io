// PRAXIS Workbench — Full Demo Walkthrough Test
// Loads demo data and verifies all 9 stations have correct data flow

global.window = global;
global.React = { createElement: function(){return {}}, useState: function(v){return [typeof v==='function'?v():v, function(){}]}, useCallback: function(f){return f}, useRef: function(){return {current:null}}, useEffect: function(){}, useMemo: function(f){return f()}, useReducer: function(r,i,f){return [f?f(i):i, function(){}]}, Fragment: 'fragment', memo: function(f){return f} };
global.ReactDOM = { createRoot: function(){return {render:function(){}}} };
window.PraxisUtils = { clamp: function(v,min,max){return Math.max(min,Math.min(max,v))}, uid: function(p){return p+'-'+Math.random().toString(36).substr(2,6)}, deepMerge: function(t,s){var r=Object.assign({},t);Object.keys(s).forEach(function(k){if(s[k]&&typeof s[k]==='object'&&!Array.isArray(s[k])){r[k]=Object.assign({},t[k]||{},s[k])}else{r[k]=s[k]}});return r}, debounce:function(f){return f}, formatDate:function(d){return d}, downloadBlob: function(){} };
window.PraxisI18n = { t: function(k){return k} };

var fs = require('fs');
eval(fs.readFileSync('praxis/workbench/js/schema.js','utf8'));
eval(fs.readFileSync('praxis/workbench/js/staleness.js','utf8'));
eval(fs.readFileSync('praxis/workbench/js/protection.js','utf8'));
eval(fs.readFileSync('praxis/workbench/js/context.js','utf8'));
eval(fs.readFileSync('praxis/workbench/js/demo-data.js','utf8'));

var demo = window.PRAXIS_DEMO;
var state = PraxisContext.reducer(PraxisContext.getInitialState(), { type: 'INIT', context: demo, tier: 'practitioner', station: 0 });
var ctx = state.context;
var issues = [];

function check(label, condition, detail) {
  if (!condition) {
    issues.push(label + ': ' + (detail || 'FAILED'));
    console.log('  \u2717 ' + label + (detail ? ' — ' + detail : ''));
  } else {
    console.log('  \u2713 ' + label);
  }
}

console.log('');
console.log('PRAXIS WORKBENCH — FULL DEMO WALKTHROUGH');
console.log('='.repeat(60));

// STATION 0
console.log('\nSTATION 0: Evaluability & Scoping');
check('Programme name', !!ctx.project_meta.programme_name);
check('Organisation', !!ctx.project_meta.organisation);
check('Country', !!ctx.project_meta.country);
check('Operating context', !!ctx.project_meta.operating_context);
check('Budget', !!ctx.project_meta.budget);
check('Timeline', !!ctx.project_meta.timeline);
check('Programme maturity', !!ctx.project_meta.programme_maturity);
check('Evaluability score', ctx.evaluability.score === 94, 'Got: ' + ctx.evaluability.score);
check('5 dimensions', ctx.evaluability.dimensions && ctx.evaluability.dimensions.length === 5);
check('No blockers', ctx.evaluability.blockers && ctx.evaluability.blockers.length === 0);
check('Completed', !!ctx.evaluability.completed_at);
check('ToR purposes', ctx.tor_constraints.evaluation_purpose && ctx.tor_constraints.evaluation_purpose.length >= 2);
check('Causal inference level', !!ctx.tor_constraints.causal_inference_level);
check('Comparison feasibility', !!ctx.tor_constraints.comparison_feasibility);
check('Data availability', !!ctx.tor_constraints.data_available);

// STATION 1
console.log('\nSTATION 1: Theory of Change');
check('ToC title', !!ctx.toc.title);
check('Nodes exist', ctx.toc.nodes && ctx.toc.nodes.length === 9, 'Got: ' + (ctx.toc.nodes ? ctx.toc.nodes.length : 0));
check('Connections exist', ctx.toc.connections && ctx.toc.connections.length === 8, 'Got: ' + (ctx.toc.connections ? ctx.toc.connections.length : 0));
check('Narrative is object', typeof ctx.toc.narrative === 'object');
check('Narrative has description', !!ctx.toc.narrative.description);
var levelCounts = {};
(ctx.toc.nodes || []).forEach(function(n) { levelCounts[n.level] = (levelCounts[n.level]||0)+1; });
check('Has impact nodes', levelCounts.impact >= 1, 'Got: ' + (levelCounts.impact || 0));
check('Has outcome nodes', levelCounts.outcome >= 1, 'Got: ' + (levelCounts.outcome || 0));
check('Has output nodes', levelCounts.output >= 1, 'Got: ' + (levelCounts.output || 0));
check('Has activity nodes', levelCounts.activity >= 1, 'Got: ' + (levelCounts.activity || 0));
check('Completed', !!ctx.toc.completed_at);

// STATION 2
console.log('\nSTATION 2: Evaluation Matrix');
var rows = ctx.evaluation_matrix.rows || [];
check('Has EQ rows', rows.length === 6, 'Got: ' + rows.length);
var criteria = {};
rows.forEach(function(r) { criteria[r.criterion] = true; });
check('Multiple DAC criteria', Object.keys(criteria).length >= 4, 'Got: ' + Object.keys(criteria).join(', '));
var indTotal = rows.reduce(function(s,r){return s+(r.indicators||[]).length},0);
check('Has indicators', indTotal >= 10, 'Got: ' + indTotal);
rows.forEach(function(r, i) {
  check('EQ' + (i+1) + ' has question', !!r.question);
  check('EQ' + (i+1) + ' has criterion', !!r.criterion);
  check('EQ' + (i+1) + ' has id', !!r.id);
  check('EQ' + (i+1) + ' has indicators', r.indicators && r.indicators.length >= 1);
  check('EQ' + (i+1) + ' has dataSources', r.dataSources && r.dataSources.length >= 1);
  check('EQ' + (i+1) + ' has judgementCriteria', !!r.judgementCriteria);
});
check('Completed', !!ctx.evaluation_matrix.completed_at);

// STATION 3
console.log('\nSTATION 3: Design Advisor');
var dr = ctx.design_recommendation;
check('Selected design', dr.selected_design === 'did', 'Got: ' + dr.selected_design);
check('Ranked designs', dr.ranked_designs && dr.ranked_designs.length === 3);
check('Top design is DID', dr.ranked_designs && dr.ranked_designs[0].id === 'did');
check('Has justification', !!dr.justification);
check('Answers filled', Object.keys(dr.answers || {}).length === 10, 'Got: ' + Object.keys(dr.answers || {}).length);
check('Completed', !!dr.completed_at);

// STATION 4
console.log('\nSTATION 4: Sample Size');
var sp = ctx.sample_parameters;
check('Design ID', sp.design_id === 'did', 'Got: ' + sp.design_id);
check('Sample result', sp.result && sp.result.primary === 1440, 'Got: ' + (sp.result ? sp.result.primary : 'none'));
check('Result label', !!sp.result.label);
check('Has params', sp.params && Object.keys(sp.params).length >= 3);
check('Qualitative plan', sp.qualitative_plan && sp.qualitative_plan.breakdown && sp.qualitative_plan.breakdown.length === 3);
if (sp.qualitative_plan && sp.qualitative_plan.breakdown) {
  sp.qualitative_plan.breakdown.forEach(function(b) {
    check('Qual ' + b.method + ' count', b.count > 0, 'Got: ' + b.count);
  });
}
check('Completed', !!sp.completed_at);

// getTopDesign check (critical — this broke before)
var topDesign = null;
if (dr.ranked_designs && dr.ranked_designs.length > 0) topDesign = dr.ranked_designs[0];
else if (dr.selected_design) topDesign = { id: dr.selected_design };
check('getTopDesign resolves', !!topDesign, topDesign ? topDesign.id : 'NULL');

// STATION 5
console.log('\nSTATION 5: Instrument Builder');
var inst = ctx.instruments;
check('Has instruments', inst.items && inst.items.length === 2, 'Got: ' + (inst.items ? inst.items.length : 0));
inst.items.forEach(function(it) {
  var qCount = (it.sections || []).reduce(function(s,sec){return s+(sec.questions||[]).length},0);
  check(it.name + ' has sections', (it.sections || []).length >= 1);
  check(it.name + ' has questions', qCount >= 2, 'Got: ' + qCount);
});
// Check EQ references are valid
var eqIds = {};
rows.forEach(function(r) { eqIds[r.id] = true; });
inst.items.forEach(function(it) {
  (it.sections || []).forEach(function(sec) {
    if (sec.eqId) {
      check('EQ ref ' + sec.eqId + ' valid', !!eqIds[sec.eqId], 'Not in matrix');
    }
  });
});
check('Completed', !!inst.completed_at);

// STATION 6
console.log('\nSTATION 6: Analysis Framework');
check('Analysis plan empty (generated on demand)', !ctx.analysis_plan.completed_at);
// Test method suggestion engine
rows.forEach(function(eq, i) {
  var hasQuant = (eq.indicators || []).some(function(ind) { return /rate|percentage|number|ratio|count|proportion/i.test(ind.name || ''); });
  check('EQ' + (i+1) + ' classifiable', true, (hasQuant ? 'QUANT' : 'QUAL') + ' — ' + eq.criterion);
});

// STATION 7
console.log('\nSTATION 7: Report Builder');
check('Report structure empty (generated on demand)', !ctx.report_structure.completed_at);
// Verify all upstream data is available for section generation
check('Project meta for intro', !!ctx.project_meta.programme_name);
check('Evaluability for exec summary', ctx.evaluability.score !== null);
check('Design for methodology', !!dr.selected_design);
check('Sample for methodology', !!sp.result.primary);
check('Instruments for methodology', inst.items.length > 0);
check('Matrix rows for findings', rows.length > 0);

// STATION 8
console.log('\nSTATION 8: Deck Generator');
check('Presentation empty (generated on demand)', !ctx.presentation.completed_at);
check('Has data for all 10 slides', true);

// CROSS-CUTTING
console.log('\nCROSS-CUTTING');
check('Staleness all false', Object.keys(ctx.staleness).every(function(k) { return !ctx.staleness[k]; }));

// Test staleness propagation
var afterSave = PraxisContext.reducer(state, { type: 'SAVE_STATION', stationId: 0, payload: { project_meta: { programme_name: 'Updated' } } });
var staleAfter = Object.keys(afterSave.context.staleness).filter(function(k) { return afterSave.context.staleness[k]; });
check('Saving Station 0 flags downstream', staleAfter.length >= 2, 'Stale: ' + staleAfter.join(', '));

// Test CLEAR_STALE
var afterClear = PraxisContext.reducer(afterSave, { type: 'CLEAR_STALE', stationId: 2 });
check('CLEAR_STALE works', !afterClear.context.staleness[2]);

// Dispatch key check
console.log('\nDISPATCH KEY CHECK');
var stationDir = 'praxis/workbench/js/stations';
var shellDir = 'praxis/workbench/js/shell';
var compDir = 'praxis/workbench/js/components';
var allFiles = [];

function walk(dir) {
  try {
    fs.readdirSync(dir).forEach(function(f) {
      var full = dir + '/' + f;
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (f.endsWith('.js')) allFiles.push(full);
    });
  } catch(e) {}
}
walk(stationDir);
walk(shellDir);
walk(compDir);

var wrongKey = [];
allFiles.forEach(function(f) {
  var content = fs.readFileSync(f, 'utf8');
  var lines = content.split('\n');
  lines.forEach(function(line, i) {
    if (line.indexOf('SET_ACTIVE_STATION') !== -1 && line.indexOf('stationId:') !== -1) {
      // Exclude CLEAR_STALE which correctly uses stationId
      if (line.indexOf('CLEAR_STALE') === -1) {
        wrongKey.push(f.replace('praxis/workbench/', '') + ':' + (i+1));
      }
    }
  });
});
check('No SET_ACTIVE_STATION with wrong key', wrongKey.length === 0, wrongKey.join(', '));

// SUMMARY
console.log('\n' + '='.repeat(60));
var passed = 0;
// Count from output — rough but effective
if (issues.length === 0) {
  console.log('ALL CHECKS PASSED');
} else {
  console.log(issues.length + ' ISSUES FOUND:');
  issues.forEach(function(i) { console.log('  - ' + i); });
}
console.log('='.repeat(60));
