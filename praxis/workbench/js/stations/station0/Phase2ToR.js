(function() {
  'use strict';
  var h = React.createElement;

  function OptionCards(props) {
    return h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      props.options.map(function(opt) {
        var selected = props.value === opt.value;
        var cls = 'wb-option-card' + (selected ? ' wb-option-card--selected' : '');
        return h('div', { key: opt.value, className: cls, onClick: function() { props.onChange(opt.value); } },
          h('div', { style: { fontSize: '12px', fontWeight: 600 } }, opt.label),
          opt.desc ? h('div', { style: { fontSize: '9px', color: '#64748B', marginTop: 2 } }, opt.desc) : null
        );
      })
    );
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
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-label' }, 'Terms of Reference'),
          h('div', { style: { fontSize: '11px', color: '#64748B', marginBottom: 6 } }, 'Paste your Terms of Reference here if you have one (optional)'),
          h('textarea', { className: 'wb-input', rows: 5, value: data.raw_text || '', placeholder: 'Paste ToR text here...', onChange: function(e) { onChange('raw_text', e.target.value); } })
        ),

        // Evaluation purpose (multi-select chips)
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-label' }, 'Evaluation Purpose'),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' } },
            ['Impact', 'Outcome', 'Process', 'Learning'].map(function(p) {
              var selected = purposes.indexOf(p) >= 0;
              return h('span', {
                key: p,
                className: 'wb-chip' + (selected ? ' wb-chip--selected' : ''),
                onClick: function() { togglePurpose(p); }
              }, selected ? '\u2713 ' + p : p);
            })
          )
        ),

        // Causal inference level
        h('div', null,
          h('label', { className: 'wb-label' }, 'Causal Inference Level'),
          OptionCards({ value: data.causal_inference_level, onChange: function(v) { onChange('causal_inference_level', v); }, options: [
            { value: 'attribution', label: 'Attribution' },
            { value: 'contribution', label: 'Contribution' },
            { value: 'description', label: 'Description' }
          ] })
        ),

        // Comparison feasibility
        h('div', null,
          h('label', { className: 'wb-label' }, 'Comparison Feasibility'),
          OptionCards({ value: data.comparison_feasibility, onChange: function(v) { onChange('comparison_feasibility', v); }, options: [
            { value: 'randomisable', label: 'Randomisable' },
            { value: 'natural', label: 'Natural comparison' },
            { value: 'threshold', label: 'Eligibility threshold' },
            { value: 'none', label: 'No comparison group' }
          ] })
        ),

        // Data availability
        h('div', null,
          h('label', { className: 'wb-label' }, 'Data Availability'),
          OptionCards({ value: data.data_available, onChange: function(v) { onChange('data_available', v); }, options: [
            { value: 'baseline_endline', label: 'Baseline + Endline' },
            { value: 'timeseries', label: 'Time series' },
            { value: 'routine_only', label: 'Routine only' },
            { value: 'minimal', label: 'Minimal / None' }
          ] })
        ),

        // Unit of intervention
        h('div', null,
          h('label', { className: 'wb-label' }, 'Unit of Intervention'),
          OptionCards({ value: data.unit_of_intervention, onChange: function(v) { onChange('unit_of_intervention', v); }, options: [
            { value: 'individual', label: 'Individual / Household' },
            { value: 'facility', label: 'Facility / Community' },
            { value: 'system', label: 'System / Policy' }
          ] })
        ),

        // Programme complexity
        h('div', null,
          h('label', { className: 'wb-label' }, 'Programme Complexity'),
          OptionCards({ value: data.programme_complexity, onChange: function(v) { onChange('programme_complexity', v); }, options: [
            { value: 'simple', label: 'Simple / Linear' },
            { value: 'complicated', label: 'Complicated' },
            { value: 'complex', label: 'Complex / Adaptive' }
          ] })
        ),

        // Geographic scope
        h('div', null,
          h('label', { className: 'wb-label' }, 'Geographic Scope'),
          h('input', { className: 'wb-input', type: 'text', value: data.geographic_scope || '', placeholder: 'e.g. 3 districts in Jonglei State', onChange: function(e) { onChange('geographic_scope', e.target.value); } })
        ),

        // Target population
        h('div', null,
          h('label', { className: 'wb-label' }, 'Target Population'),
          h('input', { className: 'wb-input', type: 'text', value: data.target_population || '', placeholder: 'e.g. Adolescent girls aged 10\u201319', onChange: function(e) { onChange('target_population', e.target.value); } })
        ),

        // Evaluation questions
        h('div', { style: { gridColumn: '1 / -1' } },
          h('label', { className: 'wb-label' }, 'Evaluation Questions from ToR'),
          questions.map(function(q, i) {
            return h('div', { key: i, style: { display: 'flex', gap: '6px', marginBottom: 6 } },
              h('input', { className: 'wb-input', type: 'text', value: q, style: { flex: 1 }, placeholder: 'Evaluation question ' + (i + 1), onChange: function(e) { updateQuestion(i, e.target.value); } }),
              h('button', { className: 'wb-btn wb-btn-outline', style: { padding: '4px 10px', fontSize: '12px' }, onClick: function() { removeQuestion(i); } }, '\u00D7')
            );
          }),
          h('button', { className: 'wb-btn wb-btn-outline', style: { fontSize: '12px', marginTop: 4 }, onClick: addQuestion }, '+ Add question')
        )
      ),

      // Bottom bar
      h('div', { className: 'wb-panel-footer' },
        h('span', { style: { fontSize: '11px', color: '#64748B' } }, 'Phase 2 of 3 \u00B7 Terms of Reference'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          h('button', { className: 'wb-btn wb-btn-outline', onClick: props.onBack }, '\u2190 Back'),
          h('button', { className: 'wb-btn wb-btn-primary', onClick: props.onContinue }, 'Review & Continue \u2192')
        )
      )
    );
  }

  window.Phase2ToR = Phase2ToR;
})();
