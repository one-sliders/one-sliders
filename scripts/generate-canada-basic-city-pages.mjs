import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const countryDir = path.join(root, 'content/locations/north-america/canada');
const imgDir = path.join(countryDir, 'img');
const siteBase = 'https://one-sliders.com';
const bookingWrapper = 'https://www.jdoqocy.com/click-101771061-17293132?url=';

const cities = [
  {
    slug: 'toronto',
    name: 'Toronto',
    province: 'Ontario',
    region: 'Greater Toronto Area',
    population: '2,794,356 city (2021 census)',
    role: 'Canada urban hub',
    knownFor: 'CN Tower, museums & sport',
    intro: 'Canada city base for skyline views, museums, sport and food',
    airport: 'Toronto Pearson International Airport (YYZ)',
    coords: [43.6532, -79.3832],
    areas: ['Downtown Toronto', 'Entertainment District', 'Yorkville', 'Waterfront', 'West Queen West', 'The Annex'],
    highlights: ['CN Tower', 'Royal Ontario Museum', 'Toronto Islands', 'Distillery District', 'Kensington Market', 'Scotiabank Arena'],
    events: ['Toronto International Film Festival', 'Canadian National Exhibition', 'Pride Toronto', 'Toronto Caribbean Carnival']
  },
  {
    slug: 'vancouver',
    name: 'Vancouver',
    province: 'British Columbia',
    region: 'Lower Mainland',
    population: '662,248 city (2021 census)',
    role: 'Pacific Coast hub',
    knownFor: 'Stanley Park, seawall & mountains',
    intro: 'Pacific city for mountains, ocean, food and cruise trips',
    airport: 'Vancouver International Airport (YVR)',
    coords: [49.2827, -123.1207],
    areas: ['Downtown Vancouver', 'Yaletown', 'Coal Harbour', 'Gastown', 'Kitsilano'],
    highlights: ['Stanley Park', 'Granville Island', 'Canada Place', 'Gastown', 'Kitsilano Beach', 'North Shore mountains'],
    events: ['Celebration of Light', 'Vancouver International Film Festival', 'Vancouver Pride', 'Dine Out Vancouver Festival']
  },
  {
    slug: 'montreal',
    name: 'Montreal',
    province: 'Quebec',
    region: 'St. Lawrence corridor',
    population: '1,762,949 city (2021 census)',
    role: 'Quebec urban hub',
    knownFor: 'Old Montreal, festivals & food',
    intro: 'Francophone city for festivals, old-town streets, food and nightlife',
    airport: 'Montreal-Trudeau International Airport (YUL)',
    coords: [45.5017, -73.5673],
    areas: ['Old Montreal', 'Downtown Montreal', 'Plateau Mont-Royal', 'Quartier des Spectacles', 'Mile End', 'Griffintown'],
    highlights: ['Old Montreal', 'Mount Royal', 'Notre-Dame Basilica', 'Jean-Drapeau Park', 'Mile End', 'Formula 1 weekend'],
    events: ['Montreal International Jazz Festival', 'Canadian Grand Prix', 'Just for Laughs', 'Igloofest']
  },
  {
    slug: 'quebec-city',
    name: 'Quebec City',
    province: 'Quebec',
    region: 'Capitale-Nationale',
    population: '549,459 city (2021 census)',
    role: 'Historic St. Lawrence base',
    knownFor: 'Old Quebec & Winter Carnival',
    intro: 'Walled old-town base for history, winter trips and St. Lawrence views',
    airport: 'Quebec City Jean Lesage International Airport (YQB)',
    coords: [46.8139, -71.208],
    areas: ['Old Quebec', 'Saint-Roch', 'Montcalm', 'Sainte-Foy', 'Beauport'],
    highlights: ['Old Quebec', 'Chateau Frontenac', 'Petit-Champlain', 'Plains of Abraham', 'Montmorency Falls', 'Winter Carnival'],
    events: ['Quebec Winter Carnival', "Festival d'ete de Quebec", 'New France Festival', 'Quebec City Film Festival']
  },
  {
    slug: 'calgary',
    name: 'Calgary',
    province: 'Alberta',
    region: 'Southern Alberta',
    population: '1,306,784 city (2021 census)',
    role: 'Rockies gateway',
    knownFor: 'Stampede, skyline & mountain access',
    intro: 'Prairie city for rodeo culture, skyline views and Rocky Mountain access',
    airport: 'Calgary International Airport (YYC)',
    coords: [51.0447, -114.0719],
    areas: ['Downtown Calgary', 'Beltline', 'East Village', 'Kensington', 'Inglewood', 'Airport area'],
    highlights: ['Calgary Tower', 'Calgary Stampede', 'Bow River Pathway', 'Studio Bell', 'Inglewood', 'Banff day trips'],
    events: ['Calgary Stampede', 'Calgary Folk Music Festival', 'Sled Island', 'GlobalFest']
  },
  {
    slug: 'ottawa',
    name: 'Ottawa',
    province: 'Ontario',
    region: 'National Capital Region',
    population: '1,017,449 city (2021 census)',
    role: 'Capital city base',
    knownFor: 'Parliament, museums & Rideau Canal',
    intro: 'Capital city for Parliament, national museums and Rideau Canal trips',
    airport: 'Ottawa International Airport (YOW)',
    coords: [45.4215, -75.6972],
    areas: ['Downtown Ottawa', 'ByWard Market', 'Centretown', 'The Glebe', 'Westboro', 'Gatineau'],
    highlights: ['Parliament Hill', 'Rideau Canal', 'ByWard Market', 'National Gallery', 'Canadian Museum of History', 'Gatineau Park'],
    events: ['Winterlude', 'Canada Day in Ottawa', 'Canadian Tulip Festival', 'Ottawa Bluesfest']
  },
  {
    slug: 'banff',
    name: 'Banff',
    province: 'Alberta',
    region: 'Banff National Park',
    population: '8,305 town (2021 census)',
    role: 'Rocky Mountain park town',
    knownFor: 'Lakes, hikes & hot springs',
    intro: 'Rocky Mountain town for lakes, hikes, skiing and hot springs',
    airport: 'Calgary International Airport (YYC)',
    coords: [51.1784, -115.5708],
    areas: ['Banff Avenue', 'Tunnel Mountain', 'Banff Springs area', 'Lake Minnewanka road', 'Canmore overflow'],
    highlights: ['Banff Avenue', 'Sulphur Mountain', 'Bow Falls', 'Lake Minnewanka', 'Banff Upper Hot Springs', 'Ski season'],
    events: ['Banff Mountain Film and Book Festival', 'SnowDays', 'Banff Marathon', 'Banff Centre events']
  },
  {
    slug: 'whistler',
    name: 'Whistler',
    province: 'British Columbia',
    region: 'Sea to Sky Country',
    population: '13,982 municipality (2021 census)',
    role: 'Mountain resort base',
    knownFor: 'Skiing, biking & village stays',
    intro: 'Mountain resort for skiing, biking and village stays',
    airport: 'Vancouver International Airport (YVR)',
    coords: [50.1163, -122.9574],
    areas: ['Whistler Village', 'Upper Village', 'Creekside', 'Function Junction', 'Pemberton overflow'],
    highlights: ['Whistler Blackcomb', 'Peak 2 Peak Gondola', 'Lost Lake', 'Village Stroll', 'Creekside', 'Bike park'],
    events: ['Crankworx Whistler', 'World Ski and Snowboard Festival', 'Whistler Film Festival', 'Whistler Pride and Ski Festival']
  },
  {
    slug: 'niagara-falls',
    name: 'Niagara Falls',
    province: 'Ontario',
    region: 'Niagara Region',
    population: '94,415 city (2021 census)',
    role: 'Waterfall and wine-region base',
    knownFor: 'Horseshoe Falls & viewpoints',
    intro: 'Waterfall city for viewpoints, family trips and wine-region add-ons',
    airport: 'Toronto Pearson International Airport (YYZ)',
    coords: [43.0896, -79.0849],
    areas: ['Fallsview', 'Clifton Hill', 'Downtown Niagara Falls', "Lundy's Lane", 'Niagara-on-the-Lake'],
    highlights: ['Horseshoe Falls', 'Journey Behind the Falls', 'Clifton Hill', 'Niagara Parkway', 'Skylon Tower', 'Wine country'],
    events: ['Winter Festival of Lights', 'Niagara Falls fireworks', 'Niagara Grape and Wine Festival', "New Year's Eve in Niagara Falls"]
  },
  {
    slug: 'victoria',
    name: 'Victoria',
    province: 'British Columbia',
    region: 'Vancouver Island',
    population: '91,867 city (2021 census)',
    role: 'Vancouver Island harbour base',
    knownFor: 'Harbour, gardens & ferries',
    intro: 'Harbour city for gardens, ferries and Vancouver Island trips',
    airport: 'Victoria International Airport (YYJ)',
    coords: [48.4284, -123.3656],
    areas: ['Inner Harbour', 'Downtown Victoria', 'James Bay', 'Fairfield', 'Oak Bay'],
    highlights: ['Inner Harbour', 'Butchart Gardens', 'Royal BC Museum', "Fisherman's Wharf", 'Beacon Hill Park', 'Whale watching'],
    events: ['Victoria Day Parade', 'Rifflandia', 'Victoria Film Festival', 'Canada Day in Victoria']
  },
  {
    slug: 'jasper',
    name: 'Jasper',
    province: 'Alberta',
    region: 'Jasper National Park',
    population: '4,113 municipality (2021 census)',
    role: 'Wild Rockies base',
    knownFor: 'Wildlife, dark skies & Icefields Parkway',
    intro: 'Mountain town for wildlife, dark skies and Icefields Parkway trips',
    airport: 'Edmonton International Airport (YEG)',
    coords: [52.8734, -118.0814],
    areas: ['Jasper townsite', 'Patricia Lake area', 'Pyramid Lake road', 'Highway 93A', 'Hinton overflow'],
    highlights: ['Maligne Lake', 'Jasper SkyTram', 'Pyramid Lake', 'Miette Hot Springs', 'Icefields Parkway', 'Dark Sky Preserve'],
    events: ['Jasper Dark Sky Festival', 'Jasper in January', 'Jasper Canadian Rockies Half Marathon', 'Symphony Under the Stars']
  },
  {
    slug: 'kelowna',
    name: 'Kelowna',
    province: 'British Columbia',
    region: 'Okanagan Valley',
    population: '144,576 city (2021 census)',
    role: 'Okanagan lake and wine base',
    knownFor: 'Lake stays, wineries & summer trips',
    intro: 'Okanagan city for lake stays, wineries and summer trips',
    airport: 'Kelowna International Airport (YLW)',
    coords: [49.888, -119.496],
    areas: ['Downtown Kelowna', 'Waterfront', 'Pandosy', 'Mission', 'West Kelowna'],
    highlights: ['Okanagan Lake', 'Downtown waterfront', 'Myra Canyon', 'Wine trails', 'Knox Mountain', 'Summer beaches'],
    events: ['Okanagan Wine Festivals', 'Center of Gravity', 'Kelowna Pride', 'Parks Alive']
  },
  {
    slug: 'halifax',
    name: 'Halifax',
    province: 'Nova Scotia',
    region: 'Atlantic Canada',
    population: '439,819 municipality (2021 census)',
    role: 'Atlantic harbour city',
    knownFor: 'Waterfront, seafood & coastal trips',
    intro: 'Atlantic harbour city for history, seafood and coastal trips',
    airport: 'Halifax Stanfield International Airport (YHZ)',
    coords: [44.6488, -63.5752],
    areas: ['Downtown Halifax', 'Waterfront', 'North End', 'Dartmouth', 'Spring Garden'],
    highlights: ['Halifax Waterfront', 'Citadel Hill', 'Pier 21', 'Public Gardens', 'Dartmouth ferry', "Peggy's Cove trips"],
    events: ['Halifax Busker Festival', 'Royal Nova Scotia International Tattoo', 'Halifax Jazz Festival', 'Nocturne Halifax']
  },
  {
    slug: 'edmonton',
    name: 'Edmonton',
    province: 'Alberta',
    region: 'Central Alberta',
    population: '1,010,899 city (2021 census)',
    role: 'Northern Alberta capital',
    knownFor: 'River valley, festivals & hockey',
    intro: 'River valley capital for festivals, hockey and northern routes',
    airport: 'Edmonton International Airport (YEG)',
    coords: [53.5461, -113.4938],
    areas: ['Downtown Edmonton', 'Ice District', 'Old Strathcona', 'Whyte Avenue', 'West Edmonton'],
    highlights: ['North Saskatchewan River Valley', 'West Edmonton Mall', 'Ice District', 'Old Strathcona', 'Royal Alberta Museum', 'Festival season'],
    events: ['Edmonton International Fringe Theatre Festival', 'K-Days', 'Edmonton Folk Music Festival', 'Silver Skate Festival']
  },
  {
    slug: 'winnipeg',
    name: 'Winnipeg',
    province: 'Manitoba',
    region: 'Prairies',
    population: '749,607 city (2021 census)',
    role: 'Prairie culture and rail-history base',
    knownFor: 'The Forks, museums & festivals',
    intro: 'Prairie city for museums, festivals and rail-history trips',
    airport: 'Winnipeg Richardson International Airport (YWG)',
    coords: [49.8951, -97.1384],
    areas: ['Downtown Winnipeg', 'The Forks', 'Exchange District', 'Osborne Village', 'St. Boniface'],
    highlights: ['The Forks', 'Canadian Museum for Human Rights', 'Exchange District', 'Assiniboine Park', 'St. Boniface', 'Festival du Voyageur'],
    events: ['Festival du Voyageur', 'Winnipeg Folk Festival', 'Folklorama', 'Winnipeg Fringe Theatre Festival']
  },
  {
    slug: 'st-johns',
    name: "St. John's",
    province: 'Newfoundland and Labrador',
    region: 'Avalon Peninsula',
    population: '110,525 city (2021 census)',
    role: 'Eastern Newfoundland base',
    knownFor: 'Signal Hill, music & colourful streets',
    intro: 'Colourful Atlantic city for cliffs, music and easternmost trips',
    airport: "St. John's International Airport (YYT)",
    coords: [47.5615, -52.7126],
    areas: ["Downtown St. John's", 'Harbourfront', 'Georgestown', 'Quidi Vidi', 'Airport area'],
    highlights: ['Signal Hill', 'George Street', 'Quidi Vidi', 'The Rooms', 'Cape Spear', 'Jellybean Row'],
    events: ['George Street Festival', "Royal St. John's Regatta", 'Newfoundland and Labrador Folk Festival', 'Mummers Festival']
  },
  {
    slug: 'canmore',
    name: 'Canmore',
    province: 'Alberta',
    region: 'Bow Valley',
    population: '15,990 town (2021 census)',
    role: 'Banff access and hiking base',
    knownFor: 'Three Sisters, trails & value stays',
    intro: 'Rockies town for hikes, value stays and Banff access',
    airport: 'Calgary International Airport (YYC)',
    coords: [51.089, -115.359],
    areas: ['Downtown Canmore', 'Spring Creek', 'Three Sisters', "Dead Man's Flats", 'Banff overflow'],
    highlights: ['Three Sisters', 'Grassi Lakes', 'Canmore Nordic Centre', 'Downtown Canmore', 'Bow River', 'Kananaskis access'],
    events: ['Canmore Folk Music Festival', 'Canmore Highland Games', "Rocky Mountain Soap Women's Run", 'Canmore winter events']
  },
  {
    slug: 'tofino',
    name: 'Tofino',
    province: 'British Columbia',
    region: 'Clayoquot Sound',
    population: '2,516 district municipality (2021 census)',
    role: 'Pacific surf and rainforest base',
    knownFor: 'Beaches, storm watching & surf',
    intro: 'Pacific surf town for beaches, rainforest and storm watching',
    airport: 'Tofino-Long Beach Airport (YAZ)',
    coords: [49.1529, -125.9066],
    areas: ['Tofino village', 'Chesterman Beach', 'Cox Bay', 'Pacific Rim area', 'Ucluelet overflow'],
    highlights: ['Long Beach', 'Chesterman Beach', 'Cox Bay', 'Pacific Rim National Park Reserve', 'Hot Springs Cove', 'Storm watching'],
    events: ['Pacific Rim Whale Festival', 'Tofino Food and Wine Festival', 'Queen of the Peak', 'Tofino Lantern Festival']
  },
  {
    slug: 'mont-tremblant',
    name: 'Mont-Tremblant',
    province: 'Quebec',
    region: 'Laurentians',
    population: '10,992 city (2021 census)',
    role: 'Laurentian resort base',
    knownFor: 'Skiing, lakes & resort village',
    intro: 'Laurentian resort town for skiing, lakes and village stays',
    airport: 'Montreal-Trudeau International Airport (YUL)',
    coords: [46.1185, -74.5962],
    areas: ['Tremblant Resort', 'Village sector', 'Downtown Mont-Tremblant', 'Lac-Superieur', 'Saint-Jovite'],
    highlights: ['Tremblant Resort', 'Pedestrian village', 'Mont-Tremblant National Park', 'Lac Tremblant', 'Ski season', 'Autumn colour'],
    events: ['Tremblant International Blues Festival', 'Ironman Mont-Tremblant', '24h Tremblant', 'Ski World Cup events']
  },
  {
    slug: 'lake-louise',
    name: 'Lake Louise',
    province: 'Alberta',
    region: 'Banff National Park',
    population: '691 hamlet (2021 census)',
    role: 'Alpine lake and shuttle base',
    knownFor: 'Lake Louise, Moraine Lake & skiing',
    intro: 'Rockies lake base for alpine scenery, skiing and park shuttles',
    airport: 'Calgary International Airport (YYC)',
    coords: [51.4254, -116.1773],
    areas: ['Lake Louise village', 'Lake Louise lakeshore', 'Ski resort area', 'Moraine Lake shuttle base', 'Banff overflow'],
    highlights: ['Lake Louise lakeshore', 'Moraine Lake access', 'Fairview Lookout', 'Lake Louise Ski Resort', 'Plain of Six Glaciers', 'Ice skating season'],
    events: ['Lake Louise Alpine Ski World Cup', 'Ice Magic Festival', 'Banff National Park events', 'Summer hiking season']
  },
  {
    slug: 'charlottetown',
    name: 'Charlottetown',
    province: 'Prince Edward Island',
    region: 'Prince Edward Island',
    population: '38,809 city (2021 census)',
    role: 'PEI capital and island base',
    knownFor: 'Harbour walks, food & island drives',
    intro: 'Small capital for harbour walks, food and island drives',
    airport: 'Charlottetown Airport (YYG)',
    coords: [46.2382, -63.1311],
    areas: ['Downtown Charlottetown', 'Waterfront', 'Brighton', 'University area', 'Cavendish day-trip base'],
    highlights: ['Confederation Centre', 'Charlottetown waterfront', 'Victoria Row', 'Province House area', 'PEI beaches', 'Seafood'],
    events: ['Charlottetown Festival', 'Old Home Week', 'PEI International Shellfish Festival', 'Canada Day in Charlottetown']
  },
  {
    slug: 'whitehorse',
    name: 'Whitehorse',
    province: 'Yukon',
    region: 'Yukon River valley',
    population: '28,201 city (2021 census)',
    role: 'Yukon wilderness gateway',
    knownFor: 'Aurora, Yukon River & Alaska Highway',
    intro: 'Northern city for wilderness, aurora trips and Yukon routes',
    airport: 'Erik Nielsen Whitehorse International Airport (YXY)',
    coords: [60.7212, -135.0568],
    areas: ['Downtown Whitehorse', 'Riverfront', 'Hillcrest', 'Takhini', 'Airport area'],
    highlights: ['Yukon River', 'SS Klondike', 'Miles Canyon', 'Kwanlin Dun Cultural Centre', 'Aurora viewing', 'Alaska Highway'],
    events: ['Yukon Quest', 'Adaka Cultural Festival', 'Available Light Film Festival', 'Yukon Riverside Arts Festival']
  },
  {
    slug: 'churchill',
    name: 'Churchill',
    province: 'Manitoba',
    region: 'Hudson Bay',
    population: '870 town (2021 census)',
    role: 'Subarctic wildlife base',
    knownFor: 'Polar bears, belugas & aurora',
    intro: 'Remote northern town for polar bears, belugas and aurora',
    airport: 'Churchill Airport (YYQ)',
    coords: [58.7684, -94.1649],
    areas: ['Churchill town centre', 'Hudson Bay waterfront', 'Airport area', 'Tour lodge bases', 'Winnipeg pre-trip base'],
    highlights: ['Polar bear season', 'Beluga whales', 'Northern lights', 'Prince of Wales Fort', 'Hudson Bay', 'Tundra tours'],
    events: ['Polar bear viewing season', 'Beluga whale season', 'Northern lights season', 'Parks Canada programs']
  },
  {
    slug: 'saskatoon',
    name: 'Saskatoon',
    province: 'Saskatchewan',
    region: 'South Saskatchewan River',
    population: '266,141 city (2021 census)',
    role: 'Prairie river city',
    knownFor: 'Bridges, culture & prairie food',
    intro: 'River city for prairie culture, bridges and food',
    airport: 'Saskatoon John G. Diefenbaker International Airport (YXE)',
    coords: [52.1579, -106.67],
    areas: ['Downtown Saskatoon', 'Riversdale', 'Broadway', 'University area', 'Airport area'],
    highlights: ['Meewasin Valley', 'Remai Modern', 'Broadway Avenue', 'Wanuskewin', 'River bridges', 'Prairie food'],
    events: ['SaskTel Saskatchewan Jazz Festival', 'Nutrien Fireworks Festival', 'Folkfest Saskatoon', 'WinterShines']
  },
  {
    slug: 'prince-edward-county',
    name: 'Prince Edward County',
    province: 'Ontario',
    region: 'Lake Ontario',
    population: '25,704 municipality (2021 census)',
    role: 'Lake Ontario wine and beach base',
    knownFor: 'Sandbanks, wineries & small towns',
    intro: 'Lake Ontario county for wineries, beaches and small-town stays',
    airport: 'Toronto Pearson International Airport (YYZ)',
    coords: [44.0007, -77.25],
    areas: ['Picton', 'Wellington', 'Bloomfield', 'Sandbanks area', 'Consecon'],
    highlights: ['Sandbanks Provincial Park', 'Picton', 'Wellington', 'Wine country', 'Lake Ontario beaches', 'Farm-to-table food'],
    events: ['Countylicious', 'PEC Jazz Festival', 'Pumpkinfest', 'Terroir wine festival']
  }
];

