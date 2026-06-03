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

function cleanLabel(label) {
  return String(label || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+\./g, '.')
    .replace(/[.!?]$/, '')
    .trim();
}

function repairEarlyState(title, label) {
  const event = cleanLabel(label);
  const lower = event.toLowerCase();

  if (!event) return '';
  if (/^declaration$/i.test(event)) return `A declaration asserted ${possessive(title)} claim to sovereignty.`;
  if (/^official declaration$/i.test(event)) return `An official declaration asserted ${possessive(title)} claim to sovereignty.`;
  if (/^recognition$|^recognized$|^recognised$/i.test(event)) return `${possessive(title)} sovereignty gained formal recognition.`;
  if (/^confederation$/i.test(event)) return `Confederation created a new political framework for ${title}.`;
  if (/^federation$/i.test(event) || /^federation of /i.test(event)) return `${event} created or reshaped ${possessive(title)} federal political structure.`;
  if (/^dominion$/i.test(event)) return `${title} became a dominion, expanding self-government within the British imperial system.`;
  if (/^admitted to the united nations$|^admission to the un$|^united nations membership$|^united nations full membership$/i.test(event)) {
    return `${title} joined the United Nations, confirming broad international recognition.`;
  }
  if (/^joined the un$|^joined united nations$/i.test(event)) {
    return `${title} joined the United Nations, confirming broad international recognition.`;
  }
  if (/coup d'?etat|coup d'etat|coup d’état/i.test(event)) return `The ${event} changed ${possessive(title)} political direction.`;
  if (/uprising|revolution/i.test(event)) return `The ${event} reshaped ${possessive(title)} political life.`;
  if (/dynasty|emirate|sultanate|caliphate|regency|empire|kingdom|principality|duchy|khanate|tsardom|commonwealth|protectorate|colony|mandate|state|republic|realm/i.test(event)) {
    return `${event} became an important phase in ${possessive(title)} political history.`;
  }
  if (/treaty|charter|pact|accord|agreement/i.test(event)) return `${event} changed ${possessive(title)} legal or political status.`;
  if (/partition|annex|occupation|cession|ceded|conquest|invasion|withdrawal/i.test(event)) return `${event} changed control of the territory and shaped ${possessive(title)} later statehood.`;
  if (/union/i.test(event)) return `${event} tied ${title} into a larger political structure.`;
  if (/constitution|constitutional/i.test(event)) return `${event} set or updated ${possessive(title)} constitutional framework.`;
  if (/independence/i.test(event)) return `${event} marked a step in ${possessive(title)} path toward sovereignty.`;
  if (/sovereign|sovereignty/i.test(event)) return `${event} marked a step in ${possessive(title)} sovereign statehood.`;

  return `${event} marked an important stage in ${possessive(title)} political history.`;
}

function repairConstitution(title, label) {
  const event = cleanLabel(label);
  if (/^current constitution$/i.test(event)) {
    return `The current constitution came into force, setting the basic framework for today's ${title}.`;
  }
  if (/^constitution$/i.test(event)) return `A constitution set out ${possessive(title)} basic framework of government.`;
  return `${event} set or updated ${possessive(title)} constitutional framework.`;
}

function repairRepublic(title, label) {
  const event = cleanLabel(label);
  if (/^became a republic$/i.test(event) || /^republic$/i.test(event)) {
    return `${title} became a republic, replacing the previous constitutional arrangement.`;
  }
  if (/people's republic|democratic republic|federal republic|soviet socialist republic|socialist republic/i.test(event)) {
    return `${event} became a new state form in ${possessive(title)} modern political order.`;
  }
  return `${event} became a republican form of government in ${title}.`;
}

function repairKingdom(title, label) {
  const event = cleanLabel(label);
  if (/^kingdom$/i.test(event)) return `A kingdom was proclaimed, placing monarchy at the centre of ${possessive(title)} state authority.`;
  return `${event} marked a monarchical phase in ${possessive(title)} political history.`;
}

function repairWar(title, label) {
  const event = cleanLabel(label);
  if (/^victory in (.+)$/i.test(event)) {
    return `${event} marked a decisive outcome in ${possessive(title)} modern political history.`;
  }
  return `${event} was a major conflict in ${possessive(title)} modern political history.`;
}

