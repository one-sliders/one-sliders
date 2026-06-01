import fs from 'node:fs';
import path from 'node:path';
import { languages, profiles, codeLabel } from './event-language-profiles.mjs';

const root = process.cwd();
const languageNames = {
  en: 'English', ar: 'Arabic', sw: 'Kiswahili', ha: 'Hausa', zh: 'Chinese', hi: 'Hindi',
  ru: 'Russian', de: 'Deutsch', fr: 'Francais', es: 'Espanol', pt: 'Portugues',
  qu: 'Quechua', tpi: 'Tok Pisin', mi: 'Maori'
};

const packs = {
  en: {
    climate: 'Climate', weather: 'Climate Weather', action: 'Climate Action', marine: 'Marine', sustainability: 'Sustainability',
    day: 'Day', stage: 'Stage', happens: 'What happens', related: 'Related on OneSliders', topic: 'Topic', calendar: 'Calendar', worldIndex: 'World events index',
    context: 'What matters most when reading this climate event in context.', sources: 'Sources', updated: 'Updated 14 May 2026', external: 'external',
    high: 'High', strong: 'Strong', veryHigh: 'Very high',
    places: { worldwide: 'Worldwide', geneva: 'Geneva, Switzerland', azerbaijan: 'Azerbaijan', atlantic: 'Atlantic basin', antalya: 'Antalya, Turkiye', communities: 'Local communities', coastal: 'Coastal communities', cleanup: 'Local cleanup sites', wmo: 'World Meteorological Organization', globalActions: 'Global local actions', observance: 'Global observance', marineOrgs: 'Coasts, schools and marine organizations', basinVenue: 'Atlantic Ocean, Caribbean and Gulf coasts', copVenue: 'UN Climate Change Conference venue' }
  },
  ar: {
    climate: 'المناخ', weather: 'طقس المناخ', action: 'العمل المناخي', marine: 'البحار والمحيطات', sustainability: 'الاستدامة',
    day: 'اليوم', stage: 'المرحلة', happens: 'ما يحدث', related: 'مرتبط على OneSliders', topic: 'الموضوع', calendar: 'التقويم', worldIndex: 'فهرس أحداث العالم',
    context: 'أهم ما يجب النظر إليه عند قراءة هذا الحدث المناخي في سياقه.', sources: 'المصادر', updated: 'تم التحديث 14 مايو 2026', external: 'خارجي',
    high: 'مرتفع', strong: 'قوي', veryHigh: 'مرتفع جدا',
    places: { worldwide: 'حول العالم', geneva: 'جنيف، سويسرا', azerbaijan: 'أذربيجان', atlantic: 'حوض الأطلسي', antalya: 'أنطاليا، تركيا', communities: 'مجتمعات محلية', coastal: 'مجتمعات ساحلية', cleanup: 'مواقع تنظيف محلية', wmo: 'المنظمة العالمية للأرصاد الجوية', globalActions: 'أنشطة محلية عالمية', observance: 'مناسبة عالمية', marineOrgs: 'السواحل والمدارس والمنظمات البحرية', basinVenue: 'الأطلسي والكاريبي وسواحل الخليج', copVenue: 'مقر مؤتمر الأمم المتحدة للمناخ' }
  },
  sw: {
    climate: 'Hali ya hewa', weather: 'Hali ya hewa na tabianchi', action: 'Hatua za tabianchi', marine: 'Bahari', sustainability: 'Uendelevu',
    day: 'Siku', stage: 'Hatua', happens: 'Kinachotokea', related: 'Yanayohusiana kwenye OneSliders', topic: 'Mada', calendar: 'Kalenda', worldIndex: 'Orodha ya matukio ya dunia',
    context: 'Mambo muhimu zaidi ya kuangalia unapoisoma tukio hili la tabianchi katika muktadha.', sources: 'Vyanzo', updated: 'Imesasishwa 14 Mei 2026', external: 'nje',
    high: 'Juu', strong: 'Imara', veryHigh: 'Juu sana',
    places: { worldwide: 'Duniani kote', geneva: 'Geneva, Uswisi', azerbaijan: 'Azerbaijan', atlantic: 'Bonde la Atlantiki', antalya: 'Antalya, Uturuki', communities: 'Jamii za mahali', coastal: 'Jamii za pwani', cleanup: 'Maeneo ya usafi ya mahali', wmo: 'Shirika la Hali ya Hewa Duniani', globalActions: 'Hatua za mahali duniani', observance: 'Maadhimisho ya dunia', marineOrgs: 'Pwani, shule na mashirika ya bahari', basinVenue: 'Bahari ya Atlantiki, Karibiani na pwani za Ghuba', copVenue: 'Ukumbi wa mkutano wa UN wa tabianchi' }
  },
  ha: {
    climate: 'Sauyin yanayi', weather: 'Yanayin sauyin yanayi', action: 'Aikin sauyin yanayi', marine: 'Tekuna', sustainability: 'Dorewa',
    day: 'Rana', stage: 'Mataki', happens: 'Abin da ke faruwa', related: 'Masu alaka a OneSliders', topic: 'Maudu’i', calendar: 'Kalanda', worldIndex: 'Jerin abubuwan duniya',
    context: 'Abin da ya fi muhimmanci a kalla yayin karanta wannan abin sauyin yanayi.', sources: 'Tushe', updated: 'An sabunta 14 Mayu 2026', external: 'na waje',
    high: 'Babba', strong: 'Mai karfi', veryHigh: 'Babba sosai',
    places: { worldwide: 'Duniya baki daya', geneva: 'Geneva, Switzerland', azerbaijan: 'Azerbaijan', atlantic: 'Tekun Atlantika', antalya: 'Antalya, Turkiyya', communities: 'Alummomin gida', coastal: 'Alummomin bakin teku', cleanup: 'Wuraren tsaftacewa na gida', wmo: 'Hukumar Yanayi ta Duniya', globalActions: 'Ayyukan gida na duniya', observance: 'Bikin duniya', marineOrgs: 'Bakin teku, makarantu da kungiyoyin teku', basinVenue: 'Tekun Atlantika, Caribbean da bakin tekun Gulf', copVenue: 'Wurin taron sauyin yanayi na UN' }
  },
  zh: {
    climate: '气候', weather: '气候天气', action: '气候行动', marine: '海洋', sustainability: '可持续发展',
    day: '日期', stage: '阶段', happens: '内容', related: 'OneSliders 相关内容', topic: '主题', calendar: '日历', worldIndex: '世界事件索引',
    context: '阅读这个气候事件时最需要关注的背景信号。', sources: '来源', updated: '更新于 2026年5月14日', external: '外部',
    high: '高', strong: '较强', veryHigh: '很高',
    places: { worldwide: '全球', geneva: '瑞士日内瓦', azerbaijan: '阿塞拜疆', atlantic: '大西洋盆地', antalya: '土耳其安塔利亚', communities: '本地社区', coastal: '沿海社区', cleanup: '本地清理地点', wmo: '世界气象组织', globalActions: '全球本地行动', observance: '全球纪念日', marineOrgs: '海岸、学校和海洋组织', basinVenue: '大西洋、加勒比和墨西哥湾沿岸', copVenue: '联合国气候变化大会会场' }
  },
  hi: {
    climate: 'जलवायु', weather: 'जलवायु मौसम', action: 'जलवायु कार्रवाई', marine: 'समुद्री', sustainability: 'स्थिरता',
    day: 'दिन', stage: 'चरण', happens: 'क्या होता है', related: 'OneSliders पर संबंधित', topic: 'विषय', calendar: 'कैलेंडर', worldIndex: 'विश्व कार्यक्रम सूची',
    context: 'इस जलवायु कार्यक्रम को संदर्भ में पढ़ते समय सबसे महत्वपूर्ण संकेत।', sources: 'स्रोत', updated: '14 मई 2026 को अपडेट', external: 'बाहरी',
    high: 'ऊंचा', strong: 'मजबूत', veryHigh: 'बहुत ऊंचा',
    places: { worldwide: 'दुनिया भर में', geneva: 'जिनेवा, स्विट्जरलैंड', azerbaijan: 'अजरबैजान', atlantic: 'अटलांटिक बेसिन', antalya: 'अंताल्या, तुर्किये', communities: 'स्थानीय समुदाय', coastal: 'तटीय समुदाय', cleanup: 'स्थानीय सफाई स्थल', wmo: 'विश्व मौसम विज्ञान संगठन', globalActions: 'वैश्विक स्थानीय कार्रवाइयां', observance: 'वैश्विक दिवस', marineOrgs: 'तट, स्कूल और समुद्री संगठन', basinVenue: 'अटलांटिक महासागर, कैरिबियन और खाड़ी तट', copVenue: 'संयुक्त राष्ट्र जलवायु सम्मेलन स्थल' }
  },
  ru: {
    climate: 'Климат', weather: 'Климатическая погода', action: 'Климатические действия', marine: 'Океаны и море', sustainability: 'Устойчивость',
    day: 'День', stage: 'Этап', happens: 'Что происходит', related: 'Связано на OneSliders', topic: 'Тема', calendar: 'Календарь', worldIndex: 'Индекс мировых событий',
    context: 'Самые важные сигналы при чтении этого климатического события в контексте.', sources: 'Источники', updated: 'Обновлено 14 мая 2026', external: 'внешний',
    high: 'Высокий', strong: 'Сильный', veryHigh: 'Очень высокий',
    places: { worldwide: 'По всему миру', geneva: 'Женева, Швейцария', azerbaijan: 'Азербайджан', atlantic: 'Атлантический бассейн', antalya: 'Анталья, Турция', communities: 'Местные сообщества', coastal: 'Прибрежные сообщества', cleanup: 'Местные площадки уборки', wmo: 'Всемирная метеорологическая организация', globalActions: 'Глобальные местные действия', observance: 'Глобальное событие', marineOrgs: 'Побережья, школы и морские организации', basinVenue: 'Атлантика, Карибский бассейн и побережья Мексиканского залива', copVenue: 'Площадка конференции ООН по климату' }
  },
  de: {
    climate: 'Klima', weather: 'Klima und Wetter', action: 'Klimaschutz', marine: 'Meere', sustainability: 'Nachhaltigkeit',
    day: 'Tag', stage: 'Phase', happens: 'Was passiert', related: 'Verwandt auf OneSliders', topic: 'Thema', calendar: 'Kalender', worldIndex: 'Weltweiter Eventkalender',
    context: 'Die wichtigsten Signale, wenn dieses Klimaereignis im Kontext gelesen wird.', sources: 'Quellen', updated: 'Aktualisiert am 14. Mai 2026', external: 'extern',
    high: 'Hoch', strong: 'Stark', veryHigh: 'Sehr hoch',
    places: { worldwide: 'Weltweit', geneva: 'Genf, Schweiz', azerbaijan: 'Aserbaidschan', atlantic: 'Atlantikbecken', antalya: 'Antalya, Türkei', communities: 'Lokale Gemeinschaften', coastal: 'Küstengemeinden', cleanup: 'Lokale Aufräumorte', wmo: 'Weltorganisation für Meteorologie', globalActions: 'Weltweite lokale Aktionen', observance: 'Globale Beobachtung', marineOrgs: 'Küsten, Schulen und Meeresorganisationen', basinVenue: 'Atlantik, Karibik und Golfküsten', copVenue: 'Tagungsort der UN-Klimakonferenz' }
  },
  fr: {
    climate: 'Climat', weather: 'Météo climatique', action: 'Action climatique', marine: 'Milieux marins', sustainability: 'Durabilité',
    day: 'Jour', stage: 'Étape', happens: 'Ce qui se passe', related: 'Lié sur OneSliders', topic: 'Thème', calendar: 'Calendrier', worldIndex: 'Index des événements mondiaux',
    context: 'Les signaux les plus importants pour lire cet événement climatique dans son contexte.', sources: 'Sources', updated: 'Mis à jour le 14 mai 2026', external: 'externe',
    high: 'Élevé', strong: 'Fort', veryHigh: 'Très élevé',
    places: { worldwide: 'Partout dans le monde', geneva: 'Genève, Suisse', azerbaijan: 'Azerbaïdjan', atlantic: 'Bassin atlantique', antalya: 'Antalya, Turquie', communities: 'Communautés locales', coastal: 'Communautés côtières', cleanup: 'Sites locaux de nettoyage', wmo: 'Organisation météorologique mondiale', globalActions: 'Actions locales mondiales', observance: 'Journée mondiale', marineOrgs: 'Côtes, écoles et organisations marines', basinVenue: 'Atlantique, Caraïbes et côtes du Golfe', copVenue: 'Site de la conférence climat de l’ONU' }
  },
  es: {
    climate: 'Clima', weather: 'Clima y tiempo extremo', action: 'Acción climática', marine: 'Marino', sustainability: 'Sostenibilidad',
    day: 'Día', stage: 'Etapa', happens: 'Qué ocurre', related: 'Relacionado en OneSliders', topic: 'Tema', calendar: 'Calendario', worldIndex: 'Índice mundial de eventos',
    context: 'Las señales más importantes al leer este evento climático en contexto.', sources: 'Fuentes', updated: 'Actualizado el 14 de mayo de 2026', external: 'externo',
    high: 'Alto', strong: 'Fuerte', veryHigh: 'Muy alto',
    places: { worldwide: 'En todo el mundo', geneva: 'Ginebra, Suiza', azerbaijan: 'Azerbaiyán', atlantic: 'Cuenca atlántica', antalya: 'Antalya, Turquía', communities: 'Comunidades locales', coastal: 'Comunidades costeras', cleanup: 'Sitios locales de limpieza', wmo: 'Organización Meteorológica Mundial', globalActions: 'Acciones locales globales', observance: 'Conmemoración mundial', marineOrgs: 'Costas, escuelas y organizaciones marinas', basinVenue: 'Atlántico, Caribe y costas del Golfo', copVenue: 'Sede de la conferencia climática de la ONU' }
  },
  pt: {
    climate: 'Clima', weather: 'Tempo climático', action: 'Ação climática', marine: 'Marinho', sustainability: 'Sustentabilidade',
    day: 'Dia', stage: 'Etapa', happens: 'O que acontece', related: 'Relacionado no OneSliders', topic: 'Tema', calendar: 'Calendário', worldIndex: 'Índice mundial de eventos',
    context: 'Os sinais mais importantes ao ler este evento climático em contexto.', sources: 'Fontes', updated: 'Atualizado em 14 de maio de 2026', external: 'externo',
    high: 'Alto', strong: 'Forte', veryHigh: 'Muito alto',
    places: { worldwide: 'No mundo todo', geneva: 'Genebra, Suíça', azerbaijan: 'Azerbaijão', atlantic: 'Bacia do Atlântico', antalya: 'Antália, Turquia', communities: 'Comunidades locais', coastal: 'Comunidades costeiras', cleanup: 'Locais de limpeza', wmo: 'Organização Meteorológica Mundial', globalActions: 'Ações locais globais', observance: 'Observância global', marineOrgs: 'Costas, escolas e organizações marinhas', basinVenue: 'Atlântico, Caribe e costas do Golfo', copVenue: 'Local da conferência climática da ONU' }
  },
  qu: {
    climate: 'Pacha klima', weather: 'Klima pacha wayra', action: 'Klima ruway', marine: 'Mama qucha', sustainability: 'Kawsayta waqaychay',
    day: 'P’unchaw', stage: 'Pata', happens: 'Imataq kan', related: 'OneSliderspi tinkisqa', topic: 'Yuyay', calendar: 'Kalindaryu', worldIndex: 'Pachantin raymikuna',
    context: 'Kay klima raymita qhawaspa aswan allin rikch’akuna.', sources: 'Pukyukuna', updated: 'Musuqchasqa 14 Mayu 2026', external: 'hawa',
    high: 'Hatun', strong: 'Sinchi', veryHigh: 'Ancha hatun',
    places: { worldwide: 'Pachantin', geneva: 'Geneva, Suiza', azerbaijan: 'Azerbaijan', atlantic: 'Atlantiku mayu suyu', antalya: 'Antalya, Turkiya', communities: 'Llaqta ayllukuna', coastal: 'Mama qucha pata ayllukuna', cleanup: 'Llaqta pichay kitikuna', wmo: 'Pachantin Meteorologia Wasi', globalActions: 'Pachantin llaqta ruwaykuna', observance: 'Pachantin yuyariy', marineOrgs: 'Mama qucha pata, yachaywasi, mama qucha huñunakuna', basinVenue: 'Atlantiku, Karibe, Gulf pata', copVenue: 'ONU klima huñunakuy wasi' }
  },
  tpi: {
    climate: 'Klaimet', weather: 'Klaimet weda', action: 'Klaimet aksen', marine: 'Solwara', sustainability: 'Gutpela lukaut', 
    day: 'De', stage: 'Step', happens: 'Wanem i kamap', related: 'Ol samting long OneSliders', topic: 'Topik', calendar: 'Kalenda', worldIndex: 'Indeks bilong ol bikpela event',
    context: 'Ol bikpela samting long tingim taim yu ritim dispela klaimet event.', sources: 'As', updated: 'Apdet 14 Me 2026', external: 'ausait',
    high: 'Antap', strong: 'Strong', veryHigh: 'Antap tru',
    places: { worldwide: 'Long olgeta hap', geneva: 'Geneva, Switzerland', azerbaijan: 'Azerbaijan', atlantic: 'Atlantik hap', antalya: 'Antalya, Turkiye', communities: 'Lokal komuniti', coastal: 'Komuniti long nambis', cleanup: 'Lokal klinap ples', wmo: 'World Meteorological Organization', globalActions: 'Lokal aksen long olgeta hap', observance: 'Global de', marineOrgs: 'Nambis, skul na solwara oganaisesen', basinVenue: 'Atlantik, Karibian na Gulf nambis', copVenue: 'Ples bilong UN klaimet konferens' }
  },
  mi: {
    climate: 'Āhuarangi', weather: 'Huarere āhuarangi', action: 'Mahi āhuarangi', marine: 'Moana', sustainability: 'Toitūtanga',
    day: 'Rā', stage: 'Wāhanga', happens: 'Ka aha', related: 'Hononga i OneSliders', topic: 'Kaupapa', calendar: 'Maramataka', worldIndex: 'Rārangi kaupapa o te ao',
    context: 'Ngā tohu matua hei mātakitaki i tēnei kaupapa āhuarangi.', sources: 'Mātāpuna', updated: 'Whakahoutia 14 Haratua 2026', external: 'waho',
    high: 'Teitei', strong: 'Kaha', veryHigh: 'Tino teitei',
    places: { worldwide: 'Huri noa i te ao', geneva: 'Geneva, Switzerland', azerbaijan: 'Azerbaijan', atlantic: 'Te moana Atlantika', antalya: 'Antalya, Turkiye', communities: 'Hapori ā-rohe', coastal: 'Hapori takutai', cleanup: 'Wāhi whakapai ā-rohe', wmo: 'World Meteorological Organization', globalActions: 'Ngā mahi ā-rohe puta noa i te ao', observance: 'Rā whakamahara ā-ao', marineOrgs: 'Takutai, kura me ngā rōpū moana', basinVenue: 'Atlantika, Karipiana me ngā takutai Gulf', copVenue: 'Wāhi hui āhuarangi UN' }
  }
};

