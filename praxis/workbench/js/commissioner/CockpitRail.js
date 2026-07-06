/**
 * CockpitRail: the left rail shown when the role is Commissioner. Overview + C0-C5,
 * plus a control to switch back to the Evaluation Team lens. Mirrors StationRail's
 * markup so it reads as the same navigation. window.CockpitRail.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var AT = PraxisContext.ACTION_TYPES;
  var I = window.PraxisIcons;
  var D = window.CockpitData;

  function CockpitRail(props) {
    var cs = props.state.ui.commissionerStation;
    var dispatch = props.dispatch;

    var back = h('button', { type: 'button', className: 'wb-rail-btn wb-rail-btn--back',
      title: 'Back to Evaluation Team', 'aria-label': 'Switch to the Evaluation Team lens',
      onClick: function() { dispatch({ type: AT.SET_ROLE, role: 'evaluator' }); } },
      h('span', { className: 'wb-rail-btn-num', 'aria-hidden': 'true' }, I.arrowLeft(16)));

    var buttons = D.STATIONS.map(function(s) {
      var isActive = cs === s.idx;
      var cls = 'wb-rail-btn wb-rail-btn--commissioner' + (isActive ? ' wb-rail-btn--active' : '');
      return h('button', { key: s.idx, type: 'button', className: cls,
        'aria-current': isActive ? 'true' : null,
        title: (s.code ? s.code + ' ' : '') + s.label,
        'aria-label': (s.code ? s.code + ', ' : '') + s.label,
        onClick: function() { dispatch({ type: AT.SET_COMMISSIONER_STATION, station: s.idx }); } },
        h('span', { className: 'wb-rail-btn-num', 'aria-hidden': 'true' }, s.idx === 0 ? 'Ov' : s.code));
    });

    return h('nav', { className: 'wb-rail wb-rail--commissioner', 'aria-label': 'Commissioner stations' },
      [back].concat(buttons));
  }

  window.CockpitRail = CockpitRail;
})();
