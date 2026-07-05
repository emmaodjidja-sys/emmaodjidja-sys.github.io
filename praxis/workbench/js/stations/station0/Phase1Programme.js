(function() {
  'use strict';
  var h = React.createElement;

  var SECTORS = ['Peacebuilding / PVE', 'Health', 'Education', 'Livelihoods', 'WASH', 'Nutrition', 'Governance', 'Protection'];

  function OptionCards(props) {
    return h(PraxisRadioGroup, {
      options: props.options,
      value: props.value,
      onChange: props.onChange,
      ariaLabel: props.ariaLabel,
      groupClassName: 'wb-select-grid',
      itemClassName: function(opt, selected) {
        return 'wb-select-card' + (selected ? ' wb-select-card--active' : '') + (selected && opt.variant ? ' wb-select-card--' + opt.variant : '');
      },
      renderItem: function(opt) {
        return [
          h('div', { key: 'label', className: 'wb-select-card-label' }, opt.label),
          opt.desc ? h('div', { key: 'hint', className: 'wb-select-card-hint' }, opt.desc) : null
        ];
      }
    });
  }

  function Phase1Programme(props) {
    var data = props.data || {};
    var onChange = props.onChange;
    var onContinue = props.onContinue;
    var sectors = data.sectors || [];

    var guideState = React.useState(function() {
      return !localStorage.getItem('wb-dismiss-phase1-guide');
    });
    var showGuide = guideState[0];
    var setShowGuide = guideState[1];

    function dismissGuide() {
      localStorage.setItem('wb-dismiss-phase1-guide', '1');
      setShowGuide(false);
    }

    function toggleSector(sector) {
      var next = sectors.indexOf(sector) >= 0
        ? sectors.filter(function(s) { return s !== sector; })
        : sectors.concat([sector]);
      onChange('sectors', next);
    }

    return h('div', null,
      h(SectionCard, { title: 'Programme Details', badge: data.programme_name ? 'Editing' : 'New' },
      // Guidance banner
      showGuide ? h('div', { className: 'wb-guidance' },
        h('span', { className: 'wb-guidance-text' }, 'Start by entering basic programme details. These inform the evaluability scoring in Phase 3 and carry forward to every downstream station.'),
        h('button', { className: 'wb-guidance-close', onClick: dismissGuide }, PraxisIcons.close(16))
      ) : null,

      // Form grid
      h('div', { className: 'wb-form-grid' },
        // Programme Name
        h(PraxisField, { fieldKey: 'programme_name', label: 'Programme Name' },
          h('input', { className: 'wb-input', type: 'text', value: data.programme_name || '', placeholder: 'e.g. Resilience Through Livelihoods', onChange: function(e) { onChange('programme_name', e.target.value); } })
        ),

        // Organisation
        h(PraxisField, { fieldKey: 'organisation', label: 'Organisation' },
          h('input', { className: 'wb-input', type: 'text', value: data.organisation || '', placeholder: 'e.g. Mercy Corps', onChange: function(e) { onChange('organisation', e.target.value); } })
        ),

        // Sectors (full width)
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-field-label', id: 'wb-sectors-label' }, 'Sectors'),
          h('div', { className: 'wb-field-helper' }, 'Select all that apply'),
          h('div', { role: 'group', 'aria-labelledby': 'wb-sectors-label', style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
            SECTORS.map(function(s) {
              var selected = sectors.indexOf(s) >= 0;
              return h('button', {
                key: s,
                type: 'button',
                className: 'wb-chip' + (selected ? ' wb-chip--selected' : ''),
                'aria-pressed': selected ? 'true' : 'false',
                onClick: function() { toggleSector(s); }
              }, selected ? PraxisIcons.check(12) : null, selected ? ' ' + s : s);
            })
          ),
          sectors.length >= 5 ? h('div', { style: { fontSize: '11px', color: '#D97706', marginTop: 6 } }, 'Multiple sectors selected. Consider designating a primary sector in the context drawer.') : null
        ),

        // Country/Region
        h(PraxisField, { fieldKey: 'country', label: 'Country / Region' },
          h('input', { className: 'wb-input', type: 'text', value: data.country || '', placeholder: 'e.g. South Sudan, DRC', onChange: function(e) { onChange('country', e.target.value); } })
        ),

        // Budget Range
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Budget Range'),
          h('div', { className: 'wb-field-helper' }, 'Often not in the ToR, skip if unknown'),
          OptionCards({ ariaLabel: 'Budget Range', value: data.budget, onChange: function(v) { onChange('budget', v); }, options: [
            { value: 'low', label: 'Low', desc: '<$200K' },
            { value: 'medium', label: 'Medium', desc: '$200K-$1M' },
            { value: 'high', label: 'High', desc: '>$1M' }
          ] })
        ),

        // Operating Context
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Operating Context'),
          OptionCards({ ariaLabel: 'Operating Context', value: data.operating_context, onChange: function(v) { onChange('operating_context', v); }, options: [
            { value: 'stable', label: 'Stable' },
            { value: 'fragile', label: 'Fragile', variant: 'amber' },
            { value: 'humanitarian', label: 'Humanitarian' }
          ] })
        ),

        // Programme Maturity
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Programme Maturity'),
          OptionCards({ ariaLabel: 'Programme Maturity', value: data.programme_maturity, onChange: function(v) { onChange('programme_maturity', v); }, options: [
            { value: 'pilot', label: 'Pilot' },
            { value: 'scaling', label: 'Scaling' },
            { value: 'mature', label: 'Mature' }
          ] })
        ),

        // Timeline
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Timeline'),
          OptionCards({ ariaLabel: 'Timeline', value: data.timeline, onChange: function(v) { onChange('timeline', v); }, options: [
            { value: 'short', label: 'Short', desc: '<6 months' },
            { value: 'medium', label: 'Medium', desc: '6-12 months' },
            { value: 'long', label: 'Long', desc: '>12 months' }
          ] })
        )
      )
      ), // end SectionCard

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Phase 1 of 3 \u00B7 Programme Details'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: function() {
            // Draft is auto-saved by app.js, this is informational
            if (props.onShowToast) props.onShowToast('Draft saved automatically');
          } }, 'Save Draft'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: onContinue, style: { display: 'flex', alignItems: 'center', gap: 6 } }, 'Review and continue', PraxisIcons.chevronRight())
        )
      )
    );
  }

  window.Phase1Programme = Phase1Programme;
})();
