(function () {
  'use strict';

  function initFeaturedCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.carousel-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dots .dot'));
    var prev = document.querySelector('[aria-label="Previous featured guide"]');
    var next = document.querySelector('[aria-label="Next featured guide"]');
    if (!slides.length) return;

    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));

    function loadSlide(index) {
      var image = slides[index] && slides[index].querySelector('img[data-src]');
      if (image) {
        image.src = image.getAttribute('data-src');
        image.removeAttribute('data-src');
      }
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      loadSlide(current);
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    loadSlide(current);

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeaturedCarousel, { once: true });
  } else {
    initFeaturedCarousel();
  }
})();

(function() {
  /* Inline national-day lookup: [month, day, slug, title, dateText, city] */
  var ND = [[11,28,"albania-independence-day","Albania Independence Day","28 November","Tirana"],[9,8,"our-lady-of-meritxell-day","Our Lady of Meritxell Day","8 September","Andorra la Vella"],[9,21,"armenia-independence-day","Armenia Independence Day","21 September","Yerevan"],[10,26,"austria-national-day","Austria National Day","26 October","Vienna"],[5,28,"azerbaijan-republic-day","Azerbaijan Republic Day","28 May","Baku"],[7,3,"belarus-independence-day","Belarus Independence Day","3 July","Minsk"],[7,21,"belgian-national-day","Belgian National Day","21 July","Brussels"],[11,25,"bosnia-and-herzegovina-statehood-day","Bosnia and Herzegovina Statehood Day","25 November","Sarajevo"],[3,3,"bulgaria-liberation-day","Bulgaria Liberation Day","3 March","Sofia"],[5,30,"croatia-statehood-day","Croatia Statehood Day","30 May","Zagreb"],[10,1,"cyprus-independence-day","Cyprus Independence Day","1 October","Nicosia"],[10,28,"czech-independent-state-day","Czech Independent State Day","28 October","Prague"],[6,5,"denmark-constitution-day","Denmark Constitution Day","5 June","Copenhagen"],[2,24,"estonia-independence-day","Estonia Independence Day","24 February","Tallinn"],[12,6,"finland-independence-day","Finland Independence Day","6 December","Helsinki"],[7,14,"bastille-day","Bastille Day","14 July","Paris"],[5,26,"georgia-independence-day","Georgia Independence Day","26 May","Tbilisi"],[10,3,"day-of-german-unity","Day of German Unity","3 October","Berlin"],[3,25,"greek-independence-day","Greek Independence Day","25 March","Athens"],[8,20,"saint-stephen-s-day","Saint Stephen's Day","20 August","Budapest"],[6,17,"iceland-national-day","Iceland National Day","17 June","Reykjavik"],[3,17,"saint-patrick-s-day","Saint Patrick's Day","17 March","Dublin"],[6,2,"festa-della-repubblica","Festa della Repubblica","2 June","Rome"],[2,17,"kosovo-independence-day","Kosovo Independence Day","17 February","Pristina"],[11,18,"latvia-independence-day","Latvia Independence Day","18 November","Riga"],[8,15,"liechtenstein-national-day","Liechtenstein National Day","15 August","Vaduz"],[2,16,"lithuania-independence-day","Lithuania Independence Day","16 February","Vilnius"],[6,23,"luxembourg-national-day","Luxembourg National Day","23 June","Luxembourg City"],[3,31,"malta-freedom-day","Malta Freedom Day","31 March","Valletta"],[8,27,"moldova-independence-day","Moldova Independence Day","27 August","Chisinau"],[11,19,"monaco-national-day","Monaco National Day","19 November","Monaco"],[7,13,"montenegro-statehood-day","Montenegro Statehood Day","13 July","Podgorica"],[4,27,"king-s-day","King's Day","27 April","Amsterdam"],[9,8,"north-macedonia-independence-day","North Macedonia Independence Day","8 September","Skopje"],[5,17,"norwegian-constitution-day","Norwegian Constitution Day","17 May","Oslo"],[11,11,"poland-independence-day","Poland Independence Day","11 November","Warsaw"],[6,10,"portugal-day","Portugal Day","10 June","Lisbon"],[12,1,"great-union-day","Great Union Day","1 December","Bucharest"],[6,12,"russia-day","Russia Day","12 June","Moscow"],[9,3,"san-marino-foundation-day","San Marino Foundation Day","3 September","City of San Marino"],[2,15,"serbia-statehood-day","Serbia Statehood Day","15 February","Belgrade"],[9,1,"slovakia-constitution-day","Slovakia Constitution Day","1 September","Bratislava"],[6,25,"slovenia-statehood-day","Slovenia Statehood Day","25 June","Ljubljana"],[10,12,"spain-national-day","Spain National Day","12 October","Madrid"],[6,6,"sweden-national-day","Sweden National Day","6 June","Stockholm"],[8,1,"swiss-national-day","Swiss National Day","1 August","Bern"],[10,29,"republic-day-of-turkey","Republic Day of Turkey","29 October","Ankara"],[8,24,"ukraine-independence-day","Ukraine Independence Day","24 August","Kyiv"],[2,22,"chair-of-saint-peter","Chair of Saint Peter","22 February","Vatican City"],[9,7,"brazil-independence-day","Brazil Independence Day","7 September","Brasilia"],[9,18,"chile-independence-day-and-fiestas-patrias","Chile Fiestas Patrias","18 September","Santiago"],[10,10,"fiji-day","Fiji Day","10 October","Suva"],[8,19,"afghanistan-national-day","Afghanistan National Day","19 August","Kabul"],[7,5,"algeria-national-day","Algeria National Day","5 July","Algiers"],[11,11,"angola-national-day","Angola National Day","11 November","Luanda"],[11,1,"antigua-and-barbuda-national-day","Antigua and Barbuda National Day","1 November","St John's"],[7,9,"argentina-national-day","Argentina National Day","9 July","Buenos Aires"],[1,26,"australia-national-day","Australia National Day","26 January","Sydney"],[7,10,"bahamas-national-day","Bahamas National Day","10 July","Nassau"],[12,16,"bahrain-national-day","Bahrain National Day","16 December","Manama"],[3,26,"bangladesh-national-day","Bangladesh National Day","26 March","Dhaka"],[11,30,"barbados-national-day","Barbados National Day","30 November","Bridgetown"],[9,21,"belize-national-day","Belize National Day","21 September","Belize City"],[8,1,"benin-national-day","Benin National Day","1 August","Cotonou"],[12,17,"bhutan-national-day","Bhutan National Day","17 December","Thimphu"],[8,6,"bolivia-national-day","Bolivia National Day","6 August","La Paz"],[9,30,"botswana-national-day","Botswana National Day","30 September","Gaborone"],[2,23,"brunei-national-day","Brunei National Day","23 February","Bandar Seri Begawan"],[12,11,"burkina-faso-national-day","Burkina Faso National Day","11 December","Ouagadougou"],[7,1,"burundi-national-day","Burundi National Day","1 July","Bujumbura"],[7,5,"cabo-verde-national-day","Cabo Verde National Day","5 July","Praia"],[11,9,"cambodia-national-day","Cambodia National Day","9 November","Phnom Penh"],[5,20,"cameroon-national-day","Cameroon National Day","20 May","Yaounde"],[7,1,"canada-national-day","Canada National Day","1 July","Ottawa"],[12,1,"central-african-republic-national-day","Central African Republic National Day","1 December","Bangui"],[8,11,"chad-national-day","Chad National Day","11 August","NDjamena"],[10,1,"china-national-day","China National Day","1 October","Beijing"],[7,20,"colombia-national-day","Colombia National Day","20 July","Bogotá"],[7,6,"comoros-national-day","Comoros National Day","6 July","Moroni"],[9,15,"costa-rica-national-day","Costa Rica National Day","15 September","San José"],[1,1,"cuba-national-day","Cuba National Day","1 January","Havana"],[6,30,"democratic-republic-of-the-congo-national-day","Democratic Republic of the Congo National Day","30 June","Kinshasa"],[6,27,"djibouti-national-day","Djibouti National Day","27 June","Djibouti City"],[11,3,"dominica-national-day","Dominica National Day","3 November","Roseau"],[2,27,"dominican-republic-national-day","Dominican Republic National Day","27 February","Santo Domingo"],[8,10,"ecuador-national-day","Ecuador National Day","10 August","Quito"],[7,23,"egypt-national-day","Egypt National Day","23 July","Cairo"],[9,15,"el-salvador-national-day","El Salvador National Day","15 September","San Salvador"],[4,23,"england-national-day","England National Day","23 April","London"],[10,12,"equatorial-guinea-national-day","Equatorial Guinea National Day","12 October","Malabo"],[5,24,"eritrea-national-day","Eritrea National Day","24 May","Asmara"],[9,6,"eswatini-national-day","Eswatini National Day","6 September","Mbabane"],[5,28,"ethiopia-national-day","Ethiopia National Day","28 May","Addis Ababa"],[7,29,"faroe-islands-national-day","Faroe Islands National Day","29 July","Tórshavn"],[8,17,"gabon-national-day","Gabon National Day","17 August","Libreville"],[2,18,"gambia-national-day","Gambia National Day","18 February","Banjul"],[3,6,"ghana-national-day","Ghana National Day","6 March","Accra"],[6,21,"greenland-national-day","Greenland National Day","21 June","Nuuk"],[2,7,"grenada-national-day","Grenada National Day","7 February","St George's"],[9,15,"guatemala-national-day","Guatemala National Day","15 September","Guatemala City"],[9,24,"guinea-bissau-national-day","Guinea-Bissau National Day","24 September","Bissau"],[10,2,"guinea-national-day","Guinea National Day","2 October","Conakry"],[2,23,"guyana-national-day","Guyana National Day","23 February","Georgetown"],[1,1,"haiti-national-day","Haiti National Day","1 January","Port-au-Prince"],[9,15,"honduras-national-day","Honduras National Day","15 September","Tegucigalpa"],[8,15,"india-national-day","India National Day","15 August","Delhi"],[8,17,"indonesia-national-day","Indonesia National Day","17 August","Jakarta"],[2,11,"iran-national-day","Iran National Day","11 February","Tehran"],[10,3,"iraq-national-day","Iraq National Day","3 October","Baghdad"],[4,23,"israel-national-day","Israel National Day","5 Iyar","Jerusalem"],[8,7,"ivory-coast-national-day","Ivory Coast National Day","7 August","Abidjan"],[8,6,"jamaica-national-day","Jamaica National Day","6 August","Kingston"],[2,11,"japan-national-day","Japan National Day","11 February","Tokyo"],[5,25,"jordan-national-day","Jordan National Day","25 May","Amman"],[10,25,"kazakhstan-national-day","Kazakhstan National Day","25 October","Astana"],[12,12,"kenya-national-day","Kenya National Day","12 December","Nairobi"],[7,12,"kiribati-national-day","Kiribati National Day","12 July","South Tarawa"],[2,25,"kuwait-national-day","Kuwait National Day","25 February","Kuwait City"],[8,31,"kyrgyzstan-national-day","Kyrgyzstan National Day","31 August","Bishkek"],[12,2,"laos-national-day","Laos National Day","2 December","Vientiane"],[11,22,"lebanon-national-day","Lebanon National Day","22 November","Beirut"],[10,4,"lesotho-national-day","Lesotho National Day","4 October","Maseru"],[7,26,"liberia-national-day","Liberia National Day","26 July","Monrovia"],[12,24,"libya-national-day","Libya National Day","24 December","Tripoli"],[6,26,"madagascar-national-day","Madagascar National Day","26 June","Antananarivo"],[7,6,"malawi-national-day","Malawi National Day","6 July","Lilongwe"],[8,31,"malaysia-national-day","Malaysia National Day","31 August","Kuala Lumpur"],[7,26,"maldives-national-day","Maldives National Day","26 July","Male"],[9,22,"mali-national-day","Mali National Day","22 September","Bamako"],[5,1,"marshall-islands-national-day","Marshall Islands National Day","1 May","Majuro"],[11,28,"mauritania-national-day","Mauritania National Day","28 November","Nouakchott"],[3,12,"mauritius-national-day","Mauritius National Day","12 March","Port Louis"],[9,16,"mexico-national-day","Mexico National Day","16 September","Mexico City"],[11,3,"micronesia-national-day","Micronesia National Day","3 November","Palikir"],[7,11,"mongolia-national-day","Mongolia National Day","11 July","Ulaanbaatar"],[11,18,"morocco-national-day","Morocco National Day","18 November","Rabat"],[6,25,"mozambique-national-day","Mozambique National Day","25 June","Maputo"],[1,4,"myanmar-national-day","Myanmar National Day","4 January","Yangon"],[3,21,"namibia-national-day","Namibia National Day","21 March","Windhoek"],[1,31,"nauru-national-day","Nauru National Day","31 January","Yaren"],[9,20,"nepal-national-day","Nepal National Day","20 September","Kathmandu"],[2,6,"new-zealand-national-day","New Zealand National Day","6 February","Waitangi"],[9,15,"nicaragua-national-day","Nicaragua National Day","15 September","Managua"],[8,3,"niger-national-day","Niger National Day","3 August","Niamey"],[10,1,"nigeria-national-day","Nigeria National Day","1 October","Abuja"],[9,9,"north-korea-national-day","North Korea National Day","9 September","Pyongyang"],[11,18,"oman-national-day","Oman National Day","18 November","Muscat"],[8,14,"pakistan-national-day","Pakistan National Day","14 August","Islamabad"],[10,1,"palau-national-day","Palau National Day","1 October","Koror"],[11,15,"palestine-national-day","Palestine National Day","15 November","Ramallah"],[11,3,"panama-national-day","Panama National Day","3 November","Panama City"],[9,16,"papua-new-guinea-national-day","Papua New Guinea National Day","16 September","Port Moresby"],[5,14,"paraguay-national-day","Paraguay National Day","14 May","Asunción"],[7,28,"peru-national-day","Peru National Day","28 July","Lima"],[6,12,"philippines-national-day","Philippines National Day","12 June","Manila"],[12,18,"qatar-national-day","Qatar National Day","18 December","Doha"],[8,15,"republic-of-the-congo-national-day","Republic of the Congo National Day","15 August","Brazzaville"],[7,1,"rwanda-national-day","Rwanda National Day","1 July","Kigali"],[9,19,"saint-kitts-and-nevis-national-day","Saint Kitts and Nevis National Day","19 September","Basseterre"],[2,22,"saint-lucia-national-day","Saint Lucia National Day","22 February","Castries"],[10,27,"saint-vincent-and-the-grenadines-national-day","Saint Vincent and the Grenadines National Day","27 October","Kingstown"],[6,1,"samoa-national-day","Samoa National Day","1 June","Apia"],[7,12,"sao-tome-and-principe-national-day","Sao Tome and Principe National Day","12 July","Sao Tome"],[9,23,"saudi-arabia-national-day","Saudi Arabia National Day","23 September","Riyadh"],[11,30,"scotland-national-day","Scotland National Day","30 November","Edinburgh"],[4,4,"senegal-national-day","Senegal National Day","4 April","Dakar"],[6,29,"seychelles-national-day","Seychelles National Day","29 June","Victoria"],[4,27,"sierra-leone-national-day","Sierra Leone National Day","27 April","Freetown"],[8,9,"singapore-national-day","Singapore National Day","9 August","Singapore"],[7,7,"solomon-islands-national-day","Solomon Islands National Day","7 July","Honiara"],[7,1,"somalia-national-day","Somalia National Day","1 July","Mogadishu"],[4,27,"south-africa-national-day","South Africa National Day","27 April","Cape Town"],[8,15,"south-korea-national-day","South Korea National Day","15 August","Seoul"],[7,9,"south-sudan-national-day","South Sudan National Day","9 July","Juba"],[2,4,"sri-lanka-national-day","Sri Lanka National Day","4 February","Colombo"],[1,1,"sudan-national-day","Sudan National Day","1 January","Khartoum"],[11,25,"suriname-national-day","Suriname National Day","25 November","Paramaribo"],[4,17,"syria-national-day","Syria National Day","17 April","Damascus"],[10,10,"taiwan-national-day","Taiwan National Day","10 October","Taipei"],[9,9,"tajikistan-national-day","Tajikistan National Day","9 September","Dushanbe"],[12,9,"tanzania-national-day","Tanzania National Day","9 December","Dar es Salaam"],[12,5,"thailand-national-day","Thailand National Day","5 December","Bangkok"],[11,28,"timor-leste-national-day","Timor-Leste National Day","28 November","Dili"],[4,27,"togo-national-day","Togo National Day","27 April","Lome"],[11,4,"tonga-national-day","Tonga National Day","4 November","Nuku'alofa"],[8,31,"trinidad-and-tobago-national-day","Trinidad and Tobago National Day","31 August","Port of Spain"],[3,20,"tunisia-national-day","Tunisia National Day","20 March","Tunis"],[9,27,"turkmenistan-national-day","Turkmenistan National Day","27 September","Ashgabat"],[10,1,"tuvalu-national-day","Tuvalu National Day","1 October","Funafuti"],[10,9,"uganda-national-day","Uganda National Day","9 October","Kampala"],[12,2,"united-arab-emirates-national-day","United Arab Emirates National Day","2 December","Abu Dhabi"],[6,14,"united-kingdom-national-day","United Kingdom National Day","Second Saturday in June","London"],[8,25,"uruguay-national-day","Uruguay National Day","25 August","Montevideo"],[7,4,"usa-national-day","United States Independence Day","4 July","Washington, D.C."],[9,1,"uzbekistan-national-day","Uzbekistan National Day","1 September","Tashkent"],[7,30,"vanuatu-national-day","Vanuatu National Day","30 July","Port Vila"],[7,5,"venezuela-national-day","Venezuela National Day","5 July","Caracas"],[9,2,"vietnam-national-day","Vietnam National Day","2 September","Hanoi"],[3,1,"wales-national-day","Wales National Day","1 March","Cardiff"],[5,22,"yemen-national-day","Yemen National Day","22 May","Sana'a"],[10,24,"zambia-national-day","Zambia National Day","24 October","Lusaka"],[4,18,"zimbabwe-national-day","Zimbabwe National Day","18 April","Harare"]];

  /* continent/countrySlug per national-day slug — same pairing the event pages
     use for their flag (scripts/data/national-days.json, generated from the
     national-days CSV). Covers all 202 ND entries; the old hand-picked ~60-slug
     emoji map left the rest falling back to a plain globe, and Windows doesn't
     render flag emoji glyphs at all — it shows the raw two-letter code instead
     ("IN" instead of 🇮🇳). Real flag.svg images render identically everywhere
     and match what every other flag on the site already uses. See BUG-0059. */
  var ND_FLAG = {"albania-independence-day":"europe/albania","our-lady-of-meritxell-day":"europe/andorra","armenia-independence-day":"europe/armenia","austria-national-day":"europe/austria","azerbaijan-republic-day":"europe/azerbaijan","belarus-independence-day":"europe/belarus","belgian-national-day":"europe/belgium","bosnia-and-herzegovina-statehood-day":"europe/bosnia-and-herzegovina","bulgaria-liberation-day":"europe/bulgaria","croatia-statehood-day":"europe/croatia","cyprus-independence-day":"europe/cyprus","czech-independent-state-day":"europe/czechia","denmark-constitution-day":"europe/denmark","estonia-independence-day":"europe/estonia","finland-independence-day":"europe/finland","bastille-day":"europe/france","georgia-independence-day":"europe/georgia","day-of-german-unity":"europe/germany","greek-independence-day":"europe/greece","saint-stephen-s-day":"europe/hungary","iceland-national-day":"europe/iceland","saint-patrick-s-day":"europe/ireland","festa-della-repubblica":"europe/italy","kosovo-independence-day":"europe/kosovo","latvia-independence-day":"europe/latvia","liechtenstein-national-day":"europe/liechtenstein","lithuania-independence-day":"europe/lithuania","luxembourg-national-day":"europe/luxembourg","malta-freedom-day":"europe/malta","moldova-independence-day":"europe/moldova","monaco-national-day":"europe/monaco","montenegro-statehood-day":"europe/montenegro","king-s-day":"europe/netherlands","north-macedonia-independence-day":"europe/north-macedonia","norwegian-constitution-day":"europe/norway","poland-independence-day":"europe/poland","portugal-day":"europe/portugal","great-union-day":"europe/romania","russia-day":"europe/russia","san-marino-foundation-day":"europe/san-marino","serbia-statehood-day":"europe/serbia","slovakia-constitution-day":"europe/slovakia","slovenia-statehood-day":"europe/slovenia","spain-national-day":"europe/spain","sweden-national-day":"europe/sweden","swiss-national-day":"europe/switzerland","republic-day-of-turkey":"europe/turkey","ukraine-independence-day":"europe/ukraine","chair-of-saint-peter":"europe/vatican-city","brazil-independence-day":"south-america/brazil","chile-independence-day-and-fiestas-patrias":"south-america/chile","fiji-day":"oceania/fiji","afghanistan-national-day":"asia/afghanistan","algeria-national-day":"africa/algeria","angola-national-day":"africa/angola","antigua-and-barbuda-national-day":"north-america/antigua-and-barbuda","argentina-national-day":"south-america/argentina","australia-national-day":"oceania/australia","bahamas-national-day":"north-america/bahamas","bahrain-national-day":"asia/bahrain","bangladesh-national-day":"asia/bangladesh","barbados-national-day":"north-america/barbados","belize-national-day":"north-america/belize","benin-national-day":"africa/benin","bhutan-national-day":"asia/bhutan","bolivia-national-day":"south-america/bolivia","botswana-national-day":"africa/botswana","brunei-national-day":"asia/brunei","burkina-faso-national-day":"africa/burkina-faso","burundi-national-day":"africa/burundi","cabo-verde-national-day":"africa/cabo-verde","cambodia-national-day":"asia/cambodia","cameroon-national-day":"africa/cameroon","canada-national-day":"north-america/canada","central-african-republic-national-day":"africa/central-african-republic","chad-national-day":"africa/chad","china-national-day":"asia/china","colombia-national-day":"south-america/colombia","comoros-national-day":"africa/comoros","costa-rica-national-day":"north-america/costa-rica","cuba-national-day":"north-america/cuba","democratic-republic-of-the-congo-national-day":"africa/democratic-republic-of-the-congo","djibouti-national-day":"africa/djibouti","dominica-national-day":"north-america/dominica","dominican-republic-national-day":"north-america/dominican-republic","ecuador-national-day":"south-america/ecuador","egypt-national-day":"africa/egypt","el-salvador-national-day":"north-america/el-salvador","england-national-day":"europe/england","equatorial-guinea-national-day":"africa/equatorial-guinea","eritrea-national-day":"africa/eritrea","eswatini-national-day":"africa/eswatini","ethiopia-national-day":"africa/ethiopia","faroe-islands-national-day":"europe/faroe-islands","gabon-national-day":"africa/gabon","gambia-national-day":"africa/gambia","ghana-national-day":"africa/ghana","greenland-national-day":"north-america/greenland","grenada-national-day":"north-america/grenada","guatemala-national-day":"north-america/guatemala","guinea-bissau-national-day":"africa/guinea-bissau","guinea-national-day":"africa/guinea","guyana-national-day":"south-america/guyana","haiti-national-day":"north-america/haiti","honduras-national-day":"north-america/honduras","india-national-day":"asia/india","indonesia-national-day":"asia/indonesia","iran-national-day":"asia/iran","iraq-national-day":"asia/iraq","israel-national-day":"asia/israel","ivory-coast-national-day":"africa/ivory-coast","jamaica-national-day":"north-america/jamaica","japan-national-day":"asia/japan","jordan-national-day":"asia/jordan","kazakhstan-national-day":"asia/kazakhstan","kenya-national-day":"africa/kenya","kiribati-national-day":"oceania/kiribati","kuwait-national-day":"asia/kuwait","kyrgyzstan-national-day":"asia/kyrgyzstan","laos-national-day":"asia/laos","lebanon-national-day":"asia/lebanon","lesotho-national-day":"africa/lesotho","liberia-national-day":"africa/liberia","libya-national-day":"africa/libya","madagascar-national-day":"africa/madagascar","malawi-national-day":"africa/malawi","malaysia-national-day":"asia/malaysia","maldives-national-day":"asia/maldives","mali-national-day":"africa/mali","marshall-islands-national-day":"oceania/marshall-islands","mauritania-national-day":"africa/mauritania","mauritius-national-day":"africa/mauritius","mexico-national-day":"north-america/mexico","micronesia-national-day":"oceania/micronesia","mongolia-national-day":"asia/mongolia","morocco-national-day":"africa/morocco","mozambique-national-day":"africa/mozambique","myanmar-national-day":"asia/myanmar","namibia-national-day":"africa/namibia","nauru-national-day":"oceania/nauru","nepal-national-day":"asia/nepal","new-zealand-national-day":"oceania/new-zealand","nicaragua-national-day":"north-america/nicaragua","niger-national-day":"africa/niger","nigeria-national-day":"africa/nigeria","north-korea-national-day":"asia/north-korea","oman-national-day":"asia/oman","pakistan-national-day":"asia/pakistan","palau-national-day":"oceania/palau","palestine-national-day":"asia/palestine","panama-national-day":"north-america/panama","papua-new-guinea-national-day":"oceania/papua-new-guinea","paraguay-national-day":"south-america/paraguay","peru-national-day":"south-america/peru","philippines-national-day":"asia/philippines","qatar-national-day":"asia/qatar","republic-of-the-congo-national-day":"africa/republic-of-the-congo","rwanda-national-day":"africa/rwanda","saint-kitts-and-nevis-national-day":"north-america/saint-kitts-and-nevis","saint-lucia-national-day":"north-america/saint-lucia","saint-vincent-and-the-grenadines-national-day":"north-america/saint-vincent-and-the-grenadines","samoa-national-day":"oceania/samoa","sao-tome-and-principe-national-day":"africa/sao-tome-and-principe","saudi-arabia-national-day":"asia/saudi-arabia","scotland-national-day":"europe/scotland","senegal-national-day":"africa/senegal","seychelles-national-day":"africa/seychelles","sierra-leone-national-day":"africa/sierra-leone","singapore-national-day":"asia/singapore","solomon-islands-national-day":"oceania/solomon-islands","somalia-national-day":"africa/somalia","south-africa-national-day":"africa/south-africa","south-korea-national-day":"asia/south-korea","south-sudan-national-day":"africa/south-sudan","sri-lanka-national-day":"asia/sri-lanka","sudan-national-day":"africa/sudan","suriname-national-day":"south-america/suriname","syria-national-day":"asia/syria","taiwan-national-day":"asia/taiwan","tajikistan-national-day":"asia/tajikistan","tanzania-national-day":"africa/tanzania","thailand-national-day":"asia/thailand","timor-leste-national-day":"asia/timor-leste","togo-national-day":"africa/togo","tonga-national-day":"oceania/tonga","trinidad-and-tobago-national-day":"north-america/trinidad-and-tobago","tunisia-national-day":"africa/tunisia","turkmenistan-national-day":"asia/turkmenistan","tuvalu-national-day":"oceania/tuvalu","uganda-national-day":"africa/uganda","united-arab-emirates-national-day":"asia/united-arab-emirates","united-kingdom-national-day":"europe/united-kingdom","uruguay-national-day":"south-america/uruguay","usa-national-day":"north-america/usa","uzbekistan-national-day":"asia/uzbekistan","vanuatu-national-day":"oceania/vanuatu","venezuela-national-day":"south-america/venezuela","vietnam-national-day":"asia/vietnam","wales-national-day":"europe/wales","yemen-national-day":"asia/yemen","zambia-national-day":"africa/zambia","zimbabwe-national-day":"africa/zimbabwe"};
  function ndFlagSrc(slug) {
    var path = ND_FLAG[slug];
    return path ? '/content/locations/' + path + '/img/flag.svg' : '';
  }

  var today = new Date();
  var todayM = today.getMonth() + 1;
  var todayD = today.getDate();

  function todayHref(href) {
    return href && href.charAt(0) === '/' ? href.slice(1) : href;
  }

  /* Every entry starts with the same kind of flag: a real flag.svg for a
     national day, a globe emoji only for a non-country global/climate day —
     never a mix of image, emoji and raw two-letter fallback text. */
  function flagMarkup(it, cls, w, h) {
    return it.flagImg
      ? '<img class="' + cls + '" src="' + it.flagImg + '" alt="" width="' + w + '" height="' + h + '" loading="lazy">'
      : '<span class="' + cls + ' ' + cls + '--globe">' + (it.flag || '🌍') + '</span>';
  }

  function renderTodayCard(it) {
    return '<a class="today-card today-card--' + it.type + '" href="' + todayHref(it.href) + '">' +
      '<div class="today-card__media">' +
        '<img src="' + it.img + '" alt="" width="200" height="130" loading="lazy">' +
        flagMarkup(it, 'today-card__flag', 28, 19) +
      '</div>' +
      '<div class="today-card__body">' +
        '<div class="today-card__label">' + it.label + '</div>' +
        '<div class="today-card__title">' + it.title + '</div>' +
        (it.sub ? '<div class="today-card__sub">' + it.sub + '</div>' : '') +
      '</div>' +
      '</a>';
  }

  /* Compact row for entries 2..n. Up to five national days share a date
     (1 Oct, 15 Sep) — one card each made the column drive the whole
     today+featured grid row and pushed the page down. See BUG-0059. */
  function renderTodayRow(it) {
    return '<a class="today-row today-row--' + it.type + '" href="' + todayHref(it.href) + '">' +
      flagMarkup(it, 'today-row__flag', 18, 12) +
      '<span class="today-row__title">' + it.title + '</span>' +
      '</a>';
  }

  var todayItems = [];

  function renderTodayCol() {
    if (!todayItems.length) return;
    var col = document.getElementById('today-col');
    var wrapper = document.getElementById('today-featured');
    if (!col || !wrapper) return;
    col.innerHTML =
      '<div class="today-col-head">' +
        '<h2>Happening today</h2>' +
        '<a href="content/categories/culture/national-day.html">All →</a>' +
      '</div>' +
      renderTodayCard(todayItems[0]) +
      (todayItems.length > 1
        ? '<div class="today-list">' + todayItems.slice(1).map(renderTodayRow).join('') + '</div>'
        : '');
    wrapper.classList.add('has-today');
  }

  function daysLeft(endDateStr) {
    var end = new Date(endDateStr + 'T00:00:00');
    var d = Math.round((end - new Date(new Date().toDateString())) / 86400000);
    return d <= 0 ? 'ends today' : 'ends in ' + d + (d === 1 ? ' day' : ' days');
  }

  /* SYNCHRONOUS: runs before first paint — no fetch, no timeout */
  ND.filter(function(e) { return e[0] === todayM && e[1] === todayD; })
    .forEach(function(e) {
      todayItems.push({
        type: 'nd',
        href: 'content/categories/culture/national-day/events/' + e[2] + '.html',
        img: '/content/categories/culture/national-day/events/img/' + e[2] + '-mini-200.webp',
        flagImg: ndFlagSrc(e[2]),
        label: 'National day',
        title: e[3],
        /* Guard against a hand-pasted "name,desc,name,desc…" blob landing in
           the city slot (see BUG-0060) — ND has no build step, so a bad edit
           here has nothing else to catch it. A real city/region name can have
           one comma ("Washington, D.C.") but a leaked blob always has several
           (one pair per item) — only clip at >=3 commas, at the first pair
           boundary, so the legitimate case is untouched. */
        sub: e[4] + ' · ' + (function (city) {
          var parts = city.split(',');
          return parts.length > 3 ? parts[0] : city;
        })(String(e[5]))
      });
    });
  renderTodayCol();

  /* ASYNC: global days + happening now (non-critical, below fold) */
  window.addEventListener('load', function() {
    window.setTimeout(function() {

      /* Global / climate awareness days */
      fetch('/assets/data/global-days.json', { cache: 'force-cache' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var before = todayItems.length;
          data.filter(function(e) { return e.month === todayM && e.day === todayD; })
            .forEach(function(e) {
              todayItems.push({
                type: 'climate',
                href: e.href || '#',
                img: e.imgSrc || '/assets/icons/one-sliders-icon.svg',
                flag: e.flag || '🌍',
                label: e.label || 'Today',
                title: e.title,
                sub: e.sub || ''
              });
            });
          /* Re-render rather than append: with no national day today the first
             global day becomes the card, otherwise they join the compact list. */
          if (todayItems.length !== before) renderTodayCol();
        })
        .catch(function() {});

      /* Happening now */
      fetch('/events.register.json', { cache: 'force-cache' })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var todayStr = today.getFullYear() + '-' +
            String(todayM).padStart(2,'0') + '-' +
            String(todayD).padStart(2,'0');
          var ongoing = data.events.filter(function(e) {
            return e.startDate && e.endDate &&
              e.startDate <= todayStr && e.endDate >= todayStr &&
              e.status !== 'unknown' &&
              e.topic !== 'national-day';
          });
          if (!ongoing.length) return;
          var grid = document.getElementById('happening-now-grid');
          var sec  = document.getElementById('happening-now');
          if (!grid || !sec) return;
          grid.innerHTML = ongoing.map(function(e) {
            var imgBase = e.eventPageEN
              ? '/' + e.eventPageEN.replace(/\/[^/]+\.html$/, '/img/' + e.slug + '-mini-200.webp')
              : '';
            var catLabel = (e.category || 'event');
            catLabel = catLabel.charAt(0).toUpperCase() + catLabel.slice(1);
            var ends = daysLeft(e.endDate);
            return '<a class="happening-card" href="' + ((e.eventPageEN || '#').replace(/^\/+/, '')) + '">' +
              '<div class="happening-card__media">' +
                (imgBase ? '<img src="' + imgBase + '" alt="" width="200" height="120" loading="lazy">' : '') +
                '<span class="happening-card__cat">' + catLabel + '</span>' +
                '<span class="happening-card__ends">' + ends + '</span>' +
              '</div>' +
              '<div class="happening-card__body">' +
                '<div class="happening-card__title">' + e.title + '</div>' +
                '<div class="happening-card__sub">' + (e.location && e.location.countries ? e.location.countries[0] : '') + '</div>' +
              '</div>' +
              '</a>';
          }).join('');
          sec.style.display = '';
        })
        .catch(function() {});

    }, 200);
  }, { once: true });
})();
