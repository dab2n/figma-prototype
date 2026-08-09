// Attract loop: fifteen seconds with nobody touching the phone puts a notice on screen, and
// three seconds after that the prototype goes back to flows.html — so the next person
// meets the four flows rather than wherever the last person stopped. The hub is the start
// now; the splash is the first screen OF a flow, not the way in, so it goes back too.
//
// The notice is a warning, not a countdown you have to sit through: touching anything
// cancels it and starts the fifteen over. Somebody who is still reading taps once and
// stays where they are.
//
// The timer is armed on load and re-armed by anything a person can actually do. Capture
// phase because `scroll` does not bubble: every inner scroller on this prototype (the hero
// carousel, the pack feed, the report) fires on its own element, and only a capturing
// listener on window sees those.
(function () {
  var HOME = 'flows.html';
  var WAIT = 15000;      // stillness before the notice
  var GRACE = 3;         // seconds the notice counts down before it goes

  // PAUSED. Being sent back to the hub every fifteen seconds while a layout is being
  // chased on a real phone is not help. Flip this to false to have it back — nothing else
  // about it changed.
  var PAUSED = true;
  if (PAUSED) return;

  var here = location.pathname.split('/').pop() || 'index.html';
  if (here === HOME) return;
  try {
    // An escape hatch for reviewing on a desktop, where being bounced back every fifteen
    // seconds while reading a screen is not help. ?idle=off for one visit, the localStorage
    // key for the machine.
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
    t = setTimeout(warn, WAIT);
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

  ['pointerdown', 'pointerup', 'touchstart', 'keydown', 'wheel', 'scroll', 'click', 'input']
    .forEach(function (e) { addEventListener(e, arm, { capture: true, passive: true }); });
  document.addEventListener('visibilitychange', arm);

  arm();
})();
