$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"

$ICONS_EVENTS = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD  = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT    = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

# Country data: r=region, g=government, y=independence, a=area, dn=density,
# tz=timezone, cc=calling, dr=drives, hdi/hb=HDI+bar, si/sb=safety+bar,
# ia/ib=internet+bar, le/lb=life expectancy+bar, m=mountains (3x name+height),
# rl=religion (4x label+%+color), wv=why visit (5x title+desc),
# ci=cities (3x name+pop+bar%), j=jan, u=jul, rn=rain, ct=climate,
# nd=national day, el=electricity, iso=flagcdn code, intro=hero text
$CD = @{

'albania' = @{
  r='Southeast Europe'; g='Parliamentary republic'; y='1912'; a='28,748 km2'; dn='99/km2'
  tz='CET (UTC+1)'; cc='+355'; dr='Right'
  hdi='0.789'; hb='79%'; si='56.1'; sb='56%'; ia='79%'; ib='79%'; le='78.5'; lb='65%'
  m=@(('Mount Korab','2,764 m'),('Maja e Jezercës','2,694 m'),('Kollata','2,558 m'))
  rl=@(('Islam','57%','#214e68'),('Christianity','17%','#8ab7c4'),('No religion','16%','#bac4c8'),('Other','10%','#e2e4df'))
  wv=@(('Albanian Riviera','Beautiful beaches along the Ionian coast with clear turquoise water.'),('Accursed Mountains','Dramatic alpine scenery with hiking trails through remote valleys.'),('Berat UNESCO City','Well-preserved Ottoman city of a thousand windows on a hillside.'),('Emerging Culture','Vibrant Tirana arts scene with colourful buildings and lively cafes.'),('Affordable Travel','One of Europe''s best-value destinations with welcoming locals.'))
  ci=@(('Tirana','923k',100),('Durres','175k',19),('Shkoder','113k',12))
  j='5'; u='26'; rn='1,300 mm'; ct='Mediterranean / Continental'
  nd='28 November'; el='230V, Type C/F'
  iso='al'; intro='A small Balkan country of rugged mountains, a dramatic coastline and a fast-emerging capital.'
}

'andorra' = @{
  r='Western Europe (Pyrenees)'; g='Parliamentary co-principality'; y='1278'; a='468 km2'; dn='164/km2'
  tz='CET (UTC+1)'; cc='+376'; dr='Right'
  hdi='0.868'; hb='87%'; si='68.0'; sb='68%'; ia='91%'; ib='91%'; le='83.7'; lb='73%'
  m=@(('Coma Pedrosa','2,942 m'),('Pic de Cataperdis','2,806 m'),('Alt de la Capa','2,764 m'))
  rl=@(('Christianity','89%','#214e68'),('No religion','8%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Alpine Skiing','World-class ski resorts at Grandvalira and Vallnord with long seasons.'),('Duty-Free Shopping','Electronics, tobacco and spirits at prices far below EU neighbours.'),('Pyrenean Hiking','Hundreds of kilometres of trails through pristine mountain scenery.'),('Thermal Spas','Caldea and Inuu are among the largest spa complexes in southern Europe.'),('Cultural Heritage','Romanesque churches and a unique co-principality tradition since 1278.'))
  ci=@(('Andorra la Vella','23k',100),('Escaldes-Engordany','14k',61),('Encamp','11k',48))
  j='-2'; u='19'; rn='800 mm'; ct='Alpine / Mediterranean influence'
  nd='8 September'; el='230V, Type C/F'
  iso='ad'; intro='A tiny Pyrenean principality jointly ruled by France and Spain, famed for skiing and duty-free shopping.'
}

'armenia' = @{
  r='South Caucasus'; g='Parliamentary republic'; y='1991'; a='29,743 km2'; dn='100/km2'
  tz='AMT (UTC+4)'; cc='+374'; dr='Right'
  hdi='0.769'; hb='77%'; si='62.0'; sb='62%'; ia='81%'; ib='81%'; le='76.0'; lb='60%'
  m=@(('Mount Aragats','4,090 m'),('Kaputjugh','3,904 m'),('Azhdahak','3,597 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Ancient Monasteries','Geghard, Khor Virap and Noravank are among the oldest Christian monasteries.'),('Mount Ararat Views','The iconic snow-capped peak dominates the horizon from Yerevan.'),('Unique Alphabet','Armenian script, created in 405 AD, is still used in its original form.'),('Armenian Brandy','Ararat cognac has been produced since 1887 and rivals French equivalents.'),('Dilijan National Park','Dubbed the "Armenian Switzerland" for its lush forested hills.'))
  ci=@(('Yerevan','1.1M',100),('Gyumri','117k',11),('Vanadzor','81k',7))
  j='-4'; u='26'; rn='570 mm'; ct='Continental / Semi-arid'
  nd='21 September'; el='230V, Type C/F'
  iso='am'; intro='One of the world''s oldest Christian nations, shaped by ancient monasteries, Caucasus mountains and a resilient culture.'
}

'austria' = @{
  r='Central Europe'; g='Federal parliamentary republic'; y='1955'; a='83,871 km2'; dn='109/km2'
  tz='CET (UTC+1)'; cc='+43'; dr='Right'
  hdi='0.916'; hb='92%'; si='72.4'; sb='72%'; ia='93%'; ib='93%'; le='82.1'; lb='70%'
  m=@(('Grossglockner','3,798 m'),('Wildspitze','3,768 m'),('Weissseespitze','3,738 m'))
  rl=@(('Christianity','62%','#214e68'),('No religion','28%','#8ab7c4'),('Islam','8%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Imperial Vienna','Schönbrunn Palace, Ringstrasse and world-class opera tradition.'),('Alpine Skiing','Innsbruck, St. Anton and Kitzbühel are iconic winter sports destinations.'),('Classical Music','Birthplace of Mozart, Schubert and Brahms with year-round festivals.'),('Salzburg','UNESCO old town, Hohensalzburg fortress and Sound of Music scenery.'),('Hallstatt','Lakeside village voted the most picturesque in the world.'))
  ci=@(('Vienna','1.9M',100),('Graz','316k',17),('Linz','206k',11))
  j='-1'; u='20'; rn='730 mm'; ct='Continental / Alpine'
  nd='26 October'; el='230V, Type C/F'
  iso='at'; intro='A landlocked alpine nation blending imperial grandeur, world-class skiing and a rich musical heritage.'
}

'azerbaijan' = @{
  r='South Caucasus'; g='Presidential republic'; y='1991'; a='86,600 km2'; dn='123/km2'
  tz='AZT (UTC+4)'; cc='+994'; dr='Right'
  hdi='0.745'; hb='74%'; si='59.0'; sb='59%'; ia='85%'; ib='85%'; le='73.6'; lb='56%'
  m=@(('Bazarduzu','4,466 m'),('Shahdag','4,243 m'),('Tufandag','4,206 m'))
  rl=@(('Islam','97%','#214e68'),('Christianity','3%','#8ab7c4'),('No religion','<1%','#bac4c8'),('Other','<1%','#e2e4df'))
  wv=@(('Baku Old City','Walled inner city UNESCO site with Maiden Tower and medieval palaces.'),('Mud Volcanoes','More than half the world''s mud volcanoes are found in Azerbaijan.'),('Flame Towers','Baku''s dramatic skyline of glass towers lit as fire at night.'),('Caucasus Villages','Remote mountain communities preserving ancient carpet-weaving traditions.'),('Ateshgah Temple','Ancient fire-worshipping temple fed by natural gas seeps.'))
  ci=@(('Baku','2.3M',100),('Sumqayit','345k',15),('Ganja','343k',15))
  j='3'; u='26'; rn='450 mm'; ct='Semi-arid / Continental'
  nd='28 May'; el='230V, Type C/F'
  iso='az'; intro='A South Caucasus nation where ancient fire temples meet futuristic towers on the Caspian shore.'
}

'belarus' = @{
  r='Eastern Europe'; g='Presidential republic'; y='1991'; a='207,600 km2'; dn='46/km2'
  tz='FET (UTC+3)'; cc='+375'; dr='Right'
  hdi='0.808'; hb='81%'; si='57.3'; sb='57%'; ia='86%'; ib='86%'; le='74.0'; lb='57%'
  m=@(('Dzyarzhynskaya Hara','346 m'),('Lysaya Hara','342 m'),('Zamkavaya Hara','320 m'))
  rl=@(('Christianity','77%','#214e68'),('No religion','17%','#8ab7c4'),('Other','4%','#bac4c8'),('Islam','2%','#e2e4df'))
  wv=@(('Bialowieza Forest','One of Europe''s last primeval forests, shared with Poland, home to wild bison.'),('Mir Castle','A stunning red-brick UNESCO fortress surrounded by a moat and gardens.'),('Nesvizh Palace','A Baroque palace complex and residence of the Radziwill dynasty, UNESCO listed.'),('Minsk Architecture','Grandiose Soviet-era boulevards and brutalist monuments in the capital.'),('Belarusian Cuisine','Draniki potato pancakes, machanka stew and kvass represent hearty traditions.'))
  ci=@(('Minsk','2.0M',100),('Homyel','480k',24),('Vitebsk','378k',19))
  j='-5'; u='19'; rn='650 mm'; ct='Humid continental'
  nd='3 July'; el='230V, Type C/F'
  iso='by'; intro='A landlocked Eastern European country of primeval forests, Soviet-era monuments and warm hospitality.'
}

'belgium' = @{
  r='Western Europe'; g='Federal parliamentary monarchy'; y='1830'; a='30,528 km2'; dn='384/km2'
  tz='CET (UTC+1)'; cc='+32'; dr='Right'
  hdi='0.937'; hb='94%'; si='61.0'; sb='61%'; ia='93%'; ib='93%'; le='82.3'; lb='70%'
  m=@(('Signal de Botrange','694 m'),('Baraque Michel','674 m'),('Weisser Stein','671 m'))
  rl=@(('Christianity','55%','#214e68'),('No religion','38%','#8ab7c4'),('Islam','5%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Bruges','A perfectly preserved medieval canal city nicknamed the Venice of the North.'),('Chocolate and Beer','Home to over 1,500 beer varieties and some of the world''s finest chocolatiers.'),('Brussels','EU capital with Art Nouveau architecture, Grand Place UNESCO and Atomium.'),('Ghent Old Town','Car-free medieval centre with Gravensteen castle and vibrant food scene.'),('Ardennes','Rolling forests and river valleys ideal for hiking and cycling.'))
  ci=@(('Brussels','1.2M',100),('Antwerp','536k',44),('Ghent','267k',22))
  j='4'; u='19'; rn='800 mm'; ct='Oceanic / Temperate'
  nd='21 July'; el='230V, Type C/F'
  iso='be'; intro='A small but densely packed country at the heart of Europe, famous for beer, chocolate and medieval cities.'
}

'bosnia-and-herzegovina' = @{
  r='Southeast Europe'; g='Federal parliamentary republic'; y='1992'; a='51,197 km2'; dn='69/km2'
  tz='CET (UTC+1)'; cc='+387'; dr='Right'
  hdi='0.780'; hb='78%'; si='59.0'; sb='59%'; ia='75%'; ib='75%'; le='77.2'; lb='62%'
  m=@(('Maglic','2,386 m'),('Volujak','2,336 m'),('Zelengora','2,014 m'))
  rl=@(('Islam','51%','#214e68'),('Christianity','46%','#8ab7c4'),('No religion','3%','#bac4c8'),('Other','<1%','#e2e4df'))
  wv=@(('Stari Most Mostar','UNESCO bridge symbolising reconciliation spanning the Neretva river.'),('Sarajevo History','The city that sparked WWI, with Ottoman bazaar, Austro-Hungarian avenues and siege memorials.'),('Una River','Crystal-clear rapids and waterfalls in a pristine national park.'),('Kravice Waterfalls','A Niagara-like cascade in a green canyon, perfect for swimming.'),('Bosnian Coffee','Thick, slow-brewed coffee served in a džezva — a ritual of hospitality.'))
  ci=@(('Sarajevo','275k',100),('Banja Luka','193k',70),('Tuzla','110k',40))
  j='-1'; u='23'; rn='1,000 mm'; ct='Continental / Mediterranean influence'
  nd='25 November'; el='230V, Type C/F'
  iso='ba'; intro='A Balkan nation of Ottoman bazaars, Ottoman mosques, Austro-Hungarian architecture and dramatic mountain scenery.'
}

'bulgaria' = @{
  r='Southeast Europe'; g='Parliamentary republic'; y='1908'; a='110,879 km2'; dn='63/km2'
  tz='EET (UTC+2)'; cc='+359'; dr='Right'
  hdi='0.795'; hb='80%'; si='58.0'; sb='58%'; ia='84%'; ib='84%'; le='73.6'; lb='56%'
  m=@(('Musala','2,925 m'),('Vihren','2,914 m'),('Botev','2,376 m'))
  rl=@(('Christianity','72%','#214e68'),('No religion','15%','#8ab7c4'),('Islam','10%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Black Sea Coast','Sandy beach resorts at Sunny Beach and Sozopol''s old town.'),('Rila Monastery','Bulgaria''s spiritual heart in a forested mountain valley, UNESCO listed.'),('Skiing in Bansko','Affordable alpine resort in the Pirin Mountains with vibrant apres-ski.'),('Valley of Roses','Roses for the world''s perfume industry, celebrated with a May festival.'),('Plovdiv Old Town','One of Europe''s oldest cities with colourful National Revival architecture.'))
  ci=@(('Sofia','1.3M',100),('Plovdiv','369k',28),('Varna','335k',26))
  j='0'; u='24'; rn='650 mm'; ct='Continental / Mediterranean south'
  nd='3 March'; el='230V, Type C/F'
  iso='bg'; intro='A Balkan nation of ancient Thracian history, Black Sea beaches, rose fields and the dramatic Pirin and Rila mountains.'
}

'croatia' = @{
  r='Southeast Europe'; g='Parliamentary republic'; y='1991'; a='56,594 km2'; dn='69/km2'
  tz='CET (UTC+1)'; cc='+385'; dr='Right'
  hdi='0.871'; hb='87%'; si='70.6'; sb='71%'; ia='86%'; ib='86%'; le='79.5'; lb='66%'
  m=@(('Dinara','1,831 m'),('Sinjal','1,758 m'),('Sv. Jure (Biokovo)','1,762 m'))
  rl=@(('Christianity','87%','#214e68'),('No religion','9%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Dubrovnik','A walled Old Town on the Adriatic, UNESCO listed and a Game of Thrones location.'),('Plitvice Lakes','Cascading turquoise lakes and waterfalls in a UNESCO national park.'),('Dalmatian Islands','Hvar, Brac and Korcula offer beaches, vineyards and medieval villages.'),('Split Diocletian''s Palace','A Roman emperor''s palace that became a living city centre.'),('Istrian Cuisine','Truffles, seafood and local wine in a peninsula of Italian-influenced villages.'))
  ci=@(('Zagreb','806k',100),('Split','178k',22),('Rijeka','108k',13))
  j='2'; u='24'; rn='900 mm'; ct='Mediterranean coast / Continental inland'
  nd='30 May'; el='230V, Type C/F'
  iso='hr'; intro='A Adriatic gem with a thousand islands, Roman ruins, medieval walled cities and crystal-clear sea.'
}

'cyprus' = @{
  r='Eastern Mediterranean'; g='Presidential republic'; y='1960'; a='9,251 km2'; dn='130/km2'
  tz='EET (UTC+2)'; cc='+357'; dr='Left'
  hdi='0.896'; hb='90%'; si='72.0'; sb='72%'; ia='90%'; ib='90%'; le='81.1'; lb='68%'
  m=@(('Mount Olympus','1,952 m'),('Papoutsa','1,554 m'),('Kionia','1,423 m'))
  rl=@(('Christianity','78%','#214e68'),('Islam','18%','#8ab7c4'),('No religion','3%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Aphrodite''s Rock','Sea-stack off the coast where the goddess of love was said to be born.'),('Paphos Mosaics','Roman-era mosaics in a coastal UNESCO archaeological park.'),('Troodos Villages','Mountain villages with Byzantine churches, vineyards and cool summer air.'),('Beaches','Nissi Beach and Coral Bay offer turquoise Mediterranean swimming.'),('Mediterranean Winters','Even in January, mild temperatures make it a year-round destination.'))
  ci=@(('Nicosia','330k',100),('Limassol','239k',72),('Larnaca','85k',26))
  j='12'; u='30'; rn='480 mm'; ct='Mediterranean (hot, dry summers)'
  nd='1 October'; el='230V, Type G'
  iso='cy'; intro='A sun-drenched island at the crossroads of Europe and the Middle East, rich in myth, mosaics and beaches.'
}

'czechia' = @{
  r='Central Europe'; g='Parliamentary republic'; y='1993'; a='78,866 km2'; dn='138/km2'
  tz='CET (UTC+1)'; cc='+420'; dr='Right'
  hdi='0.900'; hb='90%'; si='66.7'; sb='67%'; ia='87%'; ib='87%'; le='79.6'; lb='66%'
  m=@(('Snezka','1,603 m'),('Lucni hora','1,555 m'),('Studnicni hora','1,554 m'))
  rl=@(('No religion','65%','#214e68'),('Christianity','28%','#8ab7c4'),('Other','6%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Prague Old Town','Astronomical clock, Charles Bridge and a medieval skyline spanning centuries.'),('Czech Beer Culture','Among the world''s top beer consumers with centuries of brewing tradition.'),('Cesky Krumlov','A fairytale Renaissance castle town on a bend in the Vltava river.'),('Bohemian Switzerland','Sandstone pillars and gorges in a national park near the German border.'),('Karlovy Vary','Historic spa town with hot springs, colonnades and an international film festival.'))
  ci=@(('Prague','1.3M',100),('Brno','380k',29),('Ostrava','294k',23))
  j='-1'; u='20'; rn='650 mm'; ct='Humid continental / Temperate'
  nd='28 October'; el='230V, Type C/E/F'
  iso='cz'; intro='A Central European country of fairytale castles, Gothic spires, world-class beer and a thousand years of history.'
}

'denmark' = @{
  r='Northern Europe'; g='Constitutional parliamentary monarchy'; y='Ancient (c. 980)'; a='42,924 km2'; dn='136/km2'
  tz='CET (UTC+1)'; cc='+45'; dr='Right'
  hdi='0.948'; hb='95%'; si='68.0'; sb='68%'; ia='98%'; ib='98%'; le='81.4'; lb='69%'
  m=@(('Yding Skovhoj','172 m'),('Mollehoj','170 m'),('Ejer Bavnehoj','170 m'))
  rl=@(('Christianity','75%','#214e68'),('No religion','20%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Copenhagen Design','Noma, Tivoli Gardens and canal-front Nyhavn set the global design benchmark.'),('Viking Heritage','Roskilde ship museum and Jelling stones reveal the original Norse world.'),('Hygge Culture','A national philosophy of cosiness, candlelight and good company.'),('LEGO Birthplace','The world''s most famous toy was invented in Billund, still home to LEGOLAND.'),('Cycling Nation','Flat terrain and excellent infrastructure make Denmark a world cycling leader.'))
  ci=@(('Copenhagen','794k',100),('Aarhus','360k',45),('Odense','205k',26))
  j='1'; u='18'; rn='700 mm'; ct='Oceanic / Temperate'
  nd='5 June'; el='230V, Type C/E/F/K'
  iso='dk'; intro='A Scandinavian kingdom of Viking history, world-class design, cycling culture and high quality of life.'
}

'estonia' = @{
  r='Northern Europe / Baltic'; g='Parliamentary republic'; y='1991'; a='45,228 km2'; dn='31/km2'
  tz='EET (UTC+2)'; cc='+372'; dr='Right'
  hdi='0.899'; hb='90%'; si='64.2'; sb='64%'; ia='93%'; ib='93%'; le='78.0'; lb='63%'
  m=@(('Suur Munamagi','318 m'),('Valgjarve korgustik','290 m'),('Haanja plateau','300 m'))
  rl=@(('No religion','54%','#214e68'),('Christianity','40%','#8ab7c4'),('Other','5%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Tallinn Old Town','One of the best-preserved medieval cityscapes in Europe, UNESCO listed.'),('Digital Nation','The first country to declare internet access a human right and offer e-residency.'),('Lahemaa Park','Estonia''s largest national park of forests, bogs, manor houses and rocky coast.'),('Song Festival Tradition','Mass choral festivals with tens of thousands of singers have shaped national identity.'),('Saaremaa Island','Limestone cliffs, windmills and a medieval bishop''s castle on a quiet island.'))
  ci=@(('Tallinn','454k',100),('Tartu','94k',21),('Narva','57k',13))
  j='-3'; u='17'; rn='650 mm'; ct='Humid continental'
  nd='24 February'; el='230V, Type C/F'
  iso='ee'; intro='A small Baltic nation that leapt from Soviet occupation to digital pioneer, framed by medieval walls and ancient forests.'
}

'finland' = @{
  r='Northern Europe / Nordic'; g='Parliamentary republic'; y='1917'; a='338,455 km2'; dn='18/km2'
  tz='EET (UTC+2)'; cc='+358'; dr='Right'
  hdi='0.940'; hb='94%'; si='73.0'; sb='73%'; ia='96%'; ib='96%'; le='82.0'; lb='70%'
  m=@(('Halti','1,324 m'),('Ridnitsohkka','1,317 m'),('Kiedditsohkka','1,307 m'))
  rl=@(('Christianity','73%','#214e68'),('No religion','24%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Northern Lights','Lapland offers some of Europe''s best aurora borealis viewing from November to March.'),('Midnight Sun','In summer, the sun does not set for weeks above the Arctic Circle.'),('Lakes and Forests','188,000 lakes and vast boreal forests define a landscape of serene wilderness.'),('Sauna Culture','Finland has 3 million saunas for 5.5 million people — a deeply rooted tradition.'),('Helsinki Design','A compact capital known for architecture, design and food markets on the harbour.'))
  ci=@(('Helsinki','655k',100),('Espoo','295k',45),('Tampere','240k',37))
  j='-6'; u='19'; rn='650 mm'; ct='Subarctic / Humid continental'
  nd='6 December'; el='230V, Type C/F'
  iso='fi'; intro='A Nordic nation of thousands of lakes, endless forests, aurora-lit winters and a deep sauna tradition.'
}

'france' = @{
  r='Western Europe'; g='Semi-presidential republic'; y='Ancient (987)'; a='551,695 km2'; dn='119/km2'
  tz='CET (UTC+1)'; cc='+33'; dr='Right'
  hdi='0.910'; hb='91%'; si='57.0'; sb='57%'; ia='92%'; ib='92%'; le='82.6'; lb='71%'
  m=@(('Mont Blanc','4,808 m'),('Barre des Ecrins','4,102 m'),('Grande Casse','3,855 m'))
  rl=@(('Christianity','46%','#214e68'),('No religion','40%','#8ab7c4'),('Islam','8%','#bac4c8'),('Other','6%','#e2e4df'))
  wv=@(('Paris','The Eiffel Tower, Louvre and Notre-Dame draw more visitors than anywhere on Earth.'),('Gastronomy','French cuisine is UNESCO-listed heritage with Michelin-starred restaurants in every region.'),('Cote d Azur','The French Riviera combines glamour, beaches and hilltop villages.'),('Loire Chateaux','The Valley of the Kings holds over a thousand Renaissance palaces and gardens.'),('Mont Blanc','Western Europe''s highest peak rises above Chamonix for climbers and skiers.'))
  ci=@(('Paris','2.2M',100),('Marseille','870k',40),('Lyon','522k',24))
  j='5'; u='23'; rn='650 mm'; ct='Oceanic / Mediterranean / Continental'
  nd='14 July'; el='230V, Type C/E'
  iso='fr'; intro='The world''s most visited country, offering unmatched culture, cuisine, châteaux and alpine scenery.'
}

'georgia' = @{
  r='South Caucasus'; g='Parliamentary republic'; y='1991'; a='69,700 km2'; dn='57/km2'
  tz='GET (UTC+4)'; cc='+995'; dr='Right'
  hdi='0.802'; hb='80%'; si='62.0'; sb='62%'; ia='79%'; ib='79%'; le='74.3'; lb='57%'
  m=@(('Mount Shkhara','5,193 m'),('Mount Janga','5,059 m'),('Mount Kazbegi','5,047 m'))
  rl=@(('Christianity','88%','#214e68'),('Islam','11%','#8ab7c4'),('No religion','1%','#bac4c8'),('Other','<1%','#e2e4df'))
  wv=@(('Kazbegi Mountains','Gergeti Trinity Church perched at 2,170 m with views of Mount Kazbegi.'),('Wine Cradle','The 8,000-year-old tradition of fermenting wine in clay qvevri pots.'),('Tbilisi Old Town','Balconied wooden houses, sulphur baths and eclectic architecture in the capital.'),('Vardzia Cave City','A twelfth-century cave monastery carved into a volcanic cliff in southern Georgia.'),('Black Sea Coast','Batumi''s palm-lined seafront and botanical gardens on the sub-tropical coast.'))
  ci=@(('Tbilisi','1.1M',100),('Kutaisi','147k',13),('Rustavi','123k',11))
  j='2'; u='24'; rn='1,000 mm'; ct='Subtropical / Continental'
  nd='26 May'; el='230V, Type C/F'
  iso='ge'; intro='A South Caucasus nation with some of Europe''s highest peaks, the world''s oldest wine tradition and a richly layered culture.'
}

'germany' = @{
  r='Central Europe'; g='Federal parliamentary republic'; y='1990'; a='357,114 km2'; dn='234/km2'
  tz='CET (UTC+1)'; cc='+49'; dr='Right'
  hdi='0.942'; hb='94%'; si='60.4'; sb='60%'; ia='93%'; ib='93%'; le='81.3'; lb='69%'
  m=@(('Zugspitze','2,963 m'),('Watzmann','2,713 m'),('Hochvogel','2,592 m'))
  rl=@(('Christianity','54%','#214e68'),('No religion','38%','#8ab7c4'),('Islam','5%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Neuschwanstein Castle','The fairytale Bavarian castle that inspired Disney''s Sleeping Beauty.'),('Berlin','Reunified capital with world-class museums, a vibrant arts scene and rich history.'),('Oktoberfest','The world''s largest beer festival draws 6 million visitors to Munich each year.'),('Rhine Valley','Vineyards, medieval castles and river cruises along a UNESCO stretch of river.'),('Black Forest','Dense evergreen forests, cuckoo clocks, thermal spas and cherry gateau.'))
  ci=@(('Berlin','3.7M',100),('Hamburg','1.8M',49),('Munich','1.5M',41))
  j='1'; u='19'; rn='700 mm'; ct='Oceanic / Continental east'
  nd='3 October'; el='230V, Type C/F'
  iso='de'; intro='Europe''s largest economy, blending medieval castles, Baroque cities, engineering excellence and a vibrant contemporary culture.'
}

'greece' = @{
  r='Southern Europe'; g='Parliamentary republic'; y='1830'; a='131,957 km2'; dn='83/km2'
  tz='EET (UTC+2)'; cc='+30'; dr='Right'
  hdi='0.893'; hb='89%'; si='65.0'; sb='65%'; ia='80%'; ib='80%'; le='82.2'; lb='70%'
  m=@(('Mount Olympus','2,917 m'),('Mount Smolikas','2,637 m'),('Mount Gramos','2,521 m'))
  rl=@(('Christianity','90%','#214e68'),('No religion','5%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Athens and Acropolis','The cradle of Western democracy with the Parthenon on its hilltop perch.'),('Greek Islands','Santorini''s blue domes, Mykonos'' nightlife and Crete''s Minoan palaces.'),('Meteora','Byzantine monasteries perched atop sheer rock pillars in central Greece.'),('Mediterranean Cuisine','Olive oil, feta, seafood and ouzo define one of the world''s healthiest diets.'),('Ancient Sites','Delphi, Olympia and Epidaurus are among the best-preserved classical ruins.'))
  ci=@(('Athens','3.2M',100),('Thessaloniki','1.1M',34),('Patras','214k',7))
  j='10'; u='28'; rn='400 mm'; ct='Mediterranean (hot, dry summers)'
  nd='25 March'; el='230V, Type C/F'
  iso='gr'; intro='The birthplace of democracy, philosophy and the Olympics, with legendary islands and ancient ruins.'
}

'hungary' = @{
  r='Central Europe'; g='Parliamentary republic'; y='1000 AD'; a='93,028 km2'; dn='107/km2'
  tz='CET (UTC+1)'; cc='+36'; dr='Right'
  hdi='0.851'; hb='85%'; si='60.2'; sb='60%'; ia='90%'; ib='90%'; le='76.7'; lb='61%'
  m=@(('Kekes','1,014 m'),('Matra massif','1,000 m'),('Irott-ko','882 m'))
  rl=@(('Christianity','58%','#214e68'),('No religion','36%','#8ab7c4'),('Other','5%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Budapest Thermal Baths','Szechenyi and Gellert baths in Neo-Baroque splendour, fed by natural hot springs.'),('Danube Panorama','Parliament building reflected in the river is one of Europe''s most iconic views.'),('Lake Balaton','Central Europe''s largest lake, a summer resort for Hungarians and visitors alike.'),('Tokaj Wine','UNESCO-listed wine region producing the golden aszú wines since the 16th century.'),('Puszta Plains','Flat grasslands with Hungarian horsemanship, csarda inns and bird migration routes.'))
  ci=@(('Budapest','1.8M',100),('Debrecen','204k',11),('Miskolc','148k',8))
  j='-1'; u='22'; rn='600 mm'; ct='Humid continental'
  nd='20 August'; el='230V, Type C/F'
  iso='hu'; intro='A Central European nation famed for thermal baths, Tokaj wine, the Danube and one of Europe''s grandest capitals.'
}

'iceland' = @{
  r='Northern Europe / Nordic'; g='Constitutional parliamentary republic'; y='1944'; a='103,000 km2'; dn='3/km2'
  tz='GMT (UTC+0)'; cc='+354'; dr='Right'
  hdi='0.959'; hb='96%'; si='79.0'; sb='79%'; ia='98%'; ib='98%'; le='83.2'; lb='72%'
  m=@(('Hvannadalshnukur','2,110 m'),('Bardarbunga','2,009 m'),('Kverkfjoll','1,920 m'))
  rl=@(('Christianity','67%','#214e68'),('No religion','29%','#8ab7c4'),('Other','3%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Northern Lights','Long winter nights and low light pollution offer spectacular aurora displays.'),('Geysers and Hot Springs','Strokkur erupts every few minutes; the Blue Lagoon is a geothermal icon.'),('Midnight Sun','Summer days are virtually endless, with 24-hour daylight in June.'),('Glacier Hiking','Vatnajokull — Europe''s largest glacier — offers guided ice walking and ice caves.'),('Dramatic Landscapes','Volcanoes, lava fields, waterfalls and black sand beaches in one island.'))
  ci=@(('Reykjavik','131k',100),('Kopavogur','38k',29),('Hafnarfjordur','30k',23))
  j='-1'; u='12'; rn='800 mm'; ct='Subarctic / Oceanic'
  nd='17 June'; el='230V, Type C/F'
  iso='is'; intro='A volcanic island nation of geysers, glaciers, northern lights and the world''s oldest parliament.'
}

'ireland' = @{
  r='Northern Europe / British Isles'; g='Parliamentary republic'; y='1922'; a='70,273 km2'; dn='72/km2'
  tz='GMT (UTC+0)'; cc='+353'; dr='Left'
  hdi='0.945'; hb='95%'; si='70.0'; sb='70%'; ia='93%'; ib='93%'; le='83.2'; lb='72%'
  m=@(('Carrauntoohil','1,041 m'),('Beenkeragh','1,010 m'),('Caher','975 m'))
  rl=@(('Christianity','76%','#214e68'),('No religion','21%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Wild Atlantic Way','A 2,500 km coastal drive from Donegal to Cork past cliffs and beaches.'),('Cliffs of Moher','700-year-old sea cliffs rising 214 m above the Atlantic on the west coast.'),('Dublin Pub Culture','Literary pubs of Temple Bar, Guinness Storehouse and live trad music.'),('Ring of Kerry','A scenic drive through mountains and coastline in County Kerry.'),('Ancient Monuments','Newgrange passage tomb predates Stonehenge and the Egyptian pyramids.'))
  ci=@(('Dublin','1.2M',100),('Cork','210k',17),('Limerick','100k',8))
  j='6'; u='15'; rn='1,200 mm'; ct='Oceanic / Temperate (mild, wet)'
  nd='17 March'; el='230V, Type G'
  iso='ie'; intro='The Emerald Isle of rugged cliffs, green hills, ancient Celtic heritage and a warm pub culture.'
}

'italy' = @{
  r='Southern Europe'; g='Parliamentary republic'; y='1861'; a='301,340 km2'; dn='201/km2'
  tz='CET (UTC+1)'; cc='+39'; dr='Right'
  hdi='0.906'; hb='91%'; si='57.5'; sb='58%'; ia='87%'; ib='87%'; le='84.0'; lb='73%'
  m=@(('Monte Rosa / Dufourspitze','4,634 m'),('Mont Blanc (shared)','4,808 m'),('Gran Paradiso','4,061 m'))
  rl=@(('Christianity','74%','#214e68'),('No religion','19%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Rome','The Colosseum, Vatican and Trevi Fountain concentrate millennia of history.'),('Venice','A city of canals, gondolas and Byzantine-Gothic architecture, slowly sinking.'),('Tuscany','Renaissance art in Florence, Chianti wine and rolling hills of cypress trees.'),('Amalfi Coast','Dramatic cliffside villages above the Tyrrhenian Sea, UNESCO listed.'),('Italian Cuisine','Pizza, pasta, gelato and espresso form a UNESCO-recognised cultural heritage.'))
  ci=@(('Rome','2.8M',100),('Milan','1.4M',50),('Naples','946k',34))
  j='7'; u='25'; rn='800 mm'; ct='Mediterranean / Continental north'
  nd='2 June'; el='230V, Type C/F/L'
  iso='it'; intro='A Mediterranean peninsula of ancient ruins, Renaissance masterpieces, world-renowned cuisine and breathtaking coastlines.'
}

'kosovo' = @{
  r='Southeast Europe'; g='Parliamentary republic'; y='2008'; a='10,887 km2'; dn='159/km2'
  tz='CET (UTC+1)'; cc='+383'; dr='Right'
  hdi='0.742'; hb='74%'; si='50.0'; sb='50%'; ia='80%'; ib='80%'; le='72.0'; lb='53%'
  m=@(('Maja Rusit','2,658 m'),('Djeravica','2,656 m'),('Guri i Kuq','2,585 m'))
  rl=@(('Islam','96%','#214e68'),('Christianity','3%','#8ab7c4'),('No religion','1%','#bac4c8'),('Other','<1%','#e2e4df'))
  wv=@(('Visoki Decani','A 14th-century Serbian Orthodox monastery in a mountain valley, UNESCO listed.'),('Rugova Canyon','A dramatic gorge near Peja ideal for rafting, climbing and mountain walks.'),('Pristina Cafe Scene','The young, vibrant capital has a growing arts, cafe and nightlife culture.'),('Bear Sanctuary','A rescue centre for bears previously kept in cages in restaurants across the Balkans.'),('Affordable Travel','One of Europe''s most budget-friendly destinations with generous hospitality.'))
  ci=@(('Pristina','217k',100),('Prizren','85k',39),('Peja','61k',28))
  j='-1'; u='21'; rn='600 mm'; ct='Continental'
  nd='17 February'; el='230V, Type C/F'
  iso='xk'; intro='Europe''s youngest country, a Balkan nation of ancient monasteries, dramatic canyons and an emerging capital.'
}

'latvia' = @{
  r='Northern Europe / Baltic'; g='Parliamentary republic'; y='1991'; a='64,589 km2'; dn='30/km2'
  tz='EET (UTC+2)'; cc='+371'; dr='Right'
  hdi='0.879'; hb='88%'; si='59.4'; sb='59%'; ia='89%'; ib='89%'; le='75.7'; lb='60%'
  m=@(('Gaizinkalns','311 m'),('Lielais Lidumkalns','289 m'),('Tervetkalns','272 m'))
  rl=@(('Christianity','64%','#214e68'),('No religion','32%','#8ab7c4'),('Other','3%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Riga Art Nouveau','One-third of Riga''s buildings are Art Nouveau — the highest concentration in the world.'),('Gauja National Park','Sandstone cliffs, medieval castles and forest trails in Latvia''s oldest park.'),('Jurmala','A 33 km beach resort of wooden villas and spas on the Gulf of Riga.'),('Latvian Song Festival','A mass choral event held every five years that helped win independence.'),('Cesis Medieval Castle','A 13th-century fortress in a small town with an intact old quarter.'))
  ci=@(('Riga','615k',100),('Daugavpils','80k',13),('Jelgava','56k',9))
  j='-4'; u='18'; rn='700 mm'; ct='Humid continental'
  nd='18 November'; el='230V, Type C/F'
  iso='lv'; intro='A Baltic nation of Art Nouveau architecture, ancient forests, sandy beaches and a singing revolution heritage.'
}

'liechtenstein' = @{
  r='Central Europe (Alpine)'; g='Constitutional hereditary principality'; y='1806'; a='160 km2'; dn='238/km2'
  tz='CET (UTC+1)'; cc='+423'; dr='Right'
  hdi='0.935'; hb='94%'; si='76.0'; sb='76%'; ia='98%'; ib='98%'; le='83.0'; lb='72%'
  m=@(('Grauspitz','2,599 m'),('Schwarzhorn','2,574 m'),('Naafkopf','2,570 m'))
  rl=@(('Christianity','80%','#214e68'),('No religion','13%','#8ab7c4'),('Other','6%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Vaduz Castle','The royal residence perched above the capital, open during national day.'),('Alpine Hiking','The three-day Liechtenstein Trail crosses the entire country.'),('Kunstmuseum','A modern art museum with a strong collection of 19th and 20th century works.'),('Low Tax Haven','One of very few doubly landlocked countries with one of the world''s highest GDPs.'),('Rhine Valley','Vineyards and medieval villages in the valley between Alps and Jura.'))
  ci=@(('Schaan','6.2k',100),('Vaduz','5.4k',87),('Balzers','4.8k',77))
  j='-2'; u='21'; rn='900 mm'; ct='Continental / Alpine'
  nd='15 August'; el='230V, Type J'
  iso='li'; intro='One of the world''s smallest and wealthiest countries, nestled in the Alps between Switzerland and Austria.'
}

'lithuania' = @{
  r='Northern Europe / Baltic'; g='Parliamentary republic'; y='1990'; a='65,300 km2'; dn='44/km2'
  tz='EET (UTC+2)'; cc='+370'; dr='Right'
  hdi='0.882'; hb='88%'; si='60.0'; sb='60%'; ia='89%'; ib='89%'; le='76.8'; lb='61%'
  m=@(('Aukstoja hill','294 m'),('Juozapine','293 m'),('Kruopine','292 m'))
  rl=@(('Christianity','78%','#214e68'),('No religion','18%','#8ab7c4'),('Other','3%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Vilnius Baroque','The largest surviving medieval old town in northern Europe, UNESCO listed.'),('Hill of Crosses','A pilgrimage hill near Siauliai covered in over 100,000 crosses.'),('Curonian Spit','A 98 km sand dune peninsula shared with Russia, UNESCO listed.'),('Trakai Island Castle','A red-brick Gothic castle on an island in a lake, now a museum.'),('Baltic Amber','Lithuania''s coast washes up amber — the gold of the Baltic — after storms.'))
  ci=@(('Vilnius','587k',100),('Kaunas','295k',50),('Klaipeda','149k',25))
  j='-4'; u='18'; rn='700 mm'; ct='Humid continental'
  nd='16 February'; el='230V, Type C/F'
  iso='lt'; intro='A Baltic nation of baroque splendour, amber coasts, a famous hill of crosses and a singing revolution past.'
}

'luxembourg' = @{
  r='Western Europe'; g='Constitutional parliamentary monarchy'; y='1867'; a='2,586 km2'; dn='253/km2'
  tz='CET (UTC+1)'; cc='+352'; dr='Right'
  hdi='0.930'; hb='93%'; si='70.2'; sb='70%'; ia='99%'; ib='99%'; le='82.5'; lb='71%'
  m=@(('Kneiff','560 m'),('Barbelir','559 m'),('Brimaiert','536 m'))
  rl=@(('Christianity','68%','#214e68'),('No religion','23%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','7%','#e2e4df'))
  wv=@(('Luxembourg City Fortress','The UNESCO old quarters and fortifications on dramatic sandstone cliffs.'),('Mullerthal Trail','Sandstone rock formations and forest paths in the "Little Switzerland" of Luxembourg.'),('Moselle Wine Valley','Luxembourg''s wine country along the Moselle river, bordering Germany.'),('EU Institutions','Home to the EU Court of Justice and Court of Auditors — a diplomatic hub.'),('Vianden Castle','A restored medieval castle above the Our river near the German border.'))
  ci=@(('Luxembourg City','130k',100),('Esch-sur-Alzette','38k',29),('Differdange','27k',21))
  j='2'; u='18'; rn='850 mm'; ct='Oceanic / Temperate'
  nd='23 June'; el='230V, Type C/F'
  iso='lu'; intro='A tiny Grand Duchy punching above its weight as a financial hub, EU seat and home to dramatic cliff fortresses.'
}

'malta' = @{
  r='Southern Europe / Mediterranean'; g='Parliamentary republic'; y='1964'; a='316 km2'; dn='1,640/km2'
  tz='CET (UTC+1)'; cc='+356'; dr='Left'
  hdi='0.918'; hb='92%'; si='72.0'; sb='72%'; ia='90%'; ib='90%'; le='82.8'; lb='71%'
  m=@(('Ta Dmejrek','253 m'),('Dingli Cliffs','245 m'),('Ta Zuta','232 m'))
  rl=@(('Christianity','90%','#214e68'),('No religion','6%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Valletta UNESCO','One of the smallest capitals in the world, packed with Baroque palaces.'),('Prehistoric Temples','The Hagar Qim and Mnajdra temples predate Stonehenge by 1,000 years.'),('Crystal Clear Water','Mediterranean visibility of up to 30 m makes Malta a top diving destination.'),('Filming Location','The Game of Thrones'' King''s Landing and many Hollywood films were shot here.'),('English Language Hub','One of the EU''s two English-speaking countries and a leading language-school destination.'))
  ci=@(('Birkirkara','25k',100),("St. Paul's Bay",'24k',96),('Mosta','22k',88))
  j='13'; u='28'; rn='560 mm'; ct='Mediterranean (hot, dry summers)'
  nd='31 March'; el='230V, Type G'
  iso='mt'; intro='A sun-drenched archipelago of prehistoric temples, Baroque cities and some of the Mediterranean''s clearest waters.'
}

'moldova' = @{
  r='Eastern Europe'; g='Parliamentary republic'; y='1991'; a='33,851 km2'; dn='98/km2'
  tz='EET (UTC+2)'; cc='+373'; dr='Right'
  hdi='0.767'; hb='77%'; si='58.0'; sb='58%'; ia='76%'; ib='76%'; le='70.9'; lb='52%'
  m=@(('Balanesti Hill','430 m'),('Dealul lui Voda','428 m'),('Ciunget','422 m'))
  rl=@(('Christianity','93%','#214e68'),('No religion','6%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','<1%','#e2e4df'))
  wv=@(('Milestii Mici','The world''s largest wine cellar by volume, with 200 km of underground tunnels.'),('Orheiul Vechi','A cave monastery in a limestone canyon inhabited since ancient Dacian times.'),('Wine Culture','Moldova has one of the highest vineyard-to-land ratios in the world.'),('Rural Villages','Traditional rural life, folk crafts and authentic Moldovan cuisine in quiet villages.'),('Budget Travel','Among Europe''s most affordable destinations with genuine cultural experiences.'))
  ci=@(('Chisinau','492k',100),('Tiraspol','130k',26),('Balti','97k',20))
  j='-3'; u='21'; rn='550 mm'; ct='Humid continental (warm summers)'
  nd='27 August'; el='230V, Type C/F'
  iso='md'; intro='Eastern Europe''s wine-making heart, with underground cellars, cave monasteries and warm rural hospitality.'
}

'monaco' = @{
  r='Western Europe / French Riviera'; g='Constitutional hereditary principality'; y='1297'; a='2 km2'; dn='19,000/km2'
  tz='CET (UTC+1)'; cc='+377'; dr='Right'
  hdi='0.956'; hb='96%'; si='78.0'; sb='78%'; ia='98%'; ib='98%'; le='86.8'; lb='78%'
  m=@(('Mont Agel (shared)','1,148 m'),('Tete de Chien','550 m'),('La Turbie plateau','480 m'))
  rl=@(('Christianity','86%','#214e68'),('No religion','7%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','4%','#e2e4df'))
  wv=@(('Formula 1 Grand Prix','The most glamorous race on the calendar runs through Monte-Carlo''s streets.'),('Monte-Carlo Casino','The legendary Belle Époque casino has defined glamour since 1863.'),('Prince''s Palace','The Grimaldi dynasty has ruled from this fortress since 1297.'),('Luxury Yachting','The harbour is packed with superyachts during summer and the Grand Prix.'),('French Riviera Access','Just minutes from Nice airport, the Riviera''s beaches and hill villages.'))
  ci=@(('Monte-Carlo','15k',100),('La Condamine','4k',27),('Monaco-Ville','3.4k',23))
  j='12'; u='26'; rn='750 mm'; ct='Mediterranean (warm, sunny)'
  nd='19 November'; el='230V, Type C/E/F'
  iso='mc'; intro='The world''s second smallest country, a glamorous principality on the French Riviera of casinos, yachts and Formula 1.'
}

'montenegro' = @{
  r='Southeast Europe / Balkans'; g='Parliamentary republic'; y='2006'; a='13,812 km2'; dn='45/km2'
  tz='CET (UTC+1)'; cc='+382'; dr='Right'
  hdi='0.832'; hb='83%'; si='55.0'; sb='55%'; ia='80%'; ib='80%'; le='77.0'; lb='62%'
  m=@(('Zla Kolata','2,534 m'),('Kolac','2,527 m'),('Bobotov Kuk','2,523 m'))
  rl=@(('Christianity','76%','#214e68'),('Islam','19%','#8ab7c4'),('No religion','4%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Bay of Kotor','A drowned canyon mistaken for a fjord, with medieval walled towns inside.'),('Durmitor Park','A UNESCO national park with a glacial Black Lake and skiing in winter.'),('Tara River Canyon','The second deepest canyon in the world, a rafting and hiking destination.'),('Adriatic Beaches','Budva and Ulcinj offer long sandy beaches and a lively summer season.'),('Old Town Kotor','A UNESCO-listed walled city with Venetian architecture and cat colonies.'))
  ci=@(('Podgorica','175k',100),('Niksic','58k',33),('Bijelo Polje','17k',10))
  j='3'; u='25'; rn='1,400 mm'; ct='Mediterranean coast / Continental inland'
  nd='13 July'; el='230V, Type C/F'
  iso='me'; intro='A tiny Adriatic nation of fjord-like bays, medieval walled towns and wild Dinaric mountain landscapes.'
}

'netherlands' = @{
  r='Western Europe'; g='Constitutional parliamentary monarchy'; y='1581'; a='41,543 km2'; dn='423/km2'
  tz='CET (UTC+1)'; cc='+31'; dr='Right'
  hdi='0.946'; hb='95%'; si='68.1'; sb='68%'; ia='97%'; ib='97%'; le='82.3'; lb='70%'
  m=@(('Vaalserberg','322 m'),('Kunderberg','257 m'),('Sint-Pietersberg','170 m'))
  rl=@(('No religion','48%','#214e68'),('Christianity','44%','#8ab7c4'),('Islam','5%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Amsterdam','Canal ring UNESCO, Anne Frank House, Van Gogh Museum and Rijksmuseum.'),('Cycling Nation','Flat terrain and 35,000 km of bike paths make it the world''s cycling capital.'),('Tulip Fields','Keukenhof gardens bloom each April with 7 million flowers across 32 hectares.'),('Windmills and Polders','Kinderdijk''s 19 windmills are a UNESCO symbol of Dutch water management.'),('Delft and Haarlem','Compact cities of Blue Delft pottery, old masters paintings and canal culture.'))
  ci=@(('Amsterdam','873k',100),('Rotterdam','651k',75),('The Hague','546k',63))
  j='3'; u='17'; rn='830 mm'; ct='Oceanic / Temperate'
  nd='27 April'; el='230V, Type C/F'
  iso='nl'; intro='A low-lying kingdom of canals, windmills, tulip fields, cycling culture and world-class museums.'
}

'north-macedonia' = @{
  r='Southeast Europe / Balkans'; g='Parliamentary republic'; y='1991'; a='25,713 km2'; dn='81/km2'
  tz='CET (UTC+1)'; cc='+389'; dr='Right'
  hdi='0.770'; hb='77%'; si='53.0'; sb='53%'; ia='82%'; ib='82%'; le='76.2'; lb='60%'
  m=@(('Golem Korab','2,764 m'),('Titov Vrv','2,748 m'),('Turčin (Sar Planina)','2,702 m'))
  rl=@(('Christianity','53%','#214e68'),('Islam','33%','#8ab7c4'),('No religion','10%','#bac4c8'),('Other','4%','#e2e4df'))
  wv=@(('Lake Ohrid','UNESCO lake and town, one of Europe''s oldest and deepest lakes.'),('Ohrid Old Town','Byzantine churches and medieval architecture on the shores of the lake.'),('Mavrovo National Park','Wolves, lynx and bears in a wild mountain landscape with a ski resort.'),('Skopje Bazaar','The Old Bazaar is one of the largest preserved Ottoman bazaars in the Balkans.'),('Budget Destination','Among Europe''s most affordable countries with authentic Balkan culture.'))
  ci=@(('Skopje','590k',100),('Kumanovo','105k',18),('Bitola','95k',16))
  j='0'; u='24'; rn='480 mm'; ct='Continental / Mediterranean influence'
  nd='8 September'; el='230V, Type C/F'
  iso='mk'; intro='A small Balkan state of ancient lakes, Ottoman bazaars and a dramatic mountain landscape.'
}

'poland' = @{
  r='Central Europe'; g='Parliamentary republic'; y='1918'; a='312,696 km2'; dn='124/km2'
  tz='CET (UTC+1)'; cc='+48'; dr='Right'
  hdi='0.876'; hb='88%'; si='61.7'; sb='62%'; ia='87%'; ib='87%'; le='78.5'; lb='64%'
  m=@(('Rysy','2,499 m'),('Swinnica','2,301 m'),('Koscielec','2,155 m'))
  rl=@(('Christianity','88%','#214e68'),('No religion','9%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Krakow Old Town','Royal castle, cathedral and Jewish Kazimierz district in a UNESCO old town.'),('Warsaw Rebuilt','A capital that was 90% destroyed in WWII, meticulously reconstructed to UNESCO standard.'),('Tatra Mountains','The highest range in the Carpathians, with Zakopane as Poland''s mountain capital.'),('Auschwitz Memorial','The largest Nazi concentration camp, preserved as a UNESCO memorial and museum.'),('Pierogi and Vodka','Polish dumplings, bigos hunter''s stew and locally distilled spirits define the cuisine.'))
  ci=@(('Warsaw','1.8M',100),('Krakow','780k',43),('Gdansk','487k',27))
  j='-1'; u='20'; rn='600 mm'; ct='Humid continental'
  nd='11 November'; el='230V, Type C/E'
  iso='pl'; intro='Central Europe''s largest country — a nation of medieval royal cities, Tatra mountains, WWII memorials and vibrant culture.'
}

'portugal' = @{
  r='Southern Europe / Iberian Peninsula'; g='Parliamentary republic'; y='1143'; a='92,212 km2'; dn='112/km2'
  tz='WET (UTC+0)'; cc='+351'; dr='Right'
  hdi='0.866'; hb='87%'; si='70.3'; sb='70%'; ia='82%'; ib='82%'; le='82.1'; lb='70%'
  m=@(('Torre','1,993 m'),('Cantaro Magro','1,927 m'),('Cantaro Gordo','1,921 m'))
  rl=@(('Christianity','79%','#214e68'),('No religion','17%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Lisbon','Historic trams, miradouros viewpoints and a vibrant food and fado scene.'),('Algarve Coast','Golden limestone cliffs, sea caves and long sandy beaches in the south.'),('Sintra Palaces','Romantic palaces and castles in a UNESCO cultural landscape above Lisbon.'),('Douro Valley','Terraced vineyard slopes along the Douro river, producing world-famous port wine.'),('Porto Old Town','UNESCO riverside district of colourful azulejo tiles, port wine cellars and bridges.'))
  ci=@(('Lisbon','505k',100),('Porto','238k',47),('Amadora','178k',35))
  j='12'; u='26'; rn='700 mm'; ct='Mediterranean (Atlantic influence)'
  nd='10 June'; el='230V, Type C/F'
  iso='pt'; intro='Europe''s westernmost country, a seafaring nation of Baroque cities, golden beaches and vintage port wine.'
}

'romania' = @{
  r='Eastern Europe'; g='Parliamentary republic'; y='1877'; a='238,397 km2'; dn='85/km2'
  tz='EET (UTC+2)'; cc='+40'; dr='Right'
  hdi='0.821'; hb='82%'; si='59.8'; sb='60%'; ia='84%'; ib='84%'; le='76.0'; lb='60%'
  m=@(('Moldoveanu','2,544 m'),('Negoiu','2,535 m'),('Vistea Mare','2,527 m'))
  rl=@(('Christianity','93%','#214e68'),('No religion','5%','#8ab7c4'),('Islam','1%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Transylvania','Bran Castle, the Dracula legend, and medieval Saxon towns like Sibiu and Brasov.'),('Painted Monasteries','Exterior frescoes on Bucovina''s monasteries are among Europe''s most remarkable art.'),('Danube Delta','A UNESCO biosphere reserve with 300 bird species and reed-maze waterways.'),('Peles Castle','A Neo-Renaissance royal palace in a forested valley — Romania''s most-visited monument.'),('Vibrant Bucharest','The "Little Paris" with a grand boulevard, Ceausescu''s Palace and lively nightlife.'))
  ci=@(('Bucharest','1.8M',100),('Cluj-Napoca','322k',18),('Timisoara','250k',14))
  j='-1'; u='23'; rn='600 mm'; ct='Humid continental / Steppe east'
  nd='1 December'; el='230V, Type C/F'
  iso='ro'; intro='A Carpathian country of Dracula legends, painted monasteries, Danube delta and vibrant emerging cities.'
}

'russia' = @{
  r='Eastern Europe / Northern Asia'; g='Federal presidential republic'; y='1991'; a='17,098,242 km2'; dn='9/km2'
  tz='MSK (UTC+3) to UTC+12'; cc='+7'; dr='Right'
  hdi='0.822'; hb='82%'; si='43.0'; sb='43%'; ia='88%'; ib='88%'; le='73.4'; lb='56%'
  m=@(('Elbrus','5,642 m'),('Dykh-Tau','5,205 m'),('Koshtan-Tau','5,152 m'))
  rl=@(('Christianity','73%','#214e68'),('No religion','18%','#8ab7c4'),('Islam','7%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Red Square Moscow','St. Basil''s Cathedral, the Kremlin and Lenin''s Mausoleum in one iconic view.'),('Hermitage St. Petersburg','One of the world''s largest art museums in a Baroque imperial palace.'),('Trans-Siberian Railway','The world''s longest railway crossing 9,289 km and 8 time zones.'),('Lake Baikal','The world''s deepest and oldest lake holds 20% of Earth''s unfrozen fresh water.'),('11 Time Zones','A country so vast that sunrise in the east happens while the west still sleeps.'))
  ci=@(('Moscow','12.5M',100),('St. Petersburg','5.4M',43),('Novosibirsk','1.6M',13))
  j='-8'; u='19'; rn='600 mm'; ct='Subarctic / Continental (vast variation)'
  nd='12 June'; el='230V, Type C/F'
  iso='ru'; intro='The world''s largest country, stretching across 11 time zones from the Baltic to the Pacific with unmatched natural scale.'
}

'san-marino' = @{
  r='Southern Europe (enclave in Italy)'; g='Parliamentary republic (dual Captains Regent)'; y='301 AD'; a='61 km2'; dn='600/km2'
  tz='CET (UTC+1)'; cc='+378'; dr='Right'
  hdi='0.960'; hb='96%'; si='78.0'; sb='78%'; ia='97%'; ib='97%'; le='85.4'; lb='76%'
  m=@(('Monte Titano','739 m'),('La Fratta','739 m'),('Monte Carpegna (shared)','1,415 m'))
  rl=@(('Christianity','91%','#214e68'),('No religion','6%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Three Towers','The UNESCO medieval towers of Guaita, Cesta and Montale crown Monte Titano.'),('World''s Oldest Republic','Founded in 301 AD, San Marino claims the world''s oldest constitutional government.'),('Panoramic Views','The old city overlooks the Adriatic coast, Apennines and even distant peaks on clear days.'),('Duty-Free Shopping','Lower taxes attract visitors for electronics, liquor and luxury goods.'),('Palazzo Pubblico','The Gothic seat of government and state museum overlooking the main piazza.'))
  ci=@(('Serravalle','11k',100),('Borgo Maggiore','7.3k',66),('City of San Marino','4.1k',37))
  j='3'; u='24'; rn='770 mm'; ct='Mediterranean / Continental'
  nd='3 September'; el='230V, Type C/F/L'
  iso='sm'; intro='The world''s oldest republic, a mountaintop microstate inside Italy with three medieval towers and remarkable history.'
}

'serbia' = @{
  r='Southeast Europe / Balkans'; g='Parliamentary republic'; y='2006'; a='77,474 km2'; dn='95/km2'
  tz='CET (UTC+1)'; cc='+381'; dr='Right'
  hdi='0.805'; hb='81%'; si='56.0'; sb='56%'; ia='81%'; ib='81%'; le='76.8'; lb='61%'
  m=@(('Midzur','2,169 m'),('Crni Vrh','2,156 m'),('Djeravica (border)','2,656 m'))
  rl=@(('Christianity','93%','#214e68'),('No religion','3%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Belgrade Nightlife','Floating clubs on the Sava and Danube keep the city alive until dawn.'),('Novi Sad EXIT Festival','One of Europe''s best summer music festivals held in a 18th-century fortress.'),('Djavolja Varoš','Devil''s Town — natural stone columns caused by volcanic erosion.'),('Tara National Park','Dense forests, the Drina river canyon and European brown bears.'),('Rakija Culture','Serbia''s national spirit — fruit brandy — is as central to culture as wine in France.'))
  ci=@(('Belgrade','1.7M',100),('Novi Sad','290k',17),('Nis','260k',15))
  j='-1'; u='23'; rn='700 mm'; ct='Humid continental'
  nd='15 February'; el='230V, Type C/F'
  iso='rs'; intro='A Balkan hub of vibrant nightlife, ancient fortresses, dramatic gorges and some of Europe''s most exuberant festivals.'
}

'slovakia' = @{
  r='Central Europe'; g='Parliamentary republic'; y='1993'; a='49,035 km2'; dn='114/km2'
  tz='CET (UTC+1)'; cc='+421'; dr='Right'
  hdi='0.855'; hb='86%'; si='65.0'; sb='65%'; ia='87%'; ib='87%'; le='77.5'; lb='63%'
  m=@(('Gerlachovsky stit','2,655 m'),('Lomnicky stit','2,634 m'),('Ladovy stit','2,628 m'))
  rl=@(('Christianity','69%','#214e68'),('No religion','24%','#8ab7c4'),('Other','6%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('High Tatras','The highest range in the Carpathians with Alpine peaks above 2,600 m.'),('Spis Castle','One of the largest castle complexes in Central Europe, UNESCO listed.'),('Bratislava Old Town','A compact and walkable Baroque capital perched above the Danube.'),('Slovak Folk Villages','Open-air museums and living villages preserve centuries-old craft traditions.'),('Cave Systems','Slovakia has 7 UNESCO caves including the Domica and Baradla system.'))
  ci=@(('Bratislava','475k',100),('Kosice','237k',50),('Presov','91k',19))
  j='-2'; u='20'; rn='650 mm'; ct='Humid continental'
  nd='1 September'; el='230V, Type C/E'
  iso='sk'; intro='A Central European country of High Tatra peaks, medieval castles, Baroque Bratislava and deep folk traditions.'
}

'slovenia' = @{
  r='Central Europe'; g='Parliamentary republic'; y='1991'; a='20,271 km2'; dn='102/km2'
  tz='CET (UTC+1)'; cc='+386'; dr='Right'
  hdi='0.918'; hb='92%'; si='74.8'; sb='75%'; ia='91%'; ib='91%'; le='81.7'; lb='70%'
  m=@(('Triglav','2,864 m'),('Skrlatica','2,740 m'),('Mangart','2,679 m'))
  rl=@(('Christianity','68%','#214e68'),('No religion','26%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Lake Bled','An emerald lake with a church-topped island and a clifftop castle — a postcard image.'),('Triglav National Park','Slovenia''s only national park covers almost 4% of the country.'),('Postojna Cave','A 24 km cave system with a narrow-gauge train, one of Europe''s largest.'),('Ljubljana','A compact, walkable capital with a dragon bridge, castle hill and café-lined river.'),('Soca Valley','Brilliant turquoise river with world-class rafting and WWII Isonzo Front history.'))
  ci=@(('Ljubljana','284k',100),('Maribor','112k',39),('Kranj','40k',14))
  j='-1'; u='21'; rn='1,400 mm'; ct='Continental / Alpine / Mediterranean'
  nd='25 June'; el='230V, Type C/F'
  iso='si'; intro='A small Alpine country at the crossroads of four European cultures — Slavic, Germanic, Italic and Hungarian.'
}

'spain' = @{
  r='Southern Europe / Iberian Peninsula'; g='Constitutional parliamentary monarchy'; y='1479'; a='505,990 km2'; dn='95/km2'
  tz='CET (UTC+1)'; cc='+34'; dr='Right'
  hdi='0.905'; hb='91%'; si='65.8'; sb='66%'; ia='93%'; ib='93%'; le='83.4'; lb='72%'
  m=@(('Teide (Canary Islands)','3,718 m'),('Mulhacen (mainland)','3,479 m'),('Aneto','3,404 m'))
  rl=@(('Christianity','62%','#214e68'),('No religion','33%','#8ab7c4'),('Islam','3%','#bac4c8'),('Other','2%','#e2e4df'))
  wv=@(('Barcelona Gaudi','Sagrada Familia, Park Guell and Casa Batllo define Gaudi''s visionary Barcelona.'),('Madrid Prado','One of the world''s great art museums, with Velazquez, Goya and El Greco.'),('Alhambra Granada','A Moorish palace complex of intricate tilework and water gardens.'),('Camino de Santiago','An ancient pilgrimage trail across northern Spain walked by 300,000 people per year.'),('Tapas Culture','The tradition of sharing small dishes with wine or beer is a way of life.'))
  ci=@(('Madrid','3.3M',100),('Barcelona','1.7M',52),('Valencia','814k',25))
  j='9'; u='25'; rn='450 mm'; ct='Mediterranean / Continental / Atlantic'
  nd='12 October'; el='230V, Type C/F'
  iso='es'; intro='A sun-drenched Iberian nation of Moorish palaces, Gaudí architecture, world-class cuisine and festive culture.'
}

'sweden' = @{
  r='Northern Europe / Scandinavia'; g='Constitutional parliamentary monarchy'; y='Ancient (c. 12th century)'; a='450,295 km2'; dn='25/km2'
  tz='CET (UTC+1)'; cc='+46'; dr='Right'
  hdi='0.952'; hb='95%'; si='66.0'; sb='66%'; ia='97%'; ib='97%'; le='83.2'; lb='72%'
  m=@(('Kebnekaise','2,096 m'),('Sarektiakka','2,089 m'),('Kaskasatjakka','2,076 m'))
  rl=@(('Christianity','59%','#214e68'),('No religion','36%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Stockholm Archipelago','Thousands of islands and inlets surrounding a capital built on water.'),('Northern Lights','Swedish Lapland offers aurora borealis from September through March.'),('Midsommar','Sweden''s midsummer solstice festival of dancing, flowers and singing.'),('Design Culture','IKEA, Volvo, H&M and ABBA reflect a tradition of accessible Scandinavian design.'),('Wilderness','Vast forests, elk, reindeer and hundreds of kilometres of hiking trails.'))
  ci=@(('Stockholm','975k',100),('Gothenburg','590k',61),('Malmo','350k',36))
  j='-3'; u='17'; rn='600 mm'; ct='Subarctic north / Humid continental south'
  nd='6 June'; el='230V, Type C/F'
  iso='se'; intro='A Nordic kingdom of forests, islands, northern lights and a design culture that has shaped the modern world.'
}

'switzerland' = @{
  r='Central Europe (Alpine)'; g='Federal parliamentary republic (direct democracy)'; y='1291'; a='41,285 km2'; dn='218/km2'
  tz='CET (UTC+1)'; cc='+41'; dr='Right'
  hdi='0.962'; hb='96%'; si='76.4'; sb='76%'; ia='97%'; ib='97%'; le='84.0'; lb='73%'
  m=@(('Dufourspitze / Monte Rosa','4,634 m'),('Dom','4,545 m'),('Liskamm','4,527 m'))
  rl=@(('Christianity','64%','#214e68'),('No religion','28%','#8ab7c4'),('Islam','5%','#bac4c8'),('Other','3%','#e2e4df'))
  wv=@(('Matterhorn','The pyramid-shaped peak above Zermatt is one of the world''s most photographed mountains.'),('Geneva Diplomacy','Home to the Red Cross, WHO, and more international organisations than any other city.'),('Lucerne','A medieval walled city with a chapel bridge above a lake of impossibly blue water.'),('Swiss Chocolate','Lindt, Toblerone and hundreds of local chocolatiers define a world-leading confectionery.'),('Direct Democracy','Citizens vote on federal laws in referendums four times per year.'))
  ci=@(('Zurich','415k',100),('Geneva','203k',49),('Basel','177k',43))
  j='-1'; u='18'; rn='1,100 mm'; ct='Alpine / Continental'
  nd='1 August'; el='230V, Type J'
  iso='ch'; intro='A landlocked alpine nation of four languages, direct democracy, towering peaks and world-leading precision industry.'
}

'turkey' = @{
  r='Southeast Europe / Western Asia'; g='Presidential republic'; y='1923'; a='783,562 km2'; dn='107/km2'
  tz='TRT (UTC+3)'; cc='+90'; dr='Right'
  hdi='0.855'; hb='86%'; si='47.3'; sb='47%'; ia='83%'; ib='83%'; le='77.7'; lb='63%'
  m=@(('Mount Ararat','5,137 m'),('Suphan Dagi','4,058 m'),('Erciyes','3,916 m'))
  rl=@(('Islam','97%','#214e68'),('No religion','2%','#8ab7c4'),('Christianity','1%','#bac4c8'),('Other','<1%','#e2e4df'))
  wv=@(('Istanbul','Hagia Sophia, Grand Bazaar and the Bosphorus bridge two continents.'),('Cappadocia','Fairy-chimney rock formations, underground cities and hot-air balloon flights at sunrise.'),('Pamukkale','Cotton-white travertine terraces and ancient Roman spa city Hierapolis.'),('Ephesus','One of the best-preserved Roman cities in the world, with a Library of Celsus.'),('Aegean Coast','Bodrum, Oludeniz and the Turquoise Coast offer beaches and Hellenistic ruins.'))
  ci=@(('Istanbul','15.4M',100),('Ankara','5.6M',36),('Izmir','4.4M',29))
  j='4'; u='26'; rn='700 mm'; ct='Mediterranean / Continental / Semi-arid east'
  nd='29 October'; el='230V, Type C/F'
  iso='tr'; intro='A transcontinental nation bridging Europe and Asia, with Ottoman heritage, ancient ruins and dramatic landscapes.'
}

'ukraine' = @{
  r='Eastern Europe'; g='Presidential republic'; y='1991'; a='603,550 km2'; dn='69/km2'
  tz='EET (UTC+2)'; cc='+380'; dr='Right'
  hdi='0.773'; hb='77%'; si='34.0'; sb='34%'; ia='79%'; ib='79%'; le='72.6'; lb='54%'
  m=@(('Hoverla','2,061 m'),('Brebeneskul','2,036 m'),('Pip Ivan','2,028 m'))
  rl=@(('Christianity','93%','#214e68'),('No religion','6%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','<1%','#e2e4df'))
  wv=@(('Kyiv Golden Domes','St. Sophia and the Kyiv-Pechersk Lavra monastery are UNESCO treasures.'),('Lviv Old Town','A Baroque city of coffee culture, bookshops and Central European architecture.'),('Carpathian Mountains','Skiing, hiking and traditional Hutsul folk culture in western Ukraine.'),('Black Sea Coast','Odessa''s grand boulevards and sandy beaches on the north Black Sea shore.'),('Cultural Heritage','Unique embroidery, pysanky Easter eggs and hopak dance represent deep folk traditions.'))
  ci=@(('Kyiv','2.8M',100),('Kharkiv','1.5M',54),('Odessa','1.0M',36))
  j='-3'; u='20'; rn='600 mm'; ct='Humid continental / Steppe south'
  nd='24 August'; el='230V, Type C/F'
  iso='ua'; intro='Eastern Europe''s largest country, a nation of golden-domed churches, Carpathian mountains and resilient cultural identity.'
}

'united-kingdom' = @{
  r='Northern Europe / British Isles'; g='Constitutional parliamentary monarchy'; y='Ancient (Acts of Union 1707)'; a='242,495 km2'; dn='279/km2'
  tz='GMT (UTC+0)'; cc='+44'; dr='Left'
  hdi='0.940'; hb='94%'; si='60.7'; sb='61%'; ia='97%'; ib='97%'; le='81.3'; lb='69%'
  m=@(('Ben Nevis','1,345 m'),('Snowdon / Yr Wyddfa','1,085 m'),('Scafell Pike','978 m'))
  rl=@(('Christianity','59%','#214e68'),('No religion','36%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('London','World-class museums, royal palaces and a global cultural hub in one city.'),('Scottish Highlands','Dramatic glens, lochs, whisky distilleries and castles in wild scenery.'),('Shakespeare Country','Stratford-upon-Avon, the Globe Theatre and 400 years of living dramatic tradition.'),('Lake District','Romantic fells and lakes that inspired Wordsworth and Beatrix Potter.'),('Afternoon Tea','A tradition of sandwiches, scones and tiered cakes that defines British culture.'))
  ci=@(('London','9.0M',100),('Birmingham','1.1M',12),('Manchester','553k',6))
  j='5'; u='17'; rn='900 mm'; ct='Oceanic / Temperate (mild, cloudy)'
  nd='No official national day'; el='230V, Type G'
  iso='gb'; intro='An island nation of royal history, world-class museums, dramatic Scottish highlands and global cultural influence.'
}

'vatican-city' = @{
  r='Southern Europe (Holy See)'; g='Absolute ecclesiastical monarchy'; y='1929'; a='0.44 km2'; dn='2,272/km2'
  tz='CET (UTC+1)'; cc='+379'; dr='Right'
  hdi='N/A'; hb='96%'; si='82.0'; sb='82%'; ia='N/A'; ib='97%'; le='81.0'; lb='68%'
  m=@(('Vatican Hill','75 m'),('Janiculum Hill','88 m'),('Monte Mario','139 m'))
  rl=@(('Christianity','100%','#214e68'),('No religion','0%','#8ab7c4'),('Islam','0%','#bac4c8'),('Other','0%','#e2e4df'))
  wv=@(('St. Peter''s Basilica','The world''s largest church, designed by Michelangelo and Bernini.'),('Sistine Chapel','Michelangelo''s ceiling fresco remains the most visited artwork on Earth.'),('Vatican Museums','One of the world''s richest museum collections, housed in papal palaces.'),('Papal Audience','Wednesday audiences allow visitors to see and hear the Pope in person.'),('Swiss Guard','The world''s oldest standing army, protecting the Holy See since 1506.'))
  ci=@(('Vatican City','800',100),('St. Peter''s Square','(25k capacity)',50),('Apostolic Palace','(papal residence)',25))
  j='8'; u='26'; rn='800 mm'; ct='Mediterranean'
  nd='22 February'; el='230V, Type C/F/L'
  iso='va'; intro='The world''s smallest state and spiritual centre of the Catholic Church, home to St. Peter''s and the Sistine Chapel.'
}

} # end $CD

# ─────────────────────────────────────────────
# Builder
# ─────────────────────────────────────────────

function Build-EuropePage($filePath) {
    $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    $rel   = $filePath.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    # Expect europe\SLUG\index.html
    if ($parts.Length -ne 3 -or $parts[0] -ne 'europe' -or $parts[2] -ne 'index.html') { return $null }
    $slug = $parts[1]
    if ($slug -eq 'norway') { return $null }   # keep handcrafted prototype

    $d = $CD[$slug]
    if (-not $d) {
        Write-Host "  SKIP (no data): $slug"
        return $null
    }

    # ── Extract from existing page ──
    $heroImgM = [regex]::Match($html, "url\('(https?://[^']+)'\)")
    $heroImg  = $heroImgM.Groups[1].Value
    $heroStyle = if ($heroImg) {
        "background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$heroImg')"
    } else {
        "background:linear-gradient(135deg,#0d2137,#1a5c8a)"
    }

    $kicker = [regex]::Match($html, 'class="kicker">([^<]+)<').Groups[1].Value.Trim()
    if (-not $kicker) { $kicker = "Country in Europe" }

    $introM = [regex]::Match($html, 'class="hero-text">([^<]+)<')
    $intro  = if ($introM.Success) { $introM.Groups[1].Value.Trim() } else { $d.intro }

    # Capital: from hero-stat link
    $capM    = [regex]::Match($html, 'Capital.*?href="([^"]+)">([^<]+)</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $capLink = $capM.Groups[1].Value.Trim()
    $capName = $capM.Groups[2].Value.Trim()

    $langM = [regex]::Match($html, 'Language</span><strong>([^<]+)</strong>')
    $lang  = if ($langM.Success) { $langM.Groups[1].Value.Trim() } else { '' }

    $currM = [regex]::Match($html, 'Currency</span><strong>([^<]+)</strong>')
    $curr  = if ($currM.Success) { $currM.Groups[1].Value.Trim() } else { '' }

    $popM = [regex]::Match($html, 'Population</span><strong>([^<]+)</strong>')
    $pop  = if ($popM.Success) { $popM.Groups[1].Value.Trim() } else { '' }

    # Capital hero-stat (with link if available)
    $capStat = if ($capLink) {
        "          <div class=`"hero-stat`"><span>Capital</span><strong><a class=`"value-link`" href=`"$capLink`">$capName</a></strong></div>`n"
    } elseif ($capName) {
        "          <div class=`"hero-stat`"><span>Capital</span><strong>$capName</strong></div>`n"
    } else { '' }

    # City mini-grid (preserve existing links)
    $cityMs = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>')
    $cityGrid = ''
    foreach ($m in $cityMs) {
        $cityGrid += "          <a class=`"mini-tile`" href=`"$($m.Groups[1].Value)`"><strong>$($m.Groups[2].Value)</strong></a>`n"
    }
    $citySection = if ($cityGrid) {
        "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Cities</h2>`n        <div class=`"mini-grid`">`n$cityGrid        </div>`n      </article>`n"
    } else { '' }

    # Events
    $evtMs   = [regex]::Matches($html, 'class="event-card" href="([^"]+)".*?class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $evtCards = ''
    foreach ($m in $evtMs) {
        $evtCards += "          <a class=`"event-card`" href=`"$($m.Groups[1].Value)`"><div class=`"event-body`"><span class=`"event-date`">$($m.Groups[2].Value.Trim())</span><strong>$($m.Groups[3].Value.Trim())</strong></div></a>`n"
    }
    $evtSection = if ($evtCards) {
        "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Upcoming Events</h2>`n        <div class=`"event-strip`">`n$evtCards        </div>`n      </article>`n"
    } else { '' }

    # ── Build sections from data ──
    $title = [regex]::Match($html, '<title>([^<]+)</title>').Groups[1].Value.Trim()

    # Key Facts
    $kf  = "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Key Facts</h2>`n        <div class=`"fact-table`">`n"
    $kf += "          <div class=`"fact-row`"><span>Region</span><strong>$($d.r)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Government</span><strong>$($d.g)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Independence</span><strong>$($d.y)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Area</span><strong>$($d.a)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Population density</span><strong>$($d.dn)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Time zone</span><strong>$($d.tz)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Calling code</span><strong>$($d.cc)</strong></div>`n"
    $kf += "          <div class=`"fact-row`"><span>Drives on</span><strong>$($d.dr)</strong></div>`n"
    $kf += "        </div>`n      </article>`n"

    # Quick View
    $qv  = "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Quick View</h2>`n        <div class=`"bar-list`">`n"
    $qv += "          <div class=`"bar-row`"><span>HDI</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($d.hb)`"></i></div><strong>$($d.hdi)</strong></div>`n"
    $qv += "          <div class=`"bar-row`"><span>Safety index</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($d.sb)`"></i></div><strong>$($d.si)</strong></div>`n"
    $qv += "          <div class=`"bar-row`"><span>Internet access</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($d.ib)`"></i></div><strong>$($d.ia)</strong></div>`n"
    $qv += "          <div class=`"bar-row`"><span>Life expectancy</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($d.lb)`"></i></div><strong>$($d.le)</strong></div>`n"
    $qv += "        </div>`n        <p class=`"source-line`">Sources: World Bank, Numbeo, UN.</p>`n      </article>`n"

    # Mountains
    $mtn  = "      <article class=`"card span-5`">`n        <h2 class=`"card-title`">Top 3 Highest Mountains</h2>`n        <div class=`"mini-grid`">`n"
    foreach ($peak in $d.m) {
        $mtn += "          <div class=`"mini-tile`"><div class=`"mini-photo`" style=`"background:linear-gradient(135deg,#0d3a52,#1a6080)`"></div><strong>$($peak[0])</strong><span>$($peak[1])</span></div>`n"
    }
    $mtn += "        </div>`n      </article>`n"

    # Religion
    $rel  = "      <article class=`"card span-7`">`n        <h2 class=`"card-title`">Religion (est.)</h2>`n        <div class=`"pie-wrap`">`n          <div class=`"pie`"></div>`n          <ul class=`"legend`">`n"
    foreach ($r in $d.rl) {
        $rel += "            <li><span><i style=`"--swatch:$($r[2])`"></i>$($r[0])</span><strong>$($r[1])</strong></li>`n"
    }
    $rel += "          </ul>`n        </div>`n      </article>`n"

    # Why Visit
    $wv  = "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Why Visit $title?</h2>`n        <div class=`"icon-grid`">`n"
    foreach ($item in $d.wv) {
        $wv += "          <div class=`"icon-tile`"><strong>$($item[0])</strong><span>$($item[1])</span></div>`n"
    }
    $wv += "        </div>`n      </article>`n"

    # Cities bar-list
    $cb  = "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Top 3 Cities by Population</h2>`n        <div class=`"bar-list`">`n"
    foreach ($c in $d.ci) {
        $cb += "          <div class=`"bar-row`"><span>$($c[0])</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($c[2])%`"></i></div><strong>$($c[1])</strong></div>`n"
    }
    $cb += "        </div>`n      </article>`n"

    # Climate
    $cl  = "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Climate Overview</h2>`n        <div class=`"metric-strip`">`n"
    $cl += "          <div class=`"metric`"><strong>$($d.j)C</strong><span>Jan avg.</span></div>`n"
    $cl += "          <div class=`"metric`"><strong>$($d.u)C</strong><span>Jul avg.</span></div>`n"
    $cl += "          <div class=`"metric`"><strong>$($d.rn)</strong><span>Yearly rainfall</span></div>`n"
    $cl += "          <div class=`"metric`"><strong>$($d.ct)</strong><span>Climate</span></div>`n"
    $cl += "        </div>`n      </article>`n"

    # Other Quick Info
    $oi  = "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Other Quick Info</h2>`n        <div class=`"two-list`">`n"
    if ($curr) { $oi += "          <div class=`"info-chip`"><span>Currency</span><strong>$curr</strong></div>`n" }
    if ($lang) { $oi += "          <div class=`"info-chip`"><span>Official language</span><strong>$lang</strong></div>`n" }
    $oi += "          <div class=`"info-chip`"><span>National day</span><strong>$($d.nd)</strong></div>`n"
    $oi += "          <div class=`"info-chip`"><span>Electricity</span><strong>$($d.el)</strong></div>`n"
    $oi += "        </div>`n      </article>`n"

    $HEAD = @"
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
<body>
"@

    $NAV = @"
  <nav class="top-menu" aria-label="Location navigation">
    $ICONS_EVENTS
    $ICONS_WORLD
    $ICONS_CAT
    <span class="nav-divider"></span>
    <a class="nav-back" href="../index.html" title="Back to Europe" aria-label="Back to Europe">$BACK_ICON<span>Europe</span></a>
    <a class="nav-pill" href="../index.html">Europe</a>
    <a class="nav-pill active" aria-current="page" href="index.html">$title</a>
  </nav>
"@

    $BODY = @"

  <main class="page-shell">
    <section class="hero-card" style="$heroStyle">
      <div class="hero-inner">
        <div class="hero-copy">
          <img class="flag-badge" src="https://flagcdn.com/$($d.iso).svg" alt="$title flag">
          <p class="kicker">$kicker</p>
          <h1 class="hero-title">$title</h1>
          <p class="hero-text">$intro</p>
        </div>
        <div class="hero-stats">
$capStat          <div class="hero-stat"><span>Language</span><strong>$lang</strong></div>
          <div class="hero-stat"><span>Currency</span><strong>$curr</strong></div>
          <div class="hero-stat"><span>Population</span><strong>$pop</strong></div>
        </div>
      </div>
    </section>

    <section class="dashboard-grid" aria-label="$title overview">
$kf$qv$mtn$rel$wv$cb$cl$oi$citySection$evtSection    </section>
  </main>

  <footer class="footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. Updated May 2026.</footer>
</body>
</html>
"@

    return $HEAD + $NAV + $BODY
}

# ─────────────────────────────────────────────
# Main loop – only europe\*\index.html
# ─────────────────────────────────────────────
$files = Get-ChildItem "$locRoot\europe" -Recurse -Filter "index.html" | Where-Object {
    $rel   = $_.FullName.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    $parts.Length -eq 3
}

$converted = 0; $skipped = 0; $errors = 0

foreach ($f in $files) {
    try {
        $result = Build-EuropePage $f.FullName
        if ($result) {
            [System.IO.File]::WriteAllText($f.FullName, $result, (New-Object System.Text.UTF8Encoding $false))
            $converted++
            Write-Host "  OK: $($f.FullName.Substring($locRoot.Length + 1))"
        } else {
            $skipped++
        }
    } catch {
        Write-Host "ERROR: $($f.FullName.Substring($locRoot.Length + 1)) - $_"
        $errors++
    }
}

Write-Host ""
Write-Host "=== DONE ==="
Write-Host "Converted : $converted"
Write-Host "Skipped   : $skipped"
Write-Host "Errors    : $errors"
