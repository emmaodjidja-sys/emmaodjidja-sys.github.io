/**
 * RoleSwitch: the top-level lens toggle (Evaluation Team | Commissioner). Segmented
 * control in the TopBar identity block, mirroring the EN|FR switch so it reads as native
 * chrome. Changing it swaps the rail and body; the project (and its title) stay constant.
 * window.RoleSwitch.
 */
(function() {
  'use strict';
  var h = React.createElement;

  function RoleSwitch(props) {
    var role = props.state.ui.role;
    var dispatch = props.dispatch;
    function choose(r) { if (role !== r) dispatch({ type: PraxisContext.ACTION_TYPES.SET_ROLE, role: r }); }
    function btn(r, label) {
      var active = role === r;
      return h('button', {
        type: 'button', onClick: function() { choose(r); },
        'aria-pressed': active ? 'true' : 'false',
        className: 'wb-roleswitch-btn' + (active ? ' wb-roleswitch-btn--active' : ''),
        style: {
          border: 'none', cursor: 'pointer', padding: '3px 10px',
          fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.02em',
          fontFamily: 'inherit', lineHeight: 1.4,
          background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
          color: active ? '#fff' : 'rgba(255,255,255,0.55)'
        }
      }, label);
    }
    return h('div', { className: 'wb-roleswitch', role: 'group', 'aria-label': 'Working as',
      style: { display: 'inline-flex', alignItems: 'center', gap: '8px' } },
      h('span', { className: 'wb-roleswitch-lbl', style: { fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' } }, 'Working as'),
      h('div', { className: 'wb-roleswitch-seg', style: { display: 'inline-flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', overflow: 'hidden' } },
        btn('evaluator', 'Evaluation Team'), btn('commissioner', 'Commissioner')));
  }

  window.RoleSwitch = RoleSwitch;
})();
