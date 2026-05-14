import fs from 'node:fs';

const file = 'ru/content/events/index.html';
if (!fs.existsSync(file)) process.exit(0);

let html = fs.readFileSync(file, 'utf8');

const replaceAll = (from, to) => {
  html = html.split(from).join(to);
};

const eventTitles = new Map(Object.entries({
  '&Oslash;ya Festival': 'Фестиваль Øya',
  'AFC Asian Cup 2027': 'Кубок Азии AFC 2027',
  'AFL Grand Final': 'Гранд-финал AFL',
  'Abu Dhabi Grand Prix': 'Гран-при Абу-Даби',
  'Academy Awards / Oscars 2027': 'Премия «Оскар» 2027',
  'Africa Cup of Nations 2027': 'Кубок африканских наций 2027',
  'Asian Games 2026': 'Азиатские игры 2026',
  'Australian Open 2027': 'Открытый чемпионат Австралии 2027',
  'Bali Arts Festival': 'Фестиваль искусств Бали',
  'Berlin Marathon 2026': 'Берлинский марафон 2026',
  'Bledisloe Cup': 'Кубок Бледислоу',
  'Boston Marathon 2027': 'Бостонский марафон 2027',
  'Brazil Independence Day': 'День независимости Бразилии',
  'British Grand Prix': 'Гран-при Великобритании',
  'Buenos Aires Tango Festival': 'Фестиваль танго в Буэнос-Айресе',
  'Burning Man': 'Бернинг Мэн',
  'CES 2027': 'CES 2027',
  'Cairo International Film Festival': 'Каирский международный кинофестиваль',
  'Calabar Carnival': 'Карнавал Калабар',
  'Calgary Stampede': 'Калгарийский стампид',
  'Canadian Grand Prix': 'Гран-при Канады',
  'Cannes Film Festival': 'Каннский кинофестиваль',
  'Cape Town Marathon': 'Кейптаунский марафон',
  'Champions League Final': 'Финал Лиги чемпионов',
  'Chile Fiestas Patrias': 'Национальные праздники Чили',
  'Coachella 2027': 'Коачелла 2027',
  'Comic-Con International 2026': 'Международный Comic-Con 2026',
  'Commonwealth Games': 'Игры Содружества',
  'Copa America 2028': 'Кубок Америки 2028',
  'Copa Libertadores Final': 'Финал Кубка Либертадорес',
  'Cricket World Cup 2027': 'Чемпионат мира по крикету 2027',
  'Day of the Dead': 'День мертвых',
  'Diwali 2026': 'Дивали 2026',
  'Dubai World Cup 2027': 'Кубок мира Дубая 2027',
  'Durban July': 'Скачки Durban July',
  'Eurovision Song Contest': 'Евровидение',
  'FIFA Women’s World Cup 2027': 'Чемпионат мира FIFA среди женщин 2027',
  'FIFA World Cup 2026': 'Чемпионат мира FIFA 2026',
  'Fes Festival of World Sacred Music': 'Фесский фестиваль духовной музыки мира',
  'Festa Junina': 'Феста Жунина',
  'Fiji Day': 'День Фиджи',
  'French Open / Roland Garros 2026': 'Открытый чемпионат Франции / Ролан Гаррос 2026',
  'Gamescom 2026': 'Gamescom 2026',
  'Glastonbury Festival 2027': 'Фестиваль Гластонбери 2027',
  'Grammy Awards 2027': 'Премия «Грэмми» 2027',
  'Great Migration': 'Великая миграция',
  'Hajj 2026': 'Хадж 2026',
  'Hermanus Whale Festival': 'Фестиваль китов в Херманусе',
  'ICC T20 World Cup 2026': 'Чемпионат мира ICC T20 2026',
  'Indian Premier League Final 2026': 'Финал Индийской премьер-лиги 2026',
  'Indianapolis 500 2026': 'Индианаполис 500 2026',
  'Inti Raymi': 'Инти Райми',
  'Jul i Vinterland': 'Рождество в Vinterland',
  'KLPGA Oslo Ladies Open': 'Женский открытый турнир KLPGA в Осло',
  'Kwita Izina': 'Квита Изина',
  'Lake of Stars Festival': 'Фестиваль «Озеро звезд»',
  'Фестиваль Lake of Stars': 'Фестиваль «Озеро звезд»',
  'Las Vegas Grand Prix': 'Гран-при Лас-Вегаса',
  'Le Mans 24 Hours 2026': '24 часа Ле-Мана 2026',
  'London Marathon 2027': 'Лондонский марафон 2027',
  'Marrakech Film Festival': 'Марракешский кинофестиваль',
  'Masters Tournament': 'Турнир Masters',
  'Medellín Flower Festival': 'Фестиваль цветов в Медельине',
  'Melbourne Cup': 'Кубок Мельбурна',
  'Met Gala 2027': 'Бал Met Gala 2027',
  'Mexico City Grand Prix': 'Гран-при Мехико',
  'Monaco Grand Prix': 'Гран-при Монако',
  'MotoGP Japan': 'MotoGP Японии',
  'NBA Finals 2026': 'Финал NBA 2026',
  'NRL Grand Final': 'Гранд-финал NRL',
  "New Year's Eve Copacabana": 'Новый год на Копакабане',
  'New York City Marathon': 'Нью-Йоркский марафон',
  'Oktoberfest': 'Октоберфест',
  'Oktoberfest Blumenau': 'Октоберфест Блуменау',
  'Oslo Constitution Day': 'День Конституции Норвегии',
  'PGA Championship': 'Чемпионат PGA',
  'Qatar Grand Prix': 'Гран-при Катара',
  'Queenstown Winter Festival': 'Зимний фестиваль Куинстауна',
  'Rugby World Cup 2027': 'Чемпионат мира по регби 2027',
  'Ryder Cup 2027': 'Кубок Райдера 2027',
  'Seoul Lantern Festival': 'Фестиваль фонарей в Сеуле',
  'Singapore Grand Prix': 'Гран-при Сингапура',
  'Six Nations Championship 2027': 'Кубок шести наций 2027',
  'Stanley Cup Final 2026': 'Финал Кубка Стэнли 2026',
  'State of Origin': 'Серия State of Origin',
  'Summer Olympics 2028': 'Летние Олимпийские игры 2028',
  'Super Bowl LX': 'Супербоул LX',
  'Sydney Marathon': 'Сиднейский марафон',
  "Sydney New Year's Eve": 'Новый год в Сиднее',
  'São Paulo Grand Prix': 'Гран-при Сан-Паулу',
  'The Open Championship': 'Открытый чемпионат по гольфу',
  'Tomorrowland 2026': 'Tomorrowland 2026',
  'Tour de France': 'Тур де Франс',
  'U.S. Open Golf': 'Открытый чемпионат США по гольфу',
  'U.S. Open по гольфу': 'Открытый чемпионат США по гольфу',
  'UEFA European Championship 2028': 'Чемпионат Европы UEFA 2028',
  'US Open Tennis': 'Открытый чемпионат США по теннису',
  'US Open по теннису': 'Открытый чемпионат США по теннису',
  'Ultra Music Festival 2027': 'Музыкальный фестиваль Ultra 2027',
  'United States Grand Prix': 'Гран-при США',
  'Venice Film Festival': 'Венецианский кинофестиваль',
  'Vivid Sydney': 'Фестиваль Vivid Sydney',
  'Wimbledon': 'Уимблдон',
  'Winter Olympics 2030': 'Зимние Олимпийские игры 2030',
  'World Series 2026': 'Мировая серия 2026',
  'Yi Peng &amp; Loy Krathong': 'Йи Пенг и Лой Кратхонг'
}));

