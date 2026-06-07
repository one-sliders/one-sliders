import fs from 'node:fs';

const file = 'ru/content/events/index.html';
if (!fs.existsSync(file)) process.exit(0);

let html = fs.readFileSync(file, 'utf8');

const replaceAll = (from, to) => {
  html = html.split(from).join(to);
};

const eventTitles = new Map(Object.entries({
  '&Oslash;ya Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ã˜ya',
  'AFC Asian Cup 2027': 'ÐšÑƒÐ±Ð¾Ðº ÐÐ·Ð¸Ð¸ AFC 2027',
  'AFL Grand Final': 'Ð“Ñ€Ð°Ð½Ð´-Ñ„Ð¸Ð½Ð°Ð» AFL',
  'Abu Dhabi Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ ÐÐ±Ñƒ-Ð”Ð°Ð±Ð¸',
  'Academy Awards / Oscars 2027': 'ÐŸÑ€ÐµÐ¼Ð¸Ñ Â«ÐžÑÐºÐ°Ñ€Â» 2027',
  'Africa Cup of Nations 2027': 'ÐšÑƒÐ±Ð¾Ðº Ð°Ñ„Ñ€Ð¸ÐºÐ°Ð½ÑÐºÐ¸Ñ… Ð½Ð°Ñ†Ð¸Ð¹ 2027',
  'Asian Games 2026': 'ÐÐ·Ð¸Ð°Ñ‚ÑÐºÐ¸Ðµ Ð¸Ð³Ñ€Ñ‹ 2026',
  'Australian Open 2027': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ ÐÐ²ÑÑ‚Ñ€Ð°Ð»Ð¸Ð¸ 2027',
  'Bali Arts Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ð¸ÑÐºÑƒÑÑÑ‚Ð² Ð‘Ð°Ð»Ð¸',
  'Berlin Marathon 2026': 'Ð‘ÐµÑ€Ð»Ð¸Ð½ÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½ 2026',
  'Bledisloe Cup': 'ÐšÑƒÐ±Ð¾Ðº Ð‘Ð»ÐµÐ´Ð¸ÑÐ»Ð¾Ñƒ',
  'Boston Marathon 2027': 'Ð‘Ð¾ÑÑ‚Ð¾Ð½ÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½ 2027',
  'Brazil Independence Day': 'Ð”ÐµÐ½ÑŒ Ð½ÐµÐ·Ð°Ð²Ð¸ÑÐ¸Ð¼Ð¾ÑÑ‚Ð¸ Ð‘Ñ€Ð°Ð·Ð¸Ð»Ð¸Ð¸',
  'British Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ð¸',
  'Buenos Aires Tango Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ñ‚Ð°Ð½Ð³Ð¾ Ð² Ð‘ÑƒÑÐ½Ð¾Ñ-ÐÐ¹Ñ€ÐµÑÐµ',
  'Burning Man': 'Ð‘ÐµÑ€Ð½Ð¸Ð½Ð³ ÐœÑÐ½',
  'CES 2027': 'CES 2027',
  'Cairo International Film Festival': 'ÐšÐ°Ð¸Ñ€ÑÐºÐ¸Ð¹ Ð¼ÐµÐ¶Ð´ÑƒÐ½Ð°Ñ€Ð¾Ð´Ð½Ñ‹Ð¹ ÐºÐ¸Ð½Ð¾Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ',
  'Calabar Carnival': 'ÐšÐ°Ñ€Ð½Ð°Ð²Ð°Ð» ÐšÐ°Ð»Ð°Ð±Ð°Ñ€',
  'Calgary Stampede': 'ÐšÐ°Ð»Ð³Ð°Ñ€Ð¸Ð¹ÑÐºÐ¸Ð¹ ÑÑ‚Ð°Ð¼Ð¿Ð¸Ð´',
  'Canadian Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ ÐšÐ°Ð½Ð°Ð´Ñ‹',
  'Cannes Film Festival': 'ÐšÐ°Ð½Ð½ÑÐºÐ¸Ð¹ ÐºÐ¸Ð½Ð¾Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ',
  'Cape Town Marathon': 'ÐšÐµÐ¹Ð¿Ñ‚Ð°ÑƒÐ½ÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½',
  'Champions League Final': 'Ð¤Ð¸Ð½Ð°Ð» Ð›Ð¸Ð³Ð¸ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð¾Ð²',
  'Chile Fiestas Patrias': 'ÐÐ°Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ðµ Ð¿Ñ€Ð°Ð·Ð´Ð½Ð¸ÐºÐ¸ Ð§Ð¸Ð»Ð¸',
  'Coachella 2027': 'ÐšÐ¾Ð°Ñ‡ÐµÐ»Ð»Ð° 2027',
  'Comic-Con International 2026': 'ÐœÐµÐ¶Ð´ÑƒÐ½Ð°Ñ€Ð¾Ð´Ð½Ñ‹Ð¹ Comic-Con 2026',
  'Commonwealth Games': 'Ð˜Ð³Ñ€Ñ‹ Ð¡Ð¾Ð´Ñ€ÑƒÐ¶ÐµÑÑ‚Ð²Ð°',
  'Copa America 2028': 'ÐšÑƒÐ±Ð¾Ðº ÐÐ¼ÐµÑ€Ð¸ÐºÐ¸ 2028',
  'Copa Libertadores Final': 'Ð¤Ð¸Ð½Ð°Ð» ÐšÑƒÐ±ÐºÐ° Ð›Ð¸Ð±ÐµÑ€Ñ‚Ð°Ð´Ð¾Ñ€ÐµÑ',
  'Cricket World Cup 2027': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¼Ð¸Ñ€Ð° Ð¿Ð¾ ÐºÑ€Ð¸ÐºÐµÑ‚Ñƒ 2027',
  'Day of the Dead': 'Ð”ÐµÐ½ÑŒ Ð¼ÐµÑ€Ñ‚Ð²Ñ‹Ñ…',
  'Diwali 2026': 'Ð”Ð¸Ð²Ð°Ð»Ð¸ 2026',
  'Dubai World Cup 2027': 'ÐšÑƒÐ±Ð¾Ðº Ð¼Ð¸Ñ€Ð° Ð”ÑƒÐ±Ð°Ñ 2027',
  'Durban July': 'Ð¡ÐºÐ°Ñ‡ÐºÐ¸ Durban July',
  'Eurovision Song Contest': 'Ð•Ð²Ñ€Ð¾Ð²Ð¸Ð´ÐµÐ½Ð¸Ðµ',
  'FIFA Womenâ€™s World Cup 2027': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¼Ð¸Ñ€Ð° FIFA ÑÑ€ÐµÐ´Ð¸ Ð¶ÐµÐ½Ñ‰Ð¸Ð½ 2027',
  'FIFA World Cup 2026': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¼Ð¸Ñ€Ð° FIFA 2026',
  'Fes Festival of World Sacred Music': 'Ð¤ÐµÑÑÐºÐ¸Ð¹ Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ð´ÑƒÑ…Ð¾Ð²Ð½Ð¾Ð¹ Ð¼ÑƒÐ·Ñ‹ÐºÐ¸ Ð¼Ð¸Ñ€Ð°',
  'Festa Junina': 'Ð¤ÐµÑÑ‚Ð° Ð–ÑƒÐ½Ð¸Ð½Ð°',
  'Fiji Day': 'Ð”ÐµÐ½ÑŒ Ð¤Ð¸Ð´Ð¶Ð¸',
  'French Open / Roland Garros 2026': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¤Ñ€Ð°Ð½Ñ†Ð¸Ð¸ / Ð Ð¾Ð»Ð°Ð½ Ð“Ð°Ñ€Ñ€Ð¾Ñ 2026',
  'Gamescom 2026': 'Gamescom 2026',
  'Glastonbury Festival 2027': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ð“Ð»Ð°ÑÑ‚Ð¾Ð½Ð±ÐµÑ€Ð¸ 2027',
  'Grammy Awards 2027': 'ÐŸÑ€ÐµÐ¼Ð¸Ñ Â«Ð“Ñ€ÑÐ¼Ð¼Ð¸Â» 2027',
  'Great Migration': 'Ð’ÐµÐ»Ð¸ÐºÐ°Ñ Ð¼Ð¸Ð³Ñ€Ð°Ñ†Ð¸Ñ',
  'Hajj 2026': 'Ð¥Ð°Ð´Ð¶ 2026',
  'Hermanus Whale Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ ÐºÐ¸Ñ‚Ð¾Ð² Ð² Ð¥ÐµÑ€Ð¼Ð°Ð½ÑƒÑÐµ',
  'ICC T20 World Cup 2026': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¼Ð¸Ñ€Ð° ICC T20 2026',
  'Indian Premier League Final 2026': 'Ð¤Ð¸Ð½Ð°Ð» Ð˜Ð½Ð´Ð¸Ð¹ÑÐºÐ¾Ð¹ Ð¿Ñ€ÐµÐ¼ÑŒÐµÑ€-Ð»Ð¸Ð³Ð¸ 2026',
  'Indianapolis 500 2026': 'Ð˜Ð½Ð´Ð¸Ð°Ð½Ð°Ð¿Ð¾Ð»Ð¸Ñ 500 2026',
  'Inti Raymi': 'Ð˜Ð½Ñ‚Ð¸ Ð Ð°Ð¹Ð¼Ð¸',
  'Jul i Vinterland': 'Ð Ð¾Ð¶Ð´ÐµÑÑ‚Ð²Ð¾ Ð² Vinterland',
  'KLPGA Oslo Ladies Open': 'Ð–ÐµÐ½ÑÐºÐ¸Ð¹ Ð¾Ñ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‚ÑƒÑ€Ð½Ð¸Ñ€ KLPGA Ð² ÐžÑÐ»Ð¾',
  'Kwita Izina': 'ÐšÐ²Ð¸Ñ‚Ð° Ð˜Ð·Ð¸Ð½Ð°',
  'Lake of Stars Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Â«ÐžÐ·ÐµÑ€Ð¾ Ð·Ð²ÐµÐ·Ð´Â»',
  'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Lake of Stars': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Â«ÐžÐ·ÐµÑ€Ð¾ Ð·Ð²ÐµÐ·Ð´Â»',
  'Las Vegas Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð›Ð°Ñ-Ð’ÐµÐ³Ð°ÑÐ°',
  'Le Mans 24 Hours 2026': '24 Ñ‡Ð°ÑÐ° Ð›Ðµ-ÐœÐ°Ð½Ð° 2026',
  'London Marathon 2027': 'Ð›Ð¾Ð½Ð´Ð¾Ð½ÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½ 2027',
  'Marrakech Film Festival': 'ÐœÐ°Ñ€Ñ€Ð°ÐºÐµÑˆÑÐºÐ¸Ð¹ ÐºÐ¸Ð½Ð¾Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ',
  'Masters Tournament': 'Ð¢ÑƒÑ€Ð½Ð¸Ñ€ Masters',
  'MedellÃ­n Flower Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ñ†Ð²ÐµÑ‚Ð¾Ð² Ð² ÐœÐµÐ´ÐµÐ»ÑŒÐ¸Ð½Ðµ',
  'Melbourne Cup': 'ÐšÑƒÐ±Ð¾Ðº ÐœÐµÐ»ÑŒÐ±ÑƒÑ€Ð½Ð°',
  'Met Gala 2027': 'Ð‘Ð°Ð» Met Gala 2027',
  'Mexico City Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ ÐœÐµÑ…Ð¸ÐºÐ¾',
  'Monaco Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ ÐœÐ¾Ð½Ð°ÐºÐ¾',
  'MotoGP Japan': 'MotoGP Ð¯Ð¿Ð¾Ð½Ð¸Ð¸',
  'NBA Finals 2026': 'Ð¤Ð¸Ð½Ð°Ð» NBA 2026',
  'NRL Grand Final': 'Ð“Ñ€Ð°Ð½Ð´-Ñ„Ð¸Ð½Ð°Ð» NRL',
  "New Year's Eve Copacabana": 'ÐÐ¾Ð²Ñ‹Ð¹ Ð³Ð¾Ð´ Ð½Ð° ÐšÐ¾Ð¿Ð°ÐºÐ°Ð±Ð°Ð½Ðµ',
  'New York City Marathon': 'ÐÑŒÑŽ-Ð™Ð¾Ñ€ÐºÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½',
  'Oktoberfest': 'ÐžÐºÑ‚Ð¾Ð±ÐµÑ€Ñ„ÐµÑÑ‚',
  'Oktoberfest Blumenau': 'ÐžÐºÑ‚Ð¾Ð±ÐµÑ€Ñ„ÐµÑÑ‚ Ð‘Ð»ÑƒÐ¼ÐµÐ½Ð°Ñƒ',
  'Norwegian Constitution Day': 'Ð”ÐµÐ½ÑŒ ÐšÐ¾Ð½ÑÑ‚Ð¸Ñ‚ÑƒÑ†Ð¸Ð¸ ÐÐ¾Ñ€Ð²ÐµÐ³Ð¸Ð¸',
  'PGA Championship': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ PGA',
  'Qatar Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ ÐšÐ°Ñ‚Ð°Ñ€Ð°',
  'Queenstown Winter Festival': 'Ð—Ð¸Ð¼Ð½Ð¸Ð¹ Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ ÐšÑƒÐ¸Ð½ÑÑ‚Ð°ÑƒÐ½Ð°',
  'Rugby World Cup 2027': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¼Ð¸Ñ€Ð° Ð¿Ð¾ Ñ€ÐµÐ³Ð±Ð¸ 2027',
  'Ryder Cup 2027': 'ÐšÑƒÐ±Ð¾Ðº Ð Ð°Ð¹Ð´ÐµÑ€Ð° 2027',
  'Seoul Lantern Festival': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ñ„Ð¾Ð½Ð°Ñ€ÐµÐ¹ Ð² Ð¡ÐµÑƒÐ»Ðµ',
  'Singapore Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð¡Ð¸Ð½Ð³Ð°Ð¿ÑƒÑ€Ð°',
  'Six Nations Championship 2027': 'ÐšÑƒÐ±Ð¾Ðº ÑˆÐµÑÑ‚Ð¸ Ð½Ð°Ñ†Ð¸Ð¹ 2027',
  'Stanley Cup Final 2026': 'Ð¤Ð¸Ð½Ð°Ð» ÐšÑƒÐ±ÐºÐ° Ð¡Ñ‚ÑÐ½Ð»Ð¸ 2026',
  'State of Origin': 'Ð¡ÐµÑ€Ð¸Ñ State of Origin',
  'Summer Olympics 2028': 'Ð›ÐµÑ‚Ð½Ð¸Ðµ ÐžÐ»Ð¸Ð¼Ð¿Ð¸Ð¹ÑÐºÐ¸Ðµ Ð¸Ð³Ñ€Ñ‹ 2028',
  'Super Bowl LX': 'Ð¡ÑƒÐ¿ÐµÑ€Ð±Ð¾ÑƒÐ» LX',
  'Sydney Marathon': 'Ð¡Ð¸Ð´Ð½ÐµÐ¹ÑÐºÐ¸Ð¹ Ð¼Ð°Ñ€Ð°Ñ„Ð¾Ð½',
  "Sydney New Year's Eve": 'ÐÐ¾Ð²Ñ‹Ð¹ Ð³Ð¾Ð´ Ð² Ð¡Ð¸Ð´Ð½ÐµÐµ',
  'SÃ£o Paulo Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð¡Ð°Ð½-ÐŸÐ°ÑƒÐ»Ñƒ',
  'The Open Championship': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¿Ð¾ Ð³Ð¾Ð»ÑŒÑ„Ñƒ',
  'Tomorrowland 2026': 'Tomorrowland 2026',
  'Tour de France': 'Ð¢ÑƒÑ€ Ð´Ðµ Ð¤Ñ€Ð°Ð½Ñ',
  'U.S. Open Golf': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¡Ð¨Ð Ð¿Ð¾ Ð³Ð¾Ð»ÑŒÑ„Ñƒ',
  'U.S. Open Ð¿Ð¾ Ð³Ð¾Ð»ÑŒÑ„Ñƒ': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¡Ð¨Ð Ð¿Ð¾ Ð³Ð¾Ð»ÑŒÑ„Ñƒ',
  'UEFA European Championship 2028': 'Ð§ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð•Ð²Ñ€Ð¾Ð¿Ñ‹ UEFA 2028',
  'US Open Tennis': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¡Ð¨Ð Ð¿Ð¾ Ñ‚ÐµÐ½Ð½Ð¸ÑÑƒ',
  'US Open Ð¿Ð¾ Ñ‚ÐµÐ½Ð½Ð¸ÑÑƒ': 'ÐžÑ‚ÐºÑ€Ñ‹Ñ‚Ñ‹Ð¹ Ñ‡ÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ‚ Ð¡Ð¨Ð Ð¿Ð¾ Ñ‚ÐµÐ½Ð½Ð¸ÑÑƒ',
  'Ultra Music Festival 2027': 'ÐœÑƒÐ·Ñ‹ÐºÐ°Ð»ÑŒÐ½Ñ‹Ð¹ Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Ultra 2027',
  'United States Grand Prix': 'Ð“Ñ€Ð°Ð½-Ð¿Ñ€Ð¸ Ð¡Ð¨Ð',
  'Venice Film Festival': 'Ð’ÐµÐ½ÐµÑ†Ð¸Ð°Ð½ÑÐºÐ¸Ð¹ ÐºÐ¸Ð½Ð¾Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ',
  'Vivid Sydney': 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ Vivid Sydney',
  'Wimbledon': 'Ð£Ð¸Ð¼Ð±Ð»Ð´Ð¾Ð½',
  'Winter Olympics 2030': 'Ð—Ð¸Ð¼Ð½Ð¸Ðµ ÐžÐ»Ð¸Ð¼Ð¿Ð¸Ð¹ÑÐºÐ¸Ðµ Ð¸Ð³Ñ€Ñ‹ 2030',
  'World Series 2026': 'ÐœÐ¸Ñ€Ð¾Ð²Ð°Ñ ÑÐµÑ€Ð¸Ñ 2026',
  'Yi Peng &amp; Loy Krathong': 'Ð™Ð¸ ÐŸÐµÐ½Ð³ Ð¸ Ð›Ð¾Ð¹ ÐšÑ€Ð°Ñ‚Ñ…Ð¾Ð½Ð³'
}));

