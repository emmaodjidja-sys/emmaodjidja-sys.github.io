(function() {
  'use strict';
  var h = React.createElement;

  var CONTEXT_FIELDS = [
    'evaluability', 'toc', 'evaluation_matrix', 'design_recommendation',
    'sample_parameters', 'instruments', 'analysis_plan', 'report_structure', 'presentation'
  ];

  function completedBadge() {
    return h('span', {
      style: { position: 'absolute', top: 2, right: 2, width: 10, height: 10 }
    },
      h('svg', { width: 10, height: 10, viewBox: '0 0 10 10' },
        h('circle', { cx: 5, cy: 5, r: 5, fill: '#10B981' }),
        h('path', { d: 'M3 5l1.5 1.5L7 4', stroke: '#fff', strokeWidth: 1.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })
      )
    );
  }

  function staleDot() {
    return h('span', {
      style: {
        position: 'absolute', top: 2, right: 2,
        width: 6, height: 6, borderRadius: '50%', background: '#F59E0B'
      }
    });
  }

  function StationRail(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;
    var activeStation = state.ui.activeStation;
    var staleness = context.staleness || {};

    var buttons = [];
    for (var i = 0; i < 9; i++) {
      (function(id) {
        var field = context[CONTEXT_FIELDS[id]] || {};
        var isCompleted = field.completed_at != null;
        var isStale = !isCompleted && staleness[id];
        var isActive = activeStation === id;

        var cls = 'wb-rail-btn';
        if (isActive) cls += ' wb-rail-btn--active';
        if (isCompleted) cls += ' wb-rail-btn--completed';
        if (isStale) cls += ' wb-rail-btn--stale';

        var badge = null;
        if (isCompleted) badge = completedBadge();
        else if (isStale) badge = staleDot();

        buttons.push(
          h('button', {
            key: id,
            className: cls,
            onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: id }); },
            style: { position: 'relative' },
            title: PraxisSchema.STATION_LABELS[id]
          },
            h('span', { style: { fontSize: '10px', fontWeight: 700 } }, String(id)),
            badge
          )
        );
      })(i);
    }

    return h('nav', { className: 'wb-rail' }, buttons);
  }

  window.StationRail = StationRail;
})();
