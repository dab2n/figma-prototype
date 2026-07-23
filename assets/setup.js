// Setup flow: option toggles + bottom step-bar behaviour.
(function () {
  var steps  = document.querySelector('.setup-stepbar .steps');
  var active = steps && steps.querySelector('.step.active');
  var wrap   = steps && steps.parentElement;
  var next   = active && active.nextElementSibling;
  if (next && !next.classList.contains('step')) next = null;
  var SHIFT = 72;   // active starts this far RIGHT of centre; completing slides it left to centre.

  // Required input groups: single-select cards/toggles, and the multi-select injury/mode groups.
  var groups = document.querySelectorAll('.setup-body [data-single], .setup-body [data-group]');
  function isComplete() {
    return groups.length > 0 && [].every.call(groups, function (g) { return g.querySelector('.sel'); });
  }

  function place(done) {
    if (!active || !wrap) return;
    var centre = wrap.clientWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
    steps.style.transform = 'translateX(' + (done ? centre : centre + SHIFT) + 'px)';
  }

  var done = null;
  function refresh() {
    var c = isComplete();
    if (c === done) return;
    done = c;
    steps.classList.toggle('done', c);
    if (next) next.classList.toggle('next', c);   // next step grows + brightens when complete
    place(c);                                      // slide left to centre the current step
  }

  // Toggle any [data-toggle] button: tap to select (.sel), tap again to clear.
  // A [data-single] group behaves like radio (selecting clears siblings) but the active
  // one can still be tapped off; [data-group] (injury / mode) allows multiple.
  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.classList.contains('sel');
      var group = btn.closest('[data-single]');
      if (group && !on) group.querySelectorAll('[data-toggle].sel').forEach(function (b) { b.classList.remove('sel'); });
      btn.classList.toggle('sel', !on);
      refresh();
    });
  });

  if (steps && active) {
    place(false);
    window.addEventListener('resize', function () { place(!!done); });
    refresh();
  }
})();
