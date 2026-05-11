# rebuild-oceania-countries.ps1
# Rebuilds all Oceania country index pages with the Norway-style rich layout.

$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"
$enc     = New-Object System.Text.UTF8Encoding $false

$CD = @{
  'australia' = @{
    r='Oceania / Australasia'; g='Federal parliamentary constitutional monarchy'; y='1901'
    a='7,692,024 km2'; dn='3/km2'; tz='Multiple (AEST UTC+10 to AWST UTC+8)'; cc='+61'; dr='Left'
    hdi='0.946'; hb='95%'; si='68.0'; sb='68%'; ia='92%'; ib='92%'; le='83.5'; lb='74%'
    m=@(('Mount Kosciuszko','2,228 m'),('Mount Townsend','2,209 m'),('Mount Twynam','2,196 m'))
    rl=@(('Christianity','44%','#214e68'),('No religion','39%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','14%','#e2e4df'))
    wv=@(('Great Barrier Reef','The world''s largest coral reef system, stretching 2,300 km along the Queensland coast.'),('Sydney','Iconic harbour city with the Opera House, Harbour Bridge, and Bondi Beach.'),('Uluru','Sacred sandstone monolith at the heart of the Red Centre, revered by the Anangu people.'),('Daintree Rainforest','The world''s oldest tropical rainforest, meeting the reef at Cape Tribulation.'),('Great Ocean Road','Dramatic coastal drive past the Twelve Apostles limestone stacks in Victoria.'))
    ci=@(('Sydney','5.3M','100%'),('Melbourne','5.1M','96%'),('Brisbane','2.6M','49%'))
    j='26C'; u='13C'; rn='534 mm'; ct='Varies: tropical, arid, temperate'
    nd='26 January'; el='230V, Type I'; iso='au'
    intro='Australia is a vast island continent of extraordinary diversity, from tropical reefs and red deserts to alpine peaks and cosmopolitan cities, with one of the world''s most unique ecosystems.'
  }
  'fiji' = @{
    r='Oceania / Melanesia'; g='Unitary parliamentary republic'; y='1970'
    a='18,274 km2'; dn='49/km2'; tz='FJT (UTC+12)'; cc='+679'; dr='Left'
    hdi='0.730'; hb='73%'; si='52.0'; sb='52%'; ia='51%'; ib='51%'; le='70.8'; lb='60%'
    m=@(('Mount Tomanivi','1,324 m'),('Mount Lomalagi','1,195 m'),('Mount Tomaniivi East','1,100 m'))
    rl=@(('Christianity','65%','#214e68'),('Hinduism','28%','#8ab7c4'),('Islam','6%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Yasawa Islands','Remote volcanic islands with pristine beaches, caves, and Fijian village life.'),('Mamanuca Islands','Popular island group with world-class surf breaks and luxury resorts.'),('Coral Coast','Fringing reef and traditional villages along Viti Levu''s southern coast.'),('Bouma National Park','Waterfall trails and ancient forest on Taveuni, the Garden Island of Fiji.'),('Fijian Culture','Kava ceremonies, meke dancing, and warm Fijian hospitality.'))
    ci=@(('Suva','93k','100%'),('Lautoka','52k','56%'),('Nadi','42k','45%'))
    j='27C'; u='23C'; rn='3,000 mm'; ct='Tropical, wet and dry seasons'
    nd='10 October'; el='240V, Type I'; iso='fj'
    intro='Fiji is an archipelago of over 300 islands in the South Pacific, famous for its coral reefs, turquoise lagoons, lush rainforests, and exceptionally warm and welcoming culture.'
  }
  'kiribati' = @{
    r='Oceania / Micronesia'; g='Unitary presidential republic'; y='1979'
    a='811 km2'; dn='148/km2'; tz='GILT (UTC+14)'; cc='+686'; dr='Left'
    hdi='0.630'; hb='63%'; si='50.0'; sb='50%'; ia='15%'; ib='15%'; le='68.9'; lb='58%'
    m=@(('Banaba','81 m'),('Teraina Peak','5 m'),('Tarawa Atoll','3 m'))
    rl=@(('Christianity','97%','#214e68'),('Baha''i','2%','#8ab7c4'),('Other','1%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Phoenix Islands','UNESCO-listed remote protected area, one of the world''s largest marine protected areas.'),('Tarawa Atoll','Site of a crucial WWII battle and the heart of I-Kiribati culture.'),('Christmas Island (Kiritimati)','The world''s largest atoll by land area, known for world-class fly fishing and birdwatching.'),('Traditional Maneaba Culture','Communal meeting houses at the centre of I-Kiribati social life.'),('Climate Frontline','Kiribati faces existential threat from sea-level rise, raising urgent global climate awareness.'))
    ci=@(('South Tarawa','64k','100%'),('Kiritimati','5k','8%'),('Tabwakea','3k','5%'))
    j='29C'; u='29C'; rn='1,977 mm'; ct='Tropical, equatorial'
    nd='12 July'; el='240V, Type I'; iso='ki'
    intro='Kiribati is a scattered nation of 33 atolls and reef islands straddling the equator and International Date Line, one of the world''s most remote and climate-vulnerable countries.'
  }
  'marshall-islands' = @{
    r='Oceania / Micronesia'; g='Unitary parliamentary republic'; y='1986'
    a='181 km2'; dn='294/km2'; tz='MHT (UTC+12)'; cc='+692'; dr='Right'
    hdi='0.639'; hb='64%'; si='50.0'; sb='50%'; ia='38%'; ib='38%'; le='74.0'; lb='64%'
    m=@(('Likiep Atoll','10 m'),('Maloelap Atoll','9 m'),('Jaluit Atoll','8 m'))
    rl=@(('Christianity','98%','#214e68'),('Other','2%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Bikini Atoll','UNESCO nuclear test site, now an eerily beautiful diving destination.'),('Laura Beach','White-sand beach at the end of Majuro Atoll, a local Sunday favourite.'),('WWII Wrecks','Dramatic shipwrecks and aircraft scattered across the lagoons.'),('Alele Museum','Learn about Marshallese stick-chart navigation and traditional culture.'),('Outer Atolls','Remote island life unchanged for generations on the outer island chains.'))
    ci=@(('Majuro','28k','100%'),('Ebeye','15k','54%'),('Jabor','2k','7%'))
    j='28C'; u='28C'; rn='3,350 mm'; ct='Tropical, hot and humid'
    nd='1 May'; el='120V, Type A/B'; iso='mh'
    intro='The Marshall Islands is a Pacific nation of 29 coral atolls and 5 isolated islands, shaped by WWII history, nuclear testing legacy, and growing vulnerability to rising seas.'
  }
  'micronesia' = @{
    r='Oceania / Micronesia'; g='Federal parliamentary republic'; y='1986'
    a='702 km2'; dn='152/km2'; tz='ChST (UTC+10/+11)'; cc='+691'; dr='Right'
    hdi='0.628'; hb='63%'; si='52.0'; sb='52%'; ia='41%'; ib='41%'; le='70.7'; lb='60%'
    m=@(('Nahnalaud','791 m'),('Totolom','779 m'),('Mount Winipat','570 m'))
    rl=@(('Christianity','99%','#214e68'),('Other','1%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Truk Lagoon (Chuuk)','One of the world''s top wreck dive sites, with 60+ WWII Japanese ships and aircraft.'),('Nan Madol','Ancient megalithic city built on a reef lagoon, UNESCO World Heritage site.'),('Pohnpei Waterfalls','Lush rainforest island with spectacular waterfalls and traditional sakau culture.'),('Yap Stone Money','Yap Island is famous for its giant stone rai discs used as traditional currency.'),('Outer Island Life','Traditional navigation and canoe-building traditions survive on outer islands.'))
    ci=@(('Palikir','7k','100%'),('Weno','14k','200%'),('Kolonia','7k','100%'))
    j='28C'; u='28C'; rn='4,700 mm'; ct='Tropical, high rainfall'
    nd='3 November'; el='120V, Type A/B'; iso='fm'
    intro='Micronesia is a Pacific island nation of four states spread over 2.7 million km2 of ocean, known for WWII history, world-class diving, ancient ruins, and traditional Pacific culture.'
  }
  'nauru' = @{
    r='Oceania / Micronesia'; g='Unitary parliamentary republic'; y='1968'
    a='21 km2'; dn='500/km2'; tz='NRT (UTC+12)'; cc='+674'; dr='Left'
    hdi='0.703'; hb='70%'; si='55.0'; sb='55%'; ia='57%'; ib='57%'; le='67.6'; lb='57%'
    m=@(('Command Ridge','71 m'),('Buada Ridge','65 m'),('Menen Ridge','55 m'))
    rl=@(('Christianity','95%','#214e68'),('Other','5%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Buada Lagoon','Tranquil freshwater lagoon in the heart of the island, a peaceful oasis.'),('Phosphate History','Visit the haunting landscape of exhausted phosphate mines that once made Nauru one of the richest nations per capita.'),('WWII Relics','Japanese gun emplacements and bunkers from the wartime occupation.'),('Coral Reef Diving','Pristine outer reef wall diving in crystal-clear equatorial waters.'),('Unique Isolation','One of the world''s smallest and most isolated nations, with only one ring road.'))
    ci=@(('Yaren','1.1k','100%'),('Aiwo','1.0k','91%'),('Anabar','0.8k','73%'))
    j='28C'; u='28C'; rn='2,060 mm'; ct='Tropical, equatorial'
    nd='31 January'; el='240V, Type I'; iso='nr'
    intro='Nauru is the world''s smallest island nation and third-smallest country overall, a single raised coral island in the central Pacific with a dramatic history of phosphate wealth and ecological devastation.'
  }
  'new-zealand' = @{
    r='Oceania / Polynesia'; g='Unitary parliamentary constitutional monarchy'; y='1907'
    a='268,021 km2'; dn='19/km2'; tz='NZST (UTC+12)'; cc='+64'; dr='Left'
    hdi='0.939'; hb='94%'; si='71.0'; sb='71%'; ia='91%'; ib='91%'; le='82.5'; lb='73%'
    m=@(('Aoraki / Mount Cook','3,724 m'),('Mount Tasman','3,497 m'),('Mount Dampier','3,440 m'))
    rl=@(('Christianity','37%','#214e68'),('No religion','49%','#8ab7c4'),('Hinduism','2%','#bac4c8'),('Other','12%','#e2e4df'))
    wv=@(('Fiordland','Dramatic glacially carved fiords including Milford Sound in the world''s wettest inhabited place.'),('Rotorua','Geothermal wonderland of geysers, mud pools, and Maori culture.'),('Queenstown','Adventure capital of the world: bungee jumping, skydiving, and skiing.'),('Lord of the Rings Country','Film locations from the Shire to Mount Doom spread across spectacular landscapes.'),('Bay of Islands','Historic site of the Treaty of Waitangi, dolphin swimming, and island cruising.'))
    ci=@(('Auckland','1.7M','100%'),('Wellington','215k','13%'),('Christchurch','385k','23%'))
    j='18C'; u='8C'; rn='640 mm'; ct='Temperate oceanic'
    nd='6 February'; el='230V, Type I'; iso='nz'
    intro='New Zealand is a spectacular Pacific nation of two main islands and hundreds of smaller ones, famous for adventure sports, Maori culture, Lord of the Rings scenery, and exceptional natural beauty.'
  }
  'palau' = @{
    r='Oceania / Micronesia'; g='Unitary presidential republic'; y='1994'
    a='459 km2'; dn='19/km2'; tz='PWT (UTC+9)'; cc='+680'; dr='Right'
    hdi='0.767'; hb='77%'; si='69.0'; sb='69%'; ia='67%'; ib='67%'; le='74.0'; lb='64%'
    m=@(('Mount Ngerchelchuus','242 m'),('Babeldaob Peak','210 m'),('Ngatpang Hills','190 m'))
    rl=@(('Christianity','79%','#214e68'),('Modekngei','9%','#8ab7c4'),('Islam','6%','#bac4c8'),('Other','6%','#e2e4df'))
    wv=@(('Blue Corner','One of the world''s top scuba diving sites, with drift dives past sharks and mantas.'),('Jellyfish Lake','Snorkel among millions of harmless golden jellyfish in a landlocked marine lake.'),('Rock Islands','UNESCO-listed mushroom-shaped limestone islands with turquoise lagoons.'),('Milky Way Lagoon','Natural spa of white limestone mud in a hidden cove.'),('Pristine Marine Sanctuary','Palau was among the first nations to create a national marine sanctuary.'))
    ci=@(('Ngerulmud','391','100%'),('Koror','11k','100%'),('Airai','3k','27%'))
    j='27C'; u='27C'; rn='3,800 mm'; ct='Tropical, hot and humid'
    nd='1 October'; el='120V, Type A/B'; iso='pw'
    intro='Palau is a Pacific island nation renowned for having some of the world''s most spectacular marine biodiversity, featuring pristine coral reefs, crystal lagoons, and the unique Jellyfish Lake.'
  }
  'papua-new-guinea' = @{
    r='Oceania / Melanesia'; g='Unitary parliamentary constitutional monarchy'; y='1975'
    a='462,840 km2'; dn='20/km2'; tz='PGT (UTC+10)'; cc='+675'; dr='Left'
    hdi='0.575'; hb='58%'; si='22.0'; sb='22%'; ia='13%'; ib='13%'; le='66.7'; lb='56%'
    m=@(('Mount Wilhelm','4,509 m'),('Mount Giluwe','4,368 m'),('Mount Herbert','4,267 m'))
    rl=@(('Christianity','98%','#214e68'),('Indigenous faiths','1%','#8ab7c4'),('Other','1%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Kokoda Track','Historic WWII trail through dense jungle and remote highland villages.'),('Tufi Fjords','Dramatic drowned river valleys on the Cape Nelson peninsula.'),('Sepik River','River journey through traditional villages, carved spirit houses, and sacred masks.'),('Bird of Paradise','PNG has 38 of the 42 known species of the world''s most spectacular birds.'),('Highland Culture','Over 800 languages and thousands of distinct tribal cultures in the highlands.'))
    ci=@(('Port Moresby','364k','100%'),('Lae','148k','41%'),('Arawa','40k','11%'))
    j='27C'; u='24C'; rn='2,400 mm'; ct='Tropical monsoon'
    nd='16 September'; el='240V, Type I'; iso='pg'
    intro='Papua New Guinea is one of the most culturally diverse countries on earth, with over 800 languages, extraordinary wildlife including birds of paradise, and vast untouched wilderness.'
  }
  'samoa' = @{
    r='Oceania / Polynesia'; g='Unitary parliamentary republic'; y='1962'
    a='2,842 km2'; dn='72/km2'; tz='WST (UTC+13)'; cc='+685'; dr='Left'
    hdi='0.707'; hb='71%'; si='57.0'; sb='57%'; ia='34%'; ib='34%'; le='73.8'; lb='63%'
    m=@(('Mount Silisili','1,858 m'),('Mount Fito','1,100 m'),('Mount Vaea','472 m'))
    rl=@(('Christianity','99%','#214e68'),('Other','1%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('To Sua Ocean Trench','Stunning natural swimming hole connected to the ocean through a lava tube.'),('Lalomanu Beach','One of the South Pacific''s most beautiful beaches, with traditional fale accommodation.'),('Robert Louis Stevenson Museum','The Scottish author''s former home and final resting place in Apia.'),('Palolo Deep Marine Reserve','Snorkelling and diving in a protected reef lagoon off Apia.'),('Fa''a Samoa','Immerse in traditional Samoan culture: village life, kava, cricket, and Sunday feasts.'))
    ci=@(('Apia','37k','100%'),('Vaitele','7k','19%'),('Faleolo','4k','11%'))
    j='28C'; u='26C'; rn='2,880 mm'; ct='Tropical, two seasons'
    nd='1 June'; el='230V, Type I'; iso='ws'
    intro='Samoa is a Polynesian island nation of two main volcanic islands, where traditional fa''a Samoa culture, natural swimming holes, pristine beaches, and warm Pacific hospitality flourish.'
  }
  'solomon-islands' = @{
    r='Oceania / Melanesia'; g='Unitary parliamentary constitutional monarchy'; y='1978'
    a='28,896 km2'; dn='26/km2'; tz='SBT (UTC+11)'; cc='+677'; dr='Left'
    hdi='0.567'; hb='57%'; si='48.0'; sb='48%'; ia='11%'; ib='11%'; le='73.8'; lb='63%'
    m=@(('Mount Makarakomburu','2,447 m'),('Mount Popomanaseu','2,335 m'),('Mount Kolombangara','1,770 m'))
    rl=@(('Christianity','97%','#214e68'),('Indigenous faiths','2%','#8ab7c4'),('Other','1%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Iron Bottom Sound','WWII naval graveyard with dozens of ships lying in shallow, diveable waters.'),('Marovo Lagoon','One of the world''s largest saltwater lagoons, rich in coral and biodiversity.'),('Skull Island','Traditional skull shrines in the western islands, testament to former headhunting culture.'),('Tenaru Falls','Jungle waterfall accessible from Honiara, a popular local swimming spot.'),('Village Stays','Authentic homestays in remote villages maintaining traditional Melanesian life.'))
    ci=@(('Honiara','84k','100%'),('Gizo','7k','8%'),('Auki','5k','6%'))
    j='28C'; u='26C'; rn='3,283 mm'; ct='Tropical, hot and humid'
    nd='7 July'; el='220V, Type I'; iso='sb'
    intro='The Solomon Islands is a Melanesian archipelago of nearly 1,000 islands, known for its WWII history, exceptional diving, remote village culture, and one of the world''s largest saltwater lagoons.'
  }
  'tonga' = @{
    r='Oceania / Polynesia'; g='Unitary parliamentary constitutional monarchy'; y='1970'
    a='747 km2'; dn='173/km2'; tz='TOT (UTC+13)'; cc='+676'; dr='Left'
    hdi='0.740'; hb='74%'; si='68.0'; sb='68%'; ia='41%'; ib='41%'; le='74.4'; lb='64%'
    m=@(('Kao Volcano','1,046 m'),('Tofua Volcano','515 m'),('Fonuafo''ou','180 m'))
    rl=@(('Christianity','97%','#214e68'),('Other','2%','#8ab7c4'),('No religion','1%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Whale Watching','Swim with humpback whales in the warm waters of Vava''u, one of the world''s best whale encounters.'),('Ha''apai Islands','Remote, unspoiled island group of coral atolls and volcanic islands with minimal tourism.'),('Ancient Tongan Culture','The only Pacific monarchy, with a living royal family and rich traditional ceremonies.'),('Eua Island','Rugged ancient island with hiking, caves, and rare Tongan megapode birds.'),('Friendly Islands','Captain Cook dubbed Tonga the Friendly Islands for its welcoming people.'))
    ci=@(('Nuku''alofa','24k','100%'),('Neiafu','4k','17%'),('Haveluloto','4k','17%'))
    j='27C'; u='22C'; rn='1,750 mm'; ct='Tropical, cooler in winter'
    nd='4 November'; el='240V, Type I'; iso='to'
    intro='Tonga is the only Pacific monarchy, an archipelago of 169 islands known for swimming with humpback whales, pristine Ha''apai atolls, and a deeply traditional Polynesian culture.'
  }
  'tuvalu' = @{
    r='Oceania / Polynesia'; g='Unitary parliamentary constitutional monarchy'; y='1978'
    a='26 km2'; dn='407/km2'; tz='TVT (UTC+12)'; cc='+688'; dr='Left'
    hdi='0.674'; hb='67%'; si='55.0'; sb='55%'; ia='49%'; ib='49%'; le='68.3'; lb='58%'
    m=@(('Funafuti Atoll','4 m'),('Nukufetau Atoll','3 m'),('Nukulaelae Atoll','3 m'))
    rl=@(('Christianity','99%','#214e68'),('Other','1%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Funafuti Conservation Area','Pristine atoll lagoon with excellent snorkelling and seabird colonies.'),('Climate Ground Zero','Tuvalu is among the first nations facing inundation from rising seas, making it a climate pilgrimage site.'),('WWII History','Funafuti served as a major Allied base in the Pacific campaign.'),('Traditional Fatele Dance','Communal dance performances are central to Tuvaluan cultural gatherings.'),('Off the Beaten Path','One of the world''s least-visited countries, offering total authenticity.'))
    ci=@(('Funafuti','6.3k','100%'),('Vaiaku','2k','32%'),('Fongafale','2k','32%'))
    j='29C'; u='29C'; rn='3,000 mm'; ct='Tropical, equatorial'
    nd='1 October'; el='220V, Type I'; iso='tv'
    intro='Tuvalu is one of the world''s smallest and lowest-lying nations, a remote Polynesian atoll nation in the central Pacific facing an existential threat from rising sea levels driven by climate change.'
  }
  'vanuatu' = @{
    r='Oceania / Melanesia'; g='Unitary parliamentary republic'; y='1980'
    a='12,189 km2'; dn='23/km2'; tz='VUT (UTC+11)'; cc='+678'; dr='Right'
    hdi='0.607'; hb='61%'; si='63.0'; sb='63%'; ia='25%'; ib='25%'; le='70.6'; lb='60%'
    m=@(('Tabwemasana','1,879 m'),('Mount Suretamatai','1,730 m'),('Mount Vetlam','1,619 m'))
    rl=@(('Christianity','93%','#214e68'),('Indigenous faiths','5%','#8ab7c4'),('Other','2%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Mount Yasur','One of the world''s most accessible active volcanoes, on Tanna Island.'),('Blue Hole','Crystal-clear blue holes and swimming spots across Espiritu Santo.'),('SS President Coolidge','One of the world''s greatest wreck dives, a luxury liner turned troop ship sunk in 1942.'),('Pentecost Land Diving','Ritual vine-jumping ceremony that inspired bungee jumping.'),('Cultural Diversity','Over 100 languages and distinct island cultures in a nation of 80 islands.'))
    ci=@(('Port Vila','44k','100%'),('Luganville','16k','36%'),('Isangel','2k','5%'))
    j='28C'; u='22C'; rn='4,000 mm'; ct='Tropical, wet and dry seasons'
    nd='30 July'; el='230V, Type I'; iso='vu'
    intro='Vanuatu is a Melanesian archipelago of 80 islands known for active volcanoes, dramatic rituals including land diving, exceptional wreck diving, and a remarkable diversity of languages and cultures.'
  }
}

function Build-OcPage($filePath) {
  $rel  = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return $null }
  $slug = $parts[1]

  $d = $CD[$slug]
  if (-not $d) { return $null }

  $html = [System.IO.File]::ReadAllText($filePath)

  $heroImg   = [regex]::Match($html, "url\('(https://[^']+)'\)").Groups[1].Value
  if (-not $heroImg) { $heroImg = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80' }

  $kicker    = [regex]::Match($html, 'class="kicker">([^<]+)').Groups[1].Value
  if (-not $kicker) { $kicker = "Country in Oceania" }

  $heroStyle = "background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$heroImg')"

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

  $titleMatch = [regex]::Match($html, '<title>([^<]+)</title>')
  $title      = $titleMatch.Groups[1].Value

  $cityMatches = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>')
  $cityLinks = ''
  foreach ($m in $cityMatches) {
    $cityLinks += "          <a class=`"mini-tile`" href=`"$($m.Groups[1].Value)`"><strong>$($m.Groups[2].Value)</strong></a>`n"
  }

  $eventMatches = [regex]::Matches($html, '<a class="event-card" href="([^"]+)">.*?<span class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $eventCards = ''
  foreach ($m in $eventMatches) {
    $eventCards += "          <a class=`"event-card`" href=`"$($m.Groups[1].Value)`"><div class=`"event-body`"><span class=`"event-date`">$($m.Groups[2].Value)</span><strong>$($m.Groups[3].Value)</strong></div></a>`n"
  }

  $mountainTiles = ''
  foreach ($mt in $d.m) {
    $mountainTiles += "          <div class=`"mini-tile`"><div class=`"mini-photo`" style=`"background:linear-gradient(135deg,#0d3a52,#1a6080)`"></div><strong>$($mt[0])</strong><span>$($mt[1])</span></div>`n"
  }

  $religionLegend = ''
  foreach ($rl in $d.rl) {
    $religionLegend += "            <li><span><i style=`"--swatch:$($rl[2])`"></i>$($rl[0])</span><strong>$($rl[1])</strong></li>`n"
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
    <a class="nav-back" href="../index.html" title="Back to Oceania" aria-label="Back to Oceania"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>Oceania</span></a>
    <a class="nav-pill" href="../index.html">Oceania</a>
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

Get-ChildItem "$locRoot\oceania" -Recurse -Filter "index.html" | ForEach-Object {
  $rel = $_.FullName.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return }

  $result = Build-OcPage $_.FullName
  if ($result -eq $null) { $skipped++; Write-Host "  SKIP: $rel"; return }

  try {
    [System.IO.File]::WriteAllText($_.FullName, $result, $enc)
    $converted++
    Write-Host "  OK: $rel"
  } catch {
    $errors++
    Write-Host "  ERR: $rel - $_"
  }
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Converted : $converted"
Write-Host "Skipped   : $skipped"
Write-Host "Errors    : $errors"
