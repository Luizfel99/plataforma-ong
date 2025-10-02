# Starts the static server in the current console and opens the default browser to the site
$port = 3000
$projectRoot = Split-Path -Parent $PSScriptRoot

# Ensure node exists
$nodeCmd = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeCmd) {
    Write-Error "Node.js (node) not found in PATH. Please install Node.js."
    exit 1
}

# Start server in background process (so we can open the browser)
$env:PORT = "$port"
Write-Host "Starting static server on http://127.0.0.1:$port/ (background)" -ForegroundColor Cyan
$proc = Start-Process -FilePath $nodeCmd -ArgumentList 'scripts\\simple_static_server.js' -WorkingDirectory $projectRoot -PassThru
Start-Sleep -Seconds 1

# Open default browser to local server
$localUrl = "http://127.0.0.1:$port/"
Start-Process $localUrl

Write-Host "Server started (PID: $($proc.Id)). Press Enter to stop." -ForegroundColor Green
Read-Host | Out-Null

# Stop the server process when user presses Enter
try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue; Write-Host "Server stopped." -ForegroundColor Cyan } catch { Write-Host "Failed to stop process (it may have exited already)." -ForegroundColor Yellow }
