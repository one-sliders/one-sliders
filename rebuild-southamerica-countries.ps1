# rebuild-southamerica-countries.ps1
# Rebuilds all South America country index pages with the Norway-style rich layout.

$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"
$enc     = New-Object System.Text.UTF8Encoding $false

# Country data: keyed by folder slug
$CD = @{
  'argentina' = @{
    r='Southern South America / Río de la Plata'; g='Federal presidential republic'; y='1816'
    a='2,780,400 km2'; dn='17/km2'; tz='ART (UTC-3)'; cc='+54'; dr='Right'
    hdi='0.849'; hb='85%'; si='52.0'; sb='52%'; ia='88%'; ib='88%'; le='77.1'; lb='67%'
    m=@(('Aconcagua','6,961 m'),('Ojos del Salado','6,893 m'),('Monte Pissis','6,795 m'))
    rl=@(('Christianity','62%','#214e68'),('No religion','25%','#8ab7c4'),('Other','9%','#bac4c8'),('Spiritism','4%','#e2e4df'))
    wv=@(('Buenos Aires','Vibrant capital with European flair, tango, steakhouses, and grand boulevards.'),('Patagonia','Wind-swept wilderness of glaciers, mountains, and guanacos at the end of the world.'),('Iguazu Falls','One of the world''s great waterfalls, shared with Brazil, surrounded by rainforest.'),('Wine Country','Mendoza and the Andean foothills produce world-class Malbec wines.'),('Pampas Culture','Vast grasslands, gauchos, folk music, and Argentina''s soul.'))
    ci=@(('Buenos Aires','3.1M','100%'),('Cordoba','1.5M','48%'),('Rosario','1.3M','42%'))
    j='-1C'; u='22C'; rn='637 mm'; ct='Temperate to arid, cold south'
    nd='25 May'; el='220V, Type C/I'; iso='ar'
    intro='Argentina stretches from the tropics to Antarctica, encompassing Patagonian glaciers, Andean peaks, and the cultural vibrancy of Buenos Aires.'
  }
  'bolivia' = @{
    r='Western South America / Andean'; g='Unitary presidential republic'; y='1825'
    a='1,098,581 km2'; dn='11/km2'; tz='BOT (UTC-4)'; cc='+591'; dr='Right'
    hdi='0.703'; hb='70%'; si='48.0'; sb='48%'; ia='54%'; ib='54%'; le='72.3'; lb='62%'
    m=@(('Nevado Sajama','6,542 m'),('Illimani','6,438 m'),('Huayna Potosí','6,088 m'))
    rl=@(('Christianity','95%','#214e68'),('No religion','3%','#8ab7c4'),('Indigenous faiths','1%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Salar de Uyuni','The world''s largest salt flat, a surreal mirror landscape at 3,650 m altitude.'),('Lake Titicaca','The highest navigable lake on earth, shared with Peru, dotted with reed islands.'),('Sucre','Bolivia''s constitutional capital, a UNESCO-listed colonial white city.'),('Amazon Basin','Dense jungle in the north teeming with wildlife and indigenous communities.'),('Potosí Mines','Historic silver mines that once funded the Spanish empire, now a UNESCO site.'))
    ci=@(('Santa Cruz','2.4M','100%'),('La Paz','835k','35%'),('Cochabamba','690k','29%'))
    j='10C'; u='15C'; rn='600 mm'; ct='Varies: tropical lowlands, cold Altiplano'
    nd='6 August'; el='220V, Type A/C'; iso='bo'
    intro='Bolivia is a landlocked country of extraordinary contrasts, from the high-altitude Altiplano and salt flats to lush Amazonian rainforest and colonial cities.'
  }
  'brazil' = @{
    r='Eastern South America'; g='Federal presidential republic'; y='1822'
    a='8,515,767 km2'; dn='25/km2'; tz='BRT (UTC-3, multiple zones)'; cc='+55'; dr='Right'
    hdi='0.760'; hb='76%'; si='23.0'; sb='23%'; ia='84%'; ib='84%'; le='75.5'; lb='65%'
    m=@(('Pico da Neblina','2,994 m'),('Pico 31 de Março','2,974 m'),('Pico da Bandeira','2,892 m'))
    rl=@(('Christianity','88%','#214e68'),('No religion','8%','#8ab7c4'),('Spiritism','2%','#bac4c8'),('Other','2%','#e2e4df'))
    wv=@(('Rio de Janeiro','Iconic beaches, Carnival, Christ the Redeemer, and Sugarloaf Mountain.'),('Amazon Rainforest','The world''s largest tropical forest, home to millions of species.'),('Iguazu Falls','Spectacular waterfalls on the Argentina border amid lush subtropical jungle.'),('Carnival','Rio and Salvador host the world''s most extravagant annual street festival.'),('Fernando de Noronha','Pristine volcanic archipelago with crystal-clear waters and sea turtles.'))
    ci=@(('São Paulo','12.3M','100%'),('Rio de Janeiro','6.8M','55%'),('Brasília','3.1M','25%'))
    j='23C'; u='22C'; rn='1,761 mm'; ct='Tropical to subtropical'
    nd='7 September'; el='127/220V, Type N'; iso='br'
    intro='Brazil is the world''s fifth-largest country, a land of Carnival, the Amazon, world-class football, and extraordinary biodiversity spanning tropical and subtropical zones.'
  }
  'chile' = @{
    r='Southern South America / Andes'; g='Unitary presidential republic'; y='1818'
    a='756,102 km2'; dn='26/km2'; tz='CLT (UTC-3/UTC-4)'; cc='+56'; dr='Right'
    hdi='0.860'; hb='86%'; si='62.0'; sb='62%'; ia='90%'; ib='90%'; le='81.2'; lb='72%'
    m=@(('Ojos del Salado','6,893 m'),('Monte Pissis','6,795 m'),('Nevado Tres Cruces','6,749 m'))
    rl=@(('Christianity','67%','#214e68'),('No religion','25%','#8ab7c4'),('Other','5%','#bac4c8'),('Indigenous faiths','3%','#e2e4df'))
    wv=@(('Atacama Desert','The driest non-polar desert on earth, famous for stargazing and moonlike landscapes.'),('Patagonia & Torres del Paine','Dramatic granite towers, glaciers, and wild wind in the world''s end wilderness.'),('Easter Island','Remote Pacific island with its iconic moai statues and Polynesian culture.'),('Wine Valleys','Casablanca and Maipo valleys produce superb Carménère and Sauvignon Blanc.'),('Lake District','Glacial lakes, volcanoes, and German-influenced towns in southern Chile.'))
    ci=@(('Santiago','6.3M','100%'),('Valparaíso','930k','15%'),('Concepción','835k','13%'))
    j='9C'; u='19C'; rn='312 mm'; ct='Mediterranean (centre), arid (north), cold (south)'
    nd='18 September'; el='220V, Type C/L'; iso='cl'
    intro='Chile is a uniquely elongated country stretching 4,300 km along the Pacific coast, encompassing the driest desert, glaciers, volcanoes, and some of South America''s finest wine.'
  }
  'colombia' = @{
    r='Northwestern South America'; g='Unitary presidential constitutional republic'; y='1810'
    a='1,141,748 km2'; dn='46/km2'; tz='COT (UTC-5)'; cc='+57'; dr='Right'
    hdi='0.758'; hb='76%'; si='36.0'; sb='36%'; ia='73%'; ib='73%'; le='77.1'; lb='67%'
    m=@(('Pico Cristóbal Colón','5,775 m'),('Pico Simón Bolívar','5,775 m'),('Ritacuba Blanco','5,380 m'))
    rl=@(('Christianity','90%','#214e68'),('No religion','6%','#8ab7c4'),('Other','3%','#bac4c8'),('Indigenous faiths','1%','#e2e4df'))
    wv=@(('Cartagena','Walled Caribbean city of colonial palaces, coral-coloured buildings, and beaches.'),('Coffee Region','Lush green mountains where world-renowned Colombian coffee is grown.'),('Amazon & Llanos','Vast lowland ecosystems with exceptional biodiversity including pink river dolphins.'),('Medellín','Transformed city of innovation, eternal spring climate, and vibrant street art.'),('Lost City','Ancient pre-Columbian settlement deep in the Sierra Nevada, older than Machu Picchu.'))
    ci=@(('Bogotá','7.7M','100%'),('Medellín','2.6M','34%'),('Cali','2.2M','29%'))
    j='15C'; u='15C'; rn='1,100 mm'; ct='Tropical (varying by altitude)'
    nd='20 July'; el='110V, Type A/B'; iso='co'
    intro='Colombia bridges Central and South America, offering Caribbean beaches, Andean highlands, Amazon rainforest, and a renaissance story of culture, coffee, and biodiversity.'
  }
  'ecuador' = @{
    r='Northwestern South America / Andean'; g='Unitary presidential republic'; y='1822'
    a='283,561 km2'; dn='70/km2'; tz='ECT (UTC-5)'; cc='+593'; dr='Right'
    hdi='0.740'; hb='74%'; si='43.0'; sb='43%'; ia='77%'; ib='77%'; le='77.9'; lb='68%'
    m=@(('Chimborazo','6,263 m'),('Cotopaxi','5,897 m'),('Cayambe','5,790 m'))
    rl=@(('Christianity','92%','#214e68'),('No religion','5%','#8ab7c4'),('Indigenous faiths','2%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Galápagos Islands','Living laboratory of evolution where Darwin developed his theory of natural selection.'),('Avenue of Volcanoes','Double row of volcanoes along the Andes including Cotopaxi and Chimborazo.'),('Amazon Rainforest','Yasuni National Park is one of the most biodiverse places on the planet.'),('Quito Old Town','UNESCO-listed colonial centre at 2,850 m altitude with well-preserved Spanish architecture.'),('Cloud Forest','Transitional ecosystems between Andes and Amazon teeming with orchids and hummingbirds.'))
    ci=@(('Guayaquil','2.7M','100%'),('Quito','1.8M','67%'),('Cuenca','330k','12%'))
    j='14C'; u='14C'; rn='1,274 mm'; ct='Tropical coastal, highland, Amazonian'
    nd='10 August'; el='120V, Type A/B'; iso='ec'
    intro='Ecuador sits on the equator, packing volcanoes, Amazon jungle, colonial cities, and the famed Galápagos Islands into one of South America''s most compact and biodiverse countries.'
  }
  'guyana' = @{
    r='Northern South America / Caribbean'; g='Unitary presidential republic'; y='1966'
    a='214,969 km2'; dn='4/km2'; tz='GYT (UTC-4)'; cc='+592'; dr='Left'
    hdi='0.714'; hb='71%'; si='36.0'; sb='36%'; ia='68%'; ib='68%'; le='70.5'; lb='60%'
    m=@(('Mount Roraima','2,810 m'),('Merume Mountains','1,465 m'),('Kanuku Mountains','1,000 m'))
    rl=@(('Christianity','63%','#214e68'),('Hinduism','25%','#8ab7c4'),('Islam','7%','#bac4c8'),('Other','5%','#e2e4df'))
    wv=@(('Kaieteur Falls','One of the world''s most powerful waterfalls, hidden in untouched Amazonian jungle.'),('Rainforest Wildlife','90% forested, home to jaguars, tapirs, harpy eagles, and giant river otters.'),('Mount Roraima','Tabletop mountain (tepui) inspiring Arthur Conan Doyle''s The Lost World.'),('Georgetown','Colonial wooden architecture and vibrant multicultural Caribbean capital.'),('Rupununi Savanna','Vast wetland savanna with cowboy culture and exceptional birdwatching.'))
    ci=@(('Georgetown','235k','100%'),('Linden','35k','15%'),('New Amsterdam','18k','8%'))
    j='27C'; u='27C'; rn='2,387 mm'; ct='Tropical, hot and humid'
    nd='26 May'; el='110/220V, Type A/B/D'; iso='gy'
    intro='Guyana is a Caribbean-influenced South American country of vast untouched rainforest, extraordinary waterfalls, and a unique blend of African, Indian, and Amerindian cultures.'
  }
  'paraguay' = @{
    r='Central South America / Río de la Plata'; g='Unitary presidential republic'; y='1811'
    a='406,752 km2'; dn='18/km2'; tz='PYT (UTC-4)'; cc='+595'; dr='Right'
    hdi='0.717'; hb='72%'; si='47.0'; sb='47%'; ia='67%'; ib='67%'; le='75.9'; lb='65%'
    m=@(('Cerro San Rafael','850 m'),('Cerro Peró','842 m'),('Cerro Acahay','450 m'))
    rl=@(('Christianity','97%','#214e68'),('No religion','1%','#8ab7c4'),('Indigenous faiths','1%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Jesuit Ruins','UNESCO-listed 17th-century Jesuit mission reductions in the jungle.'),('Pantanal','Southern Pantanal wetlands teeming with caimans, capybaras, and exotic birds.'),('Iguazu Falls','Day trips to the famous falls near Ciudad del Este.'),('Asunción','One of South America''s oldest cities, with colonial architecture along the Paraguay River.'),('Chaco Wilderness','Remote Gran Chaco region with unique dry-forest wildlife.'))
    ci=@(('Asunción','525k','100%'),('Ciudad del Este','387k','74%'),('San Lorenzo','270k','51%'))
    j='24C'; u='16C'; rn='1,300 mm'; ct='Subtropical, humid east, semi-arid west'
    nd='15 May'; el='220V, Type C'; iso='py'
    intro='Paraguay is a landlocked nation between Argentina and Brazil, known for its Guaraní cultural heritage, Jesuit ruins, subtropical forests, and one of the world''s highest percentages of renewable energy.'
  }
  'peru' = @{
    r='Western South America / Andean'; g='Unitary presidential republic'; y='1821'
    a='1,285,216 km2'; dn='26/km2'; tz='PET (UTC-5)'; cc='+51'; dr='Right'
    hdi='0.762'; hb='76%'; si='44.0'; sb='44%'; ia='72%'; ib='72%'; le='77.4'; lb='67%'
    m=@(('Huascarán','6,768 m'),('Yerupajá','6,635 m'),('Coropuna','6,377 m'))
    rl=@(('Christianity','90%','#214e68'),('No religion','5%','#8ab7c4'),('Indigenous faiths','3%','#bac4c8'),('Other','2%','#e2e4df'))
    wv=@(('Machu Picchu','The iconic Inca citadel in the Andes, one of the world''s greatest archaeological wonders.'),('Amazon Basin','Iquitos and Manu National Park offer access to pristine Amazonian wilderness.'),('Lake Titicaca','The highest navigable lake in the world, home to the Uros floating reed islands.'),('Cusco','Inca imperial capital with UNESCO-listed historic centre and gateway to the Sacred Valley.'),('Nazca Lines','Ancient geoglyphs etched into the desert, visible only from the air.'))
    ci=@(('Lima','10.5M','100%'),('Arequipa','1.1M','10%'),('Trujillo','970k','9%'))
    j='23C'; u='13C'; rn='500 mm'; ct='Tropical coast, highland, Amazonian'
    nd='28 July'; el='220V, Type A/C'; iso='pe'
    intro='Peru is the cradle of the Inca Empire, home to Machu Picchu, the Amazon, Lake Titicaca, and Lima''s world-renowned cuisine — one of the most culturally and ecologically diverse countries on earth.'
  }
  'suriname' = @{
    r='Northern South America'; g='Unitary parliamentary republic'; y='1975'
    a='163,820 km2'; dn='4/km2'; tz='SRT (UTC-3)'; cc='+597'; dr='Left'
    hdi='0.730'; hb='73%'; si='42.0'; sb='42%'; ia='70%'; ib='70%'; le='72.7'; lb='62%'
    m=@(('Juliana Top','1,230 m'),('Tafelberg','1,026 m'),('Goliathberg','358 m'))
    rl=@(('Christianity','48%','#214e68'),('Hinduism','22%','#8ab7c4'),('Islam','14%','#bac4c8'),('Other','16%','#e2e4df'))
    wv=@(('Central Suriname Reserve','UNESCO rainforest reserve covering nearly 12% of the country, one of the world''s last pristine tropical forests.'),('Paramaribo','Unique wooden colonial city blending Dutch, African, and Asian architecture, UNESCO-listed.'),('River Expeditions','Multi-day canoe trips on the Suriname River into deep jungle.'),('Indigenous Villages','Visit Maroon and Amerindian communities maintaining centuries-old traditions.'),('Birdwatching','Over 700 bird species including harpy eagle, scarlet macaw, and cock-of-the-rock.'))
    ci=@(('Paramaribo','241k','100%'),('Lelydorp','18k','7%'),('Nieuw Nickerie','13k','5%'))
    j='26C'; u='28C'; rn='2,331 mm'; ct='Tropical, hot and humid'
    nd='25 November'; el='127V, Type C/F'; iso='sr'
    intro='Suriname is South America''s smallest country and the only Dutch-speaking nation in the continent, with vast unspoiled rainforest, a multicultural colonial capital, and extraordinary biodiversity.'
  }
  'uruguay' = @{
    r='Southern South America / Río de la Plata'; g='Unitary presidential republic'; y='1825'
    a='176,215 km2'; dn='20/km2'; tz='UYT (UTC-3)'; cc='+598'; dr='Right'
    hdi='0.830'; hb='83%'; si='70.0'; sb='70%'; ia='88%'; ib='88%'; le='78.5'; lb='69%'
    m=@(('Cerro Catedral','514 m'),('Cerro Tres Picos','439 m'),('Cerro Miriñaque','419 m'))
    rl=@(('No religion','38%','#8ab7c4'),('Christianity','54%','#214e68'),('Other','5%','#bac4c8'),('Judaism','3%','#e2e4df'))
    wv=@(('Montevideo','Progressive capital with art deco architecture, a long rambla promenade, and vibrant food scene.'),('Colonia del Sacramento','Tiny UNESCO-listed colonial town across the river from Buenos Aires.'),('Punta del Este','South America''s glamorous beach resort, drawing artists, yachties, and sun-seekers.'),('Gaucho Culture','Estancias and open pampas preserving the authentic South American cowboy tradition.'),('Progressive Society','One of South America''s most liberal democracies, early to legalize same-sex marriage and cannabis.'))
    ci=@(('Montevideo','1.4M','100%'),('Salto','104k','7%'),('Ciudad de la Costa','93k','7%'))
    j='18C'; u='10C'; rn='1,100 mm'; ct='Humid subtropical'
    nd='25 August'; el='220V, Type C/F/L'; iso='uy'
    intro='Uruguay is South America''s most progressive and stable democracy, a small country of rolling grasslands, beautiful Atlantic beaches, and a high quality of life.'
  }
  'venezuela' = @{
    r='Northern South America / Caribbean'; g='Federal presidential republic'; y='1811'
    a='916,445 km2'; dn='36/km2'; tz='VET (UTC-4)'; cc='+58'; dr='Right'
    hdi='0.711'; hb='71%'; si='14.0'; sb='14%'; ia='72%'; ib='72%'; le='74.8'; lb='65%'
    m=@(('Pico Bolívar','4,978 m'),('La Concha','4,922 m'),('Pico Espejo','4,765 m'))
    rl=@(('Christianity','96%','#214e68'),('No religion','2%','#8ab7c4'),('Indigenous faiths','1%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Angel Falls','The world''s highest uninterrupted waterfall (979 m) in Canaima National Park.'),('Gran Sabana','Vast plateau landscape of tepuis (tabletop mountains) and ancient geology.'),('Canaima National Park','UNESCO site covering 3 million hectares of jungle, rivers, and tepuis.'),('Caribbean Coast','Pristine Caribbean beaches and islands including Isla Margarita.'),('Los Llanos','Flooded savannas teeming with capybaras, caimans, anacondas, and jabiru storks.'))
    ci=@(('Caracas','2.9M','100%'),('Maracaibo','1.5M','52%'),('Barquisimeto','1.1M','38%'))
    j='22C'; u='25C'; rn='836 mm'; ct='Tropical, varies by altitude'
    nd='5 July'; el='120V, Type A/B'; iso='ve'
    intro='Venezuela is a country of extraordinary natural beauty — home to Angel Falls, the Amazon, the Caribbean coast, and vast savannas — experiencing profound political and economic challenges.'
  }
}

