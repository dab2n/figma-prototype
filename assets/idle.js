// Attract loop: somebody uses the prototype, walks off mid-screen, and twenty seconds
// later it puts itself back at the start so the next person meets the app rather than
// wherever the last one stopped.
//
// Armed by USE, not by arrival. A screen that has only been landed on is being read —
// the report is a long page and Packs is a feed — and bouncing a reader who has not
// touched anything yet is the behaviour that got this switched off before. The clock
// starts on the first thing a person actually does (a scroll counts) and restarts on
// every one after it, so what it measures is somebody who was here and stopped.
//
// Capture phase because `scroll` does not bubble: every inner scroller on this
// prototype (the hero carousel, the pack feed, the report) fires on its own element,
// and only a capturing listener on window sees those.
(function () {
  // Where a walked-away prototype goes back to.
  // Version 1 goes back to Home — the app's front door, which opens on Sean's card.
  // Version 2 goes back to the splash, so the next person meets the slogan and the logo
  // first. Chosen per device from the hub (flows.html); see the note there.
  var V2 = false;
  try { V2 = localStorage.getItem('nw.ver') === '2'; } catch (e) {}
  var HOME = V2 ? 'index.html' : 'home.html';
  var TOTAL = 20000;      // stillness before it goes, in full
  var GRACE = 3;          // …the last seconds of which are spent warning

  var here = location.pathname.split('/').pop() || 'index.html';
  // The hub is where this sends people, and the splash is on its way there by itself.
  // Never bounce the screen it bounces TO, nor the hub, nor — in version 2 — Home,
  // which is a stop on the way rather than the place it returns to.
  if (here === HOME || here === 'flows.html') return;
  try {
    // An escape hatch for reviewing on a desktop, where being bounced every twenty
    // seconds while reading a screen is not help. ?idle=off for one visit, the
    // localStorage key for the machine.
    if (localStorage.getItem('idleOff') || /(?:\?|&)idle=off/.test(location.search)) return;
  } catch (e) {}

  var t, tick, box, num;

  function close() {
    clearTimeout(tick);
    if (box) { box.parentNode.removeChild(box); box = null; }
  }

  function arm() {
    clearTimeout(t);
    close();
    t = setTimeout(warn, TOTAL - GRACE * 1000);
  }

  function open() {
    var phone = document.querySelector('.phone') || document.body;
    box = document.createElement('div');
    box.className = 'idle-note';
    box.innerHTML = '<div class="idle-card">' +
      '<p class="idle-t">Back to the start</p>' +
      '<p class="idle-s">No one has touched this for a while. Returning in <b>' + GRACE + '</b>s.</p>' +
      '<p class="idle-h">Tap anywhere to stay</p></div>';
    phone.appendChild(box);
    num = box.querySelector('b');
  }

  function warn() {
    // A recording take drives the page itself, with no user input for the whole run;
    // tour.js flags that so a take is never interrupted. A backgrounded tab is not
    // somebody walking away either — it is a tab nobody can see.
    if (document.documentElement.hasAttribute('data-tour') || document.hidden) return arm();
    open();
    var left = GRACE;
    (function step() {
      if (left <= 0) { location.replace(HOME); return; }
      num.textContent = left;
      left--;
      tick = setTimeout(step, 1000);
    })();
  }

  // Nothing is running until somebody does something. `scroll` is in the list, so
  // "scrolled down and then stopped" is exactly what starts the twenty seconds.
  ['pointerdown', 'pointerup', 'touchstart', 'keydown', 'wheel', 'scroll', 'click', 'input']
    .forEach(function (e) { addEventListener(e, arm, { capture: true, passive: true }); });
  // Coming back to a tab that was left open is not an interaction; it only cancels a
  // countdown that was already running.
  document.addEventListener('visibilitychange', function () { if (t) arm(); });
})();
