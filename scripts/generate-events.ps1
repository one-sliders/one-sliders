$ErrorActionPreference = 'Stop'

function Slug([string]$s) {
  $n = $s.ToLowerInvariant()
  $n = $n -replace 'å','a' -replace 'ä','a' -replace 'ö','o' -replace 'é','e' -replace 'è','e' -replace 'á','a' -replace 'í','i' -replace 'ó','o' -replace 'ú','u' -replace 'ã','a' -replace 'ç','c' -replace 'ñ','n'
  $n = $n -replace '&',' and '
  $n = $n -replace '[^a-z0-9]+','-'
  $n.Trim('-')
}

function Enc([string]$s) { [Net.WebUtility]::HtmlEncode($s) }
function Dec([string]$s) { [Net.WebUtility]::HtmlDecode(($s -replace '<.*?>','').Trim()) }

$countryDirs = @{}
foreach ($d in Get-ChildItem content\locations\*\* -Directory) { $countryDirs[$d.Name] = $d }

function CountryName([string]$country) {
  $idx = Join-Path $countryDirs[$country].FullName 'index.html'
  $html = [IO.File]::ReadAllText($idx)
  $m = [regex]::Match($html, '<h1>(.*?)</h1>')
  if ($m.Success) { return (Dec $m.Groups[1].Value) }
  return (Get-Culture).TextInfo.ToTitleCase(($country -replace '-', ' '))
}

