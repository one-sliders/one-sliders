import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const dataPath = path.join(repoRoot, 'scripts', 'data', 'country-history.json');

function ensurePeriod(text) {
  const trimmed = String(text || '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function possessive(title) {
  return /s$/i.test(title) ? `${title}'` : `${title}'s`;
}

function cleanup(text) {
  let value = String(text || '')
    .replace(/DeclaredAs/g, 'Declared as')
    .replace(/With French Sudan, as the Mali Federation\./g, 'with French Sudan as the Mali Federation')
    .replace(/\bthe UK\b/g, 'the United Kingdom')
    .replace(/\ba important\b/g, 'an important')
    .replace(/([A-Za-z]+s)'s\b/g, "$1'")
    .replace(/\s*;\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
  value = value.replace(
    /,\s*a key milestone in ([^,.]+ path toward modern sovereignty)(?:,\s*a key milestone in \1)+/gi,
    ', a key milestone in $1',
  );
  return value;
}

function isSentence(text) {
  return text.length >= 58 && /\b(was|were|became|began|created|founded|declared|established|adopted|joined|recognized|recognised|annexed|gained|restored|ended|captured|emerged|came|proclaimed|unified|admitted|entered|lost|rose|signed|took|changed|placed|separated|formed|started|returned|marked|shaped)\b/i.test(text);
}

function articleFor(term) {
  return /^[aeiou]/i.test(term) ? 'an' : 'a';
}

function explainShortName(title, label) {
  const cleanLabel = label.replace(/[.!?]$/, '');
  const lower = cleanLabel.toLowerCase();
  if (lower === 'republic') return `${title} became a republic, replacing the previous constitutional arrangement.`;
  if (lower === 'kingdom') return `A kingdom was proclaimed, placing monarchy at the centre of ${title}'s state authority.`;
  if (lower === 'duchy') return `The territory was organized as a duchy, an early form of regional political rule.`;
  if (lower === 'empire') return `${title} was reorganized as an empire, expanding monarchical authority and status.`;
  if (lower === 'county') return `A county was established, creating an early political base for later state development.`;
  if (lower === 'union') return `A political union was formed, tying the territory into a larger state structure.`;
  if (lower === 'realm') return `${title} became a Commonwealth realm, keeping the monarch as head of state after independence.`;
  if (lower === 'granted') return `Independence was granted, completing the formal transition to sovereign statehood.`;
  if (lower === 'declared') return `${title} declared independence or statehood, marking a decisive political break.`;
  if (lower === 'founded') return `${title}'s founding tradition marks the beginning of its recognized state history.`;
  if (lower === 'de facto') return `Independence was achieved in practice, even before full formal recognition.`;
  if (lower === 'de jure') return `Independence was formally recognized in law, completing the sovereignty process.`;
  if (lower === 'renaming') return `${title}'s official name was changed, updating the country's modern state identity.`;
  if (lower === 'cession') return `The territory was ceded to a new power, changing its colonial control and legal status.`;
  return `${cleanLabel} emerged as an important early state, kingdom or political formation in ${possessive(title)} history.`;
}

function polishText(title, rawText) {
  const text = cleanup(rawText);
  const base = text.replace(/[.!?]$/, '');
  const lower = base.toLowerCase();

  if (!text) return text;

  if (/^(.+? war of independence(?: against .+)?), a key milestone in .+ path toward modern sovereignty$/i.test(base)) {
    const war = base.match(/^(.+? war of independence(?: against .+)?),/i)[1];
    return `The ${war} became the central struggle for ${possessive(title)} independence and future statehood.`;
  }
  if (/^proclamation of independence, a key milestone/i.test(base)) {
    return `The proclamation of independence made ${possessive(title)} claim to statehood explicit during a decisive political break.`;
  }
  if (/^declaration of independence from (.+), a key milestone/i.test(base)) {
    const from = base.match(/^declaration of independence from (.+), a key milestone/i)[1];
    return `The declaration of independence from ${from} asserted ${possessive(title)} separate statehood.`;
  }
  if (/^independence referendum, a key milestone/i.test(base)) {
    return `The independence referendum gave voters a direct role in ${possessive(title)} move toward sovereignty.`;
  }
  if (/^re-establishment of independence, a key milestone/i.test(base)) {
    return `The re-establishment of independence restored ${possessive(title)} sovereign status after foreign occupation or control.`;
  }
  if (/^regaining independence, a key milestone/i.test(base)) {
    return `Regaining independence restored ${possessive(title)} own statehood after foreign domination.`;
  }
  if (/^granted independence, a key milestone/i.test(base)) {
    return `${title} was granted independence, completing the formal transition to sovereign statehood.`;
  }
  if (/, a key milestone in .+ path toward modern sovereignty$/i.test(base)) {
    const event = base.replace(/, a key milestone in .+ path toward modern sovereignty$/i, '');
    return `${event} marked a key step in ${possessive(title)} path toward modern sovereignty.`;
  }

  if (/^(.+?) emerged as an important early state, kingdom or political formation in .+ history$/i.test(base)) {
    const label = base.match(/^(.+?) emerged as an important early state, kingdom or political formation/i)[1];
    if (/^federal treaty$/i.test(label)) {
      return `The Federal Treaty reorganized Switzerland's confederation and prepared the modern federal state.`;
    }
    if (/^federal state$/i.test(label)) {
      return `A federal state was established, creating the constitutional basis of modern Switzerland.`;
    }
    if (/mandate/i.test(label)) {
      return `${label} placed the territory under outside administration before modern independence.`;
    }
    return `${label} was an important early state or ruling power in the region, giving ${title} deep historical roots.`;
  }

  if (/^(.+?) independence act .* as a commonwealth realm/i.test(base)) {
    return `${title} became independent as a Commonwealth realm, keeping the monarch as head of state at first.`;
  }

  if (isSentence(text)) return ensurePeriod(text);

  if (/^current constitution$/i.test(base)) {
    return `The current constitution came into force, setting the basic framework for today's ${title}.`;
  }
  if (/^admitted to the un$/i.test(base)) {
    return `${title} was admitted to the United Nations, confirming broad international recognition.`;
  }
  if (/^joined (.+)$/i.test(base)) {
    const org = base.match(/^joined (.+)$/i)[1];
    return `${title} joined ${org}, tying the country more closely to that regional or international organisation.`;
  }
  if (/^joined the (.+)$/i.test(base)) {
    const org = base.match(/^joined the (.+)$/i)[1];
    return `${title} joined the ${org}, tying the country more closely to that regional or international organisation.`;
  }
  if (/^independence from (.+)$/i.test(base)) {
    const from = base.match(/^independence from (.+)$/i)[1];
    return `${title} became independent from ${from}, marking a key step in modern statehood.`;
  }
  if (/^independence of (.+) from (.+)$/i.test(base)) {
    const [, subject, from] = base.match(/^independence of (.+) from (.+)$/i);
    return `${subject} became independent from ${from}, reshaping the political map around ${title}.`;
  }
  if (/^independence declared from (.+)$/i.test(base)) {
    const from = base.match(/^independence declared from (.+)$/i)[1];
    return `${title} declared independence from ${from}, beginning the final move toward sovereignty.`;
  }
  if (/^independence declared$/i.test(base)) {
    return `${title} declared independence, a decisive step toward modern statehood.`;
  }
  if (/^independence recognis?ed$/i.test(base)) {
    return `${title}'s independence was internationally recognized, strengthening its sovereign status.`;
  }
  if (/^independence granted$/i.test(base) || /^granted$/i.test(base)) {
    return `${title} was granted independence, completing the formal transition to sovereign statehood.`;
  }
  if (/^independence$/i.test(base)) {
    return `${title} became independent, marking the start of modern sovereign statehood.`;
  }
  if (/^declaration of independence$/i.test(base)) {
    return `A declaration of independence was issued, making sovereignty the central political claim.`;
  }
  if (/^war of independence$/i.test(base) || /^start of war of independence$/i.test(base)) {
    return `The war of independence began, making sovereignty the central national struggle.`;
  }
  if (/^republic$/i.test(base)) {
    return `${title} became a republic, replacing the previous constitutional arrangement.`;
  }
  if (/^republic declared$/i.test(base) || /^republic proclaimed$/i.test(base) || /^republic established$/i.test(base)) {
    return `A republic was declared, changing ${possessive(title)} political system and state identity.`;
  }
  if (/^republic declaration$/i.test(base)) {
    return `The republic was declared, shifting ${title} toward a republican form of government.`;
  }
  if (/^(.+?) republic$/i.test(base) || /^republic of .+/i.test(base) || /people's republic|democratic republic|federal republic|first republic|second republic|third republic|fourth republic/i.test(base)) {
    return `${base} was proclaimed or established, marking a new republican phase in ${possessive(title)} history.`;
  }
  if (/^kingdom of (.+)$/i.test(base)) {
    return `The Kingdom of ${base.match(/^kingdom of (.+)$/i)[1]} emerged, giving the area a defined monarchical state structure.`;
  }
  if (/^(.+?) kingdom$/i.test(base) || /kingdom/i.test(base)) {
    return `${base} became a major monarchical phase in ${possessive(title)} political history.`;
  }
  if (/^part of (.+)$/i.test(base)) {
    const entity = base.match(/^part of (.+)$/i)[1];
    return `The territory became part of ${entity}, shaping its later political and regional identity.`;
  }
  if (/^annexed by (.+)$/i.test(base)) {
    const by = base.match(/^annexed by (.+)$/i)[1];
    return `The territory was annexed by ${by}, bringing it under outside rule.`;
  }
  if (/^absorbed into (.+)$/i.test(base)) {
    const into = base.match(/^absorbed into (.+)$/i)[1];
    return `${title} was absorbed into ${into}, changing its sovereignty and political status.`;
  }
  if (/^(.+?) established$/i.test(base) || /^establishment of (.+)$/i.test(base)) {
    return `${base.replace(/^establishment of /i, '')} was established, giving ${title} a new political framework.`;
  }
  if (/^(.+?) adopted$/i.test(base)) {
    return `${base} and became an important marker in ${possessive(title)} constitutional development.`;
  }
  if (/^sovereignty declared$/i.test(base)) {
    return `${title} declared sovereignty, a step toward full independence and international recognition.`;
  }
  if (/^sovereignty and constitution$/i.test(base)) {
    return `${title} asserted sovereignty and adopted constitutional rules for self-government.`;
  }
  if (/^restoration of independence$/i.test(base) || /^independence restored$/i.test(base) || /^independence reinstated$/i.test(base)) {
    return `${title} restored independence after a period of foreign rule, occupation or union.`;
  }
  if (/^independence day$/i.test(base)) {
    return `Independence Day commemorates the formal break that shaped modern ${title}.`;
  }
  if (/^ephemeral independence$/i.test(base)) {
    return `A short-lived independence period began, an early but unstable step in ${possessive(title)} statehood.`;
  }
  if (/^sovereignty recognis?ed/i.test(base)) {
    return `${title}'s sovereignty was recognized internationally, strengthening its place in the European state system.`;
  }
  if (/^civil war$/i.test(base) || /civil war$/i.test(base)) {
    return `${base} marked a violent internal conflict that shaped ${possessive(title)} modern politics.`;
  }
  if (/\bwar$/i.test(base)) {
    return `${base} became a major conflict in ${possessive(title)} modern political history.`;
  }
  if (/^(.+?) union$/i.test(base) || /^union with (.+)$/i.test(base) || /union/i.test(base)) {
    return `${base} tied ${title} into a larger political structure and changed its constitutional direction.`;
  }
  if (/^treaty of union$/i.test(base)) {
    return `The Treaty of Union set the legal basis for a new unified state.`;
  }
  if (/^soviet union$/i.test(base)) {
    return `${title} became part of the Soviet Union, placing it inside a larger socialist federation.`;
  }
  if (/^great union$/i.test(base)) {
    return `The Great Union brought major Romanian-inhabited regions together into the modern Romanian state.`;
  }
  if (/^federal treaty$/i.test(base)) {
    return `The Federal Treaty reorganized Switzerland's confederation and prepared the modern federal state.`;
  }
  if (/^federal state$/i.test(base)) {
    return `A federal state was established, creating the constitutional basis of modern Switzerland.`;
  }
  if (/^union dissolved$/i.test(base)) {
    return `The union dissolved, restoring separate statehood and changing the political map.`;
  }
  if (/^(duchy|empire|county|union|realm|emirate|sultanate|protectorate|colony|federation|mandate)$/i.test(base)) {
    return explainShortName(title, base);
  }
  if (base.length < 36 && !/\b(war|constitution|independence|republic|kingdom|union)\b/i.test(base)) {
    return explainShortName(title, base);
  }
  if (lower.includes('constitution')) {
    return ensurePeriod(`${base}, setting or updating the country's basic constitutional framework`);
  }
  if (lower.includes('independence')) {
    return ensurePeriod(`${base}, a key milestone in ${possessive(title)} path toward modern sovereignty`);
  }
  if (base.length < 50) {
    return ensurePeriod(`${base}, an important milestone in ${possessive(title)} political development`);
  }

  return ensurePeriod(base);
}

async function main() {
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  let changedRows = 0;
  let shortRowsAfter = 0;

  for (const [page, entry] of Object.entries(data)) {
    const title = entry.title || page.split('/').at(-2);
    for (const row of entry.rows || []) {
      const before = row.text;
      const after = polishText(title, before);
      if (after !== before) {
        row.text = after;
        changedRows += 1;
      }
      if (String(row.text || '').length < 45) shortRowsAfter += 1;
    }
  }

  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(dataPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  console.log(`Changed rows: ${changedRows}`);
  console.log(`Rows under 45 chars after polish: ${shortRowsAfter}`);
}

await main();
