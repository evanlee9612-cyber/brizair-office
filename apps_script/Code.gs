/**
 * BRIZAIR Office App — server (Google Apps Script web app)
 *
 * The website (GitHub Pages) talks to this script. All data stays in the
 * "BRIZAIR Office Sheet" (same tabs the Telegram bot reads).
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me / Who has access: Anyone
 * Login: each person has a personal PIN (stored hashed in Script Properties, never in code).
 *   First time only: POST {a:'setup', users:[{name, role, pin}]} (works only while no users exist).
 *   To change PINs: run resetUsers() in the editor, then setup again.
 * Optional Telegram alert: Script Properties TG_TOKEN + TG_CHAT → every change is sent there.
 * AI answers: questions go to tab ASK. Sir Kim's PC (ask_relay.py + Codex/ChatGPT) picks them up with
 *   RELAY_KEY (Script Property, set once by Evan) and writes the answer back. Materials: tab KNOWLEDGE + Drive folder.
 */
var VERSION = '1.0';
var SHEET_ID = '1jahKP1N3VVmiBqSXlr3xbmJxORVAWFVQNtxMLyqbCKE';
var TZ = 'Asia/Manila';
var SESSION_DAYS = 90;
var JOBS = ['Install', 'Service (AS)', 'Cleaning', 'Survey', 'Delivery', 'Pull-out', 'Meeting', 'Other'];
var STATUSES = ['Scheduled', 'Confirmed', 'Done', 'Moved', 'Cancelled'];
var METHODS = ['Cash', 'Bank', 'GCash', 'Check', 'Other'];
var MAIN_FOLDER_ID = '1mzJaWt2sPB2yck9vy4AtkVk0A8NKGzJH';  // BRIZAIR Office (Bot + Sheets)
var ARCHIVE_FOLDER_ID = '1tuE7gj_2PPsjovROzIKJ25zw9J4aa3w3';  // BRIZAIR Original Excel (2026-11-12), read only

// ───────────────────────── entry points ─────────────────────────
function doGet() {
  return out({ok: true, app: 'BRIZAIR Office', v: VERSION});
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents); } catch (x) { return out({ok: false, error: 'bad request'}); }
  try {
    if (req.a === 'setup') return out(setup_(req));
    if (req.a === 'login') return out(login_(req));
    if (String(req.a).indexOf('relay') === 0) return out(relay_(req));
    var me = auth_(req.t);
    if (!me) return out({ok: false, error: 'login', msg: 'Please log in again.'});
    var f = ACTIONS[req.a];
    if (!f) return out({ok: false, error: 'unknown action'});
    return out(f(req, me));
  } catch (err) {
    try { log_('system', 'error', String(err && err.message || err) + ' @' + req.a); } catch (x) {}
    return out({ok: false, error: 'server', msg: String(err && err.message || err)});
  }
}

var ACTIONS = {
  boot: boot_,
  logout: logout_,
  addJob: addJob_,
  updateJob: updateJob_,
  stockMove: stockMove_,
  payment: payment_,
  newReceivable: newReceivable_,
  cleaningDone: cleaningDone_,
  addInstall: addInstall_,
  saveQuote: saveQuote_,
  quoteStatus: quoteStatus_,
  ask: ask_,
  askGet: askGet_,
  askRate: askRate_,
  kNote: kNote_,
  kUpload: kUpload_,
  kHide: kHide_
};

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────────── login ─────────────────────────
function hash_(s) {
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'brizair|' + s, Utilities.Charset.UTF_8);
  return b.map(function (x) { return ('0' + (x & 255).toString(16)).slice(-2); }).join('');
}

function users_() {
  return JSON.parse(PropertiesService.getScriptProperties().getProperty('USERS') || '[]');
}

function setup_(req) {
  var props = PropertiesService.getScriptProperties();
  if (users_().length) return {ok: false, error: 'already set up'};
  var list = (req.users || []).filter(function (u) { return u.name && /^\d{6}$/.test(String(u.pin || '')); });
  if (!list.length) return {ok: false, error: 'no users'};
  props.setProperty('USERS', JSON.stringify(list.map(function (u) {
    return {name: String(u.name).slice(0, 40), role: u.role === 'owner' ? 'owner' : 'staff', h: hash_(String(u.pin))};
  })));
  return {ok: true, users: list.length};
}

function login_(req) {
  var cache = CacheService.getScriptCache();
  var fails = +(cache.get('fails') || 0);
  if (fails >= 10) return {ok: false, error: 'locked', msg: 'Too many wrong PINs. Wait 15 minutes.'};
  var pin = String(req.pin || '');
  var h = hash_(pin);
  var u = users_().filter(function (x) { return x.h === h; })[0];
  if (!/^\d{6}$/.test(pin) || !u) {
    cache.put('fails', String(fails + 1), 900);
    return {ok: false, error: 'pin', msg: 'Wrong PIN. Please try again.'};
  }
  var t = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('S_' + t, JSON.stringify({n: u.name, r: u.role, x: Date.now() + SESSION_DAYS * 864e5}));
  pruneSessions_(props);
  log_(u.name, 'login', req.device ? String(req.device).slice(0, 80) : '');
  return {ok: true, t: t, me: {name: u.name, role: u.role}};
}

function auth_(t) {
  if (!t || !/^[0-9a-f]{64}$/.test(t)) return null;
  var props = PropertiesService.getScriptProperties();
  var s = props.getProperty('S_' + t);
  if (!s) return null;
  s = JSON.parse(s);
  if (s.x < Date.now()) { props.deleteProperty('S_' + t); return null; }
  return {name: s.n, role: s.r, t: t};
}

