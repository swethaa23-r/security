Get-ChildItem -Filter *.html | Where-Object { $_.Name -match 'dashboard|users|devices|incidents|reports|settings|threat-intel' -and $_.Name -ne 'client-dashboard.html' -and $_.Name -ne 'unlisted-dashboard.html' } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '(?s)\s*<a href="unlisted-dashboard\.html"[^>]*>.*?Unlisted View\s*</a>', ''
    Set-Content -Path $_.FullName -Value $content -NoNewline
}

$unlisted = Get-Content 'unlisted-dashboard.html' -Raw
$unlisted = $unlisted -replace '(?s)\s*<a href="dashboard\.html"[^>]*>.*?Overview\s*</a>', ''
Set-Content 'unlisted-dashboard.html' -Value $unlisted -NoNewline
