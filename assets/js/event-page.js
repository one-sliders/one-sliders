/* OneSliders event-page modules
 * Loaded on event and topic pages after oneslider-core.js.
 * Requires window.OneSlider (defined by oneslider-core.js, listed first).
 */
(function () {
  'use strict';

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
        if (track.closest('.continent-region-stack, .continent-onepage')) return;
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
        carousel.appendChild(track);
        carousel.appendChild(controls);
        track.setAttribute('data-continent-carousel-track', '');
        if (!track.hasAttribute('tabindex')) track.setAttribute('tabindex', '0');
      });
    }

    function upgradeCountryCards(carousel) {
      var chips = Array.prototype.slice.call(carousel.querySelectorAll(
        '.country-chip:not(.country-chip--with-hero):not(.country-chip--area)'
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
        carousel.appendChild(controls);
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

  OneSlider.register('eventTabHashLinks', function () {
    var tabs = document.querySelector('.event-tabs');
    if (!tabs) return;

    function tabIdForPanel(panelId) {
      return panelId ? panelId.replace('panel-', 'tab-') : '';
    }

    function targetFromHash(hash) {
      var clean = decodeURIComponent(String(hash || '').replace(/^#/, ''));
      if (!clean) return null;
      return document.getElementById(clean);
    }

    function scrollToTarget(target) {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          var hadTabIndex = target.hasAttribute('tabindex');
          if (!hadTabIndex) target.setAttribute('tabindex', '-1');
          var nav = document.querySelector('.top-menu, .event-nav');
          var navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
          target.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
          if (navHeight) window.scrollBy(0, -(navHeight + 10));
          if (!hadTabIndex) {
            target.addEventListener('blur', function () {
              target.removeAttribute('tabindex');
            }, { once: true });
          }
        });
      });
    }

    function applyHash() {
      var target = targetFromHash(window.location.hash);
      if (!target) return;
      var panel = target.closest('.event-tab-panel');
      if (!panel) {
        scrollToTarget(target);
        return;
      }
      var input = document.getElementById(tabIdForPanel(panel.id));
      if (input && input.name === 'event-tab') {
        input.checked = true;
      }
      scrollToTarget(target);
      window.setTimeout(function () {
        scrollToTarget(target);
      }, 180);
    }

    applyHash();
    window.addEventListener('hashchange', applyHash);
  });

  OneSlider.register('eventStayBooking', function () {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-event-stay], [data-national-day-stay]'));
    if (!roots.length) return;

    roots.forEach(function (root) {
      var base = root.getAttribute('data-booking-base') || '';
      var country = root.getAttribute('data-booking-country') || '';
      var button = root.querySelector('#stay-booking-btn');
      if (!button || !base) return;

      function value(id, fallback) {
        var field = root.querySelector('#' + id);
        return field && field.value ? field.value : fallback;
      }

      function update() {
        var area = root.querySelector('input[name="stay-region"]:checked');
        var region = area && area.value ? area.value : country;
        var url = base + 'ss%3D' + encodeURIComponent(region + ', ' + country) +
          '%26checkin%3D' + encodeURIComponent(value('stay-checkin', '')) +
          '%26checkout%3D' + encodeURIComponent(value('stay-checkout', '')) +
          '%26group_adults%3D' + encodeURIComponent(value('stay-guests', '2')) +
          '%26no_rooms%3D' + encodeURIComponent(value('stay-rooms', '1'));

        button.href = url;
      }

      root.addEventListener('change', function (event) {
        var target = event.target;
        if (!target) return;
        if (target.name === 'stay-region' || target.id === 'stay-checkin' || target.id === 'stay-checkout' || target.id === 'stay-guests' || target.id === 'stay-rooms') {
          update();
        }
      });

      update();
    });
  });

})();