const events = [
  {
    slug: 'world-meteorological-day-2026',
    title: 'World Meteorological Day 2026',
    start: '2026-03-23',
    end: '2026-03-23',
    month: '03',
    topic: 'weather',
    topicLabel: 'Climate Weather',
    place: 'Geneva, Switzerland',
    country: 'Switzerland',
    city: 'Geneva',
    venue: 'World Meteorological Organization',
    dateLabel: '23 March 2026',
    image: 'content/events/2026/03/img/world-meteorological-day-2026-hero.png',
    kicker: 'Climate weather - March 2026',
    intro: 'World Meteorological Day focuses attention on weather, climate and water data, and on the early-warning systems communities use as climate risks grow.',
    description: 'World Meteorological Day 2026 highlights meteorology, climate services, early warnings and the data that helps communities prepare for extreme conditions.',
    keywords: 'world meteorological day 2026, climate weather, early warning systems, WMO, extreme weather preparedness',
    know: [
      'The observance is tied to the World Meteorological Organization and the role of weather, climate and water services.',
      'It is a climate-weather moment rather than a daily forecast page: the focus is data, warnings and preparedness.',
      'Early-warning systems are a core link between scientific monitoring and practical public safety.',
      'The date sits before the northern-hemisphere severe-weather and hurricane planning season ramps up.'
    ],
    scheduleTitle: 'Climate-weather focus',
    schedule: [
      ['Before 23 Mar', 'Preparedness', 'Meteorological services and educators prepare campaign material and local outreach.'],
      ['23 Mar', 'Observance day', 'Weather, climate and water services are highlighted through public communication.'],
      ['After 23 Mar', 'Follow-up', 'Communities can connect the message to seasonal readiness and risk planning.']
    ],
    sideTitle: 'Signals to watch',
    bars: [['Early warning', 100], ['Forecast access', 88], ['Climate services', 82], ['Public readiness', 72]],
    facts: [['Theme area', 'Weather, climate and water'], ['Lead body', 'WMO'], ['Planning lens', 'Warnings and resilience'], ['Topic', 'Climate Weather']],
    sources: [['WMO World Meteorological Day 2026', 'https://extranet.wmo.int/edistrib_exped/grp_prs/_en/6557696-2026-GCE-WMD26_en.pdf']]
  },
  {
    slug: 'earth-day-2026',
    title: 'Earth Day 2026',
    start: '2026-04-22',
    end: '2026-04-22',
    month: '04',
    topic: 'climate-action',
    topicLabel: 'Climate Action',
    place: 'Worldwide',
    country: 'Worldwide',
    city: 'Local communities',
    venue: 'Global local actions',
    dateLabel: '22 April 2026',
    image: 'content/events/2026/04/img/earth-day-2026-hero.png',
    kicker: 'Climate action - April 2026',
    intro: 'Earth Day turns climate and environmental concern into public action through community events, education, cleanup work and energy campaigns.',
    description: 'Earth Day 2026 connects climate, energy, environmental protection and community action worldwide.',
    keywords: 'earth day 2026, climate action, environmental campaign, our power our planet, sustainability',
    know: [
      'Earth Day is a public-facing climate and environment campaign date.',
      'The 2026 theme is connected to power, energy and planetary stewardship.',
      'Local schools, cities, organizations and volunteers often run their own events.',
      'On OneSliders it belongs under Climate Action because the date mobilizes people around emissions, energy and environmental protection.'
    ],
    scheduleTitle: 'Action rhythm',
    schedule: [
      ['Early Apr', 'Local planning', 'Schools, cities and community groups announce events.'],
      ['22 Apr', 'Earth Day', 'Public action, education and environmental campaigns peak.'],
      ['Late Apr', 'Follow-through', 'Campaigns often continue into cleanup, planting and policy work.']
    ],
    sideTitle: 'Action levers',
    bars: [['Public mobilization', 100], ['Clean energy', 88], ['Education', 84], ['Local projects', 78]],
    facts: [['Observed since', '1970'], ['Scale', 'Worldwide'], ['Theme lens', 'Power and planet'], ['Topic', 'Climate Action']],
    sources: [['Earth Day 2026', 'https://www.earthday.org/earth-day-2026/']]
  },
  {
    slug: 'world-environment-day-2026',
    title: 'World Environment Day 2026',
    start: '2026-06-05',
    end: '2026-06-05',
    month: '06',
    topic: 'climate-action',
    topicLabel: 'Climate Action',
    place: 'Azerbaijan',
    country: 'Azerbaijan',
    city: 'Azerbaijan',
    venue: 'Global observance',
    dateLabel: '5 June 2026',
    image: 'content/events/2026/06/img/world-environment-day-2026-hero.png',
    kicker: 'Climate action - June 2026',
    intro: 'World Environment Day is a global UN environment observance that focuses public attention on environmental protection, climate pressure and restoration.',
    description: 'World Environment Day 2026 is hosted by Azerbaijan and connects global environmental protection with climate and sustainability action.',
    keywords: 'world environment day 2026, Azerbaijan, UNEP, climate action, environment day',
    know: [
      'World Environment Day is one of the largest annual UN environment observances.',
      'The date helps governments, schools, NGOs and communities rally around practical environmental action.',
      'Azerbaijan is the host country for the 2026 edition.',
      'The OneSliders angle is climate action: a date where public attention, policy and local participation meet.'
    ],
    scheduleTitle: 'Observance structure',
    schedule: [
      ['Before 5 Jun', 'Campaign build-up', 'Host-country and partner messages frame the year’s focus.'],
      ['5 Jun', 'Global observance', 'Events, statements and local actions mark the day.'],
      ['After 5 Jun', 'Implementation', 'Campaign material can feed into restoration, policy and education work.']
    ],
    sideTitle: 'Environment links',
    bars: [['Public visibility', 100], ['Policy signal', 86], ['Restoration', 80], ['Education', 76]],
    facts: [['Lead system', 'UN environment observance'], ['Host country', 'Azerbaijan'], ['Scale', 'Global'], ['Topic', 'Climate Action']],
    sources: [['World Environment Day', 'https://www.worldenvironmentday.global/']]
  },
  {
    slug: 'world-oceans-day-2026',
    title: 'World Oceans Day 2026',
    start: '2026-06-08',
    end: '2026-06-08',
    month: '06',
    topic: 'marine',
    topicLabel: 'Marine',
    place: 'Worldwide',
    country: 'Worldwide',
    city: 'Coastal communities',
    venue: 'Coasts, schools and marine organizations',
    dateLabel: '8 June 2026',
    image: 'content/events/2026/06/img/world-oceans-day-2026-hero.png',
    kicker: 'Marine climate - June 2026',
    intro: 'World Oceans Day connects ocean health, climate, biodiversity and coastal communities through public action around 8 June.',
    description: 'World Oceans Day 2026 links ocean health, climate, biodiversity and plastic pollution through public actions around 8 June.',
    keywords: 'world oceans day 2026, ocean climate, marine conservation, reef protection, ocean action',
    know: [
      'The ocean absorbs heat and carbon, so marine health is central to climate stability.',
      'World Oceans Day is a public-facing moment for ocean protection, education and community action.',
      'Events often include coastal cleanups, school programs and marine conservation campaigns.',
      'The topic connects directly to OneSliders marine climate pages.'
    ],
    scheduleTitle: 'Ocean action window',
    schedule: [
      ['Early Jun', 'Local announcements', 'Coastal groups and educators publish activities.'],
      ['8 Jun', 'World Oceans Day', 'Public events focus on ocean health and marine protection.'],
      ['After 8 Jun', 'Continued action', 'Campaigns often lead into cleanup, reef or conservation work.']
    ],
    sideTitle: 'Ocean pressures',
    bars: [['Warming seas', 100], ['Biodiversity', 88], ['Plastic pollution', 84], ['Coastal resilience', 78]],
    facts: [['Observed', '8 June'], ['Scale', 'Worldwide'], ['Planning lens', 'Ocean health'], ['Topic', 'Marine']],
    sources: [['World Oceans Day', 'https://worldoceanday.org/']]
  },
  {
    slug: 'atlantic-hurricane-season-2026',
    title: 'Atlantic Hurricane Season 2026',
    start: '2026-06-01',
    end: '2026-11-30',
    month: '06',
    topic: 'weather',
    topicLabel: 'Climate Weather',
    place: 'Atlantic basin',
    country: 'Atlantic basin',
    city: 'Caribbean, Gulf and Atlantic coasts',
    venue: 'Atlantic Ocean, Caribbean and Gulf coasts',
    dateLabel: '1 June-30 November 2026',
    image: 'content/events/2026/06/img/atlantic-hurricane-season-2026-hero.png',
    kicker: 'Climate weather - June to November 2026',
    intro: 'The Atlantic hurricane season is a climate-weather planning window for tropical cyclone risk, coastal preparedness and early warning systems.',
    description: 'Atlantic Hurricane Season 2026 is a climate-weather planning window for tropical cyclone risk, coastal preparedness and early-warning systems.',
    keywords: 'atlantic hurricane season 2026, hurricane preparedness, climate weather, tropical cyclone risk',
    know: [
      'The Atlantic season officially runs from 1 June to 30 November.',
      'This is a seasonal risk window, not a single storm forecast.',
      'Climate-weather context matters because warmer oceans, rainfall and coastal exposure affect impacts.',
      'Preparedness, evacuation routes, insurance, power resilience and alerts all become practical planning issues.'
    ],
    scheduleTitle: 'Season structure',
    schedule: [
      ['1 Jun', 'Season opens', 'Official Atlantic hurricane season begins.'],
      ['Aug-Sep', 'Peak window', 'Historical activity often peaks around late summer and early autumn.'],
      ['30 Nov', 'Season closes', 'The official seasonal window ends, though systems can occur outside it.']
    ],
    sideTitle: 'Preparedness signals',
    bars: [['Early warnings', 100], ['Coastal exposure', 92], ['Storm surge', 86], ['Rainfall flooding', 84]],
    facts: [['Season length', '1 Jun-30 Nov'], ['Basin', 'Atlantic'], ['Risk lens', 'Tropical cyclones'], ['Topic', 'Climate Weather']],
    sources: [['National Hurricane Center seasonal dates', 'https://www.nhc.noaa.gov/climo/']]
  },
  {
    slug: 'world-cleanup-day-2026',
    title: 'World Cleanup Day 2026',
    start: '2026-09-20',
    end: '2026-09-20',
    month: '09',
    topic: 'sustainability',
    topicLabel: 'Sustainability',
    place: 'Worldwide',
    country: 'Worldwide',
    city: 'Local cleanup sites',
    venue: 'Local cleanup sites',
    dateLabel: '20 September 2026',
    image: 'content/events/2026/09/img/world-cleanup-day-2026-hero.png',
    kicker: 'Sustainability - September 2026',
    intro: 'World Cleanup Day mobilizes communities against waste and pollution, linking practical local cleanup with broader sustainability habits.',
    description: 'World Cleanup Day 2026 mobilizes communities against waste and pollution, connecting local cleanup action with sustainability and environmental stewardship.',
    keywords: 'world cleanup day 2026, sustainability, cleanup action, pollution prevention, environmental stewardship',
    know: [
      'The observance mobilizes local groups to remove and sort waste.',
      'It is practical sustainability: visible action with local environmental benefits.',
      'Cleanup work often connects to waste prevention, circularity and civic education.',
      'On OneSliders it sits under Sustainability because the emphasis is behavior, waste systems and stewardship.'
    ],
    scheduleTitle: 'Cleanup day flow',
    schedule: [
      ['Before 20 Sep', 'Site planning', 'Local organizers set cleanup sites, routes and sorting plans.'],
      ['20 Sep', 'Cleanup day', 'Volunteers collect, sort and document waste.'],
      ['After 20 Sep', 'Waste follow-up', 'Communities report results and connect cleanup to prevention.']
    ],
    sideTitle: 'Sustainability links',
    bars: [['Waste prevention', 100], ['Community action', 94], ['Local stewardship', 86], ['Education', 74]],
    facts: [['Observed', '20 September'], ['Scale', 'Worldwide'], ['Action type', 'Cleanup'], ['Topic', 'Sustainability']],
    sources: [['UN World Cleanup Day', 'https://www.un.org/en/observances/world-cleanup-day']]
  },
  {
    slug: 'cop31-2026',
    title: 'COP31 UN Climate Change Conference',
    start: '2026-11-09',
    end: '2026-11-20',
    month: '11',
    topic: 'climate-action',
    topicLabel: 'Climate Action',
    place: 'Antalya, Turkiye',
    country: 'Turkiye',
    city: 'Antalya',
    venue: 'UN Climate Change Conference venue',
    dateLabel: '9-20 November 2026',
    image: 'content/events/2026/11/img/cop31-2026-hero.png',
    kicker: 'Climate action - November 2026',
    intro: 'COP31 brings governments, observers and climate stakeholders to Antalya for UN climate negotiations on implementation, finance and adaptation.',
    description: 'COP31 brings governments, observers and climate stakeholders to Antalya for UN climate negotiations on implementation, finance and adaptation.',
    keywords: 'COP31 2026, UN Climate Change Conference, Antalya, climate negotiations, climate finance, adaptation',
    know: [
      'COP31 is part of the UN climate process under the UNFCCC.',
      'Negotiations focus on implementation, finance, adaptation and accountability.',
      'The conference draws governments, observers, businesses, cities and civil society.',
      'For OneSliders this is the anchor climate-action event of late 2026.'
    ],
    scheduleTitle: 'Conference structure',
    schedule: [
      ['9 Nov', 'Opening', 'Negotiations and high-level meetings begin in Antalya.'],
      ['Week 1', 'Technical work', 'Negotiators work through agenda items, text and implementation issues.'],
      ['Week 2', 'Ministerial push', 'Political decisions and final text negotiations intensify.'],
      ['20 Nov', 'Close', 'Outcomes and next steps are published or carried forward.']
    ],
    sideTitle: 'Negotiation levers',
    bars: [['Implementation', 100], ['Finance', 94], ['Adaptation', 88], ['Accountability', 80]],
    facts: [['Process', 'UNFCCC COP'], ['Host city', 'Antalya'], ['Duration', '12 days'], ['Topic', 'Climate Action']],
    sources: [['UNFCCC COP31', 'https://unfccc.int/cop31']]
  }
];

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const eventTitles = {
  ar: ['اليوم العالمي للأرصاد الجوية 2026','يوم الأرض 2026','اليوم العالمي للبيئة 2026','اليوم العالمي للمحيطات 2026','موسم الأعاصير الأطلسية 2026','اليوم العالمي للتنظيف 2026','مؤتمر الأمم المتحدة لتغير المناخ COP31'],
  sw: ['Siku ya Hali ya Hewa Duniani 2026','Siku ya Dunia 2026','Siku ya Mazingira Duniani 2026','Siku ya Bahari Duniani 2026','Msimu wa Vimbunga vya Atlantiki 2026','Siku ya Usafi Duniani 2026','Mkutano wa UN wa Tabianchi COP31'],
  ha: ['Ranar Yanayi ta Duniya 2026','Ranar Duniya 2026','Ranar Muhalli ta Duniya 2026','Ranar Tekuna ta Duniya 2026','Lokacin Guguwar Atlantika 2026','Ranar Tsaftace Duniya 2026','Taron Sauyin Yanayi na Majalisar Dinkin Duniya COP31'],
  zh: ['2026年世界气象日','2026年地球日','2026年世界环境日','2026年世界海洋日','2026年大西洋飓风季','2026年世界清洁日','COP31 联合国气候变化大会'],
  hi: ['विश्व मौसम विज्ञान दिवस 2026','पृथ्वी दिवस 2026','विश्व पर्यावरण दिवस 2026','विश्व महासागर दिवस 2026','अटलांटिक तूफान मौसम 2026','विश्व सफाई दिवस 2026','COP31 संयुक्त राष्ट्र जलवायु परिवर्तन सम्मेलन'],
  ru: ['Всемирный метеорологический день 2026','День Земли 2026','Всемирный день окружающей среды 2026','Всемирный день океанов 2026','Атлантический сезон ураганов 2026','Всемирный день уборки 2026','COP31 Конференция ООН по изменению климата'],
  de: ['Welttag der Meteorologie 2026','Earth Day 2026','Weltumwelttag 2026','Welttag der Ozeane 2026','Atlantische Hurrikansaison 2026','World Cleanup Day 2026','COP31 UN-Klimakonferenz'],
  fr: ['Journée météorologique mondiale 2026','Jour de la Terre 2026','Journée mondiale de l’environnement 2026','Journée mondiale de l’océan 2026','Saison des ouragans de l’Atlantique 2026','Journée mondiale du nettoyage 2026','COP31 Conférence de l’ONU sur le climat'],
  es: ['Día Meteorológico Mundial 2026','Día de la Tierra 2026','Día Mundial del Medio Ambiente 2026','Día Mundial de los Océanos 2026','Temporada de huracanes del Atlántico 2026','Día Mundial de la Limpieza 2026','COP31 Conferencia de la ONU sobre el Cambio Climático'],
  pt: ['Dia Meteorológico Mundial 2026','Dia da Terra 2026','Dia Mundial do Meio Ambiente 2026','Dia Mundial dos Oceanos 2026','Temporada de furacões do Atlântico 2026','Dia Mundial da Limpeza 2026','COP31 Conferência da ONU sobre Mudança do Clima'],
  qu: ['Pachantin Meteorologia P’unchaw 2026','Pachamama P’unchaw 2026','Pachantin Pachamama Muyuriq P’unchaw 2026','Pachantin Mama Qucha P’unchaw 2026','Atlantiku Wayra Sinchi Mit’a 2026','Pachantin Pichay P’unchaw 2026','COP31 ONU Klima Huñunakuy'],
  tpi: ['World Meteorological Day 2026','Earth Day 2026','World Environment Day 2026','World Oceans Day 2026','Atlantik Hariken Sisen 2026','World Cleanup Day 2026','COP31 UN Klaimet Senis Konferens'],
  mi: ['Te Rā Huarere o te Ao 2026','Te Rā o te Ao 2026','Te Rā Taiao o te Ao 2026','Te Rā Moana o te Ao 2026','Te Wā Huripari Atlantika 2026','Te Rā Whakapai o te Ao 2026','COP31 Hui Āhuarangi o te UN']
};

