$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"

$ICONS_EVENTS = '<a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>'
$ICONS_WORLD  = '<a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>'
$ICONS_CAT    = '<a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>'
$BACK_ICON    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'

$CD = @{

'antigua-and-barbuda' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1981'; a='443 km2'; dn='222/km2'
  tz='AST (UTC-4)'; cc='+1-268'; dr='Left'
  hdi='0.826'; hb='83%'; si='52.0'; sb='52%'; ia='76%'; ib='76%'; le='77.0'; lb='62%'
  m=@(('Boggy Peak','402 m'),('Mount Obama','399 m'),('Signal Hill','168 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('365 Beaches','One beach for every day of the year, from sheltered coves to open Atlantic shores.'),('English Harbour','Nelson''s Dockyard — a Georgian naval station, now a UNESCO World Heritage site.'),('Sailing Mecca','Antigua Sailing Week draws competitors from around the world each April.'),('Shirley Heights','A clifftop lookout with sweeping harbour views and a legendary Sunday party.'),('Caribbean Waters','Warm turquoise waters ideal for snorkelling, kayaking and kitesurfing.'))
  ci=@(('Saint John''s','22k',100),('All Saints','3k',14),('Liberta','2.5k',11))
  j='25'; u='28'; rn='1,000 mm'; ct='Tropical maritime'
  nd='1 November'; el='230V, Type A/B'
  iso='ag'; intro='Twin-island Caribbean paradise of 365 beaches, world-class sailing and a restored Georgian naval dockyard.'
}

'bahamas' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1973'; a='13,943 km2'; dn='40/km2'
  tz='EST (UTC-5)'; cc='+1-242'; dr='Left'
  hdi='0.814'; hb='81%'; si='43.0'; sb='43%'; ia='85%'; ib='85%'; le='73.5'; lb='56%'
  m=@(('Mount Alvernia','63 m'),('Comer Hill','57 m'),('Balmoral Island high point','50 m'))
  rl=@(('Christianity','95%','#214e68'),('No religion','3%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Exuma Swimming Pigs','A beach where wild pigs swim out to greet visiting boats.'),('Blue Holes','The Great Blue Hole and Dean''s Blue Hole offer legendary diving.'),('Nassau Old Town','Colonial buildings, straw markets and pastel-coloured architecture.'),('Pink Sand Beaches','Harbour Island''s rosy-hued beach is among the most photographed in the world.'),('Turquoise Waters','Consistently ranked among the clearest, most photogenic waters on Earth.'))
  ci=@(('Nassau','274k',100),('Lucaya','45k',16),('Freeport','30k',11))
  j='21'; u='29'; rn='1,300 mm'; ct='Tropical maritime'
  nd='10 July'; el='120V, Type A/B'
  iso='bs'; intro='An archipelago of 700 islands with some of the world''s most beautiful turquoise waters and white-sand beaches.'
}

'barbados' = @{
  r='Caribbean'; g='Parliamentary republic'; y='1966'; a='430 km2'; dn='660/km2'
  tz='AST (UTC-4)'; cc='+1-246'; dr='Left'
  hdi='0.814'; hb='81%'; si='51.0'; sb='51%'; ia='82%'; ib='82%'; le='79.5'; lb='66%'
  m=@(('Mount Hillaby','340 m'),('Cherry Tree Hill','289 m'),('Mount Misery','267 m'))
  rl=@(('Christianity','95%','#214e68'),('No religion','4%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Rum Heritage','Birthplace of Caribbean rum, with Mount Gay distillery operating since 1703.'),('Bridgetown UNESCO','The historic capital and its garrison, a UNESCO World Heritage site.'),('East Coast Surf','Soup Bowl at Bathsheba is a world-famous reef break for surfers.'),('Crop Over Festival','A summer harvest festival of calypso music, costumes and Kadooment Day parade.'),('Coral Reefs','Calm west coast waters and the Folkestone reef are ideal for snorkelling.'))
  ci=@(('Bridgetown','110k',100),('Oistins','12k',11),('Speightstown','3.6k',3))
  j='26'; u='29'; rn='1,500 mm'; ct='Tropical maritime'
  nd='30 November'; el='115V, Type A/B'
  iso='bb'; intro='A coral island of rum heritage, UNESCO Bridgetown, east-coast surf and a refined Caribbean sophistication.'
}

'belize' = @{
  r='Central America'; g='Constitutional parliamentary monarchy'; y='1981'; a='22,966 km2'; dn='17/km2'
  tz='CST (UTC-6)'; cc='+501'; dr='Right'
  hdi='0.683'; hb='68%'; si='36.0'; sb='36%'; ia='58%'; ib='58%'; le='74.5'; lb='58%'
  m=@(('Doyle''s Delight','1,124 m'),('Victoria Peak','1,120 m'),('Baldy Beacon','1,116 m'))
  rl=@(('Christianity','80%','#214e68'),('No religion','10%','#8ab7c4'),('Other','8%','#bac4c8'),('Islam','2%','#e2e4df'))
  wv=@(('Great Blue Hole','A 300 m wide underwater sinkhole — one of the world''s top dive sites.'),('Mayan Ruins','Xunantunich, Caracol and Lamanai are among the best-preserved Maya sites.'),('Belize Barrier Reef','The second-largest coral reef system on Earth, UNESCO listed.'),('Jaguar Sanctuary','Cockscomb Basin is the world''s first jaguar reserve.'),('Eco-Tourism','Dense jungle, rivers and caves make Belize a premier adventure destination.'))
  ci=@(('Belize City','62k',100),('Belmopan','25k',40),('Orange Walk','14k',23))
  j='24'; u='28'; rn='1,500 mm'; ct='Tropical (wet/dry seasons)'
  nd='21 September'; el='110V, Type B/G'
  iso='bz'; intro='Central America''s eco-tourism gem of Mayan ruins, jungle wildlife, a UNESCO barrier reef and English-speaking culture.'
}

'canada' = @{
  r='Northern North America'; g='Federal parliamentary constitutional monarchy'; y='1867'; a='9,984,670 km2'; dn='4/km2'
  tz='Multiple (UTC-3.5 to UTC-8)'; cc='+1'; dr='Right'
  hdi='0.936'; hb='94%'; si='66.2'; sb='66%'; ia='96%'; ib='96%'; le='82.6'; lb='71%'
  m=@(('Mount Logan','5,959 m'),('Mount Saint Elias','5,489 m'),('Mount Lucania','5,226 m'))
  rl=@(('Christianity','53%','#214e68'),('No religion','36%','#8ab7c4'),('Islam','5%','#bac4c8'),('Other','6%','#e2e4df'))
  wv=@(('Banff and Jasper','Turquoise glacier lakes, grizzly bears and the Icefields Parkway.'),('Niagara Falls','Three waterfalls straddling the US border attracting 14 million visitors yearly.'),('Multicultural Cities','Toronto, Montreal and Vancouver are among the world''s most liveable cities.'),('Northern Lights','The Yukon and Northwest Territories offer prime aurora borealis viewing.'),('Maple Syrup','Canada produces 73% of the world''s maple syrup, a cultural touchstone.'))
  ci=@(('Toronto','2.9M',100),('Montreal','2.1M',72),('Vancouver','675k',23))
  j='-10'; u='19'; rn='800 mm'; ct='Subarctic to temperate (vast range)'
  nd='1 July'; el='120V, Type A/B'
  iso='ca'; intro='The world''s second largest country — vast wilderness, multicultural cities and some of North America''s most stunning national parks.'
}

'costa-rica' = @{
  r='Central America'; g='Presidential republic'; y='1821'; a='51,100 km2'; dn='98/km2'
  tz='CST (UTC-6)'; cc='+506'; dr='Right'
  hdi='0.806'; hb='81%'; si='55.0'; sb='55%'; ia='83%'; ib='83%'; le='80.3'; lb='67%'
  m=@(('Cerro Chirripo','3,821 m'),('Cerro Ventisqueros','3,812 m'),('Cerro Terbi','3,760 m'))
  rl=@(('Christianity','79%','#214e68'),('No religion','17%','#8ab7c4'),('Other','3%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Eco-Tourism Pioneer','25% of land is protected national park — the world''s highest ratio.'),('Arenal Volcano','An active stratovolcano surrounded by hot springs and cloud forest.'),('Manuel Antonio','A national park where wildlife meets white-sand beach on the Pacific.'),('Monteverde','A cloud forest reserve of hanging bridges, quetzals and misty trails.'),('Wildlife','Sloths, toucans, poison dart frogs and sea turtles in a country-sized zoo.'))
  ci=@(('San Jose','345k',100),('Cartago','158k',46),('Heredia','134k',39))
  j='19'; u='22'; rn='3,000 mm'; ct='Tropical (wet/dry seasons)'
  nd='15 September'; el='120V, Type A/B'
  iso='cr'; intro='A pioneering eco-tourism nation where a quarter of the land is protected, home to volcanoes, rainforests and extraordinary wildlife.'
}

'cuba' = @{
  r='Caribbean'; g='Single-party socialist republic'; y='1898'; a='109,884 km2'; dn='103/km2'
  tz='CST (UTC-5)'; cc='+53'; dr='Right'
  hdi='0.764'; hb='76%'; si='50.0'; sb='50%'; ia='68%'; ib='68%'; le='79.2'; lb='66%'
  m=@(('Pico Turquino','1,974 m'),('Pico Cuba','1,872 m'),('Gran Piedra','1,234 m'))
  rl=@(('Christianity','59%','#214e68'),('No religion','23%','#8ab7c4'),('Santeria / Other','17%','#bac4c8'),('Islam','1%','#e2e4df'))
  wv=@(('Havana','Vintage 1950s cars, crumbling Baroque grandeur and the legendary Malecon seafront.'),('Trinidad','A perfectly preserved colonial sugar town, UNESCO listed, with cobbled streets.'),('Salsa Music','Cuba is the birthplace of salsa, son and mambo — music is everywhere.'),('Varadero Beaches','A 20 km peninsula of white sand and warm blue water.'),('Rum and Cigars','Havana Club rum and Cohiba cigars are two of Cuba''s great exports.'))
  ci=@(('Havana','2.1M',100),('Santiago de Cuba','433k',21),('Camaguey','322k',15))
  j='22'; u='28'; rn='1,200 mm'; ct='Tropical (hurricane risk Jun-Nov)'
  nd='1 January'; el='110/220V, Type A/B/C'
  iso='cu'; intro='A Caribbean island of vintage cars, colonial grandeur, salsa rhythms and a unique socialist heritage frozen in 1960s amber.'
}

'dominica' = @{
  r='Caribbean'; g='Presidential republic'; y='1978'; a='751 km2'; dn='95/km2'
  tz='AST (UTC-4)'; cc='+1-767'; dr='Left'
  hdi='0.720'; hb='72%'; si='60.0'; sb='60%'; ia='72%'; ib='72%'; le='76.0'; lb='60%'
  m=@(('Morne Diablotins','1,447 m'),('Morne Trois Pitons','1,387 m'),('Morne Watt','1,224 m'))
  rl=@(('Christianity','95%','#214e68'),('No religion','4%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Boiling Lake','A flooded fumarole — the second largest boiling lake in the world, reached by a full-day trek.'),('Morne Trois Pitons','A UNESCO national park of volcanic features, forests and crater lakes.'),('Whale Watching','Dominica is one of the best places in the world to see sperm whales year-round.'),('Pristine Diving','Dramatic underwater volcanic formations with little commercial tourism pressure.'),('Kalinago People','Dominica is home to the Caribbean''s last indigenous Kalinago community.'))
  ci=@(('Roseau','14k',100),('Portsmouth','3.6k',26),('Marigot','2.5k',18))
  j='24'; u='28'; rn='6,000 mm'; ct='Tropical rainforest'
  nd='3 November'; el='230V, Type D/G'
  iso='dm'; intro='The "Nature Isle" of the Caribbean — a rugged volcanic island of rainforests, a boiling lake and pristine reefs.'
}

'dominican-republic' = @{
  r='Caribbean'; g='Presidential republic'; y='1844'; a='48,670 km2'; dn='222/km2'
  tz='AST (UTC-4)'; cc='+1-809'; dr='Right'
  hdi='0.767'; hb='77%'; si='46.0'; sb='46%'; ia='77%'; ib='77%'; le='74.5'; lb='58%'
  m=@(('Pico Duarte','3,098 m'),('La Pelona','3,087 m'),('La Rucilla','3,049 m'))
  rl=@(('Christianity','92%','#214e68'),('No religion','6%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Punta Cana','All-inclusive beach resorts on a 50 km stretch of palm-lined Caribbean sand.'),('Santo Domingo','The oldest continuously inhabited European city in the Americas, UNESCO listed.'),('Merengue and Bachata','Two UNESCO-recognised music genres born on this island define Caribbean culture.'),('Samana Whales','Humpback whales arrive each winter to breed in the warm Samana Bay.'),('Cabarete','A world-class kitesurfing and windsurfing destination on the north coast.'))
  ci=@(('Santo Domingo','1.0M',100),('Santiago','745k',75),('La Romana','245k',25))
  j='25'; u='29'; rn='1,500 mm'; ct='Tropical'
  nd='27 February'; el='110V, Type A/B'
  iso='do'; intro='A Caribbean island sharing Hispaniola with Haiti, home to the oldest European city in the Americas and world-famous beach resorts.'
}

'el-salvador' = @{
  r='Central America'; g='Presidential republic'; y='1821'; a='21,041 km2'; dn='316/km2'
  tz='CST (UTC-6)'; cc='+503'; dr='Right'
  hdi='0.675'; hb='68%'; si='39.0'; sb='39%'; ia='55%'; ib='55%'; le='74.0'; lb='57%'
  m=@(('El Pital','2,730 m'),('Santa Ana','2,381 m'),('San Miguel (Chaparrastique)','2,130 m'))
  rl=@(('Christianity','90%','#214e68'),('No religion','8%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Surf Beaches','El Tunco and El Zonte draw world-ranked surfers to Pacific breaks.'),('Ruta de las Flores','A scenic route through colonial towns, coffee farms and flower markets.'),('Santa Ana Volcano','A short hike leads to an active crater with a turquoise acidic lake inside.'),('Pupusas','The national dish — thick corn tortillas stuffed with cheese, beans or chicharron.'),('Joya de Ceren','A Maya village preserved under volcanic ash, the Pompeii of the Americas, UNESCO listed.'))
  ci=@(('San Salvador','568k',100),('Soyapango','290k',51),('Santa Ana','245k',43))
  j='24'; u='23'; rn='1,800 mm'; ct='Tropical (dry/wet seasons)'
  nd='15 September'; el='115V, Type A/B'
  iso='sv'; intro='Central America''s smallest and most densely populated country, known for surf beaches, volcanoes and pupusa cuisine.'
}

'grenada' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1974'; a='348 km2'; dn='322/km2'
  tz='AST (UTC-4)'; cc='+1-473'; dr='Left'
  hdi='0.779'; hb='78%'; si='56.0'; sb='56%'; ia='68%'; ib='68%'; le='72.8'; lb='55%'
  m=@(('Mount Saint Catherine','840 m'),('South East Mountain','758 m'),('Mount Sinai','697 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Spice Isle','Grenada produces 20% of the world''s nutmeg — you smell the island before you see it.'),('Grand Anse Beach','A 3 km crescent of white sand regarded as one of the Caribbean''s finest.'),('Underwater Sculpture Park','A gallery of submerged sculptures forming an artificial reef.'),('Fort George','A clifftop colonial fort with panoramic views over the capital and harbour.'),('Carriacou','A quiet sister island of coral reefs, traditional boat-building and local festivals.'))
  ci=@(('Saint George''s','33k',100),('Gouyave','3k',9),('Grenville','2.5k',8))
  j='26'; u='29'; rn='1,500 mm'; ct='Tropical maritime'
  nd='7 February'; el='230V, Type G'
  iso='gd'; intro='The "Spice Isle" of the Caribbean, producing most of the world''s nutmeg on a lush volcanic island with stunning beaches.'
}

