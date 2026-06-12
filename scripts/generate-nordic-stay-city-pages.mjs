import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://one-sliders.com';
const bookingClick = 'https://www.jdoqocy.com/click-101771061-17293132?url=';
const cssVersion = 'nordic-stay-cities-20260612';
const coreVersion = 'weather-dynamic-20260612';

const countries = {
  denmark: country('denmark', 'Denmark', 'europe', 'Europe', 'Danish krone', 'Danish', 'CET (UTC+1)', 'Copenhagen'),
  sweden: country('sweden', 'Sweden', 'europe', 'Europe', 'Swedish krona', 'Swedish', 'CET (UTC+1)', 'Stockholm'),
  norway: country('norway', 'Norway', 'europe', 'Europe', 'Norwegian krone', 'Norwegian', 'CET (UTC+1)', 'Oslo'),
  finland: country('finland', 'Finland', 'europe', 'Europe', 'euro', 'Finnish, Swedish', 'EET (UTC+2)', 'Helsinki'),
  iceland: country('iceland', 'Iceland', 'europe', 'Europe', 'Icelandic krona', 'Icelandic', 'GMT (UTC+0)', 'Reykjavík'),
  'faroe-islands': country('faroe-islands', 'Faroe Islands', 'europe', 'Europe', 'Danish krone', 'Faroese, Danish', 'WET (UTC+0)', 'Tórshavn'),
  greenland: country('greenland', 'Greenland', 'north-america', 'North America', 'Danish krone', 'Greenlandic, Danish', 'UTC-1 to UTC-4', 'Nuuk')
};