function html(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function bookingHref(search) {
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${search.replaceAll(' ', '+')}`;
  return `${bookingWrapper}${encodeURIComponent(bookingUrl)}`;
}

function hasImage(slug, suffix) {
  return fs.existsSync(path.join(imgDir, `${slug}-${suffix}`));
}

function cardButton(search, label = 'Compare stays') {
  return `<a class="stay-booking-button" href="${bookingHref(search)}" target="_blank" rel="nofollow sponsored noopener">${label}</a>`;
}

function areaSearch(city, area) {
  return area.toLowerCase().includes(city.name.toLowerCase())
    ? `${area} ${city.province} Canada`
    : `${area} ${city.name} ${city.province} Canada`;
}

function imageTag(city, index = null) {
  if (index != null && hasImage(city.slug, `see-${index + 1}-mini.png`)) {
    const base = `${city.slug}-see-${index + 1}-mini`;
    return `<img src="/content/locations/north-america/canada/img/${base}.png" srcset="/content/locations/north-america/canada/img/${base}-200.webp 200w, /content/locations/north-america/canada/img/${base}-400.webp 400w" sizes="(max-width:620px) 220px, 400px" alt="${html(city.name)} attraction thumbnail" loading="lazy" width="400" height="300">`;
  }
  const imageSlug = hasImage(city.slug, 'mini.png') ? city.slug : 'canada';
  const label = imageSlug === 'canada' ? 'Canada thumbnail' : `${city.name} thumbnail`;
  return `<img src="/content/locations/north-america/canada/img/${imageSlug}-mini.png" srcset="/content/locations/north-america/canada/img/${imageSlug}-mini-200.webp 200w, /content/locations/north-america/canada/img/${imageSlug}-mini-400.webp 400w" sizes="(max-width:620px) 220px, 400px" alt="${html(label)}" loading="lazy" width="400" height="300">`;
}

function experienceLabel(index) {
  return ['Sight', 'Base', 'Food', 'Event', 'Culture', 'Nearby'][index] || 'Plan';
}

function highlightCopy(item, city) {
  return `${item} is listed as a practical ${city.name} trip focus; compare nearby stays before locking in transport plans.`;
}

function shortExperience(item) {
  return `Open the right tab and shape the trip around ${item.toLowerCase()}.`;
}

function render(city) {
  const title = `${city.name} Travel Guide - Canada`;
  const pageUrl = `${siteBase}/content/locations/north-america/canada/${city.slug}.html`;
  const description = `${city.name}, ${city.province}: Canada travel planning page for stays, routes, weather, events and Booking.com hotel comparisons.`;
  const hero = hasImage(city.slug, 'hero.png') ? `/content/locations/north-america/canada/img/${city.slug}-hero.png` : '/content/locations/north-america/canada/img/canada-hero.png';
  const heroBase = hasImage(city.slug, 'hero.png') ? `/content/locations/north-america/canada/img/${city.slug}` : '/content/locations/north-america/canada/img/canada';
  const heroWebp = `${heroBase}-hero-1200.webp`;
  const heroSrcset = `${heroBase}-hero-400.webp 400w, ${heroBase}-hero-768.webp 768w, ${heroBase}-hero-1200.webp 1200w`;
  const search = `${city.name} ${city.province} Canada`;
  const areas = city.areas.map((area) => `<div class="stay-area"><strong>${html(area)}</strong><p>Compare this base when planning ${html(city.name)} around access, season, price and the main places you want to see.</p><span>Best for: trip fit and local access</span>${cardButton(areaSearch(city, area))}</div>`).join('');
  const attractions = city.highlights.slice(0, 6).map((item, index) => `<article class="destination-attraction-card">${imageTag(city, index)}<div><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div></article>`).join('');
  const experienceCards = city.highlights.slice(0, 6).map((item, index) => `<label class="destination-experience-card" for="${index % 2 === 0 ? 'view-see' : 'view-context'}" role="button" tabindex="0"><span>${html(experienceLabel(index))}</span><strong>${html(item)}</strong><p>${html(shortExperience(item))}</p></label>`).join('');
  const highlights = city.highlights.map((item, index) => `<div class="destination-highlight"><span>${html(experienceLabel(index))}</span><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div>`).join('');
  const events = city.events.map((item) => `<div class="destination-highlight"><span>Event</span><strong>${html(item)}</strong><p>Check current dates and ticket details before building a trip around ${html(item)}.</p></div>`).join('');
  const nearby = city.areas.slice(0, 4).map((area) => `<a class="destination-nearby-card" href="#stay-areas"><span>Area</span><strong>${html(area)}</strong><p>Useful comparison point for stays in and around ${html(city.name)}.</p></a>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <!-- OneSlider core v4 -->
  <link rel="stylesheet" href="../../../../assets/css/oneslider-core.css">
  <script defer src="../../../../assets/js/oneslider-core.js"></script>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <meta name="description" content="${html(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${html(title)}">
  <meta property="og:description" content="${html(description)}">
  <meta property="og:image" content="${siteBase}${hero}">
  <meta property="og:url" content="${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
  <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
  <link rel="preload" as="image" href="${heroWebp}">
  <link rel="stylesheet" href="../../../../assets/css/locations.css?v=canada-city-pages-20260612">
  <title>${html(title)}</title>
</head>
<body class="country-onepage city-page--southampton city-page--stay-template city-page--canada city-page--${city.slug}">
  <nav class="top-menu" aria-label="Location navigation"><a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a><a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a><a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a><span class="nav-divider"></span><a class="nav-back" href="index.html" title="Back to Canada" aria-label="Back to Canada"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>Canada</span></a><a class="nav-pill" href="../index.html">North America</a><a class="nav-pill" href="index.html">Canada</a><a class="nav-pill active" aria-current="page" href="${city.slug}.html">${html(city.name)}</a></nav>
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="${html(city.name)} overview">
      <div class="country-brief__copy">
        <picture class="country-hero-image country-hero-image--clear" aria-hidden="true"><source srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" type="image/webp"><img srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" src="${hero}" alt="" width="1200" height="630" loading="eager" decoding="async"></picture>
        <p class="kicker">${html(city.intro)}</p>
        <h1 class="hero-title">${html(city.name)}</h1>
        <div class="destination-side-facts" aria-label="${html(city.name)} quick facts"><div class="destination-side-fact"><span>Province</span><strong>${html(city.province)}</strong></div><div class="destination-side-fact"><span>Region</span><strong>${html(city.region)}</strong></div><div class="destination-side-fact"><span>Population</span><strong>${html(city.population)}</strong></div><div class="destination-side-fact"><span>Trip role</span><strong>${html(city.role)}</strong></div><div class="destination-side-fact destination-side-fact--wide"><span>Known for</span><strong>${html(city.knownFor)}</strong></div></div>
        <div class="stay-weather-card stay-weather-card--strip" data-weather-strip data-weather-dynamic data-weather-provider="open-meteo" data-weather-lat="${city.coords[0]}" data-weather-lon="${city.coords[1]}"><div class="stay-weather-title-row"><h2>Weather Forecast</h2><span>${html(city.name)}, ${html(city.province)}</span></div><div class="stay-weather-page is-active" data-weather-page="0"><div class="stay-weather-days"><article class="stay-weather-tile"><strong>Loading</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">Forecast</span></div></article></div></div><p class="stay-weather-source">Open-Meteo forecast.</p></div>
        <p class="hero-text">${html(city.intro)}.</p>
        <div class="destination-experience-grid">${experienceCards}</div><div class="country-left-stack"><a class="location-parent-card city-country-card" href="index.html" aria-label="Explore Canada"><img src="/content/locations/north-america/canada/img/canada-mini.png" srcset="/content/locations/north-america/canada/img/canada-mini-200.webp 200w, /content/locations/north-america/canada/img/canada-mini-400.webp 400w" sizes="136px" alt="Canada thumbnail" loading="lazy" width="400" height="300"><span>Part of Canada</span><strong>Explore more Canada</strong><em>More cities, stays and event bases across Canada.</em></a></div>
      </div>
      <div class="country-brief__panel">
        <section class="persona-tabs" aria-label="Choose ${html(city.name)} view">
          <input type="radio" name="${city.slug}-view" id="view-visit" checked>
          <input type="radio" name="${city.slug}-view" id="view-see">
          <input type="radio" name="${city.slug}-view" id="view-stay">
          <input type="radio" name="${city.slug}-view" id="view-nearby">
          <input type="radio" name="${city.slug}-view" id="view-events">
          <input type="radio" name="${city.slug}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose ${html(city.name)} outcome"><label for="view-visit" role="tab">Plan</label><label for="view-see" role="tab">See</label><label for="view-stay" role="tab">Visit</label><label for="view-nearby" role="tab">Nearby</label><label for="view-events" role="tab">Events</label><label for="view-context" role="tab">Highlights</label></div>
          <div class="persona-panel view-panel--visit"><div class="country-panel-card country-panel-card--split"><div><h2>Trip facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>Province</span><strong>${html(city.province)}</strong></div><div class="fact-row"><span>Region</span><strong>${html(city.region)}</strong></div><div class="fact-row"><span>Main airport</span><strong>${html(city.airport)}</strong></div><div class="fact-row"><span>Best base</span><strong>${html(city.areas[0])}</strong></div></div></div><div><h2>Why go</h2><ul class="country-points"><li>${html(city.intro)}.</li><li>Compare stays before locking in transport, event tickets or day-trip routes.</li><li>Use the Stay tab for area choices, Booking.com links and travel tips.</li></ul></div></div></div>
          <div class="persona-panel view-panel--see"><div class="country-panel-card"><h2>Worth seeing</h2><div class="destination-attraction-grid">${attractions}</div></div></div>
          <div class="persona-panel view-panel--stay"><div class="stay-planner-layout"><nav class="stay-section-menu" aria-label="Stay planning sections"><a href="#stay-overview">Overview</a><a href="#stay-areas">Areas</a><a href="#stay-airports">Airports</a><a href="#stay-tips">Tips</a><a href="#stay-hotels">Hotels</a></nav><div class="stay-section-stack"><div class="country-panel-card stay-overview-card" id="stay-overview"><h2>Stay Overview</h2><p>Start with ${html(city.areas[0])}, then compare alternatives by season, transfer time, nightly cost and the places you will visit most.</p>${cardButton(search, 'Check hotels on Booking.com')}<p class="stay-booking-disclosure">One-Sliders may earn a commission if you make a booking through Booking.com.</p></div><div class="country-panel-card" id="stay-areas"><h2>Best Areas to Stay</h2><div class="stay-area-grid">${areas}</div></div><div class="country-panel-card" id="stay-airports"><h2>Airports</h2><div class="stay-overview-grid"><div class="stay-overview-card"><strong>${html(city.airport)}</strong><p>Compare arrivals, ground transport and late-night check-in options before choosing a base.</p>${cardButton(search, 'Compare nearby stays')}</div></div></div><div class="country-panel-card" id="stay-tips"><h2>Travel Tips</h2><div class="stay-tip-grid"><div class="stay-tip"><strong>Season</strong><p>Check weather, holidays and local event dates before locking in rates.</p></div><div class="stay-tip"><strong>Access</strong><p>${html(city.airport)} is the airport to compare first for this page.</p></div><div class="stay-tip"><strong>Base</strong><p>Choose the area you will return to most often, not only the cheapest nightly rate.</p></div><div class="stay-tip"><strong>Canada routing</strong><p>Use the Canada page for nearby city and event context.</p></div></div></div><div class="country-panel-card" id="stay-hotels"><h2>Hotel planning</h2><div class="stay-hotel-grid">${city.areas.slice(0, 4).map((area) => `<div class="stay-hotel-card"><strong>${html(area)}</strong><p>Use this base when ${html(area)} is closest to your main sights, events or transit route.</p>${cardButton(areaSearch(city, area))}</div>`).join('')}</div></div></div></div></div>
          <div class="persona-panel view-panel--nearby"><div class="country-panel-card"><h2>Nearby ideas</h2><div class="destination-nearby-grid">${nearby}</div></div></div>
          <div class="persona-panel view-panel--events"><div class="country-panel-card"><h2>Event planning</h2><div class="destination-highlight-grid">${events}</div></div></div>
          <div class="persona-panel view-panel--context"><div class="country-panel-card"><h2>Destination highlights</h2><div class="destination-highlight-grid">${highlights}</div></div></div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function dataFile(city) {
  const img = hasImage(city.slug, 'mini.png') ? `img/${city.slug}-mini.png` : undefined;
  return {
    slug: city.slug,
    name: city.name,
    province: city.province,
    state: city.province,
    countrySlug: 'canada',
    countryName: 'Canada',
    region: city.region,
    population: city.population,
    role: city.role,
    knownFor: city.knownFor,
    intro: city.intro,
    airport: city.airport,
    coords: city.coords,
    areas: city.areas,
    highlights: city.highlights,
    events: city.events,
    tags: [city.province.toLowerCase().replaceAll(' ', '-'), city.role.toLowerCase().split(' ')[0], 'stay'],
    href: `${city.slug}.html`,
    ...(img ? { img } : { needsCityImageAssets: true })
  };
}

function syncCountryData() {
  const countryDataPath = path.join(countryDir, 'canada.data.json');
  const countryData = JSON.parse(fs.readFileSync(countryDataPath, 'utf8'));
  const existingByName = new Map((countryData.cities || []).map((city) => [city.name, city]));
  countryData.cities = cities.map((city) => {
    const existing = existingByName.get(city.name) || {};
    const img = hasImage(city.slug, 'mini.png') ? `/content/locations/north-america/canada/img/${city.slug}-mini.png` : undefined;
    const item = {
      name: city.name,
      href: `${city.slug}.html`,
      tags: existing.tags || ['city']
    };
    if (img) {
      item.img = img;
    }
    return item;
  });
  fs.writeFileSync(countryDataPath, `${JSON.stringify(countryData, null, 2)}\n`);
}

function main() {
  for (const city of cities) {
    fs.writeFileSync(path.join(countryDir, `${city.slug}.html`), render(city));
    fs.writeFileSync(path.join(countryDir, `${city.slug}.city.data.json`), `${JSON.stringify(dataFile(city), null, 2)}\n`);
  }
  syncCountryData();
  console.log(`Generated ${cities.length} Canada city pages with data, tabs, weather and Booking links.`);
}

main();
