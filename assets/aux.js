// The behaviour behind the icons the rest of the app draws but never wired:
// the bell, the magnifier, the funnel, the share arrow, the bookmark — and the
// press-and-let-go answer given to the ones whose function the design never
// settled (every kebab in the app).
//
// One file rather than five inline scripts: all of it is delegated off document
// or built from a small config, so a page opts in by including this and adding
// the markup, not by pasting logic.
(function () {
  var Aux = window.Aux = window.Aux || {};

  // ── Small persistent store ────────────────────────────────────────────────
  // Everything here is prototype state: which notifications have been read, what
  // has been searched, what is bookmarked. localStorage can throw (private mode,
  // a WebView with storage off), and none of it is worth a broken screen.
  function get(k, d) {
    try { var v = localStorage.getItem('nw.' + k); return v == null ? d : JSON.parse(v); }
    catch (e) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem('nw.' + k, JSON.stringify(v)); } catch (e) {}
  }
  Aux.get = get; Aux.set = set;

  // ── Controls that lead nowhere ────────────────────────────────────────────
  // Marked in the markup with data-inert. They take the selected look for a beat
  // and release it; nothing navigates. Delegated, so markup added later is covered.
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('[data-inert]');
    if (!el) return;
    el.classList.add('pressing');
    clearTimeout(el.__t);
    el.__t = setTimeout(function () { el.classList.remove('pressing'); }, 620);
  }, { passive: true });
  // A real <button> would submit or scroll-jump; nothing behind it should happen.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-inert]');
    if (el) e.preventDefault();
  });

  // ── Bottom sheet ──────────────────────────────────────────────────────────
  // The sheet is a child of .phone so it covers the tab bar. Opening is two
  // frames: [hidden] off, then .open, because a transition cannot run from
  // display:none.
  function openSheet(el) {
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('open'); });
    });
  }
  function closeSheet(el) {
    if (!el || el.hidden) return;
    el.classList.remove('open');
    setTimeout(function () { el.hidden = true; }, 380);
  }
  Aux.openSheet = openSheet;
  Aux.closeSheet = closeSheet;

  // The scrim and anything marked data-close dismiss it; a tap inside the card
  // does not.
  document.addEventListener('click', function (e) {
    var sheet = e.target.closest('.sheet');
    if (!sheet) return;
    if (e.target.closest('.sheet-scrim') || e.target.closest('[data-close]')) closeSheet(sheet);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.sheet.open');
    if (open) closeSheet(open);
  });

  // ── Filter sheet ──────────────────────────────────────────────────────────
  // Given the axes a page can actually filter on, this builds the sheet, keeps a
  // draft selection while it is open, and hands the selection back on Apply. It
  // owns no filtering of its own — the page already knows how to hide its cards,
  // and two things hiding the same cards is how they end up disagreeing.
  //
  // cfg = {
  //   button:  the control that opens it
  //   sheet:   the .sheet element
  //   axes:    [{ key, label, values: [string] }]
  //   count:   sel -> how many rows that selection leaves    (optional)
  //   apply:   sel -> the page narrows itself
  //   initial: the selection to open with                    (optional)
  // }
  Aux.filterSheet = function (cfg) {
    var sheet = cfg.sheet, btn = cfg.button;
    if (!sheet || !btn) return;
    var body = sheet.querySelector('.sheet-body');
    var countEl = sheet.querySelector('.sheet-count');
    var live = Object.assign({}, cfg.initial || {});   // what the page is showing
    var draft = {};

    cfg.axes.forEach(function (ax) {
      var g = document.createElement('div');
      g.className = 'sheet-group';
      var l = document.createElement('p');
      l.className = 'sheet-label';
      l.textContent = ax.label;
      var chips = document.createElement('div');
      chips.className = 'sheet-chips';
      ax.values.forEach(function (v) {
        var c = document.createElement('button');
        c.className = 'sh-chip';
        c.type = 'button';
        c.textContent = v.label || v;
        c.dataset.axis = ax.key;
        c.dataset.value = v.value != null ? v.value : v;
        chips.appendChild(c);
      });
      g.appendChild(l); g.appendChild(chips);
      body.appendChild(g);
    });

    function paint() {
      body.querySelectorAll('.sh-chip').forEach(function (c) {
        c.classList.toggle('on', draft[c.dataset.axis] === c.dataset.value);
      });
      if (countEl && cfg.count) {
        var n = cfg.count(draft);
        countEl.innerHTML = '<b>' + n + '</b> ' + (n === 1 ? 'result' : 'results');
      }
    }

    body.addEventListener('click', function (e) {
      var c = e.target.closest('.sh-chip');
      if (!c) return;
      var k = c.dataset.axis;
      // Tapping the live one clears that axis — every axis is optional, so there
      // is no "All" chip to have to keep in step with the others.
      draft[k] = draft[k] === c.dataset.value ? '' : c.dataset.value;
      paint();
    });

    btn.addEventListener('click', function () {
      draft = Object.assign({}, live);
      paint();
      openSheet(sheet);
    });

    var reset = sheet.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () { draft = {}; paint(); });

    var apply = sheet.querySelector('[data-apply]');
    if (apply) apply.addEventListener('click', function () {
      live = Object.assign({}, draft);
      cfg.apply(live);
      // The funnel carries whether anything is on, so the state is legible with
      // the sheet shut.
      var any = Object.keys(live).some(function (k) { return live[k]; });
      btn.classList.toggle('on', any);
      closeSheet(sheet);
    });

    paint();
  };

  // ── Share sheet ───────────────────────────────────────────────────────────
  // What a prototype can honestly do with a share arrow: show what is being
  // shared and put its link on the clipboard. No invented app targets — there
  // are no icons for them in this project and there is nothing behind them.
  Aux.shareSheet = function (opts) {
    var sheet = document.getElementById('shareSheet');
    if (!sheet) return;
    var name = sheet.querySelector('.sh-item .nm');
    var link = sheet.querySelector('.sh-item .ln');
    var th = sheet.querySelector('.sh-item .th');
    var copy = sheet.querySelector('[data-copy]');
    var url = opts.url || location.href.split('#')[0];
    if (name) name.textContent = opts.title || document.title;
    if (link) link.textContent = url;
    if (th && opts.thumb) th.style.backgroundImage = "url('" + opts.thumb + "')";

    if (copy && !copy.__wired) {
      copy.__wired = true;
      copy.addEventListener('click', function () {
        // i18n.js watches the document for text changes and re-translates, so
        // writing the English is all either language needs.
        var done = function () {
          copy.classList.add('done');
          copy.textContent = 'Link copied';
          setTimeout(function () {
            copy.classList.remove('done');
            copy.textContent = 'Copy link';
          }, 1600);
        };
        // navigator.clipboard needs a secure context; the fallback is the old
        // hidden-textarea trick, which works on file:// and plain http too.
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, fallback);
        } else fallback();
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = url;
          ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });
    }
    openSheet(sheet);
  };

  // ── Bookmark ──────────────────────────────────────────────────────────────
  // Every [data-save] on a page toggles the SAME pack, so the hero pill and the
  // sheet's own bookmark stay in step; the count beside it moves with it, and My
  // remembers how many there are.
  var BASE_SAVED = 12;                       // what My shows before anything is tapped
  function paintSaved() {
    var saved = get('saved', {});
    document.querySelectorAll('[data-save]').forEach(function (el) {
      var on = !!saved[el.getAttribute('data-save')];
      el.classList.toggle('saved', on);
      var n = el.querySelector('[data-save-count]');
      if (n) {
        var base = +n.getAttribute('data-save-count');
        n.textContent = base + (on ? 1 : 0);
      }
    });
  }
  Aux.savedCount = function () {
    var saved = get('saved', {}), n = 0;
    for (var k in saved) if (saved[k]) n++;
    return BASE_SAVED + n;
  };
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-save]');
    if (!el) return;
    e.preventDefault();
    var key = el.getAttribute('data-save');
    var saved = get('saved', {});
    saved[key] = !saved[key];
    set('saved', saved);
    paintSaved();
    el.classList.remove('pop');
    void el.offsetWidth;                       // the animation will not replay without it
    el.classList.add('pop');
  });

  // ── Unread notifications ──────────────────────────────────────────────────
  // The list writes which ids have been read; the bell reads it, so the dot on
  // Home is the same fact the list is showing.
  Aux.unread = function (ids) {
    var read = get('ntRead', {});
    return ids.filter(function (id) { return !read[id]; }).length;
  };

  function start() {
    paintSaved();
    // Home's bell carries a dot while anything is unread.
    document.querySelectorAll('[data-bell]').forEach(function (a) {
      var ids = (a.getAttribute('data-bell') || '').split(',').filter(Boolean);
      a.classList.toggle('has-new', Aux.unread(ids) > 0);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