const cities = [
  c('copenhagen', 'Copenhagen', 'denmark', 'Capital city and design base on the Oresund', 'Capital Region', '~660,000 city', 'Oresund gateway', 'Design, canals & food', 55.6761, 12.5683, ['Indre By', 'Nyhavn', 'Vesterbro', 'Norrebrogade / Norrebro', 'Frederiksberg', 'Orestad'], ['Copenhagen Airport (CPH)'], ['Nyhavn', 'Tivoli Gardens', 'The Little Mermaid', 'Christiansborg Palace', 'Rosenborg Castle', 'Copenhagen harbour baths']),
  c('stockholm', 'Stockholm', 'sweden', 'Island capital with museums, ferries and archipelago trips', 'Stockholm County', '~990,000 city', 'Baltic capital hub', 'Archipelago, old town & design', 59.3293, 18.0686, ['Norrmalm', 'Gamla Stan', 'Sodermalm', 'Ostermalm', 'Djurgarden', 'Solna'], ['Stockholm Arlanda Airport (ARN)', 'Stockholm Bromma Airport (BMA)'], ['Gamla Stan', 'Vasa Museum', 'Stockholm archipelago', 'ABBA The Museum', 'Royal Palace', 'Fotografiska']),
  c('oslo', 'Oslo', 'norway', 'Fjord capital with museums, forest access and event venues', 'Oslo region', '~720,000 city', 'Oslofjord base', 'Fjord, culture & forest', 59.9139, 10.7522, ['Sentrum', 'Aker Brygge', 'Grunerlokka', 'Majorstuen', 'Bjorvika', 'Gardermoen airport area'], ['Oslo Airport (OSL)'], ['Oslo Opera House', 'Akershus Fortress', 'Vigeland Park', 'Munch Museum', 'Oslofjord', 'Holmenkollen']),
  c('helsinki', 'Helsinki', 'finland', 'Seaside capital for design, islands, sauna and events', 'Uusimaa', '~680,000 city', 'Gulf of Finland hub', 'Design, sauna & islands', 60.1699, 24.9384, ['Kluuvi', 'Kamppi', 'Punavuori', 'Kallio', 'Katajanokka', 'Pasila'], ['Helsinki Airport (HEL)'], ['Helsinki Cathedral', 'Suomenlinna', 'Market Square', 'Design District', 'Oodi Library', 'Loyly sauna']),
  c('bergen', 'Bergen', 'norway', 'West Norway fjord city between mountains and harbour', 'Vestland', '~290,000 municipality', 'Fjord gateway', 'Bryggen, mountains & rain', 60.39299, 5.32415, ['Bryggen / Vagen', 'Sentrum', 'Nordnes', 'Sandviken', 'Minde', 'Flesland airport area'], ['Bergen Airport Flesland (BGO)'], ['Bryggen', 'Floyen', 'Ulriken', 'Fish Market', 'Bergenhus Fortress', 'Fjord cruises']),
  c('reykjavik', 'Reykjavík', 'iceland', 'Compact Iceland capital for culture, pools and road trips', 'Capital Region', '~140,000 city', 'Iceland base', 'Colourful streets & geothermal trips', 64.1466, -21.9426, ['Midlborg', 'Laugavegur', 'Old Harbour', 'Vesturbaer', 'Hlidar', 'Keflavik airport area'], ['Keflavik International Airport (KEF)', 'Reykjavik Domestic Airport (RKV)'], ['Hallgrimskirkja', 'Harpa', 'Sun Voyager', 'Old Harbour', 'Sky Lagoon', 'Golden Circle trips']),
  c('tromso', 'Tromsø', 'norway', 'Arctic city for northern lights, mountains and polar culture', 'Troms', '~78,000 municipality', 'Arctic Norway hub', 'Aurora, fjords & cable car', 69.6492, 18.9553, ['Tromsoya centre', 'Storgata', 'Tromsdalen', 'Telegrafbukta', 'Kvaloya', 'Airport area'], ['Tromso Airport (TOS)'], ['Arctic Cathedral', 'Fjellheisen cable car', 'Polaria', 'Northern lights tours', 'Tromso Bridge', 'Whale season trips']),
  c('rovaniemi', 'Rovaniemi', 'finland', 'Lapland capital on the Arctic Circle', 'Lapland', '~65,000 municipality', 'Arctic Circle base', 'Santa Village & winter trips', 66.5039, 25.7294, ['City centre', 'Santa Claus Village', 'Ounasvaara', 'Riverside', 'Airport area'], ['Rovaniemi Airport (RVN)'], ['Santa Claus Village', 'Arktikum', 'Arctic Circle', 'Ounasvaara', 'Kemijoki riverside', 'Northern lights tours']),
  c('aarhus', 'Aarhus', 'denmark', 'Jutland city for museums, food and waterfront culture', 'Central Denmark', '~370,000 municipality', 'Jutland city break', 'Museums, Latin Quarter & harbour', 56.1629, 10.2039, ['Latin Quarter', 'Aarhus C', 'Frederiksbjerg', 'Aarhus O', 'Marselisborg', 'Aarhus airport area'], ['Aarhus Airport (AAR)', 'Billund Airport (BLL)'], ['ARoS', 'Den Gamle By', 'Moesgaard Museum', 'Dokk1', 'Aarhus O', 'Marselisborg Palace']),
  c('stavanger', 'Stavanger', 'norway', 'Southwest Norway harbour city near Lysefjord', 'Rogaland', '~150,000 municipality', 'Lysefjord base', 'Old town, fjords & energy city', 58.97, 5.7331, ['Stavanger centre', 'Gamle Stavanger', 'Ostre Bydel', 'Sola', 'Sandnes', 'Jorpeland'], ['Stavanger Airport Sola (SVG)'], ['Gamle Stavanger', 'Norwegian Petroleum Museum', 'Lysefjord', 'Preikestolen trips', 'Ovre Holmegate', 'Sola beach']),
  c('gothenburg', 'Gothenburg', 'sweden', 'West coast city with trams, seafood and islands', 'Vastra Gotaland', '~600,000 city', 'West Sweden gateway', 'Seafood, canals & archipelago', 57.7089, 11.9746, ['Centrum', 'Haga', 'Linnestaden', 'Avenyn', 'Eriksberg', 'Landvetter airport area'], ['Goteborg Landvetter Airport (GOT)'], ['Liseberg', 'Haga', 'Universeum', 'Gothenburg archipelago', 'Feskekorka', 'Avenyn']),
  c('malmo', 'Malmö', 'sweden', 'Oresund city linked by bridge to Copenhagen', 'Skane', '~360,000 city', 'Oresund rail hub', 'Bridge, parks & food', 55.605, 13.0038, ['Gamla Staden', 'Mollan', 'Vastra Hamnen', 'Triangeln', 'Hyllie', 'Limhamn'], ['Copenhagen Airport (CPH)', 'Malmo Airport (MMX)'], ['Turning Torso', 'Oresund Bridge', 'Lilla Torg', 'Ribersborg beach', 'Malmo Castle', 'Folkets Park']),
  c('trondheim', 'Trondheim', 'norway', 'Historic Norway city around Nidaros Cathedral and the river', 'Trondelag', '~215,000 municipality', 'Central Norway base', 'Cathedral, river & students', 63.4305, 10.3951, ['Midtbyen', 'Bakklandet', 'Solsiden', 'Ila', 'Lade', 'Vaernes airport area'], ['Trondheim Airport Vaernes (TRD)'], ['Nidaros Cathedral', 'Bakklandet', 'Old Town Bridge', 'Kristiansten Fortress', 'Solsiden', 'NTNU campus']),
  c('turku', 'Turku', 'finland', 'Old Finnish capital with riverfront and archipelago ferries', 'Southwest Finland', '~205,000 city', 'Archipelago Sea gateway', 'Castle, river & ferries', 60.4518, 22.2666, ['City centre', 'Aurajoki riverfront', 'Port of Turku', 'Kupittaa', 'Ruissalo'], ['Turku Airport (TKU)', 'Helsinki Airport (HEL)'], ['Turku Castle', 'Turku Cathedral', 'Aura River', 'Forum Marinum', 'Ruissalo', 'Archipelago Trail']),
  c('flam', 'Flåm', 'norway', 'Tiny fjord village on the Aurlandsfjord', 'Vestland', '~350 village', 'Sognefjord rail stop', 'Fjord railway & cruises', 60.861, 7.1139, ['Flam village', 'Aurland', 'Gudvangen', 'Myrdal rail route', 'Undredal'], ['Bergen Airport Flesland (BGO)', 'Sogndal Airport (SOG)'], ['Flam Railway', 'Aurlandsfjord', 'Naeroyfjord cruises', 'Stegastein viewpoint', 'Brekke waterfall', 'Fjord village']),
  c('alesund', 'Ålesund', 'norway', 'Art Nouveau coastal town at the edge of fjord country', 'More og Romsdal', '~59,000 municipality', 'Northwest coast base', 'Art Nouveau, islands & fjords', 62.4722, 6.1495, ['Alesund centre', 'Aspoya', 'Norroya', 'Hessa', 'Moatown', 'Vigra airport area'], ['Alesund Airport Vigra (AES)'], ['Aksla viewpoint', 'Art Nouveau Centre', 'Brosundet', 'Atlantic Sea-Park', 'Geirangerfjord trips', 'Sunnmore Museum']),
  c('kristiansand', 'Kristiansand', 'norway', 'South Norway coastal city with beaches and family trips', 'Agder', '~116,000 municipality', 'South coast base', 'Beaches, old town & zoo', 58.1467, 7.9956, ['Kvadraturen', 'Bystranda', 'Posebyen', 'Fiskebrygga', 'Hamresanden', 'Dyreparken area'], ['Kristiansand Airport Kjevik (KRS)'], ['Posebyen', 'Bystranda', 'Fiskebrygga', 'Kristiansand Zoo', 'Ravnedalen', 'Odderoya']),
  c('bodo', 'Bodø', 'norway', 'Northern Norway city for Saltstraumen and Lofoten access', 'Nordland', '~54,000 municipality', 'Lofoten gateway', 'Coast, aviation & tidal current', 67.2804, 14.4049, ['Bodo centre', 'Harbour area', 'Ronnasletta', 'Morkved', 'Saltstraumen'], ['Bodo Airport (BOO)'], ['Saltstraumen', 'Norwegian Aviation Museum', 'Bodo harbour', 'Mount Ronvik', 'Kjerringoy', 'Lofoten ferry']),
  c('alta', 'Alta', 'norway', 'Arctic town for rock art, aurora and Finnmark trips', 'Finnmark', '~21,000 municipality', 'Finnmark base', 'Rock art & northern lights', 69.9689, 23.2716, ['Alta centre', 'Bossekop', 'Elvebakken', 'Komsa', 'Sorrisniva'], ['Alta Airport (ALF)'], ['Alta Museum rock art', 'Northern Lights Cathedral', 'Sorrisniva', 'Alta Canyon', 'Komsa mountain', 'Finnmark Plateau trips']),
  c('narvik', 'Narvik', 'norway', 'Ofoten fjord and mountain town on the iron ore railway', 'Nordland', '~21,000 municipality', 'Ofoten rail base', 'Fjord, railway & skiing', 68.4385, 17.4273, ['Narvik centre', 'Fagernesfjellet', 'Ankenes', 'Ofotbanen route', 'Harbour area'], ['Harstad/Narvik Airport Evenes (EVE)'], ['Narvikfjellet', 'Ofoten Railway', 'Narvik War Museum', 'Rombaksfjord', 'Polar Park trips', 'Iron ore harbour']),
  c('uppsala', 'Uppsala', 'sweden', 'University city north of Stockholm with cathedral and history', 'Uppsala County', '~245,000 municipality', 'University city', 'Cathedral, university & gardens', 59.8586, 17.6389, ['City centre', 'Fyrisan riverfront', 'University area', 'Gamla Uppsala', 'Kungsangen'], ['Stockholm Arlanda Airport (ARN)'], ['Uppsala Cathedral', 'Uppsala University', 'Gamla Uppsala', 'Linnaeus Garden', 'Uppsala Castle', 'Fyrisan river']),
  c('visby', 'Visby', 'sweden', 'Walled medieval town on Gotland', 'Gotland', '~24,000 urban area', 'Baltic island base', 'Medieval walls & summer festivals', 57.6348, 18.2948, ['Inside the city wall', 'Ostercentrum', 'Harbour area', 'Snack', 'Kneippbyn'], ['Visby Airport (VBY)'], ['Visby city wall', 'Stora Torget', 'Botanical Garden', 'Gotland Museum', 'Almedalen', 'Medieval Week']),
  c('helsingborg', 'Helsingborg', 'sweden', 'Oresund coastal city facing Denmark', 'Skane', '~150,000 municipality', 'Oresund ferry base', 'Coast, castle tower & ferries', 56.0465, 12.6945, ['Centrum', 'Norra Hamnen', 'Soder', 'Ramlosa', 'Sofiero area'], ['Copenhagen Airport (CPH)', 'Angelholm-Helsingborg Airport (AGH)'], ['Karnan', 'Sofiero Palace', 'Dunkers kulturhus', 'Oresund ferries', 'Tropical Beach', 'Ramlosa spring park']),
  c('kiruna', 'Kiruna', 'sweden', 'Arctic mining town being moved under northern lights', 'Norrbotten', '~23,000 municipality', 'Swedish Lapland base', 'Aurora, Icehotel & mountains', 67.8558, 20.2253, ['Kiruna centre', 'New city centre', 'Luossavaara', 'Jukkasjarvi', 'Abisko route'], ['Kiruna Airport (KRN)'], ['Kiruna Church', 'Icehotel Jukkasjarvi', 'LKAB mine tours', 'Abisko National Park trips', 'Northern lights', 'Esrange area']),
  c('orebro', 'Örebro', 'sweden', 'Castle city between Stockholm and Gothenburg', 'Orebro County', '~160,000 municipality', 'Central Sweden base', 'Castle, lake & city parks', 59.2753, 15.2134, ['Orebro centre', 'Wadkoping', 'Svartan river', 'Gustavsvik', 'Adolfsberg'], ['Orebro Airport (ORB)', 'Stockholm Arlanda Airport (ARN)'], ['Orebro Castle', 'Wadkoping', 'Stadsparken', 'Gustavsvik', 'Svampen water tower', 'Hjalmaren lake']),
  c('linkoping', 'Linköping', 'sweden', 'University and aviation city in Ostergotland', 'Ostergotland', '~167,000 municipality', 'Southern Sweden rail stop', 'Aviation, cathedral & old town', 58.4108, 15.6214, ['City centre', 'Tannefors', 'Valla', 'Gamla Linkoping', 'Mjardevi'], ['Linkoping City Airport (LPI)', 'Stockholm Skavsta Airport (NYO)'], ['Gamla Linkoping', 'Linkoping Cathedral', 'Air Force Museum', 'Tradgardsforeningen', 'Kinda Canal', 'University area']),
  c('jonkoping', 'Jönköping', 'sweden', 'Lake Vattern city with fairs and matchstick history', 'Jonkoping County', '~145,000 municipality', 'Lake Vattern base', 'Lakefront, fairs & museums', 57.7826, 14.1618, ['City centre', 'East centre', 'Huskvarna', 'Rosenlund', 'Elmia area'], ['Jonkoping Airport (JKG)', 'Gothenburg Landvetter Airport (GOT)'], ['Lake Vattern', 'Match Museum', 'Sofiakyrkan', 'Elmia', 'Huskvarna Museum', 'Rosenlundsbadet']),
  c('odense', 'Odense', 'denmark', 'Funen city known for Hans Christian Andersen', 'Funen', '~183,000 city', 'Funen rail hub', 'Fairy tales, old streets & zoo', 55.4038, 10.4024, ['Odense C', 'Hans Christian Andersen quarter', 'Munke Mose', 'Skibhus', 'Fruens Boge'], ['Billund Airport (BLL)', 'Copenhagen Airport (CPH)'], ['Hans Christian Andersen House', 'Odense Zoo', 'Brandts', 'Funen Village', 'Odense Cathedral', 'Munke Mose']),
  c('aalborg', 'Aalborg', 'denmark', 'North Jutland city by the Limfjord', 'North Jutland', '~120,000 city', 'Limfjord base', 'Waterfront, street art & Viking history', 57.0488, 9.9217, ['Aalborg centre', 'Waterfront', 'Vestbyen', 'Osterbro', 'Airport area'], ['Aalborg Airport (AAL)'], ['Aalborg waterfront', 'Kunsten', 'Lindholm Hoje', 'Jomfru Ane Gade', 'Utzon Center', 'Aalborg Zoo']),
  c('roskilde', 'Roskilde', 'denmark', 'Cathedral and Viking ship city west of Copenhagen', 'Zealand', '~52,000 city', 'Copenhagen day-trip base', 'Cathedral, fjord & festival', 55.6415, 12.0803, ['Roskilde centre', 'Harbour area', 'Musicon', 'Trekroner', 'Roskilde Fjord'], ['Copenhagen Airport (CPH)'], ['Roskilde Cathedral', 'Viking Ship Museum', 'Roskilde Festival site', 'Roskilde Fjord', 'Musicon', 'Ledreborg trips']),
  c('skagen', 'Skagen', 'denmark', 'Northern tip town where two seas meet', 'North Jutland', '~7,500 town', 'Top of Denmark base', 'Light, beaches & artists', 57.7209, 10.5839, ['Skagen town', 'Gl. Skagen', 'Harbour area', 'Grenen route', 'Kandestederne'], ['Aalborg Airport (AAL)'], ['Grenen', 'Skagen Museum', 'Rabak Mile', 'Vippefyret', 'Skagen harbour', 'Old Skagen']),
  c('billund', 'Billund', 'denmark', 'Family travel hub built around LEGO and airport access', 'South Denmark', '~7,000 town', 'Family trip hub', 'LEGOLAND & airport', 55.7284, 9.1124, ['Billund centre', 'LEGOLAND area', 'Lalandia area', 'Airport area', 'Grindsted'], ['Billund Airport (BLL)'], ['LEGOLAND Billund', 'LEGO House', 'Lalandia', 'WOW Park', 'Givskud Zoo trips', 'Airport gateway']),
  c('helsingor', 'Helsingør', 'denmark', 'Oresund town with Kronborg Castle', 'Zealand', '~47,000 city', 'North Zealand base', 'Castle, ferries & Shakespeare', 56.0361, 12.6136, ['Helsingor centre', 'Kronborg area', 'Harbour area', 'Snekkersten', 'Espergaerde'], ['Copenhagen Airport (CPH)'], ['Kronborg Castle', 'M/S Maritime Museum', 'Oresund ferries', 'Culture Yard', 'Helsingor old town', 'Louisiana Museum trips']),
  c('tampere', 'Tampere', 'finland', 'Finnish lake city famous for sauna culture', 'Pirkanmaa', '~255,000 city', 'Inland Finland hub', 'Sauna, rapids & museums', 61.4978, 23.761, ['City centre', 'Tammela', 'Finlayson', 'Pyynikki', 'Kaleva', 'Hervanta'], ['Tampere-Pirkkala Airport (TMP)', 'Helsinki Airport (HEL)'], ['Finlayson area', 'Pyynikki tower', 'Vapriikki', 'Nasinneula', 'Public saunas', 'Tammerkoski rapids']),
  c('oulu', 'Oulu', 'finland', 'Northern Finland tech and seaside city', 'North Ostrobothnia', '~215,000 city', 'Bothnian Bay base', 'Tech, islands & winter cycling', 65.0121, 25.4651, ['City centre', 'Rotuaari', 'Pikisaari', 'Nallikari', 'Tuira', 'Linnanmaa'], ['Oulu Airport (OUL)'], ['Market Square Policeman', 'Nallikari beach', 'Pikisaari', 'Tietomaa', 'Hupisaaret Islands', 'Winter cycling']),
  c('vaasa', 'Vaasa', 'finland', 'Bilingual coastal city near the Kvarken Archipelago', 'Ostrobothnia', '~68,000 city', 'Kvarken base', 'Archipelago, energy & coast', 63.0951, 21.6165, ['City centre', 'Inner harbour', 'Palosaari', 'Vaskiluoto', 'Sundom'], ['Vaasa Airport (VAA)'], ['Kvarken Archipelago', 'Tropiclandia', 'Old Vaasa', 'Ostrobothnian Museum', 'Inner harbour', 'Replot Bridge']),
  c('kuopio', 'Kuopio', 'finland', 'Lakeland city known for Puijo tower and kalakukko', 'North Savo', '~125,000 city', 'Finnish Lakeland base', 'Lake views, tower & market hall', 62.8924, 27.677, ['City centre', 'Harbour area', 'Puijo', 'Niirala', 'Saaristokaupunki'], ['Kuopio Airport (KUO)'], ['Puijo Tower', 'Kuopio Market Hall', 'Lake Kallavesi', 'Harbour area', 'Rauhalahti', 'Tahko trips']),
  c('jyvaskyla', 'Jyväskylä', 'finland', 'University city in Finnish Lakeland with Alvar Aalto design', 'Central Finland', '~148,000 city', 'Lakeland event base', 'Aalto, lakes & rallies', 62.2426, 25.7473, ['City centre', 'Harju', 'Lutakko', 'Mattilanniemi', 'Kuokkala'], ['Jyvaskyla Airport (JYV)', 'Helsinki Airport (HEL)'], ['Alvar Aalto Museum', 'Harju Ridge', 'Lutakko harbour', 'Lake Jyvasjarvi', 'Saynatsalo Town Hall', 'Rally Finland roads']),
  c('akureyri', 'Akureyri', 'iceland', 'North Iceland town by Eyjafjordur', 'North Iceland', '~20,000 town', 'North Iceland base', 'Fjord, gardens & whale trips', 65.6885, -18.1262, ['Akureyri centre', 'Harbour area', 'Oddeyri', 'Glerarhverfi', 'Hlidarfjall area'], ['Akureyri Airport (AEY)', 'Keflavik International Airport (KEF)'], ['Akureyri Church', 'Botanical Garden', 'Eyjafjordur', 'Hlidarfjall', 'Christmas House', 'Godafoss trips']),
  c('selfoss', 'Selfoss', 'iceland', 'South Iceland service town on the Ring Road', 'South Iceland', '~10,000 town', 'Golden Circle road base', 'Waterfalls, horses & road trips', 63.9331, -20.9971, ['Selfoss centre', 'Old Dairy area', 'Olfusa riverfront', 'Eyrarbakki coast', 'Hveragerdi'], ['Keflavik International Airport (KEF)', 'Reykjavik Domestic Airport (RKV)'], ['Olfusa river', 'Selfoss town centre', 'Golden Circle trips', 'Kerid crater', 'Eyrarbakki', 'Hveragerdi hot springs']),
  c('husavik', 'Húsavík', 'iceland', 'North Iceland harbour town known for whale watching', 'North Iceland', '~2,500 town', 'Skjalfandi Bay base', 'Whales, harbour & geothermal baths', 66.0449, -17.3389, ['Harbour area', 'Town centre', 'GeoSea area', 'Lake Myvatn route', 'Tjornes'], ['Akureyri Airport (AEY)', 'Husavik Airport (HZK)'], ['Whale watching harbour', 'Husavik Whale Museum', 'GeoSea baths', 'Husavik church', 'Lake Myvatn trips', 'Asbyrgi canyon trips']),
  c('isafjordur', 'Ísafjörður', 'iceland', 'Westfjords town between steep mountains and harbour', 'Westfjords', '~2,700 town', 'Westfjords base', 'Fjords, hikes & old timber houses', 66.0748, -23.1349, ['Town centre', 'Harbour area', 'Hnifsdalur', 'Bolungarvik', 'Sudureyri'], ['Isafjordur Airport (IFJ)', 'Keflavik International Airport (KEF)'], ['Old town', 'Westfjords Heritage Museum', 'Naustahvilft', 'Dynjandi trips', 'Hornstrandir tours', 'Isafjardardjup']),
  c('torshavn', 'Tórshavn', 'faroe-islands', 'Small North Atlantic capital with turf roofs and harbour lanes', 'Streymoy', '~23,000 municipality', 'Faroe Islands base', 'Tinganes, harbour & island trips', 62.0079, -6.7909, ['Tinganes', 'Vestaravag', 'City centre', 'Hoyvik', 'Argir', 'Airport route'], ['Vagar Airport (FAE)'], ['Tinganes', 'Torshavn Cathedral', 'Nordic House', 'Skansin Fort', 'Harbour lanes', 'Kirkjubour trips']),
  c('klaksvik', 'Klaksvík', 'faroe-islands', 'Northern Faroes fishing town between steep islands', 'Bordoy', '~5,000 town', 'Northern Isles base', 'Fishing harbour & mountain views', 62.2266, -6.589, ['Klaksvik centre', 'Harbour area', 'Vidareidi route', 'Kunoy route', 'Nordoyri'], ['Vagar Airport (FAE)'], ['Christianskirkjan', 'Klaksvik harbour', 'Kalsoy ferry', 'Kunoy views', 'Vidareidi trips', 'Northern Isles tunnels']),
  c('nuuk', 'Nuuk', 'greenland', 'Greenland capital with fjords, culture and Arctic city life', 'Sermersooq', '~20,000 city', 'Greenland capital hub', 'Fjord, museums & colourful houses', 64.1835, -51.7216, ['Nuuk centre', 'Old Nuuk', 'Nuussuaq', 'Qinngorput', 'Harbour area'], ['Nuuk Airport (GOH)'], ['Nuuk fjord', 'Greenland National Museum', 'Katuaq', 'Colonial Harbour', 'Myggedalen', 'Qornok trips']),
  c('ilulissat', 'Ilulissat', 'greenland', 'Disko Bay town beside the UNESCO icefjord', 'Avannaata', '~4,700 town', 'Disko Bay base', 'Icefjord, icebergs & sled dogs', 69.2198, -51.0986, ['Town centre', 'Harbour area', 'Sermermiut route', 'Hotel Arctic area', 'Airport area'], ['Ilulissat Airport (JAV)'], ['Ilulissat Icefjord', 'Sermermiut', 'Disko Bay', 'Iceberg boat tours', 'Knud Rasmussen Museum', 'Sled dog areas']),
  c('geiranger', 'Geiranger', 'norway', 'Fjord village below waterfalls and hairpin roads', 'More og Romsdal', '~250 village', 'Geirangerfjord base', 'UNESCO fjord & waterfalls', 62.1015, 7.2057, ['Geiranger village', 'Fjordside hotels', 'Flydalsjuvet route', 'Eagle Road', 'Hellesylt ferry route'], ['Alesund Airport Vigra (AES)'], ['Geirangerfjord', 'Seven Sisters waterfall', 'Flydalsjuvet', 'Eagle Road', 'Dalsnibba', 'Fjord cruises']),
  c('longyearbyen', 'Longyearbyen', 'norway', 'Svalbard settlement for Arctic wilderness and polar night', 'Svalbard', '~2,500 settlement', 'High Arctic base', 'Polar night, glaciers & mining history', 78.2232, 15.6267, ['Longyearbyen centre', 'Nybyen', 'Haugen', 'Adventdalen', 'Airport area'], ['Svalbard Airport Longyear (LYR)'], ['Svalbard Museum', 'Adventfjorden', 'Mine 3', 'Global Seed Vault exterior', 'Dog sledding routes', 'Northern lights season']),
  c('svolvaer', 'Svolvær', 'norway', 'Lofoten harbour town below steep peaks', 'Nordland', '~4,700 town', 'Lofoten base', 'Harbour, peaks & fishing villages', 68.2342, 14.5683, ['Svolvaer centre', 'Harbour area', 'Svinoya', 'Kabelvag', 'Henningsvaer route'], ['Svolvaer Airport (SVJ)', 'Harstad/Narvik Airport Evenes (EVE)'], ['Svolvaer Goat', 'Lofoten War Museum', 'Svinoya', 'Trollfjord trips', 'Kabelvag', 'Henningsvaer trips']),
  c('abisko', 'Abisko', 'sweden', 'Lapland village beside national park and aurora skies', 'Norrbotten', '~100 village', 'Arctic trail base', 'Aurora, national park & mountain station', 68.3499, 18.8315, ['Abisko Turiststation', 'Abisko Ostra', 'Lake Tornetrask', 'Kungsleden trailhead', 'Bjrkliden route'], ['Kiruna Airport (KRN)'], ['Abisko National Park', 'Aurora Sky Station', 'Kungsleden trail', 'Tornetrask', 'Lapporten', 'STF mountain station'])
];