function Build-SAPage($filePath) {
  $rel  = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return $null }
  $slug = $parts[1]

  $d = $CD[$slug]
  if (-not $d) { return $null }

  $html = [System.IO.File]::ReadAllText($filePath)

  # Extract from existing page
  $heroImg   = [regex]::Match($html, "url\('(https://[^']+)'\)").Groups[1].Value
  if (-not $heroImg) { $heroImg = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80' }

  $kicker    = [regex]::Match($html, 'class="kicker">([^<]+)').Groups[1].Value
  if (-not $kicker) { $kicker = "Country in South America" }

  $intro     = [regex]::Match($html, 'class="hero-text">([^<]+)').Groups[1].Value
  if (-not $intro) { $intro = $d.intro }

  $heroStyle = "background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$heroImg')"

  # Capital link
  $capMatch  = [regex]::Match($html, 'class="value-link" href="([^"]+)">([^<]+)</a>')
  if (-not $capMatch.Success) {
    $capMatch = [regex]::Match($html, 'href="([a-z0-9\-]+\.html)">([^<]+)</a>')
  }
  $capHref   = $capMatch.Groups[1].Value
  $capName   = $capMatch.Groups[2].Value
  $capStat   = if ($capHref) { "<a class=`"value-link`" href=`"$capHref`">$capName</a>" } else { $capName }

  $langMatch = [regex]::Match($html, '<span>Language</span><strong>([^<]+)')
  $lang      = $langMatch.Groups[1].Value
  $currMatch = [regex]::Match($html, '<span>Currency</span><strong>([^<]+)')
  $curr      = $currMatch.Groups[1].Value
  $popMatch  = [regex]::Match($html, '<span>Population</span><strong>([^<]+)')
  $pop       = $popMatch.Groups[1].Value

  # Title
  $titleMatch = [regex]::Match($html, '<title>([^<]+)</title>')
  $title      = $titleMatch.Groups[1].Value

  # City mini-grid
  $cityMatches = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>')
  $cityLinks = ''
  foreach ($m in $cityMatches) {
    $cityLinks += "          <a class=`"mini-tile`" href=`"$($m.Groups[1].Value)`"><strong>$($m.Groups[2].Value)</strong></a>`n"
  }

  # Events
  $eventMatches = [regex]::Matches($html, '<a class="event-card" href="([^"]+)">.*?<span class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $eventCards = ''
  foreach ($m in $eventMatches) {
    $eventCards += "          <a class=`"event-card`" href=`"$($m.Groups[1].Value)`"><div class=`"event-body`"><span class=`"event-date`">$($m.Groups[2].Value)</span><strong>$($m.Groups[3].Value)</strong></div></a>`n"
  }

  # Sections
  $mountainTiles = ''
  foreach ($mt in $d.m) {
    $mountainTiles += "          <div class=`"mini-tile`"><div class=`"mini-photo`" style=`"background:linear-gradient(135deg,#0d3a52,#1a6080)`"></div><strong>$($mt[0])</strong><span>$($mt[1])</span></div>`n"
  }

  $religionLegend = ''
  $relPcts = @()
  foreach ($rl in $d.rl) {
    $religionLegend += "            <li><span><i style=`"--swatch:$($rl[2])`"></i>$($rl[0])</span><strong>$($rl[1])</strong></li>`n"
    $relPcts += $rl[1]
  }

  $whyTiles = ''
  foreach ($wv in $d.wv) {
    $whyTiles += "          <div class=`"icon-tile`"><strong>$($wv[0])</strong><span>$($wv[1])</span></div>`n"
  }

  $cityBars = ''
  foreach ($ci in $d.ci) {
    $cityBars += "          <div class=`"bar-row`"><span>$($ci[0])</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($ci[2])`"></i></div><strong>$($ci[1])</strong></div>`n"
  }

  $eventsSection = ''
  if ($eventCards) {
    $eventsSection = @"
      <article class="card span-12">
        <h2 class="card-title">Upcoming Events</h2>
        <div class="event-strip">
$eventCards        </div>
      </article>
"@
  }

  $citiesSection = ''
  if ($cityLinks) {
    $citiesSection = @"
      <article class="card span-12">
        <h2 class="card-title">Cities</h2>
        <div class="mini-grid">
$cityLinks        </div>
      </article>
"@
  }

  return @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../assets/css/oneslider-mockup.css">
  <meta name="theme-color" content="#0d2137">
  <title>$title</title>
</head>
<body>  <nav class="top-menu" aria-label="Location navigation">
    <a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-back" href="../index.html" title="Back to South America" aria-label="Back to South America"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>South America</span></a>
    <a class="nav-pill" href="../index.html">South America</a>
    <a class="nav-pill active" aria-current="page" href="index.html">$title</a>
  </nav>
  <main class="page-shell">
    <section class="hero-card" style="$heroStyle">
      <div class="hero-inner">
        <div class="hero-copy">
          <img class="flag-badge" src="https://flagcdn.com/$($d.iso).svg" alt="$title flag">
          <p class="kicker">$kicker</p>
          <h1 class="hero-title">$title</h1>
          <p class="hero-text">$($d.intro)</p>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><span>Capital</span><strong>$capStat</strong></div>
          <div class="hero-stat"><span>Language</span><strong>$lang</strong></div>
          <div class="hero-stat"><span>Currency</span><strong>$curr</strong></div>
          <div class="hero-stat"><span>Population</span><strong>$pop</strong></div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="$title overview">
      <article class="card span-6">
        <h2 class="card-title">Key Facts</h2>
        <div class="fact-table">
          <div class="fact-row"><span>Region</span><strong>$($d.r)</strong></div>
          <div class="fact-row"><span>Government</span><strong>$($d.g)</strong></div>
          <div class="fact-row"><span>Independence</span><strong>$($d.y)</strong></div>
          <div class="fact-row"><span>Area</span><strong>$($d.a)</strong></div>
          <div class="fact-row"><span>Population density</span><strong>$($d.dn)</strong></div>
          <div class="fact-row"><span>Time zone</span><strong>$($d.tz)</strong></div>
          <div class="fact-row"><span>Calling code</span><strong>$($d.cc)</strong></div>
          <div class="fact-row"><span>Drives on</span><strong>$($d.dr)</strong></div>
        </div>
      </article>
      <article class="card span-6">
        <h2 class="card-title">Quick View</h2>
        <div class="bar-list">
          <div class="bar-row"><span>HDI</span><div class="bar-track"><i class="bar-fill" style="--value:$($d.hb)"></i></div><strong>$($d.hdi)</strong></div>
          <div class="bar-row"><span>Safety index</span><div class="bar-track"><i class="bar-fill" style="--value:$($d.sb)"></i></div><strong>$($d.si)</strong></div>
          <div class="bar-row"><span>Internet access</span><div class="bar-track"><i class="bar-fill" style="--value:$($d.ib)"></i></div><strong>$($d.ia)</strong></div>
          <div class="bar-row"><span>Life expectancy</span><div class="bar-track"><i class="bar-fill" style="--value:$($d.lb)"></i></div><strong>$($d.le)</strong></div>
        </div>
        <p class="source-line">Sources: World Bank, Numbeo, UN.</p>
      </article>
      <article class="card span-5">
        <h2 class="card-title">Top 3 Highest Mountains</h2>
        <div class="mini-grid">
$mountainTiles        </div>
      </article>
      <article class="card span-7">
        <h2 class="card-title">Religion (est.)</h2>
        <div class="pie-wrap">
          <div class="pie"></div>
          <ul class="legend">
$religionLegend          </ul>
        </div>
      </article>
      <article class="card span-12">
        <h2 class="card-title">Why Visit</h2>
        <div class="icon-grid">
$whyTiles        </div>
      </article>
      <article class="card span-6">
        <h2 class="card-title">Top 3 Cities by Population</h2>
        <div class="bar-list">
$cityBars        </div>
      </article>
      <article class="card span-6">
        <h2 class="card-title">Climate Overview</h2>
        <div class="metric-strip">
          <div class="metric"><strong>$($d.j)</strong><span>Jan avg.</span></div>
          <div class="metric"><strong>$($d.u)</strong><span>Jul avg.</span></div>
          <div class="metric"><strong>$($d.rn)</strong><span>Yearly rainfall</span></div>
          <div class="metric"><strong>$($d.ct)</strong><span>Climate</span></div>
        </div>
      </article>
      <article class="card span-12">
        <h2 class="card-title">Other Quick Info</h2>
        <div class="two-list">
          <div class="info-chip"><span>Currency</span><strong>$curr</strong></div>
          <div class="info-chip"><span>Official language</span><strong>$lang</strong></div>
          <div class="info-chip"><span>National day</span><strong>$($d.nd)</strong></div>
          <div class="info-chip"><span>Electricity</span><strong>$($d.el)</strong></div>
        </div>
      </article>
$citiesSection$eventsSection    </section>
  </main>

  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@
}

$converted = 0; $skipped = 0; $errors = 0

Get-ChildItem "$locRoot\south-america" -Recurse -Filter "index.html" | ForEach-Object {
  $rel = $_.FullName.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return }

  $result = Build-SAPage $_.FullName
  if ($result -eq $null) { $skipped++; Write-Host "  SKIP: $rel"; return }

  try {
    [System.IO.File]::WriteAllText($_.FullName, $result, $enc)
    $converted++
    Write-Host "  OK: $rel"
  } catch {
    $errors++
    Write-Host "  ERR: $rel — $_"
  }
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Converted : $converted"
Write-Host "Skipped   : $skipped"
Write-Host "Errors    : $errors"
