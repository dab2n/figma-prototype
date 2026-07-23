// When opened inside an in-app webview (KakaoTalk, Line, Instagram, Facebook…),
// the host chrome hides the address bar and can distort the fixed layout.
// Instead of auto-redirecting, show a button that opens the real browser on tap,
// so nothing jumps unexpectedly.
(function () {
  var ua = navigator.userAgent.toLowerCase();

  function target() {
    if (ua.indexOf('kakaotalk') > -1)
      return function () { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href); };
    if (ua.indexOf('line/') > -1)
      return function () { location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'openExternalBrowser=1'; };
    if (/instagram|fbav|fban|fb_iab|naver|daumapps|; wv\)/.test(ua) && ua.indexOf('android') > -1)
      return function () { location.href = 'intent://' + location.href.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end'; };
    return null;
  }

  // Double-tap / double-click anywhere → native fullscreen (Android Chrome, desktop).
  // iOS Safari ignores element fullscreen — use "Add to Home Screen" (PWA) there.
  //
  // Fullscreen is PER-DOCUMENT: any full-page navigation (tapping the bottom bar,
  // following a link) drops it, and the browser won't re-grant fullscreen without a
  // fresh user gesture. So we remember the intent in sessionStorage and silently
  // re-enter on the first tap of each new page — the earliest moment allowed.
  // (For zero-flicker fullscreen, install via "Add to Home Screen": the manifest's
  //  display:fullscreen keeps every navigation inside the app fullscreen.)
  var FS_KEY = 'nw_fs';
  function isFull() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function reqFull() {
    var el = document.documentElement;
    return (el.requestFullscreen || el.webkitRequestFullscreen || function () { return null; }).call(el);
  }
  function goFull() {
    if (isFull()) {
      try { sessionStorage.removeItem(FS_KEY); } catch (e) {}
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    } else {
      try { sessionStorage.setItem(FS_KEY, '1'); } catch (e) {}
      reqFull();
    }
  }
  document.addEventListener('dblclick', goFull);
  var lastTap = 0;
  document.addEventListener('touchend', function () {
    var now = Date.now();
    if (now - lastTap < 320) { goFull(); lastTap = 0; } else { lastTap = now; }
  }, { passive: true });

  // Restore fullscreen after a navigation: on the first user gesture of this page,
  // re-request it (only if the user last chose fullscreen and we're not already in it).
  (function () {
    var want = false;
    try { want = sessionStorage.getItem(FS_KEY) === '1'; } catch (e) {}
    if (!want) return;
    function restore() {
      if (isFull()) { document.removeEventListener('pointerdown', restore, true); return; }
      var p = reqFull();
      if (p && p.then) p.then(function () { document.removeEventListener('pointerdown', restore, true); }, function () {});
    }
    document.addEventListener('pointerdown', restore, true);
  })();

  var open = target();
  if (!open) return;

  function build() {
    if (document.getElementById('open-ext-btn')) return;
    var bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;justify-content:center;padding:0 16px 24px;pointer-events:none;';
    var btn = document.createElement('button');
    btn.id = 'open-ext-btn';
    btn.textContent = '정확한 비율은 크롬에서 확인하기';
    btn.style.cssText = 'pointer-events:auto;border:none;border-radius:999px;padding:14px 22px;background:#FA3030;color:#fff;font-family:sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.3px;box-shadow:0 8px 24px rgba(0,0,0,.28);';
    btn.addEventListener('click', open);
    bar.appendChild(btn);
    document.body.appendChild(bar);
  }
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
