(function () {
  'use strict';
  function escapeHtml(value) {
    return String(value).replace(/[&<>\"']/g, function (character) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'}[character];
    });
  }

  function siteHref(value) {
    return value && value.charAt(0) === '/' ? value.slice(1) : value;
  }
  function formatDate(start, end) {
    var options = { day: 'numeric', month: 'short', year: 'numeric' };
    var first = new Date(start + 'T00:00:00').toLocaleDateString(undefined, options);
    var last = new Date(end + 'T00:00:00').toLocaleDateString(undefined, options);
    return start === end ? first : first + ' – ' + last;
  }
  function getEligibleEvents(events, today) {
    var todayIso = today.toISOString().slice(0, 10);
    var eligible = events.filter(function (item) {
      return item && item.startDate && item.endDate && item.endDate >= todayIso;
    });
    if (!eligible.length) {
      var nextYear = today.getFullYear() + 1;
      eligible = events.filter(function (item) { return Number(item.startDate.slice(0, 4)) >= nextYear; });
    }
    if (!eligible.length) eligible = events.slice();
    return eligible.sort(function (a, b) { return a.startDate.localeCompare(b.startDate); });
  }
  function init() {
    var dataNode = document.getElementById('featured-events');
    var root = document.querySelector('.featured-slides');
    var dotsRoot = document.querySelector('.carousel-dots');
    if (!dataNode || !root) return;
    var events;
    try { events = JSON.parse(dataNode.textContent || '[]'); } catch (error) { return; }
    if (!Array.isArray(events) || !events.length) return;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var upcoming = getEligibleEvents(events, today);
    var slides = [];
    var dots = [];
    var current = 0;
    root.textContent = '';
    if (dotsRoot) dotsRoot.textContent = '';
    upcoming.forEach(function (item, index) {
      var slide = document.createElement('div');
      slide.className = 'carousel-slide' + (index === 0 ? ' active' : '');
      slide.innerHTML = '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" width="768" height="403" loading="' + (index === 0 ? 'eager' : 'lazy') + '" decoding="async">' +
        '<div class="featured-content"><div class="featured-copy"><h2>' + escapeHtml(item.title) + '</h2>' +
        '<div class="fact-rows"><span><span aria-hidden="true">Date</span> ' + escapeHtml(formatDate(item.startDate, item.endDate)) + '</span></div></div>' +
        '<div class="edition-card"><small>Featured event</small><strong>' + escapeHtml(formatDate(item.startDate, item.endDate)) + '</strong>' +
        '<a href="' + escapeHtml(siteHref(item.url)) + '">View full One-Slider -&gt;</a></div></div>';
      root.appendChild(slide);
      slides.push(slide);
      if (dotsRoot) {
        var dot = document.createElement('button');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show featured event ' + (index + 1));
        dotsRoot.appendChild(dot);
        dots.push(dot);
      }
    });
    function goTo(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) { slide.classList.toggle('active', slideIndex === current); });
      dots.forEach(function (dot, dotIndex) { dot.classList.toggle('active', dotIndex === current); });
    }
    dots.forEach(function (dot, index) { dot.addEventListener('click', function () { goTo(index); }); });
    var previous = document.querySelector('[aria-label="Previous featured guide"]');
    var next = document.querySelector('[aria-label="Next featured guide"]');
    if (previous) previous.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
