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
      a.setAttribute('aria-label', 'Home');

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
      if (nav.classList.contains('event-nav') && document.body.classList.contains('event-page')) continue;
      if (nav.getAttribute('data-os-brand') === 'off') continue;
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

  // ====================================================================
  // Add new modules below. Template:
  //
  //   OneSlider.register('my-feature', function (App) {
  //     // Setup here. App.on/App.emit available for cross-module events.
  //     // E.g. wait for consent decision:
  //     // App.on('consent:granted', function (state) { if (state.ads) { ... } });
  //   });
  // ====================================================================

  OneSlider.register('recipe-servings', function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-recipe-servings]'));
    if (!cards.length) return;

    function clamp(value, min, max) {
      if (!isFinite(value)) return min;
      return Math.max(min, Math.min(max, value));
    }

    function pluralize(value, singular, plural) {
      return Math.abs(value - 1) < 0.001 ? singular : plural;
    }

    function fractionText(value) {
      var whole = Math.floor(value);
      var fraction = value - whole;
      var options = [
        { n: 0, t: '' },
        { n: 0.25, t: '1/4' },
        { n: 0.333, t: '1/3' },
        { n: 0.5, t: '1/2' },
        { n: 0.667, t: '2/3' },
        { n: 0.75, t: '3/4' }
      ];
      var best = options.reduce(function (winner, item) {
        return Math.abs(item.n - fraction) < Math.abs(winner.n - fraction) ? item : winner;
      }, options[0]);

      if (best.n === 0 && fraction > 0.875) return String(whole + 1);
      if (best.n === 0) return String(whole);
      if (!whole) return best.t;
      return whole + ' ' + best.t;
    }

    function decimalText(value) {
      return (Math.round(value * 100) / 100).toFixed(2).replace(/\.?0+$/, '');
    }

    function numberText(value, unit, round) {
      if (round) return String(Math.round(value));
      if (unit === 'g' || unit === 'ml') return String(Math.round(value));
      return fractionText(value);
    }

    function formatQuantity(node, servings, baseServings, volumeUnit) {
      var base = Number(node.getAttribute('data-base'));
      var unit = node.getAttribute('data-unit') || '';
      if (!isFinite(base)) return;
      var amount = base * servings / baseServings;
      var rounded = node.hasAttribute('data-round');
      var hasVolumeBase = node.hasAttribute('data-volume-base');
      var volumeBase = hasVolumeBase ? Number(node.getAttribute('data-volume-base')) : 0;

      if (unit === 'ml' || hasVolumeBase) {
        var volumeAmount = (hasVolumeBase && isFinite(volumeBase) ? volumeBase : base) * servings / baseServings;
        node.textContent = volumeUnit === 'dl'
          ? decimalText(volumeAmount / 100) + ' dl'
          : String(Math.round(volumeAmount)) + ' ml';
        return;
      }

      var text = numberText(amount, unit, rounded);

      if (unit === 'egg') {
        var singular = node.getAttribute('data-singular') || 'egg';
        var plural = node.getAttribute('data-plural') || 'eggs';
        node.textContent = text + ' ' + pluralize(amount, singular, plural);
        return;
      }

      node.textContent = unit ? text + ' ' + unit : text;
    }

    function peopleLabel(count) {
      return count + ' ' + (count === 1 ? 'person' : 'people');
    }

    cards.forEach(function (card) {
      var input = card.querySelector('[data-recipe-servings-input]');
      if (!input) return;

      var baseServings = Number(card.getAttribute('data-recipe-base-servings')) || Number(input.value) || 1;
      var quantities = Array.prototype.slice.call(card.querySelectorAll('[data-recipe-quantity]'));
      var label = card.querySelector('[data-recipe-servings-label]');
      var volumeSelect = card.querySelector('[data-recipe-volume-unit]');
      var baseLabel = card.querySelector('[data-recipe-base-label]');
      var methodNote = document.querySelector('[data-recipe-method-note]');

      if (baseLabel) baseLabel.textContent = peopleLabel(baseServings);

      function render() {
        var min = Number(input.getAttribute('min')) || 1;
        var max = Number(input.getAttribute('max')) || 24;
        var value = clamp(Math.round(Number(input.value) || baseServings), min, max);
        input.value = value;
        var volumeUnit = volumeSelect ? volumeSelect.value : 'ml';

        quantities.forEach(function (node) {
          formatQuantity(node, value, baseServings, volumeUnit);
        });

        if (label) label.textContent = peopleLabel(value);
        if (methodNote) {
          methodNote.textContent = 'Amounts are set for ' + peopleLabel(value) + '. Bake time stays about the same.';
        }
      }

      input.addEventListener('input', render);
      input.addEventListener('change', render);
      if (volumeSelect) volumeSelect.addEventListener('change', render);
      render();
    });
  });

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
    function cleanPanelLabel(panel) {
      var heading = panel && panel.querySelector('h3');
      if (!heading) return '';
      var clone = heading.cloneNode(true);
      Array.prototype.slice.call(clone.querySelectorAll('span')).forEach(function (span) {
        span.parentNode.removeChild(span);
      });
      return clone.textContent.replace(/\s+Europe\s*$/, '').replace(/\s+/g, ' ').trim();
    }

    function prepareCarouselLists() {
      var tracks = Array.prototype.slice.call(document.querySelectorAll(
        '.continent-group-list:not([data-continent-carousel-track])'
      ));
      tracks.forEach(function (track) {
        var panels = Array.prototype.slice.call(track.querySelectorAll(':scope > .continent-group-panel'));
        if (panels.length <= 1) return;

        var carousel = document.createElement('div');
        carousel.className = 'continent-carousel';
        carousel.setAttribute('data-continent-carousel', '');

        var controls = document.createElement('nav');
        controls.className = 'continent-carousel__controls';
        controls.setAttribute('aria-label', track.getAttribute('aria-label') || 'Country group carousel');

        var prev = document.createElement('button');
        prev.className = 'continent-carousel__nav-button continent-carousel__nav-button--prev';
        prev.type = 'button';
        prev.setAttribute('data-continent-carousel-prev', '');
        prev.setAttribute('aria-label', 'Previous region');

        var current = document.createElement('span');
        current.className = 'continent-carousel__nav-button continent-carousel__nav-button--current is-active';
        current.setAttribute('data-continent-carousel-current', '');
        current.setAttribute('aria-current', 'true');
        current.setAttribute('aria-live', 'polite');
        current.textContent = cleanPanelLabel(panels[0]);

        var next = document.createElement('button');
        next.className = 'continent-carousel__nav-button continent-carousel__nav-button--next';
        next.type = 'button';
        next.setAttribute('data-continent-carousel-next', '');
        next.setAttribute('aria-label', 'Next region');

        controls.appendChild(prev);
        controls.appendChild(current);
        controls.appendChild(next);

        track.parentNode.insertBefore(carousel, track);
        carousel.appendChild(controls);
        carousel.appendChild(track);
        track.setAttribute('data-continent-carousel-track', '');
        if (!track.hasAttribute('tabindex')) track.setAttribute('tabindex', '0');
      });
    }

    function upgradeCountryCards(carousel) {
      var chips = Array.prototype.slice.call(carousel.querySelectorAll(
        '.country-chip:not(.country-chip--with-hero)'
      ));
      chips.forEach(function (chip) {
        if (chip.closest('[data-country-card-skip]')) return;
        var href = chip.getAttribute('href') || '';
        var base = href.replace(/(?:index\.html)?(?:[#?].*)?$/, '');
        if (base && base.charAt(base.length - 1) !== '/') base += '/';
        var parts = base.split('/').filter(Boolean);
        var slug = parts[parts.length - 1];
        if (!slug) return;

        var label = chip.textContent.replace(/\s+/g, ' ').trim();
        var hero = document.createElement('span');
        hero.className = 'country-chip__hero';
        hero.setAttribute('aria-hidden', 'true');

        var heroImage = document.createElement('img');
        heroImage.src = base + 'img/' + slug + '-hero.png';
        heroImage.alt = '';
        heroImage.loading = 'lazy';
        hero.appendChild(heroImage);

        var labelWrap = document.createElement('span');
        labelWrap.className = 'country-chip__label';

        var flag = document.createElement('img');
        flag.className = 'country-chip__flag';
        flag.src = base + 'img/flag.svg';
        flag.alt = '';

        var name = document.createElement('span');
        name.className = 'country-chip__name';
        name.textContent = label;

        labelWrap.appendChild(flag);
        labelWrap.appendChild(name);

        chip.classList.add('country-chip--with-hero');
        chip.textContent = '';
        chip.appendChild(hero);
        chip.appendChild(labelWrap);
      });
    }

    function ensureSideButtons(carousel) {
      if (carousel.querySelector('[data-continent-carousel-side-prev]')) return;

      var sidePrev = document.createElement('button');
      sidePrev.className = 'continent-carousel__side-button continent-carousel__side-button--prev';
      sidePrev.type = 'button';
      sidePrev.setAttribute('data-continent-carousel-side-prev', '');
      sidePrev.setAttribute('aria-label', 'Previous region');

      var sideNext = document.createElement('button');
      sideNext.className = 'continent-carousel__side-button continent-carousel__side-button--next';
      sideNext.type = 'button';
      sideNext.setAttribute('data-continent-carousel-side-next', '');
      sideNext.setAttribute('aria-label', 'Next region');

      carousel.appendChild(sidePrev);
      carousel.appendChild(sideNext);
    }

    function ensureControlButtons(carousel, panels) {
      var controls = carousel.querySelector('.continent-carousel__controls');
      if (!controls) {
        controls = document.createElement('nav');
        controls.className = 'continent-carousel__controls';
        controls.setAttribute('aria-label', 'Country group carousel');
        carousel.insertBefore(controls, carousel.firstChild);
      }

      controls.textContent = '';
      panels.forEach(function (panel, index) {
        var label = cleanPanelLabel(panel);
        var button = document.createElement('button');
        button.className = 'continent-carousel__nav-button';
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('data-continent-carousel-tab', String(index));
        button.setAttribute('aria-label', label);
        controls.appendChild(button);
      });
    }

    prepareCarouselLists();

    var carousels = Array.prototype.slice.call(document.querySelectorAll('[data-continent-carousel]'));
    if (!carousels.length) return;

    carousels.forEach(function (carousel) {
      upgradeCountryCards(carousel);
      ensureSideButtons(carousel);

      var track = carousel.querySelector('[data-continent-carousel-track]');
      if (!track) return;

      var panels = Array.prototype.slice.call(track.querySelectorAll('.continent-group-panel'));
      ensureControlButtons(carousel, panels);

      var tabButtons = Array.prototype.slice.call(carousel.querySelectorAll('[data-continent-carousel-tab]'));
      var sidePrev = carousel.querySelector('[data-continent-carousel-side-prev]');
      var sideNext = carousel.querySelector('[data-continent-carousel-side-next]');
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
        return cleanPanelLabel(panels[clampIndex(index)]);
      }

      function syncTrackHeight() {
        var maxHeight = 0;
        track.style.height = 'auto';
        panels.forEach(function (panel) {
          panel.style.minHeight = '';
        });
        panels.forEach(function (panel) {
          maxHeight = Math.max(maxHeight, panel.offsetHeight);
        });
        if (!maxHeight) return;
        track.style.height = maxHeight + 'px';
        panels.forEach(function (panel) {
          panel.style.minHeight = maxHeight + 'px';
        });
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
        syncTrackHeight();
        updateActiveState();
        tabButtons.forEach(function (button, index) {
          var isActive = index === activeIndex;
          button.classList.toggle('continent-carousel__nav-button--current', isActive);
          button.classList.toggle('is-active', isActive);
          if (isActive) {
            button.setAttribute('aria-current', 'true');
          } else {
            button.removeAttribute('aria-current');
          }
        });

        var prevLabel = activeIndex > 0 ? labelFor(activeIndex - 1) : '';
        if (sidePrev) {
          sidePrev.disabled = !prevLabel;
          sidePrev.setAttribute('aria-label', prevLabel ? 'Previous region: ' + prevLabel : 'No previous region');
        }

        var nextLabel = activeIndex < panels.length - 1 ? labelFor(activeIndex + 1) : '';
        if (sideNext) {
          sideNext.disabled = !nextLabel;
          sideNext.setAttribute('aria-label', nextLabel ? 'Next region: ' + nextLabel : 'No next region');
        }
      }

      function goTo(index) {
        var targetIndex = clampIndex(index);
        var target = panels[targetIndex];
        if (!target) return;
        syncTrackHeight();
        var left = target.offsetLeft - track.offsetLeft;
        if (typeof track.scrollTo === 'function') {
          track.scrollTo({ left: left, behavior: 'smooth' });
        } else {
          track.scrollLeft = left;
        }
      }

      tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          goTo(parseInt(button.getAttribute('data-continent-carousel-tab'), 10) || 0);
        });
      });
      if (sidePrev) {
        sidePrev.addEventListener('click', function () {
          goTo(activeIndex - 1);
        });
      }

      if (sideNext) {
        sideNext.addEventListener('click', function () {
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
        syncTrackHeight();
        update();
      });
      window.addEventListener('load', syncTrackHeight);
      panels.forEach(function (panel) {
        Array.prototype.slice.call(panel.querySelectorAll('img')).forEach(function (image) {
          if (!image.complete) image.addEventListener('load', syncTrackHeight, { once: true });
        });
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
      var overview = document.querySelector('.recipe-install-overview');
      if (!overview) {
        overview = document.createElement('div');
        overview.className = 'recipe-install-overview';
        overview.hidden = true;
        overview.innerHTML =
          '<div class="recipe-install-guide__backdrop" data-recipe-install-close></div>' +
          '<section class="recipe-install-guide__panel" role="dialog" aria-modal="true" aria-labelledby="recipe-install-title">' +
            '<button class="recipe-install-guide__close" type="button" data-recipe-install-close aria-label="Close">Close</button>' +
            '<h2 id="recipe-install-title"></h2>' +
            '<ol></ol>' +
            '<p class="recipe-install-guide__note" hidden></p>' +
            '<textarea class="recipe-install-guide__copy" readonly hidden></textarea>' +
            '<div class="recipe-install-guide__actions" hidden></div>' +
          '</section>';
        document.body.appendChild(overview);
        overview.addEventListener('click', function (event) {
          if (event.target.closest('[data-recipe-install-close]')) {
            overview.hidden = true;
          }
        });
        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape') overview.hidden = true;
        });
      }
      return overview;
    }

    function openRecipeGuide(options) {
      var overview = ensureRecipeGuide();
      var titleEl = overview.querySelector('h2');
      var list = overview.querySelector('ol');
      var note = overview.querySelector('.recipe-install-guide__note');
      var copyBox = overview.querySelector('.recipe-install-guide__copy');
      var actions = overview.querySelector('.recipe-install-guide__actions');

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
        link.textContent = options.sourceText || 'Apple steps';
        actions.appendChild(link);
      }

      overview.hidden = false;
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
        sourceText: 'Apple Reminders Groceries steps'
      });

      setStatus(status, copied ?
        'Ingredients copied for Reminders.' :
        'Copy the ingredients from the list, then add them to a Groceries list.');
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
        window.location.href = '/shopping-list/';
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

  // ====================================================================
  // Module: oscarsExplorer
  // JSON-powered single-page explorer for /culture/awards/events/oscars.html.
  // All award data comes from files declared on [data-oscars-explorer].
  // ====================================================================
  OneSlider.register('oscarsExplorer', function () {
    var root = document.querySelector('[data-oscars-explorer]');
    if (!root || !window.fetch) return;

    function listFromAttr(name) {
      return (root.getAttribute(name) || '')
        .split(',')
        .map(function (item) { return item.trim(); })
        .filter(Boolean)
        .filter(function (item) { return item.toLowerCase().indexOf('oscars') !== -1; });
    }

    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function displayCategory(category) {
      var label = String(category || '').replace(/^Best\s+/i, '');
      return label === 'Picture' ? 'Film' : label;
    }

    function categoryIconType(category) {
      var name = String(category || '').toLowerCase();
      if (name.indexOf('song') !== -1 || name.indexOf('score') !== -1) return 'music';
      if (name.indexOf('sound') !== -1) return 'sound';
      if (name.indexOf('actor') !== -1 || name.indexOf('actress') !== -1) return 'acting';
      if (name.indexOf('screenplay') !== -1) return 'writing';
      if (name.indexOf('cinematography') !== -1) return 'camera';
      if (name.indexOf('editing') !== -1) return 'editing';
      if (name.indexOf('design') !== -1) return 'design';
      if (name.indexOf('costume') !== -1) return 'costume';
      if (name.indexOf('makeup') !== -1 || name.indexOf('hairstyling') !== -1) return 'makeup';
      if (name.indexOf('visual effects') !== -1) return 'effects';
      if (name.indexOf('international') !== -1) return 'world';
      if (name.indexOf('animated') !== -1) return 'animation';
      if (name.indexOf('documentary') !== -1) return 'documentary';
      if (name.indexOf('short') !== -1) return 'short';
      if (name.indexOf('casting') !== -1) return 'casting';
      if (name.indexOf('director') !== -1) return 'director';
      return 'picture';
    }

    function fetchJson(url) {
      return fetch(url, { cache: 'no-cache' })
        .then(function (response) {
          if (!response.ok) throw new Error('Could not load ' + url);
          return response.json();
        })
        .then(function (json) {
          json.__src = url;
          return json;
        });
    }

    var decadeUrls = listFromAttr('data-oscars-decades');
    var statUrls = listFromAttr('data-oscars-stats');
    var recordUrls = listFromAttr('data-oscars-records');
    var els = {
      summary: root.querySelector('[data-oscars-summary]'),
      decades: root.querySelector('[data-oscars-decades-nav]'),
      years: root.querySelector('[data-oscars-years-nav]'),
      categoryPicker: root.querySelector('[data-oscars-category-picker]'),
      decadeMatrix: root.querySelector('[data-oscars-decade-matrix]'),
      stats: root.querySelector('[data-oscars-statistics]'),
      records: root.querySelector('[data-oscars-records-panel]'),
      tabs: root.querySelector('[data-oscars-tabs]'),
      matrixTitle: root.querySelector('[data-oscars-matrix-title]'),
      matrixNote: root.querySelector('[data-oscars-matrix-note]'),
      activeRange: root.querySelector('[data-oscars-active-range]'),
      categoryCount: root.querySelector('[data-oscars-category-count]')
    };
    var state = { decade: '', year: 0, tab: 'history', categories: [] };
    var decades = [];
    var stats = [];
    var records = [];

    function awardsForYear(yearItem) {
      return yearItem && Array.isArray(yearItem.awards) ? yearItem.awards : [];
    }

    function activeDecade() {
      return decades.filter(function (item) { return item.decade === state.decade; })[0] || decades[0];
    }

    function allYears(descending) {
      var rows = [];
      decades.forEach(function (decade) {
        (decade.years || []).forEach(function (year) {
          rows.push(year);
        });
      });
      rows.sort(function (a, b) {
        return descending ? Number(b.year) - Number(a.year) : Number(a.year) - Number(b.year);
      });
      return rows;
    }

    function allYearsRange() {
      var years = allYears(false).map(function (item) { return Number(item.year); }).filter(Boolean);
      if (!years.length) return 'Loading';
      return years[0] + '-' + years[years.length - 1];
    }

    function decadeStart(decade) {
      var match = String(decade && decade.decade ? decade.decade : decade || '').match(/(\d{4})/);
      return match ? Number(match[1]) : 0;
    }

    function decadeRange(decade) {
      var years = decade && Array.isArray(decade.years) ? decade.years.map(function (item) { return Number(item.year); }).filter(Boolean) : [];
      if (years.length) {
        years.sort(function (a, b) { return a - b; });
        return years[0] + '-' + years[years.length - 1];
      }
      var start = decadeStart(decade);
      return start ? start + '-' + (start + 9) : String(decade && decade.decade ? decade.decade : decade || '');
    }

    function decadeFullRange(decade) {
      var start = decadeStart(decade);
      return start ? start + '-' + (start + 9) : String(decade && decade.decade ? decade.decade : decade || '');
    }

    function decadeHash(decade) {
      return decadeRange(decade).toLowerCase();
    }

    function decadeFromHash() {
      var hash = decodeURIComponent((window.location.hash || '').replace(/^#/, '')).toLowerCase();
      if (!hash) return null;
      return decades.filter(function (decade) {
        return decadeHash(decade) === hash ||
          decadeFullRange(decade).toLowerCase() === hash ||
          String(decade.decade || '').toLowerCase() === hash;
      })[0] || null;
    }

    function yearFromHash() {
      var hash = decodeURIComponent((window.location.hash || '').replace(/^#/, '')).toLowerCase();
      var match = hash.match(/^year-(\d{4})$/) || hash.match(/^(\d{4})$/);
      return match ? Number(match[1]) : 0;
    }

    function decadeForYear(year) {
      return decades.filter(function (decade) {
        return (decade.years || []).some(function (item) { return Number(item.year) === Number(year); });
      })[0] || null;
    }

    function applyHashState() {
      var hashYear = yearFromHash();
      var hashDecade = hashYear ? decadeForYear(hashYear) : decadeFromHash();
      if (hashDecade) state.decade = hashDecade.decade;
      state.year = hashYear || 0;
      return Boolean(hashDecade || hashYear);
    }

    function setTab(name) {
      state.tab = name || 'history';
      root.querySelectorAll('[data-oscars-tab]').forEach(function (button) {
        button.setAttribute('aria-selected', button.getAttribute('data-oscars-tab') === state.tab ? 'true' : 'false');
      });
      root.querySelectorAll('[data-oscars-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-oscars-panel') !== state.tab;
      });
    }

    function bindStayModule() {
      root.querySelectorAll('[data-oscars-stay-module]').forEach(function (box) {
        var button = box.querySelector('.hotel-search__go');
        if (!button || button.__oscarsStayBound) return;
        button.__oscarsStayBound = true;
        button.addEventListener('click', function () {
          var value = function (name) {
            var field = box.querySelector('[name="' + name + '"]');
            return field ? field.value : '';
          };
          var area = box.querySelector('[name="hotel-area"]:checked');
          var params = new URLSearchParams();
          params.set('ss', (area ? area.value : 'Hollywood') + ', Los Angeles, United States');
          if (value('checkin')) params.set('checkin', value('checkin'));
          if (value('checkout')) params.set('checkout', value('checkout'));
          params.set('group_adults', value('adults') || '2');
          params.set('no_rooms', value('rooms') || '1');
          window.open('https://www.booking.com/searchresults.html?' + params.toString(), '_blank', 'noopener');
        });
      });
    }

    function renderSummary() {
      if (!els.summary) return;
      var years = 0;
      var cats = {};
      var rows = 0;
      decades.forEach(function (decade) {
        years += (decade.years || []).length;
        (decade.years || []).forEach(function (year) {
          awardsForYear(year).forEach(function (award) {
            rows += 1;
            cats[award.category] = true;
          });
        });
      });
      els.summary.innerHTML =
        '<div class="fact"><span>Next Oscars</span><strong>14 Mar 2027</strong></div>' +
        '<div class="fact"><span>Venue</span><strong>Dolby Theatre</strong></div>' +
        '<div class="fact"><span>Years loaded</span><strong>' + years + '</strong></div>' +
        '<div class="fact"><span>Categories</span><strong>' + Object.keys(cats).length + '</strong></div>';
    }

    function renderDecades() {
      if (!els.decades) return;
      els.decades.innerHTML = '';
    }

    function renderYears() {
      if (!els.years) return;
      var decade = activeDecade();
      var years = decade && Array.isArray(decade.years) ? decade.years.slice() : [];
      years.sort(function (a, b) { return Number(a.year) - Number(b.year); });
      els.years.innerHTML = years.map(function (year) {
        var active = Number(year.year) === Number(state.year);
        return '<a class="year-button' + (active ? ' is-active' : '') + '" href="#year-' + esc(year.year) + '" data-oscars-year="' + esc(year.year) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
          '<span class="year-button__year">' + esc(year.year) + '</span></a>';
      }).join('');
    }

    function renderDecadeMatrix() {
      var decade = activeDecade();
      var years = decade && Array.isArray(decade.years) ? decade.years.slice() : [];
      years.sort(function (a, b) { return Number(a.year) - Number(b.year); });
      if (els.matrixTitle) els.matrixTitle.textContent = decade ? 'Vinnare per år: ' + decadeRange(decade) : 'Vinnare per år';
      if (els.matrixNote) els.matrixNote.textContent = decade ? 'Kategorier som rader, år som kolumner.' : 'Välj ett decennium.';
      if (els.matrixTitle) els.matrixTitle.textContent = decade ? 'Pris per år: ' + decadeRange(decade) : 'Pris per år';
      if (els.matrixNote) els.matrixNote.textContent = 'Alla laddade kategorier visas som rader. Åren är kolumner.';
      if (els.activeRange) els.activeRange.textContent = decade ? decadeRange(decade) : 'Loading';
      if (els.matrixTitle) els.matrixTitle.textContent = decade ? 'Pris per år: ' + decadeRange(decade) : 'Pris per år';
      if (els.matrixNote) els.matrixNote.textContent = 'Alla laddade kategorier visas som rader. Åren är kolumner.';
      if (els.activeRange) els.activeRange.textContent = decade ? decadeRange(decade) : 'Loading';
      if (!els.decadeMatrix) return;
      var categories = [];
      years.forEach(function (year) {
        awardsForYear(year).forEach(function (award) {
          if (categories.indexOf(award.category) === -1) categories.push(award.category);
        });
      });
      if (els.categoryCount) els.categoryCount.textContent = categories.length + ' categories';
      var preferred = [
        'Best Picture',
        'Best Director',
        'Best Actor',
        'Best Actress',
        'Best Supporting Actor',
        'Best Supporting Actress',
        'Best Original Screenplay',
        'Best Adapted Screenplay',
        'Best Cinematography',
        'Best Film Editing',
        'Best Production Design',
        'Best Costume Design',
        'Best Makeup and Hairstyling',
        'Best Original Score',
        'Best Original Song',
        'Best Casting',
        'Best Sound',
        'Best Sound Editing',
        'Best Sound Mixing',
        'Best Visual Effects',
        'Best International Feature Film',
        'Best Animated Feature',
        'Best Documentary Feature',
        'Best Animated Short Film',
        'Best Live Action Short Film',
        'Best Documentary Short'
      ];
      categories.sort(function (a, b) {
        var ai = preferred.indexOf(a);
        var bi = preferred.indexOf(b);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return a.localeCompare(b);
      });
      var header = '<div class="oscars-matrix-row oscars-matrix-row--head">' +
        '<span>Resultat</span>' + categories.map(function (category) { return '<span>' + esc(category) + '</span>'; }).join('') +
        '</div>';
      var body = years.map(function (year) {
        var awards = awardsForYear(year);
        var byCategory = {};
        awards.forEach(function (award) { byCategory[award.category] = award; });
        // "Big winner" highlight: the film with the most wins in this year.
        // Real data only — if no clear lead, skip the highlight.
        var filmTally = {};
        awards.forEach(function (a) {
          if (a.film) filmTally[a.film] = (filmTally[a.film] || 0) + 1;
        });
        var bigWinner = '';
        var bigCount = 0;
        Object.keys(filmTally).forEach(function (f) {
          if (filmTally[f] > bigCount) { bigCount = filmTally[f]; bigWinner = f; }
        });
        var ceremonyLabel = year.ceremony
          ? ordinal(year.ceremony) + ' ceremony'
          : (awards.length ? awards.length + ' categories' : '');
        var highlight = (bigWinner && bigCount > 1)
          ? '<p class="oscars-year-highlight"><span>Big winner</span><strong>' + esc(bigWinner) + '</strong><em>' + bigCount + ' wins</em></p>'
          : '';
        var meta = ceremonyLabel
          ? '<p class="oscars-year-meta">' + esc(ceremonyLabel) + '</p>'
          : '';
        return '<div class="oscars-matrix-row oscars-year-card' + (Number(year.year) === Number(state.year) ? ' is-target' : '') + '" id="year-' + esc(year.year) + '">' +
          '<div class="oscars-year-head"><strong>' + esc(year.year) + '</strong>' + meta + '</div>' +
          highlight +
          '<div class="oscars-year-awards">' +
          categories.map(function (category) {
            var award = byCategory[category];
            var labelAttr = ' data-awards-category-label="' + esc(category) + '"';
            if (!award) return '<span class="oscars-matrix-empty"' + labelAttr + '>TBC</span>';
            var detail = award.film && award.film !== award.winner ? '<em>' + esc(award.film) + '</em>' : '';
            return '<span' + labelAttr + '><b>' + esc(award.winner || 'TBC') + '</b>' + detail + '</span>';
          }).join('') +
          '</div>' +
          '</div>';
      }).join('');
      els.decadeMatrix.innerHTML = '<div class="oscars-matrix-scroll">' + header + body + '</div>';
      enhanceCountriesInMatrix(els.decadeMatrix);
    }

    // Replace plain country names (inside <em>/<b> cells) with a linked
    // flag + name pill, wherever a country appears in the matrix.
    function enhanceCountriesInMatrix(root) {
      if (!root) return;
      var map = {
        'United States': 'north-america/usa', 'USA': 'north-america/usa', 'United Kingdom': 'europe/united-kingdom',
        'UK': 'europe/united-kingdom', 'France': 'europe/france', 'Germany': 'europe/germany',
        'Italy': 'europe/italy', 'Spain': 'europe/spain', 'Sweden': 'europe/sweden',
        'Norway': 'europe/norway', 'Denmark': 'europe/denmark', 'Finland': 'europe/finland',
        'Ireland': 'europe/ireland', 'Netherlands': 'europe/netherlands', 'Belgium': 'europe/belgium',
        'Austria': 'europe/austria', 'Switzerland': 'europe/switzerland', 'Portugal': 'europe/portugal',
        'Poland': 'europe/poland', 'Hungary': 'europe/hungary', 'Russia': 'europe/russia',
        'Greece': 'europe/greece', 'Turkey': 'asia/turkey', 'Romania': 'europe/romania',
        'Iceland': 'europe/iceland', 'Czech Republic': 'europe/czech-republic',
        'South Korea': 'asia/south-korea', 'Japan': 'asia/japan', 'China': 'asia/china',
        'India': 'asia/india', 'Iran': 'asia/iran', 'Israel': 'asia/israel',
        'Taiwan': 'asia/taiwan', 'Thailand': 'asia/thailand', 'Vietnam': 'asia/vietnam',
        'Australia': 'oceania/australia', 'New Zealand': 'oceania/new-zealand',
        'Canada': 'north-america/canada', 'Mexico': 'north-america/mexico',
        'Brazil': 'south-america/brazil', 'Argentina': 'south-america/argentina',
        'Chile': 'south-america/chile', 'South Africa': 'africa/south-africa',
        'Egypt': 'africa/egypt', 'Morocco': 'africa/morocco', 'Nigeria': 'africa/nigeria'
      };
      var pill = function (name) {
        var path = map[name];
        if (!path) return name;
        var url = '/content/locations/' + path + '/index.html';
        var flag = '/content/locations/' + path + '/img/flag.svg';
        return '<a class="country" href="' + url + '"><img src="' + flag + '" alt="" width="20" height="14" loading="lazy">' + name + '</a>';
      };
      var cells = root.querySelectorAll('em, b');
      for (var i = 0; i < cells.length; i++) {
        var el = cells[i];
        var txt = (el.textContent || '').trim();
        if (map[txt]) el.innerHTML = pill(txt);
      }
    }

    function ordinal(n) {
      n = Number(n);
      if (!Number.isFinite(n)) return String(n);
      var s = ['th', 'st', 'nd', 'rd'];
      var v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }

    function renderAwardMatrix() {
      var years = allYears(true);
      var range = allYearsRange();
      if (els.matrixTitle) els.matrixTitle.textContent = 'Vinnare per år: ' + range;
      if (els.matrixNote) els.matrixNote.textContent = 'Välj en eller flera kategorier. Åren visas som rader.';
      if (els.activeRange) els.activeRange.textContent = range;
      if (!els.decadeMatrix) return;

      var categories = [];
      years.forEach(function (year) {
        awardsForYear(year).forEach(function (award) {
          if (categories.indexOf(award.category) === -1) categories.push(award.category);
        });
      });
      if (els.categoryCount) els.categoryCount.textContent = categories.length + ' categories';
      var preferred = ['Best Picture', 'Best Director', 'Best Actor', 'Best Actress'];
      preferred = [
        'Best Picture',
        'Best Director',
        'Best Actor',
        'Best Actress',
        'Best Supporting Actor',
        'Best Supporting Actress',
        'Best Original Screenplay',
        'Best Adapted Screenplay',
        'Best Cinematography',
        'Best Film Editing',
        'Best Production Design',
        'Best Costume Design',
        'Best Makeup and Hairstyling',
        'Best Original Score',
        'Best Original Song',
        'Best Sound',
        'Best Sound Editing',
        'Best Sound Mixing',
        'Best Visual Effects',
        'Best International Feature Film',
        'Best Animated Feature',
        'Best Documentary Feature',
        'Best Animated Short Film',
        'Best Live Action Short Film',
        'Best Documentary Short'
      ];
      categories.sort(function (a, b) {
        var ai = preferred.indexOf(a);
        var bi = preferred.indexOf(b);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return a.localeCompare(b);
      });
      if (!state.categories.length || !state.categories.some(function (category) { return categories.indexOf(category) !== -1; })) {
        state.categories = preferred.filter(function (category) { return categories.indexOf(category) !== -1; }).slice(0, 4);
        if (!state.categories.length) state.categories = categories.slice(0, 4);
      } else {
        state.categories = state.categories.filter(function (category) { return categories.indexOf(category) !== -1; });
      }
      var selectedCategories = state.categories.slice();
      if (els.categoryPicker) {
        els.categoryPicker.innerHTML = categories.map(function (category) {
          var active = selectedCategories.indexOf(category) !== -1;
          return '<button class="oscars-category-pill' + (active ? ' is-active' : '') + '" type="button" data-oscars-category-toggle="' + esc(category) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
            '<span class="oscars-category-icon oscars-category-icon--' + esc(categoryIconType(category)) + '" aria-hidden="true"></span>' +
            '<span>' + esc(displayCategory(category)) + '</span></button>';
        }).join('');
      }

      var awardsByYear = {};
      years.forEach(function (year) {
        awardsByYear[year.year] = {};
        awardsForYear(year).forEach(function (award) {
          awardsByYear[year.year][award.category] = award;
        });
      });

      var header = '<div class="oscars-matrix-row oscars-matrix-row--head">' +
        '<span>År</span>' + selectedCategories.map(function (category) { return '<span>' + esc(displayCategory(category)) + '</span>'; }).join('') +
        '</div>';
      var body = years.map(function (year) {
        return '<div class="oscars-matrix-row' + (Number(year.year) === Number(state.year) ? ' is-target' : '') + '" id="year-' + esc(year.year) + '">' +
          '<strong>' + esc(year.year) + '</strong>' +
          selectedCategories.map(function (category) {
            var award = awardsByYear[year.year] && awardsByYear[year.year][category];
            if (!award) return '<span class="oscars-matrix-empty">TBC</span>';
            var detail = award.film && award.film !== award.winner ? '<em>' + esc(award.film) + '</em>' : '';
            return '<span><b>' + esc(award.winner || 'TBC') + '</b>' + detail + '</span>';
          }).join('') +
          '</div>';
      }).join('');
      els.decadeMatrix.innerHTML = '<div class="oscars-matrix-scroll">' + header + body + '</div>';
      enhanceCountriesInMatrix(els.decadeMatrix);
    }

    function renderStats() {
      if (!els.stats) return;
      function numericValue(item) {
        var match = String(item.value || item.count || item.year || '').match(/\d+/);
        return match ? Number(match[0]) : 0;
      }
      var statMap = {};
      stats.forEach(function (stat) {
        statMap[stat.stat || stat.title || ''] = stat;
      });
      var wins = statMap['most-awards'];
      var nominations = statMap['most-nominations'];
      var kpis = [
        { label: 'Record wins', value: wins && wins.items && wins.items[0] ? numericValue(wins.items[0]) : 0, note: wins && wins.items && wins.items[0] ? wins.items[0].name : 'TBC' },
        { label: 'Record nominations', value: nominations && nominations.items && nominations.items[0] ? numericValue(nominations.items[0]) : 0, note: nominations && nominations.items && nominations.items[0] ? nominations.items[0].name : 'TBC' },
        { label: 'Record charts', value: '2', note: 'Wins and nominations' }
      ];
      var kpiHtml = '<div class="oscars-visual-kpis">' + kpis.map(function (item) {
        return '<div><span>' + esc(item.label) + '</span><strong>' + esc(item.value) + '</strong><em>' + esc(item.note) + '</em></div>';
      }).join('') + '</div>';
      var cards = stats.map(function (stat) {
        var rows = Array.isArray(stat.items) ? stat.items : [];
        var chart = stat.stat === 'most-awards' || stat.stat === 'most-nominations';
        var historyList = stat.stat === 'best-picture-winners' || stat.stat === 'best-actor-winners' || stat.stat === 'best-actress-winners';
        var max = rows.reduce(function (top, item) { return Math.max(top, numericValue(item)); }, 1);
        if (historyList) return '';
        if (chart) {
          return '<article class="oscars-stat-card oscars-stat-card--chart">' +
            '<h3>' + esc(stat.title || 'Oscars list') + '</h3>' +
            '<div class="oscars-bar-chart">' + rows.slice(0, 7).map(function (item) {
              var value = numericValue(item);
              var pct = Math.max(6, Math.round((value / max) * 100));
              return '<div class="oscars-bar-row"><span>' + esc(item.name || 'TBC') + '</span><b>' + esc(item.value || value) + '</b><i style="--bar:' + pct + '%"></i></div>';
            }).join('') + '</div>' +
            '</article>';
        }
        return '<article class="oscars-stat-card">' +
          '<h3>' + esc(stat.title || stat.stat || 'Oscars list') + '</h3>' +
          '<ol>' + rows.slice(0, 8).map(function (item) {
            var value = item.value || item.count || item.year || '';
            var suffix = value ? ' <span>' + esc(value) + '</span>' : '';
            return '<li><strong>' + esc(item.name || item.winner || item.film || item.person || 'TBC') + '</strong>' + suffix + '</li>';
          }).join('') + '</ol>' +
          '</article>';
      }).join('');
      els.stats.innerHTML = kpiHtml + cards;
    }

    function renderRecords() {
      if (!els.records) return;
      els.records.innerHTML = records.map(function (item) {
        return '<div class="stage-card"><strong>' + esc(item.title || item.name || 'Oscars record') + '</strong><span>' +
          esc(item.detail || item.value || '') + '</span></div>';
      }).join('');
    }

    function renderAll() {
      renderSummary();
      renderDecades();
      renderAwardMatrix();
      renderStats();
      renderRecords();
      bindStayModule();
    }

    root.addEventListener('click', function (event) {
      var decadeButton = event.target.closest('[data-oscars-decade]');
      if (decadeButton) {
        event.preventDefault();
        state.decade = decadeButton.getAttribute('data-oscars-decade');
        state.year = 0;
        renderAll();
        history.replaceState(null, '', '#' + decadeHash(activeDecade()));
      }
      var yearButton = event.target.closest('[data-oscars-year]');
      if (yearButton) {
        event.preventDefault();
        state.year = Number(yearButton.getAttribute('data-oscars-year')) || 0;
        var yearDecade = decadeForYear(state.year);
        if (yearDecade) state.decade = yearDecade.decade;
        setTab('history');
        renderAll();
        history.replaceState(null, '', '#year-' + state.year);
      }
      var tabButton = event.target.closest('[data-oscars-tab]');
      if (tabButton) {
        setTab(tabButton.getAttribute('data-oscars-tab'));
      }
      var categoryButton = event.target.closest('[data-oscars-category-toggle]');
      if (categoryButton) {
        event.preventDefault();
        var category = categoryButton.getAttribute('data-oscars-category-toggle');
        var index = state.categories.indexOf(category);
        if (index === -1) {
          state.categories.push(category);
        } else if (state.categories.length > 1) {
          state.categories.splice(index, 1);
        }
        renderAwardMatrix();
      }
    });

    window.addEventListener('hashchange', function () {
      if (applyHashState()) {
        setTab('history');
        renderAll();
      }
    });

    Promise.all([
      Promise.all(decadeUrls.map(fetchJson)),
      Promise.all(statUrls.map(fetchJson)),
      Promise.all(recordUrls.map(fetchJson))
    ]).then(function (result) {
      decades = result[0].sort(function (a, b) { return String(a.decade).localeCompare(String(b.decade)); });
      stats = result[1];
      records = [];
      result[2].forEach(function (file) {
        records = records.concat(Array.isArray(file.items) ? file.items : []);
      });
      var hasHashState = applyHashState();
      var defaultDecade = activeDecade() || decades[decades.length - 1];
      if (!hasHashState) defaultDecade = decades[decades.length - 1];
      state.decade = defaultDecade ? defaultDecade.decade : '';
      setTab('history');
      renderAll();
    }).catch(function (error) {
      if (els.decadeMatrix) els.decadeMatrix.innerHTML = '<p class="oscars-loading">Could not load Oscars JSON data.</p>';
      if (window.console) console.warn('[OneSlider] oscarsExplorer', error);
    });
  });

  // ====================================================================
  // Module: nobelPrizeExplorer
  // JSON-powered single-page explorer for /technology/awards/events/nobel-prize.html.
  // Data comes from Nobel Prize API exports declared on [data-nobel-explorer].
  // ====================================================================
  OneSlider.register('nobelPrizeExplorer', function () {
    var root = document.querySelector('[data-nobel-explorer]');
    if (!root || !window.fetch) return;

    function listFromAttr(name) {
      return (root.getAttribute(name) || '')
        .split(',')
        .map(function (item) { return item.trim(); })
        .filter(Boolean)
        .filter(function (item) { return item.toLowerCase().indexOf('nobel-prize') !== -1; });
    }

    function esc(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function fetchJson(url) {
      return fetch(url, { cache: 'no-cache' }).then(function (response) {
        if (!response.ok) throw new Error('Could not load ' + url);
        return response.json();
      });
    }

    function categoryIconType(category) {
      var name = String(category || '').toLowerCase();
      if (name.indexOf('peace') !== -1) return 'world';
      if (name.indexOf('literature') !== -1) return 'writing';
      if (name.indexOf('chemistry') !== -1 || name.indexOf('physics') !== -1) return 'effects';
      if (name.indexOf('medicine') !== -1) return 'makeup';
      if (name.indexOf('economic') !== -1) return 'picture';
      return 'picture';
    }

    var decadeUrls = listFromAttr('data-nobel-decades');
    var recordUrls = listFromAttr('data-nobel-records');
    var els = {
      summary: root.querySelector('[data-nobel-summary]'),
      categoryPicker: root.querySelector('[data-nobel-category-picker]'),
      matrix: root.querySelector('[data-nobel-matrix]'),
      records: root.querySelector('[data-nobel-records-panel]'),
      tabs: root.querySelector('[data-nobel-tabs]'),
      matrixTitle: root.querySelector('[data-nobel-matrix-title]'),
      matrixNote: root.querySelector('[data-nobel-matrix-note]')
    };
    var state = { tab: 'history', categories: [] };
    var decades = [];
    var records = [];

    function awardsForYear(yearItem) {
      return yearItem && Array.isArray(yearItem.awards) ? yearItem.awards : [];
    }

    function allYears(descending) {
      var rows = [];
      decades.forEach(function (decade) {
        (decade.years || []).forEach(function (year) { rows.push(year); });
      });
      rows.sort(function (a, b) {
        return descending ? Number(b.year) - Number(a.year) : Number(a.year) - Number(b.year);
      });
      return rows;
    }

    function setTab(name) {
      state.tab = name || 'history';
      root.querySelectorAll('[data-nobel-tab]').forEach(function (button) {
        button.setAttribute('aria-selected', button.getAttribute('data-nobel-tab') === state.tab ? 'true' : 'false');
      });
      root.querySelectorAll('[data-nobel-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-nobel-panel') !== state.tab;
      });
    }

    function renderSummary() {
      if (!els.summary) return;
      var years = allYears(false);
      var categories = {};
      var awards = 0;
      years.forEach(function (year) {
        awardsForYear(year).forEach(function (award) {
          awards += 1;
          categories[award.category] = true;
        });
      });
      els.summary.innerHTML =
        '<div class="fact"><span>Next laureates</span><strong>Oct 2026</strong></div>' +
        '<div class="fact"><span>Ceremony</span><strong>10 Dec</strong></div>' +
        '<div class="fact"><span>Years loaded</span><strong>' + esc(years.length) + '</strong></div>' +
        '<div class="fact"><span>Prize rows</span><strong>' + esc(awards) + '</strong></div>';
    }

    function renderMatrix() {
      var years = allYears(true);
      if (els.matrixTitle) els.matrixTitle.textContent = 'Nobel winners per year: 1970-2025';
      if (els.matrixNote) els.matrixNote.textContent = 'Categories are columns. Each cell shows laureate names and the official motivation when available.';
      if (!els.matrix) return;

      var categories = [];
      years.forEach(function (year) {
        awardsForYear(year).forEach(function (award) {
          if (categories.indexOf(award.category) === -1) categories.push(award.category);
        });
      });
      var preferred = ['Physics', 'Chemistry', 'Physiology or Medicine', 'Literature', 'Peace', 'Economic Sciences'];
      categories.sort(function (a, b) {
        var ai = preferred.indexOf(a);
        var bi = preferred.indexOf(b);
        if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        return a.localeCompare(b);
      });
      if (!state.categories.length) state.categories = preferred.filter(function (category) { return categories.indexOf(category) !== -1; });
      var selectedCategories = state.categories.filter(function (category) { return categories.indexOf(category) !== -1; });
      if (!selectedCategories.length) selectedCategories = categories.slice(0, 6);

      if (els.categoryPicker) {
        els.categoryPicker.innerHTML = categories.map(function (category) {
          var active = selectedCategories.indexOf(category) !== -1;
          return '<button class="oscars-category-pill' + (active ? ' is-active' : '') + '" type="button" data-nobel-category-toggle="' + esc(category) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' +
            '<span class="oscars-category-icon oscars-category-icon--' + esc(categoryIconType(category)) + '" aria-hidden="true"></span>' +
            '<span>' + esc(category) + '</span></button>';
        }).join('');
      }

      var awardsByYear = {};
      years.forEach(function (year) {
        awardsByYear[year.year] = {};
        awardsForYear(year).forEach(function (award) { awardsByYear[year.year][award.category] = award; });
      });

      var header = '<div class="oscars-matrix-row oscars-matrix-row--head"><span>Year</span>' +
        selectedCategories.map(function (category) { return '<span>' + esc(category) + '</span>'; }).join('') +
        '</div>';
      var body = years.map(function (year) {
        return '<div class="oscars-matrix-row" id="year-' + esc(year.year) + '"><strong>' + esc(year.year) + '</strong>' +
          selectedCategories.map(function (category) {
            var award = awardsByYear[year.year] && awardsByYear[year.year][category];
            if (!award) return '<span class="oscars-matrix-empty">No prize</span>';
            var detail = award.film && award.film !== award.winner ? '<em>' + esc(award.film) + '</em>' : '';
            return '<span><b>' + esc(award.winner || 'TBC') + '</b>' + detail + '</span>';
          }).join('') +
          '</div>';
      }).join('');
      els.matrix.innerHTML = '<div class="oscars-matrix-scroll">' + header + body + '</div>';
    }

    function renderRecords() {
      if (!els.records) return;
      els.records.innerHTML = records.map(function (item) {
        return '<div class="stage-card"><strong>' + esc(item.title || 'Nobel fact') + '</strong><span>' + esc(item.value || '') + '</span><p>' + esc(item.note || item.detail || '') + '</p></div>';
      }).join('');
    }

    function renderAll() {
      renderSummary();
      renderMatrix();
      renderRecords();
    }

    root.addEventListener('click', function (event) {
      var tabButton = event.target.closest('[data-nobel-tab]');
      if (tabButton) {
        event.preventDefault();
        setTab(tabButton.getAttribute('data-nobel-tab'));
        return;
      }
      var categoryButton = event.target.closest('[data-nobel-category-toggle]');
      if (!categoryButton) return;
      event.preventDefault();
      var category = categoryButton.getAttribute('data-nobel-category-toggle');
      var index = state.categories.indexOf(category);
      if (index === -1) {
        state.categories.push(category);
      } else if (state.categories.length > 1) {
        state.categories.splice(index, 1);
      }
      renderMatrix();
    });

    Promise.all([
      Promise.all(decadeUrls.map(fetchJson)),
      Promise.all(recordUrls.map(fetchJson))
    ]).then(function (result) {
      decades = result[0].sort(function (a, b) { return String(a.decade).localeCompare(String(b.decade)); });
      records = [];
      result[1].forEach(function (file) {
        records = records.concat(Array.isArray(file.records) ? file.records : (Array.isArray(file.items) ? file.items : []));
      });
      setTab('history');
      renderAll();
    }).catch(function (error) {
      if (els.matrix) els.matrix.innerHTML = '<p class="oscars-loading">Could not load Nobel Prize JSON data.</p>';
      if (window.console) console.warn('[OneSlider] nobelPrizeExplorer', error);
    });
  });

  OneSlider.register('awardsTemplateTabs', function () {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-awards-tabs]'));
    if (!roots.length) return;

    roots.forEach(function (root) {
      function setTab(tab) {
        root.querySelectorAll('[data-awards-tab]').forEach(function (button) {
          var active = button.getAttribute('data-awards-tab') === tab;
          button.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        root.querySelectorAll('[data-awards-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-awards-panel') !== tab;
        });
      }

      function setCategory(category, active) {
        var buttons = root.querySelectorAll('[data-awards-category-toggle="' + category + '"]');
        buttons.forEach(function (button) {
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        root.querySelectorAll('[data-awards-category-column="' + category + '"]').forEach(function (cell) {
          cell.hidden = !active;
        });
      }

      root.addEventListener('click', function (event) {
        var button = event.target.closest('[data-awards-tab]');
        if (button && root.contains(button)) {
          event.preventDefault();
          setTab(button.getAttribute('data-awards-tab') || 'history');
          return;
        }

        var categoryButton = event.target.closest('[data-awards-category-toggle]');
        if (!categoryButton || !root.contains(categoryButton)) return;
        event.preventDefault();
        var category = categoryButton.getAttribute('data-awards-category-toggle');
        var activeButtons = root.querySelectorAll('[data-awards-category-toggle][aria-pressed="true"]');
        var willBeActive = categoryButton.getAttribute('aria-pressed') !== 'true';
        if (!willBeActive && activeButtons.length <= 1) return;
        setCategory(category, willBeActive);
      });
    });
  });

  // ====================================================================
  // Module: dynamicWeatherForecast
  // Fetches current forecasts for city pages. USA coordinates use National
  // Weather Service; other coordinates use Open-Meteo unless explicitly set.
  // ====================================================================
  OneSlider.register('dynamicWeatherForecast', function (App) {
    var strips = Array.prototype.slice.call(document.querySelectorAll('[data-weather-dynamic]'));
    if (!strips.length || !window.fetch) return;

    function iconFor(period) {
      var text = String(period.shortForecast || '').toLowerCase();
      if (/rain|shower|storm|thunder/.test(text)) return 'rain';
      if (/snow|sleet|ice/.test(text)) return 'snow';
      if (/cloud|overcast|fog/.test(text)) return 'cloud';
      if (/partly|mostly sunny|mostly clear/.test(text)) return 'partly';
      return period.isDaytime === false ? 'moon' : 'sun';
    }

    function shortName(name) {
      return String(name || 'Forecast')
        .replace(/^This\s+/i, '')
        .replace(/\s+Night$/i, ' night')
        .replace(/\bAfternoon\b/i, 'PM');
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }

    function renderPages(strip, periods) {
      var pageSets = [periods.slice(0, 4), periods.slice(4, 8)].filter(function (page) { return page.length; });
      var html = pageSets.map(function (page, index) {
        var tiles = page.map(function (period) {
          var temp = Number(period.temperature);
          var unit = period.temperatureUnit || 'F';
          var tempAttr = String(unit).toUpperCase() === 'C' ? 'data-temp-c' : 'data-temp-f';
          return '<article class="stay-weather-tile"><strong>' + escapeHtml(shortName(period.name)) + '</strong><div class="stay-weather-reading"><span class="weather-icon weather-icon--' + iconFor(period) + '" aria-hidden="true"></span><span class="stay-weather-temp" ' + tempAttr + '="' + escapeHtml(temp) + '">' + escapeHtml(temp) + ' ' + escapeHtml(unit) + '</span></div></article>';
        }).join('');
        var button = pageSets.length > 1
          ? '<button class="stay-weather-more" type="button" data-weather-' + (index === 0 ? 'next' : 'prev') + ' aria-label="' + (index === 0 ? 'Show next weather outlook' : 'Show this week weather') + '">...</button>'
          : '';
        return '<div class="stay-weather-page' + (index === 0 ? ' is-active' : '') + '" data-weather-page="' + index + '"><div class="stay-weather-days">' + tiles + button + '</div></div>';
      }).join('');
      strip.querySelectorAll('[data-weather-page]').forEach(function (page) { page.remove(); });
      var source = strip.querySelector('.stay-weather-source');
      if (source) source.insertAdjacentHTML('beforebegin', html);
      if (window.OneSlider && window.OneSlider.applyWeatherUnits) window.OneSlider.applyWeatherUnits(strip);
      if (App && App.emit) App.emit('weather:rendered', { strip: strip });
    }

    function setUnavailable(strip) {
      var temp = strip.querySelector('.stay-weather-temp');
      if (temp) temp.textContent = 'Unavailable';
    }

    function isLikelyUsCoordinates(lat, lon) {
      var latitude = Number(lat);
      var longitude = Number(lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
      var contiguous = latitude >= 24 && latitude <= 50 && longitude >= -125 && longitude <= -66;
      var alaska = latitude >= 51 && latitude <= 72 && longitude >= -170 && longitude <= -129;
      var hawaii = latitude >= 18 && latitude <= 23 && longitude >= -161 && longitude <= -154;
      return contiguous || alaska || hawaii;
    }

    function openMeteoForecastText(code) {
      var value = Number(code);
      if ([0].indexOf(value) >= 0) return 'sunny';
      if ([1, 2, 3].indexOf(value) >= 0) return 'cloudy';
      if ([45, 48].indexOf(value) >= 0) return 'cloudy';
      if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].indexOf(value) >= 0) return 'rain';
      if ([71, 73, 75, 77, 85, 86].indexOf(value) >= 0) return 'snow';
      if ([95, 96, 99].indexOf(value) >= 0) return 'storm';
      return 'cloudy';
    }

    function renderOpenMeteo(strip, forecast) {
      var daily = forecast && forecast.daily;
      if (!daily || !daily.time || !daily.time.length) throw new Error('Missing Open-Meteo daily forecast');
      strip.setAttribute('data-weather-default-unit', 'c');
      var periods = daily.time.slice(0, 8).map(function (date, index) {
        return {
          name: new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' }),
          temperature: Number(daily.temperature_2m_max[index]),
          temperatureUnit: 'C',
          shortForecast: openMeteoForecastText(daily.weather_code ? daily.weather_code[index] : ''),
          isDaytime: true
        };
      });
      renderPages(strip, periods);
    }

    strips.forEach(function (strip) {
      var lat = strip.getAttribute('data-weather-lat');
      var lon = strip.getAttribute('data-weather-lon');
      var provider = (strip.getAttribute('data-weather-provider') || 'auto').toLowerCase();
      if (!lat || !lon) return;
      if (provider === 'auto') provider = isLikelyUsCoordinates(lat, lon) ? 'nws' : 'open-meteo';
      if (provider === 'open-meteo') {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=' + encodeURIComponent(lat) + '&longitude=' + encodeURIComponent(lon) + '&daily=weather_code,temperature_2m_max&temperature_unit=celsius&timezone=auto', {
          headers: { Accept: 'application/json' }
        })
          .then(function (response) { return response.ok ? response.json() : Promise.reject(response); })
          .then(function (forecast) { renderOpenMeteo(strip, forecast); })
          .catch(function () { setUnavailable(strip); });
        return;
      }
      fetch('https://api.weather.gov/points/' + encodeURIComponent(lat) + ',' + encodeURIComponent(lon), {
        headers: { Accept: 'application/geo+json, application/json' }
      })
        .then(function (response) { return response.ok ? response.json() : Promise.reject(response); })
        .then(function (point) {
          var forecastUrl = point && point.properties && point.properties.forecast;
          if (!forecastUrl) throw new Error('Missing forecast URL');
          return fetch(forecastUrl, { headers: { Accept: 'application/geo+json, application/json' } });
        })
        .then(function (response) { return response.ok ? response.json() : Promise.reject(response); })
        .then(function (forecast) {
          var periods = forecast && forecast.properties && forecast.properties.periods;
          if (!periods || !periods.length) throw new Error('Missing forecast periods');
          renderPages(strip, periods.slice(0, 8));
        })
        .catch(function () { setUnavailable(strip); });
    });
  });

  // ====================================================================
  // Module: weatherStrip
  // Reusable compact weather carousel for city and event pages. Each
  // widget owns its own pages, so multiple strips can coexist on one page.
  // ====================================================================
  OneSlider.register('weatherStrip', function () {
    var strips = document.querySelectorAll('[data-weather-strip]');
    if (!strips.length) return;

    strips.forEach(function (strip) {
      function getPages() {
        return Array.prototype.slice.call(strip.querySelectorAll('[data-weather-page]'));
      }
      var pages = getPages();
      var index = pages.findIndex(function (page) { return page.classList.contains('is-active'); });
      if (index < 0) index = 0;

      function show(nextIndex) {
        pages = getPages();
        if (!pages.length) return;
        index = (nextIndex + pages.length) % pages.length;
        pages.forEach(function (page, pageIndex) {
          var active = pageIndex === index;
          page.classList.toggle('is-active', active);
          page.hidden = !active;
        });
        strip.querySelectorAll('[data-weather-page-button]').forEach(function (button) {
          var active = Number(button.getAttribute('data-weather-page-button')) === index;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }

      strip.addEventListener('click', function (event) {
        var next = event.target.closest('[data-weather-next]');
        var prev = event.target.closest('[data-weather-prev]');
        var pageButton = event.target.closest('[data-weather-page-button]');
        if (next && strip.contains(next)) {
          event.preventDefault();
          show(index + 1);
          return;
        }
        if (prev && strip.contains(prev)) {
          event.preventDefault();
          show(index - 1);
          return;
        }
        if (pageButton && strip.contains(pageButton)) {
          event.preventDefault();
          show(Number(pageButton.getAttribute('data-weather-page-button')) || 0);
        }
      });

      show(index);
      if (OneSlider && OneSlider.on) {
        OneSlider.on('weather:rendered', function (payload) {
          if (payload && payload.strip === strip) show(0);
        });
      }
    });
  });

  // ====================================================================
  // Module: weatherUnits
  // Displays weather temperatures in Fahrenheit or Celsius based on a
  // saved preference first, then browser locale/timezone. Markup keeps
  // Fahrenheit as the no-JS fallback because many forecast sources use it
  // for US pages.
  // ====================================================================
  OneSlider.register('weatherUnits', function () {
    function storedUnit() {
      try {
        var value = String(localStorage.getItem('os_temperature_unit') || '').toLowerCase();
        if (value === 'c' || value === 'celsius') return 'c';
        if (value === 'f' || value === 'fahrenheit') return 'f';
      } catch (e) { /* localStorage may be blocked */ }
      return '';
    }

    function localeRegion() {
      var language = (navigator.languages && navigator.languages[0]) || navigator.language || '';
      var match = String(language).match(/[-_]([A-Z]{2})\b/i);
      return match ? match[1].toUpperCase() : '';
    }

    function timezoneRegion() {
      try {
        var zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (/^America\//i.test(zone)) return 'US';
        if (/^Europe\//i.test(zone)) return 'EU';
      } catch (e) { /* Intl may be unavailable */ }
      return '';
    }

    function preferredUnit(root) {
      var saved = storedUnit();
      if (saved) return saved;
      var defaultUnit = root && root.getAttribute ? String(root.getAttribute('data-weather-default-unit') || '').toLowerCase() : '';
      if (defaultUnit === 'c' || defaultUnit === 'f') return defaultUnit;
      var fahrenheitRegions = { US: true, BS: true, BZ: true, KY: true, PW: true, FM: true, MH: true };
      var region = localeRegion();
      if (region) return fahrenheitRegions[region] ? 'f' : 'c';
      return timezoneRegion() === 'US' ? 'f' : 'c';
    }

    function formatTemp(fahrenheit, unit) {
      var f = Number(fahrenheit);
      if (!Number.isFinite(f)) return '';
      if (unit === 'c') return Math.round((f - 32) * 5 / 9) + ' C';
      return Math.round(f) + ' F';
    }

    function formatTempC(celsius, unit) {
      var c = Number(celsius);
      if (!Number.isFinite(c)) return '';
      if (unit === 'f') return Math.round((c * 9 / 5) + 32) + ' F';
      return Math.round(c) + ' C';
    }

    function apply(root) {
      Array.prototype.slice.call((root || document).querySelectorAll('[data-temp-f]')).forEach(function (node) {
      var unit = preferredUnit(node.closest('[data-weather-default-unit]') || root);
      var text = formatTemp(node.getAttribute('data-temp-f'), unit);
      if (text) node.textContent = text;
      node.setAttribute('data-temp-unit', unit);
      });
      Array.prototype.slice.call((root || document).querySelectorAll('[data-temp-c]')).forEach(function (node) {
      var unit = preferredUnit(node.closest('[data-weather-default-unit]') || root);
      var text = formatTempC(node.getAttribute('data-temp-c'), unit);
      if (text) node.textContent = text;
      node.setAttribute('data-temp-unit', unit);
      });
    }

    OneSlider.applyWeatherUnits = apply;
    if (OneSlider.on) OneSlider.on('weather:rendered', function (payload) { apply(payload && payload.strip ? payload.strip : document); });
    apply(document);
  });

  // ====================================================================
  // Module: cityFinder
  // Filters compact city grids by travel intent and search text.
  // ====================================================================
  OneSlider.register('cityFinder', function () {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-city-finder]'));
    if (!roots.length) return;

    roots.forEach(function (root) {
      var grid = root.nextElementSibling;
      if (!grid || !grid.matches('[data-city-grid]')) return;

      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-city-tags]'));
      var search = root.querySelector('[data-city-search]');
      var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-city-filter]'));
      var count = root.querySelector('[data-city-count]');
      var state = { filter: 'all', query: '' };

      function tokens(value) {
        return String(value || '').toLowerCase().split(/\s+/).filter(Boolean);
      }

      function cardText(card) {
        return String(card.textContent || '').toLowerCase() + ' ' + String(card.getAttribute('data-city-tags') || '').toLowerCase();
      }

      function filterMatches(card, filter) {
        if (!filter || filter === 'all') return true;
        var tagMap = {};
        tokens(card.getAttribute('data-city-tags')).forEach(function (tag) { tagMap[tag] = true; });
        return tokens(filter).some(function (tag) { return tagMap[tag]; });
      }

      function apply() {
        var visible = 0;
        var query = state.query.trim().toLowerCase();

        cards.forEach(function (card) {
          var matches = filterMatches(card, state.filter) && (!query || cardText(card).indexOf(query) !== -1);
          card.hidden = !matches;
          if (matches) visible += 1;
        });

        buttons.forEach(function (button) {
          var active = button.getAttribute('data-city-filter') === state.filter;
          button.classList.toggle('is-active', active);
          button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (count) {
          count.textContent = visible === cards.length
            ? 'Showing all cities'
            : 'Showing ' + visible + ' of ' + cards.length + ' cities';
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          state.filter = button.getAttribute('data-city-filter') || 'all';
          apply();
        });
      });

      if (search) {
        search.addEventListener('input', function () {
          state.query = search.value || '';
          apply();
        });
      }

      apply();
    });
  });

  // ====================================================================
  // Module: localTime
  // Updates local time cards from a page-provided IANA timezone.
  // ====================================================================
  OneSlider.register('localTime', function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-local-time]'));
    if (!cards.length || typeof Intl === 'undefined') return;

    function formatZoneLabel(zone) {
      return String(zone || '')
        .replace(/_/g, ' ')
        .replace(/^[^/]+\//, '');
    }

    cards.forEach(function (card) {
      var zone = card.getAttribute('data-time-zone') || '';
      var value = card.querySelector('[data-local-time-value]');
      var zoneLabel = card.querySelector('[data-local-time-zone]');
      if (!zone || !value) return;

      var formatter;
      try {
        formatter = new Intl.DateTimeFormat([], {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: zone
        });
      } catch (error) {
        return;
      }

      function render() {
        value.textContent = formatter.format(new Date());
        if (zoneLabel) zoneLabel.textContent = formatZoneLabel(zone);
      }

      render();
      window.setInterval(render, 30000);
    });
  });

  // ====================================================================
  // Module: cityStayViews
  // Keeps hash-addressable Visit subviews from trapping the primary tabs.
  // ====================================================================
  OneSlider.register('cityStayViews', function () {
    var stayHashes = {
      '#stay-overview': true,
      '#stay-areas': true,
      '#stay-airports': true,
      '#stay-hotels': true,
      '#stay-hotels-areas': true,
      '#stay-flights-airports': true,
      '#stay-rental-cars': true,
      '#stay-tips': true
    };
    var primaryHashes = {
      '#fact': 'view-visit',
      '#see': 'view-see',
      '#visit': 'view-stay',
      '#nearby': 'view-nearby',
      '#events': 'view-events'
    };

    function isStayHash() {
      return !!stayHashes[window.location.hash];
    }

    function syncHashClass() {
      document.documentElement.classList.toggle('os-stay-hash-active', isStayHash());
    }

    function clearStayHash() {
      if (!isStayHash() || !window.history || !window.history.replaceState) return;
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      syncHashClass();
    }

    function activateStayTabForHash() {
      syncHashClass();
      var primaryInput = document.getElementById(primaryHashes[window.location.hash]);
      if (primaryInput) {
        primaryInput.checked = true;
        return;
      }
      if (!isStayHash()) return;
      var stayInput = document.getElementById('view-stay');
      if (stayInput) stayInput.checked = true;
    }

    Array.prototype.slice.call(document.querySelectorAll('.persona-tablist label[for]')).forEach(function (label) {
      label.addEventListener('click', function () {
        if (label.getAttribute('for') !== 'view-stay') {
          clearStayHash();
        }
      });
    });

    activateStayTabForHash();
    window.addEventListener('hashchange', activateStayTabForHash);
  });

})();  // end IIFE
