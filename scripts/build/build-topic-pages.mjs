import fs from 'node:fs';
import path from 'node:path';
import { languages, profiles, codeLabel, languageNames } from '../lib/event-language-profiles.mjs';

const root = process.cwd();
const langDirs = languages;
const langName = {
  en: 'English', ar: 'Arabic', sw: 'Kiswahili', ha: 'Hausa', zh: 'Chinese', hi: 'Hindi',
  ru: 'Russian', de: 'Deutsch', fr: 'Francais', es: 'Espanol', pt: 'Portugues',
  qu: 'Quechua', tpi: 'Tok Pisin', mi: 'Maori'
};

const categoryNames = {
  sport: 'Sports',
  music: 'Music',
  culture: 'Culture',
  climate: 'Climate',
  'food-and-drinks': 'Food and drinks',
  technology: 'Technology',
  wellness: 'Wellness'
};

const topicNames = {
  'alpine-skiing': 'Alpine Skiing', 'american-football': 'American Football', baseball: 'Baseball',
  basketball: 'Basketball', biathlon: 'Biathlon', cricket: 'Cricket', 'cross-country-skiing': 'Cross-Country Skiing',
  curling: 'Curling', cycling: 'Cycling', 'figure-skating': 'Figure Skating', football: 'Football',
  'formula-1': 'Formula 1', golf: 'Golf', 'horse-racing': 'Horse Racing', 'ice-hockey': 'Ice Hockey',
  marathon: 'Marathon', motorsport: 'Motorsport', olympics: 'Olympics', rugby: 'Rugby',
  'ski-jumping': 'Ski Jumping', snowboard: 'Snowboard', 'speed-skating': 'Speed Skating', tennis: 'Tennis',
  jazz: 'Jazz', 'music-festivals': 'Music Festivals', 'song-contests': 'Song Contests', 'world-music': 'World Music',
  awards: 'Awards', fashion: 'Fashion', film: 'Film', 'pop-culture': 'Pop Culture',
  beer: 'Beer', coffee: 'Coffee', 'street-food': 'Street Food', wine: 'Wine',
  gaming: 'Gaming', 'tech-events': 'Tech Events',
  'ice-and-glaciers': 'Ice and Glaciers', marine: 'Marine', 'protected-nature': 'Protected Nature',
  sustainability: 'Sustainability', weather: 'Climate Weather', 'climate-action': 'Climate Action',
  'active-wellness': 'Active Wellness', 'mental-health': 'Mental Health', sauna: 'Sauna', spa: 'Spa',
  'wellness-festivals': 'Wellness Festivals', yoga: 'Yoga'
};

const localized = {
  ru: {
    categoryNames: {
      climate: 'Климат',
      sport: 'Спорт',
      music: 'Музыка',
      culture: 'Культура',
      'food-and-drinks': 'Еда и напитки',
      technology: 'Технологии',
      wellness: 'Здоровье'
    },
    topicNames: {
      'ice-and-glaciers': 'Лед и ледники',
      marine: 'Океаны и море',
      'protected-nature': 'Охраняемая природа',
      sustainability: 'Устойчивость',
      weather: 'Климатическая погода',
      'climate-action': 'Климатические действия'
    },
    ui: {
      facts: 'факты',
      historyAria: (name) => `Историческая линия темы «${name}»`,
      historyLabel: 'Исторические опоры',
      historyTitle: (name) => `Как тема «${name}» стала глобальной`,
      watchLabel: 'На что смотреть',
      eventsControls: 'Управление каруселью предстоящих событий',
      prev: 'Предыдущие события',
      next: 'Следующие события',
      browse: 'Откройте полный календарь событий, чтобы увидеть новые добавления.'
    },
    genericFocus: [
      ['Формат', 'Как устроена тема и где нарастает давление.'],
      ['Место', 'Ландшафты, города или площадки, которые меняют историю.'],
      ['Люди', 'Сообщества, специалисты и участники, которые дают теме живой ритм.'],
      ['Момент', 'Ключевые даты, сезоны, церемонии или дни наблюдения.']
    ],
    climateFallback: {
      facts: [
        ['Базовая система', 'Земля', 'Погода, вода, лед и экосистемы формируют жизнь и путешествия.'],
        ['Масштаб', 'От местного до глобального', 'Небольшие изменения могут быть связаны с планетарными закономерностями.'],
        ['Планирование', 'Сезонность', 'Климатические темы влияют на сроки, маршруты и безопасность.'],
        ['Главный сигнал', 'Изменение', 'Долгосрочные тенденции делают наблюдение и защиту особенно важными.']
      ],
      timeline: [
        ['1', 'Наблюдение', 'Люди отслеживают сезоны, приливы, погоду и живую природу.'],
        ['2', 'Наука', 'Измерения делают закономерности видимыми.'],
        ['3', 'Защита', 'Парки, договоры и исследования помогают защищать уязвимые места.'],
        ['4', 'Климатическая эпоха', 'Изменение климата становится центральным фактором планирования.'],
        ['5', 'Адаптация', 'Города и путешественники подстраиваются под новые условия.']
      ],
      source: 'Контекст OneSliders для планирования, наблюдения и открытия мест.'
    },
    specs: {
      marine: {
        eyebrow: 'Климат - океаны, побережья, морская жизнь',
        intro: 'Морская климатическая тема связывает океаны, побережья, коралловые рифы, штормовые риски и защиту морских экосистем в одном компактном обзоре.',
        facts: [
          ['Климатический буфер', 'Океан', 'Океаны поглощают значительную часть тепла и углекислого газа, влияя на климат всей планеты.'],
          ['Риск побережий', 'Штормы и уровень моря', 'Прибрежные города следят за штормовыми нагонами, эрозией и долгосрочным повышением уровня моря.'],
          ['Живая система', 'Экосистемы', 'Рифы, мангры, водоросли и морские виды показывают состояние океана.'],
          ['Планирование', 'Сезоны', 'Температура воды, циклоны и морские праздники меняют календарь поездок и наблюдений.']
        ],
        timeline: [
          ['1950-е', 'Глобальные океанские наблюдения', 'Исследовательские суда и буи расширяют картину состояния морей.'],
          ['1982', 'Конвенция ООН по морскому праву', 'Мировой океан получает общую правовую рамку.'],
          ['1992', 'Океан входит в повестку Рио', 'Защита морей связывается с климатом и устойчивым развитием.'],
          ['2008', 'Всемирный день океанов признан ООН', '8 июня становится ежегодной датой для внимания к океану.'],
          ['2020-е', 'Голубая адаптация', 'Побережья, рифы и мангры становятся частью климатической защиты.']
        ],
        focusTitle: 'Что определяет морскую климатическую тему',
        focus: [
          ['Побережья', 'Города, порты и острова находятся на переднем крае климатического риска.'],
          ['Биоразнообразие', 'Морская жизнь показывает, как меняются температура, кислород и кислотность воды.'],
          ['Наблюдения', 'Спутники, буи и местные данные помогают понимать изменения океана.'],
          ['Защита', 'Морские заповедники и восстановление побережий снижают уязвимость.']
        ],
        source: 'Страница связывает океанские события с климатическими рисками, защитой побережий и морской жизнью.',
        eventsTitle: 'Предстоящие события'
      },
      weather: {
        eyebrow: 'Климат - экстремумы, предупреждения, адаптация',
        intro: 'Климатическая погода показывает, что стоит за ежедневными прогнозами: жара, штормы, засуха, осадки и системы предупреждения, которые помогают людям действовать при растущем климатическом риске.',
        facts: [
          ['Климатический сигнал', 'Экстремумы', 'Более теплая атмосфера может усиливать жару, сильные осадки и воздействие прибрежных штормов.'],
          ['Раннее предупреждение', 'Готовность', 'Прогнозы и оповещения превращают климатический риск в решения, которые люди могут принять.'],
          ['Сезонный взгляд', 'Закономерности', 'Сезоны ураганов, муссонов, пожаров и жары формируют региональное планирование.'],
          ['Воздействие на людей', 'Уязвимость', 'Одинаковое погодное явление становится опаснее там, где люди и инфраструктура хуже защищены.']
        ],
        timeline: [
          ['1873', 'Международное погодное сотрудничество', 'Национальные службы начинают согласовывать наблюдения между странами.'],
          ['1950', 'Создана ВМО', 'Всемирная метеорологическая организация формирует глобальную рамку для данных о погоде, климате и воде.'],
          ['1988', 'Создана МГЭИК', 'Оценка климатической науки становится регулярным международным процессом.'],
          ['2015', 'Парижское соглашение', 'Адаптация и климатический риск становятся центральным языком политики.'],
          ['2020-е', 'Рывок ранних предупреждений', 'Прогнозы, оповещения и устойчивость становятся климатическими приоритетами.']
        ],
        focusTitle: 'Что определяет климатическую погоду',
        focus: [
          ['Экстремумы', 'Жара, штормы, засуха и наводнения показывают, как меняются опасности.'],
          ['Предупреждения', 'Прогнозы, обзоры и оповещения помогают сообществам готовиться.'],
          ['Сезонность', 'Риск различается по регионам: тропики, побережья, горы и города живут по-разному.'],
          ['Адаптация', 'Планирование связывает погодные данные со здоровьем, транспортом, энергией и водой.']
        ],
        source: 'Страницы о климатической погоде рассматривают погоду как тему климатического риска и адаптации, а не как ежедневный прогноз.',
        eventsTitle: 'Предстоящие события'
      },
      'climate-action': {
        eyebrow: 'Климат - политика, общественные действия, ответственность',
        intro: 'Климатические действия объединяют глобальные переговоры, общественные кампании и местные решения, направленные на сокращение выбросов, защиту людей и адаптацию к изменениям.',
        facts: [
          ['Глобальный процесс', 'РКИК ООН', 'Страны встречаются в рамках климатического процесса ООН, чтобы обсуждать цели, финансирование и выполнение решений.'],
          ['Общественное действие', 'День Земли', 'Ежегодные кампании превращают обеспокоенность климатом в местные события и гражданское давление.'],
          ['Главная цель', '1,5-2 °C', 'Парижское соглашение задает рамку усилий по ограничению роста глобальной температуры.'],
          ['Местный уровень', 'Выполнение', 'Города, школы, бизнес и сообщества превращают обещания в практические шаги.']
        ],
        timeline: [
          ['1970', 'Первый День Земли', 'Массовое общественное экологическое действие становится современным гражданским движением.'],
          ['1992', 'Принята РКИК ООН', 'Саммит в Рио создает климатическую конвенцию.'],
          ['1997', 'Киотский протокол', 'Обязательные цели по выбросам входят в климатическую дипломатию.'],
          ['2015', 'Парижское соглашение', 'Почти все страны принимают общую климатическую рамку.'],
          ['2026', 'COP31', 'Переговорщики встречаются в Анталье, чтобы продолжить работу по выполнению и финансированию.']
        ],
        focusTitle: 'Что определяет климатические действия',
        focus: [
          ['Переговоры', 'COP и сессии ООН задают политическое направление.'],
          ['Мобилизация', 'Дни кампаний помогают людям организоваться вокруг понятных дат.'],
          ['Финансы', 'Финансирование и потери с ущербом влияют на то, что реально возможно.'],
          ['Ответственность', 'Прогресс зависит от сравнения обещаний с выполнением.']
        ],
        source: 'Страницы о климатических действиях связывают глобальные политические даты с общественными экологическими кампаниями.',
        eventsTitle: 'Предстоящие события'
      }
    }
  }
};

