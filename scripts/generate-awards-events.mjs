import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const categoryDir = path.join(root, 'content/categories/culture');
const topicPath = path.join(categoryDir, 'awards.html');
const eventsDir = path.join(categoryDir, 'awards/events');
const imgDir = path.join(eventsDir, 'img');
const lastUpdated = '8 June 2026';
const importedHistory = readJsonIfExists(path.join(root, 'data/culture/awards/events/awards-history.json'));

const countries = {
  usa: country('United States', '/content/locations/north-america/usa/index.html', '/content/locations/north-america/usa/img/flag.svg'),
  uk: country('United Kingdom', '/content/locations/europe/united-kingdom/index.html', '/content/locations/europe/united-kingdom/img/flag.svg'),
  france: country('France', '/content/locations/europe/france/index.html', '/content/locations/europe/france/img/flag.svg')
};

const awards = [
  {
    slug: 'oscars',
    name: 'Oscars',
    formalName: 'Academy Awards',
    pathLabel: 'Culture / Awards',
    nextDate: '14 Mar 2027',
    nextDateIso: '2027-03-14',
    nextEdition: '99th Academy Awards',
    venue: 'Dolby Theatre',
    city: 'Los Angeles',
    cityUrl: '/content/locations/north-america/usa/los-angeles.html',
    country: countries.usa,
    intro: 'A compact Oscars archive for comparing winners by decade, year and award category. Start with the main prizes, then add more categories when you need detail.',
    summary: 'Academy Awards winners, history and statistics',
    format: 'Film awards ceremony with competitive categories, nominations, red carpet coverage and industry voting.',
    history: 'First presented in 1929, the Academy Awards became the global reference point for English-language film awards and later a year-round awards-season anchor.',
    topTitle: 'Oscar records',
    topNote: 'Most wins, nominations and headline winner lists from JSON.',
    factsTitle: 'Quick Oscar facts',
    stayTitle: 'Stay for Oscars week',
    tripTitle: 'Build the Los Angeles awards week',
    tripCards: [
      ['Best base', 'Hollywood / West Hollywood', 'Closest to Dolby Theatre, screenings, restaurants and awards-week nightlife.'],
      ['Airport', 'LAX or Burbank', 'LAX has the widest routes; Burbank can be easier for Hollywood-area stays.'],
      ['Reality check', 'Public access is limited', 'Most visitors plan around screenings, museums, parties and Los Angeles film culture.']
    ],
    areas: ['Hollywood', 'West Hollywood', 'Beverly Hills', 'Downtown Los Angeles', 'Santa Monica'],
    sources: ['Academy official ceremony information', 'OneSliders Oscars archive JSON'],
    oscarsArchive: true
  },
  award('golden-globe-awards', 'Golden Globe Awards', 'Golden Globes', 'Los Angeles', countries.usa, {
    firstYear: 1944,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'A fast awards-season signal for film and television, followed for nominations, winners, speeches and red-carpet momentum.',
    summary: 'Film and television awards-season ceremony',
    history: 'The Golden Globes are known for combining film and television prizes in one high-visibility awards night.',
    format: 'Film and television awards ceremony with nominated categories, red carpet coverage and live results.',
    areas: ['Beverly Hills', 'West Hollywood', 'Hollywood', 'Century City', 'Santa Monica']
  }),
  award('bafta-film-awards', 'BAFTA Film Awards', 'British Academy Film Awards', 'London', countries.uk, {
    firstYear: 1949,
    nextDate: '2027 date TBC',
    venue: 'Venue TBC',
    intro: 'The BAFTA Film Awards are Britain\'s major film awards, watched closely for craft categories, acting races and awards-season momentum before the Oscars.',
    summary: 'British film awards and industry ceremony',
    history: 'BAFTA\'s film awards grew into one of the most important European stops in the international film awards season.',
    format: 'Film awards ceremony with British and international nominees across performance, craft and best film categories.',
    areas: ['South Bank', 'Covent Garden', 'Soho', 'Mayfair', 'Marylebone']
  }),
  award('emmy-awards', 'Emmy Awards', 'Primetime Emmy Awards', 'Los Angeles', countries.usa, {
    firstYear: 1949,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'The Emmy Awards track television\'s biggest performers, shows, limited series and craft winners across a long eligibility season.',
    summary: 'Television awards, nominees and winners',
    history: 'The Emmys became the main American television awards family, with the Primetime Emmys as the most visible entertainment ceremony.',
    format: 'Television awards ceremony covering drama, comedy, limited series, acting, directing, writing and craft categories.',
    areas: ['Downtown Los Angeles', 'Hollywood', 'West Hollywood', 'Burbank', 'Pasadena']
  }),
  award('tony-awards', 'Tony Awards', 'Antoinette Perry Awards', 'New York City', countries.usa, {
    firstYear: 1947,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'The Tony Awards are Broadway\'s headline prize night, useful for tracking musicals, plays, revivals, performances and the shows likely to sell fast.',
    summary: 'Broadway theatre awards ceremony',
    history: 'Named for Antoinette Perry, the Tonys became the main annual marker for Broadway\'s commercial and artistic season.',
    format: 'Theatre awards ceremony for Broadway musicals, plays, revivals, acting, directing, design and score categories.',
    areas: ['Times Square', 'Theater District', 'Hell\'s Kitchen', 'Midtown', 'Upper West Side']
  }),
  award('cesar-awards', 'Cesar Awards', 'Cesars', 'Paris', countries.france, {
    firstYear: 1976,
    nextDate: '2027 date TBC',
    venue: 'Venue TBC',
    intro: 'The Cesar Awards are France\'s headline film awards, followed for French cinema, international recognition and Paris awards-night context.',
    summary: 'French film awards and cinema ceremony',
    history: 'The Cesars are France\'s national film awards and a central annual moment for the French cinema industry.',
    format: 'Film awards ceremony for French and international cinema categories, including acting, directing, screenplay and craft prizes.',
    areas: ['Champs-Elysees', 'Opera', 'Saint-Germain', 'Le Marais', 'Montparnasse']
  }),
  award('grammy-awards', 'Grammy Awards', 'Gramophone Awards', 'Los Angeles', countries.usa, {
    firstYear: 1959,
    nextDate: 'February 2027',
    venue: 'Venue TBC',
    intro: 'The Grammy Awards are music\'s largest televised prize night, followed for album, record, song, artist categories and live performances.',
    summary: 'Music awards, nominees and performances',
    history: 'The Grammys became the central American recording-industry awards, spanning pop, classical, jazz, global, country, rap and many specialist fields.',
    format: 'Music awards ceremony with nominations, live performances, genre fields and major general-field prizes.',
    areas: ['Downtown Los Angeles', 'Hollywood', 'West Hollywood', 'Koreatown', 'Santa Monica']
  }),
  award('brit-awards', 'Brit Awards', 'BRITs', 'London', countries.uk, {
    firstYear: 1977,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'The Brit Awards are the UK music industry\'s main pop-awards night, followed for performances, chart momentum and headline British winners.',
    summary: 'UK music awards and performances',
    history: 'The BRITs grew from a British recording-industry awards event into a major televised music and performance night.',
    format: 'Music awards ceremony with British and international categories, performances, red carpet and live winner updates.',
    areas: ['Greenwich', 'Canary Wharf', 'South Bank', 'Shoreditch', 'Soho']
  }),
  award('mtv-video-music-awards', 'MTV Video Music Awards', 'VMAs', 'Los Angeles', countries.usa, {
    firstYear: 1984,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'The MTV Video Music Awards are built around pop spectacle, performances, video categories and moments that travel fast online.',
    summary: 'Music-video awards and pop performances',
    history: 'The VMAs became a pop-culture awards night where performances and televised moments often matter as much as trophies.',
    format: 'Music-video awards ceremony with fan-facing categories, live performances, red carpet and pop-culture moments.',
    areas: ['Hollywood', 'Downtown Los Angeles', 'West Hollywood', 'Beverly Hills', 'Santa Monica']
  }),
  award('bet-awards', 'BET Awards', 'BET Awards', 'Los Angeles', countries.usa, {
    firstYear: 2001,
    nextDate: '2027 watchlist',
    venue: 'Venue TBC',
    intro: 'The BET Awards celebrate Black excellence across music, film, television, sports and culture, with performances as a central draw.',
    summary: 'Culture, music and entertainment awards',
    history: 'The BET Awards became a major annual culture event for Black entertainment, performance, achievement and tribute moments.',
    format: 'Entertainment awards ceremony with music performances, culture categories, tributes and live winner updates.',
    areas: ['Downtown Los Angeles', 'Hollywood', 'West Hollywood', 'Inglewood', 'Beverly Hills']
  })
];

