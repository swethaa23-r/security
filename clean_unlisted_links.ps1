$c = Get-Content unlisted-dashboard.html -Raw
$c = $c -replace '(?s)\s*<a href="threat-intel\.html"[^>]*>.*?Threat Intel\s*</a>', ''
$c = $c -replace '(?s)\s*<a href="users\.html"[^>]*>.*?Users\s*</a>', ''
$c = $c -replace '(?s)\s*<a href="devices\.html"[^>]*>.*?Devices\s*</a>', ''
$c = $c -replace '(?s)\s*<a href="incidents\.html"[^>]*>.*?Incidents\s*</a>', ''
$c = $c -replace '(?s)\s*<a href="reports\.html"[^>]*>.*?Reports\s*</a>', ''
$c = $c -replace '(?s)\s*<a href="settings\.html"[^>]*>.*?Settings\s*</a>', ''
Set-Content unlisted-dashboard.html -Value $c -NoNewline