function climatePack(category, topics, ui, facts, timeline, focus) {
  if (!ui.focusTitle) ui.focusTitle = (name) => `${ui.watchLabel || 'Focus'}: ${name}`;
  return {
    categoryNames: { climate: category },
    topicNames: topics,
    ui,
    genericFocus: focus,
    climateFallback: {
      facts,
      timeline,
      source: ui.source || 'OneSliders climate context.',
      eventsTitle: ui.eventsTitle || ui.next || 'Upcoming events'
    }
  };
}

Object.assign(localized, {
  ar: climatePack('المناخ', { weather: 'طقس المناخ', marine: 'البحار والمحيطات', sustainability: 'الاستدامة', 'climate-action': 'العمل المناخي', 'ice-and-glaciers': 'الجليد والأنهار الجليدية', 'protected-nature': 'الطبيعة المحمية' },
    { facts: 'حقائق', historyLabel: 'محطات تاريخية', historyTitle: (name) => `كيف أصبحت «${name}» موضوعا عالميا`, watchLabel: 'ما يجب مراقبته', eventsControls: 'التحكم في أحداث قادمة', prev: 'الأحداث السابقة', next: 'الأحداث التالية', browse: 'تصفح تقويم الأحداث الكامل للإضافات الجديدة.', source: 'ملاحظات OneSliders المناخية للتخطيط والاكتشاف.' },
    [['النظام الأساسي','الأرض','الطقس والماء والجليد والنظم البيئية تشكل الحياة والسفر.'],['النطاق','محلي إلى عالمي','يمكن للتغيرات الصغيرة أن ترتبط بأنماط كوكبية.'],['عدسة التخطيط','الموسمية','تؤثر موضوعات المناخ في التوقيت والطرق والسلامة.'],['نقطة مراقبة','التغير','الاتجاهات الطويلة تجعل المراقبة والحماية عاجلتين.']],
    [['1','الملاحظة','يتابع الناس المواسم والمد والجزر والطقس والحياة البرية.'],['2','العلم','تجعل القياسات الأنماط مرئية.'],['3','الحماية','تدافع المتنزهات والاتفاقيات والبحوث عن الأماكن الهشة.'],['4','عصر المناخ','يصبح التغير عاملا مركزيا في التخطيط.'],['5','التكيف','تتكيف المدن والمسافرون مع ظروف جديدة.']],
    [['الشكل','كيف يتكون الموضوع وأين تظهر الضغوط.'],['المكان','المناظر أو المدن أو السواحل التي تغير القصة.'],['الناس','المجتمعات والخبراء الذين يمنحون الموضوع نبضا.'],['اللحظة','التواريخ والمواسم وأيام العمل الحاسمة.']]),
  sw: climatePack('Hali ya hewa', { weather: 'Hali ya hewa na tabianchi', marine: 'Bahari', sustainability: 'Uendelevu', 'climate-action': 'Hatua za tabianchi', 'ice-and-glaciers': 'Barafu na barafu mito', 'protected-nature': 'Asili iliyolindwa' },
    { facts: 'ukweli', historyLabel: 'Nguzo za historia', historyTitle: (name) => `Jinsi ${name} ilivyokuwa ya dunia`, watchLabel: 'Cha kuangalia', eventsControls: 'Vidhibiti vya matukio yajayo', prev: 'Matukio yaliyotangulia', next: 'Matukio yanayofuata', browse: 'Fungua kalenda kamili ya matukio kwa nyongeza mpya.', source: 'Maelezo ya OneSliders ya tabianchi kwa kupanga na kugundua.' },
    [['Mfumo mkuu','Dunia','Hali ya hewa, maji, barafu na mifumo hai huunda maisha na safari.'],['Kiwango','Mahali hadi dunia','Mabadiliko madogo yanaweza kuungana na mifumo ya sayari.'],['Mtazamo wa kupanga','Misimu','Mada za tabianchi huathiri muda, njia na usalama.'],['Cha kufuatilia','Mabadiliko','Mwelekeo wa muda mrefu hufanya uangalizi na ulinzi kuwa muhimu.']],
    [['1','Uchunguzi','Watu hufuatilia misimu, mawimbi, hali ya hewa na viumbe.'],['2','Sayansi','Vipimo hufanya mifumo ionekane.'],['3','Ulinzi','Hifadhi, mikataba na utafiti hulinda maeneo dhaifu.'],['4','Enzi ya tabianchi','Mabadiliko huwa sehemu kuu ya kupanga.'],['5','Kukabiliana','Miji na wasafiri hubadilika kwa hali mpya.']],
    [['Muundo','Jinsi mada ilivyopangwa na shinikizo linapojengwa.'],['Mahali','Mandhari, miji au pwani zinazobadilisha hadithi.'],['Watu','Jamii na wataalamu wanaoipa mada uhai.'],['Wakati','Tarehe, misimu na siku za hatua muhimu.']]),
  ha: climatePack('Sauyin yanayi', { weather: 'Yanayin sauyin yanayi', marine: 'Tekuna', sustainability: 'Dorewa', 'climate-action': 'Aikin sauyin yanayi', 'ice-and-glaciers': 'Kankara da dusar kankara', 'protected-nature': 'Yanayi mai kariya' },
    { facts: 'gaskiya', historyLabel: 'Ginshikan tarihi', historyTitle: (name) => `Yadda ${name} ya zama na duniya`, watchLabel: 'Abin kallo', eventsControls: 'Sarrafa abubuwan gaba', prev: 'Abubuwan baya', next: 'Abubuwan gaba', browse: 'Duba cikakken kalandar abubuwa don sababbin kari.', source: 'Bayanan OneSliders na sauyin yanayi don shiri da gano wurare.' },
    [['Tsarin asali','Duniya','Yanayi, ruwa, kankara da halittu suna tsara rayuwa da tafiya.'],['Ma’auni','Gida zuwa duniya','Kananan canje-canje na iya hade da tsarin duniya.'],['Shiri','Lokutan shekara','Batutuwa na sauyin yanayi suna shafar lokaci, hanya da tsaro.'],['Abin lura','Canji','Dogon canji ya sa lura da kariya su zama gaggawa.']],
    [['1','Lura','Mutane suna bibiyar lokaci, ruwa, yanayi da namun daji.'],['2','Kimiyya','Aunawa na sa tsarin ya bayyana.'],['3','Kariya','Wuraren kariya, yarjejeniyoyi da bincike suna kare wurare masu rauni.'],['4','Zamanin sauyin yanayi','Canji ya zama babban abu a shiri.'],['5','Daidaitawa','Birane da matafiya suna saba da sabon yanayi.']],
    [['Tsari','Yadda maudu\'i yake da inda matsin lamba ke tasowa.'],['Wuri','Muhalli, birane ko bakin teku da ke sauya labari.'],['Mutane','Alumma da kwararru da ke ba shi rai.'],['Lokaci','Ranaku, lokuta da kwanakin aiki masu muhimmanci.']]),
  zh: climatePack('气候', { weather: '气候天气', marine: '海洋', sustainability: '可持续发展', 'climate-action': '气候行动', 'ice-and-glaciers': '冰与冰川', 'protected-nature': '受保护自然' },
    { facts: '事实', historyLabel: '历史锚点', historyTitle: (name) => `${name} 如何成为全球议题`, watchLabel: '关注重点', eventsControls: '即将到来的事件轮播控制', prev: '上一组事件', next: '下一组事件', browse: '浏览完整事件日历，查看新增内容。', source: 'OneSliders 气候背景说明，用于规划与发现。' },
    [['核心系统','地球','天气、水、冰和生态系统塑造生活与旅行。'],['尺度','从本地到全球','小变化可能连接到行星尺度的模式。'],['规划视角','季节性','气候主题影响时间、路线和安全。'],['观察点','变化','长期趋势让观察和保护更加紧迫。']],
    [['1','观察','人们追踪季节、潮汐、天气和野生生物。'],['2','科学','测量让模式变得可见。'],['3','保护','公园、条约和研究保护脆弱地点。'],['4','气候时代','变化成为规划的核心因素。'],['5','适应','城市和旅行者根据新条件调整。']],
    [['形式','主题如何组织以及压力在哪里形成。'],['地点','改变故事的景观、城市或海岸。'],['人群','让主题有生命力的社区和专家。'],['时刻','关键日期、季节和行动日。']]),
  hi: climatePack('जलवायु', { weather: 'जलवायु मौसम', marine: 'समुद्री', sustainability: 'स्थिरता', 'climate-action': 'जलवायु कार्रवाई', 'ice-and-glaciers': 'बर्फ और हिमनद', 'protected-nature': 'संरक्षित प्रकृति' },
    { facts: 'तथ्य', historyLabel: 'इतिहास के आधार', historyTitle: (name) => `${name} कैसे वैश्विक विषय बना`, watchLabel: 'क्या देखें', eventsControls: 'आगामी कार्यक्रम नियंत्रण', prev: 'पिछले कार्यक्रम', next: 'अगले कार्यक्रम', browse: 'नए जोड़ देखने के लिए पूरा कार्यक्रम कैलेंडर खोलें।', source: 'योजना और खोज के लिए OneSliders जलवायु संदर्भ नोट्स।' },
    [['मुख्य प्रणाली','पृथ्वी','मौसम, पानी, बर्फ और पारिस्थितिकी जीवन और यात्रा को आकार देते हैं।'],['पैमाना','स्थानीय से वैश्विक','छोटे बदलाव ग्रह स्तर के पैटर्न से जुड़ सकते हैं।'],['योजना दृष्टि','मौसमीपन','जलवायु विषय समय, मार्ग और सुरक्षा को प्रभावित करते हैं।'],['देखने योग्य','बदलाव','दीर्घकालिक रुझान निगरानी और सुरक्षा को जरूरी बनाते हैं।']],
    [['1','अवलोकन','लोग मौसम, ज्वार, जलवायु और वन्यजीवन देखते हैं।'],['2','विज्ञान','माप पैटर्न को दिखाई देता बनाते हैं।'],['3','संरक्षण','पार्क, संधियां और शोध कमजोर स्थानों की रक्षा करते हैं।'],['4','जलवायु युग','बदलाव योजना का केंद्रीय तत्व बनता है।'],['5','अनुकूलन','शहर और यात्री नई स्थितियों के अनुसार बदलते हैं।']],
    [['रूप','विषय कैसे बना है और दबाव कहां बढ़ता है।'],['स्थान','दृश्य, शहर या तट जो कहानी बदलते हैं।'],['लोग','समुदाय और विशेषज्ञ जो विषय को जीवंत बनाते हैं।'],['क्षण','मुख्य तारीखें, मौसम और कार्रवाई दिवस।']]),
  de: climatePack('Klima', { weather: 'Klima und Wetter', marine: 'Meere', sustainability: 'Nachhaltigkeit', 'climate-action': 'Klimaschutz', 'ice-and-glaciers': 'Eis und Gletscher', 'protected-nature': 'Geschützte Natur' },
    { facts: 'Fakten', historyLabel: 'Historische Anker', historyTitle: (name) => `Wie ${name} global wurde`, watchLabel: 'Worauf achten', eventsControls: 'Karussellsteuerung für kommende Ereignisse', prev: 'Vorherige Ereignisse', next: 'Nächste Ereignisse', browse: 'Den vollständigen Eventkalender für neue Ergänzungen öffnen.', source: 'OneSliders-Klimanotizen für Planung und Entdeckung.' },
    [['Kernsystem','Erde','Wetter, Wasser, Eis und Ökosysteme prägen Leben und Reisen.'],['Maßstab','Lokal bis global','Kleine Veränderungen können mit planetaren Mustern verbunden sein.'],['Planungsblick','Saisonalität','Klimathemen beeinflussen Timing, Routen und Sicherheit.'],['Beobachtungspunkt','Veränderung','Langfristige Trends machen Beobachtung und Schutz dringlich.']],
    [['1','Beobachtung','Menschen verfolgen Jahreszeiten, Gezeiten, Wetter und Wildtiere.'],['2','Wissenschaft','Messungen machen Muster sichtbar.'],['3','Schutz','Parks, Verträge und Forschung schützen verletzliche Orte.'],['4','Klimaära','Veränderung wird ein zentraler Planungsfaktor.'],['5','Anpassung','Städte und Reisende stellen sich auf neue Bedingungen ein.']],
    [['Format','Wie das Thema aufgebaut ist und wo Druck entsteht.'],['Ort','Landschaften, Städte oder Küsten, die die Geschichte verändern.'],['Menschen','Gemeinschaften und Fachleute, die dem Thema Leben geben.'],['Moment','Entscheidende Daten, Saisons und Aktionstage.']]),
  fr: climatePack('Climat', { weather: 'Météo climatique', marine: 'Milieux marins', sustainability: 'Durabilité', 'climate-action': 'Action climatique', 'ice-and-glaciers': 'Glace et glaciers', 'protected-nature': 'Nature protégée' },
    { facts: 'infos', historyLabel: 'Repères historiques', historyTitle: (name) => `Comment ${name} est devenu mondial`, watchLabel: 'À surveiller', eventsControls: 'Commandes du carrousel des événements', prev: 'Événements précédents', next: 'Événements suivants', browse: 'Ouvrir le calendrier complet pour voir les nouveaux ajouts.', source: 'Notes climat OneSliders pour planifier et découvrir.' },
    [['Système central','Terre','Météo, eau, glace et écosystèmes façonnent la vie et les voyages.'],['Échelle','Du local au mondial','De petits changements peuvent rejoindre des modèles planétaires.'],['Angle planning','Saisonnalité','Les sujets climat influencent dates, routes et sécurité.'],['Point de veille','Changement','Les tendances longues rendent observation et protection urgentes.']],
    [['1','Observation','Les populations suivent saisons, marées, météo et faune.'],['2','Science','Les mesures rendent les modèles visibles.'],['3','Protection','Parcs, traités et recherche défendent les lieux vulnérables.'],['4','Ère climatique','Le changement devient central dans la planification.'],['5','Adaptation','Villes et voyageurs s’ajustent aux nouvelles conditions.']],
    [['Format','Comment le thème est structuré et où la pression monte.'],['Lieu','Paysages, villes ou côtes qui changent l’histoire.'],['Personnes','Communautés et experts qui donnent du rythme au sujet.'],['Moment','Dates, saisons et journées d’action décisives.']]),
  es: climatePack('Clima', { weather: 'Clima y tiempo extremo', marine: 'Marino', sustainability: 'Sostenibilidad', 'climate-action': 'Acción climática', 'ice-and-glaciers': 'Hielo y glaciares', 'protected-nature': 'Naturaleza protegida' },
    { facts: 'datos', historyLabel: 'Anclajes históricos', historyTitle: (name) => `Cómo ${name} se volvió global`, watchLabel: 'Qué observar', eventsControls: 'Controles de eventos próximos', prev: 'Eventos anteriores', next: 'Eventos siguientes', browse: 'Abrir el calendario completo para ver nuevas incorporaciones.', source: 'Notas climáticas de OneSliders para planificación y descubrimiento.' },
    [['Sistema central','Tierra','Tiempo, agua, hielo y ecosistemas dan forma a la vida y los viajes.'],['Escala','Local a global','Cambios pequeños pueden conectar con patrones planetarios.'],['Lente de planificación','Estacionalidad','Los temas climáticos afectan fechas, rutas y seguridad.'],['Punto de vigilancia','Cambio','Las tendencias largas vuelven urgente observar y proteger.']],
    [['1','Observación','La gente sigue estaciones, mareas, tiempo y vida silvestre.'],['2','Ciencia','Las mediciones hacen visibles los patrones.'],['3','Protección','Parques, tratados e investigación defienden lugares vulnerables.'],['4','Era climática','El cambio se vuelve un factor central de planificación.'],['5','Adaptación','Ciudades y viajeros se ajustan a nuevas condiciones.']],
    [['Formato','Cómo se estructura el tema y dónde crece la presión.'],['Lugar','Paisajes, ciudades o costas que cambian la historia.'],['Personas','Comunidades y expertos que dan pulso al tema.'],['Momento','Fechas, temporadas y días de acción decisivos.']]),
  pt: climatePack('Clima', { weather: 'Tempo climático', marine: 'Marinho', sustainability: 'Sustentabilidade', 'climate-action': 'Ação climática', 'ice-and-glaciers': 'Gelo e geleiras', 'protected-nature': 'Natureza protegida' },
    { facts: 'fatos', historyLabel: 'Marcos históricos', historyTitle: (name) => `Como ${name} se tornou global`, watchLabel: 'O que observar', eventsControls: 'Controles de eventos futuros', prev: 'Eventos anteriores', next: 'Próximos eventos', browse: 'Abrir o calendário completo para ver novas adições.', source: 'Notas climáticas do OneSliders para planejamento e descoberta.' },
    [['Sistema central','Terra','Tempo, água, gelo e ecossistemas moldam vida e viagens.'],['Escala','Local a global','Pequenas mudanças podem se ligar a padrões planetários.'],['Lente de planejamento','Sazonalidade','Temas climáticos afetam datas, rotas e segurança.'],['Ponto de atenção','Mudança','Tendências longas tornam observação e proteção urgentes.']],
    [['1','Observação','Pessoas acompanham estações, marés, tempo e vida silvestre.'],['2','Ciência','Medições tornam padrões visíveis.'],['3','Proteção','Parques, tratados e pesquisa defendem lugares vulneráveis.'],['4','Era climática','A mudança vira fator central no planejamento.'],['5','Adaptação','Cidades e viajantes se ajustam a novas condições.']],
    [['Formato','Como o tema se estrutura e onde a pressão cresce.'],['Lugar','Paisagens, cidades ou costas que mudam a história.'],['Pessoas','Comunidades e especialistas que dão ritmo ao tema.'],['Momento','Datas, estações e dias de ação decisivos.']]),
  qu: climatePack('Pacha klima', { weather: 'Klima pacha wayra', marine: 'Mama qucha', sustainability: 'Kawsayta waqaychay', 'climate-action': 'Klima ruway', 'ice-and-glaciers': 'Riti chhullunkuna', 'protected-nature': 'Waqaychasqa pachamama' },
    { facts: 'willakuy', historyLabel: 'Ñawpa tinkikuna', historyTitle: (name) => `Imaynata ${name} pachantinman chayarqun`, watchLabel: 'Qhawanapaq', eventsControls: 'Hamuq raymikuna kamachiy', prev: 'Ñawpaq raymikuna', next: 'Hamuq raymikuna', browse: 'Llapan raymi kalindaryuta kichay musuq yapasqakunapaq.', source: 'OneSliders klima yuyaykuna yuyaychanapaq.' },
    [['Sapi sistema','Pacha','Wayra, yaku, riti, kawsaykunapas kawsayta puriyta ruran.'],['Patak','Llaqtamanta pachantinman','Uchuy tikraykuna pachantin patrunawan tinkin.'],['Yuyaychay','Mit’akuna','Klima yuyaykuna p’unchawta, ñanta, allin kayta tikran.'],['Qhaway','Tikray','Unay tikraykuna qhawayta waqaychayta usqhaychan.']],
    [['1','Qhaway','Runakuna mit’ata, yakuta, wayrata, sallqa kawsayta qhawanku.'],['2','Yachay','Tupuykuna patrunata rikuchinku.'],['3','Waqaychay','Parquekuna, rimanakuykuna, maskaykuna kitikunata waqaychanku.'],['4','Klima mit’a','Tikray yuyaychaypa chawpinman yaykun.'],['5','Yachapakuy','Llaqtakuna puriqkunapas musuq kayman yachapakunku.']],
    [['Formato','Imayna tema ruwasqa kachkan.'],['Kiti','Pacha, llaqta utaq mama qucha pata willakuyta tikran.'],['Runakuna','Ayllukuna yachaqkunapas kawsayta qunku.'],['P’unchaw','Hatun p’unchawkuna mit’akuna ruway p’unchawkuna.']]),
  tpi: climatePack('Klaimet', { weather: 'Klaimet weda', marine: 'Solwara', sustainability: 'Gutpela lukaut', 'climate-action': 'Klaimet aksen', 'ice-and-glaciers': 'Ais na glasier', 'protected-nature': 'Lukautim bus na graun' },
    { facts: 'fakt', historyLabel: 'Histori mak', historyTitle: (name) => `Olsem wanem ${name} i kamap global`, watchLabel: 'Wanem long lukim', eventsControls: 'Kontrol bilong ol event i kamap', prev: 'Event bipo', next: 'Narapela event', browse: 'Lukim olgeta event kalenda long ol nupela samting.', source: 'OneSliders klaimet not bilong plen na painimaut.' },
    [['As sistem','Graun','Weda, wara, ais na laip sistem i wokim laip na travel.'],['Skel','Lokal i go global','Liklik senis inap pas long bikpela pattern bilong graun.'],['Plen lukluk','Sisen','Klaimet topik i senisim taim, rot na seifti.'],['Mak bilong lukim','Senis','Longpela senis i mekim lukaut na was i bikpela samting.']],
    [['1','Was','Ol manmeri i lukim sisen, wara, weda na bus laip.'],['2','Saiens','Mesa i mekim pattern i kamap ples klia.'],['3','Lukaut','Paka, agrimen na risets i lukautim ol hap i no strong.'],['4','Klaimet taim','Senis i kamap bikpela hap bilong plen.'],['5','Senisim pasin','Siti na travela i bihainim nupela kondisen.']],
    [['Format','Topik i stap olsem wanem na presa i kamap we.'],['Ples','Graun, siti o nambis i senisim stori.'],['Manmeri','Komuniti na save-man i givim laip long topik.'],['Taim','Bikpela de, sisen na aksen de.']]),
  mi: climatePack('Āhuarangi', { weather: 'Huarere āhuarangi', marine: 'Moana', sustainability: 'Toitūtanga', 'climate-action': 'Mahi āhuarangi', 'ice-and-glaciers': 'Hukapapa me ngā kōpaka', 'protected-nature': 'Taiao tiakina' },
    { facts: 'meka', historyLabel: 'Pou hītori', historyTitle: (name) => `I pēhea te ao whānui o ${name}`, watchLabel: 'Hei mātaki', eventsControls: 'Mana carousel kaupapa e haere mai ana', prev: 'Kaupapa o mua', next: 'Kaupapa e whai ake nei', browse: 'Tirohia te maramataka kaupapa katoa mō ngā tāpiritanga hou.', source: 'Ngā tuhipoka āhuarangi OneSliders mō te whakamahere me te kite.' },
    [['Pūnaha matua','Te Ao','Huarere, wai, huka me ngā rauropi e hanga ana i te oranga me te haerenga.'],['Tauine','Ā-rohe ki te ao','Ka hono ngā panoni iti ki ngā tauira ao.'],['Tirohanga whakamahere','Kaupeka','Ka pā ngā kaupapa āhuarangi ki te wā, te ara me te haumaru.'],['Tohu mātaki','Panoni','Ka whakatere ngā ia roa i te mātakitaki me te tiaki.']],
    [['1','Mātakitaki','Ka whai te tangata i ngā kaupeka, tai, huarere me te taiao ora.'],['2','Pūtaiao','Ka kitea ngā tauira mā ngā inenga.'],['3','Tiaki','Ka tiaki ngā papa, tiriti me te rangahau i ngā wāhi whakaraerae.'],['4','Te ao āhuarangi','Ka noho te panoni hei matua mō te whakamahere.'],['5','Urutau','Ka urutau ngā tāone me ngā kaihaere ki ngā āhuatanga hou.']],
    [['Hōputu','Te hanganga o te kaupapa me te wāhi e piki ai te pēhanga.'],['Wāhi','Ngā whenua, tāone, takutai rānei e huri ana i te kōrero.'],['Tāngata','Ngā hapori me ngā mātanga e tuku manawa ana.'],['Wā','Ngā rā, kaupeka me ngā rā mahi matua.']])
});

