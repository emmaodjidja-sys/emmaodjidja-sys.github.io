/**
 * AboutModal - trust surface for the workbench: authorship and methodology,
 * privacy and data handling (with a working local-data delete control),
 * contact, browser support, and release notes. Built on the shared Modal
 * component. window.AboutModal.
 */
(function() {
  'use strict';
  var h = React.createElement;

  var CONTACT_EMAIL = 'praxisai.labs@gmail.com';

  var TABS = [
    { id: 'about', label: 'About' },
    { id: 'privacy', label: 'Privacy and data' },
    { id: 'contact', label: 'Contact' },
    { id: 'support', label: 'Browser support' },
    { id: 'release', label: 'Release notes' }
  ];

  function p(text, style) {
    return h('p', { style: Object.assign({ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 12px 0' }, style || {}) }, text);
  }

  function TabButton(props) {
    return h('button', {
      type: 'button',
      role: 'tab',
      id: 'wb-about-tab-' + props.id,
      'aria-selected': props.active ? 'true' : 'false',
      'aria-controls': 'wb-about-panel-' + props.id,
      tabIndex: props.active ? 0 : -1,
      className: 'wb-tab' + (props.active ? ' wb-tab--active' : ''),
      onClick: props.onClick
    }, props.label);
  }

  function AboutModal(props) {
    var isOpen = !!props.isOpen;
    var onClose = props.onClose;
    var dispatch = props.dispatch;

    var tabState = React.useState(props.initialTab || 'about');
    var tab = tabState[0];
    var setTab = tabState[1];

    var confirmState = React.useState(false);
    var confirming = confirmState[0];
    var setConfirming = confirmState[1];

    var doneState = React.useState(false);
    var done = doneState[0];
    var setDone = doneState[1];

    // Set when a delete was requested but there was genuinely nothing saved
    // to remove, so the UI can say so instead of falsely promising a reload.
    var nothingToDeleteState = React.useState(false);
    var nothingToDelete = nothingToDeleteState[0];
    var setNothingToDelete = nothingToDeleteState[1];

    // Reset to the requested tab (and clear any pending confirmation) each
    // time the modal opens, so reopening from a different entry point (e.g.
    // the EntryLanding "Privacy" link after previously opening "About" from
    // the TopBar) lands on the right tab.
    React.useEffect(function() {
      if (isOpen) {
        setTab(props.initialTab || 'about');
        setConfirming(false);
        setDone(false);
        setNothingToDelete(false);
      }
    }, [isOpen, props.initialTab]);

    function handleDeleteAll() {
      var removed = (window.PraxisContext && PraxisContext.clearAllData) ? PraxisContext.clearAllData() : [];
      if (typeof dispatch === 'function' && window.PraxisContext) {
        dispatch({ type: PraxisContext.ACTION_TYPES.CLEAR_PROJECT });
      }
      setConfirming(false);
      if (removed.length) {
        // A full reload guarantees every part of the UI (including the
        // EntryLanding "Continue" card and backup line, which are computed
        // once at mount) reflects the deletion rather than stale in-memory
        // state. Always reload when something was actually removed, even
        // if this modal is unmounted before the timeout fires (e.g. when
        // invoked from the TopBar, where CLEAR_PROJECT closes the project
        // and unmounts this component in the same commit): the timeout is a
        // plain closure, not tied to the component's lifecycle.
        setDone(true);
        setTimeout(function() { window.location.reload(); }, 600);
      } else {
        // Nothing was actually stored: reloading would be a false promise,
        // so say so instead.
        setNothingToDelete(true);
      }
    }

    var version = PraxisSchema.PRAXIS_VERSION;

    var panels = {
      about: h('div', { role: 'tabpanel', id: 'wb-about-panel-about', 'aria-labelledby': 'wb-about-tab-about' },
        p('The PRAXIS Evaluation Workbench is authored by Emmanuel Nene Odjidja.'),
        p('Its methodology is grounded in the OECD-DAC 2019 evaluation criteria, UNEG norms and standards, and USAID ADS 201 alignment. The nine stations follow the standard evaluation lifecycle, from scoping through to reporting and presentation.'),
        h('p', { style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 12px 0' } },
          'The commissioner cockpit is built against a failure model of how evaluations go unused: decision windows missed, audiences moving on, questions nobody asked, credibility lost in the room, contacts leaving post. ',
          h('a', { href: 'player/', target: '_blank', rel: 'noopener', style: { color: 'var(--teal-ink)', fontWeight: 600 } }, 'Evaluation departures: an agent trace'),
          ' replays that failure model as an interactive, agent-based simulation.'),
        h('p', { style: { fontSize: '12px', color: 'var(--slate)', lineHeight: 1.6, margin: '16px 0 0 0', paddingTop: '12px', borderTop: '1px solid var(--border)' } },
          'Odjidja, E. N. (2026). PRAXIS Evaluation Workbench (version ' + version + ') [Software]. Contact: ' + CONTACT_EMAIL + '.')
      ),

      privacy: h('div', { role: 'tabpanel', id: 'wb-about-panel-privacy', 'aria-labelledby': 'wb-about-tab-privacy' },
        p('All data stays in this browser. Nothing is transmitted to any server.'),
        p('Your evaluation project, including any fields marked sensitive or highly sensitive in Station 0, is stored only in this browser\'s local storage (localStorage), on this device. There is no PRAXIS server and no account: closing this tab does not send anything anywhere.'),
        p('Files you export (.praxis, XLSForm, Word, PDF) are written directly to your device. Treat exported copies of sensitive projects with the same care as the project itself.'),
        h('div', { style: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' } },
          h('div', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' } }, 'Delete all workbench data'),
          p('Permanently removes your evaluation project and its backup copy from this browser. Your interface language preference is kept.', { marginBottom: '10px' }),
          done ? h('div', { style: { fontSize: '12px', color: 'var(--green-strong)' } }, 'Workbench data deleted. Reloading...')
            : nothingToDelete ? h('div', { style: { fontSize: '12px', color: 'var(--slate)' } }, 'No workbench data to delete.')
            : !confirming ? h('button', {
                type: 'button', className: 'wb-btn wb-btn-danger wb-btn-sm',
                onClick: function() { setConfirming(true); }
              }, 'Delete all workbench data')
            : h('div', null,
                h('p', { style: { fontSize: '12px', color: 'var(--red-strong)', lineHeight: 1.6, margin: '0 0 10px 0' } },
                  'This cannot be undone. Download a .praxis file first if you want to keep a copy.'),
                h('div', { style: { display: 'flex', gap: '8px' } },
                  h('button', { type: 'button', className: 'wb-btn wb-btn-outline wb-btn-sm', onClick: function() { setConfirming(false); } }, 'Cancel'),
                  h('button', { type: 'button', className: 'wb-btn wb-btn-danger wb-btn-sm', onClick: handleDeleteAll }, 'Yes, delete everything')
                )
              )
        )
      ),

      contact: h('div', { role: 'tabpanel', id: 'wb-about-panel-contact', 'aria-labelledby': 'wb-about-tab-contact' },
        p('For questions, feedback, or partnership enquiries, contact:'),
        h('a', { href: 'mailto:' + CONTACT_EMAIL, style: { fontSize: '13px', color: 'var(--teal-ink)', fontWeight: 600 } }, CONTACT_EMAIL)
      ),

      support: h('div', { role: 'tabpanel', id: 'wb-about-panel-support', 'aria-labelledby': 'wb-about-tab-support' },
        p('The workbench is built and tested for modern evergreen browsers: current versions of Chrome, Edge, Firefox, and Safari. Older or non-evergreen browsers are not supported and may not render the workbench correctly.')
      ),

      release: h('div', { role: 'tabpanel', id: 'wb-about-panel-release', 'aria-labelledby': 'wb-about-tab-release' },
        h('div', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' } }, 'v1.1'),
        h('ul', { style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: '0 0 16px 0', paddingLeft: '18px' } },
          h('li', null, 'Planning station: contract, budget, deliverables, invoices, and quality review.'),
          h('li', null, 'Worked examples: Global Fund Malaria SNT and Gavi Zero-Dose.'),
          h('li', null, 'Valid XLSForm export for the Instrument Builder.'),
          h('li', null, 'French interface for the shell and Station 0.'),
          h('li', null, 'Accessibility and durability hardening across the application.')
        ),
        h('div', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' } }, 'v1.0'),
        h('ul', { style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0, paddingLeft: '18px' } },
          h('li', null, 'Initial launch: the nine-station evaluation lifecycle, from scoping through to presentation.')
        )
      )
    };

    return h(Modal, {
      isOpen: isOpen,
      onClose: onClose,
      dismissable: true,
      title: 'About the PRAXIS Evaluation Workbench',
      width: '580px'
    },
      h('div', { role: 'tablist', 'aria-label': 'About sections', className: 'wb-tab-bar' },
        TABS.map(function(tdef) {
          return h(TabButton, {
            key: tdef.id, id: tdef.id, label: tdef.label, active: tab === tdef.id,
            onClick: function() { setTab(tdef.id); setConfirming(false); }
          });
        })
      ),
      panels[tab],
      h('div', { style: { fontSize: '11px', color: 'var(--slate)', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' } },
        'PRAXIS Evaluation Workbench, version ' + version + '.')
    );
  }

  window.AboutModal = AboutModal;
})();