const awardDetails = {
  'golden-globe-awards': {
    historyTimeline: [
      ['1944', 'First Golden Globes presentation, created by Hollywood foreign correspondents for film achievement.'],
      ['1945', 'The Beverly Hills Hotel hosted the first formal Golden Globes banquet.'],
      ['1956', 'Television categories were added, turning the Globes into a film-and-TV awards night.']
    ],
    recentWinners: [
      ['2025 motion picture drama', 'The Brutalist'],
      ['2025 motion picture musical/comedy', 'Emilia Perez'],
      ['2025 TV drama', 'Shogun'],
      ['2025 TV musical/comedy', 'Hacks']
    ],
    records: [
      ['Most acting nominations', 'Meryl Streep has the Golden Globes record for acting nominations and eight wins listed on her official Golden Globes profile.'],
      ['Eight-win club', 'Guinness lists Barbra Streisand, Meryl Streep and Tom Hanks among individual eight-time Golden Globe winners.'],
      ['Rare sweep', 'One Flew Over the Cuckoo\'s Nest is famous for winning the five major film categories.']
    ],
    funFacts: [
      ['Film plus TV', 'The Globes are useful because they put film, drama TV, comedy TV and limited series into one awards-season signal.'],
      ['Ceremony texture', 'The show is watched as much for speeches and table-room dynamics as for the trophy list.'],
      ['Awards-season clue', 'Golden Globe winners do not predict the Oscars perfectly, but nominations often show where campaign heat is moving.']
    ],
    sourceLinks: [
      ['Golden Globes history', 'https://goldenglobes.com/history-golden-globes/'],
      ['Meryl Streep Golden Globes profile', 'https://goldenglobes.com/person/meryl-streep/'],
      ['Guinness Golden Globe record', 'https://www.guinnessworldrecords.com/world-records/102577-most-golden-globe-awards']
    ],
    topNote: 'Verified Golden Globes history and record notes, with current winner context separated from travel planning.'
  },
  'bafta-film-awards': {
    archiveCategories: ['Best Film', 'Director', 'Leading Actor', 'Leading Actress'],
    archiveRows: baftaFilmArchiveRows(),
    historyTimeline: [
      ['1947', 'The British Film Academy was founded, with David Lean as its first chair.'],
      ['1949', 'The first film awards ceremony was held at Odeon Leicester Square.'],
      ['1958', 'The film academy merged with the Guild of Television Producers and Directors, forming BAFTA.']
    ],
    recentWinners: [
      ['2026 Best Film', 'One Battle After Another'],
      ['2026 Director', 'Paul Thomas Anderson, One Battle After Another'],
      ['2026 Leading Actor', 'Robert Aramayo, I Swear'],
      ['2026 Leading Actress', 'Jessie Buckley, Hamnet']
    ],
    records: [
      ['First ceremony', 'BAFTA states that it has honoured British and international film since its first awards ceremony in 1949.'],
      ['Large membership', 'BAFTA describes its membership as having grown from just over 70 in 1947 to more than 12,000.'],
      ['Film focus', 'Best Film and Outstanding British Film make BAFTA especially useful for comparing British and international awards momentum.']
    ],
    funFacts: [
      ['Oscar-season bridge', 'BAFTA lands late enough in the season to show which films have crossed from critic momentum into industry support.'],
      ['British lens', 'Outstanding British Film gives the page a different read than the Oscars or Golden Globes.'],
      ['Craft value', 'BAFTA craft categories are often where editors, cinematographers, designers and sound teams become visible.']
    ],
    sourceLinks: [
      ['BAFTA 2026 winners', 'https://www.bafta.org/media-centre/press-releases/winners-announced-2026-film-awards/'],
      ['BAFTA heritage', 'https://www.bafta.org/about/our-heritage/'],
      ['Britannica BAFTA history', 'https://www.britannica.com/art/BAFTA']
    ],
    topNote: 'Verified BAFTA timeline, current winner context and British-film records.'
  },
  'emmy-awards': {
    historyTimeline: [
      ['1949', 'The first Emmy Awards were presented in Los Angeles for local television achievement.'],
      ['1950s', 'The awards expanded as American television became a national medium.'],
      ['1970s+', 'Primetime, daytime, news, sports and technical Emmy families made the Emmy system a broad TV archive.']
    ],
    recentWinners: [
      ['2025 Drama Series', 'The Pitt'],
      ['2025 Comedy Series', 'The Studio'],
      ['2025 Limited or Anthology Series', 'Adolescence'],
      ['2025 Lead Actor Drama', 'Noah Wyle, The Pitt']
    ],
    records: [
      ['Most awarded TV program', 'Saturday Night Live is widely tracked as the most Emmy-awarded television program.'],
      ['Official winners archive', 'The Television Academy keeps the searchable nominees-and-winners archive by year and category.'],
      ['Eligibility rhythm', 'The 77th Emmy Awards covered the 2024-2025 television season.']
    ],
    funFacts: [
      ['Not one show', 'Primetime ceremony night is only the visible tip; Creative Arts categories hold many production and craft wins.'],
      ['TV taxonomy', 'Drama, comedy, limited series and TV movie categories make the Emmys more structurally complex than film-only awards.'],
      ['Streaming era read', 'The Emmys are one of the fastest ways to see which platforms are turning attention into industry votes.']
    ],
    sourceLinks: [
      ['Television Academy 2025 winners', 'https://www.televisionacademy.com/awards/nominees-winners/2025'],
      ['Television Academy 77th winners announcement', 'https://www.televisionacademy.com/features/news/awards-news/77th-emmy-awards-release'],
      ['NBC SNL Emmy record note', 'https://www.nbc.com/nbc-insider/how-many-emmys-has-saturday-night-live-won']
    ],
    topNote: 'Verified Television Academy winner archive plus record context for the Emmy system.'
  },
  'tony-awards': {
    historyTimeline: [
      ['1947', 'The first Tony Awards were held at the Waldorf Astoria in New York.'],
      ['Named for', 'The awards honour Antoinette Perry, an actress, director, producer and American Theatre Wing co-founder.'],
      ['Broadway scope', 'Eligibility centers on Broadway productions rather than all theatre in the United States.']
    ],
    recentWinners: [
      ['2025 Best Musical', 'Maybe Happy Ending'],
      ['2025 Best Play', 'Purpose'],
      ['2025 Revival of a Musical', 'Sunset Blvd.'],
      ['2025 Lead Actor Musical', 'Darren Criss, Maybe Happy Ending']
    ],
    records: [
      ['Most Tonys by a musical', 'Guinness lists The Producers as the musical with the most Tony wins: 12 awards in 2001.'],
      ['Youngest winner', 'Britannica notes Frankie Michaels was 11 when he won in 1966.'],
      ['Composer record', 'Stephen Sondheim is a central Tony record-holder for original score and composer/lyricist wins.']
    ],
    funFacts: [
      ['Commercial effect', 'A Tony win can move Broadway demand immediately, especially for new musicals.'],
      ['Live-performance page', 'The Tonys are both an awards show and a sampler of the Broadway season.'],
      ['One-city event', 'Unlike many global awards, the Tony Awards are tightly bound to New York and Broadway eligibility.']
    ],
    sourceLinks: [
      ['Britannica Tony Awards', 'https://www.britannica.com/art/Tony-Awards'],
      ['Guinness The Producers Tony record', 'https://stage.guinnessworldrecords.com/world-records/74811-most-tony-awards-won-by-a-musical'],
      ['AP 2025 Tony winners', 'https://apnews.com/article/24577bf56617d71decd1ae522048b4eb']
    ],
    topNote: 'Verified Broadway history, recent winner context and Tony records.'
  },
  'cesar-awards': {
    historyTimeline: [
      ['1976', 'The first Cesar ceremony was held, with Le Vieux Fusil / The Old Gun winning Best Film.'],
      ['Trophy', 'The award is named for sculptor Cesar Baldaccini, whose compression sculpture became the trophy identity.'],
      ['French cinema', 'The Cesars function as the main annual industry mirror for French film.']
    ],
    recentWinners: [
      ['2025 Best Film', 'The Story of Souleymane'],
      ['2025 Best Director', 'Boris Lojkine, The Story of Souleymane'],
      ['2025 Best Actress', 'Hafsia Herzi, Borgo'],
      ['2025 Best Actor', 'Karim Leklou, Jim\'s Story']
    ],
    records: [
      ['First Best Film', 'Le Monde identifies Le Vieux Fusil / The Old Gun as the first Best Film winner in 1976.'],
      ['Auteur signal', 'The ceremony is often an echo chamber for mainstream auteur cinema in France.'],
      ['Nomination heat', 'Recent editions show a strong link between admissions, critical attention and Cesar nominations.']
    ],
    funFacts: [
      ['Different map', 'The Cesar Awards make French cinema visible even when those films are not central to Oscar conversation.'],
      ['Paris anchor', 'The ceremony is a Paris film-world event rather than a tourist-first spectacle.'],
      ['Useful companion', 'Read it next to Cannes, BAFTA and Oscars to see how festival prestige converts into national awards.']
    ],
    sourceLinks: [
      ['Academie des Cesar history', 'https://www.academie-cinema.org/lacademie/histoire/'],
      ['Official Cesar 1976 winners PDF', 'https://www.academie-cinema.org/wp-content/uploads/1976/02/palmares-officiel-cesar-1976.pdf'],
      ['Le Monde 2025 Cesar context', 'https://www.lemonde.fr/en/culture/article/2025/02/28/2025-cesar-awards-put-independent-french-filmmaking-in-the-spotlight_6738668_30.html']
    ],
    topNote: 'Verified Cesar history, first-winner context and recent French cinema signals.'
  },
  'grammy-awards': {
    historyTimeline: [
      ['1959', 'The first annual Grammy Awards were presented for the recording industry.'],
      ['General field', 'Album, Record, Song and Best New Artist became the four headline categories most casual viewers follow.'],
      ['2025', 'The 67th Grammys gave Beyonce her first Album of the Year win for Cowboy Carter.']
    ],
    recentWinners: [
      ['2025 Album of the Year', 'Beyonce, Cowboy Carter'],
      ['2025 Record of the Year', 'Kendrick Lamar, Not Like Us'],
      ['2025 Song of the Year', 'Kendrick Lamar, Not Like Us'],
      ['2025 Best New Artist', 'Chappell Roan']
    ],
    records: [
      ['Most Grammy wins', 'GRAMMY.com describes Beyonce as a 35-time Grammy winner after the 2025 ceremony.'],
      ['Most nominations context', 'GRAMMY.com notes Beyonce had 99 career nominations around the 2025 Album of the Year win.'],
      ['Country category milestone', 'GRAMMY.com states Cowboy Carter also made Beyonce the first Black artist to win Best Country Album.']
    ],
    funFacts: [
      ['Record vs Song', 'Record of the Year rewards the recording; Song of the Year rewards songwriting. Same track can win both.'],
      ['Premiere Ceremony matters', 'Many genre and craft Grammys are awarded before the televised show.'],
      ['Awards-season outlier', 'The Grammys are less about one ceremony city and more about the recording-year map across genres.']
    ],
    sourceLinks: [
      ['GRAMMY awards archive', 'https://www.grammy.com/awards/'],
      ['GRAMMY.com Beyonce Album of the Year', 'https://www.grammy.com/news/beyonce-cowboy-carter-wins-album-of-the-year-2025-grammys'],
      ['GRAMMY.com Beyonce timeline', 'https://www.grammy.com/news/beyonce-grammys-nominations-wins-performances-timeline-moments-videos-2023-history-record-jay-z']
    ],
    topNote: 'Verified Grammy archive entries, 2025 general-field winners and record context.'
  },
  'brit-awards': {
    historyTimeline: [
      ['1977', 'The first BRITs event marked both the phonograph centenary and Queen Elizabeth II\'s Silver Jubilee.'],
      ['1982', 'The BRIT Awards became an annual UK music awards event.'],
      ['2025', 'Charli xcx dominated the 2025 ceremony with five awards.']
    ],
    recentWinners: [
      ['2025 Artist of the Year', 'Charli xcx'],
      ['2025 Album of the Year', 'Charli xcx, Brat'],
      ['2025 Song of the Year', 'Charli xcx featuring Billie Eilish, Guess remix'],
      ['2025 International Artist', 'Chappell Roan']
    ],
    records: [
      ['Most BRIT awards', 'Guinness lists Robbie Williams with 18 BRIT Awards.'],
      ['2025 sweep', 'The official BRITs site lists Charli xcx among the main 2025 winners, including Artist of the Year.'],
      ['Songwriter award', 'The BRITs announced Charli xcx as 2025 Songwriter of the Year before the ceremony.']
    ],
    funFacts: [
      ['UK industry lens', 'The BRITs show how UK pop, dance, rock, rap and international categories are being weighted in one year.'],
      ['Venue rhythm', 'The O2 has become the ceremony\'s modern London anchor.'],
      ['Public categories', 'Some genre awards have public-vote energy, giving the show a different feel from academy-only prizes.']
    ],
    sourceLinks: [
      ['BRITs 2025 winners', 'https://www.brits.co.uk/news/2025/2025-brits-winners/'],
      ['BRITs Songwriter of the Year', 'https://www.brits.co.uk/news/2025/charli-xcx-wins-songwriter-of-the-year/'],
      ['Guinness BRIT record', 'https://www.guinnessworldrecords.com/world-records/108390-most-brit-awards-won']
    ],
    topNote: 'Verified BRITs winner list, history context and record holder notes.'
  },
  'mtv-video-music-awards': {
    archiveCategories: ['Video of the Year', 'Best New Artist'],
    archiveRows: mtvVmaArchiveRows(),
    historyTimeline: [
      ['1984', 'The first MTV Video Music Awards were held at Radio City Music Hall in New York.'],
      ['Trophy', 'The Moonman / Moon Person trophy became one of MTV\'s clearest visual signatures.'],
      ['2025', 'The 2025 VMAs were held at UBS Arena in Elmont, New York.']
    ],
    recentWinners: [
      ['2025 Video of the Year', 'Ariana Grande, Brighter Days Ahead'],
      ['2025 Best New Artist', 'Alex Warren'],
      ['2024 Video of the Year', 'Taylor Swift featuring Post Malone, Fortnight'],
      ['2024 Best New Artist', 'Chappell Roan']
    ],
    records: [
      ['First ceremony', 'The first VMAs were staged in 1984, with the show built around music videos rather than albums.'],
      ['2025 leader', 'Reports of the 2025 show identify Lady Gaga as the night\'s biggest winner.'],
      ['Fan-culture role', 'The VMAs are historically known for performances and viral moments as much as winners.']
    ],
    funFacts: [
      ['Video-first awards', 'The VMAs reward the visual language of pop music, not only the song or album.'],
      ['Performance memory', 'A strong VMA performance can outlive the actual winner list in pop culture.'],
      ['Location shifts', 'The ceremony moves between New York-area and Los Angeles-area venues more freely than many awards.']
    ],
    sourceLinks: [
      ['GMA 2025 VMA winners', 'https://www.gmanetwork.com/news/showbiz/showbizabroad/958398/mtv-vma-2025-winners-ariana-grande-wins-best-pop-artist-lady-gaga-is-artist-of-the-year-sabrina-car'],
      ['MTV Video of the Year archive', 'https://en.wikipedia.org/wiki/MTV_Video_Music_Award_for_Video_of_the_Year'],
      ['MTV Best New Artist archive', 'https://en.wikipedia.org/wiki/MTV_Video_Music_Award_for_Best_New_Artist'],
      ['2025 MTV VMAs overview', 'https://en.wikipedia.org/wiki/2025_MTV_Video_Music_Awards']
    ],
    topNote: 'Verified recent VMA winner context and music-video history notes.'
  },
  'bet-awards': {
    historyTimeline: [
      ['2001', 'The BET Awards began as a major televised celebration of Black entertainment and achievement.'],
      ['Culture night', 'The ceremony grew around music, acting, sports, tribute segments and live performances.'],
      ['2025', 'The 25th anniversary BET Awards were hosted by Kevin Hart.']
    ],
    recentWinners: [
      ['2025 Album of the Year', 'Kendrick Lamar, GNX'],
      ['2025 Video of the Year', 'Kendrick Lamar, Not Like Us'],
      ['2025 Best Female R&B/Pop Artist', 'SZA'],
      ['2025 Best Male R&B/Pop Artist', 'Chris Brown']
    ],
    records: [
      ['2025 standout', 'BET reported Kendrick Lamar as the evening\'s standout with four major awards.'],
      ['Quarter-century mark', 'Paramount described the 2025 ceremony as marking 25 years of the BET Awards.'],
      ['Category spread', 'The show spans music, film, television, sports, gospel, international and tribute moments.']
    ],
    funFacts: [
      ['Performance-first energy', 'BET Awards pages need winners and performances side by side; the show is not just a results list.'],
      ['Tribute value', 'Tributes are a core part of the user experience, often giving the edition its emotional center.'],
      ['Culture scope', 'Unlike genre-only music awards, the BET Awards cut across entertainment, sports and community recognition.']
    ],
    sourceLinks: [
      ['BET 2025 winners', 'https://www.bet.com/bet-awards/articles/wcrxkp/bet-awards-2025-the-complete-list-of-winners'],
      ['Paramount 2025 BET Awards release', 'https://www.paramountpressexpress.com/bet/shows/bet-awards-2025/releases/?view=111535-bet-awards-marks-25-years-of-culture-biggest-night-with-host-kevin-hart-filled-with-iconic-tributes-and-performances']
    ],
    topNote: 'Verified BET 2025 winner data, anniversary context and category spread.'
  }
};