function repairLegacyGeneric(title, label) {
  const event = cleanLabel(label);
  const lower = event.toLowerCase();

  if (!event) return '';
  if (/coup d'?etat|coup d'etat|coup d’état/i.test(event)) return `The ${event} brought a change of political leadership.`;
  if (/revolution|uprising/i.test(event)) return `The ${event} changed the country's political direction.`;
  if (/dynasty|empire|caliphate|sultanate|khanate|emirate|kingdom|tsardom|duchy|principality|regency|pashalik|vilayet|banate|despotate/i.test(event)) {
    return `${event} ruled or strongly influenced the territory before the modern state.`;
  }
  if (/protectorate|colony|mandate|trusteeship|rule|occupation|administration|condominium/i.test(event)) {
    return `${event} placed the territory under outside administration.`;
  }
  if (/republic|people's republic|democratic republic|federal republic|soviet republic|socialist republic|state form/i.test(event)) {
    return `${event} introduced a new form of state rule.`;
  }
  if (/assr|ssr/i.test(event)) return `${event} placed the territory inside the Soviet administrative system.`;
  if (/treaty|agreement|accord|convention|charter|paréage|parage/i.test(event)) {
    return `${event} set new terms for sovereignty or administration.`;
  }
  if (/union|federation|confederation|associated/i.test(event)) {
    return `${event} tied the territory into a wider political structure.`;
  }
  if (/recognition|recognised|recognized/i.test(event)) return `${event} strengthened international recognition.`;
  if (/self-government|self-governance|responsible government|autonomy/i.test(event)) return `${event} expanded local self-rule.`;
  if (/liberation/i.test(event)) return `${event} restored control after occupation.`;
  if (/battle|war|conflict/i.test(event)) return `${event} became a defining conflict in ${possessive(title)} history.`;
  if (/settlement|first mentioned|early/i.test(event)) return `${event} anchors the start of the documented local timeline.`;
  if (/proclamation|declared/i.test(event)) return `${event} announced a new political claim or state form.`;
  if (/constitution|constitutional/i.test(event)) return `${event} set constitutional rules for government.`;
  if (/independence|sovereignty/i.test(event)) return `${event} advanced the country's sovereignty.`;
  if (/control|captured|annex|partition|cession|acquisition|withdrawn|consolidated/i.test(lower)) {
    return `${event} changed control of the territory.`;
  }

  return `${event} appears in ${possessive(title)} historical record.`;
}