const monthHeaders = {
  January: 'Ð¯Ð½Ð²Ð°Ñ€ÑŒ',
  February: 'Ð¤ÐµÐ²Ñ€Ð°Ð»ÑŒ',
  March: 'ÐœÐ°Ñ€Ñ‚',
  April: 'ÐÐ¿Ñ€ÐµÐ»ÑŒ',
  May: 'ÐœÐ°Ð¹',
  June: 'Ð˜ÑŽÐ½ÑŒ',
  July: 'Ð˜ÑŽÐ»ÑŒ',
  August: 'ÐÐ²Ð³ÑƒÑÑ‚',
  September: 'Ð¡ÐµÐ½Ñ‚ÑÐ±Ñ€ÑŒ',
  October: 'ÐžÐºÑ‚ÑÐ±Ñ€ÑŒ',
  November: 'ÐÐ¾ÑÐ±Ñ€ÑŒ',
  December: 'Ð”ÐµÐºÐ°Ð±Ñ€ÑŒ'
};

const dateMonths = {
  Jan: 'ÑÐ½Ð².',
  Feb: 'Ñ„ÐµÐ².',
  Mar: 'Ð¼Ð°Ñ€.',
  Apr: 'Ð°Ð¿Ñ€.',
  May: 'Ð¼Ð°Ñ',
  Jun: 'Ð¸ÑŽÐ½.',
  Jul: 'Ð¸ÑŽÐ».',
  Aug: 'Ð°Ð²Ð³.',
  Sep: 'ÑÐµÐ½.',
  Oct: 'Ð¾ÐºÑ‚.',
  Nov: 'Ð½Ð¾Ñ.',
  Dec: 'Ð´ÐµÐº.'
};

