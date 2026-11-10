/* 4_topic-destinations.js — destinationsväljarens klientlogik (generisk).
   Anders 2026-10-28: one-slide per skärmtyp. Landschipsen byter innehållet i
   EN yta ([data-dest-stage]); default = ALLA orter (Anders 2026-11-09:
   inget kuraterat urval - det beslutet togs aldrig).
   Vy: tabell (default, jämförbarhet) eller kort. Fulltabell och fullista står
   kvar i HTML som reserv — utan skript är tabellen sidans lista. Filtren ändrar
   aldrig URL:en. Säsongsläget räknas om mot DAGENS datum vid visning. */
(function () {
  'use strict';
  var root = document.querySelector('[data-dest-filters]');
  var list = document.querySelector('[data-dest-list]');
  var stage = document.querySelector('[data-dest-stage]');
  if (!root || !list) return;

  var today = new Date(); today.setHours(0, 0, 0, 0);
  function iso(d) { return new Date(d + 'T00:00:00'); }
  function stateFor(el) {
    var s = el.getAttribute('data-season-start'), e = el.getAttribute('data-season-end');
    if (!s) return null;
    var start = iso(s), end = e ? iso(e) : null;
    if (end && today > end && (today - end) > 1000 * 60 * 60 * 24 * 200) {
      start.setFullYear(start.getFullYear() + 1); end.setFullYear(end.getFullYear() + 1);
    }
    return today < start ? 'upcoming' : (end && today > end ? 'closed' : 'open');
  }
  // Kort
  Array.prototype.forEach.call(list.querySelectorAll('.dest-card__season'), function (p) {
    var state = stateFor(p); if (!state) return;
    var card = p.closest('.dest-card'); if (card) card.setAttribute('data-open', state);
    p.className = 'dest-card__season dest-card__season--' + state;
    var label = p.querySelector('.dest-card__season-state');
    if (label) label.textContent = state === 'open' ? 'Open now' : state === 'upcoming' ? 'Opens' : 'Closed for the season';
  });
  // Tabellrader
  Array.prototype.forEach.call(list.querySelectorAll('td.dest-table__season'), function (td) {
    var state = stateFor(td); if (!state) return;
    var row = td.closest('tr'); if (row) row.setAttribute('data-open', state);
    td.className = 'dest-table__season dest-card__season--' + state;
    if (state === 'open') td.textContent = 'Open now';
    else if (state === 'closed') td.textContent = 'Closed';
  });

  var cards = Array.prototype.slice.call(list.querySelectorAll('.dest-card'));
  var rows = Array.prototype.slice.call(list.querySelectorAll('tr.dest-row'));
  var fullTable = list.querySelector('table.dest-table');
  var countryName = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-filter="country"]'), function (b) {
    countryName[b.getAttribute('data-value')] = b.textContent;
  });
  var active = { country: 'all', chip: 'all', flag: {}, open: false, view: 'table', sort: null, dir: 1 };
  var count = document.querySelector('[data-dest-count]');
  var empty = document.querySelector('[data-dest-empty]');
  var grid = stage ? stage.querySelector('[data-dest-stage-grid]') : null;
  var tableWrap = stage ? stage.querySelector('[data-dest-stage-table]') : null;
  var stageTable = tableWrap ? tableWrap.querySelector('table') : null;
  var title = stage ? stage.querySelector('[data-dest-stage-title]') : null;
  if (stageTable && fullTable) stageTable.querySelector('thead').innerHTML = fullTable.querySelector('thead').innerHTML;

  function matches(el) {
    var ok = (active.chip === 'all' || (' ' + el.getAttribute('data-chips') + ' ').indexOf(' ' + active.chip + ' ') !== -1)
      && (!active.open || el.getAttribute('data-open') === 'open');
    Object.keys(active.flag).forEach(function (k) {
      if (active.flag[k] && (' ' + el.getAttribute('data-flags') + ' ').indexOf(' ' + k + ' ') === -1) ok = false;
    });
    return ok;
  }
  function narrowed() {
    return active.chip !== 'all' || active.open || Object.keys(active.flag).some(function (k) { return active.flag[k]; });
  }
  function pool(items) {
    if (active.country !== 'all') return items.filter(function (c) { return c.getAttribute('data-country') === active.country; });
    return items;
  }
  function sortRows(selected) {
    if (!active.sort || !fullTable) return selected;
    var idx = Array.prototype.map.call(fullTable.querySelectorAll('thead button'), function (b) { return b.getAttribute('data-sort-key'); }).indexOf(active.sort);
    if (idx < 0) return selected;
    var numeric = fullTable.querySelectorAll('thead button')[idx].getAttribute('data-sort-type') === 'number';
    return selected.slice().sort(function (a, b) {
      var ca = a.children[idx], cb = b.children[idx];
      var va = ca.getAttribute('data-sort') || ca.textContent.trim(), vb = cb.getAttribute('data-sort') || cb.textContent.trim();
      if (numeric) {
        // Saknat tal (data-sort="-1") hamnar alltid sist, oavsett riktning.
        va = parseFloat(va); vb = parseFloat(vb);
        var ma = !(va >= 0), mb = !(vb >= 0);
        if (ma || mb) return ma === mb ? 0 : (ma ? 1 : -1);
        return (va - vb) * active.dir;
      }
      return va.localeCompare(vb) * active.dir;
    });
  }

  function apply() {
    var label = active.country !== 'all' ? (countryName[active.country] || '') : 'All resorts';
    var shownRows = sortRows(pool(rows).filter(matches));
    var shownCards = pool(cards).filter(matches);
    if (stage && stageTable && grid) {
      list.hidden = true; stage.hidden = false;
      var tbody = stageTable.querySelector('tbody'); tbody.textContent = '';
      shownRows.forEach(function (r) { tbody.appendChild(r.cloneNode(true)); });
      grid.textContent = '';
      shownCards.forEach(function (c) { grid.appendChild(c.cloneNode(true)); });
      tableWrap.hidden = active.view !== 'table';
      grid.hidden = active.view !== 'cards';
      if (title) title.textContent = label + ' · ' + shownRows.length + (shownRows.length === 1 ? ' resort' : ' resorts');
    }
    if (count) {
      count.hidden = !(active.country !== 'all' || narrowed());
      count.textContent = shownRows.length + ' of ' + rows.length + ' resorts';
    }
    if (empty) empty.hidden = shownRows.length !== 0;
  }

  root.addEventListener('click', function (ev) {
    var b = ev.target.closest('.dest-filter__btn');
    if (!b) return;
    var f = b.getAttribute('data-filter'), v = b.getAttribute('data-value');
    if (f === 'country' || f === 'chip') {
      active[f] = v;
      Array.prototype.forEach.call(root.querySelectorAll('[data-filter="' + f + '"]'), function (x) { x.classList.toggle('is-active', x === b); });
    } else if (f === 'flag') {
      active.flag[v] = !active.flag[v]; b.classList.toggle('is-active', active.flag[v]);
    } else if (f === 'open') {
      active.open = !active.open; b.classList.toggle('is-active', active.open);
    }
    apply();
  });
  if (stage) {
    stage.addEventListener('click', function (ev) {
      var vb = ev.target.closest('.dest-view__btn');
      if (vb) {
        active.view = vb.getAttribute('data-view');
        Array.prototype.forEach.call(stage.querySelectorAll('.dest-view__btn'), function (x) { x.classList.toggle('is-active', x === vb); });
        apply(); return;
      }
      var sb = ev.target.closest('thead button[data-sort-key]');
      if (sb) {
        var key = sb.getAttribute('data-sort-key');
        active.dir = active.sort === key ? -active.dir : 1; active.sort = key;
        Array.prototype.forEach.call(stage.querySelectorAll('thead button'), function (x) {
          x.setAttribute('aria-sort', x === sb ? (active.dir === 1 ? 'ascending' : 'descending') : 'none');
          x.classList.toggle('is-sorted', x === sb);
        });
        apply();
      }
    });
  }
  apply();
})();
