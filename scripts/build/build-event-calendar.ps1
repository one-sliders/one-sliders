$ErrorActionPreference = 'Stop'

function Enc([string]$s) { [Net.WebUtility]::HtmlEncode($s) }
function UrlEnc([string]$s) { [uri]::EscapeDataString($s) }
function Clean([string]$s) { [Net.WebUtility]::HtmlDecode(($s -replace '<.*?>','').Trim()) }
function IcsDate([datetime]$d) { $d.ToString('yyyyMMdd') }
function HumanDate([datetime]$start, [datetime]$end) {
  if ($start.Date -eq $end.Date) { return $start.ToString('d MMM yyyy', [Globalization.CultureInfo]::InvariantCulture) }
  if ($start.Year -eq $end.Year -and $start.Month -eq $end.Month) {
    return $start.ToString('d', [Globalization.CultureInfo]::InvariantCulture) + '-' + $end.ToString('d MMM yyyy', [Globalization.CultureInfo]::InvariantCulture)
  }
  return $start.ToString('d MMM yyyy', [Globalization.CultureInfo]::InvariantCulture) + ' - ' + $end.ToString('d MMM yyyy', [Globalization.CultureInfo]::InvariantCulture)
}

$dates = @{
  'fifa-world-cup-2026' = @{ s='2026-06-11'; e='2026-07-19'; status='Confirmed'; note='Tournament dates' }
  'us-open-tennis' = @{ s='2026-08-23'; e='2026-09-13'; status='Published window'; note='Main event and surrounding US Open window' }
  'las-vegas-grand-prix' = @{ s='2026-11-19'; e='2026-11-21'; status='Confirmed'; note='Formula 1 race weekend' }
  'mexico-city-grand-prix' = @{ s='2026-10-30'; e='2026-11-01'; status='Confirmed'; note='Formula 1 race weekend' }
  'united-states-grand-prix' = @{ s='2026-10-23'; e='2026-10-25'; status='Confirmed'; note='Formula 1 race weekend' }
  'canada-grand-prix' = @{ s='2026-05-22'; e='2026-05-24'; status='Confirmed'; note='Formula 1 race weekend' }
  'day-of-the-dead' = @{ s='2026-10-31'; e='2026-11-02'; status='Annual dates'; note='Core Day of the Dead period' }
  'calgary-stampede' = @{ s='2026-07-03'; e='2026-07-12'; status='Published window'; note='Annual festival window' }
  'burning-man' = @{ s='2026-08-30'; e='2026-09-07'; status='Planning window'; note='Traditional Burning Man week' }
  'new-york-city-marathon' = @{ s='2026-11-01'; e='2026-11-01'; status='Annual date pattern'; note='First Sunday in November' }

  'wimbledon' = @{ s='2026-06-29'; e='2026-07-12'; status='Confirmed'; note='Championship dates' }
  'tour-de-france' = @{ s='2026-07-04'; e='2026-07-26'; status='Published window'; note='Tour de France race window' }
  'oktoberfest' = @{ s='2026-09-19'; e='2026-10-04'; status='Confirmed'; note='Munich Oktoberfest dates' }
  'champions-league-final' = @{ s='2026-05-30'; e='2026-05-30'; status='Confirmed'; note='Final date' }
  'eurovision-song-contest' = @{ s='2026-05-12'; e='2026-05-16'; status='Confirmed'; note='Semi-finals and final week' }
  'monaco-grand-prix' = @{ s='2026-06-05'; e='2026-06-07'; status='Confirmed'; note='Formula 1 race weekend' }
  'commonwealth-games' = @{ s='2026-07-23'; e='2026-08-02'; status='Confirmed'; note='Games dates' }
  'cannes-film-festival' = @{ s='2026-05-12'; e='2026-05-23'; status='Published window'; note='Festival window' }
  'venice-film-festival' = @{ s='2026-09-02'; e='2026-09-12'; status='Confirmed'; note='Festival dates' }
  'british-grand-prix' = @{ s='2026-07-03'; e='2026-07-05'; status='Confirmed'; note='Formula 1 race weekend' }

  'asian-games-2026' = @{ s='2026-09-19'; e='2026-10-04'; status='Confirmed'; note='Games dates' }
  'singapore-grand-prix' = @{ s='2026-10-09'; e='2026-10-11'; status='Confirmed'; note='Formula 1 race weekend' }
  'hajj-2026' = @{ s='2026-05-25'; e='2026-05-30'; status='Estimated religious calendar'; note='Approximate Hajj period, subject to moon sighting' }
  'diwali-2026' = @{ s='2026-11-08'; e='2026-11-08'; status='Religious calendar'; note='Main Diwali date' }
  'abu-dhabi-grand-prix' = @{ s='2026-12-04'; e='2026-12-06'; status='Confirmed'; note='Formula 1 race weekend' }
  'qatar-grand-prix' = @{ s='2026-11-27'; e='2026-11-29'; status='Confirmed'; note='Formula 1 race weekend' }
  'yi-peng-and-loy-krathong' = @{ s='2026-11-24'; e='2026-11-24'; status='Lunar calendar estimate'; note='Full-moon festival date, local programs may vary' }
  'bali-arts-festival' = @{ s='2026-06-13'; e='2026-07-11'; status='Planning window'; note='Typical festival season window' }
  'motogp-japan' = @{ s='2026-09-25'; e='2026-09-27'; status='Planning window'; note='Motegi race weekend placeholder' }
  'seoul-lantern-festival' = @{ s='2026-11-06'; e='2026-11-22'; status='Planning window'; note='Typical November festival window' }

  'copa-libertadores-final' = @{ s='2026-11-28'; e='2026-11-28'; status='Confirmed'; note='Final date' }
  'sao-paulo-grand-prix' = @{ s='2026-11-06'; e='2026-11-08'; status='Confirmed'; note='Formula 1 race weekend' }
  'festa-junina' = @{ s='2026-06-01'; e='2026-06-30'; status='Seasonal month'; note='June festival season' }
  'inti-raymi' = @{ s='2026-06-24'; e='2026-06-24'; status='Annual date'; note='Cusco celebration date' }
  'buenos-aires-tango-festival' = @{ s='2026-08-19'; e='2026-08-30'; status='Planning window'; note='Typical late-August festival window' }
  'medellin-flower-festival' = @{ s='2026-08-07'; e='2026-08-16'; status='Planning window'; note='Typical August festival window' }
  'oktoberfest-blumenau' = @{ s='2026-10-07'; e='2026-10-25'; status='Planning window'; note='Typical Blumenau Oktoberfest window' }
  'brazil-independence-day' = @{ s='2026-09-07'; e='2026-09-07'; status='Annual date'; note='Brazil Independence Day' }
  'chile-independence-day-and-fiestas-patrias' = @{ s='2026-09-18'; e='2026-09-19'; status='Annual dates'; note='Fiestas Patrias core dates' }
  'new-years-eve-copacabana' = @{ s='2026-12-31'; e='2027-01-01'; status='Annual dates'; note='New Year celebration night' }

  'vivid-sydney' = @{ s='2026-05-22'; e='2026-06-13'; status='Confirmed'; note='Festival dates' }
  'melbourne-cup' = @{ s='2026-11-03'; e='2026-11-03'; status='Annual date pattern'; note='First Tuesday in November' }
  'sydney-new-years-eve' = @{ s='2026-12-31'; e='2027-01-01'; status='Annual dates'; note='New Year celebration night' }
  'afl-grand-final' = @{ s='2026-09-26'; e='2026-09-26'; status='Planning date'; note='Late-September grand final placeholder' }
  'nrl-grand-final' = @{ s='2026-10-04'; e='2026-10-04'; status='Annual date pattern'; note='Early-October grand final placeholder' }
  'state-of-origin' = @{ s='2026-05-27'; e='2026-07-08'; status='Series window'; note='Three-match State of Origin window' }
  'queenstown-winter-festival' = @{ s='2026-06-18'; e='2026-06-21'; status='Planning window'; note='Winter festival placeholder' }
  'bledisloe-cup' = @{ s='2026-08-15'; e='2026-09-26'; status='Series window'; note='Fixture window placeholder' }
  'sydney-marathon' = @{ s='2026-08-30'; e='2026-08-30'; status='Confirmed'; note='Marathon date' }
  'fiji-day' = @{ s='2026-10-10'; e='2026-10-10'; status='Annual date'; note='Fiji Day' }

  'great-migration' = @{ s='2026-07-01'; e='2026-10-31'; status='Seasonal window'; note='Migration travel season' }
  'marrakech-international-film-festival' = @{ s='2026-11-27'; e='2026-12-05'; status='Planning window'; note='Typical festival window' }
  'fes-festival-of-world-sacred-music' = @{ s='2026-05-22'; e='2026-05-30'; status='Planning window'; note='Typical festival window' }
  'durban-july' = @{ s='2026-07-04'; e='2026-07-04'; status='Annual date pattern'; note='First Saturday in July' }
  'cape-town-marathon' = @{ s='2026-10-18'; e='2026-10-18'; status='Planning date'; note='Marathon placeholder date' }
  'hermanus-whale-festival' = @{ s='2026-09-25'; e='2026-09-27'; status='Planning window'; note='Typical whale festival weekend' }
  'cairo-international-film-festival' = @{ s='2026-11-11'; e='2026-11-20'; status='Planning window'; note='Typical festival window' }
  'lake-of-stars-festival' = @{ s='2026-09-25'; e='2026-09-27'; status='Planning window'; note='Festival weekend placeholder' }
  'kwita-izina' = @{ s='2026-09-05'; e='2026-09-05'; status='Planning date'; note='Ceremony placeholder date' }
  'calabar-carnival' = @{ s='2026-12-01'; e='2026-12-31'; status='Seasonal month'; note='December carnival season' }
}

