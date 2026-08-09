// Onboarding pre-setup card/row toggles.
// Inside [data-single] one at a time (radio); inside [data-group] several allowed.
function obMark(el, on) {
  var mark = el.querySelector('.ob-check');
  if (mark) mark.remove();
  if (on && window.__tick) el.appendChild(window.__tick());   // inserting it starts the draw
}

document.querySelectorAll('[data-toggle]').forEach(function (el) {
  el.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;            // let links (Next/Skip) work
    var on = el.classList.contains('sel');
    var single = el.closest('[data-single]');
    if (single && !on) single.querySelectorAll('[data-toggle].sel').forEach(function (b) {
      b.classList.remove('sel'); obMark(b, false);
    });
    el.classList.toggle('sel', !on);
    obMark(el, !on);
  });
});

// Next is a promise, so it only looks like one once the page can keep it. The screens
// that ask a question say so with [data-single]/[data-group]; those with nothing to answer
// (the scan steps) never gain the gate and stay live, which is why this is opt-in rather
// than a default-off.
(function () {
  var next = document.querySelector('.ob-next');
  var groups = document.querySelectorAll('.ob-screen [data-single], .ob-screen [data-group]');
  if (!next || !groups.length) return;
  var href = next.getAttribute('href');
  next.classList.add('gated');
  function refresh() {
    var ok = [].every.call(groups, function (g) { return g.querySelector('.sel'); });
    next.classList.toggle('ready', ok);
    if (ok) next.setAttribute('href', href); else next.removeAttribute('href');
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-toggle]')) setTimeout(refresh, 0);
  });
  refresh();
})();
