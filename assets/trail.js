// The path actually travelled.
//
// Every "back" in this app is a plain link to a fixed href — a FORWARD navigation.
// So the browser's history stack is NOT the path, and anything that treats it as
// one is wrong in a way that only shows up after a back:
//
//   packs → pack → setup-location → [back] → pack → [back] → setup-location
//
// because after the first back, history's previous entry is the setup step just
// left. That is the bug this file exists to remove. A trail of screens is kept
// instead, per tab:
//
//   arriving at the screen one BELOW the top   → we went back, so drop the top
//   arriving at the screen that IS the top     → a reload, nothing moves
//   anywhere else                              → push
//
// A↔B ping-ponging collapses on its own under those rules, so the trail does not
// grow just because somebody is moving around.
//
// This must run before anything that reads it. It is the first deferred script on
// every page, and deferred scripts run in document order.
(function () {
  var KEY = 'nw_trail';
  var MAX = 40;

  function fileOf(u) { return String(u).split('?')[0].split('#')[0].split('/').pop() || 'index.html'; }

  // Two URLs are the same SCREEN when they are the same page showing the same
  // pack. `from` says where a tap came from and never changes what is rendered,
  // so it is not part of the identity.
  function idOf(u) {
    var s = String(u), q = s.indexOf('?');
    var pack = q < 0 ? '' : (s.slice(q + 1).match(/(?:^|&)pack=([^&#]*)/) || [])[1] || '';
    return fileOf(s) + (pack ? '?pack=' + pack : '');
  }

  function read() { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(t) { try { sessionStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} }

  var here = fileOf(location.pathname);
  var hereFull = here + location.search;
  var hereId = idOf(hereFull);

  var trail = read();
  var top = trail.length ? trail[trail.length - 1] : null;
  var under = trail.length > 1 ? trail[trail.length - 2] : null;
  var move;

  if (top && idOf(top) === hereId) {
    move = 'same';
    trail[trail.length - 1] = hereFull;
  } else if (under && (idOf(under) === hereId ||
                       // A back link that dropped the query — setup-location's
                       // points at a bare "pyeongso.html" — is still a step back
                       // to the same page, and the params it dropped are the ones
                       // the trail is holding.
                       (!location.search && fileOf(under) === here))) {
    move = 'pop';
    trail.pop();
    if (!location.search && trail[trail.length - 1] !== hereFull) {
      // Put the pack back in the address before anything reads it, so returning
      // from setup lands on the pack being set up rather than on the default one.
      try { history.replaceState(null, '', trail[trail.length - 1]); } catch (e) {}
    }
  } else {
    move = 'push';
    trail.push(hereFull);
    if (trail.length > MAX) trail = trail.slice(trail.length - MAX);
  }
  write(trail);

  // A page handed back from the back/forward cache does not re-run this file, so
  // the trail would still be carrying the screen just left. The browser's own back
  // is a step BACK by definition, so unwind to whatever this page is.
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    var t = read();
    while (t.length && idOf(t[t.length - 1]) !== hereId) t.pop();
    trail = t.length ? t : [hereFull];
    move = 'pop';
    write(trail);
  });

  window.Trail = {
    // Where "back" should go: the screen before this one on the travelled path,
    // or null when this screen was opened cold and there is nothing behind it.
    prev: function () { return trail.length > 1 ? trail[trail.length - 2] : null; },
    // 'push' | 'pop' | 'same' — how this load got here.
    move: function () { return move; },
    file: fileOf,
    path: function () { return trail.slice(); }
  };
})();
