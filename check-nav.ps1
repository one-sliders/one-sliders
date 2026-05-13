$base = "C:\Users\AndersEriksson\3DF\OneSlider"
$files = Get-ChildItem -Path "$base\content\events" -Recurse -Filter "*.html" |
  Where-Object { $_.Name -ne "index.html" }

$ok = 0; $missingIcons = @(); $missingPill = @(); $wrongPill = @()

foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $nav  = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value

  $hasCal   = $nav -match 'title="Events"'
  $hasWorld = $nav -match 'title="World"'
  $hasCats  = $nav -match 'title="Categories"'
  $hasPill  = $nav -match 'nav-pill'
  $pills    = [regex]::Matches($nav, 'nav-pill"[^>]*href="([^"]+)">([^<]+)<')

  if (-not ($hasCal -and $hasWorld -and $hasCats)) {
    $missingIcons += $f.Name
  } elseif (-not $hasPill) {
    $missingPill += $f.Name
  } else {
    $ok++
  }
}

Write-Host "=== NAV AUDIT ==="
Write-Host "OK (3 icons + pill): $ok"
Write-Host "Missing icons ($($missingIcons.Count)):"
$missingIcons | ForEach-Object { Write-Host "  $_" }
Write-Host "Missing topic pill ($($missingPill.Count)):"
$missingPill  | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== SAMPLE PILLS ==="
$samples = @(
  "content\events\2026\04\masters-tournament.html",
  "content\events\2026\05\champions-league-final.html",
  "content\events\2026\06\wimbledon.html",
  "content\events\2026\11\sao-paulo-grand-prix.html",
  "content\events\2026\12\abu-dhabi-grand-prix.html",
  "content\events\2026\09\motogp-japan.html",
  "content\events\2026\07\commonwealth-games.html",
  "content\events\2030\02\winter-olympics-2030.html",
  "content\events\2027\10\rugby-world-cup-2027.html",
  "content\events\2026\11\cairo-international-film-festival.html"
)
foreach ($s in $samples) {
  $html  = [System.IO.File]::ReadAllText("$base\$s", [System.Text.Encoding]::UTF8)
  $nav   = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
  $pills = [regex]::Matches($nav, 'nav-pill"[^>]*href="([^"]+)">([^<]+)<')
  $name  = [System.IO.Path]::GetFileName($s)
  $pillStr = if ($pills.Count -gt 0) { $pills[0].Groups[2].Value + " -> " + $pills[0].Groups[1].Value } else { "(none)" }
  Write-Host ($name.PadRight(45) + $pillStr)
}
