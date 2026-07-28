// 1회 진입: scroll position IS the transition. No thresholds, no snapping — --p is just
// how far you have dragged, so a slow pull opens it slowly and reversing closes it the
// same way, in both directions.
(function () {
  var screen = document.getElementById('djScreen');
  if (!screen) return;
  var TRAVEL = 300;                       // px of scroll that takes the hero fully folded
  var raf = 0;

  function paint() {
    raf = 0;
    var p = Math.max(0, Math.min(1, screen.scrollTop / TRAVEL));
    var v = p.toFixed(4);
    screen.style.setProperty('--p', v);
    document.documentElement.style.setProperty('--p', v);   // the grab bar sits outside the scroller
  }
  screen.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  paint();

  // Tapping the grab bar does the same thing the drag does, just on its own.
  var grab = document.getElementById('djGrab');
  if (grab) grab.addEventListener('click', function (e) {
    e.preventDefault();
    screen.scrollTo({ top: TRAVEL + 40, behavior: 'smooth' });
  });
})();
