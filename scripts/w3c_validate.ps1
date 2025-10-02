# W3C HTML Validator batch script (PowerShell)
# Usage: Open PowerShell in the project root and run: .\scripts\w3c_validate.ps1
# This script posts each .html file it finds to the W3C Nu Validator and saves JSON results

$validatorUrl = 'https://validator.w3.org/nu/?out=json'
$outDir = Join-Path -Path $PSScriptRoot -ChildPath "..\validation-results"
if (-Not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$files = Get-ChildItem -Path (Join-Path -Path $PSScriptRoot -ChildPath "..") -Filter "*.html" -Recurse
if ($files.Count -eq 0) {
    Write-Host "No HTML files found to validate." -ForegroundColor Yellow
    exit 0
}

foreach ($f in $files) {
    $path = $f.FullName
    Write-Host "Validating: $path"
    try {
        $content = Get-Content -Path $path -Raw -ErrorAction Stop
        $response = Invoke-RestMethod -Uri $validatorUrl -Method Post -Body $content -ContentType 'text/html; charset=utf-8' -ErrorAction Stop
        $jsonOut = $response | ConvertTo-Json -Depth 10
        $outFile = Join-Path -Path $outDir -ChildPath ($f.BaseName + '.json')
        $jsonOut | Out-File -FilePath $outFile -Encoding utf8

        # Summarize
        $messages = $response.messages
        $errorCount = ($messages | Where-Object { $_.type -eq 'error' }).Count
        $warningCount = ($messages | Where-Object { $_.type -eq 'info' -or $_.type -eq 'warning' }).Count
        Write-Host "  Results: $errorCount error(s), $warningCount warning/info(s). Saved -> $outFile" -ForegroundColor Green

        if ($errorCount -gt 0) {
            Write-Host "  First errors:" -ForegroundColor Red
            ($messages | Where-Object { $_.type -eq 'error' } | Select-Object -First 3) | ForEach-Object {
                $msg = $_.message -replace '\s+', ' '
                Write-Host "    - Line:$($_.lastLine) Column:$($_.lastColumn) -> $msg"
            }
        }
    }
    catch {
        Write-Host "  Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Done. JSON results are in: $outDir" -ForegroundColor Cyan
Write-Host "Tip: Open the JSON files or paste an HTML file at https://validator.w3.org/#validate_by_input to see full W3C messages." -ForegroundColor DarkCyan
