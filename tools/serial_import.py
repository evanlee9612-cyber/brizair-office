"""UNIT SERIALS 탭에 엑셀 시리얼 넣기 (owner PIN 로그인 → histImport k=serials → 로그아웃).
사용: /usr/bin/python3 -I serial_import.py <serials.json> "Excel SERIAL"
- 출처가 prefix로 시작하는 예전 줄만 지우고 새로 넣는다(웹사이트에서 넣은·고친 줄 중 출처가 Website인 줄은 그대로).
- 주의: 엑셀에서 온 줄을 사이트에서 'Installed'로 바꿨다면 다시 넣기 전에 그 줄 상태를 확인할 것(다시 넣으면 엑셀 내용으로 돌아감).
- 비밀값(PIN·주소)은 ~/.config/brizair/ 에서 읽고 화면에 찍지 않는다."""
import sys, json
exec(open(__file__.replace('serial_import.py', 'hist_import.py')).read().split('rows, prefix')[0])
rows, prefix = json.load(open(sys.argv[1])), sys.argv[2]
t = call('login', pin=PIN, device='Evan import (unit serials)')['t']
try:
    print('start', {k: v for k, v in call('histImport', t=t, k='serials', mode='start', prefix=prefix).items() if k != 'ok'})
    r = call('histImport', t=t, k='serials', mode='add', rows=rows, base=0, last=True, label=prefix)
    print('added', r.get('added'), 'to row', r.get('to'))
    got = call('boot', t=t, withData=False).get('serials', [])
    from collections import Counter
    print('serials in sheet', len(got), dict(Counter(x.get('status') for x in got)))
finally:
    call('logout', t=t)
