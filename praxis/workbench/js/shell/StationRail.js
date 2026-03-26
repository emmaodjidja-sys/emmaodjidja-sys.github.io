(function(global) {
  'use strict';
  var h = React.createElement;
  function StationButton(props) {
    var isActive = props.active;
    var isStale = props.stale;
    var isComplete = props.complete;
    var cls = 'wb-rail-btn' + (isActive ? ' wb-rail-btn-active' : '');
    return h('button', {
      className: cls,
      onClick: function() { props.onClick(props.index); },
      title: PraxisI18n.t('station.' + props.index)
    },
      h('span', { className: 'wb-rail-num' }, props.index),
      isStale ? h('span', { className: 'wb-rail-dot wb-rail-dot-stale' }) : null,
      isComplete ? h('span', { className: 'wb-rail-dot wb-rail-dot-complete' }) : null
    );
  }
  function StationRail(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;
    var completedFields = [
      'evaluability', 'toc', 'evaluation_matrix', 'design_recommendation',
      'sample_parameters', 'instruments', 'analysis_plan', 'report_structure', 'presentation'
    ];
    var buttons = [];
    for (var i = 0; i <= 8; i++) {
      (function(idx) {
        var field = completedFields[idx];
        var isComplete = context[field] && context[field].completed_at;
        buttons.push(h(StationButton, {
          key: idx,
          index: idx,
          active: state.ui.activeStation === idx,
          stale: context.staleness[idx],
          complete: !!isComplete,
          onClick: function(n) {
            dispatch({ type: PraxisContext.ACTION.SET_ACTIVE_STATION, station: n });
          }
        }));
      })(i);
    }
    return h('nav', { className: 'wb-rail', 'aria-label': 'Stations' }, buttons);
  }
  global.PraxisStationRail = StationRail;
})(window);
