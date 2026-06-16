import fs from 'node:fs';
import path from 'node:path';
import { languages } from '../lib/event-language-profiles.mjs';

const root = process.cwd();
const text = {
  en: ['Climate Action', 'Climate summits, Earth Day campaigns and public environmental action.'],
  ar: ['العمل المناخي', 'قمم المناخ وحملات يوم الأرض والعمل البيئي العام.'],
  sw: ['Hatua za tabianchi', 'Mikutano ya tabianchi, kampeni za Siku ya Dunia na hatua za umma za mazingira.'],
  ha: ['Aikin sauyin yanayi', 'Taron sauyin yanayi, kamfen na Ranar Duniya da aikin muhalli na jama’a.'],
  zh: ['气候行动', '气候峰会、地球日活动和公众环境行动。'],
  hi: ['जलवायु कार्रवाई', 'जलवायु शिखर सम्मेलन, पृथ्वी दिवस अभियान और सार्वजनिक पर्यावरण कार्रवाई।'],
  ru: ['Климатические действия', 'Климатические саммиты, кампании Дня Земли и общественные экологические действия.'],
  de: ['Klimaschutz', 'Klimagipfel, Earth-Day-Kampagnen und öffentliches Umwelthandeln.'],
  fr: ['Action climatique', 'Sommets climat, campagnes du Jour de la Terre et action environnementale publique.'],
  es: ['Acción climática', 'Cumbres climáticas, campañas del Día de la Tierra y acción ambiental pública.'],
  pt: ['Ação climática', 'Cúpulas climáticas, campanhas do Dia da Terra e ação ambiental pública.'],
  qu: ['Klima ruway', 'Klima huñunakuykuna, Pachamama P’unchaw kampañakuna, runakuna pachamama ruway.'],
  tpi: ['Klaimet aksen', 'Klaimet miting, Earth Day kempein na pablik envaironmen aksen.'],
  mi: ['Mahi āhuarangi', 'Ngā hui āhuarangi, ngā kaupapa Rā o te Ao me te mahi taiao a te iwi.']
};

function card(lang) {
  const [title, body] = text[lang] || text.en;
  return `            <a class="topic-card" href="climate-action.html"><img class="topic-thumb" src="../content/events/2026/11/img/cop31-2026-mini.png" alt="" aria-hidden="true"><strong>${title}</strong><p>${body}</p></a>`;
}

for (const lang of languages) {
  const file = path.join(root, lang, 'content', 'categories', 'climate', 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll('href="../../locations/index.html"', 'href="../content/locations/index.html"');
  html = html.replaceAll('href="../../categories/index.html"', 'href="../index.html"');
  html = html.replaceAll('cop31-2026-hero.svg', 'cop31-2026-mini.png');
  html = html.replaceAll('cop31-2026-hero.png', 'cop31-2026-mini.png');
  html = html.replace(/\s*<a class="topic-card" href="climate-action\.html"[\s\S]*?<\/a>/, '');
  html = html.replace(/(\s*<\/div><\/div>\s*<\/section>\s*<\/section>\s*<\/main>)/, `\n${card(lang)}$1`);
  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Updated climate index topic cards for ${languages.length} languages.`);
