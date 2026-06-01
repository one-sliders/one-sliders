import fs from 'node:fs';
import path from 'node:path';
import { languages, codeLabel } from './event-language-profiles.mjs';

const sourceRoot = 'content/events';
const targetRoot = 'ru/content/events';
const siteBase = 'https://one-sliders.com';
const lang = 'ru';

const titleMap = {
  'ICC T20 World Cup 2026': 'Чемпионат мира ICC T20 2026',
  'Super Bowl LX': 'Супербоул LX',
  'Masters Tournament': 'Турнир Masters',
  'Canada Grand Prix 2026': 'Гран-при Канады 2026',
  'Cannes Film Festival 2026': 'Каннский кинофестиваль 2026',
  'Champions League Final 2026': 'Финал Лиги чемпионов 2026',
  'Eurovision Grand Final 2026': 'Финал Евровидения 2026',
  'Eurovision Semi-Final 1 2026': 'Первый полуфинал Евровидения 2026',
  'Eurovision Semi-Final 2 2026': 'Второй полуфинал Евровидения 2026',
  'Eurovision Song Contest 2026': 'Евровидение 2026',
  'Fes Festival of World Sacred Music 2026': 'Фесский фестиваль духовной музыки мира 2026',
  'Hajj 2026': 'Хадж 2026',
  'Indianapolis 500 2026': 'Индианаполис 500 2026',
  'IPL Final 2026': 'Финал IPL 2026',
  'Norway Constitution Day in Oslo 2026': 'День Конституции Норвегии в Осло 2026',
  'PGA Championship Follow-up 2026': 'Итоги чемпионата PGA 2026',
  'PGA Championship 2026': 'Чемпионат PGA 2026',
  'Roland-Garros 2026': 'Ролан Гаррос 2026',
  'State of Origin 2026': 'Серия State of Origin 2026',
  'Vivid Sydney 2026': 'Фестиваль Vivid Sydney 2026',
  'Bali Arts Festival': 'Фестиваль искусств Бали',
  'Festa Junina': 'Феста Жунина',
  'Football World Cup 2026': 'Чемпионат мира по футболу 2026',
  'Inti Raymi': 'Инти Райми',
  'Le Mans 24 Hours 2026': '24 часа Ле-Мана 2026',
  'Monaco Grand Prix': 'Гран-при Монако',
  'NBA Finals 2026': 'Финал NBA 2026',
  'KLPGA Oslo Ladies Open': 'Женский открытый турнир KLPGA в Осло',
  'Queenstown Winter Festival': 'Зимний фестиваль Куинстауна',
  'Stanley Cup Final 2026': 'Финал Кубка Стэнли 2026',
  'U.S. Open Golf': 'Открытый чемпионат США по гольфу',
  'Wimbledon': 'Уимблдон',
  'British Grand Prix': 'Гран-при Великобритании',
  'Calgary Stampede': 'Калгарийский стампид',
  'Comic-Con International 2026': 'Международный Comic-Con 2026',
  'Commonwealth Games': 'Игры Содружества',
  'Durban July': 'Скачки Durban July',
  'Great Migration': 'Великая миграция',
  'The Open Championship': 'Открытый чемпионат по гольфу',
  'Tomorrowland 2026': 'Tomorrowland 2026',
  'Tour de France': 'Тур де Франс',
  'Bledisloe Cup': 'Кубок Бледислоу',
  'Buenos Aires Tango Festival': 'Фестиваль танго в Буэнос-Айресе',
  'Burning Man': 'Бернинг Мэн',
  'Gamescom 2026': 'Gamescom 2026',
  'Medellin Flower Festival': 'Фестиваль цветов в Медельине',
  '&Oslash;ya Festival': 'Фестиваль Øya',
  'Sydney Marathon': 'Сиднейский марафон',
  'US Open Tennis': 'Открытый чемпионат США по теннису',
  'AFL Grand Final': 'Гранд-финал AFL',
  'Asian Games 2026': 'Азиатские игры 2026',
  'Berlin Marathon 2026': 'Берлинский марафон 2026',
  'Brazil Independence Day': 'День независимости Бразилии',
  'Chile Independence Day and Fiestas Patrias': 'День независимости Чили и Fiestas Patrias',
  'Hermanus Whale Festival': 'Фестиваль китов в Херманусе',
  'Kwita Izina': 'Квита Изина',
  'Lake of Stars Festival': 'Фестиваль «Озеро звезд»',
  'MotoGP Japan': 'MotoGP Японии',
  'Oktoberfest': 'Октоберфест',
  'Octoberfest 2026': 'Октоберфест 2026',
  'Octoberfest': 'Октоберфест',
  'Venice Film Festival': 'Венецианский кинофестиваль',
  'Cape Town Marathon': 'Кейптаунский марафон',
  'Day of the Dead': 'День мертвых',
  'Diwali 2026': 'Дивали 2026',
  'Fiji Day': 'День Фиджи',
  'Mexico City Grand Prix': 'Гран-при Мехико',
  'NRL Grand Final': 'Гранд-финал NRL',
  'Oktoberfest Blumenau': 'Октоберфест Блуменау',
  'Singapore Grand Prix': 'Гран-при Сингапура',
  'United States Grand Prix': 'Гран-при США',
  'World Series 2026': 'Мировая серия 2026',
  'Cairo International Film Festival': 'Каирский международный кинофестиваль',
  'Copa Libertadores Final': 'Финал Кубка Либертадорес',
  'Las Vegas Grand Prix': 'Гран-при Лас-Вегаса',
  'Marrakech International Film Festival': 'Марракешский международный кинофестиваль',
  'Melbourne Cup': 'Кубок Мельбурна',
  'New York City Marathon': 'Нью-Йоркский марафон',
  'Qatar Grand Prix': 'Гран-при Катара',
  'Sao Paulo Grand Prix': 'Гран-при Сан-Паулу',
  'Seoul Lantern Festival': 'Фестиваль фонарей в Сеуле',
  'Yi Peng and Loy Krathong': 'Йи Пенг и Лой Кратхонг',
  'Abu Dhabi Grand Prix': 'Гран-при Абу-Даби',
  'Calabar Carnival': 'Карнавал Калабар',
  'Jul i Vinterland': 'Рождество в Vinterland',
  'New Years Eve Copacabana': 'Новый год на Копакабане',
  'Sydney New Years Eve': 'Новый год в Сиднее',
  'AFC Asian Cup 2027': 'Кубок Азии AFC 2027',
  'Australian Open 2027': 'Открытый чемпионат Австралии 2027',
  'CES 2027': 'CES 2027',
  'Grammy Awards 2027': 'Премия «Грэмми» 2027',
  'Six Nations Championship 2027': 'Кубок шести наций 2027',
  'Dubai World Cup 2027': 'Кубок мира Дубая 2027',
  'Academy Awards / Oscars 2027': 'Премия «Оскар» 2027',
  'Ultra Music Festival 2027': 'Музыкальный фестиваль Ultra 2027',
  'Boston Marathon 2027': 'Бостонский марафон 2027',
  'Coachella 2027': 'Коачелла 2027',
  'London Marathon 2027': 'Лондонский марафон 2027',
  'Met Gala 2027': 'Бал Met Gala 2027',
  'Africa Cup of Nations 2027': 'Кубок африканских наций 2027',
  'FIFA Women’s World Cup 2027': 'Чемпионат мира FIFA среди женщин 2027',
  'Glastonbury Festival 2027': 'Фестиваль Гластонбери 2027',
  'Ryder Cup 2027': 'Кубок Райдера 2027',
  'Cricket World Cup 2027': 'Чемпионат мира по крикету 2027',
  'Rugby World Cup 2027': 'Чемпионат мира по регби 2027',
  'Copa America 2028': 'Кубок Америки 2028',
  'UEFA European Championship 2028': 'Чемпионат Европы UEFA 2028',
  'Summer Olympics 2028': 'Летние Олимпийские игры 2028',
  'Winter Olympics 2030': 'Зимние Олимпийские игры 2030'
};