function repairMilestone(title, label) {
  const event = cleanLabel(label);
  const lower = event.toLowerCase();

  if (!event) return '';
  if (/^sumer$/i.test(event)) return `Sumer developed in southern Mesopotamia, giving Iraq one of the world's earliest urban civilizations.`;
  if (/^assyria$/i.test(event)) return `Assyria grew into a major Mesopotamian power centred on cities in northern Iraq.`;
  if (/^babylonia$/i.test(event)) return `Babylonia made central and southern Mesopotamia one of the ancient world's great political centres.`;
  if (/^mamluk iraq$/i.test(event)) return `Mamluk governors ruled Iraq under Ottoman authority before direct Ottoman control returned.`;
  if (/^numidia$/i.test(event)) return `Numidia became an early Berber kingdom in the region's ancient history.`;
  if (/^land of punt$/i.test(event)) return `Ancient Egyptian records linked the Land of Punt with trade around the Horn of Africa.`;
  if (/^macrobia$|^barbaria$/i.test(event)) return `${event} appears in ancient accounts of the Somali coast and the wider Horn of Africa.`;
  if (/^settlement$/i.test(event)) return `Settlement began the permanent human story of ${title}.`;
  if (/^first mentioned$/i.test(event)) return `${title} first appeared in written records, anchoring the start of its documented history.`;
  if (/^recognized by spain$|^recognised by spain$/i.test(event)) return `Recognition by Spain strengthened ${possessive(title)} international status.`;
  if (/^international recognition$/i.test(event)) return `International recognition strengthened ${possessive(title)} sovereign status.`;
  if (/joined the united nations|joined the un|admission to the un|united nations/i.test(lower)) {
    return `${title} joined the United Nations, confirming broad international recognition.`;
  }
  if (/^balfour declaration$/i.test(event)) return `The Balfour Declaration expanded self-government within the British imperial system.`;
  if (/^statute of westminster/i.test(event)) return `The Statute of Westminster expanded legislative independence within the Commonwealth.`;
  if (/^patriation$/i.test(event)) return `Patriation brought the constitution fully under ${possessive(title)} own legal authority.`;
  if (/^australia acts$/i.test(event)) return `The Australia Acts ended the remaining British legislative role in Australian law.`;
  if (/coup d'?etat|coup d'etat|coup d’état/i.test(event)) return `The ${event} changed ${possessive(title)} political leadership.`;
  if (/^government junta$/i.test(event)) return `A government junta took power, changing ${possessive(title)} political direction.`;
  if (/^monarchy abolished$/i.test(event)) return `The monarchy was abolished, changing ${possessive(title)} form of government.`;
  if (/^sultanate abolished$/i.test(event)) return `The sultanate was abolished, clearing the way for a republican state.`;
  if (/^unification$/i.test(event)) return `Unification brought separate territories or communities into a single state framework.`;
  if (/^unification of (.+)$/i.test(event)) return `${event} brought separate territories into one political framework.`;
  if (/^germany reunified$/i.test(event)) return `Germany reunified, restoring a single German state after Cold War division.`;
  if (/^creation of yugoslavia$/i.test(event)) return `The creation of Yugoslavia tied ${title} into a new South Slavic state.`;
  if (/^dissolution$/i.test(event)) return `Dissolution ended the previous political arrangement and changed ${possessive(title)} status.`;
  if (/^restored$/i.test(event)) return `${title} restored its statehood after a period of outside rule or union.`;
  if (/^self-government$|^self-governance$|^responsible government$/i.test(event)) return `${title} gained wider self-government.`;
  if (/^autonomy$|^autonomy granted$/i.test(event)) return `${title} gained a degree of political autonomy.`;
  if (/^sovereign state$/i.test(event)) return `${title} became a sovereign state.`;
  if (/^declared and recognis?ed$/i.test(event)) return `${title} declared independence and gained recognition.`;
  if (/^declared from (.+)$/i.test(event)) return `${title} declared independence from ${event.match(/^declared from (.+)$/i)[1]}.`;
  if (/^proclamation$/i.test(event)) return `A proclamation asserted ${possessive(title)} claim to statehood.`;
  if (/^proclamation of (.+)$/i.test(event)) return `${event} formally announced a new political order.`;
  if (/^provisional government$/i.test(event) || /^1st provisional government$/i.test(event)) return `A provisional government was formed during the transition to state rule.`;
  if (/^trusteeship$|^un trusteeship$/i.test(event)) return `United Nations trusteeship shaped the transition toward self-government.`;
  if (/^administered by untaet$/i.test(event)) return `UNTAET administered the territory during the transition to independence.`;
  if (/^occupied by (.+)$/i.test(event)) return `${event} placed the territory under outside control.`;
  if (/^colonisation by (.+)$/i.test(event)) return `${event} brought the territory under colonial rule.`;
  if (/^discovery by portuguese explorers$/i.test(event)) return `Portuguese explorers recorded the islands for European navigation.`;
  if (/^territory under (.+)$/i.test(event)) return `${event} placed the territory under a larger colonial administration.`;
  if (/^overseas territory$/i.test(event)) return `${title} became an overseas territory within a larger imperial system.`;
  if (/^end of (.+)$/i.test(event)) return `${event} changed ${possessive(title)} legal or political status.`;
  if (/^liberation of (.+)$/i.test(event)) return `${event} restored control after occupation.`;
  if (/^battle of (.+)$/i.test(event)) return `${event} became a defining conflict in ${possessive(title)} political story.`;
  if (/^conference of (.+)$/i.test(event)) return `${event} helped define ${possessive(title)} political status.`;
  if (/^papal recognition$/i.test(event)) return `Papal recognition strengthened ${possessive(title)} medieval legitimacy.`;
  if (/^golden bull/i.test(event)) return `${event} limited royal power and became a landmark constitutional document.`;
  if (/^laws in wales acts$/i.test(event)) return `The Laws in Wales Acts integrated Wales into the English legal system.`;
  if (/^redonda$/i.test(event)) return `Redonda became part of the island group associated with ${title}.`;
  if (/^achieved$/i.test(event)) return `${title} achieved the political status recorded for this period.`;
  if (/^consolidated$/i.test(event)) return `${title} consolidated its post-independence political order.`;

  if (/dynasty|empire|emirate|sultanate|caliphate|khanate|principality|duchy|kingdom|state|republic|commonwealth|protectorate|colony|mandate|assr|ssr|period|era|rule|regency|pashalik|vilayet|banate|despotate|civilization|civilisation/i.test(event)) {
    return `${event} shaped the territory's political order before the modern state.`;
  }
  if (/treaty|charter|convention|agreement|accord|paréage|parage/i.test(event)) {
    return `${event} changed ${possessive(title)} legal or political status.`;
  }
  if (/union|federation|confederation|associated/i.test(event)) {
    return `${event} tied ${title} into a wider political structure.`;
  }
  if (/recognition|recognised|recognized/i.test(event)) return `${event} strengthened ${possessive(title)} international status.`;
  if (/independence|sovereignty/i.test(event)) return `${event} advanced ${possessive(title)} path toward sovereignty.`;

  return `${event} shaped ${possessive(title)} political development.`;
}

