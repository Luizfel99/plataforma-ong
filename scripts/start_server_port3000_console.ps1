# Starts the simple static server in the current console window on port 3000
# If the port is already in use, the script will print the PID and exit.
param()

$port = 3000

function Test-PortListening($p) {
    $res = Test-NetConnection -ComputerName 127.0.0.1 -Port $p -WarningAction SilentlyContinue
    return $res.TcpTestSucceeded
}

if (Test-PortListening $port) {
    Write-Host "Port $port already in use. Listing matching netstat entries:" -ForegroundColor Yellow
    netstat -aon | Select-String ":$port" | ForEach-Object { Write-Host $_.Line }
    Write-Host "If you want to restart the server, stop the process using the PID above and re-run this script." -ForegroundColor Yellow
    exit 0
}

# Ensure PORT environment variable is set for node child process
$env:PORT = "$port"

# Resolve project root (parent of scripts folder)
$projectRoot = Split-Path -Parent $PSScriptRoot

# Verify node
$nodeCmd = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodeCmd) {
    Write-Error "Node.js (node) was not found in PATH. Please install Node.js or run the server manually."
    exit 1
}

Write-Host "Starting static server on port $port (foreground). Press Ctrl+C to stop." -ForegroundColor Cyan
Set-Location $projectRoot
# Run node in the current console so logs are visible
& $nodeCmd 'scripts\simple_static_server.js'

Write-Host "Server process ended." -ForegroundColor Cyan
