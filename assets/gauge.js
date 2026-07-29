// Headline number + arc marker, shared by Records and the post-workout Report.
//
// One move, not two beats: the marker sets off along the arc, the number joins a moment
// later, and both land together — the marker stopping and the score reading its final
// value are the same instant. The small label under the marker counts the whole way, so
// nothing sits frozen while the circle travels.
//
// Re-runs whenever the value changes (stepping the date, switching the period), tweening
// from whatever is on screen, so a change reads as travel rather than a jump. Arrival is
// the same motion starting from zero.
window.rpGauge = (function () {
  var ARC_CX = 180, ARC_RX = 261, ARC_RY = 188.5, ARC_TOP = 24;   // the ellipse the arc is drawn from
  var ANCHOR_X = 228, ANCHOR_SCORE = 78.8, PX_PER_POINT = 2.58;   // 78.8 lands exactly where Figma puts it
  var TRAVEL = 780, LEAD = 150;                                   // marker leads, number joins at LEAD

  var cur = { gain: 0, score: 0 }, raf = 0;
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
    val.textContent = score.toFixed(1);
  }

  function holdHeadline(on) {
    var el = $('gainNum');
    if (el) el.classList.toggle('wait', on);
  }

  function settle(gain, score) {
    var num = $('gainNum');
    if (num) num.textContent = gain.toFixed(1);
    place(score);
    cur = { gain: gain, score: score };
  }

  // opts.noCount: the marker still travels, but the headline is simply its final value.
  // The post-workout Report uses it — the recap it arrives from has just counted a number
  // up, and doing it twice in a row reads as a stutter.
  function to(gain, score, opts) {
    cancelAnimationFrame(raf);
    if (reduce) { holdHeadline(false); settle(gain, score); return; }

    var noCount = !!(opts && opts.noCount);
    var g0 = cur.gain, s0 = cur.score, t0 = 0, joined = false;
    if (noCount) {                       // headline reads its final value from the start
      var n0 = $('gainNum');
      if (n0) n0.textContent = gain.toFixed(1);
      g0 = gain;
      joined = true;
    }
    holdHeadline(!noCount);
    place(s0);

    raf = requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var el = t - t0;
      place(s0 + (score - s0) * ease(Math.min(1, el / TRAVEL)));

      if (el >= LEAD) {
        if (!joined) {                       // paint the start value before unhiding
          joined = true;
          var n = $('gainNum');
          if (n) n.textContent = g0.toFixed(1);
          holdHeadline(false);
        }
        var pn = Math.min(1, (el - LEAD) / (TRAVEL - LEAD));
        var n2 = $('gainNum');
        if (n2) n2.textContent = (g0 + (gain - g0) * ease(pn)).toFixed(1);
      }

      if (el < TRAVEL) raf = requestAnimationFrame(frame);
      else settle(gain, score);
    });
  }

  return { to: to };
})();
