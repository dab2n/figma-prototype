// 프로토타입 1 — a recording script, so every take is identical: Home arrives, the hero
// carousel steps through its cards, the page scrolls down, then Packs, then Sean's pack
// with the clip running and Explore Packs raised. Every leg begins with a real page
// load, so the slide-in is the page's OWN arrival animation and nothing extra; the step
// is carried across pages in sessionStorage.
(function () {
  var KEY = 'tour1';

  // scrollTo({behavior:'smooth'}) does not run on these scrollers in Chrome (see
  // enter.js), and a recording wants the pace chosen anyway — so every move is tweened.
  // A mandatory snap container re-snaps after every programmatic scroll, so each tween
  // frame was being yanked straight to the nearest card and the move read as a jump
  // instead of a glide. Off for the duration; the targets below are snap points, so
  // turning it back on at the end moves nothing.
  // A flick, not a crank: all of the speed is at the start and the rest is coasting.
  var FLICK = function (k) { return 1 - Math.pow(1 - k, 4); };
  // The carousel is not bouncy — it eases in and out and it is over quickly, so it reads
  // as one smooth push rather than something with weight in it.
  var CARD  = function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };

  function glide(el, axis, to, dur, done, ease) {
    var from = el[axis], t0 = 0;
    el.style.scrollSnapType = 'none';
    requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el[axis] = from + (to - from) * (ease || FLICK)(k);
      if (k < 1) return requestAnimationFrame(frame);
      el.style.scrollSnapType = '';
      if (done) done();
    });
  }

  // Where el has to sit in scroller for it to be centred — in LAYOUT coordinates.
  // getBoundingClientRect() is scaled by the frame's `zoom` while scrollTop is not, so
  // mixing them put the target ~5% short on a scaled-down desktop frame. Mandatory snap
  // then yanked the card the rest of the way, and since the clip starts ~180ms after the
  // scroll stops (clips.js), the correction read as "the card jumps when it plays".
  // offsetTop/offsetLeft are unscaled, same space as scrollTop/scrollLeft.
  function centre(scroller, el, axis) {
    return axis === 'scrollLeft'
      ? el.offsetLeft - (scroller.clientWidth - el.offsetWidth) / 2
      : el.offsetTop - (scroller.clientHeight - el.offsetHeight) / 2;
  }

  function go(url, step) { sessionStorage.setItem(KEY, step); location.href = url; }

  function home() {
    var screen = document.querySelector('.screen');
    var hero = document.querySelector('.hero-scroll');
    screen.scrollTop = 0;
    hero.scrollLeft = 0;

    var cards = hero.querySelectorAll('.hero-card');
    var t = 3000;                                   // 3s on the first card
    for (var i = 1; i < cards.length; i++) {
      (function (card) {
        setTimeout(function () { glide(hero, 'scrollLeft', centre(hero, card, 'scrollLeft'), 450, null, CARD); }, t);
      })(cards[i]);
      t += 1600;
    }
    // Home is the carousel and nothing else. The page scroll that used to follow is gone:
    // the frame has to hold perfectly still for the recording, and a vertical scroll on
    // Home was the one thing still moving it.
    setTimeout(function () { go('packs.html', 2); }, t + 1400);   // a beat on the last card
  }

  function packs() {
    var screen = document.querySelector('.packs-screen');
    var sean = screen.querySelector('.pack-card[href="pyeongso.html"]');
    var clip = sean.querySelector('video');
    screen.scrollTop = 0;
    setTimeout(function () {
      // A flick, not a crawl: FLICK puts all the travel at the start and coasts in, so a
      // short duration reads as light rather than hurried.
      glide(screen, 'scrollTop', centre(screen, sean, 'scrollTop'), 1000, function () {
        // clips.js starts the centred card once the scroll has been still for 180ms.
        // Leaving on 'playing' cuts the moment the thumb comes alive, instead of on a
        // clock that would have to be long enough for the slowest first frame.
        var fired = 0;
        function next() { if (fired) return; fired = 1; go('pyeongso.html', 3); }
        if (clip) clip.addEventListener('playing', function () { setTimeout(next, 300); }, { once: true });
        setTimeout(next, 2200);        // the clip never started: go anyway
      });
    }, 3000);          // a beat on the feed before it starts moving
  }

  function detail() {
    var explore = document.getElementById('djExplore');
    var clip = document.querySelector('.dj-photo video');
    // Two taps: 평소 → 1회 진입 → 올릴때. One tap only reaches the middle stop (see
    // enter.js), which is not "raised".
    function raise() {
      explore.click();
      setTimeout(function () { explore.click(); }, 1600);
    }
    // The clip is what the viewer is watching, so it decides when to move on: the moment
    // it has played through once, the sheet comes up. It loops, so 'ended' never fires —
    // the playhead jumping backwards IS the end of a pass. A fixed wait is the fallback
    // if the clip never starts.
    if (clip) {
      var last = 0, fired = 0;
      var done = function () {
        if (fired) return;
        fired = 1;
        clip.removeEventListener('timeupdate', tick);
        raise();
      };
      var tick = function () {
        if (clip.currentTime < last - 0.3) done();
        last = clip.currentTime;
      };
      clip.addEventListener('timeupdate', tick);
      setTimeout(done, 12000);
    } else {
      setTimeout(raise, 5000);
    }
  }

  // 프로토타입 2 — the post-workout path: the report arrives on Home, it is opened, the
  // Session Recap plays, and the full report is read all the way down.

  // Home's own inline script reveals the strip when 'notifNow' is set, 700ms after
  // landing. From there the tour just presses what a thumb would press.
  function reportHome() {
    setTimeout(function () {
      var pill = document.getElementById('notifNew');
      if (pill) pill.click();                       // 1회: strip morphs to avatar + Open
      setTimeout(function () {
        var open = document.querySelector('.report-open');
        if (!open) return;
        sessionStorage.setItem(KEY, '12');
        open.click();                               // a real link click, so the page's own
      }, 1700);                                     // cross-document transition still runs
    }, 2600);                                       // a beat to read "New Report"
  }

  // Session Recap: the clip runs and the score counts up on its own. Leave it on screen
  // long enough to watch both, then open the full report.
  function recap() {
    setTimeout(function () {
      var full = document.querySelector('.recap-full');
      if (!full) return;
      sessionStorage.setItem(KEY, '13');
      full.click();
    }, 6500);
  }

  // The full report. Everything below the fold reveals as it is scrolled to (scores.js
  // watches the scroller), so the scroll has to be slow and even — a flick would trip
  // every observer at once and the reveals would all be over before they were on screen.
  // Linear, in one long pass, after the arrival animation has landed.
  function report() {
    var screen = document.querySelector('.rp-screen');
    if (!screen) return;
    setTimeout(function () {
      glide(screen, 'scrollTop', screen.scrollHeight - screen.clientHeight, 16000, null,
            function (k) { return k; });
    }, 2600);
  }

  var step = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);                   // a reload is a normal page again
  if (step === '1') home();
  else if (step === '2') packs();
  else if (step === '3') detail();
  else if (step === '11') reportHome();
  else if (step === '12') recap();
  else if (step === '13') report();

  // The two web-only controls, on every page and never anywhere else on the page: a
  // recording must not have them blink out at a page change. Home already carries its own
  // trigger in markup because its inline script binds to it before this file runs — which
  // is also why that one keeps the id reportTrigger.
  if (matchMedia('(min-width: 401px)').matches) {
    [['reportTrigger', '프로토타입 2', '', function () {
        sessionStorage.setItem('notifNow', '1');   // Home reveals the strip on landing
        go('home.html', 11);
      }],
     // Reloading Home rather than replaying in place: the arrival animation is the page's,
     // and a fresh load is the only thing that plays it honestly.
     ['tour1', '프로토타입 1', ' tour-trigger', function () { go('home.html', 1); }]
    ].forEach(function (b) {
      if (document.getElementById(b[0])) return;
      var el = document.createElement('button');
      el.id = b[0]; el.type = 'button'; el.className = 'side-trigger' + b[2];
      el.textContent = b[1];
      el.addEventListener('click', b[3]);
      document.body.appendChild(el);
    });
  }
})();
