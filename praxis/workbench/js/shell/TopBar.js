(function() {
  'use strict';
  var h = React.createElement;

  function TopBar(props) {
    var state = props.state;
    var dispatch = props.dispatch;
    var context = state.context;
    var meta = context.project_meta || {};
    var titleRef = React.useRef(null);
    var titleVal = React.useState(meta.title || '');
    var title = titleVal[0];
    var setTitle = titleVal[1];
    var aboutState = React.useState(false);
    var aboutOpen = aboutState[0];
    var setAboutOpen = aboutState[1];

    React.useEffect(function() {
      setTitle(meta.title || '');
    }, [meta.title]);

    function handleBlur() {
      if (title !== (meta.title || '')) {
        dispatch({ type: PraxisContext.ACTION_TYPES.UPDATE_PROJECT_META, meta: { title: title } });
      }
    }

    function handleSave() {
      var fname = PraxisUtils.sanitizeFilename(meta.title || 'evaluation', 'evaluation') + '.praxis';
      PraxisUtils.downloadJSON(PraxisSchema.withFileHeader(context), fname);
      dispatch({ type: PraxisContext.ACTION_TYPES.SHOW_TOAST, message: 'Project file downloaded as ' + fname + '.', toastType: 'success' });
    }

    function handleBackToStart() {
      dispatch({ type: PraxisContext.ACTION_TYPES.SET_PROJECT_LOADED, loaded: false });
    }

    // Autosave state indicator, driven by ui.persistStatus / ui.lastSavedAt
    var persistStatus = state.ui.persistStatus;
    var lastSavedAt = state.ui.lastSavedAt;
    var indicator = null;
    var indicatorTextStyle = { fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.55)', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' };
    function dot(color) {
      return h('span', { 'aria-hidden': 'true', style: { width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 } });
    }
    if (persistStatus === 'error') {
      indicator = h('button', {
        type: 'button',
        className: 'wb-btn wb-btn-ghost wb-btn-sm',
        onClick: handleSave,
        title: 'Autosave to this browser failed. Download your .praxis file to keep your work.',
        style: { color: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }
      }, dot('var(--red)'), 'Autosave failed. Download your file.');
    } else if (persistStatus === 'conflict') {
      indicator = h('span', {
        style: Object.assign({}, indicatorTextStyle, { color: 'var(--amber)' }),
        title: 'This project is open in another tab. Changes made there can overwrite changes made here.'
      }, dot('var(--amber)'), 'Open in another tab');
    } else if (persistStatus === 'saving') {
      indicator = h('span', { style: indicatorTextStyle }, dot('rgba(255,255,255,0.35)'), 'Saving');
    } else if (lastSavedAt) {
      indicator = h('span', { style: indicatorTextStyle }, dot('var(--green)'), 'Saved ' + PraxisUtils.formatTime(lastSavedAt));
    }

    // Interface language switcher (EN | FR). Active locale is read from the
    // i18n module, which re-evaluates on the re-render triggered by SET_LOCALE.
    var activeLocale = PraxisI18n.getLocale();
    function chooseLocale(loc) {
      if (PraxisI18n.getLocale() === loc) return;
      PraxisI18n.setLocale(loc);
      dispatch({ type: PraxisContext.ACTION_TYPES.SET_LOCALE, locale: loc });
    }
    function langButton(loc, label, srLabel) {
      var isActive = activeLocale === loc;
      return h('button', {
        type: 'button',
        onClick: function() { chooseLocale(loc); },
        'aria-pressed': isActive ? 'true' : 'false',
        'aria-label': srLabel,
        style: {
          border: 'none', cursor: 'pointer', padding: '3px 9px',
          fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.03em',
          fontFamily: 'inherit', lineHeight: 1.4,
          background: isActive ? 'rgba(255,255,255,0.16)' : 'transparent',
          color: isActive ? '#fff' : 'rgba(255,255,255,0.55)'
        }
      }, label);
    }
    var langSwitch = h('div', {
      role: 'group',
      'aria-label': 'Interface language',
      title: 'Interface language. French covers the shell and Station 0; station content translation is in progress.',
      style: { display: 'inline-flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', overflow: 'hidden' }
    }, langButton('en', 'EN', 'English'), langButton('fr', 'FR', 'French'));

    var logo = h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' },
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'var(--teal)', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: 'var(--teal)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );

    return h('div', { className: 'wb-topbar' },
      h('button', {
        type: 'button',
        className: 'wb-topbar-home',
        onClick: handleBackToStart,
        title: PraxisI18n.t('shell.start') + ' (PRAXIS Evaluation Workbench v' + PraxisSchema.PRAXIS_VERSION + ')',
        'aria-label': PraxisI18n.t('shell.start')
      },
        logo,
        h('span', { className: 'wb-topbar-brand' }, 'PRAXIS')
      ),
      h('div', { className: 'wb-topbar-logo' },
        h('span', { className: 'wb-topbar-sep' }, '·'),
        h('input', {
          ref: titleRef,
          type: 'text',
          className: 'wb-topbar-title-input',
          value: title,
          placeholder: 'Untitled evaluation',
          'aria-label': 'Evaluation title',
          onChange: function(e) { setTitle(e.target.value); },
          onBlur: handleBlur
        })
      ),
      (typeof RoleSwitch !== 'undefined') ? h(RoleSwitch, { state: state, dispatch: dispatch }) : null,
      h('div', { className: 'wb-topbar-actions' },
        indicator,
        langSwitch,
        h(ExperienceTierBadge, { tier: state.ui.experienceTier, dispatch: dispatch }),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm wb-topbar-start',
          onClick: handleBackToStart,
          title: PraxisI18n.t('shell.start_hint')
        },
          h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' },
            h('path', { d: 'M15 18l-6-6 6-6', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
          ),
          h('span', null, PraxisI18n.t('shell.start'))
        ),
        h('button', {
          className: 'wb-btn wb-btn-ghost wb-btn-sm wb-topbar-save',
          onClick: handleSave
        }, PraxisI18n.t('shell.save')),
        h('button', {
          type: 'button',
          className: 'wb-btn wb-btn-ghost wb-btn-sm on-chrome',
          onClick: function() { setAboutOpen(true); },
          title: 'About the workbench, version ' + PraxisSchema.PRAXIS_VERSION,
          'aria-label': 'About the workbench'
        }, PraxisIcons.info(14))
      ),
      h(AboutModal, { isOpen: aboutOpen, initialTab: 'about', dispatch: dispatch, onClose: function() { setAboutOpen(false); } })
    );
  }

  window.TopBar = TopBar;
})();
