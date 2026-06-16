$ErrorActionPreference = 'Stop'

function Slug([string]$s) {
  $n = $s.ToLowerInvariant()
  $n = $n -replace 'å','a' -replace 'ä','a' -replace 'ö','o' -replace 'é','e' -replace 'è','e' -replace 'á','a' -replace 'í','i' -replace 'ó','o' -replace 'ú','u' -replace 'ã','a' -replace 'ç','c' -replace 'ñ','n'
  $n = $n -replace '&',' and '
  $n = $n -replace '[^a-z0-9]+','-'
  $n.Trim('-')
}

function Enc([string]$s) { [Net.WebUtility]::HtmlEncode($s) }

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

function Palette($category, $name) {
  if ($name -match 'Grand Prix|MotoGP|Formula|Prix') { return @('#081522','#154f7d','#e63946','#ffd166') }
  if ($category -match 'Food') { return @('#241309','#7b3f1d','#f0b94a','#fff0c2') }
  if ($category -match 'Music') { return @('#160b2e','#532d8f','#ff7bc4','#ffe4ff') }
  if ($category -match 'Culture|National') { return @('#250916','#8f2d56','#ffd166','#ffe8b6') }
  if ($category -match 'Climate') { return @('#09271e','#1d6b4f','#9ee6b8','#d8fff0') }
  if ($category -match 'Wellness') { return @('#10251b','#2f7651','#bfe6d0','#ecfff5') }
  return @('#081a2d','#154f7d','#6fd0ff','#e8f8ff')
}

function Motif($event) {
  $n = $event.name
  if ($n -match 'World Cup|Champions|Libertadores|football|AFL|NRL|Bledisloe|State of Origin') {
    return '<ellipse cx="760" cy="510" rx="330" ry="84" fill="rgba(68,170,91,.58)"/><path d="M430 510h660M520 470v80M1000 470v80" stroke="rgba(255,255,255,.45)" stroke-width="7"/><path d="M510 335c105-62 390-62 500 0" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="18"/><circle cx="760" cy="470" r="44" fill="rgba(255,255,255,.9)"/><path d="M735 470h50M760 445v50" stroke="rgba(0,0,0,.23)" stroke-width="7"/>'
  }
  if ($n -match 'Grand Prix|MotoGP') {
    return '<path d="M360 560c185-175 350-190 515-100 97 53 195 50 305-20" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="54" stroke-linecap="round"/><path d="M360 560c185-175 350-190 515-100 97 53 195 50 305-20" fill="none" stroke="rgba(10,20,28,.72)" stroke-width="36" stroke-linecap="round"/><path d="M565 455h150l60 42h-286z" fill="rgba(230,57,70,.93)"/><circle cx="545" cy="508" r="27" fill="#0a0f17"/><circle cx="758" cy="508" r="27" fill="#0a0f17"/><path d="M150 190h420M130 230h310M180 270h520" stroke="rgba(255,255,255,.18)" stroke-width="12" stroke-linecap="round"/>'
  }
  if ($n -match 'Oktoberfest|Festa Junina|Food|Diwali|Day of the Dead|Carnival|Fiestas|Fiji Day|Independence') {
    return '<path d="M140 120h980v120H140z" fill="rgba(255,255,255,.12)"/><path d="M170 122l55 58 55-58 55 58 55-58 55 58 55-58 55 58 55-58 55 58 55-58 55 58 55-58 55 58 55-58 55 58 55-58" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="8"/><circle cx="845" cy="430" r="92" fill="rgba(255,209,102,.42)"/><path d="M500 385h150l-25 210H525z" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.72)" stroke-width="10"/><path d="M520 470h112" stroke="rgba(255,255,255,.75)" stroke-width="16"/><circle cx="375" cy="465" r="72" fill="rgba(255,255,255,.22)"/><path d="M335 455c40-44 88-44 126 0" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="10"/>'
  }
  if ($n -match 'Film|Cannes|Venice|Marrakech|Cairo') {
    return '<path d="M180 580h780l90-260H270z" fill="rgba(255,255,255,.13)"/><path d="M285 330h760" stroke="rgba(255,255,255,.72)" stroke-width="18"/><circle cx="365" cy="250" r="78" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.56)" stroke-width="10"/><circle cx="540" cy="250" r="78" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.56)" stroke-width="10"/><path d="M185 610c180-130 520-130 700 0" fill="none" stroke="rgba(230,57,70,.7)" stroke-width="42" stroke-linecap="round"/><path d="M930 180l95-55 30 170-118-20z" fill="rgba(255,255,255,.55)"/>'
  }
  if ($n -match 'Lantern|Vivid|New Years|Fireworks') {
    return '<circle cx="910" cy="220" r="110" fill="rgba(255,255,255,.18)"/><path d="M900 105v230M785 220h230M820 140l165 165M985 140 820 305" stroke="rgba(255,255,255,.65)" stroke-width="8"/><path d="M180 590h900" stroke="rgba(255,255,255,.18)" stroke-width="26"/><path d="M280 560V380h70v180M390 560V300h90v260M535 560V350h80v210M670 560V260h105v300" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="16"/><circle cx="315" cy="245" r="38" fill="rgba(255,209,102,.75)"/><circle cx="520" cy="185" r="28" fill="rgba(255,123,196,.75)"/><circle cx="700" cy="190" r="34" fill="rgba(111,208,255,.75)"/>'
  }
  if ($n -match 'Marathon|Running') {
    return '<path d="M130 565c250-95 520-95 940 0" fill="none" stroke="rgba(255,255,255,.33)" stroke-width="32" stroke-linecap="round"/><path d="M430 300l80 70 80-35 65 90 110 55" fill="none" stroke="rgba(255,255,255,.82)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><circle cx="415" cy="270" r="35" fill="rgba(255,255,255,.82)"/><path d="M565 385l-75 115M645 420l-40 120" stroke="rgba(255,255,255,.82)" stroke-width="18" stroke-linecap="round"/><path d="M780 350l55 55 88-28" fill="none" stroke="rgba(255,255,255,.52)" stroke-width="16" stroke-linecap="round"/><circle cx="765" cy="325" r="27" fill="rgba(255,255,255,.52)"/>'
  }
  if ($n -match 'Migration|Whale|Kwita|Queenstown|Winter') {
    return '<path d="M0 560c210-170 420-170 630 0s390 170 570 0v200H0z" fill="rgba(255,255,255,.16)"/><path d="M180 500c110-190 220-260 330-90 70-110 150-145 255-20 85-130 195-160 320 110z" fill="rgba(255,255,255,.28)"/><circle cx="920" cy="170" r="78" fill="rgba(255,255,255,.22)"/><path d="M260 555c60-40 100-40 160 0M500 555c80-55 135-55 215 0M770 555c55-35 95-35 150 0" stroke="rgba(255,255,255,.58)" stroke-width="16" stroke-linecap="round"/>'
  }
  if ($n -match 'Horse|Melbourne Cup|Durban July') {
    return '<path d="M320 485c60-105 185-135 305-76 75 37 160 35 250-18l80 90c-120 78-252 80-368 25-88-42-153-28-205 55z" fill="rgba(255,255,255,.45)"/><circle cx="410" cy="390" r="48" fill="rgba(255,255,255,.56)"/><path d="M470 530l-35 105M650 520l20 120M790 500l70 105" stroke="rgba(255,255,255,.64)" stroke-width="18" stroke-linecap="round"/><path d="M130 620h980" stroke="rgba(255,255,255,.28)" stroke-width="20"/>'
  }
  return '<path d="M170 560c150-170 280-190 390-70 90-140 220-180 370-70 70 50 120 85 210 85v255H170z" fill="rgba(255,255,255,.14)"/><circle cx="845" cy="250" r="112" fill="rgba(255,255,255,.22)"/><path d="M300 360c120-70 240-70 360 0s240 70 360 0" fill="none" stroke="rgba(255,255,255,.54)" stroke-width="20" stroke-linecap="round"/><path d="M300 445c120-70 240-70 360 0s240 70 360 0" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="20" stroke-linecap="round"/>'
}