const placeTerms = [
  ['United Kingdom and Ireland', 'Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ Ð¸ Ð˜Ñ€Ð»Ð°Ð½Ð´Ð¸Ñ'],
  ['England, France, Ireland, Italy, Scotland and Wales', 'ÐÐ½Ð³Ð»Ð¸Ñ, Ð¤Ñ€Ð°Ð½Ñ†Ð¸Ñ, Ð˜Ñ€Ð»Ð°Ð½Ð´Ð¸Ñ, Ð˜Ñ‚Ð°Ð»Ð¸Ñ, Ð¨Ð¾Ñ‚Ð»Ð°Ð½Ð´Ð¸Ñ Ð¸ Ð£ÑÐ»ÑŒÑ'],
  ['Kenya, Tanzania and Uganda', 'ÐšÐµÐ½Ð¸Ñ, Ð¢Ð°Ð½Ð·Ð°Ð½Ð¸Ñ Ð¸ Ð£Ð³Ð°Ð½Ð´Ð°'],
  ['South Africa, Zimbabwe and Namibia', 'Ð®ÐÐ , Ð—Ð¸Ð¼Ð±Ð°Ð±Ð²Ðµ Ð¸ ÐÐ°Ð¼Ð¸Ð±Ð¸Ñ'],
  ['India and Sri Lanka', 'Ð˜Ð½Ð´Ð¸Ñ Ð¸ Ð¨Ñ€Ð¸-Ð›Ð°Ð½ÐºÐ°'],
  ['South America / Americas', 'Ð®Ð¶Ð½Ð°Ñ ÐÐ¼ÐµÑ€Ð¸ÐºÐ° / ÐÐ¼ÐµÑ€Ð¸ÐºÐ°'],
  ['USA / Canada', 'Ð¡Ð¨Ð / ÐšÐ°Ð½Ð°Ð´Ð°'],
  ['French Alps', 'Ð¤Ñ€Ð°Ð½Ñ†ÑƒÐ·ÑÐºÐ¸Ðµ ÐÐ»ÑŒÐ¿Ñ‹'],
  ['Los Angeles', 'Ð›Ð¾Ñ-ÐÐ½Ð´Ð¶ÐµÐ»ÐµÑ'],
  ['Las Vegas', 'Ð›Ð°Ñ-Ð’ÐµÐ³Ð°Ñ'],
  ['San Diego', 'Ð¡Ð°Ð½-Ð”Ð¸ÐµÐ³Ð¾'],
  ['New York', 'ÐÑŒÑŽ-Ð™Ð¾Ñ€Ðº'],
  ['Santa Clara', 'Ð¡Ð°Ð½Ñ‚Ð°-ÐšÐ»Ð°Ñ€Ð°'],
  ['Indianapolis', 'Ð˜Ð½Ð´Ð¸Ð°Ð½Ð°Ð¿Ð¾Ð»Ð¸Ñ'],
  ['Southampton', 'Ð¡Ð°ÑƒÑ‚Ð³ÐµÐ¼Ð¿Ñ‚Ð¾Ð½'],
  ['Melbourne', 'ÐœÐµÐ»ÑŒÐ±ÑƒÑ€Ð½'],
  ['Somerset', 'Ð¡Ð¾Ð¼ÐµÑ€ÑÐµÑ‚'],
  ['Boston', 'Ð‘Ð¾ÑÑ‚Ð¾Ð½'],
  ['London', 'Ð›Ð¾Ð½Ð´Ð¾Ð½'],
  ['Berlin', 'Ð‘ÐµÑ€Ð»Ð¸Ð½'],
  ['Cologne', 'ÐšÐµÐ»ÑŒÐ½'],
  ['Cannes', 'ÐšÐ°Ð½Ð½Ñ‹'],
  ['Paris', 'ÐŸÐ°Ñ€Ð¸Ð¶'],
  ['Dubai', 'Ð”ÑƒÐ±Ð°Ð¹'],
  ['Miami', 'ÐœÐ°Ð¹Ð°Ð¼Ð¸'],
  ['Adare', 'ÐÐ´Ð°Ñ€'],
  ['Le Mans', 'Ð›Ðµ-ÐœÐ°Ð½'],
  ['Indio', 'Ð˜Ð½Ð´Ð¸Ð¾'],
  ['Boom', 'Ð‘Ð¾Ð¼'],
  ['Saudi Arabia', 'Ð¡Ð°ÑƒÐ´Ð¾Ð²ÑÐºÐ°Ñ ÐÑ€Ð°Ð²Ð¸Ñ'],
  ['South Africa', 'Ð®ÐÐ '],
  ['New Zealand', 'ÐÐ¾Ð²Ð°Ñ Ð—ÐµÐ»Ð°Ð½Ð´Ð¸Ñ'],
  ['United Kingdom', 'Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ'],
  ['Australia', 'ÐÐ²ÑÑ‚Ñ€Ð°Ð»Ð¸Ñ'],
  ['Brazil', 'Ð‘Ñ€Ð°Ð·Ð¸Ð»Ð¸Ñ'],
  ['Canada', 'ÐšÐ°Ð½Ð°Ð´Ð°'],
  ['Belgium', 'Ð‘ÐµÐ»ÑŒÐ³Ð¸Ñ'],
  ['France', 'Ð¤Ñ€Ð°Ð½Ñ†Ð¸Ñ'],
  ['Germany', 'Ð“ÐµÑ€Ð¼Ð°Ð½Ð¸Ñ'],
  ['Ireland', 'Ð˜Ñ€Ð»Ð°Ð½Ð´Ð¸Ñ'],
  ['India', 'Ð˜Ð½Ð´Ð¸Ñ'],
  ['USA', 'Ð¡Ð¨Ð'],
  ['UK', 'Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ'],
  ['UAE', 'ÐžÐÐ­'],
  ['TBC', 'ÑƒÑ‚Ð¾Ñ‡Ð½ÑÐµÑ‚ÑÑ']
];