for (const event of awards) {
  Object.assign(event, awardDetails[event.slug] || {});
}

function baftaFilmArchiveRows() {
  const categories = ['Best Film', 'Director', 'Leading Actor', 'Leading Actress'];
  const importedRows = importedHistory['bafta-film-awards']?.rows || {};
  const corrections = {
    2000: { 'Best Film': 'American Beauty' },
    2001: { 'Best Film': 'Gladiator' },
    2002: { 'Best Film': 'The Lord of the Rings: The Fellowship of the Ring' },
    2003: { 'Best Film': 'The Pianist' },
    2004: { 'Best Film': 'The Lord of the Rings: The Return of the King' },
    2005: { 'Best Film': 'The Aviator' },
    2006: { 'Best Film': 'Brokeback Mountain' },
    2007: { 'Best Film': 'The Queen' },
    2008: { 'Best Film': 'Atonement' },
    2009: { 'Best Film': 'Slumdog Millionaire' },
    2010: { 'Best Film': 'The Hurt Locker' },
    2011: { 'Best Film': 'The King\'s Speech' },
    2012: { 'Best Film': 'The Artist' },
    2013: { 'Best Film': 'Argo' },
    2014: { 'Best Film': '12 Years a Slave' },
    2015: { 'Best Film': 'Boyhood' },
    2016: { 'Best Film': 'The Revenant' },
    2017: { 'Best Film': 'La La Land' },
    2018: { 'Best Film': 'Three Billboards Outside Ebbing, Missouri' },
    2019: { 'Best Film': 'Roma' },
    2020: { 'Best Film': '1917' },
    2021: { 'Best Film': 'Nomadland' },
    2022: { 'Best Film': 'The Power of the Dog' },
    2023: { 'Best Film': 'All Quiet on the Western Front' },
    2024: { 'Best Film': 'Oppenheimer' },
    2025: {
      'Best Film': 'Conclave',
      Director: 'Brady Corbet, The Brutalist',
      'Leading Actor': 'Adrien Brody, The Brutalist',
      'Leading Actress': 'Mikey Madison, Anora'
    },
    2026: {
      'Best Film': 'One Battle After Another',
      Director: 'Paul Thomas Anderson, One Battle After Another',
      'Leading Actor': 'Robert Aramayo, I Swear',
      'Leading Actress': 'Jessie Buckley, Hamnet'
    }
  };
  const rows = [];
  for (let year = 2026; year >= 1970; year -= 1) {
    const source = { ...(importedRows[String(year - 1)] || {}), ...(corrections[year] || {}) };
    const values = {};
    for (const category of categories) {
      values[category] = cleanAwardText(source[category]) || 'Not awarded';
    }
    rows.push({ year: String(year), values });
  }
  return rows;
}