const existingImageSlugs = new Set([
  'copenhagen',
  'stockholm',
  'gothenburg',
  'oslo',
  'helsinki',
  'reykjavik'
]);

function country(slug, name, continent, continentName, currency, language, timeZone, capital) {
  return { slug, name, continent, continentName, currency, language, timeZone, capital };
}

function c(slug, name, countrySlug, kicker, region, population, distance, known, lat, lon, areas, airports, highlights) {
  return { slug, name, countrySlug, kicker, region, population, distance, known, coordinates: { lat, lon }, areas, airports, highlights };
}

function html(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function slugify(value) {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function countryDir(countryInfo) {
  return path.join(root, 'content/locations', countryInfo.continent, countryInfo.slug);
}

function imageExists(countryInfo, fileName) {
  return fs.existsSync(path.join(countryDir(countryInfo), 'img', fileName));
}

function imageTag(countryInfo, city, index = null) {
  const dirUrl = `/content/locations/${countryInfo.continent}/${countryInfo.slug}`;
  if (index != null) {
    const seeBase = `${city.slug}-see-${index + 1}-mini`;
    if (imageExists(countryInfo, `${seeBase}.png`)) {
      return `<img src="${dirUrl}/img/${seeBase}.png" srcset="${dirUrl}/img/${seeBase}-200.webp 200w, ${dirUrl}/img/${seeBase}-400.webp 400w" sizes="(max-width:620px) 220px, 400px" alt="${html(city.name)} attraction thumbnail" loading="lazy" width="400" height="300">`;
    }
  }
  const cityMini = `${city.slug}-mini.png`;
  const imageSlug = imageExists(countryInfo, cityMini) ? city.slug : countryInfo.slug;
  const label = imageSlug === countryInfo.slug ? `${countryInfo.name} thumbnail` : `${city.name} thumbnail`;
  return `<img src="${dirUrl}/img/${imageSlug}-mini.png" srcset="${dirUrl}/img/${imageSlug}-mini-200.webp 200w, ${dirUrl}/img/${imageSlug}-mini-400.webp 400w" sizes="(max-width:620px) 220px, 400px" alt="${html(label)}" loading="lazy" width="400" height="300">`;
}

function countryUrl(countryInfo) {
  return `/content/locations/${countryInfo.continent}/${countryInfo.slug}/index.html`;
}

function relPrefix(countryInfo) {
  return countryInfo.continent === 'europe' ? '../../../../' : '../../../../';
}

function bookingHref(search) {
  const target = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(search).replaceAll('%20', '+')}`;
  return `${bookingClick}${encodeURIComponent(target)}`;
}

function sentence(text) {
  return String(text).split(/(?<=[.!?])\s+/)[0] || text;
}

function render(city) {
  const countryInfo = countries[city.countrySlug];
  const dirUrl = `/content/locations/${countryInfo.continent}/${countryInfo.slug}`;
  const title = `${city.name} Travel Guide - Where to Stay, Airports & Events`;
  const description = `Plan a ${city.name}, ${countryInfo.name} trip with sourced city context, stay areas, airports and Booking.com hotel links.`;
  const heroSlug = imageExists(countryInfo, `${city.slug}-hero.png`) ? city.slug : countryInfo.slug;
  const heroUrl = `${dirUrl}/img/${heroSlug}-hero.png`;
  const heroSrcset = `${dirUrl}/img/${heroSlug}-hero-400.webp 400w, ${dirUrl}/img/${heroSlug}-hero-768.webp 768w, ${dirUrl}/img/${heroSlug}-hero-1200.webp 1200w`;
  const heroWebp = `${dirUrl}/img/${heroSlug}-hero-1200.webp`;
  const pageUrl = `${siteBase}${dirUrl}/${city.slug}.html`;
  const extract = `${city.name} is a ${city.kicker.toLowerCase()} in ${countryInfo.name}, useful for ${city.highlights.slice(0, 3).join(', ')} and practical Nordic trip planning.`;
  const areaCards = city.areas.map((area) => `<div class="stay-area"><strong>${html(area)}</strong><p>${html(areaCopy(area, city))}</p><span>Best for: ${html(areaBest(area))}</span><a class="stay-card-link" href="${html(bookingHref(`${area}, ${city.name}, ${countryInfo.name}`))}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>`).join('');
  const airportRows = city.airports.map((airport) => `<li><strong>${html(airport)}</strong><span>${html(airportDistance(airport, city))}</span><p>${html(airportCopy(airport))}</p><a class="stay-card-link" href="${html(bookingHref(`${airport}, ${city.name}, ${countryInfo.name}`))}" target="_blank" rel="nofollow sponsored noopener">Compare nearby stays</a></li>`).join('');
  const hotelCards = [
    ['Central base', city.areas[0]],
    ['Food / nightlife', city.areas[1] || city.areas[0]],
    ['Availability', city.areas[2] || city.areas[0]],
    ['Event weeks', city.areas[3] || city.areas[0]]
  ].map(([tag, area]) => `<div class="stay-hotel-card"><span>${html(tag)}</span><strong>${html(area)}</strong><p>${html(hotelCopy(tag, city))}</p><a class="stay-card-link" href="${html(bookingHref(`${area}, ${city.name}, ${countryInfo.name}`))}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>`).join('');
  const attractions = city.highlights.slice(0, 6).map((item, index) => {
    return `<article class="destination-attraction-card">${imageTag(countryInfo, city, index)}<div><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div></article>`;
  }).join('');
  const experienceCards = city.highlights.slice(0, 6).map((item, i) => `<label class="destination-experience-card" for="${i % 2 === 0 ? 'view-see' : 'view-context'}" role="button" tabindex="0"><span>${html(experienceLabel(i))}</span><strong>${html(item)}</strong><p>${html(shortExperience(item))}</p></label>`).join('');
  const nearbyCards = city.areas.slice(0, 5).map((name, idx) => `<a class="destination-nearby-card" href="#stay-areas"><span>${idx === 0 ? 'Core' : 'Area'}</span><strong>${html(name)}</strong><p>${html(name)} is worth comparing when choosing where to sleep in ${html(city.name)}.</p></a>`).join('');
  const highlightCards = city.highlights.slice(0, 6).map((item, i) => `<div class="destination-highlight"><span>${html(experienceLabel(i))}</span><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div>`).join('');
  const weather = renderWeatherStrip(city, countryInfo);
  const parentImg = `/content/locations/${countryInfo.continent}/${countryInfo.slug}/img/${countryInfo.slug}-mini.png`;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${siteBase}/#organization`, name: 'Events calendar', url: `${siteBase}/`, logo: `${siteBase}/assets/icons/one-sliders-icon.svg` },
      { '@type': 'WebSite', '@id': `${siteBase}/#website`, url: `${siteBase}/`, name: 'Events calendar', publisher: { '@id': `${siteBase}/#organization` } },
      { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: title, description, inLanguage: 'en', image: `${siteBase}${heroUrl}`, isPartOf: { '@id': `${siteBase}/#website` }, publisher: { '@id': `${siteBase}/#organization` } }
    ],
    name: title,
    description
  });
  return `<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="../../../../assets/css/oneslider-core.css?v=${coreVersion}">
  <link rel="preload" as="image" href="${heroWebp}">
<script defer src="../../../../assets/js/oneslider-core.js?v=${coreVersion}"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="twitter:description" content="${html(description)}">
  <meta name="twitter:title" content="${html(title)}">
  <meta name="robots" content="index,follow">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:type" content="website">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:title" content="${html(title)}"><meta property="og:image" content="${siteBase}${heroUrl}">
  <meta name="description" content="${html(description)}">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}"><meta name="content-language" content="en">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=${cssVersion}">
<title>${html(title)}</title>
  <script type="application/ld+json">${jsonld}</script>
</head>
<body class="country-onepage city-page--southampton city-page--stay-template city-page--${city.slug}">
  ${nav(city, countryInfo)}
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="${html(city.name)} one-slide overview">
      <div class="country-brief__copy">
        <picture class="country-hero-image country-hero-image--clear" aria-hidden="true"><source srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" type="image/webp"><img srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" src="${heroUrl}" alt="" width="1200" height="630" loading="eager" decoding="async"></picture>
        <p class="kicker">${html(city.kicker)}</p>
        <h1 class="hero-title">${html(city.name)}</h1>
        <div class="destination-side-facts" aria-label="${html(city.name)} quick facts"><div class="destination-side-fact"><span>Country</span><strong>${html(countryInfo.name)}</strong></div><div class="destination-side-fact"><span>Region</span><strong>${html(city.region)}</strong></div><div class="destination-side-fact"><span>Population</span><strong>${html(city.population)}</strong></div><div class="destination-side-fact"><span>Trip role</span><strong>${html(city.distance)}</strong></div><div class="destination-side-fact destination-side-fact--wide"><span>Known for</span><strong>${html(city.known)}</strong></div></div>
        ${weather}
        <p class="hero-text">${html(extract)}</p>
<div class="destination-experience-grid">${experienceCards}</div><div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>City Snapshot</h2><div class="country-history-list"><div><time>Source</time><span>${html(sentence(extract))}</span></div><div><time>Stay</time><span>Compare ${html(city.areas.slice(0, 3).join(', '))} before booking; the best base depends on transit, event venue and nightly fees.</span></div><div><time>Access</time><span>${html(city.airports.join(' / '))} ${city.airports.length > 1 ? 'are useful airport options.' : 'is the main airport option listed for this page.'}</span></div><div><time>Image</time><span>City hero, mini and See-card images follow the same asset pattern as the Southampton and Vancouver stay pages.</span></div></div></div><a class="location-parent-card city-country-card" href="index.html" aria-label="Explore ${html(countryInfo.name)}"><img src="${parentImg}" srcset="${parentImg.replace('.png', '-200.webp')} 200w, ${parentImg.replace('.png', '-400.webp')} 400w" sizes="136px" alt="${html(countryInfo.name)} thumbnail" loading="lazy" width="400" height="300"><span>Part of ${html(countryInfo.name)}</span><strong>Explore more ${html(countryInfo.name)}</strong><em>More cities, stays and event bases across ${html(countryInfo.name)}.</em></a></div>
      </div>
      <div class="country-brief__panel">
        <section class="persona-tabs" aria-label="Choose ${html(city.name)} view">
          <input type="radio" name="${city.slug}-view" id="view-visit" checked>
          <input type="radio" name="${city.slug}-view" id="view-see">
          <input type="radio" name="${city.slug}-view" id="view-stay">
          <input type="radio" name="${city.slug}-view" id="view-nearby">
          <input type="radio" name="${city.slug}-view" id="view-events">
          <input type="radio" name="${city.slug}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose ${html(city.name)} outcome">
            <label for="view-visit" role="tab">Plan</label>
            <label for="view-see" role="tab">See</label>
            <label for="view-stay" role="tab">Visit</label>
            <label for="view-nearby" role="tab">Nearby</label>
            <label for="view-events" role="tab">Events</label>
            <label for="view-context" role="tab">Highlights</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div><h2>Trip facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>Country</span><strong>${html(countryInfo.name)}</strong></div><div class="fact-row"><span>Region</span><strong>${html(city.region)}</strong></div><div class="fact-row"><span>Main draw</span><strong>${html(city.known)}</strong></div><div class="fact-row"><span>Best base</span><strong>${html(city.areas[0])}</strong></div></div></div>
              <div><h2>Why go</h2><ul class="country-points"><li><strong>City context:</strong> ${html(sentence(extract))}</li><li><strong>Stay planning:</strong> Compare ${html(city.areas.slice(0, 3).join(', '))} before picking a hotel base.</li><li><strong>Booking check:</strong> Review taxes, local transport, parking and cancellation rules before paying.</li></ul></div>
            </div>
            <div class="country-panel-card"><h2>Planning questions</h2><div class="country-qa-list"><div><strong>What is ${html(city.name)}?</strong><span>${html(sentence(extract))}</span></div><div><strong>Where should I stay?</strong><span>Start with ${html(city.areas[0])}; compare ${html(city.areas.slice(1, 4).join(', '))} when price, nightlife or event access matters.</span></div><div><strong>Which airport should I check?</strong><span>${html(city.airports.join(' / '))}.</span></div><div><strong>What should I check before booking?</strong><span>Airport transfer time, seasonal demand, local transit, ferry or rail schedules and the exact event venue.</span></div></div></div>
          </div>
          <div class="persona-panel view-panel--see">
            <div class="country-panel-card"><h2>Worth seeing</h2><div class="destination-attraction-grid">${attractions}</div></div>
          </div>
          <div class="persona-panel view-panel--stay">
            <div class="stay-planner-layout">
              <nav class="stay-section-menu" aria-label="Stay planning sections"><a href="#stay-overview">Overview</a><a href="#stay-areas">Areas</a><a href="#stay-airports">Airports</a><a href="#stay-tips">Tips</a><a href="#stay-booking">Booking</a></nav>
              <div class="stay-section-stack">
                <div class="country-panel-card stay-overview-card" id="stay-overview"><h2>Stay Overview</h2><div class="stay-overview-grid stay-overview-grid--planning"><div class="stay-pill"><span>Planning focus</span><strong>Neighborhood fit, airport access, event timing and total nightly fees.</strong></div><div class="stay-pill"><span>Best first move</span><strong>Compare ${html(city.areas[0])} with one lower-price or quieter area.</strong></div><p>Planning a trip to ${html(city.name)}? Compare stay areas, airport access and event-week demand before booking.</p></div></div>
                <div class="country-panel-card" id="stay-areas"><h2>Best Areas to Stay</h2><div class="stay-area-grid">${areaCards}</div></div>
                <div class="country-panel-card" id="stay-airports"><h2>Airports</h2><ul class="stay-airports">${airportRows}</ul></div>
                <div class="country-panel-card" id="stay-tips"><h2>Travel Tips</h2><div class="stay-tip-grid"><div class="stay-tip"><strong>Best time to visit</strong><p>Check seasonal weather, daylight and major event calendars before locking in rates.</p></div><div class="stay-tip"><strong>Transport notes</strong><p>Choose a base around the trips you will repeat most: airport, harbour, station, venue, old town or nature route.</p></div><div class="stay-tip"><strong>Crowds</strong><p>Prices can jump around festivals, school holidays, cruise days, ski weeks and big sports weekends.</p></div><div class="stay-tip"><strong>Booking detail</strong><p>Compare total cost with taxes, breakfast, parking, ferry timing and cancellation terms.</p></div></div></div>
                <div class="country-panel-card"><h2>Hotel planning</h2><div class="stay-hotel-grid">${hotelCards}</div></div>
                <div class="country-panel-card stay-booking-card" id="stay-booking"><h2>Check Hotel Prices</h2><p>Compare accommodation options in and around ${html(city.name)}. Hotel availability and prices may vary depending on season and major events.</p><a class="stay-booking-button" href="${html(bookingHref(`${city.areas[0]}, ${city.name}, ${countryInfo.name}`))}" target="_blank" rel="nofollow sponsored noopener">Check hotels on Booking.com</a><p class="stay-affiliate-note">One-Sliders may earn a commission if you make a booking through Booking.com.</p></div>
              </div>
            </div>
          </div>
          <div class="persona-panel view-panel--nearby">
            <div class="country-panel-card"><h2>Nearby ideas</h2><div class="destination-nearby-grid">${nearbyCards}</div></div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>Upcoming events</h2><p class="country-empty is-visible">Use the category calendar for dated events near ${html(city.name)} while this city guide stays focused on trip planning.</p></div>
          </div>
          <div class="persona-panel view-panel--context">
            <div class="country-panel-card"><h2>Destination highlights</h2><div class="destination-highlight-grid">${highlightCards}</div></div>
            ${sourceLinks(city, countryInfo)}
          </div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function nav(city, countryInfo) {
  return `<nav class="top-menu" aria-label="Location navigation"><a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a><a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a><a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a><span class="nav-divider"></span><a class="nav-back" href="index.html" title="Back to ${html(countryInfo.name)}" aria-label="Back to ${html(countryInfo.name)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>${html(countryInfo.name)}</span></a><a class="nav-pill" href="../index.html">${html(countryInfo.continentName)}</a><a class="nav-pill" href="index.html">${html(countryInfo.name)}</a><a class="nav-pill active" aria-current="page" href="${city.slug}.html">${html(city.name)}</a></nav>`;
}