const topicNames = {
  'formula-1': 'Ð¤Ð¾Ñ€Ð¼ÑƒÐ»Ð°-1',
  motogp: 'MotoGP',
  football: 'Ð¤ÑƒÑ‚Ð±Ð¾Ð»',
  golf: 'Ð“Ð¾Ð»ÑŒÑ„',
  tennis: 'Ð¢ÐµÐ½Ð½Ð¸Ñ',
  rugby: 'Ð ÐµÐ³Ð±Ð¸',
  running: 'Ð‘ÐµÐ³',
  cycling: 'Ð’ÐµÐ»Ð¾ÑÐ¿Ð¾Ñ€Ñ‚',
  'horse-racing': 'Ð¡ÐºÐ°Ñ‡ÐºÐ¸',
  'multi-sport': 'ÐœÑƒÐ»ÑŒÑ‚Ð¸ÑÐ¿Ð¾Ñ€Ñ‚',
  'aussie-rules': 'ÐÐ²ÑÑ‚Ñ€Ð°Ð»Ð¸Ð¹ÑÐºÐ¸Ð¹ Ñ„ÑƒÑ‚Ð±Ð¾Ð»',
  music: 'ÐœÑƒÐ·Ñ‹ÐºÐ°',
  art: 'Ð˜ÑÐºÑƒÑÑÑ‚Ð²Ð¾',
  'food-drink': 'Ð•Ð´Ð° Ð¸ Ð½Ð°Ð¿Ð¸Ñ‚ÐºÐ¸',
  carnival: 'ÐšÐ°Ñ€Ð½Ð°Ð²Ð°Ð»',
  'new-years': 'ÐÐ¾Ð²Ñ‹Ð¹ Ð³Ð¾Ð´',
  winter: 'Ð—Ð¸Ð¼Ð°',
  film: 'ÐšÐ¸Ð½Ð¾',
  religion: 'Ð ÐµÐ»Ð¸Ð³Ð¸Ñ',
  'national-day': 'ÐÐ°Ñ†Ð¸Ð¾Ð½Ð°Ð»ÑŒÐ½Ñ‹Ð¹ Ð´ÐµÐ½ÑŒ',
  tradition: 'Ð¢Ñ€Ð°Ð´Ð¸Ñ†Ð¸Ð¸',
  wildlife: 'Ð”Ð¸ÐºÐ°Ñ Ð¿Ñ€Ð¸Ñ€Ð¾Ð´Ð°',
  cricket: 'ÐšÑ€Ð¸ÐºÐµÑ‚',
  'ice-hockey': 'Ð¥Ð¾ÐºÐºÐµÐ¹',
  basketball: 'Ð‘Ð°ÑÐºÐµÑ‚Ð±Ð¾Ð»',
  'pop-culture': 'ÐŸÐ¾Ð¿-ÐºÑƒÐ»ÑŒÑ‚ÑƒÑ€Ð°',
  'music-festivals': 'ÐœÑƒÐ·Ñ‹ÐºÐ°Ð»ÑŒÐ½Ñ‹Ðµ Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»Ð¸',
  marathon: 'ÐœÐ°Ñ€Ð°Ñ„Ð¾Ð½',
  awards: 'ÐŸÑ€ÐµÐ¼Ð¸Ð¸',
  fashion: 'ÐœÐ¾Ð´Ð°',
  'tech-events': 'Ð¢ÐµÑ…Ð½Ð¾Ð»Ð¾Ð³Ð¸Ð¸',
  motorsport: 'ÐÐ²Ñ‚Ð¾ÑÐ¿Ð¾Ñ€Ñ‚'
};

