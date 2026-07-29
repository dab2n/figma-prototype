// Packs filter chips.
//
// Three independent filters, read off each card's own data- attributes:
//   env    All / Outdoor / Indoor   — one of them is always on
//   sport  Running, Sprint, …       — off until a chip in the drawer is picked
//   type   Creator / Pro / Skilled  — same
//
// Sports and Pack Type do not filter by themselves; they open a drawer under the chip
// row. The drawer takes real height in the flow, so opening it pushes the list down
// rather than covering it, and its chips run off to the right like the row above.
//
// Every re-filter replays the list's own arrival animation, so a narrowed list slides
// in the same way the page did — the change reads as the list being rebuilt, not as
// rows blinking out.
(function () {
  var row = document.querySelector('.filter-row');
  var list = document.querySelector('.pack-list');
  var drawer = document.getElementById('chipDrawer');
  var drawerChips = document.getElementById('drawerChips');

  // Snap is armed only once the arrival animation has landed. A mandatory snap container
  // re-snaps every time a snap area moves, and the entrance moves every card on every
  // frame — so the list locked and stepped instead of sliding, which is what read as the
  // slide-in breaking. Ahead of the filter wiring below on purpose: any page with a pack
  // list wants this, drawer or no drawer.
  var scroller = list && list.closest('.screen');
  var snapWait;
  function armSnap() {
    if (!scroller) return;
    clearTimeout(snapWait);
    scroller.classList.remove('snap');
    snapWait = setTimeout(function () { scroller.classList.add('snap'); }, 760);
  }
  armSnap();

  if (!row || !list || !drawer) return;

  var cards = [].slice.call(list.querySelectorAll('.pack-card'));
  var chips = [].slice.call(row.querySelectorAll('.chip'));

  // Built from the cards themselves, in the order they appear, so a new card shows up
  // in the drawer without anything here being edited.
  function values(attr) {
    var out = [];
    cards.forEach(function (c) {
      var v = c.getAttribute(attr);
      if (v && out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  var state = { env: 'all', sport: '', type: '' };
  var open = '';                      // which drawer is showing: '', 'sport' or 'type'

  function label(chip) { return (chip.childNodes[0].textContent || '').trim(); }

  function apply() {
    var shown = [];
    cards.forEach(function (c) {
      var ok = (state.env === 'all' || c.getAttribute('data-env') === state.env) &&
               (!state.sport || c.getAttribute('data-sport') === state.sport) &&
               (!state.type  || c.getAttribute('data-type')  === state.type);
      c.hidden = !ok;
      if (ok) shown.push(c);
      else {
        var v = c.querySelector('video');       // a hidden card must not keep decoding
        if (v && !v.paused) v.pause();
      }
    });

    // Replay the entrance on what is left. The animation has to be cleared and the
    // element read back before it can be re-armed — without the reflow the browser
    // never sees a change and nothing plays a second time.
    shown.forEach(function (c, i) {
      c.style.animation = 'none';
      void c.offsetWidth;
      c.style.animation = '';
      c.style.animationDelay = Math.min(i, 6) * 0.05 + 's';
    });

    var empty = document.getElementById('packEmpty');
    if (empty) empty.hidden = shown.length > 0;

    var top = list.closest('.screen');
    if (top) top.scrollTop = 0;
    armSnap();                          // the entrance replays, so the snap stands down
  }

  function paintChips() {
    chips.forEach(function (chip) {
      var name = label(chip);
      var on = (name === 'All' && state.env === 'all' && !state.sport && !state.type) ||
               (name === 'Outdoor' && state.env === 'outdoor') ||
               (name === 'Indoor' && state.env === 'indoor') ||
               (name === 'Sports' && !!state.sport) ||
               (name === 'Pack Type' && !!state.type);
      chip.classList.toggle('chip-selected', on);
    });
  }

  function fillDrawer(kind) {
    var attr = kind === 'sport' ? 'data-sport' : 'data-type';
    drawerChips.innerHTML = '';
    values(attr).forEach(function (v) {
      var el = document.createElement('span');
      el.className = 'chip' + (state[kind] === v ? ' chip-selected' : '');
      el.textContent = v;
      el.addEventListener('click', function () {
        state[kind] = state[kind] === v ? '' : v;   // tapping the live one clears it
        fillDrawer(kind);
        paintChips();
        apply();
      });
      drawerChips.appendChild(el);
    });
  }

  function setDrawer(kind) {
    open = (open === kind) ? '' : kind;
    if (open) fillDrawer(open);
    drawer.classList.toggle('open', !!open);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var name = label(chip);
      if (name === 'All')          { state = { env: 'all', sport: '', type: '' }; setDrawer(''); }
      else if (name === 'Outdoor') { state.env = state.env === 'outdoor' ? 'all' : 'outdoor'; }
      else if (name === 'Indoor')  { state.env = state.env === 'indoor'  ? 'all' : 'indoor'; }
      else if (name === 'Sports')     { setDrawer('sport'); }
      else if (name === 'Pack Type')  { setDrawer('type'); }
      paintChips();
      apply();
    });
  });

  paintChips();
})();
