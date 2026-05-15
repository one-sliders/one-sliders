import fs from 'node:fs';
import path from 'node:path';
import { languages } from './event-language-profiles.mjs';

const root = process.cwd();

const national = new Set([
  '2026/05/oslo-constitution-day.html',
  '2026/05/state-of-origin.html',
  '2026/05/vivid-sydney.html',
  '2026/06/bali-arts-festival.html',
  '2026/06/festa-junina.html',
  '2026/06/oslo-ladies-open.html',
  '2026/06/queenstown-winter-festival.html',
  '2026/07/calgary-stampede.html',
  '2026/07/durban-july.html',
  '2026/08/buenos-aires-tango-festival.html',
  '2026/08/oya-festival.html',
  '2026/08/burning-man.html',
  '2026/08/medellin-flower-festival.html',
  '2026/08/sydney-marathon.html',
  '2026/09/afl-grand-final.html',
  '2026/09/brazil-independence-day.html',
  '2026/09/chile-independence-day-and-fiestas-patrias.html',
  '2026/09/hermanus-whale-festival.html',
  '2026/09/kwita-izina.html',
  '2026/09/oktoberfest.html',
  '2026/10/day-of-the-dead.html',
  '2026/10/fiji-day.html',
  '2026/10/nrl-grand-final.html',
  '2026/10/oktoberfest-blumenau.html',
  '2026/11/melbourne-cup.html',
  '2026/11/seoul-lantern-festival.html',
  '2026/11/yi-peng-and-loy-krathong.html',
  '2026/12/calabar-carnival.html',
  '2026/12/jul-i-vinterland.html',
  '2026/12/new-years-eve-copacabana.html',
  '2026/12/sydney-new-years-eve.html',
  '2026/02/super-bowl-lx.html',
  '2027/01/ces-2027.html',
  '2027/02/grammy-awards-2027.html',
  '2027/03/ultra-music-festival-2027.html',
  '2027/03/oscars-2027.html',
  '2027/04/coachella-2027.html',
  '2027/05/met-gala-2027.html'
]);

const continent = new Set([
  '2026/05/indianapolis-500.html',
  '2026/05/ipl-final-2026.html',
  '2026/05/cannes-film-festival.html',
  '2026/05/champions-league-final.html',
  '2026/05/eurovision-song-contest.html',
  '2026/05/fes-festival-of-world-sacred-music.html',
  '2026/06/stanley-cup-final-2026.html',
  '2026/06/nba-finals-2026.html',
  '2026/06/inti-raymi.html',
  '2026/07/comic-con-international-2026.html',
  '2026/07/tomorrowland-2026.html',
  '2026/07/commonwealth-games.html',
  '2026/07/great-migration.html',
  '2026/07/tour-de-france.html',
  '2026/08/gamescom-2026.html',
  '2026/08/bledisloe-cup.html',
  '2026/09/asian-games-2026.html',
  '2026/09/lake-of-stars-festival.html',
  '2026/09/venice-film-festival.html',
  '2026/10/world-series-2026.html',
  '2026/10/cape-town-marathon.html',
  '2026/11/cairo-international-film-festival.html',
  '2026/11/copa-libertadores-final.html',
  '2026/11/marrakech-international-film-festival.html',
  '2027/06/africa-cup-of-nations-2027.html',
  '2027/01/afc-asian-cup-2027.html',
  '2027/02/six-nations-2027.html',
  '2027/09/ryder-cup-2027.html',
  '2027/03/dubai-world-cup-2027.html',
  '2028/06/copa-america-2028.html',
  '2028/06/uefa-euro-2028.html',
  '2027/04/london-marathon-2027.html',
  '2027/04/boston-marathon-2027.html',
  '2027/06/glastonbury-2027.html'
]);

function desiredReach(href, current) {
  if (national.has(href)) return 'national';
  if (continent.has(href)) return 'continent';
  return current;
}

let changed = 0;
const totals = {};

for (const lang of languages) {
  const file = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll('data-reach="timezone"', 'data-reach="national"');
  html = html.replace(/(<a\b[^>]*\bclass="event-card"[^>]*\bhref="([^"]+)"[^>]*\bdata-reach=")([^"]+)(")/g, (match, before, href, reach, after) => {
    const next = desiredReach(href, reach);
    totals[next] = (totals[next] || 0) + 1;
    if (next !== reach) changed += 1;
    return `${before}${next}${after}`;
  });
  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Updated reach levels in ${languages.length} event indexes. Changed ${changed} cards.`);
console.log(JSON.stringify(totals, null, 2));