const countryNames = {
  australia: 'ÐÐ²ÑÑ‚Ñ€Ð°Ð»Ð¸Ñ',
  'new-zealand': 'ÐÐ¾Ð²Ð°Ñ Ð—ÐµÐ»Ð°Ð½Ð´Ð¸Ñ',
  fiji: 'Ð¤Ð¸Ð´Ð¶Ð¸',
  usa: 'Ð¡Ð¨Ð',
  canada: 'ÐšÐ°Ð½Ð°Ð´Ð°',
  mexico: 'ÐœÐµÐºÑÐ¸ÐºÐ°',
  france: 'Ð¤Ñ€Ð°Ð½Ñ†Ð¸Ñ',
  germany: 'Ð“ÐµÑ€Ð¼Ð°Ð½Ð¸Ñ',
  uk: 'Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ',
  'united-kingdom': 'Ð’ÐµÐ»Ð¸ÐºÐ¾Ð±Ñ€Ð¸Ñ‚Ð°Ð½Ð¸Ñ',
  italy: 'Ð˜Ñ‚Ð°Ð»Ð¸Ñ',
  monaco: 'ÐœÐ¾Ð½Ð°ÐºÐ¾',
  norway: 'ÐÐ¾Ñ€Ð²ÐµÐ³Ð¸Ñ',
  tbc: 'ÑƒÑ‚Ð¾Ñ‡Ð½ÑÐµÑ‚ÑÑ',
  morocco: 'ÐœÐ°Ñ€Ð¾ÐºÐºÐ¾',
  'south-africa': 'Ð®ÐÐ ',
  kenya: 'ÐšÐµÐ½Ð¸Ñ',
  rwanda: 'Ð ÑƒÐ°Ð½Ð´Ð°',
  malawi: 'ÐœÐ°Ð»Ð°Ð²Ð¸',
  egypt: 'Ð•Ð³Ð¸Ð¿ÐµÑ‚',
  nigeria: 'ÐÐ¸Ð³ÐµÑ€Ð¸Ñ',
  japan: 'Ð¯Ð¿Ð¾Ð½Ð¸Ñ',
  indonesia: 'Ð˜Ð½Ð´Ð¾Ð½ÐµÐ·Ð¸Ñ',
  india: 'Ð˜Ð½Ð´Ð¸Ñ',
  singapore: 'Ð¡Ð¸Ð½Ð³Ð°Ð¿ÑƒÑ€',
  'south-korea': 'Ð®Ð¶Ð½Ð°Ñ ÐšÐ¾Ñ€ÐµÑ',
  thailand: 'Ð¢Ð°Ð¸Ð»Ð°Ð½Ð´',
  qatar: 'ÐšÐ°Ñ‚Ð°Ñ€',
  uae: 'ÐžÐÐ­',
  'saudi-arabia': 'Ð¡Ð°ÑƒÐ´Ð¾Ð²ÑÐºÐ°Ñ ÐÑ€Ð°Ð²Ð¸Ñ',
  brazil: 'Ð‘Ñ€Ð°Ð·Ð¸Ð»Ð¸Ñ',
  argentina: 'ÐÑ€Ð³ÐµÐ½Ñ‚Ð¸Ð½Ð°',
  colombia: 'ÐšÐ¾Ð»ÑƒÐ¼Ð±Ð¸Ñ',
  peru: 'ÐŸÐµÑ€Ñƒ',
  chile: 'Ð§Ð¸Ð»Ð¸',
  sweden: 'Ð¨Ð²ÐµÑ†Ð¸Ñ',
  denmark: 'Ð”Ð°Ð½Ð¸Ñ',
  finland: 'Ð¤Ð¸Ð½Ð»ÑÐ½Ð´Ð¸Ñ',
  ireland: 'Ð˜Ñ€Ð»Ð°Ð½Ð´Ð¸Ñ',
  spain: 'Ð˜ÑÐ¿Ð°Ð½Ð¸Ñ',
  portugal: 'ÐŸÐ¾Ñ€Ñ‚ÑƒÐ³Ð°Ð»Ð¸Ñ',
  netherlands: 'ÐÐ¸Ð´ÐµÑ€Ð»Ð°Ð½Ð´Ñ‹',
  belgium: 'Ð‘ÐµÐ»ÑŒÐ³Ð¸Ñ',
  austria: 'ÐÐ²ÑÑ‚Ñ€Ð¸Ñ',
  switzerland: 'Ð¨Ð²ÐµÐ¹Ñ†Ð°Ñ€Ð¸Ñ',
  poland: 'ÐŸÐ¾Ð»ÑŒÑˆÐ°',
  czechia: 'Ð§ÐµÑ…Ð¸Ñ',
  hungary: 'Ð’ÐµÐ½Ð³Ñ€Ð¸Ñ',
  greece: 'Ð“Ñ€ÐµÑ†Ð¸Ñ',
  romania: 'Ð ÑƒÐ¼Ñ‹Ð½Ð¸Ñ',
  ukraine: 'Ð£ÐºÑ€Ð°Ð¸Ð½Ð°',
  china: 'ÐšÐ¸Ñ‚Ð°Ð¹',
  malaysia: 'ÐœÐ°Ð»Ð°Ð¹Ð·Ð¸Ñ',
  pakistan: 'ÐŸÐ°ÐºÐ¸ÑÑ‚Ð°Ð½',
  bangladesh: 'Ð‘Ð°Ð½Ð³Ð»Ð°Ð´ÐµÑˆ'
};

