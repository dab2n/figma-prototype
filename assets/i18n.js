// Korean, on a switch.
//
// The hub carries a KOR/ENG toggle and every screen reads the same key on the way in, so
// the language is chosen once and holds for the whole walk. The pages themselves stay in
// English in the markup — one set of files, not two — and the words are swapped here.
//
// The wording follows the app's own Korean writing (Figma 5004:10461): 해요체 throughout,
// questions as "무엇을 하고 싶나요?" rather than the flatter "무엇을 하시겠습니까?", and the
// product's own vocabulary kept as it is written there — Pack, Creator, Pro, Skilled stay
// in English, the tab is 팩, the score is 일치도.
(function () {
  var DICT = {
    'Goal': '목표', 'Setup': '세팅', 'Build': '빌드', 'Viewport': '뷰포트',
    'Landing Balance': '착지 균형', 'Rhythm Retention': '리듬 유지력',
    'Running, Basketball, Boxing': '러닝, 농구, 복싱',
    'Sean': '션', 'Kanni': '칸니', 'Sojin': '소진', 'Jiwoo': '지우',
    'Janghoon': '장훈', 'Daniel': '다니엘', 'Usain Bolt': '우사인 볼트',
    'Juwon Park': '박주원', 'Akiyama': '아키야마',
    'Movement Coach \u00b7 512K subscribers': '무브먼트 코치 \u00b7 구독자 51.2만',
    'Sprint Coach \u00b7 96K subscribers': '스프린트 코치 \u00b7 구독자 9.6만',
    'Olympic Sprinter \u00b7 2.1M subscribers': '올림픽 스프린터 \u00b7 구독자 210만',
    'Skills Creator \u00b7 318K subscribers': '스킬 크리에이터 \u00b7 구독자 31.8만',
    'S&C Coach \u00b7 74K subscribers': 'S&C 코치 \u00b7 구독자 7.4만',
    'Footwork Creator \u00b7 129K subscribers': '풋워크 크리에이터 \u00b7 구독자 12.9만',
    'Home Training Creator \u00b7 205K subscribers': '홈트 크리에이터 \u00b7 구독자 20.5만',

    "How to hold your pace when it falls apart in the last 1km of a run. Learn Sean's breathing rhythm and footfall tempo, then apply them to real runs with Pace On and Boost On modes.":
      '러닝 후반 1km에서 무너지는 페이스를 잡는 법이에요. 션의 호흡 리듬과 발밑 박자를 익히고, Pace On·Boost On 모드로 실제 러닝에 적용해요.',
    "How to hold your pace when it falls apart in the last 1km of a run. Learn Sean’s breathing rhythm and footfall tempo, then apply them to real runs with Pace On and Boost On modes.":
      '러닝 후반 1km에서 무너지는 페이스를 잡는 법이에요. 션의 호흡 리듬과 발밑 박자를 익히고, Pace On·Boost On 모드로 실제 러닝에 적용해요.',
    /* ── pack descriptions (assets/packs.js) ────────────────────────────── */
    'The step that leaves a defender reading the wrong hip. Weight shift first, then the tempo change that sells it, drilled slowly before it is run at speed.':
      '수비가 반대쪽 골반을 읽게 만드는 스텝이에요. 체중 이동을 먼저 잡고, 그다음 속도 변화를 붙여요. 천천히 익힌 뒤 실제 속도로 올려요.',
    'Break the ceiling you keep hitting at top speed. Kanni rebuilds your drive phase and arm carriage first, then holds that form under fatigue so the last 20m stops falling apart.':
      '최고 속도에서 늘 걸리던 한계를 넘어요. 드라이브 구간과 팔 동작을 먼저 다시 잡고, 지친 상태에서도 그 자세를 유지해 마지막 20m가 무너지지 않게 해요.',
    'The block start, the transition and the top-end mechanics, taken one at a time. Short reps with long rests, so every rep is run at the speed you are actually training for.':
      '블록 스타트, 전환 구간, 최고 속도 메커닉을 하나씩 나눠서 익혀요. 짧게 반복하고 충분히 쉬어서, 매 반복을 실제 목표 속도로 달려요.',
    'Create the half metre you need to get the shot off. Footwork into the step back, then the balance to land square and rise without drifting sideways.':
      '슛을 올릴 반 걸음을 만들어요. 스텝백으로 들어가는 풋워크를 익히고, 옆으로 밀리지 않고 정면으로 착지해 올라오는 균형을 잡아요.',
    'Agility fails where strength runs out. Single-leg work and controlled decelerations build the base that lets you change direction late without losing the line.':
      '민첩성은 근력이 떨어지는 지점에서 무너져요. 한 다리 운동과 감속 제어로 기초를 쌓아, 늦게 방향을 바꿔도 라인이 흐트러지지 않게 해요.',
    'Quick feet that survive contact with a real game. Ladder patterns first, then the same patterns with a ball and a defender in front of you.':
      '실제 경기에서도 버티는 빠른 발을 만들어요. 래더 패턴을 먼저 익히고, 같은 패턴을 공과 수비를 두고 반복해요.',
    'The first three steps decide the race more than the next thirty. Set-up, shin angle and the push that follows, drilled until it stops being a decision.':
      '첫 세 걸음이 다음 서른 걸음보다 경기를 더 많이 결정해요. 세트업, 정강이 각도, 이어지는 밀기를 생각하지 않아도 나올 때까지 반복해요.',
    'Hard efforts with honest recoveries. Learn to hold the target pace on the fourth rep as cleanly as the first, and to read when to back off instead of blowing up.':
      '강하게 달리고 정직하게 회복해요. 네 번째 반복에서도 첫 번째처럼 목표 페이스를 지키고, 무너지기 전에 힘을 빼는 타이밍을 읽어요.',
    'A short set that finds the point where your legs stop cooperating, then keeps the form together past it. Built to be repeated at the end of any session.':
      '다리가 말을 듣지 않기 시작하는 지점을 찾고, 그 지점을 지나서도 자세를 유지하는 짧은 세트예요. 어떤 세션 끝에도 붙여서 반복할 수 있어요.',
    'Working against the other stance without reaching. Angle out of the lead hand, keep the rear foot loaded, and land the counter on the way past.':
      '반대 스탠스를 상대할 때 팔을 뻗어 닿으려 하지 않아요. 앞손에서 각을 만들고 뒷발에 체중을 남긴 채, 스쳐 지나가며 카운터를 넣어요.',
    'Depth before power. Recover to the middle every ball, take the high one early, and hold the rally until the short one you can actually attack shows up.':
      '파워보다 깊이가 먼저예요. 매 공마다 가운데로 돌아오고, 높은 공은 일찍 처리하고, 실제로 공격할 수 있는 짧은 공이 올 때까지 랠리를 이어가요.',
    'The steps between the highlights. Closeouts, drop steps and the slide that keeps your hips in front, drilled at the speed the game is actually played at.':
      '하이라이트 사이의 스텝들이에요. 클로즈아웃, 드롭 스텝, 골반을 앞에 두는 슬라이드를 실제 경기 속도로 반복해요.',
    'Some Experience': '기본기 있으면 좋은', 'Advanced': '숙련', 'Anyone': '누구나',
    'Indoor Court': '실내 코트', 'Outdoor Court': '야외 코트', 'Track': '트랙',
    'Gym': '체육관', 'Anywhere': '어디서든',
    'PRIME': '준비', 'DRIVE': '드라이브', 'SPRINT!': '스프린트!', 'SET-UP': '세트업',
    'BLOCKS': '블록', 'RACE!': '레이스!', 'WARM': '워밍업', 'DRILL': '드릴',
    'SHOOT!': '슛!', 'MOBILISE': '가동성', 'LOAD': '부하', 'HOLD!': '버티기!',
    'LOOSEN': '풀기', 'PATTERN': '패턴', 'PLAY!': '플레이!', 'SHADOW': '섀도',
    'GHOST!': '고스트!', 'PUSH': '푸시', 'GO!': '고!', 'EASE IN': '워밍업',
    'REPS': '반복', 'COOL!': '쿨다운!', 'PREP': '준비', 'BURN': '번',
    'FINISH!': '피니시!', 'COMBOS': '콤보', 'SPAR!': '스파링!', 'RALLY IN': '랠리 시작',
    'DEPTH': '깊이', 'POINT!': '포인트!', 'SLIDE': '슬라이드', 'CLOSEOUT': '클로즈아웃',
    'RUN IT!': '실전!',

    'Set a time for this pack?': '이 Pack을 할 시간을 정할까요?',
    "We'll remind you when it comes round.": '때가 되면 알려드릴게요.',
    'Not now': '나중에', 'Yes': '네',
    'When do you': '언제', 'want to move?': '움직일까요?',
    "We'll send a reminder when it comes round.": '때가 되면 알림을 보내드릴게요.',
    'Day': '날짜', 'Reminder': '알림', 'Summary': '요약', 'Set': '설정', 'Booked': '예약됐어요',
    'Today': '오늘', 'Tomorrow': '내일',
    '10 minutes before': '10분 전', 'Just enough time to change': '옷 갈아입을 정도의 시간',
    '1 hour before': '1시간 전', 'Time to plan the rest of the day around it': '하루 일정을 맞출 수 있는 시간',
    'At the time': '시작할 때', 'Only when it starts': '시작하는 순간에만',
    /* ── tabs, chrome ───────────────────────────────────────────────────── */
    'Home': '홈', 'Packs': '팩', 'Records': '기록', 'My': '마이',
    'Next': '다음', 'Skip': '건너뛰기', 'Done': '완료', 'Cancel': '취소',
    'Start': '시작', 'Start now': '바로 시작하기', 'Start Now': '바로 시작하기',
    'Later': '나중에', 'Open': '열기', 'Create': '만들기', 'Saved': '저장한 팩',
    'Friends': '친구', 'Created': '만든 팩', 'All': '전체', 'New': 'New',
    'Total': '총 예상 시간', 'Set up': '설정',

    /* ── hub ────────────────────────────────────────────────────────────── */
    'Explore Newton': 'Newton 둘러보기',
    'See how Newton moves, from setup to report.': '설정부터 리포트까지, Newton이 어떻게 움직이는지 볼 수 있어요.',
    'Language': '언어', 'Flow': '경로',
    'First Setup': '첫 세팅',
    'Fit Newton and get ready to move.': 'Newton을 맞추고 움직일 준비를 해요.',
    'Explore Home': '홈 둘러보기',
    'Find movements, packs, and recent activity.': '움직임과 Pack, 최근 기록을 찾아봐요.',
    'Start a Workout': '운동 시작하기',
    'Set the session and start moving.': '세션을 설정하고 움직이기 시작해요.',
    'Check Your Report': '리포트 확인하기',
    'See how the movement turned out.': '움직임이 어땠는지 확인해요.',

    /* ── splash ─────────────────────────────────────────────────────────── */
    'Now, Your Turn!': '뉴턴과 함께 운동할 차례!',
    'Get Started': 'NEWTON 시작하기',
    'Already have an account': '이미 계정이 있어요',

    /* ── onboarding ─────────────────────────────────────────────────────── */
    'What kinds of': '어떤 운동에', 'sports are you into?': '관심 있나요?',
    'You can pick more than one.': '복수 선택 가능해요.',
    'What do you': '무엇을', 'want to do most?': '하고 싶나요?',
    'We’ll set the best default mode for you.': '가장 잘 맞는 기본 모드를 설정해드려요.',
    'Where do you': '주로 어디서', 'usually work out?': '운동하나요?',
    'Indoors': '집 안', 'Mostly indoors': '실내에서 주로 해요',
    'Outdoors': '집 밖', 'Parks, tracks, and': '공원, 트랙 등', 'another spots': '야외에서요',
    'Both': '둘 다', 'Depends on the day': '상황에 따라 달라요',
    'Follow cool moves': '멋진 움직임 따라 해보기',
    'Recovery, Care': '회복 / 케어',
    'Build Sport Skills': '특정 종목 실력 향상',
    'Play with Friends': '친구와 함께 플레이',

    /* ── sports ─────────────────────────────────────────────────────────── */
    'Running': '러닝', 'Marathon': '마라톤', 'Basketball': '농구', 'Dance': '댄스',
    'Golf': '골프', 'Tennis': '테니스', 'Boxing': '복싱', 'Soccer': '축구',
    'Hiking': '등산', 'Badminton': '배드민턴', 'Sprint': '단거리', 'Strength': '근력',
    'Legs': '하체', 'Agility': '민첩성', 'Home': '홈', 'Workout': '홈트',
    'Sports': '운동군', 'Sport': '운동군',

    /* ── body scan ──────────────────────────────────────────────────────── */
    'Let’s set up your': '신체 프로파일을', 'body profile.': '만들어 볼게요.',
    'Prop your phone up at eye level': '스마트폰을 눈높이에 맞게 세워 주세요',
    'Face the camera,': '정면을 보고 서서,',
    'Turn to the side,': '옆으로 돌아서서,',
    'full body visible': '전신이 보이게',
    'Your whole body should be visible, head to toe': '머리부터 발끝까지 전신이 보여야 해요',
    'Scanning': '스캔 중', 'Front': '정면', 'Side': '측면',
    'Now, you’re': '이제', 'ready to move!': '움직일 준비가 됐어요!',
    'We’ve prepared Packs tailored to your choices': '선택한 정보로 맞춤 Pack을 준비했어요',
    'Preferred Sports': '관심 운동', 'Environment': '운동 환경',
    'Body Scan': '신체 스캔', 'Complete': '완료',
    'Running·Boxing·Basketball': '러닝 · 복싱 · 농구',
    'Indoor + Outdoor': '집 안 + 집 밖',

    /* ── setup ──────────────────────────────────────────────────────────── */
    'Where are you': '오늘은 어디서', 'working out today?': '운동하나요?',
    'Location': '장소', 'Indoor': '집 안', 'Outdoor': '집 밖',
    'Today’s Goal': '오늘 목표',
    'Beginner': '입문', 'Following along for the first time': '처음 따라 해보는 단계',
    'Standard': '기본', 'Getting used to the flow': '흐름에 익숙해지는 단계',
    'Near-Original': '원본 근접', 'Performing close to the real movement': '실제 움직임에 근접한 수행',
    'How are you': '오늘 컨디션이', 'feeling today?': '어때요?',
    'Condition': '컨디션',
    'Feeling light': '가볍게 가능', 'My body feels loose and ready': '몸이 잘 풀려 있어요',
    'About the Same as Usual': '평소와 비슷함', 'Neither great nor bad': '특별히 좋지도 나쁘지도 않아요',
    'About the same as usual': '평소와 비슷함',
    'Feeling Heavy': '몸이 무거움', 'A little tired or stiff': '조금 피곤하거나 뻐근해요',
    'Very Tired': '피로가 큼', 'I only want to move lightly': '가볍게만 움직이고 싶어요',
    'Any areas': '불편한 부위가', 'bothering you?': '있나요?',
    'We’ll reduce strain on those areas.': '해당 부위를 보호하도록 모드를 자동으로 조정해드려요.',
    'Injury check': '부상 체크', 'None': '없음', 'Lower Back': '허리',
    '+ Somewhere else': '+ 직접 입력', 'Type an area': '부위를 입력하세요',
    'Left Arm': '왼팔', 'Right Arm': '오른팔', 'Knee': '무릎', 'Calf': '종아리',
    'Ankle · Sole': '발목·발바닥', 'Left': '왼쪽', 'Right': '오른쪽',
    'How do you': '어떻게', 'want to move?': '움직이고 싶나요?',
    'Level/Mode': '난이도/모드', 'Level &amp; Mode': '난이도/모드', 'Level & Mode': '난이도/모드',
    'Difficulty': '실행 난이도', 'Guided': '기초', 'Near-Pro': '실전',
    'Assist Mode': '개입 모드', 'Default Assist Mode': '기본 개입 모드', 'Recommended': '추천',
    'Quiet On': 'Quiet On', 'Reduced landing impact · minimal indoor noise': '착지 충격 감소 · 실내 소음 최소화',
    'Pace On': 'Pace On', 'Auto-corrects knee and ankle wobble': '무릎·발목 흔들림 자동 보정',
    'Load On': 'Load On', 'Build strength with added resistance': '반복 구간 저항 강화 (근력 향상)',
    'Boost On': 'Boost On', 'Automatic pace support in the final stretch': '후반부 페이스 자동 보조',
    'Set your': '실전 운동을', 'main workout': '설정해요',
    'Main Workout': '실전 설정',
    'The 18m Pack (Stretching + Learning) stays as-is': 'Pack 18분(스트레칭 + 익히기)은 그대로 진행돼요',
    'Distance': '거리', 'Time': '시간',
    'You’re ready': '설정이', 'to move!': '완성됐어요',
    'Your setup is complete.': '시작 준비가 끝났어요.',
    'Location &amp; Goal': '장소/목적', 'Location & Goal': '장소/목적',
    'Outdoor · Standard': '집 밖 · 기본',
    'Pace On + Boost On': 'Pace On + Boost On',

    /* ── devices ────────────────────────────────────────────────────────── */
    'Check your devices': '기기 연결을 확인해요',
    'Make sure your devices are connected and ready.': '기기가 연결되어 준비됐는지 확인해 주세요.',
    'Lower-Body Wearable': '하체 웨어러블', 'Battery 87%': '배터리 87%',
    'Station': '스테이션', 'Projection ready': '프로젝션 준비됨',
    'Watch·External Device': '워치 / 외부 기기', 'Not Connected': '미연결',
    'Connected': '연결됨', 'Optional': '선택 사항', 'Please': '준비 중',

    /* ── ready / session ────────────────────────────────────────────────── */
    'To start': '시작하려면', 'Tap your foot Twice': '발을 두 번 탭',
    'with the Wearable on': '웨어러블 착용 상태에서', 'Start workout': '운동 시작하기',
    'Session Recap': '이번 세션 요약', 'Outstanding Match': '최고 일치도',
    'View Full Report': '전체 리포트 보기',

    /* ── report ─────────────────────────────────────────────────────────── */
    'Movement Performance Gain': '신체 수행 분석',
    'Duration': '수행 시간', 'Pack Match': 'Pack 일치도', 'Match Rate': '일치도',
    'Skill Proficiency': '숙련 근접도', 'NEW Best': '최고 기록',
    'Session Highlights': '하이라이트', 'Went Well': '잘 됐어요',
    'Balance': '착지 균형', 'Held your balance': '마지막 구간까지', 'through the final stretch': '균형 유지',
    'Next Focus': '다음엔 이걸', 'Improve early reaction': '초반 반응속도 개선 필요',
    'Performance Scores': '수행 점수', 'Endurance': '지속력', 'Rhythm': '리듬 유지력',
    'Stability': '반복 안정성', 'Recommendation for you': '다음 세션 추천',
    'Today': '오늘', 'From yesterday': '어제 대비', 'Day': '일', 'Week': '주',
    'Month': '월', '6 Month': '6개월', 'Steps': '걸음', 'Active Time': '활동 시간',

    /* ── home / packs ───────────────────────────────────────────────────── */
    'Recently Viewed': '최근 본 콘텐츠', 'Today’s Movement': '오늘의 움직임',
    "Today's Movement": '오늘의 움직임',
    'View Now': '바로 보기', 'New Report': '새 리포트',
    'No packs match these filters.': '조건에 맞는 Pack이 없어요.',
    'Pack Type': 'Pack 유형', 'Pack Source': 'Pack 출처',
    'Explore This Pack': '이 Pack 살펴보기', 'Joined': '참여', 'Process': '루틴',
    'Entry Level': '진입 레벨', 'Basics Recommended': '기본기 있으면 좋은',
    'Sensory Focus': '감각 성격', 'Rhythm · Endurance': '리듬 · 지속',
    'You might also like': '이런 Pack도 있어요',
    'STRETCH': '스트레칭', 'LEARN': '익히기', 'RUN!': '달리기!',
    'You Can Choose': '설정 가능', 'Boosts Agility': '반응 민첩성',
    'Search packs, creators, sports': 'Pack, 크리에이터, 종목 검색',
    'Make a pack': '나만의 Pack을', 'of your own': '만들어 보세요',
    'Four things, and it is ready to share.': '네 가지만 정하면 바로 공유할 수 있어요.',
    'Name': '이름', 'Where': '장소', 'Cover': '커버', 'Preview': '미리보기',
    'Untitled Pack': '이름 없는 Pack', 'New Pack': '새 Pack',
    'e.g. Morning Court Footwork': '예) 아침 코트 풋워크',

    /* ── settings ───────────────────────────────────────────────────────── */
    'Workout Settings': '운동 설정', 'Workout Location': '운동 장소',
    'Indoors + Outdoors': '집 안 + 집 밖', 'Body Recalibrate': '캘리브레이션 재설정',
    'Devices': '기기', 'Wearable': '웨어러블', 'Projection Unit': '프로젝션 유닛',
    'Device Connections': '기기 연결', 'Account &amp; APP': '계정 및 앱', 'Account & APP': '계정 및 앱',
    'Subscription': '구독 관리', 'Notifications': '알림', 'Accessibility': '접근성',
    'Privacy': '개인정보', 'Support': '고객 지원', 'Help &amp; Support': '도움말', 'Help & Support': '도움말',
    'Profile': '프로필', 'My Pack': '만든 팩',

    /* ── pack titles ────────────────────────────────────────────────────── */
    'Sean’s Pace Strategy': '션의 페이스 전략', "Sean's Pace Strategy": '션의 페이스 전략',
    'Sean’s Pace': '션의', 'Sean\'s Pace': '션의', 'Strategy': '페이스 전략',
    'Sean’s Steady': '션의 일정한', 'Pace': '페이스',
    "Curry's Step Back": '스테판 커리 스텝백',
    "Akiyama's Ghost Step": '아키야마의 고스트 스텝',
    "Usain Bolt's Sprint Masterclass": '우사인 볼트 스프린트 마스터클래스',
    'Sprint Without Limits': '한계 없는 스프린트',
    'Agility Strength': '민첩성 근력',
    'Ladder Footwork': '래더 풋워크', 'Sprint Starts': '스타트 대시',
    'Interval Push': '러닝 인터벌 훈련', 'Leg Burn Set': '하체 번 세트',
    'Southpaw Drill': '사우스포 드릴', 'Baseline Rally': '베이스라인 랠리',
    'Court Footwork': '코트 풋워크',
    'Basketball Basic Dribble': '농구 기본 드리블', 'Running Intervals': '러닝 인터벌 훈련',
    'The Tennis Skill': '테니스 스킬', 'Basketball Highlight': '농구 하이라이트',
    'Boxing Basic Jab Combo': '복싱 기본 잽 콤보', 'Basic Steps For Beginner': '입문자 기본 스텝',
    'Sprinter’s First Step': '스프린터의 첫 스텝', "Sprinter's First Step": '스프린터의 첫 스텝',
    'Easy Interval Run': '가벼운 인터벌 러닝', 'Boxing Beginner Challenge': '복싱 고수의 입문 챌린지',
    'Running Form Correction Routine': '러닝 자세 교정 루틴',
    'Everyday Running Crew': '매일 러닝 크루',
    'Sean’s 5km Finish Strategy': '션의 5km 완주 전략', "Sean's 5km Finish Strategy": '션의 5km 완주 전략',
    'Ladder Footwork Drills': '래더 풋워크 드릴',
    'Southpaw Switch Drill': '사우스포 스위치 드릴', 'Tennis Forehand Basics': '테니스 포핸드 기초 루틴',
    'Jab-Cross Combo': '잽-크로스 콤보', 'Crossover Handles': '크로스오버 핸들링',
    'Backhand Slice Control': '백핸드 슬라이스 컨트롤',
    'Taekwondo Footwork': '태권도 풋워크', 'Five-Minute Leg Burn': '5분 하체 번',
    'More Packs from Sean': '션의 다른 Pack',
    'Running Creator · 240K subscribers': '러닝 크리에이터 · 구독자 24만'
  };

  // What cannot be listed: the strings that carry a number. First match wins.
  var RULES = [
    [/^(\d+) ?min$/, '$1분'],
    [/^(\d+)m$/, '$1분'],
    [/^(\d+)h$/, '$1시간'],
    [/^min$/, '분'],
    [/^pts$/, '점'],
    [/^(\d+)m ago$/, '$1분 전'],
    [/^([\d,]+) joined this week$/, '이번 주 $1명 참여'],
    [/^(Creator|Pro|Skilled User) · (\d+)m$/, '$1 · $2분'],
    [/^(Creator|Pro|Skilled User) · (\d+) min$/, '$1 · $2분'],
    [/^\+ (\d+)m$/, '+ $1분']
  ];
  function look(key) {
    if (DICT[key]) return DICT[key];
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(key)) return key.replace(RULES[i][0], RULES[i][1]);
    }
    return null;
  }

  // Attributes worth swapping — the ones a person reads.
  var ATTRS = ['placeholder', 'aria-label'];

  function lang() { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } }

  // A node remembers the English it started from, and what this pass left it as. If it is
  // holding neither, something else wrote it since (packs.js fills a card from its table)
  // and the English baseline is taken again from what is there now.
  var seen = new WeakMap();

  function swap(node) {
    var p = node.parentNode;
    if (!p || p.nodeType !== 1) return;
    var tag = p.nodeName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TITLE') return;
    if (p.closest('.no-i18n')) return;
    var rec = seen.get(node);
    if (!rec || node.nodeValue !== rec.out) rec = { en: node.nodeValue };
    var key = rec.en.trim();
    if (!key) return;
    var ko = lang() === 'ko' && look(key);
    rec.out = ko ? rec.en.replace(key, ko) : rec.en;
    if (node.nodeValue !== rec.out) node.nodeValue = rec.out;
    seen.set(node, rec);
  }

  function apply() {
    if (!document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) swap(n);
    var ko = lang() === 'ko';
    ATTRS.forEach(function (a) {
      [].forEach.call(document.querySelectorAll('[' + a + ']'), function (el) {
        if (el.closest('.no-i18n')) return;
        var en = el.getAttribute('data-i18n-' + a);
        if (en === null) { en = el.getAttribute(a); el.setAttribute('data-i18n-' + a, en); }
        el.setAttribute(a, (ko && look(en)) || en);
      });
    });
    document.documentElement.lang = ko ? 'ko' : 'en';
  }

  window.__lang = lang;
  window.__setLang = function (v) {
    try { localStorage.setItem('lang', v === 'ko' ? 'ko' : 'en'); } catch (e) {}
    apply();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();

  // Screens write their own text after this runs — a pack fills its cards from the table,
  // the score counts up, the fold swaps a title. A debounced re-pass catches all of it
  // without any of them having to know this exists.
  var pending = 0;
  new MutationObserver(function () {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = 0; apply(); });
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