function mtvVmaArchiveRows() {
  const videoOfYear = {
    1984: 'The Cars, "You Might Think"',
    1985: 'Don Henley, "The Boys of Summer"',
    1986: 'Dire Straits, "Money for Nothing"',
    1987: 'Peter Gabriel, "Sledgehammer"',
    1988: 'INXS, "Need You Tonight" / "Mediate"',
    1989: 'Neil Young, "This Note\'s for You"',
    1990: 'Sinead O\'Connor, "Nothing Compares 2 U"',
    1991: 'R.E.M., "Losing My Religion"',
    1992: 'Van Halen, "Right Now"',
    1993: 'Pearl Jam, "Jeremy"',
    1994: 'Aerosmith, "Cryin\'"',
    1995: 'TLC, "Waterfalls"',
    1996: 'The Smashing Pumpkins, "Tonight, Tonight"',
    1997: 'Jamiroquai, "Virtual Insanity"',
    1998: 'Madonna, "Ray of Light"',
    1999: 'Lauryn Hill, "Doo Wop (That Thing)"',
    2000: 'Eminem, "The Real Slim Shady"',
    2001: 'Christina Aguilera, Lil\' Kim, Mya and Pink, "Lady Marmalade"',
    2002: 'Eminem, "Without Me"',
    2003: 'Missy Elliott, "Work It"',
    2004: 'Outkast, "Hey Ya!"',
    2005: 'Green Day, "Boulevard of Broken Dreams"',
    2006: 'Panic! at the Disco, "I Write Sins Not Tragedies"',
    2007: 'Rihanna featuring Jay-Z, "Umbrella"',
    2008: 'Britney Spears, "Piece of Me"',
    2009: 'Beyonce, "Single Ladies (Put a Ring on It)"',
    2010: 'Lady Gaga, "Bad Romance"',
    2011: 'Katy Perry, "Firework"',
    2012: 'Rihanna featuring Calvin Harris, "We Found Love"',
    2013: 'Justin Timberlake, "Mirrors"',
    2014: 'Miley Cyrus, "Wrecking Ball"',
    2015: 'Taylor Swift featuring Kendrick Lamar, "Bad Blood"',
    2016: 'Beyonce, "Formation"',
    2017: 'Kendrick Lamar, "Humble"',
    2018: 'Camila Cabello featuring Young Thug, "Havana"',
    2019: 'Taylor Swift, "You Need to Calm Down"',
    2020: 'The Weeknd, "Blinding Lights"',
    2021: 'Lil Nas X, "Montero (Call Me by Your Name)"',
    2022: 'Taylor Swift, "All Too Well: The Short Film"',
    2023: 'Taylor Swift, "Anti-Hero"',
    2024: 'Taylor Swift featuring Post Malone, "Fortnight"',
    2025: 'Ariana Grande, "Brighter Days Ahead"'
  };
  const bestNewArtist = {
    1984: 'Eurythmics, "Sweet Dreams (Are Made of This)"',
    1985: '\'Til Tuesday, "Voices Carry"',
    1986: 'A-ha, "Take On Me"',
    1987: 'Crowded House, "Don\'t Dream It\'s Over"',
    1988: 'Guns N\' Roses, "Welcome to the Jungle"',
    1989: 'Living Colour, "Cult of Personality"',
    1990: 'Michael Penn, "No Myth"',
    1991: 'Jesus Jones, "Right Here, Right Now"',
    1992: 'Nirvana, "Smells Like Teen Spirit"',
    1993: 'Stone Temple Pilots, "Plush"',
    1994: 'Counting Crows, "Mr. Jones"',
    1995: 'Hootie & the Blowfish, "Hold My Hand"',
    1996: 'Alanis Morissette, "Ironic"',
    1997: 'Fiona Apple, "Sleep to Dream"',
    1998: 'Natalie Imbruglia, "Torn"',
    1999: 'Eminem, "My Name Is"',
    2000: 'Macy Gray, "I Try"',
    2001: 'Alicia Keys, "Fallin\'"',
    2002: 'Avril Lavigne, "Complicated"',
    2003: '50 Cent, "In da Club"',
    2004: 'Maroon 5, "This Love"',
    2005: 'The Killers, "Mr. Brightside"',
    2006: 'Avenged Sevenfold, "Bat Country"',
    2007: 'Gym Class Heroes',
    2008: 'Tokio Hotel, "Ready, Set, Go!"',
    2009: 'Lady Gaga, "Poker Face"',
    2010: 'Justin Bieber featuring Ludacris, "Baby"',
    2011: 'Tyler, the Creator, "Yonkers"',
    2012: 'One Direction, "What Makes You Beautiful"',
    2013: 'Austin Mahone, "What About Love"',
    2014: 'Fifth Harmony, "Miss Movin\' On"',
    2015: 'Fetty Wap, "Trap Queen"',
    2016: 'DNCE',
    2017: 'Khalid',
    2018: 'Cardi B',
    2019: 'Billie Eilish',
    2020: 'Doja Cat',
    2021: 'Olivia Rodrigo',
    2022: 'Dove Cameron',
    2023: 'Ice Spice',
    2024: 'Chappell Roan',
    2025: 'Alex Warren'
  };
  const categories = ['Video of the Year', 'Best New Artist'];
  const rows = [];
  for (let year = 2026; year >= 1970; year -= 1) {
    const values = {};
    for (const category of categories) {
      if (year < 1984) {
        values[category] = 'Not held yet';
      } else if (year === 2026) {
        values[category] = 'Current edition';
      } else if (category === 'Video of the Year') {
        values[category] = videoOfYear[year] || 'Not awarded';
      } else {
        values[category] = bestNewArtist[year] || 'Not awarded';
      }
    }
    rows.push({ year: String(year), values });
  }
  return rows;
}

