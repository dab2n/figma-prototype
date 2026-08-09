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

  // Desktop only: scale the phone down until it fits the window, so the document never
  // needs to scroll (main.css turns document scrolling off above 400px). Set --fit to 1
  // first and read back, so each resize measures the unscaled frame — the detail screens
  // are not all 780 tall.
  (function () {
    if (!matchMedia('(min-width: 401px)').matches) return;
    var phone = document.querySelector('.phone');
    if (!phone) return;
    var root = document.documentElement;
    // Measured ONCE, on the first call, while --fit is still its initial 1 — offsetHeight
    // is reported in the zoomed coordinate space, so a later re-read would need --fit
    // reset to 1 first, and that reset is what made the viewport flinch: every re-fit
    // pushed the frame to full size for one layout. The frame is a fixed 360x780 device;
    // nothing in the page can change its height, so one measurement holds for the session.
    // 812, the same constant the inline <head> setter uses — they must not disagree, or
    // the frame would change size the moment this file arrived. The frame is a fixed
    // 360x780 device; offsetHeight is only read as a check that it still is.
    var need = phone.offsetHeight + 32;                       // 16px of air top and bottom
    function fit() {
      root.style.setProperty('--fit', Math.min(1, innerHeight / need).toFixed(4));
    }
    fit();
    addEventListener('resize', fit);
    // No 'load' / 'animationend' re-fit: those fired on every intro animation (8 pack
    // cards, the whole Home cascade), and each one forced a synchronous relayout of the
    // zoomed frame mid-animation — the stutter on the way into Packs.
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

  // --fit again whenever the window changes — a rotation, the address bar sliding away,
  // a keyboard. It is one custom property and two divisions.
  (function () {
    var r = document.documentElement;
    if (r.classList.contains('installed')) return;
    var fit = function () {
      r.style.setProperty('--fit', Math.min(1, innerWidth / 392, innerHeight / 812).toFixed(4));
    };
    addEventListener('resize', fit);
    addEventListener('orientationchange', fit);
    addEventListener('pageshow', fit);
    fit();
  })();
})();
