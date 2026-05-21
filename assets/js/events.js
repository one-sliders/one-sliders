(function () {
  'use strict';

  var savedKey = 'os_saved_events_v1';

  function readJson(id) {
    var node = document.getElementById(id);
    if (!node) return null;
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return null;
    }
  }

  function country(item) {
    if (!item) return '';
    var image = item.flag ? '<img src="' + item.flag + '" alt="" width="20" height="14">' : '';
    if (!item.url || !item.name) return item.name || 'TBC';
    return '<a class="country" href="' + item.url + '">' + image + item.name + '</a>';
  }

  function countries(items) {
    return (items || []).map(country).join(' ');
  }

  function city(item) {
    if (!item) return 'TBC';
    if (!item.url) return item.name || 'TBC';
    return '<a class="city-link" href="' + item.url + '">' + item.name + '</a>';
  }

  function clockText(diff) {
    var totalSeconds = Math.max(0, Math.floor(Math.abs(diff) / 1000));
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;
    if (days > 0) return days + ' days ' + hours + 'h ' + minutes + 'm ' + seconds + 's';
    return hours + 'h ' + minutes + 'm ' + seconds + 's';
  }

  function daysText(startDate, nextDate) {
    var start = new Date(startDate + 'T00:00:00');
    var now = new Date();
    if (isNaN(start.getTime())) return 'TBC';
    var diff = start.getTime() - now.getTime();
    if (diff >= 0) return clockText(diff) + ' to go';
    if (nextDate) {
      var next = new Date(nextDate + 'T00:00:00');
      if (!isNaN(next.getTime())) return clockText(next.getTime() - now.getTime()) + ' to next edition';
    }
    return clockText(diff) + ' ago';
  }

  function hasValidDate(value) {
    if (!value) return false;
    var date = new Date(value + 'T00:00:00');
    return !isNaN(date.getTime());
  }

  function fact(label, html) {
    return '<div class="fact"><span>' + label + '</span><strong>' + html + '</strong></div>';
  }

  function question(item) {
    return '<div class="question"><span>' + item.q + '</span><strong>' + item.a + '</strong><p>' + item.detail + '</p></div>';
  }

  function highlight(item) {
    return '<div class="card"><span>' + item.label + '</span><strong>' + item.title + '</strong><p>' + item.detail + '</p></div>';
  }

  function sourceCard(data) {
    if (!data) return '';
    var links = (data.sources || []).map(function (item) {
      return '<a href="' + item.url + '">' + item.label + '</a>';
    }).join(' · ');
    return '<div class="card sources"><span>Sources</span><strong>Last updated: ' + (data.lastUpdated || 'TBC') + '</strong><p>' + (links || 'Source list TBC') + '</p></div>';
  }

  function isPlaceholderText(value) {
    var text = String(value || '').toLowerCase();
    return !text ||
      text.indexOf('tbc') >= 0 ||
      text.indexOf('to be confirmed') >= 0 ||
      text.indexOf('pending') >= 0 ||
      text.indexOf('add verified') >= 0 ||
      text.indexOf('once verified') >= 0 ||
      text.indexOf('final result not entered') >= 0 ||
      text.indexOf('archive details') >= 0 ||
      text.indexOf('detailed results') >= 0 ||
      text.indexOf('past edition details') >= 0;
  }

  function isPlaceholderArchive(item) {
    if (!item) return false;
    return isPlaceholderText([item.label, item.title, item.detail].join(' '));
  }

  function standingRows(items) {
    if (!items || !items.length) return '';
    return '<div class="standing-list">' + items.map(function (item) {
      return '<div class="standing-row"><strong>' + item.rank + '</strong><span>' + country(item.team) + '</span><em>' + item.note + '</em></div>';
    }).join('') + '</div>';
  }

  function resultRows(items) {
    if (!items || !items.length) return '';
    return '<div class="result-list">' + items.map(function (item) {
      return '<div class="result-row"><span>' + item.label + '</span><strong>' + country(item.home) + ' ' + item.score + ' ' + country(item.away) + '</strong></div>';
    }).join('') + '</div>';
  }

  function renderEdition(data, year) {
    var edition = data.editions.find(function (item) { return String(item.year) === String(year); }) || data.editions[0];
    var target = document.querySelector('[data-year-edition]');
    var heading = document.querySelector('[data-year-heading]');
    if (!target || !edition) return;
    if (heading) heading.textContent = data.eventName + ' ' + edition.year + ' ' + edition.headingPlace;
    var editionCountries = edition.countries || [];
    var editionCities = edition.cities || [];

    var countdownTarget = edition.countdownDate || edition.startDate;
    var countdownLabel = edition.countdownLabel || 'Event starts';
    var lifecycleLabel = edition.lifecycleLabel || 'Result';
    var resultTitle = edition.winner ? country(edition.winner) : (edition.resultLabel || '');
    var pastHasSpecificResult = edition.winner || (!!edition.result && !isPlaceholderText(edition.result));
    var lifecycle = edition.status === 'past'
      ? pastHasSpecificResult
        ? '<div class="card"><span>' + lifecycleLabel + '</span><strong>' + (resultTitle || 'Confirmed result') + '</strong><p>' + edition.result + '</p></div>'
        : ''
      : edition.status === 'ongoing'
        ? '<div class="countdown countdown--live"><span>In progress</span><strong>' + (edition.liveLabel || 'Live now') + '</strong><p>' + edition.countdownText + '</p></div>'
        : '<div class="countdown" data-countdown="' + countdownTarget + '" data-next-date="' + (edition.nextDate || '') + '"><span>' + countdownLabel + '</span><strong>' + daysText(countdownTarget, edition.nextDate) + '</strong><p>' + edition.countdownText + '</p></div>';

    var questionBlocks = (edition.questions || []).map(question).join('');
    var highlightBlocks = (edition.highlights || []).filter(function (item) {
      return edition.status !== 'past' || !isPlaceholderArchive(item);
    }).map(highlight).join('');
    var editionBlocks = edition.status === 'past'
      ? highlightBlocks
      : (questionBlocks || highlightBlocks);
    var finalResults = edition.status === 'past' && edition.finalStandings
      ? '<div class="card card--standings"><span>Top results</span><strong>Top finishers</strong>' + standingRows(edition.finalStandings) + '</div>'
      : '';
    var medalGames = edition.status === 'past' && edition.medalGames
      ? '<div class="card card--standings"><span>Medal games</span><strong>Results</strong>' + resultRows(edition.medalGames) + '</div>'
      : '';

    var editionDetails = editionBlocks ? '<div class="question-grid">' + editionBlocks + '</div>' : '';
    var actions = edition.status === 'past' || !hasValidDate(edition.startDate) ? '' :
      '<div class="actions-row">' +
        '<button class="event-button" type="button" data-calendar-download>Add to calendar</button>' +
        '<button class="event-button" type="button" data-save-event="' + data.slug + '" data-save-label="Save / remind me" data-saved-label="Saved">Save / remind me</button>' +
      '</div>';

    target.innerHTML =
      '<div class="facts-strip">' +
        fact('Country', countries(editionCountries) || 'TBC') +
        fact('City', editionCities.map(city).join(' ') || 'TBC') +
        fact('Venue', edition.venue) +
        fact('Dates', edition.dates) +
        fact('Status', edition.statusLabel) +
        fact('Format', edition.format) +
      '</div>' +
      lifecycle +
      finalResults +
      medalGames +
      editionDetails +
      actions +
      sourceCard(data);

    bindCalendar(data, edition);
    bindSaveButtons();
    refreshCountdowns();
  }

  function initYearSwitcher() {
    var data = readJson('event-year-data');
    var switcher = document.querySelector('[data-year-switcher]');
    if (!data || !switcher) return;

    var switcherEditions = data.editions.slice().sort(function (a, b) {
      return Number(b.year) - Number(a.year);  // newest year first
    });
    function requestedYearFromLocation() {
      var hashMatch = (window.location.hash || '').match(/^#year-(\d{4})$/);
      var queryYear = new URLSearchParams(window.location.search).get('year');
      var year = hashMatch ? hashMatch[1] : queryYear;
      return switcherEditions.some(function (edition) { return String(edition.year) === String(year); })
        ? Number(year)
        : data.defaultYear;
    }

    function labelFor(edition) {
      return edition.year + (edition.year === data.defaultYear ? ' current' : '');
    }

    function selectYear(year) {
      switcher.querySelectorAll('[data-year]').forEach(function (item) {
        var active = String(item.getAttribute('data-year')) === String(year);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
        var edition = switcherEditions.find(function (candidate) {
          return String(candidate.year) === String(item.getAttribute('data-year'));
        });
        if (edition) item.textContent = labelFor(edition);
      });
      try {
        renderEdition(data, year);
      } catch (error) {
        window.__eventRenderErrors = window.__eventRenderErrors || [];
        window.__eventRenderErrors.push(String(error && error.message ? error.message : error));
      }
    }

    var requestedYear = requestedYearFromLocation();

    switcher.innerHTML = switcherEditions.map(function (edition) {
      var pressed = edition.year === requestedYear ? 'true' : 'false';
      var label = labelFor(edition);
      return '<button class="year-button" type="button" aria-pressed="' + pressed + '" data-year="' + edition.year + '">' + label + '</button>';
    }).join('');

    switcher.addEventListener('click', function (event) {
      var button = event.target.closest('[data-year]');
      if (!button) return;
      var year = button.getAttribute('data-year');
      selectYear(year);
      if (history.replaceState) history.replaceState(null, '', '#year-' + year);
    });

    selectYear(requestedYear);
    window.addEventListener('hashchange', function () {
      var nextYear = requestedYearFromLocation();
      if (String(nextYear) !== String(requestedYear)) {
        requestedYear = nextYear;
        selectYear(nextYear);
      }
    });
  }

  function renderPart(data, id) {
    var parts = data.parts || [];
    var part = parts.find(function (item) { return item.id === id; }) || parts[0];
    var target = document.querySelector('[data-part-detail]');
    if (!target || !part) return;

    var facts = (part.facts || []).map(function (item) {
      return fact(item.label, item.value);
    }).join('');

    function markResultWinners(html) {
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      wrapper.querySelectorAll('.match-result').forEach(function (row) {
        var score = row.querySelector('.match-score');
        var teams = row.querySelectorAll('.country');
        if (!score || teams.length < 2) return;
        var text = score.textContent || '';
        var values = text.match(/\d+/g);
        if (!values || values.length < 2) return;
        var home = Number(values[0]);
        var away = Number(values[1]);
        if (home === away) return;
        teams[home > away ? 0 : 1].classList.add('country--winner');
      });
      return wrapper.innerHTML;
    }

    var blocks = (part.blocks || []).map(function (item) {
      var className = item.className ? ' ' + item.className : '';
      var detail = item.className && item.className.indexOf('part-card--results') >= 0 ? markResultWinners(item.detail) : item.detail;
      return '<div class="part-card' + className + '">' +
        '<span>' + item.label + '</span>' +
        '<strong>' + item.title + '</strong>' +
        '<p>' + detail + '</p>' +
      '</div>';
    }).join('');

    target.innerHTML =
      '<article class="part-page" data-current-part="' + part.id + '">' +
        '<div class="part-page__header">' +
          '<span>Sub event</span>' +
          '<h3>' + part.title + '</h3>' +
          '<p>' + part.summary + '</p>' +
        '</div>' +
        '<div class="facts-strip">' + facts + '</div>' +
        '<div class="part-page__grid">' + blocks + '</div>' +
      '</article>';
  }

  function initPartSwitcher() {
    var data = readJson('event-part-data');
    var switcher = document.querySelector('[data-part-switcher]');
    if (!data || !switcher || !data.parts || !data.parts.length) return;

    var defaultPart = data.defaultPart || data.parts[0].id;
    switcher.innerHTML = data.parts.map(function (part) {
      var pressed = part.id === defaultPart ? 'true' : 'false';
      return '<button class="year-button part-button" type="button" aria-pressed="' + pressed + '" data-part="' + part.id + '">' + part.label + '</button>';
    }).join('');

    switcher.addEventListener('click', function (event) {
      var button = event.target.closest('[data-part]');
      if (!button) return;
      switcher.querySelectorAll('[data-part]').forEach(function (item) {
        item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
      });
      renderPart(data, button.getAttribute('data-part'));
    });

    renderPart(data, defaultPart);
  }

  function refreshCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach(function (node) {
      var strong = node.querySelector('strong');
      if (strong) strong.textContent = daysText(node.getAttribute('data-countdown'), node.getAttribute('data-next-date'));
    });
  }

  function bindCalendar(data, edition) {
    document.querySelectorAll('[data-calendar-download]').forEach(function (button) {
      button.onclick = function () {
        var ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//OneSliders//' + data.eventName + '//EN',
          'BEGIN:VEVENT',
          'UID:' + data.slug + '-' + edition.year + '@one-sliders.com',
          'DTSTAMP:20260517T000000Z',
          'DTSTART;VALUE=DATE:' + edition.startDate.replace(/-/g, ''),
          'DTEND;VALUE=DATE:' + edition.endExclusive.replace(/-/g, ''),
          'SUMMARY:' + data.eventName + ' ' + edition.year,
          'DESCRIPTION:' + edition.calendarDescription,
          'URL:' + location.href.split('#')[0] + '#year',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        var blob = new Blob([ics], { type: 'text/calendar' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = data.slug + '-' + edition.year + '.ics';
        link.click();
        URL.revokeObjectURL(url);
      };
    });
  }

  function readSaved() {
    try { return JSON.parse(localStorage.getItem(savedKey) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeSaved(value) {
    try { localStorage.setItem(savedKey, JSON.stringify(value)); }
    catch (error) { return; }
  }

  function bindSaveButtons() {
    document.querySelectorAll('[data-save-event]').forEach(function (button) {
      var id = button.getAttribute('data-save-event');
      var label = button.getAttribute('data-save-label') || 'Save';
      var savedLabel = button.getAttribute('data-saved-label') || 'Saved';
      function paint() {
        var active = !!readSaved()[id];
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.textContent = active ? savedLabel : label;
      }
      button.onclick = function () {
        var saved = readSaved();
        if (saved[id]) delete saved[id];
        else saved[id] = { title: document.title, savedAt: new Date().toISOString() };
        writeSaved(saved);
        paint();
      };
      paint();
    });
  }

  function initCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    var track = carousel.querySelector('[data-carousel-track]');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var prevButton = carousel.querySelector('[data-carousel-prev]');
    var nextButton = carousel.querySelector('[data-carousel-next]');
    var dots = carousel.querySelector('[data-carousel-dots]');
    var labels = { general: 'General', year: 'Year', parts: 'Stages' };
    var index = 0;
    var touchStartX = 0;
    var touchStartY = 0;

    if (!track || !slides.length) return;

    if (dots) {
      dots.innerHTML = slides.map(function (slide, slideIndex) {
        var key = slide.getAttribute('data-slide') || slide.id || ('Slide ' + (slideIndex + 1));
        var label = labels[key] || key;
        return '<button type="button" data-carousel-dot="' + slideIndex + '" aria-label="Show ' + label + '">' + label + '</button>';
      }).join('');
    }

    function slideIndexFromHash() {
      var id = window.location.hash ? window.location.hash.slice(1) : '';
      id = id.replace(/^year-\d{4}$/, 'year');
      var found = slides.findIndex(function (slide) { return slide.id === id; });
      return found >= 0 ? found : 0;
    }

    function resetScroll() {
      carousel.scrollLeft = 0;
      track.scrollLeft = 0;
      window.scrollTo(0, 0);
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }

    function paint(keepHash) {
      var width = carousel.getBoundingClientRect().width || window.innerWidth || document.documentElement.clientWidth;
      track.style.transform = 'translate3d(-' + (index * width) + 'px, 0, 0)';
      resetScroll();
      window.requestAnimationFrame(resetScroll);
      if (prevButton) prevButton.hidden = index === 0;
      if (nextButton) nextButton.hidden = index === slides.length - 1;
      if (dots) {
        dots.querySelectorAll('[data-carousel-dot]').forEach(function (button, dotIndex) {
          button.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
        });
      }
      if (!keepHash && slides[index] && history.replaceState) {
        history.replaceState(null, '', '#' + slides[index].id);
      }
    }

    function goTo(nextIndex, keepHash) {
      index = Math.max(0, Math.min(slides.length - 1, nextIndex));
      paint(keepHash);
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        goTo(index - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        goTo(index + 1);
      });
    }

    if (dots) {
      dots.addEventListener('click', function (event) {
        var button = event.target.closest('[data-carousel-dot]');
        if (!button) return;
        goTo(Number(button.getAttribute('data-carousel-dot')) || 0);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href').slice(1);
        var found = slides.findIndex(function (slide) { return slide.id === id; });
        if (found < 0) return;
        event.preventDefault();
        goTo(found);
      });
    });

    window.addEventListener('hashchange', function () {
      goTo(slideIndexFromHash(), true);
    });

    window.addEventListener('resize', function () {
      paint(true);
    });

    document.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target.tagName)) return;
      if (event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'ArrowLeft') goTo(index - 1);
    });

    carousel.addEventListener('touchstart', function (event) {
      if (!event.touches || !event.touches.length) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchend', function (event) {
      if (!event.changedTouches || !event.changedTouches.length) return;
      var dx = event.changedTouches[0].clientX - touchStartX;
      var dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    track.style.transition = 'none';
    goTo(slideIndexFromHash(), true);
    window.requestAnimationFrame(function () {
      track.style.transition = '';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initYearSwitcher();
    initPartSwitcher();
    refreshCountdowns();
    bindSaveButtons();
    window.setInterval(refreshCountdowns, 1000);
  });
}());