const termMap = {
  'Formula 1': 'Формула-1',
  'Film festival': 'Кинофестиваль',
  'Film': 'Кино',
  'Football': 'Футбол',
  'Golf': 'Гольф',
  'Tennis': 'Теннис',
  'Rugby': 'Регби',
  'Marathon': 'Марафон',
  'Cricket': 'Крикет',
  'Motor sport': 'Автоспорт',
  'Motorsport': 'Автоспорт',
  'Music': 'Музыка',
  'Music Festivals': 'Музыкальные фестивали',
  'Music festivals': 'Музыкальные фестивали',
  'Song contests': 'Песенные конкурсы',
  'Culture': 'Культура',
  'Sports': 'Спорт',
  'Sport': 'Спорт',
  'Festival': 'Фестиваль',
  'Nature': 'Природа',
  'Awards': 'Премии',
  'Fashion': 'Мода',
  'Basketball': 'Баскетбол',
  'Ice Hockey': 'Хоккей',
  'Baseball': 'Бейсбол',
  'Horse Racing': 'Скачки',
  'American Football': 'Американский футбол',
  'Olympics': 'Олимпийские игры',
  'World music': 'Мировая музыка',
  'festival': 'Фестиваль',
  'nature': 'Природа',
  'Cycling': 'Велоспорт',
  'Pop Culture': 'Поп-культура'
};