function EventRows {
@'
name|month|category|time|potential|countries|cities|search|summary
FIFA World Cup 2026|06|Sports|Jun-Jul 2026|Very high|usa,canada,mexico|New York,Toronto,Mexico City|schedule, host cities, tickets, teams, travel|The 2026 World Cup spreads across North America, linking host cities, national teams and major travel planning into one global football month.
US Open Tennis|08|Sports|Aug-Sep 2026|Very high|usa|New York|tickets, schedule, New York, finals|A late-summer tennis major in New York, useful for schedules, ticket searches, finals weekend and city travel.
Las Vegas Grand Prix|11|Sports|Nov 2026|Very high|usa|Las Vegas|F1 Vegas, tickets, hotels, race weekend|Formula 1 in Las Vegas turns the Strip into a race weekend built around night racing, hotels and entertainment.
Mexico City Grand Prix|10|Sports|Oct-Nov 2026|High|mexico|Mexico City|F1 Mexico, dates, tickets, travel|A major F1 weekend in Mexico City, combining racing, altitude, city travel and strong local motorsport energy.
United States Grand Prix|10|Sports|Oct 2026|High|usa|Austin|Austin F1, COTA, tickets, weekend guide|The Austin F1 weekend centers on COTA, live music, race travel and a broad US motorsport audience.
Canada Grand Prix|05|Sports|May 2026|High|canada|Montreal|Montreal F1, tickets, race weekend|A classic Formula 1 weekend on Montreal island circuit, with strong travel and ticket intent.
Day of the Dead|10|Culture|Oct-Nov 2026|High|mexico|Mexico City|Mexico City parade, traditions, travel|A visually powerful cultural season around remembrance, altars, parades and travel in Mexico.
Calgary Stampede|07|Culture|Jul 2026|High|canada|Calgary|rodeo, tickets, Calgary travel|A major rodeo and western culture festival in Calgary, mixing sport, shows, food and city travel.
Burning Man|08|Culture|Aug-Sep 2026|High|usa|Black Rock City|dates, tickets, packing, Nevada|A temporary desert city in Nevada focused on art, community, logistics and radical self-reliance.
New York City Marathon|11|Wellness / Sports|Nov 2026|High|usa|New York|route, runners, travel, spectators|A world marathon through New York boroughs, useful for runners, spectators, route planning and travel.
Wimbledon|06|Sports|Jun-Jul 2026|Very high|united-kingdom|London|schedule, tickets, finals, London|The grass-court tennis championship in London, with strong searches around tickets, draws and finals.
Tour de France|07|Sports|Jul 2026|Very high|france,spain|Paris,Barcelona|route, stages, map, riders|A multi-stage cycling event where route maps, mountain stages and daily results drive search interest.
Oktoberfest|09|Food & Drink|Sep-Oct 2026|Very high|germany|Munich|dates, tents, Munich, hotels|Munich beer festival connects tents, reservations, hotels, food, music and Bavarian traditions.
Champions League Final|05|Sports|May 2026|Very high|hungary|Budapest|final, teams, tickets, Budapest|European club football biggest final, focused on teams, tickets, venue access and Budapest travel.
Eurovision Song Contest|05|Music|May 2026|Very high|austria|Vienna|finalists, running order, voting, Vienna|A major music and television event where songs, voting, delegations and host-city travel all matter.
Monaco Grand Prix|06|Sports|Jun 2026|Very high|monaco|Monaco|F1 Monaco, tickets, schedule, yacht weekend|Formula 1 prestige street race through Monaco, with high-value searches around tickets, yachts and weekend guides.
Commonwealth Games|07|Sports|Jul-Aug 2026|High|united-kingdom|Glasgow|Glasgow 2026, sports, schedule, tickets|A multi-sport event centered on Glasgow, with schedules, venues, countries and ticket planning.
Cannes Film Festival|05|Culture|May 2026|High|france|Cannes|films, red carpet, winners, Cannes|A premium film festival on the French Riviera, driven by premieres, awards, red carpets and industry travel.
Venice Film Festival|09|Culture|Sep 2026|High|italy|Venice|films, premieres, Venice, awards|A major cinema festival on the Lido, focused on premieres, awards, guests and Venice travel.
British Grand Prix|07|Sports|Jul 2026|High|united-kingdom|Silverstone|Silverstone, F1 tickets, race weekend|The British F1 weekend at Silverstone combines motorsport heritage, camping, tickets and race-day travel.
Asian Games 2026|09|Sports|Sep-Oct 2026|Very high|japan|Nagoya|schedule, sports, medals, Japan travel|A major Asian multi-sport event in Japan, useful for schedules, medal tables, venues and regional travel.
Singapore Grand Prix|10|Sports|Oct 2026|Very high|singapore|Singapore|F1 Singapore, night race, tickets, hotels|A night Formula 1 race through Singapore, combining premium travel, entertainment and city-center racing.
Hajj 2026|05|Culture|May-Jun 2026|Very high|saudi-arabia|Mecca|dates, pilgrimage, travel, rules|The annual pilgrimage to Mecca, where dates, access rules, travel planning and rituals are central.
Diwali 2026|10|Culture|Oct-Nov 2026|Very high|india|Delhi|date, meaning, celebrations, travel|A major festival of lights connected to family, temples, food, fireworks and travel across India and beyond.
Abu Dhabi Grand Prix|12|Sports|Dec 2026|High|united-arab-emirates|Abu Dhabi|F1 final, tickets, Yas Island|Formula 1 Abu Dhabi weekend links Yas Island, season finales, concerts, hotels and ticket demand.
Qatar Grand Prix|11|Sports|Nov 2026|High|qatar|Lusail|F1 Qatar, Lusail, race weekend|A Qatar race weekend around Lusail, with searches around F1 timing, tickets and travel.
Yi Peng and Loy Krathong|11|Culture|Nov 2026|High|thailand|Chiang Mai|lantern festival, Chiang Mai, dates|Lanterns, rivers, temples and night celebrations make this one of Thailand most visual seasonal events.
Bali Arts Festival|06|Culture|Jun-Jul 2026|High|indonesia|Denpasar|Bali festival, culture, travel|A Balinese culture festival with dance, music, crafts, ceremonies and travel interest around Denpasar and Bali.
MotoGP Japan|09|Sports|Autumn 2026|Medium-high|japan|Motegi|Motegi, MotoGP calendar, tickets|A motorsport weekend at Motegi, useful for MotoGP calendars, tickets and Japan race travel.
Seoul Lantern Festival|11|Culture|Nov 2026|Medium-high|south-korea|Seoul|Seoul lights, dates, travel|A city light festival in Seoul, centered on lantern displays, winter evenings and urban travel.
Copa Libertadores Final|11|Sports|Nov 2026|Very high|uruguay|Montevideo|final, teams, tickets, Montevideo|South America major club football final, with strong searches around teams, tickets and Montevideo travel.
Sao Paulo Grand Prix|11|Sports|Nov 2026|Very high|brazil|Sao Paulo|F1 Brazil, Interlagos, tickets|The Interlagos F1 weekend in Sao Paulo, with motorsport heritage, tickets and race travel.
Festa Junina|06|Food & Drink / Culture|Jun 2026|High|brazil|Sao Paulo|Brazil festival, food, dates, traditions|A June festival season across Brazil with food, music, dance, bonfires and regional traditions.
Inti Raymi|06|Culture|Jun 2026|High|peru|Cusco|Cusco, tickets, Inca festival|A major Andean festival in Cusco connected to Inca history, ceremony, costumes and travel.
Buenos Aires Tango Festival|08|Culture|Aug 2026|High|argentina|Buenos Aires|tango festival, classes, shows|A citywide tango event with shows, dance classes, competitions and Buenos Aires culture.
Medellin Flower Festival|08|Culture|Aug 2026|High|colombia|Medellin|Feria de las Flores, parade, travel|A flower festival in Medellin known for parades, floral displays, culture and city travel.
Oktoberfest Blumenau|10|Food & Drink|Oct 2026|High|brazil|Blumenau|Brazilian Oktoberfest, dates, beer festival|A Brazilian beer festival in Blumenau with German heritage, music, food and travel planning.
Brazil Independence Day|09|National Days|Sep 2026|Medium-high|brazil|Brasilia|parades, date, history|Brazil national day connects parades, history, flags and civic celebrations around September 7.
Chile Independence Day and Fiestas Patrias|09|National Days|Sep 2026|Medium-high|chile|Santiago|celebrations, food, traditions|Chile Fiestas Patrias season brings food, dance, flags, family gatherings and national celebrations.
New Years Eve Copacabana|12|Culture|Dec 2026|High|brazil|Rio de Janeiro|Rio NYE, fireworks, hotels|Rio Copacabana New Year celebration is built around fireworks, beach crowds, music and hotels.
Vivid Sydney|05|Culture / Technology|May-Jun 2026|Very high|australia|Sydney|lights, dates, Sydney, tickets|A light, music and ideas festival across Sydney, strong for visuals, night walks and ticketed experiences.
Melbourne Cup|11|Sports|Nov 2026|Very high|australia|Melbourne|horse race, fashion, tickets|Australia major horse race day, combining sport, fashion, hospitality and Melbourne travel.
Sydney New Years Eve|12|Culture|Dec 2026|Very high|australia|Sydney|fireworks, harbour, best spots|A globally watched harbour fireworks event with searches around viewing spots, access and hotels.
AFL Grand Final|09|Sports|Sep 2026|High|australia|Melbourne|teams, tickets, MCG, date|Australian rules football biggest match at the MCG, focused on teams, tickets and fan travel.
NRL Grand Final|10|Sports|Oct 2026|High|australia|Sydney|rugby league final, tickets|Rugby league major final weekend, with ticket demand, team searches and Sydney travel.
State of Origin|05|Sports|May-Jul 2026|High|australia|Brisbane|NSW vs Queensland, dates, teams|A rugby league series between New South Wales and Queensland, built around fixtures, teams and rivalry.
Queenstown Winter Festival|06|Wellness / Culture|Jun-Jul 2026|Medium-high|new-zealand|Queenstown|ski, events, Queenstown travel|A winter mountain festival around Queenstown, skiing, music, cold-weather travel and alpine events.
Bledisloe Cup|08|Sports|Aug-Sep 2026|Medium-high|australia,new-zealand|Sydney,Auckland|All Blacks, Wallabies, fixtures|A rugby rivalry between Australia and New Zealand, useful for fixtures, venues and fan travel.
Sydney Marathon|08|Wellness / Sports|Aug 2026|Medium-high|australia|Sydney|route, registration, travel|A major running event in Sydney, connecting route planning, registration, spectators and city travel.
Fiji Day|10|National Days|Oct 2026|Medium|fiji|Suva|date, celebrations, travel|Fiji national day, useful for celebration guides, history, local events and travel context.
Great Migration|07|Climate / Travel|Jul-Oct 2026|Very high|kenya,tanzania|Nairobi,Arusha|migration timing, safari, Masai Mara|A seasonal wildlife movement across East Africa, with strong interest in safari timing and travel planning.
Marrakech International Film Festival|11|Culture|Nov-Dec 2026|High|morocco|Marrakech|films, Marrakech, red carpet|A Moroccan film festival with international guests, red carpets, cinema programming and Marrakech travel.
Fes Festival of World Sacred Music|05|Music / Culture|May-Jun 2026|High|morocco|Fes|Fes festival, music, Morocco travel|A music festival in Fes centered on sacred traditions, heritage venues and cultural travel.
Durban July|07|Sports / Culture|Jul 2026|High|south-africa|Durban|horse racing, fashion, tickets|A South African racing and fashion event in Durban, strong for hospitality, tickets and city travel.
Cape Town Marathon|10|Wellness / Sports|Oct 2026|High|south-africa|Cape Town|route, registration, travel|A major running event in Cape Town, connecting route views, registration and travel planning.
Hermanus Whale Festival|09|Climate / Culture|Sep 2026|Medium-high|south-africa|Hermanus|whale watching, dates, travel|A coastal whale season event in Hermanus, focused on marine wildlife, viewing points and travel.
Cairo International Film Festival|11|Culture|Nov 2026|Medium-high|egypt|Cairo|films, Cairo, awards|A long-running film festival in Cairo, with awards, screenings, guests and city culture.
Lake of Stars Festival|09|Music|Sep-Oct 2026|Medium|malawi|Lilongwe|music festival, Malawi travel|A Malawi music and arts festival linked to lake travel, regional artists and cultural tourism.
Kwita Izina|09|Climate / Culture|Sep 2026|Medium|rwanda|Kigali|gorilla naming ceremony, Rwanda|A Rwanda conservation ceremony connected to gorillas, national parks, tourism and wildlife protection.
Calabar Carnival|12|Culture / Music|Dec 2026|Medium-high|nigeria|Calabar|carnival, parade, Nigeria|A large Nigerian carnival season with parades, costumes, music and December travel interest.
'@ | ConvertFrom-Csv -Delimiter '|'
}

