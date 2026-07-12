(function() {
  'use strict';
  var h = React.createElement;
  var t = PraxisI18n.t;
  var AT = PraxisContext.ACTION_TYPES;
  var LABELS = PraxisSchema.STATION_LABELS;

  var CREAM = '#F7F4EC';
  var INK = '#191D1B';

  // Lifecycle phase for each of the nine stations (spine brackets + detail chip).
  var PHASE_KEYS = [
    'entry.phase_frame', 'entry.phase_frame', 'entry.phase_frame',
    'entry.phase_design', 'entry.phase_design', 'entry.phase_design',
    'entry.phase_analyse',
    'entry.phase_report', 'entry.phase_report'
  ];

  // PRAXIS compass mark: a bezel ring with a north index and eight hour ticks.
  function Mark(props) {
    var size = (props && props.size) || 20;
    return h('svg', { width: size, height: size, viewBox: '-110 -110 220 220', 'aria-hidden': 'true', focusable: 'false', style: { display: 'block', flexShrink: 0 } },
      h('circle', { r: 100, fill: 'none', stroke: 'currentColor', strokeWidth: 7, opacity: 0.9 }),
      h('path', { d: 'M0 -100 L0 -64', stroke: 'currentColor', strokeWidth: 16 }),
      h('path', {
        d: 'M64.3 -76.6 L55.3 -65.9 M98.5 -17.4 L84.7 -14.9 M86.6 50 L74.5 43 M34.2 94 L29.4 80.8 M-34.2 94 L-29.4 80.8 M-86.6 50 L-74.5 43 M-98.5 -17.4 L-84.7 -14.9 M-64.3 -76.6 L-55.3 -65.9',
        stroke: 'currentColor', strokeWidth: 7, opacity: 0.75
      })
    );
  }

  // Station angle on the dial: 0 at north, one station every 40 degrees,
  // clockwise. polar() maps that convention onto SVG coordinates.
  function polar(deg, r) {
    var rad = deg * Math.PI / 180;
    return [r * Math.sin(rad), -r * Math.cos(rad)];
  }
  function arcPath(a0, a1, r, sweep) {
    var p = polar(a0, r), q = polar(a1, r);
    return 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) +
      ' A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
  }
  // Split a station name near its middle space so it fits the dial hub.
  function splitName(s) {
    if (s.length <= 14) return [s];
    var mid = s.length / 2, best = -1, bestD = Infinity;
    for (var j = 0; j < s.length; j++) {
      if (s.charAt(j) === ' ') {
        var d = Math.abs(j - mid);
        if (d < bestD) { bestD = d; best = j; }
      }
    }
    if (best < 0) return [s];
    return [s.slice(0, best), s.slice(best + 1)];
  }

  // The four lifecycle phases as bezel arcs. from/to bracket the member
  // stations; la/lb are the label arc endpoints. Label arcs below the dial's
  // equator run counterclockwise (rev) so their glyphs stay upright.
  var DIAL_PHASES = [
    { key: 'entry.phase_frame',   from: -12, to: 92,  la: 5,   lb: 75,  rev: false },
    { key: 'entry.phase_design',  from: 108, to: 212, la: 195, lb: 125, rev: true },
    { key: 'entry.phase_analyse', from: 228, to: 252, la: 275, lb: 205, rev: true },
    { key: 'entry.phase_report',  from: 268, to: 332, la: 265, lb: 335, rev: false }
  ];

  // Masthead dial: the nine stations engraved on a bezel, the four phases
  // bracketed around them. The same object as the section 02 spine, bent
  // into a circle. Hovering a numeral swings the index to that station and
  // names it in the hub; this is a pointer-only duplicate of the section 02
  // tablist, which carries the accessible semantics, so the dial stays
  // aria-hidden.
  function Dial() {
    var hoverState = React.useState(null);
    var hover = hoverState[0];
    var setHover = hoverState[1];
    var active = hover === null ? 0 : hover;
    var hubMicro = { fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.4em' };

    var labelPaths = [], bezel = [], stations = [], hits = [];

    DIAL_PHASES.forEach(function(p, pi) {
      labelPaths.push(h('path', {
        key: pi, id: 'wb-dial-lp' + pi, fill: 'none',
        d: arcPath(p.la, p.lb, p.rev ? 136 : 127, p.rev ? 0 : 1)
      }));
      bezel.push(h('path', {
        key: 'a' + pi, d: arcPath(p.from, p.to, 114, 1),
        stroke: 'rgba(247,244,236,0.38)', strokeWidth: 1, fill: 'none'
      }));
      [p.from, p.to].forEach(function(ang, ti) {
        var o = polar(ang, 114), q = polar(ang, 107);
        bezel.push(h('path', {
          key: 'k' + pi + '-' + ti,
          d: 'M' + o[0].toFixed(1) + ' ' + o[1].toFixed(1) + ' L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1),
          stroke: 'rgba(247,244,236,0.38)', strokeWidth: 1
        }));
      });
      bezel.push(h('text', {
        key: 'l' + pi, textAnchor: 'middle', fill: 'rgba(247,244,236,0.55)',
        style: { fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.32em' }
      }, h('textPath', { href: '#wb-dial-lp' + pi, startOffset: '50%' }, t(p.key).toUpperCase())));
    });

    LABELS.forEach(function(_, i) {
      var ang = i * 40;
      var o = polar(ang, 99), q = polar(ang, i === 0 ? 84 : 90), n = polar(ang, 76);
      stations.push(h('path', {
        key: 'tk' + i,
        d: 'M' + o[0].toFixed(1) + ' ' + o[1].toFixed(1) + ' L' + q[0].toFixed(1) + ' ' + q[1].toFixed(1),
        stroke: CREAM, strokeWidth: i === 0 ? 3 : 1.3, opacity: i === 0 ? 0.95 : 0.6
      }));
      stations.push(h('text', {
        key: 'nm' + i, x: n[0].toFixed(1), y: (n[1] + 4.5).toFixed(1), textAnchor: 'middle',
        className: 'wb-entry-dial-num',
        fill: 'rgba(247,244,236,' + (active === i ? '1' : '0.72') + ')',
        style: { fontFamily: 'var(--e-serif)', fontSize: '13.5px' }
      }, String(i)));
      hits.push(h('circle', {
        key: 'h' + i, cx: n[0].toFixed(1), cy: n[1].toFixed(1), r: 17, fill: 'transparent',
        className: 'wb-entry-dial-hit',
        onMouseEnter: function() { setHover(i); }
      }));
    });

    // Hub type stays narrow enough to clear the numerals at 120 and 240
    // degrees (the mid-height band) in both languages.
    var hub;
    var hubSmall = { fontFamily: 'var(--font-sans)', fontSize: '8.5px', letterSpacing: '0.24em' };
    if (hover === null) {
      hub = [
        h('text', { key: 'd1', y: 42, textAnchor: 'middle', fill: 'rgba(247,244,236,0.6)', style: hubSmall }, t('entry.dial_1')),
        h('text', { key: 'd2', y: 55, textAnchor: 'middle', fill: 'rgba(247,244,236,0.38)', style: hubSmall }, t('entry.dial_2'))
      ];
    } else {
      hub = [h('text', { key: 's', y: 34, textAnchor: 'middle', fill: 'rgba(247,244,236,0.55)', style: hubMicro },
        (t('entry.station_word') + ' ' + hover).toUpperCase())];
      splitName(t('station.' + hover + '.name').toUpperCase()).forEach(function(line, li) {
        hub.push(h('text', {
          key: 'n' + li, y: 49 + li * 13, textAnchor: 'middle', fill: 'rgba(247,244,236,0.9)',
          style: { fontFamily: 'var(--font-sans)', fontSize: '9.5px', letterSpacing: '0.18em' }
        }, line));
      });
    }

    return h('svg', {
      className: 'wb-entry-dial', width: 330, height: 330, viewBox: '-142 -142 284 284',
      'aria-hidden': 'true', focusable: 'false',
      onMouseLeave: function() { setHover(null); }
    },
      h('defs', null, labelPaths),
      h('circle', { r: 99, fill: 'none', stroke: 'rgba(247,244,236,0.5)', strokeWidth: 1.2 }),
      h('circle', { r: 93, fill: 'none', stroke: 'rgba(247,244,236,0.25)', strokeWidth: 0.7 }),
      h('circle', { r: 58, fill: 'none', stroke: 'rgba(247,244,236,0.22)', strokeWidth: 0.7, strokeDasharray: '2 5' }),
      bezel,
      stations,
      h('g', { className: 'wb-entry-dial-index', style: { transform: 'rotate(' + (active * 40) + 'deg)' } },
        h('path', { d: 'M0 -66 L-4.2 -55.5 L4.2 -55.5 Z', fill: CREAM, opacity: 0.95 })),
      h('circle', { r: 2.5, fill: CREAM }),
      hub,
      hits
    );
  }

  // Section 02 spine: the dial unrolled. It begins at the same compass mark,
  // draws itself when scrolled into view (nodes surfacing as the line passes
  // them), and mirrors the station highlighted in the tab row below. Nodes
  // are mouse-clickable duplicates; the tab row carries the accessible
  // semantics, so the svg stays aria-hidden.
  function Spine(props) {
    var phaseStyle = { fontFamily: 'var(--font-sans)', fontSize: '10.5px', letterSpacing: '0.3em' };
    var numStyle = { fontFamily: 'var(--e-serif)', fontSize: '14px' };
    var xs = [66.7, 200, 333.3, 466.7, 600, 733.3, 866.7, 1000, 1133.3];
    var nodes = xs.map(function(x, i) {
      return h('g', {
        key: i,
        className: 'wb-entry-spine-node' + (props.si === i ? ' wb-entry-spine-node--on' : ''),
        style: { animationDelay: (0.12 + i * 0.13) + 's' },
        onClick: function() { props.onPick(i); }
      },
        h('circle', { cx: x, cy: 80, r: 17, strokeWidth: 1.5 }),
        h('text', { x: x, y: 84.5, textAnchor: 'middle', style: numStyle }, String(i))
      );
    });
    return h('svg', {
      className: 'wb-entry-spine' + (props.go ? ' wb-entry-spine--go' : ''),
      viewBox: '0 0 1200 118', preserveAspectRatio: 'xMidYMid meet',
      'aria-hidden': 'true', focusable: 'false'
    },
      h('g', { className: 'wb-entry-spine-fade', stroke: 'var(--e-ax)' },
        h('circle', { cx: 30, cy: 80, r: 11, fill: 'none', strokeWidth: 1.4 }),
        h('path', { d: 'M30 69.5 L30 74.5', strokeWidth: 2 }),
        h('circle', { cx: 30, cy: 80, r: 1.6, fill: 'var(--e-ax)', stroke: 'none' })
      ),
      h('g', { className: 'wb-entry-spine-fade', style: { animationDelay: '1.05s' } },
        h('path', { d: 'M66.7 42 v-10 h266.6 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
        h('path', { d: 'M466.7 42 v-10 h266.6 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
        h('path', { d: 'M836.7 42 v-10 h60 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
        h('path', { d: 'M1000 42 v-10 h133.3 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
        h('text', { x: 200, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_frame').toUpperCase()),
        h('text', { x: 600, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_design').toUpperCase()),
        h('text', { x: 866.7, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_analyse').toUpperCase()),
        h('text', { x: 1066.7, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_report').toUpperCase())
      ),
      h('path', { className: 'wb-entry-spine-draw', d: 'M46 80 H1170', stroke: 'rgba(25,29,27,0.5)', strokeWidth: 1.2, fill: 'none', strokeDasharray: 1124 }),
      h('path', { className: 'wb-entry-spine-fade', style: { animationDelay: '1.2s' }, d: 'M1170 80 l-9 -4.5 v9 Z', fill: 'rgba(25,29,27,0.5)' }),
      nodes
    );
  }

  function SectionHead(props) {
    return h('div', { className: 'wb-entry-sechead' + (props.tight ? ' wb-entry-sechead--tight' : '') },
      h('span', { className: 'wb-entry-secnum', 'aria-hidden': 'true' }, props.num),
      h('h2', { className: 'wb-entry-sectitle', style: { margin: 0 } }, props.title),
      h('span', { className: 'wb-entry-secrule', 'aria-hidden': 'true' }),
      props.note ? h('span', { className: 'wb-entry-secnote' }, props.note) : null
    );
  }

  // One docket row: index letterform, title over description, trailing chevron.
  function DocketRow(props) {
    return h('button', {
      type: 'button',
      className: 'wb-entry-reset wb-entry-row' + (props.compact ? ' wb-entry-row--compact' : ''),
      onClick: props.onClick
    },
      h('span', {
        className: 'wb-entry-row-letter' + (props.warn ? ' wb-entry-row-letter--warn' : ''),
        style: props.plainIndex ? { fontStyle: 'normal' } : null,
        'aria-hidden': 'true'
      }, props.index),
      h('span', { className: 'wb-entry-row-body' },
        h('span', { className: 'wb-entry-row-title' }, props.title),
        props.desc ? h('span', { className: 'wb-entry-row-desc' }, props.desc) : null,
        props.meta ? h('span', { className: 'wb-entry-row-meta' }, props.meta) : null
      ),
      h('span', { className: 'wb-entry-row-arrow' }, PraxisIcons.chevronRight(20, { weight: 1.75 }))
    );
  }

  function BackButton(props) {
    return h('button', {
      type: 'button',
      className: 'wb-entry-reset wb-entry-back',
      onClick: props.onClick
    }, PraxisIcons.chevronLeft(14), t('common.back'));
  }

  function EntryLanding(props) {
    var dispatch = props.dispatch;
    var modeState = React.useState(null);
    var mode = modeState[0];
    var setMode = modeState[1];
    // Destructive action awaiting confirmation: { run: function } or null
    var pendingState = React.useState(null);
    var pending = pendingState[0];
    var setPending = pendingState[1];
    // Highlighted tier in the tier radiogroup (does not create a project on
    // its own; only activation via Enter/Space/click does).
    var tierChoiceState = React.useState(null);
    var tierChoice = tierChoiceState[0];
    var setTierChoice = tierChoiceState[1];
    // About/Privacy modal: null when closed, otherwise the tab to open on.
    var aboutTabState = React.useState(null);
    var aboutTab = aboutTabState[0];
    var setAboutTab = aboutTabState[1];
    // Station highlighted in the section 02 spine detail panel.
    var siState = React.useState(0);
    var si = siState[0];
    var setSi = siState[1];
    var beginRef = React.useRef(null);
    // The section 02 spine draws itself the first time it scrolls into view.
    var spineWrapRef = React.useRef(null);
    var spineGoState = React.useState(false);
    var spineGo = spineGoState[0];
    var setSpineGo = spineGoState[1];

    React.useEffect(function() {
      if (spineGo) return undefined;
      var el = spineWrapRef.current;
      if (!el || typeof IntersectionObserver !== 'function') {
        setSpineGo(true);
        return undefined;
      }
      var obs = new IntersectionObserver(function(entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) {
            setSpineGo(true);
            obs.disconnect();
            return;
          }
        }
      }, { threshold: 0.35 });
      obs.observe(el);
      return function() { obs.disconnect(); };
    }, [spineGo]);

    // Check for saved data without loading it into state
    var hasSaved = React.useMemo(function() {
      return PraxisContext.hasSavedProject();
    }, []);

    var savedMeta = React.useMemo(function() {
      return hasSaved ? PraxisContext.getSavedProjectMeta() : null;
    }, [hasSaved]);

    // Backup slot (previous project) that differs from the current save
    var backupMeta = React.useMemo(function() {
      return PraxisContext.getBackupMeta();
    }, []);

    // Saved blob that exists but cannot be read as a project
    var unreadable = React.useMemo(function() {
      return PraxisContext.getUnreadableSavedData();
    }, []);

    function showToast(message, type) {
      dispatch({ type: AT.SHOW_TOAST, message: message, toastType: type || 'error' });
    }

    // Open the saved project, restoring the station and tier the user was
    // on. A station named in the URL hash (deep link) takes precedence over
    // the remembered station, so a bookmarked or shared #station=N link
    // opens there instead of wherever the project was last left.
    function openSavedProject() {
      var saved = PraxisContext.loadSavedProject();
      if (!saved) {
        showToast('The saved project could not be read.', 'error');
        return;
      }
      var uiSaved = PraxisContext.getSavedUIState() || {};
      var routeStation = PraxisRouter.getGuardedStation();
      var station = routeStation !== null ? routeStation : uiSaved.activeStation;
      dispatch({ type: AT.LOAD_FILE, context: saved, station: station, tier: uiSaved.experienceTier });
    }

    // Gate destructive actions behind a confirmation when a real saved
    // project exists. Unreadable saved data is backed up silently first so
    // it stays recoverable.
    function guardDestructive(run) {
      if (PraxisContext.hasSavedProject()) {
        setPending({ run: run });
        return;
      }
      if (PraxisContext.getUnreadableSavedData()) {
        PraxisContext.writeBackup('replace-unreadable');
      }
      run();
    }

    function confirmReplace() {
      var action = pending;
      setPending(null);
      if (!action) return;
      PraxisContext.writeBackup('replace');
      action.run();
    }

    function confirmKeep() {
      setPending(null);
      openSavedProject();
    }

    // Restore the backup slot, swapping the current save into it so the
    // restore itself is reversible.
    function handleRestoreBackup() {
      var restored = PraxisContext.loadBackup();
      if (!restored) {
        showToast('The backup could not be read.', 'error');
        return;
      }
      PraxisContext.writeBackup('restore-swap');
      dispatch({ type: AT.LOAD_FILE, context: restored });
    }

    // Hero CTA: open the tier picker and bring section 01 into view. The
    // URL hash is never touched here; the router owns it for #station=N
    // deep links.
    function beginNew() {
      setMode('tier');
      requestAnimationFrame(function() {
        if (!beginRef.current) return;
        var reduce = false;
        try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
        beginRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    }

    var version = 'v' + PraxisSchema.PRAXIS_VERSION;

    /* ── Masthead ─────────────────────────────────────────────────── */
    // Interface language. Same mechanism as the app shell TopBar: the i18n
    // module persists the choice, the SET_LOCALE dispatch re-renders.
    var activeLocale = PraxisI18n.getLocale();
    function chooseLocale(loc) {
      if (PraxisI18n.getLocale() === loc) return;
      PraxisI18n.setLocale(loc);
      dispatch({ type: AT.SET_LOCALE, locale: loc });
    }
    function langBtn(loc, label, srLabel) {
      return h('button', {
        type: 'button',
        className: 'wb-entry-reset wb-entry-lang-btn' + (activeLocale === loc ? ' wb-entry-lang-btn--on' : ''),
        'aria-pressed': activeLocale === loc ? 'true' : 'false',
        'aria-label': srLabel,
        onClick: function() { chooseLocale(loc); }
      }, label);
    }
    var langSwitch = h('span', { className: 'wb-entry-lang', role: 'group', 'aria-label': t('entry.lang_label') },
      langBtn('en', 'EN', 'English'),
      h('span', { className: 'wb-entry-lang-sep', 'aria-hidden': 'true' }),
      langBtn('fr', 'FR', 'Français')
    );

    var masthead = h('header', { className: 'wb-entry-mast wb-entry-dark' },
      h('div', { className: 'wb-entry-wrap' },
        h('div', { className: 'wb-entry-mast-top' },
          h('span', { className: 'wb-entry-brand' },
            h(Mark, { size: 20 }),
            h('span', { className: 'wb-entry-brand-name' }, 'Praxis')
          ),
          h('span', { className: 'wb-entry-mast-top-right' },
            h('span', null, t('entry.app_name')),
            h('span', { className: 'wb-entry-mast-version' }, version),
            langSwitch
          )
        ),
        h('div', { className: 'wb-entry-hero' },
          h('div', { className: 'wb-entry-hero-copy' },
            h('div', { className: 'wb-entry-kicker' }, t('entry.kicker')),
            h('h1', { className: 'wb-entry-h1' }, t('entry.title')),
            h('p', { className: 'wb-entry-lede' }, t('entry.lede')),
            h('div', { className: 'wb-entry-cta-row' },
              h('button', { type: 'button', className: 'wb-entry-btn-solid', onClick: beginNew },
                t('entry.begin_cta')),
              hasSaved ? h('button', { type: 'button', className: 'wb-entry-btn-ghost', onClick: openSavedProject },
                t('entry.resume_cta')) : null
            )
          ),
          h('div', { className: 'wb-entry-dial-slot' }, h(Dial, null))
        )
      )
    );

    /* ── Section 01: Begin ────────────────────────────────────────── */
    var beginContent;

    if (mode === 'tier') {
      // Tier selection: an accessible radiogroup. Highlighting a tier does
      // not create a project; activating one (Enter/Space/click) does.
      var tiers = [
        { value: 'foundation', letter: 'a.', label: 'Foundation', textKey: 'landing.tier_foundation' },
        { value: 'practitioner', letter: 'b.', label: 'Practitioner', textKey: 'landing.tier_practitioner' },
        { value: 'advanced', letter: 'c.', label: 'Advanced', textKey: 'landing.tier_advanced' }
      ];
      beginContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { className: 'wb-entry-subtitle' }, t('landing.tier_title')),
        h(PraxisRadioGroup, {
          options: tiers,
          value: tierChoice,
          ariaLabel: t('landing.tier_title'),
          onChange: setTierChoice,
          onActivate: function(val) {
            guardDestructive(function() {
              try { localStorage.removeItem('praxis-workbench'); localStorage.removeItem('praxis-workbench-ui'); } catch (e) {}
              // A brand-new project always starts at Station 0. A station
              // left over in the URL hash from a previously closed project
              // must not leak into this one (see the demo picker below and
              // the hash-clearing effect in app.js).
              dispatch({ type: AT.INIT, tier: val });
            });
          },
          groupClassName: 'wb-entry-docket',
          itemClassName: function(opt, sel) { return 'wb-entry-row' + (sel ? ' wb-entry-row--selected' : ''); },
          renderItem: function(opt) {
            return [
              h('span', { key: 'i', className: 'wb-entry-row-letter', 'aria-hidden': 'true' }, opt.letter),
              h('span', { key: 'b', className: 'wb-entry-row-body' },
                h('span', { className: 'wb-entry-row-title' }, opt.label),
                h('span', { className: 'wb-entry-row-desc' }, t(opt.textKey))
              ),
              h('span', { key: 'a', className: 'wb-entry-row-arrow' }, PraxisIcons.chevronRight(20, { weight: 1.75 }))
            ];
          }
        })
      );

    } else if (mode === 'open') {
      // File drop zone, remapped to the entry palette by .wb-entry-dropzone.
      beginContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { className: 'wb-entry-subtitle' }, t('entry.open_title')),
        h('div', { className: 'wb-entry-dropzone' },
          h(FileDropZone, {
            label: 'Drop .praxis file here or click Browse files',
            onFile: function(data) {
              // Keep a backup of the current save before an import can
              // replace or modify it on the next autosave.
              var check = PraxisSchema.validateContext(data);
              if (check.ok && (PraxisContext.hasSavedProject() || PraxisContext.getUnreadableSavedData())) {
                PraxisContext.writeBackup('import');
              }
              var fileAction = { type: AT.LOAD_FILE, context: data };
              // Partial imports in a fresh session merge into the saved
              // project, not onto the empty in-memory context (which would
              // then overwrite the saved project on the next autosave).
              if (check.ok && check.partial && PraxisContext.hasSavedProject()) {
                fileAction.base = PraxisContext.loadSavedProject();
              }
              dispatch(fileAction);
            },
            onError: function(err) {
              showToast('Could not read file: ' + ((err && err.message) || 'unknown error') + '.', 'error');
            }
          })
        )
      );

    } else if (mode === 'quick') {
      // Station selector: the nine linear stations plus the optional Planning
      // and contract station (index 9, reached in-app by the rail "P" button).
      function stationRow(key, badge, name, station) {
        return h(DocketRow, {
          key: key, index: badge, plainIndex: true, compact: true, title: name,
          onClick: function() {
            guardDestructive(function() {
              dispatch({ type: AT.INIT, station: station });
            });
          }
        });
      }
      beginContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { className: 'wb-entry-subtitle' }, t('entry.quick_title')),
        h('div', { className: 'wb-entry-docket' },
          LABELS.map(function(name, i) { return stationRow(i, String(i), t('station.' + i + '.name'), i); }),
          stationRow('planning', 'P', t('entry.planning_title'), 9)
        )
      );

    } else if (mode === 'demo') {
      // Demo picker: one row per pre-populated example evaluation
      var demos = [
        { key: 'gf', letter: 'a.', title: t('entry.demo_gf_title'), desc: t('entry.demo_gf_desc'), ctx: window.PRAXIS_DEMO_GF },
        { key: 'zd', letter: 'b.', title: t('entry.demo_zd_title'), desc: t('entry.demo_zd_desc'), ctx: window.PRAXIS_DEMO_ZD }
      ];
      beginContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { className: 'wb-entry-subtitle' }, t('entry.demo_title')),
        h('div', { className: 'wb-entry-docket' },
          demos.map(function(d) {
            return h(DocketRow, {
              key: d.key, index: d.letter, title: d.title, desc: d.desc,
              onClick: function() {
                if (!d.ctx) return;
                guardDestructive(function() {
                  // A freshly opened worked example always starts at Station 0,
                  // regardless of any station left in the URL hash by a
                  // previously closed project.
                  dispatch({ type: AT.INIT, context: d.ctx, tier: 'practitioner', station: 0 });
                });
              }
            });
          })
        )
      );

    } else {
      // Default docket: the five ways in, lettered in order, with the
      // in-progress banner above when a saved project exists.
      var resumeBanner = null;
      if (hasSaved) {
        var metaLine = savedMeta
          ? t('entry.station_at', { n: savedMeta.station, name: savedMeta.stationName }) +
            (savedMeta.updatedAt ? ' · ' + PraxisUtils.formatDate(savedMeta.updatedAt) : '')
          : '';
        resumeBanner = h('button', { type: 'button', className: 'wb-entry-reset wb-entry-resume', onClick: openSavedProject },
          h('span', { className: 'wb-entry-resume-chip' },
            h('span', { className: 'wb-entry-resume-dot', 'aria-hidden': 'true' }),
            t('entry.in_progress')),
          h('span', { className: 'wb-entry-resume-body' },
            h('span', { className: 'wb-entry-resume-title' }, (savedMeta && savedMeta.name) || t('landing.continue')),
            metaLine ? h('span', { className: 'wb-entry-resume-sub' }, metaLine) : null
          ),
          h('span', { className: 'wb-entry-resume-go' }, t('entry.resume'), ' ', PraxisIcons.chevronRight(15, { weight: 2.25 }))
        );
      }

      var rows = [
        { title: t('entry.new_title'), desc: t('entry.new_desc'), onClick: function() { setMode('tier'); } },
        { title: t('entry.open_title'), desc: t('entry.open_desc'), onClick: function() { setMode('open'); } },
        { title: t('entry.single_title'), desc: t('entry.single_desc'), onClick: function() { setMode('quick'); } },
        { title: t('entry.examples_title'), desc: t('entry.examples_desc'), onClick: function() { setMode('demo'); } },
        { title: t('entry.cockpit_title'), desc: t('entry.cockpit_desc'),
          onClick: function() {
            guardDestructive(function() {
              dispatch({ type: AT.INIT, role: 'commissioner', tier: 'practitioner' });
            });
          } }
      ];

      // Recovery row: saved data exists but cannot be read as a project
      if (!hasSaved && unreadable) {
        rows.push({
          warn: true,
          title: t('entry.recover_title'),
          desc: t('entry.recover_desc'),
          onClick: function() {
            try {
              var blob = new Blob([unreadable], { type: 'application/json' });
              PraxisUtils.downloadBlob(blob, 'praxis-recovery-' + new Date().toISOString().slice(0, 10) + '.json');
              showToast('Recovery file downloaded.', 'success');
            } catch (e) {
              showToast('Could not download the recovery file: ' + e.message, 'error');
            }
          }
        });
      }

      var restoreLine = null;
      if (backupMeta) {
        restoreLine = h('button', {
          type: 'button', className: 'wb-entry-reset wb-entry-restore',
          onClick: handleRestoreBackup
        }, t('entry.restore_title') + ' (' + backupMeta.name +
          (backupMeta.backedUpAt ? ', ' + t('entry.backed_up', { date: PraxisUtils.formatDate(backupMeta.backedUpAt) }) : '') + ')');
      }

      beginContent = h('div', null,
        resumeBanner,
        h('div', { className: 'wb-entry-docket' },
          rows.map(function(row, idx) {
            return h(DocketRow, {
              key: idx,
              index: String.fromCharCode(97 + idx) + '.',
              warn: row.warn,
              title: row.title,
              desc: row.desc,
              onClick: row.onClick
            });
          })
        ),
        restoreLine
      );
    }

    var beginSection = h('section', { ref: beginRef, className: 'wb-entry-wrap wb-entry-sec-begin', 'aria-label': t('entry.begin') },
      h(SectionHead, { num: '01', title: t('entry.begin') }),
      beginContent
    );

    /* ── Section 02: The nine stations ────────────────────────────── */
    function onTabKey(e) {
      var idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % 9;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx + 8) % 9;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = 8;
      if (next === null) return;
      e.preventDefault();
      setSi(next);
      var el = document.getElementById('wb-entry-tab-' + next);
      if (el) el.focus();
    }

    var stationTabs = h('div', { className: 'wb-entry-stations', role: 'tablist', 'aria-label': t('entry.stations_title') },
      LABELS.map(function(name, i) {
        return h('button', {
          key: i,
          type: 'button',
          role: 'tab',
          id: 'wb-entry-tab-' + i,
          'aria-selected': si === i ? 'true' : 'false',
          'aria-controls': 'wb-entry-station-panel',
          tabIndex: si === i ? 0 : -1,
          'data-idx': i,
          className: 'wb-entry-reset wb-entry-station-tab',
          onMouseEnter: function() { if (si !== i) setSi(i); },
          onFocus: function() { if (si !== i) setSi(i); },
          onKeyDown: onTabKey
        }, t('station.' + i + '.name'));
      })
    );

    var stationDetail = h('div', {
      className: 'wb-entry-station-detail',
      role: 'tabpanel',
      id: 'wb-entry-station-panel',
      'aria-labelledby': 'wb-entry-tab-' + si
    },
      h('div', null,
        h('div', { className: 'wb-entry-station-name' },
          h('span', { className: 'wb-entry-station-name-num' }, t('entry.station_word') + ' ' + si),
          ' · ' + t('station.' + si + '.name')),
        h('div', { className: 'wb-entry-station-desc' }, t('entry.sdesc_' + si))
      ),
      h('div', { className: 'wb-entry-station-phase' }, t('entry.phase_word') + ' · ' + t(PHASE_KEYS[si]))
    );

    var stationsSection = h('section', { className: 'wb-entry-wrap wb-entry-sec-stations', 'aria-label': t('entry.stations_title') },
      h(SectionHead, { num: '02', title: t('entry.stations_title'), note: t('entry.stations_note'), tight: true }),
      h('div', { ref: spineWrapRef }, h(Spine, { si: si, go: spineGo, onPick: setSi })),
      stationTabs,
      stationDetail
    );

    /* ── Footer ───────────────────────────────────────────────────── */
    var footLinkStyle = { background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' };
    var footer = h('footer', { className: 'wb-entry-foot wb-entry-dark' },
      h('div', { className: 'wb-entry-wrap wb-entry-foot-inner' },
        h('span', { className: 'wb-entry-foot-brand' },
          h(Mark, { size: 18 }),
          'Praxis'),
        h('span', { className: 'wb-entry-foot-links' },
          h('button', {
            type: 'button', className: 'wb-entry-foot-link',
            style: footLinkStyle,
            onClick: function() { setAboutTab('about'); }
          }, t('entry.about')),
          h('button', {
            type: 'button', className: 'wb-entry-foot-link',
            style: footLinkStyle,
            onClick: function() { setAboutTab('privacy'); }
          }, t('entry.privacy')),
          h('span', { className: 'wb-entry-foot-version' },
            t('entry.app_name').toUpperCase() + ' · ' + version + ' · ' + new Date().getFullYear())
        )
      )
    );

    /* ── Modals ───────────────────────────────────────────────────── */
    // Confirmation before a destructive action replaces the saved project
    var confirmModal = null;
    if (pending) {
      var pendingMeta = PraxisContext.getSavedProjectMeta();
      var savedName = (pendingMeta && pendingMeta.name) || 'Untitled';
      var savedWhen = pendingMeta && pendingMeta.updatedAt ? ', last updated ' + PraxisUtils.formatDate(pendingMeta.updatedAt) : '';
      confirmModal = h(Modal, {
        isOpen: true,
        title: 'Replace your saved project?',
        width: '440px',
        onClose: function() { setPending(null); }
      },
        h('p', { style: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.6, margin: '0 0 8px 0' } },
          'You have a saved project, "' + savedName + '"' + savedWhen + '. Starting something new replaces it in this browser.'),
        h('p', { style: { fontSize: '12px', color: 'var(--slate)', lineHeight: 1.6, margin: '0 0 16px 0' } },
          'A backup copy will be kept until the next replacement.'),
        h('div', { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' } },
          h('button', { type: 'button', className: 'wb-btn wb-btn-danger', onClick: confirmReplace }, 'Replace it'),
          h('button', { type: 'button', className: 'wb-btn wb-btn-primary', onClick: confirmKeep }, 'Keep working on it')
        )
      );
    }

    var aboutModal = h(AboutModal, {
      isOpen: aboutTab !== null,
      initialTab: aboutTab || 'about',
      dispatch: dispatch,
      onClose: function() { setAboutTab(null); }
    });

    return h('div', { className: 'wb-entry' },
      masthead,
      h('main', null, beginSection, stationsSection),
      footer,
      confirmModal,
      aboutModal
    );
  }

  window.EntryLanding = EntryLanding;
})();
