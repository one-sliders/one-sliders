(function () {
  var explicitLanguagePattern = /(^|\/)(en|sv|da|no|nb|nn|de|fr|ru|es|pt|ar|zh|hi|sw|ha|tpi|mi)(\/|$)/i;
  var localizedFilePattern = /\.(no|nb|nn|de|fr|ru|es|pt|ar|zh|hi|sw|ha|tpi|mi)\.html$/i;
  var path = window.location.pathname;

  if (explicitLanguagePattern.test(path) || localizedFilePattern.test(path)) return;

  var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
  var wantsNorwegian = languages.some(function (language) {
    return /^(no|nb|nn)(-|$)/i.test(language);
  });

  if (!wantsNorwegian) return;

  var norwegianAlternate = document.querySelector('link[rel="alternate"][hreflang="no"], link[rel="alternate"][hreflang="nb"], link[rel="alternate"][hreflang="nn"]');
  if (!norwegianAlternate || !norwegianAlternate.href) return;
  if (new URL(norwegianAlternate.href, window.location.href).pathname === path) return;

  var prompt = document.createElement('aside');
  prompt.className = 'language-suggest';
  prompt.setAttribute('aria-label', 'Language suggestion');
  prompt.innerHTML = '<span>Norsk versjon finnes.</span><a href="' + norwegianAlternate.href + '">Open Norwegian</a><button type="button" aria-label="Close language suggestion">&times;</button>';

  prompt.querySelector('button').addEventListener('click', function () {
    prompt.remove();
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(prompt);
  });
})();
