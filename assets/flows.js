// The way back to the entry hub, on every screen but the hub itself.
//
// One element, added here rather than pasted into thirty files: it has to exist on pages
// that are mid-flow, on pages that are full-bleed photography, and on the splash, and it
// must not become something a screen has to remember to include.
//
// It goes inside .phone. On a phone that is the whole viewport, but on the desktop mockup
// the frame is a 360x780 box in the middle of the page, and a `position: fixed` control
// would pin itself to the browser window instead of to the phone.
(function () {
  var here = location.pathname.split('/').pop() || 'index.html';
  if (here === 'flows.html') return;
  function add() {
    var phone = document.querySelector('.phone');
    if (!phone || phone.querySelector('.flow-exit')) return;
    var a = document.createElement('a');
    a.className = 'flow-exit';
    a.href = 'flows.html';
    a.setAttribute('aria-label', 'Back to the flow list');
    a.appendChild(document.createElement('i'));
    phone.appendChild(a);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();

  // Out of the way until it is asked for. The pill sat on every screen at all times, which
  // is a prototype control living in the middle of a design; now it is pulled down from the
  // top of the frame the way a phone's own shade is, and it goes back up on its own.
  //
  // The gesture is deliberately narrow — it starts in the top 96px, within the middle third,
  // and has to travel 28px DOWN — so it cannot be tripped by an ordinary tap on the app bar
  // or by a sideways swipe through a carousel.
  var HOLD = 4000;
  var hideAt = 0, timer = 0;

  function show(phone) {
    var pill = phone.querySelector('.flow-exit');
    if (!pill) return;
    phone.classList.add('exit-on');
    clearTimeout(timer);
    timer = setTimeout(function () { phone.classList.remove('exit-on'); }, HOLD);
  }

  function arm() {
    var phone = document.querySelector('.phone');
    if (!phone) return;
    var x0 = 0, y0 = 0, live = false;
    function down(x, y) {
      var r = phone.getBoundingClientRect();
      live = (y - r.top) < 96 && (x - r.left) > r.width * 0.33 && (x - r.left) < r.width * 0.67;
      x0 = x; y0 = y;
    }
    function move(x, y) {
      if (!live) return;
      if (y - y0 > 28 && Math.abs(x - x0) < 40) { live = false; show(phone); }
    }
    // Both families. A WebView that coalesces pointer events still sends touches, and one
    // that has no touch at all still sends pointers — either alone leaves a device out.
    phone.addEventListener('pointerdown', function (e) { down(e.clientX, e.clientY); }, { passive: true });
    phone.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
    phone.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; if (t) down(t.clientX, t.clientY);
    }, { passive: true });
    phone.addEventListener('touchmove', function (e) {
      var t = e.touches[0]; if (t) move(t.clientX, t.clientY);
    }, { passive: true });
    // Ended, not CANCELLED. Chrome fires pointercancel the moment the compositor takes the
    // gesture over as a scroll — which is precisely what a pull down at the top of a page
    // is — so clearing on cancel threw the gesture away a few pixels into it. Measured: the
    // drag reached 26px of its 28 and then went dead. touchmove keeps arriving through the
    // scroll, so the travel is still counted; only a finger LIFTING ends it.
    ['pointerup', 'touchend'].forEach(function (t) {
      phone.addEventListener(t, function () { live = false; }, { passive: true });
    });
    // Touching the pill keeps it up long enough to press it.
    phone.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.flow-exit')) show(phone);
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm);
  else arm();
})();

// Installed to the home screen, the strip the system draws its gesture bar in takes its
// colour from the document CANVAS — the html background — not from anything the page lays
// out. Every screen here paints its own ground inside .phone and leaves html to whatever
// the media query set, so on a phone that is not drawing edge-to-edge that strip came out
// the system's own light grey: the white band under the navbar.
//
// theme-color is NOT the lever. Chrome uses it for the STATUS bar, so setting it to the
// foot's colour turned the top of Home black — one tag cannot describe both ends of a
// screen that is white at the top and black at the bottom. The tag is left alone, saying
// what the top of the page is, and the canvas is painted to match the foot instead.
(function () {
  var standalone = false;
  try {
    standalone = matchMedia('(display-mode: standalone)').matches ||
                 matchMedia('(display-mode: fullscreen)').matches ||
                 navigator.standalone === true;
  } catch (e) {}
  if (!standalone) return;
  function paint() {
    // Only where there IS a bar at the foot. A full-bleed screen ends in whatever its own
    // artwork ends in — a gradient, a photograph — and there is no single colour to copy;
    // those keep the canvas the stylesheet already gave them.
    var bar = document.querySelector('.phone > .tabbar, .phone > .dj-bar');
    if (!bar) return;
    var c = getComputedStyle(bar).backgroundColor;
    if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return;
    document.documentElement.style.backgroundColor = c;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
})();

// theme-color is not a constant on every screen: a pack screen samples its own hero and
// rewrites it once the picture has decoded. Anything that reads the tag has to keep
// reading it, so both of the things below register here rather than each growing its own
// observer.
function watchTheme(fn) {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta || !window.MutationObserver) return;
  new MutationObserver(fn).observe(meta, { attributes: true, attributeFilter: ['content'] });
}

