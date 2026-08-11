// When opened inside an in-app webview (KakaoTalk, Line, Instagram, Facebook…),
// the host chrome hides the address bar and can distort the fixed layout.
// Instead of auto-redirecting, show a button that opens the real browser on tap,
// so nothing jumps unexpectedly.
(function () {
  var ua = navigator.userAgent.toLowerCase();
  // Our own Android shell IS a webview, and it matches the `; wv)` test below — but it is
  // the app, not something to escape from. It says so on its user agent.
  if (ua.indexOf('newtonshell') > -1) return;

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

  // Keep the frame fitted as the window changes — a rotation, a split view, a resized
  // browser.
  //
  // This used to work out its own --fit, from its own constants, capped at 1. Two
  // formulas for one number is two chances to disagree, and they did: the moment the
  // tablet layout was corrected this one ran (it fires above 401px, which a tablet now
  // genuinely is) and overwrote the head's 1.4 with 1, so the frame sat at 360x780 in
  // the middle of a 1366-tall screen. There is one formula now, in the boot script,
  // and this simply re-runs it.
  //
  // No 'load' / 'animationend' re-fit: those fired on every intro animation (8 pack
  // cards, the whole Home cascade), and each one forced a synchronous relayout of the
  // zoomed frame mid-animation — the stutter on the way into Packs.
  if (window.__box) addEventListener('resize', window.__box);

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

  // The viewport, measured — not asked for in a unit.
  //
  // The LARGER of innerHeight and visualViewport.height, never a multiplied one. Both
  // describe the same thing and either can come back short depending on the phone and
  // where its address bar is; taking the larger means the frame is never laid out against
  // less room than the page actually has, which is what left a band under it. A scale
  // factor was tried here and is gone: it made the number smaller on the phones where
  // scale is not 1, which is a frame shrunk to a fraction of the screen.
  (function () {
    var box = window.__box;
    if (!box) return;
    var v = window.visualViewport;
    ['resize', 'orientationchange', 'pageshow'].forEach(function (e) { addEventListener(e, box); });
    if (v) { v.addEventListener('resize', box); v.addEventListener('scroll', box); }
    box();
  })();

})();
