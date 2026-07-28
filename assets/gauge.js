// Headline number + arc marker, shared by Records and the post-workout Report.
//
// Two beats, in this order: the marker rides the arc into position, then the score
// fades in and counts up to meet it. Both re-run whenever the value changes (stepping
// the date, switching the period), tweening from whatever is on screen — so a change
// reads as the marker travelling rather than jumping, and arrival is just the same
// motion starting from zero.
window.rpGauge = (function () {
  var ARC_CX = 180, ARC_RX = 261, ARC_RY = 188.5, ARC_TOP = 24;   // the ellipse the arc is drawn from
  var ANCHOR_X = 228, ANCHOR_SCORE = 78.8, PX_PER_POINT = 2.58;   // 78.8 lands exactly where Figma puts it
  var TRAVEL = 650, HOLD = 120, COUNT = 650;

  var cur = { gain: 0, score: 0 }, raf = 0, timer = 0;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function $(id) { return document.getElementById(id); }
  function ease(p) { return 1 - Math.pow(1 - p, 3); }

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
  }

  function hold(on) {
    ['arcVal', 'gainNum'].forEach(function (id) {
      var el = $(id);
      if (el) el.classList.toggle('wait', on);
    });
  }

  function settle(gain, score) {
    var num = $('gainNum'), val = $('arcVal');
    if (num) num.textContent = gain.toFixed(1);
    if (val) val.textContent = score.toFixed(1);
    place(score);
    cur = { gain: gain, score: score };
  }

  function to(gain, score) {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    if (reduce) { hold(false); settle(gain, score); return; }

    var g0 = cur.gain, s0 = cur.score, t0 = 0;
    hold(true);

    // Beat 1 — the marker travels.
    raf = requestAnimationFrame(function travel(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / TRAVEL);
      place(s0 + (score - s0) * ease(p));
      if (p < 1) { raf = requestAnimationFrame(travel); return; }
      cur.score = score;
      timer = setTimeout(count, HOLD);
    });

    // Beat 2 — the score appears and counts up to it.
    function count() {
      // Paint the starting value BEFORE unhiding, or the first visible frame is the
      // stale final number and it visibly snaps back to count.
      var n0 = $('gainNum'), v0 = $('arcVal');
      if (n0) n0.textContent = g0.toFixed(1);
      if (v0) v0.textContent = s0.toFixed(1);
      hold(false);
      var u0 = 0;
      raf = requestAnimationFrame(function step(t) {
        if (!u0) u0 = t;
        var p = Math.min(1, (t - u0) / COUNT), e = ease(p);
        var num = $('gainNum'), val = $('arcVal');
        if (num) num.textContent = (g0 + (gain - g0) * e).toFixed(1);
        if (val) val.textContent = (s0 + (score - s0) * e).toFixed(1);
        if (p < 1) raf = requestAnimationFrame(step);
        else settle(gain, score);
      });
    }
  }

  return { to: to };
})();
