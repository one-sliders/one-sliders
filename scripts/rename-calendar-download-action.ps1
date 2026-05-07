$ErrorActionPreference = 'Stop'

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $next = [regex]::Replace(
    $html,
    '<a href="([^"]+\.ics)">Download calendar file \(\.ics\)<span>For Mac Apple Calendar, iPhone, Outlook and Windows Calendar</span></a>',
    '<a href="$1" title="Download .ics calendar file" aria-label="Download .ics calendar file">Download .ics<span>For Mac Apple Calendar, iPhone, Outlook and Windows Calendar</span></a>'
  )
  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"calendar_download_labels_updated=$updated"
