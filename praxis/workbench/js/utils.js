// praxis/workbench/js/utils.js
(function(global) {
  'use strict';

  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function debounce(fn, ms) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
    };
  }

  function deepMerge(target, source) {
    var result = Object.assign({}, target);
    Object.keys(source).forEach(function(key) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
          && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }

  function downloadJSON(obj, filename) {
    var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function readFileAsJSON(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          resolve(JSON.parse(e.target.result));
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = function() { reject(new Error('Failed to read file')); };
      reader.readAsText(file);
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  global.PraxisUtils = {
    uid: uid,
    debounce: debounce,
    deepMerge: deepMerge,
    downloadJSON: downloadJSON,
    readFileAsJSON: readFileAsJSON,
    formatDate: formatDate,
    clamp: clamp
  };

})(window);
