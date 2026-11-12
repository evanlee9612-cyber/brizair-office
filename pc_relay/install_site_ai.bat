@echo off
REM BRIZAIR Office website - GPT answers. Installs a scheduled task that keeps ask_relay.py running.
cd /d "%~dp0"
where pythonw >nul 2>nul
if errorlevel 1 (
  echo Python not found. Install Python 3 first.
  pause
  exit /b 1
)
for /f "delims=" %%P in ('where pythonw') do set PYW=%%P& goto :found
:found
schtasks /Create /F /TN "BrizairSiteAI" /SC MINUTE /MO 5 /TR "\"%PYW%\" -I \"%~dp0ask_relay.py\"" >nul
if errorlevel 1 (
  echo Could not create the scheduled task.
  pause
  exit /b 1
)
start "" "%PYW%" -I "%~dp0ask_relay.py"
echo.
echo OK - Website GPT answers are ON. It restarts by itself every 5 minutes if stopped.
echo Log: %~dp0logs\ask_relay.log
pause