function areaCopy(area, city) {
  if (/airport|station|route|ferry|harbour|port/i.test(area)) return 'Practical when the trip is built around arrivals, ferries, rail connections or event schedules.';
  if (/old|gamla|centre|sentrum|centrum|indre|city|midlborg|town/i.test(area)) return 'Central base for first visits, restaurants, sightseeing and shorter local transfers.';
  if (/beach|fjord|harbour|island|river|lake|waterfront|vagen|brygge/i.test(area)) return 'Useful for water views, walks, dining and classic visitor plans.';
  return `Good alternative base when ${city.name} prices, parking or neighborhood style matter.`;
}

function areaBest(area) {
  if (/old|gamla|centre|sentrum|centrum|indre|city|midlborg|town/i.test(area)) return 'first visits, dining, sightseeing';
  if (/beach|fjord|harbour|island|river|lake|waterfront|vagen|brygge/i.test(area)) return 'views, walks, couples';
  if (/airport|station|route|ferry|port/i.test(area)) return 'events, transit, access';
  return 'value, repeat visits, quieter stays';
}

function airportDistance(airport, city) {
  if (/Airport/.test(airport)) return `Primary or useful airport for ${city.name} trips.`;
  return `Useful gateway for ${city.name} trips.`;
}

function airportCopy() {
  return 'Compare nearby stays when arrival time, late flights, ferries, trains or onward driving matter.';
}

