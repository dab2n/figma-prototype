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
