// 평소 → 1회 진입 → 올릴때: the drag drives the fold, and letting go picks a stop.
//
// Three states, not a free slide. 1회 진입 is a real resting place — the card has shrunk
// and Explore Packs has appeared, but nothing inside the hero has moved yet, so it reads
// as a hint that there is more below rather than as the transition already happening.
// Only past that stop does the hero fold into the creator header.
//
//   --p  raw fold, 0 → 1, drives the card edge (780 − p·549)
//   --q  second stage only, 0 at 1회 진입 → 1 at 올릴때. Everything that MOVES reads this
//        one, which is what keeps the first stage still.
(function () {
  var screen = document.getElementById('djScreen');
  if (!screen) return;
  var TRAVEL = 300;            // scroll distance that takes the hero fully folded
  var STOP = 0.2;              // 1회 진입: card edge at 663, matching the Figma frame
  // Exactly TRAVEL, not a pixel more: at TRAVEL the sheet sits flush against the folded
  // header. Overshooting slides it up OVER the header's bottom, which is what was
  // swallowing the creator line and the tag.
  var OPEN = TRAVEL;           // where a committed fold settles
  var HINT = STOP * TRAVEL;    // 64px — the 1회 진입 stop, in scroll
  var raf = 0, holding = false, idle = 0, snapping = 0;

  function progress() { return Math.max(0, Math.min(1, screen.scrollTop / TRAVEL)); }

  function paint() {
    raf = 0;
    var p = progress();
    var s = Math.min(1, p / STOP);                             // 평소 → 1회 진입
    var q = Math.max(0, (p - STOP) / (1 - STOP));              // 1회 진입 → 올릴때
    var root = document.documentElement;          // the bottom bar sits outside the scroller
    [screen, root].forEach(function (el) {
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--s', s.toFixed(4));
      el.style.setProperty('--q', q.toFixed(4));
    });
    // Opacity alone would leave both Start buttons clickable through each other.
    root.classList.toggle('dj-open', q > 0.15);
  }

  // Land on a state. Past the open stop the page is an ordinary scroller and is left
  // alone; below it the nearest stop wins, biased low so a short pull still reaches
  // 1회 진입 rather than falling back.
  function settle() {
    if (holding || snapping) return;
    var y = screen.scrollTop;
    if (y >= OPEN) return;
    var target = y < HINT * 0.45 ? 0 : y < HINT + (OPEN - HINT) * 0.42 ? HINT : OPEN;
    if (Math.abs(y - target) < 2) return;
    snapping = 1;
    screen.scrollTo({ top: target, behavior: 'smooth' });
    setTimeout(function () { snapping = 0; }, 500);
  }

  screen.addEventListener('scroll', function () {
    if (!raf) raf = requestAnimationFrame(paint);
    // A wheel or a trackpad never sends pointerup, so settling on release alone left the
    // page parked between two states on desktop. Settling when the scrolling stops
    // covers both inputs.
    clearTimeout(idle);
    idle = setTimeout(settle, 140);
  }, { passive: true });
  paint();

  ['pointerdown', 'touchstart'].forEach(function (e) {
    screen.addEventListener(e, function () { holding = true; clearTimeout(idle); }, { passive: true });
  });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (e) {
    screen.addEventListener(e, function () {
      holding = false;
      setTimeout(settle, 60);      // let the last scroll frame land first
    }, { passive: true });
  });

  // Tapping a bottom bar advances one stop. Start is a real action sitting inside the
  // 평소 bar, so links keep their own behaviour.
  function step(e) {
    if (e.target.closest('a')) return;
    e.preventDefault();
    snapping = 1;
    screen.scrollTo({ top: screen.scrollTop < HINT - 2 ? HINT : OPEN, behavior: 'smooth' });
    setTimeout(function () { snapping = 0; }, 500);
  }
  ['djGrab', 'djExplore'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', step);
  });
})();
