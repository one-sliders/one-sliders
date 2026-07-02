/* OneSliders core script
 * ======================
 * This file is loaded on every page via:
 *   <script defer src="/assets/js/oneslider-core.js"></script>
 *
 * It is the SINGLE place to add new site-wide functionality. To add a
 * new feature: scroll to the bottom and follow the module template.
 *
 * Currently bundled modules:
 *   - analytics     Google Consent Mode v2 + GA4 bootstrap (runs first
 *                   inside this deferred file, before gtag.js is appended)
 *   - consent       Geo-aware cookie banner UI
 *
 * Why it can be deferred: Google Consent Mode v2 requires
 *   gtag('consent','default', {...denied...})
 * to be issued BEFORE gtag.js loads. This file creates and appends gtag.js
 * only after setting the default consent state, so deferred loading removes a
 * render-blocking parser pause while preserving that ordering.
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
  // Module: system palette
  // OneSliders has two live palettes:
  //   - Harmonized for light system mode
  //   - Night for dark system mode
  // The old temporary palette picker UI is intentionally gone. QA query
  // params/localStorage are ignored so production always follows the device.
  // ====================================================================
  (function initSystemPalette() {
    var palettes = {
      harmonized: 'assets/css/palettes/oneslider-palette-harmonized.css',
      night: 'assets/css/palettes/oneslider-palette-night.css'
    };
    var media = null;

    function desiredPalette() {
      return media && media.matches ? 'night' : 'harmonized';
    }

    function removeToolbar() {
      var toolbar = document.getElementById('os-palette-toolbar');
      if (toolbar && toolbar.parentNode) toolbar.parentNode.removeChild(toolbar);
      var style = document.getElementById('os-palette-toolbar-style');
      if (style && style.parentNode) style.parentNode.removeChild(style);
    }

    function setPalette(name) {
      if (!palettes[name]) name = 'harmonized';
      removeToolbar();
      var href = rootHref() + palettes[name] + '?v=semantic-sport-20260610';
      var link = document.getElementById('os-palette-preview-css') || document.createElement('link');
      link.id = 'os-palette-preview-css';
      link.rel = 'stylesheet';
      link.href = href;
      (document.head || document.documentElement).appendChild(link);
      OneSlider.palettePreview = name;
      OneSlider.paletteMode = name === 'night' ? 'dark' : 'light';
      return name;
    }

    function applySystemPalette() {
      return setPalette(desiredPalette());
    }

    try {
      localStorage.removeItem('os_palette_preview');
    } catch (e) { /* localStorage may be blocked */ }

    try {
      media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    } catch (e) {
      media = null;
    }

    applySystemPalette();
    if (media) {
      if (media.addEventListener) media.addEventListener('change', applySystemPalette);
      else if (media.addListener) media.addListener(applySystemPalette);
    }

    OneSlider.setPalettePreview = applySystemPalette;
    OneSlider.availablePalettePreviews = Object.keys(palettes);
  })();

  // ====================================================================
  // Module: categoryIdentity
  // Adds a central category marker from the URL so old topic pages with
  // inline CSS still use the same semantic colour as their parent category.
  // ====================================================================
  OneSlider.register('categoryIdentity', function () {
    var match = (window.location.pathname || '').match(/\/content\/categories\/([^/]+)(?:\/|\.html|$)/i);
    if (!match) return;
    var category = match[1].toLowerCase();
    var known = {
      festival: true,
      sport: true,
      music: true,
      climate: true,
      food: true,
      'food-and-drinks': true,
      drinks: true,
      technology: true,
      wellness: true,
      culture: true,
      nature: true
    };
    if (!known[category]) return;
    document.body.setAttribute('data-os-category', category);
    if (!document.body.getAttribute('data-cat')) {
      document.body.setAttribute('data-cat', category);
    }
  });

  function isHomePage() {
    var p = window.location.pathname || '';
    return p === '/' || /\/index\.html$/i.test(p) && !/^\/content\//i.test(p);
  }

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
  // Module: cityLocalTime
  // Keeps city page local-time cards alive from their data-time-zone attr.
  // ====================================================================
  OneSlider.register('cityLocalTime', function () {
    var cards = document.querySelectorAll('[data-local-time][data-time-zone]');
    if (!cards.length || !window.Intl || !Intl.DateTimeFormat) return;

    function updateCard(card) {
      var zone = card.getAttribute('data-time-zone');
      var value = card.querySelector('[data-local-time-value]');
      if (!zone || !value) return;
      try {
        value.textContent = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: zone
        }).format(new Date());
      } catch (e) {
        value.textContent = '--:--';
      }
    }

    function updateAll() {
      Array.prototype.forEach.call(cards, updateCard);
    }

    updateAll();
    window.setInterval(updateAll, 30000);
  });

  // ====================================================================
  // Module: cityWeatherStrip
  // Hydrates city page weather strips from Open-Meteo using data attrs.
  // ====================================================================
  OneSlider.register('cityWeatherStrip', function () {
    var strips = document.querySelectorAll('[data-weather-strip][data-weather-dynamic]');
    if (!strips.length || !window.fetch) return;

    function weatherLabel(code) {
      code = Number(code);
      if (code === 0) return 'Clear';
      if (code === 1 || code === 2) return 'Partly cloudy';
      if (code === 3) return 'Cloudy';
      if (code === 45 || code === 48) return 'Fog';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
      if (code >= 71 && code <= 77) return 'Snow';
      if (code >= 95) return 'Storm';
      return 'Forecast';
    }

    function weatherIcon(code) {
      code = Number(code);
      if (code === 0) return 'sun';
      if (code === 1 || code === 2) return 'partly';
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
      return 'partly';
    }

    function dayLabel(value) {
      var date = new Date(String(value) + 'T12:00:00');
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date);
    }

    function temp(value) {
      var number = Number(value);
      if (!Number.isFinite(number)) return 'TBC';
      return Math.round(number) + '°';
    }

    function render(strip, daily) {
      var host = strip.querySelector('.stay-weather-days');
      if (!host || !daily || !daily.time || !daily.time.length) return;
      var parts = [];
      for (var i = 0; i < Math.min(4, daily.time.length); i += 1) {
        var code = daily.weather_code && daily.weather_code[i];
        parts.push(
          '<article class="stay-weather-tile">' +
            '<strong>' + dayLabel(daily.time[i]) + '</strong>' +
            '<div class="stay-weather-reading">' +
              '<span class="weather-icon weather-icon--' + weatherIcon(code) + '" aria-hidden="true"></span>' +
              '<span class="stay-weather-temp">' + temp(daily.temperature_2m_max && daily.temperature_2m_max[i]) + '</span>' +
            '</div>' +
            '<span>' + weatherLabel(code) + '</span>' +
          '</article>'
        );
      }
      parts.push('<span class="stay-weather-more" title="4-day forecast">4d</span>');
      host.innerHTML = parts.join('');
      strip.setAttribute('data-weather-loaded', 'true');
    }

    function fail(strip) {
      var host = strip.querySelector('.stay-weather-days');
      if (!host) return;
      host.innerHTML = '<article class="stay-weather-tile"><strong>Weather</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--partly" aria-hidden="true"></span><span class="stay-weather-temp">TBC</span></div><span>Forecast unavailable</span></article>';
      strip.setAttribute('data-weather-loaded', 'error');
    }

    Array.prototype.forEach.call(strips, function (strip) {
      if (strip.getAttribute('data-weather-loaded')) return;
      var lat = Number(strip.getAttribute('data-weather-lat'));
      var lon = Number(strip.getAttribute('data-weather-lon'));
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        fail(strip);
        return;
      }
      strip.setAttribute('data-weather-loaded', 'loading');
      var url = 'https://api.open-meteo.com/v1/forecast' +
        '?latitude=' + encodeURIComponent(lat) +
        '&longitude=' + encodeURIComponent(lon) +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
        '&forecast_days=4&temperature_unit=celsius&timezone=auto';
      fetch(url, { cache: 'no-store' })
        .then(function (response) {
          if (!response.ok) throw new Error('weather response ' + response.status);
          return response.json();
        })
        .then(function (data) { render(strip, data.daily); })
        .catch(function () { fail(strip); });
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
    if (document.body.classList.contains('event-page')) return;
    var opt = document.querySelector('meta[name="os-ios-nav"]');
    if ((opt && opt.content === 'off') ||
        document.body.getAttribute('data-os-ios-nav') === 'off') {
      return;
    }
    var root = OneSlider.rootHref();

    function ensureIosNavStyle() {
      if (document.getElementById('os-ios-nav-runtime-style')) return;
      var style = document.createElement('style');
      style.id = 'os-ios-nav-runtime-style';
      style.textContent =
        '@media (max-width:620px){' +
          'body.os-has-ios-nav.topic-page nav.top-menu,' +
          'body.os-has-ios-nav.food-topic-page nav.top-menu,' +
          'body.os-has-ios-nav.food-layout-page nav.top-menu,' +
          'body.os-has-ios-nav.country-onepage nav.top-menu,' +
          'body.os-has-ios-nav.event-page nav.top-menu,' +
          'body.os-has-ios-nav.event-page nav.event-nav{display:none!important}' +
          'body.os-has-ios-nav.topic-page .ios-nav,' +
          'body.os-has-ios-nav.food-topic-page .ios-nav,' +
          'body.os-has-ios-nav.food-layout-page .ios-nav,' +
          'body.os-has-ios-nav.country-onepage .ios-nav,' +
          'body.os-has-ios-nav.event-page .ios-nav{display:grid!important}' +
          'body.os-has-ios-nav .ios-title{' +
            'margin:0!important;' +
            'color:var(--ink,color-mix(in srgb, var(--os-scrim) 58%, var(--os-transparent)))!important;' +
            'font-size:17px!important;' +
            'font-weight:600!important;' +
            'line-height:1!important;' +
            'letter-spacing:0!important;' +
            'white-space:nowrap!important;' +
            'overflow:hidden!important;' +
            'text-overflow:ellipsis!important;' +
            'max-width:34vw!important;' +
            'text-align:center!important' +
          '}' +
          'body.os-has-ios-nav .ios-back{font-size:17px!important;line-height:1!important}' +
        '}' +
        '@media (max-width:620px),(max-height:760px){' +
          'body.os-has-ios-nav.event-page nav.event-nav,' +
          'body.os-has-ios-nav.event-page nav.top-menu{display:none!important}' +
          'body.os-has-ios-nav.event-page .ios-nav{display:grid!important}' +
          'body.os-has-ios-nav.event-page .ios-back{display:inline-flex!important}' +
          'body.os-has-ios-nav.event-page .ios-sheet:not([hidden]){display:block!important}' +
        '}';
      (document.head || document.documentElement).appendChild(style);
    }

    function titleCaseSlug(value) {
      var special = {
        usa: 'USA',
        uk: 'UK',
        uae: 'UAE'
      };
      return String(value || '')
        .replace(/\.html?$/i, '')
        .replace(/-+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(function (word) {
          var lower = word.toLowerCase();
          return special[lower] || lower.replace(/^\w/, function (c) { return c.toUpperCase(); });
        })
        .join(' ');
    }

    function pagePathParts() {
      return (window.location.pathname || '')
        .replace(/\\/g, '/')
        .replace(/\/+$/, '/')
        .split('/')
        .filter(Boolean);
    }

    function centralHref(path) {
      return root + String(path || '').replace(/^\/+/, '');
    }

    function fromUrlHierarchy() {
      var parts = pagePathParts();
      var contentIndex = parts.indexOf('content');
      if (contentIndex < 0) return null;

      var section = parts[contentIndex + 1];
      var tail = parts.slice(contentIndex + 2);

      if (section === 'categories') {
        var eventIndex = tail.indexOf('events');
        if (eventIndex > 0) {
          var topicParts = tail.slice(0, eventIndex);
          var topicSlug = topicParts[topicParts.length - 1];
          return {
            href: centralHref('content/categories/' + topicParts.join('/') + '.html'),
            label: titleCaseSlug(topicSlug)
          };
        }

        if (tail.length >= 2 && /\.html?$/i.test(tail[tail.length - 1])) {
          var categorySlug = tail[0];
          return {
            href: centralHref('content/categories/' + categorySlug + '/index.html'),
            label: titleCaseSlug(categorySlug)
          };
        }

        if (tail.length >= 2 && tail[tail.length - 1].toLowerCase() === 'index.html') {
          return {
            href: centralHref('content/categories/index.html'),
            label: 'Categories'
          };
        }
      }

      if (section === 'locations') {
        if (tail.length >= 3 && /\.html?$/i.test(tail[tail.length - 1])) {
          var countryParts = tail.slice(0, -1);
          var countrySlug = countryParts[countryParts.length - 1];
          return {
            href: centralHref('content/locations/' + countryParts.join('/') + '/index.html'),
            label: titleCaseSlug(countrySlug)
          };
        }

        if (tail.length >= 3 && tail[tail.length - 1].toLowerCase() === 'index.html') {
          var continentParts = tail.slice(0, -2);
          var continentSlug = continentParts[continentParts.length - 1];
          return {
            href: centralHref('content/locations/' + continentParts.join('/') + '/index.html'),
            label: titleCaseSlug(continentSlug)
          };
        }

        if (tail.length >= 2 && tail[tail.length - 1].toLowerCase() === 'index.html') {
          return {
            href: centralHref('content/locations/index.html'),
            label: 'World'
          };
        }
      }

      return null;
    }

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
    //   5. URL-pattern derivation for Topic / Event / Location views
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
      var hierarchical = fromUrlHierarchy();
      if (hierarchical) return hierarchical;
      return { href: root || './', label: 'Home' };
    }

    App.deriveMobileBack = deriveBack;

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

    function iconLink(href, label, iconKey) {
      var a = document.createElement('a');
      a.className = 'ios-action';
      a.href = href;
      a.setAttribute('aria-label', label);
      a.appendChild(svg(ICONS[iconKey]));
      return a;
    }

    var actions = document.createElement('div');
    actions.className = 'ios-actions';
    actions.appendChild(iconLink(root + 'content/events/index.html', 'Events', 'events'));
    actions.appendChild(iconLink(root + 'content/locations/index.html', 'Locations', 'world'));
    actions.appendChild(iconLink(root + 'content/categories/index.html', 'Categories', 'grid'));
    actions.appendChild(moreBtn);

    nav.appendChild(backLink);
    nav.appendChild(titleEl);
    nav.appendChild(actions);

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

    function configuredItems() {
      var meta = document.querySelector('meta[name="os-nav-items"]');
      var raw = (document.body.getAttribute('data-os-nav-items') ||
        (meta && meta.content) || '').trim();
      if (!raw || raw === 'default') {
        return null;
      }
      var map = {};
      raw.split(',').forEach(function (itemName) {
        itemName = itemName.trim().toLowerCase();
        if (itemName) map[itemName] = true;
      });
      return map;
    }

    var visibleNavItems = configuredItems();
    function wantsNavItem(name) {
      return !visibleNavItems || !!visibleNavItems[name];
    }

    panel.appendChild(heading('Browse'));
    var browseItems = [];
    if (wantsNavItem('home')) browseItems.push(item(root || './', 'Home', 'home', true));
    if (wantsNavItem('this-week')) browseItems.push(item(root + 'content/events/this-week.html', 'This week', 'events', true));
    if (wantsNavItem('events')) browseItems.push(item(root + 'content/events/index.html', 'All events', 'events', true));
    if (wantsNavItem('locations')) browseItems.push(item(root + 'content/locations/index.html', 'World', 'world', true));
    if (wantsNavItem('categories')) browseItems.push(item(root + 'content/categories/index.html', 'Categories', 'grid', true));
    if (browseItems.length) panel.appendChild(group(browseItems));

    panel.appendChild(heading('Settings'));
    var cookieItem = item('#', 'Cookie settings', 'cookie', true);
    cookieItem.setAttribute('data-cookie-settings', '');
    var settingsItems = [];
    if (wantsNavItem('cookies')) settingsItems.push(cookieItem);
    if (wantsNavItem('privacy')) settingsItems.push(item(root + 'privacy.html', 'Privacy', 'doc', true));
    if (wantsNavItem('terms')) settingsItems.push(item(root + 'terms.html', 'Terms', 'doc', true));
    if (wantsNavItem('contact')) settingsItems.push(item('mailto:hello@one-sliders.com', 'Contact', 'mail', true));
    if (settingsItems.length) panel.appendChild(group(settingsItems));

    var done = document.createElement('button');
    done.type = 'button';
    done.className = 'ios-sheet__done';
    done.setAttribute('data-sheet-close', '');
    done.textContent = 'Done';
    panel.appendChild(done);

    // Insert nav right after <body> opening, sheet at end of <body>
    document.body.classList.add('os-has-ios-nav');
    ensureIosNavStyle();
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
    var ownerText = ' OneSliders &middot;';

    function ensureFooterStyle() {
      if (document.getElementById('os-footer-runtime-style')) return;
      var style = document.createElement('style');
      style.id = 'os-footer-runtime-style';
      style.textContent =
        'body.os-has-site-footer>footer.os-footer{' +
          'display:block!important;' +
          'visibility:visible!important;' +
          'position:sticky!important;' +
          'bottom:0!important;' +
          'margin-top:auto!important;' +
          'z-index:60!important;' +
          'flex:0 0 auto!important;' +
          'background:var(--os-footer-bg,var(--os-surface,#fff))!important;' +
          'color:var(--os-footer-ink,var(--os-muted,#5a6672))!important;' +
          'border-top:.5px solid var(--os-footer-line,color-mix(in srgb,var(--os-line,rgba(18,32,46,.12)) 62%,var(--os-transparent,transparent)))!important' +
        '}' +
        'body.os-has-site-footer>footer.os-footer a{color:inherit!important;border-bottom-color:transparent!important}' +
        '@media(min-width:761px){' +
          'body.os-has-site-footer.topic-onepage>footer.os-footer,' +
          'body.os-has-site-footer.event-page>footer.os-footer{' +
            'position:fixed!important;' +
            'left:0!important;' +
            'right:0!important;' +
            'bottom:0!important;' +
            'margin-top:0!important' +
          '}' +
        '}' +
        '@media(max-width:760px){' +
          'body.os-has-site-footer{min-height:100svh!important;display:flex!important;flex-direction:column!important}' +
          'body.os-has-site-footer>main{flex:1 0 auto}' +
          'body.os-has-site-footer>footer.os-footer{display:block!important;position:sticky!important;bottom:0!important}' +
          'body.os-has-site-footer.topic-onepage>footer.os-footer,' +
          'body.os-has-site-footer.event-page>footer.os-footer{' +
            'position:fixed!important;' +
            'left:0!important;' +
            'right:0!important;' +
            'bottom:0!important;' +
            'margin-top:0!important' +
          '}' +
        '}';
      (document.head || document.documentElement).appendChild(style);
    }

    // Minimal footer. Terms, contact email and cookie-settings access live
    // in the iOS sheet "Settings" section on mobile, and the floating
    // cookie pill (auto-injected by the brand module) on desktop.
    var content =
      '<p>&copy; ' + year + ownerText + ' ' +
      '<a href="' + root + 'privacy.html">Privacy</a></p>';

    var footerSelector = 'footer.os-footer, footer.site-footer, footer.site-foot, footer.site, footer.event-footer, footer.footer';
    var existing = document.querySelector(footerSelector) || document.querySelector('footer');
    if (existing) {
      existing.innerHTML = content;
      if (!existing.classList.contains('os-footer')) {
        existing.classList.add('os-footer');
      }
      if (document.body.classList.contains('event-page')) {
        existing.classList.add('event-footer');
      }
      document.querySelectorAll('footer').forEach(function (footer) {
        if (footer !== existing) footer.remove();
      });
      if (existing.parentNode === document.body && existing !== document.body.lastElementChild) {
        document.body.appendChild(existing);
      }
      document.body.classList.add('os-has-site-footer');
      ensureFooterStyle();
      return;
    }

    // No footer yet — append one (with default os-footer styling from CSS)
    var f = document.createElement('footer');
    f.className = document.body.classList.contains('event-page')
      ? 'os-footer event-footer'
      : 'os-footer site-footer';
    f.innerHTML = content;
    document.body.appendChild(f);
    document.body.classList.add('os-has-site-footer');
    ensureFooterStyle();
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

})();  // end IIFE

// Homepage featured carousel
(function () {
  var slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  var dots = document.querySelectorAll('.carousel-dots .dot');
  var current = 0;
  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }
  var prevBtn = document.querySelector('[aria-label="Previous featured guide"]');
  var nextBtn = document.querySelector('[aria-label="Next featured guide"]');
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
  Array.prototype.forEach.call(dots, function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });
}());
