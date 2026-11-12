@echo off
schtasks /Delete /F /TN "BrizairSiteAI" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq ask_relay*" >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr 127.0.0.1:47322') do taskkill /F /PID %%a >nul 2>nul
echo Website GPT answers are OFF.
pause
