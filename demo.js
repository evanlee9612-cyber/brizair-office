/* DEMO backend: fake data only (used when no API is set, or with ?demo). Nothing leaves the browser. */
(function () {
  'use strict';
  const T = new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Manila'}).format(new Date());
  const add = n => { const d = new Date(T + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const USERS = {'111111': {name: 'Sir Kim', role: 'owner'}, '222222': {name: 'Ladie', role: 'staff'}, '333333': {name: 'Jheena', role: 'staff'}};
  let seq = 100;

  function fresh() {
    const units = [
      ['HSN09ISB/HSU09ISB', 'Split Type', '1hp', 3, 32998, 20000], ['HSN12ISB/HSU12ISB', 'Split Type', '1.5hp', 4, 43498, 26000],
      ['HSN18ISB/HSU18ISB', 'Split Type', '2hp', 2, 50498, 26259], ['HSN24ISB/HSU24ISB', 'Split Type', '2.5hp', 1, 65998, 34000],
      ['APNQ36GR5A4/AUUQ36GH4', 'Floor Stand', '4hp', 2, 144998, 75399], ['ZPNQ48GT3A0/ZUAD1', 'Floor Stand', '5hp', 1, 173000, 89960],
      ['ZTNQ36GNLA1/ZUUQ36GE1', '4 Way Ceiling Cassette', '4hp', 1, 142000, 73840], ['ZTNQ18GTLA0/ZUAB1', '1 Way Ceiling Cassette', '2hp', 0, 112000, 61360],
      ['AMNQ24GTPB0', '4 Way Ceiling Cassette Indoor (Multi F)', '2.5hp', 4, 34200, 18810], ['PT-MCGW0 (Front Panel)', '4 Way Ceiling Cassette Indoor (Multi F)', '-', 4, 15000, 8250]
    ].map((u, i) => ({r: i + 2, item: u[0], type: u[1], hp: u[2], start: u[3], now: u[3], srp: u[4], cost: u[5], supplier: 'LG Electronics Philippines Inc.', notes: ''}));
    const parts = [
      ['HSN12SN [EBR78599014]', 'EBR78599014', 'INDOOR MAINBOARD', 3, 2390, 863], ['HSN09ISS [EBR85699401]', 'EBR85699401', 'INDOOR MAINBOARD', 0, 4420, 1394],
      ['Fan motor indoor 1-1.5hp', 'EAU62983003', 'FAN MOTOR', 2, 3450, 1520], ['Capacitor 35uF', 'EAE43285407', 'CAPACITOR', 6, 650, 210],
      ['Remote control AKB75215401', 'AKB75215401', 'REMOTE', 5, 1250, 480], ['Drain pump', 'ABQ74480402', 'WATER PUMP', 1, 5200, 2400]
    ].map((p, i) => ({r: i + 2, item: p[0], pn: p[1], group: p[2], start: p[3], now: p[3], price: p[4], cost: p[5], notes: ''}));
    const names = [['Sunrise Bakery', 'Sunrise Foods Inc.', 'Friendship Plaza Unit 4'], ['Mr. Daniel Cruz', '', 'Hensonville, Angeles'], ['Blue Lagoon Hotel', 'Blue Lagoon Hospitality', 'Clark Freeport Zone'],
      ['Ms. Grace Santos', '', 'Balibago, Angeles'], ['Pampanga Dental Clinic', 'PDC Corp.', 'MacArthur Hwy'], ['Kim Family Residence', '', 'Clark Sun Valley'], ['Green Leaf Cafe', 'Green Leaf Food Corp.', 'Nepo Mart'],
      ['Golden Star Office', 'Golden Star Trading', 'Mabalacat']];
    const models = ['HSN12ISB/HSU12ISB', 'HSN18ISB/HSU18ISB', 'HSN09ISB/HSU09ISB', 'APNQ36GR5A4/AUUQ36GH4', 'ZTNQ36GNLA1/ZUUQ36GE1'];
    const customers = [];
    let r = 2;
    names.forEach((n, i) => {
      const k = 1 + (i % 3);
      for (let j = 0; j < k; j++) {
        const inst = add(-(40 + i * 70 + j * 9));
        const lc = i % 2 ? add(-(150 + i * 3)) : '';
        const base = lc || inst, d = new Date(base + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 6);
        customers.push({r: r++, c: n[0], co: n[1], l: n[2], m: models[(i + j) % models.length], d: ['1.5hp Split Type', '2hp Split Type', '1hp Split Type', '4hp Floor Stand', '4hp Cassette'][(i + j) % 5],
          q: '1', isn: 'DEMO' + (310000 + i * 10 + j), osn: 'DEMO' + (410000 + i * 10 + j), inst, lc, nc: d.toISOString().slice(0, 10)});
      }
    });
    const sched = [
      [0, '9:00 AM', 'Install', 'Sunrise Bakery', 'Friendship Plaza Unit 4', '1 × HSN12ISB', 'Rommel', 'Confirmed'],
      [0, '2:00 PM', 'Service (AS)', 'Mr. Daniel Cruz', 'Hensonville', 'HSN18ISB not cold', 'Jun', 'Scheduled'],
      [1, '10:00 AM', 'Cleaning', 'Blue Lagoon Hotel', 'Rooms 201-205', '5 units', 'Rommel', 'Scheduled'],
      [1, '3:00 PM', 'Survey', 'Golden Star Office', 'Mabalacat', '', 'Jun', 'Scheduled'],
      [3, '9:00 AM', 'Delivery', 'Green Leaf Cafe', 'Nepo Mart', '2 × HSN09ISB', '', 'Scheduled'],
      [-2, '9:00 AM', 'Install', 'Kim Family Residence', 'Clark Sun Valley', '2 × HSN18ISB', 'Rommel', 'Done'],
      [-1, '1:00 PM', 'Service (AS)', 'Pampanga Dental Clinic', 'MacArthur Hwy', 'Water leak', 'Jun', 'Done'],
      [6, '11:00 AM', 'Meeting', 'Blue Lagoon Hotel', 'Clark', 'New wing 12 units', '', 'Scheduled']
    ].map((x, i) => ({r: i + 2, date: add(x[0]), time: x[1], job: x[2], customer: x[3], location: x[4], units: x[5], tech: x[6], status: x[7], notes: '', by: 'Ladie', id: 'DEMO-S-' + i}));
    const receivables = [
      ['Blue Lagoon Hotel P.O 1021', 'Q-2026-0003', '480,000.00', 240000, 'PARTIAL', '50% upon completion'], ['Golden Star Office P.O 77', '', '196,980.00', 19698, 'PARTIAL', '10% retention'],
      ['Sunrise Bakery', 'Q-2026-0005', '43,498.00', 43498, 'UNPAID', 'due on install'], ['Pampanga Dental Clinic', '', '16,500.00', 16500, 'UNPAID', 'service + parts']
    ].map((x, i) => ({r: i + 2, no: String(i + 1), project: x[0], ref: x[1], contract: x[2], bal0: x[3], paid: 0, bal: x[3], status: x[4], remarks: x[5]}));
    const unitLog = [{r: 2, date: add(-2), item: 'HSN18ISB/HSU18ISB', dir: 'OUT', qty: 2, party: 'Kim Family Residence', ref: '', by: 'Ladie', notes: ''},
      {r: 3, date: add(-5), item: 'HSN12ISB/HSU12ISB', dir: 'IN', qty: 3, party: 'LG Electronics Philippines', ref: 'PO 2026-08', by: 'Ladie', notes: ''}];
    const partLog = [{r: 2, date: add(-1), item: 'Capacitor 35uF', dir: 'OUT', qty: 1, party: 'Pampanga Dental Clinic', ref: '', by: 'Ladie', notes: ''}];
    const D = {ok: true, me: null, sheetUrl: 'https://docs.google.com/spreadsheets/', jobs: ['Install', 'Service (AS)', 'Cleaning', 'Survey', 'Delivery', 'Pull-out', 'Meeting', 'Other'],
      statuses: ['Scheduled', 'Confirmed', 'Done', 'Moved', 'Cancelled'], methods: ['Cash', 'Bank', 'GCash', 'Check', 'Other'],
      units, parts, unitLog, partLog, schedule: sched, receivables, payments: [], customers, quotes: [], log: [], arTotal: null};
    recalc(D);
    return D;
  }

  function recalc(D) {
    [['units', 'unitLog'], ['parts', 'partLog']].forEach(([k, l]) => D[k].forEach(x => {
      x.now = x.start + D[l].filter(m => m.item === x.item).reduce((s, m) => s + (m.dir === 'IN' ? m.qty : -m.qty), 0);
    }));
    D.receivables.forEach(r => {
      r.paid = D.payments.filter(p => p.project === r.project).reduce((s, p) => s + p.amount, 0);
      r.bal = r.bal0 - r.paid;
      r.status = r.bal <= 0 ? 'PAID' : r.paid > 0 || /PARTIAL/.test(r.status) ? 'PARTIAL' : 'UNPAID';
    });
    D.arTotal = D.receivables.reduce((s, r) => s + r.bal, 0);
  }

  let DB = null;
  function db() {
    if (!DB) { try { DB = JSON.parse(localStorage.getItem('brz_demo_db') || 'null'); } catch (e) { DB = null; } }
    if (!DB || DB.day !== T) DB = Object.assign(fresh(), {day: T});
    return DB;
  }
  function persist() { try { localStorage.setItem('brz_demo_db', JSON.stringify(DB)); } catch (e) { } }
  function log(me, action, details) {
    const now = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Manila', dateStyle: 'short', timeStyle: 'short'}).format(new Date());
    db().log.unshift({time: now, who: me.name, action, details});
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const err = m => { throw new Error(m); };

  async function call(a, b, S) {
    await wait(a === 'boot' ? 350 : 250);
    if (a === 'login') { const u = USERS[b.pin]; return u ? {ok: true, t: 'demo-' + b.pin, me: u} : {ok: false, msg: 'Wrong PIN. Please try again.'}; }
    const me = USERS[String(S.t).replace('demo-', '')];
    if (!me) err('Please log in again');
    const D = db();
    if (a === 'boot') { D.me = me; return JSON.parse(JSON.stringify(D)); }
    if (a === 'logout') return {ok: true};
    if (a === 'addJob') {
      const j = b.job; if (!j.date || !j.customer) err('Date and customer are needed');
      D.schedule.push(Object.assign({r: ++seq, status: 'Scheduled', by: me.name, id: 'DEMO-S-' + seq}, j));
      log(me, 'New job', `${j.date} ${j.time || ''} · ${j.job} · ${j.customer}`);
    } else if (a === 'updateJob') {
      const j = D.schedule.find(x => x.r === b.r) || err('Job not found'); Object.assign(j, b.set);
      log(me, 'Job updated', j.customer + ' → ' + Object.entries(b.set).map(e => e.join(': ')).join(', '));
    } else if (a === 'stockMove') {
      const m = b.move, L = m.kind === 'part' ? D.partLog : D.unitLog;
      L.push({r: ++seq, date: m.date, item: m.item, dir: m.dir, qty: +m.qty, party: m.party, ref: m.ref, by: me.name, notes: m.notes});
      log(me, (m.kind === 'part' ? 'Part ' : 'Unit ') + m.dir, `${m.qty} × ${m.item}${m.party ? ' · ' + m.party : ''}`);
    } else if (a === 'payment') {
      const p = b.pay; D.payments.push({r: ++seq, date: p.date, project: p.project, amount: +p.amount, method: p.method, by: p.by, notes: p.notes});
      log(me, 'Payment', `₱${(+p.amount).toLocaleString('en-US', {minimumFractionDigits: 2})} · ${p.project} · ${p.method}`);
    } else if (a === 'newReceivable') {
      const x = b.rec; if (D.receivables.some(r => r.project === x.project)) err('This name already exists');
      D.receivables.push({r: ++seq, no: String(D.receivables.length + 1), project: x.project, ref: x.ref, contract: x.contract, bal0: +x.balance, paid: 0, bal: +x.balance, status: 'UNPAID', remarks: x.remarks});
      log(me, 'New receivable', x.project);
    } else if (a === 'cleaningDone') {
      const c = D.customers.find(x => x.r === b.r) || err('Not found'); c.lc = b.date;
      const d = new Date(b.date + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 6); c.nc = d.toISOString().slice(0, 10);
      log(me, 'Cleaning done', `${c.c} · ${c.m}`);
    } else if (a === 'addInstall') {
      const x = b.inst; D.customers.push({r: ++seq, c: x.customer, co: x.company, l: x.location, m: x.model, d: x.desc, q: x.qty, isn: x.isn, osn: x.osn, inst: x.installed, nc: ''});
      log(me, 'New installation', `${x.customer} · ${x.model}`);
    } else if (a === 'saveQuote') {
      const q = b.quote; let ex = q.no && D.quotes.find(x => x.no === q.no);
      if (!ex) { q.no = 'Q-' + T.slice(0, 4) + '-' + String(D.quotes.length + 1).padStart(4, '0'); ex = {r: ++seq, no: q.no, status: 'Draft'}; D.quotes.push(ex); }
      Object.assign(ex, {date: q.date, customer: q.customer, project: q.project, total: q.total, by: q.by, data: q});
      log(me, 'Quotation saved', q.no + ' · ' + q.customer);
      recalc(D); persist();
      return {ok: true, no: q.no};
    } else if (a === 'quoteStatus') {
      const q = D.quotes.find(x => x.no === b.no) || err('Not found'); q.status = b.status;
      log(me, 'Quotation ' + b.status, q.no);
    } else err('unknown action');
    recalc(D); persist();
    return {ok: true};
  }
  window.BRZ_DEMO = {call};
})();
