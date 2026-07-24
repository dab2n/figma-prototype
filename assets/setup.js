// Setup flow: option toggles, bottom step-bar, auto-advance.
(function () {
  var steps  = document.querySelector('.setup-stepbar .steps');
  var active = steps && steps.querySelector('.step.active');
  var wrap   = steps && steps.parentElement;
  var next   = active && active.nextElementSibling;
  if (next && !next.classList.contains('step')) next = null;
  var items  = steps ? [].slice.call(steps.querySelectorAll('.step')) : [];
  // On load the active step sits centred (instantly, no anim). Answering everything hands
  // the title over to the NEXT step and slides them left to centre it — exactly where the
  // next page loads them, so the page change is seamless.

  var toggles = [].slice.call(document.querySelectorAll('[data-toggle]'));
  var KEY = 'nw_setup_' + location.pathname;

  // Picks survive a back-navigation to this step (per-step, per-tab).
  function save() {
    var on = [];
    toggles.forEach(function (b, i) { if (b.classList.contains('sel')) on.push(i); });
    try { sessionStorage.setItem(KEY, JSON.stringify(on)); } catch (e) {}
  }
  function restore() {
    var on; try { on = JSON.parse(sessionStorage.getItem(KEY)); } catch (e) {}
    (on || []).forEach(function (i) { if (toggles[i]) toggles[i].classList.add('sel'); });
  }

  // Required input groups: single-select cards/toggles, and the multi-select injury/mode groups.
  var groups = document.querySelectorAll('.setup-body [data-single], .setup-body [data-group]');
  function isComplete() {
    return groups.length > 0 && [].every.call(groups, function (g) { return g.querySelector('.sel'); });
  }

  // Centre `active`, or once the page is complete, `next` — measured as if it were already
  // the active step (borrow the class for the measurement, no paint happens in between)
  // so the resting position matches where the NEXT page loads its steps, to the pixel.
  function offsetFor(done) {
    var target = (done && next) || active;
    if (target !== active) { active.classList.remove('active'); next.classList.add('active'); }
    var x = wrap.clientWidth / 2 - (target.offsetLeft + target.offsetWidth / 2);
    if (target !== active) { next.classList.remove('active'); active.classList.add('active'); }
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

  var done = null, advance;   // null = not placed yet
  function setDone(c) {
    if (c === done || !active) return;
    done = c;
    if (next) { next.classList.toggle('active', c); active.classList.toggle('active', !c); }
    var x = c ? xs.done : xs.load;
    items.forEach(function (el) { el.style.translate = x + 'px'; });   // all move together
  }

  // Toggle any [data-toggle] button: tap to select (.sel), tap again to clear.
  // A [data-single] group behaves like radio (selecting clears siblings) but the active
  // one can still be tapped off; [data-group] (injury / mode) allows multiple.
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.classList.contains('sel');
      var group = btn.closest('[data-single]');
      if (group && !on) group.querySelectorAll('[data-toggle].sel').forEach(function (b) { b.classList.remove('sel'); });
      btn.classList.toggle('sel', !on);
      save();

      var c = isComplete();
      setDone(c);
      // Everything answered → the next title glides to centre and the content swaps the
      // moment it lands (matches the .6s translate in setup.css).
      // (Changing an answer before it fires just resets the timer.)
      clearTimeout(advance);
      if (c && next && next.href) advance = setTimeout(function () { location.href = next.href; }, 600);
    });
  });

  restore();   // never auto-advances: coming back to a filled-in step just shows the picks

  if (steps && active) {
    measure();
    steps.classList.remove('placed');
    setDone(false);                     // land instantly — no re-entry slide on page load
    steps.classList.add('placed');      // transitions only apply from here on
    window.addEventListener('resize', function () { var d = done; measure(); done = null; setDone(d); });
  }
})();