'guatemala' = @{
  r='Central America'; g='Presidential republic'; y='1821'; a='108,889 km2'; dn='167/km2'
  tz='CST (UTC-6)'; cc='+502'; dr='Right'
  hdi='0.627'; hb='63%'; si='38.0'; sb='38%'; ia='51%'; ib='51%'; le='74.3'; lb='57%'
  m=@(('Tajumulco','4,202 m'),('Tacana','4,093 m'),('Santa Maria','3,772 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Lake Atitlan','Three volcanoes rising from a highland lake — described as the most beautiful in the world.'),('Antigua','A colonial UNESCO city of pastel churches, cobblestone streets and volcano backdrops.'),('Tikal','A Maya city-state rising from the jungle, with temples above the rainforest canopy.'),('Chichicastenango','One of the most vibrant indigenous markets in the Americas, held twice weekly.'),('Active Volcanoes','Pacaya and Acatenango offer accessible hikes with lava flows and crater rim camps.'))
  ci=@(('Guatemala City','994k',100),('Villa Nueva','490k',49),('Mixco','474k',48))
  j='16'; u='19'; rn='1,200 mm'; ct='Tropical (highland temperate)'
  nd='15 September'; el='120V, Type A/B'
  iso='gt'; intro='Land of the Maya — ancient jungle pyramids, volcanic highland lakes, colonial Antigua and vibrant indigenous culture.'
}

