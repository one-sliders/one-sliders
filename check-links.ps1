$base = "C:\Users\AndersEriksson\3DF\OneSlider"
$samples = @(
  "content\events\2026\05\pga-championship.html",
  "content\events\2026\04\masters-tournament.html",
  "content\events\2027\10\rugby-world-cup-2027.html",
  "content\events\2028\07\summer-olympics-2028.html"
)

foreach ($s in $samples) {
  $html = [System.IO.File]::ReadAllText("$base\$s", [System.Text.Encoding]::UTF8)
  $nav  = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
  $links = [regex]::Matches($nav, 'href="([^"]+)"')
  Write-Host "=== " + [System.IO.Path]::GetFileName($s)
  foreach ($l in $links) {
    $href = $l.Groups[1].Value
    # Check if it points to a real file
    $resolved = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine((Split-Path "$base\$s"), $href))
    $exists = Test-Path $resolved
    $status = if ($exists) { "OK" } else { "MISSING" }
    Write-Host ("  [$status] " + $href)
  }
  Write-Host ""
}
