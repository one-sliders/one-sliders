import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const usaDir = path.join(root, 'content/locations/north-america/usa');
const imgDir = path.join(usaDir, 'img');
const siteBase = 'https://one-sliders.com';
const bookingClick = 'https://www.jdoqocy.com/click-101771061-17293132?url=';
const cssVersion = 'usa-stay-cities-weather-parent-card-20260612';
const coreVersion = 'weather-dynamic-20260612';
const realDataPath = path.join(root, 'scripts/data/usa-stay-cities.real.json');
const usaDataPath = path.join(usaDir, 'usa.data.json');
const realData = JSON.parse(fs.readFileSync(realDataPath, 'utf8'));
const realBySlug = new Map(realData.cities.map((city) => [city.slug, city]));

const common = {
  continent: 'north-america',
  continentName: 'North America',
  countrySlug: 'usa',
  countryName: 'USA',
  countryHref: 'index.html',
  flag: 'img/flag.svg'
};

const cities = [
  city('new-york', 'New York City', 'New York', 'Global city for museums, skyline trips and major events', {
    region: 'New York City', population: '~8.3M city', distance: 'East Coast hub', known: 'Skyline, museums & events',
    hero: 'New York City is a dense, high-energy base for museums, Broadway, parks, restaurants and world-scale events. Stay planning is mostly about choosing the right neighborhood and subway access.',
    areas: ['Midtown Manhattan', 'Lower Manhattan', 'Upper West Side', 'Williamsburg', 'Long Island City', 'Flushing'],
    airports: [['John F. Kennedy International Airport (JFK)', 'New York City, New York, United States'], ['LaGuardia Airport (LGA)', 'New York City, New York, United States'], ['Newark Liberty International Airport (EWR)', 'Newark, New Jersey, United States']],
    highlights: ['Central Park', 'Broadway', 'The Met', 'Brooklyn waterfront', 'US Open Tennis', 'NYC Marathon']
  }),
  city('las-vegas', 'Las Vegas', 'Nevada', 'Entertainment and event city in the Nevada desert', {
    region: 'Southern Nevada', population: '~660,000 city', distance: 'Desert resort hub', known: 'Resorts, shows & events',
    hero: 'Las Vegas is built around hotels, venues, restaurants and spectacle, with prices changing sharply around conventions, race weekends and headline events.',
    areas: ['The Strip', 'Downtown Las Vegas', 'Convention Center area', 'Summerlin', 'Henderson'],
    airports: [['Harry Reid International Airport (LAS)', 'Las Vegas, Nevada, United States']],
    highlights: ['The Strip', 'Fremont Street', 'Sphere', 'Red Rock Canyon', 'Formula 1', 'Shows']
  }),
  city('orlando', 'Orlando', 'Florida', 'Theme park and family trip base in Central Florida', {
    region: 'Central Florida', population: '~320,000 city', distance: 'Florida family hub', known: 'Theme parks & resorts',
    hero: 'Orlando is a practical base for theme parks, resort stays, sports trips and family itineraries across Central Florida.',
    areas: ['International Drive', 'Lake Buena Vista', 'Downtown Orlando', 'Winter Park', 'Kissimmee'],
    airports: [['Orlando International Airport (MCO)', 'Orlando, Florida, United States'], ['Orlando Sanford International Airport (SFB)', 'Sanford, Florida, United States']],
    highlights: ['Walt Disney World area', 'Universal Orlando area', 'International Drive', 'Winter Park', 'Lake Eola', 'Family resorts']
  }),
  city('miami', 'Miami', 'Florida', 'Beach, nightlife and cruise gateway in South Florida', {
    region: 'South Florida', population: '~450,000 city', distance: 'Atlantic gateway', known: 'Beaches, design & cruises',
    hero: 'Miami mixes beach days, Art Deco streets, Latin food, cruise departures and nightlife into one of the most distinctive city trips in the United States.',
    areas: ['South Beach', 'Brickell', 'Downtown Miami', 'Wynwood', 'Coconut Grove', 'Coral Gables'],
    airports: [['Miami International Airport (MIA)', 'Miami, Florida, United States'], ['Fort Lauderdale-Hollywood International Airport (FLL)', 'Fort Lauderdale, Florida, United States']],
    highlights: ['South Beach', 'Art Deco District', 'Wynwood Walls', 'Little Havana', 'Biscayne Bay', 'Cruise port']
  }),
  city('los-angeles', 'Los Angeles', 'California', 'Film, beaches and neighborhoods across Southern California', {
    region: 'Southern California', population: '~3.8M city', distance: 'Pacific Coast hub', known: 'Hollywood, beaches & culture',
    hero: 'Los Angeles rewards neighborhood planning: beach stays, studio trips, food districts, museums and event venues can sit far apart.',
    areas: ['Santa Monica', 'Hollywood', 'West Hollywood', 'Downtown Los Angeles', 'Beverly Hills', 'Venice'],
    airports: [['Los Angeles International Airport (LAX)', 'Los Angeles, California, United States'], ['Hollywood Burbank Airport (BUR)', 'Burbank, California, United States']],
    highlights: ['Hollywood', 'Santa Monica Pier', 'Griffith Observatory', 'Getty Center', 'Venice Beach', 'Downtown arts']
  }),
  city('san-francisco', 'San Francisco', 'California', 'Bay views, neighborhoods and culture in Northern California', {
    region: 'Bay Area', population: '~810,000 city', distance: 'Northern California hub', known: 'Golden Gate & bay views',
    hero: 'San Francisco is compact but steep, with waterfront sights, landmark bridges, food neighborhoods and strong transit-based stay choices.',
    areas: ['Union Square', 'Fisherman\'s Wharf', 'Embarcadero', 'Nob Hill', 'Mission District', 'Marina District'],
    airports: [['San Francisco International Airport (SFO)', 'San Francisco, California, United States'], ['Oakland International Airport (OAK)', 'Oakland, California, United States']],
    highlights: ['Golden Gate Bridge', 'Alcatraz', 'Ferry Building', 'Mission murals', 'Cable cars', 'Bay views']
  }),
  city('honolulu', 'Honolulu', 'Hawaii', 'Oahu beach and culture base', {
    region: 'Oahu', population: '~350,000 urban core', distance: 'Pacific island hub', known: 'Waikiki & Diamond Head',
    hero: 'Honolulu combines Waikiki hotels, surf beaches, Pearl Harbor visits, Diamond Head hikes and Oahu road trips.',
    areas: ['Waikiki', 'Ala Moana', 'Downtown Honolulu', 'Kahala', 'Kapolei'],
    airports: [['Daniel K. Inouye International Airport (HNL)', 'Honolulu, Hawaii, United States']],
    highlights: ['Waikiki Beach', 'Diamond Head', 'Pearl Harbor', 'Ala Moana', 'Iolani Palace', 'Oahu day trips']
  }),
  city('new-orleans', 'New Orleans', 'Louisiana', 'Music, food and festival city on the Mississippi', {
    region: 'Louisiana Gulf Coast', population: '~365,000 city', distance: 'Mississippi River city', known: 'Jazz, food & festivals',
    hero: 'New Orleans is a music, food and festival city where neighborhood choice changes the whole trip, from French Quarter nights to Garden District walks.',
    areas: ['French Quarter', 'Central Business District', 'Warehouse District', 'Garden District', 'Marigny', 'Uptown'],
    airports: [['Louis Armstrong New Orleans International Airport (MSY)', 'New Orleans, Louisiana, United States']],
    highlights: ['French Quarter', 'Frenchmen Street', 'Garden District', 'Mardi Gras', 'Creole food', 'Mississippi riverfront']
  }),
  city('nashville', 'Nashville', 'Tennessee', 'Music city with venues, food and weekend trips', {
    region: 'Middle Tennessee', population: '~690,000 city', distance: 'Southeast music hub', known: 'Country music & venues',
    hero: 'Nashville centers on live music, food, sports weekends and neighborhood stays from Broadway to quieter East Nashville.',
    areas: ['Downtown Nashville', 'The Gulch', 'Music Row', 'East Nashville', '12 South', 'Opryland'],
    airports: [['Nashville International Airport (BNA)', 'Nashville, Tennessee, United States']],
    highlights: ['Broadway', 'Ryman Auditorium', 'Grand Ole Opry', 'Country Music Hall of Fame', '12 South', 'Hot chicken']
  }),
  city('chicago', 'Chicago', 'Illinois', 'Architecture, lakefront and events on Lake Michigan', {
    region: 'Great Lakes', population: '~2.7M city', distance: 'Midwest hub', known: 'Architecture & lakefront',
    hero: 'Chicago pairs architecture, museums, lakefront parks, food neighborhoods and major sports with strong transit access.',
    areas: ['Loop', 'River North', 'Magnificent Mile', 'West Loop', 'Lincoln Park', 'Wicker Park'],
    airports: [['O\'Hare International Airport (ORD)', 'Chicago, Illinois, United States'], ['Midway International Airport (MDW)', 'Chicago, Illinois, United States']],
    highlights: ['Chicago River', 'Millennium Park', 'Art Institute', 'Lakefront Trail', 'Wrigley Field', 'Architecture tours']
  }),
  city('boston', 'Boston', 'Massachusetts', 'Historic city base for culture, universities and sports', {
    region: 'New England', population: '~650,000 city', distance: 'New England hub', known: 'History, universities & sports',
    hero: 'Boston is a compact history-and-neighborhood city with strong transit, waterfront walks, museums, universities and sports weekends.',
    areas: ['Back Bay', 'Downtown Boston', 'Seaport', 'North End', 'Cambridge', 'Fenway'],
    airports: [['Boston Logan International Airport (BOS)', 'Boston, Massachusetts, United States']],
    highlights: ['Freedom Trail', 'Back Bay', 'Fenway Park', 'Harvard Square', 'Seaport', 'North End']
  }),
  city('seattle', 'Seattle', 'Washington', 'Waterfront, coffee and mountain views in the Pacific Northwest', {
    region: 'Pacific Northwest', population: '~755,000 city', distance: 'Puget Sound hub', known: 'Waterfront, coffee & views',
    hero: 'Seattle blends waterfront sights, food markets, music history, tech trips and mountain-view day plans.',
    areas: ['Downtown Seattle', 'Belltown', 'South Lake Union', 'Capitol Hill', 'Queen Anne', 'Ballard'],
    airports: [['Seattle-Tacoma International Airport (SEA)', 'Seattle, Washington, United States']],
    highlights: ['Pike Place Market', 'Space Needle', 'Seattle waterfront', 'Capitol Hill', 'Ferries', 'Mount Rainier views']
  }),
  city('austin', 'Austin', 'Texas', 'Live music, food and event weekends in Central Texas', {
    region: 'Central Texas', population: '~980,000 city', distance: 'Texas event hub', known: 'Music, food & festivals',
    hero: 'Austin is a music, food, festival and race-week city where central neighborhoods and road access matter for the stay.',
    areas: ['Downtown Austin', 'South Congress', 'East Austin', 'The Domain', 'Zilker', 'Circuit of the Americas area'],
    airports: [['Austin-Bergstrom International Airport (AUS)', 'Austin, Texas, United States']],
    highlights: ['Live music', 'South Congress', 'Lady Bird Lake', 'Zilker Park', 'BBQ', 'Formula 1']
  }),
  city('augusta', 'Augusta', 'Georgia', 'Golf, riverfront and spring event base in eastern Georgia', {
    region: 'Central Savannah River Area', population: '~200,000 city-county', distance: 'Georgia-South Carolina border base', known: 'Masters week, riverfront & golf',
    hero: 'Augusta is best known to travelers for Masters week, but it also works as a riverfront base with historic districts, museums and easy access across the Savannah River.',
    areas: ['Downtown Augusta', 'Summerville', 'West Augusta', 'National Hills', 'North Augusta'],
    airports: [['Augusta Regional Airport (AGS)', 'Augusta, Georgia, United States'], ['Columbia Metropolitan Airport (CAE)', 'Columbia, South Carolina, United States'], ['Hartsfield-Jackson Atlanta International Airport (ATL)', 'Atlanta, Georgia, United States']],
    highlights: ['Augusta Riverwalk', 'Masters week', 'Augusta Museum of History', 'Savannah River', 'Summerville', 'North Augusta']
  }),
  city('black-rock-city', 'Black Rock City', 'Nevada', 'Temporary desert city and Burning Man base in Nevada', {
    region: 'Black Rock Desert', population: 'temporary event city', distance: 'Remote Nevada desert base', known: 'Burning Man & Black Rock Desert',
    hero: 'Black Rock City is a temporary city in Nevada built for Burning Man, so stay planning is different from a normal hotel city: most visitors camp on site and compare hotels before or after in Reno or nearby towns.',
    areas: ['Black Rock City camping', 'Gerlach', 'Reno', 'Fernley', 'Sparks'],
    airports: [['Reno-Tahoe International Airport (RNO)', 'Reno, Nevada, United States'], ['San Francisco International Airport (SFO)', 'San Francisco, California, United States'], ['Sacramento International Airport (SMF)', 'Sacramento, California, United States']],
    highlights: ['Black Rock Desert', 'Burning Man', 'Gerlach', 'Reno staging', 'Desert driving', 'Leave No Trace planning']
  }),
  city('charleston', 'Charleston', 'South Carolina', 'Historic coastal city with food and beach access', {
    region: 'South Carolina Lowcountry', population: '~155,000 city', distance: 'Atlantic coast base', known: 'Historic streets & food',
    hero: 'Charleston is a compact historic city with strong food, waterfront walks and easy beach add-ons.',
    areas: ['Historic District', 'French Quarter', 'Cannonborough', 'Mount Pleasant', 'Folly Beach', 'Isle of Palms'],
    airports: [['Charleston International Airport (CHS)', 'Charleston, South Carolina, United States']],
    highlights: ['Historic District', 'Rainbow Row', 'Waterfront Park', 'Lowcountry food', 'Folly Beach', 'Plantation gardens']
  }),
  city('savannah', 'Savannah', 'Georgia', 'Historic squares, riverfront and Southern weekend trips', {
    region: 'Coastal Georgia', population: '~150,000 city', distance: 'Atlantic coast base', known: 'Squares, riverfront & history',
    hero: 'Savannah is a walkable historic city with shaded squares, riverfront evenings, food, architecture and beach day trips.',
    areas: ['Historic District', 'River Street', 'Forsyth Park', 'Starland District', 'Tybee Island'],
    airports: [['Savannah/Hilton Head International Airport (SAV)', 'Savannah, Georgia, United States']],
    highlights: ['Forsyth Park', 'Historic squares', 'River Street', 'Starland District', 'Tybee Island', 'Southern food']
  }),
  city('santa-fe', 'Santa Fe', 'New Mexico', 'Adobe architecture, art and high-desert culture', {
    region: 'Northern New Mexico', population: '~90,000 city', distance: 'High desert base', known: 'Art, adobe & cuisine',
    hero: 'Santa Fe is a high-desert city for galleries, adobe architecture, food, spas and scenic day trips.',
    areas: ['Downtown Plaza', 'Railyard District', 'Canyon Road', 'Museum Hill', 'Tesuque'],
    airports: [['Santa Fe Regional Airport (SAF)', 'Santa Fe, New Mexico, United States'], ['Albuquerque International Sunport (ABQ)', 'Albuquerque, New Mexico, United States']],
    highlights: ['Santa Fe Plaza', 'Canyon Road', 'Railyard', 'Museum Hill', 'Adobe streets', 'High desert']
  }),
  city('portland-maine', 'Portland, Maine', 'Maine', 'Harbor, food and coastal New England base', {
    region: 'Southern Maine', population: '~68,000 city', distance: 'New England coast base', known: 'Harbor, seafood & lighthouses',
    hero: 'Portland, Maine is a compact harbor city for food trips, waterfront walks, breweries, islands and coastal day drives.',
    areas: ['Old Port', 'Downtown Portland', 'East End', 'West End', 'South Portland'],
    airports: [['Portland International Jetport (PWM)', 'Portland, Maine, United States']],
    highlights: ['Old Port', 'Casco Bay', 'Portland Head Light', 'Seafood', 'Breweries', 'Maine coast']
  }),
  city('newport', 'Newport', 'Rhode Island', 'Harbor, mansions and sailing on Narragansett Bay', {
    region: 'Rhode Island coast', population: '~25,000 city', distance: 'New England coast base', known: 'Mansions, sailing & cliffs',
    hero: 'Newport is a harbor and mansion city built for sailing, cliff walks, summer weekends and classic New England coastal stays.',
    areas: ['Downtown Newport', 'Waterfront', 'Bellevue Avenue', 'Easton\'s Beach', 'Middletown'],
    airports: [['T. F. Green International Airport (PVD)', 'Providence, Rhode Island, United States'], ['Boston Logan International Airport (BOS)', 'Boston, Massachusetts, United States']],
    highlights: ['Cliff Walk', 'Newport mansions', 'Sailing', 'Thames Street', 'Ocean Drive', 'Easton\'s Beach']
  }),
  city('newtown-square', 'Newtown Square', 'Pennsylvania', 'Main Line suburb and golf/event base near Philadelphia', {
    region: 'Philadelphia Main Line', population: '~13,000 township', distance: 'Philadelphia-area base', known: 'Main Line, golf & suburban stays',
    hero: 'Newtown Square is a Philadelphia Main Line base for golf, suburban event trips, parks and access to nearby Media, Wayne and King of Prussia.',
    areas: ['Newtown Square', 'Wayne', 'Media', 'King of Prussia', 'Philadelphia Main Line'],
    airports: [['Philadelphia International Airport (PHL)', 'Philadelphia, Pennsylvania, United States'], ['Wilmington Airport (ILG)', 'Wilmington, Delaware, United States'], ['Lehigh Valley International Airport (ABE)', 'Allentown, Pennsylvania, United States']],
    highlights: ['Aronimink Golf Club', 'Ridley Creek State Park', 'Main Line', 'Media', 'Wayne', 'King of Prussia']
  }),
  city('aspen', 'Aspen', 'Colorado', 'Mountain resort town for skiing, festivals and summer hikes', {
    region: 'Colorado Rockies', population: '~7,000 city', distance: 'Mountain resort base', known: 'Skiing, hiking & festivals',
    hero: 'Aspen is a compact mountain resort town where lodging, lifts, festivals and weather shape the whole trip.',
    areas: ['Downtown Aspen', 'Aspen Mountain base', 'West End', 'Snowmass Village', 'Buttermilk area'],
    airports: [['Aspen/Pitkin County Airport (ASE)', 'Aspen, Colorado, United States'], ['Denver International Airport (DEN)', 'Denver, Colorado, United States']],
    highlights: ['Aspen Mountain', 'Maroon Bells', 'Snowmass', 'Downtown Aspen', 'Food & galleries', 'Ski season']
  }),
  city('jackson', 'Jackson', 'Wyoming', 'Gateway to Grand Teton and Yellowstone trips', {
    region: 'Jackson Hole', population: '~10,000 town', distance: 'Mountain gateway', known: 'Grand Teton access',
    hero: 'Jackson is the town base for Grand Teton, ski trips, wildlife drives and classic Western mountain stays.',
    areas: ['Town of Jackson', 'Teton Village', 'Wilson', 'South Jackson', 'Grand Teton gateway'],
    airports: [['Jackson Hole Airport (JAC)', 'Jackson, Wyoming, United States']],
    highlights: ['Town Square', 'Grand Teton', 'Teton Village', 'Wildlife drives', 'Skiing', 'National parks']
  }),
  city('southampton', 'Southampton', 'New York', 'Hamptons beach destination in New York', {
    region: 'The Hamptons', population: '~69,000 town', distance: '~90 mi from NYC', known: 'Beaches & luxury getaways',
    hero: 'Southampton is the crown jewel of the Hamptons, known for white-sand beaches, upscale dining, village life and summer demand.',
    areas: ['Southampton Village', 'North Sea', 'Hampton Bays', 'Bridgehampton', 'Riverhead'],
    airports: [['Long Island MacArthur Airport (ISP)', 'Hampton Bays, Southampton, New York, United States'], ['John F. Kennedy International Airport (JFK)', 'New York City, New York, United States'], ['LaGuardia Airport (LGA)', 'New York City, New York, United States']],
    highlights: ['Cooper\'s Beach', 'Southampton Village', 'Parrish Art Museum', 'Shinnecock Hills', 'Hamptons dining', 'East End day trips']
  }),
  city('east-hampton', 'East Hampton', 'New York', 'Hamptons village, beaches and summer culture', {
    region: 'The Hamptons', population: '~28,000 town', distance: 'East End base', known: 'Beaches, village & galleries',
    hero: 'East Hampton is a polished Hamptons base for ocean beaches, village streets, galleries, dining and summer weekends.',
    areas: ['East Hampton Village', 'Amagansett', 'Wainscott', 'Springs', 'Sag Harbor'],
    airports: [['Long Island MacArthur Airport (ISP)', 'East Hampton, New York, United States'], ['John F. Kennedy International Airport (JFK)', 'New York City, New York, United States']],
    highlights: ['Main Beach', 'East Hampton Village', 'Guild Hall', 'Amagansett', 'Springs', 'Sag Harbor']
  }),
  city('montauk', 'Montauk', 'New York', 'Atlantic surf, lighthouse and end-of-Long-Island trips', {
    region: 'The Hamptons', population: '~4,000 hamlet', distance: 'Long Island end point', known: 'Surf, lighthouse & seafood',
    hero: 'Montauk is the Atlantic edge of the Hamptons, with surf beaches, seafood, marinas, trails and lighthouse views.',
    areas: ['Montauk Village', 'Ditch Plains', 'Montauk Harbor', 'Hither Hills', 'Amagansett overflow'],
    airports: [['Long Island MacArthur Airport (ISP)', 'Montauk, New York, United States'], ['John F. Kennedy International Airport (JFK)', 'New York City, New York, United States']],
    highlights: ['Montauk Point Lighthouse', 'Ditch Plains', 'Montauk Harbor', 'Hither Hills', 'Surfing', 'Seafood']
  }),
  city('sedona', 'Sedona', 'Arizona', 'Red rock hikes, resorts and desert views', {
    region: 'Northern Arizona', population: '~10,000 city', distance: 'Red rock base', known: 'Red rocks & hiking',
    hero: 'Sedona is a red-rock base for hikes, scenic drives, wellness resorts, galleries and desert sunsets.',
    areas: ['Uptown Sedona', 'West Sedona', 'Village of Oak Creek', 'Oak Creek Canyon', 'Tlaquepaque area'],
    airports: [['Flagstaff Pulliam Airport (FLG)', 'Flagstaff, Arizona, United States'], ['Phoenix Sky Harbor International Airport (PHX)', 'Phoenix, Arizona, United States']],
    highlights: ['Cathedral Rock', 'Bell Rock', 'Oak Creek Canyon', 'Uptown Sedona', 'Jeep tours', 'Sunsets']
  }),
  city('key-west', 'Key West', 'Florida', 'Island city for sunsets, history and reef trips', {
    region: 'Florida Keys', population: '~26,000 city', distance: 'Island end point', known: 'Sunsets, reefs & old town',
    hero: 'Key West is a compact island city for Old Town walks, sunset gatherings, reef trips, food and laid-back nights.',
    areas: ['Old Town Key West', 'Duval Street area', 'Historic Seaport', 'Casa Marina', 'New Town'],
    airports: [['Key West International Airport (EYW)', 'Key West, Florida, United States'], ['Miami International Airport (MIA)', 'Miami, Florida, United States']],
    highlights: ['Old Town', 'Mallory Square', 'Duval Street', 'Historic Seaport', 'Reef trips', 'Sunset views']
  }),
  city('washington-dc', 'Washington DC', 'District of Columbia', 'Capital city base for museums, monuments and government events', {
    region: 'District of Columbia', population: '~690,000 federal district', distance: 'Mid-Atlantic capital base', known: 'Monuments, museums & government',
    hero: 'Washington DC is the U.S. capital, with national museums, monuments, government buildings, convention trips and neighborhood stays spread across the District and nearby Virginia and Maryland.',
    areas: ['Downtown DC', 'National Mall area', 'Capitol Hill', 'Dupont Circle', 'Georgetown', 'Navy Yard'],
    airports: [['Ronald Reagan Washington National Airport (DCA)', 'Washington DC, United States'], ['Washington Dulles International Airport (IAD)', 'Washington DC, United States'], ['Baltimore/Washington International Airport (BWI)', 'Baltimore, Maryland, United States']],
    highlights: ['National Mall', 'Smithsonian museums', 'Capitol Hill', 'Georgetown', 'Dupont Circle', 'Convention Center']
  })
];

