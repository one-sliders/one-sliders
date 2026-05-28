(function () {
  'use strict';

  var KEY = 'oneslider-shopping-list';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }

  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) {}
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    var items   = load();
    var content = document.getElementById('sl-content');
    var empty   = document.getElementById('sl-empty');
    var actions = document.getElementById('sl-actions');

    if (!items.length) {
      content.innerHTML = '';
      empty.hidden      = false;
      actions.hidden    = true;
      return;
    }

    empty.hidden   = true;
    actions.hidden = false;

    // Group by recipe, preserving insertion order
    var order  = [];
    var groups = {};
    items.forEach(function (item) {
      if (!groups[item.recipe]) {
        groups[item.recipe] = [];
        order.push(item.recipe);
      }
      groups[item.recipe].push(item);
    });

    var html = '';
    order.forEach(function (recipe) {
      var g = groups[recipe];
      var unchecked = g.filter(function (i) { return !i.checked; }).length;
      html += '<section class="sl-group">';
      html += '<h2 class="sl-group__title">';
      html += '<a href="' + esc(g[0].recipeUrl) + '">' + esc(recipe) + '</a>';
      if (unchecked < g.length) {
        html += '<span class="sl-group__count">' + unchecked + ' / ' + g.length + '</span>';
      }
      html += '</h2>';
      html += '<ul class="sl-list">';
      g.forEach(function (item) {
        html += '<li class="sl-item' + (item.checked ? ' sl-item--checked' : '') + '">';
        html += '<label>';
        html += '<input type="checkbox" data-id="' + esc(item.id) + '"' + (item.checked ? ' checked' : '') + '>';
        html += '<span>' + esc(item.text) + '</span>';
        html += '</label></li>';
      });
      html += '</ul></section>';
    });

    content.innerHTML = html;

    // Bind checkboxes
    content.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var current = load();
        var id = cb.getAttribute('data-id');
        current.forEach(function (item) {
          if (item.id === id) item.checked = cb.checked;
        });
        save(current);
        render();
      });
    });
  }

  document.getElementById('sl-clear-checked').addEventListener('click', function () {
    save(load().filter(function (i) { return !i.checked; }));
    render();
  });

  document.getElementById('sl-clear-all').addEventListener('click', function () {
    if (confirm('Clear the entire shopping list?')) {
      save([]);
      render();
    }
  });

  render();

  // Re-render when tab gains focus (another tab may have just added items)
  window.addEventListener('focus', render);
})();
