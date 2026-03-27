(function() {
  'use strict';

  var strings = {};
  var currentLocale = 'en';

  function loadLocale(locale) {
    var xhr = new XMLHttpRequest();
    var path = (window.PRAXIS_BASE_PATH || '') + 'lang/' + locale + '.json';
    xhr.open('GET', path, false);
    xhr.send();
    if (xhr.status === 200) {
      strings = JSON.parse(xhr.responseText);
      currentLocale = locale;
    }
  }

  function t(key, vars) {
    var str = strings[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function(k) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function setLocale(locale) {
    loadLocale(locale);
  }

  function getLocale() { return currentLocale; }

  try { loadLocale('en'); } catch (e) { }

  window.PraxisI18n = { t: t, setLocale: setLocale, getLocale: getLocale };
})();
