// Landing Balance heat position + Performance Scores entrance.
(function () {
  // The heat starts centred and only travels once the card is actually on screen, so
  // the move toward the stronger foot is something you watch rather than something
  // that already happened before you got there.
  var seen = false, pending = null;
  // 130, not 65. The gap here is 25 vs 32, which at 65 moved the core 27px inside a blob
  // whose own blur is wider than that — technically off centre, visually parked. 130 makes
  // it about 54px of a 336px card: it starts in the middle and you watch it go right.
  function target(l, r) { return (50 + ((r - l) / (l + r)) * 130).toFixed(1) + '%'; }
  function paint(l, r) {
    document.querySelectorAll('.rp-balance').forEach(function (el) {
      el.style.setProperty('--heat-x', target(l, r));
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
    if (window.IntersectionObserver) {
      var bo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          seen = true;
          var v = pending || read();
          if (v) paint(v[0], v[1]);
          bo.disconnect();
        });
      // 0.9, not 0.35: at a third on screen this fired while the page was still scrolling,
      // so the core had already finished travelling by the time the card came to rest and
      // there was nothing left to watch. It now starts from the middle with the card
      // sitting still.
      }, { root: card.closest('.screen'), threshold: 0.9 });
      bo.observe(card);
    } else {
      seen = true;
      var v0 = read();
      if (v0) paint(v0[0], v0[1]);
    }
  }

  // Anything that should play WHEN IT IS LOOKED AT rather than on a clock from page load
  // gets .run here: the score block, the Landing Balance wash, the Recommendation chips.
  // Session Highlights is NOT in this list — its heading is on screen at rest, so it
  // arrives with the metric row above it instead (see .rp-play in report.css). On a fixed delay they had all finished — or were mid-loop — before the report
  // had been scrolled that far. .screen is the scroller, so it is the observer root.
  var blocks = [].slice.call(document.querySelectorAll('#rpScores, .rec-scroll, .rp-body > .rp-sec'));
  if (!blocks.length) return;
  if (!window.IntersectionObserver) { blocks.forEach(function (b) { b.classList.add('run'); }); return; }
  // One threshold for everything, including the recommendation row: it is already ~40%
  // on screen at the Performance Scores stop and the two are read together, so they
  // should arrive together.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('run');
      io.unobserve(e.target);
    });
  }, { root: blocks[0].closest('.screen'), threshold: 0.2 });
  blocks.forEach(function (b) { io.observe(b); });

  // The status bar takes the colour of whatever is actually behind it, tracked
  // continuously rather than switched at a threshold.
  //
  // It used to flip at scrollTop > 24. But the wash artwork sits behind the bar and
  // scrolls with the page, and measured off the frame it is still SOLID red at 300
  // (rgb 251,95,76) and only reaches the page's neutral at 470 (rgb 245,240,237). So for
  // 400px of scroll a near-white bar with dark glyphs sat on a red hero, with its 18px
  // fade-out tail smearing the app bar underneath it. That is the broken-looking strip at
  // the top.
  //
  // The range is measured on the SEAM — the strip of page directly under the bar, which
  // is the edge you actually see it against, not the wash hidden behind it. Off the frame
  // that seam is red at 300 (r-g 111), warm at 380 (31), and neutral by 420 (8): 206 and
  // 86 up from the hero's foot. The end used to be at 46 up, which is 40px past where the
  // seam settles — so at the report's first stop the crossover was still 11% short and
  // the bar sat there as a pale pink strip over a neutral page.
  // Read off the hero rather than written down, so editing its height cannot leave this
  // behind.
  var screen = blocks[0].closest('.rp-screen');
  if (!screen) return;
  var meta = document.querySelector('meta[name="theme-color"]');
  var hero = screen.querySelector('.rp-hero');
  var foot = hero ? hero.offsetTop + hero.offsetHeight : 0;
  var lo = hero ? foot - 206 : 0, hi = hero ? foot - 86 : 24;
  var dark = false;
  screen.addEventListener('scroll', function () {
    var p = Math.max(0, Math.min(1, (screen.scrollTop - lo) / (hi - lo)));
    screen.style.setProperty('--bar', p.toFixed(3));
    // The glyphs cross over faster than the background does. A half-inverted white glyph
    // is grey, and grey on the mid pink is the one moment nothing reads — so it is taken
    // through in a quarter of the range instead of over all of it: white while the strip
    // is still red-dominant, dark once it is light, and about 40px of scroll between.
    screen.style.setProperty('--barg', Math.max(0, Math.min(1, (p - 0.4) / 0.25)).toFixed(3));
    var d = p > 0.5;
    if (d === dark) return;
    dark = d;
    screen.classList.toggle('scrolled', d);      // still there for anything keyed to it
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