function country(name, url, flag) {
  return { name, url, flag };
}

function award(slug, name, formalName, city, countryValue, options) {
  return {
    slug,
    name,
    formalName,
    firstYear: 1970,
    pathLabel: 'Culture / Awards',
    nextDateIso: '',
    nextEdition: `${name} next edition`,
    city,
    cityUrl: '',
    country: countryValue,
    topTitle: `${name} winners and records`,
    topNote: 'Use this panel for headline winners, repeat winners and category notes as data expands.',
    factsTitle: `${name} quick facts`,
    stayTitle: `Stay for ${name} week`,
    tripTitle: `Build the ${city} awards visit`,
    tripCards: [
      ['Best base', city, 'Start near the ceremony area once the venue is confirmed, then compare transport links and hotel prices.'],
      ['Ticket reality', 'Official channels first', 'Award ceremonies can have limited public access, industry allocations or late ticket rules.'],
      ['Best use', 'Follow the full week', 'Plan around screenings, concerts, theatre, fan events, museums, restaurants and broadcast viewing.']
    ],
    sources: ['Official organizer listing TBC', 'OneSliders event watchlist'],
    ...options
  };
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function countryLink(countryValue) {
  return `<a class="country" href="${countryValue.url}"><img src="${countryValue.flag}" alt="" width="20" height="14" loading="lazy">${esc(countryValue.name)}</a>`;
}

function sourceLinks(event) {
  if (event.sourceLinks && event.sourceLinks.length) {
    return event.sourceLinks.map(([label, url]) => `<a href="${esc(url)}" rel="nofollow">${esc(label)}</a>`).join('; ');
  }
  return event.sources.map(esc).join('; ');
}

function primarySourceLabel(event) {
  if (event.sourceLinks && event.sourceLinks.length) return event.sourceLinks[0][0];
  return event.sources[0] || 'verified event sources';
}

function cityLink(event) {
  if (!event.cityUrl) return esc(event.city);
  return `<a class="city-link" href="${event.cityUrl}">${esc(event.city)}</a>`;
}

function nav() {
  return `<nav class="event-nav" aria-label="Site navigation">
    <a class="nav-icon" href="/content/events/index.html" aria-label="Events"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a>
    <a class="nav-icon" href="/content/locations/index.html" aria-label="Locations"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
    <a class="nav-icon" href="/content/categories/index.html" aria-label="Categories"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg></a>
    <span class="nav-spacer"></span>
    <details class="nav-language"><summary aria-label="Language">EN</summary><div class="nav-language__list"><a href="#" aria-current="page">English</a></div></details>
  </nav>`;
}

function renderPage(event) {
  const imgBase = `/content/categories/culture/awards/events/img/${event.slug}`;
  const title = `${event.name} | OneSliders Awards`;
  const description = `${event.name} event view with winners context, records, quick facts and ${event.city} planning notes.`;
  const archiveAttrs = event.oscarsArchive
    ? ` data-oscars-explorer
    data-oscars-decades="/data/culture/awards/events/oscars-1970s.json,/data/culture/awards/events/oscars-1980s.json,/data/culture/awards/events/oscars-1990s.json,/data/culture/awards/events/oscars-2000s.json,/data/culture/awards/events/oscars-2010s.json,/data/culture/awards/events/oscars-2020s.json"
    data-oscars-stats="/data/culture/awards/events/oscars-most-awards.json,/data/culture/awards/events/oscars-most-nominations.json,/data/culture/awards/events/oscars-best-picture-winners.json,/data/culture/awards/events/oscars-best-actor-winners.json,/data/culture/awards/events/oscars-best-actress-winners.json,/data/culture/awards/events/oscars-youngest-winners.json,/data/culture/awards/events/oscars-oldest-winners.json"
    data-oscars-records="/data/culture/awards/events/oscars-records.json"`
    : ' data-awards-template';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow">
  <meta name="content-language" content="en">
  <link rel="canonical" href="https://one-sliders.com/content/categories/culture/awards/events/${event.slug}.html">
  <link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="/assets/icons/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/oneslider-core.css">
  <link rel="stylesheet" href="/assets/css/events.css?v=awards-frame-20260608">
  <script defer src="/assets/js/oneslider-core.js?v=awards-frame-20260608"></script>
  <link rel="preload" as="image" href="${imgBase}-hero-1200.webp" type="image/webp">
  <meta property="og:title" content="${esc(event.name)} | OneSliders Awards">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://one-sliders.com/content/categories/culture/awards/events/img/${event.slug}-hero.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://one-sliders.com/content/categories/culture/awards/events/${event.slug}.html">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(event.name)} | OneSliders Awards">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="https://one-sliders.com/content/categories/culture/awards/events/img/${event.slug}-hero.png">
  <script type="application/ld+json">${JSON.stringify(schema(event, title, description))}</script>
</head>
<body class="event-page event-page--framed awards-event-page oscars-event-page">
  ${nav()}

  <main class="event-frame oscars-explorer awards-explorer" id="general" aria-labelledby="event-title"${archiveAttrs}>
    <section class="event-frame__visual" aria-label="${esc(event.name)} overview">
      <div class="event-frame__media">
        <img src="./img/${event.slug}-hero.png" srcset="./img/${event.slug}-hero-400.webp 400w, ./img/${event.slug}-hero-768.webp 768w, ./img/${event.slug}-hero-1200.webp 1200w" sizes="(max-width: 900px) 100vw, 42vw" alt="${esc(event.name)} ceremony atmosphere" width="1200" height="630" fetchpriority="high">
      </div>
      <div class="event-frame__copy">
        <div>
          <p class="event-kicker">${esc(event.pathLabel)}</p>
          <h1 class="event-title" id="event-title">${esc(event.name)}</h1>
          <p class="event-lede">${esc(event.intro)}</p>
        </div>
        <div class="facts-strip" aria-label="${esc(event.name)} facts"${event.oscarsArchive ? ' data-oscars-summary' : ''}>
          <div class="fact"><span>Next edition</span><strong>${esc(event.nextDate)}</strong></div>
          <div class="fact"><span>Venue</span><strong>${esc(event.venue)}</strong></div>
          <div class="fact"><span>City</span><strong>${cityLink(event)}</strong></div>
          <div class="fact"><span>Country</span><strong>${countryLink(event.country)}</strong></div>
        </div>
        <div class="card card--rank card--team-rank oscars-next-card">
          <span>Next ceremony</span>
          <strong>${esc(event.nextEdition)}</strong>
          <p>${esc(event.nextDate)} in ${esc(event.city)}. Data checked against ${esc(primarySourceLabel(event))}.</p>
        </div>
        <a class="topic-card topic-card--inline" href="/content/categories/culture/awards.html" aria-label="Open the Awards topic page">
          <img src="/content/categories/culture/awards/events/img/${event.slug}-mini.png" alt="${esc(event.name)} thumbnail" width="400" height="300" loading="eager">
          <span>More awards</span>
          <strong>Awards topic</strong>
          <p>More award ceremonies, film culture, music nights and entertainment events.</p>
        </a>
      </div>
    </section>

    <section class="event-frame__panel" id="history" aria-label="${esc(event.name)} history and planning">
      <div class="event-frame__panel-header">
        <h2 class="event-section-title" ${event.oscarsArchive ? 'data-oscars-matrix-title' : ''}>${event.oscarsArchive ? 'Vinnare per &aring;r' : `Vinnare per &aring;r: ${historyYearRange(event)}`}</h2>
        <p class="event-subtitle" ${event.oscarsArchive ? 'data-oscars-matrix-note' : ''}>${event.oscarsArchive ? 'V&auml;lj en eller flera kategorier. &Aring;ren visas som rader.' : 'V&auml;lj en eller flera kategorier. &Aring;ren visas som rader.'}</p>
      </div>
      <div class="year-edition">
        ${event.oscarsArchive ? `<div class="edition-tabs" data-oscars-tabs>
          <div class="edition-tablist" role="tablist" aria-label="${esc(event.name)} views">
            <button class="edition-tab" type="button" role="tab" aria-selected="true" ${tabAttr(event, 'history')}>Historik</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" ${tabAttr(event, 'top')}>Top</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" ${tabAttr(event, 'facts')}>Fun facts</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" ${tabAttr(event, 'stay')}>Stay</button>
          </div>
          <div class="edition-tab-panels">
            <section class="edition-tab-panel" ${panelAttr(event, 'history')}>
              ${event.oscarsArchive ? '<div class="oscars-category-picker" data-oscars-category-picker aria-label="Choose award categories"></div><div class="oscars-decade-matrix" data-oscars-decade-matrix></div>' : historyPanel(event)}
            </section>
            <section class="edition-tab-panel" ${panelAttr(event, 'top')} hidden>
              <div class="event-stage-panel__header">
                <span>Top lists</span>
                <strong>${esc(event.topTitle)}</strong>
                <p>${esc(event.topNote)}</p>
              </div>
              ${event.oscarsArchive ? '<div class="oscars-stats-layout" data-oscars-statistics></div>' : topPanel(event)}
            </section>
            <section class="edition-tab-panel" ${panelAttr(event, 'facts')} hidden>
              <div class="event-stage-panel__header">
                <span>Fun facts</span>
                <strong>${esc(event.factsTitle)}</strong>
                <p>Verified context, category quirks and viewing notes that make this award different.</p>
              </div>
              ${event.oscarsArchive ? '<div class="oscars-record-grid" data-oscars-records-panel><div class="stage-card"><strong>Loading</strong><span>Records are loading from oscars-records.json.</span></div></div>' : factsPanel(event)}
            </section>
            <section class="edition-tab-panel" ${panelAttr(event, 'stay')} hidden>
              ${stayPanel(event)}
            </section>
          </div>
        </div>` : awardsTabbedPanel(event)}
      </div>
    </section>
  </main>

  <footer class="event-footer">&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>.</footer>
</body>
</html>
`;
}

function tabAttr(event, tab) {
  return event.oscarsArchive ? `data-oscars-tab="${tab}"` : `data-awards-tab="${tab}"`;
}

function panelAttr(event, tab) {
  return event.oscarsArchive ? `data-oscars-panel="${tab}"` : `data-awards-panel="${tab}"`;
}

function awardsTabbedPanel(event) {
  return `<div class="edition-tabs" data-awards-tabs>
          <div class="edition-tablist" role="tablist" aria-label="${esc(event.name)} views">
            <button class="edition-tab" type="button" role="tab" aria-selected="true" data-awards-tab="history">Historik</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" data-awards-tab="top">Top</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" data-awards-tab="facts">Fun facts</button>
            <button class="edition-tab" type="button" role="tab" aria-selected="false" data-awards-tab="stay">Stay</button>
          </div>
          <div class="edition-tab-panels">
            <section class="edition-tab-panel" data-awards-panel="history">
              ${historyPanel(event)}
            </section>
            <section class="edition-tab-panel" data-awards-panel="top" hidden>
              <div class="event-stage-panel__header">
                <span>Top lists</span>
                <strong>${esc(event.topTitle)}</strong>
                <p>${esc(event.topNote)}</p>
              </div>
              ${topPanel(event)}
            </section>
            <section class="edition-tab-panel" data-awards-panel="facts" hidden>
              <div class="event-stage-panel__header">
                <span>Fun facts</span>
                <strong>${esc(event.factsTitle)}</strong>
                <p>Verified context, category quirks and viewing notes that make this award different.</p>
              </div>
              ${factsPanel(event)}
            </section>
            <section class="edition-tab-panel" data-awards-panel="stay" hidden>
              ${stayPanel(event)}
            </section>
          </div>
        </div>`;
}

function awardsSinglePanel(event) {
  return `<div class="awards-single-panel">
    <section class="edition-tab-panel awards-single-section" aria-label="${esc(event.name)} winners by year">
      ${historyPanel(event)}
    </section>
    <section class="edition-tab-panel awards-single-section" aria-label="${esc(event.name)} top lists">
      <div class="event-stage-panel__header">
        <span>Top lists</span>
        <strong>${esc(event.topTitle)}</strong>
        <p>${esc(event.topNote)}</p>
      </div>
      ${topPanel(event)}
    </section>
    <section class="edition-tab-panel awards-single-section" aria-label="${esc(event.name)} fun facts">
      <div class="event-stage-panel__header">
        <span>Fun facts</span>
        <strong>${esc(event.factsTitle)}</strong>
        <p>Verified context, category quirks and viewing notes that make this award different.</p>
      </div>
      ${factsPanel(event)}
    </section>
    <section class="edition-tab-panel awards-single-section" aria-label="${esc(event.name)} stay planning">
      ${stayPanel(event)}
    </section>
  </div>`;
}

function historyPanel(event) {
  const matrix = historyMatrix(event);
  return `<div class="oscars-category-picker" data-awards-category-picker aria-label="Choose award categories">
    ${matrix.categories.map((category, index) => `<button class="oscars-category-pill is-active" type="button" data-awards-category-toggle="${esc(category.key)}" aria-pressed="true"><span class="oscars-category-icon oscars-category-icon--${category.icon}" aria-hidden="true"></span>${esc(category.label)}</button>`).join('')}
  </div>
  <div class="oscars-decade-matrix" data-awards-winner-matrix>
    <div class="oscars-matrix-scroll">
      <div class="oscars-matrix-row oscars-matrix-row--head awards-matrix-row awards-matrix-row--${matrix.categories.length}">
        <strong>&Aring;R</strong>${matrix.categories.map((category) => `<strong data-awards-category-column="${esc(category.key)}">${esc(category.label)}</strong>`).join('')}
      </div>
      ${matrix.rows.map((row) => `<div class="oscars-matrix-row awards-matrix-row awards-matrix-row--${matrix.categories.length}"><b>${esc(row.year)}</b>${matrix.categories.map((category) => winnerCell(row.values[category.key], category.key, category.label)).join('')}</div>`).join('')}
    </div>
  </div>`;
}

function historyYearRange(event) {
  const rows = historyMatrix(event).rows;
  if (!rows.length) return 'senaste verifierade ar';
  const years = rows.map((row) => Number(row.year)).filter(Boolean);
  if (!years.length) return 'senaste verifierade ar';
  const min = Math.min(...years);
  const max = Math.max(...years);
  return min === max ? String(max) : `${min}-${max}`;
}

function historyMatrix(event) {
  const imported = event.archiveRows ? null : importedHistory[event.slug];
  const importedRows = imported ? normalizeImportedRows(event, imported) : null;
  const categoryLabels = importedRows
    ? importedRows.categories
    : (event.archiveCategories || deriveArchiveCategories(event));
  const categories = categoryLabels.map((label) => ({
    key: slugify(label),
    label,
    icon: categoryIconType(label)
  }));
  const sourceRows = importedRows ? importedRows.rows : (event.archiveRows || deriveArchiveRows(event, categories));
  const rows = sourceRows.map((row) => {
    const values = {};
    for (const category of categories) values[category.key] = row.values[category.label] || row.values[category.key] || null;
    return { year: row.year, values };
  });
  return { categories, rows };
}

function normalizeImportedRows(event, imported) {
  const startYear = 1970;
  const endYear = 2026;
  const categories = (imported.categories || []).filter((category) => {
    let count = 0;
    for (let year = Math.max(startYear, event.firstYear); year <= 2025; year += 1) {
      if (imported.rows?.[year]?.[category]) count += 1;
    }
    return count >= Math.min(10, Math.max(1, 2025 - Math.max(startYear, event.firstYear)));
  }).slice(0, 4);
  const fallbackCategories = categories.length ? categories : deriveArchiveCategories(event);
  const rows = [];
  for (let year = endYear; year >= startYear; year -= 1) {
    const values = {};
    for (const category of fallbackCategories) {
      const importedValue = cleanImportedHistoryValue(imported.rows?.[year]?.[category]);
      if (year < event.firstYear) {
        values[category] = 'Not held yet';
      } else if (year === 2026) {
        values[category] = importedValue || 'Current edition';
      } else {
        values[category] = importedValue || 'Not awarded';
      }
    }
    rows.push({ year: String(year), values });
  }
  return { categories: fallbackCategories, rows };
}

function deriveArchiveCategories(event) {
  return (event.recentWinners || []).map(([label]) => label.replace(/^\d{4}\s+/, ''));
}

function deriveArchiveRows(event, categories) {
  const byYear = new Map();
  for (const [label, value] of event.recentWinners || []) {
    const yearMatch = label.match(/^(\d{4})\s+(.+)$/);
    const year = yearMatch ? yearMatch[1] : 'Latest';
    const category = yearMatch ? yearMatch[2] : label;
    if (!byYear.has(year)) byYear.set(year, {});
    byYear.get(year)[category] = value;
  }
  const startYear = 1970;
  const endYear = 2026;
  const rows = [];
  for (let year = endYear; year >= startYear; year -= 1) {
    const values = {};
    for (const category of categories) {
      if (year < event.firstYear) {
        values[category.label] = 'Not held yet';
      } else if (year === 2026) {
        values[category.label] = 'Current edition';
      } else {
        values[category.label] = byYear.get(String(year))?.[category.label] || 'Not awarded';
      }
    }
    rows.push({ year: String(year), values });
  }
  return rows;
}

function winnerCell(value, categoryKey, categoryLabel) {
  const labelAttr = categoryLabel ? ` data-awards-category-label="${esc(categoryLabel)}"` : '';
  value = cleanAwardText(value);
  if (!value) return `<span class="oscars-matrix-empty" data-awards-category-column="${esc(categoryKey)}"${labelAttr}>TBC</span>`;
  if (value === 'TBC' || value === 'Not held yet' || value === 'Not awarded' || value === 'Current edition') return `<span class="oscars-matrix-empty" data-awards-category-column="${esc(categoryKey)}"${labelAttr}>${esc(value)}</span>`;
  const parts = String(value).split(', ');
  const title = parts[0] || value;
  const subtitle = parts.slice(1).join(', ');
  return `<div data-awards-category-column="${esc(categoryKey)}"${labelAttr}><b>${esc(title)}</b>${subtitle ? `<em>${esc(subtitle)}</em>` : ''}</div>`;
}

function cleanAwardText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ', ')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanImportedHistoryValue(value) {
  const clean = cleanAwardText(value);
  if (!clean || /\{\{|==|See also|References|External links|Category:/i.test(clean)) return '';
  return clean;
}

function readJsonIfExists(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function slugify(value) {
  return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function categoryIconType(category) {
  const c = String(category).toLowerCase();
  if (c.includes('director')) return 'director';
  if (c.includes('actor') || c.includes('actress') || c.includes('artist')) return 'acting';
  if (c.includes('song') || c.includes('album') || c.includes('record')) return 'music';
  if (c.includes('video')) return 'camera';
  if (c.includes('film') || c.includes('picture') || c.includes('movie')) return 'picture';
  if (c.includes('series') || c.includes('play') || c.includes('musical')) return 'documentary';
  return 'casting';
}

function topPanel(event) {
  return `<div class="oscars-stats-layout">
    <article class="oscars-stat-card">
      <h3>Recent headline winners</h3>
      <ol>
        ${(event.recentWinners || []).map(([label, value]) => `<li><strong>${esc(label)}:</strong> ${esc(value)}</li>`).join('')}
      </ol>
    </article>
    <article class="oscars-stat-card">
      <h3>Records and signals</h3>
      <ol>
        ${(event.records || []).map(([label, value]) => `<li><strong>${esc(label)}:</strong> ${esc(value)}</li>`).join('')}
      </ol>
    </article>
  </div>`;
}

function factsPanel(event) {
  return `<div class="oscars-record-grid">
    ${(event.funFacts || []).map(([title, detail]) => `<div class="stage-card"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`).join('')}
    <div class="stage-card"><strong>Host context</strong><span>${cityLink(event)}, ${countryLink(event.country)}.</span></div>
  </div>`;
}

function stayPanel(event) {
  const safeCity = esc(event.city);
  const firstArea = event.areas[0] || event.city;
  return `<section class="commercial-module commercial-module--hotel hotel-search">
    <div class="commercial-module__header"><span>Hotels</span><strong>${esc(event.stayTitle)}</strong></div>
    <div class="hotel-search__fields">
      <label>Check-in<input type="date" name="checkin" value="${event.nextDateIso || ''}"></label>
      <label>Check-out<input type="date" name="checkout" value=""></label>
      <label>Guests<input type="number" name="adults" min="1" max="12" value="2"></label>
      <label>Rooms<input type="number" name="rooms" min="1" max="8" value="1"></label>
    </div>
    <fieldset class="hotel-search__areas">
      <legend>Area</legend>
      ${event.areas.map((area, index) => `<label class="hotel-search__area"><input type="radio" name="hotel-area" value="${esc(area)}"${index === 0 ? ' checked' : ''}><span>${esc(area)}</span></label>`).join('')}
    </fieldset>
    <a class="event-button hotel-search__go" href="/content/locations/index.html" rel="sponsored nofollow">Check hotel prices</a>
  </section>
  <section class="commercial-module commercial-module--golf-trip">
    <div class="commercial-module__header"><span>Trip</span><strong>${esc(event.tripTitle)}</strong></div>
    <div class="edition-overview__cards edition-overview__cards--three">
      ${event.tripCards.map(([label, title, detail]) => `<div class="edition-compact-card"><span>${esc(label)}</span><strong>${esc(title)}</strong><p>${esc(detail)}</p></div>`).join('')}
    </div>
    <div class="actions-row">
      <a class="event-button event-button--inline" href="/content/categories/culture/awards.html" rel="sponsored nofollow" data-affiliate-type="product" data-campaign="${event.slug}-${safeCity}-${esc(firstArea)}">Awards topic</a>
    </div>
  </section>`;
}

function schema(event, title, description) {
  const url = `https://one-sliders.com/content/categories/culture/awards/events/${event.slug}.html`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://one-sliders.com/#organization', name: 'OneSliders', url: 'https://one-sliders.com/', logo: 'https://one-sliders.com/assets/icons/one-sliders-icon.svg' },
      { '@type': 'WebSite', '@id': 'https://one-sliders.com/#website', url: 'https://one-sliders.com/', name: 'OneSliders', publisher: { '@id': 'https://one-sliders.com/#organization' } },
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collectionpage`,
        url,
        name: title,
        description,
        inLanguage: 'en',
        image: `https://one-sliders.com/content/categories/culture/awards/events/img/${event.slug}-hero.png`,
        about: { '@type': 'Event', name: event.formalName, alternateName: event.name },
        isPartOf: { '@id': 'https://one-sliders.com/#website' },
        publisher: { '@id': 'https://one-sliders.com/#organization' }
      }
    ]
  };
}

