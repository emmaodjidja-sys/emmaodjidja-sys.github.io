/* Build: concatenate src/parts/*.jsx in order, compile JSX with the vendored
   babel-standalone, and inline the result into ../index.html between the
   BUILD:JS markers. Run from anywhere:  node praxis/tools/deck-generator/src/build.js */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'parts');
const INDEX = path.join(__dirname, '..', 'index.html');
const BABEL = path.join(__dirname, '..', '..', 'vendor', 'babel.min.js');

const parts = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.jsx')).sort();
if (!parts.length) { console.error('No .jsx parts found in ' + SRC_DIR); process.exit(1); }
const source = parts.map(f => fs.readFileSync(path.join(SRC_DIR, f), 'utf8')).join('\n');

/* babel-standalone is a UMD bundle; under Node it attaches to module.exports. */
const Babel = require(BABEL);
const compiled = Babel.transform(source, {
  presets: [['react', { runtime: 'classic' }]],
  comments: false,
  compact: false
}).code;

const banned = [
  { ch: '—', name: 'em dash' },
  { ch: '–', name: 'en dash' },
  { ch: '←', name: 'left arrow glyph' },
  { ch: '→', name: 'right arrow glyph' },
  { ch: '↺', name: 'reset glyph' },
  { ch: '⏚', name: 'print glyph' },
  { ch: '▶', name: 'play glyph' }
];
for (const b of banned) {
  const i = source.indexOf(b.ch);
  if (i !== -1) {
    const line = source.slice(0, i).split('\n').length;
    console.error(`Banned character (${b.name}) in source at line ${line}`);
    process.exit(1);
  }
}

const html = fs.readFileSync(INDEX, 'utf8');
const START = '/* BUILD:JS */';
const startIdx = html.indexOf(START);
if (startIdx === -1) { console.error('BUILD:JS marker not found in index.html'); process.exit(1); }
const scriptOpen = html.lastIndexOf('<script>', startIdx);
const scriptClose = html.indexOf('</script>', startIdx);
if (scriptOpen === -1 || scriptClose === -1) { console.error('Could not locate the build script tag'); process.exit(1); }

const out = html.slice(0, scriptOpen)
  + '<script>\n' + START + '\n(function () {\n"use strict";\nfunction boot() {\n' + compiled + '\n}\nif (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }\n})();\n'
  + html.slice(scriptClose);

fs.writeFileSync(INDEX, out, 'utf8');
console.log(`Built ${parts.length} parts, ${(compiled.length / 1024).toFixed(0)} KB compiled, into index.html`);
