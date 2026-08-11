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
  // the top of the footage with whatever this stage lays over it. A fixed tan was 35-43
  // out on these two clips, which on the phone is a status bar in a different colour
  // from the screen it is sitting on. Read off the clip, so it follows the footage.
  //
  // The stack at the very top of the screen, from the design:
  //   aiming    picture at 50% black (.scan-dim), then the veil's 7% warm wash
  //   sharp     picture under the band's own 70% warm gradient (.scan-band)
  var WARM = [155, 109, 69];
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
    var sharp = scr.classList.contains('sharp');
    var dim = sharp ? 1 : 0.5, a = sharp ? 0.7 : 0.07;
    return 'rgb(' + s.map(function (v2, j) {
      return Math.round(v2 / k * dim * (1 - a) + WARM[j] * a);
    }).join(',') + ')';
  }

  // One value, three places: the OS status bar (theme-color), the strip the frame
  // paints under it, and the bar at the foot. The top of this screen is the picture
  // under the band; giving the foot the same colour is what makes the two ends read
  // as one material rather than a warm band above a grey slab.
  function paintTop() {
    var c = camTone();
    if (!c) return false;
    if (meta) meta.setAttribute('content', c);
    // On .phone, not on the screen: custom properties inherit DOWNWARD, and both the
    // bar at the foot and the frame's own fillet colour sit outside .scan-screen.
    var phone = scr.closest('.phone') || document.documentElement;
    phone.style.setProperty('--scan-tint', c);
    // Rec. 709, the same weighting everything else here measures luminance with.
    var n = c.match(/(\d+)\D+(\d+)\D+(\d+)/);
    if (n) {
      var lum = (0.2126 * +n[1] + 0.7152 * +n[2] + 0.0722 * +n[3]) / 255;
      phone.classList.toggle('tint-dark', lum < 0.6);
    }
    return true;
  }

  // `after` is how long the card takes to reach the top of the screen. Until it does,
  // what is up there is still the page's own grey, and a tag that changed the moment
  // the animation STARTED put a brown system bar over a grey screen for most of a
  // second. The pages that arrive already open pass 0.
  function wide(after) {
    scr.classList.add('wide');
    setTimeout(function () {
      // The clip may not have decoded a frame yet; try again while it is arriving.
      if (paintTop()) return;
      var tries = 0, id = setInterval(function () {
        if (paintTop() || ++tries > 20) clearInterval(id);
      }, 150);
    }, after || 0);
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
    setTimeout(function () { wide(800); }, 1500);   // 800 = the card's own opening
    if (href) untilTouched(3200, function () { location.href = href; });
    return;
  }

  wide();
  var pct = scr.querySelector('.scan-pct');
  setTimeout(function () { scr.classList.add('aim'); }, 600);
  setTimeout(function () {
    scr.classList.add('sharp');
    // Focusing swaps a 50%-black-plus-soft-wash top for the band's 70% warm one, so
    // what the clock sits on is a different colour from this point on.
    paintTop();
    // Counted on the clock rather than in steps: the number is the only thing
    // moving on this screen, so it has to be smooth.
    var t0 = 0, DUR = 3400;
    requestAnimationFrame(function f(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DUR);
      if (pct) pct.textContent = Math.round(k * 100) + '%';
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