function MakeHero($event) {
  $slug = Slug $event.name
  $dir = "content/events/2026/$($event.month)/img"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $p = Palette $event.category $event.name
  $name = Enc $event.name
  $city = Enc (($event.cities -split ',')[0])
  $time = Enc $event.time
  $motif = Motif $event
  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1200" viewBox="0 0 1800 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="$($p[0])"/>
      <stop offset=".58" stop-color="$($p[1])"/>
      <stop offset="1" stop-color="$($p[2])"/>
    </linearGradient>
    <radialGradient id="glow" cx="73%" cy="22%" r="55%">
      <stop stop-color="$($p[3])" stop-opacity=".55"/>
      <stop offset=".55" stop-color="$($p[3])" stop-opacity=".12"/>
      <stop offset="1" stop-color="$($p[3])" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 .16"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="1800" height="1200" fill="url(#bg)"/>
  <rect width="1800" height="1200" fill="url(#glow)"/>
  <rect width="1800" height="1200" filter="url(#grain)" opacity=".42"/>
  <path d="M0 870c270-130 470-126 720-10 260 120 575 100 1080-88v428H0z" fill="rgba(0,0,0,.25)"/>
  <g transform="translate(260 210) scale(1.05)">
    $motif
  </g>
  <g opacity=".45">
    <circle cx="1450" cy="185" r="5" fill="white"/><circle cx="1510" cy="260" r="3" fill="white"/><circle cx="1320" cy="310" r="4" fill="white"/>
    <circle cx="1120" cy="170" r="3" fill="white"/><circle cx="1560" cy="390" r="4" fill="white"/>
  </g>
  <text x="82" y="120" fill="rgba(255,255,255,.76)" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800" letter-spacing="4">$time</text>
  <text x="82" y="1012" fill="rgba(255,255,255,.82)" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" letter-spacing="3">$city</text>
  <text x="82" y="1088" fill="rgba(255,255,255,.95)" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="900">$name</text>
</svg>
"@
  [IO.File]::WriteAllText((Join-Path $dir ($slug + '-premium.svg')), $svg, [Text.UTF8Encoding]::new($false))
}

$count = 0
foreach ($event in EventRows) {
  MakeHero $event
  $count++
}

"premium_event_heroes_created=$count"
