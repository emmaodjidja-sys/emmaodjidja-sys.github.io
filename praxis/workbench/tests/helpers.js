/* Minimal window-stubbed loader so the pure workbench modules run under node.
   No dependencies. The sandbox object doubles as `window`, so `window.X = ...`
   inside a module IIFE lands on the sandbox and bare `X` resolves globally. */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var FILES = [
  'js/utils.js',
  'js/schema.js',
  'js/export-utils.js',
  'js/components/SequenceNavCore.js',
  'js/commissioner/CockpitData.js',
  'js/commissioner/CockpitAlerts.js',
  'js/review/ScreenCore.js',
  'js/review/ScreenExport.js'
];

/* extra: additional workbench-relative files to run in the SAME sandbox after the
   core modules (the demo fixtures, say, which are IIFEs assigning onto window).
   Defaults to none, so existing callers are unaffected. */
function loadWorkbench(extra) {
  var sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.console = console;
  vm.createContext(sandbox);
  FILES.concat(extra || []).forEach(function(f) {
    var full = path.join(__dirname, '..', f);
    vm.runInContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: f });
  });
  return sandbox;
}

var failures = 0;
function assert(cond, msg) {
  if (cond) { console.log('ok - ' + msg); }
  else { failures += 1; process.exitCode = 1; console.error('FAIL - ' + msg); }
}
function eq(got, want, msg) {
  assert(got === want, msg + ' (got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want) + ')');
}
/* Date-only ISO string n LOCAL calendar days from today (mirrors daysUntilLocal). */
function isoDaysFromNow(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  function p(x) { return String(x).padStart(2, '0'); }
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function summary(name) {
  if (failures) { console.error(name + ': ' + failures + ' FAILURE(S)'); }
  else { console.log(name + ': all pass'); }
}

module.exports = { loadWorkbench: loadWorkbench, assert: assert, eq: eq, isoDaysFromNow: isoDaysFromNow, summary: summary };
