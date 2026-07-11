(function() {
  'use strict';

  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      var args = arguments, ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  // Parse a date-only or leading-date ISO string into [year, month, day] integers.
  // Never uses new Date(string): 'YYYY-MM-DD' parses as UTC midnight, which shifts a
  // calendar day for users west of UTC. Returns null when there is no leading date.
  function ymd(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? [+m[1], +m[2], +m[3]] : null;
  }

  // Whole-day difference from today for a date-only value, in the user's LOCAL calendar:
  // positive = future, 0 = today, negative = overdue. Both endpoints are local midnight,
  // so DST cannot introduce an off-by-one. Returns null for an unparseable value.
  function daysUntilLocal(iso) {
    var a = ymd(iso);
    if (!a) return null;
    var due = new Date(a[0], a[1] - 1, a[2]);
    var n = new Date();
    var today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.round((due - today) / 86400000);
  }

  // Whole-day difference between two date-only values in the user's LOCAL
  // calendar: positive when b is after a. Same local-midnight construction as
  // daysUntilLocal, so DST cannot introduce an off-by-one. Null when either
  // side has no leading YYYY-MM-DD.
  function diffDaysLocal(aIso, bIso) {
    var a = ymd(aIso), b = ymd(bIso);
    if (!a || !b) return null;
    var da = new Date(a[0], a[1] - 1, a[2]);
    var db = new Date(b[0], b[1] - 1, b[2]);
    return Math.round((db - da) / 86400000);
  }

  // Add n calendar months to a date-only ISO string, clamping the day to the target
  // month's last day (Aug 31 + 6 -> Feb 28/29). To get the k-th occurrence from an
  // anchor, call addMonths(anchor, interval*k) so the day re-clamps from the true
  // anchor each time and does not creep earlier. Returns 'YYYY-MM-DD' or null.
  function addMonths(iso, n) {
    var a = ymd(iso);
    if (!a) return null;
    var idx = (a[1] - 1) + n, ny = a[0] + Math.floor(idx / 12), nm = ((idx % 12) + 12) % 12;
    var last = new Date(ny, nm + 1, 0).getDate();
    var nd = Math.min(a[2], last);
    return ny + '-' + String(nm + 1).padStart(2, '0') + '-' + String(nd).padStart(2, '0');
  }

  function formatDate(iso) {
    if (!iso) return '';
    var a = ymd(iso);
    var d = (a && String(iso).indexOf('T') === -1) ? new Date(a[0], a[1] - 1, a[2]) : new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  // Keys that must never be copied between objects. JSON.parse can produce an
  // own "__proto__" key, and assigning it via [[Set]] swaps the prototype of
  // the receiving object. "constructor" and "prototype" are stripped as hygiene.
  var UNSAFE_KEYS = { '__proto__': true, 'constructor': true, 'prototype': true };

  function deepMerge(target, source) {
    var result = {};
    Object.keys(target || {}).forEach(function(key) {
      if (UNSAFE_KEYS[key]) return;
      result[key] = target[key];
    });
    Object.keys(source || {}).forEach(function(key) {
      if (UNSAFE_KEYS[key]) return;
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  // Filename-safe string: strips characters invalid on Windows or awkward
  // cross-platform, collapses whitespace to hyphens, trims separators.
  function sanitizeFilename(name, fallback) {
    var s = String(name == null ? '' : name).trim();
    s = s.replace(/[^a-zA-Z0-9._ -]+/g, ' ');
    s = s.replace(/\s+/g, '-');
    s = s.replace(/-{2,}/g, '-');
    s = s.replace(/^[-._]+/, '').replace(/[-._]+$/, '');
    if (s.length > 120) s = s.slice(0, 120);
    return s || fallback || 'file';
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  var MAX_IMPORT_BYTES = 10 * 1024 * 1024;

  function readFileAsJSON(file) {
    return new Promise(function(resolve, reject) {
      if (file && typeof file.size === 'number' && file.size > MAX_IMPORT_BYTES) {
        reject(new Error('the file exceeds the 10 MB import limit'));
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        try { resolve(JSON.parse(e.target.result)); }
        catch (err) { reject(new Error('not valid JSON')); }
      };
      reader.onerror = function() { reject(new Error('the file could not be read')); };
      reader.readAsText(file);
    });
  }

  function estimateJSONSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }

  window.PraxisUtils = {
    uid: uid, debounce: debounce, formatDate: formatDate, formatTime: formatTime,
    ymd: ymd, daysUntilLocal: daysUntilLocal, diffDaysLocal: diffDaysLocal, addMonths: addMonths,
    deepMerge: deepMerge, clamp: clamp, sanitizeFilename: sanitizeFilename,
    downloadJSON: downloadJSON, downloadBlob: downloadBlob,
    readFileAsJSON: readFileAsJSON, estimateJSONSize: estimateJSONSize,
    MAX_IMPORT_BYTES: MAX_IMPORT_BYTES
  };
})();