const placeMap = {
  'Circuit Gilles Villeneuve': 'Автодром имени Жиля Вильнёва',
  'Palais des Festivals': 'Дворец фестивалей',
  'Wiener Stadthalle': 'Винер Штадтхалле',
  'Stade Roland-Garros': 'Стадион Ролан Гаррос',
  'Indianapolis Motor Speedway': 'Автодром Индианаполис Мотор Спидвей',
  'Автодром Индианаполис Motor Speedway': 'Автодром Indianapolis Motor Speedway',
  'Автодром Indianapolis Motor Speedway': 'Автодром Индианаполис Мотор Спидвей',
  'Narendra Modi Stadium': 'Стадион Нарендры Моди',
  'Puskas Arena': 'Арена Пушкаш',
  'Aronimink Golf Club': 'Гольф-клуб Aronimink',
  'Accor Stadium': 'Стадион Accor',
  'Suncorp Stadium': 'Стадион Suncorp',
  'MCG': 'MCG',
  'Shinnecock Hills': 'Shinnecock Hills',
  'Fes festival venues': 'Площадки фестиваля в Фесе',
  'Фес Фестиваль venues': 'Площадки фестиваля в Фесе',
  'Holy sites in and around Mecca': 'святые места в Мекке и рядом с ней',
  'Сидней Harbour and city venues': 'гавань Сиднея и городские площадки',
  'Sydney Harbour and city venues': 'гавань Сиднея и городские площадки',
  'Сидней Harbour and city venues': 'гавань Сиднея и городские площадки',
  'Oslo city centre': 'центр Осло',
  'Montreal': 'Монреаль',
  'Cannes': 'Канны',
  'Vienna': 'Вена',
  'Fes': 'Фес',
  'Mecca': 'Мекка',
  'Ahmedabad': 'Ахмадабад',
  'Indianapolis': 'Индианаполис',
  'Budapest': 'Будапешт',
  'Newtown Square': 'Ньютаун-сквер',
  'Paris': 'Париж',
  'Melbourne': 'Мельбурн',
  'Brisbane': 'Брисбен',
  'Sydney': 'Сидней',
  'USA / Canada, TBC': 'США / Канада, уточняется',
  'United Kingdom and Ireland': 'Великобритания и Ирландия',
  'England, France, Ireland, Italy, Scotland and Wales': 'Англия, Франция, Ирландия, Италия, Шотландия и Уэльс',
  'Kenya, Tanzania and Uganda': 'Кения, Танзания и Уганда',
  'South Africa, Zimbabwe and Namibia': 'ЮАР, Зимбабве и Намибия',
  'India and Sri Lanka': 'Индия и Шри-Ланка',
  'South America / Americas, TBC': 'Южная Америка / Америка, уточняется',
  'Los Angeles, USA': 'Лос-Анджелес, США',
  'Las Vegas, USA': 'Лас-Вегас, США',
  'San Diego, USA': 'Сан-Диего, США',
  'New York, USA': 'Нью-Йорк, США',
  'Santa Clara, USA': 'Санта-Клара, США',
  'Indianapolis, USA': 'Индианаполис, США',
  'Southampton, USA': 'Саутгемптон, США',
  'Melbourne, Australia': 'Мельбурн, Австралия',
  'Somerset, UK': 'Сомерсет, Великобритания',
  'Boston, USA': 'Бостон, США',
  'London, UK': 'Лондон, Великобритания',
  'Berlin, Germany': 'Берлин, Германия',
  'Cologne, Germany': 'Кельн, Германия',
  'Cannes, France': 'Канны, Франция',
  'Paris, France': 'Париж, Франция',
  'Le Mans, France': 'Ле-Ман, Франция',
  'Dubai, UAE': 'Дубай, ОАЭ',
  'Miami, USA': 'Майами, США',
  'Adare, Ireland': 'Адар, Ирландия',
  'Indio, USA': 'Индио, США',
  'Boom, Belgium': 'Бом, Бельгия',
  'Saudi Arabia': 'Саудовская Аравия',
  'Hungary': 'Венгрия',
  'South Africa': 'ЮАР',
  'New Zealand': 'Новая Зеландия',
  'United Kingdom': 'Великобритания',
  'Australia': 'Австралия',
  'Austria': 'Австрия',
  'Brazil': 'Бразилия',
  'Canada': 'Канада',
  'France': 'Франция',
  'Germany': 'Германия',
  'Ireland': 'Ирландия',
  'India': 'Индия',
  'Italy': 'Италия',
  'Monaco': 'Монако',
  'Morocco': 'Марокко',
  'Norway': 'Норвегия',
  'Switzerland': 'Швейцария',
  'Sweden': 'Швеция',
  'Ukraine': 'Украина',
  'Luxembourg': 'Люксембург',
  'USA': 'США',
  'UK': 'Великобритания',
  'UAE': 'ОАЭ',
  'TBC': 'уточняется'
};

