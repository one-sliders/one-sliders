# rebuild-asia-countries.ps1
# Rebuilds all Asia country index pages with the Norway-style rich layout.

$locRoot = "C:\Users\AndersEriksson\3DF\OneSlider\content\locations"
$enc     = New-Object System.Text.UTF8Encoding $false

$CD = @{
  'afghanistan' = @{
    r='Central Asia / South Asia'; g='Islamic Emirate (de facto)'; y='1919'
    a='652,230 km2'; dn='60/km2'; tz='AFT (UTC+4:30)'; cc='+93'; dr='Right'
    hdi='0.478'; hb='48%'; si='19.0'; sb='19%'; ia='18%'; ib='18%'; le='64.8'; lb='54%'
    m=@(('Noshaq','7,492 m'),('Koh-e-Bandaka','6,843 m'),('Koh-e-Shakawr','6,272 m'))
    rl=@(('Islam','99%','#214e68'),('Other','1%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Band-e-Amir','Stunning turquoise lakes in a remote canyon, Afghanistan''s first national park.'),('Bamiyan Valley','Site of the destroyed giant Buddhas, with dramatic cliff dwellings and history.'),('Wakhan Corridor','Remote mountain corridor between Tajikistan and Pakistan, ancient Silk Road route.'),('Herat','Ancient city with a magnificent Friday Mosque and Persian cultural heritage.'),('Panjshir Valley','Dramatic valley famous for its resistance history and emerald river.'))
    ci=@(('Kabul','4.6M','100%'),('Kandahar','614k','13%'),('Herat','557k','12%'))
    j='-2C'; u='25C'; rn='327 mm'; ct='Semi-arid, cold winters, hot summers'
    nd='19 August'; el='220V, Type C/F'; iso='af'
    intro='Afghanistan is a landlocked country of dramatic mountain scenery, ancient civilizations, and a crossroads of cultures along the historic Silk Road, enduring decades of conflict.'
  }
  'bahrain' = @{
    r='Western Asia / Middle East / Arabian Gulf'; g='Constitutional monarchy'; y='1971'
    a='765 km2'; dn='2,137/km2'; tz='AST (UTC+3)'; cc='+973'; dr='Right'
    hdi='0.875'; hb='88%'; si='72.0'; sb='72%'; ia='100%'; ib='100%'; le='79.7'; lb='70%'
    m=@(('Jebel Dukhan','134 m'),('Al-Areen Ridge','120 m'),('Riffa Hills','80 m'))
    rl=@(('Islam','73%','#214e68'),('Christianity','9%','#8ab7c4'),('Hinduism','10%','#bac4c8'),('Other','8%','#e2e4df'))
    wv=@(('Bahrain Fort','UNESCO-listed ancient Dilmun civilization fortress with 4,000 years of history.'),('Formula 1 Grand Prix','Bahrain hosts the season-opening F1 night race at Sakhir Circuit.'),('Manama Souq','Labyrinthine gold, spice, and pearl market in the old quarter.'),('Tree of Life','Mysterious 400-year-old tree thriving alone in the desert, a national symbol.'),('Pearl Diving Heritage','UNESCO-listed pearl diving and trading tradition that shaped Bahrain.'))
    ci=@(('Manama','158k','100%'),('Riffa','100k','63%'),('Muharraq','97k','61%'))
    j='17C'; u='35C'; rn='77 mm'; ct='Arid, hot and dry'
    nd='16 December'; el='230V, Type G'; iso='bh'
    intro='Bahrain is a tiny Gulf island kingdom with a 4,000-year history as the ancient Dilmun civilization, today a financial hub known for its F1 race, pearl diving heritage, and tolerant cosmopolitan culture.'
  }
  'bangladesh' = @{
    r='South Asia'; g='Unitary parliamentary republic'; y='1971'
    a='147,570 km2'; dn='1,265/km2'; tz='BST (UTC+6)'; cc='+880'; dr='Left'
    hdi='0.670'; hb='67%'; si='38.0'; sb='38%'; ia='39%'; ib='39%'; le='74.3'; lb='64%'
    m=@(('Keokradong','1,230 m'),('Tahjindong','1,280 m'),('Mowdok Mual','1,003 m'))
    rl=@(('Islam','90%','#214e68'),('Hinduism','8%','#8ab7c4'),('Buddhism','1%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Sundarbans','The world''s largest mangrove forest, home to the Bengal tiger, UNESCO-listed.'),('Chittagong Hill Tracts','Rolling green hills with Buddhist temples and indigenous tribal cultures.'),('Cox''s Bazar','One of the world''s longest natural sea beaches stretching 120 km.'),('Dhaka Old City','Historic Mughal Dhaka with the Lalbagh Fort, Ahsan Manzil palace, and busy river trade.'),('Paharpur','UNESCO-listed ruins of the Buddhist Somapura Mahavihara monastery.'))
    ci=@(('Dhaka','10.3M','100%'),('Chittagong','3.9M','38%'),('Khulna','1.0M','10%'))
    j='18C'; u='29C'; rn='2,666 mm'; ct='Subtropical monsoon'
    nd='26 March'; el='220V, Type C/G'; iso='bd'
    intro='Bangladesh is one of the world''s most densely populated countries, a land of mighty rivers, the Sundarbans mangrove forest, and a vibrant Bengali culture shaped by independence in 1971.'
  }
  'bhutan' = @{
    r='South Asia / Himalayas'; g='Unitary parliamentary constitutional monarchy'; y='1907'
    a='38,394 km2'; dn='20/km2'; tz='BTT (UTC+6)'; cc='+975'; dr='Left'
    hdi='0.681'; hb='68%'; si='63.0'; sb='63%'; ia='72%'; ib='72%'; le='71.8'; lb='61%'
    m=@(('Gangkhar Puensum','7,570 m'),('Kula Kangri','7,554 m'),('Jitchu Drake','6,989 m'))
    rl=@(('Buddhism','75%','#214e68'),('Hinduism','22%','#8ab7c4'),('Other','3%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Tiger''s Nest Monastery','Paro Taktsang monastery clinging to a cliff at 3,120 m, Bhutan''s most iconic site.'),('Gross National Happiness','Bhutan prioritizes citizen wellbeing over GDP, a unique national philosophy.'),('Punakha Dzong','Majestic fortress-monastery at the confluence of two rivers, a masterpiece of Bhutanese architecture.'),('Haa Valley','Remote western valley of pristine nature, yak pastures, and ancient traditions.'),('Snowman Trek','One of the world''s most challenging treks through high-altitude Himalayan wilderness.'))
    ci=@(('Thimphu','115k','100%'),('Phuntsholing','25k','22%'),('Paro','14k','12%'))
    j='-3C'; u='17C'; rn='850 mm'; ct='Varies: tropical south, alpine north'
    nd='17 December'; el='230V, Type D/F'; iso='bt'
    intro='Bhutan is a tiny Himalayan kingdom that measures success by Gross National Happiness, a land of pristine mountain landscapes, ancient Buddhist monasteries, and a unique conservation ethos.'
  }
  'brunei' = @{
    r='Southeast Asia / Borneo'; g='Absolute monarchy (sultanate)'; y='1984'
    a='5,765 km2'; dn='83/km2'; tz='BNT (UTC+8)'; cc='+673'; dr='Left'
    hdi='0.829'; hb='83%'; si='62.0'; sb='62%'; ia='95%'; ib='95%'; le='77.4'; lb='67%'
    m=@(('Bukit Pagon','1,850 m'),('Bukit Retak','1,580 m'),('Bukit Belalong','913 m'))
    rl=@(('Islam','79%','#214e68'),('Buddhism','8%','#8ab7c4'),('Christianity','8%','#bac4c8'),('Other','5%','#e2e4df'))
    wv=@(('Omar Ali Saifuddien Mosque','Golden-domed mosque on a lagoon, one of Southeast Asia''s most beautiful.'),('Kampong Ayer','The world''s largest water village, home to 39,000 people on stilts over Brunei River.'),('Ulu Temburong National Park','Pristine primary rainforest accessible only by boat and on foot.'),('Royal Regalia Museum','Lavish exhibits of the Sultan''s coronation regalia and gifts from world leaders.'),('Malay Technology Museum','Traditional Bruneian boat-building, fishing, and craft culture.'))
    ci=@(('Bandar Seri Begawan','100k','100%'),('Kuala Belait','31k','31%'),('Seria','28k','28%'))
    j='23C'; u='27C'; rn='2,722 mm'; ct='Tropical rainforest, hot and humid'
    nd='23 February'; el='240V, Type G'; iso='bn'
    intro='Brunei is a tiny oil-rich sultanate on the island of Borneo, known for its lavish mosques, the world''s largest water village, pristine rainforest, and one of the highest standards of living in Asia.'
  }
  'cambodia' = @{
    r='Southeast Asia / Indochina'; g='Unitary parliamentary constitutional monarchy'; y='1953'
    a='181,035 km2'; dn='95/km2'; tz='ICT (UTC+7)'; cc='+855'; dr='Right'
    hdi='0.593'; hb='59%'; si='44.0'; sb='44%'; ia='44%'; ib='44%'; le='71.0'; lb='61%'
    m=@(('Phnom Aural','1,813 m'),('Phnom Sra','1,717 m'),('Phnom Kravanh','1,515 m'))
    rl=@(('Buddhism','97%','#214e68'),('Islam','2%','#8ab7c4'),('Christianity','1%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Angkor Wat','The world''s largest religious monument, a 12th-century Khmer temple complex.'),('Tonle Sap Lake','Southeast Asia''s largest freshwater lake, home to floating villages.'),('Phnom Penh','Cambodian capital with the Royal Palace, Silver Pagoda, and Killing Fields memorials.'),('Sihanoukville Islands','Pristine islands including Koh Rong with white beaches and clear water.'),('Battambang','Colonial-era market town with bamboo train and rural temples.'))
    ci=@(('Phnom Penh','2.3M','100%'),('Siem Reap','250k','11%'),('Sihanoukville','90k','4%'))
    j='27C'; u='28C'; rn='1,400 mm'; ct='Tropical monsoon'
    nd='9 November'; el='230V, Type A/C/G'; iso='kh'
    intro='Cambodia is the heart of the ancient Khmer Empire, home to the magnificent Angkor Wat temple complex, a country recovering from tragedy and rediscovering its rich cultural heritage.'
  }
  'china' = @{
    r='East Asia'; g='Unitary one-party socialist republic'; y='1949 (PRC)'
    a='9,596,960 km2'; dn='148/km2'; tz='CST (UTC+8)'; cc='+86'; dr='Right'
    hdi='0.788'; hb='79%'; si='51.0'; sb='51%'; ia='77%'; ib='77%'; le='78.2'; lb='68%'
    m=@(('Mount Everest','8,849 m'),('K2','8,611 m'),('Kangchenjunga','8,586 m'))
    rl=@(('No religion / Folk','74%','#8ab7c4'),('Buddhism','18%','#214e68'),('Islam','2%','#bac4c8'),('Christianity','5%','#e2e4df'))
    wv=@(('Great Wall of China','The most ambitious construction project in history, stretching thousands of kilometres.'),('Forbidden City','Imperial palace complex at the heart of Beijing, home to 24 emperors.'),('Zhangjiajie','Towering sandstone pillars that inspired the floating Hallelujah Mountains in Avatar.'),('Li River','Karst limestone scenery between Guilin and Yangshuo, one of the world''s great river journeys.'),('Terra-cotta Army','8,000-strong army of life-size terracotta soldiers guarding the first emperor''s tomb.'))
    ci=@(('Shanghai','26.3M','100%'),('Beijing','21.5M','82%'),('Chongqing','32.0M','122%'))
    j='4C'; u='26C'; rn='645 mm'; ct='Diverse: tropical, temperate, continental, alpine'
    nd='1 October'; el='220V, Type A/C/I'; iso='cn'
    intro='China is the world''s most populous nation and one of its oldest civilizations, a country of extraordinary diversity encompassing the Great Wall, the Silk Road, towering mountain ranges, and modern megacities.'
  }
  'india' = @{
    r='South Asia'; g='Federal parliamentary republic'; y='1947'
    a='3,287,263 km2'; dn='464/km2'; tz='IST (UTC+5:30)'; cc='+91'; dr='Left'
    hdi='0.644'; hb='64%'; si='40.0'; sb='40%'; ia='43%'; ib='43%'; le='70.8'; lb='60%'
    m=@(('Kangchenjunga','8,586 m'),('Nanda Devi','7,816 m'),('Kamet','7,756 m'))
    rl=@(('Hinduism','80%','#214e68'),('Islam','14%','#8ab7c4'),('Christianity','2%','#bac4c8'),('Sikhism / Other','4%','#e2e4df'))
    wv=@(('Taj Mahal','The jewel of India''s cultural heritage, a UNESCO-listed marble mausoleum in Agra.'),('Kerala Backwaters','Serene network of lakes, rivers, and canals in southern India''s lush tropical setting.'),('Rajasthan','The desert kingdom of forts, palaces, camels, and vibrant festivals.'),('Varanasi','One of the world''s oldest continuously inhabited cities, on the sacred Ganges River.'),('Himalayas','Trekking, monasteries, and mountain towns from Himachal Pradesh to Sikkim.'))
    ci=@(('Mumbai','20.7M','100%'),('Delhi','32.9M','159%'),('Bangalore','12.5M','60%'))
    j='16C'; u='28C'; rn='1,083 mm'; ct='Diverse: tropical, semi-arid, alpine'
    nd='26 January'; el='230V, Type C/D/M'; iso='in'
    intro='India is the world''s most populous democracy, an ancient civilization of extraordinary diversity encompassing 28 states, hundreds of languages, the Himalayas, tropical beaches, and a rich spiritual heritage.'
  }
  'indonesia' = @{
    r='Southeast Asia / Archipelago'; g='Unitary presidential republic'; y='1945'
    a='1,904,569 km2'; dn='151/km2'; tz='Multiple (UTC+7 to UTC+9)'; cc='+62'; dr='Left'
    hdi='0.713'; hb='71%'; si='43.0'; sb='43%'; ia='78%'; ib='78%'; le='71.7'; lb='61%'
    m=@(('Puncak Jaya','4,884 m'),('Sumantri','4,870 m'),('Ngga Pulu','4,862 m'))
    rl=@(('Islam','87%','#214e68'),('Christianity','10%','#8ab7c4'),('Hinduism','2%','#bac4c8'),('Buddhism / Other','1%','#e2e4df'))
    wv=@(('Bali','Hindu island of temples, rice terraces, surf breaks, and spiritual ceremonies.'),('Komodo','Home to the world''s largest lizard, with stunning pink beaches and rich marine life.'),('Borobudur','The world''s largest Buddhist temple, a 9th-century masterpiece on Java.'),('Raja Ampat','The most biodiverse marine area on the planet, with 1,500 fish species.'),('Toraja Land','Unique highland culture in Sulawesi known for elaborate funeral ceremonies.'))
    ci=@(('Jakarta','10.5M','100%'),('Surabaya','2.9M','28%'),('Bandung','2.5M','24%'))
    j='27C'; u='27C'; rn='2,702 mm'; ct='Tropical, equatorial'
    nd='17 August'; el='230V, Type C/F'; iso='id'
    intro='Indonesia is the world''s largest archipelago nation, spanning 17,000 islands from Sumatra to Papua, home to extraordinary biodiversity, ancient temples, and over 270 million people across hundreds of cultures.'
  }
  'iran' = @{
    r='Western Asia / Middle East'; g='Unitary presidential Islamic republic'; y='1979 (Islamic Republic)'
    a='1,648,195 km2'; dn='54/km2'; tz='IRST (UTC+3:30)'; cc='+98'; dr='Right'
    hdi='0.780'; hb='78%'; si='42.0'; sb='42%'; ia='72%'; ib='72%'; le='77.0'; lb='67%'
    m=@(('Damavand','5,610 m'),('Alam-Kuh','4,850 m'),('Sabalan','4,811 m'))
    rl=@(('Islam','99%','#214e68'),('Christianity','1%','#8ab7c4'),('Other','0%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Persepolis','Ruins of the Persian Empire''s ceremonial capital, one of antiquity''s greatest sites.'),('Isfahan','Half the world was said to be Isfahan - mosques, bridges, and bazaars of surpassing beauty.'),('Shiraz','City of poets, gardens, and wine heritage near the ruins of Persepolis.'),('Yazd','Ancient desert city of windcatchers and Zoroastrian fire temples.'),('Kashan','Famous for its rose water, historic mansions, and exquisite Persian gardens.'))
    ci=@(('Tehran','9.3M','100%'),('Mashhad','3.4M','37%'),('Isfahan','2.2M','24%'))
    j='4C'; u='30C'; rn='228 mm'; ct='Arid/semi-arid, cold north, hot south'
    nd='1 April (Islamic Republic Day)'; el='220V, Type C/F'; iso='ir'
    intro='Iran is the heartland of the ancient Persian civilization, a country of magnificent mosques, ancient ruins, desert landscapes, and a rich literary and artistic tradition spanning millennia.'
  }
  'iraq' = @{
    r='Western Asia / Middle East / Mesopotamia'; g='Federal parliamentary republic'; y='1932'
    a='438,317 km2'; dn='100/km2'; tz='AST (UTC+3)'; cc='+964'; dr='Right'
    hdi='0.686'; hb='69%'; si='24.0'; sb='24%'; ia='50%'; ib='50%'; le='71.4'; lb='61%'
    m=@(('Cheekha Dar','3,611 m'),('Haji Ibrahim','3,587 m'),('Shaho','2,972 m'))
    rl=@(('Islam','99%','#214e68'),('Christianity','1%','#8ab7c4'),('Yazidism','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Mesopotamia','The cradle of civilization, home to the world''s first cities, writing, and laws.'),('Kurdistan Region','Dramatic mountain landscapes, waterfalls, and welcoming northern Iraqi hospitality.'),('Ur','Ancient Sumerian city-state where the ziggurat of Ur still stands after 4,000 years.'),('Babylon','Ruins of one of antiquity''s greatest cities, including the legendary Ishtar Gate.'),('Baghdad','Historic capital with great museums and a resilient cultural scene.'))
    ci=@(('Baghdad','7.3M','100%'),('Mosul','1.5M','21%'),('Basra','1.6M','22%'))
    j='10C'; u='36C'; rn='216 mm'; ct='Hot desert, continental north'
    nd='3 October'; el='230V, Type C/D/G'; iso='iq'
    intro='Iraq is the land of ancient Mesopotamia, the cradle of civilization where writing, cities, and agriculture were first developed, a country rebuilding from conflict with remarkable historic sites.'
  }
  'israel' = @{
    r='Western Asia / Middle East / Levant'; g='Unitary parliamentary republic'; y='1948'
    a='20,770 km2'; dn='400/km2'; tz='IST (UTC+2)'; cc='+972'; dr='Right'
    hdi='0.919'; hb='92%'; si='54.0'; sb='54%'; ia='91%'; ib='91%'; le='83.5'; lb='74%'
    m=@(('Mount Hermon','2,236 m'),('Har Meron','1,208 m'),('Har Avital','1,204 m'))
    rl=@(('Judaism','74%','#214e68'),('Islam','18%','#8ab7c4'),('Christianity','2%','#bac4c8'),('Other','6%','#e2e4df'))
    wv=@(('Jerusalem','Holy city for Judaism, Christianity, and Islam, with the Western Wall, Church of the Holy Sepulchre, and Al-Aqsa.'),('Tel Aviv','Vibrant Mediterranean city of beaches, Bauhaus architecture, and world-class cuisine.'),('Dead Sea','The lowest point on earth, where salt-saturated water makes floating effortless.'),('Masada','Herodian fortress atop a desert mesa, the site of a famous Jewish last stand.'),('Eilat','Red Sea resort with exceptional coral reef diving in a unique marine ecosystem.'))
    ci=@(('Jerusalem','980k','100%'),('Tel Aviv','450k','46%'),('Haifa','290k','30%'))
    j='14C'; u='27C'; rn='435 mm'; ct='Mediterranean coast, semi-arid south'
    nd='14 May (varies by Hebrew calendar)'; el='230V, Type C/H'; iso='il'
    intro='Israel is a small Middle Eastern country with an outsized historical and spiritual significance, encompassing the birthplace of three major world religions, a Mediterranean coast, and the Dead Sea.'
  }
  'japan' = @{
    r='East Asia'; g='Unitary parliamentary constitutional monarchy'; y='660 BC (traditional founding)'
    a='377,975 km2'; dn='340/km2'; tz='JST (UTC+9)'; cc='+81'; dr='Left'
    hdi='0.925'; hb='93%'; si='75.0'; sb='75%'; ia='95%'; ib='95%'; le='84.3'; lb='75%'
    m=@(('Mount Fuji','3,776 m'),('Mount Kita','3,193 m'),('Mount Oku-Hotaka','3,190 m'))
    rl=@(('Shintoism / Buddhism','70%','#214e68'),('No religion','28%','#8ab7c4'),('Christianity','1%','#bac4c8'),('Other','1%','#e2e4df'))
    wv=@(('Kyoto','Thousand-year imperial capital of geisha, zen gardens, bamboo forests, and 2,000 temples.'),('Mount Fuji','Japan''s sacred volcano and highest peak, a UNESCO World Heritage site.'),('Tokyo','Hyper-modern megalopolis blending neon technology with ancient shrine culture.'),('Hiroshima','Deeply moving peace memorial and rebuilt city bearing witness to nuclear history.'),('Hakone','Volcanic hot springs and Lake Ashi views of Mount Fuji.'))
    ci=@(('Tokyo','13.9M','100%'),('Yokohama','3.8M','27%'),('Osaka','2.8M','20%'))
    j='5C'; u='27C'; rn='1,668 mm'; ct='Temperate (4 seasons), subtropical south'
    nd='11 February (National Foundation Day)'; el='100V, Type A/B'; iso='jp'
    intro='Japan is an island nation of ancient tradition and hyper-modern innovation, where Shinto shrines and zen gardens coexist with bullet trains, anime, and world-leading technology.'
  }
  'jordan' = @{
    r='Western Asia / Middle East'; g='Unitary parliamentary constitutional monarchy'; y='1946'
    a='89,342 km2'; dn='115/km2'; tz='EET (UTC+2)'; cc='+962'; dr='Right'
    hdi='0.736'; hb='74%'; si='54.0'; sb='54%'; ia='66%'; ib='66%'; le='75.4'; lb='65%'
    m=@(('Jabal Umm al Dami','1,854 m'),('Jabal Ram','1,734 m'),('Jabal Masuda','1,647 m'))
    rl=@(('Islam','97%','#214e68'),('Christianity','2%','#8ab7c4'),('Other','1%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Petra','The rose-red Nabataean city carved into sandstone cliffs, one of the world''s great wonders.'),('Wadi Rum','Mars-like red desert of sandstone pillars, Bedouin camps, and Lawrence of Arabia history.'),('Dead Sea','The lowest point on earth, with therapeutic mineral-rich waters and salt formations.'),('Jerash','One of the best-preserved Roman cities outside Italy, with colonnaded streets and temples.'),('Aqaba','Red Sea resort with world-class diving and snorkelling on a pristine coral reef.'))
    ci=@(('Amman','4.0M','100%'),('Zarqa','733k','18%'),('Irbid','650k','16%'))
    j='8C'; u='27C'; rn='111 mm'; ct='Mediterranean coast, desert interior'
    nd='25 May'; el='230V, Type C/D/F/G/J'; iso='jo'
    intro='Jordan is a Middle Eastern kingdom of extraordinary antiquity, home to the rose-red city of Petra, the otherworldly desert of Wadi Rum, and the hospitality of the Bedouin tradition.'
  }
  'kazakhstan' = @{
    r='Central Asia'; g='Unitary presidential republic'; y='1991'
    a='2,724,900 km2'; dn='7/km2'; tz='ALMT (UTC+5/+6)'; cc='+7'; dr='Right'
    hdi='0.802'; hb='80%'; si='55.0'; sb='55%'; ia='90%'; ib='90%'; le='74.7'; lb='65%'
    m=@(('Khan Tengri','6,995 m'),('Jengish Chokusu','7,439 m'),('Pik Pobedy','7,439 m'))
    rl=@(('Islam','70%','#214e68'),('Christianity','26%','#8ab7c4'),('Other','4%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Charyn Canyon','Dramatic red canyon often called Kazakhstan''s Grand Canyon.'),('Altai Mountains','Remote wilderness of glacial lakes, nomadic eagle hunters, and wild landscapes.'),('Baikonur Cosmodrome','Historic Soviet space launch facility where Yuri Gagarin flew to space.'),('Almaty','Former capital at the foot of the Trans-Ili Alatau mountains with ski resorts nearby.'),('Nur-Sultan (Astana)','Futuristic planned capital city built from scratch on the steppe in the 1990s.'))
    ci=@(('Almaty','2.1M','100%'),('Nur-Sultan','1.2M','57%'),('Shymkent','1.1M','52%'))
    j='-13C'; u='24C'; rn='250 mm'; ct='Continental, extreme temperature range'
    nd='16 December'; el='220V, Type C/F'; iso='kz'
    intro='Kazakhstan is the world''s largest landlocked country, a vast steppe nation spanning from the Caspian Sea to the Altai Mountains, with a nomadic heritage, space history, and rapidly developing cities.'
  }
  'kuwait' = @{
    r='Western Asia / Middle East / Arabian Gulf'; g='Constitutional monarchy'; y='1961'
    a='17,818 km2'; dn='241/km2'; tz='AST (UTC+3)'; cc='+965'; dr='Right'
    hdi='0.847'; hb='85%'; si='57.0'; sb='57%'; ia='100%'; ib='100%'; le='75.2'; lb='65%'
    m=@(('Al-Mutla Ridge','300 m'),('Ahmadi Hills','145 m'),('Jahra Hills','85 m'))
    rl=@(('Islam','76%','#214e68'),('Christianity','17%','#8ab7c4'),('Hinduism','5%','#bac4c8'),('Other','2%','#e2e4df'))
    wv=@(('Kuwait Towers','Iconic water towers on the Gulf coast, a symbol of Kuwait''s oil wealth.'),('Kuwait City Souq','Traditional Arabian market with gold, spices, and pearl heritage.'),('Grand Mosque','Kuwait''s main mosque, one of the largest in the Gulf region.'),('Failaka Island','Island with ruins of ancient Greek settlements and WWII history.'),('The Scientific Center','Huge aquarium and IMAX cinema on the Kuwait City waterfront.'))
    ci=@(('Kuwait City','3.1M','100%'),('Al Ahmadi','387k','12%'),('Hawalli','183k','6%'))
    j='13C'; u='37C'; rn='121 mm'; ct='Arid desert, extremely hot summers'
    nd='25 February'; el='240V, Type G'; iso='kw'
    intro='Kuwait is a small Gulf emirate with enormous oil wealth, a strategic position on the Arabian Gulf, a rich pearl diving heritage, and a modern skyline rebuilt after the 1990 Iraqi invasion.'
  }
  'kyrgyzstan' = @{
    r='Central Asia'; g='Unitary parliamentary republic'; y='1991'
    a='199,951 km2'; dn='34/km2'; tz='KGT (UTC+6)'; cc='+996'; dr='Right'
    hdi='0.697'; hb='70%'; si='51.0'; sb='51%'; ia='78%'; ib='78%'; le='72.7'; lb='62%'
    m=@(('Jengish Chokusu','7,439 m'),('Khan Tengri','6,995 m'),('Pobeda','7,439 m'))
    rl=@(('Islam','90%','#214e68'),('Christianity','7%','#8ab7c4'),('Other','3%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Song-Kol Lake','High-altitude steppe lake surrounded by nomad yurt camps and wild horses.'),('Tian Shan Mountains','Dramatic peaks, glaciers, and remote valleys across one of Asia''s greatest mountain ranges.'),('Ala-Archa National Park','Stunning glacial gorge just outside Bishkek with trekking and mountaineering.'),('Issyk-Kul','One of the world''s largest alpine lakes, ringed by snowy mountains.'),('Nomad Culture','Kyrgyzstan preserves authentic nomadic traditions including eagle hunting and yurt living.'))
    ci=@(('Bishkek','1.1M','100%'),('Osh','350k','32%'),('Jalal-Abad','101k','9%'))
    j='-6C'; u='24C'; rn='533 mm'; ct='Continental, high altitude'
    nd='31 August'; el='220V, Type C/F'; iso='kg'
    intro='Kyrgyzstan is a mountainous Central Asian republic of soaring Tian Shan peaks, alpine lakes, and one of the world''s best-preserved nomadic cultures, with some of Asia''s finest trekking.'
  }
  'laos' = @{
    r='Southeast Asia / Indochina'; g='Unitary Marxist-Leninist one-party socialist republic'; y='1953'
    a='236,800 km2'; dn='32/km2'; tz='ICT (UTC+7)'; cc='+856'; dr='Right'
    hdi='0.607'; hb='61%'; si='55.0'; sb='55%'; ia='43%'; ib='43%'; le='70.2'; lb='60%'
    m=@(('Phou Bia','2,817 m'),('Phu Xai Lai Leng','2,720 m'),('Phou Xang He','2,465 m'))
    rl=@(('Buddhism','65%','#214e68'),('Animism','33%','#8ab7c4'),('Christianity','2%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Luang Prabang','UNESCO-listed city of golden temples, saffron-robed monks, and misty Mekong mornings.'),('Plain of Jars','Mysterious prehistoric landscape strewn with thousands of ancient stone jars.'),('Vang Vieng','Dramatic karst limestone scenery with caves, rivers, and adventure sports.'),('Mekong River','The mother of waters flows through Laos connecting hill-tribe villages and ancient temples.'),('Bolaven Plateau','Cool highland plateau of coffee plantations and spectacular waterfalls.'))
    ci=@(('Vientiane','820k','100%'),('Savannakhet','97k','12%'),('Luang Prabang','56k','7%'))
    j='22C'; u='26C'; rn='1,834 mm'; ct='Tropical monsoon'
    nd='2 December'; el='230V, Type A/B/C/F'; iso='la'
    intro='Laos is a landlocked Southeast Asian country of ancient Buddhist temples, the mighty Mekong River, dramatic karst landscapes, and a slow-paced culture largely untouched by mass tourism.'
  }
  'lebanon' = @{
    r='Western Asia / Middle East / Levant'; g='Unitary parliamentary republic'; y='1943'
    a='10,452 km2'; dn='674/km2'; tz='EET (UTC+2)'; cc='+961'; dr='Right'
    hdi='0.706'; hb='71%'; si='29.0'; sb='29%'; ia='80%'; ib='80%'; le='78.2'; lb='68%'
    m=@(('Qurnat as Sawda''','3,088 m'),('Tallat Moussa','2,669 m'),('Qornayel','2,628 m'))
    rl=@(('Christianity','35%','#bac4c8'),('Islam','54%','#214e68'),('Druze','6%','#8ab7c4'),('Other','5%','#e2e4df'))
    wv=@(('Beirut','Resilient, cosmopolitan city known as the Paris of the Middle East, with incredible food and nightlife.'),('Baalbek','Magnificent Roman temple complex among the largest and best preserved in the world.'),('Jeita Grotto','Spectacular cave system with underground rivers and stalactite chambers.'),('Byblos','One of the world''s oldest continuously inhabited cities with Phoenician, Roman, and Crusader layers.'),('Cedar Forests','Ancient cedars of Lebanon, national symbol and last remnants of once-vast forest.'))
    ci=@(('Beirut','2.4M','100%'),('Tripoli','240k','10%'),('Sidon','163k','7%'))
    j='9C'; u='27C'; rn='893 mm'; ct='Mediterranean coast, snowy mountains'
    nd='22 November'; el='220V, Type C/D/G'; iso='lb'
    intro='Lebanon is a tiny Mediterranean country of ancient Phoenician heritage, magnificent Roman ruins, cedar forests, and a resilient cosmopolitan culture centred on Beirut''s world-famous food and nightlife.'
  }
  'malaysia' = @{
    r='Southeast Asia'; g='Federal parliamentary constitutional monarchy'; y='1957'
    a='329,847 km2'; dn='101/km2'; tz='MYT (UTC+8)'; cc='+60'; dr='Left'
    hdi='0.803'; hb='80%'; si='59.0'; sb='59%'; ia='96%'; ib='96%'; le='76.7'; lb='67%'
    m=@(('Mount Kinabalu','4,095 m'),('Mount Trus Madi','2,642 m'),('Mount Murud','2,423 m'))
    rl=@(('Islam','64%','#214e68'),('Buddhism','20%','#8ab7c4'),('Hinduism','6%','#bac4c8'),('Christianity','9%','#e2e4df'))
    wv=@(('Borneo Rainforest','Ancient jungle home to orangutans, pygmy elephants, and clouded leopards.'),('Petronas Towers','Twin towers that dominated the world''s tallest building list for six years.'),('Langkawi','Archipelago of 99 islands with white beaches, clear water, and duty-free shopping.'),('Penang','UNESCO-listed George Town, a melting pot of Chinese, Malay, and colonial heritage.'),('Cameron Highlands','Cool highland tea plantations and strawberry farms above the tropical lowlands.'))
    ci=@(('Kuala Lumpur','1.8M','100%'),('Johor Bahru','1.0M','56%'),('Subang Jaya','900k','50%'))
    j='27C'; u='28C'; rn='2,875 mm'; ct='Tropical, hot and humid'
    nd='31 August'; el='240V, Type G'; iso='my'
    intro='Malaysia is a Southeast Asian federation of extraordinary cultural and natural diversity, spanning peninsular Malaysia and the Borneo states of Sabah and Sarawak, with rainforests, reefs, and gleaming cities.'
  }
  'maldives' = @{
    r='South Asia / Indian Ocean'; g='Unitary presidential republic'; y='1965'
    a='298 km2'; dn='1,800/km2'; tz='MVT (UTC+5)'; cc='+960'; dr='Left'
    hdi='0.747'; hb='75%'; si='64.0'; sb='64%'; ia='63%'; ib='63%'; le='80.0'; lb='70%'
    m=@(('Vilingili Ridge','5 m'),('Addu Atoll','4 m'),('Fuvahmulah Island','4 m'))
    rl=@(('Islam','100%','#214e68'),('Other','0%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Overwater Bungalows','Iconic glass-floor bungalows above turquoise lagoons, pioneered by the Maldives.'),('Marine Life','Manta rays, whale sharks, sea turtles, and rainbow coral gardens in crystal-clear water.'),('Male','Compact, bustling island capital with the Grand Friday Mosque and colourful fish market.'),('Bioluminescent Beaches','Phytoplankton creates glowing blue waves on certain beaches at night.'),('Sunset Cruises','Dhoni boat trips through atolls at sunset, the quintessential Maldivian experience.'))
    ci=@(('Male','133k','100%'),('Addu City','35k','26%'),('Fuvahmulah','13k','10%'))
    j='29C'; u='30C'; rn='1,974 mm'; ct='Tropical, warm year-round'
    nd='26 July'; el='230V, Type D/G/J/K/L'; iso='mv'
    intro='The Maldives is an archipelago of 1,200 coral islands in the Indian Ocean, the world''s lowest-lying nation and a globally iconic luxury destination renowned for its turquoise lagoons and marine biodiversity.'
  }
  'mongolia' = @{
    r='East Asia / Central Asia'; g='Unitary semi-presidential republic'; y='1921'
    a='1,564,116 km2'; dn='2/km2'; tz='ULAT (UTC+8)'; cc='+976'; dr='Right'
    hdi='0.739'; hb='74%'; si='56.0'; sb='56%'; ia='66%'; ib='66%'; le='72.3'; lb='62%'
    m=@(('Khuten Uul','4,374 m'),('Tsambagarav','4,208 m'),('Munkh Khairkhan','4,204 m'))
    rl=@(('Buddhism','53%','#214e68'),('No religion','38%','#8ab7c4'),('Islam','3%','#bac4c8'),('Shamanism','3%','#e2e4df'))
    wv=@(('Gobi Desert','Vast desert of dinosaur fossils, sand dunes, and camel caravans.'),('Mongolian Steppe','Rolling grassland homeland of the nomadic horse culture that built the largest land empire.'),('Eagle Hunting Festival','Ancient tradition of Kazakh eagle hunters in the Altai Mountains of western Mongolia.'),('Karakorum','Ruins of Genghis Khan''s imperial capital in the Orkhon Valley.'),('Terelj National Park','Dramatic granite scenery and traditional nomad family stays close to Ulaanbaatar.'))
    ci=@(('Ulaanbaatar','1.5M','100%'),('Erdenet','101k','7%'),('Darkhan','90k','6%'))
    j='-22C'; u='17C'; rn='241 mm'; ct='Continental, extreme cold winters'
    nd='11 July'; el='220V, Type C/E'; iso='mn'
    intro='Mongolia is a land of endless steppe, the Gobi Desert, and the legacy of Genghis Khan''s vast empire, where nomadic traditions and horseback culture remain at the heart of national identity.'
  }
  'myanmar' = @{
    r='Southeast Asia / Indochina'; g='Military junta (since 2021)'; y='1948'
    a='676,578 km2'; dn='81/km2'; tz='MMT (UTC+6:30)'; cc='+95'; dr='Right'
    hdi='0.585'; hb='59%'; si='29.0'; sb='29%'; ia='37%'; ib='37%'; le='67.3'; lb='57%'
    m=@(('Hkakabo Razi','5,881 m'),('Gamlang Razi','5,870 m'),('Khakaborazi','5,889 m'))
    rl=@(('Buddhism','88%','#214e68'),('Christianity','6%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','2%','#e2e4df'))
    wv=@(('Bagan','Plain of 3,000 ancient pagodas stretching to the horizon, one of Asia''s great sights.'),('Inle Lake','Stilted villages and leg-rowing fishermen on a serene highland lake.'),('Shwedagon Pagoda','Gold-plated stupa in Yangon revered as the holiest Buddhist site in Myanmar.'),('Mandalay','Royal city with the great Kuthodaw Pagoda containing the world''s largest book.'),('Ngapali Beach','Pristine beach of white sand and turquoise water on the Bay of Bengal.'))
    ci=@(('Yangon','7.4M','100%'),('Mandalay','1.3M','18%'),('Naypyidaw','900k','12%'))
    j='25C'; u='28C'; rn='2,510 mm'; ct='Tropical monsoon'
    nd='4 January'; el='230V, Type C/D/F/G/I'; iso='mm'
    intro='Myanmar is a country of extraordinary cultural heritage, from the ancient pagoda-strewn plains of Bagan to Inle Lake''s stilted villages, a land undergoing profound political and social transformation.'
  }
  'nepal' = @{
    r='South Asia / Himalayas'; g='Federal parliamentary republic'; y='1768'
    a='147,181 km2'; dn='208/km2'; tz='NPT (UTC+5:45)'; cc='+977'; dr='Left'
    hdi='0.601'; hb='60%'; si='53.0'; sb='53%'; ia='34%'; ib='34%'; le='70.8'; lb='60%'
    m=@(('Mount Everest','8,849 m'),('Kangchenjunga','8,586 m'),('Lhotse','8,516 m'))
    rl=@(('Hinduism','81%','#214e68'),('Buddhism','9%','#8ab7c4'),('Islam','4%','#bac4c8'),('Other','6%','#e2e4df'))
    wv=@(('Everest Base Camp','The iconic trek to the foot of the world''s highest mountain via Sherpa villages.'),('Kathmandu','Vibrant city of ancient temples, stupas, and a living Kumari goddess.'),('Annapurna Circuit','Classic Himalayan trek circling the Annapurna massif through diverse landscapes.'),('Chitwan National Park','Jungle safari for Bengal tigers, one-horned rhinos, and gharial crocodiles.'),('Pokhara','Lakeside mountain town gateway to the Annapurnas with Himalayan views.'))
    ci=@(('Kathmandu','1.4M','100%'),('Pokhara','400k','29%'),('Lalitpur','300k','21%'))
    j='8C'; u='25C'; rn='1,400 mm'; ct='Subtropical lowlands, alpine Himalayas'
    nd='29 May'; el='230V, Type C/D/M'; iso='np'
    intro='Nepal is the Himalayan kingdom that holds eight of the world''s ten highest peaks including Everest, a country of ancient temples, spiritual pilgrimage routes, and unparalleled mountain trekking.'
  }
  'north-korea' = @{
    r='East Asia'; g='Unitary Juche one-party state'; y='1948'
    a='120,538 km2'; dn='213/km2'; tz='KST (UTC+9)'; cc='+850'; dr='Right'
    hdi='0.733'; hb='73%'; si='0%'; sb='0%'; ia='0%'; ib='0%'; le='72.6'; lb='62%'
    m=@(('Paektu Mountain','2,744 m'),('Gwanmo Peak','2,541 m'),('Nangnim Mountain','2,469 m'))
    rl=@(('Juche / Non-religious','65%','#214e68'),('Korean Shamanism','17%','#8ab7c4'),('Buddhism','14%','#bac4c8'),('Christianity','4%','#e2e4df'))
    wv=@(('Mount Paektu','Sacred volcanic mountain on the Chinese border, revered as the spiritual homeland of the Korean people.'),('Pyongyang','Monumental capital city of wide boulevards, socialist architecture, and mass spectacles.'),('Kumsusan Palace','Mausoleum where Kim Il-sung and Kim Jong-il lie in state.'),('DMZ (Korean border)','The most heavily militarized border in the world, separating the two Koreas.'),('Myohyangsan','Mountain retreat with temples and international friendship exhibition halls.'))
    ci=@(('Pyongyang','3.1M','100%'),('Hamhung','790k','25%'),('Chongjin','530k','17%'))
    j='-8C'; u='24C'; rn='613 mm'; ct='Continental, cold winters, hot humid summer'
    nd='9 September'; el='220V, Type A/C'; iso='kp'
    intro='North Korea is one of the world''s most isolated and secretive states, a country shaped by the Juche ideology of self-reliance, strict political control, and a Korean cultural heritage of ancient depth.'
  }
  'oman' = @{
    r='Western Asia / Middle East / Arabian Peninsula'; g='Absolute monarchy'; y='1970 (modern state)'
    a='309,500 km2'; dn='16/km2'; tz='GST (UTC+4)'; cc='+968'; dr='Right'
    hdi='0.816'; hb='82%'; si='66.0'; sb='66%'; ia='84%'; ib='84%'; le='78.0'; lb='68%'
    m=@(('Jabal Shams','3,009 m'),('Jabal Akhdar','2,980 m'),('Jabal al-Khitaym','2,847 m'))
    rl=@(('Islam','87%','#214e68'),('Hinduism','6%','#8ab7c4'),('Christianity','4%','#bac4c8'),('Other','3%','#e2e4df'))
    wv=@(('Mutrah Souq','One of the oldest souqs in the Arab world, in a beautiful Muscat harbour setting.'),('Wahiba Sands','Dramatic orange desert of dunes stretching to the Arabian Sea.'),('Wadi Shab','Turquoise pools and waterfalls in a dramatic limestone gorge accessible by boat.'),('Jabal Akhdar','Green Mountain plateau of rose gardens, juniper forests, and dramatic wadis.'),('Nizwa Fort','Imposing 17th-century fortress and souq at the heart of traditional Oman.'))
    ci=@(('Muscat','797k','100%'),('Seeb','420k','53%'),('Salalah','274k','34%'))
    j='21C'; u='33C'; rn='100 mm'; ct='Arid desert, coastal, mountainous'
    nd='18 November'; el='240V, Type G'; iso='om'
    intro='Oman is an Arabian Peninsula nation of dramatic desert wadis, ancient forts, turquoise mountain pools, and a tradition of hospitality, one of the most authentic and welcoming countries in the Middle East.'
  }
  'pakistan' = @{
    r='South Asia'; g='Federal parliamentary republic'; y='1947'
    a='881,913 km2'; dn='287/km2'; tz='PKT (UTC+5)'; cc='+92'; dr='Left'
    hdi='0.540'; hb='54%'; si='25.0'; sb='25%'; ia='21%'; ib='21%'; le='68.6'; lb='58%'
    m=@(('K2','8,611 m'),('Nanga Parbat','8,126 m'),('Gasherbrum I','8,080 m'))
    rl=@(('Islam','97%','#214e68'),('Christianity','2%','#8ab7c4'),('Hinduism','1%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('K2 Base Camp','The world''s second highest mountain, the savage mountain, in the Karakoram.'),('Lahore Old City','Mughal splendour of the Badshahi Mosque, Lahore Fort, and Shalimar Gardens.'),('Mohenjo-daro','5,000-year-old Indus Valley Civilization city, UNESCO World Heritage site.'),('Karakoram Highway','One of the world''s greatest road journeys through mountain passes to China.'),('Hunza Valley','Dramatic high-altitude valley of apricot orchards, ancient forts, and Rakaposhi views.'))
    ci=@(('Karachi','14.9M','100%'),('Lahore','13.1M','88%'),('Faisalabad','3.7M','25%'))
    j='13C'; u='31C'; rn='494 mm'; ct='Varies: semi-arid to alpine'
    nd='23 March'; el='230V, Type C/D/G/M'; iso='pk'
    intro='Pakistan contains some of the world''s most dramatic mountain scenery including K2 and the Karakoram, ancient Indus Valley Civilization sites, and a 5,000-year cultural heritage spanning empires from the Indus to the Mughals.'
  }
  'palestine' = @{
    r='Western Asia / Middle East'; g='Palestinian Authority (de facto)'; y='1988 (declared)'
    a='6,020 km2'; dn='797/km2'; tz='EET (UTC+2)'; cc='+970'; dr='Right'
    hdi='0.715'; hb='72%'; si='30.0'; sb='30%'; ia='58%'; ib='58%'; le='74.6'; lb='64%'
    m=@(('Tell Asur','1,022 m'),('Nabi Yunis','940 m'),('Jabal al-Furu''','928 m'))
    rl=@(('Islam','85%','#214e68'),('Christianity','12%','#8ab7c4'),('Other','3%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Bethlehem','Birthplace of Jesus, with the Church of the Nativity over the traditional manger site.'),('Jericho','One of the world''s oldest cities, in the Jordan Valley below sea level.'),('Ramallah','Cultural and administrative capital with art galleries and a vibrant cafe scene.'),('Dead Sea Shores','Palestinian section of the Dead Sea for floating in salt-saturated water.'),('Nablus Old City','Ancient city with Roman theatre, soap-making tradition, and famous kunafa pastry.'))
    ci=@(('Gaza City','590k','100%'),('Ramallah','38k','6%'),('Nablus','130k','22%'))
    j='9C'; u='27C'; rn='440 mm'; ct='Mediterranean, semi-arid south'
    nd='15 November (Declaration of Independence)'; el='230V, Type C'; iso='ps'
    intro='Palestine is a region of profound historical and spiritual significance at the heart of three world religions, encompassing the West Bank and Gaza with ancient cities, biblical sites, and an enduring cultural heritage.'
  }
  'philippines' = @{
    r='Southeast Asia / Archipelago'; g='Unitary presidential republic'; y='1898'
    a='300,000 km2'; dn='368/km2'; tz='PHT (UTC+8)'; cc='+63'; dr='Right'
    hdi='0.699'; hb='70%'; si='43.0'; sb='43%'; ia='68%'; ib='68%'; le='72.7'; lb='62%'
    m=@(('Mount Apo','2,954 m'),('Mount Dulang-Dulang','2,938 m'),('Mount Pulag','2,926 m'))
    rl=@(('Christianity','92%','#214e68'),('Islam','6%','#8ab7c4'),('Other','2%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Palawan','El Nido''s dramatic limestone karsts, crystal lagoons, and world''s most beautiful beaches.'),('Chocolate Hills','Hundreds of geometrically perfect grassy mounds on Bohol island, a geological wonder.'),('Tubbataha Reef','Remote UNESCO marine park with pristine diving in the Sulu Sea.'),('Intramuros','Walled Spanish colonial city in Manila at the heart of Philippine history.'),('Batanes Islands','Remote northernmost islands of dramatic cliffs, traditional Ivatan stone houses, and rugged beauty.'))
    ci=@(('Manila','1.8M','100%'),('Quezon City','3.0M','167%'),('Davao','1.8M','100%'))
    j='25C'; u='28C'; rn='2,348 mm'; ct='Tropical marine'
    nd='12 June'; el='220V, Type A/B/C'; iso='ph'
    intro='The Philippines is an archipelago of 7,641 islands with some of Southeast Asia''s most spectacular beaches and reefs, a deeply Catholic culture shaped by Spanish and American colonial history, and over 170 languages.'
  }
  'qatar' = @{
    r='Western Asia / Middle East / Arabian Gulf'; g='Absolute monarchy'; y='1971'
    a='11,571 km2'; dn='239/km2'; tz='AST (UTC+3)'; cc='+974'; dr='Right'
    hdi='0.855'; hb='86%'; si='77.0'; sb='77%'; ia='97%'; ib='97%'; le='80.2'; lb='71%'
    m=@(('Qurayn Abu al-Bawl','103 m'),('Jebel Fuwayrit','71 m'),('Jebel al-Nakhsh','62 m'))
    rl=@(('Islam','68%','#214e68'),('Christianity','14%','#8ab7c4'),('Hinduism','14%','#bac4c8'),('Other','4%','#e2e4df'))
    wv=@(('Souq Waqif','Restored traditional market at the heart of Doha with spices, falcons, and Arabic coffee.'),('Museum of Islamic Art','Iconic I.M. Pei-designed museum housing world-class Islamic art on the Doha waterfront.'),('Inland Sea (Khor al-Adaid)','UNESCO-recognized natural phenomenon of sea inlets cutting into the desert.'),('FIFA World Cup Legacy','Qatar hosted the 2022 FIFA World Cup with state-of-the-art stadiums.'),('Al Zubarah Fort','UNESCO-listed 18th-century fort and abandoned pearl fishing settlement in the desert.'))
    ci=@(('Doha','796k','100%'),('Al Rayyan','720k','90%'),('Al Wakrah','160k','20%'))
    j='18C'; u='36C'; rn='75 mm'; ct='Arid desert, extremely hot summer'
    nd='18 December'; el='240V, Type G'; iso='qa'
    intro='Qatar is a wealthy Gulf emirate transformed by oil and gas revenue into a global hub of culture, sport, and investment, hosting the 2022 FIFA World Cup and housing world-class museums in Doha.'
  }
  'saudi-arabia' = @{
    r='Western Asia / Middle East / Arabian Peninsula'; g='Absolute monarchy'; y='1932'
    a='2,149,690 km2'; dn='16/km2'; tz='AST (UTC+3)'; cc='+966'; dr='Right'
    hdi='0.875'; hb='88%'; si='68.0'; sb='68%'; ia='96%'; ib='96%'; le='76.3'; lb='66%'
    m=@(('Jabal Sawda','3,133 m'),('Jabal Ibrahim','2,640 m'),('Jabal Yibir','2,372 m'))
    rl=@(('Islam','97%','#214e68'),('Christianity','1%','#8ab7c4'),('Other','2%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Mecca & Medina','The two holiest cities of Islam, the destination of the Hajj pilgrimage for 1.8 billion Muslims.'),('Al-Ula','Ancient Nabataean ruins of Hegra, dramatic rose-red rock formations, and an emerging arts scene.'),('Jeddah Old Town','UNESCO-listed historic centre with coral-stone buildings and vibrant Red Sea waterfront.'),('Diriyah','Mud-brick ruins of the original Al-Saud capital, now a mega-heritage project.'),('Edge of the World','Dramatic escarpment overlooking the vast Nefud desert near Riyadh.'))
    ci=@(('Riyadh','7.7M','100%'),('Jeddah','4.7M','61%'),('Mecca','2.4M','31%'))
    j='14C'; u='38C'; rn='101 mm'; ct='Arid desert, hot and dry'
    nd='23 September'; el='127/220V, Type A/B/F/G'; iso='sa'
    intro='Saudi Arabia is the heartland of Islam and home to the holy cities of Mecca and Medina, a vast desert kingdom undergoing rapid modernization while preserving its ancient Nabataean and Islamic heritage.'
  }
  'singapore' = @{
    r='Southeast Asia / City-state'; g='Unitary parliamentary republic'; y='1965'
    a='733 km2'; dn='8,358/km2'; tz='SGT (UTC+8)'; cc='+65'; dr='Left'
    hdi='0.949'; hb='95%'; si='80.0'; sb='80%'; ia='92%'; ib='92%'; le='83.9'; lb='74%'
    m=@(('Bukit Timah','163 m'),('Bukit Gombak','139 m'),('Bukit Batok','105 m'))
    rl=@(('Buddhism','31%','#214e68'),('No religion','19%','#8ab7c4'),('Christianity','19%','#bac4c8'),('Islam / Taoism','31%','#e2e4df'))
    wv=@(('Marina Bay Sands','Iconic hotel with infinity rooftop pool overlooking the entire Singaporean skyline.'),('Gardens by the Bay','Futuristic botanical gardens with towering supertrees and climate-controlled biomes.'),('Hawker Culture','UNESCO-listed street food culture with 100+ cuisine types at open-air hawker centres.'),('Sentosa Island','Beach, Universal Studios, cable car, and world-class golf resort.'),('Little India / Chinatown','Vibrant cultural districts preserving Singapore''s Tamil and Chinese heritage.'))
    ci=@(('Singapore','5.9M','100%'),('Jurong East','280k','5%'),('Tampines','260k','4%'))
    j='27C'; u='28C'; rn='2,340 mm'; ct='Tropical, no dry season'
    nd='9 August'; el='230V, Type G'; iso='sg'
    intro='Singapore is a tiny city-state of extraordinary efficiency, cleanliness, and multicultural harmony, consistently ranked the world''s most liveable, safest, and competitive economy, with UNESCO-listed hawker food culture.'
  }
  'south-korea' = @{
    r='East Asia'; g='Unitary presidential republic'; y='1948'
    a='100,210 km2'; dn='527/km2'; tz='KST (UTC+9)'; cc='+82'; dr='Right'
    hdi='0.929'; hb='93%'; si='72.0'; sb='72%'; ia='97%'; ib='97%'; le='83.5'; lb='74%'
    m=@(('Hallasan','1,950 m'),('Jirisan','1,915 m'),('Seoraksan','1,708 m'))
    rl=@(('No religion','56%','#8ab7c4'),('Christianity','28%','#214e68'),('Buddhism','16%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Seoul','Dynamic capital city of palaces, street food, K-pop, and world-leading technology.'),('Gyeongju','The Kyoto of Korea, an ancient Silla dynasty capital of UNESCO-listed tombs and temples.'),('Jeju Island','Volcanic island of waterfalls, hiking, black lava rock beaches, and diving haenyeo women.'),('Jeonju Hanok Village','Traditional Korean hanok house district, the birthplace of bibimbap.'),('K-Culture','K-pop, K-drama, Korean beauty, and Korean cuisine have become global phenomena.'))
    ci=@(('Seoul','9.7M','100%'),('Busan','3.4M','35%'),('Incheon','3.0M','31%'))
    j='1C'; u='25C'; rn='1,274 mm'; ct='Temperate continental, 4 seasons'
    nd='15 August'; el='220V, Type C/F'; iso='kr'
    intro='South Korea is a dynamic East Asian nation that transformed from war-devastated poverty to a high-tech economic powerhouse in decades, now celebrated globally for K-pop, Korean cuisine, and cutting-edge design.'
  }
  'sri-lanka' = @{
    r='South Asia / Indian Ocean'; g='Unitary presidential republic'; y='1948'
    a='65,610 km2'; dn='341/km2'; tz='SLST (UTC+5:30)'; cc='+94'; dr='Left'
    hdi='0.782'; hb='78%'; si='55.0'; sb='55%'; ia='39%'; ib='39%'; le='77.4'; lb='67%'
    m=@(('Pidurutalagala','2,524 m'),('Kirigalpotta','2,395 m'),('Totapolakanda','2,357 m'))
    rl=@(('Buddhism','70%','#214e68'),('Hinduism','13%','#8ab7c4'),('Islam','10%','#bac4c8'),('Christianity','7%','#e2e4df'))
    wv=@(('Sigiriya','UNESCO-listed 5th-century rock fortress with frescoes and water gardens, the eighth wonder.'),('Temple of the Tooth','Kandy''s holiest Buddhist temple housing a relic of the Buddha''s tooth.'),('Ella','Scenic highland village of tea estates, Nine Arch Bridge, and Little Adam''s Peak.'),('Yala National Park','Sri Lanka''s most visited wildlife sanctuary, with the world''s highest leopard density.'),('Galle Fort','UNESCO-listed Dutch colonial fort on the southern coast, full of boutique hotels and history.'))
    ci=@(('Colombo','752k','100%'),('Dehiwala','245k','33%'),('Moratuwa','208k','28%'))
    j='26C'; u='28C'; rn='1,976 mm'; ct='Tropical, monsoon-influenced'
    nd='4 February'; el='230V, Type D/G/M'; iso='lk'
    intro='Sri Lanka is a teardrop-shaped island of remarkable diversity, from ancient Buddhist ruins and highland tea estates to tropical beaches, leopards in the wild, and a cultural heritage stretching 2,500 years.'
  }
  'syria' = @{
    r='Western Asia / Middle East / Levant'; g='Unitary Ba''athist republic (transitional 2024)'; y='1946'
    a='185,180 km2'; dn='101/km2'; tz='EET (UTC+2)'; cc='+963'; dr='Right'
    hdi='0.577'; hb='58%'; si='18.0'; sb='18%'; ia='36%'; ib='36%'; le='72.8'; lb='62%'
    m=@(('Mount Hermon','2,814 m'),('Jabal an-Nusayriyah','1,575 m'),('Jabal az-Zawiyah','972 m'))
    rl=@(('Islam','87%','#214e68'),('Christianity','10%','#8ab7c4'),('Druze','3%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Palmyra (Tadmor)','Ancient caravan oasis city and magnificent Roman ruins in the Syrian desert.'),('Damascus Old City','UNESCO-listed one of the world''s oldest capitals, with the Umayyad Mosque and grand souqs.'),('Krak des Chevaliers','One of the world''s best-preserved Crusader castles, a UNESCO masterpiece.'),('Aleppo','Ancient UNESCO city famed for its Ayyubid citadel, historic souqs, and soap-making.'),('Dead Cities','Byzantine ghost towns of the limestone massif in northwest Syria.'))
    ci=@(('Damascus','2.5M','100%'),('Aleppo','1.9M','76%'),('Homs','775k','31%'))
    j='6C'; u='28C'; rn='252 mm'; ct='Mediterranean coast, arid interior'
    nd='17 April'; el='220V, Type C/E/L'; iso='sy'
    intro='Syria is one of humanity''s oldest inhabited lands, containing UNESCO-listed sites of extraordinary antiquity including Damascus, Aleppo, and Palmyra, currently undergoing post-conflict reconstruction.'
  }
  'taiwan' = @{
    r='East Asia'; g='Semi-presidential republic'; y='1912 (ROC)/1949 (current gov.)'
    a='36,193 km2'; dn='655/km2'; tz='NST (UTC+8)'; cc='+886'; dr='Right'
    hdi='0.916'; hb='92%'; si='73.0'; sb='73%'; ia='93%'; ib='93%'; le='81.3'; lb='72%'
    m=@(('Yushan (Jade Mountain)','3,952 m'),('Xue Mountain','3,886 m'),('Nengao','3,685 m'))
    rl=@(('Buddhism/Taoism','93%','#214e68'),('Christianity','4%','#8ab7c4'),('Other','3%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Taroko Gorge','Marble canyon of spectacular scenery, one of Asia''s most dramatic national parks.'),('Sun Moon Lake','Taiwan''s largest lake ringed by mountains and home to the Thao indigenous tribe.'),('Jiufen','Hillside mining town of narrow alleys and teahouses said to inspire Spirited Away.'),('Night Markets','Taiwan''s night markets are legendary for bubble tea, stinky tofu, and street snacks.'),('Alishan','High-altitude forest railway and cloud sea views above Chiayi County.'))
    ci=@(('New Taipei City','4.0M','100%'),('Taipei','2.6M','65%'),('Taichung','2.8M','70%'))
    j='16C'; u='30C'; rn='2,508 mm'; ct='Subtropical to tropical'
    nd='10 October'; el='110V, Type A/B'; iso='tw'
    intro='Taiwan is an island of striking natural scenery, from marble gorges and high mountain forests to subtropical beaches, combined with exceptional food culture, cutting-edge technology, and a vibrant democratic society.'
  }
  'tajikistan' = @{
    r='Central Asia'; g='Unitary presidential republic'; y='1991'
    a='143,100 km2'; dn='72/km2'; tz='TJT (UTC+5)'; cc='+992'; dr='Right'
    hdi='0.685'; hb='69%'; si='50.0'; sb='50%'; ia='21%'; ib='21%'; le='72.9'; lb='63%'
    m=@(('Ismoil Somoni Peak','7,495 m'),('Peak Independence','6,940 m'),('Peak Karl Marx','6,723 m'))
    rl=@(('Islam','98%','#214e68'),('Other','2%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Pamir Highway','One of the world''s great road journeys through the Roof of the World mountain range.'),('Iskanderkul Lake','Stunning blue-green glacial lake in the Fan Mountains named after Alexander the Great.'),('Wakhan Valley','Remote corridor of ancient Silk Road history and breathtaking mountain scenery.'),('Dushanbe','Leafy Soviet-era capital with the world''s tallest flagpole and a new national museum.'),('Fan Mountains','Dramatic alpine region with turquoise lakes and excellent trekking in a compact area.'))
    ci=@(('Dushanbe','900k','100%'),('Khujand','175k','19%'),('Kulob','105k','12%'))
    j='-2C'; u='26C'; rn='531 mm'; ct='Continental, mountainous'
    nd='9 September'; el='220V, Type C/F'; iso='tj'
    intro='Tajikistan is the Roof of the World, a mountainous Central Asian republic containing the Pamirs and some of Asia''s highest peaks, traversed by the legendary Pamir Highway Silk Road.'
  }
  'thailand' = @{
    r='Southeast Asia'; g='Unitary parliamentary constitutional monarchy'; y='1238 (Sukhothai Kingdom)'
    a='513,120 km2'; dn='137/km2'; tz='ICT (UTC+7)'; cc='+66'; dr='Left'
    hdi='0.800'; hb='80%'; si='52.0'; sb='52%'; ia='66%'; ib='66%'; le='79.7'; lb='70%'
    m=@(('Doi Inthanon','2,565 m'),('Doi Pha Hom Pok','2,285 m'),('Doi Lang','2,031 m'))
    rl=@(('Buddhism','95%','#214e68'),('Islam','4%','#8ab7c4'),('Christianity','1%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Bangkok','Sprawling royal capital of glittering temples, canals, street food, and frenetic energy.'),('Chiang Mai','Northern rose city of traditional Lanna culture, elephant sanctuaries, and night bazaars.'),('Phi Phi Islands','Dramatic limestone cliffs, turquoise bays, and world-famous beach parties.'),('Ayutthaya','Ancient Siamese capital of ruins and headless Buddha statues, UNESCO World Heritage.'),('Elephant Nature Park','Ethical elephant sanctuary in the hills outside Chiang Mai.'))
    ci=@(('Bangkok','10.7M','100%'),('Nonthaburi','1.5M','14%'),('Pak Kret','1.1M','10%'))
    j='26C'; u='28C'; rn='1,400 mm'; ct='Tropical monsoon'
    nd='5 December (Father''s Day/King Birthday)'; el='220V, Type A/B/C'; iso='th'
    intro='Thailand is the Land of Smiles, a kingdom of golden temples, tropical beaches, world-renowned cuisine, and warm hospitality, one of Southeast Asia''s most visited and beloved destinations.'
  }
  'timor-leste' = @{
    r='Southeast Asia'; g='Unitary semi-presidential republic'; y='2002'
    a='14,919 km2'; dn='90/km2'; tz='TLT (UTC+9)'; cc='+670'; dr='Left'
    hdi='0.606'; hb='61%'; si='50.0'; sb='50%'; ia='32%'; ib='32%'; le='69.6'; lb='59%'
    m=@(('Tatamailau (Mount Ramelau)','2,963 m'),('Mount Matebian','2,315 m'),('Mount Kablaki','2,010 m'))
    rl=@(('Christianity','98%','#214e68'),('Islam','1%','#8ab7c4'),('Other','1%','#bac4c8'),('No religion','0%','#e2e4df'))
    wv=@(('Atauro Island','Remote island with world-class diving reefs and traditional fishing villages.'),('Mount Ramelau','Highest peak in Timor-Leste, pilgrimage destination with 180-degree views.'),('Dili Waterfront','Relaxed capital with Portuguese colonial architecture and WWII-era rusting Japanese ships.'),('Traditional Tais','Handwoven textile art that embodies Timorese identity and history.'),('Jaco Island','Uninhabited pristine island accessible only by boat, sacred to Timorese.'))
    ci=@(('Dili','281k','100%'),('Baucau','25k','9%'),('Maliana','17k','6%'))
    j='28C'; u='23C'; rn='1,500 mm'; ct='Tropical, dry season May-November'
    nd='20 May'; el='220V, Type C/E/F/I'; iso='tl'
    intro='Timor-Leste is one of the world''s newest nations, achieving independence in 2002 after centuries of colonialism and a brutal occupation, a young country of mountain scenery, pristine reefs, and resilient culture.'
  }
  'turkmenistan' = @{
    r='Central Asia'; g='Unitary presidential republic'; y='1991'
    a='488,100 km2'; dn='12/km2'; tz='TMT (UTC+5)'; cc='+993'; dr='Right'
    hdi='0.745'; hb='75%'; si='50.0'; sb='50%'; ia='21%'; ib='21%'; le='70.7'; lb='60%'
    m=@(('Ayrybaba','3,139 m'),('Kugitang','3,137 m'),('Firyuza','2,165 m'))
    rl=@(('Islam','93%','#214e68'),('Other','7%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Darvaza Gas Crater','The Gates of Hell - a burning natural gas crater in the Karakum Desert, lit since 1971.'),('Merv','Ancient Silk Road oasis city, once the largest city in the world, UNESCO-listed.'),('Karakum Desert','The Black Sand Desert covers 70% of the country, home to wild camels and saxaul trees.'),('Ashgabat','White-marble capital with surreal Soviet-era architecture and golden statues.'),('Ancient Parthian Fortresses','UNESCO-listed ruins of the Parthian Empire in the Nisa region.'))
    ci=@(('Ashgabat','1.0M','100%'),('Turkmenbashi','92k','9%'),('Dasoguz','66k','7%'))
    j='-1C'; u='30C'; rn='161 mm'; ct='Continental desert'
    nd='27 October'; el='220V, Type B/C/F'; iso='tm'
    intro='Turkmenistan is one of the world''s most isolated and secretive countries, a Central Asian desert nation of ancient Silk Road heritage, the burning Darvaza crater, and an eccentric personality cult capital in Ashgabat.'
  }
  'united-arab-emirates' = @{
    r='Western Asia / Middle East / Arabian Gulf'; g='Federal absolute monarchy'; y='1971'
    a='83,600 km2'; dn='119/km2'; tz='GST (UTC+4)'; cc='+971'; dr='Right'
    hdi='0.911'; hb='91%'; si='80.0'; sb='80%'; ia='100%'; ib='100%'; le='79.4'; lb='69%'
    m=@(('Jebel Jais','1,934 m'),('Jebel Hafeet','1,249 m'),('Jabal Yibir','1,527 m'))
    rl=@(('Islam','76%','#214e68'),('Christianity','9%','#8ab7c4'),('Hinduism','10%','#bac4c8'),('Other','5%','#e2e4df'))
    wv=@(('Burj Khalifa','The world''s tallest building at 828m, with observation decks above the clouds.'),('Dubai Mall','One of the world''s largest shopping centres with an aquarium, ice rink, and waterfall.'),('Sheikh Zayed Grand Mosque','Abu Dhabi''s breathtaking white marble mosque that can hold 40,000 worshippers.'),('Desert Safaris','Dune bashing, camel riding, and Bedouin camp dinners in the Arabian desert.'),('Abu Dhabi Cultural District','Louvre Abu Dhabi, Guggenheim, and other world-class museums on Saadiyat Island.'))
    ci=@(('Dubai','3.7M','100%'),('Abu Dhabi','1.5M','41%'),('Sharjah','1.4M','38%'))
    j='19C'; u='37C'; rn='78 mm'; ct='Arid desert, hot and dry'
    nd='2 December'; el='230V, Type G'; iso='ae'
    intro='The UAE is a federation of seven emirates that transformed desert into a global hub of commerce, tourism, and innovation in just decades, home to the world''s tallest building and iconic modern architecture.'
  }
  'uzbekistan' = @{
    r='Central Asia'; g='Unitary presidential republic'; y='1991'
    a='448,978 km2'; dn='77/km2'; tz='UZT (UTC+5)'; cc='+998'; dr='Right'
    hdi='0.727'; hb='73%'; si='54.0'; sb='54%'; ia='67%'; ib='67%'; le='75.3'; lb='65%'
    m=@(('Khazret Sultan','4,643 m'),('Adelunga Toghi','4,301 m'),('Beshtor Peak','4,299 m'))
    rl=@(('Islam','88%','#214e68'),('Other','12%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Samarkand','Tamerlane''s jewel on the Silk Road, with the Registan square of brilliant tiled madrasas.'),('Bukhara','Ancient holy city of 140 mosques and the Ark fortress, frozen in Silk Road splendour.'),('Khiva','Walled inner city of Itchan Kala, a UNESCO living museum of Islamic architecture.'),('Fergana Valley','Silk-weaving heartland of Uzbekistan with traditional crafts and lush fruit orchards.'),('Tashkent','Modern capital with Soviet-era metro stations that are underground art galleries.'))
    ci=@(('Tashkent','2.7M','100%'),('Namangan','670k','25%'),('Samarkand','600k','22%'))
    j='-1C'; u='28C'; rn='375 mm'; ct='Continental desert, cold winters'
    nd='1 September'; el='220V, Type C/F'; iso='uz'
    intro='Uzbekistan is the heart of the ancient Silk Road, a country of breath-taking Islamic architecture in Samarkand, Bukhara, and Khiva, where turquoise domes and intricate tilework have dazzled travellers for centuries.'
  }
  'vietnam' = @{
    r='Southeast Asia / Indochina'; g='Unitary Marxist-Leninist one-party socialist republic'; y='1945'
    a='331,212 km2'; dn='314/km2'; tz='ICT (UTC+7)'; cc='+84'; dr='Right'
    hdi='0.726'; hb='73%'; si='55.0'; sb='55%'; ia='78%'; ib='78%'; le='75.5'; lb='65%'
    m=@(('Fansipan','3,143 m'),('Pu Si Lung','3,083 m'),('Ky Quan San','3,046 m'))
    rl=@(('No religion/Folk','74%','#8ab7c4'),('Buddhism','15%','#214e68'),('Christianity','7%','#bac4c8'),('Cao Dai / Other','4%','#e2e4df'))
    wv=@(('Ha Long Bay','UNESCO World Heritage bay of 1,600 limestone karst islands emerging from emerald water.'),('Hoi An','UNESCO-listed ancient port town of lantern-lit canals, tailors, and fusion cuisine.'),('Hanoi Old Quarter','36 guild streets of French colonial architecture, street food, and the Temple of Literature.'),('Phong Nha Caves','World''s largest cave system including Son Doong, the world''s biggest cave.'),('Hue Imperial City','Former imperial capital of the Nguyen dynasty with a UNESCO-listed citadel.'))
    ci=@(('Ho Chi Minh City','8.9M','100%'),('Hanoi','8.3M','93%'),('Da Nang','1.2M','13%'))
    j='17C'; u='30C'; rn='1,821 mm'; ct='Tropical south, subtropical north'
    nd='2 September'; el='220V, Type A/C/D'; iso='vn'
    intro='Vietnam is an S-shaped country of extraordinary scenic beauty, from Ha Long Bay''s karst islands and rice terraces to imperial cities, ancient towns, and a cuisine celebrated as among the world''s finest.'
  }
  'yemen' = @{
    r='Western Asia / Middle East / Arabian Peninsula'; g='Republic (civil war since 2015)'; y='1990 (unified)'
    a='527,968 km2'; dn='57/km2'; tz='AST (UTC+3)'; cc='+967'; dr='Right'
    hdi='0.455'; hb='46%'; si='18.0'; sb='18%'; ia='27%'; ib='27%'; le='66.1'; lb='55%'
    m=@(('Jabal an-Nabi Shu''ayb','3,666 m'),('Jabal Tiyal','3,192 m'),('Jabal Hibshi','2,978 m'))
    rl=@(('Islam','99%','#214e68'),('Other','1%','#8ab7c4'),('No religion','0%','#bac4c8'),('Other','0%','#e2e4df'))
    wv=@(('Socotra Island','Alien landscape of dragon blood trees and endemic species found nowhere else on earth.'),('Sana''a Old City','UNESCO-listed 2,500-year-old city of tower houses decorated with geometric plasterwork.'),('Shibam','UNESCO-listed skyscrapers of mud-brick, 16-storey tower houses built centuries ago.'),('Wadi Hadhramaut','Ancient valley of dramatic landscapes and pre-Islamic inscriptions.'),('Aden Historic Port','Ancient port city with craters, colonial history, and a famous waterfront.'))
    ci=@(('Sana''a','3.9M','100%'),('Aden','863k','22%'),('Taiz','615k','16%'))
    j='14C'; u='29C'; rn='167 mm'; ct='Hot desert, milder highlands'
    nd='22 May'; el='230V, Type A/D/G'; iso='ye'
    intro='Yemen is an ancient Arabian Peninsula nation of extraordinary heritage including the UNESCO mud-brick skyscrapers of Shibam and the alien landscapes of Socotra Island, currently experiencing a devastating civil conflict.'
  }
}

function Build-AsiaPage($filePath) {
  $rel  = $filePath.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return $null }
  $slug = $parts[1]

  $d = $CD[$slug]
  if (-not $d) { return $null }

  $html = [System.IO.File]::ReadAllText($filePath)

  $heroImg   = [regex]::Match($html, "url\('(https://[^']+)'\)").Groups[1].Value
  if (-not $heroImg) { $heroImg = 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1600&q=80' }

  $kicker    = [regex]::Match($html, 'class="kicker">([^<]+)').Groups[1].Value
  if (-not $kicker) { $kicker = "Country in Asia" }

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
    <a class="nav-back" href="../index.html" title="Back to Asia" aria-label="Back to Asia"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>Asia</span></a>
    <a class="nav-pill" href="../index.html">Asia</a>
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

Get-ChildItem "$locRoot\asia" -Recurse -Filter "index.html" | ForEach-Object {
  $rel = $_.FullName.Substring($locRoot.Length + 1)
  $parts = $rel.Split('\')
  if ($parts.Count -ne 3) { return }

  $result = Build-AsiaPage $_.FullName
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
