(function() {
  'use strict';

  // ============================================================================
  // Shared export helpers used by every export site (Stations 2, 5, 6, 7).
  // Exposed as window.PraxisExportUtils.
  // ============================================================================

  // Coerce any value to a string and escape the five characters that are unsafe
  // in HTML text/attribute context. Non-strings (numbers, null, undefined) are
  // handled without throwing.
  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  // Programme name to a filesystem-safe slug. Any run of non-alphanumerics
  // becomes a single hyphen, leading/trailing hyphens are trimmed, lowercased.
  // Falls back to 'praxis' when nothing usable remains.
  function slugify(name) {
    var s = String(name == null ? '' : name)
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    return s || 'praxis';
  }

  // Local-date YYYY-MM-DD (used in dated filenames and provenance rows).
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  // Shared filename convention: <programme-slug>_<artifact>_<YYYY-MM-DD>.<ext>
  function exportFilename(programmeName, artifact, ext) {
    return slugify(programmeName) + '_' + artifact + '_' + todayISO() + '.' + ext;
  }

  // XLSForm settings version stamp: YYYYMMDDHHmm at export time.
  function versionStamp() {
    var d = new Date();
    return '' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
      pad2(d.getHours()) + pad2(d.getMinutes());
  }

  window.PraxisExportUtils = {
    escHtml: escHtml,
    slugify: slugify,
    todayISO: todayISO,
    exportFilename: exportFilename,
    versionStamp: versionStamp
  };
})();
