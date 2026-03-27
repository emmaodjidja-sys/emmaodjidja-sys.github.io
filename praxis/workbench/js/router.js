(function() {
  'use strict';

  function getRoute() {
    var hash = window.location.hash.slice(1);
    var params = {};
    hash.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      if (parts[0]) params[parts[0]] = decodeURIComponent(parts[1] || '');
    });
    return {
      station: params.station !== undefined ? parseInt(params.station, 10) : null,
      mode: params.mode || null,
      params: params
    };
  }

  function navigate(station, mode, extra) {
    var parts = [];
    if (station !== null && station !== undefined) parts.push('station=' + station);
    if (mode) parts.push('mode=' + encodeURIComponent(mode));
    if (extra) {
      Object.keys(extra).forEach(function(k) {
        if (k !== 'station' && k !== 'mode') parts.push(k + '=' + encodeURIComponent(extra[k]));
      });
    }
    window.location.hash = parts.join('&');
  }

  window.PraxisRouter = { getRoute: getRoute, navigate: navigate };
})();
