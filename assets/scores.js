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
