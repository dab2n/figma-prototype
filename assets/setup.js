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

  // Centre `active`, or once the page is complete, `next` — measured in the hand-off
  // shape it will actually have (borrow the class, no paint happens in between), so the
  // title lands dead centre, which is where the next page opens it.
  function offsetFor(done) {
    var target = (done && next) || active;
    if (target !== active) next.classList.add('handoff');
    var x = wrap.clientWidth / 2 - (target.offsetLeft + target.offsetWidth / 2);
    if (target !== active) next.classList.remove('handoff');
    return x;
  }

  // Both resting positions are measured with transitions off (.placed absent), so a
  // font-size mid-transition can never skew the maths.
  var xs = {};
  function measure() {
    var on = steps.classList.contains('placed');
    steps.classList.remove('placed');
    xs.load = offsetFor(false);
    xs.done = offsetFor(true);
    if (on) steps.classList.add('placed');
  }

  var done = null, advance;   // null = not placed yet
  function setDone(c) {
    if (c === done || !active) return;
    done = c;
    if (next) next.classList.toggle('handoff', c);   // next grows to Bold 20, still gray
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

      steps.classList.add('placed');   // from the first tap on, the row may animate
      var c = isComplete();
      setDone(c);
      // Everything answered → the next title glides to centre and the content swaps the
      // moment it lands. Wait for the actual transition to end (not a guessed delay) so
      // the bar is never captured mid-slide.
      // (Changing an answer before it fires just resets the hand-off.)
      clearTimeout(advance);
      if (c && next && next.href) {
        var go = function () {
          items[0].removeEventListener('transitionend', onEnd);
          clearTimeout(advance);
          if (isComplete()) location.href = next.href;
        };
        var onEnd = function (e) { if (e.propertyName === 'translate') go(); };
        items[0].addEventListener('transitionend', onEnd);
        advance = setTimeout(go, 800);      // fallback if the transition never fires
      }
    });
  });

  restore();   // never auto-advances: coming back to a filled-in step just shows the picks

  // Step → step is a hard cut: no cross-document fade, so the bar can't be snapshotted,
  // faded or nudged on arrival. It is already showing the step the new page opens on.
  function isStep(u) { return /setup-\w+\.html/.test(u || ''); }
  window.addEventListener('pageswap', function (e) {
    var to = (e.activation && e.activation.entry && e.activation.entry.url) || '';
    if (e.viewTransition && isStep(to)) e.viewTransition.skipTransition();
  });
  window.addEventListener('pagereveal', function (e) {
    var from = (e.activation && e.activation.from && e.activation.from.url) || '';
    if (e.viewTransition && isStep(from)) e.viewTransition.skipTransition();
  });

  if (steps && active) {
    // Placed instantly, and left WITHOUT transitions: nothing that happens after a page
    // load — webfont swap, reflow, the view transition — can make the bar move.
    measure();
    setDone(false);
    function replace() { var d = done; measure(); done = null; setDone(d); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(replace);
    window.addEventListener('resize', replace);
  }
})();
