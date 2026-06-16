$ErrorActionPreference = 'Stop'

function PlainText([string]$html) {
  [Net.WebUtility]::HtmlDecode(($html -replace '<.*?>', '').Trim())
}

function UrlEnc([string]$s) {
  [uri]::EscapeDataString($s)
}

$updated = 0

foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $html = [IO.File]::ReadAllText($file.FullName)
  if ($html -notmatch '<div class="calendar-actions">') { continue }

  $title = PlainText ([regex]::Match($html, '<h1>(.*?)</h1>').Groups[1].Value)
  $intro = PlainText ([regex]::Match($html, '<p class="intro">(.*?)</p>').Groups[1].Value)
  $startMatch = [regex]::Match($html, 'data-start="(\d{4})-(\d{2})-(\d{2})"')
  $endMatch = [regex]::Match($html, 'data-end="(\d{4})-(\d{2})-(\d{2})"')
  if (-not $startMatch.Success -or -not $endMatch.Success) { continue }

  $start = [datetime]::Parse($startMatch.Groups[1].Value + '-' + $startMatch.Groups[2].Value + '-' + $startMatch.Groups[3].Value)
  $endExclusive = ([datetime]::Parse($endMatch.Groups[1].Value + '-' + $endMatch.Groups[2].Value + '-' + $endMatch.Groups[3].Value)).AddDays(1)
  $googleDates = $start.ToString('yyyyMMdd') + '/' + $endExclusive.ToString('yyyyMMdd')
  $googleUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + (UrlEnc $title) + '&dates=' + $googleDates + '&details=' + (UrlEnc $intro)
  $googleLink = '<a href="' + $googleUrl + '">Open in Google Calendar<span>Creates the event in Google Calendar</span></a>'

  $next = $html
  $next = $next.Replace(
    'Add to calendar (.ics)<span>Download for PC, iPhone, Apple Calendar and Outlook</span>',
    'Download calendar file (.ics)<span>For Mac Apple Calendar, iPhone, Outlook and Windows Calendar</span>'
  )
  $next = $next.Replace(
    'On PC: use <strong>Add to calendar (.ics)</strong> and open the file in Outlook or Windows Calendar. On iPhone: open the same file and choose Add to Calendar.',
    'Mac: use <strong>Download calendar file (.ics)</strong> and open it in Apple Calendar. PC: use Outlook/Windows Calendar or choose Outlook/Google below. iPhone: open the .ics file and choose Add to Calendar.'
  )

  if ($next -notmatch 'calendar\.google\.com/calendar/render') {
    $next = [regex]::Replace(
      $next,
      '(<div class="calendar-actions">[\s\S]*?<a href="https://outlook\.office\.com/[^"]+">Open in Outlook<span>Creates the event in Outlook on the web</span></a>)(</div>)',
      [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $m.Groups[1].Value + $googleLink + $m.Groups[2].Value },
      1
    )
  }

  if ($next -ne $html) {
    [IO.File]::WriteAllText($file.FullName, $next, [Text.UTF8Encoding]::new($false))
    $updated++
  }
}

"calendar_options_updated=$updated"
