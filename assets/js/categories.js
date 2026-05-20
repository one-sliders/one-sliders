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
  if (!tabs.length) return;

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
})();
