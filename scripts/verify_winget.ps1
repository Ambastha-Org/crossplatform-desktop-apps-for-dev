param([string]$PackageId = $env:REQ_WIN_ID)

$found = $false
$suggestion = "none"

$null = winget show --id $PackageId --accept-source-agreements
if ($LASTEXITCODE -eq 0) {
    $found = $true
}
else {
    $searchResult = winget search $PackageId --accept-source-agreements | Select-Object -Skip 4 -First 1
    if ($searchResult) {
        $parts = $searchResult -split '\s+'
        if ($parts.Count -gt 1) { $suggestion = $parts[1] }
    }
}

$result = @{ found = $found; suggestion = $suggestion; platform = "winget" } | ConvertTo-Json -Compress
Write-Output "RESULT_JSON=$result"