const monthHeaders = {
  January: 'Январь',
  February: 'Февраль',
  March: 'Март',
  April: 'Апрель',
  May: 'Май',
  June: 'Июнь',
  July: 'Июль',
  August: 'Август',
  September: 'Сентябрь',
  October: 'Октябрь',
  November: 'Ноябрь',
  December: 'Декабрь'
};

const dateMonths = {
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
  Dec: 'дек.'
};

const placeTerms = [
  ['United Kingdom and Ireland', 'Великобритания и Ирландия'],
  ['England, France, Ireland, Italy, Scotland and Wales', 'Англия, Франция, Ирландия, Италия, Шотландия и Уэльс'],
  ['Kenya, Tanzania and Uganda', 'Кения, Танзания и Уганда'],
  ['South Africa, Zimbabwe and Namibia', 'ЮАР, Зимбабве и Намибия'],
  ['India and Sri Lanka', 'Индия и Шри-Ланка'],
  ['South America / Americas', 'Южная Америка / Америка'],
  ['USA / Canada', 'США / Канада'],
  ['French Alps', 'Французские Альпы'],
  ['Los Angeles', 'Лос-Анджелес'],
  ['Las Vegas', 'Лас-Вегас'],
  ['San Diego', 'Сан-Диего'],
  ['New York', 'Нью-Йорк'],
  ['Santa Clara', 'Санта-Клара'],
  ['Indianapolis', 'Индианаполис'],
  ['Southampton', 'Саутгемптон'],
  ['Melbourne', 'Мельбурн'],
  ['Somerset', 'Сомерсет'],
  ['Boston', 'Бостон'],
  ['London', 'Лондон'],
  ['Berlin', 'Берлин'],
  ['Cologne', 'Кельн'],
  ['Cannes', 'Канны'],
  ['Paris', 'Париж'],
  ['Dubai', 'Дубай'],
  ['Miami', 'Майами'],
  ['Adare', 'Адар'],
  ['Le Mans', 'Ле-Ман'],
  ['Indio', 'Индио'],
  ['Boom', 'Бом'],
  ['Saudi Arabia', 'Саудовская Аравия'],
  ['South Africa', 'ЮАР'],
  ['New Zealand', 'Новая Зеландия'],
  ['United Kingdom', 'Великобритания'],
  ['Australia', 'Австралия'],
  ['Brazil', 'Бразилия'],
  ['Canada', 'Канада'],
  ['Belgium', 'Бельгия'],
  ['France', 'Франция'],
  ['Germany', 'Германия'],
  ['Ireland', 'Ирландия'],
  ['India', 'Индия'],
  ['USA', 'США'],
  ['UK', 'Великобритания'],
  ['UAE', 'ОАЭ'],
  ['TBC', 'уточняется']
];

