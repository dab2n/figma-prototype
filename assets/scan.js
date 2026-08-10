// Body scan screens. Each page is one screen with stages; the stage is a class on
// .scan-screen and every visual move is a CSS transition off it (styles/scan.css).
//
//   intro       card rises → .wide (camera fills the screen, title turns white)
//   front/side  .wide from markup → .aim (frame + silhouette) → .sharp (focus, the
//               beam sweeps, the count runs) → .done (tick, Next opens, moves on)
//
// The camera is footage, so on a phone the OS status bar has to stop being the
// page's grey the moment the picture is behind it — theme-color is swapped with the
// stage, the same trick scores.js uses on the report.
(function () {
  var scr = document.querySelector('.scan-screen');
  if (!scr) return;
  var meta = document.querySelector('meta[name="theme-color"]');

  // What the system clock actually sits on, rather than a colour picked once by hand:
  // the top of the footage with the page's own warm wash over it. A fixed tan was 35-43
  // out on these two clips, which on the phone is a status bar in a different colour
  // from the screen it is sitting on. Read off the clip, so it follows the footage.
  var WASH = [100, 47, 0], WASH_A = 0.32;   // .scan-wash, at the strip's own height
  function camTone() {
    var v = scr.querySelector('.scan-shot');
    if (!v || !v.videoWidth) return null;
    var n = 24, c = document.createElement('canvas');
    c.width = n; c.height = n;
    var rows = Math.max(1, Math.round(n * 0.06)), d;   // the strip is 44 of 780
    try {
    // object-fit: cover throws part of the frame away, and the thrown-away part is
      // usually the edges — sampling the whole decoded frame averages in columns nobody
      // is looking at, which read ~10% darker on this footage. Draw only what is visible.
      var sw = v.videoWidth, sh = v.videoHeight;
      var box = v.getBoundingClientRect();
      var kk = Math.max((box.width || sw) / sw, (box.height || sh) / sh);
      var vw = Math.min(sw, (box.width || sw) / kk), vh = Math.min(sh, (box.height || sh) / kk);
      var g = c.getContext('2d');
      g.drawImage(v, (sw - vw) / 2, (sh - vh) / 2, vw, vh, 0, 0, n, n);
      d = g.getImageData(0, 0, n, rows).data;
    } catch (e) { return null; }          // a cross-origin clip taints the canvas
    var s = [0, 0, 0], k = 0;
    for (var i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; k++; }
    return 'rgb(' + s.map(function (v2, j) {
      return Math.round(v2 / k * (1 - WASH_A) + WASH[j] * WASH_A);
    }).join(',') + ')';
  }

  function paintTop() {
    var c = camTone();
    if (c && meta) meta.setAttribute('content', c);
    return !!c;
  }

  function wide() {
    scr.classList.add('wide');
    // The clip may not have decoded a frame yet; try again while it is arriving.
    if (!paintTop()) {
      var tries = 0, id = setInterval(function () {
        if (paintTop() || ++tries > 20) clearInterval(id);
      }, 150);
    }
  }

  // Anything the user does takes the screen back off the clock: a tap on Next, a
  // change of mind on Back. Used by both the intro's opening and the capture's exit.
  function untilTouched(ms, go) {
    var t = setTimeout(go, ms);
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (e) {
      document.addEventListener(e, function () { clearTimeout(t); }, { passive: true, once: true });
    });
  }

  var next = document.querySelector('.ob-next');
  var href = next && next.getAttribute('href');

  if (scr.getAttribute('data-stage') === 'intro') {
    // A beat to read the title, then the preview opens out — and then it goes on by
    // itself. This screen asks nothing; making somebody press Next to leave a sentence
    // they have already read is a stop that does not need to be there.
    setTimeout(wide, 1500);
    if (href) untilTouched(3200, function () { location.href = href; });
    return;
  }

  wide();
  var pct = scr.querySelector('.scan-pct');
  var bar = scr.querySelector('.scan-bar i');
  setTimeout(function () { scr.classList.add('aim'); }, 600);
  setTimeout(function () {
    scr.classList.add('sharp');
    // Counted on the clock rather than in steps: the number is the only thing
    // moving on this screen, so it has to be smooth.
    var t0 = 0, DUR = 3400;
    requestAnimationFrame(function f(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DUR);
      if (pct) pct.textContent = Math.round(k * 100) + '%';
      if (bar) bar.style.width = (k * 100) + '%';
      if (k < 1) return requestAnimationFrame(f);
      done();
    });
  }, 2700);

  function done() {
    scr.classList.add('done');
    // The designer's brush, drawn along its own stroke — inserting it is what starts
    // the draw, so there is no resting state to clear.
    var slot = scr.querySelector('.scan-done-mark');
    if (slot && window.__tick) slot.appendChild(window.__tick());
    // Next was closed while there was nothing to go on to; it opens on the capture,
    // and the screen then takes itself there, because it is not asking anything.
    if (next) next.classList.add('ready');
    if (href) untilTouched(1700, function () { location.href = href; });
  }
})();
