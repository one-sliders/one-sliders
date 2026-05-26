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
      });

      recipePanels.forEach((panel, panelId) => {
        const active = panelId === id;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      });
    };

    recipeTabs.forEach((tab) => {
      tab.addEventListener("click", () => activateRecipeTab(tab.dataset.topicTab));
    });
  }
})();
