/* OneSliders city-page modules
 * Loaded on city/location pages after oneslider-core.js.
 * Requires window.OneSlider (defined by oneslider-core.js, listed first).
 */
(function () {
  'use strict';

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

    function primaryInputIdForHash(hash) {
      if (primaryHashes[hash]) return primaryHashes[hash];
      if (hash.indexOf('#see-') === 0) return 'view-see';
      return null;
    }

    function activateStayTabForHash() {
      syncHashClass();
      var primaryInput = document.getElementById(primaryInputIdForHash(window.location.hash));
      if (primaryInput) {
        primaryInput.checked = true;
        return;
      }
      if (!isStayHash()) return;
      var stayInput = document.getElementById('view-stay');
      if (stayInput) stayInput.checked = true;
    }

    function selectStayLinkForHash(menu) {
      var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));
      return links.filter(function (item) {
        return item.getAttribute('href') === window.location.hash;
      })[0] || links[0] || null;
    }

    function activateStaySectionLink(link, updateHash) {
      if (!link) return false;
      var menu = link.closest('.stay-section-menu');
      var planner = link.closest('.stay-planner-layout');
      var id = (link.getAttribute('href') || '').replace(/^#/, '');
      if (!menu || !planner || !id) return false;
      var target = planner.querySelector('#' + id);
      if (!target) return false;
      Array.prototype.slice.call(planner.querySelectorAll('.stay-section-panel')).forEach(function (section) {
        var isActive = section === target;
        section.classList.toggle('is-active', isActive);
        section.removeAttribute('hidden');
      });
      Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]')).forEach(function (item) {
        var isActive = item.getAttribute('href') === '#' + id;
        if (isActive) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });
      if (updateHash && window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search + '#' + id);
      }
      activateStayTabForHash();
      return true;
    }

    function activateStaySectionForHash() {
      Array.prototype.slice.call(document.querySelectorAll('.stay-section-menu')).forEach(function (menu) {
        activateStaySectionLink(selectStayLinkForHash(menu), false);
      });
      activateStayTabForHash();
    }

    Array.prototype.slice.call(document.querySelectorAll('.persona-tablist label[for]')).forEach(function (label) {
      label.addEventListener('click', function () {
        if (label.getAttribute('for') !== 'view-stay') {
          clearStayHash();
          return;
        }
        activateStaySectionForHash();
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('.stay-section-menu')).forEach(function (menu) {
      if (menu.__cityStayMenuBound) return;
      menu.__cityStayMenuBound = true;
      activateStaySectionLink(selectStayLinkForHash(menu), false);
      menu.addEventListener('click', function (event) {
        var link = event.target.closest('a[href^="#"]');
        if (!link) return;
        activateStaySectionLink(link, false);
      });
    });

    if (!document.__cityStayCaptureBound) {
      document.__cityStayCaptureBound = true;
      document.addEventListener('click', function (event) {
        var closest = event.target.closest;
        if (typeof closest !== 'function') return;
        var link = event.target.closest('.stay-section-menu a[href^="#"]');
        if (!link) return;
        activateStaySectionLink(link, false);
      }, true);
    }

    // In-copy links (e.g. attraction/airport names auto-linked inside the overview text)
    // repeat the same hash on every click, so a native hashchange event never fires the
    // second time. Force re-activation directly on click instead of relying on hashchange.
    if (!document.__cityInlineLinkCaptureBound) {
      document.__cityInlineLinkCaptureBound = true;
      document.addEventListener('click', function (event) {
        var closest = event.target.closest;
        if (typeof closest !== 'function') return;
        var link = event.target.closest('a[href^="#"]');
        if (!link || link.closest('.stay-section-menu')) return;
        window.setTimeout(activateStayTabForHash, 0);
      }, true);
    }

    activateStaySectionForHash();
    window.addEventListener('hashchange', activateStaySectionForHash);
  });

  // ====================================================================
  // Module: cityStayBookingForms
  // Builds Booking.com affiliate links from city stay form choices.
  // ====================================================================
  OneSlider.register('cityStayBookingForms', function () {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-city-stay-booking]'));
    if (!forms.length) return;

    function clampNumber(value, fallback, min, max) {
      var number = Number(value);
      if (!Number.isFinite(number)) number = fallback;
      number = Math.max(min, Math.min(max, Math.round(number)));
      return String(number);
    }

    function appendBookingParam(parts, key, value) {
      if (value == null || value === '') return;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
    }

    function affiliateHref(base, target) {
      var separator = base.indexOf('?') === -1 ? '?url=' : (/[?&]url=$/.test(base) ? '' : '&url=');
      return base + separator + encodeURIComponent(target);
    }

    forms.forEach(function (form) {
      var base = form.getAttribute('data-booking-base') || '';
      var submit = form.querySelector('[data-stay-submit]');
      if (!base || !submit) return;

      function selectedRegion() {
        var checked = form.querySelector('[data-stay-region]:checked');
        return checked ? checked.value : '';
      }

      function update() {
        var params = [];
        appendBookingParam(params, 'ss', selectedRegion());
        appendBookingParam(params, 'checkin', (form.querySelector('[data-stay-checkin]') || {}).value || '');
        appendBookingParam(params, 'checkout', (form.querySelector('[data-stay-checkout]') || {}).value || '');
        appendBookingParam(params, 'group_adults', clampNumber((form.querySelector('[data-stay-guests]') || {}).value, 2, 1, 10));
        appendBookingParam(params, 'no_rooms', clampNumber((form.querySelector('[data-stay-rooms]') || {}).value, 1, 1, 5));
        submit.href = affiliateHref(base, 'https://www.booking.com/searchresults.html?' + params.join('&'));
      }

      form.addEventListener('change', update);
      form.addEventListener('input', update);
      update();
    });
  });

})();
