// Pack detail is one screen, not eleven copies of it: ?pack=<key> swaps the hero photo,
// the creator and the copy, and everything else — the swipe sheet, the transitions, the
// Start flow — stays exactly as it is. No key (or an unknown one) leaves the markup
// alone, which is Sean's pack, so every existing link still lands where it did.
(function () {
  var PACKS = {
    sprint: {
      mins: 7,
      photo: 'recent-running.png', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Without Limits',
      desc: 'Break the ceiling you keep hitting at top speed. Kanni rebuilds your drive phase and arm carriage first, then holds that form under fatigue so the last 20m stops falling apart.'
    },
    bolt: {
      mins: 7,
      photo: 'packs-card3-thumb.png', author: 'Usain Bolt', avatar: 'packs-avatar-usainbolt.png',
      title: "Usain Bolt's Sprint Masterclass",
      desc: 'The block start, the transition and the top-end mechanics, taken one at a time. Short reps with long rests, so every rep is run at the speed you are actually training for.'
    },
    curry: {
      mins: 11,
      photo: 'rec-curry.png', author: 'Janghoon', avatar: 'packs-avatar1.png',
      title: "Curry's Step Back",
      desc: 'Create the half metre you need to get the shot off. Footwork into the step back, then the balance to land square and rise without drifting sideways.'
    },
    strength: {
      mins: 14,
      photo: 'rec-strength.png', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Strength for Agility',
      desc: 'Agility fails where strength runs out. Single-leg work and controlled decelerations build the base that lets you change direction late without losing the line.'
    },
    ladder: {
      mins: 8,
      photo: 'rec-ladder.png', author: 'Sojin', avatar: 'packs-avatar3.png',
      title: 'Ladder Footwork',
      desc: 'Quick feet that survive contact with a real game. Ladder patterns first, then the same patterns with a ball and a defender in front of you.'
    },
    sprinter: {
      mins: 6,
      photo: 'pack-sprinter.png', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Starts',
      desc: 'The first three steps decide the race more than the next thirty. Set-up, shin angle and the push that follows, drilled until it stops being a decision.'
    },
    interval: {
      mins: 22,
      photo: 'pack-interval.png', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Interval Push',
      desc: 'Hard efforts with honest recoveries. Learn to hold the target pace on the fourth rep as cleanly as the first, and to read when to back off instead of blowing up.'
    },
    legburn: {
      mins: 9,
      photo: 'pack-legburn.png', author: 'Jiwoo', avatar: 'packs-avatar4.png',
      title: 'Leg Burn Set',
      desc: 'A short set that finds the point where your legs stop cooperating, then keeps the form together past it. Built to be repeated at the end of any session.'
    },
    boxing: {
      mins: 16,
      photo: 'movement-boxing.png', author: 'Janghoon', avatar: 'packsx-avatar-a.png',
      title: 'Southpaw Drill',
      desc: 'Working against the other stance without reaching. Angle out of the lead hand, keep the rear foot loaded, and land the counter on the way past.'
    },
    tennis: {
      mins: 18,
      photo: 'recent-tennis.png', author: 'Sojin', avatar: 'packsx-avatar-b.png',
      title: 'Baseline Rally',
      desc: 'Depth before power. Recover to the middle every ball, take the high one early, and hold the rally until the short one you can actually attack shows up.'
    },
    basketball: {
      mins: 12,
      photo: 'recent-basketball.png', author: 'Jiwoo', avatar: 'packsx-avatar-c.png',
      title: 'Court Footwork',
      desc: 'The steps between the highlights. Closeouts, drop steps and the slide that keeps your hips in front, drilled at the speed the game is actually played at.'
    }
  };

  // The bottom sheet and the kebab are tinted from the hero photo itself, so the screen
  // has to know its colour. Average a small downsample, keep a darker mate for the ramp,
  // and record whether the photo is light or dark — that decides which veil goes on top.
  function tone(url) {
    var img = new Image();
    img.onload = function () {
      var n = 24, c = document.createElement('canvas');
      c.width = n; c.height = n;
      var g = c.getContext('2d');
      g.drawImage(img, 0, 0, n, n);
      var d, r = 0, gr = 0, b = 0, k = 0;
      try { d = g.getImageData(0, 0, n, n).data; } catch (e) { return; }
      for (var i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; k++; }
      r = Math.round(r / k); gr = Math.round(gr / k); b = Math.round(b / k);
      var deep = function (v) { return Math.max(0, Math.round(v * 0.72)); };
      var el = document.querySelector('.swipe-detail, .dj-screen') || document.body;
      el.style.setProperty('--pack-main', 'rgb(' + r + ',' + gr + ',' + b + ')');
      el.style.setProperty('--pack-main-80', 'rgba(' + r + ',' + gr + ',' + b + ',0.8)');
      el.style.setProperty('--pack-deep', 'rgb(' + deep(r) + ',' + deep(gr) + ',' + deep(b) + ')');
      // 0.40, not 0.5: a photograph's average almost never clears mid-grey, so 0.5 calls
      // everything dark. Calibrated on the pack this screen shipped with — Sean's tan
      // photo averages 0.42 and the design gives it the black veil.
      // The canvas under the sheet takes the same tone, so the gesture bar strip below
      // it reads as a continuation of the sheet rather than a different surface.
      document.documentElement.style.background = 'rgb(' + deep(r) + ',' + deep(gr) + ',' + deep(b) + ')';
      // Same idea at the top: the OS status bar takes the photo's tone instead of a
      // fixed colour that was only ever right for one pack.
      var tc = document.querySelector('meta[name=theme-color]');
      if (tc) tc.setAttribute('content', 'rgb(' + r + ',' + gr + ',' + b + ')');
      var lum = (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;
      el.classList.toggle('pack-light', lum >= 0.40);
      el.classList.toggle('pack-dark', lum < 0.40);
    };
    img.src = url;
  }

  var key;
  try { key = new URLSearchParams(location.search).get('pack'); } catch (e) { key = null; }
  var p = key && PACKS[key];

  var hero = document.querySelector('.dj-photo, .hero-photo');
  if (!p) {                                  // default pack: markup stays, still tint it
    if (hero) {
      var m = (hero.style.backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
      if (m) tone(m[1]);
    }
    return;
  }
  tone('assets/photos/' + p.photo);

  function put(sel, fn) {
    // Hero and sheet both carry the title/description now that they are one page,
    // so every match gets filled, not just the first.
    [].forEach.call(document.querySelectorAll(sel), fn);
  }

  // The playhead is the PACK's length, not the clip's — same number the pack card in
  // the list carries.
  var prog = document.querySelector('.dj-progress');
  if (prog && p.mins) prog.style.setProperty('--dur', (p.mins * 60) + 's');

  if (hero) {
    hero.style.backgroundImage = "url('assets/photos/" + p.photo + "')";
    // A pack plays its own clip if it has one; the rest are stills. Drop an mp4 in
    // assets/photos and name it here (clip: '…​.mp4') and that pack starts moving.
    var clip = hero.querySelector('video');
    if (clip) {
      if (p.clip) {
        clip.src = 'assets/photos/' + p.clip;
        clip.poster = 'assets/photos/' + p.photo;
      } else {
        clip.remove();
      }
    }
    // Landscape thumbs crop hard in a portrait hero; a few carry their own framing.
    if (p.pos) hero.style.backgroundPosition = p.pos;
  }
  put('.dj-profile img, .detail-text .author img', function (el) { el.src = 'assets/photos/' + p.avatar; });
  put('.dj-profile .name, .detail-text .author-name', function (el) { el.textContent = p.author; });
  put('.dj-title, .detail-title, .creator-heading .title', function (el) { el.textContent = p.title; });
  put('.dj-desc, .detail-desc, .creator-heading .desc', function (el) { el.textContent = p.desc; });
  put('.dj-meta .tag-pill', function (el) { el.textContent = p.author; });
  put('.more-from', function (el) { el.textContent = 'More Packs from ' + p.author; });
  document.title = 'Newton — ' + p.title;
})();
