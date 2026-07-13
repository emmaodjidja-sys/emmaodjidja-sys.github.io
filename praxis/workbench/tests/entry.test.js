/* EntryLanding: the hero CTA must land on the section 01 docket (the five ways
   in), not skip past it into the tier picker. Drives the real component under a
   minimal React with hook semantics, so the mode machine is exercised for real. */
'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var H = require('./helpers');
var assert = H.assert;
var eq = H.eq;

/* ── Minimal React ─────────────────────────────────────────────────────────
   createElement records {type, props, children}; the hooks are indexed per
   render, and a setter re-runs the component. Enough to exercise state, not a
   reconciler: nested function components are recorded as element types and
   never invoked, so we assert on the props EntryLanding hands them. */
function makeReact() {
  var hooks = [];
  var idx = 0;
  var effects = [];
  var box = { tree: null };
  var render = null;

  function sameDeps(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return false; }
    return true;
  }

  var React = {
    createElement: function(type, props) {
      return {
        type: type,
        props: props || {},
        children: Array.prototype.slice.call(arguments, 2)
      };
    },
    useState: function(init) {
      var i = idx++;
      if (!(i in hooks)) hooks[i] = { v: typeof init === 'function' ? init() : init };
      var slot = hooks[i];
      return [slot.v, function(next) {
        slot.v = typeof next === 'function' ? next(slot.v) : next;
        if (render) render();
      }];
    },
    useRef: function(init) {
      var i = idx++;
      if (!(i in hooks)) hooks[i] = { current: init === undefined ? null : init };
      return hooks[i];
    },
    useMemo: function(fn, deps) {
      var i = idx++;
      var prev = hooks[i];
      if (prev && sameDeps(prev.deps, deps)) return prev.val;
      var val = fn();
      hooks[i] = { val: val, deps: deps };
      return val;
    },
    useEffect: function(fn, deps) {
      var i = idx++;
      var prev = hooks[i];
      if (prev && sameDeps(prev.deps, deps)) return;
      hooks[i] = { deps: deps };
      effects.push(fn);
    }
  };

  function mount(Comp, props) {
    render = function() {
      idx = 0;
      effects = [];
      box.tree = Comp(props);
      effects.forEach(function(fn) { fn(); });
    };
    render();
    return box;
  }

  return { React: React, mount: mount };
}

/* ── Tree walking ──────────────────────────────────────────────────────── */
function walk(node, visit) {
  if (node === null || node === undefined || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(function(n) { walk(n, visit); });
    return;
  }
  visit(node);
  walk(node.children, visit);
}

function findOne(root, pred) {
  var hit = null;
  walk(root, function(n) { if (!hit && pred(n)) hit = n; });
  return hit;
}

function findAll(root, pred) {
  var hits = [];
  walk(root, function(n) { if (pred(n)) hits.push(n); });
  return hits;
}

function byClass(cls) {
  return function(n) { return n.props && n.props.className === cls; };
}

/* ── Sandbox ───────────────────────────────────────────────────────────── */
function mountEntry() {
  var r = makeReact();
  var dispatched = [];
  var sandbox = {};

  function stubIcon() { return { type: 'svg', props: {}, children: [] }; }
  function noopComponent(name) {
    var fn = function() { return null; };
    Object.defineProperty(fn, 'name', { value: name });
    return fn;
  }

  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.console = console;
  sandbox.React = r.React;
  // t() echoes the key, so assertions are locale-independent.
  sandbox.PraxisI18n = {
    t: function(key) { return key; },
    getLocale: function() { return 'en'; },
    setLocale: function() {}
  };
  sandbox.PraxisContext = {
    ACTION_TYPES: { INIT: 'INIT', LOAD_FILE: 'LOAD_FILE', SHOW_TOAST: 'SHOW_TOAST', SET_LOCALE: 'SET_LOCALE' },
    hasSavedProject: function() { return false; },
    getSavedProjectMeta: function() { return null; },
    getBackupMeta: function() { return null; },
    getUnreadableSavedData: function() { return null; },
    getSavedUIState: function() { return {}; },
    loadSavedProject: function() { return null; },
    loadBackup: function() { return null; },
    writeBackup: function() {}
  };
  sandbox.PraxisSchema = {
    PRAXIS_VERSION: '1.8.0',
    STATION_LABELS: ['0', '1', '2', '3', '4', '5', '6', '7', '8'],
    validateContext: function() { return { ok: true }; }
  };
  sandbox.PraxisIcons = { chevronLeft: stubIcon, chevronRight: stubIcon };
  sandbox.PraxisRouter = { getGuardedStation: function() { return null; } };
  sandbox.PraxisUtils = { formatDate: function(d) { return String(d); }, downloadBlob: function() {} };
  sandbox.PraxisRadioGroup = noopComponent('PraxisRadioGroup');
  sandbox.FileDropZone = noopComponent('FileDropZone');
  sandbox.Modal = noopComponent('Modal');
  sandbox.AboutModal = noopComponent('AboutModal');
  sandbox.IntersectionObserver = function() {
    return { observe: function() {}, disconnect: function() {} };
  };
  sandbox.requestAnimationFrame = function(fn) { fn(); };
  sandbox.matchMedia = function() { return { matches: false }; };
  sandbox.localStorage = { removeItem: function() {}, getItem: function() { return null; }, setItem: function() {} };
  sandbox.document = { getElementById: function() { return null; } };

  vm.createContext(sandbox);
  var full = path.join(__dirname, '..', 'js/shell/EntryLanding.js');
  vm.runInContext(fs.readFileSync(full, 'utf8'), sandbox, { filename: 'EntryLanding.js' });

  var box = r.mount(sandbox.EntryLanding, {
    dispatch: function(a) { dispatched.push(a); }
  });
  return { box: box, sandbox: sandbox, dispatched: dispatched };
}

