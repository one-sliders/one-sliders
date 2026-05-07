$ErrorActionPreference = 'Stop'

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html | Where-Object { $_.Name -ne 'index.html' }) {
  $slug = $file.BaseName
  $asset = 'img/' + $slug + '-premium.svg'
  if (-not (Test-Path (Join-Path $file.Directory.FullName $asset))) { continue }

  $html = [IO.File]::ReadAllText($file.FullName)
  $next = [regex]::Replace(
    $html,
    "background:linear-gradient\((?<gradient>[^;]+?)\),url\(['""][^'""]+['""]\) center/cover",
    "background:linear-gradient(`${gradient}),url('$asset') center/cover"
  )

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"premium_event_heroes_applied=$updated"