const monthMap = {
  Jan: 'янв.',
  Feb: 'фев.',
  Mar: 'мар.',
  Apr: 'апр.',
  May: 'мая',
  Jun: 'июн.',
  Jul: 'июл.',
  Aug: 'авг.',
  Sep: 'сен.',
  Oct: 'окт.',
  Nov: 'ноя.',
  Dec: 'дек.',
  January: 'января',
  February: 'февраля',
  March: 'марта',
  April: 'апреля',
  June: 'июня',
  July: 'июля',
  August: 'августа',
  September: 'сентября',
  October: 'октября',
  November: 'ноября',
  December: 'декабря'
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
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

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function translateTerms(text = '') {
  let out = text.replace(/&ndash;/g, '–').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&Oslash;/g, 'Ø');
  const maps = [titleMap, placeMap, termMap, monthMap];
  for (const map of maps) {
    for (const [from, to] of Object.entries(map).sort((a, b) => b[0].length - a[0].length)) {
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

function slugTitle(relativePath) {
  const slug = path.basename(relativePath, '.html');
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function extractFact(html, label) {
  const re = new RegExp(`<div class="(?:event-hero__fact|[^"]*hero-fact[^"]*)"><span>${label}<\\/span>([\\s\\S]*?)<\\/div>`);
  const match = html.match(re);
  if (!match) return { text: '', href: '', img: '' };
  const fragment = match[1];
  return {
    text: translateTerms(strip(fragment)),
    href: normalizeRootHref(fragment.match(/href="([^"]+)"/)?.[1] || ''),
    img: normalizeRootHref(fragment.match(/<img[^>]+src="([^"]+)"/)?.[1] || '')
  };
}

function extractTitle(html, relativePath) {
  const raw = strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '') || slugTitle(relativePath);
  return titleMap[raw] || translateTerms(raw);
}

function extractTheme(html) {
  return html.match(/<body([^>]*)>/)?.[1] || ' class="event-page" style="--event-theme:#214e68;--event-theme-2:#1f7888;--event-accent:#8ab7c4"';
}

function extractHeroImage(html) {
  return html.match(/<img class="event-hero__image"[^>]+src="([^"]+)"/)?.[1] || '';
}

function extractFlag(html) {
  return normalizeRootHref(
    html.match(/<img class="event-flag"[^>]+src="([^"]+)"/)?.[1]
      || html.match(/<img class="flag-img"[^>]+src="([^"]+)"/)?.[1]
      || ''
  );
}

