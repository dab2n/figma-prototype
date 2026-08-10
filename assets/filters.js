// Packs filter chips.
//
// Three independent filters, read off each card's own data- attributes:
//   env    All / Outdoor / Indoor   — one of them is always on
//   sport  Running, Sprint, …       — off until a chip in the drawer is picked
//   type   Creator / Pro / Skilled User — same
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
    snapWait = setTimeout(function () { scroller.classList.add('snap'); }, 980);
  }
  armSnap();

  // Re-arm the arrival. The animation has to be cleared and the element read back before
  // it will play a second time — without the reflow the browser never sees a change.
  function replay(cards) {
    cards.forEach(function (c, i) {
      c.style.animation = 'none';
      void c.offsetWidth;
      c.style.animation = '';
      c.style.animationDelay = Math.min(i, 7) * 0.07 + 's';
    });
    armSnap();
  }

  // Coming BACK to Packs has to slide in too. A page restored from the back/forward
  // cache is handed over exactly as it was left — CSS animations included, already
  // finished — so returning from a pack showed a list that had never moved.
  if (list) {
    addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      replay([].slice.call(list.querySelectorAll('.pack-card:not([hidden])')));
    });
  }

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

  var state = { env: 'all', sport: '', type: '', q: '' };
  var open = '';                      // which drawer is showing: '', 'sport' or 'type'

  function label(chip) { return (chip.childNodes[0].textContent || '').trim(); }

  // What a search matches: the pack's name, whose it is, and its sport and type — the
  // same four things the card already shows, so nothing matches on data nobody can see.
  function haystack(c) {
    if (!c.__hay) {
      c.__hay = [
        (c.querySelector('.pack-name') || {}).textContent || '',
        (c.querySelector('.t-caption-bold') || {}).textContent || '',
        c.getAttribute('data-sport') || '',
        c.getAttribute('data-type') || '',
        c.getAttribute('data-env') || ''
      ].join(' ').toLowerCase();
    }
    return c.__hay;
  }

  function apply() {
    var shown = [];
    cards.forEach(function (c) {
      var ok = (state.env === 'all' || c.getAttribute('data-env') === state.env) &&
               (!state.sport || c.getAttribute('data-sport') === state.sport) &&
               (!state.type  || c.getAttribute('data-type')  === state.type) &&
               (!state.q || haystack(c).indexOf(state.q) > -1);
      c.hidden = !ok;
      if (ok) shown.push(c);
      else {
        var v = c.querySelector('video');       // a hidden card must not keep decoding
        if (v && !v.paused) v.pause();
      }
    });

    replay(shown);          // a narrowed list arrives the same way the page did

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

  // ── Search ────────────────────────────────────────────────────────────────
  // The magnifier opens a field under the chip row rather than replacing the title: the
  // filters stay visible and stay in force, so a search is one more narrowing on top of
  // them rather than a mode that throws them away. Closing it clears the query.
  var search = document.getElementById('packSearch');
  var field = search && search.querySelector('input');
  var openBtn = document.querySelector('.app-bar .actions [data-search]');
  if (search && field && openBtn) {
    function setOpen(on) {
      search.classList.toggle('open', on);
      openBtn.classList.toggle('on', on);
      if (on) field.focus();
      else if (state.q) { state.q = ''; field.value = ''; apply(); }
    }
    openBtn.addEventListener('click', function () { setOpen(!search.classList.contains('open')); });
    search.querySelector('.ps-clear').addEventListener('click', function () {
      if (field.value) { field.value = ''; state.q = ''; apply(); field.focus(); }
      else setOpen(false);
    });
    var t;
    field.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        var v = field.value.trim().toLowerCase();
        if (v === state.q) return;
        state.q = v;
        apply();
      }, 140);
    });
    field.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // ── What the funnel drives ────────────────────────────────────────────────
  // The filter sheet sets all three axes at once instead of one drawer at a time.
  // It moves THIS state rather than keeping its own — two things hiding the same
  // cards is exactly how they end up disagreeing about what is on screen — so the
  // chips repaint from the sheet's choice and the sheet opens on the chips'.
  window.__packFilter = {
    values: function (attr) { return values(attr); },
    get: function () {
      return { env: state.env === 'all' ? '' : state.env, sport: state.sport, type: state.type };
    },
    set: function (sel) {
      state.env = sel.env || 'all';
      state.sport = sel.sport || '';
      state.type = sel.type || '';
      setDrawer('');
      paintChips();
      apply();
    },
    // How many cards a selection would leave, WITHOUT applying it — so Apply is
    // never a guess. The live search term still counts: the sheet narrows what
    // the field has already found rather than replacing it.
    count: function (sel) {
      return cards.filter(function (c) {
        return (!sel.env || c.getAttribute('data-env') === sel.env) &&
               (!sel.sport || c.getAttribute('data-sport') === sel.sport) &&
               (!sel.type || c.getAttribute('data-type') === sel.type) &&
               (!state.q || haystack(c).indexOf(state.q) > -1);
      }).length;
    }
  };
})();
