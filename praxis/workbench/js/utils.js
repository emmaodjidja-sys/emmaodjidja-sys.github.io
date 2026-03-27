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

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function deepMerge(target, source) {
    var result = Object.assign({}, target);
    Object.keys(source).forEach(function(key) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
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

  function readFileAsJSON(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try { resolve(JSON.parse(e.target.result)); }
        catch (err) { reject(new Error('Invalid JSON file')); }
      };
      reader.onerror = function() { reject(new Error('Failed to read file')); };
      reader.readAsText(file);
    });
  }

  function estimateJSONSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }

  window.PraxisUtils = {
    uid: uid, debounce: debounce, formatDate: formatDate,
    deepMerge: deepMerge, clamp: clamp,
    downloadJSON: downloadJSON, downloadBlob: downloadBlob,
    readFileAsJSON: readFileAsJSON, estimateJSONSize: estimateJSONSize
  };
})();