'haiti' = @{
  r='Caribbean'; g='Presidential republic'; y='1804'; a='27,750 km2'; dn='419/km2'
  tz='EST (UTC-5)'; cc='+509'; dr='Right'
  hdi='0.535'; hb='54%'; si='25.0'; sb='25%'; ia='38%'; ib='38%'; le='63.5'; lb='39%'
  m=@(('Pic la Selle','2,680 m'),('Pic Macaya','2,347 m'),('Morne Bossa','2,240 m'))
  rl=@(('Christianity','85%','#214e68'),('Vodou / Other','13%','#8ab7c4'),('No religion','2%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Citadelle Laferriere','A UNESCO hilltop fortress — the largest in the Americas — built after independence.'),('First Black Republic','The only nation born from a successful slave rebellion, in 1804.'),('Jacmel','A colonial port city with Art Nouveau architecture and a vibrant carnival tradition.'),('Haitian Art','A globally recognised tradition of vibrant painting, metalwork and wood sculpture.'),('Labadee Beaches','Secluded beaches on a private peninsula on the north coast.'))
  ci=@(('Port-au-Prince','942k',100),('Carrefour','511k',54),('Delmas','396k',42))
  j='26'; u='29'; rn='1,400 mm'; ct='Tropical'
  nd='1 January'; el='110V, Type A/B'
  iso='ht'; intro='The first Black republic in history, with a resilient culture, vivid art tradition and a dramatic mountain interior.'
}

