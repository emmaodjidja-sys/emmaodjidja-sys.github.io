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

  // Action card component
  function ActionCard(props) {
    var accentColor = props.accent || 'rgba(255,255,255,0.08)';
    return h('div', {
      onClick: props.onClick,
      style: {
        padding: '16px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
        cursor: 'pointer', marginBottom: '10px', borderLeft: '3px solid ' + accentColor,
        transition: 'background 0.15s'
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; },
      onMouseLeave: function(e) { e.currentTarget.style.background = 'transparent'; }
    },
      h('div', { style: { fontSize: '13px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: 4 } }, props.title),
      props.desc ? h('div', { style: { fontSize: '11px', color: 'var(--chrome-text-dim)', lineHeight: '1.5' } }, props.desc) : null,
      props.children
    );
  }

  // Back button
  function BackButton(props) {
    return h('div', {
      onClick: props.onClick,
      style: { fontSize: '12px', color: 'var(--chrome-text-dim)', cursor: 'pointer', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }
    }, PraxisIcons.chevronLeft(), t('common.back'));
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

    // Open the saved project, restoring the station and tier the user was on.
    function openSavedProject() {
      var saved = PraxisContext.loadSavedProject();
      if (!saved) {
        showToast('The saved project could not be read.', 'error');
        return;
      }
      var uiSaved = PraxisContext.getSavedUIState() || {};
      dispatch({ type: AT.LOAD_FILE, context: saved, station: uiSaved.activeStation, tier: uiSaved.experienceTier });
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

    // Station preview for left panel: uniform color, opacity fade for depth-of-field
    var stationPreview = LABELS.map(function(name, i) {
      var opacity = Math.max(0.25, 1 - i * 0.09);
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
      h('div', { style: { maxWidth: '260px' } }, stationPreview)
    );

    // Right panel content depends on mode
    var rightContent;

    if (mode === 'tier') {
      // Tier selection
      var tiers = [
        { key: 'foundation', label: 'Foundation', accent: 'var(--green)', textKey: 'landing.tier_foundation' },
        { key: 'practitioner', label: 'Practitioner', accent: 'var(--blue)', textKey: 'landing.tier_practitioner' },
        { key: 'advanced', label: 'Advanced', accent: 'var(--purple)', textKey: 'landing.tier_advanced' }
      ];
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, t('landing.tier_title')),
        tiers.map(function(tier) {
          return h(ActionCard, {
            key: tier.key, title: tier.label, accent: tier.accent, desc: t(tier.textKey),
            onClick: function() {
              guardDestructive(function() {
                try { localStorage.removeItem('praxis-workbench'); localStorage.removeItem('praxis-workbench-ui'); } catch (e) {}
                dispatch({ type: AT.INIT, tier: tier.key });
              });
            }
          });
        })
      );

    } else if (mode === 'open') {
      // File drop zone
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, t('landing.open')),
        h(FileDropZone, {
          label: 'Drop .praxis file here or click to browse',
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
      );

    } else if (mode === 'quick') {
      // Station selector
      rightContent = h('div', null,
        h(BackButton, { onClick: function() { setMode(null); } }),
        h('div', { style: { fontSize: '14px', fontWeight: 600, color: 'var(--chrome-text)', marginBottom: '14px' } }, 'Go to a station'),
        LABELS.map(function(name, i) {
          return h('div', {
            key: i, onClick: function() {
              guardDestructive(function() {
                dispatch({ type: AT.INIT, station: i });
              });
            },
            style: {
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer',
              marginBottom: '6px', transition: 'background 0.15s'
            },
            onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; },
            onMouseLeave: function(e) { e.currentTarget.style.background = 'transparent'; }
          },
            h('span', { style: { fontSize: '12px', fontWeight: 700, color: 'var(--teal)', minWidth: '16px' } }, i),
            h('span', { style: { fontSize: '12px', color: 'var(--chrome-text-dim)' } }, name)
          );
        })
      );

    } else if (mode === 'demo') {
      // Demo picker: one card per pre-populated example evaluation
      var demos = [
        { key: 'gf', title: 'Global Fund Malaria SNT', accent: 'var(--blue)',
          desc: 'Independent evaluation of sub-national tailoring of malaria interventions across 12 HBHI countries. 26 evaluation questions, contribution analysis, and a mixed-methods country-insights sample.',
          ctx: window.PRAXIS_DEMO_GF },
        { key: 'zd', title: 'Gavi Zero-Dose', accent: 'var(--teal)',
          desc: 'Multi-country immunisation equity evaluation (8 countries). 8 evaluation questions, contribution analysis, and 126 key informant interviews.',
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
        h(ActionCard, { key: 'demo', title: 'Worked examples', desc: 'A complete worked evaluation across all nine stations. Global Fund Malaria SNT or Gavi Zero-Dose.', accent: 'var(--amber)',
          onClick: function() { setMode('demo'); }
        }),
        h(ActionCard, { key: 'planning', title: 'Planning and contract management', desc: 'Budget, deliverables, invoices and quality review across an evaluation contract. Opens a worked example at the optional Planning station.', accent: 'var(--green)',
          onClick: function() {
            if (!window.PRAXIS_DEMO_GF) return;
            guardDestructive(function() {
              dispatch({ type: AT.INIT, context: window.PRAXIS_DEMO_GF, tier: 'practitioner', station: 9 });
            });
          }
        })
      ];

      // Continue card (only if saved project has actual data)
      if (hasSaved) {
        var meta = PraxisContext.getSavedProjectMeta();
        var metaLine = meta
          ? meta.name + ' \u00B7 Station ' + meta.station + ' (' + meta.stationName + ')' + (meta.updatedAt ? ' \u00B7 ' + PraxisUtils.formatDate(meta.updatedAt) : '')
          : 'Resume saved project';
        cards.push(h(ActionCard, {
          key: 'continue', title: t('landing.continue'), accent: 'var(--green)',
          onClick: openSavedProject
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' } },
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

    return h('div', { className: 'wb-landing', style: {
      fontFamily: "var(--font-sans)", zIndex: 100
    }}, leftPanel, rightPanel, confirmModal);
  }

  window.EntryLanding = EntryLanding;
})();
