(function(global) {
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
    var writtenFields = PraxisSchema.STATION_WRITES[changedStationId] || [];
    var newStaleness = Object.assign({}, currentStaleness);
    newStaleness[changedStationId] = false;
    for (var i = 0; i <= 8; i++) {
      if (i === changedStationId) continue;
      var deps = UPSTREAM_DEPS[i] || [];
      for (var j = 0; j < deps.length; j++) {
        if (writtenFields.indexOf(deps[j]) !== -1) {
          newStaleness[i] = true;
          break;
        }
      }
    }
    return newStaleness;
  }
  global.PraxisStaleness = { UPSTREAM_DEPS: UPSTREAM_DEPS, computeStaleness: computeStaleness };
})(window);