const specs = {
  golf: {
    eyebrow: 'Sport - ancient links, modern majors',
    intro: 'A precision sport shaped by landscapes: links, parkland, deserts and oceanside courses turn a small ball, a club and a walking route into a global calendar.',
    facts: [['Modern roots','Scotland','Golf grew around Scottish links courses.'],['Oldest major','1860','The Open Championship began at Prestwick.'],['Major count','4 + 5','Four men\'s majors and five women\'s majors define elite seasons.'],['Standard round','18 holes','The St Andrews model became the familiar round length.']],
    timeline: [['1457','Golf appears in Scottish records','The game was notable enough to be banned because it distracted from archery practice.'],['1754','St Andrews club formed','The society that became the R&A helped standardize the game.'],['1860','The Open begins','Prestwick hosted the first championship now known as golf\'s oldest major.'],['1934','Masters Tournament starts','Augusta created a spring ritual in the professional calendar.'],['1950','LPGA founded','Women\'s professional golf gained a long-running tour.']],
    focusTitle: 'Top 3 in the world',
    focus: [['Men','Scottie Scheffler','Rory McIlroy','Cameron Young'],['Women','Nelly Korda','Jeeno Thitikul','Hyojoo Kim']],
    source: 'Men: Official World Golf Ranking, 10 May 2026. Women: Rolex Rankings, 11 May 2026.',
    eventsTitle: 'Upcoming majors'
  },
  tennis: {
    eyebrow: 'Sport - surfaces, slams, rivalries',
    intro: 'Tennis moves through hard courts, clay, grass and indoor arenas, turning individual match play into a year-round global tour.',
    facts: [['Modern roots','England','Lawn tennis took shape in the late 19th century.'],['Grand Slams','4','Australia, Roland-Garros, Wimbledon and New York anchor the season.'],['Scoring','Sets','Pressure builds through games, sets and tiebreaks.'],['Surfaces','4','Hard, clay, grass and indoor courts shape style.']],
    timeline: [['1877','Wimbledon begins','The oldest major creates tennis\'s grass-court landmark.'],['1900','Davis Cup starts','National team tennis gains an international stage.'],['1968','Open Era begins','Professionals and amateurs compete in the same majors.'],['1973','WTA founded','Women\'s tennis organizes a global tour.'],['1988','Golden Slam','Steffi Graf wins all four majors and Olympic gold.']]
  },
  football: {
    eyebrow: 'Sport - clubs, countries, one ball',
    intro: 'Football connects local clubs, national teams and global tournaments through the simplest shared language in sport.',
    facts: [['World body','FIFA','Founded in 1904 to coordinate the global game.'],['World Cup','1930','The men\'s tournament began in Uruguay.'],['Women\'s World Cup','1991','The women\'s global tournament became a major stage.'],['Match length','90 minutes','Two halves, plus stoppage time and extra time when needed.']],
    timeline: [['1863','Association rules formed','English clubs codify a common game.'],['1904','FIFA founded','International football gets a governing body.'],['1930','First World Cup','Uruguay hosts and wins the first edition.'],['1955','European Cup begins','Club football gains a continental showcase.'],['1991','Women\'s World Cup begins','The women\'s game gains a global tournament.']]
  },
  'formula-1': {
    eyebrow: 'Sport - circuits, speed, engineering',
    intro: 'Formula 1 blends elite drivers, high-speed circuits and constant engineering development into a travelling world championship.',
    facts: [['First season','1950','The modern championship began at Silverstone.'],['Cars','Hybrid era','Power units combine combustion and electric recovery.'],['Weekend','Practice to race','Sessions build toward qualifying and grand prix strategy.'],['Points','Top finishers','Race results shape driver and constructor championships.']],
    timeline: [['1950','Championship starts','Silverstone hosts the first world championship race.'],['1958','Constructors title','Teams receive their own championship.'],['1977','Ground effect era','Aerodynamics changes the look and speed of cars.'],['2014','Hybrid power','Turbo-hybrid power units reset the technical formula.'],['2026','New rules cycle','Power unit and chassis changes reshape the grid.']]
  },
  olympics: {
    eyebrow: 'Sport - rings, host cities, ceremonies',
    intro: 'The Olympic movement gathers summer and winter sports into host-city festivals where competition, ceremony and place meet.',
    facts: [['Modern Games','1896','Athens hosted the first modern Olympics.'],['Winter Games','1924','Chamonix launched the winter edition.'],['Symbol','5 rings','The rings represent global participation.'],['Cycle','4 years','Summer and winter editions run on their own cycles.']],
    timeline: [['1896','Modern Olympics return','Athens stages the first modern Games.'],['1924','Winter Games begin','Snow and ice sports receive a dedicated edition.'],['1960','Paralympic Games begin','The movement grows beside the Olympics.'],['1994','Winter cycle shifts','Winter Games move between Summer editions.'],['2028','Los Angeles hosts','The Games return to California.']]
  },
  weather: {
    eyebrow: 'Climate - extremes, warnings, adaptation',
    intro: 'Climate weather is about the signals behind daily forecasts: heat, storms, drought, rainfall and the warning systems people use as climate risk grows.',
    facts: [['Climate signal','Extremes','A warmer atmosphere can intensify heat, heavy rain and coastal storm impacts.'],['Early warning','Preparedness','Forecasts and alerts turn climate risk into decisions people can act on.'],['Season lens','Patterns','Hurricane, monsoon, fire and heat seasons shape regional planning.'],['Human impact','Exposure','The same weather event becomes more dangerous where people and infrastructure are vulnerable.']],
    timeline: [['1873','International weather cooperation','National services begin coordinating observations across borders.'],['1950','WMO established','The World Meteorological Organization creates a global framework for weather, climate and water data.'],['1988','IPCC created','Climate science assessment becomes a repeated international process.'],['2015','Paris Agreement','Adaptation and climate risk become central policy language.'],['2020s','Early warning push','Forecasting, alerts and resilience planning become climate priorities.']],
    focusTitle: 'What defines climate weather',
    focus: [['Extremes','Heat, storms, drought and floods show how hazards are changing.'],['Warnings','Forecasts, outlooks and alerts help communities prepare.'],['Seasonality','Risk changes by region: tropics, coasts, mountains and cities all differ.'],['Adaptation','Planning connects weather data with health, transport, energy and water.']],
    source: 'Climate-weather pages focus on weather as a climate risk and adaptation topic, not daily forecasts.'
  },
  'climate-action': {
    eyebrow: 'Climate - policy, civic action, accountability',
    intro: 'Climate action brings together global negotiations, public campaigns and local choices aimed at cutting emissions, protecting communities and adapting to change.',
    facts: [['Global process','UNFCCC','Countries meet through the UN climate process to negotiate targets, finance and implementation.'],['Public action','Earth Day','Annual campaigns turn climate concern into local events and civic pressure.'],['Core target','1.5-2C','The Paris Agreement frames efforts to limit global temperature rise.'],['Local lens','Implementation','Cities, schools, businesses and communities turn commitments into practical change.']],
    timeline: [['1970','First Earth Day','Mass public environmental action becomes a modern civic movement.'],['1992','UNFCCC adopted','The Rio Earth Summit creates the climate convention.'],['1997','Kyoto Protocol','Binding emissions targets enter climate diplomacy.'],['2015','Paris Agreement','Nearly all countries agree a shared climate framework.'],['2026','COP31','Negotiators meet in Antalya to continue implementation and finance work.']],
    focusTitle: 'What defines climate action',
    focus: [['Negotiation','COP meetings and UN sessions set political direction.'],['Mobilization','Campaign days help people organize around clear dates.'],['Finance','Funding and loss-and-damage debates shape what is possible.'],['Accountability','Progress depends on measuring promises against delivery.']],
    source: 'Climate action pages connect global policy dates with public-facing environmental campaigns.'
  }
};

