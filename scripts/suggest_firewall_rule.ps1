# Suggests a firewall rule to allow inbound TCP on port 3000 for localhost
# This script only prints the recommended Netsh/PowerShell command and will not modify firewall settings.
param()

$port = 3000
Write-Host "To allow inbound TCP traffic on port $port, run PowerShell as Administrator and run the following command:" -ForegroundColor Cyan
Write-Host "New-NetFirewallRule -DisplayName 'plataforma-ong http 3000' -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow" -ForegroundColor Green
Write-Host "Or using netsh:" -ForegroundColor Cyan
Write-Host "netsh advfirewall firewall add rule name=\"plataforma-ong-http-3000\" dir=in action=allow protocol=TCP localport=$port" -ForegroundColor Green