function logout_(req, me) {
  PropertiesService.getScriptProperties().deleteProperty('S_' + me.t);
  return {ok: true};
}

function pruneSessions_(props) {
  var all = props.getProperties(), now = Date.now();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('S_') === 0) { try { if (JSON.parse(all[k]).x < now) props.deleteProperty(k); } catch (x) { props.deleteProperty(k); } }
  });
}

/** Run in the editor to remove all PINs and sessions (then set up again). */
function resetUsers() {
  var props = PropertiesService.getScriptProperties();
  Object.keys(props.getProperties()).forEach(function (k) { if (k === 'USERS' || k.indexOf('S_') === 0) props.deleteProperty(k); });
}

/** Run once in the editor to approve access (sheet + Drive uploads + Telegram alerts). */
function authorize() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  DriveApp.getFolderById(MAIN_FOLDER_ID).getName();
  Drive.Files.list({pageSize: 1});
  UrlFetchApp.fetch('https://www.google.com', {muteHttpExceptions: true});
  Logger.log('OK');
}

// ───────────────────────── sheet helpers ─────────────────────────
var _ss = null;
function ss_() { return _ss || (_ss = SpreadsheetApp.openById(SHEET_ID)); }
function sh_(name) {
  var s = ss_().getSheetByName(name);
  if (!s) throw new Error('Tab missing: ' + name);
  return s;
}
function norm_(h) { return String(h).replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); }

function table_(name, keyCol) {
  var sh = sh_(name);
  var lr = sh.getLastRow(), lc = sh.getLastColumn();
  var vals = lr ? sh.getRange(1, 1, lr, lc).getValues() : [[]];
  var head = vals[0].map(norm_);
  var idx = {};
  head.forEach(function (h, i) { if (h && idx[h] === undefined) idx[h] = i; });
  return {sh: sh, vals: vals, head: head, idx: idx, lc: lc};
}
function col_(T, name) {
  var i = T.idx[name.toLowerCase()];
  if (i === undefined) throw new Error('Column missing: ' + name);
  return i;
}
function colOpt_(T, name) { var i = T.idx[name.toLowerCase()]; return i === undefined ? -1 : i; }