function extractCategory(html) {
  const match = html.match(/<a class="nav-pill" href="([^"]+)">([\s\S]*?)<\/a>/);
  if (!match) return { href: '../content/categories/index.html', label: 'События' };
  return {
    href: normalizeRootHref(match[1]),
    label: translateTerms(strip(match[2]))
  };
}

function findHeroImage(html, relativePath) {
  const direct = extractHeroImage(html);
  if (direct) return direct;

  const background = html.match(/url\(["']?(img\/[^"')]+)["']?\)/)?.[1];
  if (background) {
    const imagePath = path.posix.join('content/events', path.posix.dirname(relativePath), background).replace(/\\/g, '/');
    return `../../../../../${imagePath}`;
  }

  const slug = path.posix.basename(relativePath, '.html');
  const imageDir = path.posix.join('content/events', path.posix.dirname(relativePath), 'img');
  for (const ext of ['png', 'svg', 'jpg', 'jpeg', 'webp']) {
    const candidate = path.posix.join(imageDir, `${slug}-hero.${ext}`);
    if (fs.existsSync(candidate)) return `../../../../../${candidate}`;
  }

  const monthDir = path.posix.join('content/events', path.posix.dirname(relativePath), 'img');
  if (fs.existsSync(monthDir)) {
    const loose = fs.readdirSync(monthDir).find((name) => name.startsWith(slug) && /\.(png|svg|jpg|jpeg|webp)$/i.test(name));
    if (loose) return `../../../../../${path.posix.join(monthDir, loose)}`;
  }

  return '../../../../../assets/icons/one-sliders-icon.svg';
}

function normalizeCategory(category) {
  if (category.href && fs.existsSync(path.resolve(path.dirname(path.join(targetRoot, '2026/05/example.html')), category.href))) {
    return category;
  }
  const label = category.label || 'События';
  const lower = label.toLowerCase();
  if (lower.includes('спорт') || lower.includes('гольф') || lower.includes('формула') || lower.includes('футбол') || lower.includes('теннис')) {
    return { href: '../content/categories/sport/index.html', label };
  }
  if (lower.includes('музык') || lower.includes('песен')) {
    return { href: '../content/categories/music/index.html', label };
  }
  if (lower.includes('кино') || lower.includes('культур') || lower.includes('фестиваль') || lower.includes('прем')) {
    return { href: '../content/categories/culture/index.html', label };
  }
  return { href: '../content/categories/index.html', label };
}

function yearFromPath(relativePath) {
  return relativePath.split('/')[0] || '';
}

