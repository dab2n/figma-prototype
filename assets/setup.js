// Setup flow: option toggles + bottom step-bar behaviour.
(function () {
  var steps  = document.querySelector('.setup-stepbar .steps');
  var active = steps && steps.querySelector('.step.active');
  var wrap   = steps && steps.parentElement;
  var next   = active && active.nextElementSibling;
  if (next && !next.classList.contains('step')) next = null;
  var items  = steps ? [].slice.call(steps.querySelectorAll('.step')) : [];
  // On load the active step sits centred (instantly, no anim); completing slides the steps
  // left until the NEXT one is centred — exactly where the next page loads them, so the
  // hand-off is seamless — then the flow advances on its own.

  // Required input groups: single-select cards/toggles, and the multi-select injury/mode groups.
  var groups = document.querySelectorAll('.setup-body [data-single], .setup-body [data-group]');
  function isComplete() {
    return groups.length > 0 && [].every.call(groups, function (g) { return g.querySelector('.sel'); });
  }

  // Centre `active`, or once the page is complete, `next` — measured as if it were already
  // the active step (borrow the classes for the measurement, no paint happens in between)
  // so the resting position matches where the NEXT page loads its steps, to the pixel.
  function offsetFor(done) {
    var target = active;
    if (done && next) {
      target = next;
      active.classList.remove('active'); next.classList.remove('next'); next.classList.add('active');
    }
    var x = wrap.clientWidth / 2 - (target.offsetLeft + target.offsetWidth / 2);
    if (target !== active) {
      next.classList.remove('active'); next.classList.add('next'); active.classList.add('active');
    }
    return x;
  }

  // Both resting positions are measured up-front with transitions off (before .placed),
  // so a font-size mid-transition can never skew the maths.
  var xs = {};
  function measure() {
    steps.classList.remove('placed');
    xs.load = offsetFor(false);
    xs.done = offsetFor(true);
    steps.classList.add('placed');
  }

  function place(done) {
    if (!active || !wrap) return;
    var x = done ? xs.done : xs.load;
    items.forEach(function (el) { el.style.translate = x + 'px'; });
  }

  var done = null, advance;
  function refresh() {
    var c = isComplete();
    if (c === done) return;
    done = c;
    steps.classList.toggle('done', c);
    if (next) next.classList.toggle('next', c);
    place(c);                                      // steps slide left together

    // Everything answered → let the slide play out, then move on by itself.
    // (Un-selecting before it fires cancels the hand-off.)
    clearTimeout(advance);
    if (c && next && next.href) advance = setTimeout(function () { location.href = next.href; }, 1100);
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
    measure();
    steps.classList.remove('placed');
    place(false);                      // land instantly — no re-entry slide on page load
    steps.classList.add('placed');     // transitions only apply from here on
    window.addEventListener('resize', function () { measure(); place(!!done); });
    refresh();
  }
})();
