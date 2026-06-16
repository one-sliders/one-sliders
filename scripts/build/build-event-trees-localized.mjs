import fs from 'node:fs';
import path from 'node:path';
import { languages, profiles, codeLabel } from '../lib/event-language-profiles.mjs';
import { translateEventTitle } from '../lib/event-title-translations.mjs';

const sourceRoot = 'content/events';
const siteBase = 'https://one-sliders.com';
const detailLanguages = languages.filter((lang) => lang !== 'en' && lang !== 'ru');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function strip(html = '') {
  return html
    .replace(/<img[^>]*alt=""[^>]*>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&Oslash;/g, 'Ø')
    .replace(/\s+/g, ' ')
    .trim();
}

function replaceTerms(text, profile) {
  let out = text.replace(/&ndash;/g, '–').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&Oslash;/g, 'Ø');
  const dictionaries = [profile.countries || {}, profile.terms || {}, profile.categories || {}, profile.shortMonths || {}, profile.months || {}];
  for (const dictionary of dictionaries) {
    for (const [from, to] of Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length)) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      out = out.replace(new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`, 'g'), to);
    }
  }
  return out;
}

function normalizeRootHref(href = '') {
  return href
    .replace('../content/', '../content/')
    .replace('../../../../locations/', '../content/locations/')
    .replace('../../../../categories/', '../content/categories/');
}

function fact(html, label, profile) {
  const match = html.match(new RegExp(`<div class="(?:event-hero__fact|[^"]*hero-fact[^"]*)"><span>${label}<\\/span>([\\s\\S]*?)<\\/div>`));
  const fragment = match?.[1] || '';
  return {
    text: replaceTerms(strip(fragment), profile),
    href: normalizeRootHref(fragment.match(/href="([^"]+)"/)?.[1] || ''),
    img: normalizeRootHref(fragment.match(/<img[^>]+src="([^"]+)"/)?.[1] || '')
  };
}

function sourceTitle(html, relativePath) {
  return strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '')
    || path.basename(relativePath, '.html').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function category(html, profile) {
  const match = html.match(/<a class="nav-pill" href="([^"]+)">([\s\S]*?)<\/a>/);
  if (!match) return { href: '../content/categories/index.html', label: profile.categories.events };
  const found = {
    href: normalizeRootHref(match[1]),
    label: replaceTerms(strip(match[2]), profile)
  };
  if (fs.existsSync(path.resolve('content/events/2026/05', found.href))) return found;
  const lower = found.label.toLowerCase();
  if (lower.includes((profile.categories.sport || '').toLowerCase()) || lower.includes((profile.categories.golf || '').toLowerCase()) || lower.includes((profile.categories.football || '').toLowerCase()) || lower.includes((profile.categories.tennis || '').toLowerCase())) {
    return { href: '../content/categories/sport/index.html', label: found.label };
  }
  if (lower.includes((profile.categories.music || '').toLowerCase()) || lower.includes((profile.categories.songContests || '').toLowerCase())) {
    return { href: '../content/categories/music/index.html', label: found.label };
  }
  if (lower.includes((profile.categories.nature || '').toLowerCase())) {
    return { href: '../content/categories/climate/protected-nature.html', label: found.label };
  }
  if (lower.includes((profile.categories.festival || '').toLowerCase()) || lower.includes((profile.categories.culture || '').toLowerCase()) || lower.includes((profile.categories.film || '').toLowerCase())) {
    return { href: '../content/categories/culture/index.html', label: found.label };
  }
  return { href: '../content/categories/index.html', label: found.label };
}

function heroImage(html, relativePath) {
  const direct = html.match(/<img class="event-hero__image"[^>]+src="([^"]+)"/)?.[1];
  if (direct) return direct;
  const bg = html.match(/url\(["']?(img\/[^"')]+)["']?\)/)?.[1];
  if (bg) return `../content/events/${path.posix.dirname(relativePath)}/${bg}`;
  const slug = path.posix.basename(relativePath, '.html');
  const dir = path.posix.join('content/events', path.posix.dirname(relativePath), 'img');
  for (const ext of ['png', 'svg', 'jpg', 'jpeg', 'webp']) {
    const candidate = path.posix.join(dir, `${slug}-hero.${ext}`);
    if (fs.existsSync(candidate)) return `../../../../../${candidate}`;
  }
  return '../../../../../assets/icons/one-sliders-icon.svg';
}

function flagImage(html) {
  return normalizeRootHref(
    html.match(/<img class="event-flag"[^>]+src="([^"]+)"/)?.[1]
    || html.match(/<img class="flag-img"[^>]+src="([^"]+)"/)?.[1]
    || ''
  );
}

function themeAttrs(html) {
  return html.match(/<body([^>]*)>/)?.[1] || ' class="event-page" style="--event-theme:#214e68;--event-theme-2:#1f7888;--event-accent:#8ab7c4"';
}

function buildPage(sourceHtml, relativePath, lang) {
  const profile = profiles[lang];
  const rawTitle = sourceTitle(sourceHtml, relativePath);
  const title = translateEventTitle(replaceTerms(rawTitle, profile), lang);
  const cat = category(sourceHtml, profile);
  const country = fact(sourceHtml, 'Country', profile);
  const city = fact(sourceHtml, 'City', profile);
  const venue = fact(sourceHtml, 'Venue', profile);
  const dates = fact(sourceHtml, 'Dates', profile);
  const year = relativePath.split('/')[0];
  const canonical = `${siteBase}/${lang}/content/events/${relativePath}`;
  const enUrl = `${siteBase}/content/events/${relativePath}`;
  const image = heroImage(sourceHtml, relativePath);
  const flag = flagImage(sourceHtml);
  const datesText = dates.text || profile.labels.upcoming;
  const locationText = [country.text, city.text, venue.text].filter(Boolean).join(', ') || profile.labels.place;
  const description = profile.sentences.description(title);
  const sourceImage = image.startsWith('../../../../../') ? `${siteBase}/${image.replace('../../../../../', '')}` : `${siteBase}/assets/icons/one-sliders-icon.svg`;
  const targetRoot = `${lang}/content/events`;
  const ics = relativePath.replace(/\.html$/, '.ics');
  const hasIcs = fs.existsSync(path.join(targetRoot, ics));
  const languageLinks = languages.filter((code) => fs.existsSync(path.join(code, 'content/events', relativePath)) || code === lang).map((code) => {
    const href = code === lang ? path.basename(relativePath) : `../../../../../${code}/content/events/${relativePath}`;
    return `<a${code === lang ? ' aria-current="true"' : ''} href="${href}">${codeLabel(code)}</a>`;
  }).join('\n      ');

  const countryValue = country.href
    ? `<a href="${country.href}">${country.img ? `<img src="${country.img}" alt="" width="28" height="19">` : ''}${esc(country.text)}</a>`
    : `<strong>${esc(country.text || profile.labels.country)}</strong>`;
  const cityValue = city.href ? `<a href="${city.href}">${esc(city.text)}</a>` : `<strong>${esc(city.text || profile.labels.city)}</strong>`;

  const cards = [
    country.text && { label: profile.labels.country, title: country.text, href: country.href, img: country.img, icon: codeLabel(lang).slice(0, 1) },
    city.text && { label: profile.labels.city, title: city.text, href: city.href, icon: codeLabel(lang).slice(0, 1) },
    cat.label && { label: profile.labels.category, title: cat.label, href: cat.href, icon: codeLabel(lang).slice(0, 1) }
  ].filter(Boolean).map((card) => {
    const media = card.img ? `<img class="event-link-card__flag" src="${card.img}" alt="" width="46" height="31">` : `<span class="event-link-card__icon">${esc(card.icon)}</span>`;
    const tag = card.href ? 'a' : 'div';
    return `<${tag} class="event-link-card event-link-card--media"${card.href ? ` href="${card.href}"` : ''}>${media}<span>${esc(card.label)}</span><strong>${esc(card.title)}</strong></${tag}>`;
  }).join('\n            ');

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../../assets/css/event-detail.css">
  <link rel="preload" as="image" href="${image}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="${lang}" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta name="theme-color" content="#214e68">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)} | OneSliders">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${sourceImage}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)} | OneSliders">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${sourceImage}">
  <title>${esc(title)} | OneSliders</title>
</head>
<body${themeAttrs(sourceHtml)}>
  <nav class="top-menu" aria-label="${esc(profile.labels.category)}">
    <a class="nav-icon" href="../../index.html" title="${esc(profile.labels.category)}" aria-label="${esc(profile.labels.category)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="../content/locations/index.html" title="${esc(profile.labels.global)}" aria-label="${esc(profile.labels.global)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../content/categories/index.html" title="${esc(profile.labels.category)}" aria-label="${esc(profile.labels.category)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-pill" href="${cat.href}">${esc(cat.label)}</a>
    <div class="event-language-list" aria-label="${esc(profile.labels.language)}">
      <span>${esc(profile.labels.language)}</span>
      ${languageLinks}
    </div>
  </nav>
  <main class="event-shell">
    <section class="event-hero" aria-labelledby="event-title">
      <img class="event-hero__image" src="${image}" alt="${esc(title)}" width="1200" height="760" fetchpriority="high">
      <div class="event-hero__inner">
        <div>
          <div class="event-badge-row">${flag ? `<img class="event-flag" src="${flag}" alt="" width="54" height="36">` : ''}<p class="event-kicker">${esc(cat.label)} · ${year}</p></div>
          <h1 class="event-title" id="event-title">${esc(title)}</h1>
          <p class="event-intro">${esc(description)}</p>
        </div>
        <div class="event-hero__facts" aria-label="${esc(profile.labels.quickFacts)}">
          <div class="event-hero__fact"><span>${esc(profile.labels.country)}</span>${countryValue}</div>
          <div class="event-hero__fact"><span>${esc(profile.labels.city)}</span>${cityValue}</div>
          <div class="event-hero__fact"><span>${esc(profile.labels.venue)}</span><strong>${esc(venue.text || profile.labels.venue)}</strong></div>
          <div class="event-hero__fact"><span>${esc(profile.labels.dates)}</span><strong>${esc(datesText)}</strong></div>
        </div>
      </div>
    </section>
    ${hasIcs ? `<nav class="event-actions" aria-label="${esc(profile.labels.addCalendar)}"><a class="event-button event-button--primary" href="${path.basename(ics)}">${esc(profile.labels.addCalendar)}</a></nav>` : ''}
    <div class="event-layout">
      <div class="event-main">
        <section class="event-section">
          <h2 class="event-section__title">${esc(profile.labels.whatToKnow)}</h2>
          <ul class="event-list">
            <li>${esc(profile.sentences.know1(title, cat.label))}</li>
            <li>${esc(profile.sentences.know2(datesText))}</li>
            <li>${esc(profile.sentences.know3(locationText))}</li>
            <li>${esc(profile.sentences.know4)}</li>
          </ul>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">${esc(profile.labels.structure)}</h2>
          <table class="event-table">
            <thead><tr><th>${esc(profile.labels.stage)}</th><th>${esc(profile.labels.focus)}</th><th>${esc(profile.labels.why)}</th></tr></thead>
            <tbody>
              <tr><th>${esc(profile.labels.before)}</th><td>${esc(profile.labels.planning)}</td><td>${esc(profile.sentences.before)}</td></tr>
              <tr><th>${esc(profile.labels.during)}</th><td>${esc(profile.labels.programme)}</td><td>${esc(profile.sentences.during)}</td></tr>
              <tr><th>${esc(profile.labels.after)}</th><td>${esc(profile.labels.results)}</td><td>${esc(profile.sentences.after)}</td></tr>
            </tbody>
          </table>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">${esc(profile.labels.visitorFocus)}</h2>
          <div class="event-rank-bars">
            <div class="event-rank-bar"><span class="event-rank-bar__rank">1</span><span class="event-rank-bar__country">${esc(profile.labels.dates)}</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:92%"></span></span><span class="event-rank-bar__value">${esc(profile.labels.important)}</span></div>
            <div class="event-rank-bar"><span class="event-rank-bar__rank">2</span><span class="event-rank-bar__country">${esc(profile.labels.place)}</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:82%"></span></span><span class="event-rank-bar__value">${esc(profile.labels.important)}</span></div>
            <div class="event-rank-bar"><span class="event-rank-bar__rank">3</span><span class="event-rank-bar__country">${esc(profile.labels.programme)}</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:68%"></span></span><span class="event-rank-bar__value">${esc(profile.labels.useful)}</span></div>
          </div>
        </section>
      </div>
      <aside class="event-side">
        <section class="event-section">
          <h2 class="event-section__title">${esc(profile.labels.quickFacts)}</h2>
          <div class="event-fact-grid">
            <div class="event-fact"><span>${esc(profile.labels.status)}</span><strong>${esc(profile.labels.upcoming)}</strong></div>
            <div class="event-fact"><span>${esc(profile.labels.category)}</span><strong>${esc(cat.label)}</strong></div>
            <div class="event-fact"><span>${esc(profile.labels.dates)}</span><strong>${esc(datesText)}</strong></div>
            <div class="event-fact"><span>${esc(profile.labels.updates)}</span><strong>${esc(profile.sentences.updates)}</strong></div>
          </div>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">${esc(profile.labels.related)}</h2>
          <div class="event-link-grid">
            ${cards}
          </div>
        </section>
      </aside>
    </div>
    <p class="event-source"><span>${esc(profile.labels.source)}: ${esc(profile.sentences.source)}</span><span>${esc(profile.labels.updated)} 14 May 2026</span></p>
  </main>
</body>
</html>
`;
}

let written = 0;
for (const lang of detailLanguages) {
  for (const sourceFile of walk(sourceRoot)) {
    if (!sourceFile.endsWith('.html')) continue;
    const relativePath = path.relative(sourceRoot, sourceFile).replace(/\\/g, '/');
    if (relativePath === 'index.html') continue;
    const targetFile = path.join(lang, 'content/events', relativePath);
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    fs.writeFileSync(targetFile, buildPage(fs.readFileSync(sourceFile, 'utf8'), relativePath, lang), 'utf8');
    written++;
  }
}

console.log(`Built ${written} localized event detail pages for ${detailLanguages.length} languages.`);
