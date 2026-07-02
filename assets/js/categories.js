(() => {
  const backLink = document.querySelector("[data-category-back]");
  if (backLink) {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft") return;
      const target = event.target;
      const tagName = target && target.tagName ? target.tagName.toLowerCase() : "";
      if (tagName === "input" || tagName === "textarea" || tagName === "select" || target?.isContentEditable) return;
      window.location.href = backLink.href;
    });
  }

  const prevCategory = document.querySelector("[data-category-prev]");
  const nextCategory = document.querySelector("[data-category-next]");
  if (prevCategory || nextCategory) {
    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      const tagName = target && target.tagName ? target.tagName.toLowerCase() : "";
      if (tagName === "input" || tagName === "textarea" || tagName === "select" || target?.isContentEditable) return;
      if (event.key === "ArrowLeft" && prevCategory) {
        window.location.href = prevCategory.href;
      }
      if (event.key === "ArrowRight" && nextCategory) {
        window.location.href = nextCategory.href;
      }
    });
  }

  const tabs = Array.from(document.querySelectorAll("[data-sport-tab]"));
  if (tabs.length) {
    const panels = new Map(
      Array.from(document.querySelectorAll(".topic-group[id]")).map((panel) => [panel.id, panel])
    );

    const activate = (id) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.sportTab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach((panel, panelId) => {
        panel.classList.toggle("is-active", panelId === id);
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab.dataset.sportTab));
    });
  }

  const filterTabs = Array.from(document.querySelectorAll("[data-topic-filter]"));
  if (filterTabs.length) {
    const filterCards = Array.from(document.querySelectorAll("[data-topic-kind]"));
    const applyTopicFilter = (filter) => {
      filterTabs.forEach((tab) => {
        const active = tab.dataset.topicFilter === filter;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });

      filterCards.forEach((card) => {
        const kinds = (card.dataset.topicKind || "").split(" ");
        const visible = filter === "all" || kinds.includes(filter) || (filter === "grill" && kinds.includes("street"));
        card.hidden = !visible;
      });
    };

    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => applyTopicFilter(tab.dataset.topicFilter));
    });
  }

  const eventFilterPanels = Array.from(document.querySelectorAll("[data-event-filter-panel]"));
  const todayKey = new Date().toISOString().slice(0, 10);
  eventFilterPanels.forEach((panel) => {
    const section = panel.closest(".music-topic-card--events");
    const grid = section?.querySelector("[data-event-filter-grid]");
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll(".event-card"));
    const isPastEvent = (card) => {
      const end = card.dataset.end || card.dataset.start || "";
      return Boolean(end) && end < todayKey;
    };
    const activeCards = cards.filter((card) => !isPastEvent(card));
    cards.forEach((card) => {
      card.dataset.eventPast = isPastEvent(card) ? "true" : "false";
    });
    const reset = panel.querySelector("[data-event-filter-reset]");
    const chips = Array.from(panel.querySelectorAll("[data-event-filter]"));
    const count = panel.querySelector("[data-event-filter-count]");
    const empty = section.querySelector("[data-event-filter-empty]");
    const activeFilters = {
      artist: "all",
      country: "all",
    };

    const matchesFilters = (card, filters) => {
      return Object.entries(filters).every(([kind, value]) => {
        return value === "all" || card.dataset[kind] === value;
      });
    };

    const updateAvailableChips = () => {
      chips.forEach((chip) => {
        const kind = chip.dataset.eventFilter;
        const value = chip.dataset.eventFilterValue || "all";
        if (!kind || !(kind in activeFilters)) return;

        const relaxedFilters = { ...activeFilters, [kind]: "all" };
        const available = activeCards.some((card) => {
          return card.dataset[kind] === value && matchesFilters(card, relaxedFilters);
        });

        chip.hidden = !available;
        chip.disabled = !available;
      });
    };

    const setActiveChip = () => {
      const isReset = Object.values(activeFilters).every((value) => value === "all");
      reset?.classList.toggle("is-active", isReset);
      chips.forEach((chip) => {
        const kind = chip.dataset.eventFilter;
        const active = kind && activeFilters[kind] === chip.dataset.eventFilterValue;
        chip.classList.toggle("is-active", active);
      });
    };

    const applyEventFilter = () => {
      let visibleCount = 0;
      cards.forEach((card) => {
        const visible = card.dataset.eventPast !== "true" && matchesFilters(card, activeFilters);
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (count) {
        count.value = `${visibleCount} ${visibleCount === 1 ? "event" : "events"}`;
      }
      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
      updateAvailableChips();
      setActiveChip();
    };

    reset?.addEventListener("click", () => {
      Object.keys(activeFilters).forEach((kind) => {
        activeFilters[kind] = "all";
      });
      applyEventFilter();
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const kind = chip.dataset.eventFilter;
        const value = chip.dataset.eventFilterValue || "all";
        if (!kind || !(kind in activeFilters)) return;
        activeFilters[kind] = activeFilters[kind] === value ? "all" : value;
        applyEventFilter();
      });
    });

    applyEventFilter();
  });

  document.querySelectorAll("[data-event-filter-grid]").forEach((grid) => {
    if (grid.closest(".music-topic-card--events")?.querySelector("[data-event-filter-panel]")) return;
    Array.from(grid.querySelectorAll(".event-card")).forEach((card) => {
      const end = card.dataset.end || card.dataset.start || "";
      if (end && end < todayKey) {
        card.hidden = true;
      }
    });
  });

  const recipeTabs = Array.from(document.querySelectorAll("[data-topic-tab]"));
  if (recipeTabs.length) {
    const recipePanels = new Map(
      Array.from(document.querySelectorAll(".recipe-tab-panel[id]")).map((panel) => [panel.id, panel])
    );

    const activateRecipeTab = (id) => {
      recipeTabs.forEach((tab) => {
        const active = tab.dataset.topicTab === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
        if (active) {
          tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });

      recipePanels.forEach((panel, panelId) => {
        const active = panelId === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };

    recipeTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateRecipeTab(tab.dataset.topicTab));
      tab.addEventListener("keydown", (event) => {
        const currentIndex = recipeTabs.indexOf(tab);
        const nextKey = event.key === "ArrowRight" || event.key === "ArrowDown";
        const prevKey = event.key === "ArrowLeft" || event.key === "ArrowUp";
        if (!nextKey && !prevKey && event.key !== "Home" && event.key !== "End") return;

        event.preventDefault();
        let nextIndex = currentIndex;
        if (nextKey) nextIndex = (currentIndex + 1) % recipeTabs.length;
        if (prevKey) nextIndex = (currentIndex - 1 + recipeTabs.length) % recipeTabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = recipeTabs.length - 1;

        recipeTabs[nextIndex].focus();
        activateRecipeTab(recipeTabs[nextIndex].dataset.topicTab);
      });
    });
  }
})();
