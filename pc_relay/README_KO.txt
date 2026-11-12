BRIZAIR 사이트 "Ask GPT" 연결 프로그램 (형님 컴퓨터용)

하는 일
- 직원이 사이트(Ask GPT)에 질문하면, 이 컴퓨터의 GPT(형님 ChatGPT 로그인, Codex)가
  업무시트 전체와 올린 자료를 읽고 사이트에 답을 달아 줍니다. 추가 비용 없음.
- 컴퓨터가 꺼져 있으면 사이트에 "GPT offline"이 뜨고, 켜지면 밀린 질문에 답합니다.

설치 (한 번만)
1) 이 폴더를 C:\staff-bot 안에 그대로 넣기  →  C:\staff-bot\site_ai\
   (열쇠는 기존 C:\staff-bot\sheet.key 를 같이 씁니다. 따로 넣을 것 없음)
2) site_ai 폴더의 install_site_ai.bat 더블클릭 → "OK" 나오면 끝
3) 사이트에서 Ask GPT 에 아무 질문 → 20~60초 뒤 답이 오면 성공

끄기: stop_site_ai.bat
기록: site_ai\logs\ask_relay.log  (문제 있으면 이 파일 마지막 줄을 캡처해서 상담방에)

GPT에게 맡기는 경우 (ChatGPT 앱 → Codex):
 "C:\staff-bot\site_ai 의 README_KO.txt 대로 설치해 줘. sheet.key 는 열어 보거나 옮기지 마."
