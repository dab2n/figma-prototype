// 평소 → 1회 진입 → 올릴때: the drag drives the fold, and letting go picks a stop.
//
// Three states, not a free slide. 1회 진입 is a real resting place — the card has shrunk
// and Explore Packs has appeared, but nothing inside the hero has moved yet, so it reads
// as a hint that there is more below rather than as the transition already happening.
// Only past that stop does the hero fold into the creator header.
//
//   --p  raw fold, 0 → 1, drives the card edge (780 − p·549)
//   --q  second stage only, 0 at 1회 진입 → 1 at 올릴때. Everything that MOVES reads this
//        one, which is what keeps the first stage still.
(function () {
  var screen = document.getElementById('djScreen');
  if (!screen) return;
  var TRAVEL = 300;            // scroll distance that takes the hero fully folded
  var STOP = 0.2;              // 1회 진입: card edge at 663, matching the Figma frame
  // Exactly TRAVEL, not a pixel more: at TRAVEL the sheet sits flush against the folded
  // header. Overshooting slides it up OVER the header's bottom, which is what was
  // swallowing the creator line and the tag.
  var OPEN = TRAVEL;           // where a committed fold settles
  var HINT = STOP * TRAVEL;    // 64px — the 1회 진입 stop, in scroll
  var raf = 0, holding = false, idle = 0, snapping = 0;
  var lastY = 0, dir = 0;      // which way the last scroll went; settle() reads it

  // The page OPENS on 1회 진입 — Explore Packs under the thumb, so the first thing the
  // screen says is that there is more below — and rolls back down to "877 joined this
  // week" a couple of seconds later. It is carried as an offset added to the real fold
  // rather than as a scroll position: the scroller stays at 0 throughout, which keeps
  // this out of the way of Chrome's own scroll reset at load, and a scroll that arrives
  // mid-intro simply adds to a decaying offset instead of fighting a snap-back.
  var lead = STOP;

  function progress() { return Math.max(0, Math.min(1, screen.scrollTop / TRAVEL + lead)); }

  function paint() {
    raf = 0;
    var p = progress();
    var s = Math.min(1, p / STOP);                             // 평소 → 1회 진입
    var q = Math.max(0, (p - STOP) / (1 - STOP));              // 1회 진입 → 올릴때
    // How far the sheet has been read PAST the fold. The folded header is sticky, which
    // is what stops the sheet slicing it — but sticky forever meant it sat pinned over
    // the content for the rest of the page. It rides this back up and out instead, so
    // header and sheet scroll away together once the fold is done with.
    var over = Math.max(0, screen.scrollTop - OPEN);
    var root = document.documentElement;          // the bottom bar sits outside the scroller
    [screen, root].forEach(function (el) {
      el.style.setProperty('--p', p.toFixed(4));
      el.style.setProperty('--s', s.toFixed(4));
      el.style.setProperty('--q', q.toFixed(4));
      el.style.setProperty('--over', over.toFixed(1) + 'px');
    });
    // Opacity alone would leave both Start buttons clickable through each other.
    root.classList.toggle('dj-open', q > 0.15);
    // The bottom strip only turns while it is between its two rows. Off at either rest,
    // so the rows sit there as plain flat text with no 3D of their own — see enter.css.
    root.classList.toggle('dj-rolling', s > 0.005 && s < 0.995);
  }

  // Land on a state. Past the open stop the page is an ordinary scroller and is left
  // alone; below it the nearest stop wins, biased towards where the gesture was already
  // heading — a short pull up still reaches 1회 진입, and a short pull DOWN still falls
  // out of it. Biasing only one way is what made the fold feel one-directional: from
  // 올릴때 you had to drag 140px before it would let go.
  function settle() {
    if (holding || snapping) return;
    var y = screen.scrollTop;
    if (y >= OPEN) return;
    var back = dir < 0;
    var a = HINT * (back ? 0.75 : 0.45);
    var b = HINT + (OPEN - HINT) * (back ? 0.75 : 0.42);
    var target = y < a ? 0 : y < b ? HINT : OPEN;
    if (Math.abs(y - target) < 2) return;
    snapping = 1;
    glide(target, 420);
  }

  // 2.5s of Explore Packs, then the strip rolls back down to "877 joined this week".
  // The lead decays instead of being switched off, so a scroll arriving mid-intro blends
  // with it rather than snapping. Timed off VISIBILITY, not load: a page opened behind
  // another tab would otherwise spend its two seconds unseen and arrive already rolled.
  var INTRO = 1300, DECAY = 460;
  var intro = 0, decaying = false;

  function rollDown() {
    if (decaying) return;
    decaying = true;
    clearTimeout(intro); intro = 0;
    var from = lead, t0 = 0;
    requestAnimationFrame(function frame(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / DECAY);
      lead = from * Math.pow(1 - k, 3);        // ease-out to nothing
      paint();
      if (k < 1) requestAnimationFrame(frame);
      else { lead = 0; paint(); }
    });
  }

  function arm() {
    if (decaying || intro) return;
    if (document.hidden) {
      document.addEventListener('visibilitychange', function once() {
        document.removeEventListener('visibilitychange', once);
        arm();
      });
      return;
    }
    intro = setTimeout(rollDown, INTRO);
  }
  arm();
  // Touch it first and the intro is over — whatever they do next is theirs.
  ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (e) {
    screen.addEventListener(e, rollDown, { passive: true });
  });

  screen.addEventListener('scroll', function () {
    var d = screen.scrollTop - lastY;
    if (d) { dir = d; lastY = screen.scrollTop; }
    if (!raf) raf = requestAnimationFrame(paint);
    // A wheel or a trackpad never sends pointerup, so settling on release alone left the
    // page parked between two states on desktop. Settling when the scrolling stops
    // covers both inputs.
    clearTimeout(idle);
    idle = setTimeout(settle, 140);
  }, { passive: true });
  paint();

  ['pointerdown', 'touchstart'].forEach(function (e) {
    screen.addEventListener(e, function () { holding = true; clearTimeout(idle); }, { passive: true });
  });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach(function (e) {
    screen.addEventListener(e, function () {
      holding = false;
      setTimeout(settle, 60);      // let the last scroll frame land first
    }, { passive: true });
  });

  // Tapping a bottom bar advances one stop. Start is a real action sitting inside the
  // 평소 바, so links keep their own behaviour.
  function step(e) {
    if (e.target.closest('a')) return;
    e.preventDefault();
    var to = screen.scrollTop < HINT - 2 ? HINT : OPEN;
    snapping = 1;
    glide(to, 420);
  }

  // scrollTo({behavior:'smooth'}) does not run on this scroller in Chrome, so every
  // programmatic move is tweened here instead. Same easing as the roll-down.
  function glide(to, dur) {
    var from = screen.scrollTop, t0 = 0;
    requestAnimationFrame(function frame(t) {
      if (holding) { snapping = 0; return; }
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      screen.scrollTop = to + (from - to) * Math.pow(1 - k, 3);
      if (k < 1) requestAnimationFrame(frame);
      else { screen.scrollTop = to; snapping = 0; }
    });
  }

  // The black strip is NOT inside the scroller — it is a sibling of it, pinned to the
  // frame — so a swipe that starts on it had nothing to scroll and only a clean tap ever
  // did anything. Dragging on it now moves the fold directly, so the whole strip works
  // as a handle: grab it anywhere, including over the joined row and the Start button.
  function handle(el, mouseOnly) {
    if (!el) return;
    var id = null, y0 = 0, top0 = 0, moved = 0, captured = 0;
    el.addEventListener('pointerdown', function (e) {
      // A finger on something INSIDE the scroller already drags the fold, natively and
      // better; taking it over here would move it twice. Only the mouse needs help.
      if (mouseOnly && e.pointerType !== 'mouse') return;
      id = e.pointerId; y0 = e.clientY; top0 = screen.scrollTop; moved = 0;
      holding = true;
      rollDown();                                   // the intro is over
      clearTimeout(idle);
      // NOTE: no setPointerCapture here. While a pointer is captured the browser fires
      // the click at the CAPTURE TARGET, not at what was under the cursor — so capturing
      // on pointerdown swallowed every click inside the element. That is what killed the
      // back button, the tap-to-expand description and the Start link. Capture is only
      // taken once this is provably a drag, below.
    });
    // SLOP px of drift is a click, not a drag. Below it nothing moves at all — a mouse
    // wobbles a few pixels on the way down, and this element sits over the back button
    // and the tap-to-expand description.
    var SLOP = 8;
    el.addEventListener('pointermove', function (e) {
      if (id === null || e.pointerId !== id) return;
      var dy = y0 - e.clientY;                      // up is forward
      if (Math.abs(dy) > moved) moved = Math.abs(dy);
      if (moved <= SLOP) return;
      if (!captured) {
        captured = 1;                               // now it is a drag; keep the pointer
        y0 = e.clientY; dy = 0;                     // re-baseline so it does not jump
        if (el.setPointerCapture) { try { el.setPointerCapture(id); } catch (err) {} }
      }
      screen.scrollTop = Math.max(0, top0 + dy);
    });
    ['pointerup', 'pointercancel'].forEach(function (t) {
      el.addEventListener(t, function (e) {
        if (id === null) return;
        var wasDrag = captured;
        if (captured && el.releasePointerCapture) { try { el.releasePointerCapture(id); } catch (err) {} }
        id = null; captured = 0;
        holding = false;
        if (wasDrag) setTimeout(settle, 20);       // a drag: land on the nearest stop
      });
    });
    // A drag that happens to end over the Start link must not follow it.
    el.addEventListener('click', function (e) {
      if (moved > SLOP) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
  }
  handle(document.getElementById('djGrab'));
  // The other end of the same gesture: the folded header is a handle too, so 올릴때 comes
  // back down by grabbing the blurred profile area — the mirror of grabbing the black
  // strip to go up. A finger already does this through the scroller; this is the mouse.
  handle(document.querySelector('.dj-hero'), true);
  // Tap the picture itself to hold the clip, tap again to let it run. A tap only —
  // anything with movement in it is a fold gesture and must not also toggle playback.
  // data-held tells assets/clips.js to leave it alone when it next comes on screen.
  (function () {
    var photo = document.querySelector('.dj-photo');
    var clip = photo && photo.querySelector('video');
    if (!clip) return;
    var x0 = 0, y0 = 0;
    photo.addEventListener('pointerdown', function (e) { x0 = e.clientX; y0 = e.clientY; });
    photo.addEventListener('click', function (e) {
      if (Math.abs(e.clientX - x0) > 6 || Math.abs(e.clientY - y0) > 6) return;
      if (clip.paused) { clip.dataset.held = '0'; clip.muted = true; var p = clip.play(); if (p && p.catch) p.catch(function () {}); }
      else { clip.dataset.held = '1'; clip.pause(); }
      // The playhead stops with it, which is the only thing that says it is paused —
      // the design has no play button and is not getting one.
      document.documentElement.classList.toggle('dj-held', clip.dataset.held === '1');
    });
  })();

  ['djGrab', 'djExplore'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', step);
  });
})();