function buildPage(sourceHtml, relativePath) {
  const ruTitle = extractTitle(sourceHtml, relativePath);
  const year = yearFromPath(relativePath);
  const theme = extractTheme(sourceHtml).replace(/lang="en"/g, '');
  const heroImage = findHeroImage(sourceHtml, relativePath);
  const flag = extractFlag(sourceHtml);
  const category = normalizeCategory(extractCategory(sourceHtml));
  const country = extractFact(sourceHtml, 'Country');
  const city = extractFact(sourceHtml, 'City');
  const venue = extractFact(sourceHtml, 'Venue');
  const dates = extractFact(sourceHtml, 'Dates');
  const locationText = [country.text, city.text, venue.text].filter(Boolean).join(', ') || 'место будет уточнено';
  const datesText = dates.text || 'даты будут уточнены';
  const description = `${ruTitle}: даты, место, контекст и полезные ссылки на OneSliders.`;
  const canonical = `${siteBase}/ru/content/events/${relativePath}`;
  const enUrl = `${siteBase}/content/events/${relativePath}`;
  const ogImage = heroImage.startsWith('../content/')
    ? `${siteBase}/${heroImage.replace('../../../../../', '')}`
    : `${siteBase}/content/events/${relativePath.replace(/\.html$/, '')}`;
  const ics = relativePath.replace(/\.html$/, '.ics');
  const hasIcs = fs.existsSync(path.join(targetRoot, ics));

  const countryValue = country.href
    ? `<a href="${country.href}">${country.img ? `<img src="${country.img}" alt="" width="28" height="19">` : ''}${esc(country.text)}</a>`
    : `<strong>${esc(country.text || 'уточняется')}</strong>`;
  const cityValue = city.href ? `<a href="${city.href}">${esc(city.text)}</a>` : `<strong>${esc(city.text || 'уточняется')}</strong>`;

  const languageLinks = languages
    .filter((code) => fs.existsSync(path.join(code, 'content/events', relativePath)) || code === lang)
    .map((code) => {
      const href = code === lang ? path.basename(relativePath) : `../../../../../${code}/content/events/${relativePath}`;
      return `<a${code === lang ? ' aria-current="true"' : ''} href="${href}">${codeLabel(code)}</a>`;
    })
    .join('\n      ');

  const linkedCards = [
    country.text && { label: 'Страна', title: country.text, href: country.href, img: country.img, icon: 'Ф' },
    city.text && { label: 'Город', title: city.text, href: city.href, icon: 'Г' },
    category.label && { label: 'Категория', title: category.label, href: category.href, icon: 'К' }
  ].filter(Boolean);

  const linkCards = linkedCards.map((card) => {
    const media = card.img
      ? `<img class="event-link-card__flag" src="${card.img}" alt="" width="46" height="31">`
      : `<span class="event-link-card__icon">${esc(card.icon)}</span>`;
    const tag = card.href ? 'a' : 'div';
    const href = card.href ? ` href="${card.href}"` : '';
    return `<${tag} class="event-link-card event-link-card--media"${href}>${media}<span>${esc(card.label)}</span><strong>${esc(card.title)}</strong></${tag}>`;
  }).join('\n            ');

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../../assets/css/event-detail.css">
  <link rel="preload" as="image" href="${heroImage}">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="ru" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta name="theme-color" content="#214e68">
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(ruTitle)} | OneSliders">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ruTitle)} | OneSliders">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <title>${esc(ruTitle)} | OneSliders</title>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ruTitle,
    url: canonical,
    image: ogImage,
    description,
    inLanguage: 'ru',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venue.text || city.text || country.text || ruTitle,
      address: {
        '@type': 'PostalAddress',
        addressLocality: city.text || undefined,
        addressCountry: country.text || undefined
      }
    }
  }, null, 2)}</script>
