Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '245 Innovation Avenue, New York, NY 10001', 'mmr complex.chinna thirupathi,salem-636008'
    $content = $content -replace '\+1 \(800\) 555-0199', '9087654321'
    Set-Content -Path $_.FullName -Value $content -NoNewline
}