'honduras' = @{
  r='Central America'; g='Presidential republic'; y='1821'; a='112,492 km2'; dn='83/km2'
  tz='CST (UTC-6)'; cc='+504'; dr='Right'
  hdi='0.634'; hb='63%'; si='30.0'; sb='30%'; ia='49%'; ib='49%'; le='75.3'; lb='59%'
  m=@(('Cerro Las Minas','2,870 m'),('Monte El Boqueron','2,747 m'),('Cerro El Pital','2,730 m'))
  rl=@(('Christianity','96%','#214e68'),('No religion','3%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Bay Islands Diving','Roatan sits on the Mesoamerican Barrier Reef — the world''s second largest reef.'),('Copan Maya Ruins','One of the most elaborate Maya sites, famous for carved stone hieroglyphs.'),('Pico Bonito','A cloud forest national park with rivers, waterfalls and jaguars.'),('Whale Sharks','The Bay Islands are a reliable spot to snorkel with whale sharks.'),('Colonial Comayagua','A former colonial capital with a 17th-century cathedral and clock tower.'))
  ci=@(('Tegucigalpa','1.4M',100),('San Pedro Sula','784k',56),('Choloma','285k',20))
  j='20'; u='24'; rn='1,800 mm'; ct='Tropical (wet/dry seasons)'
  nd='15 September'; el='110V, Type A/B'
  iso='hn'; intro='A Central American country of Mayan ruins, Caribbean island reefs, cloud forest peaks and world-class Bay Islands diving.'
}