const categoryFallback = {
  sport: {
    facts: [['Modern roots','Organized play','Clubs, rules and federations turned local games into shared competitions.'],['Signature format','Clear rules','Fixed formats make seasons and finals easy to follow.'],['Calendar rhythm','Annual anchors','Major events create repeatable travel and broadcast moments.'],['Travel lens','Venues','Arenas, courses, circuits and landscapes turn sport into destinations.']],
    timeline: [['1','Origins','Local play and regional clubs create recognizable traditions.'],['2','Rules','Shared rules make competition comparable across borders.'],['3','International stage','World cups, tours and championships connect athletes with audiences.'],['4','Media era','Broadcast and sponsorship turn events into global reference points.'],['5','Modern calendar','The sport now shapes travel plans and city identity.']]
  },
  music: {
    facts: [['Core language','Sound','Rhythm, melody and performance connect audiences across borders.'],['Live format','Stages','Festivals, clubs and arenas give music a sense of place.'],['Calendar rhythm','Seasons','Touring cycles and summer festivals anchor travel.'],['Culture lens','Scenes','Genres carry local identity into global listening.']],
    timeline: [['1','Local scenes','Music grows from community, ritual and nightlife.'],['2','Recording era','Records and radio make artists travel without moving.'],['3','Festival age','Multi-day events turn music into destinations.'],['4','Streaming era','Discovery becomes global and immediate.'],['5','Hybrid events','Live shows, broadcasts and social clips merge.']]
  },
  culture: {
    facts: [['Shared stage','Story','Ceremonies, screens and style create common reference points.'],['Event format','Premieres','Awards, shows and gatherings mark cultural seasons.'],['Travel lens','Cities','Cultural events often reveal a city at its most expressive.'],['Audience','Global','Fans follow results, red carpets, releases and icons.']],
    timeline: [['1','Public rituals','Culture gathers people around shared stories.'],['2','Institutions','Academies, festivals and houses organize prestige.'],['3','Mass media','Film, fashion and awards reach global audiences.'],['4','Digital fandom','Online communities amplify moments instantly.'],['5','Experience economy','Travel and culture become tightly linked.']]
  },
  climate: {
    facts: [['Core system','Earth','Weather, water, ice and ecosystems shape life and travel.'],['Scale','Local to global','Small changes can connect to planetary patterns.'],['Planning lens','Seasonality','Climate topics affect timing, routes and safety.'],['Watch point','Change','Long-term trends make observation and protection urgent.']],
    timeline: [['1','Observation','People track seasons, tides, weather and wildlife.'],['2','Science','Measurements make patterns visible.'],['3','Protection','Parks, treaties and research defend vulnerable places.'],['4','Climate era','Change becomes a central planning factor.'],['5','Adaptation','Cities and travellers adjust to new conditions.']]
  },
  'food-and-drinks': {
    facts: [['Core appeal','Taste','Food and drink turn place into memory.'],['Local roots','Producers','Farms, markets, breweries and kitchens shape identity.'],['Event format','Festivals','Tastings and harvest seasons create travel anchors.'],['Culture lens','Ritual','Meals and drinks carry hospitality and tradition.']],
    timeline: [['1','Local staples','Ingredients and climate shape regional taste.'],['2','Trade routes','Flavours move between ports and markets.'],['3','Craft culture','Makers and specialists refine styles.'],['4','Festival growth','Food and drink become reasons to travel.'],['5','Modern scene','Local craft meets global curiosity.']]
  },
  technology: {
    facts: [['Core driver','Innovation','New tools change how people work, play and travel.'],['Event format','Launches','Conferences and expos make technology visible.'],['Audience','Builders','Developers, creators and companies shape adoption.'],['Watch point','Signals','Demos, standards and devices hint at what comes next.']],
    timeline: [['1','Computing roots','Hardware and networks create the base.'],['2','Consumer era','Devices move from labs into daily life.'],['3','Internet scale','Platforms connect people and services.'],['4','Mobile first','Phones become the main interface.'],['5','AI and spatial tools','Software becomes more adaptive and immersive.']]
  },
  wellness: {
    facts: [['Core idea','Recovery','Wellness connects movement, rest, care and place.'],['Travel lens','Retreats','Spas, trails and festivals turn wellbeing into a journey.'],['Practice','Routine','Small repeated habits matter more than one-off moments.'],['Setting','Nature','Water, heat, silence and landscape shape the experience.']],
    timeline: [['1','Ancient practices','Bathing, breath, movement and healing traditions form roots.'],['2','Public baths','Shared wellness becomes civic culture.'],['3','Retreat era','Travel and restoration become linked.'],['4','Science lens','Sleep, stress and movement receive more attention.'],['5','Everyday wellness','Recovery becomes part of work and travel planning.']]
  }
};

