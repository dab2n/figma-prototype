// When opened inside an in-app webview (KakaoTalk, Line, Instagram, Facebook…),
// the host chrome hides the address bar and can break gestures/fixed layout.
// Kick the page out to the real browser (Chrome/Safari) so it opens normally.
(function () {
  var ua = navigator.userAgent.toLowerCase();
  var url = location.href;

  // KakaoTalk (iOS + Android) — official external-open scheme
  if (ua.indexOf('kakaotalk') > -1) {
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
    return;
  }
  // Line — append the documented flag
  if (ua.indexOf('line/') > -1) {
    location.href = url + (url.indexOf('?') > -1 ? '&' : '?') + 'openExternalBrowser=1';
    return;
  }
  // Instagram / Facebook / Naver / Daum in-app on Android → hand off to Chrome via intent
  var inApp = /instagram|fbav|fban|fb_iab|naver|daumapps|; wv\)/.test(ua);
  if (inApp && ua.indexOf('android') > -1) {
    location.href = 'intent://' + url.replace(/^https?:\/\//, '') +
      '#Intent;scheme=https;package=com.android.chrome;end';
  }
  // iOS Instagram/FB webviews have no reliable escape scheme — left as-is.
})();
