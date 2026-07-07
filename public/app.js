// Live Slides — client. Vanilla JS, no deps.
// Audience follows presenter's slide (locked). Presenter has ?present=<key>.

(function () {
  const params = new URLSearchParams(location.search);
  // Presenter key from any of: /present/<key> path, ?present=<key>, or ?key=<key>.
  // Bare /present (no key) → prompt once so the key never has to live in a shared URL.
  const presentMatch = location.pathname.match(/^\/present(?:\/(.*))?$/);
  const pathKey = presentMatch ? decodeURIComponent(presentMatch[1] || '') : null;
  let PRESENT_KEY = params.get('present') || params.get('key') || (pathKey || null);
  if (!PRESENT_KEY && presentMatch) {
    // on /present with no key supplied anywhere → ask once
    PRESENT_KEY = (window.prompt('강사 키를 입력하세요') || '').trim() || null;
  }
  const IS_PRESENTER = !!PRESENT_KEY;

  const slides = window.SLIDES || [];
  let current = 0;
  let liveSlide = 0;        // presenter's current slide
  let following = true;     // audience: follow presenter (default on)

  // Avatar = AI/data company logo (SVG in /avatars/). Stored as a slug on the profile.
  const AVATARS = ['claude', 'openai', 'gemini', 'deepseek', 'cohere', 'xai', 'qwen', 'meta',
    'microsoft', 'aws', 'salesforce', 'snowflake', 'databricks', 'palantir'];
  const avatarImg = (slug, cls) => slug
    ? '<img class="' + (cls || 'av-img') + '" src="/avatars/' + slug + '.svg" alt="">' : '';

  // ---- DOM refs ----
  const stage = document.getElementById('slide');
  const bar = document.getElementById('progbar');
  const conn = document.getElementById('conn');
  const tallyUp = document.getElementById('tup');
  const tallyConf = document.getElementById('tconf');
  const qlayer = document.getElementById('qlayer');
  const reactLayer = document.getElementById('reactlayer');

  // ---- profile (nickname + avatar) ----
  let profile = loadProfile();

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem('ls_profile') || 'null'); }
    catch { return null; }
  }
  function saveProfile(p) {
    localStorage.setItem('ls_profile', JSON.stringify(p)); profile = p; showNickChip();
    // reconnect SSE so the presence list reflects the (new) nickname
    if (es) { try { es.close(); } catch (_) {} connect(); }
  }

  // ---- presence (접속자 목록) — both presenter & audience ----
  let presenceNames = [];
  let presenceSeen = false; // skip toasting the initial presence snapshot
  function togglePresenceList() {
    const box = document.getElementById('presence-list');
    if (!box) return;
    box.classList.toggle('hidden');
    renderPresenceList();
  }
  function renderPresenceList() {
    const box = document.getElementById('presence-list');
    if (!box || box.classList.contains('hidden')) return;
    if (!presenceNames.length) { box.innerHTML = '<div class="pl-empty">접속 중인 청중이 없습니다</div>'; return; }
    box.innerHTML = '<div class="pl-head">👥 접속 중 ' + presenceNames.length + '명</div>' +
      presenceNames.map((p) => {
        const nm = typeof p === 'string' ? p : (p.name || '익명');
        const av = typeof p === 'string' ? '' : p.avatar;
        return '<div class="pl-row">' + avatarImg(av, 'pl-av') + '<span>' + esc(nm) + '</span></div>';
      }).join('');
  }

  // Toast "OO님이 입장하셨습니다" sliding in from the right
  function toastEnter(n) {
    const nm = typeof n === 'string' ? n : (n.name || '익명');
    const av = typeof n === 'string' ? '' : n.avatar;
    let layer = document.getElementById('enter-toasts');
    if (!layer) {
      layer = document.createElement('div');
      layer.id = 'enter-toasts';
      document.body.appendChild(layer);
    }
    const t = document.createElement('div');
    t.className = 'enter-toast';
    t.innerHTML = avatarImg(av, 'et-av') + '<span><b>' + esc(nm) + '</b>님이 입장했어요</span>';
    layer.appendChild(t);
    setTimeout(() => { t.classList.add('leaving'); setTimeout(() => t.remove(), 450); }, 3200);
  }

  // Always-visible nickname chip (audience only) — logo + name, click to edit
  function showNickChip() {
    const chip = document.getElementById('nick-chip');
    if (!chip || IS_PRESENTER) return;
    if (profile && profile.name) {
      chip.innerHTML = avatarImg(profile.avatar, 'chip-av') + '<span>' + esc(profile.name) + '</span>';
      chip.classList.remove('hidden');
      if (!chip.dataset.wired) {
        chip.dataset.wired = '1';
        chip.onclick = () => setupNickname(() => {}, true); // edit mode
      }
    }
  }

  // ============================================================ RENDER
  function render(i) {
    const s = slides[i]; if (!s) return;
    stage.className = 'slide ' + (s.cls || '');
    // Substitute the live hands-on API base URL into slide prompts.
    stage.innerHTML = s.html.replace(/\{BASE_URL\}/g, location.origin);
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    const pinfo = document.getElementById('pinfo');
    if (pinfo) pinfo.textContent = (i + 1) + ' / ' + slides.length;
    renderMazeBoard(); // populate live leaderboard if this slide has the board
    setupMazePrompt(); // fill nickname + wire copy button on the maze prompt slide
    addCopyButtons();  // add a copy button to every other prompt box
    wireFeedbackCta(); // wire the "피드백 남기기" button on the closing slide
    runCountUps();     // animate any data-countup numbers on this slide
    runConfetti();     // fire confetti on the closing slide
    renderNote(s, i);  // presenter-only speaker notes
  }

  // Speaker notes — visible ONLY on the presenter screen (like slide notes).
  // Note text comes from the slide's inline `note`, else window.SLIDE_NOTES[index].
  const SLIDE_NOTES = window.SLIDE_NOTES || {};
  function renderNote(s, i) {
    if (!IS_PRESENTER) return;
    let panel = document.getElementById('note-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'note-panel';
      panel.innerHTML = '<div class="note-head">🎤 발표 노트 <button id="note-toggle" title="접기/펼치기">▾</button></div><div class="note-body" id="note-body"></div>';
      document.body.appendChild(panel);
      panel.querySelector('#note-toggle').onclick = () => panel.classList.toggle('collapsed');
    }
    const body = panel.querySelector('#note-body');
    const note = (s && s.note) ? s.note : (SLIDE_NOTES[i] || '');
    if (!note) { panel.classList.add('empty'); body.innerHTML = '<span class="note-empty">— 이 슬라이드엔 노트가 없습니다 —</span>'; }
    else { panel.classList.remove('empty'); body.innerHTML = note; }
  }

  // Count-up: <span class="cu" data-countup="7425" data-dur="1600" data-delay="700">0</span>
  function runCountUps() {
    const els = stage.querySelectorAll('[data-countup]');
    els.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-countup')) || 0;
      const dur = parseInt(el.getAttribute('data-dur') || '1000', 10);
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      const fmt = (n) => Math.round(n).toLocaleString('en-US');
      el.textContent = '0';
      let raf;
      const start = () => {
        let t0 = null;
        const step = (ts) => {
          if (t0 === null) t0 = ts;
          const p = Math.min(1, (ts - t0) / dur);
          // easeOutCubic
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * e);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };
      if (delay) setTimeout(start, delay); else start();
    });
  }

  // Confetti burst on the closing slide (canvas, no deps). Fires once per entry.
  let confettiRAF = null;
  function runConfetti() {
    if (confettiRAF) { cancelAnimationFrame(confettiRAF); confettiRAF = null; }
    const old = document.getElementById('confetti-canvas');
    if (old) old.remove();
    if (!stage.querySelector('.closing-slide') && !stage.classList.contains('closing-slide')) return;
    const cv = document.createElement('canvas');
    cv.id = 'confetti-canvas';
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const W = cv.width = innerWidth, H = cv.height = innerHeight;
    const colors = ['#3d4eff', '#00b383', '#ff5c49', '#ffd84d', '#8b5cf6'];
    const N = 140;
    const parts = [];
    for (let i = 0; i < N; i++) {
      parts.push({
        x: W / 2 + (i % 7 - 3) * 30, y: H * 0.42,
        vx: (i * 2654435761 % 1000 / 1000 - 0.5) * 14,      // deterministic spread (no Math.random dependence issue)
        vy: -(6 + (i * 40503 % 1000) / 1000 * 9),
        w: 7 + (i % 5) * 2, h: 10 + (i % 4) * 3,
        rot: (i % 360), vr: (i % 2 ? 1 : -1) * (4 + i % 6),
        color: colors[i % colors.length], life: 0,
      });
    }
    const G = 0.28;
    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);
      let alive = 0;
      for (const p of parts) {
        p.vy += G; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr; p.life++;
        if (p.y < H + 40) alive++;
        const alpha = Math.max(0, 1 - p.life / 160);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0 && frame < 260) confettiRAF = requestAnimationFrame(draw);
      else { cv.remove(); confettiRAF = null; }
    };
    confettiRAF = requestAnimationFrame(draw);
  }

  // ============================================================ FEEDBACK (audience)
  function wireFeedbackCta() {
    const cta = document.getElementById('feedback-open');
    if (!cta || cta.dataset.wired) return;
    cta.dataset.wired = '1';
    cta.onclick = openFeedback;
  }
  const fbRatings = { q1: 0, q2: 0, q3: 0 };
  function openFeedback() {
    const modal = document.getElementById('feedback');
    fbRatings.q1 = fbRatings.q2 = fbRatings.q3 = 0;
    document.getElementById('fb-text').value = '';
    document.getElementById('fb-thanks').classList.add('hidden');
    // build star rows
    modal.querySelectorAll('.stars').forEach((row) => {
      const q = row.dataset.q;
      row.innerHTML = '';
      for (let s = 1; s <= 5; s++) {
        const star = document.createElement('span');
        star.className = 'star'; star.textContent = '★'; star.dataset.v = s;
        star.onclick = () => {
          fbRatings[q] = s;
          row.querySelectorAll('.star').forEach((el, idx) => el.classList.toggle('on', idx < s));
        };
        row.appendChild(star);
      }
    });
    document.getElementById('fb-cancel').onclick = () => modal.classList.add('hidden');
    document.getElementById('fb-submit').onclick = () => {
      const text = document.getElementById('fb-text').value.trim();
      fetch('/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q1: fbRatings.q1, q2: fbRatings.q2, q3: fbRatings.q3, text, name: profile ? profile.name : '익명' }) })
        .then(() => {
          document.getElementById('fb-thanks').classList.remove('hidden');
          setTimeout(() => modal.classList.add('hidden'), 1400);
        });
    };
    modal.classList.remove('hidden');
  }

  // ============================================================ COPY BUTTONS
  // Robust copy that works even on http (non-secure) contexts, where
  // navigator.clipboard is unavailable/blocked (esp. Safari/Chrome on Mac).
  // Falls back to a hidden textarea + execCommand('copy').
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length); // iOS/Safari
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  // Add a "📋 복사" button to every prompt box's header (skips the maze one, which
  // already has its own nickname-aware button). Copies the <code> block's text.
  function addCopyButtons() {
    stage.querySelectorAll('.prompt-box').forEach((box) => {
      const head = box.querySelector('.pb-head');
      const code = box.querySelector('code');
      if (!head || !code) return;
      if (head.querySelector('.copy-btn')) return; // already has one (e.g. maze slide)
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '📋 복사';
      btn.onclick = () => {
        copyText(code.textContent);
        btn.textContent = '✓ 복사됨';
        setTimeout(() => { btn.textContent = '📋 복사'; }, 1500);
      };
      head.appendChild(btn);
    });
  }

  // ============================================================ MAZE PROMPT
  function setupMazePrompt() {
    const code = document.getElementById('maze-prompt-text');
    if (!code) return;
    // fill the audience nickname (strip the avatar emoji prefix) into the prompt
    const nick = profile && profile.name ? profile.name : '익명';
    code.textContent = code.textContent.replace(/\(닉네임\)/g, nick);
    const btn = document.getElementById('copy-maze-prompt');
    if (btn && !btn.dataset.wired) {
      btn.dataset.wired = '1';
      btn.onclick = () => {
        copyText(code.textContent);
        btn.textContent = '✓ 복사됨';
        setTimeout(() => { btn.textContent = '📋 복사'; }, 1500);
      };
    }
  }

  // ============================================================ SSE
  let es;
  function connect() {
    // identify this connection so presence can show who's here (name + avatar logo)
    const nm = profile && profile.name ? profile.name : '';
    const av = profile && profile.avatar ? profile.avatar : '';
    const qs = '?name=' + encodeURIComponent(nm) + '&avatar=' + encodeURIComponent(av) + (IS_PRESENTER ? '&presenter=1' : '');
    es = new EventSource('/events' + qs);
    es.onopen = () => conn.classList.add('live');
    es.onerror = () => conn.classList.remove('live');

    es.addEventListener('snapshot', (e) => {
      const st = JSON.parse(e.data);
      liveSlide = st.slide || 0;
      if (following) { current = liveSlide; render(current); }
      if (!IS_PRESENTER) updateFollowUI();
      setTally(st.reactions);
      qHistory = (st.questions || []).slice(); // full history for presenter panel
      renderHistory();
      // Do NOT re-fly old question bubbles on (re)connect — they're ephemeral.
      // Mark them "already seen" so a refresh shows a clean stage; only genuinely
      // new questions (via the 'question' event after now) will pop as post-its.
      (st.questions || []).forEach((q) => shownQ.add(q.id));
    });

    es.addEventListener('presence', (e) => {
      const d = JSON.parse(e.data);
      const names = d.names || [];
      // toast newcomers (skip the first snapshot to avoid a flood on connect)
      if (presenceSeen) {
        const prev = new Set(presenceNames.map((n) => n.name + '|' + n.avatar));
        names.forEach((n) => {
          if (!prev.has(n.name + '|' + n.avatar)) toastEnter(n);
        });
      }
      presenceSeen = true;
      presenceNames = names;
      const chip = document.getElementById('presence-chip');
      const num = document.getElementById('presence-num');
      if (num) num.textContent = d.count || 0;
      if (chip) {
        chip.classList.remove('hidden');
        if (!chip.dataset.wired) { chip.dataset.wired = '1'; chip.onclick = togglePresenceList; }
      }
      renderPresenceList(); // refresh if open
    });

    // presenter's current slide — audience follows only when `following` is on.
    // The PRESENTER ignores this event entirely: they own `current` locally, and their
    // own (possibly delayed) echo could otherwise snap them BACK to an old slide when
    // navigating fast — the "앞뒤로 왔다갔다" bug. Only the audience reacts here.
    es.addEventListener('slide', (e) => {
      liveSlide = JSON.parse(e.data).slide;
      if (IS_PRESENTER) return;                 // presenter drives locally; ignore echo
      if (following && current !== liveSlide) {
        current = liveSlide;
        render(current);
      }
      updateFollowUI(); // refresh page counter / nudge
    });

    es.addEventListener('question', (e) => {
      const q = JSON.parse(e.data);
      qHistory.push(q); renderHistory();
      flyQuestion(q);
    });
    es.addEventListener('vote', (e) => {
      const { id, votes } = JSON.parse(e.data);
      const el = document.querySelector('.q-bubble[data-id="' + id + '"] .vnum');
      if (el) el.textContent = votes;
      const hq = qHistory.find((q) => q.id === id); if (hq) { hq.votes = votes; renderHistory(); }
    });
    es.addEventListener('react', (e) => {
      const d = JSON.parse(e.data);
      setTally(d.total);
      spawnFloat(d.kind);
      bumpTally(d.kind);
    });
    es.addEventListener('clear', () => { qlayer.innerHTML = ''; shownQ.clear(); qHistory = []; renderHistory(); });
    es.addEventListener('dismiss', (e) => {
      const { id } = JSON.parse(e.data);
      const b = qlayer.querySelector('.q-bubble[data-id="' + id + '"]');
      if (b) { b.classList.add('leaving'); setTimeout(() => b.remove(), 400); }
      shownQ.delete(id);
      qHistory = qHistory.filter((q) => q.id !== id); renderHistory();
    });
    es.addEventListener('maze', (e) => {
      mazeData = JSON.parse(e.data).leaderboard || [];
      renderMazeBoard();
    });
  }

  // ============================================================ QUESTION HISTORY (presenter)
  let qHistory = [];
  function renderHistory() {
    const list = document.getElementById('qh-list');
    const cnt = document.getElementById('qh-count');
    if (cnt) cnt.textContent = qHistory.length;
    if (!list) return;
    if (!qHistory.length) { list.innerHTML = '<div class="qh-empty">아직 질문이 없습니다.</div>'; return; }
    list.innerHTML = qHistory.slice().reverse().map((q) => {
      const t = new Date(q.ts || Date.now());
      const hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
      return '<div class="qh-item">' +
        '<div class="qh-meta"><span class="qh-name">' + esc(q.name || '익명') + '</span>' +
        '<span class="qh-time">' + hh + ':' + mm + '</span>' +
        '<span class="qh-votes">👍 ' + (q.votes || 0) + '</span></div>' +
        '<div class="qh-text">' + esc(q.text) + '</div></div>';
    }).join('');
  }

  // ============================================================ MAZE LEADERBOARD
  let mazeData = [];
  function renderMazeBoard() {
    const board = document.getElementById('maze-board');
    if (!board) return; // only present on the leaderboard slide
    // presenter-only reset button
    const rb = document.getElementById('lb-reset');
    if (rb && IS_PRESENTER && !rb.dataset.wired) {
      rb.dataset.wired = '1';
      rb.classList.remove('hidden');
      rb.onclick = () => {
        if (!confirm('리더보드를 초기화할까요? 모든 참가자 진행이 사라집니다.')) return;
        fetch('/maze/reset?key=' + encodeURIComponent(PRESENT_KEY), { method: 'POST' });
      };
    }
    if (!mazeData.length) {
      board.innerHTML = '<div class="mb-empty">아직 참가자가 없습니다 — 미로를 시작하면 여기에 실시간으로 나타납니다!</div>';
      return;
    }
    const TOTAL = 5;
    const GATE_NAMES = ['기억', '탐험', '관찰', '보안', '복구'];
    const gateLabel = (p) => {
      if (p.expired) return '💀 실패';
      if (p.gate > TOTAL) return '🎉 완주';
      return '관문 ' + p.gate + ' (' + (GATE_NAMES[p.gate - 1] || '') + ') 진행 중';
    };
    const dots = (p) => {
      let h = '';
      for (let g = 1; g <= TOTAL; g++) {
        const done = p.cleared >= g;
        const cur = !p.expired && p.gate === g;
        const fail = p.expired && p.failedAtGate === g;
        h += '<span class="mb-dot ' + (fail ? 'fail' : done ? 'done' : cur ? 'cur' : '') + '">' + g + '</span>';
      }
      return h;
    };
    const detail = (p) => {
      if (p.expired) return '⚠️ ' + (p.expiredReason || '치명적 실수로 만료됨');
      const d = p.detail || {};
      const parts = [];
      if (d.g1) parts.push('🧩 ' + d.g1.served + '/' + d.g1.total);
      if (d.g2 && p.cleared >= 1) parts.push('🗺️ ' + d.g2.steps + '걸음');
      if (d.g3 && p.cleared >= 2) parts.push('🔗 ' + d.g3.collected + '/' + d.g3.total);
      // gate4 = injection defense: show leaks (0 = perfect defense)
      if (d.g4 && p.cleared >= 3) parts.push('🛡️ ' + d.g4.collected + '/' + d.g4.total + (d.g4.leaks ? ' (누출' + d.g4.leaks + ')' : ''));
      if (d.g5 && p.cleared >= 4) parts.push('🔄 ' + d.g5.step + '/' + d.g5.target);
      return parts.join(' · ');
    };
    // show ALL participants (scrollable), not just top-K
    board.innerHTML = '<div class="mb-count">참가자 ' + mazeData.length + '명</div>' + mazeData.map((p, i) => {
      const rank = i + 1;
      const done = !p.expired && p.gate > TOTAL;
      const medal = done ? ['🥇', '🥈', '🥉'][i] || '✅' : '';
      const cls = p.expired ? 'expired' : (done ? 'done' : '') + (i === 0 ? ' lead' : '');
      return '<div class="mb-row ' + cls + '">' +
        '<span class="mb-rank">' + (p.expired ? '💀' : (medal || rank)) + '</span>' +
        '<span class="mb-name">' + esc(p.name) + '</span>' +
        '<span class="mb-dots">' + dots(p) + '</span>' +
        '<span class="mb-stage">' + gateLabel(p) + '</span>' +
        '<span class="mb-detail">' + detail(p) + '</span>' +
        '</div>';
    }).join('');
  }

  // ============================================================ TALLY
  function setTally(r) {
    if (!r) return;
    if (tallyUp) tallyUp.textContent = r.up || 0;
    if (tallyConf) tallyConf.textContent = r.confused || 0;
  }
  function bumpTally(kind) {
    const chip = document.getElementById(kind === 'confused' ? 'chip-conf' : 'chip-up');
    if (!chip) return;
    chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
  }

  // ============================================================ FLYING QUESTIONS
  const shownQ = new Set(); // question ids already rendered — prevents duplicates
  function flyQuestion(q, silent) {
    if (shownQ.has(q.id)) return; // already on screen (e.g. question event + snapshot)
    shownQ.add(q.id);
    const b = document.createElement('div');
    b.className = 'q-bubble';
    b.dataset.id = q.id;
    b.innerHTML =
      (IS_PRESENTER ? '<button class="q-x" title="치우기">✕</button>' : '') +
      '<span class="q-name">' + esc(q.name || '익명') + '</span>' +
      esc(q.text) +
      '<span class="q-vote" data-id="' + q.id + '">👍 <b class="vnum">' + (q.votes || 0) + '</b></span>';

    // position: random-ish but avoid edges & dock
    const x = 6 + Math.random() * 60;          // vw
    const y = 14 + Math.random() * 50;          // vh
    b.style.left = x + 'vw';
    b.style.top = y + 'vh';
    b.style.setProperty('--rot', (Math.random() * 6 - 3).toFixed(1) + 'deg'); // slight tilt
    qlayer.appendChild(b);

    // vote handler (audience can upvote)
    b.querySelector('.q-vote').addEventListener('click', () => {
      api('/questions/vote', { id: q.id });
    });
    // presenter can dismiss a post-it immediately (removes it everywhere)
    if (IS_PRESENTER) {
      const x = b.querySelector('.q-x');
      if (x) x.addEventListener('click', () => api('/questions/dismiss', { id: q.id }));
    }

    // auto-dismiss after a while to avoid clutter
    setTimeout(() => {
      b.classList.add('leaving');
      setTimeout(() => { b.remove(); shownQ.delete(q.id); }, 600);
    }, silent ? 8000 : 14000);
  }

  // ============================================================ FLOATING REACTIONS
  function spawnFloat(kind) {
    const e = document.createElement('div');
    e.className = 'float-emoji';
    e.textContent = kind === 'confused' ? '🤔' : '👍';
    e.style.left = (10 + Math.random() * 80) + 'vw';
    reactLayer.appendChild(e);
    setTimeout(() => e.remove(), 2600);
  }

  // ============================================================ API
  function api(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    let url = path;
    if (IS_PRESENTER) { headers['x-present-key'] = PRESENT_KEY; url += '?key=' + encodeURIComponent(PRESENT_KEY); }
    return fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ============================================================ MODE SETUP
  function setupPresenter() {
    document.getElementById('presenter').classList.remove('hidden');
    document.getElementById('pres-tag').classList.remove('hidden');
    document.getElementById('dock').classList.add('hidden');
    document.getElementById('nick-chip').classList.add('hidden'); // presenter has no nickname chip

    const go = (n) => {
      const next = Math.min(slides.length - 1, Math.max(0, n));
      if (next === current) return;
      current = next; render(current);
      api('/slide', { slide: current });
      const toc = document.getElementById('toc');
      if (toc && !toc.classList.contains('hidden')) buildToc(go); // keep highlight in sync
    };
    document.getElementById('prev').onclick = () => go(current - 1);
    document.getElementById('next').onclick = () => go(current + 1);
    document.getElementById('clearq').onclick = () => {
      if (confirm('화면의 질문과 질문 기록을 모두 정리할까요?')) api('/admin/clear');
    };
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === ' ') go(current + 1);
      if (e.key === 'ArrowLeft') go(current - 1);
    });
    // question history panel toggle (presenter only)
    const panel = document.getElementById('qhistory');
    document.getElementById('histbtn').onclick = () => { panel.classList.toggle('hidden'); renderHistory(); };
    document.getElementById('qh-close').onclick = () => panel.classList.add('hidden');
    // feedback summary panel (presenter only)
    const fbp = document.getElementById('fbsummary');
    document.getElementById('fbbtn').onclick = () => {
      if (fbp.classList.contains('hidden')) loadFeedbackSummary();
      fbp.classList.toggle('hidden');
    };
    document.getElementById('fbs-close').onclick = () => fbp.classList.add('hidden');
    document.getElementById('fbs-clear').onclick = () => {
      if (!confirm('모든 피드백을 초기화할까요? 되돌릴 수 없습니다.')) return;
      fetch('/feedback/clear?key=' + encodeURIComponent(PRESENT_KEY), { method: 'POST' }).then(() => loadFeedbackSummary());
    };
    // slide tree / table of contents (jump to any slide)
    const toc = document.getElementById('toc');
    document.getElementById('tocbtn').onclick = () => {
      buildToc(go);
      toc.classList.toggle('hidden');
    };
    document.getElementById('toc-close').onclick = () => toc.classList.add('hidden');
    presenterGo = go; // expose so toc rebuilds can re-highlight on slide change
  }

  // ---- slide tree ----------------------------------------------------------
  let presenterGo = null;
  function slideTitle(s) {
    const h = s.html || '';
    const isSection = /slide-section|hands-divider|slide-title/.test(s.cls || '');
    if (isSection) {
      const eb = h.match(/sec-eyebrow[^>]*>([^<]+)/);
      const h1 = h.match(/<h1[^>]*>([^<]+)<\/h1>/);
      return { section: true, label: (eb ? eb[1].trim() + ' · ' : '') + (h1 ? h1[1].trim() : '') };
    }
    let t = '';
    const h2 = h.match(/<h2[^>]*>(?:<span[^>]*><\/span>\s*)?([^<]+)/);
    if (h2) t = h2[1].trim();
    if (!t) { const h1 = h.match(/<h1[^>]*>([^<]+)<\/h1>/); if (h1) t = h1[1].trim(); }
    return { section: false, label: t || ('슬라이드 ' + 1) };
  }
  function buildToc(go) {
    const list = document.getElementById('toc-list');
    if (!list) return;
    list.innerHTML = slides.map((s, i) => {
      const { section, label } = slideTitle(s);
      const cls = 'toc-item' + (section ? ' toc-sec' : '') + (i === current ? ' toc-cur' : '');
      return '<div class="' + cls + '" data-i="' + i + '"><span class="toc-n">' + (i + 1) + '</span><span class="toc-t">' + esc(label) + '</span></div>';
    }).join('');
    list.querySelectorAll('.toc-item').forEach((el) => {
      el.onclick = () => { go(Number(el.dataset.i)); buildToc(go); };
    });
    // scroll current into view
    const cur = list.querySelector('.toc-cur');
    if (cur) cur.scrollIntoView({ block: 'center' });
  }

  const STAR = (n) => { let s = ''; for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; };
  function loadFeedbackSummary() {
    fetch('/feedback/summary?key=' + encodeURIComponent(PRESENT_KEY))
      .then((r) => r.json()).then((d) => {
        document.getElementById('fbs-count').textContent = d.count || 0;
        const body = document.getElementById('fbs-body');
        const labels = { q1: '실무 메시지', q2: 'SaaS 관점', q3: '추천 의향' };
        const bar = (v) => '<div class="fbs-bar"><i style="width:' + (v / 5 * 100) + '%"></i></div>';
        // overall score (big)
        let h = '<div class="fbs-overall"><div class="fbs-ov-num">' + (d.overall || 0).toFixed(1) +
          '</div><div class="fbs-ov-stars">' + STAR(Math.round(d.overall || 0)) + '</div><div class="fbs-ov-lbl">종합 만족도</div></div>';
        // per-question averages
        h += '<div class="fbs-avgs">';
        ['q1', 'q2', 'q3'].forEach((k) => {
          const v = (d.avg && d.avg[k]) || 0;
          h += '<div class="fbs-row"><span class="fbs-lbl">' + labels[k] + '</span>' + bar(v) + '<span class="fbs-num">' + v.toFixed(1) + '</span></div>';
        });
        h += '</div>';
        // per-submission list (who + their stars + text)
        const items = d.items || [];
        if (items.length) {
          h += '<div class="fbs-texts-head">개별 응답 ' + items.length + '건</div>';
          h += items.map((it) => {
            const t = new Date(it.ts); const hh = String(t.getHours()).padStart(2, '0'), mm = String(t.getMinutes()).padStart(2, '0');
            return '<div class="fbs-item">' +
              '<div class="fbs-item-top"><span class="fbs-name">' + esc(it.name || '익명') + '</span><span class="fbs-time">' + hh + ':' + mm + '</span></div>' +
              '<div class="fbs-item-stars">' + labels.q1 + ' ' + STAR(it.q1) + ' · ' + labels.q2 + ' ' + STAR(it.q2) + ' · ' + labels.q3 + ' ' + STAR(it.q3) + '</div>' +
              (it.text ? '<div class="fbs-item-text">' + esc(it.text) + '</div>' : '') +
              '</div>';
          }).join('');
        } else {
          h += '<div class="qh-empty">아직 피드백이 없습니다.</div>';
        }
        body.innerHTML = h;
      });
  }

  function setupAudience() {
    document.getElementById('presenter').classList.add('hidden');
    document.getElementById('pres-tag').classList.add('hidden');
    document.getElementById('dock').classList.remove('hidden');

    const input = document.getElementById('qinput');
    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      api('/questions', { text, name: profile ? profile.name : '익명' });
      input.value = '';
    };
    document.getElementById('sendq').onclick = send;
    // Guard against Korean IME: Enter during composition fires an extra keydown,
    // which split "감사합니다" into "감사합니다" + "다". Ignore composing Enters.
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.isComposing || e.keyCode === 229) return;
      send();
    });
    document.getElementById('react-up').onclick = () => api('/react', { kind: 'up' });
    document.getElementById('react-conf').onclick = () => api('/react', { kind: 'confused' });

    // follow toggle + free navigation (audience only)
    document.getElementById('follow-toggle').classList.remove('hidden');
    const move = (n) => {
      const next = Math.min(slides.length - 1, Math.max(0, n));
      if (next === current) return;
      current = next; render(current); updateFollowUI();
    };
    document.getElementById('a-prev').onclick = () => { setFollowing(false); move(current - 1); };
    document.getElementById('a-next').onclick = () => { setFollowing(false); move(current + 1); };
    document.getElementById('follow-btn').onclick = () => {
      const now = !following;
      if (now) { current = liveSlide; render(current); } // snap back to presenter
      setFollowing(now); // updates UI (calls updateFollowUI) after current is set
    };
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { setFollowing(false); move(current + 1); }
      if (e.key === 'ArrowLeft') { setFollowing(false); move(current - 1); }
    });
    setFollowing(true);
    updateFollowUI();
    showNickChip(); // show nickname if already set
  }

  function setFollowing(v) { following = v; updateFollowUI(); }

  function updateFollowUI() {
    const btn = document.getElementById('follow-btn');
    const tag = document.getElementById('follow-state');
    const behind = document.getElementById('behind-nudge');
    if (!btn) return;
    btn.classList.toggle('on', following);
    btn.textContent = following ? '🔗 강사 따라가기 ON' : '🔓 자유 탐색 OFF';
    if (tag) tag.textContent = (current + 1) + ' / ' + slides.length;
    // nudge when audience is off-sync and presenter has moved elsewhere
    if (behind) {
      if (!following && liveSlide !== current) {
        behind.classList.remove('hidden');
        behind.textContent = '강사는 ' + (liveSlide + 1) + '페이지 · 따라가기를 켜면 이동';
      } else {
        behind.classList.add('hidden');
      }
    }
  }

  // ============================================================ NICKNAME MODAL (first visit + edit)
  function setupNickname(after, isEdit) {
    const modal = document.getElementById('nick');
    const input = document.getElementById('nickinput');
    const cancel = document.getElementById('nickcancel');
    let avatar = (profile && profile.avatar) || AVATARS[0];
    const row = document.getElementById('avatar-row');
    row.innerHTML = AVATARS.map((a) =>
      '<span class="av-opt' + (a === avatar ? ' sel' : '') + '" data-a="' + a + '" title="' + a + '">' +
        '<img src="/avatars/' + a + '.svg" alt="' + a + '"></span>').join('');
    row.querySelectorAll('.av-opt').forEach((sp) => {
      sp.onclick = () => {
        avatar = sp.dataset.a;
        row.querySelectorAll('.av-opt').forEach((x) => x.classList.remove('sel'));
        sp.classList.add('sel');
      };
    });

    // edit mode: prefill current name, retitle, offer cancel
    document.getElementById('nick-title').textContent = isEdit ? '닉네임 수정' : '실명으로 입장해주세요';
    document.getElementById('nick-desc').innerHTML = isEdit ? '새 이름과 아이콘을 고르세요' : '리더보드·질문에 표시돼요 — <b>꼭 실명</b>으로 부탁드려요 🙏';
    document.getElementById('nickgo').textContent = isEdit ? '저장 →' : '입장하기 →';
    input.value = isEdit && profile ? profile.name : '';
    cancel.classList.toggle('hidden', !isEdit);

    const confirm = () => {
      const name = input.value.trim().slice(0, 24) || '익명';
      saveProfile({ name: name, avatar: avatar });
      modal.classList.add('hidden');
      after();
    };
    document.getElementById('nickgo').onclick = confirm;
    cancel.onclick = () => modal.classList.add('hidden');
    input.onkeydown = (e) => { if (e.key === 'Enter') confirm(); };

    modal.classList.remove('hidden');
    input.focus();
  }

  // ============================================================ BOOT
  render(0);
  connect();

  if (IS_PRESENTER) {
    setupPresenter();
  } else {
    setupAudience();
    if (!profile) setupNickname(() => {}); // ask once, stored after
  }
})();
