// Body scan screens. Each page is one screen with stages; the stage is a class on
// .scan-screen and every visual move is a CSS transition off it (styles/scan.css).
//
//   intro       card rises → .wide (camera fills the screen, title turns white)
//   front/side  .wide from markup → .aim (silhouette) → .sharp (focus + count-up)
//
// The camera is a photo, so on a phone the OS status bar has to stop being the
// page's grey the moment the photo is behind it — theme-color is swapped with the
// stage, the same trick scores.js uses on the report.
(function () {
  var scr = document.querySelector('.scan-screen');
  if (!scr) return;
  var meta = document.querySelector('meta[name="theme-color"]');
  var CAM = '#B6957A';                 // the photo's own top row, under the wash

  function wide() {
    scr.classList.add('wide');
    if (meta) meta.setAttribute('content', CAM);
  }

  if (scr.getAttribute('data-stage') === 'intro') {
    // A beat to read the title, then the preview opens out — and then it goes on by
    // itself. This screen asks nothing; making somebody press Next to leave a sentence
    // they have already read is a stop that does not need to be there.
    setTimeout(wide, 1800);
    var next = document.querySelector('.ob-next');
    var go = next && next.getAttribute('href');
    if (go) {
      var t = setTimeout(function () { location.href = go; }, 3000);
      // Touch anything and it is theirs: a tap on Next, or a change of mind on Back.
      ['pointerdown', 'touchstart', 'keydown'].forEach(function (e) {
        document.addEventListener(e, function () { clearTimeout(t); }, { passive: true, once: true });
      });
    }
    return;
  }

  wide();
  var pct = scr.querySelector('.scan-pct');
  setTimeout(function () { scr.classList.add('aim'); }, 600);
  setTimeout(function () {
    scr.classList.add('sharp');
    if (!pct) return;
    // Counted on the clock rather than in steps: the number is the only thing
    // moving on this screen, so it has to be smooth.
    var t0 = 0, DUR = 3400;
    requestAnimationFrame(function f(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DUR);
      pct.textContent = Math.round(k * 100) + '%';
      if (k < 1) requestAnimationFrame(f);
      else scr.classList.add('done');
    });
  }, 2700);
})();
