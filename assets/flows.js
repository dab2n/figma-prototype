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

// Installed to the home screen, Chrome tints the system bars from <meta name="theme-color">
// — and it is one value for both ends of a screen that is white at the top and black at
// the foot. Home declares white, which is right for the status bar it sits under and wrong
// for the gesture bar below the navbar: that is the white strip under the tab bar.
//
// Only in standalone, and only the meta: in a browser tab the tag still says what the top
// of the page is, which is what that case needs. viewport-fit=cover means the page draws
// its own top in standalone, so the status bar takes its colour from the page either way.
(function () {
  var standalone = false;
  try {
    standalone = matchMedia('(display-mode: standalone)').matches ||
                 matchMedia('(display-mode: fullscreen)').matches ||
                 navigator.standalone === true;
  } catch (e) {}
  if (!standalone) return;
  function paint() {
    var bar = document.querySelector('.phone > .tabbar, .phone > .dj-bar, .phone > .detail-sheet');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    // Whatever the bottom-most bar is painted, or the frame's own ground when a screen has
    // no bar at all — the report and the recap run their colour to the bottom edge.
    var el = bar || document.querySelector('.phone > .screen') || document.body;
    var c = getComputedStyle(el).backgroundColor;
    if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') meta.setAttribute('content', c);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
})();