function hotelCopy(tag) {
  if (tag === 'Central base') return 'Best when sightseeing and short local transfers matter most.';
  if (tag === 'Food / nightlife') return 'Good when evenings, restaurants and a more local feel shape the trip.';
  if (tag === 'Availability') return 'Check this area when central prices or minimum stays are tight.';
  return 'Useful during event weeks when rooms near the main draw book early.';
}

function highlightCopy(item, city) {
  return `${item} is a practical ${city.name} trip focus; compare nearby stays before locking in transport plans.`;
}

function shortExperience(item) {
  return `Open the right tab and shape the trip around ${item.toLowerCase()}.`;
}

function experienceLabel(i) {
  return ['Sight', 'Base', 'Culture', 'Nature', 'Food', 'Nearby'][i] || 'Plan';
}

function renderWeatherStrip(city, countryInfo) {
  return `<div class="stay-weather-card stay-weather-card--strip" data-weather-strip data-weather-lat="${html(city.coordinates.lat)}" data-weather-lon="${html(city.coordinates.lon)}"><div class="stay-weather-title-row"><h2>Weather Forecast</h2><span>${html(city.name)}, ${html(countryInfo.name)}</span></div><div class="stay-weather-page is-active" data-weather-page="0"><div class="stay-weather-days"><article class="stay-weather-tile"><strong>Loading</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">Forecast</span></div></article></div></div><p class="stay-weather-source">Weather forecast uses the shared OneSlider weather module when available.</p></div>`;
}

