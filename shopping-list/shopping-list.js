(function () {
  'use strict';

  var KEY = 'oneslider-shopping-list';
  var activeRecipe = 'all';

  // Ingredient categories — order determines priority when a word matches multiple
  var CATS = [
    { name: 'Meat & fish',     icon: '🥩', kw: ['beef','chicken','pork','lamb','veal','fish','salmon','tuna','shrimp','prawn','bacon','sausage','ham','turkey','duck','mince','minced','steak','chuck','loin','fillet','anchov','sardine','cod','herring','mackerel','crab','lobster','mussel','venison','boar','chorizo','salami','pancetta','lardons'] },
    { name: 'Dairy & eggs',    icon: '🥚', kw: ['egg','butter','cheese','milk','cream','yogurt','yoghurt','sour cream','creme fraiche','mascarpone','parmesan','mozzarella','ricotta','feta','cheddar','gouda','brie','emmental','gruyere','cream cheese','quark','cottage cheese','fromage'] },
    { name: 'Vegetables',      icon: '🥕', kw: ['onion','garlic','carrot','potato','tomato','pepper','capsicum','cabbage','spinach','lettuce','mushroom','zucchini','courgette','eggplant','aubergine','leek','celery','broccoli','cauliflower','pea','corn','cucumber','gurk','beetroot','beet','radish','turnip','parsnip','fennel','artichoke','asparagus','kale','chard','spring onion','scallion','shallot','sweet potato','squash','pumpkin','bean','lentil','chickpea','celeriac'] },
    { name: 'Herbs & spices',  icon: '🌿', kw: ['paprika','cumin','coriander','oregano','thyme','rosemary','basil','parsley','dill','mint','sage','bay leaf','bay','chili','chilli','curry','turmeric','cinnamon','nutmeg','cardamom','saffron','vanilla','allspice','caraway','star anise','salt','pepper','seasoning','marjoram','tarragon','fenugreek','sumac','garam masala','clove'] },
    { name: 'Grains & pasta',  icon: '🌾', kw: ['flour','rice','pasta','bread','noodle','oat','barley','semolina','polenta','couscous','quinoa','tortilla','pita','breadcrumb','crumb','dumpling','rye','spelt','bulgur','farro','lasagne','spaghetti','penne','tagliatelle','rigatoni'] },
    { name: 'Oils & sauces',   icon: '🫙', kw: ['oil','vinegar','soy sauce','tomato paste','ketchup','mustard','mayonnaise','pesto','tahini','honey','syrup','molasses','worcestershire','fish sauce','oyster sauce','hot sauce','sriracha','miso','harissa','ghee','lard','balsamic','hoisin'] },
    { name: 'Stock & liquids', icon: '🥣', kw: ['stock','broth','wine','beer','water','juice','coconut milk','coconut cream'] },
    { name: 'Fruit & nuts',    icon: '🍋', kw: ['apple','lemon','lime','orange','grape','berry','banana','mango','pineapple','cherry','peach','pear','plum','walnut','almond','cashew','pistachio','peanut','hazelnut','pine nut','raisin','currant','date','fig','apricot','pomegranate','kiwi','melon','coconut','avocado','olive','prune'] },
  ];

  // ── Storage ────────────────────────────────────────────────────
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch (e) {}
  }

  // ── Helpers ────────────────────────────────────────────────────
  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Split "700 g beef chuck" → {amount:"700 g", name:"beef chuck"}
  var UNIT_RE = /^(\d+[.,/]?\d*)\s*(tbsp|tsp|cups?|g|kg|ml|dl|cl|l|oz|lbs?|pcs?|st|x|pieces?|cloves?|handfuls?|pinch(?:es)?|slices?|bunches?|cans?|bottles?|heads?|sprigs?)?\s+(.+)$/i;

  function parseIngredient(text) {
    var m = text.match(UNIT_RE);
    if (m) {
      return { amount: m[1] + (m[2] ? ' ' + m[2] : ''), name: m[3].trim() };
    }
    return { amount: '', name: text.trim() };
  }

  function parseIngredientDetail(text) {
    var m = String(text || '').match(UNIT_RE);
    if (m) {
      return {
        amount: m[1] + (m[2] ? ' ' + normalizeUnit(m[2]) : ''),
        amountValue: parseAmountNumber(m[1]),
        unit: normalizeUnit(m[2] || ''),
        name: m[3].trim()
      };
    }
    return { amount: '', amountValue: null, unit: '', name: String(text || '').trim() };
  }

  function parseAmountNumber(value) {
    var clean = String(value || '').replace(',', '.');
    if (clean.indexOf('/') !== -1) {
      var parts = clean.split('/');
      var top = Number(parts[0]);
      var bottom = Number(parts[1]);
      return bottom ? top / bottom : null;
    }
    var number = Number(clean);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeUnit(unit) {
    var u = String(unit || '').toLowerCase();
    var aliases = {
      tablespoons: 'tbsp',
      tablespoon: 'tbsp',
      teaspoons: 'tsp',
      teaspoon: 'tsp',
      cups: 'cup',
      kilos: 'kg',
      grams: 'g',
      litres: 'l',
      liters: 'l',
      ounces: 'oz',
      pounds: 'lb',
      lbs: 'lb',
      pieces: 'pc',
      piece: 'pc',
      pcs: 'pc',
      cloves: 'clove',
      handfuls: 'handful',
      pinches: 'pinch',
      slices: 'slice',
      bunches: 'bunch',
      cans: 'can',
      bottles: 'bottle',
      heads: 'head',
      sprigs: 'sprig'
    };
    return aliases[u] || u;
  }

  function normalizeItemName(name) {
    var text = String(name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.endsWith('ies') && text.length > 4) {
      text = text.slice(0, -3) + 'y';
    } else if (text.endsWith('oes') && text.length > 4) {
      text = text.slice(0, -2);
    } else if (text.endsWith('s') && !text.endsWith('ss') && text.length > 3) {
      text = text.slice(0, -1);
    }
    var aliases = {
      gurka: 'cucumber',
      gurkor: 'cucumber'
    };
    return aliases[text] || text;
  }

  function formatNumber(value) {
    if (Math.abs(value - Math.round(value)) < 0.001) return String(Math.round(value));
    return String(Math.round(value * 100) / 100).replace(/\.0+$/, '');
  }

  function catIndex(name) {
    for (var i = 0; i < CATS.length; i++) { if (CATS[i].name === name) return i; }
    return 999;
  }
  function catByName(name) {
    for (var i = 0; i < CATS.length; i++) { if (CATS[i].name === name) return CATS[i]; }
    return { icon: '📦', name: name };
  }
  function categorize(ingredientName) {
    var lower = ingredientName.toLowerCase();
    for (var i = 0; i < CATS.length; i++) {
      var kw = CATS[i].kw;
      for (var j = 0; j < kw.length; j++) {
        if (lower.indexOf(kw[j]) !== -1) return CATS[i].name;
      }
    }
    return 'Other';
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateSummary(items, groups) {
    var checked = 0;
    var recipes = {};
    items.forEach(function (item) {
      if (item.checked) checked++;
      if (item.recipe) recipes[item.recipe] = true;
    });
    var visibleGroups = groups || [];
    var checkedGroups = visibleGroups.filter(function (group) { return group.checked; }).length;

    setText('sl-total', String(visibleGroups.length || items.length));
    setText('sl-checked', String(visibleGroups.length ? checkedGroups : checked));
    setText('sl-recipes', String(Object.keys(recipes).length));
    setText('sl-status', items.length ? (checked === items.length ? 'Done' : 'Open') : 'Empty');
  }

  // ── Render ─────────────────────────────────────────────────────
  function recipeInfos(items) {
    var byRecipe = {};
    items.forEach(function (item) {
      var recipe = item.recipe || 'Recipe';
      if (!byRecipe[recipe]) {
        byRecipe[recipe] = {
          name: recipe,
          url: item.recipeUrl || '',
          count: 0
        };
      }
      byRecipe[recipe].count++;
      if (!byRecipe[recipe].url && item.recipeUrl) byRecipe[recipe].url = item.recipeUrl;
    });
    return Object.keys(byRecipe).sort().map(function (name) { return byRecipe[name]; });
  }

  function renderFilters(items) {
    var filter = document.getElementById('sl-filter');
    if (!filter) return;

    var recipes = recipeInfos(items);
    if (!recipes.length) {
      filter.innerHTML = '';
      filter.hidden = true;
      activeRecipe = 'all';
      return;
    }

    var hasActive = activeRecipe === 'all' || recipes.some(function (recipe) {
      return recipe.name === activeRecipe;
    });
    if (!hasActive) activeRecipe = 'all';

    var html = '<button type="button" class="sl-filter-btn' +
      (activeRecipe === 'all' ? ' is-active' : '') +
      '" data-recipe-filter="all">All</button>';

    recipes.forEach(function (recipe) {
      html += '<button type="button" class="sl-filter-btn' +
        (recipe.name === activeRecipe ? ' is-active' : '') +
        '" data-recipe-filter="' + esc(recipe.name) + '">' +
        esc(recipe.name) +
        '</button>';
    });

    filter.innerHTML = html;
    filter.hidden = false;
    filter.querySelectorAll('[data-recipe-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeRecipe = button.getAttribute('data-recipe-filter') || 'all';
        render();
      });
    });
  }

  function visibleItems(items) {
    if (activeRecipe === 'all') return items.slice();
    return items.filter(function (item) { return (item.recipe || 'Recipe') === activeRecipe; });
  }

  function addAmount(group, parsed) {
    if (parsed.amountValue !== null && Number.isFinite(parsed.amountValue)) {
      var key = parsed.unit || '';
      if (!group.amounts[key]) group.amounts[key] = 0;
      group.amounts[key] += parsed.amountValue;
      return;
    }
    if (parsed.amount) group.looseAmounts[parsed.amount] = true;
  }

  function formatAmount(group) {
    var parts = Object.keys(group.amounts).sort().map(function (unit) {
      return formatNumber(group.amounts[unit]) + (unit ? ' ' + unit : '');
    });
    Object.keys(group.looseAmounts).sort().forEach(function (amount) {
      if (amount) parts.push(amount);
    });
    return parts.join(' + ');
  }

  function buildGroups(items) {
    var byKey = {};
    items.forEach(function (item) {
      var parsed = parseIngredientDetail(item.text);
      var itemKey = normalizeItemName(parsed.name) || parsed.name.toLowerCase();
      var cat = categorize(parsed.name);
      var key = cat + '|' + itemKey;

      if (!byKey[key]) {
        byKey[key] = {
          key: key,
          cat: cat,
          name: parsed.name,
          amounts: {},
          looseAmounts: {},
          ids: [],
          recipes: {},
          recipeUrls: {},
          checkedCount: 0,
          count: 0
        };
      }

      byKey[key].ids.push(item.id);
      byKey[key].count++;
      if (item.checked) byKey[key].checkedCount++;
      byKey[key].recipes[item.recipe || 'Recipe'] = true;
      if (item.recipeUrl) byKey[key].recipeUrls[item.recipe || 'Recipe'] = item.recipeUrl;
      addAmount(byKey[key], parsed);
    });

    return Object.keys(byKey).map(function (key) {
      var group = byKey[key];
      group.amount = formatAmount(group);
      group.checked = group.count > 0 && group.checkedCount === group.count;
      group.partial = group.checkedCount > 0 && group.checkedCount < group.count;
      group.recipeNames = Object.keys(group.recipes).sort();
      return group;
    }).sort(function (a, b) {
      var byCat = catIndex(a.cat) - catIndex(b.cat);
      if (byCat) return byCat;
      return a.name.localeCompare(b.name);
    });
  }

  function renderChart(groups) {
    var chart = document.getElementById('sl-chart');
    if (!chart) return;

    var counts = {};
    (groups || []).forEach(function (group) {
      counts[group.cat] = (counts[group.cat] || 0) + 1;
    });

    var rows = Object.keys(counts).map(function (catName) {
      return { label: catName, value: counts[catName] };
    }).sort(function (a, b) {
      if (b.value !== a.value) return b.value - a.value;
      return catIndex(a.label) - catIndex(b.label);
    });

    if (!rows.length) rows = [{ label: 'Items', value: 0 }];

    var max = rows.reduce(function (top, row) {
      return Math.max(top, row.value);
    }, 1);

    var html = '<h3>Category mix</h3>';
    rows.forEach(function (row) {
      var width = max ? Math.round((row.value / max) * 100) : 0;
      html += '<div class="sl-chart-row">'
        + '<span class="sl-chart-label">' + esc(row.label) + '</span>'
        + '<span class="sl-chart-track"><span class="sl-chart-fill" style="--chart-value:' + width + '"></span></span>'
        + '<strong class="sl-chart-value">' + esc(row.value) + '</strong>'
        + '</div>';
    });

    chart.innerHTML = html;
  }

  function render() {
    var items   = load();
    var content = document.getElementById('sl-content');
    var empty   = document.getElementById('sl-empty');
    var actions = document.getElementById('sl-actions');
    var filter  = document.getElementById('sl-filter');

    renderFilters(items);

    if (!items.length) {
      content.innerHTML = '';
      empty.hidden   = false;
      actions.hidden = true;
      if (filter) filter.hidden = true;
      renderChart([]);
      updateSummary(items, []);
      return;
    }

    var filtered = visibleItems(items);
    var groups = buildGroups(filtered);
    renderChart(groups);
    updateSummary(items, groups);

    empty.hidden   = true;
    actions.hidden = false;

    var catOrder = [];
    var catGroups = {};
    groups.forEach(function (group) {
      if (!catGroups[group.cat]) {
        catGroups[group.cat] = [];
        catOrder.push(group.cat);
      }
      catGroups[group.cat].push(group);
    });
    catOrder.sort(function (a, b) { return catIndex(a) - catIndex(b); });

    var html = '<table class="sl-table"><tbody>';
    catOrder.forEach(function (catName) {
      var cat = catByName(catName);
      html += '<tr class="sl-cat-row"><td colspan="3">'
            + '<span class="sl-cat-icon">' + cat.icon + '</span>'
            + esc(catName) + '</td></tr>';

      catGroups[catName].forEach(function (group) {
        html += '<tr class="sl-row' + (group.checked ? ' sl-row--checked' : '') + '">';
        html += '<td class="sl-col-check">'
              + '<label class="sl-checkbox-label">'
              + '<input type="checkbox" data-ids="' + esc(group.ids.join('|')) + '"' +
              (group.checked ? ' checked' : '') +
              (group.partial ? ' data-partial="true"' : '') + '>'
              + '</label></td>';
        html += '<td class="sl-col-amount">' + esc(group.amount) + '</td>';
        html += '<td class="sl-col-name">' + esc(group.name) + '</td>';
        html += '</tr>';
      });
    });
    html += '</tbody></table>';
    content.innerHTML = html;

    // Bind checkboxes
    content.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      if (cb.getAttribute('data-partial') === 'true') cb.indeterminate = true;
      cb.addEventListener('change', function () {
        var current = load();
        var ids = (cb.getAttribute('data-ids') || '').split('|');
        current.forEach(function (i) {
          if (ids.indexOf(i.id) !== -1) i.checked = cb.checked;
        });
        save(current);
        render();
      });
    });
  }

  // ── Button handlers ────────────────────────────────────────────
  document.getElementById('sl-clear-checked').addEventListener('click', function () {
    save(load().filter(function (i) { return !i.checked; }));
    render();
  });
  document.getElementById('sl-clear-all').addEventListener('click', function () {
    if (confirm('Clear the entire shopping list?')) { save([]); render(); }
  });

  render();
  window.addEventListener('focus', render);
})();
