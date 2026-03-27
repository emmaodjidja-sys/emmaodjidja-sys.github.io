(function() {
  'use strict';

  var uid = (window.PraxisUtils && window.PraxisUtils.uid) || function(prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  // ============================================================================
  // Response type suggestion — matches indicator text to question types
  // ============================================================================
  function suggestResponseType(indicator) {
    var text = (typeof indicator === 'string' ? indicator : (indicator && (indicator.name || indicator.text)) || '').toLowerCase();

    if (/%|rate|proportion|number of|count|index|ratio/.test(text)) {
      return { type: 'numeric', config: { min: 0 }, reason: 'count/rate indicator \u2192 numeric' };
    }
    if (/perception|satisfaction|attitude|opinion|confidence|trust|agree/.test(text)) {
      return { type: 'likert', config: { points: 5, includeNA: true }, reason: 'perception indicator \u2192 Likert scale' };
    }
    if (/yes\/no|existence|availability|presence/.test(text)) {
      return { type: 'select_one', config: { options: ['Yes', 'No'] }, reason: 'binary indicator \u2192 yes/no' };
    }
    return { type: 'text', config: { maxLength: 500 }, reason: 'qualitative indicator \u2192 open text' };
  }

  // ============================================================================
  // Demographics section — standard demographic questions
  // ============================================================================
  function addDemographicsSection() {
    return {
      id: uid('sec_'),
      label: 'Demographics',
      eqId: null,
      questions: [
        { id: uid('q_'), text: 'Age group', responseType: 'select_one', responseConfig: { options: ['18-24', '25-34', '35-44', '45-54', '55+'] }, linkedIndicatorId: null, required: false },
        { id: uid('q_'), text: 'Gender', responseType: 'select_one', responseConfig: { options: ['Male', 'Female', 'Other', 'Prefer not to say'] }, linkedIndicatorId: null, required: false },
        { id: uid('q_'), text: 'Displacement status', responseType: 'select_one', responseConfig: { options: ['Host community', 'IDP', 'Refugee', 'Returnee'] }, linkedIndicatorId: null, required: false },
        { id: uid('q_'), text: 'Location', responseType: 'text', responseConfig: { maxLength: 200 }, linkedIndicatorId: null, required: false }
      ]
    };
  }

  // ============================================================================
  // Scaffold questions for a single EQ row
  // ============================================================================
  function scaffoldQuestionsForEQ(eq, instrumentType) {
    var questions = [];
    var eqText = eq.question || eq.text || '';

    // Main question derived from EQ text
    var mainText;
    if (instrumentType === 'kii' || instrumentType === 'fgd') {
      mainText = 'In your view, ' + eqText.charAt(0).toLowerCase() + eqText.slice(1);
      if (!/\?$/.test(mainText)) mainText += '?';
      mainText += ' Can you give an example?';
    } else {
      mainText = eqText.replace(/^To what extent\s*/i, 'How much do you think ');
      if (!/\?$/.test(mainText)) mainText += '?';
    }
    questions.push({
      id: uid('q_'),
      text: mainText,
      responseType: (instrumentType === 'kii' || instrumentType === 'fgd') ? 'text' : 'likert',
      responseConfig: (instrumentType === 'kii' || instrumentType === 'fgd')
        ? { maxLength: 500 }
        : { points: 5, includeNA: true },
      linkedIndicatorId: null,
      required: true
    });

    // Indicator-derived questions (up to 3)
    var indicators = eq.indicators || [];
    var limit = Math.min(indicators.length, 3);
    for (var i = 0; i < limit; i++) {
      var ind = indicators[i];
      var indText = ind.name || ind.text || ind.label || '';
      var suggested = suggestResponseType(ind);

      var qText;
      if (instrumentType === 'kii' || instrumentType === 'fgd') {
        qText = 'How would you describe: ' + indText + '? Please elaborate.';
        questions.push({
          id: uid('q_'),
          text: qText,
          responseType: 'text',
          responseConfig: { maxLength: 500 },
          linkedIndicatorId: ind.id || null,
          required: false
        });
      } else {
        qText = 'Regarding: ' + indText;
        questions.push({
          id: uid('q_'),
          text: qText,
          responseType: suggested.type,
          responseConfig: suggested.config,
          linkedIndicatorId: ind.id || null,
          required: false
        });
      }
    }

    return questions;
  }

  // ============================================================================
  // Instrument scaffold — generates 3 instruments from matrix rows
  // ============================================================================

  // Which DAC criteria map to which instrument
  var INSTRUMENT_CRITERIA = {
    survey: ['effectiveness', 'relevance', 'sustainability', 'equity', 'impact'],
    kii:    ['efficiency', 'coherence', 'sustainability'],
    fgd:    ['effectiveness', 'impact', 'equity', 'relevance']
  };

  function scaffoldInstruments(matrixRows, sampleParams) {
    var rows = matrixRows || [];
    var sp = sampleParams || {};

    var instruments = [
      { type: 'survey', name: 'Household Perception Survey', method: 'Structured questionnaire', defaultSample: '380 respondents' },
      { type: 'kii', name: 'Key Informant Interview Guide', method: 'Semi-structured interview', defaultSample: '20-30 key informants' },
      { type: 'fgd', name: 'Focus Group Discussion Guide', method: 'Semi-structured group discussion', defaultSample: '6-8 FGDs (8-10 participants each)' }
    ];

    return instruments.map(function(def) {
      var criteriaSet = INSTRUMENT_CRITERIA[def.type];
      var relevantRows = rows.filter(function(r) {
        return criteriaSet.indexOf((r.criterion || '').toLowerCase()) >= 0;
      });

      // If no rows match, include all rows so the instrument is not empty
      if (relevantRows.length === 0) relevantRows = rows;

      var sections = [];

      // Survey gets demographics section
      if (def.type === 'survey') {
        sections.push(addDemographicsSection());
      }

      // One section per relevant EQ
      relevantRows.forEach(function(row) {
        var criterionLabel = (row.criterion || 'General').charAt(0).toUpperCase() + (row.criterion || 'general').slice(1);
        sections.push({
          id: uid('sec_'),
          label: criterionLabel + ' (' + (row.id || 'EQ') + ')',
          eqId: row.id || null,
          questions: scaffoldQuestionsForEQ(row, def.type)
        });
      });

      // Derive target sample
      var targetSample = def.defaultSample;
      if (sp.result && sp.result.totalSample && def.type === 'survey') {
        targetSample = sp.result.totalSample + ' respondents';
      }

      return {
        id: uid('inst_'),
        name: def.name,
        type: def.type,
        method: def.method,
        targetSample: targetSample,
        sections: sections
      };
    });
  }

  // ============================================================================
  // Expose
  // ============================================================================
  window.InstrumentScaffold = {
    suggestResponseType: suggestResponseType,
    addDemographicsSection: addDemographicsSection,
    scaffoldQuestionsForEQ: scaffoldQuestionsForEQ,
    scaffoldInstruments: scaffoldInstruments
  };
})();
