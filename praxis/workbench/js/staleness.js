(function() {
  'use strict';

  var UPSTREAM_DEPS = {
    0: [],
    1: ['project_meta'],
    2: ['project_meta', 'toc', 'tor_constraints', 'evaluability'],
    3: ['tor_constraints', 'project_meta'],
    4: ['design_recommendation', 'evaluation_matrix'],
    5: ['evaluation_matrix'],
    6: ['evaluation_matrix', 'instruments', 'sample_parameters'],
    7: ['evaluation_matrix', 'analysis_plan'],
    8: ['evaluation_matrix', 'design_recommendation', 'sample_parameters', 'report_structure']
  };

  function computeStaleness(changedStationId, currentStaleness) {
    var writtenFields = PraxisSchema.STATION_FIELDS[changedStationId];
    if (!writtenFields) return currentStaleness;

    var newStaleness = Object.assign({}, currentStaleness);
    newStaleness[changedStationId] = false;

    for (var stationId = 0; stationId <= 8; stationId++) {
      if (stationId === changedStationId) continue;
      var deps = UPSTREAM_DEPS[stationId];
      for (var i = 0; i < deps.length; i++) {
        if (writtenFields.indexOf(deps[i]) !== -1) {
          newStaleness[stationId] = true;
          break;
        }
      }
    }
    return newStaleness;
  }

  window.PraxisStaleness = {
    UPSTREAM_DEPS: UPSTREAM_DEPS,
    computeStaleness: computeStaleness
  };
})();