const eventOrder = events.map((ev) => ev.slug);

function localizedEvent(lang, ev) {
  if (lang === 'en') return ev;
  const p = packs[lang] || packs.en;
  const idx = eventOrder.indexOf(ev.slug);
  const title = eventTitles[lang]?.[idx] || ev.title;
  const topicLabel = ev.topic === 'weather' ? p.weather : ev.topic === 'climate-action' ? p.action : ev.topic === 'marine' ? p.marine : p.sustainability;
  const placeMap = {
    'Geneva, Switzerland': p.places.geneva,
    Worldwide: p.places.worldwide,
    Azerbaijan: p.places.azerbaijan,
    'Atlantic basin': p.places.atlantic,
    'Antalya, Turkiye': p.places.antalya,
    'Local communities': p.places.communities,
    'Coastal communities': p.places.coastal,
    'Local cleanup sites': p.places.cleanup,
    'World Meteorological Organization': p.places.wmo,
    'Global local actions': p.places.globalActions,
    'Global observance': p.places.observance,
    'Coasts, schools and marine organizations': p.places.marineOrgs,
    'Atlantic Ocean, Caribbean and Gulf coasts': p.places.basinVenue,
    'UN Climate Change Conference venue': p.places.copVenue,
    Switzerland: p.places.geneva,
    Turkiye: p.places.antalya,
    Geneva: p.places.geneva
  };
  const text = {
    ar: {
      intro: `${title} يربط التقويم المناخي بالاستعداد والمشاركة العامة والعمل المحلي.`,
      description: `${title} صفحة مناخية تشرح التاريخ والمكان والمخاطر والعمل المرتبط بالحدث.`,
      know: ['هذا حدث مناخي في تقويم OneSliders وليس صفحة توقعات يومية.', 'تساعد الصفحة على فهم التاريخ والمكان والسياق العملي.', 'ترتبط الرسالة بالاستعداد وحماية البيئة والعمل العام.', 'تستخدم الروابط والصور نفسها عبر اللغات مع نص محلي.'],
      schedule: [['قبل الموعد', 'تحضير', 'تعلن الجهات المحلية والشركاء عن الرسائل والأنشطة.'], ['يوم الحدث', 'تنفيذ', 'تظهر الفعاليات والبيانات والعمل العام.'], ['بعد الموعد', 'متابعة', 'تتحول الرسالة إلى تعليم وتخطيط وعمل محلي.']],
      scheduleTitle: 'إيقاع الحدث', sideTitle: 'إشارات مهمة'
    },
    sw: {
      intro: `${title} huunganisha kalenda ya tabianchi na maandalizi, ushiriki wa umma na hatua za mahali.`,
      description: `${title} ni ukurasa wa tabianchi unaoeleza tarehe, mahali, hatari na hatua zinazohusiana na tukio.`,
      know: ['Hili ni tukio la tabianchi kwenye kalenda ya OneSliders, si ukurasa wa utabiri wa kila siku.', 'Ukurasa unaonyesha tarehe, mahali na muktadha wa kutumia.', 'Ujumbe unahusiana na maandalizi, ulinzi wa mazingira na hatua za umma.', 'Viungo na picha hubaki sawa katika lugha zote, huku maandishi yakiwa ya mahali.'],
      schedule: [['Kabla ya tarehe', 'Maandalizi', 'Waandaaji na washirika hutangaza ujumbe na shughuli.'], ['Siku ya tukio', 'Utekelezaji', 'Matukio, taarifa na hatua za umma huonekana.'], ['Baada ya tarehe', 'Ufuatiliaji', 'Ujumbe huendelea katika elimu, mipango na hatua za mahali.']],
      scheduleTitle: 'Mtiririko wa tukio', sideTitle: 'Ishara za kuangalia'
    },
    ha: {
      intro: `${title} yana hada kalandar sauyin yanayi da shiri, hulda da jama'a da aikin gida.`,
      description: `${title} shafi ne na sauyin yanayi da ke bayyana rana, wuri, hadari da aikin da ke da alaka da taron.`,
      know: ['Wannan abin sauyin yanayi ne a kalandar OneSliders, ba shafin hasashen yau da kullum ba.', 'Shafin yana nuna rana, wuri da mahallin amfani.', 'Sakon yana da alaka da shiri, kare muhalli da aikin jama’a.', 'Hanyoyi da hotuna suna nan iri daya a harsuna, rubutu kuwa na gida ne.'],
      schedule: [['Kafin lokaci', 'Shiri', 'Masu shirya taro da abokan aiki suna sanar da sakonni da ayyuka.'], ['Ranar taro', 'Aiki', 'Ayyuka, bayanai da gudummawar jama’a suna bayyana.'], ['Bayan lokaci', 'Bibiya', 'Sakon yana komawa ilimi, tsari da aikin gida.']],
      scheduleTitle: 'Tsarin taro', sideTitle: 'Alamomin kulawa'
    },
    zh: {
      intro: `${title} 把气候日历、准备工作、公众参与和本地行动联系在一起。`,
      description: `${title} 是一个气候事件页面，说明日期、地点、风险和相关行动。`,
      know: ['这是 OneSliders 日历中的气候事件，不是每日天气预报页。', '页面帮助读者理解日期、地点和实际背景。', '核心信息与准备、环境保护和公众行动有关。', '各语言使用相同链接和图片，但文字本地化。'],
      schedule: [['日期前', '准备', '组织者和伙伴发布信息与活动安排。'], ['活动日', '行动', '公共活动、声明和本地行动集中出现。'], ['日期后', '跟进', '信息继续进入教育、规划和本地实践。']],
      scheduleTitle: '事件节奏', sideTitle: '关注信号'
    },
    hi: {
      intro: `${title} जलवायु कैलेंडर को तैयारी, सार्वजनिक भागीदारी और स्थानीय कार्रवाई से जोड़ता है।`,
      description: `${title} एक जलवायु कार्यक्रम पेज है जो तारीख, स्थान, जोखिम और संबंधित कार्रवाई बताता है।`,
      know: ['यह OneSliders कैलेंडर का जलवायु कार्यक्रम है, दैनिक मौसम पूर्वानुमान पेज नहीं।', 'पेज तारीख, स्थान और उपयोगी संदर्भ समझाता है।', 'संदेश तैयारी, पर्यावरण संरक्षण और सार्वजनिक कार्रवाई से जुड़ा है।', 'लिंक और चित्र सभी भाषाओं में समान रहते हैं, लेकिन पाठ स्थानीय है।'],
      schedule: [['तारीख से पहले', 'तैयारी', 'आयोजक और साझेदार संदेश और गतिविधियां घोषित करते हैं।'], ['कार्यक्रम दिवस', 'कार्रवाई', 'कार्यक्रम, बयान और सार्वजनिक कार्रवाई सामने आते हैं।'], ['तारीख के बाद', 'अनुवर्ती', 'संदेश शिक्षा, योजना और स्थानीय कार्रवाई में जारी रहता है।']],
      scheduleTitle: 'कार्यक्रम क्रम', sideTitle: 'देखने योग्य संकेत'
    },
    ru: {
      intro: `${title} связывает климатический календарь с подготовкой, общественным участием и местными действиями.`,
      description: `${title} - климатическая страница о дате, месте, рисках и связанных действиях.`,
      know: ['Это климатическое событие в календаре OneSliders, а не страница ежедневного прогноза.', 'Страница помогает понять дату, место и практический контекст.', 'Смысл связан с готовностью, защитой окружающей среды и общественными действиями.', 'Ссылки и изображения едины для всех языков, а текст локализован.'],
      schedule: [['До даты', 'Подготовка', 'Организаторы и партнеры публикуют сообщения и планы мероприятий.'], ['День события', 'Действие', 'Появляются мероприятия, заявления и общественные действия.'], ['После даты', 'Продолжение', 'Сообщение переходит в образование, планирование и местные действия.']],
      scheduleTitle: 'Ритм события', sideTitle: 'Сигналы для наблюдения'
    },
    de: {
      intro: `${title} verbindet den Klimakalender mit Vorbereitung, öffentlicher Beteiligung und lokalen Maßnahmen.`,
      description: `${title} ist eine Klimaseite zu Datum, Ort, Risiken und passenden Maßnahmen.`,
      know: ['Dies ist ein Klimaereignis im OneSliders-Kalender, keine tägliche Wettervorhersage.', 'Die Seite erklärt Datum, Ort und praktischen Kontext.', 'Die Botschaft verbindet Vorbereitung, Umweltschutz und öffentliche Beteiligung.', 'Links und Bilder bleiben sprachübergreifend gleich, der Text ist lokalisiert.'],
      schedule: [['Vor dem Termin', 'Vorbereitung', 'Organisatoren und Partner veröffentlichen Botschaften und Aktivitäten.'], ['Am Ereignistag', 'Aktion', 'Veranstaltungen, Erklärungen und öffentliche Aktionen werden sichtbar.'], ['Nach dem Termin', 'Nacharbeit', 'Die Botschaft fließt in Bildung, Planung und lokale Maßnahmen ein.']],
      scheduleTitle: 'Ablauf des Ereignisses', sideTitle: 'Signale im Blick'
    },
    fr: {
      intro: `${title} relie le calendrier climatique à la préparation, à la participation publique et à l’action locale.`,
      description: `${title} est une page climat sur la date, le lieu, les risques et les actions liées.`,
      know: ['C’est un événement climat du calendrier OneSliders, pas une page de prévision météo quotidienne.', 'La page explique la date, le lieu et le contexte pratique.', 'Le message porte sur la préparation, la protection de l’environnement et l’action publique.', 'Les liens et images restent communs aux langues, avec un texte localisé.'],
      schedule: [['Avant la date', 'Préparation', 'Les organisateurs et partenaires publient messages et activités.'], ['Jour de l’événement', 'Action', 'Événements, déclarations et actions publiques sont visibles.'], ['Après la date', 'Suivi', 'Le message continue dans l’éducation, la planification et l’action locale.']],
      scheduleTitle: 'Rythme de l’événement', sideTitle: 'Signaux à suivre'
    },
    es: {
      intro: `${title} conecta el calendario climático con preparación, participación pública y acción local.`,
      description: `${title} es una página climática sobre fecha, lugar, riesgos y acciones relacionadas.`,
      know: ['Es un evento climático del calendario OneSliders, no una página de pronóstico diario.', 'La página explica fecha, lugar y contexto práctico.', 'El mensaje conecta preparación, protección ambiental y acción pública.', 'Los enlaces e imágenes son comunes entre idiomas, con texto localizado.'],
      schedule: [['Antes de la fecha', 'Preparación', 'Organizadores y socios publican mensajes y actividades.'], ['Día del evento', 'Acción', 'Aparecen eventos, declaraciones y acciones públicas.'], ['Después de la fecha', 'Seguimiento', 'El mensaje continúa en educación, planificación y acción local.']],
      scheduleTitle: 'Ritmo del evento', sideTitle: 'Señales a observar'
    },
    pt: {
      intro: `${title} conecta o calendário climático com preparação, participação pública e ação local.`,
      description: `${title} é uma página de clima sobre data, lugar, riscos e ações relacionadas.`,
      know: ['É um evento climático no calendário OneSliders, não uma página de previsão diária.', 'A página explica data, lugar e contexto prático.', 'A mensagem liga preparação, proteção ambiental e ação pública.', 'Links e imagens ficam iguais entre idiomas, com texto localizado.'],
      schedule: [['Antes da data', 'Preparação', 'Organizadores e parceiros publicam mensagens e atividades.'], ['Dia do evento', 'Ação', 'Eventos, declarações e ações públicas aparecem.'], ['Depois da data', 'Continuidade', 'A mensagem segue em educação, planejamento e ação local.']],
      scheduleTitle: 'Ritmo do evento', sideTitle: 'Sinais a observar'
    },
    qu: {
      intro: `${title} klima kalindaryuta wakichiywan, runakuna ruwaywan, llaqta ruwaywan tinkuchin.`,
      description: `${title} klima p’anqa, p’unchawta, kitita, llakiyta, ruwaykunata willan.`,
      know: ['Kayqa OneSliders kalindaryupi klima raymi, mana sapa p’unchaw pronostiku p’anqachu.', 'P’anqa p’unchawta, kitita, ruwaypaq yuyayta sut’inchan.', 'Willakuyqa wakichiywan, pachamama waqaychaywan, runakuna ruwaywan tinkisqa.', 'Tinkikuna rikch’aykunapas llapa simipi kikin, qillqaqa simiman tikrasqa.'],
      schedule: [['Ñawpaq', 'Wakichiy', 'Kamachiqkuna willakuyta ruwaykunata lluqsichinku.'], ['Raymi p’unchaw', 'Ruway', 'Raymikuna, willakuykuna, runakuna ruway rikurin.'], ['Qhipa', 'Katipay', 'Willakuyqa yachachiy, yuyaychay, llaqta ruwayman rin.']],
      scheduleTitle: 'Raymi puriynin', sideTitle: 'Qhawanapaq rikch’akuna'
    },
    tpi: {
      intro: `${title} i bungim klaimet kalenda wantaim redi, pablik wok na lokal aksen.`,
      description: `${title} em klaimet pej long de, ples, risk na ol aksen i pas wantaim.`,
      know: ['Dispela em klaimet event long OneSliders kalenda, i no wanpela de-to-de weda pej.', 'Pej i helpim long save long de, ples na gutpela konteks.', 'Toksave i pas long redi, lukautim envaironmen na pablik aksen.', 'Link na piksa i stap wankain long olgeta tokples, tasol teks i lokal.'],
      schedule: [['Bipo de', 'Redi', 'Ol oganaisa na patna i putim toksave na aktiviti.'], ['Event de', 'Aksen', 'Event, toksave na pablik wok i kamap.'], ['Bihain', 'Foloap', 'Toksave i go insait long skul, plen na lokal wok.']],
      scheduleTitle: 'Ron bilong event', sideTitle: 'Ol mak long lukim'
    },
    mi: {
      intro: `${title} e hono ana te maramataka āhuarangi ki te whakarite, te whai wāhi a te iwi me te mahi ā-rohe.`,
      description: `${title} he whārangi āhuarangi mō te rā, te wāhi, ngā tūraru me ngā mahi hono.`,
      know: ['He kaupapa āhuarangi tēnei i te maramataka OneSliders, ehara i te matapae huarere ia rā.', 'Ka whakamārama te whārangi i te rā, te wāhi me te horopaki mahi.', 'E hono ana te kōrero ki te whakarite, te tiaki taiao me te mahi a te iwi.', 'He ōrite ngā hononga me ngā whakaahua i ngā reo katoa, ā, kua whakahāngaitia te tuhinga.'],
      schedule: [['I mua i te rā', 'Whakarite', 'Ka tuku ngā kaiwhakarite me ngā hoa i ngā karere me ngā mahi.'], ['Te rā kaupapa', 'Mahi', 'Ka kitea ngā kaupapa, ngā tauākī me te mahi a te iwi.'], ['I muri mai', 'Whaiwhai', 'Ka haere tonu te karere ki te ako, te whakamahere me te mahi ā-rohe.']],
      scheduleTitle: 'Rere o te kaupapa', sideTitle: 'Ngā tohu hei mātaki'
    }
  }[lang] || {};
  return {
    ...ev,
    title,
    topicLabel,
    place: placeMap[ev.place] || ev.place,
    country: placeMap[ev.country] || ev.country,
    city: placeMap[ev.city] || ev.city,
    venue: placeMap[ev.venue] || ev.venue,
    kicker: `${topicLabel} - 2026`,
    intro: text.intro || ev.intro,
    description: text.description || ev.description,
    keywords: `${title}, ${topicLabel}, ${p.climate}`,
    know: text.know || ev.know,
    scheduleTitle: text.scheduleTitle || ev.scheduleTitle,
    schedule: text.schedule || ev.schedule,
    sideTitle: text.sideTitle || ev.sideTitle,
    facts: ev.facts.map(([label, value]) => [label === 'Topic' ? p.topic : label, value === ev.topicLabel ? topicLabel : (placeMap[value] || value)])
  };
}

