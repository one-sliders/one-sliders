import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const textExts = new Set(['.html', '.json', '.md', '.csv', '.js', '.css', '.xml', '.txt']);
const skipDirs = new Set(['.git', '.claude', 'node_modules', 'tmp']);

const cp1252Special = new Map([
  ['€', 0x80], ['‚', 0x82], ['ƒ', 0x83], ['„', 0x84], ['…', 0x85],
  ['†', 0x86], ['‡', 0x87], ['ˆ', 0x88], ['‰', 0x89], ['Š', 0x8a],
  ['‹', 0x8b], ['Œ', 0x8c], ['Ž', 0x8e], ['‘', 0x91], ['’', 0x92],
  ['“', 0x93], ['”', 0x94], ['•', 0x95], ['–', 0x96], ['—', 0x97],
  ['˜', 0x98], ['™', 0x99], ['š', 0x9a], ['›', 0x9b], ['œ', 0x9c],
  ['ž', 0x9e], ['Ÿ', 0x9f],
]);

const directFixes = new Map([
  ['Jyv�skyl�', 'Jyväskylä'],
  ['Otep��', 'Otepää'],
  ['ÃƒÂ­', 'í'],
  ['ÃƒÂ£', 'ã'],
  ['ÃƒÆ’Ã‹Å“', 'Ø'],
  ['Ã¢â‚¬Â¹', '‹'],
  ['Ã¢â‚¬Âº', '›'],
  ['Â·', '·'],
]);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (!skipDirs.has(ent.name)) walk(path.join(dir, ent.name), out);
      continue;
    }
    if (textExts.has(path.extname(ent.name).toLowerCase())) out.push(path.join(dir, ent.name));
  }
  return out;
}

function hasMojibake(text) {
  return /Ãƒ|Ã‚|Ã[\u0080-\u00bf]|Â[·©®±´»¼½¾¿]|â[€œ˜™“”‘’–—€¦]|ð[ŸÅ]|�|Jyv�|Otep�/.test(text);
}

function badScore(text) {
  let score = 0;
  for (const re of [
    /Ãƒ/g, /Ã‚/g, /Ã[\u0080-\u00bf]/g, /Â[·©®±´»¼½¾¿]/g,
    /â[€œ˜™“”‘’–—€¦]/g, /ð[ŸÅ]/g, /�/g,
  ]) score += (text.match(re) || []).length;
  return score;
}

function cp1252BytesFromString(text) {
  const bytes = [];
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (cp1252Special.has(ch)) bytes.push(cp1252Special.get(ch));
    else return null;
  }
  return Buffer.from(bytes);
}

function decodeOnce(text) {
  const bytes = cp1252BytesFromString(text);
  if (!bytes) return text;
  return bytes.toString('utf8');
}

function decodeMojibake(text) {
  let best = text;
  let bestScore = badScore(text);
  for (let i = 0; i < 3; i += 1) {
    const next = decodeOnce(best);
    const nextScore = badScore(next);
    if (next.includes('\uFFFD') && !best.includes('\uFFFD')) break;
    if (nextScore < bestScore) {
      best = next;
      bestScore = nextScore;
    } else {
      break;
    }
  }
  return best;
}

function fixLine(line) {
  let out = line;
  for (const [from, to] of directFixes) out = out.split(from).join(to);
  if (!hasMojibake(out)) return out;
  const decoded = decodeMojibake(out);
  return badScore(decoded) < badScore(out) ? decoded : out;
}

function fixText(text) {
  const withoutBom = text.startsWith('\uFEFF') ? text.slice(1) : text;
  return withoutBom.split(/(\r?\n)/).map((part) => part.includes('\n') ? part : fixLine(part)).join('');
}

const changed = [];
for (const file of walk(root)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.startsWith('\uFEFF') && !hasMojibake(before)) continue;
  const after = fixText(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed.push(path.relative(root, file));
  }
}

console.log(JSON.stringify({ changed }, null, 2));