function d_(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  var s = String(v || '').trim(), m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : '';
}
function n_(v) {
  if (typeof v === 'number') return v;
  var s = String(v || '').replace(/[,₱\s]/g, '');
  return s && !isNaN(+s) ? +s : null;
}
function s_(v) {
  if (v instanceof Date) return d_(v);
  return v === null || v === undefined ? '' : String(v).trim();
}
function toDate_(iso) {
  var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) throw new Error('Bad date: ' + iso);
  return new Date(+m[1], +m[2] - 1, +m[3]);
}
function clip_(v, n) { return String(v === undefined || v === null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, n || 300); }
function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function id_(p) { return 'BRZ-' + p + '-' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd') + '-9' + ('000' + Math.floor(Math.random() * 10000)).slice(-4); }

function lastRowOf_(T, ci) {
  for (var r = T.vals.length - 1; r >= 1; r--) if (s_(T.vals[r][ci]) !== '') return r + 1;
  return 1;
}

/** write {header: value} into a row (only listed headers; formulas elsewhere stay) */
function writeRow_(T, row, obj) {
  Object.keys(obj).forEach(function (h) {
    var ci = colOpt_(T, h);
    if (ci >= 0) T.sh.getRange(row, ci + 1).setValue(obj[h]);
  });
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { var r = fn(); SpreadsheetApp.flush(); return r; } finally { lock.releaseLock(); }
}

function log_(who, action, details) {
  var ss = ss_(), sh = ss.getSheetByName('APP LOG');
  if (!sh) {
    sh = ss.insertSheet('APP LOG');
    sh.getRange(1, 1, 1, 4).setValues([['Time (시간)', 'Who (누가)', 'Action (무엇)', 'Details (내용)']]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidths(1, 1, 140); sh.setColumnWidths(2, 2, 110); sh.setColumnWidth(4, 520);
  }
  sh.appendRow([Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'), who, action, String(details || '').slice(0, 500)]);
}

function notify_(text) {
  var p = PropertiesService.getScriptProperties();
  var tok = p.getProperty('TG_TOKEN'), chat = p.getProperty('TG_CHAT');
  if (!tok || !chat) return;
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + tok + '/sendMessage',
      {method: 'post', payload: {chat_id: chat, text: text, disable_web_page_preview: 'true'}, muteHttpExceptions: true});
  } catch (x) {}
}

function done_(me, action, details, alert) {
  log_(me.name, action, details);
  notify_((alert || '📝') + ' ' + me.name + ' · ' + action + '\n' + details);
}

// ───────────────────────── read everything ─────────────────────────
function boot_(req, me) {
  var out = {ok: true, me: {name: me.name, role: me.role}, at: new Date().toISOString(), v: VERSION,
    sheetUrl: ss_().getUrl(), jobs: JOBS, statuses: STATUSES, methods: METHODS};

  var T = table_('UNITS');
  out.units = rows_(T, function (r, i) {
    var item = s_(r[col_(T, 'item')]); if (!item) return null;
    return {r: i + 1, item: item, type: s_(r[col_(T, 'type')]), hp: s_(r[col_(T, 'hp')]), start: n_(r[col_(T, 'start nov 1')]) || 0,
      now: n_(r[col_(T, 'now')]) || 0, srp: n_(r[col_(T, 'srp')]), cost: n_(r[col_(T, 'cost')]),
      supplier: s_(r[colOpt_(T, 'supplier')]), notes: s_(r[colOpt_(T, 'notes')])};
  });
  T = table_('PARTS');
  out.parts = rows_(T, function (r, i) {
    var item = s_(r[col_(T, 'item')]); if (!item) return null;
    return {r: i + 1, item: item, pn: s_(r[colOpt_(T, 'part no.')]), group: s_(r[colOpt_(T, 'group')]),
      start: n_(r[col_(T, 'start nov 1')]) || 0, now: n_(r[col_(T, 'now')]) || 0,
      price: n_(r[colOpt_(T, 'customer price w/ vat')]), cost: n_(r[colOpt_(T, 'lg cost')]), notes: s_(r[colOpt_(T, 'notes')])};
  });
  out.unitLog = moves_('UNIT IN-OUT');
  out.partLog = moves_('PART IN-OUT');

  T = table_('SCHEDULE');
  out.schedule = rows_(T, function (r, i) {
    var date = d_(r[col_(T, 'date')]), cust = s_(r[col_(T, 'customer')]);
    if (!date && !cust) return null;
    return {r: i + 1, date: date, time: timeStr_(r[col_(T, 'time')]), job: s_(r[col_(T, 'job')]), customer: cust,
      location: s_(r[col_(T, 'location')]), units: s_(r[col_(T, 'units / model')]), tech: s_(r[col_(T, 'technician')]),
      status: s_(r[col_(T, 'status')]) || 'Scheduled', notes: s_(r[col_(T, 'notes')]), by: s_(r[colOpt_(T, 'added by')]),
      id: s_(r[colOpt_(T, 'bot record id')])};
  });

  T = table_('RECEIVABLES');
  var recs = [], total = null;
  for (var i = 1; i < T.vals.length; i++) {
    var r = T.vals[i], proj = s_(r[col_(T, 'customer / project')]);
    if (/^total/i.test(proj)) { total = n_(r[col_(T, 'balance now')]); break; }
    if (!proj) continue;
    recs.push({r: i + 1, no: s_(r[col_(T, 'no.')]), project: proj, ref: s_(r[colOpt_(T, 'ref')]),
      contract: s_(r[col_(T, 'contract price')]), bal0: n_(r[col_(T, 'balance nov 12')]) || 0, paid: n_(r[col_(T, 'new payments')]) || 0,
      bal: n_(r[col_(T, 'balance now')]) || 0, status: s_(r[col_(T, 'status')]), remarks: s_(r[col_(T, 'remarks')])});
  }
  out.receivables = recs;
  out.arTotal = total;

  T = table_('PAYMENTS');
  out.payments = rows_(T, function (r, i) {
    var amt = n_(r[col_(T, 'amount')]), proj = s_(r[col_(T, 'customer / project')]);
    if (!proj && amt === null) return null;
    return {r: i + 1, date: d_(r[col_(T, 'date')]), project: proj, amount: amt || 0, method: s_(r[col_(T, 'method')]),
      by: s_(r[colOpt_(T, 'received by')]), notes: s_(r[colOpt_(T, 'notes')])};
  });

  T = table_('CUSTOMERS');
  var C = {c: col_(T, 'customer'), co: col_(T, 'company / project'), l: col_(T, 'location'), inv: col_(T, 'invoice date'),
    m: col_(T, 'model'), d: col_(T, 'description'), q: col_(T, 'qty'), im: col_(T, 'indoor model'), isn: col_(T, 'indoor sn'),
    ii: col_(T, 'indoor installed'), om: col_(T, 'outdoor model'), osn: col_(T, 'outdoor sn'), oi: col_(T, 'outdoor installed'),
    su: col_(T, 'start-up'), lc: col_(T, 'last cleaning'), nc: col_(T, 'next cleaning'), rem: colOpt_(T, 'remarks'),
    cp: colOpt_(T, 'customer price w/ install'), w: colOpt_(T, 'warranty claim')};
  out.customers = rows_(T, function (r, i) {
    var c = s_(r[C.c]), m = s_(r[C.m]);
    if (!c && !m) return null;
    if (/^(model|indoor serial #|serial #)$/i.test(s_(r[C.isn])) || /^model$/i.test(m)) return null;  // repeated header rows
    var o = {r: i + 1, c: c, co: s_(r[C.co]), l: s_(r[C.l]), m: m, d: s_(r[C.d]), q: s_(r[C.q]),
      isn: s_(r[C.isn]), osn: s_(r[C.osn]), inst: d_(r[C.ii]) || d_(r[C.oi]), inv: d_(r[C.inv]),
      lc: d_(r[C.lc]), nc: d_(r[C.nc]), rem: C.rem >= 0 ? s_(r[C.rem]) : ''};
    Object.keys(o).forEach(function (k) { if (o[k] === '') delete o[k]; });
    return o;
  });

  out.quotes = [];
  ['QUOTES', 'INVOICES'].forEach(function (tab) {
    var qs = ss_().getSheetByName(tab);
    if (!qs || qs.getLastRow() < 2) return;
    qs.getRange(2, 1, qs.getLastRow() - 1, 9).getValues().forEach(function (r, i) {
      if (!r[0]) return;
      var data = {}; try { data = JSON.parse(r[8] || '{}'); } catch (x) {}
      out.quotes.push({r: i + 2, no: s_(r[0]), type: tab === 'INVOICES' ? 'invoice' : 'quote', date: d_(r[1]), customer: s_(r[2]), project: s_(r[3]),
        total: n_(r[4]) || 0, status: s_(r[5]), by: s_(r[6]), updated: s_(r[7]), data: data});
    });
  });
  out.ask = askRows_(40);
  out.needs = askRows_(400).filter(function (r) { return r.missing || /^bad/.test(r.rating) || r.status === 'error'; }).slice(-40).reverse()
    .map(function (r) { return {id: r.id, time: r.time, who: r.who, q: r.q, missing: r.missing, rating: r.rating}; });
  out.know = knowRows_(false).map(function (k) { k.text = String(k.text || '').slice(0, 280); return k; });
  var seen = +(PropertiesService.getScriptProperties().getProperty('RELAY_SEEN') || 0);
  out.aiOnline = seen > 0 && Date.now() - seen < 3 * 60000;
  out.aiSeen = seen ? new Date(seen).toISOString() : '';
  var lg = ss_().getSheetByName('APP LOG');
  out.log = [];
  if (lg && lg.getLastRow() > 1) {
    var n = Math.min(40, lg.getLastRow() - 1);
    out.log = lg.getRange(lg.getLastRow() - n + 1, 1, n, 4).getDisplayValues().reverse()
      .filter(function (r) { return r[2] !== 'login'; })
      .map(function (r) { return {time: r[0], who: r[1], action: r[2], details: r[3]}; });
  }
  return out;
}

function rows_(T, fn) {
  var o = [];
  for (var i = 1; i < T.vals.length; i++) { var x = fn(T.vals[i], i); if (x) o.push(x); }
  return o;
}

function timeStr_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, TZ, 'h:mm a');
  return s_(v);
}

function moves_(name) {
  var T = table_(name);
  return rows_(T, function (r, i) {
    var item = s_(r[col_(T, 'item')]); if (!item) return null;
    return {r: i + 1, date: d_(r[col_(T, 'date')]), item: item, dir: s_(r[col_(T, 'in / out')]).toUpperCase(),
      qty: n_(r[col_(T, 'qty')]) || 0, party: s_(r[col_(T, 'customer / supplier')]), ref: s_(r[col_(T, 'po / invoice #')]),
      by: s_(r[col_(T, 'by')]), notes: s_(r[col_(T, 'notes')])};
  });
}

// ───────────────────────── writes ─────────────────────────
function jobFields_(j) {
  var o = {};
  if (j.date !== undefined) o['date'] = toDate_(j.date);
  if (j.time !== undefined) o['time'] = clip_(j.time, 20);
  if (j.job !== undefined) { if (JOBS.indexOf(j.job) < 0) throw new Error('Pick a job type'); o['job'] = j.job; }
  if (j.customer !== undefined) o['customer'] = clip_(j.customer, 120);
  if (j.location !== undefined) o['location'] = clip_(j.location, 160);
  if (j.units !== undefined) o['units / model'] = clip_(j.units, 160);
  if (j.tech !== undefined) o['technician'] = clip_(j.tech, 80);
  if (j.status !== undefined) { if (STATUSES.indexOf(j.status) < 0) throw new Error('Bad status'); o['status'] = j.status; }
  if (j.notes !== undefined) o['notes'] = clip_(j.notes, 500);
  return o;
}

function addJob_(req, me) {
  var j = req.job || {};
  if (!j.date || !j.customer) throw new Error('Date and customer are needed');
  return withLock_(function () {
    var T = table_('SCHEDULE');
    var row = lastRowOf_(T, col_(T, 'date')) + 1;
    var f = jobFields_(j);
    if (!f['status']) f['status'] = 'Scheduled';
    f['added by'] = me.name;
    f['bot record id'] = id_('S');
    writeRow_(T, row, f);
    done_(me, 'New job', j.date + ' ' + (j.time || '') + ' · ' + (j.job || '') + ' · ' + j.customer + (j.location ? ' · ' + j.location : '') + (j.tech ? ' · ' + j.tech : ''), '📅');
    return {ok: true, r: row};
  });
}

function updateJob_(req, me) {
  var r = +req.r, j = req.set || {};
  return withLock_(function () {
    var T = table_('SCHEDULE');
    if (!(r >= 2 && r <= T.vals.length)) throw new Error('Job not found. Please refresh.');
    var cur = T.vals[r - 1], idc = colOpt_(T, 'bot record id');
    var same = (req.id && idc >= 0) ? s_(cur[idc]) === req.id : s_(cur[col_(T, 'customer')]) === String(req.customer || '');
    if (!same) throw new Error('This job was changed by someone else. Please refresh.');
    var before = s_(cur[col_(T, 'status')]);
    writeRow_(T, r, jobFields_(j));
    var what = Object.keys(j).map(function (k) { return k + ': ' + j[k]; }).join(', ');
    done_(me, 'Job updated', s_(cur[col_(T, 'customer')]) + ' (' + d_(cur[col_(T, 'date')]) + ') → ' + what,
      j.status === 'Done' ? '✅' : j.status === 'Cancelled' ? '❌' : '✏️');
    return {ok: true, r: r, before: before};
  });
}

function stockMove_(req, me) {
  var m = req.move || {};
  var tab = m.kind === 'part' ? 'PART IN-OUT' : 'UNIT IN-OUT', list = m.kind === 'part' ? 'PARTS' : 'UNITS';
  var qty = Math.round(+m.qty);
  if (!(qty > 0 && qty < 10000)) throw new Error('Qty must be 1 or more');
  if (m.dir !== 'IN' && m.dir !== 'OUT') throw new Error('Choose IN or OUT');
  return withLock_(function () {
    var L = table_(list), ic = col_(L, 'item'), found = false;
    for (var i = 1; i < L.vals.length; i++) if (s_(L.vals[i][ic]) === m.item) { found = true; break; }
    if (!found) throw new Error('Item not found in ' + list + ': ' + m.item);
    var T = table_(tab);
    var row = lastRowOf_(T, col_(T, 'item')) + 1;
    writeRow_(T, row, {'date': toDate_(m.date || today_()), 'item': m.item, 'in / out': m.dir, 'qty': qty,
      'customer / supplier': clip_(m.party, 120), 'po / invoice #': clip_(m.ref, 60), 'by': me.name, 'notes': clip_(m.notes, 300)});
    done_(me, (m.kind === 'part' ? 'Part ' : 'Unit ') + m.dir, qty + ' × ' + m.item + (m.party ? ' · ' + m.party : '') + (m.ref ? ' · ' + m.ref : ''),
      m.dir === 'IN' ? '📦' : '🚚');
    return {ok: true, r: row};
  });
}

function payment_(req, me) {
  var p = req.pay || {};
  var amt = n_(p.amount);
  if (!(amt > 0)) throw new Error('Amount must be more than 0');
  if (METHODS.indexOf(p.method) < 0) throw new Error('Choose a method');
  return withLock_(function () {
    var R = table_('RECEIVABLES'), pc = col_(R, 'customer / project'), ok = false;
    for (var i = 1; i < R.vals.length; i++) if (s_(R.vals[i][pc]) === p.project) { ok = true; break; }
    if (!ok) throw new Error('Pick the customer / project from the list');
    var T = table_('PAYMENTS');
    var row = lastRowOf_(T, col_(T, 'customer / project')) + 1;
    writeRow_(T, row, {'date': toDate_(p.date || today_()), 'customer / project': p.project, 'amount': amt, 'method': p.method,
      'received by': clip_(p.by || me.name, 60), 'notes': clip_(p.notes, 300), 'bot record id': id_('P')});
    done_(me, 'Payment', '₱' + amt.toLocaleString('en-US', {minimumFractionDigits: 2}) + ' · ' + p.project + ' · ' + p.method, '💵');
    return {ok: true, r: row};
  });
}

function newReceivable_(req, me) {
  var x = req.rec || {};
  if (!x.project) throw new Error('Customer / project is needed');
  var bal = n_(x.balance);
  if (!(bal > 0)) throw new Error('Balance must be more than 0');
  return withLock_(function () {
    var T = table_('RECEIVABLES'), pc = col_(T, 'customer / project'), totalRow = -1, maxNo = 0;
    for (var i = 1; i < T.vals.length; i++) {
      var v = s_(T.vals[i][pc]);
      if (/^total/i.test(v)) { totalRow = i + 1; break; }
      if (v === x.project) throw new Error('This name already exists. Use a different name (add P.O number).');
      maxNo = Math.max(maxNo, n_(T.vals[i][col_(T, 'no.')]) || 0);
    }
    if (totalRow < 3) throw new Error('TOTAL row not found in RECEIVABLES');
    // insert inside the SUM range (above the blank spare row before TOTAL) so totals include it
    var at = totalRow - 1;
    T.sh.insertRowBefore(at);
    var src = at - 1, fc = [col_(T, 'new payments'), col_(T, 'balance now'), col_(T, 'status')];
    fc.forEach(function (c) {
      var f = T.sh.getRange(src, c + 1).getFormulaR1C1();
      if (f) T.sh.getRange(at, c + 1).setFormulaR1C1(f);
    });
    T.sh.getRange(at, 1, 1, T.lc).setFontWeight(null).setBackground(null);
    var T2 = table_('RECEIVABLES');
    writeRow_(T2, at, {'no.': maxNo + 1, 'customer / project': clip_(x.project, 120), 'ref': clip_(x.ref, 80),
      'contract price': n_(x.contract) !== null ? n_(x.contract) : clip_(x.contract, 80), 'balance nov 12': bal, 'remarks': clip_(x.remarks, 300)});
    done_(me, 'New receivable', x.project + ' · balance ₱' + bal.toLocaleString('en-US', {minimumFractionDigits: 2}), '🧾');
    return {ok: true, r: at};
  });
}

function cleaningDone_(req, me) {
  var r = +req.r;
  return withLock_(function () {
    var T = table_('CUSTOMERS');
    if (!(r >= 2 && r <= T.vals.length)) throw new Error('Customer row not found. Please refresh.');
    var cur = T.vals[r - 1];
    if (s_(cur[col_(T, 'customer')]) !== String(req.customer || '') || s_(cur[col_(T, 'indoor sn')]) !== String(req.isn || ''))
      throw new Error('Customer list changed. Please refresh.');
    T.sh.getRange(r, col_(T, 'last cleaning') + 1).setValue(toDate_(req.date || today_()));
    ensureNextCleaning_(T, r);
    done_(me, 'Cleaning done', s_(cur[col_(T, 'customer')]) + ' · ' + s_(cur[col_(T, 'model')]) + ' · SN ' + (req.isn || '-') + ' · ' + (req.date || today_()), '🧽');
    return {ok: true};
  });
}

function ensureNextCleaning_(T, r) {
  var c = col_(T, 'next cleaning') + 1, cell = T.sh.getRange(r, c);
  if (!cell.getFormula()) {
    var f = T.sh.getRange(2, c).getFormulaR1C1();
    if (f) cell.setFormulaR1C1(f);
  }
}

function addInstall_(req, me) {
  var x = req.inst || {};
  if (!x.customer || !x.model) throw new Error('Customer and model are needed');
  return withLock_(function () {
    var T = table_('CUSTOMERS');
    var row = lastRowOf_(T, col_(T, 'customer')) + 1;
    var f = {'customer': clip_(x.customer, 120), 'company / project': clip_(x.company, 120), 'location': clip_(x.location, 160),
      'invoice name': clip_(x.invoiceName, 120), 'model': clip_(x.model, 120), 'description': clip_(x.desc, 120), 'qty': n_(x.qty) || 1,
      'indoor model': clip_(x.imodel, 60), 'indoor sn': clip_(x.isn, 60), 'outdoor model': clip_(x.omodel, 60), 'outdoor sn': clip_(x.osn, 60),
      'remarks': clip_(x.remarks, 300), 'bot record id': id_('C')};
    if (x.invoiceDate) f['invoice date'] = toDate_(x.invoiceDate);
    if (x.installed) { f['indoor installed'] = toDate_(x.installed); f['outdoor installed'] = toDate_(x.installed); }
    if (x.startup) f['start-up'] = toDate_(x.startup);
    writeRow_(T, row, f);
    ensureNextCleaning_(T, row);
    done_(me, 'New installation', x.customer + ' · ' + x.model + (x.isn ? ' · SN ' + x.isn : '') + (x.installed ? ' · ' + x.installed : ''), '🛠️');
    return {ok: true, r: row};
  });
}

function quotesSheet_(type) {
  var inv = type === 'invoice', name = inv ? 'INVOICES' : 'QUOTES';
  var ss = ss_(), sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, 9).setValues([[inv ? 'Invoice # (인보이스 번호)' : 'Quote # (견적번호)', 'Date (날짜)', 'Customer (손님)', 'Project / Location (현장)', 'Total PHP (합계)',
      'Status (상태)', 'Prepared by (작성)', 'Updated (수정)', 'Data - do not edit (웹 자료, 손대지 않기)']]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 120); sh.setColumnWidth(3, 220); sh.setColumnWidth(4, 200); sh.setColumnWidth(9, 120);
    sh.getRange('B:B').setNumberFormat('mm/dd/yyyy'); sh.getRange('E:E').setNumberFormat('#,##0.00');
  }
  return sh;
}