function city(slug, name, state, kicker, extra) {
  return { slug, name, state, kicker, ...extra };
}

function html(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sentence(value = '', max = 1) {
  const parts = String(value)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return parts.slice(0, max).join(' ');
}

function populationFromExtract(city, real) {
  const match = real.extract.match(/population of ([0-9,]+)[^.]*(?:2020 census|census)/i);
  if (match) return `${match[1]} (2020 census)`;
  return city.population;
}

function sourcedIntro(city, real) {
  const first = sentence(real.extract, 2);
  return first || city.hero;
}

function sourceLinks(real) {
  const imageLabel = real.image.caption ? real.image.caption.replace(/^File:/, '') : `${real.wikipediaTitle} lead image`;
  return `<div class="country-panel-card destination-source-card"><h2>Sources</h2><div class="country-qa-list"><div><strong>City data</strong><span><a href="${html(real.contentUrl)}" target="_blank" rel="noopener">Wikipedia: ${html(real.wikipediaTitle)}</a></span></div><div><strong>Image</strong><span><a href="${html(real.image.sourceUrl)}" target="_blank" rel="noopener">${html(imageLabel)}</a></span></div></div></div>`;
}

function bookingHref(search) {
  const bookingUrl = `https://www.booking.com/searchresults.html?ss=${String(search).replace(/ /g, '+')}`;
  return `${bookingClick}${encodeURIComponent(bookingUrl)}`;
}

function imageTag(slug, name) {
  return `<img src="/content/locations/north-america/usa/img/${slug}-mini.png" srcset="/content/locations/north-america/usa/img/${slug}-mini-200.webp 200w, /content/locations/north-america/usa/img/${slug}-mini-400.webp 400w" sizes="(max-width:620px) 220px, 400px" alt="${html(name)} thumbnail" loading="lazy" width="400" height="300">`;
}

function render(city) {
  const slug = city.slug;
  const name = city.name;
  const real = realBySlug.get(slug);
  if (!real) throw new Error(`Missing real sourced data for ${slug}`);
  if (!real.image?.localSource) throw new Error(`Missing real image data for ${slug}`);
  const title = `${name} Travel Guide - Where to Stay, Airports & Events`;
  const description = `Plan a ${name}, ${city.state} trip with sourced city context, stay areas, airports and Booking.com hotel links.`;
  const heroUrl = `/content/locations/north-america/usa/img/${slug}-hero.png`;
  const heroWebp = `/content/locations/north-america/usa/img/${slug}-hero-1200.webp`;
  const heroSrcset = `/content/locations/north-america/usa/img/${slug}-hero-400.webp 400w, /content/locations/north-america/usa/img/${slug}-hero-768.webp 768w, /content/locations/north-america/usa/img/${slug}-hero-1200.webp 1200w`;
  const heroSizes = `(max-width: 720px) 100vw, 42vw`;
  const pageUrl = `${siteBase}/content/locations/north-america/usa/${slug}.html`;
  const bodyClass = `country-onepage city-page--southampton city-page--stay-template city-page--${slug}`;
  const sourcedHero = sourcedIntro(city, real);
  const sourcedPopulation = populationFromExtract(city, real);
  const weatherStrip = renderWeatherStrip(city, real.coordinates);
  const areaCards = city.areas.map((area) => {
    const search = area.includes('Riverhead') ? 'Riverhead, New York, United States' : `${area}, ${name}, ${city.state}, United States`;
    return `<div class="stay-area"><strong>${html(area)}</strong><p>${html(areaCopy(area, city))}</p><span>Best for: ${html(areaBest(area))}</span><a class="stay-card-link" href="${html(bookingHref(search))}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>`;
  }).join('');
  const airportRows = city.airports.map(([airport, search]) =>
    `<li><strong>${html(airport)}</strong><span>${html(airportDistance(airport, name))}</span><p>${html(airportCopy(airport))}</p><a class="stay-card-link" href="${html(bookingHref(search))}" target="_blank" rel="nofollow sponsored noopener">Compare nearby stays</a></li>`
  ).join('');
  const hotelCards = [
    ['Central base', city.areas[0], `${city.areas[0]}, ${name}, ${city.state}, United States`],
    ['Food / nightlife', city.areas[1] || city.areas[0], `${city.areas[1] || city.areas[0]}, ${name}, ${city.state}, United States`],
    ['Availability', city.areas[2] || city.areas[0], `${city.areas[2] || city.areas[0]}, ${name}, ${city.state}, United States`],
    ['Event weeks', city.areas[3] || city.areas[0], `${city.areas[3] || city.areas[0]}, ${name}, ${city.state}, United States`]
  ].map(([tag, area, search]) => `<div class="stay-hotel-card"><span>${html(tag)}</span><strong>${html(area)}</strong><p>${html(hotelCopy(tag, city))}</p><a class="stay-card-link" href="${html(bookingHref(search))}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>`).join('');
  const attractions = city.highlights.slice(0, 6).map((item) =>
    `<article class="destination-attraction-card">${imageTag(slug, name)}<div><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div></article>`
  ).join('');
  const experienceCards = city.highlights.slice(0, 6).map((item, idx) =>
    `<label class="destination-experience-card" for="${idx % 2 === 0 ? 'view-see' : 'view-context'}" role="button" tabindex="0"><span>${html(experienceLabel(idx))}</span><strong>${html(item)}</strong><p>${html(shortExperience(item))}</p></label>`
  ).join('');
  const highlightCards = city.highlights.slice(0, 6).map((item, idx) =>
    `<div class="destination-highlight"><span>${html(experienceLabel(idx))}</span><strong>${html(item)}</strong><p>${html(highlightCopy(item, city))}</p></div>`
  ).join('');
  const nearbyCards = nearbyFor(city).map((n) =>
    `<a class="destination-nearby-card" href="${html(n.href)}"><span>${html(n.meta)}</span><strong>${html(n.name)}</strong><p>${html(n.text)}</p></a>`
  ).join('');
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
<body class="${bodyClass}">
  ${nav(slug, name)}
  <main class="page-shell country-slide country-content-box">
    <section class="country-brief" aria-label="${html(name)} one-slide overview">
      <div class="country-brief__copy">
        <picture class="country-hero-image country-hero-image--clear" aria-hidden="true"><source srcset="${heroSrcset}" sizes="${heroSizes}" type="image/webp"><img srcset="${heroSrcset}" sizes="${heroSizes}" src="${heroUrl}" alt="" width="1200" height="630" loading="eager" decoding="async"></picture>
        <p class="kicker">${html(city.kicker)}</p>
        <h1 class="hero-title">${html(name)}</h1>
        <div class="destination-side-facts" aria-label="${html(name)} quick facts"><div class="destination-side-fact"><span>State</span><strong>${html(city.state)}</strong></div><div class="destination-side-fact"><span>Region</span><strong>${html(city.region)}</strong></div><div class="destination-side-fact"><span>Population</span><strong>${html(sourcedPopulation)}</strong></div><div class="destination-side-fact"><span>Trip role</span><strong>${html(city.distance)}</strong></div><div class="destination-side-fact destination-side-fact--wide"><span>Known for</span><strong>${html(city.known)}</strong></div></div>
        ${weatherStrip}
        <p class="hero-text">${html(sourcedHero)}</p>
<div class="destination-experience-grid">${experienceCards}</div><div class="country-left-stack"><div class="country-panel-card country-history-card"><h2>City Snapshot</h2><div class="country-history-list"><div><time>Source</time><span>${html(sentence(real.extract, 1))}</span></div><div><time>Stay</time><span>Compare ${html(city.areas.slice(0, 3).join(', '))} before booking; the best base depends on transit, event venue and nightly fees.</span></div><div><time>Access</time><span>${html(city.airports.map(([airport]) => airport).join(' / '))} ${city.airports.length > 1 ? 'are useful airport options.' : 'is the main airport option listed for this page.'}</span></div><div><time>Image</time><span>Hero and mini images use a real Wikimedia source linked in the Sources card.</span></div></div></div><a class="location-parent-card city-country-card" href="index.html" aria-label="Explore USA"><img src="/content/locations/north-america/usa/img/usa-mini.png" srcset="/content/locations/north-america/usa/img/usa-mini-200.webp 200w, /content/locations/north-america/usa/img/usa-mini-400.webp 400w" sizes="136px" alt="USA thumbnail" loading="lazy" width="400" height="300"><span>Part of USA</span><strong>Explore more USA</strong><em>More cities, stays and event bases across the United States.</em></a></div>
      </div>
      <div class="country-brief__panel">
        <section class="persona-tabs" aria-label="Choose ${html(name)} view">
          <input type="radio" name="${slug}-view" id="view-visit" checked>
          <input type="radio" name="${slug}-view" id="view-see">
          <input type="radio" name="${slug}-view" id="view-stay">
          <input type="radio" name="${slug}-view" id="view-nearby">
          <input type="radio" name="${slug}-view" id="view-events">
          <input type="radio" name="${slug}-view" id="view-context">
          <div class="persona-tablist" role="tablist" aria-label="Choose ${html(name)} outcome">
            <label for="view-visit" role="tab">Plan</label>
            <label for="view-see" role="tab">See</label>
            <label for="view-stay" role="tab">Visit</label>
            <label for="view-nearby" role="tab">Nearby</label>
            <label for="view-events" role="tab">Events</label>
            <label for="view-context" role="tab">Highlights</label>
          </div>
          <div class="persona-panel view-panel--visit">
            <div class="country-panel-card country-panel-card--split">
              <div><h2>Trip facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>State</span><strong>${html(city.state)}</strong></div><div class="fact-row"><span>Region</span><strong>${html(city.region)}</strong></div><div class="fact-row"><span>Main draw</span><strong>${html(city.known)}</strong></div><div class="fact-row"><span>Best base</span><strong>${html(city.areas[0])}</strong></div></div></div>
              <div><h2>Why go</h2><ul class="country-points"><li><strong>City context:</strong> ${html(sentence(real.extract, 1))}</li><li><strong>Stay planning:</strong> Compare ${html(city.areas.slice(0, 3).join(', '))} before picking a hotel base.</li><li><strong>Booking check:</strong> Review taxes, resort fees, parking and cancellation rules before paying.</li></ul></div>
            </div>
            <div class="country-panel-card"><h2>Planning questions</h2><div class="country-qa-list"><div><strong>What is ${html(name)}?</strong><span>${html(sentence(real.extract, 1))}</span></div><div><strong>Where should I stay?</strong><span>Start with ${html(city.areas[0])}; compare ${html(city.areas.slice(1, 4).join(', '))} when price, nightlife or event access matters.</span></div><div><strong>Which airport should I check?</strong><span>${html(city.airports.map(([airport]) => airport).join(' / '))}.</span></div><div><strong>What should I check before booking?</strong><span>Airport transfer time, parking fees, resort or destination fees, local transit and the exact event venue.</span></div></div></div>
          </div>
          <div class="persona-panel view-panel--see">
            <div class="country-panel-card"><h2>Worth seeing</h2><div class="destination-attraction-grid">${attractions}</div></div>
          </div>
          <div class="persona-panel view-panel--stay">
            <div class="stay-planner-layout">
              <nav class="stay-section-menu" aria-label="Stay planning sections"><a href="#stay-overview">Overview</a><a href="#stay-areas">Areas</a><a href="#stay-airports">Airports</a><a href="#stay-tips">Tips</a><a href="#stay-booking">Booking</a></nav>
              <div class="stay-section-stack">
                <div class="country-panel-card stay-overview-card" id="stay-overview"><h2>Stay Overview</h2><div class="stay-overview-grid stay-overview-grid--planning"><div class="stay-pill"><span>Planning focus</span><strong>Neighborhood fit, airport access, event timing and total nightly fees.</strong></div><div class="stay-pill"><span>Best first move</span><strong>Compare ${html(city.areas[0])} with one lower-price or quieter area.</strong></div><p>Planning a trip to ${html(name)}? Compare stay areas, airport access and event-week demand before booking.</p></div></div>
                <div class="country-panel-card" id="stay-areas"><h2>Best Areas to Stay</h2><div class="stay-area-grid">${areaCards}</div></div>
                <div class="country-panel-card" id="stay-airports"><h2>Airports</h2><ul class="stay-airports">${airportRows}</ul></div>
                <div class="country-panel-card" id="stay-tips"><h2>Travel Tips</h2><div class="stay-tip-grid"><div class="stay-tip"><strong>Best time to visit</strong><p>Check seasonal weather and major event calendars before locking in rates.</p></div><div class="stay-tip"><strong>Transport notes</strong><p>Choose a base around the trips you will repeat most: airport, venue, beach, downtown or dining district.</p></div><div class="stay-tip"><strong>Crowds</strong><p>Prices can jump around conferences, sports weekends, holidays and festivals.</p></div><div class="stay-tip"><strong>Booking detail</strong><p>Compare total cost with taxes, resort fees, parking and cancellation terms.</p></div></div></div>
                <div class="country-panel-card"><h2>Hotel planning</h2><div class="stay-hotel-grid">${hotelCards}</div></div>
                <div class="country-panel-card stay-booking-card" id="stay-booking"><h2>Check Hotel Prices</h2><p>Compare accommodation options in and around ${html(name)}. Hotel availability and prices may vary depending on season and major events.</p><a class="stay-booking-button" href="${html(bookingHref(`${city.areas[0]}, ${name}, ${city.state}, United States`))}" target="_blank" rel="nofollow sponsored noopener">Check hotels on Booking.com</a><p class="stay-affiliate-note">One-Sliders may earn a commission if you make a booking through Booking.com.</p></div>
              </div>
            </div>
          </div>
          <div class="persona-panel view-panel--nearby">
            <div class="country-panel-card"><h2>Nearby ideas</h2><div class="destination-nearby-grid">${nearbyCards}</div></div>
          </div>
          <div class="persona-panel view-panel--events">
            <div class="country-panel-card"><h2>Upcoming events</h2><p class="country-empty is-visible">Use the category calendar for dated events near ${html(name)} while this city guide stays focused on trip planning.</p></div>
          </div>
          <div class="persona-panel view-panel--context">
            <div class="country-panel-card"><h2>Destination highlights</h2><div class="destination-highlight-grid">${highlightCards}</div></div>
            ${sourceLinks(real)}
          </div>
        </section>
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function nav(slug, name) {
  return `<nav class="top-menu" aria-label="Location navigation"><a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a><a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a><a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a><span class="nav-divider"></span><a class="nav-back" href="index.html" title="Back to USA" aria-label="Back to USA"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>USA</span></a><a class="nav-pill" href="../index.html">North America</a><a class="nav-pill" href="index.html">USA</a><a class="nav-pill active" aria-current="page" href="${slug}.html">${html(name)}</a></nav>`;
}

function areaCopy(area, city) {
  if (/airport|circuit|convention/i.test(area)) return `Practical when the trip is built around a venue, airport, conference or event schedule.`;
  if (/beach|waikiki|south beach|venice|santa monica|duval/i.test(area)) return `Useful for easy access to the water, dining and classic visitor plans.`;
  if (/downtown|midtown|loop|historic|old town|plaza|village/i.test(area)) return `Central base for first visits, restaurants, sightseeing and shorter local transfers.`;
  return `Good alternative base when ${city.name} prices, parking or neighborhood style matter.`;
}

function areaBest(area) {
  if (/downtown|midtown|loop|historic|old town|plaza|village/i.test(area)) return 'first visits, dining, sightseeing';
  if (/beach|waikiki|south beach|venice|santa monica|duval/i.test(area)) return 'beaches, nightlife, couples';
  if (/airport|circuit|convention/i.test(area)) return 'events, business, access';
  return 'value, repeat visits, quieter stays';
}

function airportDistance(airport, name) {
  if (/\(JFK\)|\(LGA\)|\(EWR\)/.test(airport)) return `Major New York gateway for ${name} trips.`;
  return `Primary or useful airport for ${name} trips.`;
}

function airportCopy(airport) {
  if (/International|Airport/.test(airport)) return 'Compare nearby stays when arrival time, late flights or onward driving matter.';
  return 'Useful alternative when routing or fares work better.';
}

function hotelCopy(tag, city) {
  if (tag === 'Central base') return `Best when sightseeing and short local transfers matter most.`;
  if (tag === 'Food / nightlife') return `Good when evenings, restaurants and a more local feel shape the trip.`;
  if (tag === 'Availability') return `Check this area when central prices or minimum stays are tight.`;
  return `Useful during event weeks when rooms near the main draw book early.`;
}

function highlightCopy(item, city) {
  return `${item} is listed as a practical ${city.name} trip focus; compare nearby stays before locking in transport plans.`;
}

function shortExperience(item) {
  return `Open the right tab and shape the trip around ${item.toLowerCase()}.`;
}

function experienceLabel(i) {
  return ['Sight', 'Base', 'Food', 'Event', 'Culture', 'Nearby'][i] || 'Plan';
}

function nearbyFor(city) {
  const names = city.areas.slice(0, 5);
  return names.map((name, idx) => ({
    name,
    meta: idx === 0 ? 'Core' : 'Area',
    href: '#stay-areas',
    text: `${name} is worth comparing when choosing where to sleep in ${city.name}.`
  }));
}

function renderWeatherStrip(city, coordinates) {
  if (!coordinates?.lat || !coordinates?.lon) return '';
  const place = city.name.toLowerCase().includes(city.state.toLowerCase()) ? city.name : `${city.name}, ${city.state}`;
  return `<div class="stay-weather-card stay-weather-card--strip" data-weather-strip data-weather-dynamic data-weather-lat="${html(String(coordinates.lat))}" data-weather-lon="${html(String(coordinates.lon))}"><div class="stay-weather-title-row"><h2>Weather Forecast</h2><span>${html(place)}</span></div><div class="stay-weather-page is-active" data-weather-page="0"><div class="stay-weather-days"><article class="stay-weather-tile"><strong>Loading</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">Forecast</span></div></article></div></div><p class="stay-weather-source">National Weather Service forecast.</p></div>`;
}

function dataJson(city) {
  const real = realBySlug.get(city.slug);
  if (!real) throw new Error(`Missing real sourced data for ${city.slug}`);
  return {
    slug: city.slug,
    name: city.name,
    continent: common.continent,
    continentName: common.continentName,
    countrySlug: common.countrySlug,
    countryName: common.countryName,
    depth: 5,
    seo: {
      title: `${city.name} Travel Guide - Where to Stay, Airports & Events`,
      description: `Plan a ${city.name}, ${city.state} trip with neighborhoods, airports, travel tips, events and hotel planning links.`,
      twitterDescription: `Plan a ${city.name}, ${city.state} trip with neighborhoods, airports, travel tips, events and hotel planning links.`,
      webpageDescription: `Plan a ${city.name}, ${city.state} trip with neighborhoods, airports, travel tips, events and hotel planning links.`
    },
    state: city.state,
    region: city.region,
    population: populationFromExtract(city, real),
    coordinates: real.coordinates,
    weather: {
      source: 'National Weather Service',
      dynamic: true
    },
    areas: city.areas,
    airports: city.airports.map(([name, search]) => ({ name, search })),
    bookingDestination: `${city.areas[0]}, ${city.name}, ${city.state}, United States`,
    sources: [
      {
        label: `Wikipedia: ${real.wikipediaTitle}`,
        url: real.contentUrl,
        usedFor: 'city description, coordinates and population context'
      },
      {
        label: real.image.caption ? real.image.caption.replace(/^File:/, '') : `${real.wikipediaTitle} lead image`,
        url: real.image.sourceUrl,
        usedFor: 'hero and mini image crop'
      }
    ],
    sourceFetchedAt: realData.fetchedAt
  };
}

function cityTags(city) {
  const text = [
    city.name,
    city.state,
    city.region,
    city.distance,
    city.known,
    city.hero,
    ...city.areas,
    ...city.highlights
  ].join(' ').toLowerCase();
  const tags = new Set(['city']);
  const addIf = (tag, pattern) => {
    if (pattern.test(text)) tags.add(tag);
  };
  addIf('beach', /beach|surf|waikiki|coast|island|keys|waterfront|harbor|bay|sailing|ocean|reef|sunset/);
  addIf('theme-parks', /theme park|disney|universal|family resort/);
  addIf('music', /music|jazz|broadway|opry|ryman|festival|mardi gras/);
  addIf('sports', /sport|golf|tennis|formula 1|masters|ski|skiing|marathon|event|venue|ballpark|wrigley|burning man/);
  addIf('outdoors', /park|trail|hiking|mountain|desert|canyon|wildlife|national park|lake|river|red rock|lighthouse|snowmass|teton|rainier/);
  addIf('culture', /museum|gallery|art|historic|history|monument|smithsonian|architecture|hollywood|capitol|design|theater|theatre/);
  addIf('food', /food|dining|restaurant|bbq|seafood|creole|cuisine|hot chicken|lowcountry|coffee|breweries/);
  addIf('nightlife', /nightlife|strip|downtown|duval|south beach|shows|fremont|broadway/);
  return Array.from(tags);
}

function cityIndexEntry(city) {
  return {
    name: city.name,
    href: `${city.slug}.html`,
    img: `/content/locations/north-america/usa/img/${city.slug}-mini.png`,
    tags: cityTags(city)
  };
}

function updateUsaData() {
  if (!fs.existsSync(usaDataPath)) return;
  const data = JSON.parse(fs.readFileSync(usaDataPath, 'utf8'));
  data.cities = cities.map(cityIndexEntry);
  fs.writeFileSync(usaDataPath, `${JSON.stringify(data, null, 2)}\n`);
}

function main() {
  fs.mkdirSync(imgDir, { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts/data'), { recursive: true });
  for (const item of cities) {
    fs.writeFileSync(path.join(usaDir, `${item.slug}.html`), render(item));
    fs.writeFileSync(path.join(usaDir, `${item.slug}.city.data.json`), `${JSON.stringify(dataJson(item), null, 2)}\n`);
  }
  updateUsaData();
  console.log(`Generated ${cities.length} USA stay city pages and data files.`);
}

main();
