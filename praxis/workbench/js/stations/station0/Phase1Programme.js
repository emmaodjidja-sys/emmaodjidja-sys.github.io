(function() {
  'use strict';
  var h = React.createElement;

  var SECTORS = ['Peacebuilding / PVE', 'Health', 'Education', 'Livelihoods', 'WASH', 'Nutrition', 'Governance', 'Protection'];

  function OptionCards(props) {
    return h('div', { style: { display: 'flex', gap: '8px' } },
      props.options.map(function(opt) {
        var selected = props.value === opt.value;
        var cls = 'wb-option-card' + (selected ? ' wb-option-card--selected' : '') + (selected && opt.variant ? ' wb-option-card--' + opt.variant : '');
        return h('div', { key: opt.value, className: cls, onClick: function() { props.onChange(opt.value); } },
          h('div', { style: { fontSize: '12px', fontWeight: 600, color: selected ? (opt.variantColor || '#0B1A2E') : '#0B1A2E' } }, opt.label),
          opt.desc ? h('div', { style: { fontSize: '9px', color: '#64748B', marginTop: 2 } }, opt.desc) : null
        );
      })
    );
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
      // Guidance banner
      showGuide ? h('div', { className: 'wb-guidance' },
        h('span', { className: 'wb-guidance-text' }, 'Start by entering basic programme details. These inform the evaluability scoring in Phase 3 and carry forward to every downstream station.'),
        h('button', { className: 'wb-guidance-close', onClick: dismissGuide }, '\u00D7')
      ) : null,

      // Form grid
      h('div', { className: 'wb-form-grid' },
        // Programme Name
        h('div', null,
          h('label', { className: 'wb-label' }, 'Programme Name'),
          h('input', { className: 'wb-input', type: 'text', value: data.programme_name || '', placeholder: 'e.g. Resilience Through Livelihoods', onChange: function(e) { onChange('programme_name', e.target.value); } })
        ),

        // Organisation
        h('div', null,
          h('label', { className: 'wb-label' }, 'Organisation'),
          h('input', { className: 'wb-input', type: 'text', value: data.organisation || '', placeholder: 'e.g. Mercy Corps', onChange: function(e) { onChange('organisation', e.target.value); } })
        ),

        // Sectors (full width)
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-label' }, 'Sectors'),
          h('div', { style: { fontSize: '11px', color: '#64748B', marginBottom: 6 } }, 'Select all that apply'),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
            SECTORS.map(function(s) {
              var selected = sectors.indexOf(s) >= 0;
              return h('span', {
                key: s,
                className: 'wb-chip' + (selected ? ' wb-chip--selected' : ''),
                onClick: function() { toggleSector(s); }
              }, selected ? '\u2713 ' + s : s);
            })
          ),
          sectors.length >= 5 ? h('div', { style: { fontSize: '11px', color: '#D97706', marginTop: 6 } }, 'Multiple sectors selected \u2014 consider designating a primary sector in the context drawer.') : null
        ),

        // Country/Region
        h('div', null,
          h('label', { className: 'wb-label' }, 'Country / Region'),
          h('input', { className: 'wb-input', type: 'text', value: data.country || '', placeholder: 'e.g. South Sudan, DRC', onChange: function(e) { onChange('country', e.target.value); } })
        ),

        // Budget Range
        h('div', null,
          h('label', { className: 'wb-label' }, 'Budget Range'),
          h('div', { style: { fontSize: '11px', color: '#64748B', marginBottom: 6 } }, 'Often not in the ToR \u2014 skip if unknown'),
          OptionCards({ value: data.budget, onChange: function(v) { onChange('budget', v); }, options: [
            { value: 'low', label: 'Low', desc: '<$200K' },
            { value: 'medium', label: 'Medium', desc: '$200K\u2013$1M' },
            { value: 'high', label: 'High', desc: '>$1M' }
          ] })
        ),

        // Operating Context
        h('div', null,
          h('label', { className: 'wb-label' }, 'Operating Context'),
          OptionCards({ value: data.operating_context, onChange: function(v) { onChange('operating_context', v); }, options: [
            { value: 'stable', label: 'Stable' },
            { value: 'fragile', label: 'Fragile', variant: 'amber' },
            { value: 'humanitarian', label: 'Humanitarian' }
          ] })
        ),

        // Programme Maturity
        h('div', null,
          h('label', { className: 'wb-label' }, 'Programme Maturity'),
          OptionCards({ value: data.programme_maturity, onChange: function(v) { onChange('programme_maturity', v); }, options: [
            { value: 'pilot', label: 'Pilot' },
            { value: 'scaling', label: 'Scaling' },
            { value: 'mature', label: 'Mature' }
          ] })
        ),

        // Timeline
        h('div', null,
          h('label', { className: 'wb-label' }, 'Timeline'),
          OptionCards({ value: data.timeline, onChange: function(v) { onChange('timeline', v); }, options: [
            { value: 'short', label: 'Short', desc: '<6 months' },
            { value: 'medium', label: 'Medium', desc: '6\u201312 months' },
            { value: 'long', label: 'Long', desc: '>12 months' }
          ] })
        )
      ),

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Phase 1 of 3 \u00B7 Programme Details'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: function() {
            // Save draft to localStorage
            try { localStorage.setItem('praxis-wb-draft-p1', JSON.stringify(data)); } catch(e) {}
          } }, 'Save Draft'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: onContinue }, 'Review & Continue \u2192')
        )
      )
    );
  }

  window.Phase1Programme = Phase1Programme;
})();