const topicNames = {
  'formula-1': 'Формула-1',
  motogp: 'MotoGP',
  football: 'Футбол',
  golf: 'Гольф',
  tennis: 'Теннис',
  rugby: 'Регби',
  running: 'Бег',
  cycling: 'Велоспорт',
  'horse-racing': 'Скачки',
  'multi-sport': 'Мультиспорт',
  'aussie-rules': 'Австралийский футбол',
  music: 'Музыка',
  art: 'Искусство',
  'food-drink': 'Еда и напитки',
  carnival: 'Карнавал',
  'new-years': 'Новый год',
  winter: 'Зима',
  film: 'Кино',
  religion: 'Религия',
  'national-day': 'Национальный день',
  tradition: 'Традиции',
  wildlife: 'Дикая природа',
  cricket: 'Крикет',
  'ice-hockey': 'Хоккей',
  basketball: 'Баскетбол',
  'pop-culture': 'Поп-культура',
  'music-festivals': 'Музыкальные фестивали',
  marathon: 'Марафон',
  awards: 'Премии',
  fashion: 'Мода',
  'tech-events': 'Технологии',
  motorsport: 'Автоспорт'
};

const countryNames = {
  australia: 'Австралия',
  'new-zealand': 'Новая Зеландия',
  fiji: 'Фиджи',
  usa: 'США',
  canada: 'Канада',
  mexico: 'Мексика',
  france: 'Франция',
  germany: 'Германия',
  uk: 'Великобритания',
  'united-kingdom': 'Великобритания',
  italy: 'Италия',
  monaco: 'Монако',
  norway: 'Норвегия',
  tbc: 'уточняется',
  morocco: 'Марокко',
  'south-africa': 'ЮАР',
  kenya: 'Кения',
  rwanda: 'Руанда',
  malawi: 'Малави',
  egypt: 'Египет',
  nigeria: 'Нигерия',
  japan: 'Япония',
  indonesia: 'Индонезия',
  india: 'Индия',
  singapore: 'Сингапур',
  'south-korea': 'Южная Корея',
  thailand: 'Таиланд',
  qatar: 'Катар',
  uae: 'ОАЭ',
  'saudi-arabia': 'Саудовская Аравия',
  brazil: 'Бразилия',
  argentina: 'Аргентина',
  colombia: 'Колумбия',
  peru: 'Перу',
  chile: 'Чили',
  sweden: 'Швеция',
  denmark: 'Дания',
  finland: 'Финляндия',
  ireland: 'Ирландия',
  spain: 'Испания',
  portugal: 'Португалия',
  netherlands: 'Нидерланды',
  belgium: 'Бельгия',
  austria: 'Австрия',
  switzerland: 'Швейцария',
  poland: 'Польша',
  czechia: 'Чехия',
  hungary: 'Венгрия',
  greece: 'Греция',
  romania: 'Румыния',
  ukraine: 'Украина',
  china: 'Китай',
  malaysia: 'Малайзия',
  pakistan: 'Пакистан',
  bangladesh: 'Бангладеш'
};

const continentNames = {
  africa: 'Африка',
  asia: 'Азия',
  europe: 'Европа',
  'north-america': 'Северная Америка',
  oceania: 'Океания',
  'south-america': 'Южная Америка'
};

