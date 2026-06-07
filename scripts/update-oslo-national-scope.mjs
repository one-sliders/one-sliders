import fs from 'node:fs';
import path from 'node:path';

function contentPath(language, type, year, month, slug) {
  return `/${language}/content/${type}/${year}/${month}/${slug}.html`;
}

const registry = [
  {
    content_id: 'norwegian-constitution-day-2026',
    language: 'en',
    slug: 'norwegian-constitution-day',
    title: 'Norway Constitution Day in Oslo 2026',
    meta_description: "Norway Constitution Day is celebrated across the country on 17 May. This OneSliders page focuses on the Oslo celebration, with the children's parade, flags and ceremonies in the capital.",
    path: contentPath('en', 'events', '2026', '05', 'norwegian-constitution-day'),
    translation_status: 'published'
  },
  {
    content_id: 'norwegian-constitution-day-2026',
    language: 'no',
    slug: 'norwegian-constitution-day',
    title: '17. mai i Oslo 2026',
    meta_description: '17. mai feires over hele Norge. Denne OneSliders-siden fokuserer p\u00e5 feiringen i Oslo, med barnetog, flagg, musikk og seremonier i hovedstaden.',
    path: contentPath('no', 'events', '2026', '05', 'norwegian-constitution-day'),
    translation_status: 'published'
  },
  {
    content_id: 'norwegian-constitution-day-2026',
    language: 'ru',
    slug: 'norwegian-constitution-day',
    title: '\u0414\u0435\u043d\u044c \u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u0438 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438 \u0432 \u041e\u0441\u043b\u043e 2026',
    meta_description: '\u0414\u0435\u043d\u044c \u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u0438 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438 \u043e\u0442\u043c\u0435\u0447\u0430\u044e\u0442 \u043f\u043e \u0432\u0441\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0435 17 \u043c\u0430\u044f. \u042d\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 OneSliders \u043f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0430 \u043f\u0440\u0430\u0437\u0434\u043d\u043e\u0432\u0430\u043d\u0438\u044e \u0432 \u041e\u0441\u043b\u043e: \u0434\u0435\u0442\u0441\u043a\u043e\u043c\u0443 \u043f\u0430\u0440\u0430\u0434\u0443, \u0444\u043b\u0430\u0433\u0430\u043c \u0438 \u0446\u0435\u0440\u0435\u043c\u043e\u043d\u0438\u044f\u043c \u0432 \u0441\u0442\u043e\u043b\u0438\u0446\u0435.',
    path: contentPath('ru', 'events', '2026', '05', 'norwegian-constitution-day'),
    translation_status: 'published'
  },
  {
    content_id: 'norwegian-constitution-day-2026',
    language: 'de',
    slug: 'norwegian-constitution-day',
    title: 'Norwegens Verfassungstag in Oslo 2026',
    meta_description: 'Norwegens Verfassungstag wird am 17. Mai im ganzen Land gefeiert. Diese OneSliders-Seite konzentriert sich auf die Feier in Oslo mit Kinderumzug, Flaggen und Zeremonien in der Hauptstadt.',
    path: contentPath('de', 'events', '2026', '05', 'norwegian-constitution-day'),
    translation_status: 'published'
  },
  {
    content_id: 'norwegian-constitution-day-2026',
    language: 'fr',
    slug: 'norwegian-constitution-day',
    title: 'F\u00eate de la Constitution norv\u00e9gienne \u00e0 Oslo 2026',
    meta_description: 'La f\u00eate de la Constitution norv\u00e9gienne est c\u00e9l\u00e9br\u00e9e dans tout le pays le 17 mai. Cette page OneSliders se concentre sur la c\u00e9l\u00e9bration \u00e0 Oslo, avec le d\u00e9fil\u00e9 des enfants, les drapeaux et les c\u00e9r\u00e9monies dans la capitale.',
    path: contentPath('fr', 'events', '2026', '05', 'norwegian-constitution-day'),
    translation_status: 'published'
  }
];

