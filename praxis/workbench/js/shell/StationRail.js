(function() {
  'use strict';
  var h = React.createElement;

  var CONTEXT_FIELDS = [
    'evaluability', 'toc', 'evaluation_matrix', 'design_recommendation',
    'sample_parameters', 'instruments', 'analysis_plan', 'report_structure', 'presentation'
  ];

  function completedBadge() {
    return h('span', { className: 'wb-rail-check' },
      h('svg', { width: 10, height: 10, viewBox: '0 0 10 10' },
        h('circle', { cx: 5, cy: 5, r: 5, fill: 'var(--green)' }),
        h('path', { d: 'M3 5l1.5 1.5L7 4', stroke: 'var(--surface)', strokeWidth: 1.2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })
      )
    );
  }

  function staleDot() {
    return h('span', { className: 'wb-rail-stale-dot' });
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
        var isStale = !!staleness[id]; // stale regardless of completion, upstream changed
        var isActive = activeStation === id;

        var cls = 'wb-rail-btn';
        if (isActive) cls += ' wb-rail-btn--active';
        if (isCompleted) cls += ' wb-rail-btn--completed';
        if (isStale) cls += ' wb-rail-btn--stale';

        var badge = null;
        if (isCompleted && isStale) {
          // Completed but stale, show both indicators
          badge = h(React.Fragment, null, completedBadge(), staleDot());
        } else if (isCompleted) {
          badge = completedBadge();
        } else if (isStale) {
          badge = staleDot();
        }

        var railLabel = String(id) + '. ' + PraxisSchema.STATION_LABELS[id] +
          (isCompleted ? ', completed' : '') + (isStale ? ', needs review' : '');

        buttons.push(
          h('button', {
            key: id,
            className: cls,
            onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: id }); },
            title: PraxisSchema.STATION_LABELS[id],
            'aria-label': railLabel,
            'aria-current': isActive ? 'step' : null
          },
            h('span', { className: 'wb-rail-btn-num', 'aria-hidden': 'true' }, String(id)),
            badge
          )
        );
      })(i);
    }

    // Planning (optional station, index 9), a separate rail button kept out of the
    // numbered 0-8 flow. Shows a completion check once planning is marked complete.
    var planningActive = activeStation === 9;
    var planningDone = !!(context.planning && context.planning.completed_at != null);
    var pCls = 'wb-rail-btn wb-rail-btn--planning';
    if (planningActive) pCls += ' wb-rail-btn--active';
    if (planningDone) pCls += ' wb-rail-btn--completed';
    var planningBtn = h('button', {
      key: 'planning',
      className: pCls,
      onClick: function() { dispatch({ type: PraxisContext.ACTION_TYPES.SET_ACTIVE_STATION, station: 9 }); },
      title: 'Planning (optional)',
      'aria-label': 'Planning, optional' + (planningDone ? ', completed' : ''),
      'aria-current': planningActive ? 'step' : null
    }, h('span', { className: 'wb-rail-btn-num', 'aria-hidden': 'true' }, 'P'), planningDone ? completedBadge() : null);

    // Help button at bottom of rail
    var helpBtn = h('button', {
      key: 'help',
      className: 'wb-rail-btn wb-rail-btn--help',
      onClick: function() {
        if (props.onHelpToggle) props.onHelpToggle();
      },
      title: 'Help',
      'aria-label': 'Help'
    }, h('span', { className: 'wb-rail-btn-num', 'aria-hidden': 'true' }, '?'));

    return h('nav', { className: 'wb-rail', 'aria-label': 'Stations' }, buttons.concat([planningBtn, helpBtn]));
  }

  window.StationRail = StationRail;
})();
