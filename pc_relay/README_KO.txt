BRIZAIR 사이트 "Ask GPT" 연결 프로그램 (의찬 형님 컴퓨터용)

하는 일
- 직원이 사이트(Ask GPT)에 질문하면, 이 컴퓨터의 GPT(형님 ChatGPT Pro, Codex)가
  업무시트 전체 + 올린 자료 + 예전 엑셀을 읽고 사이트에 답을 달아 줍니다. 추가 비용 없음.
- 컴퓨터가 꺼져 있으면 사이트에 "GPT offline"이 뜨고, 켜지면 밀린 질문에 답합니다.
- 이 폴더가 "BRIZAIR AI 프로젝트"입니다: data(자료 복사본), qa_history(질문·답 기록, 계속 쌓임), needs.md(부족한 자료).
  ChatGPT 앱 → Codex → 이 폴더를 프로젝트로 열면 형님도 여기 자료로 대화할 수 있어요.

설치 (한 번만, 5분)
1) 이 site_ai 폴더를 C:\staff-bot 안에 넣기 → C:\staff-bot\site_ai\
   (열쇠는 기존 C:\staff-bot\sheet.key 를 같이 씁니다. 따로 넣을 것 없음)
2) install_site_ai.bat 더블클릭 → "예"(관리자 허용) → 초록색 OK 나오면 끝
3) 사이트에서 Ask GPT 에 아무 질문 → 20~60초 뒤 답이 오면 성공

끄기: stop_site_ai.bat   /  다시 켜기: install_site_ai.bat
기록: site_ai\logs\ask_relay.log  (문제 있으면 마지막 줄을 사진 찍어서 에반에게)
고치는 것은 에반이 합니다 (ask_relay.py, .bat 파일은 손대지 마세요).
