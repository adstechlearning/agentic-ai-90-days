/**
 * 90 Days to Agentic AI Engineer — progress collector
 *
 * A Google Apps Script web app that receives progress from the student portal
 * and upserts one row per student into a Google Sheet.
 *
 * SETUP (see TEACHER-SETUP.md for the walkthrough):
 *   1. Create a Google Sheet, Extensions → Apps Script, paste this file.
 *   2. Run setup() once and grant permissions.
 *   3. Project Settings → Script Properties, add WRITE_KEY and TEACHER_KEY.
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *      Copy the /exec URL.
 *
 * IMPORTANT: after ANY edit here you must Deploy → Manage deployments →
 * edit the existing deployment → Version: New version → Deploy. Saving alone
 * does not update the live URL.
 */

var SHEET_PROGRESS = 'Progress';
var SHEET_LOG      = 'Log';
var DAYS           = 90;

var HEADERS = [
  'StudentID', 'Name', 'Class', 'DaysComplete', 'Percent', 'CurrentDay',
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10',
  'FirstSeen', 'LastSync', 'Syncs', 'Marks'
];

// Day ranges for the ten phases, matching the portal.
var PHASES = [[1,10],[11,20],[21,30],[31,40],[41,47],[48,55],[56,65],[66,73],[74,82],[83,90]];

/* ------------------------------------------------------------------ setup */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var p = ss.getSheetByName(SHEET_PROGRESS) || ss.insertSheet(SHEET_PROGRESS);
  p.clear();
  p.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
   .setFontWeight('bold').setBackground('#eef2ff');
  p.setFrozenRows(1);
  p.setColumnWidth(HEADERS.indexOf('Marks') + 1, 320);

  var l = ss.getSheetByName(SHEET_LOG) || ss.insertSheet(SHEET_LOG);
  l.clear();
  l.getRange(1, 1, 1, 5).setValues([['Timestamp', 'StudentID', 'Name', 'DaysComplete', 'Delta']])
   .setFontWeight('bold').setBackground('#eef2ff');
  l.setFrozenRows(1);

  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('WRITE_KEY'))   props.setProperty('WRITE_KEY', randomKey());
  if (!props.getProperty('TEACHER_KEY')) props.setProperty('TEACHER_KEY', randomKey());

  Logger.log('WRITE_KEY   = ' + props.getProperty('WRITE_KEY') +
             '   (goes in index.html — students can see this, that is expected)');
  Logger.log('TEACHER_KEY = ' + props.getProperty('TEACHER_KEY') +
             '   (goes in teacher-dashboard.html — keep this one private)');
}

function randomKey() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 20);
}

/* ------------------------------------------------------------- write path */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json({ ok: false, error: 'empty request' });

    var body = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();

    if (body.key !== props.getProperty('WRITE_KEY')) return json({ ok: false, error: 'bad key' });

    var s = body.student || {};
    var id   = clean(s.id,    32).toUpperCase();
    var name = clean(s.name,  60);
    var cls  = clean(s.class, 24).toUpperCase();
    var marks = String(body.marks || '');

    if (!id)   return json({ ok: false, error: 'missing student id' });
    if (!name) return json({ ok: false, error: 'missing name' });
    if (!/^[0-4]{90}$/.test(marks)) return json({ ok: false, error: 'bad marks payload' });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var result = upsert(id, name, cls, marks);
      return json({ ok: true, completed: result.completed, saved: result.action });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function upsert(id, name, cls, marks) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PROGRESS);
  var now   = new Date();

  var completed = 0, current = DAYS;
  for (var i = 0; i < DAYS; i++) {
    if (marks.charAt(i) === '4') completed++;
    else if (current === DAYS) current = i + 1;
  }
  if (completed === DAYS) current = DAYS;

  var phase = PHASES.map(function (r) {
    var n = 0;
    for (var d = r[0]; d <= r[1]; d++) if (marks.charAt(d - 1) === '4') n++;
    return n;
  });

  var last  = sheet.getLastRow();
  var ids   = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  var row   = 0;
  for (var j = 0; j < ids.length; j++) {
    if (String(ids[j][0]).toUpperCase() === id) { row = j + 2; break; }
  }

  var firstSeen = now, syncs = 1, before = 0, action = 'created';
  if (row) {
    action    = 'updated';
    var prev  = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    firstSeen = prev[HEADERS.indexOf('FirstSeen')] || now;
    syncs     = Number(prev[HEADERS.indexOf('Syncs')] || 0) + 1;
    before    = Number(prev[HEADERS.indexOf('DaysComplete')] || 0);
  } else {
    row = last + 1;
  }

  var values = [id, name, cls, completed, Math.round(completed / DAYS * 100), current]
    .concat(phase)
    .concat([firstSeen, now, syncs, marks]);

  sheet.getRange(row, 1, 1, HEADERS.length).setValues([values]);

  ss.getSheetByName(SHEET_LOG)
    .appendRow([now, id, name, completed, completed - before]);

  return { completed: completed, action: action };
}

/* -------------------------------------------------------------- read path */

/**
 * Dashboard feed. Supports JSONP (?callback=fn) because a plain cross-origin
 * fetch to Apps Script is unreliable; the dashboard uses JSONP by default.
 */
function doGet(e) {
  var p        = (e && e.parameter) || {};
  var callback = p.callback;
  var out;

  try {
    if (p.key !== PropertiesService.getScriptProperties().getProperty('TEACHER_KEY')) {
      out = { ok: false, error: 'bad key' };
    } else {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PROGRESS);
      var last  = sheet.getLastRow();
      var rows  = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];

      out = {
        ok: true,
        fetchedAt: new Date().toISOString(),
        total: rows.length,
        students: rows.map(function (r) {
          var o = {};
          HEADERS.forEach(function (h, i) { o[h] = r[i]; });
          o.FirstSeen = o.FirstSeen ? new Date(o.FirstSeen).toISOString() : '';
          o.LastSync  = o.LastSync  ? new Date(o.LastSync).toISOString()  : '';
          return o;
        })
      };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }

  if (callback && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(out) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json(out);
}

/* ---------------------------------------------------------------- helpers */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean(v, max) {
  // strip control characters, collapse whitespace, then cap the length
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/**
 * Optional: run daily via Triggers to flag students who have gone quiet.
 * Writes nothing — just emails you a summary.
 */
function dailyDigest() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_PROGRESS);
  var last  = sheet.getLastRow();
  if (last < 2) return;

  var rows   = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var iLast  = HEADERS.indexOf('LastSync');
  var iDone  = HEADERS.indexOf('DaysComplete');
  var cutoff = Date.now() - 1000 * 60 * 60 * 24 * 5;

  var stale = rows.filter(function (r) { return new Date(r[iLast]).getTime() < cutoff; });
  var avg   = rows.reduce(function (a, r) { return a + Number(r[iDone] || 0); }, 0) / rows.length;

  MailApp.sendEmail(
    Session.getEffectiveUser().getEmail(),
    '90-Day AI cohort: ' + rows.length + ' students, avg ' + avg.toFixed(1) + ' days',
    'Average days complete: ' + avg.toFixed(1) + '\n' +
    'No sync in 5+ days: ' + stale.length + '\n\n' +
    stale.map(function (r) { return '  ' + r[0] + '  ' + r[1] + '  (' + r[2] + ')  ' + r[iDone] + ' days'; }).join('\n')
  );
}
