@echo off
rem Turn OFF website GPT answers
schtasks /End /TN "BrizairSiteAI" >nul 2>nul
schtasks /Delete /F /TN "BrizairSiteAI" >nul 2>nul
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 47322 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo Website GPT answers are OFF. (install_site_ai.bat turns it on again)
pause
