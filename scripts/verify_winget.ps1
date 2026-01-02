Write-Host "🚀 Scanning for Win32 ID changes..."

$changed = git diff origin/main -U0 os_tools.json | Select-String '"win32":\s*"([^"]+)"'

if ($null -eq $changed) {
    Write-Host "✅ No Win32 ID changes detected."
    exit 0
}

foreach ($match in $changed) {
    $id = $match.Matches.Groups[1].Value
    Write-Host "🔎 Testing: $id"
    
    # Run winget show
    winget show --id $id --accept-source-agreements --accept-package-agreements
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ID Not Found. Searching for alternatives..."
        $search = winget search $id | Select-Object -Skip 4 -First 1 | ForEach-Object { 
            $_.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)[0] 
        }
        
        if ($env:GITHUB_OUTPUT) {
            "suggestion=$search" | Out-File -FilePath $env:GITHUB_OUTPUT -Append
            "failed_id=$id" | Out-File -FilePath $env:GITHUB_OUTPUT -Append
        }
        exit 1
    }
}

Write-Host "✅ All WinGet IDs verified."