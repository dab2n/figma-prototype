// Landing Balance heat position + Performance Scores entrance.
(function () {
  // The heat is placed off the reading, warm side toward the stronger foot. It used to
  // start centred and travel there once the card was reached; that move was the thing
  // nobody could stop noticing, which on a heat map is backwards — it should read as a
  // state, not as an event. It is simply in the right place when it fades up.
  var seen = false, pending = null;
  // 1.30, not 0.65. The gap here is 25 vs 32, which at 0.65 put the core 27px off centre
  // inside a blob whose own blur is wider than that — off centre by the numbers, centred
  // to the eye. 1.30 makes it about 54px of a 336px card, which reads.
  //
  // A px offset fed to `translate` rather than a percentage fed to `left`: `left` is a
  // layout property and this element is a 326x357 blurred image, so anything that touches
  // it relays out and repaints. `translate` is composited.
  function shift(el, l, r) { return ((r - l) / (l + r) * 1.30 * el.clientWidth).toFixed(1) + 'px'; }
  function paint(l, r) {
    document.querySelectorAll('.rp-balance').forEach(function (el) {
      el.style.setProperty('--heat-shift', shift(el, l, r));
    });
  }
  window.rpBalanceReveal = function (l, r) {
    if (!isFinite(l) || !isFinite(r) || l + r <= 0) return;
    if (seen) paint(l, r); else pending = [l, r];
  };
  var card = document.querySelector('.rp-balance');
  if (card) {
    var read = function () {
      var l = parseFloat(card.dataset.left), r = parseFloat(card.dataset.right);
      return (isFinite(l) && isFinite(r) && l + r > 0) ? [l, r] : null;
    };
    // No observer. There was one, held at threshold 0.9 so the travel would start with
    // the card sitting still — but there is no travel to time any more, only a position,
    // and a position can be set now. The card's own reveal still waits to be scrolled to;
    // that is .rp-sec.run in report.css and it is a different thing.
    seen = true;
    var v0 = read();
    if (v0) paint(v0[0], v0[1]);
  }

  // Anything that should play WHEN IT IS LOOKED AT rather than on a clock from page load
  // gets .run here: the score block, the Landing Balance wash, the Recommendation chips.
  // Session Highlights is NOT in this list — its heading is on screen at rest, so it
  // arrives with the metric row above it instead (see .rp-play in report.css). On a fixed
  // delay from page load these had all finished — or were mid-loop — before the report had
  // been scrolled that far. .screen is the scroller, so it is the observer root.
  var blocks = [].slice.call(document.querySelectorAll('#rpScores, .rec-scroll, .rp-body > .rp-sec'));
  if (!blocks.length) return;
  if (!window.IntersectionObserver) { blocks.forEach(function (b) { b.classList.add('run'); }); return; }
  // One threshold for everything, including the recommendation row: it is already ~40%
  // on screen at the Performance Scores stop and the two are read together, so they
  // should arrive together.
  // Revealed when the scroll SETTLES, not the instant 20% of the block is on screen.
  // A reveal is a big first paint — four score cards, their artwork, the recommendation
  // photos — and firing it mid-scroll put that paint on top of the scroll's own work.
  // Measured on the report: a 225ms main-thread stall inside the glide, and a 250ms hole
  // in the screen recording on top of it, both landing exactly on the Performance Scores
  // reveal. That is the stutter. Off the scroll there is nothing to compete with, and it
  // reads better anyway — you arrive, and then the section builds in front of you.
  var scroller = blocks[0].closest('.screen');
  var due = [], settle;
  function flush() {
    due.forEach(function (el) { el.classList.add('run'); });
    due = [];
  }
  if (scroller) {
    scroller.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(flush, 120);
    }, { passive: true });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      due.push(e.target);
      // Already still — nothing is going to fire a scroll event, so go now. 120ms is the
      // same window the listener uses, so a block reached mid-glide waits for the stop.
      clearTimeout(settle);
      settle = setTimeout(flush, 120);
    });
  }, { root: scroller, threshold: 0.2 });
  blocks.forEach(function (b) { io.observe(b); });

  // Once the hero's red band has scrolled past, the status bar is sitting on the page's
  // own near-white and its white glyphs are gone. 24px is the moment the bar leaves the
  // band. theme-color follows it, so the phone's own bar changes with ours.
  var screen = blocks[0].closest('.rp-screen');
  if (!screen) return;
  var meta = document.querySelector('meta[name="theme-color"]');
  var dark = false;
  screen.addEventListener('scroll', function () {
    var d = screen.scrollTop > 24;
    if (d === dark) return;
    dark = d;
    screen.classList.toggle('scrolled', d);
    if (meta) meta.setAttribute('content', d ? '#F2F2F2' : '#FA3030');
  }, { passive: true });
})();

// Landing Balance is data-driven, so the page can re-point it whenever the reading
// changes (a different day, a different period). Kept next to the initial pass above
// so there is one place that knows how a split maps to the heat's position.
window.rpBalance = {
  apply: function (left, right) {
    document.querySelectorAll('.rp-balance').forEach(function (el) {
      el.dataset.left = left;
      el.dataset.right = right;
      var l = el.querySelector('.lb-read.l .v'), r = el.querySelector('.lb-read.r .v');
      if (l) l.textContent = '+ ' + left + '%';
      if (r) r.textContent = '+' + right + '%';
    });
    window.rpBalanceReveal(left, right);      // glides, or waits until the card is seen
  }
};
