import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'content/categories/wellness/sauna/events');

for (const name of fs.readdirSync(dir).filter((file) => file.endsWith('.html'))) {
  const filePath = path.join(dir, name);
  let html = fs.readFileSync(filePath, 'utf8');
  html = html
    .replaceAll('../../../../../content/events/', '/content/events/')
    .replaceAll('../../../../../content/categories/', '/content/categories/')
    .replaceAll('../../../../../content/locations/', '/content/locations/')
    .replaceAll('../../../../../assets/', '/assets/')
    .replaceAll('src="/content/categories/wellness/sauna/events/img/', 'src="img/');
  fs.writeFileSync(filePath, html, 'utf8');
}

console.log('fixed sauna event paths');
