(function () {
  'use strict';

  var KEY = 'oneslider-shopping-list';

  // Ingredient categories — order determines priority when a word matches multiple
  var CATS = [
    { name: 'Meat & fish',     icon: '🥩', kw: ['beef','chicken','pork','lamb','veal','fish','salmon','tuna','shrimp','prawn','bacon','sausage','ham','turkey','duck','mince','minced','steak','chuck','loin','fillet','anchov','sardine','cod','herring','mackerel','crab','lobster','mussel','venison','boar','chorizo','salami','pancetta','lardons'] },
    { name: 'Dairy & eggs',    icon: '🥚', kw: ['egg','butter','cheese','milk','cream','yogurt','yoghurt','sour cream','creme fraiche','mascarpone','parmesan','mozzarella','ricotta','feta','cheddar','gouda','brie','emmental','gruyere','cream cheese','quark','cottage cheese','fromage'] },
    { name: 'Vegetables',      icon: '🥕', kw: ['onion','garlic','carrot','potato','tomato','pepper','capsicum','cabbage','spinach','lettuce','mushroom','zucchini','courgette','eggplant','aubergine','leek','celery','broccoli','cauliflower','pea','corn','cucumber','beetroot','beet','radish','turnip','parsnip','fennel','artichoke','asparagus','kale','chard','spring onion','scallion','shallot','sweet potato','squash','pumpkin','bean','lentil','chickpea','celeriac'] },
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

  // ── Render ─────────────────────────────────────────────────────
  function render() {
    var items   = load();
    var content = document.getElementById('sl-content');
    var empty   = document.getElementById('sl-empty');
    var actions = document.getElementById('sl-actions');

    if (!items.length) {
      content.innerHTML = '';
      empty.hidden   = false;
      actions.hidden = true;
      return;
    }
    empty.hidden   = true;
    actions.hidden = false;

    // Group items by ingredient category
    var catOrder  = [];
    var catGroups = {};
    items.forEach(function (item) {
      var parsed = parseIngredient(item.text);
      var cat    = categorize(parsed.name);
      if (!catGroups[cat]) { catGroups[cat] = []; catOrder.push(cat); }
      catGroups[cat].push({ item: item, parsed: parsed });
    });

    // Sort groups by canonical CATS order
    catOrder.sort(function (a, b) { return catIndex(a) - catIndex(b); });

    var html = '<table class="sl-table"><tbody>';
    catOrder.forEach(function (catName) {
      var cat = catByName(catName);
      html += '<tr class="sl-cat-row"><td colspan="4">'
            + '<span class="sl-cat-icon">' + cat.icon + '</span>'
            + esc(catName) + '</td></tr>';

      catGroups[catName].forEach(function (entry) {
        var item   = entry.item;
        var parsed = entry.parsed;
        html += '<tr class="sl-row' + (item.checked ? ' sl-row--checked' : '') + '">';
        html += '<td class="sl-col-check">'
              + '<label class="sl-checkbox-label">'
              + '<input type="checkbox" data-id="' + esc(item.id) + '"' + (item.checked ? ' checked' : '') + '>'
              + '</label></td>';
        html += '<td class="sl-col-amount">' + esc(parsed.amount) + '</td>';
        html += '<td class="sl-col-name">' + esc(parsed.name) + '</td>';
        html += '<td class="sl-col-recipe"><a href="' + esc(item.recipeUrl) + '">' + esc(item.recipe) + '</a></td>';
        html += '</tr>';
      });
    });
    html += '</tbody></table>';
    content.innerHTML = html;

    // Bind checkboxes
    content.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var current = load();
        var id = cb.getAttribute('data-id');
        current.forEach(function (i) { if (i.id === id) i.checked = cb.checked; });
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
