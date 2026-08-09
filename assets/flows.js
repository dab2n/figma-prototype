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
