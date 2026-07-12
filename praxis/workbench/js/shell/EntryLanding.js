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

  // Masthead dial: the nine-station compass, purely illustrative.
  function Dial() {
    var textStyle = { fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: '0.4em' };
    return h('svg', { className: 'wb-entry-dial', width: 300, height: 300, viewBox: '-118 -118 236 236', 'aria-hidden': 'true', focusable: 'false' },
      h('circle', { r: 106, fill: 'none', stroke: 'rgba(247,244,236,0.5)', strokeWidth: 1.2 }),
      h('circle', { r: 99, fill: 'none', stroke: 'rgba(247,244,236,0.28)', strokeWidth: 0.7 }),
      h('circle', { r: 64, fill: 'none', stroke: 'rgba(247,244,236,0.22)', strokeWidth: 0.7, strokeDasharray: '2 5' }),
      h('path', { d: 'M0 -99 L0 -78', stroke: CREAM, strokeWidth: 3.5 }),
      h('path', {
        d: 'M63.6 -75.8 L50.1 -59.7 M97.5 -17.2 L76.8 -13.5 M85.7 49.5 L67.5 39 M33.9 93 L26.7 73.3 M-33.9 93 L-26.7 73.3 M-85.7 49.5 L-67.5 39 M-97.5 -17.2 L-76.8 -13.5 M-63.6 -75.8 L-50.1 -59.7',
        stroke: 'rgba(247,244,236,0.65)', strokeWidth: 1.4
      }),
      h('circle', { r: 2.5, fill: CREAM }),
      h('text', { y: 34, textAnchor: 'middle', fill: 'rgba(247,244,236,0.6)', style: textStyle }, t('entry.dial_1')),
      h('text', { y: 48, textAnchor: 'middle', fill: 'rgba(247,244,236,0.38)', style: textStyle }, t('entry.dial_2'))
    );
  }

  // Section 02 spine: phase brackets over nine numbered stations on one line.
  // Decorative; the tab row below carries the accessible semantics.
  function Spine() {
    var phaseStyle = { fontFamily: 'var(--font-sans)', fontSize: '10.5px', letterSpacing: '0.3em' };
    var numStyle = { fontFamily: 'var(--e-serif)', fontSize: '14px' };
    var xs = [66.7, 200, 333.3, 466.7, 600, 733.3, 866.7, 1000, 1133.3];
    var nodes = [];
    xs.forEach(function(x, i) {
      nodes.push(h('circle', { key: 'c' + i, cx: x, cy: 80, r: 17, fill: CREAM, stroke: 'var(--e-ax)', strokeWidth: 1.5 }));
      nodes.push(h('text', { key: 't' + i, x: x, y: 84.5, textAnchor: 'middle', fill: INK, style: numStyle }, String(i)));
    });
    return h('svg', { className: 'wb-entry-spine', viewBox: '0 0 1200 118', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true', focusable: 'false' },
      h('path', { d: 'M66.7 42 v-10 h266.6 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
      h('path', { d: 'M466.7 42 v-10 h266.6 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
      h('path', { d: 'M836.7 42 v-10 h60 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
      h('path', { d: 'M1000 42 v-10 h133.3 v10', stroke: 'rgba(25,29,27,0.4)', strokeWidth: 1, fill: 'none' }),
      h('text', { x: 200, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_frame').toUpperCase()),
      h('text', { x: 600, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_design').toUpperCase()),
      h('text', { x: 866.7, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_analyse').toUpperCase()),
      h('text', { x: 1066.7, y: 18, textAnchor: 'middle', fill: 'rgba(25,29,27,0.6)', style: phaseStyle }, t('entry.phase_report').toUpperCase()),
      h('path', { className: 'wb-entry-spine-draw', d: 'M30 80 H1170', stroke: 'rgba(25,29,27,0.5)', strokeWidth: 1.2, fill: 'none', strokeDasharray: 1140 }),
      h('path', { d: 'M1170 80 l-9 -4.5 v9 Z', fill: 'rgba(25,29,27,0.5)' }),
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
    var masthead = h('header', { className: 'wb-entry-mast wb-entry-dark' },
      h('div', { className: 'wb-entry-wrap' },
        h('div', { className: 'wb-entry-mast-top' },
          h('span', { className: 'wb-entry-brand' },
            h(Mark, { size: 20 }),
            h('span', { className: 'wb-entry-brand-name' }, 'Praxis')
          ),
          h('span', { className: 'wb-entry-mast-top-right' },
            h('span', null, t('entry.app_name')),
            h('span', { className: 'wb-entry-mast-version' }, version)
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
      h(Spine, null),
      stationTabs,
      stationDetail
    );

    /* ── Section 03: How it's built ───────────────────────────────── */
    var principles = [1, 2, 3].map(function(n) {
      return h('div', { key: n, className: 'wb-entry-principle' },
        h('div', { className: 'wb-entry-principle-title' }, t('entry.built' + n + '_title')),
        h('div', { className: 'wb-entry-principle-body' }, t('entry.built' + n + '_body'))
      );
    });
    var builtSection = h('section', { className: 'wb-entry-wrap wb-entry-sec-built', 'aria-label': t('entry.built_title') },
      h(SectionHead, { num: '03', title: t('entry.built_title') }),
      h('div', { className: 'wb-entry-principles' }, principles)
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
      h('main', null, beginSection, stationsSection, builtSection),
      footer,
      confirmModal,
      aboutModal
    );
  }

  window.EntryLanding = EntryLanding;
})();
