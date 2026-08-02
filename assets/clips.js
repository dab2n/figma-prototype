// Looping clips play only where and when they are actually being looked at.
//
// Two modes, because a list and a detail screen are not the same thing:
//
//   FEED (.pack-list) — one clip at a time, the way a video feed behaves. Nothing
//     plays while the thumb is moving; when the scroll settles, the card sitting
//     closest to the middle of the screen is the one that starts, and every other
//     one stops. Ten decoders running at once is what makes a phone stutter, and a
//     card flying past was never being watched anyway.
//
//   SOLO (everything else) — the pack hero. It plays whenever it is on screen.
//
// muted is set as a property, not just an attribute: iOS treats the property as the
// autoplay permission, and losing it is what puts a start-playback button on the frame.
(function () {
  var clips = [].slice.call(document.querySelectorAll('video[loop]'));
  if (!clips.length) return;

  function play(v) {
    if (v.dataset.held === '1') return;          // paused by hand — leave it alone
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});   // refused: the poster stays, no button
  }
  function stop(v) { if (!v.paused) v.pause(); }

  // .rolling fades the clip up once frames are actually coming (see packs.css). Bound
  // here rather than in the feed block so a solo hero gets it too if it ever wants it.
  //
  // It is never taken away again. Every card's poster is its own ARTWORK, not a frame of
  // its clip — measured, the two differ by 44 to 118 of 255 — so fading back on pause
  // swapped the picture a second time, and a card that scrolled in and then out changed
  // twice. That is the blink. Paused now means "holds its last frame", so each card
  // changes picture once, on the way in, and never changes back.
  clips.forEach(function (v) {
    v.addEventListener('playing', function () { v.classList.add('rolling'); });
  });

  var feed = document.querySelector('.pack-list');
  var inFeed = feed ? [].slice.call(feed.querySelectorAll('video[loop]')) : [];
  var solo = clips.filter(function (v) { return inFeed.indexOf(v) === -1; });

  // ── Feed ────────────────────────────────────────────────────────────────
  if (inFeed.length) {
    var scroller = feed.closest('.screen') || document.scrollingElement;
    var idle = 0, current = null;

    function settle() {
      var box = scroller.getBoundingClientRect();
      var mid = box.top + box.height / 2;
      var best = null, bestD = Infinity;
      inFeed.forEach(function (v) {
        var card = v.closest('.pack-thumb') || v;
        var r = card.getBoundingClientRect();
        if (r.bottom < box.top || r.top > box.bottom) return;   // off screen entirely
        // Distance from the card's centre to the screen's, but a card taller than the
        // screen counts as centred as soon as it fills it — otherwise the 517-tall one
        // can never win against a short neighbour.
        var d = (r.top <= mid && r.bottom >= mid) ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (r.height > box.height * 0.9 && d === 0) d = -1;
        if (d < bestD) { bestD = d; best = v; }
      });
      if (best === current) { if (best) play(best); return; }
      if (current) stop(current);
      current = best;
      if (best) play(best);
    }

    // The clip that is already running keeps running while the thumb moves. Pausing it on
    // the first scroll event and starting it again 180ms later is what made playback cut
    // in and out — one flick was a stop and a start, and the start landed as a jolt. Only
    // settle() decides who plays, and the handover there is a crossfade (.rolling), so a
    // clip never appears or disappears on a hard edge. Still one decoder at a time.
    scroller.addEventListener('scroll', function () {
      clearTimeout(idle);
      idle = setTimeout(settle, 180);    // …until the thumb has been still this long
    }, { passive: true });

    // Nothing starts until the arrival animation has finished. Starting at 120ms put the
    // clip's first frame into the top card while the cards were still sliding, and a
    // picture changing under a moving card is what read as the card blinking. Driven off
    // the animation itself rather than a copy of its duration, so it also covers the
    // filter replay (filters.js re-runs the same keyframes).
    var armed;
    function arm() { clearTimeout(armed); armed = setTimeout(settle, 90); }
    feed.addEventListener('animationend', function (e) {
      if (e.animationName === 'pack-slide') arm();
    });
    setTimeout(arm, 1800);               // animations disabled / never fired: play anyway
  }

  // ── Solo ────────────────────────────────────────────────────────────────
  if (!solo.length) return;
  if (!('IntersectionObserver' in window)) { solo.forEach(play); return; }
  var byRoot = new Map();
  solo.forEach(function (v) {
    var root = v.closest('.screen') || null;
    if (!byRoot.has(root)) {
      byRoot.set(root, new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) play(e.target); else stop(e.target);
        });
      }, { root: root, rootMargin: '10% 0px', threshold: 0.1 }));
    }
    byRoot.get(root).observe(v);
  });
})();
