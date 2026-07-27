Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'analyst-dashboard\.html', 'unlisted-dashboard.html'
    $content = $content -replace 'Analyst View', 'Unlisted View'
    Set-Content -Path $_.FullName -Value $content -NoNewline
}