const continentNames = {
  africa: 'ÐÑ„Ñ€Ð¸ÐºÐ°',
  asia: 'ÐÐ·Ð¸Ñ',
  europe: 'Ð•Ð²Ñ€Ð¾Ð¿Ð°',
  'north-america': 'Ð¡ÐµÐ²ÐµÑ€Ð½Ð°Ñ ÐÐ¼ÐµÑ€Ð¸ÐºÐ°',
  oceania: 'ÐžÐºÐµÐ°Ð½Ð¸Ñ',
  'south-america': 'Ð®Ð¶Ð½Ð°Ñ ÐÐ¼ÐµÑ€Ð¸ÐºÐ°'
};

function translateMeta(text) {
  let out = text;
  for (const [en, ru] of Object.entries(dateMonths)) {
    out = out.replace(new RegExp(`\\b${en}\\b`, 'g'), ru);
  }
  for (const [en, ru] of placeTerms) {
    out = out.split(en).join(ru);
  }
  return out;
}

html = html.replace(/<html lang="[^"]*"/, '<html lang="ru"');
html = html.replace(/<title>[^<]*<\/title>/, '<title>ÐšÐ°Ð»ÐµÐ½Ð´Ð°Ñ€ÑŒ Ð¼Ð¸Ñ€Ð¾Ð²Ñ‹Ñ… ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ð¹ | OneSliders</title>');
html = html.replace(/<meta name="description" content="[^"]*"/, '<meta name="description" content="ÐœÐ¸Ñ€Ð¾Ð²Ð¾Ð¹ ÐºÐ°Ð»ÐµÐ½Ð´Ð°Ñ€ÑŒ ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ð¹ OneSliders ÑÐ¾ ÑÐ¿Ð¾Ñ€Ñ‚Ð¾Ð¼, Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑÐ¼Ð¸, ÐºÑƒÐ»ÑŒÑ‚ÑƒÑ€Ð¾Ð¹ Ð¸ Ð¿Ñ€Ð¸Ñ€Ð¾Ð´Ð½Ñ‹Ð¼Ð¸ ÑÐ²Ð»ÐµÐ½Ð¸ÑÐ¼Ð¸ Ð¿Ð¾ Ð¼ÐµÑÑÑ†Ð°Ð¼."');
html = html.replace(/<span class="hero-kicker">[^<]*<\/span>/, '<span class="hero-kicker">ÐœÐ¸Ñ€Ð¾Ð²Ð¾Ð¹ ÐºÐ°Ð»ÐµÐ½Ð´Ð°Ñ€ÑŒ</span>');
html = html.replace(/<h1>[^<]*<\/h1>/, '<h1>ÐœÐ¸Ñ€Ð¾Ð²Ñ‹Ðµ ÑÐ¾Ð±Ñ‹Ñ‚Ð¸Ñ, Ð²Ð¾ÐºÑ€ÑƒÐ³ ÐºÐ¾Ñ‚Ð¾Ñ€Ñ‹Ñ… ÑÑ‚Ð¾Ð¸Ñ‚ Ð¿Ð»Ð°Ð½Ð¸Ñ€Ð¾Ð²Ð°Ñ‚ÑŒ Ð¿Ð¾ÐµÐ·Ð´ÐºÐ¸</h1>');
html = html.replace(/<p>[^<]*Sports, festivals, culture and natural spectacles, arranged month by month\.[^<]*<\/p>/, '<p>Ð¡Ð¿Ð¾Ñ€Ñ‚, Ñ„ÐµÑÑ‚Ð¸Ð²Ð°Ð»Ð¸, ÐºÑƒÐ»ÑŒÑ‚ÑƒÑ€Ð° Ð¸ Ð¿Ñ€Ð¸Ñ€Ð¾Ð´Ð½Ñ‹Ðµ ÑÐ²Ð»ÐµÐ½Ð¸Ñ, Ñ€Ð°Ð·Ð»Ð¾Ð¶ÐµÐ½Ð½Ñ‹Ðµ Ð¿Ð¾ Ð¼ÐµÑÑÑ†Ð°Ð¼.</p>');

