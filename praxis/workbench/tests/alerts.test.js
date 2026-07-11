'use strict';
var H = require('./helpers');
var W = H.loadWorkbench();
var day = H.isoDaysFromNow;

function ctx() { return W.PraxisSchema.createEmptyContext(); }
function kinds(alerts) { return alerts.map(function(a) { return a.kind; }); }
function find(alerts, kind) { return alerts.filter(function(a) { return a.kind === kind; })[0]; }

// Projected miss: final report due after the earliest primary window closes.
var c1 = ctx();
c1.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Strategy Team', window_closes: day(30), status: 'in_post' }];
c1.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(45), status: 'in_progress', alert: { lead_days: 0, emails: [] } }];
var a1 = W.CockpitAlerts.computeAlerts(c1);
var risk = find(a1, 'decision_window_risk');
H.assert(!!risk, 'risk alert fires on projected miss');
H.eq(risk && risk.severity, 1, 'risk severity 1');
H.eq(risk && risk.cstation, 1, 'risk routes to C0');
H.assert(risk && risk.title.indexOf('Strategy Team') >= 0, 'risk names the user');

// Window already closed without an accepted report.
var c2 = ctx();
c2.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(-15), status: 'in_post' }];
var a2 = W.CockpitAlerts.computeAlerts(c2);
var missed = find(a2, 'decision_window_missed');
H.assert(!!missed, 'missed alert fires when window closed');
H.eq(missed && missed.severity, 0, 'missed severity 0');

// On course: no window alert at all.
var c3 = ctx();
c3.commissioner.users = [{ id: 'p1', tier: 'primary', name: 'Board', window_closes: day(60), status: 'in_post' }];
c3.planning.deliverables = [{ id: 'd1', type: 'Final report', title: 'Final', due_date: day(20), status: 'in_progress', alert: { lead_days: 0, emails: [] } }];
var k3 = kinds(W.CockpitAlerts.computeAlerts(c3));
H.assert(k3.indexOf('decision_window_risk') < 0 && k3.indexOf('decision_window_missed') < 0, 'no window alert when on course');

// Departures: left = severity 0, handing_over = severity 1, closed window = silent, secondary = silent.
var c4 = ctx();
c4.commissioner.users = [
  { id: 'u1', tier: 'primary', name: 'Gone', status: 'left', successor: '', window_closes: day(40) },
  { id: 'u2', tier: 'primary', name: 'Mover', status: 'handing_over', successor: 'Jane Doe', window_closes: day(40) },
  { id: 'u3', tier: 'primary', name: 'Past', status: 'left', successor: '', window_closes: day(-5) },
  { id: 'u4', tier: 'secondary', name: 'Sec', status: 'left', successor: '' }
];
var a4 = W.CockpitAlerts.computeAlerts(c4).filter(function(a) { return a.kind === 'user_left'; });
H.eq(a4.length, 2, 'two user_left alerts (closed-window and secondary silent)');
H.assert(a4.some(function(a) { return a.severity === 0 && a.title.indexOf('Gone') >= 0; }), 'left post is severity 0');
H.assert(a4.some(function(a) { return a.severity === 1 && a.detail.indexOf('Jane Doe') >= 0; }), 'handing over carries the successor');
H.assert(a4.some(function(a) { return a.detail.indexOf('No successor named') >= 0; }), 'missing successor called out');
H.summary('alerts.test');
