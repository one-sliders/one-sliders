// 4_tab-hash.js — nivå 4-modul (DEC-0009): öppnar rätt flik när URL-fragmentet
// pekar in i en flikpanel, t.ex. #edition-2028 → History-fliken. Så landar en
// Google-träff på "2028 UEFA Champions League" på rätt flik (FEATURE-0019,
// Anders 2026-08-21). Läser panel-id ↔ flikkontroll via for/id-kontraktet —
// inga klassgissningar (DEC-0011-andan), ingen effekt på sidor utan flikar.
(function () {
  function openFor(hash) {
    if (!hash || hash.length < 2) return;
    var target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    var panel = target.closest('.event-tab-panel');
    if (!panel || !panel.id) return;
    var radio = document.getElementById(panel.id.replace('panel-', 'tab-'));
    if (radio && !radio.checked) {
      radio.checked = true;
      // Att satta .checked i kod utloser INTE 'change'. oneslider-core.js
      // lyssnar pa just den handelsen for att rakna om bokningsfaltens
      // datumoverlagg — de matar sitt falt, och ett falt i en dold flik mater
      // 0 x 0. Utan den har raden last vi tabbet utan att nagon fick veta det,
      // och bokningens datum sag tomma ut (Anders 2026-08-31: "booking delen
      // ar sonder"). Handelsen ar kontraktet; kringga det inte med CSS.
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (target.scrollIntoView) target.scrollIntoView({ block: 'nearest' });
  }
  function init() {
    openFor(location.hash);
    window.addEventListener('hashchange', function () { openFor(location.hash); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
