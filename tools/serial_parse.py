"""Ladie 'AIRCON UNIT INVENTORY W. SERIAL' 엑셀 → UNIT SERIALS 줄(json).
사용: .venv-xl/bin/python -I serial_parse.py <xlsx> <out.json> <boot.json(재고 UNITS 대조용)> [주별 탭 이름, 기본 = Sales Report 앞의 마지막 탭]
- 주별 탭: 모델 블록마다 기계 1대(또는 1세트) = 1줄, 상태 In stock (HS18IBA 'Installed Mr. Noh' 실외기 = Other, 노 사장님 보류 현장)
- Sales Report: 설치된 기계 = 상태 Installed (손님·설치일·손님가)
- Other Units: 상태 Other
- 같은 시리얼이 두 번 나오면 Sales Report 쪽만 남김"""
import sys, json, re, datetime, openpyxl

xlsx, out, bootf = sys.argv[1], sys.argv[2], sys.argv[3]
wb = openpyxl.load_workbook(xlsx, data_only=True)
names = [w.title for w in wb.worksheets]
week = sys.argv[4] if len(sys.argv) > 4 else names[names.index('Sales Report') - 1]
units = json.load(open(bootf))['units']
SRC = 'Excel SERIAL ' + datetime.date.today().isoformat()


def s(v):
    if v is None: return ''
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return re.sub(r'\s+', ' ', str(v)).strip()


def num(v):
    try: return float(v)
    except (TypeError, ValueError): return None


def code(t): return re.sub(r'[^A-Z0-9]', '', t.upper())


def is_sn(t):  # serial = capitals + digits (spaces ok, e.g. Haier 'AAD4M EE000 0XBS8 V0372'), no plain words like 'Installed', 'OUTDOOR'
    return bool(re.fullmatch(r'[A-Z0-9][A-Z0-9 \-/]{5,}', t or '')) and (bool(re.search(r'[A-Z]', t)) or len(t) >= 8) and bool(re.search(r'\d', t)) \
        and not any(len(w) >= 4 and w.isalpha() for w in t.split())


def unit_for(models, cost, panel_hint=''):
    """UNITS item for this machine: name contains the model code; several → same cost; still several → has stock; else ''"""
    cs = [code(x) for m in models if m for x in {m, m.split('/')[0]} if len(code(x)) >= 5]
    hits = [u for u in units if any(c and c in code(u['item'].split(' ')[0] if u['item'].startswith('PT-') else u['item']) for c in cs)]
    if panel_hint:
        hits = [u for u in hits if ('multi' in u['item'].lower()) == ('multi' in panel_hint.lower()) or 'excess' in u['item'].lower()] or hits
    if len(hits) > 1 and cost is not None:
        hits = [u for u in hits if (u['cost'] or 0) == cost] or hits
    if len(hits) > 1:
        hits = [u for u in hits if u['now'] > 0] or hits
    return hits[0]['item'] if len(hits) == 1 else (hits[0]['item'] if hits and len({h['item'] for h in hits}) == 1 else '')


rows = []
# ---------- weekly tab ----------
ws = wb[week]
g = lambda r, c: s(ws.cell(r, c).value)
section, r, maxr = '', 1, ws.max_row
while r <= maxr:
    a = g(r, 1)
    if a.upper().startswith('TOTAL AMOUNT'): break
    if a and a != 'MODEL' and not any(g(r, c) for c in range(2, 14)) and a.isupper(): section = a
    if a != 'MODEL':
        r += 1; continue
    hd, hh, hl = g(r, 4), g(r, 8), g(r, 12)
    pair = hl.upper().startswith('UNIT PRICE')  # indoor + outdoor block
    extra_h = ' '.join(x for x in [hd.partition(' ')[2], hh.partition(' ')[2]] if '(' in x).strip()
    hd, hh = hd.split(' ')[0], hh.split(' ')[0]
    r += 1
    if not g(r, 1) and re.search(r'SERIAL|INDOOR UNIT', g(r, 4), re.I): r += 1  # sub-header row
    head_r = r - 2
    model = date = desc = ''
    price = None
    disc = None
    while r <= maxr and 'TOTAL' not in (g(r, 4) + g(r, 5)).upper():
        if g(r, 1): model = g(r, 1)
        if g(r, 3): date = g(r, 3)
        if g(r, 2): desc = g(r, 2)
        if pair:
            isn, osn, po, po2 = g(r, 4), g(r, 8), g(r, 6), g(r, 10)
            p = num(ws.cell(r, 12).value); d_ = num(ws.cell(r, 13).value)
        else:
            isn, osn, po, po2 = g(r, 4), '', g(r, 6), ''
            p = num(ws.cell(r, 8).value); d_ = num(ws.cell(r, 9).value)
        if p is not None and p > 0: price = p
        if d_ is not None: disc = d_
        note = ''
        if isn and not is_sn(isn): note, isn = isn, ''
        if is_sn(isn) or is_sn(osn):
            imod = '' if re.match(r'SERIAL', hd, re.I) else hd
            omod = '' if re.match(r'SERIAL|UNIT PRICE|LG PRICE', hh, re.I) else hh
            single_out = not pair and re.search(r'OUTDOOR', hd, re.I)
            o = {'status': 'In stock', 'model': ('/'.join(x for x in [imod or model, omod] if x) if is_sn(isn) else omod or model) if pair else model, 'desc': desc,
                 'po': ' / '.join(dict.fromkeys(x for x in [po, po2] if x)), 'din': date, 'cost': price or 0, 'src': SRC + ' · ' + week + ' row ' + str(r)}
            if model.startswith('PT-'): o['psn'] = isn
            elif single_out: o['osn'] = isn
            else:
                if isn: o['isn'] = isn
                if osn: o['osn'] = osn
            if note:
                o['notes'] = 'Indoor: ' + note
                if 'noh' in note.lower(): o['status'], o['cust'], o['notes'] = 'Other', 'Mr. Noh / ALFPK Construction Inc.', 'Outdoor only in our storage, project on hold (not our stock). Indoor: ' + note
            if disc: o['notes'] = (o.get('notes', '') + ' · ' if o.get('notes') else '') + 'disc %g%%' % round(disc * 100)
            if extra_h: o['notes'] = (o.get('notes', '') + ' · ' if o.get('notes') else '') + extra_h.strip('() ').capitalize()
            if section: o['notes'] = (o.get('notes', '') + ' · ' if o.get('notes') else '') + section.title()
            if o['status'] == 'In stock':
                o['unit'] = unit_for([imod or model, model], price, section)
            rows.append(o)
        r += 1
    r += 1

