/* BRIZAIR Office — web app (no build step). Data lives in the Google Sheet; server = Apps Script (see apps_script/Code.gs). */
(function () {
  'use strict';
  const API = (window.BRZ_CONFIG || {}).api || '';
  const DEMO = !API || /[?&]demo\b/.test(location.search);
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full / blocked */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  const KEY = DEMO ? 'brz_demo_' : 'brz_';
  const S = {
    t: LS.get(KEY + 't', ''), me: LS.get(KEY + 'me', null), D: LS.get(KEY + 'data', null),
    route: '', sync: 'ok', calYM: null, calSel: null, calMode: LS.get('brz_calmode', 'cal'),
    stockKind: 'unit', stockFilter: 'all', q: {}, money: 'ar', rep: {kind: 'unit', ym: null, all: false}
  };

  // ───────── icons ─────────
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cal: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.6c2.4.3 4 1.9 4.5 4.6"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    peso: '<path d="M7 20V4h6a4.5 4.5 0 0 1 0 9H7M4 8h15M4 11h15"/>',
    doc: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8.5 13h7M8.5 17h7"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    inbox: '<path d="M12 3v11m0 0-4-4m4 4 4-4"/><path d="M3 14v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    outbox: '<path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M3 14v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.6-.6-.6-2.6z"/>',
    spark: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6z"/>',
    sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    log: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5V14M12 17.5v.01"/>',
    out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    chat: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 10h8M8 13h5"/>',
    book: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3"/>',
    upload: '<path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.9L3 9M4 13a8 8 0 0 0 14.9 3.9L21 15"/><path d="M3 4v5h5M21 20v-5h-5"/>'
  };
  const lang = () => (window.BRZ_I18N ? window.BRZ_I18N.lang : 'en');
  const tr = t => (window.BRZ_I18N ? window.BRZ_I18N.tr(t) : t);
  const ic = (n, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  // ───────── utils ─────────
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const peso = (n, d) => (n == null || isNaN(n)) ? '-' : '₱' + Number(n).toLocaleString('en-US', {minimumFractionDigits: d === 0 ? 0 : 2, maximumFractionDigits: d === 0 ? 0 : 2});
  const money = n => Number(n || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Manila'}).format(new Date());
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const dObj = iso => new Date(iso + 'T00:00:00Z');
  const fmtD = (iso, o) => iso ? dObj(iso).toLocaleDateString('en-US', Object.assign({timeZone: 'UTC', month: 'short', day: 'numeric'}, o || {})) : '';
  const fmtLong = iso => fmtD(iso, {weekday: 'short', year: 'numeric'});
  const fmtMDY = iso => iso ? iso.slice(5, 7) + '/' + iso.slice(8, 10) + '/' + iso.slice(0, 4) : '';
  const initials = n => String(n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const jobKey = j => String(j || 'Other').split(' ')[0];
  const lc = s => String(s || '').toLowerCase();
  const timeSort = t => { const m = String(t || '').match(/(\d{1,2})(?::(\d{2}))?\s*([ap])?/i); if (!m) return 9999; let h = +m[1] % 12; if (m[3] && /p/i.test(m[3])) h += 12; if (!m[3] && +m[1] < 7) h += 12; return h * 60 + (+m[2] || 0); };
  const greet = () => { const h = +new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Manila', hour: 'numeric', hour12: false}).format(new Date()); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

  function toast(msg, err, ms) {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms || (err ? 5000 : 2600));
  }

  // ───────── server ─────────
  async function call(a, body) {
    if (DEMO) return window.BRZ_DEMO.call(a, body || {}, S);
    let res, j;
    try {
      res = await fetch(API, {method: 'POST', body: JSON.stringify(Object.assign({a: a, t: S.t}, body || {}))});
    } catch (e) { throw new Error(navigator.onLine === false ? 'No internet. Please try again.' : 'Could not reach the server. Please try again.'); }
    try { j = await res.json(); } catch (e) { throw new Error('The server is busy. Please try again in a minute.'); }
    if (j.error === 'login') { logout(true); throw new Error('Please log in again'); }
    if (!j.ok) throw new Error(j.msg || j.error || 'Error');
    return j;
  }

  async function refresh(quiet) {
    setSync('busy');
    try {
      const d = await call('boot');
      S.D = d; S.me = d.me;
      LS.set(KEY + 'data', d); LS.set(KEY + 'me', d.me);
      setSync('ok');
      const ae = document.activeElement, main = $('#main');
      const typing = ae && main && main.contains(ae) && /INPUT|TEXTAREA|SELECT/.test(ae.tagName);
      if (S.route === 'quote' && S.qd && $('#q_items') && !S.forceRender) { /* keep the open editor as it is */ } else if (!typing) render();
      S.forceRender = false;
    } catch (e) {
      setSync('err');
      if (!quiet) toast('Could not load: ' + e.message, true);
      if (!S.D) render();
    }
  }

  function applyData(d) {
    if (!d || !d.ok) return false;
    const partial = Array.isArray(d.sections) && d.sections.length < 7 && S.D;
    S.D = partial ? Object.assign({}, S.D, d) : d;  // a save sends back only the sections it changed
    S.me = d.me || S.me;
    LS.set(KEY + 'data', d);
    setSync('ok');
    S._lastRefresh = Date.now();
    return true;
  }
  /** write → the server answers with fresh data in the same reply, so lists and totals are right at once */
  async function save(a, body, okMsg) {
    toast('Saving…', false, 60000);
    try {
      const r = await call(a, Object.assign({}, body, {withData: true}));
      closeSheet();
      if (applyData(r.data)) render(); else refresh(true);
      toast(okMsg || 'Saved ✓');
      return r;
    } catch (e) {
      toast(e.message, true);
      throw e;
    }
  }

  function setSync(s) {
    S.sync = s;
    const el = $('#sync');
    if (!el) return;
    el.className = 'sync ' + (s === 'busy' ? 'busy' : s === 'err' ? 'err' : '');
    $('span', el).textContent = s === 'busy' ? 'Updating…' : s === 'err' ? 'Offline – tap to retry' : 'Up to date';
  }

  function logout(silent) {
    if (!silent && S.t) call('logout').catch(() => {});
    S.t = ''; S.me = null; S.D = null;
    LS.del(KEY + 't'); LS.del(KEY + 'me'); LS.del(KEY + 'data');
    renderLogin();
  }

  // ───────── login ─────────
  function renderLogin() {
    document.body.innerHTML = `
      <div class="login"><div class="box">
        <div class="logo" style="justify-content:center"><span class="logo-mark">${logoSvg()}</span></div>
        <h1>BRIZAIR Office</h1>
        <p class="sub" style="margin:0">Enter your 6-digit PIN</p>
        ${DEMO ? '<p class="small" style="color:#7a5800;margin:8px 0 0">DEMO — PIN 111111 (Sir Kim), 222222 (Ladie), 333333 (Jheena)</p>' : ''}
        <div class="pinbox">${'<i></i>'.repeat(6)}</div>
        <div class="err" id="perr"></div>
        <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<span></span><button data-k="0">0</button><button data-k="del" aria-label="Delete">⌫</button></div>
      </div></div>`;
    let pin = '';
    const dots = () => $$('.pinbox i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
    const go = async () => {
      $('#perr').textContent = 'Checking…';
      try {
        const r = DEMO ? await window.BRZ_DEMO.call('login', {pin}, S) : await (await fetch(API, {method: 'POST', body: JSON.stringify({a: 'login', pin, device: navigator.userAgent})})).json();
        if (!r.ok) throw new Error(r.msg || 'Wrong PIN');
        S.t = r.t; S.me = r.me; LS.set(KEY + 't', r.t); LS.set(KEY + 'me', r.me);
        if (window.BRZ_I18N) window.BRZ_I18N.defaultFor(r.me.role);
        start();
        if (!LS.get('brz_seen_help', false)) setTimeout(() => ACT.help(), 600);
      } catch (e) {
        pin = ''; dots();
        const m = String(e.message || '');
        $('#perr').textContent = tr(/fetch|network|json|token/i.test(m) ? 'Could not reach the server. Please try again.' : (m || 'Wrong PIN'));
      }
    };
    $('.pad').addEventListener('click', e => {
      const k = e.target.closest('button'); if (!k) return;
      if (k.dataset.k === 'del') pin = pin.slice(0, -1); else if (pin.length < 6) pin += k.dataset.k;
      $('#perr').textContent = ''; dots();
      if (pin.length === 6) go();
    });
    document.onkeydown = e => {
      if (!$('.pad')) return;
      if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; dots(); if (pin.length === 6) go(); }
      if (e.key === 'Backspace') { pin = pin.slice(0, -1); dots(); }
    };
  }
  const logoSvg = () => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/></svg>';

  // ───────── shell ─────────
  const NAV = [
    ['home', 'Home', 'home'], ['ask', 'Ask GPT', 'chat'], ['schedule', 'Schedule', 'cal'], ['stock', 'Stock', 'box'], ['customers', 'Customers', 'users'],
    ['money', 'Money', 'peso'], ['materials', 'Materials for AI', 'book'], ['quotes', 'Quotes & Invoices', 'doc'], ['report', 'LG Monthly Report', 'chart'], ['activity', 'Activity', 'log']
  ];
  function shell() {
    document.body.innerHTML = `
      ${DEMO ? '<div class="demo-bar">DEMO — fake data. Nothing is saved to the real sheet.</div>' : ''}
      <header class="top">
        <div class="logo"><span class="logo-mark">${logoSvg()}</span>BRIZAIR <small>Office</small></div>
        <div class="grow"></div>
        <button class="sync" id="sync" data-act="refresh"><i class="dot"></i><span>Up to date</span></button>
        <button class="iconbtn" data-act="lang" aria-label="Language" title="Language"><b class="noi18n" style="font-size:13px">${lang() === 'ko' ? 'EN' : '한'}</b></button>
        <button class="iconbtn" data-act="help" aria-label="Help" title="Help">${ic('help')}</button>
        <button class="me" data-go="more"><span class="avatar">${esc(initials(S.me && S.me.name))}</span><span class="clip" style="max-width:90px">${esc(S.me ? S.me.name : '')}</span></button>
      </header>
      <div class="shell">
        <nav class="side">
          <button class="new" data-act="new">${ic('plus', 2.4)} New</button>
          ${NAV.map(n => `<button data-go="${n[0]}">${ic(n[2])}${n[1]}</button>`).join('')}
          <div class="sep"></div>
          <button data-act="openSheet">${ic('sheet')}Google Sheet</button>
          <button data-go="help">${ic('help')}Help</button>
          <button data-act="logout">${ic('out')}Log out</button>
        </nav>
        <main id="main"></main>
      </div>
      <button class="fab" data-act="new" aria-label="New">${ic('plus', 2.4)}</button>
      <nav class="tabs">
        ${[['home', 'Home', 'home'], ['schedule', 'Schedule', 'cal'], ['ask', 'Ask GPT', 'chat'], ['stock', 'Stock', 'box'], ['customers', 'Customers', 'users']]
          .map(n => `<button data-go="${n[0]}">${ic(n[2])}<span>${n[1]}</span></button>`).join('')}
      </nav>
      <div id="print"></div>`;
    setSync(S.sync);
  }

  // ───────── routing ─────────
  function go(r) { if (location.hash !== '#' + r) location.hash = r; else render(); }
  function render() {
    if (!S.t) return renderLogin();
    if (!$('#main')) shell();
    const h = decodeURIComponent(location.hash.slice(1)) || 'home';
    const [name, ...rest] = h.split('/');
    const arg = rest.join('/');
    S.route = name;
    document.body.dataset.route = name;
    const tabFor = {cust: 'customers', materials: 'ask'}[name] || name;
    $$('.me').forEach(b => b.classList.toggle('on', ['more', 'money', 'quotes', 'quote', 'report', 'activity', 'help'].includes(name)));
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.go === tabFor));
    $$('.side button[data-go]').forEach(b => b.classList.toggle('on', b.dataset.go === ({cust: 'customers', quote: 'quotes'}[name] || name)));
    const main = $('#main');
    if (!S.D) { main.innerHTML = '<div class="empty" style="padding:60px 0">Loading your office data…</div>'; return; }
    const V = VIEWS[name] || VIEWS.home;
    const keep = name === S._lastRoute ? window.scrollY : 0;
    main.innerHTML = V(arg);
    S._lastRoute = name;
    if (keep) window.scrollTo(0, keep); else window.scrollTo(0, 0);
    if (V.after) V.after(arg);
  }

  // ───────── data helpers ─────────
  const D = () => S.D || {};
  function jobsOn(iso) {
    return (D().schedule || []).filter(j => j.date === iso).sort((a, b) => timeSort(a.time) - timeSort(b.time));
  }
  function custGroups() {
    const m = new Map();
    (D().customers || []).forEach(c => {
      const k = c.c || '(no name)';
      if (!m.has(k)) m.set(k, {name: k, rows: [], locs: new Set(), co: new Set()});
      const g = m.get(k); g.rows.push(c); if (c.l) g.locs.add(c.l); if (c.co) g.co.add(c.co);
    });
    return m;
  }
  function stockList(kind) { return kind === 'part' ? (D().parts || []) : (D().units || []); }
  function stockLog(kind) { return kind === 'part' ? (D().partLog || []) : (D().unitLog || []); }
  // front panels sit in the UNITS tab but are not aircons
  const isPanel = x => /^PT-/i.test(x.item || '') || /front panel/i.test(x.type || '');
  // pieces on hand + money value (qty × cost, qty × selling price) of what is in stock now
  function stockSum(list, kind) {
    const r = {n: 0, panels: 0, cost: 0, sell: 0, noPrice: 0};
    list.forEach(x => {
      const q = Math.max(0, Number(x.now) || 0);
      if (!q) return;
      if (kind === 'unit' && isPanel(x)) r.panels += q; else r.n += q;
      const c = Number(x.cost) || 0, s = Number(kind === 'part' ? x.price : x.srp) || 0;
      if (!c || !s) r.noPrice += q;
      r.cost += q * c; r.sell += q * s;
    });
    return r;
  }
  function cleaningDue() {
    const t = today(), until = addDays(t, 30), from = addDays(t, -60);
    return (D().customers || []).filter(c => c.nc && c.nc >= from && c.nc <= until).sort((a, b) => a.nc.localeCompare(b.nc));
  }

  // ───────── what needs attention (home) ─────────
  function todos() {
    const t = today(), out = [];
    (D().schedule || []).filter(j => j.date && j.date < t && (j.status === 'Scheduled' || j.status === 'Confirmed'))
      .sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      .forEach(j => out.push({icon: 'cal', cls: 'c-amber', t: 'Update status: ' + j.customer, s: fmtD(j.date) + ' · ' + j.job + ' — still ' + j.status, act: `data-act="job" data-r="${j.r}"`}));
    (D().quotes || []).filter(q => (q.type || 'quote') === 'invoice' && /Unpaid|Partially/.test(q.status) && q.data && q.data.due && q.data.due < t)
      .forEach(q => out.push({icon: 'peso', cls: 'c-red', t: 'Invoice overdue: ' + q.customer, s: q.no + ' · due ' + fmtD(q.data.due) + ' · ' + peso(q.total), act: `data-go="quote/${esc(q.no)}"`}));
    (D().quotes || []).filter(q => (q.type || 'quote') === 'quote' && q.status === 'Sent' && q.date && q.date <= addDays(t, -3))
      .forEach(q => out.push({icon: 'doc', cls: 'c-blue', t: 'Follow up quotation: ' + q.customer, s: q.no + ' · sent ' + fmtD(q.date) + ' · ' + peso(q.total), act: `data-go="quote/${esc(q.no)}"`}));
    const booked = new Set((D().schedule || []).filter(j => j.date >= t && /clean/i.test(j.job) && j.status !== 'Cancelled').map(j => lc(j.customer)));
    const seen = new Set();
    (D().customers || []).filter(c => c.c && c.nc && c.nc >= addDays(t, -14) && c.nc <= addDays(t, 14) && !booked.has(lc(c.c)))
      .sort((a, b) => a.nc.localeCompare(b.nc)).forEach(c => {
        if (seen.has(c.c) || seen.size >= 4) return; seen.add(c.c);
        out.push({icon: 'spark', cls: 'c-violet', t: 'Book cleaning: ' + c.c, s: [c.l, c.m, 'due ' + fmtD(c.nc)].filter(Boolean).join(' · '), act: `data-act="bookClean" data-cust="${esc(c.c)}"`});
      });
    if (S.me && S.me.role === 'owner' && (D().needs || []).length)
      out.push({icon: 'book', cls: 'c-teal', t: 'GPT needs information (' + D().needs.length + ')', s: 'Questions GPT could not answer well', act: 'data-go="materials"'});
    return out;
  }
  function todoHtml() {
    const td = todos();
    if (!td.length) return `<div class="card"><div class="card-h"><h2>To do</h2></div><div class="empty">✓ Nothing waiting. Good job!</div></div>`;
    return `<div class="card"><div class="card-h"><h2>To do</h2><span class="muted small">${td.length}</span></div><div class="list">
      ${td.slice(0, 8).map(x => `<button class="item" ${x.act}><span class="qi ${x.cls}" style="width:36px;height:36px">${ic(x.icon)}</span>
        <span class="grow"><div class="t clip">${esc(x.t)}</div><div class="s clip">${esc(x.s)}</div></span>${ic('right')}</button>`).join('')}</div></div>`;
  }
  function ownerCard() {
    const t = today(), d = D();
    const jt = (d.schedule || []).filter(j => j.date === t && j.status !== 'Cancelled');
    const paidToday = (d.payments || []).filter(p => p.date === t).reduce((a, p) => a + p.amount, 0);
    const qWeek = (d.quotes || []).filter(q => (q.type || 'quote') === 'quote' && q.date >= addDays(t, -6));
    const askToday = (d.ask || []).filter(a => String(a.time).slice(0, 10) === t).length;
    return `<div class="card owner"><div class="card-h"><h2>Owner summary</h2><span class="muted small">${esc(fmtD(t, {weekday: 'short'}))}</span></div>
      <div class="osum">
        <div><span>Jobs done today</span><b>${jt.filter(j => j.status === 'Done').length} / ${jt.length}</b></div>
        <div><span>Paid today</span><b>${peso(paidToday, 0)}</b></div>
        <div><span>Unpaid total</span><b>${peso(d.arTotal, 0)}</b></div>
        <div><span>Quotations (7 days)</span><b>${qWeek.length} · ${peso(qWeek.reduce((a, q) => a + q.total, 0), 0)}</b></div>
        <div><span>GPT questions today</span><b>${askToday}</b></div>
        <div><span>Changes today</span><b>${(d.log || []).filter(l => String(l.time).slice(0, 10) === t).length}</b></div>
      </div></div>`;
  }

  // ───────── job card ─────────
  function jobRow(j, showDate) {
    const k = jobKey(j.job);
    return `<button class="item" data-act="job" data-r="${j.r}">
      <span class="jbar bar-${k}"></span>
      <span class="time">${showDate ? esc(fmtD(j.date)) + '<br>' : ''}${esc(j.time || '—')}</span>
      <span class="grow"><span class="jt j-${k}">${esc(j.job || 'Job')}</span>${j.photos ? ` <span class="muted" title="Photos">📷</span>` : ''}
        <div class="t clip">${esc(j.customer)}</div>
        <div class="s clip">${esc([j.location, j.units, j.tech].filter(Boolean).join(' · '))}</div></span>
      <span class="r"><span class="pill p-${esc(j.status)}">${esc(j.status)}</span></span>
    </button>`;
  }

  // ───────── views ─────────
  const VIEWS = {};

  VIEWS.home = () => {
    const t = today(), tm = addDays(t, 1);
    const tj = jobsOn(t).filter(j => j.status !== 'Cancelled'), mj = jobsOn(tm).filter(j => j.status !== 'Cancelled');
    const week = (D().schedule || []).filter(j => j.date > t && j.date <= addDays(t, 7) && j.status !== 'Cancelled').length;
    const unpaid = (D().receivables || []).filter(r => r.bal > 0);
    const arTotal = D().arTotal != null ? D().arTotal : unpaid.reduce((s, r) => s + r.bal, 0);
    const units = stockSum(D().units || [], 'unit').n;
    const name = S.me ? (/^sir\b/i.test(S.me.name) ? S.me.name : S.me.name.split(' ')[0]) : '';
    return `
      <h1>${greet()}, ${esc(name)}</h1>
      <p class="sub">${esc(fmtLong(t))}</p>
      <button class="askbar" data-go="ask">${ic('chat')}<span class="grow">Ask GPT anything — stock, prices, customers, schedule…</span>${ic('right')}</button>
      <div class="quick">
        <button data-act="newJob"><span class="qi c-blue">${ic('cal')}</span>New job</button>
        <button data-act="move" data-kind="unit"><span class="qi c-green">${ic('box')}</span>Unit in / out</button>
        <button data-act="move" data-kind="part"><span class="qi c-teal">${ic('wrench')}</span>Part in / out</button>
        <button data-act="pay"><span class="qi c-amber">${ic('peso')}</span>Payment</button>
        <button data-act="clean"><span class="qi c-violet">${ic('spark')}</span>Cleaning done</button>
        <button data-go="quote/new"><span class="qi c-red">${ic('doc')}</span>Quotation</button>
      </div>
      ${S.me && S.me.role === 'owner' ? ownerCard() : ''}
      ${todoHtml()}
      <div class="stats">
        <button class="stat" data-go="schedule"><span>Jobs today</span><b>${tj.length}</b></button>
        <button class="stat" data-go="schedule"><span>Next 7 days</span><b>${week}</b></button>
        <button class="stat" data-go="stock"><span>Units in stock</span><b>${units}</b></button>
        <button class="stat" data-go="money"><span>Unpaid balance</span><b style="font-size:20px">${peso(arTotal, 0)}</b></button>
      </div>
      <div class="grid2">
        <div class="card"><div class="card-h"><h2>Today</h2><button class="btn ghost sm" data-act="newJob" data-date="${t}">+ Add</button></div>
          <div class="list">${tj.map(j => jobRow(j)).join('') || '<div class="empty">No jobs today</div>'}</div></div>
        <div class="card"><div class="card-h"><h2>Tomorrow · ${esc(fmtD(tm, {weekday: 'short'}))}</h2><button class="btn ghost sm" data-act="newJob" data-date="${tm}">+ Add</button></div>
          <div class="list">${mj.map(j => jobRow(j)).join('') || '<div class="empty">No jobs tomorrow</div>'}</div></div>
      </div>
      <div class="grid2 mt">
        <div class="card"><div class="card-h"><h2>Recent activity</h2><button class="btn ghost sm" data-go="activity">See all</button></div>
          <div class="list">${(D().log || []).slice(0, 6).map(l => `<div class="item"><span class="avatar">${esc(initials(l.who))}</span>
            <span class="grow"><div class="t clip small">${esc(l.action)}</div><div class="s clip">${esc(l.details)}</div></span><span class="r muted small">${esc(String(l.time).slice(5))}</span></div>`).join('') || '<div class="empty">Changes made on this site will show here</div>'}</div></div>
      </div>`;
  };

  // schedule
  VIEWS.schedule = () => {
    const t = today();
    if (!S.calYM) S.calYM = t.slice(0, 7);
    if (!S.calSel) S.calSel = t;
    const [y, m] = S.calYM.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1)), startDow = first.getUTCDay();
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const title = first.toLocaleDateString('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'});
    const byDay = {};
    (D().schedule || []).forEach(j => { if (j.date && j.date.slice(0, 7) === S.calYM) (byDay[j.date] = byDay[j.date] || []).push(j); });
    Object.values(byDay).forEach(a => a.sort((p, q) => timeSort(p.time) - timeSort(q.time)));
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const dn = i - startDow + 1;
      const d = new Date(Date.UTC(y, m - 1, dn)), iso = d.toISOString().slice(0, 10);
      if (i >= 35 && dn > days) break;
      const js = byDay[iso] || [];
      const cls = [dn < 1 || dn > days ? 'out' : '', iso === t ? 'today' : '', iso === S.calSel ? 'sel' : ''].join(' ');
      cells += `<button class="${cls}" data-act="calDay" data-d="${iso}"><span class="d">${d.getUTCDate()}</span>
        <span class="dots">${js.slice(0, 4).map(j => `<i class="bar-${jobKey(j.job)}"></i>`).join('')}</span>
        ${js.slice(0, 3).map(j => `<span class="ev bar-${jobKey(j.job)} ${j.status === 'Cancelled' || j.status === 'Done' ? 'dim' : ''}">${esc(j.time ? j.time.replace(/\s?([AP])M/i, '$1').toLowerCase() + ' ' : '')}${esc(j.customer)}</span>`).join('')}
        ${js.length > 3 ? `<span class="more">+${js.length - 3} more</span>` : ''}</button>`;
    }
    const sel = jobsOn(S.calSel);
    const upcoming = (D().schedule || []).filter(j => j.date >= t).sort((a, b) => a.date.localeCompare(b.date) || timeSort(a.time) - timeSort(b.time));
    const recent = (D().schedule || []).filter(j => j.date < t).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15);
    return `
      <div class="row between wrap" style="margin-bottom:12px">
        <div class="seg"><button class="${S.calMode === 'cal' ? 'on' : ''}" data-act="calMode" data-m="cal">Calendar</button><button class="${S.calMode === 'list' ? 'on' : ''}" data-act="calMode" data-m="list">List</button></div>
        <button class="btn primary sm" data-act="newJob" data-date="${S.calMode === 'cal' ? S.calSel : t}">${ic('plus')} New job</button>
      </div>
      ${S.calMode === 'cal' ? `
      <div class="cal-h"><h1>${esc(title)}</h1>
        <button class="iconbtn" data-act="calNav" data-n="-1" aria-label="Previous month">${ic('left')}</button>
        <button class="btn sm" data-act="calToday">Today</button>
        <button class="iconbtn" data-act="calNav" data-n="1" aria-label="Next month">${ic('right')}</button></div>
      <div class="cal"><div class="cal-w">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div>${d}</div>`).join('')}</div><div class="cal-g">${cells}</div></div>
      <div class="day-h"><h2>${esc(fmtLong(S.calSel))}</h2><span class="muted small">${sel.length} job${sel.length === 1 ? '' : 's'}</span></div>
      <div class="card"><div class="list">${sel.map(j => jobRow(j)).join('') || `<div class="empty">No jobs. <button class="btn ghost sm" data-act="newJob" data-date="${S.calSel}">+ Add a job on this day</button></div>`}</div></div>`
      : `<div class="card"><div class="card-h"><h2>Upcoming</h2><span class="muted small">${upcoming.length}</span></div><div class="list">${upcoming.map(j => jobRow(j, true)).join('') || '<div class="empty">No upcoming jobs</div>'}</div></div>
         <div class="card"><div class="card-h"><h2>Recent</h2></div><div class="list">${recent.map(j => jobRow(j, true)).join('') || '<div class="empty">—</div>'}</div></div>`}
      <p class="muted small mt">Colors: <b class="j-Install">Install</b> · <b class="j-Service">Service</b> · <b class="j-Cleaning">Cleaning</b> · <b class="j-Survey">Survey</b> · <b class="j-Delivery">Delivery / Pull-out</b></p>`;
  };

  // stock
  VIEWS.stock = () => {
    const kind = S.stockKind, q = lc(S.q.stock);
    let list = stockList(kind).slice();
    if (S.stockFilter === 'in') list = list.filter(x => x.now > 0);
    if (S.stockFilter === 'zero') list = list.filter(x => x.now <= 0);
    if (q) list = list.filter(x => lc([x.item, x.type, x.hp, x.pn, x.group, x.notes].join(' ')).includes(q));
    const groups = new Map();
    list.forEach(x => { const g = (kind === 'part' ? x.group : x.type) || 'Other'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
    const all = stockList(kind), sm = stockSum(all, kind), unit = kind === 'unit';
    return `
      <div class="row between wrap" style="margin-bottom:12px">
        <div class="seg"><button class="${kind === 'unit' ? 'on' : ''}" data-act="stockKind" data-k="unit">Aircon units</button><button class="${kind === 'part' ? 'on' : ''}" data-act="stockKind" data-k="part">Parts</button></div>
        <div class="row"><button class="btn sm" data-go="report">${ic('chart')} LG report</button>
        <button class="btn primary sm" data-act="move" data-kind="${kind}">${ic('plus')} In / Out</button></div>
      </div>
      <div class="search">${ic('search')}<input id="qstock" placeholder="Search ${kind === 'part' ? 'part, part no., model' : 'model, type, hp'}…" value="${esc(S.q.stock || '')}" autocomplete="off"></div>
      <div class="chips" style="margin-bottom:12px">
        ${[['all', 'All ' + all.length], ['in', 'In stock'], ['zero', 'Zero stock']].map(c => `<button class="chip ${S.stockFilter === c[0] ? 'on' : ''}" data-act="stockFilter" data-f="${c[0]}">${c[1]}</button>`).join('')}
      </div>
      <div class="stats">
        <div class="stat"><span>${unit ? 'Aircons on hand' : 'Parts on hand'}</span><b>${sm.n}</b></div>
        ${unit ? `<div class="stat"><span>Front panels</span><b>${sm.panels}</b></div>` : ''}
        <div class="stat"><span>${unit ? 'Value at cost' : 'Value at LG cost'}</span><b style="font-size:20px">${peso(sm.cost, 0)}</b></div>
        <div class="stat"><span>${unit ? 'Value at SRP' : 'Value at customer price'}</span><b style="font-size:20px">${peso(sm.sell, 0)}</b></div>
      </div>
      ${unit && sm.panels ? '<p class="muted small" style="margin:-4px 0 6px">Values include front panels.</p>' : ''}
      ${sm.noPrice ? `<p class="muted small" style="margin:-2px 0 10px">${sm.noPrice} pcs have no price in the sheet (not counted)</p>` : ''}
      <div id="stockList">${stockGroupsHtml(groups, kind)}</div>`;
  };
  function stockGroupsHtml(groups, kind) {
    if (!groups.size) return '<div class="card"><div class="empty">Nothing found</div></div>';
    return Array.from(groups).map(([g, xs]) => `<div class="card"><div class="card-h"><h2 class="small" style="font-size:14px;color:var(--ink-2)">${esc(g)}</h2><span class="muted small">${xs.length}</span></div><div class="list">
      ${xs.map(x => `<button class="item" data-act="stockItem" data-kind="${kind}" data-r="${x.r}">
        <span class="grow"><div class="t">${esc(x.item)}</div><div class="s clip">${esc(kind === 'part' ? [x.pn, x.price ? peso(x.price) : '', x.cost ? 'LG ' + peso(x.cost) : ''].filter(Boolean).join(' · ') : [x.hp, x.srp ? 'SRP ' + peso(x.srp, 0) : '', x.cost ? 'cost ' + peso(x.cost, 0) : ''].filter(Boolean).join(' · '))}</div></span>
        <span class="qty ${x.now > 0 ? 'has' : 'zero'}">${x.now}</span></button>`).join('')}</div></div>`).join('');
  }
  VIEWS.stock.after = () => {
    const inp = $('#qstock');
    inp && inp.addEventListener('input', () => {
      S.q.stock = inp.value;
      const kind = S.stockKind, q = lc(inp.value);
      let list = stockList(kind).slice();
      if (S.stockFilter === 'in') list = list.filter(x => x.now > 0);
      if (S.stockFilter === 'zero') list = list.filter(x => x.now <= 0);
      if (q) list = list.filter(x => lc([x.item, x.type, x.hp, x.pn, x.group, x.notes].join(' ')).includes(q));
      const groups = new Map();
      list.forEach(x => { const g = (kind === 'part' ? x.group : x.type) || 'Other'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
      $('#stockList').innerHTML = stockGroupsHtml(groups, kind);
    });
  };

  // customers
  VIEWS.customers = () => {
    const q = S.q.cust || '';
    return `
      <div class="row between wrap" style="margin-bottom:12px"><h1 style="margin:0">Customers</h1>
        <button class="btn primary sm" data-act="install">${ic('plus')} New installation</button></div>
      <div class="search">${ic('search')}<input id="qcust" placeholder="Search name, company, place, model or serial no." value="${esc(q)}" autocomplete="off"></div>
      <div id="custRes">${custResults(q)}</div>`;
  };
  function custResults(q) {
    q = lc(q).trim();
    const t = today();
    if (!q) {
      const due = cleaningDue();
      const recent = (D().customers || []).filter(c => c.inst).sort((a, b) => b.inst.localeCompare(a.inst)).slice(0, 10);
      return `<div class="card"><div class="card-h"><h2>Cleaning due (30 days)</h2><span class="muted small">${due.length}</span></div><div class="list">
        ${due.slice(0, 30).map(c => `<button class="item" data-go="cust/${encodeURIComponent(c.c)}"><span class="grow"><div class="t clip">${esc(c.c)}</div><div class="s clip">${esc([c.m, c.l, c.isn ? 'SN ' + c.isn : ''].filter(Boolean).join(' · '))}</div></span>
        <span class="r small" style="${c.nc < t ? 'color:var(--red);font-weight:700' : 'color:var(--ink-2)'}">${esc(fmtD(c.nc))}</span></button>`).join('') || '<div class="empty">Nothing due</div>'}</div></div>
        <div class="card"><div class="card-h"><h2>Recent installations</h2></div><div class="list">
        ${recent.map(c => `<button class="item" data-go="cust/${encodeURIComponent(c.c)}"><span class="grow"><div class="t clip">${esc(c.c)}</div><div class="s clip">${esc([c.m, c.l].filter(Boolean).join(' · '))}</div></span><span class="r muted small">${esc(fmtD(c.inst, {year: 'numeric'}))}</span></button>`).join('')}</div></div>`;
    }
    const words = q.split(/\s+/);
    const hits = [];
    custGroups().forEach(g => {
      const text = lc(g.name + ' ' + Array.from(g.co).join(' ') + ' ' + Array.from(g.locs).join(' ') + ' ' + g.rows.map(r => [r.m, r.isn, r.osn, r.d].join(' ')).join(' '));
      if (words.every(w => text.includes(w))) hits.push(g);
    });
    hits.sort((a, b) => (lc(a.name).startsWith(words[0]) ? 0 : 1) - (lc(b.name).startsWith(words[0]) ? 0 : 1) || b.rows.length - a.rows.length);
    return `<div class="card"><div class="card-h"><h2>${hits.length} customer${hits.length === 1 ? '' : 's'}</h2></div><div class="list">
      ${hits.slice(0, 80).map(g => `<button class="item" data-go="cust/${encodeURIComponent(g.name)}"><span class="avatar">${esc(initials(g.name))}</span>
        <span class="grow"><div class="t clip">${esc(g.name)}</div><div class="s clip">${esc([Array.from(g.co)[0], Array.from(g.locs)[0]].filter(Boolean).join(' · '))}</div></span>
        <span class="r muted small">${g.rows.length} unit${g.rows.length === 1 ? '' : 's'}</span></button>`).join('') || '<div class="empty">No customer found</div>'}</div></div>`;
  }
  VIEWS.customers.after = () => {
    const inp = $('#qcust');
    inp && inp.addEventListener('input', () => { S.q.cust = inp.value; $('#custRes').innerHTML = custResults(inp.value); });
  };

  VIEWS.cust = name => {
    const g = custGroups().get(name);
    if (!g) return `<button class="btn ghost" data-go="customers">${ic('left')} Customers</button><div class="card mt"><div class="empty">Customer not found</div></div>`;
    const t = today();
    const jobs = (D().schedule || []).filter(j => lc(j.customer) === lc(name)).sort((a, b) => b.date.localeCompare(a.date));
    const recs = (D().receivables || []).filter(r => lc(r.project).includes(lc(name).split(/\s+/)[0]));
    const rows = g.rows.slice().sort((a, b) => (b.inst || '').localeCompare(a.inst || ''));
    return `
      <button class="btn ghost sm" data-go="customers" style="padding-left:0">${ic('left')} Customers</button>
      <h1>${esc(name)}</h1>
      <p class="sub">${esc([Array.from(g.co).join(', '), Array.from(g.locs).slice(0, 3).join(' · ')].filter(Boolean).join(' — '))}</p>
      <div class="btns" style="margin-bottom:14px">
        <button class="btn primary" data-act="newJob" data-cust="${esc(name)}">${ic('cal')} New job</button>
        <button class="btn" data-act="quoteFor" data-cust="${esc(name)}">${ic('doc')} Quotation</button>
        <button class="btn" data-act="bookClean" data-cust="${esc(name)}">${ic('spark')} Book cleaning</button>
        <button class="btn" data-act="install" data-cust="${esc(name)}">${ic('plus')} Add unit</button>
      </div>
      <div class="card"><div class="card-h"><h2>Units (${rows.length})</h2></div><div class="list">
        ${rows.map(c => `<div class="item" style="align-items:flex-start">
          <span class="grow"><div class="t">${esc(c.m || '(model?)')}${c.d ? ` <span class="muted small">${esc(c.d)}</span>` : ''}</div>
            <div class="s">${esc([c.l, c.isn ? 'Indoor SN ' + c.isn : '', c.osn ? 'Outdoor SN ' + c.osn : ''].filter(Boolean).join(' · '))}</div>
            <div class="s">Installed ${esc(fmtD(c.inst, {year: 'numeric'}) || '—')} · Last cleaning ${esc(fmtD(c.lc, {year: 'numeric'}) || '—')} · Next <b style="${c.nc && c.nc < t ? 'color:var(--red)' : ''}">${esc(fmtD(c.nc, {year: 'numeric'}) || '—')}</b></div>
            ${c.rem ? `<div class="s">${esc(c.rem)}</div>` : ''}</span>
          <button class="btn sm" data-act="cleanRow" data-r="${c.r}">${ic('spark')} Cleaned</button></div>`).join('')}</div></div>
      <div class="card"><div class="card-h"><h2>Jobs</h2><button class="btn ghost sm" data-act="newJob" data-cust="${esc(name)}">+ Add</button></div><div class="list">${jobs.map(j => jobRow(j, true)).join('') || '<div class="empty">No jobs in the schedule</div>'}</div></div>
      ${recs.length ? `<div class="card"><div class="card-h"><h2>Receivables (name match)</h2></div><div class="list">${recs.map(arRow).join('')}</div></div>` : ''}`;
  };

  // money
  function arRow(r) {
    return `<button class="item" data-act="ar" data-r="${r.r}"><span class="grow"><div class="t clip">${esc(r.project)}</div>
      <div class="s clip">${esc([r.remarks, r.ref].filter(Boolean).join(' · '))}</div></span>
      <span class="r"><div class="num" style="font-weight:800">${peso(r.bal)}</div><span class="pill p-${esc(r.status)}">${esc(r.status || '')}</span></span></button>`;
  }
  VIEWS.money = () => {
    const recs = (D().receivables || []).slice().sort((a, b) => b.bal - a.bal);
    const open = recs.filter(r => r.bal > 0), paid = recs.filter(r => r.bal <= 0);
    const total = D().arTotal != null ? D().arTotal : open.reduce((s, r) => s + r.bal, 0);
    const pays = (D().payments || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 30);
    const tab = S.money;
    return `
      <div class="row between wrap" style="margin-bottom:12px"><h1 style="margin:0">Money</h1>
        <div class="row"><button class="btn sm" data-act="newAr">${ic('plus')} New contract</button><button class="btn primary sm" data-act="pay">${ic('peso')} Payment received</button></div></div>
      <div class="stats" style="grid-template-columns:1fr 1fr">
        <div class="stat"><span>Total unpaid</span><b>${peso(total)}</b></div>
        <div class="stat"><span>Open accounts</span><b>${open.length}</b></div>
      </div>
      <div class="seg" style="margin-bottom:12px"><button class="${tab === 'ar' ? 'on' : ''}" data-act="moneyTab" data-t="ar">Unpaid</button><button class="${tab === 'pay' ? 'on' : ''}" data-act="moneyTab" data-t="pay">Payments</button><button class="${tab === 'paid' ? 'on' : ''}" data-act="moneyTab" data-t="paid">Fully paid</button></div>
      ${tab === 'ar' ? `<div class="card"><div class="list">${open.map(arRow).join('') || '<div class="empty">Nothing unpaid 🎉</div>'}</div></div>` : ''}
      ${tab === 'paid' ? `<div class="card"><div class="list">${paid.map(arRow).join('') || '<div class="empty">—</div>'}</div></div>` : ''}
      ${tab === 'pay' ? `<div class="card"><div class="list">${pays.map(p => `<div class="item"><span class="grow"><div class="t clip">${esc(p.project)}</div><div class="s">${esc([fmtD(p.date, {year: 'numeric'}), p.method, p.by, p.notes].filter(Boolean).join(' · '))}</div></span><span class="r num" style="font-weight:800;color:var(--green)">${peso(p.amount)}</span></div>`).join('') || '<div class="empty">No payments recorded yet.<br>Tap “Payment received” when a customer pays.</div>'}</div></div>` : ''}
      <p class="muted small mt">Balance NOW = balance on Nov 12 (from the old Excel) minus payments recorded here. Cash, bank, payables and salary notes are in the sheet tab FINANCE NOTES.</p>`;
  };

  // quotes & forms
  const docRow = q => `<button class="item" data-go="quote/${esc(q.no)}"><span class="grow"><div class="t clip">${esc(q.no)} · ${esc(q.customer)}</div>
          <div class="s clip">${esc([fmtD(q.date, {year: 'numeric'}), q.project, q.by].filter(Boolean).join(' · '))}</div></span>
          <span class="r"><div class="num" style="font-weight:800">${peso(q.total)}</div><span class="pill p-${esc(String(q.status).replace(/\s/g, ''))}">${esc(q.status)}</span></span></button>`;
  VIEWS.quotes = () => {
    const all = (D().quotes || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.no.localeCompare(a.no));
    const tab = S.docTab || 'quote', qs = all.filter(q => (q.type || 'quote') === tab);
    return `
      <div class="row between wrap" style="margin-bottom:12px"><h1 style="margin:0">Quotes & Invoices</h1>
        <div class="row"><button class="btn sm" data-go="quote/newinv">${ic('plus')} New invoice</button><button class="btn primary sm" data-go="quote/new">${ic('plus')} New quotation</button></div></div>
      <div class="seg" style="margin-bottom:12px"><button class="${tab === 'quote' ? 'on' : ''}" data-act="docTab" data-t="quote">Quotations</button><button class="${tab === 'invoice' ? 'on' : ''}" data-act="docTab" data-t="invoice">Invoices</button></div>
      <div class="card"><div class="list">${qs.map(docRow).join('') || `<div class="empty">${tab === 'invoice' ? 'No invoices yet' : 'No quotations yet'}</div>`}</div></div>
      <div class="card"><div class="card-h"><h2>Print a form</h2></div>
        <p class="muted small" style="margin-top:0">Tip: open a job in Schedule → “Service report” fills in the customer, model and technician for you.</p>
        <div class="btns"><button class="btn" data-act="printForm" data-f="service">${ic('print')} Service report (blank)</button>
        <button class="btn" data-act="printForm" data-f="startup">${ic('print')} Start-up report (blank)</button></div></div>`;
  };

  VIEWS.quote = arg => {
    arg = arg || 'new';
    const isNew = /^(new|newinv|fromq)(:|$)/.test(arg);
    const ex = !isNew ? (D().quotes || []).find(q => q.no === arg) : null;
    if (!isNew && !ex) return `<button class="btn ghost" data-go="quotes">${ic('left')} Quotes</button><div class="card mt"><div class="empty">Quotation not found</div></div>`;
    let q;
    if (ex) q = Object.assign(JSON.parse(JSON.stringify(ex.data || {})), {no: ex.no, status: ex.status, type: ex.type || 'quote'});
    else if (arg.startsWith('fromq:')) {
      const src = (D().quotes || []).find(x => x.no === decodeURIComponent(arg.slice(6)));
      q = Object.assign(newQuote('', 'invoice'), src ? JSON.parse(JSON.stringify(src.data || {})) : {}, {no: '', status: '', type: 'invoice', date: today(), by: S.me ? S.me.name : '', quoteRef: src ? src.no : ''});
      q.due = ''; q.pay = LS.get('brz_paydetails', '');
    } else q = newQuote(arg.includes(':') ? decodeURIComponent(arg.split(':').slice(1).join(':')) : '', arg.startsWith('newinv') ? 'invoice' : 'quote');
    S.qd = q;
    const inv = q.type === 'invoice';
    S.docTab = inv ? 'invoice' : 'quote';
    return `
      <button class="btn ghost sm" data-go="quotes" style="padding-left:0">${ic('left')} ${inv ? 'Invoices' : 'Quotes'}</button>
      <div class="row between wrap"><h1>${ex ? esc(ex.no) : inv ? 'New invoice' : 'New quotation'}</h1>${ex ? `<span class="pill p-${esc(String(ex.status).replace(/\s/g, ''))}">${esc(ex.status)}</span>` : ''}</div>
      ${inv ? `<p class="muted small" style="margin-top:0">Temporary invoice layout — it will be changed to BRIZAIR's own invoice form.</p>` : ''}
      <div class="card"><h2 style="margin-bottom:12px">Customer</h2>
        <div class="f pick"><label>Customer name *</label><input id="q_customer" value="${esc(q.customer)}" autocomplete="off" placeholder="Type to search existing customers"><div class="pick-list hidden" id="q_pick"></div></div>
        <div class="f2"><div class="f"><label>Company</label><input id="q_company" value="${esc(q.company)}"></div><div class="f"><label>Contact person</label><input id="q_attn" value="${esc(q.attn)}"></div></div>
        <div class="f"><label>Address</label><input id="q_address" value="${esc(q.address)}"></div>
        <div class="f2"><div class="f"><label>Phone</label><input id="q_phone" value="${esc(q.phone)}" inputmode="tel"></div><div class="f"><label>Email</label><input id="q_email" value="${esc(q.email)}" inputmode="email"></div></div>
        <div class="f"><label>Project / subject</label><input id="q_project" value="${esc(q.project)}" placeholder="e.g. Supply and installation of 2 units split type"></div>
        ${inv ? `<div class="f2"><div class="f"><label>Invoice date</label><input id="q_date" type="date" value="${esc(q.date)}"></div><div class="f"><label>Due date</label><input id="q_due" type="date" value="${esc(q.due || '')}"></div></div>
          <div class="f2"><div class="f"><label>Customer P.O. no.</label><input id="q_po" value="${esc(q.po || '')}"></div><div class="f"><label>Payment terms</label><input id="q_termsShort" value="${esc(q.termsShort || '')}" placeholder="e.g. 30 days, COD"></div></div>
          <div class="f2"><div class="f"><label>Customer TIN</label><input id="q_tin" value="${esc(q.tin || '')}"></div><div class="f"><label>Business style</label><input id="q_style" value="${esc(q.style || '')}"></div></div>
          ${q.quoteRef ? `<p class="muted small">From quotation ${esc(q.quoteRef)}</p>` : ''}`
        : `<div class="f2"><div class="f"><label>Date</label><input id="q_date" type="date" value="${esc(q.date)}"></div><div class="f"><label>Valid for</label><input id="q_valid" value="${esc(q.valid)}" placeholder="e.g. 15 days"></div></div>`}
      </div>
      <div class="card"><div class="card-h"><h2>Items</h2></div>
        <div class="f pick" style="margin-bottom:10px"><input id="q_add" placeholder="➕ Add from stock: type model or part…" autocomplete="off"><div class="pick-list hidden" id="q_addpick"></div></div>
        <div class="qitems" id="q_items"></div>
        <div class="btns" style="margin-top:10px"><button class="btn sm" data-act="qAddLine" data-d="Installation (standard)">+ Installation</button><button class="btn sm" data-act="qAddLine" data-d="Excess copper pipes & materials">+ Materials</button><button class="btn sm" data-act="qAddLine" data-d="">+ Other line</button></div>
        <div class="f2 mt"><div class="f"><label>Discount (₱)</label><input id="q_disc" inputmode="decimal" value="${q.discount || ''}" placeholder="0"></div>
          <div class="f"><label>VAT</label><select id="q_vat">${[['incl', 'Prices include 12% VAT'], ['add', 'Add 12% VAT'], ['none', 'No VAT line']].map(v => `<option value="${v[0]}" ${q.vat === v[0] ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></div></div>
        <div class="qtot" id="q_tot"></div>
      </div>
      ${inv ? `<div class="card"><div class="f"><label>Payment details (bank / GCash) — printed on the invoice</label><textarea id="q_pay" placeholder="e.g. BDO · Account name: BRIZAIR CORP · Account no. ...">${esc(q.pay || '')}</textarea><div class="hint">Saved on this phone for the next invoice.</div></div>
        ${!ex ? `<label class="row small" style="font-weight:600"><input type="checkbox" id="q_ar" checked> Also add to Money (receivables) so payments are tracked</label>` : ''}</div>` : ''}
      <div class="card"><div class="f" style="margin:0"><label>Notes & terms (printed at the bottom)</label><textarea id="q_terms" placeholder="e.g. payment terms, delivery, warranty">${esc(q.terms)}</textarea></div></div>
      <div class="btns mt savebar">
        <button class="btn primary" data-act="qSave">${ic('check')} Save</button>
        <button class="btn" data-act="qSave" data-print="1">${ic('print')} Save & print / PDF</button>
        ${ex ? `<button class="btn" data-act="qStatus">Status…</button>` : ''}
        ${ex && !inv ? `<button class="btn" data-go="quote/fromq:${encodeURIComponent(ex.no)}">${ic('doc')} Make invoice</button>` : ''}
      </div>`;
  };
  function newQuote(cust, type) {
    const g = cust ? custGroups().get(cust) : null;
    return {type: type || 'quote', due: '', po: '', termsShort: '', tin: '', style: '', pay: type === 'invoice' ? LS.get('brz_paydetails', '') : '', customer: cust || '', company: g ? Array.from(g.co)[0] || '' : '', address: g ? Array.from(g.locs)[0] || '' : '', attn: '', phone: '', email: '',
      project: '', date: today(), valid: '', items: [], discount: 0, vat: 'incl', terms: '', by: S.me ? S.me.name : ''};
  }
  function qCalc(q) {
    const sub = q.items.reduce((s, it) => s + (+it.qty || 0) * (+it.price || 0), 0);
    const disc = +q.discount || 0, base = sub - disc;
    const vat = q.vat === 'add' ? base * 0.12 : q.vat === 'incl' ? base - base / 1.12 : 0;
    const total = q.vat === 'add' ? base + vat : base;
    return {sub, disc, vat, total};
  }
  function qRender() {
    const q = S.qd; if (!q || !$('#q_items')) return;
    $('#q_items').innerHTML = q.items.map((it, i) => `<div class="qline" data-i="${i}">
      <div class="desc"><small>Description</small><input data-f="desc" value="${esc(it.desc)}"></div>
      <div><small>Qty</small><input data-f="qty" inputmode="numeric" value="${esc(it.qty)}"></div>
      <div><small>Unit price ₱</small><input data-f="price" inputmode="decimal" value="${esc(it.price)}"></div>
      <div class="amt"><small>Amount</small>${money((+it.qty || 0) * (+it.price || 0))}</div>
      <button class="iconbtn" data-act="qDel" data-i="${i}" aria-label="Remove">${ic('x')}</button></div>`).join('') || '<div class="empty">No items yet — add from stock or tap “+ Installation”.</div>';
    qTotals();
  }
  function qTotals() {
    const c = qCalc(S.qd);
    $('#q_tot').innerHTML = `<span>Subtotal</span><b>${money(c.sub)}</b>${c.disc ? `<span>Discount</span><b>−${money(c.disc)}</b>` : ''}
      ${S.qd.vat === 'add' ? `<span>VAT 12%</span><b>${money(c.vat)}</b>` : ''}<span class="grand">Total</span><b class="grand">₱${money(c.total)}</b>
      ${S.qd.vat === 'incl' ? `<span class="muted small">VAT included</span><b class="muted small">${money(c.vat)}</b>` : ''}`;
    $$('.qline').forEach(el => { const it = S.qd.items[+el.dataset.i]; if (it) $('.amt', el).innerHTML = '<small>Amount</small>' + money((+it.qty || 0) * (+it.price || 0)); });
  }
  function qRead() {
    const q = S.qd;
    ['customer', 'company', 'attn', 'address', 'phone', 'email', 'project', 'date', 'valid', 'terms', 'due', 'po', 'termsShort', 'tin', 'style', 'pay'].forEach(k => { const el = $('#q_' + k); if (el) q[k] = el.value.trim(); });
    if (q.type === 'invoice' && q.pay) LS.set('brz_paydetails', q.pay);
    q.discount = +($('#q_disc').value.replace(/,/g, '')) || 0;
    q.vat = $('#q_vat').value;
    q.items = q.items.filter(it => String(it.desc).trim() || +it.price);
    q.total = Math.round(qCalc(q).total * 100) / 100;
    return q;
  }
  VIEWS.quote.after = () => {
    if (!S.qd) return;
    qRender();
    $('#q_items').addEventListener('input', e => {
      const line = e.target.closest('.qline'); if (!line) return;
      const it = S.qd.items[+line.dataset.i]; const f = e.target.dataset.f;
      it[f] = f === 'desc' ? e.target.value : e.target.value.replace(/[^\d.]/g, '');
      qTotals();
    });
    $('#q_disc').addEventListener('input', () => { S.qd.discount = +$('#q_disc').value.replace(/,/g, '') || 0; qTotals(); });
    $('#q_vat').addEventListener('change', () => { S.qd.vat = $('#q_vat').value; qTotals(); });
    picker($('#q_customer'), $('#q_pick'), q => {
      q = lc(q); if (q.length < 2) return [];
      const out = []; custGroups().forEach(g => { if (lc(g.name).includes(q) && out.length < 12) out.push({t: g.name, s: [Array.from(g.co)[0], Array.from(g.locs)[0]].filter(Boolean).join(' · '), v: g}); });
      return out;
    }, o => {
      $('#q_customer').value = o.t;
      if (!$('#q_company').value) $('#q_company').value = Array.from(o.v.co)[0] || '';
      if (!$('#q_address').value) $('#q_address').value = Array.from(o.v.locs)[0] || '';
    });
    picker($('#q_add'), $('#q_addpick'), q => {
      q = lc(q); if (q.length < 2) return [];
      const u = (D().units || []).filter(x => lc(x.item + ' ' + x.type + ' ' + x.hp).includes(q)).slice(0, 10).map(x => ({t: x.item, s: [x.type, x.hp, 'stock ' + x.now, x.srp != null ? 'SRP ' + peso(x.srp, 0) : ''].filter(Boolean).join(' · '), v: {desc: `LG ${x.item}${x.type ? ' – ' + x.type : ''}${x.hp && x.hp !== '-' ? ' ' + x.hp : ''}`, price: x.srp || ''}}));
      const p = (D().parts || []).filter(x => lc(x.item + ' ' + x.pn + ' ' + x.group).includes(q)).slice(0, 8).map(x => ({t: x.item, s: [x.group, 'stock ' + x.now, x.price != null ? peso(x.price) : ''].filter(Boolean).join(' · '), v: {desc: `${x.group ? x.group + ' – ' : ''}${x.item}`, price: x.price || ''}}));
      return u.concat(p);
    }, o => { S.qd.items.push({desc: o.v.desc, qty: 1, price: o.v.price}); $('#q_add').value = ''; qRender(); });
  };

  // LG monthly report
  function monthsAvail() {
    const out = [], t = today().slice(0, 7);
    let ym = '2026-11';
    while (ym <= t) { out.push(ym); const [y, m] = ym.split('-').map(Number); ym = m === 12 ? (y + 1) + '-01' : y + '-' + String(m + 1).padStart(2, '0'); }
    return out.reverse();
  }
  function monthly(kind, ym, showAll) {
    const items = stockList(kind), log = stockLog(kind);
    const [y, m] = ym.split('-').map(Number), days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const rows = items.map(x => {
      const ins = Array(days + 1).fill(0), outs = Array(days + 1).fill(0);
      let beg = x.start;
      log.forEach(l => {
        if (l.item !== x.item || !l.date) return;
        const s = l.dir === 'IN' ? 1 : -1;
        if (l.date < ym + '-01') beg += s * l.qty;
        else if (l.date.slice(0, 7) === ym) (l.dir === 'IN' ? ins : outs)[+l.date.slice(8, 10)] += l.qty;
      });
      const ti = ins.reduce((a, b) => a + b, 0), to = outs.reduce((a, b) => a + b, 0);
      return {x, beg, ins, outs, ti, to, end: beg + ti - to};
    }).filter(r => showAll || r.beg || r.ti || r.to || r.end);
    return {rows, days};
  }
  VIEWS.report = () => {
    const R = S.rep, months = monthsAvail();
    if (!R.ym || !months.includes(R.ym)) R.ym = months[0];
    const {rows, days} = monthly(R.kind, R.ym, R.all);
    const dn = Array.from({length: days}, (_, i) => i + 1);
    return `
      <div class="row between wrap" style="margin-bottom:12px"><h1 style="margin:0">LG Monthly Report</h1>
        <button class="btn primary sm" data-act="printReport">${ic('print')} Print / PDF</button></div>
      <p class="sub">Same layout as the old Excel: beginning stock, daily IN and OUT, ending stock. Made automatically from Unit / Part in-out records.</p>
      <div class="row wrap" style="margin-bottom:12px">
        <div class="seg"><button class="${R.kind === 'unit' ? 'on' : ''}" data-act="repKind" data-k="unit">Aircon units</button><button class="${R.kind === 'part' ? 'on' : ''}" data-act="repKind" data-k="part">Parts</button></div>
        <select id="repYm" class="btn sm">${months.map(ym => `<option value="${ym}" ${ym === R.ym ? 'selected' : ''}>${dObj(ym + '-01').toLocaleDateString('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'})}</option>`).join('')}</select>
        <label class="chip ${R.all ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" id="repAll" ${R.all ? 'checked' : ''} style="display:none">Show items with no stock</label>
      </div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item</th><th>Beg</th>${dn.map(d => `<th class="in">${d}</th>`).join('')}<th class="tot">IN</th>${dn.map(d => `<th class="out">${d}</th>`).join('')}<th class="tot">OUT</th><th class="tot">End</th></tr>
        <tr><th></th><th></th><th colspan="${days}" style="text-align:center" class="in">IN — deliveries (day of month)</th><th></th><th colspan="${days}" style="text-align:center" class="out">OUT — issued / installed (day of month)</th><th></th><th></th></tr></thead>
        <tbody>${rows.map(r => `<tr><td title="${esc(r.x.item)}">${esc(r.x.item)}</td><td>${r.beg}</td>${dn.map(d => `<td class="${r.ins[d] ? 'in' : ''}">${r.ins[d] || ''}</td>`).join('')}<td class="tot">${r.ti}</td>${dn.map(d => `<td class="${r.outs[d] ? 'out' : ''}">${r.outs[d] || ''}</td>`).join('')}<td class="tot">${r.to}</td><td class="tot">${r.end}</td></tr>`).join('') || `<tr><td colspan="${days * 2 + 5}" class="empty">No items</td></tr>`}</tbody></table></div>`;
  };
  VIEWS.report.after = () => {
    $('#repYm') && $('#repYm').addEventListener('change', e => { S.rep.ym = e.target.value; render(); });
    $('#repAll') && $('#repAll').addEventListener('change', e => { S.rep.all = e.target.checked; render(); });
  };

  VIEWS.activity = () => `<h1>Activity</h1><p class="sub">Latest changes made on this site (also saved in the sheet tab APP LOG).</p>
    <div class="card"><div class="list">${(D().log || []).map(l => `<div class="item"><span class="avatar">${esc(initials(l.who))}</span><span class="grow"><div class="t small">${esc(l.who)} · ${esc(l.action)}</div><div class="s">${esc(l.details)}</div></span><span class="r muted small">${esc(l.time)}</span></div>`).join('') || '<div class="empty">No activity yet</div>'}</div></div>`;

  VIEWS.more = () => `<h1>More</h1><p class="sub">Logged in as <b>${esc(S.me && S.me.name)}</b></p>
    <div class="card"><div class="list">
      ${[['ask', 'Ask GPT', 'chat', 'c-blue'], ['materials', 'Materials for AI (upload)', 'book', 'c-violet'], ['money', 'Money — unpaid & payments', 'peso', 'c-amber'], ['quotes', 'Quotes, invoices & forms', 'doc', 'c-red'], ['report', 'LG Monthly Report', 'chart', 'c-green'], ['activity', 'Activity', 'log', 'c-blue'], ['help', 'Help', 'help', 'c-violet']]
        .map(x => `<button class="item" data-go="${x[0]}"><span class="qi ${x[3]}" style="width:38px;height:38px">${ic(x[2])}</span><span class="grow t">${x[1]}</span>${ic('right')}</button>`).join('')}
      <button class="item" data-act="lang"><span class="qi c-blue" style="width:38px;height:38px"><b class="noi18n">A/가</b></span><span class="grow t">Language</span><span class="muted small noi18n">${lang() === 'ko' ? '한국어 → English' : 'English → 한국어'}</span></button>
      <button class="item" data-act="openSheet"><span class="qi c-teal" style="width:38px;height:38px">${ic('sheet')}</span><span class="grow t">Open Google Sheet</span>${ic('right')}</button>
      <button class="item" data-act="logout"><span class="qi" style="width:38px;height:38px;background:var(--bg)">${ic('out')}</span><span class="grow t">Log out</span></button>
    </div></div>
    <p class="muted small mt">Add this site to your phone's Home Screen: Chrome menu ⋮ → “Add to Home screen” (iPhone: Share → “Add to Home Screen”).</p>`;

  // ask GPT
  function askItem(a) {
    const st = a.status || '';
    const rate = st === 'answered' && a.who === (S.me && S.me.name) ? (a.rating ? `<div class="rated">${/^good/.test(a.rating) ? '👍' : '👎'}</div>`
      : `<div class="rate"><span>Was this answer helpful?</span><button data-act="rate" data-id="${esc(a.id)}" data-good="1">👍 Good</button><button data-act="rate" data-id="${esc(a.id)}" data-good="">👎 Wrong / not enough</button></div>`) : '';
    const ans = st === 'answered' ? `<div class="bub ai">${fmtAnswer(a.a)}</div>${rate}`
      : st === 'error' ? `<div class="bub ai err">${esc(tr(/^GPT LIMIT: /.test(a.a || '') ? a.a.replace(/^GPT LIMIT: /, '') : 'Sorry, GPT could not answer this one. Please ask again in a different way, or ask Sir Kim.'))}</div>`
      : `<div class="bub ai wait"><span class="dots3"><i></i><i></i><i></i></span> ${esc(tr(st.indexOf('thinking') === 0 ? 'GPT is reading the sheet…' : D().aiOnline === false ? 'Waiting — Sir Kim\'s PC is offline. It will answer when the PC is on.' : 'Sent. GPT will answer in about 20–60 seconds…'))}</div>`;
    return `<div class="qa"><div class="meta">${esc(a.who)} · ${esc(String(a.time || '').slice(5))}</div><div class="bub me">${esc(a.q)}</div>${ans}</div>`;
  }
  function fmtAnswer(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm, '<b>$1</b>').replace(/^[-*]\s+/gm, '• ').replace(/\n/g, '<br>');
  }
  VIEWS.ask = () => {
    const list = (D().ask || []).slice(-40);
    const on = D().aiOnline;
    return `<div class="row between wrap"><h1 style="margin:0">Ask GPT</h1><button class="btn sm" data-go="materials">${ic('book')} Materials for AI</button></div>
      <p class="sub" style="margin-top:6px">GPT reads the whole office sheet and the uploaded materials, then answers. English, Tagalog, Kapampangan or Korean is OK.
        <br><span class="pill ${on ? 'p-Done' : 'p-Moved'}">${on ? '● GPT online' : '● GPT offline — Sir Kim\'s PC is off'}</span></p>
      <div id="qaList" class="qalist">${list.map(askItem).join('') || `<div class="empty">No questions yet. Try:<br>“How many HSN12 units do we have?”<br>“How much does Kodec still owe?”<br>“When is the next cleaning for Café Dia?”</div>`}</div>
      <form id="askForm" class="askform"><textarea id="askQ" rows="1" placeholder="Type your question…"></textarea><button class="btn primary" aria-label="Send">${ic('send')}</button></form>`;
  };
  VIEWS.ask.after = () => {
    const box = $('#qaList'); if (box) window.scrollTo(0, document.body.scrollHeight);
    const ta = $('#askQ');
    ta.addEventListener('input', () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'; });
    ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 900) { e.preventDefault(); $('#askForm').requestSubmit(); } });
    $('#askForm').addEventListener('submit', async e => {
      e.preventDefault();
      const q = ta.value.trim(); if (!q) return;
      ta.value = ''; ta.style.height = 'auto';
      try {
        const r = await call('ask', {q});
        const item = {id: r.id, who: S.me.name, time: new Date().toLocaleString('sv-SE', {timeZone: 'Asia/Manila'}).slice(0, 16), q, status: 'waiting', a: ''};
        (S.D.ask = S.D.ask || []).push(item);
        render(); pollAsk();
      } catch (err) { toast(err.message, true); ta.value = q; }
    });
    pollAsk();
  };
  function pollAsk() {
    clearTimeout(S.askTimer);
    const pend = (D().ask || []).filter(a => a.status !== 'answered' && a.status !== 'error').map(a => a.id);
    if (!pend.length) return;
    S.askTimer = setTimeout(async () => {
      try {
        const r = await call('askGet', {ids: pend});
        S.D.aiOnline = r.aiOnline;
        let changed = false;
        r.items.forEach(it => { const a = S.D.ask.find(x => x.id === it.id); if (a && (a.status !== it.status || a.a !== it.a)) { Object.assign(a, it); changed = true; } });
        if (changed && S.route === 'ask') { const ae = document.activeElement; const typing = ae && ae.id === 'askQ' && ae.value; if (!typing) render(); else $('#qaList').innerHTML = S.D.ask.slice(-40).map(askItem).join(''); }
        if (changed && S.route !== 'ask' && r.items.some(i => i.status === 'answered')) toast('GPT answered your question ✓');
      } catch (e) { }
      pollAsk();
    }, 3500);
  }

  // materials
  VIEWS.materials = () => {
    const ks = D().know || [];
    return `<button class="btn ghost sm" data-go="ask" style="padding-left:0">${ic('left')} Ask GPT</button>
      <div class="row between wrap"><h1 style="margin:0">Materials for AI</h1></div>
      <p class="sub" style="margin-top:6px">Teach GPT. Upload price lists, LG brochures, rules, FAQ, sample quotations, photos of documents. GPT reads them before answering.</p>
      <div class="quick" style="grid-template-columns:repeat(2,1fr)">
        <button data-act="kUpload"><span class="qi c-blue">${ic('upload')}</span>Upload a file or photo</button>
        <button data-act="kNote"><span class="qi c-violet">${ic('edit')}</span>Write a rule / answer</button>
      </div>
      ${(D().needs || []).length ? `<div class="card"><div class="card-h"><h2>GPT needs this information</h2><span class="muted small">${D().needs.length}</span></div>
        <p class="muted small" style="margin-top:0">Questions GPT could not answer well — upload the missing info so it can answer next time.</p><div class="list">
        ${D().needs.slice(0, 15).map(n => `<div class="item" style="align-items:flex-start"><span class="grow"><div class="t small" style="white-space:normal">“${esc(n.q)}”</div>
          <div class="s" style="white-space:normal">${esc(n.missing || (/^bad/.test(n.rating) ? 'Marked wrong: ' + n.rating.replace(/^bad:\s*/, '') : 'No answer'))}</div></span><span class="r muted small">${esc(String(n.time).slice(5, 10))}</span></div>`).join('')}</div></div>` : ''}
      <div class="card"><div class="card-h"><h2>Uploaded (${ks.length})</h2></div><div class="list">
        ${ks.map(k => `<div class="item" style="align-items:flex-start"><span class="qi ${k.type === 'File' ? 'c-blue' : 'c-violet'}" style="width:36px;height:36px">${ic(k.type === 'File' ? 'doc' : 'edit')}</span>
          <span class="grow"><div class="t">${esc(k.title)}</div><div class="s">${esc([fmtD(k.date, {year: 'numeric'}), k.who].filter(Boolean).join(' · '))}</div>
          <div class="s" style="white-space:normal;max-height:3.8em;overflow:hidden">${esc(k.text)}</div>
          ${k.url ? `<a class="small" href="${esc(k.url)}" target="_blank" rel="noopener">Open file</a>` : ''}</span>
          <button class="iconbtn" data-act="kHide" data-id="${esc(k.id)}" aria-label="Remove">${ic('x')}</button></div>`).join('') || '<div class="empty">Nothing uploaded yet</div>'}</div></div>
      <p class="muted small">Tip: one topic per upload, with a clear title (e.g. “LG price list Nov 2026”). Wrong or old? Tap ✕ to remove it.</p>`;
  };

  VIEWS.help = () => `<h1>How to use</h1><p class="sub">Everything is saved to the BRIZAIR Office Sheet. Every change is listed in Activity.</p>
    <div class="card"><div class="list">
      ${[['📅 New job', 'Tap + → New job. Pick the date, job type and customer. When the job is done, open it and tap “Done”.'],
        ['📦 Unit came in / went out', 'Tap + → Unit in / out. Choose the model, IN or OUT, and the quantity. Stock updates by itself.'],
        ['🔧 Part used', 'Tap + → Part in / out → OUT. Write the customer name.'],
        ['💵 Customer paid', 'Tap + → Payment. Choose the customer / project and type the amount. The balance updates by itself.'],
        ['🧽 Cleaning done', 'Customers → find the customer → “Cleaned” on the unit. Next cleaning (6 months) is automatic.'],
        ['📄 Quotation', 'Quotes & Invoices → New quotation. Add items from stock (price fills in), save, then Print / PDF and send to the customer.'],
        ['🧾 Invoice', 'Quotes & Invoices → New invoice (or open a quotation → Make invoice). Save & print / PDF. It can add itself to Money so payments are tracked.'],
        ['💬 Ask GPT', 'Bottom middle button. Ask in English, Tagalog, Kapampangan or Korean. Wrong answer? Tap 👎 and upload the right info in Materials for AI.'],
        ['🖨️ Service report / Start-up form', 'Open a job → Service report or Start-up report. Customer, model and technician are filled in.'],
        ['📊 LG monthly report', 'More → LG Monthly Report → choose the month → Print / PDF.'],
        ['✅ To do (Home)', 'Home shows what needs attention: old jobs to update, overdue invoices, quotations to follow up, customers to book for cleaning.'],
        ['📷 Job photos', 'Open a job → Add photos. They are saved in Google Drive, one folder per job.'],
        ['❓ Mistake?', 'Jobs, quotations and invoices: open and fix. Stock in / out: record the opposite (IN 1 cancels a wrong OUT 1). Wrong payment: tell Jheena or Sir Kim to fix it in the Google Sheet.']]
        .map(x => `<div class="item" style="align-items:flex-start"><span class="grow"><div class="t">${x[0]}</div><div class="s" style="white-space:normal">${x[1]}</div></span></div>`).join('')}
    </div></div>`;

  // ───────── sheets (forms) ─────────
  function openSheet(title, body, foot, onOpen) {
    closeSheet();
    const v = document.createElement('div');
    v.className = 'veil';
    v.innerHTML = `<div class="sheet" role="dialog" aria-label="${esc(title)}"><div class="sheet-h"><h2>${esc(title)}</h2><button class="iconbtn" data-act="close" aria-label="Close">${ic('x')}</button></div>
      <div class="sheet-b">${body}</div>${foot ? `<div class="sheet-f">${foot}</div>` : ''}</div>`;
    v.addEventListener('mousedown', e => { if (e.target === v) closeSheet(); });
    document.body.appendChild(v);
    document.body.style.overflow = 'hidden';
    if (onOpen) onOpen(v);
    return v;
  }
  function closeSheet() { $$('.veil').forEach(v => v.remove()); document.body.style.overflow = ''; }

  function picker(input, box, search, choose) {
    let opts = [];
    const show = () => {
      opts = search(input.value);
      if (!opts.length) { box.classList.add('hidden'); return; }
      box.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}"><div>${esc(o.t)}</div>${o.s ? `<div class="s">${esc(o.s)}</div>` : ''}</button>`).join('');
      box.classList.remove('hidden');
    };
    input.addEventListener('input', show);
    input.addEventListener('focus', show);
    input.addEventListener('blur', () => setTimeout(() => box.classList.add('hidden'), 180));
    box.addEventListener('mousedown', e => e.preventDefault());
    box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; choose(opts[+b.dataset.i]); box.classList.add('hidden'); });
  }

  const field = (label, html, hint) => `<div class="f"><label>${label}</label>${html}${hint ? `<div class="hint">${hint}</div>` : ''}</div>`;
  const choice = (name, vals, cur, cls) => `<div class="choice ${cls || ''}">${vals.map(v => `<label><input type="radio" name="${name}" value="${esc(v)}" ${v === cur ? 'checked' : ''}><span>${esc(v)}</span></label>`).join('')}</div>`;
  const techs = () => Array.from(new Set((D().schedule || []).map(j => j.tech).filter(Boolean)));
  const custNames = () => Array.from(custGroups().keys());
  const dl = (id, arr) => `<datalist id="${id}">${arr.slice(0, 400).map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;

  function jobForm(j, preset) {
    j = j || {};
    preset = preset || {};
    const jobs = D().jobs || ['Install', 'Service (AS)', 'Cleaning', 'Survey', 'Delivery', 'Pull-out', 'Meeting', 'Other'];
    return `<form id="fjob">
      <div class="f2">${field('Date *', `<input type="date" name="date" required value="${esc(j.date || preset.date || today())}">`)}
        ${field('Time', `<input name="time" placeholder="e.g. 9:00 AM" value="${esc(j.time || '')}" list="dltime">`)}</div>
      ${dl('dltime', ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'])}
      ${field('Job *', choice('job', jobs, j.job || preset.job || 'Install'))}
      ${field('Customer *', `<input name="customer" required list="dlcust" autocomplete="off" value="${esc(j.customer || preset.cust || '')}" placeholder="Customer name">`)}
      ${dl('dlcust', custNames())}
      ${field('Location', `<input name="location" value="${esc(j.location || '')}" placeholder="Address / building / room">`)}
      ${field('Units / model', `<input name="units" value="${esc(j.units || '')}" placeholder="e.g. 2 × HSN12ISB 1.5hp">`)}
      ${field('Technician', `<input name="tech" list="dltech" value="${esc(j.tech || '')}">`)}${dl('dltech', techs())}
      ${field('Notes', `<textarea name="notes" placeholder="Contact person, special request…">${esc(j.notes || '')}</textarea>`)}
    </form>`;
  }
  const formData = id => { const o = {}; new FormData($(id)).forEach((v, k) => { o[k] = String(v).trim(); }); return o; };

  function moveForm(kind, item, dir) {
    const list = stockList(kind);
    return `<form id="fmove">
      ${field('What?', `<div class="seg" style="width:100%"><button type="button" style="flex:1" class="${kind === 'unit' ? 'on' : ''}" data-act="moveKind" data-kind="unit">Aircon unit</button><button type="button" style="flex:1" class="${kind === 'part' ? 'on' : ''}" data-act="moveKind" data-kind="part">Part</button></div>`)}
      <div class="f pick"><label>${kind === 'part' ? 'Part' : 'Model'} *</label><input id="m_item" autocomplete="off" placeholder="Type to search…" value="${esc(item || '')}"><div class="pick-list hidden" id="m_pick"></div><div class="hint" id="m_now">${item ? 'In stock now: ' + ((list.find(x => x.item === item) || {}).now ?? '?') : ''}</div></div>
      ${field('IN or OUT *', choice('dir', ['IN', 'OUT'], dir || '', 'inout'), 'IN = came in (delivery from supplier) · OUT = went out (installed / sold / used)')}
      <div class="f2">${field('Qty *', `<input name="qty" inputmode="numeric" value="1" required>`)}${field('Date', `<input type="date" name="date" value="${today()}">`)}</div>
      ${field('Customer / supplier', `<input name="party" list="dlcust2" autocomplete="off">`)}${dl('dlcust2', custNames())}
      ${field('PO / invoice #', `<input name="ref">`)}
      ${field('Notes', `<input name="notes">`)}
    </form>`;
  }
  function openMove(kind, item, dir) {
    S.mv = {kind, item: item || ''};
    openSheet(kind === 'part' ? 'Part in / out' : 'Unit in / out', moveForm(kind, item, dir),
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveMove">Save</button>`, bindMove);
  }
  function bindMove(v) {
    const kind = S.mv.kind;
    picker($('#m_item', v), $('#m_pick', v), q => {
      q = lc(q);
      return stockList(kind).filter(x => !q || lc([x.item, x.type, x.hp, x.pn, x.group].join(' ')).includes(q)).slice(0, 40)
        .map(x => ({t: x.item, s: [kind === 'part' ? x.pn || x.group : x.type, x.hp, 'stock ' + x.now, x.cost ? (kind === 'part' ? 'LG ' + peso(x.cost) : 'cost ' + peso(x.cost, 0)) : ''].filter(Boolean).join(' · '), v: x}));
    }, o => { $('#m_item', v).value = o.t; S.mv.item = o.t; $('#m_now', v).textContent = 'In stock now: ' + o.v.now; });
    $('#m_item', v).addEventListener('input', () => { S.mv.item = ''; });
  }

  function payForm(project) {
    const recs = (D().receivables || []).slice().sort((a, b) => (b.bal > 0) - (a.bal > 0) || a.project.localeCompare(b.project));
    return `<form id="fpay">
      ${field('Customer / project *', `<select name="project" required><option value="">Choose…</option>${recs.map(r => `<option value="${esc(r.project)}" ${r.project === project ? 'selected' : ''}>${esc(r.project)} — balance ${peso(r.bal)}</option>`).join('')}</select>`, 'Not in the list? Add it first with “New contract” in Money.')}
      <div class="f2">${field('Amount ₱ *', `<input name="amount" inputmode="decimal" required placeholder="0.00">`)}${field('Date', `<input type="date" name="date" value="${today()}">`)}</div>
      ${field('Method *', choice('method', D().methods || ['Cash', 'Bank', 'GCash', 'Check', 'Other'], 'Bank'))}
      ${field('Received by', `<input name="by" value="${esc(S.me ? S.me.name : '')}">`)}
      ${field('Notes', `<input name="notes" placeholder="OR #, check #, bank ref…">`)}
    </form>`;
  }

  function cleanForm() {
    return `<div class="f pick"><label>Find the customer or serial no.</label><input id="c_q" autocomplete="off" placeholder="Type name, place or SN…"><div class="pick-list hidden" id="c_pick"></div></div>
      <div id="c_sel" class="muted small">Then choose the unit.</div>
      ${field('Cleaning date', `<input type="date" id="c_date" value="${today()}">`)}`;
  }

  function installForm(cust) {
    const g = cust ? custGroups().get(cust) : null;
    return `<form id="finst">
      ${field('Customer *', `<input name="customer" required list="dlcust3" value="${esc(cust || '')}">`)}${dl('dlcust3', custNames())}
      <div class="f2">${field('Company / project', `<input name="company" value="${esc(g ? Array.from(g.co)[0] || '' : '')}">`)}${field('Location', `<input name="location" value="${esc(g ? Array.from(g.locs)[0] || '' : '')}">`)}</div>
      ${field('Model *', `<input name="model" required list="dlmodel" placeholder="e.g. HSN12ISB/HSU12ISB">`)}${dl('dlmodel', (D().units || []).map(u => u.item))}
      <div class="f2">${field('Description', `<input name="desc" placeholder="e.g. 1.5hp Split Type">`)}${field('Qty', `<input name="qty" inputmode="numeric" value="1">`)}</div>
      <div class="f2">${field('Indoor SN', `<input name="isn" autocapitalize="characters">`)}${field('Outdoor SN', `<input name="osn" autocapitalize="characters">`)}</div>
      <div class="f2">${field('Installed', `<input type="date" name="installed" value="${today()}">`)}${field('Start-up', `<input type="date" name="startup">`)}</div>
      <div class="f2">${field('Invoice date', `<input type="date" name="invoiceDate">`)}${field('Invoice name', `<input name="invoiceName">`)}</div>
      ${field('Remarks', `<input name="remarks">`)}
      <p class="hint">If this unit came from stock, also record it as OUT in Unit in / out.</p>
    </form>`;
  }

  function jobSheet(j) {
    const k = jobKey(j.job);
    openSheet(j.customer, `
      <div class="row" style="margin-bottom:12px"><span class="jt j-${k}">${esc(j.job)}</span><span class="pill p-${esc(j.status)}">${esc(j.status)}</span></div>
      <dl class="kv"><dt>When</dt><dd>${esc(fmtLong(j.date))}${j.time ? ' · ' + esc(j.time) : ''}</dd>
        ${j.location ? `<dt>Location</dt><dd>${esc(j.location)}</dd>` : ''}${j.units ? `<dt>Units</dt><dd>${esc(j.units)}</dd>` : ''}
        ${j.tech ? `<dt>Technician</dt><dd>${esc(j.tech)}</dd>` : ''}${j.notes ? `<dt>Notes</dt><dd>${esc(j.notes)}</dd>` : ''}${j.by ? `<dt>Added by</dt><dd>${esc(j.by)}</dd>` : ''}</dl>
      <div class="f"><label>Change status</label><div class="choice">${(D().statuses || ['Scheduled', 'Confirmed', 'Done', 'Moved', 'Cancelled']).map(s => `<label><input type="radio" name="st" value="${s}" ${s === j.status ? 'checked' : ''} data-act="jobStatus" data-r="${j.r}"><span>${s === 'Done' ? '✅ ' : s === 'Cancelled' ? '✖ ' : ''}${s}</span></label>`).join('')}</div></div>
      <div class="f"><label>Photos</label><div class="btns">
        <label class="btn" style="cursor:pointer">${ic('camera')} Add photos<input type="file" accept="image/*" multiple hidden data-photo="${j.r}"></label>
        ${j.photos ? `<a class="btn" href="${esc(j.photos)}" target="_blank" rel="noopener">${ic('sheet')} Open photos</a>` : ''}</div>
        <div class="hint" id="photoMsg">Photos are saved in Google Drive, one folder per job.</div></div>
      <div class="btns"><button class="btn" data-act="jobEdit" data-r="${j.r}">${ic('edit')} Edit</button>
        ${j.location ? `<a class="btn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.location)}" target="_blank" rel="noopener">${ic('pin')} Map</a>` : ''}
        <button class="btn" data-act="quoteFor" data-cust="${esc(j.customer)}">${ic('doc')} Quotation</button>
        <button class="btn" data-act="printForm" data-f="service" data-r="${j.r}">${ic('print')} Service report</button>
        <button class="btn" data-act="printForm" data-f="startup" data-r="${j.r}">${ic('print')} Start-up report</button>
        <button class="btn" data-go="cust/${encodeURIComponent(j.customer)}">${ic('users')} Customer</button></div>`);
  }

  function arSheet(r) {
    const pays = (D().payments || []).filter(p => p.project === r.project);
    openSheet(r.project, `
      <dl class="kv"><dt>Balance now</dt><dd class="big">${peso(r.bal)}</dd><dt>Status</dt><dd><span class="pill p-${esc(r.status)}">${esc(r.status)}</span></dd>
        <dt>Contract</dt><dd>${esc(/^-?[\d.]+$/.test(String(r.contract)) ? money(r.contract) : (r.contract || '—'))}</dd><dt>Balance Nov 12</dt><dd>${peso(r.bal0)}</dd><dt>Paid since</dt><dd>${peso(r.paid)}</dd>
        ${r.ref ? `<dt>Ref</dt><dd>${esc(r.ref)}</dd>` : ''}${r.remarks ? `<dt>Remarks</dt><dd>${esc(r.remarks)}</dd>` : ''}</dl>
      <h2 style="margin-bottom:6px">Payments</h2><div class="list">${pays.map(p => `<div class="item"><span class="grow"><div class="t small">${esc(fmtD(p.date, {year: 'numeric'}))} · ${esc(p.method)}</div><div class="s">${esc([p.by, p.notes].filter(Boolean).join(' · '))}</div></span><span class="r num" style="font-weight:800;color:var(--green)">${peso(p.amount)}</span></div>`).join('') || '<div class="empty">No payments recorded since Nov 12</div>'}</div>`,
      `<button class="btn" data-act="soa" data-r="${r.r}">${ic('print')} Statement</button><button class="btn primary" data-act="pay" data-p="${esc(r.project)}">${ic('peso')} Payment received</button>`);
  }

  // ───────── printing ─────────
  const CO = {name: 'Brizair Corp.', tag: 'Authorized Seller, Installer and Service Center',
    addr: 'Bldg 7256 Unit A-2 CM Recto Avenue, Clark Freeport Zone, Pampanga',
    tel: 'Tel: (045) 499-8061 · Globe: 0927-584-4545 · Smart: 0928-343-4923', email: 'brizair.corp@gmail.com'};
  const letterhead = right => `<div class="lh"><img src="lg-logo.png" alt="LG"><div class="co"><b>${CO.name}</b><br>${CO.tag}<br><span class="tiny">${CO.addr}</span></div>
    <div class="ct">${right || `${CO.tel.split(' · ').join('<br>')}<br>${CO.email}`}</div></div>`;
  function printHtml(html, landscape) {
    const p = $('#print');
    p.innerHTML = html + `<style>@page{size:${landscape ? 'A4 landscape' : 'A4'};margin:${landscape ? '8mm' : '12mm'}}</style>`;
    document.body.classList.add('printing');
    const imgs = $$('img', p).filter(i => !i.complete);
    const go = () => { setTimeout(() => { window.print(); }, 50); };
    if (imgs.length) { let n = imgs.length; imgs.forEach(i => { i.onload = i.onerror = () => { if (--n === 0) go(); }; }); } else go();
  }
  window.addEventListener('afterprint', () => { document.body.classList.remove('printing'); });

  function quoteDoc(q) {
    if (q.type === 'invoice') return invoiceDoc(q);
    const c = qCalc(q);
    return `<div class="doc">${letterhead()}
      <h3>QUOTATION</h3>
      <table class="noline" style="margin-bottom:10px"><tr><td style="width:60%"><b>To:</b> ${esc(q.customer)}${q.company && q.company !== q.customer ? '<br>' + esc(q.company) : ''}${q.address ? '<br>' + esc(q.address) : ''}
        ${q.attn ? '<br><b>Attn:</b> ' + esc(q.attn) : ''}${q.phone ? '<br><b>Tel:</b> ' + esc(q.phone) : ''}${q.email ? '<br><b>Email:</b> ' + esc(q.email) : ''}</td>
        <td><b>Quotation No.:</b> ${esc(q.no || '(draft)')}<br><b>Date:</b> ${esc(fmtMDY(q.date))}${q.valid ? '<br><b>Valid for:</b> ' + esc(q.valid) : ''}<br><b>Prepared by:</b> ${esc(q.by || '')}</td></tr></table>
      ${q.project ? `<p><b>Subject:</b> ${esc(q.project)}</p>` : ''}
      <table><thead><tr><th style="width:36px" class="c">#</th><th>Description</th><th style="width:50px" class="c">Qty</th><th style="width:110px" class="r">Unit price</th><th style="width:120px" class="r">Amount</th></tr></thead>
      <tbody>${q.items.map((it, i) => `<tr><td class="c">${i + 1}</td><td>${esc(it.desc)}</td><td class="c">${esc(it.qty)}</td><td class="r">${money(it.price)}</td><td class="r">${money((+it.qty || 0) * (+it.price || 0))}</td></tr>`).join('')}
        <tr><td colspan="4" class="r">Subtotal</td><td class="r">${money(c.sub)}</td></tr>
        ${c.disc ? `<tr><td colspan="4" class="r">Less: discount</td><td class="r">(${money(c.disc)})</td></tr>` : ''}
        ${q.vat === 'add' ? `<tr><td colspan="4" class="r">Add: 12% VAT</td><td class="r">${money(c.vat)}</td></tr>` : ''}
        <tr><td colspan="4" class="r"><b>TOTAL AMOUNT (PHP)</b>${q.vat === 'incl' ? '<br><span class="tiny">VAT inclusive (VAT ' + money(c.vat) + ')</span>' : ''}</td><td class="r"><b>${money(c.total)}</b></td></tr></tbody></table>
      ${q.terms ? `<p style="margin-top:12px"><b>Notes & terms:</b><br>${esc(q.terms).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="sig"><div>Prepared by<br><b>${esc(q.by || '')}</b></div><div>Approved by<br><b>&nbsp;</b></div><div>Conforme (customer)<br><b>&nbsp;</b></div></div></div>`;
  }

  function invoiceDoc(q) {
    const c = qCalc(q);
    return `<div class="doc">${letterhead()}
      <h3>INVOICE</h3>
      <table class="noline" style="margin-bottom:10px"><tr><td style="width:58%"><b>Bill to:</b> ${esc(q.customer)}${q.company && q.company !== q.customer ? '<br>' + esc(q.company) : ''}${q.address ? '<br>' + esc(q.address) : ''}
        ${q.tin ? '<br><b>TIN:</b> ' + esc(q.tin) : ''}${q.style ? '<br><b>Business style:</b> ' + esc(q.style) : ''}${q.attn ? '<br><b>Attn:</b> ' + esc(q.attn) : ''}${q.phone ? '<br><b>Tel:</b> ' + esc(q.phone) : ''}</td>
        <td><b>Invoice No.:</b> ${esc(q.no || '(draft)')}<br><b>Date:</b> ${esc(fmtMDY(q.date))}${q.due ? '<br><b>Due date:</b> ' + esc(fmtMDY(q.due)) : ''}${q.termsShort ? '<br><b>Terms:</b> ' + esc(q.termsShort) : ''}
        ${q.po ? '<br><b>Customer P.O.:</b> ' + esc(q.po) : ''}${q.quoteRef ? '<br><b>Ref. quotation:</b> ' + esc(q.quoteRef) : ''}</td></tr></table>
      ${q.project ? `<p><b>Project:</b> ${esc(q.project)}</p>` : ''}
      <table><thead><tr><th style="width:36px" class="c">#</th><th>Description</th><th style="width:50px" class="c">Qty</th><th style="width:110px" class="r">Unit price</th><th style="width:120px" class="r">Amount</th></tr></thead>
      <tbody>${q.items.map((it, i) => `<tr><td class="c">${i + 1}</td><td>${esc(it.desc)}</td><td class="c">${esc(it.qty)}</td><td class="r">${money(it.price)}</td><td class="r">${money((+it.qty || 0) * (+it.price || 0))}</td></tr>`).join('')}
        <tr><td colspan="4" class="r">Subtotal</td><td class="r">${money(c.sub)}</td></tr>
        ${c.disc ? `<tr><td colspan="4" class="r">Less: discount</td><td class="r">(${money(c.disc)})</td></tr>` : ''}
        ${q.vat === 'add' ? `<tr><td colspan="4" class="r">Add: 12% VAT</td><td class="r">${money(c.vat)}</td></tr>` : ''}
        ${q.vat === 'incl' ? `<tr><td colspan="4" class="r">VATable sales</td><td class="r">${money(c.total - c.vat)}</td></tr><tr><td colspan="4" class="r">VAT (12%)</td><td class="r">${money(c.vat)}</td></tr>` : ''}
        <tr><td colspan="4" class="r"><b>TOTAL AMOUNT DUE (PHP)</b></td><td class="r"><b>${money(c.total)}</b></td></tr></tbody></table>
      ${q.pay ? `<p style="margin-top:12px"><b>Payment details:</b><br>${esc(q.pay).replace(/\n/g, '<br>')}</p>` : ''}
      ${q.terms ? `<p><b>Notes:</b><br>${esc(q.terms).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="sig" style="grid-template-columns:1fr 1fr"><div>Prepared by<br><b>${esc(q.by || '')}</b></div><div>Received by (customer) / Date</div></div>
      <p class="tiny" style="text-align:center;margin-top:18px">This document is not valid for claim of input tax. An Official Receipt / Sales Invoice will be issued upon payment.</p></div>`;
  }

  function serviceDoc(j) {
    j = j || {};
    const c = j.customer ? (custGroups().get(j.customer) || null) : null;
    const unit = c ? c.rows[0] : null;
    const L = (k, v) => `<tr><td class="lbl">${k}</td><td>${esc(v || '')}</td></tr>`;
    const meas = ['Indoor Unit Temp (°C)', 'Outdoor Unit Temp (°C)', 'Compressor Temp (°C)', 'Low Pressure (psi)', 'High Pressure (psi)', 'Running Voltage (V)'];
    return `<div class="doc">${letterhead(`<b>CONTACT US:</b><br>Tel No.: (045) 499-8061<br>Globe: 0927-584-4545<br>Smart: 0928-343-4923<br>${CO.email}`)}
      <h3>AIRCON SERVICE REPORT</h3>
      <p><span class="cb"></span>FIELD &nbsp; <span class="cb"></span>SHOP &nbsp;&nbsp;&nbsp;&nbsp; <span class="cb"></span>WARRANTY &nbsp; <span class="cb"></span>W/O WARRANTY</p>
      <table>${L('DATE', j.date ? fmtMDY(j.date) : '')}${L('CUSTOMER NAME', j.customer)}${L('ADDRESS', j.location || (unit && unit.l))}${L('COMPLAINT', j.job && /service/i.test(j.job) ? j.notes : '')}
        ${L('AIRCON # / LOCATED', '')}${L('MODEL', j.units || (unit && unit.m))}${L('SERIAL #', '')}${L('PART NUMBER', '')}${L('TECHNICIAN ASSIGNED', j.tech)}</table>
      <table style="margin-top:10px"><tr><th colspan="3">WORK PROGRESS (FULL LOAD TEST – 18°C / MAX FAN SPEED)</th><th style="width:40%">WORK DONE</th></tr>
        <tr><th></th><th class="c" style="width:16%">Before</th><th class="c" style="width:16%">After</th><td rowspan="${meas.length + 1}"></td></tr>
        ${meas.map(m => `<tr><td>${m}</td><td></td><td></td></tr>`).join('')}</table>
      <p style="margin:10px 0 4px"><b>NOTE / NEED TO BE DONE</b></p><div class="box"></div>
      <div class="sig" style="grid-template-columns:1fr 1fr"><div>Technician Assigned<br><span class="tiny">Signature over printed name</span></div><div>Customer / Customer Representative<br><span class="tiny">Signature over printed name</span></div></div>
      <p class="tiny" style="text-align:center">I confirm that the information provided in this report is correct and accurate.</p>
      <table style="margin-top:8px"><tr><th colspan="2">PAYMENT DETAILS</th></tr><tr><td style="width:50%"><span class="cb"></span>PAID &nbsp; Amount paid: ________________</td><td><span class="cb"></span>NOT YET PAID UPON SERVICE / INSTALLATION</td></tr></table></div>`;
  }

  function startupDoc(j) {
    j = j || {};
    const c = j.customer ? (custGroups().get(j.customer) || null) : null;
    const unit = c ? c.rows[0] : null;
    const yn = '<span class="cb"></span>YES &nbsp; <span class="cb"></span>NO';
    const two = (a, av, b, bv) => `<tr><td class="lbl">${a}</td><td>${esc(av || '')}</td><td class="lbl">${b}</td><td>${esc(bv || '')}</td></tr>`;
    const checks = ['Wrapped w/ polyethylene tape', 'Pipe support & hangers w/ sleeve', 'Conduit pipe for transmission wire', 'Drain pipe w/ rubber insulation', 'P-trap installed on drain line',
      'Rubber pad installed for outdoor unit', 'Complete bolts and nuts', 'Drain line flow test', 'Oil trap provided in the system', 'System flushing (dry nitrogen)', 'Leak test (398 psig) — standing press: ____ / hrs', 'System evacuation (2–4 hrs) — hours: ____'];
    return `<div class="doc"><div class="lh"><img src="lg-logo.png" alt="LG"><div class="co"><b>LG Electronics Philippines Inc.</b><br>Installed by ${CO.name} — ${CO.tag}</div><div class="ct">Rev.Form-1-070208</div></div>
      <h3>START-UP REPORT FORM (SINGLE SPLIT)</h3>
      <table>${two('Project name', j.customer, 'Date', j.date ? fmtMDY(j.date) : '')}${two('Address', j.location || (unit && unit.l), 'Contact no.', '')}${two('Installers', j.tech, 'Contact no.', '')}${two('Date purchased', '', 'Date installed', '')}</table>
      <p style="margin:10px 0 4px"><b>Indoor unit data</b></p><table>${two('Model', j.units || (unit && unit.m), 'Capacity', '')}${two('Serial no.', '', 'Area served', '')}${two('FCU type', '', '', '')}</table>
      <p style="margin:10px 0 4px"><b>Outdoor unit data</b></p><table>${two('Model', '', 'Location', '')}${two('Serial no.', '', 'Designed current', '')}</table>
      <p style="margin:10px 0 4px"><b>Piping data</b></p><table><tr><th>Gas pipe</th><th>Liquid pipe</th><th>Drain line</th></tr><tr><td>Diameter:<br>Total length:<br>Elevation:</td><td>Diameter:<br>Total length:<br>Elevation:</td><td>Diameter:<br>Material:</td></tr></table>
      <p style="margin:10px 0 4px"><b>Electrical installation data</b></p><table><tr><td class="lbl">Circuit breaker</td><td>______ Amp</td><td class="lbl">Main power supply cable</td><td>______ mm</td></tr><tr><td class="lbl">Power cable (ODU–IDU)</td><td>______ mm</td><td class="lbl">Terminal clip / lugs connected</td><td>${yn}</td></tr></table>
      <p style="margin:10px 0 4px"><b>Mechanical installation data</b></p><table><tr><td class="lbl">Pipe insulation — inside diameter</td><td>Gas ____ mm · Liquid ____ mm</td><td class="lbl">Outside diameter</td><td>Gas ____ mm · Liquid ____ mm</td></tr>
        ${checks.reduce((acc, ch, i) => acc + (i % 2 === 0 ? '<tr>' : '') + `<td colspan="1">${ch}</td><td>${yn}</td>` + (i % 2 === 1 ? '</tr>' : ''), '')}
        <tr><td class="lbl">Additional refrigerant charge</td><td colspan="3"></td></tr></table>
      <p class="tiny">Oil trap every 5–7 m (wall mounted, floor standing, multi-split), 7–10 m (ceiling cassette, ceiling concealed, ducted) when the indoor unit is below the outdoor unit. Inverter loop when the outdoor unit is below the indoor unit. Oil trap radius 5 cm.</p>
      <div class="sig"><div>Installer</div><div>Checked by</div><div>Customer</div></div></div>`;
  }

  function soaDoc(recs, name) {
    const pays = (D().payments || []).filter(p => recs.some(r => r.project === p.project)).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const tot = recs.reduce((s, r) => s + r.bal, 0);
    return `<div class="doc">${letterhead()}<h3>STATEMENT OF ACCOUNT</h3>
      <table class="noline" style="margin-bottom:10px"><tr><td><b>To:</b> ${esc(name)}</td><td class="r"><b>Date:</b> ${esc(fmtMDY(today()))}</td></tr></table>
      <table><thead><tr><th>Project / P.O.</th><th>Ref</th><th class="r">Contract price</th><th>Remarks</th><th class="r">Balance due</th></tr></thead>
      <tbody>${recs.map(r => `<tr><td>${esc(r.project)}</td><td>${esc(r.ref)}</td><td class="r">${esc(r.contract)}</td><td>${esc(r.remarks)}</td><td class="r">${money(r.bal)}</td></tr>`).join('')}
        <tr><td colspan="4" class="r"><b>TOTAL BALANCE DUE (PHP)</b></td><td class="r"><b>${money(tot)}</b></td></tr></tbody></table>
      ${pays.length ? `<p style="margin:12px 0 4px"><b>Payments received (since Nov 12, 2026)</b></p><table><tr><th>Date</th><th>Project</th><th>Method</th><th class="r">Amount</th></tr>${pays.map(p => `<tr><td>${esc(fmtMDY(p.date))}</td><td>${esc(p.project)}</td><td>${esc(p.method)}</td><td class="r">${money(p.amount)}</td></tr>`).join('')}</table>` : ''}
      <p style="margin-top:14px">Kindly settle the balance at your earliest convenience. Thank you for your business.</p>
      <div class="sig" style="grid-template-columns:1fr 1fr"><div>Prepared by<br><b>${esc(S.me ? S.me.name : '')}</b></div><div>Received by (customer)</div></div></div>`;
  }

  function reportDoc() {
    const R = S.rep, {rows, days} = monthly(R.kind, R.ym, R.all), dn = Array.from({length: days}, (_, i) => i + 1);
    const title = dObj(R.ym + '-01').toLocaleDateString('en-US', {timeZone: 'UTC', month: 'long', year: 'numeric'}).toUpperCase();
    return `<div class="doc wide"><div class="lh"><img src="lg-logo.png" alt="LG" style="height:44px"><div class="co"><b>${CO.name}</b><br><span class="tiny">${CO.addr} · ${CO.email} · ${CO.tel}</span></div></div>
      <h3 style="font-size:13px">${R.kind === 'part' ? 'AIRCON PARTS DAILY INVENTORY' : 'DAILY INVENTORY STOCKS OF AIRCON UNITS'} — PERIOD COVERED: ${title} 01–${days}</h3>
      <table><tr><th>${R.kind === 'part' ? 'ITEM DESCRIPTION' : 'MODEL'}</th><th>Beg</th><th colspan="${days}">Add: Purchases / Deliveries (IN)</th><th>Total</th><th colspan="${days}">Less: Issued / Sold (OUT)</th><th>Total</th><th>Ending</th></tr>
      <tr><th></th><th></th>${dn.map(d => `<th>${d}</th>`).join('')}<th></th>${dn.map(d => `<th>${d}</th>`).join('')}<th></th><th></th></tr>
      ${rows.map(r => `<tr><td>${esc(r.x.item)}</td><td>${r.beg}</td>${dn.map(d => `<td class="${r.ins[d] ? 'in' : ''}">${r.ins[d] || ''}</td>`).join('')}<td><b>${r.ti}</b></td>${dn.map(d => `<td class="${r.outs[d] ? 'out' : ''}">${r.outs[d] || ''}</td>`).join('')}<td><b>${r.to}</b></td><td><b>${r.end}</b></td></tr>`).join('')}</table>
      <div class="sig"><div>Prepared by<br><b>${esc(S.me ? S.me.name : '')}</b></div><div>Checked by</div><div>Approved by</div></div></div>`;
  }

  // ───────── actions ─────────
  const ACT = {
    refresh: () => refresh(),
    logout: () => { if (confirmBox('Log out on this device?')) logout(); },
    openSheet: () => window.open(D().sheetUrl || 'https://docs.google.com/spreadsheets/d/1jahKP1N3VVmiBqSXlr3xbmJxORVAWFVQNtxMLyqbCKE/edit', '_blank', 'noopener'),
    close: () => closeSheet(),
    new: () => openSheet('New', `<div class="quick" style="grid-template-columns:repeat(2,1fr);margin:0">
        <button data-act="newJob"><span class="qi c-blue">${ic('cal')}</span>New job</button>
        <button data-act="move" data-kind="unit"><span class="qi c-green">${ic('box')}</span>Unit in / out</button>
        <button data-act="move" data-kind="part"><span class="qi c-teal">${ic('wrench')}</span>Part in / out</button>
        <button data-act="pay"><span class="qi c-amber">${ic('peso')}</span>Payment received</button>
        <button data-act="clean"><span class="qi c-violet">${ic('spark')}</span>Cleaning done</button>
        <button data-act="install"><span class="qi c-blue">${ic('users')}</span>New installation</button>
        <button data-act="goQuote"><span class="qi c-red">${ic('doc')}</span>Quotation</button>
        <button data-act="goInvoice"><span class="qi c-violet">${ic('doc')}</span>Invoice</button>
        <button data-act="newAr"><span class="qi c-amber">${ic('doc')}</span>New contract (receivable)</button></div>`),
    goQuote: () => { closeSheet(); go('quote/new'); },
    bookClean: el => {
      const name = el.dataset.cust, g = custGroups().get(name);
      const rows = g ? g.rows : [];
      const loc = rows.map(r => r.l).filter(Boolean)[0] || '';
      const models = {}; rows.forEach(r => { if (r.m) models[r.m] = (models[r.m] || 0) + 1; });
      const units = Object.entries(models).map(([m, n]) => n + ' × ' + m).join(', ').slice(0, 150);
      openSheet('Book cleaning', jobForm({customer: name, job: 'Cleaning', location: loc, units, date: addDays(today(), 1)}),
        `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveJob">Save job</button>`);
    },
    goInvoice: () => { closeSheet(); go('quote/newinv'); },
    newJob: el => openSheet('New job', jobForm(null, {date: el.dataset.date, cust: el.dataset.cust}),
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveJob">Save job</button>`),
    saveJob: async el => {
      const f = formData('#fjob');
      if (!f.date || !f.customer) return toast('Date and customer are needed', true);
      el.disabled = true;
      try { await save('addJob', {job: f}, 'Job added ✓'); S.calSel = f.date; S.calYM = f.date.slice(0, 7); } catch (e) { el.disabled = false; }
    },
    job: el => { const j = (D().schedule || []).find(x => x.r === +el.dataset.r); if (j) jobSheet(j); },
    jobStatus: async el => {
      const j = (D().schedule || []).find(x => x.r === +el.dataset.r); if (!j || el.value === j.status) return;
      try { await save('updateJob', {r: j.r, id: j.id, customer: j.customer, set: {status: el.value}}, j.customer + ' → ' + el.value); } catch (e) { }
    },
    jobEdit: el => {
      const j = (D().schedule || []).find(x => x.r === +el.dataset.r); if (!j) return;
      S.editJob = j;
      openSheet('Edit job', jobForm(j), `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveEdit">Save</button>`);
    },
    saveEdit: async el => {
      const j = S.editJob, f = formData('#fjob'), set = {};
      ['date', 'time', 'job', 'customer', 'location', 'units', 'tech', 'notes'].forEach(k => { if ((f[k] || '') !== (j[k] || '')) set[k] = f[k] || ''; });
      if (!Object.keys(set).length) return closeSheet();
      el.disabled = true;
      try { await save('updateJob', {r: j.r, id: j.id, customer: j.customer, set}, 'Job updated ✓'); } catch (e) { el.disabled = false; }
    },
    calDay: el => { S.calSel = el.dataset.d; if (el.dataset.d.slice(0, 7) !== S.calYM) S.calYM = el.dataset.d.slice(0, 7); render(); },
    calNav: el => { const [y, m] = S.calYM.split('-').map(Number); const d = new Date(Date.UTC(y, m - 1 + +el.dataset.n, 1)); S.calYM = d.toISOString().slice(0, 7); S.calSel = S.calYM + '-01'; if (S.calYM === today().slice(0, 7)) S.calSel = today(); render(); },
    calToday: () => { S.calYM = today().slice(0, 7); S.calSel = today(); render(); },
    calMode: el => { S.calMode = el.dataset.m; LS.set('brz_calmode', S.calMode); render(); },
    stockKind: el => { S.stockKind = el.dataset.k; render(); },
    stockFilter: el => { S.stockFilter = el.dataset.f; render(); },
    stockItem: el => {
      const kind = el.dataset.kind, x = stockList(kind).find(i => i.r === +el.dataset.r); if (!x) return;
      const moves = stockLog(kind).filter(l => l.item === x.item).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 20);
      openSheet(x.item, `<div class="row" style="gap:16px;margin-bottom:14px"><span class="qty ${x.now > 0 ? 'has' : 'zero'}" style="height:56px;min-width:70px;font-size:28px">${x.now}</span><div><b>In stock now</b><div class="muted small">Start Nov 1: ${x.start}</div></div></div>
        <dl class="kv">${kind === 'unit' ? `<dt>Type</dt><dd>${esc(x.type)} ${esc(x.hp)}</dd><dt>SRP</dt><dd>${peso(x.srp)}</dd><dt>Cost</dt><dd>${peso(x.cost)}</dd>${x.supplier ? `<dt>Supplier</dt><dd>${esc(x.supplier)}</dd>` : ''}`
          : `<dt>Part no.</dt><dd>${esc(x.pn || '—')}</dd><dt>Group</dt><dd>${esc(x.group)}</dd><dt>Customer price</dt><dd>${peso(x.price)}</dd><dt>LG cost</dt><dd>${peso(x.cost)}</dd>`}
          ${x.notes ? `<dt>Notes</dt><dd>${esc(x.notes)}</dd>` : ''}</dl>
        <h2 style="margin-bottom:4px">Recent moves</h2><div class="list">${moves.map(l => `<div class="item"><span class="pill ${l.dir === 'IN' ? 'p-Done' : 'p-UNPAID'}">${l.dir} ${l.qty}</span><span class="grow"><div class="s">${esc([fmtD(l.date, {year: 'numeric'}), l.party, l.ref, l.by].filter(Boolean).join(' · '))}</div></span></div>`).join('') || '<div class="empty">No moves recorded</div>'}</div>`,
        `<button class="btn green" data-act="move" data-kind="${kind}" data-item="${esc(x.item)}" data-dir="IN">${ic('inbox')} IN</button><button class="btn red" data-act="move" data-kind="${kind}" data-item="${esc(x.item)}" data-dir="OUT">${ic('outbox')} OUT</button>`);
    },
    move: el => openMove(el.dataset.kind || 'unit', el.dataset.item, el.dataset.dir),
    moveKind: el => { closeSheet(); openMove(el.dataset.kind); },
    saveMove: async el => {
      const f = formData('#fmove');
      const item = S.mv.item || $('#m_item').value.trim();
      const list = stockList(S.mv.kind);
      if (!list.some(x => x.item === item)) return toast('Choose the ' + (S.mv.kind === 'part' ? 'part' : 'model') + ' from the list', true);
      if (!f.dir) return toast('Choose IN or OUT', true);
      const qty = +f.qty;
      if (!(qty > 0)) return toast('Qty must be 1 or more', true);
      const now = (list.find(x => x.item === item) || {}).now || 0;
      if (f.dir === 'OUT' && qty > now && !confirmBox(`Stock is only ${now}. Record OUT ${qty} anyway?`)) return;
      el.disabled = true;
      try { await save('stockMove', {move: Object.assign(f, {kind: S.mv.kind, item})}, `${f.dir} ${qty} × ${item} ✓`); } catch (e) { el.disabled = false; }
    },
    pay: el => openSheet('Payment received', payForm(el.dataset.p), `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="savePay">Save payment</button>`),
    savePay: async el => {
      const f = formData('#fpay');
      if (!f.project) return toast('Choose the customer / project', true);
      const amt = +String(f.amount).replace(/[,₱\s]/g, '');
      if (!(amt > 0)) return toast('Type the amount', true);
      el.disabled = true;
      try { await save('payment', {pay: Object.assign(f, {amount: amt})}, 'Payment saved ✓ ' + peso(amt)); } catch (e) { el.disabled = false; }
    },
    newAr: () => openSheet('New contract (receivable)', `<form id="far">
        ${field('Customer / project *', '<input name="project" required placeholder="e.g. Kodec P.O 03500">', 'Use a clear name. Payments are matched to this exact name.')}
        <div class="f2">${field('Contract price', '<input name="contract" inputmode="decimal">')}${field('Balance to collect ₱ *', '<input name="balance" inputmode="decimal" required>')}</div>
        ${field('Ref (quotation / invoice no.)', '<input name="ref">')}${field('Remarks', '<input name="remarks" placeholder="e.g. due Dec 4, 2026">')}</form>`,
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveAr">Save</button>`),
    saveAr: async el => {
      const f = formData('#far');
      f.balance = String(f.balance).replace(/[,₱\s]/g, ''); f.contract = String(f.contract).replace(/[₱\s]/g, '');
      if (!f.project || !(+f.balance > 0)) return toast('Name and balance are needed', true);
      el.disabled = true;
      try { await save('newReceivable', {rec: f}, 'Contract added ✓'); } catch (e) { el.disabled = false; }
    },
    ar: el => { const r = (D().receivables || []).find(x => x.r === +el.dataset.r); if (r) arSheet(r); },
    moneyTab: el => { S.money = el.dataset.t; render(); },
    soa: el => {
      const r = (D().receivables || []).find(x => x.r === +el.dataset.r); if (!r) return;
      const key = lc(r.project).split(/[\s.]+/)[0];
      const same = (D().receivables || []).filter(x => x.bal > 0 && lc(x.project).split(/[\s.]+/)[0] === key);
      openSheet('Statement of account', `<div class="f"><label>Customer name on the statement</label><input id="soa_name" value="${esc(r.project.split(/\s+P\.?O/i)[0])}"></div>
        <div class="f"><label>Include</label>${same.map(x => `<label class="row" style="padding:6px 0"><input type="checkbox" class="soa_r" value="${x.r}" checked> <span class="grow">${esc(x.project)}</span><b class="num">${peso(x.bal)}</b></label>`).join('')}</div>`,
        `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="soaPrint">${ic('print')} Print / PDF</button>`);
    },
    soaPrint: () => {
      const ids = $$('.soa_r').filter(c => c.checked).map(c => +c.value);
      const recs = (D().receivables || []).filter(x => ids.includes(x.r));
      if (!recs.length) return toast('Choose at least one', true);
      const name = $('#soa_name').value.trim();
      closeSheet(); printHtml(soaDoc(recs, name));
    },
    clean: () => openSheet('Cleaning done', cleanForm(), `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveClean" id="c_save" disabled>Save</button>`, v => {
      picker($('#c_q', v), $('#c_pick', v), q => {
        q = lc(q).trim(); if (q.length < 2) return [];
        const w = q.split(/\s+/);
        return (D().customers || []).filter(c => { const t = lc([c.c, c.co, c.l, c.m, c.isn, c.osn].join(' ')); return w.every(x => t.includes(x)); }).slice(0, 30)
          .map(c => ({t: c.c + ' · ' + (c.m || ''), s: [c.l, c.isn ? 'SN ' + c.isn : '', c.lc ? 'last cleaned ' + fmtD(c.lc, {year: 'numeric'}) : ''].filter(Boolean).join(' · '), v: c}));
      }, o => { S.cl = o.v; $('#c_q', v).value = o.v.c; $('#c_sel', v).innerHTML = `<b>${esc(o.v.c)}</b> · ${esc(o.v.m || '')} ${o.v.isn ? '· SN ' + esc(o.v.isn) : ''}`; $('#c_save').disabled = false; });
    }),
    cleanRow: el => {
      const c = (D().customers || []).find(x => x.r === +el.dataset.r); if (!c) return;
      S.cl = c;
      openSheet('Cleaning done', `<p><b>${esc(c.c)}</b><br>${esc([c.m, c.l, c.isn ? 'SN ' + c.isn : ''].filter(Boolean).join(' · '))}</p>${field('Cleaning date', `<input type="date" id="c_date" value="${today()}">`)}`,
        `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveClean">Save</button>`);
    },
    saveClean: async el => {
      const c = S.cl; if (!c) return;
      el.disabled = true;
      try { await save('cleaningDone', {r: c.r, customer: c.c || '', isn: c.isn || '', date: $('#c_date').value}, 'Cleaning saved ✓ next cleaning in 6 months'); } catch (e) { el.disabled = false; }
    },
    install: el => openSheet('New installation', installForm(el.dataset.cust), `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="saveInstall">Save</button>`),
    saveInstall: async el => {
      const f = formData('#finst');
      if (!f.customer || !f.model) return toast('Customer and model are needed', true);
      el.disabled = true;
      try { await save('addInstall', {inst: f}, 'Installation saved ✓'); } catch (e) { el.disabled = false; }
    },
    quoteFor: el => go('quote/new:' + encodeURIComponent(el.dataset.cust)),
    qAddLine: el => { S.qd.items.push({desc: el.dataset.d, qty: 1, price: ''}); qRender(); const ins = $$('.qline input[data-f=desc]'); const last = ins[ins.length - 1]; if (last && !el.dataset.d) last.focus(); },
    qDel: el => { S.qd.items.splice(+el.dataset.i, 1); qRender(); },
    qSave: async el => {
      const q = qRead();
      if (!q.customer) return toast('Customer name is needed', true);
      if (!q.items.length) return toast('Add at least one item', true);
      el.disabled = true;
      try {
        const isNewInv = q.type === 'invoice' && !q.no, addAr = isNewInv && $('#q_ar') && $('#q_ar').checked;
        toast('Saving…', false, 60000);
        const r = await call('saveQuote', {quote: q, withData: !addAr});
        q.no = r.no;
        if (addAr) {
          try { const r2 = await call('newReceivable', {withData: true, rec: {project: (q.customer + ' ' + r.no).slice(0, 110), ref: r.no + (q.po ? ' / PO ' + q.po : ''), contract: String(q.total), balance: String(q.total), remarks: q.due ? 'due ' + fmtD(q.due, {year: 'numeric'}) : ''}}); r.data = r2.data; }
          catch (e) { toast('Invoice saved, but could not add to Money: ' + e.message, true); }
        }
        toast('Saved ✓ ' + r.no);
        if (el.dataset.print) printHtml(quoteDoc(q));
        S.forceRender = true;
        if (location.hash !== '#quote/' + r.no) history.replaceState(null, '', '#quote/' + r.no);
        if (applyData(r.data)) { S.forceRender = false; render(); } else await refresh(true);
      } catch (e) { toast(e.message, true); }
      el.disabled = false;
    },
    qStatus: () => {
      const q = S.qd;
      const inv = q.type === 'invoice';
      openSheet(inv ? 'Invoice status' : 'Quotation status', `<p class="muted">${esc(q.no)} · ${esc(q.customer)}</p>${choice('qst', inv ? ['Unpaid', 'Partially paid', 'Paid', 'Cancelled'] : ['Draft', 'Sent', 'Accepted', 'Lost'], q.status)}
        <p class="hint mt">${inv ? 'Payments are recorded in Money → Payment received.' : 'Accepted? Tap “Make invoice”, or add it in Money → New contract so the balance is tracked.'}</p>`,
        `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="qStatusSave">Save</button>`);
    },
    qStatusSave: async el => {
      const v = ($('input[name=qst]:checked') || {}).value; if (!v) return;
      el.disabled = true;
      try { await save('quoteStatus', {no: S.qd.no, status: v}, 'Status: ' + v); } catch (e) { el.disabled = false; }
    },
    docTab: el => { S.docTab = el.dataset.t; render(); },
    lang: () => {
      if (!window.BRZ_I18N) return;
      window.BRZ_I18N.set(lang() === 'ko' ? 'en' : 'ko');
      closeSheet(); shell(); render();
    },
    rate: async el => {
      const good = !!el.dataset.good;
      let why = '';
      if (!good) { why = window.prompt(tr('What was wrong or missing? (optional)')) || ''; }
      const a = (S.D.ask || []).find(x => x.id === el.dataset.id);
      try { await call('askRate', {id: el.dataset.id, good, why}); if (a) a.rating = good ? 'good' : 'bad: ' + why; toast(good ? 'Thanks! ✓' : 'Thanks — saved so we can teach GPT'); render(); } catch (e) { toast(e.message, true); }
    },
    help: () => {
      LS.set('brz_seen_help', true);
      const r = S.route || 'home';
      const tips = {
        schedule: ['Tap a day to see its jobs. Tap a job to change status (Confirmed / Done) or print the Service report.', 'New job: the blue “New job” button.'],
        stock: ['Tap a model to see stock and recent moves, then IN or OUT.', 'Unit came from the supplier = IN. Installed / sold = OUT.'],
        customers: ['Search by name, place, model or serial number.', 'Open a customer → “Cleaned” after cleaning; next cleaning is set 6 months later.'],
        money: ['Customer paid → “Payment received”. The balance updates by itself.', 'New sale on credit → “New contract”. “Statement” prints a statement of account.'],
        quotes: ['New quotation → add items from stock (price fills in) → Save & print / PDF.', 'Quotation accepted → open it → “Make invoice”.'],
        quote: ['Type the customer, add items from stock, then Save & print / PDF.', 'Invoices can add themselves to Money so payments are tracked.'],
        ask: ['Ask like you talk to a person. English, Tagalog, Kapampangan or Korean.', 'Answer wrong or missing? Tap 👎 — then upload the right info in Materials for AI.'],
        materials: ['Upload price lists, LG brochures, warranty rules, sample documents, photos of papers.', 'Or tap “Write a rule / answer” and type it. GPT reads it from the next question.'],
        report: ['Choose units or parts and the month → Print / PDF for LG.']
      }[r] || ['Tap the big buttons on Home for daily work: New job, Unit in / out, Part in / out, Payment, Cleaning done, Quotation.', 'Not sure? Ask GPT (bottom middle) — e.g. “How do I record a unit we installed today?”'];
      openSheet('How to use', `
        <div class="list">${tips.map(t => `<div class="item" style="align-items:flex-start"><span class="qi c-blue" style="width:30px;height:30px;font-weight:800">✓</span><span class="grow" style="white-space:normal">${esc(t)}</span></div>`).join('')}</div>
        <div class="card mt" style="background:var(--brand-2);box-shadow:none"><b>Ask GPT in your language</b><div class="small" style="margin-top:4px">English · Tagalog / Taglish · Kapampangan · 한국어</div></div>
        <div class="card mt" style="box-shadow:none;border:1px solid var(--line)"><b>Everything you save goes to the BRIZAIR Office Sheet.</b><div class="small muted" style="margin-top:4px">Nothing is deleted. Made a mistake? Open it and fix it, or record a correction.</div></div>`,
        `<button class="btn" data-go="help">All instructions</button><button class="btn primary" data-act="close">OK, got it</button>`);
    },
    printForm: el => {
      const j = el.dataset.r ? (D().schedule || []).find(x => x.r === +el.dataset.r) : null;
      closeSheet(); printHtml(el.dataset.f === 'startup' ? startupDoc(j) : serviceDoc(j));
    },
    printReport: () => printHtml(reportDoc(), true),
    kNote: () => openSheet('Write a rule / answer', `<form id="fk">${field('Title', '<input name="title" placeholder="e.g. Cleaning price, Warranty rule">')}
        ${field('What should GPT know?', '<textarea name="text" style="min-height:180px" placeholder="e.g. Cleaning is ₱1,500 per split-type unit. Floor stand ₱3,000. Free check-up within 1 year of installation."></textarea>')}</form>`,
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="kNoteSave">Save</button>`),
    kNoteSave: async el => {
      const f = formData('#fk'); if (!f.text) return toast('Write something first', true);
      el.disabled = true;
      try { await save('kNote', f, 'Saved ✓ GPT will use it'); } catch (e) { el.disabled = false; }
    },
    kUpload: () => openSheet('Upload for GPT', `<form id="fku">
        <div class="f"><label>File or photo *</label><input type="file" name="file" id="ku_file" accept="image/*,.pdf,.xlsx,.xls,.docx,.doc,.csv,.txt,.pptx"><div class="hint">PDF, Excel, Word, photo of a document (max 15 MB)</div></div>
        ${field('Title', '<input name="title" placeholder="e.g. LG price list Nov 2026">')}
        ${field('Note for GPT (optional)', '<input name="note" placeholder="e.g. Use this for quotations from Nov 2026">')}</form>`,
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="kUploadSave">Upload</button>`),
    kUploadSave: async el => {
      const fi = $('#ku_file'), file = fi && fi.files[0];
      if (!file) return toast('Choose a file first', true);
      if (file.size > 15 * 1024 * 1024) return toast('File is too big (max 15 MB)', true);
      const f = formData('#fku');
      el.disabled = true; el.textContent = 'Uploading… (GPT is reading the file)';
      try {
        const b64 = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(file); });
        const r = await call('kUpload', {b64, name: file.name, mime: file.type, title: f.title || file.name, note: f.note, withData: true});
        closeSheet();
        if (applyData(r.data)) render(); else refresh(true);
        toast(r.chars ? `Uploaded ✓ GPT can read ${r.chars.toLocaleString()} characters` : 'Uploaded ✓ (no text found — add a note so GPT knows what it is)');
      } catch (e) { toast(e.message, true); el.disabled = false; el.textContent = 'Upload'; }
    },
    kHide: async el => {
      if (!confirmBox('Remove this from GPT\'s materials?')) return;
      try { await save('kHide', {id: el.dataset.id}, 'Removed'); } catch (e) { }
    },
    repKind: el => { S.rep.kind = el.dataset.k; render(); }
  };
  function confirmBox(msg) { return window.confirm(tr(msg)); }

  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); closeSheet(); go(g.dataset.go); return; }
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) {
      if (a.tagName === 'INPUT' && a.type === 'radio') return;  // handled on change
      e.preventDefault(); ACT[a.dataset.act](a);
    }
  });
  async function uploadPhotos(input) {
    const j = (D().schedule || []).find(x => x.r === +input.dataset.photo);
    const files = Array.from(input.files || []);
    if (!j || !files.length) return;
    const msg = $('#photoMsg');
    let done = 0, got = false;
    for (const f of files) {
      try {
        if (msg) msg.textContent = tr('Uploading photo') + ` ${done + 1} / ${files.length}…`;
        const b64 = await shrinkPhoto(f);
        const last = done === files.length - 1;
        const r = await call('jobPhoto', {r: j.r, id: j.id, customer: j.customer, b64, mime: 'image/jpeg', last, count: files.length, withData: last});
        done++;
        if (last) got = applyData(r.data);
      } catch (e) { toast(e.message, true); break; }
    }
    if (done) { closeSheet(); if (got) render(); else await refresh(true); toast('📷 ' + done + ' ' + tr('photo(s) saved ✓')); }
  }
  /** phone photos are big: resize to max 1600 px JPEG (about 300 KB) before upload */
  function shrinkPhoto(file) {
    return new Promise((ok, no) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1600 / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        ok(c.toDataURL('image/jpeg', 0.82).split(',')[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error('Could not read this photo')); };
      img.src = url;
    });
  }
  document.addEventListener('change', e => {
    if (e.target.matches && e.target.matches('input[data-photo]')) { uploadPhotos(e.target); return; }
    const a = e.target.closest('input[type=radio][data-act]');
    if (a && ACT[a.dataset.act]) ACT[a.dataset.act](a);
  });
  window.addEventListener('hashchange', render);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.t && Date.now() - (S._lastRefresh || 0) > 120000) { S._lastRefresh = Date.now(); refresh(true); } });

  function start() {
    shell();
    render();
    S._lastRefresh = Date.now();
    refresh(!!S.D);
  }
  if (S.t) start(); else renderLogin();
  window.BRZ = {S, render, refresh};
})();