$calendarCss = '.calendar-actions{position:fixed;top:8px;right:clamp(12px,2vw,26px);z-index:50}.calendar-actions summary{list-style:none;display:inline-grid;place-items:center;width:38px;height:38px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.95);box-shadow:0 8px 22px rgba(0,0,0,.18);backdrop-filter:blur(8px);cursor:pointer;color:var(--ink)}.calendar-actions summary::-webkit-details-marker{display:none}.calendar-actions summary svg{width:18px;height:18px}.calendar-actions[open] summary{background:var(--theme);border-color:var(--theme);color:white}.calendar-menu{position:absolute;right:0;top:46px;display:grid;gap:6px;min-width:190px;padding:8px;border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.97);box-shadow:0 12px 28px rgba(0,0,0,.16);backdrop-filter:blur(8px)}.calendar-menu a{display:block;padding:8px 10px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:800}.calendar-menu a:hover{background:var(--paper)}.calendar-menu span{display:block;margin-top:2px;color:var(--muted);font-size:11px;font-weight:600}.date-note{padding:10px 13px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:white;color:var(--muted);font-size:13px;line-height:1.35}@media(max-width:700px){.calendar-actions{top:7px;right:8px}.calendar-menu{right:0;max-width:calc(100vw - 16px)}}'
$dateScript = @'
<script>
(function(){
  function formatDateRange(el){
    var start = el.getAttribute('data-start');
    var end = el.getAttribute('data-end');
    if(!start || !end) return;
    var locale = navigator.language || undefined;
    var fmt = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    var s = new Date(start + 'T00:00:00');
    var e = new Date(end + 'T00:00:00');
    el.textContent = start === end ? fmt.format(s) : fmt.format(s) + ' - ' + fmt.format(e);
  }
  document.querySelectorAll('[data-date-range]').forEach(formatDateRange);
})();
</script>
'@

