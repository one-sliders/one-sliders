export const languages = [
  'en', 'ar', 'sw', 'ha', 'zh', 'hi', 'ru', 'de', 'fr', 'es', 'pt', 'qu', 'tpi', 'mi'
];

export const languageNames = {
  en: 'English',
  ar: 'Arabic',
  sw: 'Swahili',
  ha: 'Hausa',
  zh: 'Mandarin Chinese',
  hi: 'Hindi',
  ru: 'Russian',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  qu: 'Quechua',
  tpi: 'Tok Pisin',
  mi: 'Māori'
};

export const profiles = {
  en: {
    title: 'World Events Calendar | OneSliders',
    description: 'Browse major world events by month, category, region and reach on OneSliders.',
    kicker: 'Global calendar',
    h1: 'World events worth planning around',
    intro: 'Sports, festivals, culture and natural spectacles, arranged month by month.',
    labels: {
      language: 'Language', filters: 'Filters', category: 'Category', topic: 'Topic', region: 'Region',
      country: 'Country', city: 'City', venue: 'Venue', dates: 'Dates', timezone: 'Timezone',
      myTimezone: 'My timezone', level: 'Level', all: 'All', global: 'Global', continent: 'Continent',
      timezoneLevel: 'Timezone', allTopics: 'All topics', allCountries: 'All countries',
      addCalendar: 'Add to calendar', whatToKnow: 'What to know', structure: 'Event structure',
      visitorFocus: 'Visitor focus', quickFacts: 'Quick facts', related: 'Related on OneSliders',
      status: 'Status', upcoming: 'Upcoming', updates: 'Updates', source: 'Source', updated: 'Updated',
      before: 'Before', during: 'During', after: 'After', planning: 'Planning', programme: 'Programme',
      results: 'Results', stage: 'Stage', focus: 'Focus', why: 'Why follow', important: 'important',
      useful: 'useful', place: 'Place'
    },
    categories: {
      motor: 'Motor sport', sport: 'Sport', festival: 'Festival', culture: 'Culture', nature: 'Nature',
      music: 'Music', film: 'Film', football: 'Football', golf: 'Golf', tennis: 'Tennis', rugby: 'Rugby',
      cricket: 'Cricket', formula1: 'Formula 1', songContests: 'Song contests', events: 'Events'
    },
    continents: { africa: 'Africa', asia: 'Asia', europe: 'Europe', 'north-america': 'N. America', oceania: 'Oceania', 'south-america': 'S. America' },
    months: { January: 'January', February: 'February', March: 'March', April: 'April', May: 'May', June: 'June', July: 'July', August: 'August', September: 'September', October: 'October', November: 'November', December: 'December' },
    shortMonths: { Jan: 'Jan', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr', May: 'May', Jun: 'Jun', Jul: 'Jul', Aug: 'Aug', Sep: 'Sep', Oct: 'Oct', Nov: 'Nov', Dec: 'Dec' },
    countries: {},
    terms: {},
    sentences: {
      description: (title) => `${title}: dates, place, context and useful OneSliders links.`,
      know1: (title, category) => `${title} belongs to the ${category} topic.`,
      know2: (dates) => `Key planning information: ${dates}.`,
      know3: (location) => `Page location: ${location}.`,
      know4: 'OneSliders keeps the page compact: dates, place, format and useful internal links.',
      before: 'Understand the dates, place and event format.',
      during: 'Follow the main moments and updates.',
      after: 'Add results, winners or next steps.',
      updates: 'Add when available',
      source: 'OneSliders'
    }
  },
  ru: {
    title: 'Календарь мировых событий | OneSliders',
    description: 'Мировой календарь событий OneSliders со спортом, фестивалями, культурой и природными явлениями по месяцам.',
    kicker: 'Мировой календарь',
    h1: 'Мировые события, вокруг которых стоит планировать поездки',
    intro: 'Спорт, фестивали, культура и природные явления, по месяцам.',
    labels: {
      language: 'Язык', filters: 'Фильтры', category: 'Категория', topic: 'Тема', region: 'Регион',
      country: 'Страна', city: 'Город', venue: 'Место', dates: 'Даты', timezone: 'Часовой пояс',
      myTimezone: 'Мой часовой пояс', level: 'Уровень', all: 'Все', global: 'Мир', continent: 'Континент',
      timezoneLevel: 'Часовой пояс', allTopics: 'Все темы', allCountries: 'Все страны',
      addCalendar: 'Добавить в календарь', whatToKnow: 'Что нужно знать', structure: 'Структура события',
      visitorFocus: 'Фокус для посетителя', quickFacts: 'Краткие факты', related: 'Связано на OneSliders',
      status: 'Статус', upcoming: 'Предстоящее', updates: 'Обновления', source: 'Источник', updated: 'Обновлено',
      before: 'До', during: 'Во время', after: 'После', planning: 'Планирование', programme: 'Программа',
      results: 'Итоги', stage: 'Этап', focus: 'Фокус', why: 'Зачем смотреть', important: 'важно',
      useful: 'полезно', place: 'Место'
    },
    categories: {
      motor: 'Автоспорт', sport: 'Спорт', festival: 'Фестиваль', culture: 'Культура', nature: 'Природа',
      music: 'Музыка', film: 'Кино', football: 'Футбол', golf: 'Гольф', tennis: 'Теннис', rugby: 'Регби',
      cricket: 'Крикет', formula1: 'Формула-1', songContests: 'Песенные конкурсы', events: 'События'
    },
    continents: { africa: 'Африка', asia: 'Азия', europe: 'Европа', 'north-america': 'Сев. Америка', oceania: 'Океания', 'south-america': 'Юж. Америка' },
    months: { January: 'Январь', February: 'Февраль', March: 'Март', April: 'Апрель', May: 'Май', June: 'Июнь', July: 'Июль', August: 'Август', September: 'Сентябрь', October: 'Октябрь', November: 'Ноябрь', December: 'Декабрь' },
    shortMonths: { Jan: 'янв.', Feb: 'фев.', Mar: 'мар.', Apr: 'апр.', May: 'мая', Jun: 'июн.', Jul: 'июл.', Aug: 'авг.', Sep: 'сен.', Oct: 'окт.', Nov: 'ноя.', Dec: 'дек.' },
    countries: {
      USA: 'США', Canada: 'Канада', France: 'Франция', Germany: 'Германия', Austria: 'Австрия',
      Norway: 'Норвегия', Australia: 'Австралия', Brazil: 'Бразилия', India: 'Индия',
      Italy: 'Италия', Sweden: 'Швеция', Ukraine: 'Украина', Switzerland: 'Швейцария',
      'United Kingdom': 'Великобритания', UK: 'Великобритания', TBC: 'уточняется'
    },
    terms: {
      'Formula 1': 'Формула-1', Film: 'Кино', Football: 'Футбол', Golf: 'Гольф', Tennis: 'Теннис',
      Rugby: 'Регби', Cricket: 'Крикет', Sport: 'Спорт', Festival: 'Фестиваль', Culture: 'Культура',
      Nature: 'Природа', Music: 'Музыка', Motorsport: 'Автоспорт', 'Motor sport': 'Автоспорт'
    },
    sentences: {
      description: (title) => `${title}: даты, место, контекст и полезные ссылки на OneSliders.`,
      know1: (title, category) => `${title} проходит в контексте темы «${category}».`,
      know2: (dates) => `Основная информация для планирования: ${dates}.`,
      know3: (location) => `Локация страницы: ${location}.`,
      know4: 'OneSliders держит страницу компактной: даты, место, формат и полезные внутренние ссылки.',
      before: 'Понять даты, место и формат события.',
      during: 'Следить за главными моментами и обновлениями.',
      after: 'Добавить результаты, победителей или следующий шаг.',
      updates: 'Добавлять по мере появления',
      source: 'OneSliders'
    }
  }
};

const shared = {
  ar: {
    title: 'تقويم الأحداث العالمية | OneSliders', description: 'تصفح أهم الأحداث العالمية حسب الشهر والفئة والمنطقة على OneSliders.',
    kicker: 'تقويم عالمي', h1: 'أحداث عالمية تستحق التخطيط حولها', intro: 'رياضة ومهرجانات وثقافة وظواهر طبيعية مرتبة حسب الشهر.',
    labels: ['اللغة','الفلاتر','الفئة','الموضوع','المنطقة','الدولة','المدينة','المكان','التواريخ','المنطقة الزمنية','منطقتي الزمنية','المستوى','الكل','عالمي','قاري','المنطقة الزمنية','كل المواضيع','كل الدول','أضف إلى التقويم','ما يجب معرفته','هيكل الحدث','تركيز الزائر','حقائق سريعة','مرتبط على OneSliders','الحالة','قادم','تحديثات','المصدر','تم التحديث','قبل','أثناء','بعد','التخطيط','البرنامج','النتائج','المرحلة','التركيز','لماذا تتابع','مهم','مفيد','المكان'],
    cats: ['رياضة المحركات','رياضة','مهرجان','ثقافة','طبيعة','موسيقى','فيلم','كرة القدم','غولف','تنس','رغبي','كريكيت','فورمولا 1','مسابقات الأغنية','أحداث'],
    continents: ['أفريقيا','آسيا','أوروبا','أمريكا ش.','أوقيانوسيا','أمريكا ج.'],
    months: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  },
  sw: {
    title: 'Kalenda ya Matukio ya Dunia | OneSliders', description: 'Vinjari matukio makubwa ya dunia kwa mwezi, kategoria na eneo kwenye OneSliders.',
    kicker: 'Kalenda ya dunia', h1: 'Matukio ya dunia ya kupanga safari karibu nayo', intro: 'Michezo, tamasha, utamaduni na maajabu ya asili kwa mwezi.',
    labels: ['Lugha','Vichujio','Kategoria','Mada','Eneo','Nchi','Jiji','Ukumbi','Tarehe','Saa za eneo','Saa zangu','Kiwango','Yote','Dunia','Bara','Saa za eneo','Mada zote','Nchi zote','Ongeza kwenye kalenda','Ya kujua','Muundo wa tukio','Lengo la mgeni','Mambo muhimu','Yanayohusiana kwenye OneSliders','Hali','Linalokuja','Masasisho','Chanzo','Imesasishwa','Kabla','Wakati','Baada','Mpango','Programu','Matokeo','Hatua','Lengo','Kwa nini kufuatilia','muhimu','inafaa','Mahali'],
    cats: ['Michezo ya magari','Michezo','Tamasha','Utamaduni','Asili','Muziki','Filamu','Soka','Gofu','Tenisi','Raga','Kriketi','Formula 1','Mashindano ya nyimbo','Matukio'],
    continents: ['Afrika','Asia','Ulaya','Amerika K.','Oceania','Amerika K.'],
    months: ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Septemba','Oktoba','Novemba','Desemba']
  },
  ha: {
    title: 'Kalanda na Manyan Abubuwan Duniya | OneSliders', description: 'Binciki manyan abubuwan duniya bisa wata, rukuni da yanki a OneSliders.',
    kicker: 'Kalanda na duniya', h1: 'Manyan abubuwan duniya da ya dace a tsara tafiya kansu', intro: 'Wasanni, bukukuwa, al’adu da abubuwan halitta bisa wata.',
    labels: ['Harshe','Tacewa','Rukuni','Jigo','Yanki','Kasa','Birni','Wuri','Kwanaki','Lokacin yanki','Lokacina','Mataki','Duka','Duniya','Nahiyar','Lokacin yanki','Duk jigogi','Duk kasashe','Kara zuwa kalanda','Abin sani','Tsarin taro','Mayar hankali','Muhimman bayanai','Masu alaƙa a OneSliders','Matsayi','Mai zuwa','Sabuntawa','Tushe','An sabunta','Kafin','Lokaci','Bayan','Shiryawa','Shiri','Sakamako','Mataki','Mayar hankali','Dalilin bi','muhimmi','mai amfani','Wuri'],
    cats: ['Wasannin mota','Wasanni','Biki','Al’ada','Halitta','Kiɗa','Fim','Kwallon kafa','Golf','Tennis','Rugby','Cricket','Formula 1','Gasar waƙa','Abubuwa'],
    continents: ['Afirka','Asiya','Turai','Arew. Amurka','Oceania','Kud. Amurka'],
    months: ['Janairu','Faburairu','Maris','Afrilu','Mayu','Yuni','Yuli','Agusta','Satumba','Oktoba','Nuwamba','Disamba']
  },
  zh: {
    title: '世界活动日历 | OneSliders', description: '在 OneSliders 按月份、类别和地区浏览全球重要活动。',
    kicker: '全球日历', h1: '值得围绕它们规划行程的世界活动', intro: '体育、节庆、文化和自然奇观，按月份整理。',
    labels: ['语言','筛选','类别','主题','地区','国家','城市','场馆','日期','时区','我的时区','级别','全部','全球','洲际','时区','全部主题','全部国家','加入日历','须知','活动结构','访客重点','速览','OneSliders 相关','状态','即将举行','更新','来源','更新于','之前','期间','之后','规划','节目','结果','阶段','重点','为何关注','重要','有用','地点'],
    cats: ['赛车运动','体育','节庆','文化','自然','音乐','电影','足球','高尔夫','网球','橄榄球','板球','一级方程式','歌曲比赛','活动'],
    continents: ['非洲','亚洲','欧洲','北美','大洋洲','南美'],
    months: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
  },
  hi: {
    title: 'विश्व कार्यक्रम कैलेंडर | OneSliders', description: 'OneSliders पर महीने, श्रेणी और क्षेत्र के अनुसार बड़े विश्व कार्यक्रम देखें।',
    kicker: 'वैश्विक कैलेंडर', h1: 'दुनिया के कार्यक्रम जिनके आसपास यात्रा योजना बनती है', intro: 'खेल, उत्सव, संस्कृति और प्राकृतिक दृश्य, महीने के अनुसार।',
    labels: ['भाषा','फिल्टर','श्रेणी','विषय','क्षेत्र','देश','शहर','स्थान','तिथियां','समय क्षेत्र','मेरा समय क्षेत्र','स्तर','सभी','वैश्विक','महाद्वीप','समय क्षेत्र','सभी विषय','सभी देश','कैलेंडर में जोड़ें','क्या जानें','कार्यक्रम संरचना','आगंतुक फोकस','त्वरित तथ्य','OneSliders पर संबंधित','स्थिति','आगामी','अपडेट','स्रोत','अपडेट किया गया','पहले','दौरान','बाद','योजना','कार्यक्रम','परिणाम','चरण','फोकस','क्यों देखें','महत्वपूर्ण','उपयोगी','स्थान'],
    cats: ['मोटर स्पोर्ट','खेल','उत्सव','संस्कृति','प्रकृति','संगीत','फिल्म','फ़ुटबॉल','गोल्फ','टेनिस','रग्बी','क्रिकेट','फॉर्मूला 1','गीत प्रतियोगिताएं','कार्यक्रम'],
    continents: ['अफ्रीका','एशिया','यूरोप','उ. अमेरिका','ओशिनिया','द. अमेरिका'],
    months: ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर']
  },
  de: {
    title: 'Weltweiter Eventkalender | OneSliders', description: 'Große weltweite Events nach Monat, Kategorie und Region auf OneSliders.',
    kicker: 'Globaler Kalender', h1: 'Weltweite Events, um die man planen kann', intro: 'Sport, Festivals, Kultur und Naturereignisse nach Monaten.',
    labels: ['Sprache','Filter','Kategorie','Thema','Region','Land','Stadt','Ort','Termine','Zeitzone','Meine Zeitzone','Ebene','Alle','Global','Kontinent','Zeitzone','Alle Themen','Alle Länder','Zum Kalender hinzufügen','Was wichtig ist','Eventstruktur','Besucherfokus','Kurzfakten','Verwandt auf OneSliders','Status','Bevorstehend','Updates','Quelle','Aktualisiert','Vorher','Während','Nachher','Planung','Programm','Ergebnisse','Phase','Fokus','Warum verfolgen','wichtig','nützlich','Ort'],
    cats: ['Motorsport','Sport','Festival','Kultur','Natur','Musik','Film','Fußball','Golf','Tennis','Rugby','Cricket','Formel 1','Song Contests','Events'],
    continents: ['Afrika','Asien','Europa','N. Amerika','Ozeanien','S. Amerika'],
    months: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']
  },
  fr: {
    title: 'Calendrier mondial des événements | OneSliders', description: 'Parcourez les grands événements mondiaux par mois, catégorie et région sur OneSliders.',
    kicker: 'Calendrier mondial', h1: 'Des événements mondiaux autour desquels planifier', intro: 'Sport, festivals, culture et phénomènes naturels, mois par mois.',
    labels: ['Langue','Filtres','Catégorie','Thème','Région','Pays','Ville','Lieu','Dates','Fuseau horaire','Mon fuseau','Niveau','Tout','Mondial','Continent','Fuseau','Tous les thèmes','Tous les pays','Ajouter au calendrier','À savoir','Structure de l’événement','Focus visiteur','Infos rapides','Lié sur OneSliders','Statut','À venir','Mises à jour','Source','Mis à jour','Avant','Pendant','Après','Planification','Programme','Résultats','Étape','Focus','Pourquoi suivre','important','utile','Lieu'],
    cats: ['Sport automobile','Sport','Festival','Culture','Nature','Musique','Cinéma','Football','Golf','Tennis','Rugby','Cricket','Formule 1','Concours de chansons','Événements'],
    continents: ['Afrique','Asie','Europe','Am. N.','Océanie','Am. S.'],
    months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  },
  es: {
    title: 'Calendario mundial de eventos | OneSliders', description: 'Explora grandes eventos mundiales por mes, categoría y región en OneSliders.',
    kicker: 'Calendario global', h1: 'Eventos del mundo para planificar alrededor', intro: 'Deportes, festivales, cultura y fenómenos naturales, mes a mes.',
    labels: ['Idioma','Filtros','Categoría','Tema','Región','País','Ciudad','Lugar','Fechas','Zona horaria','Mi zona horaria','Nivel','Todo','Global','Continente','Zona horaria','Todos los temas','Todos los países','Añadir al calendario','Qué saber','Estructura del evento','Foco del visitante','Datos rápidos','Relacionado en OneSliders','Estado','Próximo','Actualizaciones','Fuente','Actualizado','Antes','Durante','Después','Planificación','Programa','Resultados','Etapa','Foco','Por qué seguir','importante','útil','Lugar'],
    cats: ['Motor','Deporte','Festival','Cultura','Naturaleza','Música','Cine','Fútbol','Golf','Tenis','Rugby','Críquet','Fórmula 1','Concursos de canciones','Eventos'],
    continents: ['África','Asia','Europa','N. América','Oceanía','S. América'],
    months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  },
  pt: {
    title: 'Calendário mundial de eventos | OneSliders', description: 'Veja grandes eventos mundiais por mês, categoria e região no OneSliders.',
    kicker: 'Calendário global', h1: 'Eventos do mundo para planejar em torno deles', intro: 'Esportes, festivais, cultura e fenômenos naturais por mês.',
    labels: ['Idioma','Filtros','Categoria','Tema','Região','País','Cidade','Local','Datas','Fuso horário','Meu fuso','Nível','Todos','Global','Continente','Fuso','Todos os temas','Todos os países','Adicionar ao calendário','O que saber','Estrutura do evento','Foco do visitante','Fatos rápidos','Relacionado no OneSliders','Status','Próximo','Atualizações','Fonte','Atualizado','Antes','Durante','Depois','Planejamento','Programa','Resultados','Etapa','Foco','Por que acompanhar','importante','útil','Local'],
    cats: ['Automobilismo','Esporte','Festival','Cultura','Natureza','Música','Cinema','Futebol','Golfe','Tênis','Rúgbi','Críquete','Fórmula 1','Concursos de canções','Eventos'],
    continents: ['África','Ásia','Europa','Am. N.','Oceania','Am. S.'],
    months: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  },
  qu: {
    title: 'Pacha suyupi hatun raymikuna | OneSliders', description: 'OneSliderspi hatun raymikuna killapi, rikch’akupi, suyupi qhawariy.',
    kicker: 'Pacha kalindaryu', h1: 'Pacha suyupi puriyta yuyaychaypaq raymikuna', intro: 'Pukllay, raymi, kawsay hinaspa pachamama rikch’aykuna killamanta.',
    labels: ['Simi','Ch’uyanchay','Rikch’a','Yuyay','Suyu','Llaqta suyu','Llaqta','Kiti','P’unchawkuna','Pacha hora','Ñuqaq pachay','Patak','Llapan','Pachantin','Hatun suyu','Pacha hora','Llapan yuyaykuna','Llapan llaqtakuna','Kalindaryuman yapay','Yachanapaq','Raymi estructura','Watukuqpa qhawariynin','Utqay willakuy','OneSliderspi tinkisqa','Estado','Hamuq','Musuqyachiy','Pukyu','Musuqchasqa','Ñawpaq','Ukupi','Qhipa','Yuyaychay','Programa','Rurukuna','Pata','Qhawariy','Imarayku qhaway','ancha','allin','Kiti'],
    cats: ['Motor pukllay','Pukllay','Raymi','Kawsay','Pachamama','Taki','Filme','Futbol','Golf','Tenis','Rugby','Cricket','Formula 1','Taki atipanakuy','Raymikuna'],
    continents: ['Afrika','Asia','Europa','N. Amerika','Oceania','S. Amerika'],
    months: ['Qulla puquy','Hatun puquy','Pawqar waray','Ayriwa','Aymuray','Inti raymi','Anta sitwa','Qhapaq sitwa','Uma raymi','Kantaray','Ayamarq’a','Qhapaq raymi']
  },
  tpi: {
    title: 'Kalenda bilong ol bikpela ivent | OneSliders', description: 'Lukim ol bikpela ivent long mun, kategori na hap long OneSliders.',
    kicker: 'Kalenda bilong wol', h1: 'Ol ivent bilong wol yu ken plenim raun long en', intro: 'Spot, festival, kastom na samting bilong nature, mun long mun.',
    labels: ['Tokples','Filta','Kategori','Topik','Rijen','Kantri','Taun','Ples','Deit','Taim zon','Taim zon bilong mi','Level','Olgeta','Wol','Kontinen','Taim zon','Olgeta topik','Olgeta kantri','Putim long kalenda','Samting long save','Straksa bilong ivent','Luksave bilong visita','Kwik fakta','Rilet long OneSliders','Status','Bai kam','Apdeit','As','Apdeit','Bipo','Taim','Bihain','Plen','Program','Risal','Step','Luksave','Bilong wanem bihainim','important','gutpela','Ples'],
    cats: ['Mota spot','Spot','Festival','Kalsa','Nature','Musik','Film','Futbol','Golf','Tenis','Ragbi','Kriket','Formula 1','Song kontes','Ivent'],
    continents: ['Afrika','Esia','Yurop','N. Amerika','Oseania','S. Amerika'],
    months: ['Janueri','Februeri','Mas','Epril','Me','Jun','Julai','Ogas','Septemba','Oktoba','Novemba','Disemba']
  },
  mi: {
    title: 'Maramataka kaupapa o te ao | OneSliders', description: 'Tirohia ngā kaupapa nui o te ao mā te marama, te kāwai me te rohe i OneSliders.',
    kicker: 'Maramataka ao', h1: 'Ngā kaupapa o te ao hei whakamahere haere', intro: 'Hākinakina, hui ahurei, ahurea me ngā mīharo taiao, ia marama.',
    labels: ['Reo','Tātari','Kāwai','Kaupapa','Rohe','Whenua','Tāone','Wāhi','Rā','Rohe wā','Taku rohe wā','Taumata','Katoa','Ao','Whenua nui','Rohe wā','Ngā kaupapa katoa','Ngā whenua katoa','Tāpiri ki te maramataka','Me mōhio','Hanganga kaupapa','Arotahi manuhiri','Meka tere','E hāngai ana i OneSliders','Tūnga','Kei te haere mai','Whakahōu','Pūtake','Whakahōutia','I mua','I te wā','I muri','Whakamahere','Hōtaka','Hua','Wāhanga','Arotahi','He aha te whai','nui','whaihua','Wāhi'],
    cats: ['Hākinakina motuka','Hākinakina','Hui ahurei','Ahurea','Taiao','Puoro','Kiriata','Whutupaoro','Korowha','Tēnehi','Whutupōro','Kirikiti','Formula 1','Whakataetae waiata','Kaupapa'],
    continents: ['Āwherika','Āhia','Ūropi','Amerika Raki','Ōhia','Amerika Tonga'],
    months: ['Kohitātea','Huitanguru','Poutūterangi','Paengawhāwhā','Haratua','Pipiri','Hōngongoi','Here-turi-kōkā','Mahuru','Whiringa-ā-nuku','Whiringa-ā-rangi','Hakihea']
  }
};

const labelKeys = Object.keys(profiles.en.labels);
const categoryKeys = Object.keys(profiles.en.categories);
const continentKeys = Object.keys(profiles.en.continents);
const monthKeys = Object.keys(profiles.en.months);
const shortMonthKeys = Object.keys(profiles.en.shortMonths);

for (const [lang, data] of Object.entries(shared)) {
  profiles[lang] = {
    title: data.title,
    description: data.description,
    kicker: data.kicker,
    h1: data.h1,
    intro: data.intro,
    labels: Object.fromEntries(labelKeys.map((key, index) => [key, data.labels[index]])),
    categories: Object.fromEntries(categoryKeys.map((key, index) => [key, data.cats[index]])),
    continents: Object.fromEntries(continentKeys.map((key, index) => [key, data.continents[index]])),
    months: Object.fromEntries(monthKeys.map((key, index) => [key, data.months[index]])),
    shortMonths: Object.fromEntries(shortMonthKeys.map((key, index) => [key, data.months[index].slice(0, 4)])),
    countries: {},
    terms: {},
    sentences: {
      description: (title) => `${title} | OneSliders`,
      know1: (title, category) => `${title} - ${category}.`,
      know2: (dates) => `${data.labels[8]}: ${dates}.`,
      know3: (location) => `${data.labels[42] || data.labels[7]}: ${location}.`,
      know4: `OneSliders: ${data.labels[8]}, ${data.labels[42] || data.labels[7]}, ${data.labels[2]}.`,
      before: data.labels[33],
      during: data.labels[34],
      after: data.labels[35],
      updates: data.labels[42],
      source: 'OneSliders'
    }
  };
}

export function codeLabel(code) {
  return code === 'tpi' ? 'TP' : code.toUpperCase();
}

profiles.de.terms = {
  'Formula 1': 'Formel 1',
  Canada: 'Kanada',
  Montreal: 'Montreal',
  'Circuit Gilles Villeneuve': 'Circuit Gilles-Villeneuve'
};