function translateMeta(text) {
  let out = text;
  for (const [en, ru] of Object.entries(dateMonths)) {
    out = out.replace(new RegExp(`\\b${en}\\b`, 'g'), ru);
  }
  for (const [en, ru] of placeTerms) {
    out = out.split(en).join(ru);
  }
  return out;
}

html = html.replace(/<html lang="[^"]*"/, '<html lang="ru"');
html = html.replace(/<title>[^<]*<\/title>/, '<title>Календарь мировых событий | OneSliders</title>');
html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="Мировой календарь событий OneSliders со спортом, фестивалями, культурой и природными явлениями по месяцам."');
html = html.replace(/<span class="hero-kicker">[^<]*<\/span>/, '<span class="hero-kicker">Мировой календарь</span>');
html = html.replace(/<h1>[^<]*<\/h1>/, '<h1>Мировые события, вокруг которых стоит планировать поездки</h1>');
html = html.replace(/<p>[^<]*Sports, festivals, culture and natural spectacles, arranged month by month\.[^<]*<\/p>/, '<p>Спорт, фестивали, культура и природные явления, разложенные по месяцам.</p>');

replaceAll('title="Events" aria-label="Events"', 'title="События" aria-label="События"');
replaceAll('title="World" aria-label="World"', 'title="Мир" aria-label="Мир"');
replaceAll('title="Categories" aria-label="Categories"', 'title="Категории" aria-label="Категории"');
replaceAll('<span>Languages</span>', '<span>Язык</span>');
replaceAll("content: '● Global'", "content: '● Мир'");
replaceAll("content: '● Continent'", "content: '● Континент'");
replaceAll("content: '● National'", "content: '● Страна'");

html = html.replace(/(<button class="filter-btn" data-cont="africa">)[^<]*(<\/button>)/, '$1🌍 Африка$2');
html = html.replace(/(<button class="filter-btn" data-cont="asia">)[^<]*(<\/button>)/, '$1🌏 Азия$2');
html = html.replace(/(<button class="filter-btn" data-cont="europe">)[^<]*(<\/button>)/, '$1🌍 Европа$2');
html = html.replace(/(<button class="filter-btn" data-cont="north-america">)[^<]*(<\/button>)/, '$1🌎 Сев. Америка$2');
html = html.replace(/(<button class="filter-btn" data-cont="oceania">)[^<]*(<\/button>)/, '$1🌏 Океания$2');
html = html.replace(/(<button class="filter-btn" data-cont="south-america">)[^<]*(<\/button>)/, '$1🌎 Юж. Америка$2');

html = html.replace(/<span class="cat-pill">([^<]+)<\/span>/g, (_, label) => {
  const icon = label.match(/^[^\p{L}\p{N}]+/u)?.[0] || '';
  const clean = label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
  const translated = {
    Sport: 'Спорт',
    'Motor sport': 'Автоспорт',
    Festival: 'Фестиваль',
    Culture: 'Культура',
    Nature: 'Природа'
  }[clean] || clean;
  return `<span class="cat-pill">${icon}${translated}</span>`;
});

html = html.replace(/<strong class="card-title">([^<]+)<\/strong>/g, (_, title) => (
  `<strong class="card-title">${eventTitles.get(title) || title}</strong>`
));

html = html.replace(/<span class="month-title">([^<]+)<\/span>/g, (_, label) => {
  const translated = label.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g, m => monthHeaders[m]);
  return `<span class="month-title">${translated}</span>`;
});

html = html.replace(/<span class="card-meta">([^<]*)<\/span>/g, (_, meta) => (
  `<span class="card-meta">${translateMeta(meta)}</span>`
));

html = html.replace(/const topicNames = \{[\s\S]*?\n    \};/, `const topicNames = ${JSON.stringify(topicNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};`);
html = html.replace(/const countryNames = \{[\s\S]*?\n    \};/, `const countryNames = ${JSON.stringify(countryNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};
    const continentNames = ${JSON.stringify(continentNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};`);
html = html.replace(
  /if \(k === userContinent\) seen\.add\(c\.replace\(\/-\/g,' '\)\.replace\(\/\\b\\w\/g,x=>x\.toUpperCase\(\)\)\);/g,
  "if (k === userContinent) seen.add(countryNames[c] || c.replace(/-/g,' '));"
);
html = html.replace(
  /const contLabel = userContinent\.replace\(\/-\/g,' '\)\.replace\(\/\\b\\w\/g,x=>x\.toUpperCase\(\)\);/g,
  "const contLabel = continentNames[userContinent] || userContinent.replace(/-/g,' ');"
);

fs.writeFileSync(file, html, 'utf8');
