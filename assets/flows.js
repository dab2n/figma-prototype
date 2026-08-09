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

// Whose status bar is at the top, measured.
//
// The manifest asks for fullscreen. A phone that grants it hands over the whole screen and
// stops drawing its clock, so the frame draws the design's own — and it may as well tell
// the time. A phone that keeps its clock anyway leaves a top safe-area inset behind, and
// there ours would be the second one on screen. So the inset IS the question: 0 and the
// strip is ours, anything else and it is not.
//
// The 9:41 is outlined paths inside one SVG and cannot be edited, so the SVG is clipped
// past the clock and the time written over it in Pretendard SemiBold, the face those
// glyphs were outlined from — the same way the exports do it.
(function () {
  var r = document.documentElement;
  if (!r.classList.contains('installed')) return;
  var pad = document.createElement('div');
  pad.style.cssText = 'position:absolute;top:-9999px;height:env(safe-area-inset-top, 0px);';
  document.body.appendChild(pad);
  var inset = pad.offsetHeight;
  pad.parentNode.removeChild(pad);
  if (inset > 0) return;                     // the system is still drawing one
  r.classList.add('own-bar');

  var bar = document.querySelector('.status-bar');
  if (!bar || bar.querySelector('.sb-now')) return;
  var svg = bar.querySelector('.statusbar-svg');
  if (!svg) return;
  svg.style.clipPath = 'inset(0 0 0 70px)';
  var d = document.createElement('div');
  d.className = 'sb-now';
  // The box the outlined glyphs sat in: ink from x 20.67 to 49, centred in the bar's
  // first 70px, 15px SemiBold.
  d.style.cssText = 'position:absolute;left:0;top:0;width:70px;height:44px;' +
    'display:flex;align-items:center;justify-content:center;' +
    'font-family:Pretendard,-apple-system,sans-serif;font-weight:600;font-size:15px;' +
    'line-height:1;pointer-events:none;color:' + (bar.classList.contains('on-dark') ? '#fff' : '#333') + ';';
  bar.appendChild(d);
  var tick = function () {
    var n = new Date(), h = n.getHours() % 12;
    d.textContent = (h === 0 ? 12 : h) + ':' + String(n.getMinutes()).padStart(2, '0');
  };
  tick();
  setInterval(tick, 20000);
})();
