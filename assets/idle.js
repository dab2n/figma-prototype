// Attract loop: seven seconds with nobody touching the phone sends the prototype back to
// flows.html, so the next person meets the four flows rather than wherever the last person
// stopped. The hub is the start now — the splash is the first screen OF a flow, not the
// way in, so it goes back too.
//
// The timer is armed on load and re-armed by anything a person can actually do. Capture
// phase because `scroll` does not bubble: every inner scroller on this prototype (the hero
// carousel, the pack feed, the report) fires on its own element, and only a capturing
// listener on window sees those.
(function () {
  var HOME = 'flows.html';
  var WAIT = 7000;

  var here = location.pathname.split('/').pop() || 'index.html';
  if (here === HOME) return;
  try {
    // An escape hatch for reviewing on a desktop, where being bounced back every seven
    // seconds while reading a screen is not help. ?idle=off for one visit, the localStorage
    // key for the machine.
    if (localStorage.getItem('idleOff') || /(?:\?|&)idle=off/.test(location.search)) return;
  } catch (e) {}

  var t;
  function arm() { clearTimeout(t); t = setTimeout(fire, WAIT); }
  function fire() {
    // A recording take drives the page itself, with no user input for the whole run;
    // tour.js flags that so a take is never cut short. A backgrounded tab is not
    // somebody walking away either — it is a tab nobody can see.
    if (document.documentElement.hasAttribute('data-tour') || document.hidden) return arm();
    location.replace(HOME);
  }

  ['pointerdown', 'pointerup', 'touchstart', 'keydown', 'wheel', 'scroll', 'click', 'input']
    .forEach(function (e) { addEventListener(e, arm, { capture: true, passive: true }); });
  document.addEventListener('visibilitychange', arm);

  arm();
})();
