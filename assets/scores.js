// Landing Balance heat position + Performance Scores entrance.
(function () {
  // The red core sits toward the stronger foot. Even split = centre; the readings push
  // it out from there, so the gradient actually reports the data.
  document.querySelectorAll('.rp-balance').forEach(function (el) {
    var l = parseFloat(el.dataset.left), r = parseFloat(el.dataset.right);
    if (!isFinite(l) || !isFinite(r) || l + r <= 0) return;
    el.style.setProperty('--heat-x', (50 + ((r - l) / (l + r)) * 65).toFixed(1) + '%');
  });

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
      el.style.setProperty('--heat-x', (50 + ((right - left) / (left + right)) * 65).toFixed(1) + '%');
      var l = el.querySelector('.lb-read.l .v'), r = el.querySelector('.lb-read.r .v');
      if (l) l.textContent = '+ ' + left + '%';
      if (r) r.textContent = '+' + right + '%';
    });
  }
};
