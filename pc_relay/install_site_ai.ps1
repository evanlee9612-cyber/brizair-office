# BRIZAIR website GPT answers - installer (run through install_site_ai.bat)
$ErrorActionPreference = 'Continue'
$Dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Relay = Join-Path $Dir 'ask_relay.py'
$Task = 'BrizairSiteAI'
function Refresh-Path { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') + ";$env:APPDATA\npm" }
function Have($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
Refresh-Path

Write-Host '=== 1/4 Python ===' -ForegroundColor Cyan
$py = $null
foreach ($c in @('py','python')) {
  if (Have $c) {
    $out = & $c -3 -c "import sys;print(sys.executable)" 2>$null
    if (-not $out) { $out = & $c -c "import sys;print(sys.executable)" 2>$null }
    if ($out -and ($out -notmatch 'WindowsApps')) { $py = $out.Trim(); break }
  }
}
if (-not $py) { Write-Host 'Python not found. (The staff bot setup installs it - run staff-bot setup.bat first.)' -ForegroundColor Red; exit 1 }
$pyw = Join-Path (Split-Path $py) 'pythonw.exe'
if (-not (Test-Path $pyw)) { $pyw = $py }
Write-Host "OK: $py"

Write-Host '=== 2/4 Codex (ChatGPT) ===' -ForegroundColor Cyan
if (-not (Have 'codex')) { Write-Host 'Codex not found. Run staff-bot setup.bat first (it installs Codex).' -ForegroundColor Red; exit 1 }
codex login status 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host 'A browser will open. Choose "Sign in with ChatGPT" (your ChatGPT Pro account). Do NOT choose API key.' -ForegroundColor Yellow
  codex login
}

Write-Host '=== 3/4 Key ===' -ForegroundColor Cyan
$k1 = Join-Path $Dir 'relay.key'; $k2 = Join-Path (Split-Path $Dir) 'sheet.key'; $k3 = 'C:\staff-bot\sheet.key'
if ((Test-Path $k1) -or (Test-Path $k2) -or (Test-Path $k3)) { Write-Host 'OK: key found (not shown)' }
else { Write-Host 'Key not found. Put this folder inside C:\staff-bot (next to sheet.key).' -ForegroundColor Red; exit 1 }

Write-Host '=== 4/4 Auto start (at logon + every 5 min check) ===' -ForegroundColor Cyan
schtasks /End /TN $Task 2>$null | Out-Null
Get-NetTCPConnection -LocalPort 47322 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
$a  = New-ScheduledTaskAction -Execute $pyw -Argument "-I `"$Relay`"" -WorkingDirectory $Dir
$t1 = New-ScheduledTaskTrigger -AtLogOn -User "$env:USERDOMAIN\$env:USERNAME"
$t2 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 3650)
$s  = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
$p  = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $Task -Action $a -Trigger $t1,$t2 -Settings $s -Principal $p -Force | Out-Null
Start-ScheduledTask -TaskName $Task
Start-Sleep -Seconds 8
$log = Join-Path $Dir 'logs\ask_relay.log'
if (Test-Path $log) { Get-Content $log -Tail 3 | Out-Host }
Write-Host ''
Write-Host 'OK - Website GPT answers are ON. Test: ask something in the website (Ask GPT).' -ForegroundColor Green
Write-Host "Log file: $log"