function languageMenu(lang, ev) {
  return languages.map((code) => {
    const href = code === lang ? `${ev.slug}.html` : `../../../../../${code}/content/events/2026/${ev.month}/${ev.slug}.html`;
    const current = code === lang ? ' aria-current="true"' : '';
    return `      <a href="${href}"${current}><span class="language-code">${codeLabel(code)}</span><span class="language-name">${languageNames[code] || code}</span></a>`;
  }).join('\n');
}

function ics(ev) {
  const stamp = '20260514T000000Z';
  const dt = (date) => date.replaceAll('-', '');
  const end = new Date(`${ev.end}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const endText = end.toISOString().slice(0, 10).replaceAll('-', '');
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OneSliders//Climate Events//EN
BEGIN:VEVENT
UID:${ev.slug}@one-sliders.com
DTSTAMP:${stamp}
DTSTART;VALUE=DATE:${dt(ev.start)}
DTEND;VALUE=DATE:${endText}
SUMMARY:${ev.title}
DESCRIPTION:${ev.description}
LOCATION:${ev.place}
URL:https://one-sliders.com/content/events/2026/${ev.month}/${ev.slug}.html
END:VEVENT
END:VCALENDAR
`;
}

function schema(ev, lang) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    startDate: ev.start,
    endDate: ev.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: ev.place === 'Worldwide' ? 'https://schema.org/MixedEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    image: `https://one-sliders.com/${ev.image}`,
    description: ev.description,
    location: { '@type': 'Place', name: ev.venue, address: ev.place }
  }, null, 2).replace(/</g, '\\u003c');
}

