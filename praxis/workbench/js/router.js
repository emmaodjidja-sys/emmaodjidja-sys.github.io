(function(global) {
  'use strict';
  function getRoute() {
    var hash = window.location.hash.slice(1);
    var params = {};
    hash.split('&').forEach(function(part) {
      var kv = part.split('=');
      if (kv[0]) params[kv[0]] = kv[1] || '';
    });
    return { station: params.station != null ? parseInt(params.station, 10) : null, mode: params.mode || null };
  }
  function navigate(station, mode) {
    var parts = [];
    if (station != null) parts.push('station=' + station);
    if (mode) parts.push('mode=' + mode);
    window.location.hash = parts.join('&');
  }
  global.PraxisRouter = { getRoute: getRoute, navigate: navigate };
})(window);
