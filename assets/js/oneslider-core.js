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
  // Module: expiringEvents
  // Hide event links once their data-end date is in the past. This keeps
  // location/persona pages from advertising events that have already ended.
  // ====================================================================
  OneSlider.register('expiringEvents', function () {
    var items = document.querySelectorAll('[data-expiring-events] [data-end]');
    if (!items.length) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    items.forEach(function (item) {
      var raw = item.getAttribute('data-end');
      if (!raw) return;
      var end = new Date(raw + 'T00:00:00');
      if (Number.isNaN(end.getTime())) return;
      if (end < today) item.hidden = true;
    });
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
    //   2. Explicit <a class="nav-back"> element (locations hierarchy)
    //   3. Sibling link immediately BEFORE the .active breadcrumb
    //      (skips own-page links that would otherwise be picked as "back")
    //   4. Last non-active text link in nav.top-menu
    //   5. URL-pattern derivation for event pages
    //   6. Default: Home
    function deriveBack() {
      var mh = document.querySelector('meta[name="os-back-href"]');
      var ml = document.querySelector('meta[name="os-back-label"]');
      if (mh && mh.content) {
        return { href: mh.content, label: (ml && ml.content) || 'Back' };
      }
      var navBack = document.querySelector('nav.top-menu .nav-back');
      if (navBack) {
        var span = navBack.querySelector('span');
        return {
          href:  navBack.getAttribute('href') || '#',
          label: (span ? span.textContent : navBack.textContent).trim() || 'Back'
        };
      }
      var active = document.querySelector(
        'nav.top-menu .active, nav.top-menu [aria-current="page"]');
      if (active && active.parentNode) {
        var sib = active.previousElementSibling;
        while (sib) {
          if (sib.tagName === 'A' &&
              !sib.classList.contains('nav-icon') &&
              !sib.classList.contains('os-brand') &&
              !sib.classList.contains('nav-divider')) {
            return {
              href:  sib.getAttribute('href') || '#',
              label: sib.textContent.trim() || 'Back'
            };
          }
          sib = sib.previousElementSibling;
        }
      }
      var links = document.querySelectorAll(
        'nav.top-menu > a:not(.nav-icon):not(.os-brand):not(.active):not([aria-current="page"])');
      if (links.length) {
        var last = links[links.length - 1];
        return { href: last.getAttribute('href') || '#',
                 label: last.textContent.trim() || 'Back' };
      }
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
      cookie:  '<path d="M12 2a10 10 0 1 0 10 10c0-.46-.04-.91-.1-1.36a5 5 0 0 1-5.91-7.6A10 10 0 0 0 12 2Z"/><circle cx="8.5" cy="9" r=".7" fill="currentColor"/><circle cx="15" cy="14.5" r=".7" fill="currentColor"/><circle cx="9.5" cy="14.5" r=".7" fill="currentColor"/>',
      doc:     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>',
      mail:    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>'
    };

    // --- build nav ----------------------------------------------------
    var title = deriveTitle();
    var back  = deriveBack();

    var nav = document.createElement('nav');
    nav.className = 'ios-nav';
    nav.setAttribute('aria-label', 'Page navigation');

    var backLink = document.createElement('a');
    backLink.className = 'ios-back';
    // href is the static fallback parent, used when there's no in-site
    // history (cold landing from Google, opened in a new tab, etc.).
    // The click handler below upgrades the behaviour to "browser back"
    // when the visitor actually navigated here from another OneSliders
    // page — that's the natural iOS-style behaviour: tap "‹ Foo" to
    // undo your last step, not jump to the heuristic parent.
    backLink.href = back.href;
    // aria-label keeps the destination announced to screen readers
    // even though the chevron renders icon-only.
    backLink.setAttribute('aria-label', 'Back to ' + back.label);
    backLink.appendChild(svg(ICONS.back));

    backLink.addEventListener('click', function (e) {
      // Respect modifier keys / middle-click / right-click — let the
      // browser handle "open in new tab" against the static href.
      if (e.defaultPrevented || e.button !== 0 ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var ref = document.referrer || '';
      // We came from a OneSliders page in this same tab if:
      //   - referrer is set
      //   - it's the same origin (or both are file://)
      //   - there's actually something to go back to in history
      var sameOrigin =
        ref.indexOf(location.origin + '/') === 0 ||
        (location.protocol === 'file:' && ref.indexOf('file://') === 0);
      if (sameOrigin && window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });

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
    panel.appendChild(group([
      cookieItem,
      item(root + 'privacy.html',           'Privacy',  'doc',  true),
      item(root + 'terms.html',             'Terms',    'doc',  true),
      item('mailto:hello@one-sliders.com',  'Contact',  'mail', true)
    ]));

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
  // Module: siteFooter
  // Standardises every page's footer to one line:
  //   (c) YEAR OneSliders | Made by 3D Fractal | hello@one-sliders.com
  //                                            | Privacy | Terms | Cookie settings
  //
  // Pages that already have <footer class="site-footer"> / "site" /
  // "site-foot": replace their inner content (keeps the page's existing
  // outer styling). Pages without a footer: a minimal one is appended.
  // Pages can opt out by setting <meta name="os-footer" content="off">.
  // ====================================================================
  OneSlider.register('siteFooter', function (App) {
    var opt = document.querySelector('meta[name="os-footer"]');
    if (opt && opt.content === 'off') return;

    var root = OneSlider.rootHref();
    var year = new Date().getFullYear();

    // Minimal footer. Terms, contact email and cookie-settings access live
    // in the iOS sheet "Settings" section on mobile, and the floating
    // cookie pill (auto-injected by the brand module) on desktop.
    var content =
      '<p>&copy; ' + year + ' OneSliders &middot; ' +
      '<a href="' + root + 'privacy.html">Privacy</a></p>';

    var existing = document.querySelector(
      'footer.site-footer, footer.site-foot, footer.site');
    if (existing) {
      existing.innerHTML = content;
      if (!existing.classList.contains('os-footer')) {
        existing.classList.add('os-footer');
      }
      return;
    }

    // No footer yet — append one (with default os-footer styling from CSS)
    var f = document.createElement('footer');
    f.className = 'os-footer site-footer';
    f.innerHTML = content;
    document.body.appendChild(f);
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

  OneSlider.register('membership-filter', function () {
    var filter = document.querySelector('[data-membership-filter]');
    if (!filter) return;

    var reset = filter.querySelector('[data-membership-filter-reset]');
    var buttons = Array.prototype.slice.call(filter.querySelectorAll('[data-membership-filter-value]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-memberships]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.continent-subgroup'));

    function selectedValue() {
      var active = buttons.find(function (button) {
        return button.classList.contains('is-active');
      });
      return active ? active.getAttribute('data-membership-filter-value') : '';
    }

    function applyFilters() {
      var selected = selectedValue();
      var hasFilters = Boolean(selected);

      if (reset) reset.classList.toggle('is-active', !hasFilters);

      chips.forEach(function (chip) {
        var memberships = (chip.getAttribute('data-memberships') || 'none').split(/\s+/);
        var match = !hasFilters || memberships.indexOf(selected) !== -1;
        chip.classList.toggle('is-filter-hidden', !match);
      });

      groups.forEach(function (group) {
        var groupChips = Array.prototype.slice.call(group.querySelectorAll('[data-memberships]'));
        if (!groupChips.length) return;
        var visible = groupChips.some(function (chip) {
          return !chip.classList.contains('is-filter-hidden');
        });
        group.classList.toggle('is-filter-empty', !visible && hasFilters);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) { item.classList.remove('is-active'); });
        button.classList.add('is-active');
        applyFilters();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        buttons.forEach(function (button) { button.classList.remove('is-active'); });
        applyFilters();
      });
    }

    applyFilters();
  });

  OneSlider.register('continent-carousel', function () {
    var carousels = Array.prototype.slice.call(document.querySelectorAll('[data-continent-carousel]'));
    if (!carousels.length) return;

    carousels.forEach(function (carousel) {
      var track = carousel.querySelector('[data-continent-carousel-track]');
      if (!track) return;

      var panels = Array.prototype.slice.call(track.querySelectorAll('.continent-group-panel'));
      var prev = carousel.querySelector('[data-continent-carousel-prev]');
      var next = carousel.querySelector('[data-continent-carousel-next]');
      var current = carousel.querySelector('[data-continent-carousel-current]');
      var activeIndex = 0;
      var ticking = false;
      var touchStartX = null;

      function clampIndex(index) {
        return Math.max(0, Math.min(panels.length - 1, index));
      }

      function currentIndex() {
        if (!panels.length || !track.clientWidth) return 0;
        return clampIndex(Math.round(track.scrollLeft / track.clientWidth));
      }

      function labelFor(index) {
        var panel = panels[clampIndex(index)];
        var heading = panel && panel.querySelector('h3');
        if (!heading) return '';
        var clone = heading.cloneNode(true);
        Array.prototype.slice.call(clone.querySelectorAll('span')).forEach(function (span) {
          span.parentNode.removeChild(span);
        });
        return clone.textContent.replace(/\s+Europe\s*$/, '').replace(/\s+/g, ' ').trim();
      }

      function syncTrackHeight(index) {
        var panel = panels[clampIndex(index)];
        if (!panel) return;
        track.style.height = panel.offsetHeight + 'px';
      }

      function carouselIsVisible() {
        var rect = carousel.getBoundingClientRect();
        return rect.bottom > window.innerHeight * 0.18 && rect.top < window.innerHeight * 0.82;
      }

      function updateActiveState() {
        carousel.classList.toggle('is-carousel-active', carouselIsVisible());
      }

      function update() {
        activeIndex = currentIndex();
        syncTrackHeight(activeIndex);
        updateActiveState();
        if (prev) {
          prev.disabled = activeIndex === 0;
          prev.textContent = activeIndex === 0 ? '\u2039 Previous' : '\u2039 ' + labelFor(activeIndex - 1);
        }
        if (current) current.textContent = labelFor(activeIndex);
        if (next) {
          next.disabled = activeIndex === panels.length - 1;
          next.textContent = activeIndex === panels.length - 1 ? 'Next \u203a' : labelFor(activeIndex + 1) + ' \u203a';
        }
      }

      function goTo(index) {
        var targetIndex = clampIndex(index);
        var target = panels[targetIndex];
        if (!target) return;
        syncTrackHeight(targetIndex);
        var left = target.offsetLeft - track.offsetLeft;
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left: left, behavior: 'smooth' });
        } else {
          track.scrollLeft = left;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          goTo(activeIndex - 1);
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          goTo(activeIndex + 1);
        });
      }

      track.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          update();
        });
      }, { passive: true });

      track.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(activeIndex - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(activeIndex + 1);
        }
      });

      carousel.addEventListener('touchstart', function (event) {
        touchStartX = event.touches[0] ? event.touches[0].clientX : null;
      }, { passive: true });

      carousel.addEventListener('touchend', function (event) {
        if (touchStartX === null) return;
        var touchEndX = event.changedTouches[0] ? event.changedTouches[0].clientX : touchStartX;
        var delta = touchEndX - touchStartX;
        touchStartX = null;
        if (Math.abs(delta) < 70) return;
        goTo(delta > 0 ? activeIndex - 1 : activeIndex + 1);
      }, { passive: true });

      document.addEventListener('keydown', function (event) {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (!carouselIsVisible()) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goTo(activeIndex - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          goTo(activeIndex + 1);
        }
      });

      window.addEventListener('resize', function () {
        syncTrackHeight(activeIndex);
        update();
      });
      window.addEventListener('scroll', updateActiveState, { passive: true });
      update();
    });
  });

  OneSlider.register('recipe-actions', function () {
    var page = document.body;
    if (!page || (
        !page.classList.contains('food-topic-page') &&
        !page.classList.contains('drink-topic-page'))) return;

    var deferredInstallPrompt = null;
    var homeButton = null;

    function isIOS() {
      var ua = navigator.userAgent || '';
      return /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    function isAndroid() {
      return /Android/i.test(navigator.userAgent || '');
    }

    function isStandalone() {
      return Boolean(window.navigator.standalone) ||
        (window.matchMedia &&
          window.matchMedia('(display-mode: standalone)').matches);
    }

    function cleanText(value) {
      return (value || '').replace(/\s+/g, ' ').trim();
    }

    function findIngredientPanel() {
      var panels = document.querySelectorAll('.topic-card, .panel');
      for (var i = 0; i < panels.length; i++) {
        var heading = panels[i].querySelector('h2');
        var text = heading ? cleanText(heading.textContent).toLowerCase() : '';
        if (text === 'ingredients' && panels[i].querySelector('ul.recipe-list')) {
          return panels[i];
        }
      }
      return null;
    }

    function recipeTitle() {
      var h1 = document.querySelector('.food-topic h1, .drink-hero h1, main h1');
      return cleanText(h1 && h1.textContent) || cleanText(document.title) || 'Recipe';
    }

    function ingredientsFrom(panel) {
      var items = panel.querySelectorAll('ul.recipe-list li');
      var list = [];
      for (var i = 0; i < items.length; i++) {
        var text = cleanText(items[i].textContent);
        if (text) list.push(text);
      }
      return list;
    }

    function shoppingListText(title, items) {
      return title + '\n\nIngredients\n' +
        items.map(function (item) { return '- ' + item; }).join('\n') +
        '\n\n' + window.location.href;
    }

    function groceryItemsText(items) {
      return items.join('\n');
    }

    function groceryListName(title) {
      return title + ' groceries';
    }

    function groceriesShareData(title, items) {
      return {
        title: groceryListName(title),
        text: groceryItemsText(items)
      };
    }

    var SHOPPING_LIST_KEY = 'oneslider-shopping-list';

    function saveToShoppingList(recipeTitle, items, recipeUrl) {
      try {
        var existing = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY) || '[]');
        // Replace any existing items from the same recipe so re-adding is idempotent
        existing = existing.filter(function (item) { return item.recipe !== recipeTitle; });
        var slug = recipeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        items.forEach(function (text, i) {
          existing.push({
            id: slug + '-' + i,
            recipe: recipeTitle,
            recipeUrl: recipeUrl,
            text: text,
            checked: false
          });
        });
        localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(existing));
        return true;
      } catch (e) {
        return false;
      }
    }

    function groceriesShortcutInput(title, items) {
      return [
        groceryListName(title),
        '',
        groceryItemsText(items),
        '',
        window.location.href
      ].join('\n');
    }

    function groceriesShortcutUrl(title, items) {
      return 'shortcuts://run-shortcut?name=' +
        encodeURIComponent('OneSliders Groceries') +
        '&input=text&text=' + encodeURIComponent(groceriesShortcutInput(title, items));
    }

    function setStatus(el, message) {
      if (!el) return;
      el.textContent = message || '';
      if (el._timer) clearTimeout(el._timer);
      if (message) {
        el._timer = setTimeout(function () {
          el.textContent = '';
        }, 5200);
      }
    }

    function setStatusHtml(el, html) {
      if (!el) return;
      el.innerHTML = html || '';
      if (el._timer) clearTimeout(el._timer);
      if (html) {
        el._timer = setTimeout(function () {
          el.innerHTML = '';
        }, 6000);
      }
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }

      return new Promise(function (resolve, reject) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        area.style.top = '0';
        area.style.width = '1px';
        area.style.height = '1px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.focus();
        area.select();
        area.setSelectionRange(0, area.value.length);
        try {
          var ok = document.execCommand('copy');
          document.body.removeChild(area);
          ok ? resolve() : reject(new Error('copy failed'));
        } catch (err) {
          document.body.removeChild(area);
          reject(err);
        }
      });
    }

    function remindersLabel() {
      return 'Add to list';
    }

    function homeLabel() {
      if (isStandalone()) return 'Saved to Home Screen';
      if (deferredInstallPrompt) return isAndroid() ? 'Install app' : 'Install OneSliders';
      if (isIOS()) return 'Add to Home Screen';
      if (isAndroid()) return 'Add to Home screen';
      return 'Save page';
    }

    function updateHomeLabel() {
      if (homeButton) {
        homeButton.textContent = homeLabel();
        homeButton.disabled = isStandalone();
      }
    }

    function ensureRecipeGuide() {
      var guide = document.querySelector('.recipe-install-guide');
      if (!guide) {
        guide = document.createElement('div');
        guide.className = 'recipe-install-guide';
        guide.hidden = true;
        guide.innerHTML =
          '<div class="recipe-install-guide__backdrop" data-recipe-install-close></div>' +
          '<section class="recipe-install-guide__panel" role="dialog" aria-modal="true" aria-labelledby="recipe-install-title">' +
            '<button class="recipe-install-guide__close" type="button" data-recipe-install-close aria-label="Close">Close</button>' +
            '<h2 id="recipe-install-title"></h2>' +
            '<ol></ol>' +
            '<p class="recipe-install-guide__note" hidden></p>' +
            '<textarea class="recipe-install-guide__copy" readonly hidden></textarea>' +
            '<div class="recipe-install-guide__actions" hidden></div>' +
          '</section>';
        document.body.appendChild(guide);
        guide.addEventListener('click', function (event) {
          if (event.target.closest('[data-recipe-install-close]')) {
            guide.hidden = true;
          }
        });
        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') guide.hidden = true;
        });
      }
      return guide;
    }

    function openRecipeGuide(options) {
      var guide = ensureRecipeGuide();
      var titleEl = guide.querySelector('h2');
      var list = guide.querySelector('ol');
      var note = guide.querySelector('.recipe-install-guide__note');
      var copyBox = guide.querySelector('.recipe-install-guide__copy');
      var actions = guide.querySelector('.recipe-install-guide__actions');

      titleEl.textContent = options.title || '';
      list.textContent = '';
      (options.steps || []).forEach(function (step) {
        var item = document.createElement('li');
        item.textContent = step;
        list.appendChild(item);
      });

      note.textContent = options.note || '';
      note.hidden = !options.note;

      copyBox.value = options.copyText || '';
      copyBox.hidden = !options.copyText;

      actions.textContent = '';
      actions.hidden = !(options.actions && options.actions.length) && !options.sourceHref;
      (options.actions || []).forEach(function (action) {
        if (!action.href || !action.text) return;
        var actionLink = document.createElement('a');
        actionLink.className = 'recipe-install-guide__link';
        actionLink.href = action.href;
        actionLink.textContent = action.text;
        actions.appendChild(actionLink);
      });
      if (options.sourceHref) {
        var link = document.createElement('a');
        link.className = 'recipe-install-guide__link';
        link.href = options.sourceHref;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = options.sourceText || 'Apple guide';
        actions.appendChild(link);
      }

      guide.hidden = false;
      if (options.focusCopy && options.copyText) {
        copyBox.focus();
        copyBox.select();
      }
    }

    function openInstallGuide(status) {
      var steps;
      var guideTitle;
      if (isIOS()) {
        guideTitle = 'Add to Home Screen';
        steps = ['Tap Share in Safari.', 'Choose Add to Home Screen.', 'Tap Add.'];
      } else if (isAndroid()) {
        guideTitle = 'Add to Home screen';
        steps = ['Open the browser menu.', 'Choose Install app or Add to Home screen.', 'Confirm the shortcut.'];
      } else {
        guideTitle = 'Save this recipe';
        steps = ['Use the browser menu.', 'Choose Install, Create shortcut, or Add to desktop if available.', 'Keep the recipe from your browser shortcuts.'];
      }
      openRecipeGuide({
        title: guideTitle,
        steps: steps
      });
      setStatus(status, isIOS() ? 'Follow the Safari steps shown.' : 'Follow the browser steps shown.');
    }

    var ingredientPanel = findIngredientPanel();
    if (!ingredientPanel || ingredientPanel.querySelector('.recipe-action-row')) return;

    var title = recipeTitle();
    var ingredients = ingredientsFrom(ingredientPanel);
    if (!ingredients.length) return;

    function openGroceriesGuide(status, copied) {
      var listName = groceryListName(title);
      var copiedStep = copied ?
        'The ingredients are copied as one item per line.' :
        'Copy the ingredients from the box below.';

      openRecipeGuide({
        title: 'Create a Groceries list',
        steps: [
          copiedStep,
          'Use the iOS share sheet from the button and choose Reminders, or run the OneSliders Groceries shortcut if it is installed.',
          'Choose or create a Groceries list named "' + listName + '".',
          'Reminders sorts grocery items into sections automatically when the list type is Groceries.'
        ],
        note: 'Requires iOS 17 or later and iCloud Reminders.',
        copyText: groceryItemsText(ingredients),
        focusCopy: !copied,
        actions: [
          {
            href: groceriesShortcutUrl(title, ingredients),
            text: 'Run OneSliders shortcut'
          },
          {
            href: 'x-apple-reminderkit://',
            text: 'Open Reminders'
          }
        ],
        sourceHref: 'https://support.apple.com/en-mide/105086',
        sourceText: 'Apple Reminders Groceries guide'
      });

      setStatus(status, copied ?
        'Ingredients copied for Reminders.' :
        'Copy the ingredients from the guide, then add them to a Groceries list.');
    }

    var row = document.createElement('div');
    row.className = 'recipe-action-row';

    var remindersButton = document.createElement('button');
    remindersButton.type = 'button';
    remindersButton.className = 'recipe-action-button recipe-action-button--list';
    remindersButton.textContent = remindersLabel();

    homeButton = document.createElement('button');
    homeButton.type = 'button';
    homeButton.className = 'recipe-action-button recipe-action-button--home';
    homeButton.textContent = homeLabel();
    homeButton.disabled = isStandalone();

    var status = document.createElement('p');
    status.className = 'recipe-action-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    remindersButton.addEventListener('click', function () {
      var saved = saveToShoppingList(title, ingredients, window.location.pathname);
      if (saved) {
        remindersButton.textContent = 'Added ✓';
        setTimeout(function () { remindersButton.textContent = 'Add to list'; }, 2000);
        setStatusHtml(status,
          'Added to your list. <a href="/shopping-list/" style="color:inherit;font-weight:900;">View list →</a>');
      } else {
        setStatus(status, 'Could not save — check browser storage settings.');
      }
    });

    homeButton.addEventListener('click', function () {
      if (isStandalone()) {
        setStatus(status, 'This recipe is already saved to your Home Screen.');
        return;
      }
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(function (choice) {
          if (choice && choice.outcome === 'accepted') {
            setStatus(status, 'OneSliders installed.');
          } else {
            setStatus(status, 'Install cancelled.');
          }
          deferredInstallPrompt = null;
          updateHomeLabel();
        });
        return;
      }
      openInstallGuide(status);
    });

    row.appendChild(remindersButton);
    row.appendChild(homeButton);
    row.appendChild(status);
    var heading = ingredientPanel.querySelector('h2');
    if (heading && heading.nextSibling) {
      ingredientPanel.insertBefore(row, heading.nextSibling);
    } else {
      ingredientPanel.appendChild(row);
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateHomeLabel();
    });
    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      updateHomeLabel();
      setStatus(status, 'OneSliders installed.');
    });
  });

})();  // end IIFE
