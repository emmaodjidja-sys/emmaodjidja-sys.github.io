(function() {
  'use strict';

  var downloadBlob = (window.PraxisUtils && window.PraxisUtils.downloadBlob) || function(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ============================================================================
  // Name sanitiser: "In your opinion, does this programme address..." → q5_programme_address
  // ============================================================================
  function sanitizeName(text, index) {
    var clean = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(function(w) { return w.length > 2; })   // drop short words
      .slice(0, 3)                                     // keep first 3 meaningful words
      .join('_');
    return 'q' + index + '_' + (clean || 'question');
  }

  // ============================================================================
  // Build choice list name for a question's options
  // ============================================================================
  var choiceListCounter = 0;

  function getListName(q, choiceLists) {
    var rt = q.responseType;
    var cfg = q.responseConfig || {};

    if (rt === 'likert') {
      var pts = cfg.points || 5;
      return 'likert' + pts;
    }
    if (rt === 'select_one' || rt === 'select_multiple') {
      var opts = cfg.options || [];
      // Check well-known lists
      if (opts.length === 2 && opts[0] === 'Yes' && opts[1] === 'No') return 'yesno';
      if (opts.indexOf('Male') >= 0 && opts.indexOf('Female') >= 0) return 'gender';
      if (opts.indexOf('Host community') >= 0 && opts.indexOf('IDP') >= 0) return 'displacement';
      if (opts.indexOf('18-24') >= 0) return 'age_group';
      // Custom list
      choiceListCounter++;
      var listName = 'list_' + choiceListCounter;
      choiceLists[listName] = opts;
      return listName;
    }
    return null;
  }

  // ============================================================================
  // Standard choice lists
  // ============================================================================
  var STANDARD_CHOICES = {
    likert5: [
      { name: '1', label: 'Strongly disagree' },
      { name: '2', label: 'Disagree' },
      { name: '3', label: 'Neutral' },
      { name: '4', label: 'Agree' },
      { name: '5', label: 'Strongly agree' }
    ],
    likert4: [
      { name: '1', label: 'Strongly disagree' },
      { name: '2', label: 'Disagree' },
      { name: '3', label: 'Agree' },
      { name: '4', label: 'Strongly agree' }
    ],
    likert3: [
      { name: '1', label: 'Disagree' },
      { name: '2', label: 'Neutral' },
      { name: '3', label: 'Agree' }
    ],
    yesno: [
      { name: 'yes', label: 'Yes' },
      { name: 'no', label: 'No' }
    ],
    gender: [
      { name: 'male', label: 'Male' },
      { name: 'female', label: 'Female' },
      { name: 'other', label: 'Other' },
      { name: 'pnts', label: 'Prefer not to say' }
    ],
    displacement: [
      { name: 'host', label: 'Host community' },
      { name: 'idp', label: 'IDP' },
      { name: 'refugee', label: 'Refugee' },
      { name: 'returnee', label: 'Returnee' }
    ],
    age_group: [
      { name: '18_24', label: '18-24' },
      { name: '25_34', label: '25-34' },
      { name: '35_44', label: '35-44' },
      { name: '45_54', label: '45-54' },
      { name: '55_plus', label: '55+' }
    ]
  };

  // ============================================================================
  // Build XLSForm workbook data (returns XLSX workbook object)
  // ============================================================================
  function buildXLSFormWorkbook(instrument) {
    choiceListCounter = 0;
    var XLSX = window.XLSX;
    if (!XLSX) throw new Error('SheetJS (XLSX) library not loaded');

    var surveyData = [];
    var choicesData = [];
    var customLists = {};
    var usedStandardLists = {};
    var questionIndex = 0;

    // Survey header
    surveyData.push(['type', 'name', 'label', 'required', 'relevant', 'constraint', 'constraint_message']);

    (instrument.sections || []).forEach(function(section) {
      var groupName = 'grp_' + (section.eqId || section.label || 'section').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

      // begin_group
      surveyData.push(['begin_group', groupName, section.label, '', '', '', '']);

      (section.questions || []).forEach(function(q) {
        questionIndex++;
        var name = sanitizeName(q.text, questionIndex);
        var xlsType = mapResponseType(q, customLists, usedStandardLists);
        var required = q.required ? 'yes' : '';
        surveyData.push([xlsType, name, q.text, required, '', '', '']);
      });

      // end_group
      surveyData.push(['end_group', groupName, '', '', '', '', '']);
    });

    // Build choices sheet
    choicesData.push(['list_name', 'name', 'label']);

    // Add used standard lists
    Object.keys(usedStandardLists).forEach(function(listName) {
      var items = STANDARD_CHOICES[listName];
      if (items) {
        items.forEach(function(item) {
          choicesData.push([listName, item.name, item.label]);
        });
      }
    });

    // Add custom lists
    Object.keys(customLists).forEach(function(listName) {
      customLists[listName].forEach(function(opt) {
        var optName = opt.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        choicesData.push([listName, optName, opt]);
      });
    });

    // Settings sheet
    var settingsData = [
      ['form_title', 'form_id'],
      [instrument.name, instrument.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')]
    ];

    // Create workbook
    var wb = XLSX.utils.book_new();
    var surveySheet = XLSX.utils.aoa_to_sheet(surveyData);
    var choicesSheet = XLSX.utils.aoa_to_sheet(choicesData);
    var settingsSheet = XLSX.utils.aoa_to_sheet(settingsData);

    XLSX.utils.book_append_sheet(wb, surveySheet, 'survey');
    XLSX.utils.book_append_sheet(wb, choicesSheet, 'choices');
    XLSX.utils.book_append_sheet(wb, settingsSheet, 'settings');

    return wb;
  }

  // Map internal response type to XLSForm type string
  function mapResponseType(q, customLists, usedStandardLists) {
    var rt = q.responseType;
    var cfg = q.responseConfig || {};

    if (rt === 'likert') {
      var pts = cfg.points || 5;
      var listName = 'likert' + pts;
      usedStandardLists[listName] = true;
      return 'select_one ' + listName;
    }
    if (rt === 'select_one' || rt === 'select_multiple') {
      var opts = cfg.options || [];
      var ln = getListName(q, customLists);
      if (STANDARD_CHOICES[ln]) usedStandardLists[ln] = true;
      return (rt === 'select_one' ? 'select_one ' : 'select_multiple ') + ln;
    }
    if (rt === 'numeric') return (cfg.decimal ? 'decimal' : 'integer');
    if (rt === 'date') return 'date';
    return 'text';
  }

  // ============================================================================
  // Export as XLSForm (.xlsx download)
  // ============================================================================
  function exportAsXLSForm(instrument) {
    var XLSX = window.XLSX;
    var wb = buildXLSFormWorkbook(instrument);
    var filename = (instrument.name || 'instrument').replace(/\s+/g, '_') + '_XLSForm.xlsx';
    var wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    var blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, filename);
    return wb;  // return for testing
  }

  // ============================================================================
  // Export as Word (.doc download)
  // ============================================================================
  function exportAsWord(instrument) {
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
    html += 'body{font-family:Calibri,sans-serif;padding:24px;} ';
    html += 'h1{font-size:18pt;color:#1a365d;} h2{font-size:14pt;color:#2a4365;border-bottom:1px solid #e2e8f0;padding-bottom:4px;} ';
    html += '.q{margin:8px 0 16px 12px;} .q-num{font-weight:bold;color:#4a5568;} ';
    html += '.opts{margin:4px 0 0 24px;list-style:none;padding:0;} .opts li::before{content:"\\2610 ";font-size:14pt;} ';
    html += '.likert{margin:4px 0 0 24px;font-style:italic;color:#718096;} ';
    html += '.text-line{border-bottom:1px solid #a0aec0;display:inline-block;width:80%;min-height:18px;margin-top:4px;} ';
    html += '</style></head><body>';
    html += '<h1>' + escHtml(instrument.name) + '</h1>';
    html += '<p><strong>Method:</strong> ' + escHtml(instrument.method) + ' &nbsp;|&nbsp; <strong>Target:</strong> ' + escHtml(instrument.targetSample) + '</p>';

    (instrument.sections || []).forEach(function(section) {
      html += '<h2>' + escHtml(section.label) + '</h2>';
      (section.questions || []).forEach(function(q, qi) {
        html += '<div class="q"><span class="q-num">Q' + (qi + 1) + '.</span> ' + escHtml(q.text);
        if (q.required) html += ' <span style="color:red;">*</span>';
        html += renderResponseHtml(q);
        html += '</div>';
      });
    });

    html += '</body></html>';

    var blob = new Blob([html], { type: 'application/msword' });
    var filename = (instrument.name || 'instrument').replace(/\s+/g, '_') + '.doc';
    downloadBlob(blob, filename);
  }

  function renderResponseHtml(q) {
    var cfg = q.responseConfig || {};
    if (q.responseType === 'select_one' || q.responseType === 'select_multiple') {
      var items = (cfg.options || []).map(function(o) { return '<li>' + escHtml(o) + '</li>'; }).join('');
      return '<ul class="opts">' + items + '</ul>';
    }
    if (q.responseType === 'likert') {
      var pts = cfg.points || 5;
      var labels = STANDARD_CHOICES['likert' + pts] || STANDARD_CHOICES.likert5;
      var scale = labels.map(function(l) { return l.name + '=' + l.label; }).join('  |  ');
      return '<div class="likert">' + scale + '</div>';
    }
    if (q.responseType === 'numeric') {
      return '<br><span class="text-line">&nbsp;</span> (number)';
    }
    return '<br><span class="text-line">&nbsp;</span>';
  }

  function escHtml(s) {
    return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ============================================================================
  // Export as PDF (print dialog)
  // ============================================================================
  function exportAsPDF(instrument) {
    var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>';
    html += '@media print { @page { margin: 1.5cm; } } ';
    html += 'body{font-family:Calibri,sans-serif;padding:24px;max-width:700px;margin:auto;} ';
    html += 'h1{font-size:20pt;color:#1a365d;} h2{font-size:13pt;color:#2a4365;border-bottom:1px solid #cbd5e0;padding-bottom:4px;margin-top:20px;} ';
    html += '.q{margin:6px 0 14px 8px;} .q-num{font-weight:bold;} ';
    html += '.opts{margin:4px 0 0 20px;} .likert{font-style:italic;color:#555;margin-top:4px;} ';
    html += '.text-line{border-bottom:1px solid #888;display:inline-block;width:80%;min-height:16px;margin-top:4px;} ';
    html += '</style></head><body>';
    html += '<h1>' + escHtml(instrument.name) + '</h1>';
    html += '<p><strong>Method:</strong> ' + escHtml(instrument.method) + ' | <strong>Target:</strong> ' + escHtml(instrument.targetSample) + '</p><hr>';

    (instrument.sections || []).forEach(function(section) {
      html += '<h2>' + escHtml(section.label) + '</h2>';
      (section.questions || []).forEach(function(q, qi) {
        html += '<div class="q"><span class="q-num">Q' + (qi + 1) + '.</span> ' + escHtml(q.text);
        if (q.required) html += ' <span style="color:red;">*</span>';
        html += renderResponseHtml(q) + '</div>';
      });
    });

    html += '</body></html>';

    var win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  }

  // ============================================================================
  // Expose
  // ============================================================================
  window.InstrumentExport = {
    exportAsXLSForm: exportAsXLSForm,
    exportAsWord: exportAsWord,
    exportAsPDF: exportAsPDF,
    buildXLSFormWorkbook: buildXLSFormWorkbook,  // exposed for testing
    sanitizeName: sanitizeName                    // exposed for testing
  };
})();
