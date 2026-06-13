import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const locationsRoot = path.join(root, 'content/locations');
const cityTemplatePath = path.join(root, 'scripts/templates/city-page-template.html');
const siteBase = 'https://one-sliders.com';
const bookingClick = 'https://www.jdoqocy.com/click-101771061-17293132?url=';
const coreVersion = 'weather-dynamic-20260613';
const cssVersion = 'city-pages-unified-20260613';

const continentNames = {
  africa: 'Africa',
  asia: 'Asia',
  europe: 'Europe',
  'north-america': 'North America',
  oceania: 'Oceania',
  'south-america': 'South America'
};

function usage() {
  console.log('Usage: node scripts/generate-city-pages.mjs [all|continent|country|city] [more...]');
  console.log('Examples:');
  console.log('  node scripts/generate-city-pages.mjs all');
  console.log('  node scripts/generate-city-pages.mjs europe');
  console.log('  node scripts/generate-city-pages.mjs canada sweden');
  console.log('  node scripts/generate-city-pages.mjs stockholm toronto');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function html(value = '') {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugTitle(slug = '') {
  const special = { usa: 'USA', uk: 'UK', uae: 'UAE' };
  return String(slug)
    .split('-')
    .map((part) => special[part] || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function walkCityData(dir = locationsRoot, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkCityData(full, files);
    } else if (entry.isFile() && entry.name.endsWith('.city.data.json')) {
      files.push(full);
    }
  }
  return files;
}

function countryDataFor(countryDir, countrySlug) {
  const file = path.join(countryDir, `${countrySlug}.data.json`);
  return fs.existsSync(file) ? { file, data: readJson(file) } : { file, data: null };
}

function contextFor(file) {
  const countryDir = path.dirname(file);
  const countrySlug = path.basename(countryDir);
  const continent = path.basename(path.dirname(countryDir));
  const raw = readJson(file);
  const country = countryDataFor(countryDir, countrySlug);
  return {
    file,
    raw,
    countryDir,
    countrySlug,
    continent,
    continentName: raw.continentName || continentNames[continent] || slugTitle(continent),
    countryName: raw.countryName || country.data?.name || slugTitle(countrySlug),
    countryDataFile: country.file,
    countryData: country.data
  };
}

function coords(raw) {
  if (raw.coordinates?.lat && raw.coordinates?.lon) return raw.coordinates;
  if (Array.isArray(raw.coords) && raw.coords.length >= 2) return { lat: raw.coords[0], lon: raw.coords[1] };
  return null;
}

function airports(raw, city, countryName) {
  if (Array.isArray(raw.airports) && raw.airports.length) {
    return raw.airports.map((item) => typeof item === 'string' ? { name: item, search: `${item}, ${city.name}, ${countryName}` } : item);
  }
  if (raw.airport) return [{ name: raw.airport, search: `${raw.airport}, ${city.name}, ${countryName}` }];
  return [];
}

function cityFromContext(ctx) {
  const raw = ctx.raw;
  const slug = raw.slug || path.basename(ctx.file, '.city.data.json');
  const name = raw.name || slugTitle(slug);
  const coordinate = coords(raw);
  const countryName = ctx.countryName;
  const locationLabel = [raw.state || raw.province, countryName].filter(Boolean).join(', ');
  const intro = raw.heroText || raw.intro || raw.kicker || raw.seo?.description ||
    `${name} is a city page for planning stays, events, routes and nearby places in ${countryName}.`;
  const highlights = raw.highlights || raw.knownFor || raw.worthSeeing?.map((item) => String(item.title || '').replace(/:$/, '')) || [];
  const areas = raw.areas || raw.cityCards?.map((item) => item.title || item.name).filter(Boolean) || [];
  const airportList = airports(raw, { name }, countryName);
  return {
    slug,
    name,
    continent: ctx.continent,
    continentName: ctx.continentName,
    countrySlug: ctx.countrySlug,
    countryName,
    locationLabel,
    region: raw.region || raw.state || raw.province || countryName,
    state: raw.state || raw.province || '',
    population: raw.population || raw.kpis?.find?.((item) => /population/i.test(item.label || ''))?.value || 'City population',
    role: raw.role || raw.distance || raw.kicker || `${countryName} city base`,
    knownFor: raw.knownFor || raw.known || raw.kpis?.find?.((item) => /known/i.test(item.label || ''))?.value || highlights.slice(0, 3).join(', ') || 'City planning',
    intro,
    coordinates: coordinate,
    areas,
    airports: airportList,
    highlights,
    events: raw.events || [],
    snapshot: raw.snapshot || [],
    worthSeeing: raw.worthSeeing || [],
    planningQuestions: raw.planningQuestions || [],
    sources: raw.sources || [],
    bookingDestination: raw.bookingDestination || `${areas[0] || name}, ${name}, ${countryName}`,
    tags: raw.tags || cityTags({ name, region: raw.region, role: raw.role, knownFor: raw.knownFor || raw.known, intro, highlights, areas }),
    seo: raw.seo || {}
  };
}

function hasFile(ctx, file) {
  return fs.existsSync(path.join(ctx.countryDir, file));
}

function imageUrl(ctx, city, kind) {
  const own = `img/${city.slug}-${kind}.png`;
  if (hasFile(ctx, own)) return `/content/locations/${ctx.continent}/${ctx.countrySlug}/${own}`;
  const country = `img/${ctx.countrySlug}-${kind}.png`;
  if (hasFile(ctx, country)) return `/content/locations/${ctx.continent}/${ctx.countrySlug}/${country}`;
  const continent = path.join(locationsRoot, ctx.continent, 'img', `${ctx.continent}-${kind}.png`);
  if (fs.existsSync(continent)) return `/content/locations/${ctx.continent}/img/${ctx.continent}-${kind}.png`;
  return '/assets/icons/one-sliders-icon.svg';
}

function webpSrcset(pngUrl) {
  if (!pngUrl.endsWith('.png')) return '';
  const base = pngUrl.slice(0, -4);
  return `${base}-400.webp 400w, ${base}-768.webp 768w, ${base}-1200.webp 1200w`;
}

function miniSrcset(pngUrl) {
  if (!pngUrl.endsWith('.png')) return '';
  const base = pngUrl.slice(0, -4);
  return `${base}-200.webp 200w, ${base}-400.webp 400w`;
}

function bookingHref(search) {
  const url = `https://www.booking.com/searchresults.html?ss=${String(search || '').replaceAll(' ', '+')}`;
  return `${bookingClick}${encodeURIComponent(url)}`;
}

function nav(ctx, city) {
  return `<nav class="top-menu" aria-label="Location navigation"><a class="nav-icon" href="../../../events/index.html" title="Events" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a><a class="nav-icon active" href="../../../locations/index.html" title="World" aria-label="World"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a><a class="nav-icon" href="../../../categories/index.html" title="Categories" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a><span class="nav-divider"></span><a class="nav-back" href="index.html" title="Back to ${html(city.countryName)}" aria-label="Back to ${html(city.countryName)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg><span>${html(city.countryName)}</span></a><a class="nav-pill" href="../index.html">${html(ctx.continentName)}</a><a class="nav-pill" href="index.html">${html(city.countryName)}</a><a class="nav-pill active" aria-current="page" href="${city.slug}.html">${html(city.name)}</a></nav>`;
}

function weather(city) {
  if (!city.coordinates) return '';
  const provider = city.countrySlug === 'usa' ? 'nws' : 'open-meteo';
  const source = provider === 'nws' ? 'National Weather Service forecast.' : 'Open-Meteo forecast.';
  return `<div class="stay-weather-card stay-weather-card--strip" data-weather-strip data-weather-dynamic data-weather-provider="${provider}" data-weather-lat="${html(city.coordinates.lat)}" data-weather-lon="${html(city.coordinates.lon)}"><div class="stay-weather-title-row"><h2>Weather Forecast</h2><span>${html(city.name)}, ${html(city.state || city.countryName)}</span></div><div class="stay-weather-page is-active" data-weather-page="0"><div class="stay-weather-days"><article class="stay-weather-tile"><strong>Loading</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">Forecast</span></div></article></div></div><p class="stay-weather-source">${source}</p></div>`;
}

function facts(city) {
  const label = city.state ? 'State / province' : 'Country';
  return `<div class="destination-side-facts" aria-label="${html(city.name)} quick facts"><div class="destination-side-fact"><span>${label}</span><strong>${html(city.state || city.countryName)}</strong></div><div class="destination-side-fact"><span>Region</span><strong>${html(city.region)}</strong></div><div class="destination-side-fact"><span>Population</span><strong>${html(city.population)}</strong></div><div class="destination-side-fact"><span>Trip role</span><strong>${html(city.role)}</strong></div><div class="destination-side-fact destination-side-fact--wide"><span>Known for</span><strong>${html(city.knownFor)}</strong></div></div>`;
}

function experienceCards(city) {
  const items = city.highlights.length ? city.highlights : [city.knownFor, city.region, city.countryName].filter(Boolean);
  return items.slice(0, 6).map((item, index) => `<label class="destination-experience-card" for="${index % 2 === 0 ? 'view-see' : 'view-context'}" role="button" tabindex="0"><span>${html(['Sight', 'Base', 'Culture', 'Nature', 'Food', 'Nearby'][index] || 'Plan')}</span><strong>${html(item)}</strong><p>Shape the trip around ${html(String(item).toLowerCase())}.</p></label>`).join('');
}

function attractionCards(ctx, city) {
  const items = city.highlights.length ? city.highlights : city.worthSeeing.map((item) => item.title || item.text).filter(Boolean);
  return items.slice(0, 6).map((item, index) => {
    const see = `img/${city.slug}-see-${index + 1}-mini.png`;
    const img = hasFile(ctx, see) ? `/content/locations/${ctx.continent}/${ctx.countrySlug}/${see}` : imageUrl(ctx, city, 'mini');
    return `<article class="destination-attraction-card"><img src="${img}" srcset="${miniSrcset(img)}" sizes="(max-width:620px) 220px, 400px" alt="${html(city.name)} ${html(item)}" loading="lazy" width="400" height="300"><div><strong>${html(item)}</strong><p>${html(item)} is a practical ${html(city.name)} trip focus; compare nearby stays before locking in transport plans.</p></div></article>`;
  }).join('');
}

function areaCards(city) {
  const areas = city.areas.length ? city.areas : [city.name];
  return areas.slice(0, 8).map((area) => `<div class="stay-area"><strong>${html(area)}</strong><p>Compare this base when planning ${html(city.name)} around access, season, price and the main places you want to see.</p><span>Best for: trip fit and local access</span><a class="stay-booking-button" href="${html(bookingHref(`${area}, ${city.name}, ${city.countryName}`))}" target="_blank" rel="nofollow sponsored noopener">Compare stays</a></div>`).join('');
}

function airportRows(city) {
  const items = city.airports.length ? city.airports : [{ name: 'Main airport or arrival point TBC', search: `${city.name}, ${city.countryName}` }];
  return items.map((item) => `<li><strong>${html(item.name)}</strong><span>Compare nearby stays when arrival time, late flights, ferries, trains or onward driving matter.</span></li>`).join('');
}

function nearbyCards(city) {
  const areas = city.areas.length ? city.areas.slice(0, 5) : [city.region, city.countryName].filter(Boolean);
  return areas.map((area, index) => `<a class="destination-nearby-card" href="#stay-areas"><span>${index === 0 ? 'Core' : 'Area'}</span><strong>${html(area)}</strong><p>Useful comparison point for stays in and around ${html(city.name)}.</p></a>`).join('');
}

function eventCards(city) {
  if (!city.events.length) return `<p class="country-empty is-visible">Use the category calendar for dated events near ${html(city.name)} while this city guide stays focused on trip planning.</p>`;
  return `<div class="destination-highlight-grid">${city.events.slice(0, 8).map((event) => `<a class="destination-highlight" href="${html(event.href || '#')}"><span>Event</span><strong>${html(event.title || 'Event')}</strong><p>${html(event.meta || 'Check current dates before building a trip around this event.')}</p></a>`).join('')}</div>`;
}

function sourceLinks(city) {
  const sources = city.sources.length ? city.sources : [{ label: `${city.name} city data`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name.replaceAll(' ', '_'))}` }];
  return `<div class="country-panel-card destination-source-card"><h2>Sources</h2><div class="country-qa-list">${sources.slice(0, 4).map((source) => `<div><strong>${html(source.label || 'Source')}</strong><span>${source.url ? `<a href="${html(source.url)}" target="_blank" rel="noopener">${html(source.usedFor || source.url)}</a>` : html(source.usedFor || 'City data')}</span></div>`).join('')}</div></div>`;
}

function citySnapshot(city) {
  return `<div class="country-panel-card country-history-card"><h2>City Snapshot</h2><div class="country-history-list"><div><time>Place</time><span>${html(city.name)} connects local landmarks, stays and event planning in ${html(city.countryName)}.</span></div><div><time>Stay</time><span>Compare ${html(city.areas.length ? city.areas.slice(0, 3).join(', ') : city.name)} before booking.</span></div><div><time>Access</time><span>${html(city.airports.map((airport) => airport.name).join(' / ') || 'Arrival details TBC')}.</span></div><div><time>Image</time><span>City image assets are reused when present; the country image is used only as a fallback.</span></div></div></div>`;
}

function parentCard(ctx, city) {
  const img = imageUrl(ctx, { ...city, slug: ctx.countrySlug }, 'mini');
  return `<a class="location-parent-card city-country-card" href="index.html" aria-label="Explore ${html(city.countryName)}"><img src="${img}" srcset="${miniSrcset(img)}" sizes="136px" alt="${html(city.countryName)} thumbnail" loading="lazy" width="400" height="300"><span>Part of ${html(city.countryName)}</span><strong>Explore more ${html(city.countryName)}</strong><em>More cities, stays and event bases across ${html(city.countryName)}.</em></a>`;
}

function planPanel(city) {
  return `<div class="country-panel-card country-panel-card--split"><div><h2>Trip facts</h2><div class="fact-table country-facts-tight"><div class="fact-row"><span>Country</span><strong>${html(city.countryName)}</strong></div><div class="fact-row"><span>Region</span><strong>${html(city.region)}</strong></div><div class="fact-row"><span>Main draw</span><strong>${html(city.knownFor)}</strong></div><div class="fact-row"><span>Best base</span><strong>${html(city.areas[0] || city.name)}</strong></div></div></div><div><h2>Why go</h2><ul class="country-points"><li><strong>City context:</strong> ${html(city.intro)}</li><li><strong>Stay planning:</strong> Compare ${city.areas.length ? html(city.areas.slice(0, 3).join(', ')) : html(city.name)} before picking a hotel base.</li><li><strong>Booking check:</strong> Review taxes, local transport, parking and cancellation rules before paying.</li></ul></div></div>`;
}

function seePanel(ctx, city) {
  return `<div class="country-panel-card"><h2>Worth seeing</h2><div class="destination-attraction-grid">${attractionCards(ctx, city)}</div></div>`;
}

function stayPanel(city) {
  return `<div class="stay-planner-layout"><nav class="stay-section-menu" aria-label="Stay planning sections"><a href="#stay-overview">Overview</a><a href="#stay-areas">Areas</a><a href="#stay-airports">Airports</a><a href="#stay-tips">Tips</a><a href="#stay-booking">Booking</a></nav><div class="stay-section-stack"><div class="country-panel-card stay-overview-card" id="stay-overview"><h2>Stay Overview</h2><div class="stay-overview-grid stay-overview-grid--planning"><div class="stay-pill"><span>Planning focus</span><strong>Neighborhood fit, airport access, event timing and total nightly fees.</strong></div><div class="stay-pill"><span>Best first move</span><strong>Compare ${html(city.areas[0] || city.name)} with one lower-price or quieter area.</strong></div><p>Planning a trip to ${html(city.name)}? Compare stay areas, airport access and event-week demand before booking.</p></div></div><div class="country-panel-card" id="stay-areas"><h2>Best Areas to Stay</h2><div class="stay-area-grid">${areaCards(city)}</div></div><div class="country-panel-card" id="stay-airports"><h2>Airports</h2><ul class="stay-airports">${airportRows(city)}</ul></div><div class="country-panel-card" id="stay-tips"><h2>Travel Tips</h2><div class="stay-tip-grid"><div class="stay-tip"><strong>Best time to visit</strong><p>Check seasonal weather, daylight and major event calendars before locking in rates.</p></div><div class="stay-tip"><strong>Transport notes</strong><p>Choose a base around the trips you will repeat most: airport, harbour, station, venue, old town or nature route.</p></div><div class="stay-tip"><strong>Crowds</strong><p>Prices can jump around festivals, school holidays, cruise days, ski weeks and big sports weekends.</p></div><div class="stay-tip"><strong>Booking detail</strong><p>Compare total cost with taxes, breakfast, parking, ferry timing and cancellation terms.</p></div></div></div><div class="country-panel-card stay-booking-card" id="stay-booking"><h2>Check Hotel Prices</h2><p>Compare accommodation options in and around ${html(city.name)}. Hotel availability and prices may vary depending on season and major events.</p><a class="stay-booking-button" href="${html(bookingHref(city.bookingDestination))}" target="_blank" rel="nofollow sponsored noopener">Check hotels on Booking.com</a><p class="stay-affiliate-note">One-Sliders may earn a commission if you make a booking through Booking.com.</p></div></div></div>`;
}

function nearbyPanel(city) {
  return `<div class="country-panel-card"><h2>Nearby ideas</h2><div class="destination-nearby-grid">${nearbyCards(city)}</div></div>`;
}

function eventsPanel(city) {
  return `<div class="country-panel-card"><h2>Event planning</h2>${eventCards(city)}</div>`;
}

function highlightsPanel(city) {
  const highlights = (city.highlights.length ? city.highlights : [city.knownFor, city.region, city.countryName]).filter(Boolean);
  return `<div class="country-panel-card"><h2>Destination highlights</h2><div class="destination-highlight-grid">${highlights.slice(0, 8).map((item) => `<div class="destination-highlight"><span>Highlight</span><strong>${html(item)}</strong><p>${html(item)} is a practical ${html(city.name)} trip focus.</p></div>`).join('')}</div></div>${sourceLinks(city)}`;
}

function heroPicture(hero, heroSrcset) {
  return `<picture class="country-hero-image country-hero-image--clear" aria-hidden="true">${heroSrcset ? `<source srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" type="image/webp">` : ''}<img srcset="${heroSrcset}" sizes="(max-width: 720px) 100vw, 42vw" src="${hero}" alt="" width="1200" height="630" loading="eager" decoding="async"></picture>`;
}

function fillTemplate(values) {
  const template = fs.readFileSync(cityTemplatePath, 'utf8');
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

function jsonLd(ctx, city, title, description, hero) {
  const pageUrl = `${siteBase}/content/locations/${ctx.continent}/${ctx.countrySlug}/${city.slug}.html`;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: pageUrl,
    image: `${siteBase}${hero}`,
    inLanguage: 'en'
  });
}

function render(ctx) {
  const city = cityFromContext(ctx);
  const title = city.seo.title || `${city.name} Travel Guide - Where to Stay, Airports & Events`;
  const description = city.seo.description || `Plan a ${city.name}, ${city.countryName} trip with neighborhoods, airports, travel tips, events and hotel planning links.`;
  const hero = imageUrl(ctx, city, 'hero');
  const heroSrcset = webpSrcset(hero);
  const pageUrl = `${siteBase}/content/locations/${ctx.continent}/${ctx.countrySlug}/${city.slug}.html`;
  return fillTemplate({
    BODY_CLASS: `country-onepage city-page--stay-template city-page--${ctx.countrySlug} city-page--${city.slug}`,
    CORE_VERSION: coreVersion,
    CSS_VERSION: cssVersion,
    TITLE: html(title),
    DESCRIPTION: html(description),
    OG_IMAGE: `${siteBase}${hero}`,
    PAGE_URL: pageUrl,
    HERO_PRELOAD: heroSrcset ? hero.replace('.png', '-1200.webp') : hero,
    JSON_LD: jsonLd(ctx, city, title, description, hero),
    NAV: nav(ctx, city),
    CITY_NAME: html(city.name),
    CITY_SLUG: html(city.slug),
    HERO_PICTURE: heroPicture(hero, heroSrcset),
    KICKER: html(city.intro),
    FACTS: facts(city),
    WEATHER: weather(city),
    HERO_TEXT: html(city.intro),
    EXPERIENCE_CARDS: experienceCards(city),
    CITY_SNAPSHOT: citySnapshot(city),
    PARENT_CARD: parentCard(ctx, city),
    PLAN_PANEL: planPanel(city),
    SEE_PANEL: seePanel(ctx, city),
    STAY_PANEL: stayPanel(city),
    NEARBY_PANEL: nearbyPanel(city),
    EVENTS_PANEL: eventsPanel(city),
    HIGHLIGHTS_PANEL: highlightsPanel(city)
  });
}

function cityTags(city) {
  const text = [city.name, city.region, city.role, city.knownFor, city.intro, ...(city.highlights || []), ...(city.areas || [])].join(' ').toLowerCase();
  const tags = new Set(['city']);
  const add = (tag, pattern) => { if (pattern.test(text)) tags.add(tag); };
  add('waterfront', /fjord|harbour|harbor|canal|lake|river|coast|beach|island|archipelago|bay|sea|port|waterfall/);
  add('winter', /arctic|aurora|northern lights|snow|ski|ice|lapland|polar/);
  add('culture', /museum|cathedral|castle|palace|old town|church|design|university|history|medieval|art|theatre|theater/);
  add('outdoors', /mountain|trail|park|fjord|waterfall|national park|viewpoint|hiking|glacier|forest|wildlife/);
  add('family', /lego|zoo|santa|theme|family/);
  add('food', /food|market|seafood|sauna|dining|wine|coffee|restaurant/);
  add('sports', /sport|golf|tennis|formula|ski|marathon|race|stadium/);
  return Array.from(tags);
}

function indexEntry(ctx) {
  const city = cityFromContext(ctx);
  return {
    name: city.name,
    href: `${city.slug}.html`,
    img: imageUrl(ctx, city, 'mini'),
    tags: city.tags?.length ? city.tags : cityTags(city)
  };
}

function matches(ctx, filters) {
  if (!filters.length) return true;
  if (filters.includes('all')) return true;
  const city = cityFromContext(ctx);
  const values = new Set([ctx.continent, ctx.countrySlug, city.slug, city.name.toLowerCase().replace(/\s+/g, '-')]);
  if (ctx.countrySlug === 'usa') values.add('united-states');
  if (ctx.countrySlug === 'canada') values.add('canada');
  if (['denmark', 'sweden', 'norway', 'finland', 'iceland', 'faroe-islands', 'greenland'].includes(ctx.countrySlug)) {
    values.add('nordic');
    values.add('norden');
  }
  if (['usa', 'canada'].includes(ctx.countrySlug)) values.add('north-america-cities');
  return filters.some((filter) => values.has(filter));
}

function updateCountryIndexes(contexts) {
  const byCountry = new Map();
  for (const ctx of contexts) {
    const key = ctx.countryDir;
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key).push(ctx);
  }
  for (const group of byCountry.values()) {
    const { countryDataFile, countryData } = group[0];
    if (!countryData) continue;
    countryData.cities = group
      .map(indexEntry)
      .sort((a, b) => a.name.localeCompare(b.name));
    writeJson(countryDataFile, countryData);
  }
}

function main() {
  const args = process.argv.slice(2).map((arg) => arg.toLowerCase());
  if (args.includes('--help') || args.includes('-h')) {
    usage();
    return;
  }
  const contexts = walkCityData().map(contextFor).filter((ctx) => matches(ctx, args));
  if (!contexts.length) {
    console.error('No matching city data files found.');
    usage();
    process.exit(1);
  }
  for (const ctx of contexts) {
    const city = cityFromContext(ctx);
    fs.writeFileSync(path.join(ctx.countryDir, `${city.slug}.html`), render(ctx));
  }
  updateCountryIndexes(contexts);
  console.log(`Generated ${contexts.length} city pages from .city.data.json files.`);
}

main();
