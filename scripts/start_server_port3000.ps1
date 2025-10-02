# Stops node processes (if any) and starts the simple static server on port 3000
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.Id -Force }

# Ensure PORT environment variable is set for the child process
$env:PORT = '3000'

# Resolve project root (parent of scripts folder)
$projectRoot = Split-Path -Parent $PSScriptRoot

# Find node executable
$nodeCmd = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeCmd) {
	Write-Error "Node.js (node) was not found in PATH. Please install Node.js or run the server manually."
	exit 1
}

Write-Host "Starting static server on port 3000 using: $nodeCmd" -ForegroundColor Cyan
Start-Process -FilePath $nodeCmd -ArgumentList 'scripts/simple_static_server.js' -WorkingDirectory $projectRoot -NoNewWindow -PassThru | Out-Null
Write-Host "Server start command issued. Check http://127.0.0.1:3000/" -ForegroundColor Green