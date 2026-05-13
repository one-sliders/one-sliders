$base = "C:\Users\AndersEriksson\3DF\OneSlider"
$samples = @(
  "content\events\2026\04\masters-tournament.html",
  "content\events\2026\05\champions-league-final.html",
  "content\events\2026\06\wimbledon.html",
  "content\events\2026\07\commonwealth-games.html",
  "content\events\2030\02\winter-olympics-2030.html"
)

foreach ($s in $samples) {
  $html = [System.IO.File]::ReadAllText("$base\$s", [System.Text.Encoding]::UTF8)
  $nav  = [regex]::Match($html, '(?s)<nav[^>]*class="top-menu"[^>]*>([\s\S]*?)</nav>').Groups[1].Value
  Write-Host "=== " + [System.IO.Path]::GetFileName($s)
  Write-Host $nav
  Write-Host ""
}
