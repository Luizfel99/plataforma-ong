param(
	[int]$Port = 3000,
	[int]$TimeoutSeconds = 10
)

# Kill processes that are listening on the port (use netstat to find PID)
Write-Host "Ensuring port $Port is free..." -ForegroundColor Cyan
try {
	$listeners = netstat -ano | Select-String ":$Port\s"
	foreach ($line in $listeners) {
		$parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
		$pid = $parts[-1]
		if ($pid -and ($pid -as [int] -gt 0)) {
			Write-Host "Stopping process $pid that was listening on port $Port" -ForegroundColor Yellow
			Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
		}
	}
} catch { }

# Ensure PORT environment variable is set for child process
$env:PORT = "$Port"

# Resolve project root (parent of scripts folder)
$projectRoot = Split-Path -Parent $PSScriptRoot

# Find node executable
$nodeCmd = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeCmd) {
	Write-Error "Node.js (node) was not found in PATH. Please install Node.js or run the server manually."
	exit 1
}

Write-Host "Starting static server on port $Port using: $nodeCmd" -ForegroundColor Cyan
Start-Process -FilePath $nodeCmd -ArgumentList 'scripts/simple_static_server.js' -WorkingDirectory $projectRoot -NoNewWindow -PassThru | Out-Null

# Wait for health endpoint
Write-Host "Waiting up to $TimeoutSeconds seconds for the server to report healthy..." -ForegroundColor Cyan
$start = Get-Date
while ((Get-Date) - $start -lt (New-TimeSpan -Seconds $TimeoutSeconds)) {
	try {
		$r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/__health" -TimeoutSec 2 -ErrorAction Stop
		if ($r.StatusCode -eq 200) {
			Write-Host "Server is healthy at http://127.0.0.1:$Port/" -ForegroundColor Green
			Start-Process "http://127.0.0.1:$Port/"
			exit 0
		}
	} catch { Start-Sleep -Milliseconds 250 }
}

Write-Error "Server did not become healthy within $TimeoutSeconds seconds. Check the server logs."
exit 1