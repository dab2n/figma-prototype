// Looping clips play only while they are on screen.
//
// Two reasons, both mobile: a card that is scrolled past keeps a decoder busy for
// nothing, and preload="none" means the file is not even fetched until the card is
// about to be met — which is the whole point of the poster sitting behind it.
//
// It also removes the iOS play button. That button appears when autoplay is refused
// (Low Power Mode, or a data-saver setting); calling play() from the observer asks
// again at the moment it is actually wanted, and the CSS in main.css hides the control
// either way.
(function () {
  var clips = [].slice.call(document.querySelectorAll('video[loop]'));
  if (!clips.length) return;

  function play(v) {
    var p = v.play();
    if (p && p.catch) p.catch(function () {});   // refused: the poster stays, no button
  }
  if (!('IntersectionObserver' in window)) { clips.forEach(play); return; }

  // Rooted on the scroller each clip lives in — these screens scroll inside .screen,
  // so a viewport-rooted observer would call every card visible the whole time.
  var byRoot = new Map();
  clips.forEach(function (v) {
    var root = v.closest('.screen') || null;
    if (!byRoot.has(root)) {
      byRoot.set(root, new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) play(e.target);
          else e.target.pause();
        });
      }, { root: root, rootMargin: '10% 0px', threshold: 0.1 }));
    }
    byRoot.get(root).observe(v);
  });
})();
