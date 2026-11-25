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
    sched.push({r: sched.length + 2, date: '', time: '', job: 'Service (AS)', customer: 'Golden Star Office', location: 'Mabalacat', units: '1 × ceiling cassette', tech: '', status: 'Pending', notes: 'Complain: Not cooling / waiting for PCB (LG order)', by: 'Ladie', id: 'DEMO-S-P1'});
    sched.push({r: sched.length + 2, date: add(-4), time: '9:00 AM', job: 'Cleaning', customer: 'Green Leaf Cafe', location: 'Nepo Mart', units: '3 units', tech: 'Rommel', status: 'Done', notes: 'Work Done: General cleaning 3 units', by: 'Ladie', id: 'DEMO-S-C1', charge: 2400, paid: 1000, paidDate: add(-3), payRef: 'Cash OR 1201', pay: 'Partial'});
    Object.assign(sched.find(j => j.customer === 'Pampanga Dental Clinic'), {notes: 'Complain: Water leak / Work Done: Flush out drain', charge: 1500, pay: 'Unpaid'});
    const receivables = [
      ['Blue Lagoon Hotel P.O 1021', 'Q-2026-0003', '480,000.00', 240000, 'PARTIAL', '50% upon completion'], ['Golden Star Office P.O 77', '', '196,980.00', 19698, 'PARTIAL', '10% retention'],
      ['Sunrise Bakery', 'Q-2026-0005', '43,498.00', 43498, 'UNPAID', 'due on install'], ['Pampanga Dental Clinic', '', '16,500.00', 16500, 'UNPAID', 'service + parts']
    ].map((x, i) => ({r: i + 2, no: String(i + 1), project: x[0], ref: x[1], contract: x[2], bal0: x[3], paid: 0, bal: x[3], status: x[4], remarks: x[5]}));
    const unitLog = [{r: 2, date: add(-2), item: 'HSN18ISB/HSU18ISB', dir: 'OUT', qty: 2, party: 'Kim Family Residence', ref: '', by: 'Ladie', notes: ''},
      {r: 3, date: add(-5), item: 'HSN12ISB/HSU12ISB', dir: 'IN', qty: 3, party: 'LG Electronics Philippines', ref: 'PO 2026-08', by: 'Ladie', notes: ''}];
    const partLog = [{r: 2, date: add(-1), item: 'Capacitor 35uF', dir: 'OUT', qty: 1, party: 'Pampanga Dental Clinic', ref: '', by: 'Ladie', notes: ''}];
    const D = {ok: true, me: null, sheetUrl: 'https://docs.google.com/spreadsheets/', jobs: ['Install', 'Service (AS)', 'Cleaning', 'Survey', 'Delivery', 'Pull-out', 'Meeting', 'Other'],
      statuses: ['Scheduled', 'Confirmed', 'Pending', 'Done', 'Moved', 'Cancelled'], methods: ['Cash', 'Bank', 'GCash', 'Check', 'Other'],
      unitRes: [{r: 2, id: 'DEMO-R-1', date: add(-20), item: 'APNQ36GR5A4/AUUQ36GH4', qty: 2, party: 'Blue Lagoon Hotel / New wing', ref: 'PO 1021', status: 'Reserved', by: 'Ladie', notes: ''},
        {r: 3, id: 'DEMO-R-2', date: add(-3), item: 'ZTNQ18GTLA0/ZUAB1', qty: 1, party: 'Golden Star Office', ref: '', status: 'Reserved', by: 'Ladie', notes: 'waiting for LG delivery'}],
      orders: [{r: 2, id: 'DEMO-O-1', status: 'Ordered', po: '2026-07', date: add(-30), supplier: 'LG Electronics Philippines Inc.', kind: 'Unit', item: 'ZTNQ18GTLA0/ZUAB1', qty: 2, got: 0, rate: 61360, for: 'Golden Star Office', notes: ''},
        {r: 3, id: 'DEMO-O-2', status: 'Planned', po: '', date: add(-2), supplier: 'LG Electronics Philippines Inc.', kind: 'Unit', item: 'HSN24ISB/HSU24ISB', qty: 4, got: 0, rate: 32174, for: 'Blue Lagoon Hotel / New wing', notes: 'SRP less 45%'},
        {r: 4, id: 'DEMO-O-3', status: 'Received', po: 'CSAS 2026-07', date: add(-10), supplier: 'Cool Station Airconditioning Services', kind: 'Unit', item: 'HSN12ISB/HSU12ISB', qty: 1, got: 1, rate: 23000, for: 'Mr. Daniel Cruz', notes: ''}],
      other: [{r: 2, id: 'DEMO-X-1', cat: 'LG appliance', item: 'WF-S100DB', desc: 'Washing machine (top load)', sn: 'DEMO604', qty: 1, cost: 16737.72, srp: 24995, loc: 'Warehouse', cust: '', status: 'In stock', notes: ''},
        {r: 3, id: 'DEMO-X-2', cat: 'Second-hand unit', item: 'HS09IV', desc: 'Indoor + outdoor', sn: '', qty: 2, cost: null, srp: null, loc: 'Warehouse', cust: '', status: 'In stock', notes: ''},
        {r: 4, id: 'DEMO-X-3', cat: 'Customer unit (repair)', item: 'HS12IS', desc: 'Indoor + outdoor', sn: '', qty: 2, cost: null, srp: null, loc: 'Workshop', cust: 'Sunrise Bakery', status: 'For repair', notes: ''}],
      issues: [{r: 2, id: 'DEMO-I-1', date: add(-40), pn: 'EAE43285407', item: 'Capacitor 35uF', qty: 1, type: 'Missing', since: '', status: 'Open', notes: 'not found at count'}],
      payables: [{r: 2, id: 'DEMO-Y-1', due: 'Dec 7, 2026', name: 'LG Electronics Philippines Inc.', amount: 150000, status: 'Open', notes: 'Demo'},
        {r: 3, id: 'DEMO-Y-2', due: '', name: 'SALARY OCTOBER (demo)', amount: 50000, status: 'Open', notes: ''}],
      cash: [{r: 2, id: 'DEMO-C-1', date: add(-3), hand: 50000, bri: 300000, good: 80000, by: 'Jheena', notes: 'Demo'}],
      oldPayments: [],
      suppliers: [{r: 2, id: 'DEMO-V-1', name: 'LG Electronics Philippines Inc.', supplies: 'LG units and parts', contact: 'Demo contact', phone: '', email: '', addr: 'Pasig City', notes: ''}],
      serials: [{r: 2, id: 'DEMO-N-1', status: 'In stock', unit: 'APNQ36GR5A4/AUUQ36GH4', model: 'APNQ36GR5A4/AUUQ36GH4', isn: 'DEMO207KC1', osn: 'DEMO210HA1', po: '22', din: '2022-12-01', cost: 75399},
        {r: 3, id: 'DEMO-N-2', status: 'In stock', unit: 'APNQ36GR5A4/AUUQ36GH4', model: 'APNQ36GR5A4/AUUQ36GH4', isn: 'DEMO207KC2', osn: 'DEMO210HA2', po: '22', din: '2022-12-01', cost: 75399},
        {r: 4, id: 'DEMO-N-3', status: 'Installed', unit: 'HSN12ISB/HSU12ISB', model: 'HSN12ISB/HSU12ISB', isn: 'DEMO607HA3', osn: 'DEMO607HB3', po: 'CSAS 2026-07', cost: 26000, cust: 'Mr. Daniel Cruz', idate: add(-1), price: 37000, notes: 'Delivered, installed and start up'},
        {r: 5, id: 'DEMO-N-4', status: 'Other', model: 'HSU18IBA', osn: 'DEMO405HA4', cust: 'Demo project on hold', notes: 'Outdoor only, not our stock'}],
      prices: [{r: 2, item: 'Coppertube 1/4', knp: 2297, hisys: 1953.13, notes: ''}, {r: 3, item: 'Rubber Insulation 1/4', knp: 301, hisys: 344.86, notes: ''}],
      units, parts, unitLog, partLog, schedule: sched, receivables, payments: [], customers, quotes: [], log: [], arTotal: null, ask: [], know: [], aiOnline: true};
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
    DB.ask = DB.ask || []; DB.know = DB.know || []; DB.needs = DB.needs || [{id: 'n1', time: T + ' 09:12', who: 'Ladie', q: 'How much is aircon cleaning for a 1.5hp split type?', missing: 'Cleaning price list (per unit type / HP)', rating: ''}]; DB.aiOnline = true;
    return DB;
  }
  function persist() { try { localStorage.setItem('brz_demo_db', JSON.stringify(DB)); } catch (e) { } }
  function log(me, action, details) {
    const now = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Manila', dateStyle: 'short', timeStyle: 'short'}).format(new Date());
    db().log.unshift({time: now, who: me.name, action, details});
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const err = m => { throw new Error(m); };
  const demoPay = (ch, paid, cur) => cur === 'No charge' && !(ch > 0) ? 'No charge' : !(ch > 0) ? '' : (paid || 0) >= ch - 0.005 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid';

  async function call(a, b, S) {
    await wait(a === 'boot' ? 350 : 250);
    if (a === 'login') { const u = USERS[b.pin]; return u ? {ok: true, t: 'demo-' + b.pin, me: u} : {ok: false, msg: 'Wrong PIN. Please try again.'}; }
    const me = USERS[String(S.t).replace('demo-', '')];
    if (!me) err('Please log in again');
    const D = db();
    if (a === 'boot') { D.me = me; return JSON.parse(JSON.stringify(D)); }
    if (a === 'logout') return {ok: true};
    if (a === 'hist') {  // fake service history (AS Summary Report)
      if (!D.hist) { D.hist = [
        {r: 2, id: 'DEMO-H-1', cust: 'Sample Grill', date: '2025-03-02', name: 'Sample Grill', loc: 'VIP 1', svc: 'Cleaning', find: 'Dirty', model: 'Split Type', work: '3pcs: General Cleaning Indoor and Outdoor', tech: 'Romeo, Joseph', qty: '3', amount: '1500', total: '4500', pay: 'PAID 03.05.25', src: 'Demo'},
        {r: 3, id: 'DEMO-H-2', cust: 'Sample Grill', date: '2025-08-10', name: 'Sample Grill', loc: 'Kitchen', svc: 'Water Leaking', find: 'Drain Clogging', model: 'Ceiling Cassette', work: '1pc: Flush out drain', tech: 'Aldrin, Eric', pay: 'FREE CHARGE', src: 'Demo'},
        {r: 4, id: 'DEMO-H-3', cust: 'Sample Tower', note: 'TOWER 1 — ROOM 301', head: '1', src: 'Demo'},
        {r: 5, id: 'DEMO-H-4', cust: 'Sample Tower', grp: 'TOWER 1 — ROOM 301', date: '2026-10-21', name: 'Room 301', svc: 'Not Cooling', find: 'Lack of Freon', model: '1 Way Ceiling Cassette', work: '1pc: Charge Freon', tech: 'Jhonrel, Edz', qty: '1', amount: '2500', total: '2500', pay: 'UNPAID', src: 'Demo'}]; persist(); }
      const H = D.hist;
      if (b.c) return {ok: true, c: b.c, rows: JSON.parse(JSON.stringify(H.filter(x => x.cust === b.c)))};
      const m = {}; H.forEach(x => { const g = m[x.cust] = m[x.cust] || {c: x.cust, n: 0, last: '', names: []}; if (x.head) return; g.n++; if (x.date > g.last) g.last = x.date; if (x.name && !g.names.includes(x.name)) g.names.push(x.name); });
      return {ok: true, list: Object.values(m)};
    }
    if (a === 'ask') {
      const id = 'A' + (++seq); D.ask.push({id, who: me.name, time: new Date().toLocaleString('sv-SE', {timeZone: 'Asia/Manila'}).slice(0, 16), q: b.q, status: 'waiting', a: ''});
      persist(); return {ok: true, id};
    }
    if (a === 'askGet') {
      D.ask.forEach(x => {
        if (x.status !== 'answered' && b.ids.includes(x.id)) {
          x.st = (x.st || 0) + 1;
          if (x.st === 1) x.status = 'thinking@1';
          if (x.st >= 3) { x.status = 'answered'; x.a = demoAnswer(x.q, D); }
        }
      });
      persist(); return {ok: true, items: D.ask.filter(x => b.ids.includes(x.id)), aiOnline: true};
    }
    if (a === 'kNote' || a === 'kUpload') {
      D.know.unshift({id: 'K' + (++seq), date: T, who: me.name, title: b.title || (b.text || '').slice(0, 50) || b.name, type: a === 'kNote' ? 'Note' : 'File',
        text: a === 'kNote' ? b.text : (b.note ? 'Note: ' + b.note + '\n' : '') + '(demo: file text would appear here)', url: ''});
      log(me, 'Material added', b.title || b.name || ''); persist(); return {ok: true, chars: a === 'kUpload' ? 1200 : 0};
    }
    if (a === 'jobPhoto') { const j = D.schedule.find(x => x.r === b.r); if (j) j.photos = 'https://drive.google.com/'; persist(); return {ok: true}; }
    if (a === 'askRate') { const x = D.ask.find(k => k.id === b.id); if (x) x.rating = b.good ? 'good' : 'bad: ' + (b.why || ''); if (!b.good && x) D.needs.unshift({id: x.id, time: x.time, who: me.name, q: x.q, rating: x.rating, missing: ''}); persist(); return {ok: true}; }
    if (a === 'kHide') { D.know = D.know.filter(k => k.id !== b.id); persist(); return {ok: true}; }
    if (a === 'jobPay') {
      const j = D.schedule.find(x => x.r === b.r) || err('Job not found');
      if (!(+b.amount > 0)) err('Write the amount received'); if (!(j.charge > 0)) err('Set the charge first');
      j.paid = Math.round(((+j.paid || 0) + +b.amount) * 100) / 100; j.paidDate = b.date; j.pay = demoPay(j.charge, j.paid, '');
      const add = [b.method, b.ref].filter(Boolean).join(' '); if (add) j.payRef = [j.payRef, add].filter(Boolean).join(' / ');
      log(me, 'Service payment', j.customer + ' · ₱' + b.amount); persist(); return {ok: true, status: j.pay};
    }
    if (a === 'addJob') {
      const j = Object.assign({}, b.job); if (!j.customer) err('Customer is needed'); if (!j.date && j.status !== 'Pending') err('Date is needed (or choose Pending)');
      if (j.date === undefined) j.date = '';
      if (j.charge !== undefined) { j.charge = j.charge === '' ? null : +j.charge; j.pay = demoPay(j.charge, 0, ''); }
      D.schedule.push(Object.assign({r: ++seq, status: 'Scheduled', by: me.name, id: 'DEMO-S-' + seq}, j));
      log(me, 'New job', `${j.date} ${j.time || ''} · ${j.job} · ${j.customer}`);
    } else if (a === 'updateJob') {
      const j = D.schedule.find(x => x.r === b.r) || err('Job not found'), st = Object.assign({}, b.set);
      const nd = st.date !== undefined ? st.date : j.date, ns = st.status || j.status;
      if (!nd && ns !== 'Pending' && ns !== 'Cancelled') err('Choose a date (or keep it Pending)');
      if (st.charge !== undefined || st.pay) {
        const ch = st.charge !== undefined ? (st.charge === '' ? null : +st.charge) : j.charge;
        st.pay = demoPay(ch, j.paid, st.pay ? (st.pay === 'No charge' ? 'No charge' : '') : j.pay); st.charge = ch;
      }
      Object.assign(j, st);
      log(me, 'Job updated', j.customer + ' → ' + Object.entries(b.set).map(e => e.join(': ')).join(', '));
    } else if (a === 'stockMove') {
      const m = b.move, L = m.kind === 'part' ? D.partLog : D.unitLog;
      L.push({r: ++seq, date: m.date, item: m.item, dir: m.dir, qty: +m.qty, party: m.party, ref: m.ref, by: me.name, notes: m.notes});
      log(me, (m.kind === 'part' ? 'Part ' : 'Unit ') + m.dir, `${m.qty} × ${m.item}${m.party ? ' · ' + m.party : ''}`);
    } else if (a === 'resAdd') {
      const x = b.res; D.unitRes = D.unitRes || [];
      D.unitRes.push({r: ++seq, id: 'DEMO-R-' + seq, date: x.date, item: x.item, qty: +x.qty, party: x.party, ref: x.ref, status: 'Reserved', by: me.name, notes: x.notes});
      log(me, 'Unit reserved', `${x.qty} × ${x.item} · ${x.party}`);
    } else if (a === 'resSet') {
      const x = (D.unitRes || []).find(k => k.r === b.r && k.id === b.id) || err('Not found. Please refresh.');
      if (x.status !== 'Reserved') err('Already ' + x.status);
      if (b.status === 'Installed') D.unitLog.push({r: ++seq, date: b.date, item: x.item, dir: 'OUT', qty: b.qty, party: x.party, ref: x.ref, by: me.name, notes: 'Installed (reserved ' + x.id + ')'});
      if (b.qty < x.qty) { x.qty -= b.qty; D.unitRes.push(Object.assign({}, x, {r: ++seq, id: 'DEMO-R-' + seq, qty: b.qty, status: b.status, done: b.date})); } else { x.status = b.status; x.done = b.date; }
      log(me, b.status === 'Installed' ? 'Reserved unit installed' : 'Reservation cancelled', `${b.qty} × ${x.item} · ${x.party}`);
    } else if (a === 'recSave') {
      const L = D[b.k] = D[b.k] || [];
      if (b.r) { const x = L.find(k => k.r === b.r && k.id === b.id) || err('Not found. Please refresh.'); Object.assign(x, b.set); ['qty', 'cost', 'srp', 'rate', 'amount', 'hand', 'bri', 'good'].forEach(n => { if (x[n] !== undefined && x[n] !== '' && x[n] !== null) x[n] = +x[n]; }); }
      else { const x = Object.assign({r: ++seq, id: 'DEMO-' + b.k + '-' + seq, got: 0}, b.set); ['qty', 'cost', 'srp', 'rate', 'amount', 'hand', 'bri', 'good'].forEach(n => { if (x[n] !== undefined && x[n] !== '') x[n] = +x[n]; }); L.push(x); }
      log(me, (b.r ? 'Updated · ' : 'Added · ') + b.k, b.set.item || b.set.name || '');
    } else if (a === 'orderRecv') {
      const o = (D.orders || []).find(k => k.r === b.r && k.id === b.id) || err('Not found. Please refresh.');
      o.got = (+o.got || 0) + b.qty; o.status = o.got >= o.qty ? 'Received' : 'Ordered';
      const list = /part/i.test(o.kind) ? D.parts : D.units, hit = list.find(x => x.item === o.item);
      const skip = !!b.noStock && /unit|part/i.test(o.kind);
      if (hit && !skip && /unit|part/i.test(o.kind)) (/part/i.test(o.kind) ? D.partLog : D.unitLog).push({r: ++seq, date: b.date, item: o.item, dir: 'IN', qty: b.qty, party: o.supplier, ref: o.po, by: me.name, notes: 'Received (order)'});
      log(me, 'Order received', `${b.qty} × ${o.item}` + (skip ? ' (stock not changed)' : '')); recalc(D); persist(); return {ok: true, stock: hit && !skip ? o.item : '', noStock: skip};
    } else if (a === 'serialSold') {
      const x = (D.serials || []).find(k => k.r === b.r && k.id === b.id) || err('Not found. Please refresh.');
      if (x.status !== 'In stock') err('This unit is ' + x.status + ' already');
      if (!b.cust) err('Write the customer');
      Object.assign(x, {status: 'Installed', cust: b.cust, idate: b.date, price: b.price === '' ? x.price : +b.price, notes: [x.notes, b.notes].filter(Boolean).join(' · ')});
      if (b.out && x.unit) D.unitLog.push({r: ++seq, date: b.date, item: x.unit, dir: 'OUT', qty: 1, party: b.cust, ref: x.po || '', by: me.name, notes: 'Installed · SN ' + [x.isn, x.osn].filter(Boolean).join(' / ')});
      log(me, 'Unit installed (serial)', x.model + ' · ' + b.cust);
    } else if (a === 'itemPrice') {
      const L = b.kind === 'part' ? D.parts : D.units, x = L.find(k => k.r === b.r && k.item === b.item) || err('Not found. Please refresh.');
      ['srp', 'price', 'cost'].forEach(k => { if (b[k] !== undefined && b[k] !== '') x[k] = +String(b[k]).replace(/,/g, ''); });
      log(me, 'Price changed', b.item);
    } else if (a === 'addItem') {
      const x = b.item, L = x.kind === 'part' ? D.parts : D.units;
      if (L.some(k => k.item === x.item)) err('Already in the list: ' + x.item);
      L.push(x.kind === 'part' ? {r: ++seq, item: x.item, pn: x.pn, group: x.group, start: 0, now: 0, price: +x.price || null, cost: +x.cost || null, notes: x.notes}
        : {r: ++seq, item: x.item, type: x.type, hp: x.hp, start: 0, now: 0, srp: +x.srp || null, cost: +x.cost || null, supplier: x.supplier, notes: x.notes});
      log(me, 'New item in list', x.item);
    } else if (a === 'payment') {
      const p = b.pay; D.payments.push({r: ++seq, date: p.date, project: p.project, amount: +p.amount, method: p.method, by: p.by, notes: p.notes});
      log(me, 'Payment', `₱${(+p.amount).toLocaleString('en-US', {minimumFractionDigits: 2})} · ${p.project} · ${p.method}`);
    } else if (a === 'newReceivable') {
      const x = b.rec; if (D.receivables.some(r => r.project === x.project)) err('This name already exists');
      D.receivables.push({r: ++seq, no: String(D.receivables.length + 1), project: x.project, ref: x.ref, contract: x.contract, bal0: +x.balance, paid: 0, bal: +x.balance, status: 'UNPAID', remarks: x.remarks});
      log(me, 'New receivable', x.project);
    } else if (a === 'cleaningDone') {
      const many = Array.isArray(b.units), list = many ? b.units : [{r: b.r}], bad = [];
      const d = new Date(b.date + 'T00:00:00Z'); d.setUTCMonth(d.getUTCMonth() + 6);
      const okC = list.map(u => { const c = D.customers.find(x => x.r === u.r); if (!c) { bad.push(u.r); return null; } c.lc = b.date; c.nc = d.toISOString().slice(0, 10); return c; }).filter(Boolean);
      if (!okC.length) err('Not found');
      log(me, 'Cleaning done', many ? `${okC[0].c} · ${okC.length} units` : `${okC[0].c} · ${okC[0].m}`);
      if (many) { recalc(D); persist(); return {ok: true, done: okC.length, bad}; }
    } else if (a === 'addInstall') {
      const x = b.inst; D.customers.push({r: ++seq, c: x.customer, co: x.company, l: x.location, m: x.model, d: x.desc, q: x.qty, isn: x.isn, osn: x.osn, inst: x.installed, nc: ''});
      log(me, 'New installation', `${x.customer} · ${x.model}`);
    } else if (a === 'saveQuote') {
      const q = b.quote; let ex = q.no && D.quotes.find(x => x.no === q.no);
      const inv = q.type === 'invoice', pre = inv ? 'INV' : 'Q';
      if (!ex) { q.no = pre + '-' + T.slice(0, 4) + '-' + String(D.quotes.filter(x => (x.type || 'quote') === (q.type || 'quote')).length + 1).padStart(4, '0'); ex = {r: ++seq, no: q.no, type: q.type || 'quote', status: inv ? 'Unpaid' : 'Draft'}; D.quotes.push(ex); }
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
  function demoAnswer(q, D) {
    const t = q.toLowerCase();
    const u = D.units.find(x => t.includes(x.item.slice(0, 5).toLowerCase()));
    if (u) return `We have **${u.now}** unit(s) of ${u.item} (${u.type} ${u.hp}) in stock now. SRP is ₱${u.srp.toLocaleString('en-US')}.\n(Source: UNITS tab, demo data)`;
    const r = D.receivables.find(x => t.includes(x.project.split(' ')[0].toLowerCase()));
    if (r) return `${r.project} still owes **₱${r.bal.toLocaleString('en-US', {minimumFractionDigits: 2})}** (${r.status}). ${r.remarks || ''}\n(Source: RECEIVABLES tab, demo data)`;
    return 'This is the DEMO. In the real site, GPT on Sir Kim\'s PC reads the whole office sheet and the uploaded materials, then answers here in 20–60 seconds.';
  }
  window.BRZ_DEMO = {call};
})();