function render(lang, ev) {
  ev = localizedEvent(lang, ev);
  const pack = packs[lang] || packs.en;
  const profile = profiles[lang] || profiles.en;
  const labels = profile.labels || profiles.en.labels;
  const image = `../../../../../${ev.image}`;
  const topicHref = `../content/categories/climate/${ev.topic}.html`;
  const title = `${ev.title} | OneSliders`;
  const navEvents = '../../index.html';
  const sourceLinks = ev.sources.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ${esc(pack.external)}</a>`).join(', ');
  const knowItems = ev.know.map((item) => `            <li>${esc(item)}</li>`).join('\n');
  const rows = ev.schedule.map(([day, stage, text]) => `              <tr><th>${esc(day)}</th><td>${esc(stage)}</td><td>${esc(text)}</td></tr>`).join('\n');
  const factCards = ev.facts.map(([label, value]) => `            <div class="event-fact"><span>${esc(label)}</span><strong>${label === 'Topic' || label === pack.topic ? `<a href="${topicHref}">${esc(value)}</a>` : esc(value)}</strong></div>`).join('\n');
  const bars = ev.bars.map(([label, value], index) => `            <div class="event-rank-bar"><span class="event-rank-bar__rank">${index + 1}</span><span class="event-rank-bar__country">${esc(label)}</span><div class="event-rank-bar__track"><i class="event-rank-bar__fill" style="--value:${value}%"></i></div><strong class="event-rank-bar__value">${value >= 90 ? esc(pack.veryHigh) : value >= 80 ? esc(pack.high) : esc(pack.strong)}</strong></div>`).join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="../../../../../assets/icons/favicon.ico" sizes="any">
  <link rel="icon" href="../../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="../../../../../assets/icons/apple-touch-icon.png">
  <link rel="manifest" href="../../../../../assets/icons/site.webmanifest">
  <link rel="stylesheet" href="../../../../../assets/css/event-detail.css">
  <link rel="preload" as="image" href="${image}">
  <link rel="canonical" href="https://one-sliders.com/${lang}/content/events/2026/${ev.month}/${ev.slug}.html">
  <link rel="alternate" hreflang="x-default" href="https://one-sliders.com/content/events/2026/${ev.month}/${ev.slug}.html">
  <meta name="theme-color" content="#245f46">
  <meta name="description" content="${esc(ev.description)}">
  <meta name="keywords" content="${esc(ev.keywords)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(ev.description)}">
  <meta property="og:image" content="https://one-sliders.com/${esc(ev.image)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://one-sliders.com/${lang}/content/events/2026/${ev.month}/${ev.slug}.html">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(ev.description)}">
  <meta name="twitter:image" content="https://one-sliders.com/${esc(ev.image)}">
  <title>${esc(title)}</title>
  <script type="application/ld+json">
${schema(ev, lang)}
  </script>
</head>
<body class="event-page event-page--nature" style="--event-theme:#245f46;--event-theme-2:#1f7888;--event-accent:#9fd16b">
  <nav class="top-menu" aria-label="Event navigation">
    <a class="nav-icon" href="${navEvents}" title="${esc(profile.categories?.events || 'Events')}" aria-label="${esc(profile.categories?.events || 'Events')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    </a>
    <a class="nav-icon" href="../content/locations/index.html" title="${esc(labels.place || 'World')}" aria-label="${esc(labels.place || 'World')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    </a>
    <a class="nav-icon" href="../content/categories/index.html" title="${esc(labels.category || 'Categories')}" aria-label="${esc(labels.category || 'Categories')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
    </a>
    <span class="nav-divider"></span>
    <a class="nav-pill" href="${topicHref}">${esc(ev.topicLabel)}</a>
    <details class="event-language-menu">
      <summary aria-label="${esc(labels.language || 'Language')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>${codeLabel(lang)}</span></summary>
      <div class="event-language-list" aria-label="${esc(labels.language || 'Language')}">
      <span>${esc(labels.language || 'Language')}</span>
${languageMenu(lang, ev)}
      </div>
    </details>
  </nav>

  <main class="event-shell">
    <section class="event-hero" aria-labelledby="event-title">
      <img class="event-hero__image" src="${image}" alt="${esc(ev.title)} climate event hero image" width="1200" height="760" fetchpriority="high">
      <div class="event-hero__inner">
        <div>
          <div class="event-badge-row">
            <p class="event-kicker">${esc(ev.kicker)}</p>
          </div>
          <h1 class="event-title" id="event-title">${esc(ev.title)}</h1>
          <p class="event-intro">${esc(ev.intro)}</p>
        </div>
        <div class="event-hero__facts" aria-label="${esc(ev.title)} key facts">
          <div class="event-hero__fact"><span>${esc(labels.country || 'Country')}</span><strong>${esc(ev.country)}</strong></div>
          <div class="event-hero__fact"><span>${esc(labels.city || 'City')}</span><strong>${esc(ev.city)}</strong></div>
          <div class="event-hero__fact"><span>${esc(labels.venue || 'Venue')}</span><strong>${esc(ev.venue)}</strong></div>
          <div class="event-hero__fact"><span>${esc(labels.dates || 'Dates')}</span><strong>${esc(ev.dateLabel)}</strong></div>
        </div>
      </div>
    </section>

    <nav class="event-actions" aria-label="${esc(labels.addCalendar || 'Calendar actions')}">
      <a class="event-button event-button--primary" href="${ev.slug}.ics">${esc(labels.addCalendar || 'Add to calendar')}</a>
    </nav>

    <div class="event-layout">
      <div class="event-main">
        <section class="event-section">
          <h2 class="event-section__title">${esc(labels.whatToKnow || 'What to know')}</h2>
          <ul class="event-list">
${knowItems}
          </ul>
        </section>

        <section class="event-section">
          <h2 class="event-section__title">${esc(ev.scheduleTitle)}</h2>
          <table class="event-table">
            <thead><tr><th>${esc(pack.day)}</th><th>${esc(pack.stage)}</th><th>${esc(pack.happens)}</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </section>

        <section class="event-section">
          <h2 class="event-section__title">${esc(pack.related)}</h2>
          <div class="event-link-grid">
            <a class="event-link-card event-link-card--media" href="${topicHref}"><img class="event-link-card__thumb" src="${image}" alt="" width="46" height="46"><span><span>${esc(pack.topic)}</span><strong>${esc(ev.topicLabel)}</strong></span></a>
            <a class="event-link-card event-link-card--fallback" href="../../index.html"><span>${esc(pack.calendar)}</span><strong>${esc(pack.worldIndex)}</strong></a>
          </div>
        </section>
      </div>

      <aside class="event-side" aria-label="${esc(ev.title)} details">
        <section class="event-section">
          <h2 class="event-section__title">${esc(labels.quickFacts || 'Quick facts')}</h2>
          <div class="event-fact-grid">
${factCards}
          </div>
        </section>

        <section class="event-section">
          <h2 class="event-section__title">${esc(ev.sideTitle)}</h2>
          <p>${esc(pack.context)}</p>
          <div class="event-rank-bars event-link-grid--after-text">
${bars}
          </div>
        </section>
      </aside>
    </div>

    <div class="event-source">
      <span>${esc(pack.sources)}: ${sourceLinks}</span>
      <span>${esc(pack.updated)}</span>
    </div>
  </main>
</body>
</html>
`;
}

