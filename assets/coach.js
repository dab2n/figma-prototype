// The one thing a link cannot say for itself.
//
// This prototype's way OUT of a screen — into the list of flows — is a gesture:
// grab the middle of the top edge and pull down (assets/flows.js). Somebody who
// opens the deployed link has no way to discover that, so Home performs it once,
// on arrival, and then puts itself back.
//
// It is a demonstration, not a picture of one: the red pill that lands is the
// REAL .flow-exit, revealed exactly the way the gesture reveals it. Nothing here
// draws a fake of it, so it cannot drift from what actually happens.
//
// Shown once per fresh arrival. A reload counts as one — somebody handing the
// phone over hits refresh — but walking back to Home from inside the app does not,
// because by then they have seen it.
(function () {
  var here = location.pathname.split('/').pop() || 'index.html';
  if (here !== 'home.html') return;
  // The gesture is the same in the installed app, but the person who needs telling
  // is the one who followed a link.
  if (document.documentElement.classList.contains('installed')) return;

  // A recording take drives Home by itself for twenty seconds; tour.js flags that,
  // and it runs before this does. Checked ahead of the flag below so a take never
  // spends somebody's one showing.
  if (document.documentElement.hasAttribute('data-tour')) return;

  var KEY = 'nw_coach';
  var reloaded = false;
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    reloaded = nav ? nav.type === 'reload'
                   : (performance.navigation && performance.navigation.type === 1);
  } catch (e) {}
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (seen && !reloaded) return;
  try { sessionStorage.setItem(KEY, '1'); } catch (e) {}

  // Milestones, so the timing reads in one place rather than as four magic numbers
  // scattered through the callbacks.
  var PILL = 1500;     // the arrow has pulled twice; the red pill lands
  var HOLD = 1700;     // …and stays up long enough to be read
  var FADE = 620;

  function start() {
    var phone = document.querySelector('.phone');
    if (!phone) return;

    var box = document.createElement('div');
    box.className = 'coach';
    box.innerHTML =
      '<div class="coach-veil"></div>' +
      '<div class="coach-body">' +
        '<img class="coach-arrow" src="assets/icons/arrow-right-lg.svg?v=1088" alt="">' +
        '<div class="coach-plate">' +
          '<p class="coach-t">Pull down from the top</p>' +
          '<p class="coach-s">Grab the middle of the top edge and drag down.</p>' +
          '<p class="coach-then">Then tap the red pill to pick a flow.</p>' +
        '</div>' +
      '</div>';
    phone.appendChild(box);

    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

    // Two frames: the element has to exist at opacity 0 before the class that
    // raises it, or there is nothing for the transition to run from.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { box.classList.add('in'); });
    });

    at(PILL, function () {
      phone.classList.add('exit-on');    // the real pill, revealed the real way
      box.classList.add('landed');
    });
    at(PILL + HOLD, end);

    // Anybody who has already worked it out, or simply wants their screen back.
    function end() {
      timers.forEach(clearTimeout);
      timers = [];
      box.classList.add('out');
      phone.classList.remove('exit-on');
      setTimeout(function () {
        if (box.parentNode) box.parentNode.removeChild(box);
      }, FADE);
      ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (e) {
        removeEventListener(e, end, true);
      });
    }
    ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (e) {
      addEventListener(e, end, { capture: true, passive: true });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
