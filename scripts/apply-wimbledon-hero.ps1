$ErrorActionPreference = 'Stop'

$file = 'content/events/2026/06/wimbledon.html'
$html = [IO.File]::ReadAllText($file)
$next = [regex]::Replace(
  $html,
  "url\(['""][^'""]+['""]\) center/cover",
  "url('img/wimbledon-hero.png') center/cover",
  1
)

if ($next -ne $html) {
  [IO.File]::WriteAllText($file, $next, [Text.UTF8Encoding]::new($false))
}

'wimbledon_hero_applied'
