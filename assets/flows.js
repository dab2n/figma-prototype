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
