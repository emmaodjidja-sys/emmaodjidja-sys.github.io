(function() {
  'use strict';
  var h = React.createElement;

  function OptionCards(props) {
    return h(PraxisRadioGroup, {
      options: props.options,
      value: props.value,
      onChange: props.onChange,
      ariaLabel: props.ariaLabel,
      groupClassName: 'wb-select-grid',
      itemClassName: function(opt, selected) {
        return 'wb-select-card' + (selected ? ' wb-select-card--active' : '');
      },
      renderItem: function(opt) {
        return [
          h('div', { key: 'label', className: 'wb-select-card-label' }, opt.label),
          opt.desc ? h('div', { key: 'hint', className: 'wb-select-card-hint' }, opt.desc) : null
        ];
      }
    });
  }

  function Phase2ToR(props) {
    var data = props.data || {};
    var onChange = props.onChange;
    var purposes = data.evaluation_purpose || [];
    var questions = data.evaluation_questions_raw || [];

    function togglePurpose(p) {
      var next = purposes.indexOf(p) >= 0
        ? purposes.filter(function(v) { return v !== p; })
        : purposes.concat([p]);
      onChange('evaluation_purpose', next);
    }

    function updateQuestion(idx, val) {
      var next = questions.slice();
      next[idx] = val;
      onChange('evaluation_questions_raw', next);
    }

    function addQuestion() {
      onChange('evaluation_questions_raw', questions.concat(['']));
    }

    function removeQuestion(idx) {
      onChange('evaluation_questions_raw', questions.filter(function(_, i) { return i !== idx; }));
    }

    return h('div', null,
      h('div', { className: 'wb-form-grid' },
        // Raw ToR text
        h(PraxisField, {
          fieldKey: 'raw_text', label: 'Terms of Reference',
          helper: 'Paste your Terms of Reference here if you have one (optional)',
          style: { gridColumn: '1 / -1' }
        },
          h('textarea', { className: 'wb-input', rows: 5, value: data.raw_text || '', placeholder: 'Paste ToR text here...', onChange: function(e) { onChange('raw_text', e.target.value); } })
        ),

        // Evaluation purpose (multi-select chips)
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-field-label', id: 'wb-purpose-label' }, 'Evaluation Purpose'),
          h('div', { role: 'group', 'aria-labelledby': 'wb-purpose-label', style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
            ['Impact', 'Outcome', 'Process', 'Learning'].map(function(p) {
              var selected = purposes.indexOf(p) >= 0;
              return h('button', {
                key: p,
                type: 'button',
                className: 'wb-chip' + (selected ? ' wb-chip--selected' : ''),
                'aria-pressed': selected ? 'true' : 'false',
                onClick: function() { togglePurpose(p); }
              }, selected ? PraxisIcons.check(12) : null, selected ? ' ' + p : p);
            })
          )
        ),

        // Causal inference level
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Causal Inference Level'),
          OptionCards({ ariaLabel: 'Causal Inference Level', value: data.causal_inference_level, onChange: function(v) { onChange('causal_inference_level', v); }, options: [
            { value: 'attribution', label: 'Attribution' },
            { value: 'contribution', label: 'Contribution' },
            { value: 'description', label: 'Description' }
          ] })
        ),

        // Comparison feasibility
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Comparison Feasibility'),
          OptionCards({ ariaLabel: 'Comparison Feasibility', value: data.comparison_feasibility, onChange: function(v) { onChange('comparison_feasibility', v); }, options: [
            { value: 'randomisable', label: 'Randomisable' },
            { value: 'natural', label: 'Natural comparison' },
            { value: 'threshold', label: 'Eligibility threshold' },
            { value: 'none', label: 'No comparison group' }
          ] })
        ),

        // Data availability
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Data Availability'),
          OptionCards({ ariaLabel: 'Data Availability', value: data.data_available, onChange: function(v) { onChange('data_available', v); }, options: [
            { value: 'baseline_endline', label: 'Baseline + Endline' },
            { value: 'timeseries', label: 'Time series' },
            { value: 'routine_only', label: 'Routine only' },
            { value: 'minimal', label: 'Minimal / None' }
          ] })
        ),

        // Unit of intervention
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Unit of Intervention'),
          OptionCards({ ariaLabel: 'Unit of Intervention', value: data.unit_of_intervention, onChange: function(v) { onChange('unit_of_intervention', v); }, options: [
            { value: 'individual', label: 'Individual / Household' },
            { value: 'facility', label: 'Facility / Community' },
            { value: 'system', label: 'System / Policy' }
          ] })
        ),

        // Programme complexity
        h('div', null,
          h('label', { className: 'wb-field-label' }, 'Programme Complexity'),
          OptionCards({ ariaLabel: 'Programme Complexity', value: data.programme_complexity, onChange: function(v) { onChange('programme_complexity', v); }, options: [
            { value: 'simple', label: 'Simple / Linear' },
            { value: 'complicated', label: 'Complicated' },
            { value: 'complex', label: 'Complex / Adaptive' }
          ] })
        ),

        // Geographic scope
        h(PraxisField, { fieldKey: 'geographic_scope', label: 'Geographic Scope' },
          h('input', { className: 'wb-input', type: 'text', value: data.geographic_scope || '', placeholder: 'e.g. 3 districts in Jonglei State', onChange: function(e) { onChange('geographic_scope', e.target.value); } })
        ),

        // Target population
        h(PraxisField, { fieldKey: 'target_population', label: 'Target Population' },
          h('input', { className: 'wb-input', type: 'text', value: data.target_population || '', placeholder: 'e.g. Adolescent girls aged 10-19', onChange: function(e) { onChange('target_population', e.target.value); } })
        ),

        // Evaluation questions
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-field-label' }, 'Evaluation Questions from ToR'),
          questions.map(function(q, i) {
            return h('div', { key: i, style: { display: 'flex', gap: '6px', marginBottom: 6 } },
              h('input', { className: 'wb-input', type: 'text', value: q, style: { flex: 1 }, 'aria-label': 'Evaluation question ' + (i + 1), placeholder: 'Evaluation question ' + (i + 1), onChange: function(e) { updateQuestion(i, e.target.value); } }),
              h('button', { className: 'wb-btn wb-btn-outline', style: { padding: '4px 10px', fontSize: '12px' }, 'aria-label': 'Remove evaluation question ' + (i + 1), onClick: function() { removeQuestion(i); } }, PraxisIcons.close(16))
            );
          }),
          h('button', { className: 'wb-btn wb-btn-outline', style: { fontSize: '12px', marginTop: 4 }, onClick: addQuestion }, '+ Add question')
        )
      ),

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Phase 2 of 3 \u00B7 Terms of Reference'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: props.onBack, style: { display: 'flex', alignItems: 'center', gap: 6 } }, PraxisIcons.chevronLeft(), 'Back'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: props.onContinue, style: { display: 'flex', alignItems: 'center', gap: 6 } }, 'Review and continue', PraxisIcons.chevronRight())
        )
      )
    );
  }

  window.Phase2ToR = Phase2ToR;
})();
