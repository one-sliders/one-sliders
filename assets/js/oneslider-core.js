/* OneSliders core script
 * ======================
 * This file is loaded on every page via:
 *   <script src="/assets/js/oneslider-core.js"></script>      (synchronous)
 *
 * It is the SINGLE place to add new site-wide functionality. To add a
 * new feature: scroll to the bottom and follow the module template.
 *
 * Currently bundled modules:
 *   - analytics     Google Consent Mode v2 + GA4 bootstrap (runs FIRST,
 *                   synchronously, before this script finishes parsing)
 *   - consent       Geo-aware cookie banner UI
 *
 * Why synchronous? Because Google Consent Mode v2 requires
 *   gtag('consent','default', {...denied...})
 * to be issued BEFORE gtag.js loads. Loading this file sync at the top
 * of <head> gives us that guarantee with zero inline JS on the page.
 */
(function () {
  'use strict';

  if (window.OneSlider && window.OneSlider.__loaded) return;

  // =====================================================================
  // PART 1 — synchronous boot:
  //   set up dataLayer + Consent Mode default + load gtag.js.
  //   This MUST happen before anything else so consent is "denied" by
  //   default and gtag.js sees that default when it evaluates.
  // =====================================================================

  var GA_ID = 'G-1EG5HKVW09';
  var CONSENT_STORAGE_KEY = 'os_consent_v1';
  var CONSENT_TTL_MS      = 31536000000;  // 12 months

  window.dataLayer = window.dataLayer || [];
  function gtag () { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // 1a. Consent Mode v2 default — must be "denied" for EU compliance.
  gtag('consent', 'default', {
    ad_storage:         'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
    analytics_storage:  'denied',
    wait_for_update:    500
  });

  // 1b. If the visitor has already chosen, restore their choice NOW,
  //     before gtag.js loads, so the very first beacon respects it.
  try {
    var _stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (_stored) {
      var _v = JSON.parse(_stored);
      if (_v && (!_v.ts || Date.now() - _v.ts < CONSENT_TTL_MS)) {
        gtag('consent', 'update', {
          ad_storage:         _v.ads      ? 'granted' : 'denied',
          ad_user_data:       _v.ads      ? 'granted' : 'denied',
          ad_personalization: _v.ads      ? 'granted' : 'denied',
          analytics_storage:  _v.analytics ? 'granted' : 'denied'
        });
      }
    }
  } catch (e) { /* localStorage may be blocked */ }

  // 1c. Bootstrap GA4.
  gtag('js', new Date());
  gtag('config', GA_ID);

  // 1d. Inject the gtag.js loader. Async so it does not block parsing.
  (function () {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    (document.head || document.documentElement).appendChild(s);
  })();

  // =====================================================================
  // PART 2 — module framework (runs at DOM-ready)
  // =====================================================================

  var modules = [];
  var listeners = {};

  var OneSlider = window.OneSlider = window.OneSlider || {};
  OneSlider.__loaded = true;
  OneSlider.version  = '2.0.0';
  OneSlider.gaId     = GA_ID;

  OneSlider.register = function (name, factory) {
    modules.push({ name: name, factory: factory });
  };
  OneSlider.on = function (evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  };
  OneSlider.emit = function (evt, payload) {
    (listeners[evt] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { /* swallow */ }
    });
  };

  function boot() {
    modules.forEach(function (m) {
      try { m.factory(OneSlider); }
      catch (e) { if (window.console) console.warn('[OneSlider]', m.name, e); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 0);
  }

  // Compute a path that resolves to the repo root, derived from this
  // script's own src attribute. Works for file:// and http(s):// alike.
  // Example results: "../../" on a depth-2 page, "./" on the root page.
  function rootHref() {
    var s = document.currentScript ||
            document.querySelector('script[src*="oneslider-core.js"]');
    if (!s) return '/';
    var src = s.getAttribute('src') || '';
    return src.replace(/assets\/js\/oneslider-core\.js(?:\?[^/]*)?$/, '') || './';
  }
  OneSlider.rootHref = rootHref;

  // ====================================================================
  // Module: brand
  // Inject a clickable "OneSliders" logo + wordmark as the first child
  // of every top nav (nav.top-menu, nav.event-nav) so visitors can always
  // return to the landing page. Idempotent.
  // ====================================================================
  OneSlider.register('brand', function (App) {
    var root = OneSlider.rootHref();

    function build() {
      var a = document.createElement('a');
      a.className = 'os-brand';
      a.href = root || './';
      a.setAttribute('aria-label', 'OneSliders home');

      var img = document.createElement('img');
      img.className = 'os-brand__logo';
      img.src   = root + 'assets/icons/one-sliders-icon.svg';
      img.alt   = '';
      img.width = 22;
      img.height = 22;
      img.setAttribute('aria-hidden', 'true');

      var text = document.createElement('span');
      text.className = 'os-brand__text';
      text.textContent = 'OneSliders';

      a.appendChild(img);
      a.appendChild(text);
      return a;
    }

    var navs = document.querySelectorAll('nav.top-menu, nav.event-nav');
    for (var i = 0; i < navs.length; i++) {
      var nav = navs[i];
      if (nav.querySelector(':scope > .os-brand')) continue;  // already there
      nav.insertBefore(build(), nav.firstChild);
    }
  });

  // ====================================================================
  // Module: iosNav
  // iOS Human Interface Guidelines style mobile nav. Shown only on
  // screens <=620 px. Replaces the desktop pill row with a 3-slot bar:
  //   [<- Parent]   Page title   [...]
  // The "..." button opens an action sheet that slides up from the
  // bottom with Home / Events / World / All categories / Language /
  // Cookie settings entries.
  //
  // Page title + back link are derived heuristically from the existing
  // nav structure, so no per-page HTML changes are needed. Pages can
  // override by setting <meta name="os-back-href"> and
  // <meta name="os-back-label"> in <head>.
  // ====================================================================
  OneSlider.register('iosNav', function (App) {
    if (document.querySelector('.ios-nav')) return;  // already injected
    var root = OneSlider.rootHref();

    // --- derive title -------------------------------------------------
    function deriveTitle() {
      var active = document.querySelector(
        'nav.top-menu a.active, nav.top-menu a[aria-current="page"]');
      if (active && active.textContent.trim()) return active.textContent.trim();
      var h1 = document.querySelector('h1.event-title, .event-hero-copy h1, header h1, main h1');
      if (h1 && h1.textContent.trim()) return h1.textContent.trim().slice(0, 60);
      var t = document.title || '';
      // Trim " | OneSliders", " · OneSliders", "- OneSliders"
      return t.split(/[|·\-]\s*OneSliders/i)[0].trim() || 'OneSliders';
    }

    // --- derive back link --------------------------------------------
    // Priority:
    //   1. <meta name="os-back-href"> + <meta name="os-back-label">
    //   2. Second-to-last text link in nav.top-menu (breadcrumb)
    //   3. Default: Home
    function deriveBack() {
      var mh = document.querySelector('meta[name="os-back-href"]');
      var ml = document.querySelector('meta[name="os-back-label"]');
      if (mh && mh.content) {
        return { href: mh.content, label: (ml && ml.content) || 'Back' };
      }
      var links = document.querySelectorAll(
        'nav.top-menu > a:not(.nav-icon):not(.os-brand)');
      if (links.length >= 2) {
        var prev = links[links.length - 2];
        return { href: prev.getAttribute('href') || '#',
                 label: prev.textContent.trim() || 'Back' };
      }
      if (links.length === 1) {
        return { href: root || './', label: 'Home' };
      }
      // Event pages (event-nav) — derive parent topic from URL pattern.
      var m = location.pathname.match(/\/categories\/([^/]+)\/([^/]+)\/events\/[^/]+\.html?$/);
      if (m) {
        var topicLabel = m[2].replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        return { href: '../../' + m[2] + '.html', label: topicLabel };
      }
      return { href: root || './', label: 'Home' };
    }

    // --- icon helpers -------------------------------------------------
    function svg(d, fill) {
      var ns = 'http://www.w3.org/2000/svg';
      var s = document.createElementNS(ns, 'svg');
      s.setAttribute('viewBox', '0 0 24 24');
      s.setAttribute('aria-hidden', 'true');
      if (fill) { s.setAttribute('fill', 'currentColor'); }
      else {
        s.setAttribute('fill', 'none');
        s.setAttribute('stroke', 'currentColor');
        s.setAttribute('stroke-width', '2');
        s.setAttribute('stroke-linecap', 'round');
        s.setAttribute('stroke-linejoin', 'round');
      }
      s.innerHTML = d;
      return s;
    }
    var ICONS = {
      back:    '<path d="m15 18-6-6 6-6"/>',
      more:    '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>',
      chev:    '<path d="m9 18 6-6-6-6"/>',
      home:    '<path d="m3 12 9-9 9 9"/><path d="M5 10v10h14V10"/>',
      events:  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      world:   '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      grid:    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
      cookie:  '<path d="M12 2a10 10 0 1 0 10 10c0-.46-.04-.91-.1-1.36a5 5 0 0 1-5.91-7.6A10 10 0 0 0 12 2Z"/><circle cx="8.5" cy="9" r=".7" fill="currentColor"/><circle cx="15" cy="14.5" r=".7" fill="currentColor"/><circle cx="9.5" cy="14.5" r=".7" fill="currentColor"/>'
    };

    // --- build nav ----------------------------------------------------
    var title = deriveTitle();
    var back  = deriveBack();

    var nav = document.createElement('nav');
    nav.className = 'ios-nav';
    nav.setAttribute('aria-label', 'Page navigation');

    var backLink = document.createElement('a');
    backLink.className = 'ios-back';
    backLink.href = back.href;
    backLink.setAttribute('aria-label', 'Back to ' + back.label);
    backLink.appendChild(svg(ICONS.back));
    var backSpan = document.createElement('span');
    backSpan.textContent = back.label;
    backLink.appendChild(backSpan);

    var titleEl = document.createElement('h1');
    titleEl.className = 'ios-title';
    titleEl.textContent = title;

    var moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'ios-more';
    moreBtn.setAttribute('aria-haspopup', 'menu');
    moreBtn.setAttribute('aria-controls', 'ios-sheet');
    moreBtn.setAttribute('aria-label', 'Menu');
    moreBtn.appendChild(svg(ICONS.more, true));

    nav.appendChild(backLink);
    nav.appendChild(titleEl);
    nav.appendChild(moreBtn);

    // --- build sheet --------------------------------------------------
    function item(href, label, iconKey, chev) {
      var el;
      if (href) { el = document.createElement('a'); el.href = href; }
      else      { el = document.createElement('button'); el.type = 'button'; }
      el.className = 'ios-sheet__item';
      if (iconKey) el.appendChild(svg(ICONS[iconKey]));
      el.appendChild(document.createTextNode(label));
      if (chev) {
        var s = document.createElement('span');
        s.className = 'ios-sheet__chevron';
        s.appendChild(svg(ICONS.chev));
        el.appendChild(s);
      }
      return el;
    }

    function group(children) {
      var g = document.createElement('div');
      g.className = 'ios-sheet__group';
      children.forEach(function (c) { g.appendChild(c); });
      return g;
    }
    function heading(text) {
      var p = document.createElement('p');
      p.className = 'ios-sheet__heading';
      p.textContent = text;
      return p;
    }

    var sheet = document.createElement('div');
    sheet.className = 'ios-sheet';
    sheet.id = 'ios-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Navigation menu');
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="ios-sheet__backdrop" data-sheet-close></div>' +
      '<div class="ios-sheet__panel" role="document">' +
        '<span class="ios-sheet__grabber" aria-hidden="true"></span>' +
      '</div>';
    var panel = sheet.querySelector('.ios-sheet__panel');

    panel.appendChild(heading('Browse'));
    panel.appendChild(group([
      item(root || './', 'Home', 'home', true),
      item(root + 'content/events/this-week.html', 'This week', 'events', true),
      item(root + 'content/events/index.html',     'All events', 'events', true),
      item(root + 'content/locations/index.html',  'World',      'world',  true),
      item(root + 'content/categories/index.html', 'Categories', 'grid',   true)
    ]));

    panel.appendChild(heading('Settings'));
    var cookieItem = item('#', 'Cookie settings', 'cookie', true);
    cookieItem.setAttribute('data-cookie-settings', '');
    panel.appendChild(group([cookieItem]));

    var done = document.createElement('button');
    done.type = 'button';
    done.className = 'ios-sheet__done';
    done.setAttribute('data-sheet-close', '');
    done.textContent = 'Done';
    panel.appendChild(done);

    // Insert nav right after <body> opening, sheet at end of <body>
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.appendChild(sheet);

    // --- open/close ---------------------------------------------------
    function open()  {
      sheet.hidden = false;
      sheet.classList.add('ios-sheet--open');
      document.body.classList.add('ios-sheet-open');
    }
    function close() {
      sheet.classList.remove('ios-sheet--open');
      document.body.classList.remove('ios-sheet-open');
      setTimeout(function () { sheet.hidden = true; }, 240);
    }
    moreBtn.addEventListener('click', open);
    sheet.addEventListener('click', function (e) {
      if (e.target.closest('[data-sheet-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('ios-sheet--open')) close();
    });
  });

  // ====================================================================
  // Module: consent  (geo-aware cookie banner + Google Consent Mode v2)
  // ====================================================================
  OneSlider.register('consent', function (App) {

  // ---------- Config ----------
  var EU_EEA_UK = {
    AT:1, BE:1, BG:1, HR:1, CY:1, CZ:1, DK:1, EE:1, FI:1, FR:1,
    DE:1, GR:1, HU:1, IE:1, IT:1, LV:1, LT:1, LU:1, MT:1, NL:1,
    PL:1, PT:1, RO:1, SK:1, SI:1, ES:1, SE:1,           // EU
    IS:1, LI:1, NO:1,                                   // EEA
    GB:1                                                // UK
  };

  var STORAGE_KEY = 'os_consent_v1';   // user choice (localStorage, persistent)
  var GEO_KEY     = 'os_geo_country';  // cached country code (sessionStorage)
  var GEO_TS_KEY  = 'os_geo_ts';

  // ---------- i18n ----------
  // Banner is only shown to EU/EEA/UK visitors, so we cover those languages
  // plus a couple more. Fallback is English.
  var I18N = {
    en: {
      title: 'We use cookies',
      body:  'We use cookies for analytics and to support advertising and affiliate links. You can accept all, reject non-essential, or customise your choices. See our <a href="/privacy.html">privacy policy</a>.',
      accept: 'Accept all',
      reject: 'Reject all',
      custom: 'Customize',
      save:   'Save choices',
      reopen: 'Cookie settings',
      catEss: 'Strictly necessary',
      catEssD: 'Required for the site to function. Always on.',
      catAna: 'Analytics',
      catAnaD: 'Helps us understand how visitors use the site (Google Analytics).',
      catAds: 'Advertising & affiliate',
      catAdsD: 'Used to deliver relevant ads and measure affiliate links.'
    },
    no: {
      title: 'Vi bruker informasjonskapsler',
      body:  'Vi bruker cookies for statistikk og for å støtte annonser og affiliate-lenker. Du kan godta alle, avvise valgfrie eller tilpasse valgene. Les vår <a href="/privacy.html">personvernerklæring</a>.',
      accept: 'Godta alle',
      reject: 'Avvis alle',
      custom: 'Tilpass',
      save:   'Lagre valg',
      reopen: 'Cookie-innstillinger',
      catEss: 'Strengt nødvendige',
      catEssD: 'Kreves for at siden skal fungere. Alltid på.',
      catAna: 'Statistikk',
      catAnaD: 'Hjelper oss å forstå hvordan besøkende bruker siden (Google Analytics).',
      catAds: 'Annonser og affiliate',
      catAdsD: 'Brukes for å vise relevante annonser og måle affiliate-lenker.'
    },
    sv: {
      title: 'Vi använder cookies',
      body:  'Vi använder cookies för statistik och för att stödja annonser och affiliate-länkar. Du kan acceptera alla, avvisa valfria eller anpassa dina val. Se vår <a href="/privacy.html">integritetspolicy</a>.',
      accept: 'Acceptera alla',
      reject: 'Avvisa alla',
      custom: 'Anpassa',
      save:   'Spara val',
      reopen: 'Cookie-inställningar',
      catEss: 'Strikt nödvändiga',
      catEssD: 'Krävs för att sidan ska fungera. Alltid på.',
      catAna: 'Statistik',
      catAnaD: 'Hjälper oss förstå hur besökare använder sidan (Google Analytics).',
      catAds: 'Annonser och affiliate',
      catAdsD: 'Används för att leverera relevanta annonser och mäta affiliate-länkar.'
    },
    de: {
      title: 'Wir verwenden Cookies',
      body:  'Wir verwenden Cookies für Statistiken und um Werbung und Affiliate-Links zu unterstützen. Sie können alle akzeptieren, optionale ablehnen oder Ihre Auswahl anpassen. Siehe unsere <a href="/privacy.html">Datenschutzerklärung</a>.',
      accept: 'Alle akzeptieren',
      reject: 'Alle ablehnen',
      custom: 'Anpassen',
      save:   'Auswahl speichern',
      reopen: 'Cookie-Einstellungen',
      catEss: 'Unbedingt erforderlich',
      catEssD: 'Für den Betrieb der Website erforderlich. Immer aktiv.',
      catAna: 'Analyse',
      catAnaD: 'Hilft uns zu verstehen, wie Besucher die Seite nutzen (Google Analytics).',
      catAds: 'Werbung & Affiliate',
      catAdsD: 'Zur Anzeige relevanter Werbung und Messung von Affiliate-Links.'
    },
    fr: {
      title: 'Nous utilisons des cookies',
      body:  'Nous utilisons des cookies pour les statistiques et pour soutenir la publicité et les liens d’affiliation. Vous pouvez tout accepter, refuser les cookies optionnels ou personnaliser vos choix. Consultez notre <a href="/privacy.html">politique de confidentialité</a>.',
      accept: 'Tout accepter',
      reject: 'Tout refuser',
      custom: 'Personnaliser',
      save:   'Enregistrer mes choix',
      reopen: 'Paramètres des cookies',
      catEss: 'Strictement nécessaires',
      catEssD: 'Nécessaires au fonctionnement du site. Toujours actifs.',
      catAna: 'Analytique',
      catAnaD: 'Nous aide à comprendre comment les visiteurs utilisent le site (Google Analytics).',
      catAds: 'Publicité et affiliation',
      catAdsD: 'Pour afficher des annonces pertinentes et mesurer les liens d’affiliation.'
    },
    es: {
      title: 'Usamos cookies',
      body:  'Usamos cookies para estadísticas y para apoyar publicidad y enlaces de afiliados. Puede aceptar todas, rechazar las opcionales o personalizar sus preferencias. Consulte nuestra <a href="/privacy.html">política de privacidad</a>.',
      accept: 'Aceptar todas',
      reject: 'Rechazar todas',
      custom: 'Personalizar',
      save:   'Guardar elecciones',
      reopen: 'Configuración de cookies',
      catEss: 'Estrictamente necesarias',
      catEssD: 'Necesarias para que el sitio funcione. Siempre activas.',
      catAna: 'Analítica',
      catAnaD: 'Nos ayuda a entender cómo los visitantes usan el sitio (Google Analytics).',
      catAds: 'Publicidad y afiliados',
      catAdsD: 'Para mostrar anuncios relevantes y medir enlaces de afiliados.'
    },
    pt: {
      title: 'Usamos cookies',
      body:  'Usamos cookies para estatísticas e para apoiar publicidade e links de afiliados. Pode aceitar todos, rejeitar os opcionais ou personalizar as suas escolhas. Veja a nossa <a href="/privacy.html">política de privacidade</a>.',
      accept: 'Aceitar todos',
      reject: 'Rejeitar todos',
      custom: 'Personalizar',
      save:   'Guardar escolhas',
      reopen: 'Definições de cookies',
      catEss: 'Estritamente necessários',
      catEssD: 'Necessários para o funcionamento do site. Sempre ativos.',
      catAna: 'Estatísticas',
      catAnaD: 'Ajuda-nos a perceber como os visitantes usam o site (Google Analytics).',
      catAds: 'Publicidade e afiliados',
      catAdsD: 'Para mostrar anúncios relevantes e medir links de afiliados.'
    },
    it: {
      title: 'Utilizziamo i cookie',
      body:  'Utilizziamo i cookie per le statistiche e per supportare pubblicità e link di affiliazione. Puoi accettare tutti, rifiutare quelli opzionali o personalizzare le scelte. Consulta la nostra <a href="/privacy.html">informativa sulla privacy</a>.',
      accept: 'Accetta tutti',
      reject: 'Rifiuta tutti',
      custom: 'Personalizza',
      save:   'Salva scelte',
      reopen: 'Impostazioni cookie',
      catEss: 'Strettamente necessari',
      catEssD: 'Necessari per il funzionamento del sito. Sempre attivi.',
      catAna: 'Analitica',
      catAnaD: 'Ci aiuta a capire come i visitatori usano il sito (Google Analytics).',
      catAds: 'Pubblicità e affiliazione',
      catAdsD: 'Per mostrare annunci pertinenti e misurare i link di affiliazione.'
    },
    nl: {
      title: 'Wij gebruiken cookies',
      body:  'Wij gebruiken cookies voor statistieken en om advertenties en affiliate-links te ondersteunen. U kunt alles accepteren, optionele cookies weigeren of uw keuzes aanpassen. Zie ons <a href="/privacy.html">privacybeleid</a>.',
      accept: 'Alles accepteren',
      reject: 'Alles weigeren',
      custom: 'Aanpassen',
      save:   'Keuzes opslaan',
      reopen: 'Cookie-instellingen',
      catEss: 'Strikt noodzakelijk',
      catEssD: 'Vereist voor de werking van de site. Altijd aan.',
      catAna: 'Analyse',
      catAnaD: 'Helpt ons begrijpen hoe bezoekers de site gebruiken (Google Analytics).',
      catAds: 'Advertenties & affiliate',
      catAdsD: 'Voor het tonen van relevante advertenties en het meten van affiliate-links.'
    }
  };

  function lang() {
    var raw = (document.documentElement.lang || 'en').toLowerCase();
    var base = raw.split('-')[0];
    return I18N[base] ? base : 'en';
  }
  function t(key) {
    var L = lang();
    return (I18N[L] && I18N[L][key]) || I18N.en[key];
  }

  // ---------- gtag plumbing ----------
  // Inline snippet in <head> already created window.dataLayer and called
  // gtag('consent','default',{...denied...}). We just push updates here.
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  function applyConsent(state) {
    gtag('consent', 'update', {
      ad_storage:         state.ads      ? 'granted' : 'denied',
      ad_user_data:       state.ads      ? 'granted' : 'denied',
      ad_personalization: state.ads      ? 'granted' : 'denied',
      analytics_storage:  state.analytics ? 'granted' : 'denied'
    });
    if (state.ads) loadAdSense();
  }

  function loadAdSense() {
    if (window.__adsenseLoaded) return;
    window.__adsenseLoaded = true;
    /* TODO: insert AdSense snippet here once you have a publisher ID.
       Example:
       var s = document.createElement('script');
       s.async = true;
       s.crossOrigin = 'anonymous';
       s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX';
       document.head.appendChild(s);
    */
  }

  // ---------- Storage helpers ----------
  function saveChoice(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        analytics: !!state.analytics,
        ads:       !!state.ads,
        ts:        Date.now()
      }));
    } catch (e) {}
  }
  function loadChoice() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      // Re-prompt after 12 months (GDPR best practice)
      if (v && v.ts && (Date.now() - v.ts) > 365 * 24 * 3600 * 1000) return null;
      return v;
    } catch (e) { return null; }
  }
  function clearChoice() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ---------- Geo detection ----------
  function cachedCountry() {
    try {
      var c = sessionStorage.getItem(GEO_KEY);
      var ts = parseInt(sessionStorage.getItem(GEO_TS_KEY) || '0', 10);
      if (c && ts && (Date.now() - ts) < 24 * 3600 * 1000) return c;
    } catch (e) {}
    return null;
  }
  function cacheCountry(c) {
    try {
      sessionStorage.setItem(GEO_KEY, c);
      sessionStorage.setItem(GEO_TS_KEY, String(Date.now()));
    } catch (e) {}
  }

  function detectCountry() {
    var c = cachedCountry();
    if (c) return Promise.resolve(c);

    // Strategy: try Cloudflare's trace endpoint first (very fast, no rate limit
    // when site is fronted by Cloudflare; works elsewhere too with CORS).
    // Fall back to ipapi.co.
    return new Promise(function (resolve) {
      var done = false;
      var timeout = setTimeout(function () {
        if (done) return; done = true;
        resolve(null); // failed → caller will treat as EU (safe default)
      }, 3500);

      fetch('https://ipapi.co/country/', { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (txt) {
          if (done) return; done = true;
          clearTimeout(timeout);
          var code = (txt || '').trim().toUpperCase();
          if (/^[A-Z]{2}$/.test(code)) { cacheCountry(code); resolve(code); }
          else resolve(null);
        })
        .catch(function () {
          if (done) return; done = true;
          clearTimeout(timeout);
          resolve(null);
        });
    });
  }

  // ---------- Banner DOM ----------
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'on') for (var ev in attrs[k]) n.addEventListener(ev, attrs[k][ev]);
      else n.setAttribute(k, attrs[k]);
    }
    if (children) children.forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function buildBanner(initial) {
    var card = el('div', { class: 'os-cc-card', role: 'dialog', 'aria-live': 'polite', 'aria-label': t('title') });

    var info = el('div');
    info.appendChild(el('h2', { html: t('title') }));
    info.appendChild(el('p',  { html: t('body')  }));

    var actions = el('div', { class: 'os-cc-actions' });

    var btnReject = el('button', { class: 'os-cc-btn os-cc-btn--ghost', type: 'button', html: t('reject') });
    var btnCustom = el('button', { class: 'os-cc-btn',                  type: 'button', html: t('custom') });
    var btnAccept = el('button', { class: 'os-cc-btn os-cc-btn--primary', type: 'button', html: t('accept') });

    actions.appendChild(btnReject);
    actions.appendChild(btnCustom);
    actions.appendChild(btnAccept);

    // Customize panel
    var opts = el('div', { class: 'os-cc-options' });
    function row(idAttr, isOn, isDisabled, titleKey, descKey) {
      var label = el('label', { class: 'os-cc-option' });
      var cb = el('input', { type: 'checkbox', id: idAttr });
      cb.checked = !!isOn;
      cb.disabled = !!isDisabled;
      var txt = el('div', { class: 'os-cc-option-text' });
      txt.appendChild(el('strong', { html: t(titleKey) }));
      txt.appendChild(el('span',   { html: t(descKey)  }));
      label.appendChild(cb);
      label.appendChild(txt);
      return { row: label, cb: cb };
    }
    var rEss = row('os-cc-ess', true, true,  'catEss', 'catEssD');
    var rAna = row('os-cc-ana', !!(initial && initial.analytics), false, 'catAna', 'catAnaD');
    var rAds = row('os-cc-ads', !!(initial && initial.ads),       false, 'catAds', 'catAdsD');

    opts.appendChild(rEss.row);
    opts.appendChild(rAna.row);
    opts.appendChild(rAds.row);

    var saveBar = el('div', { class: 'os-cc-options-actions' });
    var btnSave = el('button', { class: 'os-cc-btn os-cc-btn--primary', type: 'button', html: t('save') });
    saveBar.appendChild(btnSave);
    opts.appendChild(saveBar);

    card.appendChild(info);
    card.appendChild(actions);
    card.appendChild(opts);

    var root = el('div', { id: 'os-cc-root', role: 'region', 'aria-label': t('title') });
    root.appendChild(card);

    function close() {
      root.parentNode && root.parentNode.removeChild(root);
      ensureReopen();
    }

    btnAccept.addEventListener('click', function () {
      var s = { analytics: true, ads: true };
      saveChoice(s); applyConsent(s); close();
    });
    btnReject.addEventListener('click', function () {
      var s = { analytics: false, ads: false };
      saveChoice(s); applyConsent(s); close();
    });
    btnCustom.addEventListener('click', function () {
      card.classList.toggle('is-customizing');
    });
    btnSave.addEventListener('click', function () {
      var s = { analytics: rAna.cb.checked, ads: rAds.cb.checked };
      saveChoice(s); applyConsent(s); close();
    });

    return root;
  }

  function showBanner(initial) {
    // Idempotent — remove any previous instance
    var prev = document.getElementById('os-cc-root');
    if (prev) prev.parentNode.removeChild(prev);
    var banner = buildBanner(initial || loadChoice());
    document.body.appendChild(banner);
  }

  // ---------- Reopen link ----------
  // Order of preference (first match wins):
  //   1. Any pre-existing element with [data-cookie-settings]
  //   2. Inject a cookie-icon button into the top nav next to the language
  //      menu (most discoverable, always visible)
  //   3. Inject a text link into <footer class="site-footer">
  //   4. Last resort: a small floating pill at bottom-left
  function ensureReopen() {
    if (document.getElementById('os-cc-reopen')) return;
    if (document.getElementById('os-cc-nav'))    return;

    // 1. Existing opt-in element
    var existing = document.querySelector('[data-cookie-settings]');
    if (existing) {
      bindReopen(existing);
      return;
    }

    // 2. Inject next to the language menu in the top nav. Place it after
    // the language menu so pages where the language menu owns margin-left:auto
    // keep both controls grouped on the right edge.
    var langMenu = document.querySelector('.nav-language, .event-language-menu, .top-menu .lang-switch');
    if (langMenu && langMenu.parentNode) {
      var btn = el('button', {
        id: 'os-cc-nav', type: 'button',
        class: 'os-cc-nav-btn',
        title: t('reopen'),
        'aria-label': t('reopen'),
        html: COOKIE_ICON_SVG
      });
      langMenu.parentNode.insertBefore(btn, langMenu.nextSibling);
      bindReopen(btn);
      return;
    }

    // 3. Inject into the page's site footer if it has one
    var footer = document.querySelector('footer.site-footer, .site-footer');
    if (footer) {
      var sep = document.createTextNode(' · ');
      var a = el('a', {
        href: '#', 'data-cookie-settings': '', html: t('reopen'),
        style: 'color:inherit;text-decoration:underline;text-underline-offset:2px;'
      });
      var host = footer.querySelector('p') || footer;
      host.appendChild(sep);
      host.appendChild(a);
      bindReopen(a);
      return;
    }

    // 4. Floating pill fallback
    var pill = el('button', {
      id: 'os-cc-reopen', type: 'button', html: t('reopen'),
      'aria-label': t('reopen')
    });
    bindReopen(pill);
    document.body.appendChild(pill);
  }

  function bindReopen(node) {
    node.addEventListener('click', function (e) {
      e.preventDefault();
      showBanner(loadChoice());
    });
  }

  // Cookie-with-bites icon — universally readable as "cookies"
  var COOKIE_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10c0-.46-.04-.91-.1-1.36a5 5 0 0 1-5.91-7.6A10 10 0 0 0 12 2Z"/><circle cx="8.5" cy="9" r=".7" fill="currentColor"/><circle cx="15" cy="14.5" r=".7" fill="currentColor"/><circle cx="9.5" cy="14.5" r=".7" fill="currentColor"/></svg>';

  // ---------- Init flow ----------
  function init() {
    // 1. If user already chose, just apply and show reopen link.
    var stored = loadChoice();
    if (stored) {
      applyConsent(stored);
      ensureReopen();
      return;
    }

    // 2. Otherwise figure out geo.
    detectCountry().then(function (country) {
      var requiresConsent = !country || EU_EEA_UK[country];

      if (!requiresConsent) {
        // Outside EU/EEA/UK → grant everything automatically.
        var grantAll = { analytics: true, ads: true };
        applyConsent(grantAll);
        saveChoice(grantAll);
        ensureReopen();
        return;
      }

      // EU/EEA/UK or geo failed → keep "denied" and prompt.
      showBanner(null);
    });
  }

  // Wrap applyConsent so other modules can react via the event bus.
  var _applyConsent = applyConsent;
  applyConsent = function (state) {
    _applyConsent(state);
    App.emit('consent:update', state);
  };

  // Public API: window.OneSlider.consent.{open,reset,state}
  // Plus legacy window.OsConsent shim for any inline handlers.
  App.consent = {
    open:  function () { showBanner(loadChoice()); },
    reset: function () { clearChoice(); location.reload(); },
    state: function () { return loadChoice(); }
  };
  window.OsConsent = App.consent;

  init();
  });  // end OneSlider.register('consent', ...)

  // ====================================================================
  // Add new modules below. Template:
  //
  //   OneSlider.register('my-feature', function (App) {
  //     // Setup here. App.on/App.emit available for cross-module events.
  //     // E.g. wait for consent decision:
  //     // App.on('consent:granted', function (state) { if (state.ads) { ... } });
  //   });
  // ====================================================================

})();  // end IIFE