</head>
<body${theme}>
  <nav class="top-menu" aria-label="Навигация события">
    <a class="nav-icon" href="../../index.html" title="События" aria-label="События"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
    <a class="nav-icon" href="../content/locations/index.html" title="Мир" aria-label="Мир"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
    <a class="nav-icon" href="../content/categories/index.html" title="Категории" aria-label="Категории"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
    <span class="nav-divider"></span>
    <a class="nav-pill" href="${category.href}">${esc(category.label)}</a>
    <div class="event-language-list" aria-label="Доступные языки">
      <span>Язык</span>
      ${languageLinks}
    </div>
  </nav>
  <main class="event-shell">
    <section class="event-hero" aria-labelledby="event-title">
      <img class="event-hero__image" src="${heroImage}" alt="${esc(ruTitle)}" width="1200" height="760" fetchpriority="high">
      <div class="event-hero__inner">
        <div>
          <div class="event-badge-row">${flag ? `<img class="event-flag" src="${flag}" alt="" width="54" height="36">` : ''}<p class="event-kicker">${esc(category.label)} · ${esc(year)}</p></div>
          <h1 class="event-title" id="event-title">${esc(ruTitle)}</h1>
          <p class="event-intro">${esc(description)}</p>
        </div>
        <div class="event-hero__facts" aria-label="Ключевые факты">
          <div class="event-hero__fact"><span>Страна</span>${countryValue}</div>
          <div class="event-hero__fact"><span>Город</span>${cityValue}</div>
          <div class="event-hero__fact"><span>Место</span><strong>${esc(venue.text || 'уточняется')}</strong></div>
          <div class="event-hero__fact"><span>Даты</span><strong>${esc(datesText)}</strong></div>
        </div>
      </div>
    </section>
    ${hasIcs ? `<nav class="event-actions" aria-label="Календарь"><a class="event-button event-button--primary" href="${path.basename(ics)}">Добавить в календарь</a></nav>` : ''}
    <div class="event-layout">
      <div class="event-main">
        <section class="event-section">
          <h2 class="event-section__title">Что нужно знать</h2>
          <ul class="event-list">
            <li>${esc(ruTitle)} проходит в контексте темы «${category.label}».</li>
            <li>Основная информация для планирования: ${esc(datesText)}.</li>
            <li>Локация страницы: ${esc(locationText)}.</li>
            <li>OneSliders держит страницу компактной: даты, место, формат и полезные внутренние ссылки.</li>
          </ul>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">Структура события</h2>
          <table class="event-table">
            <thead><tr><th>Этап</th><th>Фокус</th><th>Зачем смотреть</th></tr></thead>
            <tbody>
              <tr><th>До</th><td>Планирование</td><td>Понять даты, место и формат события.</td></tr>
              <tr><th>Во время</th><td>Программа</td><td>Следить за главными моментами и обновлениями.</td></tr>
              <tr><th>После</th><td>Итоги</td><td>Добавить результаты, победителей или следующий шаг.</td></tr>
            </tbody>
          </table>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">Фокус для посетителя</h2>
          <div class="event-rank-bars">
            <div class="event-rank-bar"><span class="event-rank-bar__rank">1</span><span class="event-rank-bar__country">Даты</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:92%"></span></span><span class="event-rank-bar__value">важно</span></div>
            <div class="event-rank-bar"><span class="event-rank-bar__rank">2</span><span class="event-rank-bar__country">Место</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:82%"></span></span><span class="event-rank-bar__value">важно</span></div>
            <div class="event-rank-bar"><span class="event-rank-bar__rank">3</span><span class="event-rank-bar__country">Программа</span><span class="event-rank-bar__track"><span class="event-rank-bar__fill" style="--value:68%"></span></span><span class="event-rank-bar__value">полезно</span></div>
          </div>
        </section>
      </div>
      <aside class="event-side">
        <section class="event-section">
          <h2 class="event-section__title">Краткие факты</h2>
          <div class="event-fact-grid">
            <div class="event-fact"><span>Статус</span><strong>Предстоящее</strong></div>
            <div class="event-fact"><span>Категория</span><strong>${esc(category.label)}</strong></div>
            <div class="event-fact"><span>Дата</span><strong>${esc(datesText)}</strong></div>
            <div class="event-fact"><span>Обновления</span><strong>Добавлять по мере появления</strong></div>
          </div>
        </section>
        <section class="event-section">
          <h2 class="event-section__title">Связано на OneSliders</h2>
          <div class="event-link-grid">
            ${linkCards}
          </div>
        </section>
      </aside>
    </div>
    <p class="event-source"><span>Источник: OneSliders</span><span>Обновлено 14 мая 2026</span></p>
  </main>
</body>
</html>
`;
}

let written = 0;

for (const sourceFile of walk(sourceRoot)) {
  if (!sourceFile.endsWith('.html')) continue;
  const relativePath = path.relative(sourceRoot, sourceFile).replace(/\\/g, '/');
  if (relativePath === 'index.html') continue;

  const targetFile = path.join(targetRoot, relativePath);
  const html = fs.readFileSync(sourceFile, 'utf8');
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, buildPage(html, relativePath), 'utf8');
  written++;
}

console.log(`Built ${written} Russian event detail pages.`);
