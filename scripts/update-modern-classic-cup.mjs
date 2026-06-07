import fs from 'node:fs';

const file = 'content/categories/wellness/sauna/events/modern-classic-cup.html';
let html = fs.readFileSync(file, 'utf8');

function replaceJson(id, updater) {
  const re = new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`);
  const match = html.match(re);
  if (!match) throw new Error(`Missing ${id}`);
  const data = JSON.parse(match[1]);
  updater(data);
  html = html.replace(match[0], `<script type="application/json" id="${id}">${JSON.stringify(data)}</script>`);
}

const norway = {
  name: 'Norway',
  continent: 'europe',
  url: '/content/locations/europe/norway/',
  flag: '/content/locations/europe/norway/img/flag.svg'
};

replaceJson('event-year-data', (data) => {
  data.sources = [
    {
      label: 'Aufguss WM: Modern Classic Cup 2026',
      url: 'https://aufguss-wm.com/modern-classic-cup/'
    },
    {
      label: 'Farris Bad',
      url: 'https://farrisbad.no/'
    }
  ];
  data.lastUpdated = '20 May 2026';
  for (const edition of data.editions) {
    edition.countries = [norway];
    edition.format = 'Classic Aufguss competition: sauna, scent, music, towel technique and storytelling';
    edition.result = edition.year === 2026
      ? 'Modern Classic Cup is an international Classic Aufguss competition. Sauna masters perform choreographed heat rituals inside the sauna: they add water and scent to hot stones, move heat with towels, control music and atmosphere, and are judged on technique, timing, scent use, heat distribution and overall experience.'
      : 'Archive details are TBC.';
    edition.countdownText = 'Official Aufguss WM listings place the 2026 Modern Classic Cup final at Farris Bad in Larvik, Norway, 1-4 October 2026.';
    edition.questions = [
      {
        q: 'What is Modern Classic Cup?',
        a: 'A Classic Aufguss competition',
        detail: 'Competitors lead structured sauna rituals where scent, steam, towel movement, music and heat control are treated like a performance and judged as a craft.'
      },
      {
        q: 'What is Aufguss?',
        a: 'A hosted sauna ritual',
        detail: 'An Aufguss master pours scented water on hot stones, then uses towel movements to distribute heat and aroma through the room. In competition, the routine becomes a timed performance.'
      },
      {
        q: 'When is the event?',
        a: '1-4 October 2026',
        detail: 'The 2026 final is listed by Aufguss WM for Farris Bad in Larvik.'
      },
      {
        q: 'Where is it held?',
        a: 'Larvik, <a class="country" href="/content/locations/europe/norway/"><img src="/content/locations/europe/norway/img/flag.svg" alt="" width="20" height="14">Norway</a>',
        detail: 'Farris Bad is a spa hotel on the Larvik waterfront, which makes the event more resort-based than a trade fair or city sauna day.'
      },
      {
        q: 'What will visitors actually see?',
        a: 'Sauna masters competing in rounds',
        detail: 'Expect scheduled routines, heat and scent themes, towel choreography, judging, finalist sessions and a strong focus on the sensory details inside the sauna.'
      },
      {
        q: 'How is it different from Aufguss WM?',
        a: 'It focuses on the classic discipline',
        detail: 'Aufguss WM is the wider world-championship ecosystem. Modern Classic Cup is narrower: it highlights classic Aufguss craft rather than broad show formats.'
      },
      {
        q: 'What should I pack?',
        a: 'Swimwear, towel, sandals and water bottle',
        detail: 'Also check Farris Bad rules before arrival: spa access, textile policy, age limits and session booking can matter as much as the ticket itself.'
      },
      {
        q: 'Who is it best for?',
        a: 'Sauna fans, spa operators and curious wellness travellers',
        detail: 'It is especially useful if you want to understand why modern public sauna culture is becoming more hosted, theatrical and skill-based.'
      }
    ];
    edition.highlights = [
      {
        label: 'Core idea',
        title: 'Heat ritual as performance',
        detail: 'The event turns a sauna session into a judged routine: heat, aroma, music, timing and towel technique all matter.'
      },
      {
        label: 'Visitor value',
        title: 'You learn what good Aufguss feels like',
        detail: 'A strong routine is not just hotter. It is controlled, paced and atmospheric, with the sauna master guiding the room instead of simply adding steam.'
      },
      {
        label: 'Setting',
        title: 'Spa-resort format in Larvik',
        detail: 'Farris Bad gives the competition a destination-spa context, so visitors can combine competition sessions with bathing, cold water and recovery.'
      }
    ];
  }
});

replaceJson('event-part-data', (data) => {
  data.defaultPart = 'classic-aufguss';
  data.parts = [
    {
      id: 'classic-aufguss',
      label: 'Classic Aufguss',
      title: 'Classic Aufguss: heat, scent and towel craft',
      summary: 'This is the core of Modern Classic Cup. A sauna master leads a timed ritual by pouring scented water on hot stones and moving the heat with towels. The best sessions feel controlled rather than chaotic: the room gets warmer, but the rhythm, scent and story also build.',
      facts: [
        { label: 'Main discipline', value: 'Classic Aufguss' },
        { label: 'Judged on', value: 'Technique, heat distribution, scent, rhythm and atmosphere' },
        { label: 'Visitor experience', value: 'Seated inside the sauna during the routine' }
      ],
      blocks: [
        {
          label: 'What to watch',
          title: 'The towel work is the visible skill',
          detail: 'Good towel movement spreads heat evenly and precisely. Watch how the performer changes speed, height and direction instead of simply waving hard.'
        },
        {
          label: 'What to feel',
          title: 'Scent and heat should arrive in waves',
          detail: 'A strong Aufguss routine usually has a beginning, middle and finish: lighter aroma first, stronger heat later, and a clear closing moment.'
        }
      ]
    },
    {
      id: 'competition',
      label: 'Competition',
      title: 'Competition rounds and judging',
      summary: 'Competitors perform routines in scheduled rounds. Judges and audience experience the same heat, scent and timing, but judges score the technical and artistic control behind it.',
      facts: [
        { label: 'Format', value: 'Scheduled routines and finalist sessions' },
        { label: 'Audience role', value: 'Quiet, seated participation inside the sauna' },
        { label: 'Risk', value: 'Sessions can fill quickly because sauna capacity is limited' }
      ],
      blocks: [
        {
          label: 'Why capacity matters',
          title: 'The room is part of the event',
          detail: 'Unlike a stage show, the audience must fit inside the sauna. That makes planning and booking windows important.'
        },
        {
          label: 'Beginner note',
          title: 'Do not chase every round',
          detail: 'Heat exposure adds up. Pick the routines you care about, cool down properly and leave time between sessions.'
        }
      ]
    },
    {
      id: 'farris-bad',
      label: 'Farris Bad',
      title: 'Farris Bad and the Larvik spa setting',
      summary: 'Farris Bad gives the event a destination-spa setting rather than a simple competition hall. That matters because Aufguss is tied to the whole bathing cycle: heat, cool-down, rest, water and repeat.',
      facts: [
        { label: 'Venue', value: 'Farris Bad' },
        { label: 'City', value: 'Larvik' },
        { label: 'Country', value: '<a class="country" href="/content/locations/europe/norway/"><img src="/content/locations/europe/norway/img/flag.svg" alt="" width="20" height="14">Norway</a>' }
      ],
      blocks: [
        {
          label: 'Planning',
          title: 'Check spa access separately',
          detail: 'Competition access, hotel rooms, spa entry and individual sessions may not be the same product. Confirm the official booking terms before travel.'
        },
        {
          label: 'First-timer tip',
          title: 'Hydration and cooldown are part of the schedule',
          detail: 'The practical rhythm is sauna session, cool down, drink water, rest, then decide whether to enter another routine.'
        }
      ]
    }
  ];
});

html = html
  .replace('content="Modern Classic Cup sauna event view with dates, place, programme and visitor planning."', 'content="Modern Classic Cup overview: what Classic Aufguss is, how the competition works, and how to plan the 2026 Farris Bad event in Larvik."')
  .replace('International Aufguss competition focused on a modern classic format.', 'Modern Classic Cup is a Classic Aufguss competition: sauna masters turn heat, scent, steam, towel technique and music into a judged sauna ritual.')
  .replace('Modern Classic Cup connects sauna ritual with hospitality, design, recovery, cold water and community bathing.', 'Modern Classic Cup is useful because it explains modern sauna culture from the inside: not just sitting in heat, but how a skilled sauna master pages scent, steam, temperature and atmosphere.')
  .replace('Expect a mix of talks, sauna sessions, demonstrations, networking or local bathing routes depending on the event.', 'Expect scheduled Aufguss routines, judging, finalist sessions and spa access planning. The important thing is capacity: each performance happens inside an actual sauna room.')
  .replace('Where official 2026 data is not yet published, this page keeps the event useful but labels details as TBC.', 'Official listings place the 2026 final at Farris Bad, 1-4 October. Check the organizer before booking because session access and spa entry can be separate.')
  .replace('Core visitor value: sauna sessions, local etiquette and bathing culture.', 'Core visitor value: seeing how scent, heat and towel technique become a structured sauna performance.')
  .replace('Best checked close to event: tickets, towels, nudity/textile rules and public transport.', 'Best checked close to event: session booking, spa access, textile rules, age limits and cooldown areas.');

fs.writeFileSync(file, html, 'utf8');
console.log('updated modern-classic-cup');