# ---------- Sales Report ----------
ws = wb['Sales Report']
g = lambda r, c: s(ws.cell(r, c).value)
date = cust = rem = im = om = ''
sold = []
for r in range(12, ws.max_row + 1):
    if not any(g(r, c) for c in range(1, 13)): continue
    if g(r, 1): date = g(r, 1)
    if g(r, 2): cust = g(r, 2)
    if g(r, 3): im = g(r, 3)
    if g(r, 5): om = g(r, 5)
    isn, osn, pm, psn = g(r, 4), g(r, 6), g(r, 7), g(r, 8)
    if not (isn or osn): continue
    o = {'status': 'Installed', 'model': im + ('/' + om if om and om != im else ''), 'isn': isn, 'osn': osn, 'cust': cust, 'idate': date,
         'cost': num(ws.cell(r, 9).value) or 0, 'price': num(ws.cell(r, 10).value) or 0, 'po': g(r, 12), 'src': SRC + ' · Sales Report row ' + str(r)}
    if pm and pm.upper() != 'N/A': o['pmodel'] = pm
    if psn and psn.upper() != 'N/A': o['psn'] = psn
    nt = [x for x in [g(r, 11), g(r, 13), g(r, 15).lstrip('< ').strip()] if x]
    if nt: o['notes'] = ' · '.join(nt)
    o['unit'] = unit_for([im], o['cost'])
    sold.append(o)

# ---------- Other Units ----------
ws = wb['Other Units']
g = lambda r, c: s(ws.cell(r, c).value)
other, label, hdr = [], '', 0
for r in range(1, ws.max_row + 1):
    a = g(r, 1)
    if a == 'MODEL': hdr = r; continue
    if a and not g(r, 2) and not g(r, 4): label = a; continue
    if not a or not hdr: continue
    isn = g(r, 4)
    if not is_sn(isn): continue
    pair = g(hdr, 12).upper().startswith('LG PRICE')
    osn = g(r, 8) if pair and is_sn(g(r, 8)) else ''
    extra = [x for x in [g(r, 8) if pair and not osn else '', '' if pair else g(r, 10)] if x and not is_sn(x)]
    o = {'status': 'Other', 'model': a, 'desc': g(r, 2), 'po': ' / '.join(dict.fromkeys(x for x in [g(r, 6), g(r, 10) if pair else ''] if x)), 'cost': num(ws.cell(r, 12 if pair else 8).value) or 0,
         'src': SRC + ' · Other Units row ' + str(r), 'notes': ' · '.join(x for x in [label if not label.startswith('For The Month') else ''] + extra if x)}
    if re.search(r'OUTDOOR', g(hdr, 4), re.I): o['osn'] = isn
    else: o['isn'] = isn
    if osn: o['osn'] = osn
    if g(r, 7) == '0' or (pair and g(r, 11) == '0'): o['notes'] = (o['notes'] + ' · ' if o['notes'] else '') + 'qty 0 in Excel'
    other.append(o)

sold_sn = {x for o in sold for x in (o.get('isn'), o.get('osn')) if x}
dup = [o for o in rows if o.get('isn') in sold_sn or o.get('osn') in sold_sn]
rows = [o for o in rows if o not in dup]
allr = rows + sold + other
for o in allr:
    for k in list(o):
        if o[k] in ('', None): del o[k]
json.dump(allr, open(out, 'w'), ensure_ascii=False, indent=1)
print('week tab', week, '| in stock', sum(o['status'] == 'In stock' for o in rows), '| other(week)', sum(o['status'] == 'Other' for o in rows),
      '| installed', len(sold), '| other units', len(other), '| dropped dup', len(dup), '| total', len(allr))
