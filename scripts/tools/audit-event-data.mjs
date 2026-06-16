import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const registerPath = path.join(root, 'events.register.json');
const outputPath = path.join(root, 'tmp', 'fact-check.csv');
const today = new Date('2026-05-31T00:00:00Z');
const countryAliases = new Map([
  ['usa', 'united states'],
  ['united states of america', 'united states'],
  ['uk', 'united kingdom']
]);

const knownCountryPaths = new Map([
  ['argentina', '/content/locations/south-america/argentina/index.html'],
  ['canada', '/content/locations/north-america/canada/index.html'],
  ['germany', '/content/locations/europe/germany/index.html'],
  ['ireland', '/content/locations/europe/ireland/index.html'],
  ['mexico', '/content/locations/north-america/mexico/index.html'],
  ['united arab emirates', '/content/locations/asia/united-arab-emirates/index.html'],
  ['united kingdom', '/content/locations/europe/united-kingdom/index.html'],
  ['united states', '/content/locations/north-america/usa/index.html']
]);

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedCountry(value) {
  const key = normalizeText(value).toLowerCase();
  return countryAliases.get(key) || key;
}

function countryTextMatches(text, country) {
  const lowerText = text.toLowerCase();
  const normalized = normalizedCountry(country);
  if (lowerText.includes(normalized)) return true;
  return [...countryAliases.entries()].some(([alias, target]) => target === normalized && lowerText.includes(alias));
}

function countryObject(name, yearData) {
  const normalized = normalizedCountry(name);
  const existing = yearData?.editions
    ?.flatMap((edition) => edition.countries || [])
    .find((country) => normalizedCountry(country.name) === normalized);
  if (existing) return { ...existing };

  const url = knownCountryPaths.get(normalized);
  if (!url) return null;
  const label = normalized === 'united states' && name === 'USA' ? 'United States' : name;
  return {
    name: label,
    url,
    flag: url.replace(/index\.html$/, 'img/flag.svg')
  };
}

function isoAddDays(dateValue, days) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function editionForEvent(event) {
  const start = event.startDate ? new Date(`${event.startDate}T00:00:00Z`) : null;
  const end = event.endDate ? new Date(`${event.endDate}T23:59:59Z`) : null;
  const isDateRelevant = !end || end >= today || event.status === 'active';

  return ['active', 'upcoming'].includes(event.status) && isDateRelevant;
}