function sourceLinks(city, countryInfo) {
  const wiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name.replaceAll(' ', '_'))}`;
  return `<div class="country-panel-card destination-source-card"><h2>Sources</h2><div class="country-qa-list"><div><strong>City data</strong><span><a href="${wiki}" target="_blank" rel="noopener">Wikipedia: ${html(city.name)}</a></span></div><div><strong>Country context</strong><span><a href="${countryUrl(countryInfo)}">OneSliders: ${html(countryInfo.name)}</a></span></div><div><strong>Images</strong><span>Generated city-specific OneSliders artwork based on the listed local sights; no downloaded city photos are used.</span></div></div></div>`;
}

function dataJson(city) {
  const countryInfo = countries[city.countrySlug];
  return {
    slug: city.slug,
    name: city.name,
    continent: countryInfo.continent,
    continentName: countryInfo.continentName,
    countrySlug: countryInfo.slug,
    countryName: countryInfo.name,
    depth: 5,
    seo: {
      title: `${city.name} Travel Guide - Where to Stay, Airports & Events`,
      description: `Plan a ${city.name}, ${countryInfo.name} trip with neighborhoods, airports, travel tips, events and hotel planning links.`,
      twitterDescription: `Plan a ${city.name}, ${countryInfo.name} trip with neighborhoods, airports, travel tips, events and hotel planning links.`,
      webpageDescription: `Plan a ${city.name}, ${countryInfo.name} trip with neighborhoods, airports, travel tips, events and hotel planning links.`
    },
    region: city.region,
    population: city.population,
    coordinates: city.coordinates,
    weather: { source: 'OneSlider shared weather module', dynamic: true },
    areas: city.areas,
    airports: city.airports.map((name) => ({ name, search: `${name}, ${city.name}, ${countryInfo.name}` })),
    bookingDestination: `${city.areas[0]}, ${city.name}, ${countryInfo.name}`,
    highlights: city.highlights,
    sources: [
      { label: `Wikipedia: ${city.name}`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name.replaceAll(' ', '_'))}`, usedFor: 'city description, coordinates and population context' },
      { label: 'OneSliders generated city image set', url: `${siteBase}/content/locations/${countryInfo.continent}/${countryInfo.slug}/img/${city.slug}-hero.png`, usedFor: 'hero, mini and See-card generated assets' }
    ],
    sourceFetchedAt: '2026-06-12'
  };
}