const topicSpecific = {
  cricket: [['Overs','Formats','Tests, ODIs and T20s create different rhythms.']],
  rugby: [['Codes','Union + league','Two codes share roots but reward different tactics.']],
  cycling: [['Grand Tours','3','Giro, Tour and Vuelta define road cycling seasons.']],
  marathon: [['Distance','42.195 km','The standard marathon distance links elite sport and mass participation.']],
  'ice-hockey': [['Rink pace','Fast shifts','Short shifts and boards make hockey dense and physical.']],
  'horse-racing': [['Race day','Track + form','Distances, surfaces and field quality shape the story.']],
  jazz: [['Improvisation','Live dialogue','Musicians reshape themes in the moment.']],
  fashion: [['Season','Runway cycle','Collections turn cities into style calendars.']],
  film: [['Screen culture','Premieres','Festivals and awards frame the global film year.']],
  wine: [['Terroir','Place in a glass','Climate, soil and craft shape the bottle.']],
  coffee: [['Origin','Bean to cup','Growing region, roast and brewing all change the profile.']],
  gaming: [['Interactive media','Play','Games combine design, technology, competition and community.']],
  weather: [['Climate signal','Extreme weather','Heat, storms, drought and floods are the weather side of climate risk.']],
  yoga: [['Practice','Breath + movement','Yoga links posture, breath and attention.']]
};

