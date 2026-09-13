// 4_edition-active.js — nivå 4-modul (DEC-0009, FEATURE-0019):
// Anders modell: alla år ligger alltid i sidan som upplagekort; VILKET kort
// som är aktivt avgörs när sidan VISAS, inte när den byggdes. Har det byggda
// aktiva kortets slutdatum passerat flyttar modulen .is-active till nästa
// kommande kort (högerspalten) och lägger det passerade överst i historiken
// (vänsterspalten) — sidan är rätt utan ombygge. Bygget sätter .is-active
// som no-JS-fallback.
(function () {
  function isoDate(el, attr) {
    var v = el.getAttribute(attr);
    if (!v) return null;
    var d = new Date(v + 'T23:59:59');
    return isNaN(d) ? null : d;
  }

  // Passerat event utan kommande upplaga (Anders 2026-08-27): "om eventet
  // passerat a vi inte har neste event.. ska save event knappen doljas..
  // datumet nar det var ska fortfarande finnas. lokation ska fortfarande
  // finnas.. men Travel fliken ska doljas".
  //
  // Avgors NAR SIDAN VISAS, inte vid bygget — en sida som byggdes medan
  // eventet var kommande blir passerad utan ombygge, och da ska knappen och
  // fliken forsvinna av sig sjalva. Samma modell som .is-active ovan.
  function markeraPasserat() {
    var slot = document.querySelector('[data-os-edition-slot]');
    if (!slot) return;
    var active = slot.querySelector('.event-edition.is-active');
    if (!active) return;
    var end = isoDate(active, 'data-edition-end');
    var now = new Date();
    if (!end || end >= now) return;          // pagar eller kommer

    // Finns nagon kommande upplaga kvar nagonstans pa sidan? Da ar eventet
    // inte avslutat, bara det aktiva kortet.
    var kommande = false;
    document.querySelectorAll('.event-edition').forEach(function (card) {
      if (kommande || card === active) return;
      var e = isoDate(card, 'data-edition-end');
      var st = isoDate(card, 'data-edition-start');
      if ((e && e >= now) || (!e && st && st >= now)) kommande = true;
      if (!e && !st) kommande = true;         // syntetiskt "datum ej satt"-kort
    });
    if (kommande) return;

    document.body.setAttribute('data-os-event-past', '');
  }

  function init() {
    var slot = document.querySelector('[data-os-edition-slot]');
    var list = document.querySelector('[data-os-editions]');
    if (!slot || !list) return;
    var coming = list.querySelector('[data-os-editions-coming]') || list;
    var past = list.querySelector('[data-os-editions-past]') || list;
    var active = slot.querySelector('.event-edition.is-active');
    if (!active) return;
    var end = isoDate(active, 'data-edition-end');
    var now = new Date();
    if (!end || end >= now) return;
    var next = null;
    coming.querySelectorAll('.event-edition').forEach(function (card) {
      if (next) return;
      var cardEnd = isoDate(card, 'data-edition-end');
      var cardStart = isoDate(card, 'data-edition-start');
      if ((cardEnd && cardEnd >= now) || (!cardEnd && cardStart && cardStart >= now)) {
        next = card;
      }
    });
    if (!next) {
      next = coming.querySelector('.event-edition:not([data-edition-end])');
    }
    if (!next) return;
    active.classList.remove('is-active');
    next.classList.add('is-active');
    var pastLabel = past.querySelector('.event-editions__label');
    if (pastLabel && pastLabel.nextSibling) {
      past.insertBefore(active, pastLabel.nextSibling);
    } else {
      past.appendChild(active);
    }
    slot.appendChild(next);
  }

  // Item-flikens rader doljs NAR datumet passerat, inte nar sidan byggdes.
  // Anders 2026-08-31: "har du gjort sa att mer scorpions fliken doljer event
  // automatiskt nar datum passerat?" — nej, de filtrerades i bygget, sa ett
  // datum som passerade dagen efter lag kvar tills nasta korning. Samma regel
  // som for Save event: tidsbaserat vid VISNING, aldrig i bygget.
  function rensaItemRader() {
    var panel = document.getElementById('panel-item');
    if (!panel) return;
    var idag = new Date().toISOString().slice(0, 10);
    var rader = panel.querySelectorAll('tbody tr[data-os-event-date]');
    var kvar = 0;
    for (var i = 0; i < rader.length; i++) {
      if (rader[i].getAttribute('data-os-event-date') < idag) {
        rader[i].hidden = true;
      } else {
        kvar++;
      }
    }
    var etikett = document.querySelector('label[for="tab-item"] small');
    if (etikett) {
      etikett.textContent = kvar + (kvar === 1 ? ' upcoming date' : ' upcoming dates');
    }
    // Inga datum kvar: fliken lovar nagot den inte kan halla — den utgar.
    if (kvar === 0) {
      var label = document.querySelector('label[for="tab-item"]');
      var input = document.getElementById('tab-item');
      if (label) label.hidden = true;
      panel.hidden = true;
      if (input && input.checked) {
        var forsta = document.getElementById('tab-overview');
        if (forsta) {
          forsta.checked = true;
          forsta.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }

  function start() { init(); markeraPasserat(); rensaItemRader(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