/* Section 01, and what it is currently showing. */
function beginSection(tree) {
  return findOne(tree, byClass('wb-entry-wrap wb-entry-sec-begin'));
}
function docketTitles(tree) {
  var sec = beginSection(tree);
  return findAll(sec, function(n) {
    return typeof n.type === 'function' && n.type.name === 'DocketRow';
  }).map(function(n) { return n.props.title; });
}
function tierGroup(tree, sandbox) {
  var sec = beginSection(tree);
  return findOne(sec, function(n) { return n.type === sandbox.PraxisRadioGroup; });
}
function heroCta(tree) {
  return findOne(tree, byClass('wb-entry-btn-solid'));
}

/* ── The regression ────────────────────────────────────────────────────── */
var m = mountEntry();

var DOCKET = [
  'entry.new_title',
  'entry.open_title',
  'entry.single_title',
  'entry.examples_title',
  'entry.cockpit_title'
];

// Baseline: with no saved project, section 01 opens on the docket.
eq(JSON.stringify(docketTitles(m.box.tree)), JSON.stringify(DOCKET),
  'section 01 starts on the five-way docket');

// The hero CTA must bring you to that docket, not past it.
var cta = heroCta(m.box.tree);
assert(cta && typeof cta.props.onClick === 'function', 'hero CTA is present and clickable');
cta.props.onClick();

eq(JSON.stringify(docketTitles(m.box.tree)), JSON.stringify(DOCKET),
  'hero CTA lands on the docket (new / open / single station / examples / cockpit)');
eq(tierGroup(m.box.tree, m.sandbox), null,
  'hero CTA does NOT skip ahead to the tier picker');
eq(m.dispatched.length, 0, 'hero CTA creates no project on its own');

// The hero CTA still scrolls section 01 into view.
var m2 = mountEntry();
var scrolled = [];
var sec = beginSection(m2.box.tree);
assert(sec && sec.props.ref, 'section 01 carries the scroll ref');
sec.props.ref.current = { scrollIntoView: function(o) { scrolled.push(o); } };
heroCta(m2.box.tree).props.onClick();
eq(scrolled.length, 1, 'hero CTA scrolls section 01 into view');
eq(scrolled[0] && scrolled[0].block, 'start', 'section 01 is scrolled to its top');

// The tier picker is still reachable, from the docket row that promises it.
var m3 = mountEntry();
var newRow = findAll(beginSection(m3.box.tree), function(n) {
  return typeof n.type === 'function' && n.type.name === 'DocketRow';
}).filter(function(n) { return n.props.title === 'entry.new_title'; })[0];
assert(newRow, 'docket has a "new evaluation" row');
newRow.props.onClick();

var group = tierGroup(m3.box.tree, m3.sandbox);
assert(group, 'the "new evaluation" row opens the tier picker');
eq(JSON.stringify((group.props.options || []).map(function(o) { return o.value; })),
  JSON.stringify(['foundation', 'practitioner', 'advanced']),
  'tier picker still offers the three tiers');

// And Back from the tier picker returns to the docket.
var back = findOne(beginSection(m3.box.tree), function(n) {
  return typeof n.type === 'function' && n.type.name === 'BackButton';
});
assert(back, 'tier picker has a back button');
back.props.onClick();
eq(JSON.stringify(docketTitles(m3.box.tree)), JSON.stringify(DOCKET),
  'back from the tier picker returns to the docket');

H.summary('entry');
