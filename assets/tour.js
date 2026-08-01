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
  function glide(el, axis, to, dur, done) {
    var from = el[axis], t0 = 0;
    el.style.scrollSnapType = 'none';
    requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      var e = k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k);   // ease-in-out
      el[axis] = from + (to - from) * e;
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
        setTimeout(function () { glide(hero, 'scrollLeft', centre(hero, card, 'scrollLeft'), 700); }, t);
      })(cards[i]);
      t += 1600;
    }
    setTimeout(function () {
      glide(screen, 'scrollTop', screen.scrollHeight - screen.clientHeight, 4500, function () {
        setTimeout(function () { go('packs.html', 2); }, 2000);
      });
    }, t);
  }

  function packs() {
    var screen = document.querySelector('.packs-screen');
    var sean = screen.querySelector('.pack-card[href="pyeongso.html"]');
    screen.scrollTop = 0;
    setTimeout(function () {
      glide(screen, 'scrollTop', centre(screen, sean, 'scrollTop'), 4000, function () {
        setTimeout(function () { go('pyeongso.html', 3); }, 1500);
      });
    }, 1500);
  }

  function detail() {
    var explore = document.getElementById('djExplore');
    // Watch the clip, then two taps: 평소 → 1회 진입 → 올릴때. One tap only reaches the
    // middle stop (see enter.js), which is not "raised".
    setTimeout(function () { explore.click(); }, 6000);
    setTimeout(function () { explore.click(); }, 7200);
  }

  var step = sessionStorage.getItem(KEY);
  sessionStorage.removeItem(KEY);                   // a reload is a normal page again
  if (step === '1') home();
  else if (step === '2') packs();
  else if (step === '3') detail();

  var btn = document.getElementById('tour1');
  // Reloading Home rather than replaying in place: the arrival animation is the page's,
  // and a fresh load is the only thing that plays it honestly.
  if (btn) btn.addEventListener('click', function () { go('home.html', 1); });
})();