const clean = (value) => String(value ?? '').replace(/Â·|·/g, ' - ').replace(/\s+-\s*$/g, '').replace(/\s{2,}/g, ' ').trim();
const esc = (value) => clean(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const categoryLabel = (lang, category) => localized[lang]?.categoryNames?.[category] || categoryNames[category];
const topicLabel = (lang, slug) => localized[lang]?.topicNames?.[slug] || topicNames[slug] || slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join(' ');
const titleCase = (slug) => topicLabel('en', slug);

function writeFileWithRetry(file, content) {
  let lastError;
  for (let i = 0; i < 6; i += 1) {
    try {
      fs.writeFileSync(file, content, 'utf8');
      return;
    } catch (error) {
      lastError = error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 120);
    }
  }
  throw lastError;
}

function withSpecific(category, slug) {
  const base = categoryFallback[category];
  const extra = topicSpecific[slug];
  if (!extra) return base;
  return { ...base, facts: [extra[0], ...base.facts.slice(0, 3)] };
}

function getSpec(lang, category, slug) {
  const name = topicLabel(lang, slug);
  const langPack = localized[lang] || {};
  const base = langPack.specs?.[slug] || (category === 'climate' ? langPack.climateFallback : undefined) || specs[slug] || withSpecific(category, slug);
  const focus = base.focus || langPack.genericFocus || [['Format','How the topic is structured and where pressure builds.'],['Place','The venues, landscapes or cities that change the story.'],['People','Teams, artists, makers or communities that give it a pulse.'],['Moment','The decisive starts, finishes, ceremonies or showcase days.']];
  return {
    eyebrow: base.eyebrow || `${categoryLabel(lang, category)} - places, calendar, context`,
    intro: base.intro || `${name} brings together places, calendar moments and travel stories in one compact OneSlider view.`,
    facts: base.facts,
    timeline: base.timeline,
    focusTitle: base.focusTitle || (langPack.ui?.focusTitle ? langPack.ui.focusTitle(name) : `What defines ${name}`),
    focus,
    source: base.source || 'OneSliders context notes for planning and discovery.',
    eventsTitle: base.eventsTitle || langPack.ui?.eventsTitle || 'Upcoming events'
  };
}

