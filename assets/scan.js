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
  var CAM = '#B6957A';                 // the footage's own top row, under the wash

  function wide() {
    scr.classList.add('wide');
    if (meta) meta.setAttribute('content', CAM);
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
