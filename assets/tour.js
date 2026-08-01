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

  // Where el has to sit in scroller for it to be centred.
  function centre(scroller, el, axis) {
    var r = el.getBoundingClientRect(), s = scroller.getBoundingClientRect();
    return axis === 'scrollLeft'
      ? scroller.scrollLeft + r.left - s.left - (s.width - r.width) / 2
      : scroller.scrollTop + r.top - s.top - (s.height - r.height) / 2;
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
    setTimeout(function () {
      glide(screen, 'scrollTop', screen.scrollHeight - screen.clientHeight, 2300, function () {
        setTimeout(function () { go('packs.html', 2); }, 2000);
      });
    }, t);
  }

  function packs() {
    var screen = document.querySelector('.packs-screen');
    var sean = screen.querySelector('.pack-card[href="pyeongso.html"]');
    screen.scrollTop = 0;
    setTimeout(function () {
      glide(screen, 'scrollTop', centre(screen, sean, 'scrollTop'), 2600, function () {
        setTimeout(function () { go('pyeongso.html', 3); }, 1500);
      });
    }, 3000);          // a beat longer on the feed before it starts moving
  }

  function detail() {
    var explore = document.getElementById('djExplore');
    // Watch the clip, then two taps: 평소 → 1회 진입 → 올릴때. One tap only reaches the
    // middle stop (see enter.js), which is not "raised".
    setTimeout(function () { explore.click(); }, 6000);
    setTimeout(function () { explore.click(); }, 7600);
  }

  var step = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);                   // a reload is a normal page again
  if (step === '1') home();
  else if (step === '2') packs();
  else if (step === '3') detail();

  // The two web-only controls, on every page and never anywhere else on the page: a
  // recording must not have them blink out at a page change. Home already carries its own
  // New Report in markup because its inline script binds to it before this file runs.
  if (matchMedia('(min-width: 401px)').matches) {
    [['reportTrigger', 'New Report', '', function () {
        sessionStorage.setItem('notifNow', '1');
        location.href = 'home.html';
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