function EventRelFromCity($event) { '../../../events/2026/' + $event.month + '/' + (Slug $event.name) + '.html' }
function EventRelFromEventToCountry($country) { '../../../locations/' + $countryDirs[$country].Parent.Name + '/' + $country + '/index.html' }
function EventRelFromEventToCity($country, $city) { '../../../locations/' + $countryDirs[$country].Parent.Name + '/' + $country + '/' + (Slug $city) + '.html' }

function MakeImage($event, $out) {
  $cat = $event.category.ToLowerInvariant()
  $a = '#1f6f83'; $b = '#f0b94a'; $shape = 'path'
  if ($cat -like '*sports*') { $a = '#154f7d'; $b = '#6fd0ff'; $shape = 'rings' }
  elseif ($cat -like '*culture*') { $a = '#8f2d56'; $b = '#ffd166'; $shape = 'fan' }
  elseif ($cat -like '*music*') { $a = '#532d8f'; $b = '#ff7bc4'; $shape = 'waves' }
  elseif ($cat -like '*food*') { $a = '#7b3f1d'; $b = '#f2c14e'; $shape = 'glass' }
  elseif ($cat -like '*climate*') { $a = '#1d6b4f'; $b = '#9ee6b8'; $shape = 'leaf' }
  elseif ($cat -like '*wellness*') { $a = '#2f7651'; $b = '#bfe6d0'; $shape = 'path' }
  $icon = switch ($shape) {
    'rings' { '<circle cx="560" cy="180" r="74" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="14"/><circle cx="640" cy="180" r="74" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="14"/><path d="M505 335h270" stroke="rgba(255,255,255,.7)" stroke-width="22" stroke-linecap="round"/>' }
    'fan' { '<path d="M540 315c70-150 170-150 240 0" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="24"/><path d="M560 315c30-95 170-95 200 0" fill="none" stroke="rgba(255,255,255,.48)" stroke-width="18"/>' }
    'waves' { '<path d="M500 190c45-35 90-35 135 0s90 35 135 0" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="20" stroke-linecap="round"/><path d="M500 275c45-35 90-35 135 0s90 35 135 0" fill="none" stroke="rgba(255,255,255,.48)" stroke-width="20" stroke-linecap="round"/>' }
    'glass' { '<path d="M575 110h120l-18 235h-84z" fill="rgba(255,255,255,.24)" stroke="rgba(255,255,255,.75)" stroke-width="12"/><path d="M590 205h90" stroke="rgba(255,255,255,.75)" stroke-width="16"/>' }
    'leaf' { '<path d="M520 330c20-145 145-220 245-205-5 125-95 220-245 205z" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.68)" stroke-width="12"/><path d="M555 300c65-55 120-95 185-145" stroke="rgba(255,255,255,.7)" stroke-width="10"/>' }
    default { '<path d="M505 320c50-120 105-180 165-180s95 80 135 55" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="22" stroke-linecap="round"/><circle cx="520" cy="330" r="28" fill="rgba(255,255,255,.35)"/>' }
  }
  $name = Enc $event.name
  $time = Enc $event.time
  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="$a"/><stop offset="1" stop-color="$b"/></linearGradient><radialGradient id="r" cx="78%" cy="20%" r="65%"><stop stop-color="rgba(255,255,255,.35)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>
  <rect width="1200" height="760" fill="url(#g)"/><rect width="1200" height="760" fill="url(#r)"/>
  <path d="M0 560c180-70 310-70 490 0s330 70 710-30v230H0z" fill="rgba(0,0,0,.16)"/>
  $icon
  <text x="72" y="118" fill="rgba(255,255,255,.82)" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="3">2026 EVENT</text>
  <text x="72" y="430" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="800">$name</text>
  <text x="76" y="500" fill="rgba(255,255,255,.88)" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700">$time</text>
</svg>
"@
  [IO.File]::WriteAllText($out, $svg, [Text.UTF8Encoding]::new($false))
}

