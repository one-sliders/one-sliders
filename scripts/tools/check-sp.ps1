$idxHtml = [System.IO.File]::ReadAllText('content\events\index.html', [System.Text.Encoding]::UTF8)

# Find Sao Paulo card
$m = [regex]::Match($idxHtml, '(?s)<a class="event-card"[^>]*href="[^"]*sao-paulo[^"]*"[^>]*>')
Write-Host "Sao Paulo card opener:"
Write-Host $m.Value

Write-Host ""
# Find nav of the page
$html = [System.IO.File]::ReadAllText('content\events\2026\11\sao-paulo-grand-prix.html', [System.Text.Encoding]::UTF8)
$nav  = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
Write-Host "Nav pills in sao-paulo-grand-prix.html:"
$pills = [regex]::Matches($nav, 'nav-pill"[^>]*href="([^"]+)">([^<]+)<')
foreach ($p in $pills) { Write-Host ('  ' + $p.Groups[2].Value + ' -> ' + $p.Groups[1].Value) }
