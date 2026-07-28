// 1회 진입: the drag drives the fold, and letting go decides where it lands.
//
// Scroll position is still the progress — pull an inch and it opens an inch — but the
// screen no longer keeps travelling on its own once you stop. On release it commits:
// past a quarter of the way it completes the fold, short of that it returns. That is
// the difference between "it moved while I held it" and "it ran off without me".
(function () {
  var screen = document.getElementById('djScreen');
  if (!screen) return;
  var TRAVEL = 300;            // scroll distance that takes the hero fully folded
  var OPEN = TRAVEL + 40;      // where a committed fold settles
  var raf = 0, holding = false;

  function progress() { return Math.max(0, Math.min(1, screen.scrollTop / TRAVEL)); }

  function paint() {
    raf = 0;
    var v = progress().toFixed(4);
    screen.style.setProperty('--p', v);
    document.documentElement.style.setProperty('--p', v);   // the grab bar sits outside the scroller
  }
  screen.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  paint();

  // Commit on release. Only while the fold is in between — once the sheet is properly
  // open the page is an ordinary scroller and must be left alone.
  function settle() {
    if (holding) return;
    var p = progress();
    if (p <= 0 || p >= 1) return;
    screen.scrollTo({ top: p > 0.25 ? OPEN : 0, behavior: 'smooth' });
  }
  ['pointerdown', 'touchstart'].forEach(function (e) {
    screen.addEventListener(e, function () { holding = true; }, { passive: true });
  });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (e) {
    screen.addEventListener(e, function () {
      holding = false;
      setTimeout(settle, 60);      // let the last scroll frame land first
    }, { passive: true });
  });

  // Tapping the grab bar does the same thing the drag does, just on its own.
  var grab = document.getElementById('djGrab');
  if (grab) grab.addEventListener('click', function (e) {
    e.preventDefault();
    screen.scrollTo({ top: OPEN, behavior: 'smooth' });
  });
})();