function saveQuote_(req, me) {
  var q = req.quote || {};
  if (!q.customer) throw new Error('Customer name is needed');
  if (!(q.items || []).length) throw new Error('Add at least one item');
  var inv = q.type === 'invoice', pre = inv ? 'INV' : 'Q';
  return withLock_(function () {
    var sh = quotesSheet_(q.type), last = sh.getLastRow();
    var nos = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var row, no = q.no;
    if (no) {
      var k = nos.indexOf(no);
      if (k < 0) throw new Error('Quote not found: ' + no);
      row = k + 2;
    } else {
      var yy = Utilities.formatDate(new Date(), TZ, 'yyyy'), max = 0;
      nos.forEach(function (n) { var m = n.match(new RegExp('^' + pre + '-' + yy + '-(\\d+)$')); if (m) max = Math.max(max, +m[1]); });
      no = pre + '-' + yy + '-' + ('000' + (max + 1)).slice(-4);
      row = last + 1;
    }
    q.no = no;
    var data = JSON.stringify(q);
    if (data.length > 45000) throw new Error('Quote is too long');
    var prev = row <= last ? String(sh.getRange(row, 6).getValue()) : '';
    sh.getRange(row, 1, 1, 9).setValues([[no, toDate_(q.date || today_()), clip_(q.customer, 120), clip_(q.project, 160), +q.total || 0,
      q.status || prev || (inv ? 'Unpaid' : 'Draft'), q.by || me.name, Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm') + ' ' + me.name, data]]);
    done_(me, (inv ? (row > last ? 'New invoice' : 'Invoice edited') : (row > last ? 'New quotation' : 'Quotation edited')), no + ' · ' + q.customer + ' · ₱' + (+q.total || 0).toLocaleString('en-US', {minimumFractionDigits: 2}), '📄');
    return {ok: true, no: no, r: row};
  });
}

function quoteStatus_(req, me) {
  var inv = /^INV-/.test(String(req.no));
  var ok = inv ? ['Unpaid', 'Partially paid', 'Paid', 'Cancelled'] : ['Draft', 'Sent', 'Accepted', 'Lost'];
  if (ok.indexOf(req.status) < 0) throw new Error('Bad status');
  return withLock_(function () {
    var sh = quotesSheet_(inv ? 'invoice' : 'quote'), last = sh.getLastRow();
    var nos = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var k = nos.indexOf(req.no);
    if (k < 0) throw new Error('Quote not found');
    sh.getRange(k + 2, 6).setValue(req.status);
    done_(me, (inv ? 'Invoice ' : 'Quotation ') + req.status, req.no + ' · ' + sh.getRange(k + 2, 3).getValue(), req.status === 'Accepted' ? '🎉' : '📄');
    return {ok: true};
  });
}

// ───────────────────────── AI questions (answered by Sir Kim's PC) ─────────────────────────
var ASK_HEAD = ['ID', 'Time (시간)', 'Who (누가)', 'Question (질문)', 'Status (상태)', 'Answer (답)', 'Answered (답한 시간)', 'Rating (평가)', 'Missing info (부족한 자료)'];
function askSheet_() {
  var ss = ss_(), sh = ss.getSheetByName('ASK');
  if (!sh) {
    sh = ss.insertSheet('ASK');
    sh.getRange(1, 1, 1, ASK_HEAD.length).setValues([ASK_HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1); sh.setColumnWidth(4, 360); sh.setColumnWidth(6, 520);
  }
  if (sh.getLastColumn() < ASK_HEAD.length) sh.getRange(1, 1, 1, ASK_HEAD.length).setValues([ASK_HEAD]).setFontWeight('bold');
  return sh;
}
function askRows_(n, ids) {
  var sh = askSheet_(), last = sh.getLastRow();
  if (last < 2) return [];
  var from = ids ? 2 : Math.max(2, last - n + 1);
  return sh.getRange(from, 1, last - from + 1, 9).getValues()
    .filter(function (r) { return r[0] && (!ids || ids.indexOf(String(r[0])) >= 0); })
    .map(function (r) {
      return {id: String(r[0]), time: r[1] instanceof Date ? Utilities.formatDate(r[1], TZ, 'yyyy-MM-dd HH:mm') : s_(r[1]),
        who: s_(r[2]), q: s_(r[3]), status: s_(r[4]), a: s_(r[5]), rating: s_(r[7]), missing: s_(r[8])};
    });
}
function ask_(req, me) {
  var q = String(req.q || '').trim();
  if (q.length < 2) throw new Error('Type your question');
  return withLock_(function () {
    var sh = askSheet_(), id = 'A' + Utilities.formatDate(new Date(), TZ, 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
    sh.appendRow([id, new Date(), me.name, clip_(q, 2000), 'waiting', '', '']);
    return {ok: true, id: id};
  });
}
function askRate_(req, me) {
  return withLock_(function () {
    var sh = askSheet_(), last = sh.getLastRow();
    var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var k = ids.indexOf(String(req.id));
    if (k < 0) throw new Error('Not found');
    var v = req.good ? 'good' : 'bad: ' + clip_(req.why || '', 200) + ' (' + me.name + ')';
    sh.getRange(k + 2, 8).setValue(v);
    if (!req.good) log_(me.name, 'GPT answer marked wrong', sh.getRange(k + 2, 4).getValue() + (req.why ? ' — ' + req.why : ''));
    return {ok: true};
  });
}
function askGet_(req, me) {
  var ids = (req.ids || []).map(String).slice(0, 20);
  var seen = +(PropertiesService.getScriptProperties().getProperty('RELAY_SEEN') || 0);
  return {ok: true, items: askRows_(0, ids), aiOnline: seen > 0 && Date.now() - seen < 3 * 60000};
}

// ───────────────────────── materials (knowledge for the AI) ─────────────────────────
var K_HEAD = ['ID', 'Date (날짜)', 'Who (누가)', 'Title (제목)', 'Type (종류)', 'Text for AI (AI가 읽는 글)', 'File (파일)', 'Status (상태)'];
function kSheet_() {
  var ss = ss_(), sh = ss.getSheetByName('KNOWLEDGE');
  if (!sh) {
    sh = ss.insertSheet('KNOWLEDGE');
    sh.getRange(1, 1, 1, K_HEAD.length).setValues([K_HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1); sh.setColumnWidth(4, 240); sh.setColumnWidth(6, 520); sh.setColumnWidth(7, 220);
  }
  return sh;
}
function knowRows_(withHidden) {
  var sh = kSheet_(), last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 8).getValues().filter(function (r) { return r[0] && (withHidden || r[7] !== 'hidden'); })
    .map(function (r) {
      return {id: String(r[0]), date: d_(r[1]), who: s_(r[2]), title: s_(r[3]), type: s_(r[4]), text: String(r[5] || ''), url: s_(r[6]), status: s_(r[7])};
    }).reverse();
}
function kFolder_() {
  var p = PropertiesService.getScriptProperties(), id = p.getProperty('K_FOLDER');
  if (id) { try { return DriveApp.getFolderById(id); } catch (x) {} }
  var f = DriveApp.getFolderById(MAIN_FOLDER_ID).createFolder('Materials for AI (uploads)');
  p.setProperty('K_FOLDER', f.getId());
  return f;
}
function kAdd_(me, title, type, text, url) {
  var sh = kSheet_(), id = 'K' + Utilities.formatDate(new Date(), TZ, 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
  sh.appendRow([id, new Date(), me.name, clip_(title, 200), type, String(text || '').slice(0, 45000), url || '', 'active']);
  PropertiesService.getScriptProperties().setProperty('K_VER', String(Date.now()));
  return id;
}
function kNote_(req, me) {
  var t = String(req.text || '').trim();
  if (t.length < 3) throw new Error('Write something first');
  var id = kAdd_(me, req.title || t.slice(0, 60), 'Note', t, '');
  done_(me, 'Material added', (req.title || t.slice(0, 60)), '📚');
  return {ok: true, id: id};
}
function kUpload_(req, me) {
  if (!req.b64 || !req.name) throw new Error('No file');
  var bytes = Utilities.base64Decode(req.b64);
  if (bytes.length > 15 * 1024 * 1024) throw new Error('File is too big (max 15 MB)');
  var mime = String(req.mime || 'application/octet-stream');
  var blob = Utilities.newBlob(bytes, mime, String(req.name).slice(0, 120));
  var file = kFolder_().createFile(blob);
  var text = '', note = String(req.note || '').trim();
  try { text = extractText_(blob, mime, file.getName()); } catch (x) { text = ''; }
  var body = (note ? 'Note from ' + me.name + ': ' + note + '\n\n' : '') + (text || '(no readable text found — the AI sees only the title and note)');
  var id = kAdd_(me, req.title || file.getName(), 'File', body, file.getUrl());
  done_(me, 'Material uploaded', (req.title || file.getName()) + (text ? ' · ' + text.length + ' chars read' : ' · no text'), '📚');
  return {ok: true, id: id, chars: text.length};
}
function extractText_(blob, mime, name) {
  if (/^text\/|csv|json/.test(mime) || /\.(txt|csv|md)$/i.test(name)) return blob.getDataAsString('UTF-8');
  var target = null;
  if (/spreadsheet|excel/.test(mime) || /\.(xlsx|xls)$/i.test(name)) target = 'application/vnd.google-apps.spreadsheet';
  else if (/pdf|image\/|word|document|presentation|powerpoint/.test(mime) || /\.(pdf|docx?|pptx?|jpe?g|png|heic)$/i.test(name)) target = 'application/vnd.google-apps.document';
  if (!target) return '';
  var tmp = Drive.Files.create({name: 'tmp-ocr-' + name, mimeType: target, parents: [kFolder_().getId()]}, blob, {ocrLanguage: 'en'});
  try {
    if (target === 'application/vnd.google-apps.spreadsheet') {
      var ss = SpreadsheetApp.openById(tmp.id), out = [];
      ss.getSheets().forEach(function (sh) {
        var v = sh.getDataRange().getDisplayValues();
        out.push('## ' + sh.getName());
        v.forEach(function (r) { var line = r.join(' | ').replace(/( \| )+$/, ''); if (line.replace(/[ |]/g, '')) out.push(line); });
      });
      return out.join('\n');
    }
    return DocumentApp.openById(tmp.id).getBody().getText();
  } finally {
    try { DriveApp.getFileById(tmp.id).setTrashed(true); } catch (x) {}
  }
}
function kHide_(req, me) {
  return withLock_(function () {
    var sh = kSheet_(), last = sh.getLastRow();
    var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    var k = ids.indexOf(String(req.id));
    if (k < 0) throw new Error('Not found');
    sh.getRange(k + 2, 8).setValue('hidden');
    PropertiesService.getScriptProperties().setProperty('K_VER', String(Date.now()));
    done_(me, 'Material removed', sh.getRange(k + 2, 4).getValue(), '🗑️');
    return {ok: true};
  });
}

// ───────────────────────── relay (Sir Kim's PC) ─────────────────────────
function relay_(req) {
  var p = PropertiesService.getScriptProperties(), key = p.getProperty('RELAY_KEY');
  if (req.a === 'relaySetKey') {  // once only, Evan sets it
    if (key) return {ok: false, error: 'already set'};
    if (!req.key || String(req.key).length < 32) return {ok: false, error: 'short'};
    p.setProperty('RELAY_KEY', String(req.key));
    return {ok: true};
  }
  if (!key || req.key !== key) return {ok: false, error: 'bad key'};
  p.setProperty('RELAY_SEEN', String(Date.now()));
  if (req.a === 'relayPoll') {
    return withLock_(function () {
      var sh = askSheet_(), last = sh.getLastRow(), outQ = [];
      if (last >= 2) {
        var v = sh.getRange(2, 1, last - 1, 7).getValues(), now = Date.now();
        for (var i = 0; i < v.length && outQ.length < 3; i++) {
          var st = String(v[i][4]);
          var stale = /^thinking@(\d+)$/.test(st) && now - (+st.split('@')[1]) > 8 * 60000;
          if (st === 'waiting' || stale) {
            sh.getRange(i + 2, 5).setValue('thinking@' + now);
            outQ.push({id: String(v[i][0]), who: s_(v[i][2]), q: s_(v[i][3]), time: v[i][1] instanceof Date ? Utilities.formatDate(v[i][1], TZ, 'yyyy-MM-dd HH:mm') : ''});
          }
        }
      }
      return {ok: true, questions: outQ, dataVer: dataVer_(), now: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm (EEE)')};
    });
  }
  if (req.a === 'relayAnswer') {
    return withLock_(function () {
      var sh = askSheet_(), last = sh.getLastRow();
      var ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
      var k = ids.indexOf(String(req.id));
      if (k < 0) return {ok: false, error: 'not found'};
      sh.getRange(k + 2, 5, 1, 3).setValues([[req.error ? 'error' : 'answered', String(req.answer || '').slice(0, 20000), new Date()]]);
      if (req.missing) sh.getRange(k + 2, 9).setValue(String(req.missing).slice(0, 500));
      return {ok: true};
    });
  }
  if (req.a === 'relayArchive') {  // old Excel files (archive folder), once a day
    var files = {};
    var it = DriveApp.getFolderById(ARCHIVE_FOLDER_ID).getFilesByType(MimeType.GOOGLE_SHEETS);
    while (it.hasNext()) {
      var f = it.next(), book = {};
      SpreadsheetApp.openById(f.getId()).getSheets().forEach(function (sh) {
        var v = sh.getDataRange().getDisplayValues(), last = v.length;
        while (last > 0 && v[last - 1].join('') === '') last--;
        book[sh.getName()] = v.slice(0, last).map(function (r) {
          var e = r.length; while (e > 0 && r[e - 1] === '') e--; return r.slice(0, e);
        });
      });
      files[f.getName()] = book;
    }
    return {ok: true, files: files};
  }
  if (req.a === 'relayExport') {
    var ss = ss_(), tabs = {};
    ss.getSheets().forEach(function (sh) {
      var n = sh.getName();
      if (/^(ASK|BOT AUDIT|APP LOG)$/.test(n)) return;
      var v = sh.getDataRange().getDisplayValues(), last = v.length;
      while (last > 0 && v[last - 1].join('') === '') last--;
      tabs[n] = v.slice(0, last);
    });
    var ask = askRows_(60).filter(function (r) { return r.status === 'answered'; });
    return {ok: true, dataVer: dataVer_(), tabs: tabs, knowledge: knowRows_(false), recentQA: ask,
      at: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm')};
  }
  return {ok: false, error: 'unknown'};
}
function dataVer_() {
  // changes whenever materials change; sheet edits are picked up by the PC every 10 minutes anyway
  return PropertiesService.getScriptProperties().getProperty('K_VER') || '0';
}
