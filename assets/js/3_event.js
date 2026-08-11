/* Event page behavior. */
(function () {
  'use strict';
  OneSlider.register('eventSchema', function () {
    var source = document.body.getAttribute('data-event-schema');
    if (!source) return;
    var schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.textContent = source;
    document.head.appendChild(schema);
  });
  OneSlider.register('eventTabHashLinks', function () {
    if (!document.querySelector('.event-tabs')) return;
    function applyHash() {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      var panel = target.closest('.event-tab-panel');
      var tab = panel && document.getElementById(panel.id.replace('panel-', 'tab-'));
      if (tab) tab.checked = true;
      requestAnimationFrame(function () { target.scrollIntoView({ block: 'start', behavior: 'auto' }); });
    }
    applyHash();
    addEventListener('hashchange', applyHash);
  });
  OneSlider.register('eventStayBooking', function () {
    document.querySelectorAll('[data-event-stay], [data-national-day-stay]').forEach(function (root) {
      var base = root.getAttribute('data-booking-base') || '';
      var country = root.getAttribute('data-booking-country') || '';
      var button = root.querySelector('#stay-booking-btn');
      if (!base || !button) return;
      function value(id, fallback) {
        var input = root.querySelector('#' + id);
        return input && input.value ? input.value : fallback;
      }
      function update() {
        var selected = root.querySelector('input[name="stay-region"]:checked');
        var region = selected && selected.value ? selected.value : country;
        button.href = base + 'ss%3D' + encodeURIComponent(region + ', ' + country)
          + '%26checkin%3D' + encodeURIComponent(value('stay-checkin', ''))
          + '%26checkout%3D' + encodeURIComponent(value('stay-checkout', ''))
          + '%26group_adults%3D' + encodeURIComponent(value('stay-guests', '2'))
          + '%26no_rooms%3D' + encodeURIComponent(value('stay-rooms', '1'));
      }
      root.addEventListener('change', update);
      update();
    });
  });
})();
