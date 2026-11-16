# 매일 점검: BRIZAIR 사이트를 Ladie가 편하게 쓰도록 다듬기 (2026-11-16 Evan 지시)

Evan의 말: "레이디가 쓰게 편하게 최적화를 계속 해주는게 좋을거같아." 범위 안의 사이트 수정과 배포는 묻지 말고 진행한다.

## 매일 18:30(마닐라)에 할 일 — 토큰 아끼기: 아래 파일만 읽는다
1. 지난 점검 이후 기록 읽기 (Sheets MCP, 시트 `1jahKP1N3VVmiBqSXlr3xbmJxORVAWFVQNtxMLyqbCKE`)
   - `'APP LOG'!A:D`: 마지막 점검 시각은 `logs/daily_check.log` 맨 아래 줄에 있다.
   - `ASK!A:F`: 새 질문과 GPT 답. "할 수 있어?", "추가해 줘" 같은 요청이 있는지 본다.
   - KNOWLEDGE 새 줄: 직원이 올린 파일. Evan 규칙에 따라 업로드 파일은 읽고 반영한다. 큰 파일은 `~/Library/CloudStorage/GoogleDrive-evanlee9612@gmail.com/내 드라이브/BRIZAIR Office (Bot + Sheets)/Materials for AI (uploads)/`에서 복사해 `/tmp/briz_venv`(openpyxl)로 연다.
2. 불편 신호 찾기
   - 같은 손질을 여러 번 반복하는 것 (예: 메모를 손으로 고치기, Moved 후 새 일정을 따로 만들기)
   - 메모에 상태를 글로 적는 것 (예: "PENDING")
   - GPT에게 "어떻게 해?"라고 물은 것 = 버튼이나 기능이 없거나 찾기 어렵다는 뜻
   - 안 쓰는 기능 (재고 입출고, 입금 기록 등)
3. 작고 확실한 개선은 바로 한다
   - 사이트는 `web/`만 고친다. 바꾼 뒤 `node`로 문법을 검사하고, 시범판(`?demo`, PIN 222222)을 headless Chrome으로 시험한다. 방법은 `/tmp/briz_tools/cdp_*.mjs`를 참고한다(없으면 같은 방식으로 새로 쓴다).
   - `web/index.html`의 `?v=`를 올리고 커밋한 뒤 배포한다: `git branch -f gh-pages "$(git subtree split --prefix web main)" && git push origin main gh-pages`
   - 바뀐 기능은 `app.js`의 NOTICE(id를 새 날짜로, items 최대 4개)와 `i18n.js` 한국어에 반영해 팝업으로 알린다.
   - 직원이 실제로 쓰는 데이터(시트)를 고칠 때는 먼저 Drive에 백업 사본을 만든다.
4. 서버(Code.gs)를 고쳐야 하는 일은 하지 않는다. 메모해 두고 Evan 보고에 "서버 필요"로 적는다. 배포를 Evan 계정 브라우저에서 해야 하기 때문이다.
5. 보고: 고친 것이 있거나 Evan이 결정할 일이 있을 때만 보낸다. 3줄 이내로 쓰고 `python3 -I /Users/evanlee/claude-test/clark-travel/tools/inbox/send_evan.py 파일`로 보낸다. 별일 없으면 보내지 않는다.
6. `logs/daily_check.log`에 한 줄을 추가한다: `YYYY-MM-DD HH:MM | 본 기록 n건 | 한 일`

## 지켜야 할 것
- PIN(`~/.config/brizair/office_pins.txt`)과 시트 키는 절대 출력하지 않는다.
- 금액·입금 데이터는 추측해서 넣지 않는다. 확인이 필요하면 "확인 필요"로 표시하고 보고한다.
- 직원에게 직접 메시지를 보내지 않는다. 알릴 것은 사이트 공지 팝업으로만 알린다.
- 큰 변경(새 화면, 기존 흐름 바꾸기)은 하지 않는다. 제안만 보고한다.

## 서버 필요 후보 (쌓아 두기)
- 일정 상태 "Pending (parts)" 추가. 지금은 Ladie가 메모에 "PENDING"이라고 적고 있다 (11/16 MONTPAC).
- 청소한 기계 여러 대를 한 번에 저장하는 기능(cleaningDone 묶음 처리). 지금은 기계 1대마다 요청을 따로 보내서 느리다.