function repairText(title, rawText) {
  let text = ensurePeriod(rawText)
    .replace(/\s+/g, ' ')
    .replace(/\.\s*,/g, ',')
    .replace(/,\s*\./g, '.')
    .replace(/\s+\./g, '.')
    .trim();

  text = text.replace(/(.+?)\s*,\s*(setting or updating the country's basic constitutional framework)(?:,\s*\2)+\./i, (_match, label) => {
    return repairConstitution(title, label);
  });

  text = text.replace(/(.+?)\s*,\s*setting or updating the country's basic constitutional framework\./i, (_match, label) => {
    return repairConstitution(title, label);
  });

  text = text.replace(/^(.+?) was an important early state or ruling power in the region, giving .+? deep historical roots\.$/i, (_match, label) => {
    return repairEarlyState(title, label);
  });

  text = text.replace(/^(.+?) was proclaimed or established, marking a new republican phase in .+? history\.$/i, (_match, label) => {
    return repairRepublic(title, label);
  });

  text = text.replace(/^(.+?) became a major monarchical phase in .+? political history\.$/i, (_match, label) => {
    return repairKingdom(title, label);
  });

  text = text.replace(/^(.+?) became a major conflict in .+? modern political history\.$/i, (_match, label) => {
    return repairWar(title, label);
  });

  text = text.replace(/^(.+?) tied .+? into a larger political structure and changed its constitutional direction\.$/i, (_match, label) => {
    const event = cleanLabel(label);
    if (/^union dissolved$/i.test(event)) return `The union dissolved, restoring separate statehood and changing the political map.`;
    return `${event} tied ${title} into a larger political structure.`;
  });

  text = text.replace(/^(.+?) was established, giving .+? a new political framework\.$/i, (_match, label) => {
    const event = cleanLabel(label).replace(/\s+established$/i, '');
    return `${event} was established, giving ${title} a new political framework.`;
  });
  text = text.replace(/^(.+?) marked an important stage in .+? political history\.$/i, (_match, label) => repairMilestone(title, label));
  text = text.replace(/^(.+?) became an important phase in .+? political history\.$/i, (_match, label) => repairMilestone(title, label));
  text = text.replace(/^(.+?) marked a republican phase in .+? political history\.$/i, (_match, label) => repairRepublic(title, label));
  text = text.replace(/^(.+?) shaped the territory's political order before the modern state\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) shaped .+? political development\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) changed .+? legal or political status\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) became a republican form of government in .+?\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) became a new state form in .+? modern political order\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) marked a monarchical phase in .+? political history\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?), an important milestone in .+? political development\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) belongs to the country's historical timeline\.$/i, (_match, label) => repairLegacyGeneric(title, label));
  text = text.replace(/^(.+?) changed control of the territory and shaped .+? later statehood\.$/i, (_match, label) => `${cleanLabel(label)} changed control of the territory.`);
  text = text.replace(/^(.+?) tied .+? into a larger political structure\.$/i, (_match, label) => `${cleanLabel(label)} tied the territory into a wider political structure.`);
  text = text.replace(/^The The (.+)$/i, (_match, rest) => `The ${rest}`);
  text = text.replace(/\bwas was established\b/i, 'was established');
  text = text.replace(/Francewith/g, 'France with');

  text = text.replace(/^(.+?)\. became a major monarchical phase in .+? political history\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/^(.+?)\. marked a key step in .+? path toward modern sovereignty\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/^(.+?)\. was proclaimed or established, marking a new republican phase in .+? history\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/^(.+?)\. became a major conflict in .+? modern political history\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/^(.+? made .+?) became a major conflict in .+? modern political history\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/^(.+? became independent) marked an important stage in .+? political history\.$/i, (_match, sentence) => ensurePeriod(sentence));
  text = text.replace(/\.\s*,\s*setting or updating the country's basic constitutional framework\./i, '.');
  text = text.replace(/\.\s+marked a key step in .+? path toward modern sovereignty\./i, '.');
  text = text.replace(/\.\s+became a major monarchical phase in .+? political history\./i, '.');
  text = text.replace(/\.\s+was proclaimed or established, marking a new republican phase in .+? history\./i, '.');
  text = text.replace(/\bwas established was established\b/i, 'was established');
  text = text.replace(/\btied .+? into a larger political structure and changed its constitutional direction\.$/i, `tied ${title} into a larger political structure.`);

  return ensurePeriod(text);
}

async function main() {
  const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  let pages = 0;
  let rows = 0;
  let changedRows = 0;

  for (const [page, entry] of Object.entries(data)) {
    pages += 1;
    const title = entry.title || page.split('/').at(-2);
    for (const row of entry.rows || []) {
      rows += 1;
      const before = row.text;
      const after = repairText(title, before);
      if (after !== before) {
        row.text = after;
        changedRows += 1;
      }
    }
  }

  const sorted = Object.fromEntries(Object.entries(data).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(dataPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  console.log(`Country pages checked: ${pages}`);
  console.log(`History rows checked: ${rows}`);
  console.log(`History rows changed: ${changedRows}`);
}

await main();
