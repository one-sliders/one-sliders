import fs from 'node:fs';
const files = [
  'content/categories/sport/golf/events/masters-tournament.html',
  'content/categories/sport/golf/events/oslo-ladies-open.html',
  'content/categories/sport/golf/events/pga-championship.html',
  'content/categories/sport/golf/events/ryder-cup.html',
  'content/categories/sport/golf/events/solheim-cup.html',
  'content/categories/sport/golf/events/the-open-championship.html',
  'content/categories/sport/golf/events/us-open-golf.html',
  'content/categories/sport/tennis/events/wimbledon.html'
];
const changed = [];

function cleanHtml(file) {
  const html = fs.readFileSync(file, 'utf8');
  const next = html.replace(
    /(<script type="application\/json" id="event-year-data">)([\s\S]*?)(<\/script>)/g,
    (full, open, json, close) => {
      let data;
      try {
        data = JSON.parse(json);
      } catch {
        return full;
      }

      let touched = false;
      for (const edition of data.editions || []) {
        if (edition.currentModules && Object.prototype.hasOwnProperty.call(edition.currentModules, 'lead')) {
          delete edition.currentModules.lead;
          touched = true;
        }
      }

      return touched ? open + JSON.stringify(data) + close : full;
    }
  );

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed.push(file);
  }
}

files.forEach(cleanHtml);
console.log(changed.join('\n'));
