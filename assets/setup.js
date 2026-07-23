// Setup flow: option toggles + bottom step-bar centering.
(function () {
  // Toggle any [data-toggle] button: tap to select (.sel), tap again to clear.
  // A [data-single] group behaves like radio (selecting clears siblings) but the
  // active one can still be tapped off, so "tap again deselects" holds everywhere.
  document.querySelectorAll('[data-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.classList.contains('sel');
      var group = btn.closest('[data-single]');
      if (group && !on) group.querySelectorAll('[data-toggle].sel').forEach(function (b) { b.classList.remove('sel'); });
      btn.classList.toggle('sel', !on);
    });
  });

  // Slide the step row so the active step sits centered in the bar.
  var steps = document.querySelector('.setup-stepbar .steps');
  if (steps) {
    var active = steps.querySelector('.step.active');
    var wrap = steps.parentElement;
    function center() {
      if (!active) return;
      var c = active.offsetLeft + active.offsetWidth / 2;
      steps.style.transform = 'translateX(' + (wrap.clientWidth / 2 - c) + 'px)';
    }
    center();
    window.addEventListener('resize', center);
  }
})();
