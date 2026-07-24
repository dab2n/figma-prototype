// Setup flow: option toggles, bottom step-bar, Next button.
(function () {
  var steps  = document.querySelector('.setup-stepbar .steps');
  var active = steps && steps.querySelector('.step.active');
  var wrap   = steps && steps.parentElement;
  var items  = steps ? [].slice.call(steps.querySelectorAll('.step')) : [];
  var prev   = active && active.previousElementSibling;
  if (prev && !prev.classList.contains('step')) prev = null;
  var nextBtn = document.querySelector('.setup-stepbar .sb-next');

  var toggles = [].slice.call(document.querySelectorAll('[data-toggle]'));
  var hots    = [].slice.call(document.querySelectorAll('.body-hot'));
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

  // The active title sits flush left in the strip; the rest trail off to the right.
  // Measured with a given step playing active, so the arrival slide starts from exactly
  // where the previous page left the row.
  function offsetFor(step) {
    var swap = step !== active;
    if (swap) { active.classList.remove('active'); step.classList.add('active'); }
    var x = -step.offsetLeft;
    if (swap) { step.classList.remove('active'); active.classList.add('active'); }
    return x;
  }
  function place(x) { items.forEach(function (el) { el.style.translate = x + 'px'; }); }

  // Next lights up white once the page is answered, and only then navigates.
  function refresh() {
    if (!nextBtn) return;
    var c = nextBtn.hasAttribute('data-force-ready') || isComplete();
    nextBtn.classList.toggle('ready', c);
    if (c) nextBtn.setAttribute('href', nextBtn.getAttribute('data-next'));
    else nextBtn.removeAttribute('href');
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
      syncHots();
      refresh();
    });
  });

  // Tapping a region on the body figure is the same as tapping its chip.
  function chipFor(name) {
    for (var i = 0; i < toggles.length; i++) if (toggles[i].textContent.trim() === name) return toggles[i];
    return null;
  }
  function syncHots() {
    hots.forEach(function (h) {
      var chip = chipFor(h.getAttribute('data-region'));
      h.classList.toggle('sel', !!(chip && chip.classList.contains('sel')));
    });
  }
  hots.forEach(function (h) {
    h.addEventListener('click', function () {
      var chip = chipFor(h.getAttribute('data-region'));
      if (chip) chip.click();
    });
  });

  restore();
  syncHots();
  refresh();

  // Step → step is a hard cut: no cross-document fade, so the bar isn't snapshotted or
  // faded on arrival — the only motion is the slide below.
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
    var here = -active.offsetLeft;
    // Arrived from the step before this one → start the row where that page had it and
    // shift everything one slot left, the previous title dimming as this one lights up.
    var cameFromPrev = prev && document.referrer && document.referrer.indexOf(prev.getAttribute('href')) !== -1;
    if (cameFromPrev) {
      place(offsetFor(prev));
      active.classList.remove('active');
      prev.classList.add('active');
      void steps.offsetWidth;              // commit that start state (no rAF: a backgrounded
                                           // tab would never deliver the frame)
      steps.classList.add('placed');       // transitions on, for this slide only
      prev.classList.remove('active');
      active.classList.add('active');
      place(here);
    } else {
      place(here);                          // land instantly, no motion
    }
    window.addEventListener('resize', function () { place(-active.offsetLeft); });
  }
})();
