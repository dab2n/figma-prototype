// Landing Balance heat position + Performance Scores entrance.
(function () {
  // The heat starts centred and only travels once the card is actually on screen, so
  // the move toward the stronger foot is something you watch rather than something
  // that already happened before you got there.
  // Gain 100, not 65: a 25/32 split is a 12% lean, which at 65 moved the core 27px in a
  // 336px card — inside the blob's own blur, so nothing appeared to happen. At 100 the
  // same reading is a 41px travel and the lean is legible. The mapping is still linear in
  // the split, so the card is not lying about which side is heavier or by how much.
  var seen = false, pending = null;
  function target(l, r) { return (50 + ((r - l) / (l + r)) * 100).toFixed(1) + '%'; }
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
      }, { root: card.closest('.screen'), threshold: 0.35 });
      bo.observe(card);
    } else {
      seen = true;
      var v0 = read();
      if (v0) paint(v0[0], v0[1]);
    }
  }

  // Anything that should play WHEN IT IS LOOKED AT rather than on a clock from page load
  // gets .run here: the score block, the Session Highlights arrows, the Recommendation
  // chips. On a fixed delay they had all finished — or were mid-loop — before the report
  // had been scrolled that far. .screen is the scroller, so it is the observer root.
  var blocks = [].slice.call(document.querySelectorAll('#rpScores, .rp-pair, .rec-scroll, .rp-body > .rp-sec'));
  if (!blocks.length) return;
  if (!window.IntersectionObserver) { blocks.forEach(function (b) { b.classList.add('run'); }); return; }
  // The recommendation row waits until it is nearly all the way on screen. At 0.2 it
  // tripped while the Performance Scores stop was being read — 42% of it is showing
  // there — and the chips had already slid in by the time the row was scrolled to.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.intersectionRatio < (e.target.classList.contains('rec-scroll') ? 0.75 : 0.2)) return;
      e.target.classList.add('run');
      io.unobserve(e.target);
    });
  }, { root: blocks[0].closest('.screen'), threshold: [0.2, 0.5, 0.75, 0.95] });
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