'jamaica' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1962'; a='10,991 km2'; dn='270/km2'
  tz='EST (UTC-5)'; cc='+1-876'; dr='Left'
  hdi='0.706'; hb='71%'; si='38.0'; sb='38%'; ia='72%'; ib='72%'; le='74.5'; lb='58%'
  m=@(('Blue Mountain Peak','2,256 m'),('Sugarloaf Mountain','1,729 m'),('Catherine''s Peak','1,536 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Rastafarianism','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Reggae Heritage','Bob Marley''s homeland is the birthplace of reggae, ska and dancehall music.'),('Blue Mountain Coffee','One of the world''s most prized coffees, grown in misty mountain rainforest.'),('Dunn''s River Falls','A stunning tiered waterfall you can climb in a human chain.'),('Negril Beach','Seven miles of white sand and dramatic West End cliffs.'),('Speed Nation','Birthplace of Usain Bolt, the fastest human ever recorded.'))
  ci=@(('Kingston','665k',100),('Spanish Town','159k',24),('Montego Bay','110k',17))
  j='25'; u='29'; rn='2,000 mm'; ct='Tropical maritime'
  nd='1 August (first Monday)'; el='110V, Type A/B'
  iso='jm'; intro='A Caribbean island of reggae music, world-record sprinters, Blue Mountain coffee, Rastafari culture and vibrant beaches.'
}

'mexico' = @{
  r='Southern North America / Mesoamerica'; g='Federal presidential republic'; y='1821'; a='1,964,375 km2'; dn='66/km2'
  tz='CST (UTC-6) to PST (UTC-8)'; cc='+52'; dr='Right'
  hdi='0.774'; hb='77%'; si='40.0'; sb='40%'; ia='76%'; ib='76%'; le='75.3'; lb='59%'
  m=@(('Pico de Orizaba','5,636 m'),('Popocatepetl','5,426 m'),('Iztaccihuatl','5,230 m'))
  rl=@(('Christianity','89%','#214e68'),('No religion','10%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Chichen Itza','One of the New Seven Wonders of the World — a Maya pyramid rising from the jungle.'),('Mexico City Culture','World-class Anthropology Museum, murals by Diego Rivera and a Aztec pyramid beneath the subway.'),('Riviera Maya','Tulum clifftop ruins, Cenote swimming and Playa del Carmen beach clubs.'),('Oaxacan Cuisine','Mole, mezcal, tlayudas and grasshopper tacos from Mexico''s culinary capital.'),('Dia de los Muertos','A UNESCO-recognised tradition of honouring ancestors with altars, marigolds and processions.'))
  ci=@(('Mexico City','9.2M',100),('Guadalajara','1.5M',16),('Monterrey','1.1M',12))
  j='12'; u='18'; rn='800 mm'; ct='Tropical / Arid / Temperate highland'
  nd='16 September'; el='127V, Type A/B'
  iso='mx'; intro='A vast Mesoamerican nation of ancient pyramids, colonial cities, Pacific and Caribbean coastlines and one of the world''s great cuisines.'
}

'nicaragua' = @{
  r='Central America'; g='Presidential republic'; y='1821'; a='130,375 km2'; dn='52/km2'
  tz='CST (UTC-6)'; cc='+505'; dr='Right'
  hdi='0.667'; hb='67%'; si='42.0'; sb='42%'; ia='55%'; ib='55%'; le='74.3'; lb='57%'
  m=@(('Mogoton','2,107 m'),('Peñas Blancas','1,745 m'),('Cerro Saslaya','1,650 m'))
  rl=@(('Christianity','93%','#214e68'),('No religion','5%','#8ab7c4'),('Other','2%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Ometepe Island','A figure-eight island of two volcanoes rising from Lake Nicaragua.'),('Granada Colonial City','The oldest continuously inhabited city in Central America, on the lake shore.'),('Laguna de Apoyo','A perfect circular crater lake with warm clear water and a nature reserve.'),('Corn Islands','Tiny Caribbean islands of white sand, coral reefs and local lobster.'),('Leon Street Art','Murals covering the walls of this student city tell Nicaragua''s turbulent history.'))
  ci=@(('Managua','1.1M',100),('Leon','175k',16),('Masaya','140k',13))
  j='25'; u='27'; rn='1,500 mm'; ct='Tropical (wet/dry seasons)'
  nd='15 September'; el='120V, Type A/B'
  iso='ni'; intro='Central America''s largest country — volcanic islands, colonial cities, crater lakes and an emerging travel destination.'
}

