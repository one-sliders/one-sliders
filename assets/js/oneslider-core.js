/* OneSliders core script
 * ======================
 * This file is loaded on every page via:
 *   <script defer src="/assets/js/oneslider-core.js"></script>
 *
 * It is the single place to add new site-wide functionality. Everything
 * is namespaced under `window.OneSlider` and registered as a module so
 * future additions don't collide.
 *
 * Currently bundled modules:
 *   - consent       Geo-aware cookie banner + Google Consent Mode v2
 *
 * To add a new module: copy the consent module pattern at the bottom
 * (`OneSlider.register('name', factory)`) and the boot loop will run it
 * automatically on DOM-ready. Modules can publish/subscribe via
 * OneSlider.on / OneSlider.emit if they need to talk to each other.
 *
 * NOTE: The Google Consent Mode default ("denied" for all) MUST be set
 * BEFORE gtag.js loads. That's why the inline snippet in <head> handles
 * it — this file only updates consent based on geo / user choice.
 */
(function () {
  'use strict';

  if (window.OneSlider && window.OneSlider.__loaded) return;

  // ---------- Tiny module / event-bus framework ----------
  var modules = [];
  var listeners = {};

  var OneSlider = window.OneSlider = window.OneSlider || {};
  OneSlider.__loaded = true;
  OneSlider.version  = '1.0.0';

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

    // 2. Inject next to the language menu in the top nav
    var langMenu = document.querySelector('.event-language-menu, .top-menu .lang-switch');
    if (langMenu && langMenu.parentNode) {
      var btn = el('button', {
        id: 'os-cc-nav', type: 'button',
        class: 'os-cc-nav-btn',
        title: t('reopen'),
        'aria-label': t('reopen'),
        html: COOKIE_ICON_SVG
      });
      langMenu.parentNode.insertBefore(btn, langMenu);
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