function cityTags(city) {
  const text = [city.name, city.region, city.distance, city.known, city.kicker, ...city.areas, ...city.highlights].join(' ').toLowerCase();
  const tags = new Set(['city']);
  const addIf = (tag, pattern) => { if (pattern.test(text)) tags.add(tag); };
  addIf('waterfront', /fjord|harbour|harbor|canal|lake|river|coast|beach|island|archipelago|bay|sea|port/);
  addIf('winter', /arctic|aurora|northern lights|snow|ski|ice|lapland|polar/);
  addIf('culture', /museum|cathedral|castle|palace|old town|church|design|university|history|medieval|art|theatre|theater/);
  addIf('outdoors', /mountain|trail|park|fjord|waterfall|national park|viewpoint|hiking|glacier|forest/);
  addIf('family', /lego|zoo|santa|theme|family/);
  addIf('food', /food|market|seafood|sauna|dining/);
  return Array.from(tags);
}

function cityIndexEntry(city) {
  const countryInfo = countries[city.countrySlug];
  return {
    name: city.name,
    href: `${city.slug}.html`,
    img: `/content/locations/${countryInfo.continent}/${countryInfo.slug}/img/${city.slug}-mini.png`,
    tags: cityTags(city)
  };
}

function ensureFlag(countryInfo) {
  const flagPath = path.join(countryDir(countryInfo), 'img/flag.svg');
  if (fs.existsSync(flagPath)) return;
  fs.mkdirSync(path.dirname(flagPath), { recursive: true });
  const svg = countryInfo.slug === 'faroe-islands'
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 800"><path fill="#fff" d="M0 0h1100v800H0z"/><path fill="#0065bd" d="M0 300h1100v200H0zM300 0h200v800H300z"/><path fill="#ed2939" d="M0 340h1100v120H0zM340 0h120v800H340z"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"><path fill="#fff" d="M0 0h900v600H0z"/><path fill="#d00c33" d="M0 300a300 300 0 0 0 600 0H0zm900 0a300 300 0 0 0-600 0h600z"/></svg>';
  fs.writeFileSync(flagPath, svg);
}

function main() {
  for (const info of Object.values(countries)) {
    fs.mkdirSync(path.join(countryDir(info), 'img'), { recursive: true });
    ensureFlag(info);
  }
  for (const city of cities) {
    const info = countries[city.countrySlug];
    const dir = countryDir(info);
    fs.writeFileSync(path.join(dir, `${city.slug}.html`), render(city));
    fs.writeFileSync(path.join(dir, `${city.slug}.city.data.json`), `${JSON.stringify(dataJson(city), null, 2)}\n`);
  }
  for (const info of Object.values(countries)) {
    const group = cities.filter((city) => city.countrySlug === info.slug);
    // Country index pages are owned by scripts/build_country_page.py.
    // This script may update Nordic city pages/data, but must not overwrite
    // country data or the USA/Canada-style country layout.
  }
  fs.writeFileSync(path.join(root, 'scripts/data/nordic-stay-cities.json'), `${JSON.stringify({ generatedAt: '2026-06-12', countries, cities }, null, 2)}\n`);
  console.log(`Generated ${cities.length} Nordic stay city pages and data files. Image assets must be installed separately with the location image installer scripts.`);
}

main();
