/* Minimal shared module runtime for pages using the numbered asset model. */
(function () {
  'use strict';
  var modules = [];
  var booted = false;
  var app = window.OneSlider = window.OneSlider || {};
  app.register = function (name, factory) {
    modules.push({ name: name, factory: factory });
    if (booted) factory(app);
  };
  function boot() {
    booted = true;
    modules.forEach(function (module) { module.factory(app); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
