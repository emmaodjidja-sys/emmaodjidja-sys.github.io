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

  // getRoute().station is a raw parseInt result: it can be NaN (unparseable,
  // e.g. #station=abc) or out of range (e.g. #station=99). Callers that use
  // the station to restore or open a project should read it through this
  // guarded accessor instead of getRoute() directly. Returns null when there
  // is no usable station in the hash.
  function getGuardedStation() {
    var s = getRoute().station;
    if (typeof s !== 'number' || isNaN(s)) return null;
    s = Math.round(s);
    if (s < 0) s = 0;
    if (s > 9) s = 9;
    return s;
  }

  window.PraxisRouter = { getRoute: getRoute, navigate: navigate, getGuardedStation: getGuardedStation };
})();