'panama' = @{
  r='Central America'; g='Presidential republic'; y='1903'; a='75,417 km2'; dn='57/km2'
  tz='EST (UTC-5)'; cc='+507'; dr='Right'
  hdi='0.805'; hb='81%'; si='47.0'; sb='47%'; ia='65%'; ib='65%'; le='78.8'; lb='65%'
  m=@(('Volcan Baru','3,475 m'),('Cerro Santiago','2,280 m'),('Cerro Punta','2,000 m'))
  rl=@(('Christianity','92%','#214e68'),('No religion','5%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','1%','#e2e4df'))
  wv=@(('Panama Canal','An engineering marvel linking the Atlantic and Pacific — 14,000 ships pass through yearly.'),('Bocas del Toro','A Caribbean archipelago of stilted villages, sloths and turquoise surfing lagoons.'),('Casco Viejo','A crumbling-chic colonial quarter on a bay peninsula, UNESCO listed.'),('Chiriqui Highlands','Coffee farms and cloud forest above 3,000 m — a world away from the beach.'),('San Blas Islands','The Kuna Yala people govern their own 365-island archipelago with pristine reefs.'))
  ci=@(('Panama City','880k',100),('San Miguelito','315k',36),('Tocumen','110k',12))
  j='27'; u='26'; rn='3,000 mm'; ct='Tropical (wet/dry seasons)'
  nd='3 November'; el='110V, Type A/B'
  iso='pa'; intro='A narrow isthmus connecting two continents, home to one of humanity''s greatest engineering feats and stunning Caribbean-Pacific diversity.'
}

'saint-kitts-and-nevis' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1983'; a='261 km2'; dn='196/km2'
  tz='AST (UTC-4)'; cc='+1-869'; dr='Left'
  hdi='0.777'; hb='78%'; si='53.0'; sb='53%'; ia='77%'; ib='77%'; le='75.9'; lb='60%'
  m=@(('Mount Liamuiga','1,156 m'),('Nevis Peak','985 m'),('Saddle Hill','350 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Brimstone Hill Fortress','A UNESCO fortress built by slave labour to defend British sugar interests.'),('Nevis Peak Hike','A cloud forest trail to the summit of a dormant volcanic cone.'),('Pinney''s Beach','A long palm-lined beach on the sheltered Caribbean side of Nevis.'),('Romney Manor','A restored plantation house with botanical gardens and a batik art workshop.'),('Luxury Escapes','Four Seasons Nevis and similar resorts make these islands a discreet retreat.'))
  ci=@(('Basseterre','14k',100),('Sandy Point','3k',21),('Charlestown','2.4k',17))
  j='25'; u='28'; rn='1,400 mm'; ct='Tropical maritime'
  nd='19 September'; el='230V, Type A/D/G'
  iso='kn'; intro='A two-island federation of volcanic peaks, a UNESCO fortress and luxurious Caribbean beaches.'
}

