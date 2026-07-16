'use strict';
var cp = require('child_process');
var fs = require('fs');
var path = require('path');
var files = ['utils.test.js', 'design-vocab.test.js', 'design-migration.test.js', 'design-fixtures.test.js', 'migration.test.js', 'derive.test.js', 'alerts.test.js', 'track.test.js', 'screen.test.js', 'prescan.test.js', 'firstreview.privacy.test.js', 'demo-screens.test.js', 'seqnav.test.js', 'portfolio.test.js'];
var failed = false;
files.forEach(function(f) {
  var full = path.join(__dirname, f);
  try { fs.accessSync(full); } catch (e) { return; } // tolerate not-yet-written files
  var r = cp.spawnSync(process.execPath, [full], { stdio: 'inherit' });
  if (r.status !== 0) failed = true;
});
console.log(failed ? 'FAILURES' : 'ALL PASS');
process.exit(failed ? 1 : 0);
