(function () {
  'use strict';

  function initFeaturedCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.carousel-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dots .dot'));
    var prev = document.querySelector('[aria-label="Previous featured guide"]');
    var next = document.querySelector('[aria-label="Next featured guide"]');
    if (!slides.length) return;

    var current = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('active');
    }));

    function loadSlide(index) {
      var image = slides[index] && slides[index].querySelector('img[data-src]');
      if (image) {
        image.src = image.getAttribute('data-src');
        image.removeAttribute('data-src');
      }
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      loadSlide(current);
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    loadSlide(current);

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeaturedCarousel, { once: true });
  } else {
    initFeaturedCarousel();
  }
})();