replaceAll('title="Events" aria-label="Events"', 'title="Ð¡Ð¾Ð±Ñ‹Ñ‚Ð¸Ñ" aria-label="Ð¡Ð¾Ð±Ñ‹Ñ‚Ð¸Ñ"');
replaceAll('title="World" aria-label="World"', 'title="ÐœÐ¸Ñ€" aria-label="ÐœÐ¸Ñ€"');
replaceAll('title="Categories" aria-label="Categories"', 'title="ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸" aria-label="ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸"');
replaceAll('<span>Languages</span>', '<span>Ð¯Ð·Ñ‹Ðº</span>');
replaceAll("content: 'â— Global'", "content: 'â— ÐœÐ¸Ñ€'");
replaceAll("content: 'â— Continent'", "content: 'â— ÐšÐ¾Ð½Ñ‚Ð¸Ð½ÐµÐ½Ñ‚'");
replaceAll("content: 'â— National'", "content: 'â— Ð¡Ñ‚Ñ€Ð°Ð½Ð°'");

html = html.replace(/(<button class="filter-btn" data-cont="africa">)[^<]*(<\/button>)/, '$1ðŸŒ ÐÑ„Ñ€Ð¸ÐºÐ°$2');
html = html.replace(/(<button class="filter-btn" data-cont="asia">)[^<]*(<\/button>)/, '$1ðŸŒ ÐÐ·Ð¸Ñ$2');
html = html.replace(/(<button class="filter-btn" data-cont="europe">)[^<]*(<\/button>)/, '$1ðŸŒ Ð•Ð²Ñ€Ð¾Ð¿Ð°$2');
html = html.replace(/(<button class="filter-btn" data-cont="north-america">)[^<]*(<\/button>)/, '$1ðŸŒŽ Ð¡ÐµÐ². ÐÐ¼ÐµÑ€Ð¸ÐºÐ°$2');
html = html.replace(/(<button class="filter-btn" data-cont="oceania">)[^<]*(<\/button>)/, '$1ðŸŒ ÐžÐºÐµÐ°Ð½Ð¸Ñ$2');
html = html.replace(/(<button class="filter-btn" data-cont="south-america">)[^<]*(<\/button>)/, '$1ðŸŒŽ Ð®Ð¶. ÐÐ¼ÐµÑ€Ð¸ÐºÐ°$2');