$updated = 0
foreach ($file in Get-ChildItem content\events\2026\??\*.html) {
  $slug = $file.BaseName
  if (-not $dates.ContainsKey($slug)) { continue }
  $d = $dates[$slug]
  $start = [datetime]::Parse($d.s)
  $end = [datetime]::Parse($d.e)
  $endExclusive = $end.AddDays(1)
  $html = [IO.File]::ReadAllText($file.FullName)
  $title = Clean ([regex]::Match($html, '<h1>(.*?)</h1>').Groups[1].Value)
  $summary = Clean ([regex]::Match($html, '<p class="intro">(.*?)</p>').Groups[1].Value)
  $human = HumanDate $start $end
  $icsName = $slug + '.ics'
  $ics = @"
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//3D Fractal//One-sliders Events//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:$slug-2026@one-sliders.com
DTSTAMP:20260507T000000Z
DTSTART;VALUE=DATE:$(IcsDate $start)
DTEND;VALUE=DATE:$(IcsDate $endExclusive)
SUMMARY:$title
DESCRIPTION:$summary
URL:$($file.Name)
END:VEVENT
END:VCALENDAR
"@
  [IO.File]::WriteAllText((Join-Path $file.Directory.FullName $icsName), $ics, [Text.UTF8Encoding]::new($false))
  $outlook = 'https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + (UrlEnc $title) + '&startdt=' + $start.ToString('yyyy-MM-dd') + '&enddt=' + $endExclusive.ToString('yyyy-MM-dd') + '&allday=true&body=' + (UrlEnc $summary)
  $rangeSpan = '<span data-date-range data-start="' + $start.ToString('yyyy-MM-dd') + '" data-end="' + $end.ToString('yyyy-MM-dd') + '">Date loading...</span>'
  if ($html -notmatch '\.calendar-actions\{') {
    $html = $html -replace '(\.site-footer\{)', ($calendarCss + '$1')
  }
  $html = [regex]::Replace($html, '(<div|<details) class="calendar-actions">[\s\S]*?(</div>|</details>)\s*<div class="date-note">[\s\S]*?</div>\s*(<div class="calendar-help">[\s\S]*?</div>)?', '')
  $actions = '<details class="calendar-actions"><summary title="Save or share event" aria-label="Save or share event"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg></summary><div class="calendar-menu"><a href="' + $icsName + '" title="Download .ics calendar file" aria-label="Download .ics calendar file">Download .ics<span>For Mac Apple Calendar, iPhone, Outlook and Windows Calendar</span></a><a href="' + $outlook + '">Open in Outlook<span>Creates the event in Outlook on the web</span></a></div></details><div class="date-note"><strong>' + $rangeSpan + '</strong> - ' + (Enc $d.status) + '. ' + (Enc $d.note) + '.</div><div class="calendar-help">Mac: use <strong>Download .ics</strong> and open it in Apple Calendar. PC: use Outlook/Windows Calendar or choose Outlook/Google below. iPhone: open the .ics file and choose Add to Calendar.</div>'
  $html = [regex]::Replace($html, '<div class="fact"><span>(Time window|Exact dates)</span><strong>.*?</strong></div>', '<div class="fact"><span>Exact dates</span><strong>' + $rangeSpan + '</strong></div>', 1)
  $html = [regex]::Replace($html, '<div class="fact"><span>Potential</span><strong>', '<div class="fact"><span>Date status</span><strong>' + (Enc $d.status) + '</strong></div><div class="fact"><span>Potential</span><strong>', 1)
  if ($html -match '<div class="story-grid">') {
    $html = [regex]::Replace($html, '(</div><div class="story-grid">)', '</div>' + $actions + '<div class="story-grid">', 1)
  } else {
    $html = [regex]::Replace($html, '(</div><div class="story">)', '</div>' + $actions + '<div class="story">', 1)
  }
  $html = $html -replace [regex]::Escape('attention on '), ('attention on ' + $human + ' / ')
  if ($html -notmatch 'Intl\.DateTimeFormat') {
    $html = $html -replace '</body>', ($dateScript + '</body>')
  }
  [IO.File]::WriteAllText($file.FullName, $html, [Text.UTF8Encoding]::new($false))
  $updated++
}

"event_calendar_updated=$updated"
