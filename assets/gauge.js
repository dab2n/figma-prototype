// Headline number + arc marker, shared by Records and the post-workout Report.
//
// The number counts up from 0 and the marker rides the arc into place on arrival, and
// both re-run whenever the value changes (stepping the date, switching the period) —
// tweening from whatever is on screen, so a change reads as travel rather than a jump.
window.rpGauge = (function () {
  var ARC_CX = 180, ARC_RX = 261, ARC_RY = 188.5, ARC_TOP = 24;   // the ellipse the arc is drawn from
  var ANCHOR_X = 228, ANCHOR_SCORE = 78.8, PX_PER_POINT = 2.58;   // 78.8 lands exactly where Figma puts it
  var DURATION = 700;

  var cur = { gain: 0, score: 0 }, raf = 0;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function $(id) { return document.getElementById(id); }

  // Marker sits ON the curve: solve the ellipse for y at the marker's x.
  function place(score) {
    var ring = $('arcRing'), val = $('arcVal');
    if (!ring) return;
    var x = Math.max(64, Math.min(316, ANCHOR_X + (score - ANCHOR_SCORE) * PX_PER_POINT));
    var dx = (x - ARC_CX) / ARC_RX;
    var y = ARC_TOP + ARC_RY * (1 - Math.sqrt(Math.max(0, 1 - dx * dx)));
    ring.setAttribute('x', (x - 19.5).toFixed(1));
    ring.setAttribute('y', (y - 19.5).toFixed(1));
    val.setAttribute('x', x.toFixed(1));
    val.setAttribute('y', (y + 40).toFixed(1));
    val.textContent = score.toFixed(1);
  }

  function paint(gain, score) {
    var num = $('gainNum');
    if (num) num.textContent = gain.toFixed(1);
    place(score);
  }

  function to(gain, score) {
    cancelAnimationFrame(raf);
    if (reduce) { cur = { gain: gain, score: score }; paint(gain, score); return; }
    var g0 = cur.gain, s0 = cur.score, t0 = 0;
    raf = requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / DURATION);
      var e = 1 - Math.pow(1 - p, 3);                 // easeOutCubic — quick, then settles
      paint(g0 + (gain - g0) * e, s0 + (score - s0) * e);
      if (p < 1) raf = requestAnimationFrame(frame);
      else cur = { gain: gain, score: score };
    });
  }

  return { to: to };
})();
