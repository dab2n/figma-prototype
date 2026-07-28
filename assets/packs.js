// Pack detail is one screen, not eleven copies of it: ?pack=<key> swaps the hero photo,
// the creator and the copy, and everything else — the swipe sheet, the transitions, the
// Start flow — stays exactly as it is. No key (or an unknown one) leaves the markup
// alone, which is Sean's pack, so every existing link still lands where it did.
(function () {
  var PACKS = {
    sprint: {
      photo: 'packs-card1-thumb.png', pos: '72% center', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Without Limits',
      desc: 'Break the ceiling you keep hitting at top speed. Kanni rebuilds your drive phase and arm carriage first, then holds that form under fatigue so the last 20m stops falling apart.'
    },
    bolt: {
      photo: 'packs-card3-thumb.png', author: 'Usain Bolt', avatar: 'packs-avatar-usainbolt.png',
      title: "Usain Bolt's Sprint Masterclass",
      desc: 'The block start, the transition and the top-end mechanics, taken one at a time. Short reps with long rests, so every rep is run at the speed you are actually training for.'
    },
    curry: {
      photo: 'rec-curry.png', author: 'Janghoon', avatar: 'packs-avatar1.png',
      title: "Curry's Step Back",
      desc: 'Create the half metre you need to get the shot off. Footwork into the step back, then the balance to land square and rise without drifting sideways.'
    },
    strength: {
      photo: 'rec-strength.png', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Strength for Agility',
      desc: 'Agility fails where strength runs out. Single-leg work and controlled decelerations build the base that lets you change direction late without losing the line.'
    },
    ladder: {
      photo: 'rec-ladder.png', author: 'Sojin', avatar: 'packs-avatar3.png',
      title: 'Ladder Footwork',
      desc: 'Quick feet that survive contact with a real game. Ladder patterns first, then the same patterns with a ball and a defender in front of you.'
    },
    sprinter: {
      photo: 'pack-sprinter.png', author: 'Kanni', avatar: 'packs-profile-kanni.png',
      title: 'Sprint Starts',
      desc: 'The first three steps decide the race more than the next thirty. Set-up, shin angle and the push that follows, drilled until it stops being a decision.'
    },
    interval: {
      photo: 'pack-interval.png', author: 'Daniel', avatar: 'packs-avatar2.png',
      title: 'Interval Push',
      desc: 'Hard efforts with honest recoveries. Learn to hold the target pace on the fourth rep as cleanly as the first, and to read when to back off instead of blowing up.'
    },
    legburn: {
      photo: 'pack-legburn.png', author: 'Jiwoo', avatar: 'packs-avatar4.png',
      title: 'Leg Burn Set',
      desc: 'A short set that finds the point where your legs stop cooperating, then keeps the form together past it. Built to be repeated at the end of any session.'
    },
    boxing: {
      photo: 'movement-boxing.png', author: 'Janghoon', avatar: 'packsx-avatar-a.png',
      title: 'Southpaw Drill',
      desc: 'Working against the other stance without reaching. Angle out of the lead hand, keep the rear foot loaded, and land the counter on the way past.'
    },
    tennis: {
      photo: 'recent-tennis.png', author: 'Sojin', avatar: 'packsx-avatar-b.png',
      title: 'Baseline Rally',
      desc: 'Depth before power. Recover to the middle every ball, take the high one early, and hold the rally until the short one you can actually attack shows up.'
    },
    basketball: {
      photo: 'recent-basketball.png', author: 'Jiwoo', avatar: 'packsx-avatar-c.png',
      title: 'Court Footwork',
      desc: 'The steps between the highlights. Closeouts, drop steps and the slide that keeps your hips in front, drilled at the speed the game is actually played at.'
    }
  };

  var key;
  try { key = new URLSearchParams(location.search).get('pack'); } catch (e) { key = null; }
  var p = key && PACKS[key];
  if (!p) return;

  var hero = document.querySelector('.hero-photo');
  var av = document.querySelector('.detail-text .author img');
  var name = document.querySelector('.detail-text .author-name');
  var title = document.querySelector('.detail-title');
  var desc = document.querySelector('.detail-desc');

  if (hero) {
    hero.style.backgroundImage = "url('assets/photos/" + p.photo + "')";
    // Landscape thumbs crop hard in a portrait hero; a few carry their own framing.
    if (p.pos) hero.style.backgroundPosition = p.pos;
  }
  if (av) av.src = 'assets/photos/' + p.avatar;
  if (name) name.textContent = p.author;
  if (title) title.textContent = p.title;
  if (desc) desc.textContent = p.desc;
  document.title = 'Newton — ' + p.title;
})();