function topicCard(event) {
  const time = event.nextDateIso ? event.nextDate : event.nextDate;
  const end = event.nextDateIso ? ` data-end="${event.nextDateIso}"` : '';
  return `<a class="event-card"${end} href="/content/categories/culture/awards/events/${event.slug}.html"><img class="event-thumb" src="/content/categories/culture/awards/events/img/${event.slug}-mini.png" alt="${esc(event.name)} thumbnail" loading="lazy" width="400" height="300"><time>${esc(time)}</time><strong>${esc(event.name)}</strong><p>${esc(event.summary)}</p></a>`;
}

function rebuildTopicPage() {
  let html = fs.readFileSync(topicPath, 'utf8');
  html = html.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="Awards brings together ceremonies, winners, nominees, records and awards-week planning across culture.">');
  html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Awards brings together ceremonies, winners, nominees, records and awards-week planning across culture.">');
  html = html.replace(/<p class="intro">[\s\S]*?<\/p>/, '<p class="intro">Awards brings together ceremonies, winners, nominees, records and awards-week planning across culture.</p>');
  html = html.replace(/<div class="note-card">[\s\S]*?<\/div><\/div>/, '<div class="note-card">Each awards event now opens into the same framed OneSliders layout: hero, key facts, history, top lists, fun facts and stay planning.</div></div>');
  html = html.replace(/<!-- generated-topic-fill:start -->[\s\S]*?<!-- generated-topic-fill:end -->/, `<!-- generated-topic-fill:start -->\n${awards.map(topicCard).join('\n')}\n<!-- generated-topic-fill:end -->`);
  html = html.replace(/<div class="event-list" aria-label="Featured award events">[\s\S]*?<\/div>/, `<div class="event-list" aria-label="Featured award events">\n${awards.map(topicCard).map((card) => `            ${card}`).join('\n')}\n          </div>`);
  html = html.replace(/\s*<a class="event-card" data-end="2027-02-28" href="\/content\/categories\/culture\/awards\/events\/grammy-awards.html">[\s\S]*?<\/a>\s*/, '\n');
  fs.writeFileSync(topicPath, html, 'utf8');
}

fs.mkdirSync(imgDir, { recursive: true });
for (const event of awards) {
  fs.writeFileSync(path.join(eventsDir, `${event.slug}.html`), renderPage(event), 'utf8');
}
rebuildTopicPage();

console.log(`Generated ${awards.length} awards event pages from the Oscars-style frame template.`);
