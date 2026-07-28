// Landing Balance heat position + Performance Scores entrance.
(function () {
  // The heat starts centred and only travels once the card is actually on screen, so
  // the move toward the stronger foot is something you watch rather than something
  // that already happened before you got there.
  var seen = false, pending = null;
  function target(l, r) { return (50 + ((r - l) / (l + r)) * 65).toFixed(1) + '%'; }
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

  // The cards animate when the block is scrolled to, not on load — the section sits
  // well below the fold. .screen is the scroller, so it is the observer root.
  var scores = document.getElementById('rpScores');
  if (!scores || !window.IntersectionObserver) { if (scores) scores.classList.add('run'); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      scores.classList.add('run');
      io.disconnect();
    });
  }, { root: scores.closest('.screen'), threshold: 0.2 });
  io.observe(scores);
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