'saint-lucia' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1979'; a='616 km2'; dn='306/km2'
  tz='AST (UTC-4)'; cc='+1-758'; dr='Left'
  hdi='0.759'; hb='76%'; si='50.0'; sb='50%'; ia='68%'; ib='68%'; le='75.5'; lb='59%'
  m=@(('Gimie','950 m'),('Gros Piton','798 m'),('Petit Piton','743 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('The Pitons','Twin volcanic spires rising from the sea — a UNESCO World Heritage landscape.'),('Sulphur Springs','The world''s only drive-in volcano with bubbling mud pools and steam vents.'),('Marigot Bay','A stunning natural harbour described as one of the Caribbean''s most beautiful.'),('Creole Culture','Kweyol language, cuisine and music distinguish Saint Lucia from its neighbours.'),('Jade Mountain','An architectural marvel open to the Caribbean on three sides with infinity pool views.'))
  ci=@(('Castries','20k',100),('Gros Islet','22k',110),('Vieux Fort','15k',75))
  j='26'; u='29'; rn='2,000 mm'; ct='Tropical maritime'
  nd='22 February'; el='230V, Type G'
  iso='lc'; intro='A lush volcanic island of Piton peaks, a drive-in volcano, world-class resorts and vibrant Creole culture.'
}

'saint-vincent-and-the-grenadines' = @{
  r='Caribbean'; g='Constitutional parliamentary monarchy'; y='1979'; a='389 km2'; dn='282/km2'
  tz='AST (UTC-4)'; cc='+1-784'; dr='Left'
  hdi='0.751'; hb='75%'; si='53.0'; sb='53%'; ia='65%'; ib='65%'; le='73.5'; lb='56%'
  m=@(('La Soufriere','1,234 m'),('Grand Bonhomme','1,001 m'),('Mount Brisbane','970 m'))
  rl=@(('Christianity','97%','#214e68'),('No religion','2%','#8ab7c4'),('Other','1%','#bac4c8'),('Islam','0%','#e2e4df'))
  wv=@(('Tobago Cays','A marine park of five uninhabited islands with sea turtles and pristine coral.'),('Mustique','A private island retreat for celebrities and royalty with exclusive villas.'),('Bequia','A charming sailing village known for traditional boat-building and whale heritage.'),('La Soufriere Volcano','An active volcano that erupted in 2021, accessible for guided hiking.'),('Pirates of the Caribbean','Parts of the film franchise were shot on location here.'))
  ci=@(('Kingstown','25k',100),('Georgetown','3k',12),('Barrouallie','2k',8))
  j='25'; u='28'; rn='2,500 mm'; ct='Tropical maritime'
  nd='27 October'; el='230V, Type A/C/G'
  iso='vc'; intro='A chain of volcanic islands and coral cays where Pirates of the Caribbean was filmed and sailors come to anchor in paradise.'
}

'trinidad-and-tobago' = @{
  r='Caribbean'; g='Parliamentary republic'; y='1962'; a='5,130 km2'; dn='265/km2'
  tz='AST (UTC-4)'; cc='+1-868'; dr='Left'
  hdi='0.814'; hb='81%'; si='41.0'; sb='41%'; ia='79%'; ib='79%'; le='73.7'; lb='57%'
  m=@(('El Cerro del Aripo','940 m'),('El Tucuche','936 m'),('Morne Blanc','576 m'))
  rl=@(('Christianity','63%','#214e68'),('Hinduism','22%','#8ab7c4'),('Islam','6%','#bac4c8'),('Other','9%','#e2e4df'))
  wv=@(('Trinidad Carnival','The world''s most exuberant street party — two days of soca, costumes and crowds.'),('Steelpan Music','Trinidad invented the steelpan — the only acoustic instrument created in the 20th century.'),('Asa Wright Nature Centre','A premier birdwatching lodge in a rainforest estate with 170 species on-site.'),('Pitch Lake','The world''s largest natural asphalt deposit — you can walk on the surface.'),('Tobago Reefs','Pristine coral gardens and gentle whale sharks in an uncrowded Caribbean island.'))
  ci=@(('Port of Spain (metro)','545k',100),('Chaguanas','67k',12),('San Fernando','55k',10))
  j='26'; u='27'; rn='1,500 mm'; ct='Tropical (year-round warm)'
  nd='31 August'; el='115V, Type A/B'
  iso='tt'; intro='A twin-island republic of world-famous Carnival, steelpan music, a remarkable natural asphalt lake and Tobago''s pristine reefs.'
}

'usa' = @{
  r='Northern North America'; g='Federal presidential constitutional republic'; y='1776'; a='9,833,517 km2'; dn='36/km2'
  tz='Multiple (UTC-4 to UTC-10)'; cc='+1'; dr='Right'
  hdi='0.921'; hb='92%'; si='52.0'; sb='52%'; ia='92%'; ib='92%'; le='79.3'; lb='66%'
  m=@(('Denali (Mount McKinley)','6,190 m'),('Mount Saint Elias','5,489 m'),('Mount Foraker','5,304 m'))
  rl=@(('Christianity','63%','#214e68'),('No religion','29%','#8ab7c4'),('Islam','2%','#bac4c8'),('Other','6%','#e2e4df'))
  wv=@(('National Parks','61 national parks from Yellowstone''s geysers to the Grand Canyon''s mile-deep gorge.'),('New York City','The Empire State Building, Central Park, Times Square and the world''s cultural capital.'),('California','Hollywood, Silicon Valley, Yosemite and 1,350 km of Pacific coastline.'),('Jazz and Blues','American music — jazz, blues, rock and country — has shaped global culture.'),('Iconic Road Trips','Route 66, Pacific Coast Highway and the Blue Ridge Parkway are legendary drives.'))
  ci=@(('New York','8.3M',100),('Los Angeles','4.0M',48),('Chicago','2.7M',33))
  j='-1'; u='22'; rn='800 mm'; ct='Highly variable (Arctic to tropical)'
  nd='4 July'; el='120V, Type A/B'
  iso='us'; intro='The world''s largest economy — a continental nation of unparalleled national parks, iconic cities and global cultural influence.'
}

} # end $CD

# ─────────────────────────────────────────────
# Builder
# ─────────────────────────────────────────────

