@echo off
rem BRIZAIR website GPT answers - double click. Asks for admin rights once.
net session >nul 2>&1
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install_site_ai.ps1"
pause
