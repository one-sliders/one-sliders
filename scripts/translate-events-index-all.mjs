import fs from 'node:fs';
import { languages, profiles, codeLabel } from './event-language-profiles.mjs';
import { translateEventTitle } from './event-title-translations.mjs';

const continentIcons = {
  africa: '🌍',
  asia: '🌏',
  europe: '🌍',
  'north-america': '🌎',
  oceania: '🌏',
  'south-america': '🌎'
};

const catData = {
  motor: 'motor',
  sport: 'sport',
  festival: 'festival',
  culture: 'culture',
  nature: 'nature'
};

function replaceAll(html, from, to) {
  return html.split(from).join(to);
}

function translateDateText(text, profile) {
  let out = text;
  for (const [en, translated] of Object.entries(profile.shortMonths || {})) {
    out = out.replace(new RegExp(`\\b${en}\\b`, 'g'), translated);
  }
  for (const [en, translated] of Object.entries(profile.months || {})) {
    out = out.replace(new RegExp(`\\b${en}\\b`, 'g'), translated);
  }
  return out;
}

function translateIndex(html, lang) {
  const p = profiles[lang] || profiles.en;
  let out = html;

  out = out.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${p.description}"`);
  out = out.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${p.title}"`);
  out = out.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${p.description}"`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${p.title}"`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${p.description}"`);

  out = out.replace(/<span class="hero-kicker">[^<]*<\/span>/, `<span class="hero-kicker">${p.kicker}</span>`);
  out = out.replace(/<h1>[^<]*<\/h1>/, `<h1>${p.h1}</h1>`);
  out = out.replace(/<header class="hero">([\s\S]*?)<p>[^<]*<\/p>/, (match, before) => `<header class="hero">${before}<p>${p.intro}</p>`);

  out = replaceAll(out, 'title="Events" aria-label="Events"', `title="${p.labels.category}" aria-label="${p.labels.category}"`);
  out = replaceAll(out, 'title="World" aria-label="World"', `title="${p.labels.global}" aria-label="${p.labels.global}"`);
  out = replaceAll(out, 'title="Categories" aria-label="Categories"', `title="${p.labels.category}" aria-label="${p.labels.category}"`);
  out = out.replace(/<div class="event-language-list" aria-label="[^"]*">/, `<div class="event-language-list" aria-label="${p.labels.language}">`);
  out = out.replace(/<span>Languages<\/span>|<span>Language<\/span>|<span>Язык<\/span>/, `<span>${p.labels.language}</span>`);
  out = out.replace(/(<div class="event-language-list"[\s\S]*?<span>[^<]*<\/span>\n)([\s\S]*?)(\s*<\/div>)/, (match, start, links, end) => {
    const rewritten = languages.map((code) => `      <a${code === lang ? ' aria-current="true"' : ''} href="../../../${code}/content/events/index.html">${codeLabel(code)}</a>`).join('\n');
    return `${start}${rewritten}${end}`;
  });

  out = out.replace(/<span>[^<]* <span class="filter-badge"/, `<span>${p.labels.filters} <span class="filter-badge"`);
  out = replaceAll(out, '<span class="filter-label">Category</span>', `<span class="filter-label">${p.labels.category}</span>`);
  out = replaceAll(out, '<span class="filter-label">Topic</span>', `<span class="filter-label">${p.labels.topic}</span>`);
  out = replaceAll(out, '<span class="filter-label">Region</span>', `<span class="filter-label">${p.labels.region}</span>`);
  out = replaceAll(out, '<span class="filter-label">Country</span>', `<span class="filter-label">${p.labels.country}</span>`);
  out = replaceAll(out, '<span class="filter-label">Timezone</span>', `<span class="filter-label">${p.labels.timezone}</span>`);
  out = replaceAll(out, '<span class="filter-label">Level</span>', `<span class="filter-label">${p.labels.level}</span>`);

  out = out.replace(/(<button class="filter-btn active" data-cat="all">)[^<]*(<\/button>)/, `$1${p.labels.all}$2`);
  for (const [data, key] of Object.entries(catData)) {
    out = out.replace(new RegExp(`(<button class="filter-btn" data-cat="${data}">)[^<]*(<\\/button>)`), `$1${p.categories[key]}$2`);
  }
  out = out.replace(/(<button class="filter-btn active" data-cont="all">)[^<]*(<\/button>)/, `$1${p.labels.all}$2`);
  for (const [key, label] of Object.entries(p.continents)) {
    out = out.replace(new RegExp(`(<button class="filter-btn" data-cont="${key}">)[^<]*(<\\/button>)`), `$1${continentIcons[key]} ${label}$2`);
  }
  out = out.replace(/(<button class="filter-btn active" id="location-toggle">)[^<]*(<\/button>)/, `$1${p.labels.myTimezone}$2`);
  out = out.replace(/(<button class="filter-btn active" data-reach="all">)[^<]*(<\/button>)/, `$1${p.labels.all}$2`);
  out = out.replace(/(<button class="filter-btn" data-reach="global"[^>]*>)[^<]*(<\/button>)/, `$1${p.labels.global}$2`);
  out = out.replace(/(<button class="filter-btn" data-reach="continent"[^>]*>)[^<]*(<\/button>)/, `$1${p.labels.continent}$2`);
  out = out.replace(/(<button class="filter-btn" data-reach="timezone"[^>]*>)[^<]*(<\/button>)/, `$1${p.labels.timezoneLevel}$2`);
  out = out.replace(/All topics|Все темы/g, p.labels.allTopics);
  out = out.replace(/All countries|Все страны/g, p.labels.allCountries);
  out = out.replace(/All rights reserved\.|Все права защищены\./g, p.labels.updated ? 'OneSliders' : 'OneSliders');

  out = out.replace(/content: '● [^']*'/g, (match) => {
    if (match.includes('Global') || match.includes('Мир')) return `content: '● ${p.labels.global}'`;
    if (match.includes('Continent') || match.includes('Континент')) return `content: '● ${p.labels.continent}'`;
    return `content: '● ${p.labels.country}'`;
  });

  out = out.replace(/<span class="cat-pill">([^<]+)<\/span>/g, (_, label) => {
    const icon = label.match(/^[^\p{L}\p{N}]+/u)?.[0] || '';
    const clean = label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    const key = Object.keys(profiles.en.categories).find((k) => profiles.en.categories[k] === clean) || Object.keys(p.categories).find((k) => p.categories[k] === clean);
    return `<span class="cat-pill">${icon}${p.categories[key] || clean}</span>`;
  });

  out = out.replace(/<span class="month-title">([^<]+)<\/span>/g, (_, label) => {
    let translated = label;
    for (const [en, value] of Object.entries(p.months)) {
      translated = translated.replace(new RegExp(`\\b${en}\\b`, 'g'), value);
    }
    return `<span class="month-title">${translated}</span>`;
  });

  out = out.replace(/<span class="card-meta">([^<]*)<\/span>/g, (_, meta) => `<span class="card-meta">${translateDateText(meta, p)}</span>`);
  out = out.replace(/<strong class="card-title">([^<]+)<\/strong>/g, (_, title) => {
    const translated = translateEventTitle(title, lang);
    return `<strong class="card-title">${translated}</strong>`;
  });

  out = out.replace(/row\.innerHTML = '<span class="filter-label">[^<]*<\/span>';/g, (match) => {
    if (match.includes(p.labels.country) || match.includes('Country') || match.includes('Страна')) return `row.innerHTML = '<span class="filter-label">${p.labels.country}</span>';`;
    return `row.innerHTML = '<span class="filter-label">${p.labels.topic}</span>';`;
  });

  return out;
}

for (const lang of languages) {
  const file = `${lang}/content/events/index.html`;
  if (!fs.existsSync(file)) continue;
  fs.writeFileSync(file, translateIndex(fs.readFileSync(file, 'utf8'), lang), 'utf8');
}

await import('./translate-ru-events-index-content.mjs');