function Build-NAPage($filePath) {
    $html = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

    $rel   = $filePath.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    if ($parts.Length -ne 3 -or $parts[0] -ne 'north-america' -or $parts[2] -ne 'index.html') { return $null }
    $slug = $parts[1]

    $d = $CD[$slug]
    if (-not $d) { Write-Host "  SKIP (no data): $slug"; return $null }

    # Extract from existing page
    $heroImgM  = [regex]::Match($html, "url\('(https?://[^']+)'\)")
    $heroImg   = $heroImgM.Groups[1].Value
    $heroStyle = if ($heroImg) {
        "background-image:linear-gradient(180deg,rgba(5,15,24,.04),rgba(5,15,24,.58)),linear-gradient(90deg,rgba(5,15,24,.58),rgba(5,15,24,.12) 66%),url('$heroImg')"
    } else { "background:linear-gradient(135deg,#0d2137,#1a5c8a)" }

    $kicker = [regex]::Match($html, 'class="kicker">([^<]+)<').Groups[1].Value.Trim()
    if (-not $kicker) { $kicker = "Country in North America" }

    $introM = [regex]::Match($html, 'class="hero-text">([^<]+)<')
    $intro  = if ($introM.Success) { $introM.Groups[1].Value.Trim() } else { $d.intro }

    $capM    = [regex]::Match($html, 'Capital.*?href="([^"]+)">([^<]+)</a>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $capLink = $capM.Groups[1].Value.Trim()
    $capName = $capM.Groups[2].Value.Trim()

    $lang = [regex]::Match($html, 'Language</span><strong>([^<]+)</strong>').Groups[1].Value.Trim()
    $curr = [regex]::Match($html, 'Currency</span><strong>([^<]+)</strong>').Groups[1].Value.Trim()
    $pop  = [regex]::Match($html, 'Population</span><strong>([^<]+)</strong>').Groups[1].Value.Trim()

    $capStat = if ($capLink) {
        "          <div class=`"hero-stat`"><span>Capital</span><strong><a class=`"value-link`" href=`"$capLink`">$capName</a></strong></div>`n"
    } elseif ($capName) {
        "          <div class=`"hero-stat`"><span>Capital</span><strong>$capName</strong></div>`n"
    } else { '' }

    # City mini-grid
    $cityMs  = [regex]::Matches($html, '<a class="mini-tile" href="([^"]+)"><strong>([^<]+)</strong></a>')
    $cityGrid = ''
    foreach ($m in $cityMs) { $cityGrid += "          <a class=`"mini-tile`" href=`"$($m.Groups[1].Value)`"><strong>$($m.Groups[2].Value)</strong></a>`n" }
    $citySection = if ($cityGrid) {
        "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Cities</h2>`n        <div class=`"mini-grid`">`n$cityGrid        </div>`n      </article>`n"
    } else { '' }

    # Events
    $evtMs   = [regex]::Matches($html, 'class="event-card" href="([^"]+)".*?class="event-date">([^<]+)</span><strong>([^<]+)</strong>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $evtCards = ''
    foreach ($m in $evtMs) { $evtCards += "          <a class=`"event-card`" href=`"$($m.Groups[1].Value)`"><div class=`"event-body`"><span class=`"event-date`">$($m.Groups[2].Value.Trim())</span><strong>$($m.Groups[3].Value.Trim())</strong></div></a>`n" }
    $evtSection = if ($evtCards) {
        "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Upcoming Events</h2>`n        <div class=`"event-strip`">`n$evtCards        </div>`n      </article>`n"
    } else { '' }

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
    foreach ($peak in $d.m) { $mtn += "          <div class=`"mini-tile`"><div class=`"mini-photo`" style=`"background:linear-gradient(135deg,#0d3a52,#1a6080)`"></div><strong>$($peak[0])</strong><span>$($peak[1])</span></div>`n" }
    $mtn += "        </div>`n      </article>`n"

    # Religion
    $rel  = "      <article class=`"card span-7`">`n        <h2 class=`"card-title`">Religion (est.)</h2>`n        <div class=`"pie-wrap`">`n          <div class=`"pie`"></div>`n          <ul class=`"legend`">`n"
    foreach ($r in $d.rl) { $rel += "            <li><span><i style=`"--swatch:$($r[2])`"></i>$($r[0])</span><strong>$($r[1])</strong></li>`n" }
    $rel += "          </ul>`n        </div>`n      </article>`n"

    # Why Visit
    $wv  = "      <article class=`"card span-12`">`n        <h2 class=`"card-title`">Why Visit $title?</h2>`n        <div class=`"icon-grid`">`n"
    foreach ($item in $d.wv) { $wv += "          <div class=`"icon-tile`"><strong>$($item[0])</strong><span>$($item[1])</span></div>`n" }
    $wv += "        </div>`n      </article>`n"

    # Cities bar-list
    $cb  = "      <article class=`"card span-6`">`n        <h2 class=`"card-title`">Top 3 Cities by Population</h2>`n        <div class=`"bar-list`">`n"
    foreach ($c in $d.ci) { $cb += "          <div class=`"bar-row`"><span>$($c[0])</span><div class=`"bar-track`"><i class=`"bar-fill`" style=`"--value:$($c[2])%`"></i></div><strong>$($c[1])</strong></div>`n" }
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
    <a class="nav-back" href="../index.html" title="Back to North America" aria-label="Back to North America">$BACK_ICON<span>North America</span></a>
    <a class="nav-pill" href="../index.html">North America</a>
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
# Main loop
# ─────────────────────────────────────────────
$files = Get-ChildItem "$locRoot\north-america" -Recurse -Filter "index.html" | Where-Object {
    $rel   = $_.FullName.Substring($locRoot.Length + 1)
    $parts = $rel.Split('\')
    $parts.Length -eq 3
}

$converted = 0; $skipped = 0; $errors = 0

foreach ($f in $files) {
    try {
        $result = Build-NAPage $f.FullName
        if ($result) {
            [System.IO.File]::WriteAllText($f.FullName, $result, (New-Object System.Text.UTF8Encoding $false))
            $converted++
            Write-Host "  OK: $($f.FullName.Substring($locRoot.Length + 1))"
        } else { $skipped++ }
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