function extractEvents(lang, topicSlug) {
  const indexPath = path.join(root, lang, 'content', 'events', 'index.html');
  if (!fs.existsSync(indexPath)) return [];
  const html = fs.readFileSync(indexPath, 'utf8');
  const out = [];
  const re = /<a\b([^>]*\bclass="event-card"[^>]*)>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = re.exec(html))) {
    const [, attrs, body] = match;
    const topic = (attrs.match(/\bdata-topic="([^"]+)"/) || [,''])[1];
    const href = (attrs.match(/\bhref="([^"]+)"/) || [,''])[1];
    const start = (attrs.match(/\bdata-start="([^"]+)"/) || [,''])[1];
    const end = (attrs.match(/\bdata-end="([^"]+)"/) || [,''])[1];
    const dateStatus = (attrs.match(/\bdata-date-status="([^"]+)"/) || [,''])[1];
    const officialDate = (attrs.match(/\bdata-official-date="([^"]+)"/) || [,''])[1];
    if (topic !== topicSlug) continue;
    const title = (body.match(/<strong class="card-title">([\s\S]*?)<\/strong>/) || [,''])[1].replace(/<[^>]+>/g, '').trim();
    const meta = (body.match(/<span class="card-meta">([\s\S]*?)<\/span>/) || [,''])[1].replace(/<[^>]+>/g, '').trim();
    const img = (body.match(/<img[^>]+src="([^"]+)"/) || [,''])[1];
    const eventPath = path.join(root, lang, 'content', 'events', href.replace(/\//g, path.sep));
    if (!fs.existsSync(eventPath)) continue;
    out.push({ href: `../../events/${href}`, start, end, dateStatus, officialDate, title, meta, img: img.replace('../content/', '../content/') });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateValue = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return Number.POSITIVE_INFINITY;
    return new Date(`${value}T00:00:00`).getTime();
  };
  const effectiveDate = (event) => Number.isFinite(dateValue(event.start)) ? dateValue(event.start) : dateValue(event.end);
  const sorted = out
    .sort((a, b) => {
      const aEnd = dateValue(a.end);
      const bEnd = dateValue(b.end);
      const aPast = aEnd < today.getTime();
      const bPast = bEnd < today.getTime();
      if (aPast !== bPast) return aPast ? 1 : -1;
      const aDate = effectiveDate(a);
      const bDate = effectiveDate(b);
      return aDate - bDate || a.title.localeCompare(b.title);
    })
  const seen = new Set();
  return sorted
    .filter((event) => {
      const key = event.href.split('#')[0];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function formatCardDate(event, fallback) {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parse = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, monthIndex, day] = value.split('-').map(Number);
    return { year, monthIndex: monthIndex - 1, day };
  };
  const start = parse(event.start);
  const end = parse(event.end);
  if (start && end && event.start !== event.end) {
    if (start.year === end.year && start.monthIndex === end.monthIndex) {
      return `${start.day}-${end.day} ${month[start.monthIndex]} ${start.year}`;
    }
    if (start.year === end.year) {
      return `${start.day} ${month[start.monthIndex]}-${end.day} ${month[end.monthIndex]} ${start.year}`;
    }
    return `${start.day} ${month[start.monthIndex]} ${start.year}-${end.day} ${month[end.monthIndex]} ${end.year}`;
  }
  if (start) return `${start.day} ${month[start.monthIndex]} ${start.year}`;
  if (end) return `${end.day} ${month[end.monthIndex]} ${end.year}`;
  const cleanFallback = clean(fallback);
  if (/\b\d{4}\b.*\bTBC\b/i.test(cleanFallback)) return cleanFallback;
  return 'Date TBC';
}

function heroFor(category, slug, events) {
  const categoryHero = `../content/categories/${category}/img/${slug}-hero-wide.png`;
  if (fs.existsSync(path.join(root, 'content', 'categories', category, 'img', `${slug}-hero-wide.png`))) return categoryHero;
  const eventHero = events.find((e) => e.img)?.img;
  if (eventHero) return eventHero;
  return '../content/events/2026/05/img/vivid-sydney-hero.png';
}

function languageMenu(lang, category, slug) {
  return langDirs.map((code) => {
    const href = code === lang ? `${slug}.html` : `../../../../${code}/content/categories/${category}/${slug}.html`;
    const current = code === lang ? ' aria-current="true"' : '';
    return `          <a href="${href}"${current}><span class="language-code">${codeLabel(code)}</span><span class="language-name">${langName[code] || languageNames[code] || code}</span></a>`;
  }).join('\n');
}

const css = `      :root { --theme: #245f46; --accent: #9fd16b; --ink: #17201c; --paper: #fbfaf6; --muted: #5f6b63; --line: rgba(23,32,28,.14); }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: var(--ink); background: var(--paper); overflow-x: hidden; }
      a { color: inherit; }
      .top-menu { position: sticky; top: 0; z-index: 2000; display: flex; gap: 8px; overflow: visible; padding: 8px clamp(14px,3vw,36px); background: rgba(251,250,246,.95); border-bottom: 1px solid var(--line); backdrop-filter: blur(10px); }
      .top-menu a { flex: 0 0 auto; padding: 8px 11px; border-radius: 999px; text-decoration: none; font-size: 13px; }
      .top-menu a:hover, .top-menu a.active { background: var(--theme); color: white; }
      .nav-icon{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;color:var(--muted);text-decoration:none;transition:background .12s,color .12s}.nav-icon:hover{background:var(--theme);color:white}.nav-icon svg{width:22px;height:22px;display:block}.nav-divider{width:1px;height:18px;background:var(--line);flex:0 0 auto;align-self:center}
      .topic-slide { min-height: calc(100vh - 42px); display: grid; grid-template-rows: auto 1fr; gap: 12px; padding: clamp(20px,5vw,80px); }
      .topic-hero { display: grid; align-items: end; min-height: clamp(230px,31vh,360px); padding: clamp(20px,3.6vw,44px); color: white; border-radius: 8px; overflow: hidden; background: linear-gradient(90deg, rgba(8,18,12,.62), rgba(8,18,12,.26) 46%, rgba(8,18,12,0) 72%), linear-gradient(180deg, rgba(255,255,255,.02), rgba(0,0,0,.18)), var(--hero) center / cover; box-shadow: 0 18px 44px rgba(23,32,28,.16); }
      .eyebrow { margin: 0 0 8px; color: var(--accent); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0; } h1 { margin: 0; font-size: clamp(46px,7vw,92px); line-height: .92; letter-spacing: 0; }.intro { max-width: 740px; margin: 12px 0 0; font-size: clamp(15px,1.5vw,18px); line-height: 1.34; }
      .topic-panel { display: grid; grid-template-columns: minmax(320px,.88fr) minmax(480px,1.12fr); gap: 10px; min-width: 0; }.left,.right{min-width:0;display:grid;gap:10px;align-content:start}.fact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fact,.history-card,.focus-card,.event-card{border:1px solid var(--line);border-radius:8px;background:white}.fact{min-height:86px;padding:12px 13px;box-shadow:0 8px 18px rgba(23,32,28,.05)}.fact span,.history-title,.focus-source{display:block;color:var(--muted);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0}.fact strong{display:block;margin-top:6px;font-size:clamp(20px,2.3vw,30px);line-height:1}.fact p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.25}.history-card,.focus-card{padding:13px 14px;border-left:1px solid var(--line);box-shadow:0 8px 18px rgba(23,32,28,.05)}.history-card h2,.focus-card h2{margin:0 0 9px;font-size:20px;line-height:1.1}.timeline{display:grid;gap:7px}.timeline-item{display:grid;grid-template-columns:58px minmax(0,1fr);gap:10px;padding-top:7px;border-top:1px solid rgba(23,32,28,.10)}.timeline-item:first-child{border-top:0;padding-top:0}.timeline-item time{color:var(--theme);font-size:13px;font-weight:800}.timeline-item strong{display:block;font-size:14px;line-height:1.16}.timeline-item span{display:block;margin-top:2px;color:var(--muted);font-size:12px;line-height:1.22}.focus-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.focus-item{padding:10px 11px;border:1px solid rgba(23,32,28,.10);border-radius:8px;background:rgba(159,209,107,.08)}.focus-item h3{margin:0 0 6px;color:var(--muted);font-size:12px;text-transform:uppercase}.focus-item strong{display:block;color:var(--theme);font-size:14px;line-height:1.1}.focus-item span{display:block;margin-top:5px;color:var(--muted);font-size:13px;line-height:1.25}.focus-source{margin-top:9px;text-transform:none;font-weight:600;line-height:1.25}
      .section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:8px}.section-heading h2{margin:0;font-size:22px;line-height:1.1}.carousel-controls{display:flex;gap:6px;align-items:center}.carousel-button{display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid var(--line);border-radius:50%;background:white;color:var(--theme);cursor:pointer}.carousel-button:hover{background:var(--theme);color:white}.carousel-button:disabled{opacity:.35;cursor:default;background:white;color:var(--muted)}.carousel-button svg{width:18px;height:18px;display:block}.carousel{min-width:0;overflow:hidden}.event-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.carousel-track.event-grid{display:flex;grid-template-columns:none;gap:8px;overflow-x:hidden;scroll-behavior:smooth;scroll-snap-type:x mandatory}.carousel-track .event-card{flex:0 0 calc((100% - 16px)/3);scroll-snap-align:start}.event-card{display:grid;gap:7px;min-height:132px;padding:0 15px 14px;overflow:hidden;border-left:5px solid var(--os-card-accent);color:inherit;text-decoration:none;grid-template-rows:54px auto auto auto}.event-card:hover{border-color:var(--theme);border-left-color:var(--os-card-accent);transform:translateY(-1px)}.event-thumb{display:block;width:calc(100% + 30px);height:54px;margin:0 -15px 1px;object-fit:cover;border-bottom:3px solid var(--os-card-accent)}.event-card time{color:var(--theme);font-size:12px;font-weight:700;text-transform:uppercase}.event-card strong{display:block;font-size:20px;line-height:1.1}.event-card p{margin:0;color:var(--muted);font-size:14px;line-height:1.28}.site-footer{padding:14px clamp(14px,3vw,36px);color:var(--muted);font-size:13px;border-top:1px solid var(--line);background:rgba(251,250,246,.92)}.site-footer p{margin:0}
      .event-language-menu{position:relative;flex:0 0 auto;margin-left:auto;z-index:1001}.event-language-menu summary{display:inline-flex;align-items:center;gap:7px;min-height:36px;padding:0 11px;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:999px;cursor:pointer;font-size:12px;font-weight:900;list-style:none}.event-language-menu summary::-webkit-details-marker{display:none}.event-language-menu summary svg{width:17px;height:17px}.event-language-menu[open] summary,.event-language-menu summary:hover{color:#fff;background:var(--theme);border-color:var(--theme)}.event-language-menu .event-language-list{position:fixed;top:58px;right:clamp(14px,3vw,36px);z-index:1002;display:grid;grid-template-columns:1fr;gap:6px;min-width:230px;max-width:min(300px,calc(100vw - 24px));margin:0;padding:8px;background:rgba(255,255,255,.98);border:1px solid var(--line);border-radius:8px;box-shadow:0 14px 34px rgba(18,32,46,.16)}.event-language-menu .event-language-list>span:first-child{display:none}.event-language-menu .event-language-list a{display:grid;grid-template-columns:42px 1fr;gap:9px;align-items:center;min-height:34px;padding:0 10px;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:999px;font-size:12px;font-weight:800;text-decoration:none}.event-language-menu .event-language-list a[aria-current=true],.event-language-menu .event-language-list a:hover{color:#fff;background:var(--theme);border-color:var(--theme)}.language-code{font-size:11px;font-weight:900;opacity:.82}.language-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      @media (max-width:1040px){.topic-slide{min-height:auto}.topic-panel{grid-template-columns:1fr}}@media (max-width:760px){.topic-slide{padding:12px}.focus-grid{grid-template-columns:1fr}.carousel-track .event-card{flex-basis:calc((100% - 8px)/2)}}@media (max-width:620px){.fact-grid,.event-grid{grid-template-columns:1fr}.carousel-track .event-card{flex-basis:100%}}@media (max-width:560px){.event-language-menu .event-language-list{top:56px;right:10px;left:10px;width:auto;max-width:none}}`;

function renderPage(lang, category, slug) {
  const profile = profiles[lang] || profiles.en;
  const labels = profile.labels || profiles.en.labels;
  const ui = localized[lang]?.ui || {};
  const name = topicLabel(lang, slug);
  const catName = categoryLabel(lang, category);
  const spec = getSpec(lang, category, slug);
  const events = extractEvents(lang, slug);
  const hero = heroFor(category, slug, events);
  const alternates = langDirs.map((code) => `    <link rel="alternate" hreflang="${code}" href="https://one-sliders.com/${code}/content/categories/${category}/${slug}.html">`).join('\n');
  const facts = spec.facts.map(([label, value, text]) => `            <div class="fact"><span>${esc(label)}</span><strong>${esc(value)}</strong><p>${esc(text)}</p></div>`).join('\n');
  const timeline = spec.timeline.map(([year, title, text]) => `              <div class="timeline-item"><time>${esc(year)}</time><div><strong>${esc(title)}</strong><span>${esc(text)}</span></div></div>`).join('\n');
  const focus = spec.focus.map((item) => item.length === 4
    ? `              <div class="focus-item"><h3>${esc(item[0])}</h3><strong>${esc(item[1])}</strong><span>${esc(item.slice(2).join(' · '))}</span></div>`
    : `              <div class="focus-item"><h3>${esc(item[0])}</h3><strong>${esc(item[0])}</strong><span>${esc(item[1])}</span></div>`).join('\n');
  const eventCards = events.length ? events.map((e) => {
    const metaParts = clean(e.meta).split(/\s+-\s+/);
    const startAttr = e.start ? ` data-start="${esc(e.start)}"` : '';
    const endAttr = e.end ? ` data-end="${esc(e.end)}"` : '';
    const dateStatus = e.dateStatus || (!e.start && !e.end ? 'tbc' : '');
    const dateStatusAttr = dateStatus ? ` data-date-status="${esc(dateStatus)}"` : '';
    const officialDateAttr = e.officialDate ? ` data-official-date="${esc(e.officialDate)}"` : '';
    const cardDate = formatCardDate(e, metaParts[0]);
    return `                <a class="event-card"${startAttr}${endAttr}${dateStatusAttr}${officialDateAttr} href="${esc(e.href)}"><img class="event-thumb" src="${esc(e.img)}" alt="" aria-hidden="true"><time>${esc(cardDate)}</time><strong>${esc(e.title)}</strong><p>${esc(metaParts.slice(1).join(' - ') || catName)}</p></a>`;
  }).join('\n') : `                <a class="event-card" href="../../events/index.html"><span class="event-thumb" aria-hidden="true"></span><time>${esc(labels.upcoming || 'Upcoming')}</time><strong>${esc(labels.allTopics || 'All topics')}</strong><p>${esc(ui.browse || 'Browse the full event calendar for new additions.')}</p></a>`;

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="../../../../assets/icons/favicon.ico" sizes="any">
    <link rel="icon" href="../../../../assets/icons/one-sliders-icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="../../../../assets/icons/apple-touch-icon.png">
    <link rel="manifest" href="../../../../assets/icons/site.webmanifest">
    <link rel="canonical" href="https://one-sliders.com/${lang}/content/categories/${category}/${slug}.html">
    <meta name="content-id" content="categories-${category}-${slug}">
    <meta name="content-language" content="${lang}">
    <meta name="available-languages" content="${langDirs.join(',')}">
    <link rel="alternate" hreflang="x-default" href="https://one-sliders.com/content/categories/${category}/${slug}.html">
${alternates}
    <meta name="theme-color" content="#0d2137">
    <title>${esc(name)}</title>
    <style>
${css}
    </style>
  </head>
  <body>
    <nav class="top-menu" aria-label="Category navigation">
      <a class="nav-icon" href="../../events/index.html" title="${esc(profile.categories?.events || 'Events')}" aria-label="${esc(profile.categories?.events || 'Events')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></a>
      <a class="nav-icon" href="../content/locations/index.html" title="${esc(labels.place || 'World')}" aria-label="${esc(labels.place || 'World')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>
      <a class="nav-icon" href="../index.html" title="${esc(labels.category || 'Categories')}" aria-label="${esc(labels.category || 'Categories')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></a>
      <span class="nav-divider"></span>
      <a href="index.html">${esc(catName)}</a>
      <a class="active" aria-current="page" href="${slug}.html">${esc(name)}</a>
      <details class="event-language-menu">
        <summary aria-label="${esc(labels.language || 'Language')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>${codeLabel(lang)}</span></summary>
        <div class="event-language-list" aria-label="${esc(labels.language || 'Language')}">
          <span>${esc(labels.language || 'Language')}</span>
${languageMenu(lang, category, slug)}
        </div>
      </details>
    </nav>
    <main class="topic-slide">
      <header class="topic-hero" style="--hero: url('${esc(hero)}');">
        <div>
          <p class="eyebrow">${esc(spec.eyebrow)}</p>
          <h1>${esc(name)}</h1>
          <p class="intro">${esc(spec.intro)}</p>
        </div>
      </header>
      <section class="topic-panel">
        <div class="left">
          <div class="fact-grid" aria-label="${esc(`${name} ${ui.facts || 'facts'}`)}">
${facts}
          </div>
          <section class="history-card" aria-label="${esc(ui.historyAria ? ui.historyAria(name) : `${name} history timeline`)}">
            <span class="history-title">${esc(ui.historyLabel || 'History anchors')}</span>
            <h2>${esc(ui.historyTitle ? ui.historyTitle(name) : `How ${name} became global`)}</h2>
            <div class="timeline">
${timeline}
            </div>
          </section>
        </div>
        <div class="right">
          <section class="focus-card" aria-label="${esc(spec.focusTitle)}">
            <span class="history-title">${esc(ui.watchLabel || 'What to watch')}</span>
            <h2>${esc(spec.focusTitle)}</h2>
            <div class="focus-grid">
${focus}
            </div>
            <p class="focus-source">${esc(spec.source)}</p>
          </section>
          <section>
            <div class="section-heading">
              <h2>${esc(spec.eventsTitle)}</h2>
              <div class="carousel-controls" data-carousel-controls aria-label="${esc(ui.eventsControls || 'Upcoming events carousel controls')}">
                <button class="carousel-button" type="button" data-carousel-prev aria-label="${esc(ui.prev || 'Previous events')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
                <button class="carousel-button" type="button" data-carousel-next aria-label="${esc(ui.next || 'Next events')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
              </div>
            </div>
            <div class="carousel"><div class="event-grid carousel-track" data-carousel-track>
${eventCards}
            </div></div>
          </section>
        </div>
      </section>
    </main>
    <footer class="site-footer"><p>&copy; 2026 <a href="https://3dfractal.no/">3D Fractal</a>. All rights reserved.</p></footer>
    <script>
      (() => { const track = document.querySelector('[data-carousel-track]'); const prev = document.querySelector('[data-carousel-prev]'); const next = document.querySelector('[data-carousel-next]'); const controls = document.querySelector('[data-carousel-controls]'); if (!track || !prev || !next || !controls) return; const today = new Date(); today.setHours(0, 0, 0, 0); track.querySelectorAll('.event-card[data-end]').forEach((card) => { const end = new Date(card.dataset.end + 'T23:59:59'); if (end < today) card.hidden = true; }); const update = () => { const max = track.scrollWidth - track.clientWidth - 1; controls.hidden = max <= 1; prev.disabled = track.scrollLeft <= 1; next.disabled = track.scrollLeft >= max; }; const step = () => { const card = track.querySelector('.event-card:not([hidden])'); if (!card) return track.clientWidth; const gap = parseFloat(getComputedStyle(track).gap) || 0; return card.getBoundingClientRect().width + gap; }; prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' })); next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' })); track.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update(); })();
    </script>
  </body>
</html>
`;
}

const canonicalDir = path.join(root, 'content', 'categories');
let count = 0;
for (const category of fs.readdirSync(canonicalDir)) {
  const dir = path.join(canonicalDir, category);
  if (!fs.statSync(dir).isDirectory() || category === 'img') continue;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    const slug = file.replace(/\.html$/, '');
    for (const lang of langDirs) {
      const targetDir = path.join(root, lang, 'content', 'categories', category);
      fs.mkdirSync(targetDir, { recursive: true });
      writeFileWithRetry(path.join(targetDir, file), renderPage(lang, category, slug));
      count += 1;
    }
  }
}

console.log(`Rebuilt ${count} localized topic pages.`);
