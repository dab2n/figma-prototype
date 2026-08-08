// clip-*.mp4 are stand-ins from mixkit.co (Mixkit Free License: free to use in a project,
// no attribution required, not redistributable as stock) — placeholders until the real
// footage arrives. Replace the file, keep the name, and nothing else has to change.
//
// Pack detail is one screen, not eleven copies of it: ?pack=<key> swaps the hero photo,
// the creator and the copy, and everything else — the swipe sheet, the transitions, the
// Start flow — stays exactly as it is. No key (or an unknown one) leaves the markup
// alone, which is Sean's pack, so every existing link still lands where it did.
(function () {
  var PACKS = {
    akiyama: {
      mins: 11,
      week: '1284', crew: ['packs-avatar3.png', 'packsx-avatar-b.png', 'joined-avatar-jiwoo.png'],
      clip: 'akiyama-smile.mp4',
      type: 'Pro', sub: 'Movement Coach · 512K subscribers',
      sport: 'Agility', joined: '3,190', rec: ['Rhythm', 'Balance'],
      total: 19, bars: [['5min', 'LOOSEN'], ['9min', 'SHADOW'], ['You Can Choose', 'GHOST!']],
      info: ['Some Experience', 'Rhythm · Deception', 'Indoor Court', 'Pro'],
      also: ['curry', 'ladder'], more: ['basketball', 'ladder', 'strength'],
      photo: 'akiyama-smile-poster.jpg', author: 'Akiyama', avatar: 'packs-avatar3.png',
      title: "Akiyama's Ghost Step",
      desc: 'The step that leaves a defender reading the wrong hip. Weight shift first, then the tempo change that sells it, drilled slowly before it is run at speed.'
    },
    sprint: {
      mins: 7,
      week: '214', crew: ['packs-profile-kanni.png', 'packsx-avatar-a.png', 'packs-avatar4.png'],
      clip: 'clip-sprint.mp4',
      type: 'Creator', sub: 'Sprint Coach · 96K subscribers',
      sport: 'Sprint', joined: '412', rec: ['Boost'],
      total: 16, bars: [['5min', 'PRIME'], ['8min', 'DRIVE'], ['You Can Choose', 'SPRINT!']],
      info: ['Some Experience', 'Power · Turnover', 'Track', 'Creator'],
      also: ['interval', 'legburn'], more: ['sprinter', 'bolt', 'strength'],
      photo: 'recent-running.jpg', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Without Limits',
      desc: 'Break the ceiling you keep hitting at top speed. Kanni rebuilds your drive phase and arm carriage first, then holds that form under fatigue so the last 20m stops falling apart.'
    },
    bolt: {
      mins: 7,
      week: '2077', crew: ['packs-avatar-usainbolt.png', 'packsx-avatar-c.png', 'packs-avatar1.png'],
      clip: 'clip-bolt.mp4',
      type: 'Pro', sub: 'Olympic Sprinter · 2.1M subscribers',
      sport: 'Sprint', joined: '5,204', rec: ['Boost', 'Pace On'],
      total: 21, bars: [['6min', 'SET-UP'], ['9min', 'BLOCKS'], ['You Can Choose', 'RACE!']],
      info: ['Advanced', 'Power · Reaction', 'Track', 'Pro'],
      also: ['sprint', 'sprinter'], more: ['sprint', 'interval', 'legburn'],
      photo: 'packs-card3-thumb.png', author: 'Usain Bolt', avatar: 'packs-avatar-usainbolt.png',
      title: "Usain Bolt's Sprint Masterclass",
      desc: 'The block start, the transition and the top-end mechanics, taken one at a time. Short reps with long rests, so every rep is run at the speed you are actually training for.'
    },
    curry: {
      mins: 11,
      week: '496', crew: ['packs-avatar1.png', 'joined-avatar-swim.png', 'packsx-avatar-d.png'],
      clip: 'clip-curry.mp4',
      type: 'Creator', sub: 'Skills Creator · 318K subscribers',
      sport: 'Basketball', joined: '1,146', rec: ['Balance'],
      total: 20, bars: [['6min', 'WARM'], ['11min', 'DRILL'], ['You Can Choose', 'SHOOT!']],
      info: ['Basics Recommended', 'Balance · Footwork', 'Indoor Court', 'Creator'],
      also: ['basketball', 'ladder'], more: ['boxing', 'basketball', 'ladder'],
      photo: 'rec-curry.jpg', author: 'Janghoon', avatar: 'packs-avatar1.png',
      title: "Curry's Step Back",
      desc: 'Create the half metre you need to get the shot off. Footwork into the step back, then the balance to land square and rise without drifting sideways.'
    },
    strength: {
      mins: 14,
      week: '331', crew: ['packs-avatar2.png', 'packsx-avatar-a.png', 'packs-avatar3.png'],
      clip: 'clip-strength.mp4',
      type: 'Skilled User', sub: 'S&C Coach · 74K subscribers',
      sport: 'Strength', joined: '638', rec: ['Safe', 'Balance'],
      total: 24, bars: [['7min', 'MOBILISE'], ['13min', 'LOAD'], ['You Can Choose', 'HOLD!']],
      info: ['Some Experience', 'Stability · Strength', 'Gym', 'Skilled User'],
      also: ['ladder', 'legburn'], more: ['interval', 'legburn', 'sprint'],
      photo: 'rec-strength.jpg', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Agility Strength',
      desc: 'Agility fails where strength runs out. Single-leg work and controlled decelerations build the base that lets you change direction late without losing the line.'
    },
    ladder: {
      mins: 8,
      week: '405', crew: ['packs-avatar4.png', 'packsx-avatar-b.png', 'joined-avatar-jiwoo.png'],
      clip: 'clip-ladder.mp4',
      type: 'Creator', sub: 'Footwork Creator · 129K subscribers',
      sport: 'Agility', joined: '902', rec: ['Rhythm'],
      total: 15, bars: [['4min', 'LOOSEN'], ['9min', 'PATTERN'], ['You Can Choose', 'PLAY!']],
      info: ['Anyone', 'Rhythm · Coordination', 'Indoor', 'Creator'],
      also: ['basketball', 'tennis'], more: ['tennis', 'basketball', 'curry'],
      photo: 'rec-ladder.jpg', author: 'Sojin', avatar: 'packs-avatar3.png',
      title: 'Ladder Footwork',
      desc: 'Quick feet that survive contact with a real game. Ladder patterns first, then the same patterns with a ball and a defender in front of you.'
    },
    sprinter: {
      mins: 6,
      week: '168', crew: ['packs-profile-kanni.png', 'packsx-avatar-d.png', 'packs-avatar2.png'],
      clip: 'clip-sprinter.mp4',
      type: 'Creator', sub: 'Sprint Coach · 96K subscribers',
      sport: 'Sprint', joined: '355', rec: ['Boost'],
      total: 13, bars: [['4min', 'PRIME'], ['7min', 'PUSH'], ['You Can Choose', 'GO!']],
      info: ['Some Experience', 'Reaction · Power', 'Track', 'Creator'],
      also: ['sprint', 'interval'], more: ['sprint', 'bolt', 'legburn'],
      photo: 'pack-sprinter.jpg', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Starts',
      desc: 'The first three steps decide the race more than the next thirty. Set-up, shin angle and the push that follows, drilled until it stops being a decision.'
    },
    interval: {
      mins: 22,
      week: '742', crew: ['packs-avatar2.png', 'joined-avatar-swim.png', 'packsx-avatar-c.png'],
      clip: 'clip-interval.mp4',
      type: 'Skilled User', sub: 'S&C Coach · 74K subscribers',
      sport: 'Running', joined: '1,507', rec: ['Pace On', 'Safe'],
      total: 32, bars: [['8min', 'EASE IN'], ['20min', 'REPS'], ['You Can Choose', 'COOL!']],
      info: ['Some Experience', 'Endurance · Pacing', 'Outdoor', 'Skilled User'],
      also: ['legburn', 'sprint'], more: ['strength', 'legburn', 'sprinter'],
      photo: 'pack-interval.jpg', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Interval Push',
      desc: 'Hard efforts with honest recoveries. Learn to hold the target pace on the fourth rep as cleanly as the first, and to read when to back off instead of blowing up.'
    },
    legburn: {
      mins: 9,
      week: '963', crew: ['joined-avatar-jiwoo.png', 'packsx-avatar-a.png', 'packs-avatar1.png'],
      clip: 'clip-legburn.mp4',
      type: 'Creator', sub: 'Home Training Creator · 205K subscribers',
      sport: 'Legs', joined: '2,388', rec: ['Safe'],
      total: 14, bars: [['3min', 'PREP'], ['9min', 'BURN'], ['You Can Choose', 'FINISH!']],
      info: ['Anyone', 'Endurance · Control', 'Anywhere', 'Creator'],
      also: ['strength', 'interval'], more: ['basketball', 'strength', 'ladder'],
      photo: 'pack-legburn.jpg', author: 'Jiwoo', avatar: 'packs-avatar4.png',
      title: 'Leg Burn Set',
      desc: 'A short set that finds the point where your legs stop cooperating, then keeps the form together past it. Built to be repeated at the end of any session.'
    },
    boxing: {
      mins: 16,
      week: '359', crew: ['packs-avatar1.png', 'packsx-avatar-c.png', 'packs-avatar4.png'],
      clip: 'clip-boxing.mp4',
      type: 'Pro', sub: 'Skills Creator · 318K subscribers',
      sport: 'Boxing', joined: '774', rec: ['Boost', 'Balance'],
      total: 26, bars: [['6min', 'SHADOW'], ['14min', 'COMBOS'], ['You Can Choose', 'SPAR!']],
      info: ['Basics Recommended', 'Timing · Angles', 'Indoor', 'Pro'],
      also: ['ladder', 'strength'], more: ['curry', 'basketball', 'ladder'],
      photo: 'movement-boxing.jpg', author: 'Janghoon', avatar: 'packsx-avatar-a.png',
      title: 'Southpaw Drill',
      desc: 'Working against the other stance without reaching. Angle out of the lead hand, keep the rear foot loaded, and land the counter on the way past.'
    },
    tennis: {
      mins: 18,
      week: '228', crew: ['packs-avatar4.png', 'packsx-avatar-b.png', 'joined-avatar-swim.png'],
      clip: 'clip-tennis.mp4',
      type: 'Creator', sub: 'Footwork Creator · 129K subscribers',
      sport: 'Tennis', joined: '486', rec: ['Pace On'],
      total: 27, bars: [['7min', 'RALLY IN'], ['16min', 'DEPTH'], ['You Can Choose', 'POINT!']],
      info: ['Some Experience', 'Depth · Recovery', 'Outdoor Court', 'Creator'],
      also: ['ladder', 'basketball'], more: ['ladder', 'curry', 'basketball'],
      photo: 'recent-tennis.jpg', author: 'Sojin', avatar: 'packsx-avatar-b.png',
      title: 'Baseline Rally',
      desc: 'Depth before power. Recover to the middle every ball, take the high one early, and hold the rally until the short one you can actually attack shows up.'
    },
    basketball: {
      mins: 12,
      week: '517', crew: ['joined-avatar-jiwoo.png', 'packs-avatar3.png', 'packsx-avatar-d.png'],
      clip: 'clip-basketball.mp4',
      type: 'Skilled User', sub: 'Home Training Creator · 205K subscribers',
      sport: 'Basketball', joined: '1,033', rec: ['Balance', 'Rhythm'],
      total: 19, bars: [['5min', 'SLIDE'], ['12min', 'CLOSEOUT'], ['You Can Choose', 'RUN IT!']],
      info: ['Basics Recommended', 'Footwork · Balance', 'Indoor Court', 'Skilled User'],
      also: ['curry', 'ladder'], more: ['legburn', 'curry', 'boxing'],
      photo: 'recent-basketball.jpg', author: 'Jiwoo', avatar: 'packsx-avatar-c.png',
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

      // The blurred band across the foot of the hero is the clip's colour, not a fixed
      // tan. Sampled from the BOTTOM THIRD of the frame, because that is the part of the
      // picture the band actually sits over — the whole-frame mean is nearly neutral on a
      // photograph, which is how every pack ended up wearing the same warm wash. The
      // chroma is pushed back out from that patch's own luminance, the same way the kebab
      // does it, so the band reads as the colour the eye sees down there rather than the
      // grey an average makes of it.
      var wr = 0, wg = 0, wb = 0, wk = 0;
      for (var wy = Math.floor(n * 0.62); wy < n; wy++) {
        for (var wx = 0; wx < n; wx++) {
          var w = (wy * n + wx) * 4;
          wr += d[w]; wg += d[w + 1]; wb += d[w + 2]; wk++;
        }
      }
      wr /= wk; wg /= wk; wb /= wk;
      var wl = 0.2126 * wr + 0.7152 * wg + 0.0722 * wb;
      var pull = function (v, k) { return Math.max(0, Math.min(255, Math.round(wl + (v - wl) * k))); };
      var lift = function (v, k) { return Math.max(0, Math.min(255, Math.round(v * k))); };
      // Top of the band is the deep end, the foot is the light one — the same two-stop
      // climb the hand-picked pair had, now taken from the picture.
      el.style.setProperty('--pack-wash-a',
        'rgba(' + lift(pull(wr, 1.5), 0.62) + ',' + lift(pull(wg, 1.5), 0.62) + ',' + lift(pull(wb, 1.5), 0.62) + ',0.42)');
      el.style.setProperty('--pack-wash-b',
        'rgba(' + lift(pull(wr, 1.5), 1.18) + ',' + lift(pull(wg, 1.5), 1.18) + ',' + lift(pull(wb, 1.5), 1.18) + ',0.78)');

      // The kebab gets its own reading. Two reasons the frame average will not do for it:
      // it sits in the TOP RIGHT, which can be a different part of the picture entirely,
      // and the mean of a whole photograph is nearly neutral — averaging is what turns a
      // warm road into grey. So sample the corner it actually covers and push the chroma
      // back out from that patch's own luminance, which restores the colour the eye reads
      // in the frame without inventing a hue that is not there.
      var br = 0, bg = 0, bb = 0, bk = 0;
      for (var y = 0; y < n * 0.38; y++) {
        for (var x = Math.floor(n * 0.55); x < n; x++) {
          var j = (y * n + x) * 4;
          br += d[j]; bg += d[j + 1]; bb += d[j + 2]; bk++;
        }
      }
      br /= bk; bg /= bk; bb /= bk;
      var bl = 0.2126 * br + 0.7152 * bg + 0.0722 * bb;
      var chroma = function (v) { return Math.max(0, Math.min(255, Math.round(bl + (v - bl) * 1.8))); };
      el.style.setProperty('--pack-btn-80',
        'rgba(' + chroma(br) + ',' + chroma(bg) + ',' + chroma(bb) + ',0.8)');
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

  // ── The sheet ────────────────────────────────────────────────────────────
  // Everything below the fold is the pack's too. Cross-references (You might also
  // like, More Packs from) are built FROM the table, so a card's title, length and
  // type can never drift from the page it opens.
  function txt(sel, s) { var el = document.querySelector(sel); if (el && s != null) el.textContent = s; }

  if (p.sub) txt('.dj-meta .sub', p.sub);
  if (p.type) txt('.creator-content .top-row .tag-pill', p.type);
  // The bar at the foot is this pack's crowd, not a fixed three: a different count and
  // three different faces per pack, so two cards opened one after the other do not look
  // like the same screen with the title swapped.
  if (p.week) txt('.joined-people p', p.week + ' joined this week');
  if (p.crew) {
    [].forEach.call(document.querySelectorAll('.joined-avatars'), function (row) {
      [].forEach.call(row.querySelectorAll('img'), function (img, i) {
        if (p.crew[i]) img.src = 'assets/photos/' + p.crew[i];
      });
    });
  }

  txt('.stats-row .stat:nth-child(1) .value', p.sport);
  txt('.stats-row .stat:nth-child(3) .value', p.joined);

  // Recommended carries more than one mode on some packs, stacked rather than run
  // together on one line.
  var recCell = document.querySelector('.stats-row .stat:nth-child(5)');
  if (recCell && p.rec) {
    [].forEach.call(recCell.querySelectorAll('.value'), function (el) { el.remove(); });
    p.rec.forEach(function (mode) {
      var el = document.createElement('p');
      el.className = 'value';
      el.textContent = mode;
      recCell.appendChild(el);
    });
  }

  // The total is read by process.js on its way past, so this has to land first — it
  // does: packs.js is the earlier <script defer>.
  // Every link that lands back on this screen keeps the pack. Without it the fold's own
  // pages and the back button dropped the key and the screen reverted to the markup —
  // which is Sean's pack, whichever card you had opened.
  [].forEach.call(document.querySelectorAll('a[href]'), function (a) {
    var h = a.getAttribute('href');
    if (!/^(pyeongso|ollilttae)\.html$/.test(h)) return;
    a.setAttribute('href', h + '?pack=' + key);
  });

  if (p.total) txt('.process-graph .big-number .num', p.total);
  if (p.bars) {
    [].forEach.call(document.querySelectorAll('.process-graph .bar'), function (bar, i) {
      if (!p.bars[i]) return;
      bar.firstElementChild.textContent = p.bars[i][0];
      bar.querySelector('.label').textContent = p.bars[i][1];
    });
  }
  if (p.info) {
    [].forEach.call(document.querySelectorAll('.info-grid .cell .value'), function (el, i) {
      if (p.info[i]) el.textContent = p.info[i];
    });
  }

  // A card, filled from the pack it points at.
  function fill(a, key, imgSel, titleSel) {
    var t = PACKS[key];
    if (!a || !t) return;
    a.setAttribute('href', 'pyeongso.html?pack=' + key);
    var img = a.querySelector(imgSel);
    if (img) { img.src = 'assets/photos/' + t.photo; img.alt = ''; }
    var title = a.querySelector(titleSel);
    if (title) title.textContent = t.title;
    var meta = a.querySelectorAll('.meta span');
    if (meta.length >= 2) {
      meta[0].textContent = t.type || '';
      meta[meta.length - 1].textContent = t.mins + 'm';
    }
  }
  if (p.also) {
    [].forEach.call(document.querySelectorAll('.also-like-item'), function (a, i) {
      fill(a, p.also[i], 'img', '.t-body-bold');
    });
  }
  if (p.more) {
    [].forEach.call(document.querySelectorAll('.more-card'), function (a, i) {
      fill(a, p.more[i], 'img', '.t-body-bold');
    });
  }
})();

// Back goes back, when back is a screen you came from on purpose.
//
// The pack's back button is a fixed link to Packs, because history.back() used to land on
// the setup flow — you reach this screen from there too, and returning INTO a flow you had
// just left is worse than always landing somewhere sane. But it costs you the other case:
// open a card on Home, scroll, come back, and you are on Packs at the top rather than on
// Home looking at the card you tapped. So the fixed link stays as the default and steps
// aside only for the two screens a card is actually tapped from, where going back is the
// browser restoring the page AND the scroll position — which is the card's own view.
(function () {
  var ref = (document.referrer || '').split('/').pop().split('?')[0];
  if (ref !== 'home.html' && ref !== 'packs.html') return;
  if (history.length < 2) return;
  var back = document.querySelector('.dj-hero .app-bar-transparent a.icon-btn, .creator-nav a.icon-btn');
  if (!back) return;
  back.addEventListener('click', function (e) { e.preventDefault(); history.back(); });
})();
