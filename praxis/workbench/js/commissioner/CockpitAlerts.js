/**
 * CockpitAlerts: derived alert engine (nothing stored) plus actionable mailto/.ics
 * builders. window.CockpitAlerts. Alerts are recomputed each render from due dates and
 * review dates vs today, so there is no stale-notification cache to invalidate.
 *
 * Safety: mailto encodes every value (RFC 6068 header-injection defense) and drops
 * non-email recipients; .ics is RFC 5545 (CRLF, VALUE=DATE all-day, deterministic UID,
 * text escaping, 75-octet folding). Both are delivered with the app's existing CSP-safe
 * navigation/download paths, so no Content-Security-Policy change is needed.
 */
(function() {
  'use strict';
  var U = window.PraxisUtils;
  var D = window.CockpitData;

  function pad2(n) { return String(n).padStart(2, '0'); }
  function isEmail(s) { return /^[^\s@,;:<>()"]+@[^\s@,;:<>()"]+\.[^\s@,;:<>()"]+$/.test(String(s || '').trim()); }
  function oneLine(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim(); }
  function emailsOf(alertCfg, single) {
    var out = [];
    if (alertCfg && Array.isArray(alertCfg.emails)) out = out.concat(alertCfg.emails);
    if (single) out.push(single);
    return out.filter(isEmail);
  }

  // ---- alert derivation ---------------------------------------------------
  function mk(kind, severity, daysUntil, dueDate, title, detail, owner, emails, cstation, stableId) {
    return { id: stableId + ':' + kind, stableId: stableId, kind: kind, severity: severity,
      daysUntil: daysUntil, due_date: dueDate, title: title, detail: detail,
      owner: owner || '', emails: emails || [], cstation: cstation };
  }

  // severity: 0 overdue, 1 due-soon, 2 informational (open condition).
  function computeAlerts(context) {
    var alerts = [];
    var pl = context.planning || {};
    var cm = context.commissioner || {};

    (pl.deliverables || []).forEach(function(d) {
      if (!d || !d.due_date || d.status === 'accepted') return;
      var n = U.daysUntilLocal(d.due_date);
      if (n == null) return;
      var lead = (d.alert && typeof d.alert.lead_days === 'number') ? d.alert.lead_days : 14;
      var name = d.title || d.code || 'deliverable';
      var em = emailsOf(d.alert, d.reviewer_email);
      if (n < 0) {
        alerts.push(mk('deliverable_overdue', 0, n, d.due_date, 'Deliverable overdue: ' + name,
          Math.abs(n) + ' days past due to ' + (d.reviewers || 'the review body') + '.', d.reviewers, em, 4, d.id));
      } else if (n <= lead) {
        alerts.push(mk('deliverable_due', 1, n, d.due_date, 'Deliverable due soon: ' + name,
          'Due in ' + n + ' days to ' + (d.reviewers || 'the review body') + '.', d.reviewers, em, 4, d.id));
      }
    });

    (cm.management_response || []).forEach(function(r) {
      if (!D.isReviewOpen(r) || !r.next_review) return;
      var n = U.daysUntilLocal(r.next_review);
      if (n == null) return;
      var em = emailsOf(null, r.owner_email);
      if (n < 0) {
        alerts.push(mk('review_overdue', 0, n, r.next_review, 'Implementation review overdue: ' + (r.code || 'action'),
          Math.abs(n) + ' days overdue. Owner: ' + (r.owner || 'unassigned') + '.', r.owner, em, 6, r.id));
      } else if (n <= 30) {
        alerts.push(mk('review_due', 1, n, r.next_review, 'Six-monthly review due: ' + (r.code || 'action'),
          'Next review in ' + n + ' days. Owner: ' + (r.owner || 'unassigned') + '.', r.owner, em, 6, r.id));
      }
    });

    var gate = cm.gate || {};
    if (gate.decision === 'conditions') {
      (gate.conditions || []).forEach(function(c) {
        if (c && !c.resolved && (c.text || '').trim()) {
          alerts.push(mk('condition_open', 2, null, null, 'Open gate condition', c.text, gate.decided_by || '', [], 3, c.id));
        }
      });
    }

    alerts.sort(function(a, b) {
      if (a.severity !== b.severity) return a.severity - b.severity;
      var da = a.daysUntil == null ? 1e9 : a.daysUntil, db = b.daysUntil == null ? 1e9 : b.daysUntil;
      return da - db;
    });
    return alerts;
  }

  function summarize(alerts) {
    var overdue = 0, soon = 0;
    (alerts || []).forEach(function(a) { if (a.severity === 0) overdue++; else if (a.severity === 1) soon++; });
    return { total: alerts.length, overdue: overdue, soon: soon };
  }

  // ---- mailto (RFC 6068) --------------------------------------------------
  function buildMailto(opts) {
    var to = (opts.to || []).map(function(s) { return String(s).trim(); }).filter(isEmail).map(encodeURIComponent).join(',');
    var body = (opts.bodyLines || []).join('\r\n');
    var qs = [];
    if (opts.subject) qs.push('subject=' + encodeURIComponent(oneLine(opts.subject)));
    if (body) qs.push('body=' + encodeURIComponent(body));
    return 'mailto:' + to + (qs.length ? '?' + qs.join('&') : '');
  }
  function mailtoForAlert(a) {
    var valid = (a.emails || []).filter(isEmail);
    var body = [];
    if (!valid.length && a.owner) body.push('To: ' + a.owner);
    body.push(a.title);
    if (a.detail) body.push(a.detail);
    if (a.due_date) body.push('Date: ' + D.fdate(a.due_date));
    body.push('');
    body.push('Sent from the PRAXIS commissioner cockpit.');
    return buildMailto({ to: valid, subject: 'PRAXIS: ' + a.title, bodyLines: body });
  }

  // ---- .ics (RFC 5545) ----------------------------------------------------
  function icsEscape(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function utf8len(ch) { var c = ch.charCodeAt(0); return c < 0x80 ? 1 : (c < 0x800 ? 2 : 3); }
  function fold(line) { // fold at 75 UTF-8 octets; continuation lines start with a space
    var res = '', cur = '', curBytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], b = utf8len(ch);
      if (curBytes + b > 75) { res += cur + '\r\n '; cur = ''; curBytes = 0; }
      cur += ch; curBytes += b;
    }
    return res + cur;
  }
  function buildIcs(opts) {
    var d = U.ymd(opts.date);
    if (!d) return null; // an all-day event needs a date
    var dateStr = '' + d[0] + pad2(d[1]) + pad2(d[2]);
    var n = new Date();
    var stamp = '' + n.getUTCFullYear() + pad2(n.getUTCMonth() + 1) + pad2(n.getUTCDate()) + 'T' + pad2(n.getUTCHours()) + pad2(n.getUTCMinutes()) + pad2(n.getUTCSeconds()) + 'Z';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PRAXIS//Evaluation Workbench//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + (opts.uid || U.uid('alert_')) + '@praxis-workbench',
      'SEQUENCE:0',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + dateStr,
      'SUMMARY:' + icsEscape(opts.title),
      'DESCRIPTION:' + icsEscape(opts.description || '')
    ];
    if (opts.alarmDays) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEscape(opts.title), 'TRIGGER:-P' + opts.alarmDays + 'D', 'END:VALARM');
    lines.push('END:VEVENT', 'END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function downloadIcsForAlert(a) {
    var ics = buildIcs({ uid: a.stableId, title: a.title, description: a.detail, date: a.due_date,
      alarmDays: a.kind.indexOf('review') === 0 ? 7 : 1 });
    if (!ics) return false;
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    U.downloadBlob(blob, U.sanitizeFilename('praxis-' + (a.stableId || 'alert'), 'praxis-alert') + '.ics');
    return true;
  }

  window.CockpitAlerts = {
    computeAlerts: computeAlerts, summarize: summarize,
    buildMailto: buildMailto, mailtoForAlert: mailtoForAlert,
    buildIcs: buildIcs, downloadIcsForAlert: downloadIcsForAlert,
    isEmail: isEmail
  };
})();