const pageUpdates = {
  en: {
    title: registry[0].title,
    intro: "17 May is Norway's national day across the whole country. This page focuses on how the celebration looks in Oslo, where the capital's children's parade, flags and ceremonies gather around Karl Johans gate and the Royal Palace.",
    facts: [
      "17 May is Norway's Constitution Day and an official public holiday celebrated across the whole country.",
      "The date marks 17 May 1814, when Norway's Constitution was signed at Eidsvoll.",
      "The constitution declared Norway an independent kingdom after centuries in union with Denmark, before a new union with Sweden followed later in 1814.",
      "This page focuses on Oslo's celebration; other towns and villages across Norway have their own parades and local programmes.",
      "The parade passes the Royal Palace, where the Royal Family traditionally greets the children from the balcony.",
      "Expect flags, school bands, national costumes, packed streets and limited traffic access in central Oslo."
    ]
  },
  no: {
    title: registry[1].title,
    intro: '17. mai er Norges nasjonaldag i hele landet. Denne siden fokuserer p\u00e5 feiringen i Oslo, der hovedstadens barnetog, flagg og seremonier samles rundt Karl Johans gate og Slottet.',
    facts: [
      '17. mai er Norges grunnlovsdag og en offentlig helligdag som feires over hele landet.',
      'Datoen viser til 17. mai 1814, da Norges grunnlov ble undertegnet p\u00e5 Eidsvoll.',
      'Grunnloven erkl\u00e6rte Norge som et selvstendig kongerike etter \u00e5rhundrer i union med Danmark, f\u00f8r en ny union med Sverige fulgte senere i 1814.',
      'Denne siden fokuserer p\u00e5 Oslo-feiringen; byer, tettsteder og bygder over hele Norge har egne tog og lokale programmer.',
      'Toget passerer Slottet, der kongefamilien tradisjonelt hilser barna fra balkongen.',
      'Forvent flagg, skolekorps, bunader, fulle gater og begrenset trafikk i Oslo sentrum.'
    ]
  },
  ru: {
    title: registry[2].title,
    intro: '17 \u043c\u0430\u044f \u2014 \u043d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0439 \u0434\u0435\u043d\u044c \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438 \u0432\u043e \u0432\u0441\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0435. \u042d\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043f\u043e\u0441\u0432\u044f\u0449\u0435\u043d\u0430 \u043f\u0440\u0430\u0437\u0434\u043d\u043e\u0432\u0430\u043d\u0438\u044e \u0432 \u041e\u0441\u043b\u043e, \u0433\u0434\u0435 \u0434\u0435\u0442\u0441\u043a\u0438\u0439 \u043f\u0430\u0440\u0430\u0434 \u0441\u0442\u043e\u043b\u0438\u0446\u044b, \u0444\u043b\u0430\u0433\u0438 \u0438 \u0446\u0435\u0440\u0435\u043c\u043e\u043d\u0438\u0438 \u043f\u0440\u043e\u0445\u043e\u0434\u044f\u0442 \u0432\u043e\u043a\u0440\u0443\u0433 Karl Johans gate \u0438 \u041a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u043a\u043e\u0433\u043e \u0434\u0432\u043e\u0440\u0446\u0430.',
    facts: [
      '17 \u043c\u0430\u044f \u2014 \u0414\u0435\u043d\u044c \u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u0438 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438 \u0438 \u043e\u0444\u0438\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439, \u043a\u043e\u0442\u043e\u0440\u044b\u0439 \u043e\u0442\u043c\u0435\u0447\u0430\u044e\u0442 \u043f\u043e \u0432\u0441\u0435\u0439 \u0441\u0442\u0440\u0430\u043d\u0435.',
      '\u0414\u0430\u0442\u0430 \u0441\u0432\u044f\u0437\u0430\u043d\u0430 \u0441 17 \u043c\u0430\u044f 1814 \u0433\u043e\u0434\u0430, \u043a\u043e\u0433\u0434\u0430 \u0432 \u042d\u0439\u0434\u0441\u0432\u043e\u043b\u043b\u0435 \u0431\u044b\u043b\u0430 \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u0430 \u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u044f \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438.',
      '\u041a\u043e\u043d\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u044f \u043f\u0440\u043e\u0432\u043e\u0437\u0433\u043b\u0430\u0441\u0438\u043b\u0430 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u044e \u043d\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043c\u044b\u043c \u043a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u0442\u0432\u043e\u043c \u043f\u043e\u0441\u043b\u0435 \u0432\u0435\u043a\u043e\u0432 \u0443\u043d\u0438\u0438 \u0441 \u0414\u0430\u043d\u0438\u0435\u0439; \u043f\u043e\u0437\u0434\u043d\u0435\u0435 \u0432 1814 \u0433\u043e\u0434\u0443 \u043f\u043e\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043b\u0430 \u043d\u043e\u0432\u0430\u044f \u0443\u043d\u0438\u044f \u0441 \u0428\u0432\u0435\u0446\u0438\u0435\u0439.',
      '\u042d\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0444\u043e\u043a\u0443\u0441\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u043d\u0430 \u041e\u0441\u043b\u043e; \u0433\u043e\u0440\u043e\u0434\u0430, \u043f\u043e\u0441\u0435\u043b\u043a\u0438 \u0438 \u0434\u0435\u0440\u0435\u0432\u043d\u0438 \u043f\u043e \u0432\u0441\u0435\u0439 \u041d\u043e\u0440\u0432\u0435\u0433\u0438\u0438 \u043f\u0440\u043e\u0432\u043e\u0434\u044f\u0442 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0435 \u043f\u0430\u0440\u0430\u0434\u044b \u0438 \u043c\u0435\u0441\u0442\u043d\u044b\u0435 \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u044b.',
      '\u041f\u0430\u0440\u0430\u0434 \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442 \u043c\u0438\u043c\u043e \u041a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u043a\u043e\u0433\u043e \u0434\u0432\u043e\u0440\u0446\u0430, \u0433\u0434\u0435 \u043a\u043e\u0440\u043e\u043b\u0435\u0432\u0441\u043a\u0430\u044f \u0441\u0435\u043c\u044c\u044f \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043e\u043d\u043d\u043e \u043f\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0434\u0435\u0442\u0435\u0439 \u0441 \u0431\u0430\u043b\u043a\u043e\u043d\u0430.',
      '\u041e\u0436\u0438\u0434\u0430\u0439\u0442\u0435 \u0444\u043b\u0430\u0433\u0438, \u0448\u043a\u043e\u043b\u044c\u043d\u044b\u0435 \u043e\u0440\u043a\u0435\u0441\u0442\u0440\u044b, \u043d\u0430\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u043e\u0441\u0442\u044e\u043c\u044b, \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u043d\u044b\u0435 \u0443\u043b\u0438\u0446\u044b \u0438 \u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u044f \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f \u0432 \u0446\u0435\u043d\u0442\u0440\u0435 \u041e\u0441\u043b\u043e.'
    ]
  },
  de: {
    title: registry[3].title,
    intro: 'Der 17. Mai ist Norwegens Nationalfeiertag im ganzen Land. Diese Seite konzentriert sich auf die Feier in Oslo, wo der Kinderumzug der Hauptstadt, Flaggen und Zeremonien rund um Karl Johans gate und das K\u00f6nigliche Schloss stattfinden.',
    facts: [
      'Der 17. Mai ist Norwegens Verfassungstag und ein offizieller Feiertag, der im ganzen Land gefeiert wird.',
      'Das Datum erinnert an den 17. Mai 1814, als die norwegische Verfassung in Eidsvoll unterzeichnet wurde.',
      'Die Verfassung erkl\u00e4rte Norwegen nach Jahrhunderten in Union mit D\u00e4nemark zu einem unabh\u00e4ngigen K\u00f6nigreich; sp\u00e4ter im Jahr 1814 folgte eine neue Union mit Schweden.',
      'Diese Seite konzentriert sich auf Oslo; St\u00e4dte, Orte und D\u00f6rfer in ganz Norwegen haben eigene Umz\u00fcge und lokale Programme.',
      'Der Umzug f\u00fchrt am K\u00f6niglichen Schloss vorbei, wo die k\u00f6nigliche Familie die Kinder traditionell vom Balkon begr\u00fc\u00dft.',
      'Erwarten Sie Flaggen, Schulkapellen, Trachten, volle Stra\u00dfen und eingeschr\u00e4nkten Verkehr im Zentrum von Oslo.'
    ]
  },
  fr: {
    title: registry[4].title,
    intro: 'Le 17 mai est la f\u00eate nationale norv\u00e9gienne dans tout le pays. Cette page se concentre sur la c\u00e9l\u00e9bration \u00e0 Oslo, o\u00f9 le d\u00e9fil\u00e9 des enfants de la capitale, les drapeaux et les c\u00e9r\u00e9monies se d\u00e9roulent autour de Karl Johans gate et du Palais royal.',
    facts: [
      'Le 17 mai est le jour de la Constitution norv\u00e9gienne et un jour f\u00e9ri\u00e9 officiel c\u00e9l\u00e9br\u00e9 dans tout le pays.',
      'La date rappelle le 17 mai 1814, lorsque la Constitution norv\u00e9gienne a \u00e9t\u00e9 sign\u00e9e \u00e0 Eidsvoll.',
      'La Constitution a d\u00e9clar\u00e9 la Norv\u00e8ge royaume ind\u00e9pendant apr\u00e8s des si\u00e8cles d union avec le Danemark, avant une nouvelle union avec la Su\u00e8de plus tard en 1814.',
      'Cette page se concentre sur Oslo; les villes et villages de toute la Norv\u00e8ge ont leurs propres d\u00e9fil\u00e9s et programmes locaux.',
      'Le d\u00e9fil\u00e9 passe devant le Palais royal, o\u00f9 la famille royale salue traditionnellement les enfants depuis le balcon.',
      'Attendez-vous \u00e0 des drapeaux, des fanfares scolaires, des costumes nationaux, des rues bond\u00e9es et une circulation limit\u00e9e dans le centre d Oslo.'
    ]
  }
};

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeJson(value) {
  return JSON.stringify(value).slice(1, -1);
}

fs.writeFileSync('content/page-registry.json', `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

for (const record of registry) {
  const update = pageUpdates[record.language];
  const file = path.resolve(record.path.slice(1));
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<title>[^<]+<\/title>/, `<title>${update.title} | OneSliders</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeAttr(record.meta_description)}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeAttr(update.title)} | OneSliders">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeAttr(record.meta_description)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeAttr(update.title)} | OneSliders">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeAttr(record.meta_description)}">`);
  html = html.replace(/"name": "[^"]*"/, `"name": "${escapeJson(update.title)}"`);
  html = html.replace(/"description": "[^"]*"/, `"description": "${escapeJson(record.meta_description)}"`);
  html = html.replace(/<h1 class="event-title" id="event-title">[\s\S]*?<\/h1>/, `<h1 class="event-title" id="event-title">${update.title}</h1>`);
  html = html.replace(/<p class="event-intro">[\s\S]*?<\/p>/, `<p class="event-intro">${update.intro}</p>`);
  html = html.replace(/<ul class="event-list">[\s\S]*?<\/ul>/, `<ul class="event-list">\n${update.facts.map((item) => `            <li>${item}</li>`).join('\n')}\n          </ul>`);
  fs.writeFileSync(file, html, 'utf8');
}
