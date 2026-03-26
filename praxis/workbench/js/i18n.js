(function(global) {
  'use strict';
  var strings = {};
  var loaded = false;
  function loadLocale(lang, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'lang/' + lang + '.json', true);
    xhr.onload = function() {
      if (xhr.status === 200) { strings = JSON.parse(xhr.responseText); loaded = true; }
      if (callback) callback();
    };
    xhr.onerror = function() {
      console.warn('Failed to load locale:', lang);
      if (callback) callback();
    };
    xhr.send();
  }
  function t(key, vars) {
    var str = strings[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) { str = str.replace('{{' + k + '}}', vars[k]); });
    }
    return str;
  }
  loadLocale('en');
  global.PraxisI18n = { loadLocale: loadLocale, t: t };
})(window);
