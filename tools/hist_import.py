"""SERVICE HISTORY 탭에 엑셀 기록 넣기 (Sir Kim PIN으로 로그인 → histImport → 로그아웃).
사용: /usr/bin/python3 hist_import.py <hist.json> "<source label prefix>"
- 출처가 prefix로 시작하는 예전 줄만 지우고 새로 넣는다(웹사이트에서 넣은 줄은 그대로).
- 비밀값(PIN·주소)은 ~/.config/brizair/ 에서 읽고 화면에 찍지 않는다."""
import sys, json, os, urllib.request
CFG = os.path.expanduser('~/.config/brizair/')
API = open(CFG + 'office_api_url').read().strip()
PIN = [l.split('\t')[2].strip() for l in open(CFG + 'office_pins.txt') if l.split('\t')[1] == 'owner'][0]
def call(a, **b):
    b['a'] = a
    req = urllib.request.Request(API, data=json.dumps(b).encode(), method='POST')
    with urllib.request.urlopen(req, timeout=300) as r: j = json.loads(r.read())
    if not j.get('ok'): raise SystemExit(f'{a} failed: {j.get("msg") or j.get("error")}')
    return j
rows, prefix = json.load(open(sys.argv[1])), sys.argv[2]
t = call('login', pin=PIN, device='Evan import (service history)')['t']
try:
    print('start', {k: v for k, v in call('histImport', t=t, mode='start', prefix=prefix).items() if k != 'ok'})
    N = 400
    for i in range(0, len(rows), N):
        r = call('histImport', t=t, mode='add', rows=rows[i:i + N], base=i, last=i + N >= len(rows), label=prefix)
        print('add', i, r.get('added'), 'to row', r.get('to'))
    idx = call('hist', t=t)['list']
    print('customers', len(idx), 'lines', sum(g['n'] for g in idx))
finally:
    call('logout', t=t)