// Inside the Android shell the real status bar is transparent and the page is what shows
// through it — so the system's own glyphs have to stay readable against whatever this
// screen puts up there. The page is the only side that knows: theme-color IS its top, so
// its lightness decides whether the OS draws dark glyphs or light ones. Home is white and
// gets dark; the report is red and gets light.
(function () {
  var shell = window.NewtonShell;
  if (!shell || !shell.topIsLight) return;
  function tell() {
    var meta = document.querySelector('meta[name="theme-color"]');
    var c = (meta && meta.getAttribute('content') || '#ffffff').trim();
    var lum = 1, r, g, b;
    var hex = c.match(/^#?([0-9a-f]{6})$/i);
    // rgb() as well as hex: a pack writes its sampled colour in the functional form, and
    // reading only hex meant every pack fell through to lum 1 — dark glyphs on a dark
    // strip, which is a clock nobody can see on most of them.
    var fn = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (hex) {
      var n = parseInt(hex[1], 16);
      r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255;
    } else if (fn) {
      r = +fn[1]; g = +fn[2]; b = +fn[3];
    }
    // Rec. 709, the same weighting the rest of this project measures luminance with.
    if (r != null) lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    try { shell.topIsLight(lum > 0.6); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tell);
  else tell();
  watchTheme(tell);
})();

// The strip under the phone's own status bar, painted to match the screen.
//
// On a phone that draws the app edge to edge (Android 15) the page runs UNDER the system
// clock, and the frame takes that height back as padding — so what shows up there is the
// frame's own ground. Left unpainted that is the black behind the frame, and Chrome has
// meanwhile told the OS the bar is #ffffff (this page's theme-color), so the OS drew DARK
// icons on it: a black strip with an invisible clock in it, which is what an S25 showed.
//
// theme-color is the one value both ends already agree on — it is what the page says its
// top is, and what the OS picked its icon colour against. So the strip is painted with it.
// Where the system keeps that strip to itself the inset is 0 and this paints nothing.
(function () {
  var r = document.documentElement;
  if (!r.classList.contains('installed')) return;
  function paint() {
    var meta = document.querySelector('meta[name="theme-color"]');
    var phone = document.querySelector('.phone');
    if (meta && phone) phone.style.background = meta.getAttribute('content');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  // A pack samples its own hero and rewrites theme-color when the picture decodes, which is
  // well after this first ran — so the strip kept the colour the MARKUP declared, which is
  // Sean's, whichever card had been opened. It follows the tag now instead of reading it
  // once, and the same watcher serves the shell's glyph choice above.
  watchTheme(paint);
})();

// The clock in our status bar, wherever ours is the one on screen.
//
// The 9:41 is outlined paths inside one SVG and cannot be edited, so the sheet is clipped
// past the clock and the time written over it in Pretendard SemiBold, the face those
// glyphs were outlined from — the same way the exports do it.
//
// The clip takes the sheet's OWN BACKGROUND with it. That is what tore the bar open on a
// Galaxy: 70pt of the page showing through where the white rect used to be, measured on
// the screenshot at exactly the inset. So the overlay carries that ground itself, taken
// from the sheet it is covering — the dark sheet has no rect at all and gets none.
//
// Off by default: the drawn bar only appears in a browser, where 9:41 is the mockup's
// signature and every export is measured against it. window.__liveClock() turns it on.
window.__liveClock = function () {
  var bar = document.querySelector('.status-bar');
  if (!bar || bar.querySelector('.sb-now')) return;
  var svg = bar.querySelector('.statusbar-svg');
  if (!svg) return;
  var src = svg.getAttribute('src') || '';
  var ground = /dark/.test(src) ? '' : (/fafafa/i.test(src) ? '#FAFAFA' : '#fff');
  svg.style.clipPath = 'inset(0 0 0 70px)';
  var d = document.createElement('div');
  d.className = 'sb-now';
  // The box the outlined glyphs sat in: ink from x 20.67 to 49, centred in the sheet's
  // first 70px, 15px SemiBold.
  d.style.cssText = 'position:absolute;left:0;top:0;width:70px;height:44px;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:Pretendard,-apple-system,sans-serif;font-weight:600;font-size:15px;' +
    'line-height:1;pointer-events:none;' +
    (ground ? 'background:' + ground + ';' : '') +
    'color:' + (bar.classList.contains('on-dark') ? '#fff' : '#333') + ';';
  bar.appendChild(d);
  var tick = function () {
    var n = new Date(), h = n.getHours() % 12;
    d.textContent = (h === 0 ? 12 : h) + ':' + String(n.getMinutes()).padStart(2, '0');
  };
  tick();
  setInterval(tick, 15000);
};

// The tick, drawn rather than faded in.
//
// The mark is the designer's own vector (체크박스.svg): a white disc and a BRUSH-SHAPED
// check — a filled outline, not a stroke, so dash-offset has nothing to walk along. It is
// revealed instead: a fat stroke follows the check's centreline and is clipped to the
// brush, so what grows is the artwork itself, along its own path, never a redrawn
// approximation of it.
//
// The 320 viewBox is kept exactly as exported, which is what puts the disc at 28pt inside
// the 52pt box every rule here places it in (r 85.95 of 320 -> 27.9 of 52, centred).
window.__tick = (function () {
  var seq = 0;
  var BRUSH = 'M193.882 118.025C194.108 118.007 194.736 118.025 194.958 118.056C197.689 118.442 200.224 118.947 202.048 121.194C203.228 122.655 203.792 124.523 203.62 126.397C203.452 128.057 202.702 129.654 201.555 130.853C199.833 132.651 197.371 133.315 195.349 134.689C193.91 135.635 192.451 137.266 191.663 138.801C189.275 143.455 186.191 146.568 181.895 149.47C180.017 150.739 177.561 152.897 176.016 154.674C175.197 155.623 174.461 156.641 173.814 157.716C172.436 160.025 171.523 162.339 169.516 164.25C166.731 166.899 163.538 168.033 160.953 171.042C159.428 172.819 158.753 174.101 157.506 176.021C156.445 177.666 155.269 179.278 154.269 180.961C152.144 184.538 149.83 189.448 144.83 188.828C143.895 188.709 143 188.376 142.213 187.854C138.786 185.588 139.824 182.27 136.851 179.294C134.301 176.741 132.197 176.39 129.528 174.365C127.528 172.848 125.786 169.684 124.168 167.572C121.882 164.922 120.148 164.326 117.004 163.168C115.853 162.744 114.704 162.25 113.78 161.418C112.701 160.448 112.009 159.087 111.948 157.626C111.877 155.899 112.644 154.456 113.777 153.216C114.526 152.397 115.398 151.677 116.207 150.92C118.296 148.964 120.254 147.015 123.276 146.899C124.762 146.841 126.427 147.321 127.689 148.107C129.414 149.181 130.61 150.842 132.021 152.27C133.688 153.957 135.568 155.471 136.892 157.47C138.306 159.603 139.238 162.52 141.114 164.243C142.134 165.18 143.516 165.906 144.932 165.817C149.071 165.557 157.129 153.515 159.581 150.136C160.664 148.666 161.759 147.205 162.865 145.753C164.003 144.242 165.234 142.544 166.571 141.219C167.726 140.073 169.043 139.105 170.48 138.348C173.004 136.995 174.652 136.646 176.733 134.324C179.917 130.77 182.03 126.489 184.967 122.813C186.927 120.358 190.696 118.234 193.882 118.025Z';
  return function () {
    var ns = 'http://www.w3.org/2000/svg';
    var id = 'tickclip' + (++seq);
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ob-check');
    svg.setAttribute('viewBox', '0 0 320 320');
    svg.setAttribute('aria-hidden', 'true');

    var disc = document.createElementNS(ns, 'circle');
    disc.setAttribute('cx', '159.69'); disc.setAttribute('cy', '159.69'); disc.setAttribute('r', '85.9482');
    disc.setAttribute('class', 'ob-check-disc');

    var clip = document.createElementNS(ns, 'clipPath');
    clip.setAttribute('id', id);
    var shape = document.createElementNS(ns, 'path');
    shape.setAttribute('d', BRUSH);
    clip.appendChild(shape);

    var g = document.createElementNS(ns, 'g');
    g.setAttribute('clip-path', 'url(#' + id + ')');
    var run = document.createElementNS(ns, 'path');
    // The check's centreline, run PAST the brush at both ends. The stroke is far wider
    // than the brush on purpose — it is clipped to it, so only its leading edge matters,
    // and that edge is the pen. Stopping the line on the brush's own tips left both of
    // them squared off by the cap; overshooting puts the cut outside the shape, where the
    // clip throws it away, and the tapered ends survive.
    run.setAttribute('d', 'M110.4 146.6 L144.5 180 L206.8 116');
    run.setAttribute('class', 'ob-check-tick');
    g.appendChild(run);

    svg.appendChild(disc);
    svg.appendChild(clip);
    svg.appendChild(g);
    return svg;
  };
})();