function extractJsonScripts(html) {
  const scripts = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const attrs = match[1] || '';
    if (/type=["']application\/(?:ld\+)?json["']/i.test(attrs)) {
      scripts.push({ attrs, json: match[2].trim() });
    }
  }
  return scripts;
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getEventYearData(html) {
  const match = html.match(/<script\b[^>]*id=["']event-year-data["'][^>]*>([\s\S]*?)<\/script>/i);
  return match ? parseJson(match[1].trim()) : null;
}

function findJsonLdEvents(html) {
  return extractJsonScripts(html)
    .filter((script) => /ld\+json/i.test(script.attrs))
    .map((script) => parseJson(script.json))
    .filter(Boolean)
    .flatMap((data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data['@graph'])) return data['@graph'];
      return [data];
    })
    .filter((node) => String(node?.['@type'] || '').toLowerCase().includes('event'));
}

function defaultEdition(yearData, event) {
  if (!yearData?.editions?.length) return null;
  return yearData.editions.find((edition) => edition.year === event.currentEdition)
    || yearData.editions.find((edition) => edition.year === yearData.defaultYear)
    || yearData.editions.at(-1);
}

function expectedLocation(event) {
  return {
    countries: event.location?.countries || [],
    cities: event.location?.cities || [],
    venue: event.location?.venue || ''
  };
}

function editionLocation(edition) {
  return {
    countries: (edition?.countries || []).map((country) => country.name),
    cities: (edition?.cities || []).map((city) => city.name),
    venue: edition?.venue || ''
  };
}

function locationMatches(actual, expected) {
  const expectedCountries = expected.countries.map(normalizedCountry);
  const actualCountries = actual.countries.map(normalizedCountry);
  const expectedCities = expected.cities.filter((city) => city && city !== 'TBC');
  const missingCountries = expected.countries.filter((country) => !actualCountries.includes(normalizedCountry(country)));
  const unexpectedCountries = expectedCountries.length
    ? actual.countries.filter((country) => !expectedCountries.includes(normalizedCountry(country)))
    : [];
  const missingCities = expectedCities.filter((city) => !actual.cities.includes(city));
  const unexpectedCities = expectedCities.length
    ? actual.cities.filter((city) => !expectedCities.includes(city))
    : [];
  const venueMismatch = expected.venue && expected.venue !== 'TBC' && actual.venue && actual.venue !== expected.venue;

  return {
    ok: !missingCountries.length && !unexpectedCountries.length && !missingCities.length && !unexpectedCities.length && !venueMismatch,
    detail: [
      missingCountries.length ? `missing countries: ${missingCountries.join('|')}` : '',
      unexpectedCountries.length ? `unexpected countries: ${unexpectedCountries.join('|')}` : '',
      missingCities.length ? `missing cities: ${missingCities.join('|')}` : '',
      unexpectedCities.length ? `unexpected cities: ${unexpectedCities.join('|')}` : '',
      venueMismatch ? `venue ${actual.venue} != ${expected.venue}` : ''
    ].filter(Boolean).join('; ')
  };
}

function textContainsAny(html, values) {
  const text = normalizeText(html);
  return values.some((value) => value && text.includes(value));
}

function replaceJsonInScript(html, id, data) {
  const pattern = new RegExp(`(<script\\b[^>]*id=["']${id}["'][^>]*>)([\\s\\S]*?)(<\\/script>)`, 'i');
  return html.replace(pattern, `$1${JSON.stringify(data)}$3`);
}

function syncDefaultEdition(yearData, event) {
  const edition = defaultEdition(yearData, event);
  if (!edition) return { changed: false, changes: [] };

  const changes = [];
  const expectedEndExclusive = isoAddDays(event.endDate, 1);
  const expected = expectedLocation(event);

  if (yearData.defaultYear !== event.currentEdition) {
    changes.push(`defaultYear ${yearData.defaultYear} -> ${event.currentEdition}`);
    yearData.defaultYear = event.currentEdition;
  }
  if (edition.year !== event.currentEdition) {
    changes.push(`default edition year ${edition.year} -> ${event.currentEdition}`);
    edition.year = event.currentEdition;
  }
  if (event.startDate && edition.startDate !== event.startDate) {
    changes.push(`startDate ${edition.startDate} -> ${event.startDate}`);
    edition.startDate = event.startDate;
  }
  if (expectedEndExclusive && edition.endExclusive !== expectedEndExclusive) {
    changes.push(`endExclusive ${edition.endExclusive} -> ${expectedEndExclusive}`);
    edition.endExclusive = expectedEndExclusive;
  }
  if (event.displayDates && edition.dates !== event.displayDates) {
    changes.push(`dates ${edition.dates} -> ${event.displayDates}`);
    edition.dates = event.displayDates;
  }
  if (event.status && edition.status !== event.status) {
    changes.push(`status ${edition.status} -> ${event.status}`);
    edition.status = event.status;
  }
  if (event.statusLabel && edition.statusLabel !== event.statusLabel) {
    changes.push(`statusLabel ${edition.statusLabel} -> ${event.statusLabel}`);
    edition.statusLabel = event.statusLabel;
  }
  if (expected.venue && edition.venue !== expected.venue) {
    changes.push(`venue ${edition.venue} -> ${expected.venue}`);
    edition.venue = expected.venue;
  }

  edition.countries ||= [];
  const countryNames = edition.countries.map((country) => normalizedCountry(country.name));
  const replacementCountries = [];
  for (const country of expected.countries) {
    if (!countryNames.includes(normalizedCountry(country))) {
      const object = countryObject(country, yearData);
      if (object) {
        changes.push(`country missing ${country}`);
        replacementCountries.push(object);
      }
    } else {
      replacementCountries.push(edition.countries.find((item) => normalizedCountry(item.name) === normalizedCountry(country)));
    }
  }
  if (expected.countries.length && replacementCountries.length === expected.countries.length) {
    const current = edition.countries.map((country) => normalizedCountry(country.name)).join('|');
    const replacement = replacementCountries.map((country) => normalizedCountry(country.name)).join('|');
    if (current !== replacement) changes.push(`countries ${current} -> ${replacement}`);
    edition.countries = replacementCountries;
  }

  edition.cities ||= [];
  const cityNames = edition.cities.map((city) => city.name);
  const replacementCities = [];
  for (const city of expected.cities) {
    if (city && city !== 'TBC' && !cityNames.includes(city)) {
      changes.push(`city missing ${city}`);
      replacementCities.push({ name: city, url: '' });
    } else if (city && city !== 'TBC') {
      replacementCities.push(edition.cities.find((item) => item.name === city));
    }
  }
  if (expected.cities.some((city) => city && city !== 'TBC')) {
    const current = edition.cities.map((city) => city.name).join('|');
    const replacement = replacementCities.map((city) => city.name).join('|');
    if (current !== replacement) changes.push(`cities ${current} -> ${replacement}`);
    edition.cities = replacementCities;
  }

  return { changed: changes.length > 0, changes };
}

function syncJsonLd(html, event) {
  const expectedValues = [
    event.startDate,
    event.endDate,
    ...(event.location?.countries || []),
    ...(event.location?.cities || []),
    event.location?.venue
  ].filter((value) => value && value !== 'TBC');
  if (!expectedValues.length || !/<script\b[^>]*type=["']application\/ld\+json["']/i.test(html)) {
    return { html, changed: false, changes: [] };
  }

  let changed = false;
  const changes = [];
  const updated = html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi, (match, open, json, close) => {
    const data = parseJson(json.trim());
    if (!data || !String(data['@type'] || '').toLowerCase().includes('event')) return match;

    if (event.startDate && data.startDate !== event.startDate) {
      changes.push(`JSON-LD startDate ${data.startDate} -> ${event.startDate}`);
      data.startDate = event.startDate;
      changed = true;
    }
    if (event.endDate && data.endDate !== event.endDate) {
      changes.push(`JSON-LD endDate ${data.endDate} -> ${event.endDate}`);
      data.endDate = event.endDate;
      changed = true;
    }

    const location = data.location && typeof data.location === 'object' ? data.location : { '@type': 'Place' };
    data.location = location;
    if (event.location?.venue && event.location.venue !== 'TBC' && location.name !== event.location.venue) {
      changes.push(`JSON-LD location.name ${location.name} -> ${event.location.venue}`);
      location.name = event.location.venue;
      changed = true;
    }
    location.address = location.address && typeof location.address === 'object' ? location.address : { '@type': 'PostalAddress' };
    const cityValue = (event.location?.cities || []).filter((city) => city && city !== 'TBC').join(' / ');
    const firstCountry = (event.location?.countries || []).find(Boolean);
    if (cityValue && location.address.addressLocality !== cityValue) {
      changes.push(`JSON-LD addressLocality ${location.address.addressLocality} -> ${cityValue}`);
      location.address.addressLocality = cityValue;
      changed = true;
    }
    if (firstCountry && normalizedCountry(location.address.addressCountry) !== normalizedCountry(firstCountry)) {
      changes.push(`JSON-LD addressCountry ${location.address.addressCountry} -> ${firstCountry}`);
      location.address.addressCountry = firstCountry;
      changed = true;
    }

    return `${open}${JSON.stringify(data)}${close}`;
  });

  return { html: updated, changed, changes };
}

async function main() {
  const register = JSON.parse(await fs.readFile(registerPath, 'utf8'));
  const rows = [[
    'slug',
    'path',
    'status',
    'expected_start',
    'expected_end',
    'expected_display_dates',
    'expected_place',
    'json_status',
    'text_status',
    'json_ld_status',
    'action',
    'notes',
    'sources'
  ]];

  let checked = 0;
  let changedFiles = 0;

  for (const event of register.events.filter(editionForEvent)) {
    checked += 1;
    const pagePath = event.eventPageEN ? path.join(root, event.eventPageEN) : '';
    const sourceSummary = (event.sources || []).map((source) => `${source.label} ${source.url}`).join(' | ');
    const placeSummary = [
      ...(event.location?.cities || []),
      event.location?.venue && event.location.venue !== 'TBC' ? event.location.venue : '',
      ...(event.location?.countries || [])
    ].filter(Boolean).join(' / ');

    let html;
    try {
      html = await fs.readFile(pagePath, 'utf8');
    } catch (error) {
      rows.push([event.slug, event.eventPageEN || '', event.status, event.startDate, event.endDate, event.displayDates, placeSummary, 'missing-page', 'not-checked', 'not-checked', 'none', error.message, sourceSummary]);
      continue;
    }

    const yearData = getEventYearData(html);
    const edition = defaultEdition(yearData, event);
    const expected = expectedLocation(event);
    const actual = editionLocation(edition);
    const loc = locationMatches(actual, expected);
    const jsonDateOk = Boolean(edition && (
      event.startDate
        ? edition.startDate === event.startDate && edition.endExclusive === isoAddDays(event.endDate, 1) && edition.dates === event.displayDates
        : !edition.startDate && edition.dates === event.displayDates
    ));
    const jsonPlaceOk = Boolean(edition && loc.ok);
    const jsonStatus = jsonDateOk && jsonPlaceOk ? 'ok' : 'mismatch';

    const visibleDateOk = textContainsAny(html, [event.displayDates, event.startDate]);
    const visiblePlaceValues = [...expected.countries, ...expected.cities, expected.venue].filter((value) => value && value !== 'TBC');
    const visiblePlaceOk = textContainsAny(html, visiblePlaceValues);
    const textStatus = visibleDateOk && (visiblePlaceOk || !placeSummary || placeSummary === 'TBC') ? 'ok' : 'review';

    const jsonLdEvents = findJsonLdEvents(html);
    let jsonLdStatus = 'absent';
    if (jsonLdEvents.length) {
      const ldDateOk = jsonLdEvents.some((node) => String(node.startDate || '').startsWith(event.startDate || ''));
      const ldText = JSON.stringify(jsonLdEvents);
      const ldValues = [...expected.countries, ...expected.cities, expected.venue].filter((value) => value && value !== 'TBC');
      const ldPlaceOk = ldValues.every((value) => {
        if (event.location?.countries?.includes(value)) {
          return countryTextMatches(ldText, value);
        }
        return ldText.includes(value);
      });
      jsonLdStatus = ldDateOk && ldPlaceOk ? 'ok' : 'mismatch';
    }

    let action = 'none';
    let notes = [];
    if (yearData && jsonStatus === 'mismatch') {
      const sync = syncDefaultEdition(yearData, event);
      if (sync.changed) {
        let updated = replaceJsonInScript(html, 'event-year-data', yearData);
        const syncedJsonLd = syncJsonLd(updated, event);
        updated = syncedJsonLd.html;
        await fs.writeFile(pagePath, updated, 'utf8');
        changedFiles += 1;
        action = 'corrected-event-year-data';
        notes.push(...sync.changes);
        notes.push(...syncedJsonLd.changes);
      }
    } else if (jsonLdStatus === 'mismatch') {
      const syncedJsonLd = syncJsonLd(html, event);
      if (syncedJsonLd.changed) {
        await fs.writeFile(pagePath, syncedJsonLd.html, 'utf8');
        changedFiles += 1;
        action = 'corrected-json-ld';
        notes.push(...syncedJsonLd.changes);
      }
    }
    if (!yearData) notes.push('missing event-year-data');
    if (jsonStatus === 'mismatch' && !notes.length) notes.push(`location/date mismatch: ${loc.detail}`);
    if (textStatus === 'review') notes.push('visible text may need manual review');
    if (jsonLdStatus === 'mismatch') notes.push('JSON-LD mismatch not auto-corrected');

    rows.push([
      event.slug,
      event.eventPageEN,
      event.status,
      event.startDate || '',
      event.endDate || '',
      event.displayDates || '',
      placeSummary,
      jsonStatus,
      textStatus,
      jsonLdStatus,
      action,
      notes.join('; '),
      sourceSummary
    ]);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`, 'utf8');
  console.log(`Checked ${checked} active/upcoming events.`);
  console.log(`Changed ${changedFiles} files.`);
  console.log(`Wrote ${path.relative(root, outputPath).replaceAll(path.sep, '/')}.`);
}

await main();