function updateIndex(lang, ev) {
  const file = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(file)) return;
  const local = localizedEvent(lang, ev);
  const pack = packs[lang] || packs.en;
  let html = fs.readFileSync(file, 'utf8');
  html = html.replaceAll(`${ev.slug}-hero.svg`, `${ev.slug}-hero.png`);
  html = html.replace(new RegExp(`(<a class="event-card"[^>]+href="2026/${ev.month}/${ev.slug}\\.html"[^>]*>[\\s\\S]*?<img class="card-thumb"[^>]+alt=")[^"]+("[\\s\\S]*?<span class="cat-pill">)[^<]+(<\\/span><strong class="card-title">)[\\s\\S]*?(<\\/strong><span class="card-meta">)[\\s\\S]*?(<\\/span>)`), `$1${esc(local.title)}$2${esc(pack.climate)}$3${esc(local.title)}$4${esc(local.dateLabel)} - ${esc(local.place)}$5`);
  html = html.replace(/'weather':'[^']*','climate-action':'[^']*','marine':'[^']*','sustainability':'[^']*'/, `'weather':'${esc(pack.weather)}','climate-action':'${esc(pack.action)}','marine':'${esc(pack.marine)}','sustainability':'${esc(pack.sustainability)}'`);
  fs.writeFileSync(file, html, 'utf8');
}

for (const lang of languages) {
  for (const ev of events) {
    const dir = path.join(root, lang, 'content', 'events', '2026', ev.month);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${ev.slug}.html`), render(lang, ev), 'utf8');
    fs.writeFileSync(path.join(dir, `${ev.slug}.ics`), ics(ev), 'utf8');
    updateIndex(lang, ev);
  }
}

console.log(`Rebuilt ${events.length * languages.length} climate event detail pages with event-detail.css.`);
