(function() {
  'use strict';

  var downloadBlob = (window.PraxisUtils && window.PraxisUtils.downloadBlob) || function(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  var escHtml = window.PraxisExportUtils.escHtml;
  var exportFilename = window.PraxisExportUtils.exportFilename;
  var versionStamp = window.PraxisExportUtils.versionStamp;

  // ============================================================================
  // Ensure the SheetJS (XLSX) library is loaded before any .xlsx export.
  // The library is vendored and loaded on demand by window.loadSheetJS (index.html).
  // Returns a Promise that resolves once window.XLSX is available.
  // ============================================================================
  function ensureXLSX() {
    if (window.XLSX) return Promise.resolve();
    if (typeof window.loadSheetJS === 'function') return window.loadSheetJS();
    return Promise.reject(new Error('Spreadsheet library (SheetJS) is unavailable'));
  }

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

  // Register a generated choice list and return its list name.
  function addCustomList(opts, choiceLists) {
    choiceListCounter++;
    var listName = 'list_' + choiceListCounter;
    choiceLists[listName] = opts;
    return listName;
  }

  // Order-insensitive full-set comparison against a standard list: same length
  // and the same set of trimmed, case-insensitive labels. Anything less exact
  // must NOT be rewritten to the standard list; the user's options are kept.
  function matchesStandardList(opts, listName) {
    var std = STANDARD_CHOICES[listName];
    if (!std || opts.length !== std.length) return false;
    var a = opts.map(function(o) { return String(o == null ? '' : o).trim().toLowerCase(); }).sort();
    var b = std.map(function(item) { return String(item.label).trim().toLowerCase(); }).sort();
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  var SUBSTITUTABLE_LISTS = ['yesno', 'gender', 'displacement', 'age_group'];

  function getListName(q, choiceLists) {
    var rt = q.responseType;
    var cfg = q.responseConfig || {};

    if (rt === 'likert') {
      var pts = cfg.points || 5;
      return 'likert' + pts + (cfg.includeNA ? '_na' : '');
    }
    if (rt === 'select_one' || rt === 'select_multiple') {
      var opts = cfg.options || [];
      // Substitute a standard list only on an exact full-set match, which keeps
      // naming stable without ever rewriting custom answer options.
      for (var i = 0; i < SUBSTITUTABLE_LISTS.length; i++) {
        if (matchesStandardList(opts, SUBSTITUTABLE_LISTS[i])) return SUBSTITUTABLE_LISTS[i];
      }
      // Custom list: export the user's options verbatim.
      return addCustomList(opts, choiceLists);
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
  // Resolve the choice items for a standard/generated list name.
  // Falls back to a generated 1..N Likert scale for any likert<N> not hard-coded,
  // so no question can reference a choice list that has no rows in the workbook.
  // A likert<N>_na list is the likert<N> list plus a trailing 'na' choice,
  // emitted when the question has includeNA set.
  // ============================================================================
  function standardChoiceItems(listName) {
    var na = /^(likert\d+)_na$/.exec(listName);
    if (na) {
      var base = standardChoiceItems(na[1]);
      if (!base) return null;
      return base.concat([{ name: 'na', label: "Don't know or not applicable" }]);
    }
    if (STANDARD_CHOICES[listName]) return STANDARD_CHOICES[listName];
    var m = /^likert(\d+)$/.exec(listName);
    if (m) {
      var n = parseInt(m[1], 10);
      if (n >= 2 && n <= 11) {
        var items = [];
        for (var i = 1; i <= n; i++) items.push({ name: String(i), label: String(i) });
        items[0].label = '1 (Strongly disagree)';
        items[n - 1].label = n + ' (Strongly agree)';
        return items;
      }
    }
    return null;
  }

  // ============================================================================
  // XML-safe identifier from arbitrary text. Lowercase, non-alphanumerics to
  // underscore, collapsed, trimmed. Returns '' when nothing usable remains.
  // ============================================================================
  function toIdent(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Return a name guaranteed unique within `used` (a name->true map), suffixing
  // _2, _3, ... on collision. `fallback` is used when the base is empty.
  function uniqueName(base, fallback, used) {
    var name = base || fallback;
    if (used[name]) {
      var k = 2;
      while (used[name + '_' + k]) k++;
      name = name + '_' + k;
    }
    used[name] = true;
    return name;
  }

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
    // All node names (groups + questions) must be unique across the whole form,
    // or pyxform (KoboToolbox's importer) rejects the file.
    var usedNodeNames = {};

    // Survey header
    surveyData.push(['type', 'name', 'label', 'required', 'relevant', 'constraint', 'constraint_message']);

    (instrument.sections || []).forEach(function(section, sIdx) {
      var groupBase = 'grp_' + toIdent(section.eqId || section.label || ('section_' + (sIdx + 1)));
      var groupName = uniqueName(groupBase, 'grp_section_' + (sIdx + 1), usedNodeNames);

      // begin_group
      surveyData.push(['begin_group', groupName, section.label, '', '', '', '']);

      (section.questions || []).forEach(function(q) {
        questionIndex++;
        var name = uniqueName(sanitizeName(q.text, questionIndex), 'q' + questionIndex, usedNodeNames);
        var xlsType = mapResponseType(q, customLists, usedStandardLists);
        var required = q.required ? 'yes' : '';
        var nc = numericConstraint(q);
        surveyData.push([xlsType, name, q.text, required, '', nc.constraint, nc.message]);
      });

      // end_group (name matches begin_group)
      surveyData.push(['end_group', groupName, '', '', '', '', '']);
    });

    // Build choices sheet
    choicesData.push(['list_name', 'name', 'label']);

    // Add used standard lists (Likert scales of any size are generated on demand)
    Object.keys(usedStandardLists).forEach(function(listName) {
      var items = standardChoiceItems(listName);
      if (items) {
        items.forEach(function(item) {
          choicesData.push([listName, item.name, item.label]);
        });
      }
    });

    // Add custom lists. Choice names must be unique and non-empty within a list.
    Object.keys(customLists).forEach(function(listName) {
      var usedInList = {};
      customLists[listName].forEach(function(opt, i) {
        var optName = uniqueName(toIdent(opt), 'opt' + (i + 1), usedInList);
        choicesData.push([listName, optName, String(opt == null ? '' : opt)]);
      });
    });

    // Settings sheet. form_title must never be blank or KoboToolbox shows an
    // unnamed form; version lets field teams confirm they deployed this export.
    var formTitle = String(instrument.name == null ? '' : instrument.name).trim() || 'Evaluation Instrument';
    var formId = toIdent(instrument.name) || 'instrument_form';
    var settingsData = [
      ['form_title', 'form_id', 'version'],
      [formTitle, formId, versionStamp()]
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
      var listName = 'likert' + pts + (cfg.includeNA ? '_na' : '');
      usedStandardLists[listName] = true;
      return 'select_one ' + listName;
    }
    if (rt === 'select_one' || rt === 'select_multiple') {
      var opts = cfg.options || [];
      if (opts.length === 0) return 'text'; // fallback for empty options
      var ln = getListName(q, customLists);
      if (STANDARD_CHOICES[ln]) usedStandardLists[ln] = true;
      return (rt === 'select_one' ? 'select_one ' : 'select_multiple ') + ln;
    }
    if (rt === 'ranking') {
      var items = cfg.items || [];
      if (items.length === 0) return 'text'; // fallback for empty item list
      return 'rank ' + addCustomList(items, customLists);
    }
    if (rt === 'numeric') return (cfg.decimal ? 'decimal' : 'integer');
    if (rt === 'date') return 'date';
    return 'text';
  }

  // Build XLSForm constraint expression and message for a numeric question.
  // Returns { constraint: '', message: '' } when no bounds are set.
  function numericConstraint(q) {
    var out = { constraint: '', message: '' };
    if (q.responseType !== 'numeric') return out;
    var cfg = q.responseConfig || {};
    var hasMin = cfg.min != null && cfg.min !== '';
    var hasMax = cfg.max != null && cfg.max !== '';
    if (hasMin && hasMax) {
      out.constraint = '. >= ' + cfg.min + ' and . <= ' + cfg.max;
      out.message = 'Value must be between ' + cfg.min + ' and ' + cfg.max + '.';
    } else if (hasMin) {
      out.constraint = '. >= ' + cfg.min;
      out.message = 'Value must be at least ' + cfg.min + '.';
    } else if (hasMax) {
      out.constraint = '. <= ' + cfg.max;
      out.message = 'Value must be at most ' + cfg.max + '.';
    }
    return out;
  }

  // ============================================================================
  // Preflight: every question needs label text, or pyxform (KoboToolbox's
  // importer) rejects the file with an opaque error. Returns [] when clean.
  // ============================================================================
  function preflightProblems(instrument) {
    var problems = [];
    (instrument.sections || []).forEach(function(section, sIdx) {
      var sectionLabel = section.label || ('Section ' + (sIdx + 1));
      (section.questions || []).forEach(function(q, qIdx) {
        var label = String(q.text == null ? '' : q.text).trim();
        if (!label) {
          problems.push('Question ' + (qIdx + 1) + ' in "' + sectionLabel + '" has an empty label');
        }
      });
    });
    return problems;
  }

  // ============================================================================
  // Export as XLSForm (.xlsx download)
  // ============================================================================
  function exportAsXLSForm(instrument) {
    var problems = preflightProblems(instrument);
    if (problems.length > 0) {
      var detail = problems[0] + (problems.length > 1 ? ' (and ' + (problems.length - 1) + ' more)' : '');
      return Promise.reject(new Error(detail + '. Add label text to every question before exporting.'));
    }
    return ensureXLSX().then(function() {
      var XLSX = window.XLSX;
      var wb = buildXLSFormWorkbook(instrument);
      var filename = exportFilename(instrument.name, 'xlsform', 'xlsx');
      var wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var blob = new Blob([wbOut], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, filename);
      return wb;  // resolved value, also used by tests
    });
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
    html += '.rank{margin:4px 0 0 24px;padding-left:18px;} .rank-hint{margin:4px 0 0 24px;font-style:italic;color:#718096;font-size:10pt;} ';
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
    downloadBlob(blob, exportFilename(instrument.name, 'instrument', 'doc'));
  }

  function renderResponseHtml(q) {
    var cfg = q.responseConfig || {};
    if (q.responseType === 'select_one' || q.responseType === 'select_multiple') {
      var items = (cfg.options || []).map(function(o) { return '<li>' + escHtml(o) + '</li>'; }).join('');
      return '<ul class="opts">' + items + '</ul>';
    }
    if (q.responseType === 'likert') {
      var pts = cfg.points || 5;
      var listName = 'likert' + pts + (cfg.includeNA ? '_na' : '');
      var labels = standardChoiceItems(listName) || STANDARD_CHOICES.likert5;
      var scale = labels.map(function(l) { return l.name + '=' + l.label; }).join('  |  ');
      return '<div class="likert">' + scale + '</div>';
    }
    if (q.responseType === 'ranking') {
      var rankItems = (cfg.items || []).map(function(it) { return '<li>' + escHtml(it) + ' ____</li>'; }).join('');
      return '<div class="rank-hint">Rank each item (1 = highest priority)</div><ol class="rank">' + rankItems + '</ol>';
    }
    if (q.responseType === 'numeric') {
      return '<br><span class="text-line">&nbsp;</span> (number)';
    }
    return '<br><span class="text-line">&nbsp;</span>';
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
    html += '.rank{margin:4px 0 0 20px;padding-left:18px;} .rank-hint{margin:4px 0 0 20px;font-style:italic;color:#555;font-size:10pt;} ';
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
    if (!win) {
      showPopupBlockedNotice();
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  }

  // The PDF path opens a print window; when the browser blocks it the export
  // must not fail silently. This module has no dispatch handle, so it renders
  // a toast directly using the app's toast classes.
  function showPopupBlockedNotice() {
    var existing = document.getElementById('praxis-popup-blocked-notice');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    var wrap = document.createElement('div');
    wrap.id = 'praxis-popup-blocked-notice';
    wrap.className = 'wb-toast-container';
    wrap.setAttribute('role', 'alert');
    var toastEl = document.createElement('div');
    toastEl.className = 'wb-toast wb-toast--error';
    var msg = document.createElement('span');
    msg.className = 'wb-toast-msg';
    msg.textContent = 'The browser blocked the print window. Allow popups for this site, then export the PDF again.';
    toastEl.appendChild(msg);
    var dismiss = document.createElement('button');
    dismiss.className = 'wb-toast-dismiss';
    dismiss.type = 'button';
    dismiss.setAttribute('aria-label', 'Dismiss notification');
    dismiss.textContent = 'Dismiss';
    dismiss.onclick = function() {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    };
    toastEl.appendChild(dismiss);
    wrap.appendChild(toastEl);
    document.body.appendChild(wrap);
    setTimeout(function() {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, 10000);
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
