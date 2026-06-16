$ErrorActionPreference = 'Stop'

$badMiddleDot1 = [string][char]0x00C3 + [string][char]0x201A + [string][char]0x00C2 + [string][char]0x00B7
$badMiddleDot2 = [string][char]0x00C2 + [string][char]0x00B7
$middleDot = [string][char]0x00B7
$emDash = [string][char]0x2014

foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  $next = $html

  $next = [regex]::Replace(
    $next,
    '(<div class="fact"><span>Date status</span><strong>[^<]+</strong></div>)(\s*<div class="fact"><span>Date status</span><strong>[^<]+</strong></div>)+',
    '$1'
  )

  $next = $next.Replace($badMiddleDot1, '-')
  $next = $next.Replace($badMiddleDot2, '-')
  $next = $next.Replace($middleDot, '-')
  $next = $next.Replace($emDash, '-')

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
  }
}

'event_pages_cleaned'
