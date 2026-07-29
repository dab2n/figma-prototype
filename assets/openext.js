// When opened inside an in-app webview (KakaoTalk, Line, Instagram, Facebook…),
// the host chrome hides the address bar and can distort the fixed layout.
// Instead of auto-redirecting, show a button that opens the real browser on tap,
// so nothing jumps unexpectedly.
(function () {
  var ua = navigator.userAgent.toLowerCase();

  // iOS home-screen apps are the one platform that draws its own home indicator inside
  // the bottom safe area. main.css drops our mocked pill there so the two do not stack.
  if (navigator.standalone) document.documentElement.classList.add('ios-pwa');

  function target() {
    if (ua.indexOf('kakaotalk') > -1)
      return function () { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href); };
    if (ua.indexOf('line/') > -1)
      return function () { location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'openExternalBrowser=1'; };
    if (/instagram|fbav|fban|fb_iab|naver|daumapps|; wv\)/.test(ua) && ua.indexOf('android') > -1)
      return function () { location.href = 'intent://' + location.href.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end'; };
    return null;
  }

  // (Double-tap-to-fullscreen used to live here. Removed: fullscreen hides the
  // phone's own status and gesture bars, which the app now relies on — our mock
  // ones are gone and the OS bars are tinted per page via <meta name="theme-color">.)

  // Prerender same-origin pages on hover/tap intent so navigation is instant and the
  // next page's images (incl. CSS backgrounds + the injury video) are already decoded.
  // Without this, each page-change cold-loads its images and they pop in late/broken
  // mid view-transition — the "지글거림". Chromium (Galaxy) only; iOS ignores it and
  // just navigates normally. `moderate` = prerender when a link looks about to be tapped.
  (function () {
    try {
      if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) return;
      var s = document.createElement('script');
      s.type = 'speculationrules';
      s.textContent = JSON.stringify({ prerender: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }] });
      (document.body || document.documentElement).appendChild(s);
    } catch (e) {}
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