function EnsureCity($country, $city, $event) {
  $dir = $countryDirs[$country]
  if (-not $dir) { return }
  $slug = Slug $city
  $file = Join-Path $dir.FullName ($slug + '.html')
  $countryName = CountryName $country
  $continent = (Get-Culture).TextInfo.ToTitleCase(($dir.Parent.Name -replace '-', ' '))
  if (-not (Test-Path $file)) {
    $title = Enc $city
    $countryEnc = Enc $countryName
    $html = @"
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>$title</title><style>
:root{--theme:#2f6f4e;--accent:#9ccf9f;--ink:#14202a;--paper:#f7f8f4;--muted:#5e6b70;--line:rgba(20,32,42,.14)}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper)}a{color:inherit}.top-menu{position:sticky;top:0;z-index:3;display:flex;gap:8px;overflow-x:auto;padding:8px clamp(14px,3vw,36px);background:rgba(251,250,246,.95);border-bottom:1px solid var(--line)}.top-menu a{flex:0 0 auto;padding:7px 12px;border-radius:999px;text-decoration:none;font-size:13px}.top-menu a:hover,.top-menu a.active{background:var(--theme);color:white}.slide{display:grid;grid-template-columns:minmax(300px,.9fr) minmax(480px,1.1fr);min-height:calc(100vh - 43px);gap:clamp(14px,2vw,28px);padding:clamp(12px,2vw,28px);align-items:start}.left-col{display:grid;gap:10px;position:sticky;top:55px}.hero{min-height:clamp(200px,28vh,320px);border-radius:8px;overflow:hidden;display:grid;align-items:end;padding:clamp(16px,2.5vw,28px);color:white;box-shadow:0 14px 38px rgba(0,0,0,.18);background:linear-gradient(135deg,var(--theme),var(--accent))}.eyebrow{margin:0 0 6px;color:white;font-size:12px;font-weight:700;text-transform:uppercase}h1{margin:0;font-size:clamp(36px,5vw,68px);line-height:.94}.intro{margin:10px 0 0;font-size:clamp(14px,1.4vw,17px);line-height:1.36;max-width:600px}.map-wrap{border-radius:8px;overflow:hidden;border:1px solid var(--line)}.map-wrap iframe{display:block;width:100%;height:210px;border:none}.right-col{display:grid;gap:12px}.known-for{margin:0;font-size:14px;line-height:1.4;padding:10px 13px;border-radius:8px;background:white;border:1px solid var(--line);border-left:4px solid var(--accent)}.known-for span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:700;margin-bottom:4px}.fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fact{padding:10px 12px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;box-shadow:0 4px 12px rgba(0,0,0,.04)}.fact span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:600}.fact strong{display:block;margin-top:4px;font-size:clamp(13px,1.5vw,18px);line-height:1.1}.section-label{margin:0 0 8px;font-size:17px;font-weight:700}.event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}.event-link{display:block;padding:11px 13px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:white;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,.05)}.event-link span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:700}.event-link strong{display:block;margin-top:4px;font-size:16px}.site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:rgba(251,250,246,.92)}.site-footer p{margin:0}.site-footer a{color:inherit}@media(max-width:1000px){.slide{grid-template-columns:1fr}.left-col{position:static}}@media(max-width:600px){.fact-grid{grid-template-columns:1fr}}
</style></head><body><nav class="top-menu" aria-label="Location navigation"><a href="../index.html">$(Enc $continent)</a><a href="index.html">$countryEnc</a><a class="active" aria-current="page" href="$slug.html">$title</a></nav><main class="slide"><aside class="left-col"><div class="hero"><div><p class="eyebrow">City in $countryEnc</p><h1>$title</h1><p class="intro">$title is a city in <a href="index.html">$countryEnc</a>, connected to event travel and local one-slider pages.</p></div></div><div class="map-wrap"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=-1,-1,1,1&layer=mapnik" loading="lazy" title="Map of $title"></iframe></div></aside><section class="right-col" aria-label="$title facts"><div class="known-for"><span>Known for</span>Event travel, local culture and visitor planning</div><div class="fact-grid"><div class="fact"><span>Country</span><strong><a href="index.html">$countryEnc</a></strong></div><div class="fact"><span>City role</span><strong>Event city</strong></div><div class="fact"><span>Primary use</span><strong>Events and travel</strong></div><div class="fact"><span>Year focus</span><strong>2026</strong></div></div></section></main><footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer></body></html>
"@
    [IO.File]::WriteAllText($file, $html, [Text.UTF8Encoding]::new($false))
  }

  $idx = Join-Path $dir.FullName 'index.html'
  $h = [IO.File]::ReadAllText($idx)
  $href = $slug + '.html'
  if ($h -notmatch [regex]::Escape('href="' + $href + '"')) {
    $cityLink = '<a class="city-link" href="' + $href + '"><div><span>Event city</span><strong>' + (Enc $city) + '</strong></div><em>Open</em></a>'
    if ($h -match '<div class="city-grid">') {
      $h = [regex]::Replace($h, '(\s*</div>\s*</section>\s*</main>)', "`n          " + $cityLink + '$1', 1)
    } else {
      $section = "`n        <div>`n          <p class=""section-label"">Cities</p>`n          <div class=""city-grid"">`n          $cityLink`n          </div>`n        </div>`n"
      $h = $h -replace '(\s*</section>\s*</main>)', ($section + '$1')
    }
    [IO.File]::WriteAllText($idx, $h, [Text.UTF8Encoding]::new($false))
  }
}

function AddEventToCity($country, $city, $event) {
  EnsureCity $country $city $event
  $file = Join-Path $countryDirs[$country].FullName ((Slug $city) + '.html')
  $h = [IO.File]::ReadAllText($file)
  $css = '.event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}.event-link{display:block;padding:11px 13px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:white;text-decoration:none;box-shadow:0 4px 12px rgba(0,0,0,.05)}.event-link span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:700}.event-link strong{display:block;margin-top:4px;font-size:16px}'
  if ($h -notmatch '\.event-grid\{') { $h = $h -replace '(\.site-footer\{)', ($css + '$1') }
  $href = EventRelFromCity $event
  $link = '<a class="event-link" href="' + $href + '"><span>' + (Enc $event.time) + '</span><strong>' + (Enc $event.name) + '</strong></a>'
  if ($h -notmatch [regex]::Escape($href)) {
    if ($h -match '<div class="event-grid">') {
      $h = [regex]::Replace($h, '(\s*</div>\s*</section>)', "`n          " + $link + '$1', 1)
    } else {
      $section = "`n        <div class=""events-section"">`n          <p class=""section-label"">Events</p>`n          <div class=""event-grid"">`n          $link`n          </div>`n        </div>`n"
      $h = $h -replace '(\s*</section>)', ($section + '$1')
    }
    [IO.File]::WriteAllText($file, $h, [Text.UTF8Encoding]::new($false))
  }
}

function CountryForCity($event, [int]$i) {
  $countries = @($event.countries -split ',')
  if ($event.name -eq 'Tour de France' -and $i -eq 1) { return 'spain' }
  if ($event.name -eq 'Bledisloe Cup' -and $i -eq 1) { return 'new-zealand' }
  if ($event.name -eq 'Great Migration' -and $i -eq 1) { return 'tanzania' }
  return $countries[[Math]::Min($i, $countries.Count - 1)]
}

function WriteEventPage($event) {
  $slug = Slug $event.name
  $dir = "content\events\2026\$($event.month)"
  $imgDir = Join-Path $dir 'img'
  New-Item -ItemType Directory -Force -Path $imgDir | Out-Null
  MakeImage $event (Join-Path $imgDir ($slug + '.svg'))

  $countryLinks = @()
  foreach ($country in @($event.countries -split ',')) {
    if ($countryDirs[$country]) {
      $countryLinks += '<a href="' + (EventRelFromEventToCountry $country) + '">' + (Enc (CountryName $country)) + '</a>'
    }
  }
  $cityLinks = @()
  $cities = @($event.cities -split ',')
  for ($i = 0; $i -lt $cities.Count; $i++) {
    $country = CountryForCity $event $i
    $city = $cities[$i]
    if ($countryDirs[$country]) {
      AddEventToCity $country $city $event
      $cityLinks += '<a href="' + (EventRelFromEventToCity $country $city) + '">' + (Enc $city) + '</a>'
    }
  }

  $title = Enc $event.name
  $eventImg = 'img/' + $slug + '.svg'
  $html = @"
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>$title</title><style>
:root{--theme:#1f6f83;--accent:#f0b94a;--ink:#14202a;--paper:#f7f8f4;--muted:#5e6b70;--line:rgba(20,32,42,.14)}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);background:var(--paper)}a{color:inherit}.top-menu{position:sticky;top:0;z-index:3;display:flex;gap:8px;overflow-x:auto;padding:8px clamp(14px,3vw,36px);background:rgba(251,250,246,.95);border-bottom:1px solid var(--line)}.top-menu a{flex:0 0 auto;padding:7px 12px;border-radius:999px;text-decoration:none;font-size:13px}.top-menu a:hover,.top-menu a.active{background:var(--theme);color:white}.slide{display:grid;grid-template-columns:minmax(320px,.9fr) minmax(480px,1.1fr);min-height:calc(100vh - 43px);gap:clamp(14px,2vw,28px);padding:clamp(12px,2vw,28px);align-items:start}.left-col{display:grid;gap:10px;position:sticky;top:55px}.hero{min-height:clamp(320px,56vh,620px);border-radius:8px;overflow:hidden;display:grid;align-items:end;padding:clamp(18px,3vw,36px);color:white;box-shadow:0 14px 38px rgba(0,0,0,.18);background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.48)),url('$eventImg') center/cover}.eyebrow{margin:0 0 8px;color:var(--accent);font-size:12px;font-weight:800;text-transform:uppercase}h1{margin:0;font-size:clamp(38px,5vw,74px);line-height:.94}.intro{margin:12px 0 0;font-size:clamp(15px,1.45vw,19px);line-height:1.36;max-width:700px}.right-col{display:grid;gap:12px}.fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fact{padding:12px 14px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;box-shadow:0 4px 12px rgba(0,0,0,.04)}.fact span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:700}.fact strong{display:block;margin-top:5px;font-size:clamp(14px,1.7vw,20px);line-height:1.15}.story{padding:14px 16px;border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;background:white;line-height:1.45}.link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.link-grid a{display:block;padding:11px 13px;border:1px solid var(--line);border-left:4px solid var(--theme);border-radius:8px;background:white;text-decoration:none}.section-label{margin:0 0 8px;font-size:17px;font-weight:700}.site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:rgba(251,250,246,.92)}.site-footer p{margin:0}.site-footer a{color:inherit}@media(max-width:1000px){.slide{grid-template-columns:1fr}.left-col{position:static}}@media(max-width:600px){.fact-grid{grid-template-columns:1fr}}
</style></head><body><nav class="top-menu" aria-label="Event navigation"><a href="../../../locations/index.html">World</a><a class="active" aria-current="page" href="$slug.html">$title</a></nav><main class="slide"><aside class="left-col"><div class="hero"><div><p class="eyebrow">$(Enc $event.category) · $(Enc $event.time)</p><h1>$title</h1><p class="intro">$(Enc $event.summary)</p></div></div></aside><section class="right-col" aria-label="$title facts"><div class="fact-grid"><div class="fact"><span>Time window</span><strong>$(Enc $event.time)</strong></div><div class="fact"><span>Potential</span><strong>$(Enc $event.potential)</strong></div><div class="fact"><span>Category</span><strong>$(Enc $event.category)</strong></div><div class="fact"><span>Search intent</span><strong>$(Enc $event.search)</strong></div></div><div class="story">$(Enc $event.summary)</div><div><p class="section-label">Countries</p><div class="link-grid">$($countryLinks -join '')</div></div><div><p class="section-label">Cities</p><div class="link-grid">$($cityLinks -join '')</div></div></section></main><footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer></body></html>
"@
  [IO.File]::WriteAllText((Join-Path $dir ($slug + '.html')), $html, [Text.UTF8Encoding]::new($false))
}

1..12 | ForEach-Object { New-Item -ItemType Directory -Force -Path ("content\events\2026\{0:00}" -f $_) | Out-Null }
$events = @(EventRows)
foreach ($event in $events) { WriteEventPage $event }

"events_created=$($events.Count)"