html = html.replace(/<span class="cat-pill">([^<]+)<\/span>/g, (_, label) => {
  const icon = label.match(/^[^\p{L}\p{N}]+/u)?.[0] || '';
  const clean = label.replace(/^[^\p{L}\p{N}]+/u, '').trim();
  const translated = {
    Sport: 'Ð¡Ð¿Ð¾Ñ€Ñ‚',
    'Motor sport': 'ÐÐ²Ñ‚Ð¾ÑÐ¿Ð¾Ñ€Ñ‚',
    Festival: 'Ð¤ÐµÑÑ‚Ð¸Ð²Ð°Ð»ÑŒ',
    Culture: 'ÐšÑƒÐ»ÑŒÑ‚ÑƒÑ€Ð°',
    Nature: 'ÐŸÑ€Ð¸Ñ€Ð¾Ð´Ð°'
  }[clean] || clean;
  return `<span class="cat-pill">${icon}${translated}</span>`;
});

html = html.replace(/<strong class="card-title">([^<]+)<\/strong>/g, (_, title) => (
  `<strong class="card-title">${eventTitles.get(title) || title}</strong>`
));

html = html.replace(/<span class="month-title">([^<]+)<\/span>/g, (_, label) => {
  const translated = label.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g, m => monthHeaders[m]);
  return `<span class="month-title">${translated}</span>`;
});

html = html.replace(/<span class="card-meta">([^<]*)<\/span>/g, (_, meta) => (
  `<span class="card-meta">${translateMeta(meta)}</span>`
));

html = html.replace(/const topicNames = \{[\s\S]*?\n    \};/, `const topicNames = ${JSON.stringify(topicNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};`);
html = html.replace(/const countryNames = \{[\s\S]*?\n    \};/, `const countryNames = ${JSON.stringify(countryNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};
    const continentNames = ${JSON.stringify(continentNames, null, 6).replace(/"([^"]+)":/g, "'$1':").replace(/"/g, "'")};`);
html = html.replace(
  /if \(k === userContinent\) seen\.add\(c\.replace\(\/-\/g,' '\)\.replace\(\/\\b\\w\/g,x=>x\.toUpperCase\(\)\)\);/g,
  "if (k === userContinent) seen.add(countryNames[c] || c.replace(/-/g,' '));"
);
html = html.replace(
  /const contLabel = userContinent\.replace\(\/-\/g,' '\)\.replace\(\/\\b\\w\/g,x=>x\.toUpperCase\(\)\);/g,
  "const contLabel = continentNames[userContinent] || userContinent.replace(/-/g,' ');"
);

fs.writeFileSync(file, html, 'utf8');
