#!/bin/bash
set -e
SRC=/Users/evanlee/claude-test/clark-travel/의찬형_직원봇/office-app/pc_relay
OUT=/Users/evanlee/claude-test/clark-travel/의찬형_직원봇/전달_2026-11-13/BRIZAIR_site_ai_v2.zip
URL=$(cat ~/.config/brizair/office_api_url)
DEP=$(echo "$URL" | sed -E 's#.*/macros/s/([^/]+)/exec.*#\1#')
[ ${#DEP} -gt 30 ] || { echo "bad deployment id"; exit 1; }
T=$(mktemp -d); mkdir "$T/site_ai"
cp "$SRC"/{install_site_ai.bat,install_site_ai.ps1,stop_site_ai.bat,PROJECT_AGENTS.md,ask_relay.py,README_KO.txt,ANSWER_RULES.md,company_info.md} "$T/site_ai/"
sed -i '' "s#__DEPLOYMENT_ID__#$DEP#" "$T/site_ai/ask_relay.py"
grep -q "__DEPLOYMENT_ID__" "$T/site_ai/ask_relay.py" && { echo "id not filled"; exit 1; }
python3 -c "import ast,sys; ast.parse(open(sys.argv[1],encoding='utf-8').read())" "$T/site_ai/ask_relay.py"
# no secrets inside
if grep -rIl -E "S_[0-9a-f]{64}|sheet_key\s*=\s*['\"][A-Za-z0-9]" "$T/site_ai"; then echo "secret-looking text found"; exit 1; fi
rm -f "$OUT"; (cd "$T" && zip -qrX "$OUT" site_ai)
rm -rf "$T"; unzip -l "$OUT" | tail -12
