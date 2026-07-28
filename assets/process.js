// Process graph entrance. It fires when the card is actually looked at, not on load —
// on this page the card sits well below the fold, so animating at load means it has
// already finished by the time anyone gets there.
//
// Order matters: the bars grow leftward from the right edge (staggered top to bottom)
// carrying their own minute count from the first frame, and each right-hand label
// (STRETCH / LEARN / RUN!) only lands once its bar has stopped. The total counts up
// alongside them. Timings live in creator.css; this file just starts the clock.
(function () {
  var g = document.querySelector('.process-graph');
  if (!g) return;
  var num = g.querySelector('.big-number .num');
  var total = parseInt(num.textContent, 10) || 18;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function run() {
    g.classList.add('animate');
    if (reduce) { num.textContent = total; return; }
    var t0 = 0, DUR = 860;
    requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / DUR);
      num.textContent = Math.round(total * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    });
  }

  num.textContent = '0';
  // Rooted on the scroller, not the viewport: these screens scroll inside .screen, so a
  // viewport-rooted observer would report the card visible the whole time.
  var root = g.closest('.dj-screen, .creator-screen') || null;
  if (!('IntersectionObserver' in window)) { run(); return; }
  var io = new IntersectionObserver(function (entries) {
    if (!entries.some(function (e) { return e.isIntersecting; })) return;
    io.disconnect();
    run();
  }, { root: root, threshold: 0.45 });
  io.observe(g);
})();
