/**
 * CockpitCommission: C0 Commission ("Design for use"), the first working station of the
 * commissioner cockpit. Names the governance frame (funder profile, purpose, the decision
 * the evaluation serves, oversight and evaluation manager), builds the intended-user
 * register, and reads back an influence/interest engagement grid plus a use-to-question
 * coverage meter that flags any orphaned primary user (a stated use that no evaluation
 * question serves) before the inception gate.
 *
 * Returns ONLY the station body (a section). CockpitShell renders the persistent cockpit
 * header above. Ported markup/classes come from the old Commissioner.commissionMovement.
 * window.CockpitCommission.
 */
(function() {
  'use strict';
  var h = React.createElement;
  var A = window.CockpitAtoms;
  var D = window.CockpitData;
  var I = window.PraxisIcons;
  var U = window.PraxisUtils;
  var SectionCard = window.SectionCard;

  // Influence/interest level picker for a user row (ported). "Infl" / "Inte" stay
  // distinct because both words start with I.
  function levelSelect(value, label, onChange) {
    var abbr = label.slice(0, 4);
    var set = D.LEVELS.indexOf(value) >= 0;
    var opts = [h('option', { key: '_unset', value: '' }, abbr + ': set')].concat(
      D.LEVELS.slice().reverse().map(function(l) { return h('option', { key: l, value: l }, abbr + ': ' + l.charAt(0).toUpperCase() + l.slice(1)); }));
    return h('select', { className: 'wb-cm-lvl-sel wb-cm-lvl-sel--' + (set ? value : 'unset'), value: set ? value : '', 'aria-label': label, title: label, onChange: function(e) { onChange(e.target.value); } }, opts);
  }

  // Influence x interest engagement map, derived from the intended-user register. Ranks
  // and plots each partner into manage closely / keep satisfied / keep informed / monitor,
  // then lists them so the commissioner can see, at any point, who to manage or inform.
  // The 2x2 plot is aria-hidden (decorative); the ranked roster is the accessible source.
  function stakeholderGrid(users) {
    var ranked = D.rankUsers(users);
    return h('div', { className: 'wb-cm-grid-wrap' },
      h('div', { className: 'wb-cm-grid-title' }, 'Engage the right users'),
      stakeholderPlot(ranked),
      engagementRoster(ranked));
  }

  function stakeholderPlot(ranked) {
    var byKey = {};
    D.STRATEGIES.forEach(function(s) { byKey[s.key] = []; });
    ranked.forEach(function(r) { if (!r.unrated) byKey[r.strategy].push(r); });
    return h(React.Fragment, null,
      h('div', { className: 'wb-cm-grid', 'aria-hidden': 'true' },
        D.STRATEGIES.map(function(s) {
          return h('div', { key: s.key, className: 'wb-cm-quad wb-cm-quad--' + s.quad + ' wb-cm-quad--' + s.color },
            h('span', { className: 'wb-cm-quad-t' }, s.label),
            h('span', { className: 'wb-cm-quad-s' }, s.gloss),
            h('div', { className: 'wb-cm-quad-marks' }, byKey[s.key].map(function(r) {
              var primary = r.user.tier === 'primary';
              return h('span', { key: r.user.id || r.rank,
                className: 'wb-cm-pin' + (primary ? ' wb-cm-pin--primary' : ' wb-cm-pin--secondary') }, String(r.rank));
            })));
        }),
        h('span', { className: 'wb-cm-axis wb-cm-axis--y' }, 'Influence'),
        h('span', { className: 'wb-cm-axis wb-cm-axis--x' }, 'Interest')),
      h('div', { className: 'wb-cm-grid-legend', 'aria-hidden': 'true' },
        h('span', null, h('i', { className: 'wb-cm-pin wb-cm-pin--primary wb-cm-pin--static' }), 'Primary'),
        h('span', null, h('i', { className: 'wb-cm-pin wb-cm-pin--secondary wb-cm-pin--static' }), 'Secondary')));
  }

  function engagementRoster(ranked) {
    var groups = D.STRATEGIES.map(function(s) {
      return { s: s, items: ranked.filter(function(r) { return r.strategy === s.key; }) };
    }).filter(function(g) { return g.items.length; });
    var unplaced = ranked.filter(function(r) { return r.unrated; });
    return h('div', { className: 'wb-cm-roster', role: 'list', 'aria-label': 'Stakeholder engagement roster' },
      groups.map(function(g) {
        return h('div', { key: g.s.key, className: 'wb-cm-rgroup' },
          h('div', { className: 'wb-cm-rgroup-head wb-cm-rgroup-head--' + g.s.color },
            h('span', { className: 'wb-cm-rgroup-dot', 'aria-hidden': 'true' }),
            h('span', { className: 'wb-cm-rgroup-name' }, g.s.label),
            h('span', { className: 'wb-cm-rgroup-gloss' }, g.s.gloss),
            h('span', { className: 'wb-cm-rgroup-count' }, String(g.items.length))),
          h('ul', { className: 'wb-cm-rlist' }, g.items.map(rosterRow)));
      }),
      unplaced.length ? h('div', { className: 'wb-cm-rgroup wb-cm-rgroup--unplaced' },
        h('div', { className: 'wb-cm-rgroup-head wb-cm-rgroup-head--slate' },
          h('span', { className: 'wb-cm-rgroup-dot wb-cm-rgroup-dot--hollow', 'aria-hidden': 'true' }),
          h('span', { className: 'wb-cm-rgroup-name' }, 'To place'),
          h('span', { className: 'wb-cm-rgroup-gloss' }, 'set influence and interest'),
          h('span', { className: 'wb-cm-rgroup-count' }, String(unplaced.length))),
        h('ul', { className: 'wb-cm-rlist' }, unplaced.map(rosterRow))) : null);
  }

  function rosterRow(r) {
    var u = r.user;
    var primary = u.tier === 'primary';
    var titleText = (u.name || 'Unnamed partner') + (u.role ? ' (' + u.role + ')' : '') +
      ' - influence ' + fullLevel(u.influence) + ', interest ' + fullLevel(u.interest);
    return h('li', { key: u.id || (u.name + '_' + (r.rank || 'x')), className: 'wb-cm-rrow', role: 'listitem', title: titleText },
      h('span', { className: 'wb-cm-rrank', 'aria-hidden': 'true' }, r.unrated ? '-' : String(r.rank)),
      h('span', { className: 'wb-cm-rmain' },
        h('span', { className: 'wb-cm-rtop' },
          u.name ? h('span', { className: 'wb-cm-rname' }, u.name) : h('span', { className: 'wb-cm-rname wb-cm-muted' }, 'Unnamed partner'),
          h('span', { className: 'wb-cm-rtier wb-cm-rtier--' + (primary ? 'p' : 's') }, primary ? 'primary' : 'secondary')),
        h('span', { className: 'wb-cm-rmeta' },
          h('span', { className: 'wb-cm-rlvls' }, levelReadout(u)),
          u.role ? h('span', { className: 'wb-cm-rrole' }, u.role) : null)));
  }

  function levelReadout(u) {
    function ab(v) { return (D.WEIGHT[v] === undefined) ? '-' : v.charAt(0).toUpperCase(); }
    return 'Infl ' + ab(u.influence) + ' / Int ' + ab(u.interest);
  }
  function fullLevel(v) { return (D.WEIGHT[v] === undefined) ? 'unset' : v; }

  function Commission(props) {
    var context = props.state.context;
    var dispatch = props.dispatch;
    var api = window.CockpitSave.make(context, dispatch);
    var cm = context.commissioner || D.defaultCommissioner();
    var users = cm.users || [];
    var rows = (context.evaluation_matrix && context.evaluation_matrix.rows) || [];
    var gov = cm.governance || {};
    var profile = D.profileOf(gov);
    var usersApi = api.listSetter('users');

    function addUser(tier) {
      usersApi.add({ id: U.uid('usr_'), name: '', role: '', tier: tier, intended_use: '', decision_window: '', influence: '', interest: '', eq_refs: [] }, 'Intended user added');
    }

    // ---- governance -------------------------------------------------------
    // A single text field saved on blur. `keyed` inputs (oversight, manager) re-mount
    // when the funder profile is chosen so their defaulted values render immediately.
    function govText(key, label, placeholder, keyed) {
      return h('div', { className: 'wb-cm-focus-field' },
        h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-' + key }, label),
        h('input', { id: 'cm-' + key, className: 'wb-input wb-cm-focus-input', type: 'text', placeholder: placeholder,
          key: keyed ? key + '-' + (gov.funder_profile || 'none') : null,
          defaultValue: gov[key] || '', onBlur: function(e) { var p = {}; p[key] = e.target.value; api.setGov(p); } }));
    }

    var profilePicker = gov.funder_profile ? null : h('div', { className: 'wb-cm-focus-field' },
      h('span', { className: 'wb-cm-focus-label' }, 'Commissioner profile'),
      h('div', { className: 'wb-cm-add', style: { marginTop: 4 } },
        ['global_fund', 'gavi'].map(function(k) {
          return h('button', { key: k, type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline',
            onClick: function() { api.setGov({ funder_profile: k, oversight_body: D.PROFILES[k].oversight, evaluation_manager: D.PROFILES[k].manager }, 'Commissioner profile set'); } }, D.PROFILES[k].label);
        })),
      h('p', { className: 'wb-cm-hint', style: { margin: '6px 0 0' } }, 'Choose the commissioning standard. It sets a default oversight body and evaluation manager, which you can refine below.'));

    var governance = h(SectionCard, { title: 'Governance', badge: gov.funder_profile ? profile.label : null },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
        profilePicker,
        h('div', { className: 'wb-cm-focus' },
          h('div', { className: 'wb-cm-focus-field' },
            h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-purpose' }, 'Evaluation purpose'),
            h('textarea', { id: 'cm-purpose', className: 'wb-input wb-cm-focus-input', rows: 2, placeholder: 'What this evaluation is for, in one or two sentences.',
              defaultValue: gov.purpose || '', onBlur: function(e) { api.setGov({ purpose: e.target.value }); } })),
          h('div', { className: 'wb-cm-focus-field' },
            h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-use' }, 'Primary intended use'),
            h('textarea', { id: 'cm-use', className: 'wb-input wb-cm-focus-input', rows: 2, placeholder: 'The single most important use, and by whom (the "so that").',
              defaultValue: gov.primary_use || '', onBlur: function(e) { api.setGov({ primary_use: e.target.value }); } }))),
        h('div', { className: 'wb-cm-focus-field' },
          h('label', { className: 'wb-cm-focus-label', htmlFor: 'cm-decision_clock' }, 'Decision this evaluation serves'),
          h('input', { id: 'cm-decision_clock', className: 'wb-input wb-cm-focus-input', type: 'text', placeholder: 'e.g. Grant Cycle 8 funding requests',
            defaultValue: gov.decision_clock || '', onBlur: function(e) { api.setGov({ decision_clock: e.target.value }); } })),
        h('div', { className: 'wb-cm-focus' },
          govText('oversight_body', 'Independent oversight body', profile.oversight, true),
          govText('evaluation_manager', 'Evaluation manager', profile.manager, true))));

    // ---- intended-user register ------------------------------------------
    var primary = users.filter(function(u) { return u.tier === 'primary'; });
    var secondary = users.filter(function(u) { return u.tier === 'secondary'; });
    var usesDefined = users.filter(function(u) { return (u.intended_use || '').trim(); });
    var usesCovered = usesDefined.filter(function(u) { return (u.eq_refs || []).length; });
    var coveragePct = usesDefined.length ? (usesCovered.length / usesDefined.length) * 100 : 0;
    var orphans = D.orphanUsers(users);

    function userTable(list, tier) {
      if (!list.length) return null;
      return h('div', { className: 'wb-table-container' },
        h('table', { className: 'wb-table wb-cm-table wb-cm-user-table' },
          h('thead', null, h('tr', null,
            h('th', null, tier === 'primary' ? 'Primary intended user' : 'Secondary user'),
            h('th', null, 'Intended use (the decision or action)'),
            h('th', { style: { minWidth: 120 } }, 'Needs it by'),
            h('th', { className: 'wb-th--center', style: { width: 92 } }, 'Serves EQ'),
            h('th', { className: 'wb-th--center', style: { width: 116 } }, 'Influence / interest'),
            h('th', { style: { width: 34 } }, ''))),
          h('tbody', null, list.map(function(u) {
            var nums = D.refsToNumbers(u.eq_refs, rows);
            return h('tr', { key: u.id },
              h('td', null,
                h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--strong', type: 'text', placeholder: 'user / body', defaultValue: u.name || '', 'aria-label': 'User name', onBlur: function(e) { usersApi.set(u.id, { name: e.target.value }); } }),
                h('input', { className: 'wb-input wb-cm-inp wb-cm-inp--sub', type: 'text', placeholder: 'role', defaultValue: u.role || '', 'aria-label': 'User role', onBlur: function(e) { usersApi.set(u.id, { role: e.target.value }); } })),
              h('td', null, h('textarea', { className: 'wb-input wb-cm-inp', rows: 2, placeholder: 'what they will do with the findings', defaultValue: u.intended_use || '', 'aria-label': 'Intended use', onBlur: function(e) { usersApi.set(u.id, { intended_use: e.target.value }); } })),
              h('td', null, h('input', { className: 'wb-input wb-cm-inp', type: 'text', placeholder: 'decision window', defaultValue: u.decision_window || '', 'aria-label': 'Decision window', onBlur: function(e) { usersApi.set(u.id, { decision_window: e.target.value }); } })),
              h('td', { className: 'wb-th--center' }, rows.length
                ? h('input', { className: 'wb-input wb-cm-inp wb-cm-eqinp' + (nums.length ? '' : ' wb-cm-eqinp--empty'), type: 'text', placeholder: 'e.g. 1, 13', defaultValue: nums.join(', '), title: 'Evaluation questions that serve this use', 'aria-label': 'Evaluation questions serving this use', onBlur: function(e) { usersApi.set(u.id, { eq_refs: D.numbersToRefs(e.target.value, rows) }); } })
                : h('span', { className: 'wb-cm-muted' }, '-')),
              h('td', { className: 'wb-th--center' }, h('div', { className: 'wb-cm-lvls' },
                levelSelect(u.influence, 'Influence', function(v) { usersApi.set(u.id, { influence: v }); }),
                levelSelect(u.interest, 'Interest', function(v) { usersApi.set(u.id, { interest: v }); }))),
              h('td', null, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-ghost', 'aria-label': 'Remove user', onClick: function() { usersApi.remove(u.id, 'Intended user removed'); } }, I.close(14))));
          }))));
    }

    // Coverage panel, upgraded to flag orphaned primary users (a stated use that no
    // evaluation question serves): the sharpest utilization failure to close before spend.
    function coveragePanel() {
      var tone = usesDefined.length ? (usesCovered.length === usesDefined.length ? 'good' : 'warn') : 'teal';
      var gap = usesDefined.length - usesCovered.length;
      var names = orphans.map(function(u) { return (u.name || '').trim() || 'unnamed user'; }).join(', ');
      return h('div', { className: 'wb-cm-cov' },
        h('div', { className: 'wb-cm-cov-head' },
          h('span', { className: 'wb-cm-cov-title' }, 'Use-to-question coverage'),
          h('span', { className: 'wb-cm-cov-num' }, usesDefined.length ? (usesCovered.length + '/' + usesDefined.length) : '-')),
        A.meterBar(coveragePct, tone === 'good' ? 'green' : (tone === 'warn' ? 'amber' : 'teal'), 'Use-to-question coverage'),
        h('p', { className: 'wb-cm-cov-note' }, usesDefined.length
          ? (gap > 0
              ? gap + ' intended use' + (gap > 1 ? 's are' : ' is') + ' not yet served by any evaluation question. Fix the design before the gate.'
              : 'Every named use is served by at least one evaluation question.')
          : 'Add intended uses, then link the questions that serve each. Uncovered uses are design gaps to close before spend.'),
        orphans.length ? h('p', { className: 'wb-cm-cov-note', style: { color: 'var(--red)', fontWeight: 700 } },
          orphans.length + ' primary user' + (orphans.length > 1 ? 's have' : ' has') + ' a use that no evaluation question serves: ' + names + '. Close this before the gate.') : null);
    }

    var registerBody = users.length
      ? h('div', { className: 'wb-cm-two' },
          h('div', { className: 'wb-cm-two-main' },
            h('div', { className: 'wb-cm-sub' }, 'Primary intended users', h('span', { className: 'wb-cm-sub-count' }, primary.length)),
            primary.length ? userTable(primary, 'primary') : h('p', { className: 'wb-cm-hint' }, 'Name the users who will act on this evaluation. Their decisions shape the questions.'),
            h('div', { className: 'wb-cm-sub wb-cm-sub--mt' }, 'Secondary users', h('span', { className: 'wb-cm-sub-count' }, secondary.length)),
            userTable(secondary, 'secondary'),
            h('div', { className: 'wb-cm-add' },
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { addUser('primary'); } }, I.plus(14), ' Primary user'),
              h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { addUser('secondary'); } }, I.plus(14), ' Secondary user'))),
          h('div', { className: 'wb-cm-two-side' },
            stakeholderGrid(users),
            coveragePanel()))
      : h('div', { className: 'wb-station-empty' },
          h('div', { className: 'wb-station-empty-title' }, 'Name the primary intended users'),
          h('div', { className: 'wb-station-empty-desc' }, 'No intended users yet. Name who will use this evaluation, and their decisions become the test the design has to pass.'),
          h('div', { className: 'wb-cm-add' }, h('button', { type: 'button', className: 'wb-btn wb-btn-sm wb-btn-outline', onClick: function() { addUser('primary'); } }, I.plus(14), ' Add a primary user')));

    var register = h(SectionCard, { title: 'Intended-user register', badge: users.length ? String(users.length) : null }, registerBody);

    return h('section', { className: 'wb-cm-move', 'aria-label': 'Commission' },
      A.moveHead('C0', 'Commission', 'Design for use', 'Name the primary intended users and the decisions they must make, then make sure the design serves each one.'),
      governance,
      register);
  }

  window.CockpitCommission = Commission;
})();
