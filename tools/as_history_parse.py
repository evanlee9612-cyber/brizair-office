"""Ladie 'AS SUMMARY REPORT' 엑셀(손님별 탭) → SERVICE HISTORY 줄 목록(JSON).
사용: .venv-xl/bin/python -I as_history_parse.py <xlsx> <out.json> [source label]"""
import sys, json, datetime, openpyxl

COLS = {
  'name': ['CUSTOMER NAME', 'COMPANY/CUSTOMER NAME', 'CUSTOMER NAME/ADDRESS', 'AREA/POOL VILLA #', 'UNIT'],
  'loc': ['ACU LOCATION', 'ACU LOC', 'ROOM #', 'ACU # / LOCATION', 'BRANCH', 'CUSTOMER HOUSE LOCATION'],
  'addr': ['CUSTOMER ADDRESS', 'ADDRESS', 'CUSTOMER ADDRESSS'],
  'svc': ['SERVICE REQUEST / COMPLAINT', 'TYPE OF SERVICE / COMPLAIN'],
  'find': ['TECHNICAL FINDINGS', 'WORKING/NOT WORKING'],
  'model': ['MODEL'],
  'work': ['WORK DONE', 'ACTION TAKEN/WORKS DONE', 'ACTION TAKEN / WORKS DONE'],
  'tech': ['ASSIGNED TECHNICIANS'],
  'qty': ['QTY'], 'amount': ['AMOUNT'],
  'total': ['TOTAL', 'TOTAL AMOUN', 'TOTAL AMOUNT', 'GRAND TOTAL AMOUNT DUE'],
  'pay': ['PAYMENT STATUS', 'PAYMENT STAUS', 'REMARKS'],
}
SKIP = {'MAIN', 'Warehouse', 'SH Pool villa Summary ACU'}  # not service history (index / used-unit stock / unit list)
def s(v):
    if v is None: return ''
    if isinstance(v, float) and v.is_integer(): v = int(v)
    return ' '.join(str(v).split())
def dt(v):
    if isinstance(v, datetime.datetime): return v.date().isoformat()
    if isinstance(v, datetime.date): return v.isoformat()
    return ''

def parse(path, label):
    wb = openpyxl.load_workbook(path, data_only=True)
    out, skipped = [], []
    for tab in wb.sheetnames:
        if tab in SKIP: skipped.append(tab); continue
        ws = wb[tab]; idx = None; last = None; grp = ''
        rows = list(ws.iter_rows(values_only=True))
        for i, row in enumerate(rows, start=1):
            cells = [s(v) for v in row[:20]]
            up = [c.upper() for c in cells]
            if idx is None:
                if 'DATE' in up and any('WORK' in c or 'ACTION' in c for c in up):
                    idx = {'date': up.index('DATE')}
                    for k, names in COLS.items():
                        for j, c in enumerate(up):
                            if c in names and k not in idx: idx[k] = j
                continue
            if not any(cells): continue
            if up[idx['date']] == 'DATE': continue  # repeated header
            g = lambda k: cells[idx[k]] if k in idx and idx[k] < len(cells) else ''
            filled = [c for c in cells if c]
            d = dt(row[idx['date']]) if idx['date'] < len(row) else ''
            draw = '' if d else g('date')
            rec = {k: g(k) for k in COLS}
            rec.update(cust=tab, date=d or draw, src=f'{label} · {tab}!{i}')
            others = [rec[k] for k in COLS if rec[k]]
            if draw and not others:  # text only in the DATE column = group heading (building / unit / address)
                grp = draw; out.append({'cust': tab, 'date': '', 'note': draw, 'head': 1, 'src': rec['src']}); last = None; continue
            if not d and not draw and len(filled) == 1 and not rec['work']:
                out.append({'cust': tab, 'date': '', 'note': filled[0], 'src': rec['src']}); continue  # memo line
            if grp: rec['grp'] = grp
            if not d and not draw and last:  # same visit, next line
                rec['date'] = last['date']; rec['cont'] = 1
                for k in ('name', 'loc', 'addr', 'tech'):
                    if not rec[k]: rec[k] = last[k]
            out.append(rec); last = rec
        if idx is None and tab not in skipped: skipped.append(tab)
    return out, skipped

if __name__ == '__main__':
    rows, skipped = parse(sys.argv[1], sys.argv[3] if len(sys.argv) > 3 else 'Excel AS SUMMARY')
    json.dump(rows, open(sys.argv[2], 'w'), ensure_ascii=False)
    tabs = {r['cust'] for r in rows}
    print('rows', len(rows), 'tabs', len(tabs), 'notes', sum(1 for r in rows if 'note' in r), 'cont', sum(1 for r in rows if r.get('cont')),
          'nodate', sum(1 for r in rows if not r.get('date') and 'note' not in r), 'skipped', skipped)
