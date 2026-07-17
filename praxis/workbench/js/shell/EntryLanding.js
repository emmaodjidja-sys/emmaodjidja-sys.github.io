(function() {
  'use strict';
  var h = React.createElement;
  var t = PraxisI18n.t;
  var AT = PraxisContext.ACTION_TYPES;
  var LABELS = PraxisSchema.STATION_LABELS;

  // Reusable PRAXIS logo SVG
  function Logo(props) {
    var size = props && props.size || 24;
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' },
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'var(--teal)', strokeWidth: 2 }),
      h('path', { d: 'M8 12l3 3 5-5', stroke: 'var(--teal)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })
    );
  }

  // Shared card visuals so buttons and radio items look identical.
  function cardBtnStyle(accent) {
    return {
      padding: '16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
      marginBottom: '10px', borderLeft: '3px solid ' + (accent || 'rgba(255,255,255,0.08)'),
      transition: 'background 0.15s'
    };
  }

  function cardInner(title, desc, children) {
    return [
      h('div', { key: 'title', style: { fontSize: '13px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: 4 } }, title),
      desc ? h('div', { key: 'desc', style: { fontSize: '11px', color: 'var(--chrome-text-dim)', lineHeight: '1.5' } }, desc) : null,
      children || null
    ];
  }

  // Action card: a real button that keeps the card appearance.
  function ActionCard(props) {
    return h('button', {
      type: 'button',
      className: 'wb-card-btn',
      onClick: props.onClick,
      style: cardBtnStyle(props.accent)
    }, cardInner(props.title, props.desc, props.children));
  }

  // Back button: a real button.
  function BackButton(props) {
    return h('button', {
      type: 'button',
      className: 'wb-card-btn',
      onClick: props.onClick,
      style: {
        width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px',
        fontSize: '12px', color: 'var(--chrome-text-dim)', marginBottom: '14px', padding: '4px 6px'
      }
    }, PraxisIcons.chevronLeft(), t('common.back'));
  }

  // What the dropped package is, read off the package itself. Anything the
  // file does not carry is omitted rather than guessed: a .praxis file holds
  // no experience tier, so this never claims one.
  // Which stations a partial (single station export) file carries, named the
  // way the rest of the app names them. Gives the record a real title instead
  // of falling back to the section heading.
  function partialStationNames(data) {
    var names = [];
    Object.keys(PraxisSchema.STATION_FIELDS).forEach(function(id) {
      var carries = PraxisSchema.STATION_FIELDS[id].some(function(field) {
        var val = data[field];
        return val && typeof val === 'object' && !Array.isArray(val);
      });
      if (!carries) return;
      var label = PraxisSchema.STATION_LABELS[id];
      if (!label && id === '9') label = t('manifest.station_planning');
      if (label && names.indexOf(label) === -1) names.push(label);
    });
    return names;
  }

  function ImportManifest(props) {
    var entry = props.pending;
    var meta = entry.meta;
    var partial = !!(entry.check && entry.check.partial);
    var hasSaved = PraxisContext.hasSavedProject();
    var carries = partial ? partialStationNames(entry.data) : [];

    // A partial file is titled by the stations it carries, so it needs no
    // fact restating them.
    var facts = [];
    if (!partial && meta) {
      // Station 9 is Planning, which the rail shows as "P" rather than a
      // number, so it is named instead of counted against the nine.
      var stationText;
      if (meta.station === 9) stationText = t('manifest.station_planning');
      else if (meta.station === 0) stationText = t('manifest.station_start');
      else stationText = t('manifest.station_value', { n: meta.station, name: meta.stationName });
      facts.push({ key: 'station', label: t('manifest.station'), value: stationText });

      if (meta.questionCount > 0) {
        facts.push({
          key: 'questions', label: t('manifest.questions'),
          value: t('manifest.questions_value', { n: meta.questionCount })
        });
      }
      if (meta.updatedAt) {
        facts.push({ key: 'saved', label: t('manifest.saved'), value: PraxisUtils.formatDate(meta.updatedAt) });
      }
    }

    // What opening this file will actually do. A partial merges into the saved
    // project rather than replacing it, and only when there is one to merge
    // into, so these cases are exclusive: saying "merges into your saved
    // project" and "replaces your saved project" together would be a
    // contradiction, and only one of them is ever true.
    var notes = [];
    if (partial) {
      notes.push({ key: 'partial', text: hasSaved ? t('manifest.partial_merge') : t('manifest.partial_fresh') });
    } else {
      // Only worth saying when the file is actually behind the running build.
      if (meta && meta.version && meta.version !== PraxisSchema.PRAXIS_VERSION) {
        notes.push({ key: 'migrate', text: t('manifest.migrate', { from: meta.version, to: PraxisSchema.PRAXIS_VERSION }) });
      }
      if (hasSaved) notes.push({ key: 'replaces', text: t('manifest.replaces') });
    }

    return h('div', { className: 'wb-manifest' },
      h('div', null,
        h('p', { className: 'wb-manifest-eyebrow' },
          PraxisIcons.check(12),
          partial && hasSaved ? t('manifest.eyebrow_merge') : t('manifest.eyebrow')
        ),
        // A partial file has no project_meta to name it, so it is titled by
        // the station it carries rather than by the section heading.
        h('h2', { className: 'wb-manifest-name' },
          partial
            ? (carries.length ? carries.join(', ') : t('manifest.partial_generic'))
            : (meta ? meta.name : t('manifest.partial_generic'))
        ),
        meta && meta.organisation
          ? h('p', { className: 'wb-manifest-org' }, meta.organisation)
          : null
      ),
      facts.length
        ? h('dl', { className: 'wb-manifest-facts' },
            facts.map(function(f) {
              return h('div', { key: f.key, className: 'wb-manifest-fact' },
                h('dt', null, f.label),
                h('dd', null, f.value)
              );
            })
          )
        : null,
      notes.length
        ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            notes.map(function(n) {
              return h('p', { key: n.key, className: 'wb-manifest-note' },
                h('span', { className: 'wb-manifest-note-dot', 'aria-hidden': 'true' }),
                h('span', null, n.text)
              );
            })
          )
        : null,
      h('div', { className: 'wb-manifest-actions' },
        h('button', { type: 'button', className: 'wb-btn wb-btn-primary', onClick: props.onOpen }, t('manifest.open')),
        h('button', { type: 'button', className: 'wb-btn wb-btn-ghost on-chrome', onClick: props.onCancel }, t('manifest.choose_another'))
      )
    );
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
    // A file that has been read and described but not yet opened:
    // { data, check, meta } or null. Distinct from `pending` above, which
    // gates the replace-your-saved-project modal.
    var pendingImportState = React.useState(null);
    var pendingImport = pendingImportState[0];
    var setPendingImport = pendingImportState[1];
    // Highlighted tier in the tier radiogroup (does not create a project on
    // its own; only activation via Enter/Space/click does).
    var tierChoiceState = React.useState(null);
    var tierChoice = tierChoiceState[0];
    var setTierChoice = tierChoiceState[1];
    // About/Privacy modal: null when closed, otherwise the tab to open on.
    var aboutTabState = React.useState(null);
    var aboutTab = aboutTabState[0];
    var setAboutTab = aboutTabState[1];

    // Check for saved data without loading it into state
    var hasSaved = React.useMemo(function() {
      return PraxisContext.hasSavedProject();
    }, []);

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

    // Open a file the user has now seen described and confirmed. The manifest
    // states that a backup is kept and that a partial file merges, so this
    // must keep doing both.
    function commitImport(entry) {
      var check = entry.check;
      // Keep a backup of the current save before an import can replace or
      // modify it on the next autosave.
      if (PraxisContext.hasSavedProject() || PraxisContext.getUnreadableSavedData()) {
        PraxisContext.writeBackup('import');
      }
      var fileAction = { type: AT.LOAD_FILE, context: entry.data };
      // Partial imports in a fresh session merge into the saved project, not
      // onto the empty in-memory context (which would then overwrite the
      // saved project on the next autosave).
      if (check.partial && PraxisContext.hasSavedProject()) {
        fileAction.base = PraxisContext.loadSavedProject();
      }
      setPendingImport(null);
      dispatch(fileAction);
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

    // Station preview for left panel: uniform color, subtle opacity fade for
    // depth-of-field. Floor is 0.85 so every station name still clears WCAG AA
    // (>= 4.5:1) on --navy; the dimmest item lands at ~6.05:1.
    var stationPreview = LABELS.map(function(name, i) {
      var opacity = Math.max(0.85, 1 - i * 0.09);
      return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', opacity: opacity } },
        h('span', { style: { fontSize: '11px', fontWeight: 700, color: 'var(--teal)', minWidth: '16px' } }, i),
        h('span', { style: { fontSize: '12px', color: 'var(--chrome-text-dim)' } }, name)
      );
    });

    // Left panel
    var leftPanel = h('div', { className: 'wb-landing-left' },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' } },
        h(Logo, null),
        h('span', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.12em' } }, 'PRAXIS')
      ),
      h('h1', { style: { fontSize: '24px', fontWeight: 700, color: 'var(--chrome-text)', margin: '0 0 8px 0' } }, t('landing.title')),
      h('p', { style: { fontSize: '12px', color: 'var(--chrome-text-dim)', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '380px' } }, t('landing.subtitle')),
      h('div', { style: { maxWidth: '260px' } }, stationPreview),
      h('div', { style: { marginTop: '28px', fontSize: '11px', color: 'var(--chrome-text-dim)', display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', null, 'PRAXIS Evaluation Workbench v' + PraxisSchema.PRAXIS_VERSION),
        h('span', { 'aria-hidden': 'true' }, '·'),
        h('button', {
          type: 'button', onClick: function() { setAboutTab('about'); },
          style: { background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer' }
        }, 'About'),
        h('span', { 'aria-hidden': 'true' }, '·'),
        h('button', {
          type: 'button', onClick: function() { setAboutTab('privacy'); },
          style: { background: 'none', border: 'none', padding: 0, color: 'inherit', font: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer' }
        }, 'Privacy')
      )
    );

    // Right panel content depends on mode
    var rightContent;

    if (mode === 'tier') {
      // Tier selection: an accessible radiogroup. Highlighting a tier does
      // not create a project; activating one (Enter/Space/click) does.
      var tiers = [
        { value: 'foundation', label: 'Foundation', accent: 'var(--green)', textKey: 'landing.tier_foundation' },
        { value: 'practitioner', label: 'Practitioner', accent: 'var(--blue)', textKey: 'landing.tier_practitioner' },
        { value: 'advanced', label: 'Advanced', accent: 'var(--purple)', textKey: 'landing.tier_advanced' }
      ];
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, t('landing.tier_title')),
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
              // must not leak into this one (see EntryLanding demo picker
              // below and the hash-clearing effect in app.js).
              dispatch({ type: AT.INIT, tier: val });
            });
          },
          itemClassName: function(opt, sel) { return 'wb-card-btn' + (sel ? ' wb-card-btn--selected' : ''); },
          itemStyle: function(opt) { return cardBtnStyle(opt.accent); },
          renderItem: function(opt) { return cardInner(opt.label, t(opt.textKey)); }
        })
      );

    } else if (mode === 'open') {
      // Reading a file describes it; it does not open it. A .praxis package is
      // somebody's whole evaluation, and opening one replaces the project in
      // this browser, so the user sees what they picked up (and what opening
      // it will do to what they already have) before committing to it.
      rightContent = h('div', { className: 'wb-open' + (pendingImport ? ' wb-open--manifest' : '') },
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '4px' } }, t('landing.open')),
        h('p', { style: { fontSize: '12px', color: 'var(--chrome-text-dim)', lineHeight: '1.6', margin: '0 0 16px 0' } }, t('landing.open_desc')),
        pendingImport
          ? h(ImportManifest, {
              pending: pendingImport,
              onOpen: function() { commitImport(pendingImport); },
              onCancel: function() { setPendingImport(null); }
            })
          : h(FileDropZone, {
              onFile: function(data) {
                var check = PraxisSchema.validateContext(data);
                if (!check.ok) {
                  showToast((check.errors && check.errors[0]) || 'That file is not a workbench project.', 'error');
                  return;
                }
                setPendingImport({ data: data, check: check, meta: PraxisContext.describeContext(data) });
              },
              onError: function(err) {
                showToast('Could not read file: ' + ((err && err.message) || 'unknown error') + '.', 'error');
              }
            })
      );

    } else if (mode === 'quick') {
      // Station selector: the nine linear stations plus the optional Planning
      // and contract station (index 9, reached in-app by the rail "P" button),
      // folded in here so it is no longer a separate landing card.
      var stationRowStyle = {
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
        marginBottom: '6px', transition: 'background 0.15s'
      };
      function stationRow(key, badge, name, station) {
        return h('button', {
          key: key, type: 'button', className: 'wb-card-btn',
          onClick: function() {
            guardDestructive(function() {
              dispatch({ type: AT.INIT, station: station });
            });
          },
          style: stationRowStyle
        },
          h('span', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--teal)', minWidth: '16px' } }, badge),
          h('span', { style: { fontSize: '12px', color: 'var(--chrome-text-dim)' } }, name)
        );
      }
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, 'Go to a station'),
        LABELS.map(function(name, i) { return stationRow(i, i, name, i); }),
        stationRow('planning', 'P', 'Planning and contract', 9)
      );

    } else if (mode === 'demo') {
      // Demo picker: one card per pre-populated example evaluation
      var demos = [
        { key: 'gf', title: 'Global Fund Malaria SNT', accent: 'var(--blue)',
          desc: 'Independent evaluation of sub-national tailoring of malaria interventions across 12 HBHI countries. 26 evaluation questions, contribution analysis, and a mixed-methods country-insights sample. Both the evaluation team and the commissioner cockpit are fully populated.',
          ctx: window.PRAXIS_DEMO_GF },
        { key: 'zd', title: 'Gavi Zero-Dose', accent: 'var(--teal)',
          desc: 'Multi-country immunisation equity evaluation (8 countries). 8 evaluation questions, contribution analysis, and 126 key informant interviews. Both the evaluation team and the commissioner cockpit are fully populated.',
          ctx: window.PRAXIS_DEMO_ZD }
      ];
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, 'Open a worked example'),
        demos.map(function(d) {
          return h(ActionCard, {
            key: d.key, title: d.title, accent: d.accent, desc: d.desc,
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
      );

    } else {
      // Default: action cards with accent colors mapped to design system tokens
      var cards = [
        h(ActionCard, { key: 'new', title: '+ ' + t('landing.new'), desc: t('landing.new_desc'), accent: 'var(--teal)', onClick: function() { setMode('tier'); } }),
        h(ActionCard, { key: 'open', title: t('landing.open'), desc: t('landing.open_desc'), accent: 'var(--blue)', onClick: function() { setMode('open'); } }),
        h(ActionCard, { key: 'quick', title: t('landing.quick'), desc: t('landing.quick_desc'), accent: 'var(--purple)', onClick: function() { setMode('quick'); } }),
        h(ActionCard, { key: 'demo', title: 'Worked examples', desc: 'Two complete evaluations, filled from scoping through the commissioner cockpit. Global Fund Malaria SNT or Gavi Zero-Dose.', accent: 'var(--amber)',
          onClick: function() { setMode('demo'); }
        }),
        h(ActionCard, { key: 'commissioner', title: 'Commissioner cockpit', desc: 'Commission for use: name the intended users and the decisions they must make, quality-assure the design before spend, hold delivery to schedule, and drive findings to implementation. Starts an empty cockpit for your own commission.', accent: 'var(--blue)',
          onClick: function() {
            guardDestructive(function() {
              dispatch({ type: AT.INIT, role: 'commissioner', tier: 'practitioner' });
            });
          }
        })
      ];

      // Continue card (only if saved project has actual data)
      if (hasSaved) {
        var meta = PraxisContext.getSavedProjectMeta();
        var metaLine = meta
          ? meta.name + ' · Station ' + meta.station + ' (' + meta.stationName + ')' + (meta.updatedAt ? ' · ' + PraxisUtils.formatDate(meta.updatedAt) : '')
          : 'Resume saved project';
        cards.push(h(ActionCard, {
          key: 'continue', title: t('landing.continue'), accent: 'var(--green)',
          onClick: openSavedProject
        },
          h('div', { key: 'meta', style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' } },
            h('span', { style: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' } }),
            h('span', { style: { fontSize: '11px', color: 'var(--chrome-text-dim)' } }, metaLine)
          )
        ));
      }

      // Recovery card: saved data exists but cannot be read as a project
      if (!hasSaved && unreadable) {
        cards.push(h(ActionCard, {
          key: 'recover', title: 'Recover unreadable saved data', accent: 'var(--amber)',
          desc: 'Saved workbench data exists in this browser but could not be read as a project. Download a copy before it is overwritten by new work.',
          onClick: function() {
            try {
              var blob = new Blob([unreadable], { type: 'application/json' });
              PraxisUtils.downloadBlob(blob, 'praxis-recovery-' + new Date().toISOString().slice(0, 10) + '.json');
              showToast('Recovery file downloaded.', 'success');
            } catch (e) {
              showToast('Could not download the recovery file: ' + e.message, 'error');
            }
          }
        }));
      }

      // Subdued restore line for the rotating backup slot
      if (backupMeta) {
        var backupLine = 'Restore previous project (' + backupMeta.name +
          (backupMeta.backedUpAt ? ', backed up ' + PraxisUtils.formatDate(backupMeta.backedUpAt) : '') + ')';
        cards.push(h('button', {
          key: 'restore', type: 'button',
          onClick: handleRestoreBackup,
          style: {
            background: 'transparent', border: 'none', color: 'var(--chrome-text-dim)',
            fontSize: '11px', textAlign: 'left', padding: '2px 4px', cursor: 'pointer',
            textDecoration: 'underline', textUnderlineOffset: '2px'
          }
        }, backupLine));
      }

      rightContent = h('div', null, cards);
    }

    var rightPanel = h('div', { className: 'wb-landing-right' }, rightContent);

    // Confirmation before a destructive action replaces the saved project
    var confirmModal = null;
    if (pending) {
      var savedMeta = PraxisContext.getSavedProjectMeta();
      var savedName = (savedMeta && savedMeta.name) || 'Untitled';
      var savedWhen = savedMeta && savedMeta.updatedAt ? ', last updated ' + PraxisUtils.formatDate(savedMeta.updatedAt) : '';
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

    return h('div', { className: 'wb-landing on-chrome', style: {
      fontFamily: "var(--font-sans)", zIndex: 100
    }}, leftPanel, rightPanel, confirmModal, aboutModal);
  }

  window.EntryLanding = EntryLanding;
})();
