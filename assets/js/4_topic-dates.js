(function () {
  'use strict';

  var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function cleanPath(value) {
    try {
      var url = new URL(value, window.location.href);
      var pathname = url.pathname.replace(/\/Templates\/test(?=\/|$)/i, '');
      return pathname.replace(/\/index\.html$/i, '/').replace(/\/+/g, '/');
    } catch (error) {
      return String(value || '').split(/[?#]/)[0];
    }
  }

  function dateValue(value) {
    return ISO_DATE.test(String(value || '')) ? Date.parse(value + 'T00:00:00Z') : Infinity;
  }

  function dateLabel(start, end) {
    if (!ISO_DATE.test(start || '')) return '';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var first = new Date(start + 'T00:00:00Z');
    var last = ISO_DATE.test(end || '') ? new Date(end + 'T00:00:00Z') : first;
    var firstLabel = first.getUTCDate() + ' ' + months[first.getUTCMonth()] + ' ' + first.getUTCFullYear();
    var lastLabel = last.getUTCDate() + ' ' + months[last.getUTCMonth()] + ' ' + last.getUTCFullYear();
    return firstLabel === lastLabel ? firstLabel : firstLabel + ' - ' + lastLabel;
  }

  function registryEvents(payload) {
    return Array.isArray(payload) ? payload : (payload && Array.isArray(payload.events) ? payload.events : []);
  }

  function hydrate(payload) {
    var byUrl = new Map();
    var bySlug = new Map();
    registryEvents(payload).forEach(function (entry) {
      var url = cleanPath(entry.url || entry.href || entry.eventPageEN || '');
      if (url) byUrl.set(url, entry);
      if (entry.slug) bySlug.set(String(entry.slug), entry);
    });

    document.querySelectorAll('.event-grid, .league-events, .music-topic-event-grid').forEach(function (grid) {
      var matched = [];
      grid.querySelectorAll(':scope > .event-card, :scope > li').forEach(function (card, index) {
        var link = card.matches('a') ? card : card.querySelector('a[href]');
        var entry = link ? byUrl.get(cleanPath(link.href || link.getAttribute('href'))) : null;
        if (!entry && link) {
          var slugMatch = cleanPath(link.href || link.getAttribute('href')).match(/\/([^/]+)\.html$/);
          entry = slugMatch ? bySlug.get(slugMatch[1]) : null;
        }
        var start = String(entry ? (entry.startDate || entry.start || '') : (card.dataset.start || ''));
        var end = String(entry ? (entry.endDate || entry.end || start) : (card.dataset.end || start));
        var time = card.querySelector('time');
        if (entry && entry.nextEditionAnnounced === false && time) {
          time.textContent = 'Next edition not announced';
          time.removeAttribute('datetime');
        }
        if (time && start) {
          time.textContent = dateLabel(start, end) || time.textContent;
          time.setAttribute('datetime', start);
        }
        card.dataset.start = start;
        card.dataset.end = end;
        matched.push({ card: card, index: index, end: dateValue(end || start), start: dateValue(start), title: (card.querySelector('strong') || {}).textContent || '' });
      });
      matched.sort(function (a, b) {
        var aPast = a.end < Date.now();
        var bPast = b.end < Date.now();
        if (aPast !== bPast) return aPast ? 1 : -1;
        return a.start - b.start || a.title.localeCompare(b.title) || a.index - b.index;
      }).forEach(function (item) { grid.appendChild(item.card); });
    });
  }

  var registerUrl = /\/Templates\/test(?:\/|$)/i.test(window.location.pathname)
    ? '/Templates/test/events.register.json'
    : '/events.register.json';

  fetch(registerUrl, { cache: 'no-cache' })
    .then(function (response) { if (!response.ok) throw new Error('events.register.json ' + response.status); return response.json(); })
    .then(hydrate)
    .catch(function () { /* Static HTML remains the no-JS fallback. */ });
}());
