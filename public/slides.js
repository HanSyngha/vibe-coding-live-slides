// 바이브 코딩 개론 — 슬라이드 덱
// 부제: AI와 바이브 코딩에 대한 이해 | 대상: FY27 Korea AE/SE | 1.5h
// 시각 우선 + 개념당 1슬라이드 세분화. 기술용어는 mono, 본문은 최소.
// 각 슬라이드 본문은 <div class="sbody">로 감싸 세로 중앙정렬.

window.SLIDES = [

  /* ═══════════════════════════════ 0. TITLE */
  {
    cls: 'slide-title',
    html: `
      <div class="title-wrap">
        <div class="orbit">
          <div class="core">&lt;/&gt;</div>
          <span class="ring ring1"></span><span class="ring ring2"></span><span class="ring ring3"></span>
          <i class="sat s1"></i><i class="sat s2"></i><i class="sat s3"></i>
        </div>
        <div class="kicker">VIBE CODING 101</div>
        <h1 class="grad-title">바이브 코딩 개론</h1>
        <p class="sub">AI와 바이브 코딩에 대한 <b>이해</b></p>
        <div class="title-chips"><span>🧠 AI의 원리</span><span>📈 발전사</span><span>⌨️ Claude Code</span><span>🧪 Hands-on</span></div>
      </div>`
  },

  /* 강사 소개 */
  {
    html: `
      <h2><span class="dot"></span> 강사 소개</h2>
      <div class="sbody">
        <div class="bio">
          <div class="bio-left">
            <div class="bio-avatar">👨‍💻</div>
            <div class="bio-name">한승하 <span>Syngha Han</span></div>
            <div class="bio-role">삼성 반도체 · 6년</div>
            <div class="bio-exp-v">
              <div class="bev"><b>2년</b> Embedded SW</div>
              <div class="bev hot"><b>4년</b> AI · LLM · Agentic</div>
            </div>
            <div class="bio-links">
              <div class="bl"><span class="bl-top">🛠️ <b>Local CLI</b></span><span class="bl-url">github.com/HanSyngha/Local-CLI</span></div>
              <div class="bl"><span class="bl-top">✍️ <b>블로그</b></span><span class="bl-url">syngha.com <i>(사내망✕·폰으로)</i></span></div>
            </div>
          </div>
          <div class="bio-right">
            <div class="demo-label">▶️ 대표작 데모 — Local CLI</div>
            <div class="video-wrap">
              <iframe src="https://www.youtube.com/embed/4pfKEyp2RQE"
                title="Local CLI Demo" frameborder="0" allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
            </div>
          </div>
        </div>
      </div>`
  },

  /* ═══════════════════════════════ PART 1 divider */
  {
    cls: 'slide-section',
    html: `<div class="sec-wrap"><div class="sec-num">01</div><div class="sec-meta"><div class="sec-eyebrow">PART ONE</div><h1>AI란 무엇인가</h1><p>똑똑한 도구가 아니라 — 확률 예측기</p></div></div>`
  },

  /* 알파고 — 다음 수(手) 확률 예측 */
  {
    html: `
      <h2><span class="dot"></span> 알파고는 "다음 수"를 확률로 고른다</h2>
      <div class="sbody">
        <div class="go-stage">
          <div class="goban">
            ${Array.from({length:49}).map((_,i)=>{
              const stones={10:'b',18:'w',24:'b',26:'w',32:'w'};
              const cand={16:92,23:64,30:31};
              if(stones[i]) return `<span class="gx"><i class="stone ${stones[i]}"></i></span>`;
              if(cand[i]) return `<span class="gx"><i class="cand" style="--p:${cand[i]}"><b>${cand[i]}%</b></i></span>`;
              return `<span class="gx"></span>`;
            }).join('')}
          </div>
          <div class="go-side">
            <div class="go-line">현재 판 →</div>
            <div class="go-prob">
              <div class="pbar"><span style="--w:92%"></span><label>A 지점 <b>92%</b></label></div>
              <div class="pbar"><span style="--w:64%"></span><label>B 지점 <b>64%</b></label></div>
              <div class="pbar"><span style="--w:31%"></span><label>C 지점 <b>31%</b></label></div>
            </div>
            <div class="go-note">"이긴다"가 아니라 <b>"이 자리가 유리할 확률"</b>을 계산</div>
          </div>
        </div>
      </div>`
  },

  /* LLM — 다음 단어 확률 예측 (같은 문법) */
  {
    html: `
      <h2><span class="dot"></span> LLM도 똑같다 — "다음 단어"를 확률로 고른다</h2>
      <div class="sbody">
        <div class="token-stage">
          <div class="token done">나는</div><div class="token done">오늘</div><div class="token done">점심에</div>
          <div class="token guess">
            <div class="bars">
              <span style="--h:90%"><b>김밥</b></span><span style="--h:60%"><b>라면</b></span>
              <span style="--h:35%"><b>커피</b></span><span style="--h:18%"><b>···</b></span>
            </div>
          </div>
          <div class="token next pulse">?</div>
        </div>
        <div class="mirror">
          <div class="mirror-card"><div class="mc-ico">♟️</div><div class="mc-t">알파고<br><b>다음 수 확률</b></div></div>
          <div class="mirror-eq">＝ 같은 원리 ＝</div>
          <div class="mirror-card hot"><div class="mc-ico">🔤</div><div class="mc-t">LLM<br><b>다음 단어 확률</b></div></div>
        </div>
      </div>`
  },

  /* 그래서 = 확률기계 */
  {
    html: `
      <h2><span class="dot"></span> 그래서 AI는 "확률 기계"다</h2>
      <div class="sbody">
        <div class="three-up">
          <div class="tu-card pop"><div class="tu-ico">🎲</div><div class="tu-t">매번 다를 수 있다</div><div class="tu-s">같은 질문 → 다른 답<br>(temperature·샘플링)</div></div>
          <div class="tu-card pop" style="--d:.15s"><div class="tu-ico">⚠️</div><div class="tu-t">틀릴 수 있다</div><div class="tu-s">그럴듯하게 자신만만하게<br>틀린다 (환각)</div></div>
          <div class="tu-card pop hot" style="--d:.3s"><div class="tu-ico">🔮</div><div class="tu-t">언제 틀릴진 모른다</div><div class="tu-s">"확률"이라<br>검증은 사람 몫</div></div>
        </div>
        <div class="punch-line">똑똑해 보이는 건 <b>확률 분포가 정교</b>해서지, 이해해서가 아니다</div>
      </div>`
  },

  /* ═══════════════════════════════ PART 2 divider */
  {
    cls: 'slide-section',
    html: `<div class="sec-wrap"><div class="sec-num">02</div><div class="sec-meta"><div class="sec-eyebrow">PART TWO</div><h1>AI는 어떻게 발전해왔나</h1><p>더 큰 모델 → 효율적인 모델 → 모델 + 툴</p></div></div>`
  },

  /* 1막: 더 큰 모델 */
  {
    html: `
      <h2><span class="dot"></span> 1막 · "더 똑똑하게 = 더 크게"</h2>
      <div class="sbody">
        <div class="scale-row">
          <div class="scale-box" style="--s:.5"><b>GPT-2</b><span>작음</span></div>
          <div class="scale-arrow">→</div>
          <div class="scale-box" style="--s:.72"><b>GPT-3</b><span>175B</span></div>
          <div class="scale-arrow">→</div>
          <div class="scale-box" style="--s:1"><b>GPT-4급</b><span>초거대</span></div>
        </div>
        <div class="law-card">📐 <b>스케일링 법칙</b> — 파라미터·데이터·연산을 키울수록 성능이 오른다</div>
        <div class="cost-warn">💸 단, 학습·운영 비용이 <b>기하급수적</b>으로 폭증 → 소수 빅테크만 가능</div>
      </div>`
  },

  /* 2막: DeepSeek 충격 → 효율 */
  {
    html: `
      <h2><span class="dot"></span> 2막 · DeepSeek 충격 — "크기 대비 똑똑하게"</h2>
      <div class="sbody">
        <div class="shock">
          <div class="shock-before"><span class="sb-lab">기존</span><div class="sb-big">🏗️ 무조건 크게</div><div class="sb-sub">막대한 비용</div></div>
          <div class="shock-bolt">⚡<span>2025 DeepSeek</span></div>
          <div class="shock-after"><span class="sb-lab hot">전환</span><div class="sb-big">🪶 작고 영리하게</div><div class="sb-sub">비용 1/10급 충격</div></div>
        </div>
        <div class="tech-chips">
          <span>MoE · 전문가 혼합</span><span>Distillation · 증류</span><span>Quantization · 경량화</span>
          <span>정제된 datasource</span><span>효율적 retrieval</span>
        </div>
        <div class="punch-line">"누가 더 크냐"에서 <b>"누가 더 효율적으로 똑똑하냐"</b>로 경쟁축 이동</div>
      </div>`
  },

  /* 3막: 모델 + 툴 */
  {
    html: `
      <h2><span class="dot"></span> 3막 · "모델"에서 "모델 + 툴"로</h2>
      <div class="sbody">
        <div class="vs-evolve">
          <div class="ve-card"><div class="ve-ico">🧠</div><div class="ve-t">똑똑한 모델</div><div class="ve-s">혼자 답만 잘함</div></div>
          <div class="ve-plus">＋</div>
          <div class="ve-card hot"><div class="ve-ico">🛠️</div><div class="ve-t">뛰어놀 툴</div><div class="ve-s">터미널·파일·브라우저를<br>직접 다룸</div></div>
          <div class="ve-eq">＝</div>
          <div class="ve-card win"><div class="ve-ico">🚀</div><div class="ve-t">실전에서 강한 AI</div><div class="ve-s">생각 → 실행 → 검증</div></div>
        </div>
        <div class="punch-line">모델이 손발(툴)을 갖자 <b>"대답"이 아니라 "수행"</b>으로 바뀌었다</div>
      </div>`
  },

  /* 개념 정리 ① — 모델 ≠ 툴 (Claude vs Claude Code vs Codex) */
  {
    html: `
      <h2><span class="dot"></span> 잠깐 · 모델과 툴은 다릅니다</h2>
      <div class="sbody">
        <div class="mt-row">
          <div class="mt-card model">
            <div class="mt-tag">MODEL · 모델</div>
            <div class="mt-ico">🧠</div>
            <div class="mt-name"><img class="blogo" src="/avatars/claude.svg" alt="">Claude · <img class="blogo" src="/avatars/openai.svg" alt="">GPT · <img class="blogo" src="/avatars/gemini.svg" alt="">Gemini</div>
            <div class="mt-desc">"두뇌" — 텍스트를 입력받아<br>다음 토큰을 확률로 예측</div>
          </div>
          <div class="mt-plus">실행 환경에 심으면 ↓</div>
          <div class="mt-card tool">
            <div class="mt-tag hot">TOOL · 에이전트 툴</div>
            <div class="mt-ico">🛠️</div>
            <div class="mt-name">Claude Code · Codex · Cursor</div>
            <div class="mt-desc">"두뇌 + 손발" — 터미널·파일·브라우저를<br>직접 조작하고 결과를 보고 다시 판단</div>
          </div>
        </div>
        <div class="mt-eq-row">
          <span class="mt-chip">Claude = 모델</span>
          <span class="mt-x">＋ 실행 래퍼 =</span>
          <span class="mt-chip hot">Claude Code = 툴</span>
          <span class="mt-note">Codex = OpenAI 모델(GPT)을 감싼 툴</span>
        </div>
      </div>`
  },

  /* 개념 정리 ② — 모델마다 확률분포가 달라 한 세트여야 */
  {
    html: `
      <h2><span class="dot"></span> 왜 "모델 전용 툴"이어야 하나</h2>
      <div class="sbody">
        <div class="dist-row">
          <div class="dist-card">
            <div class="dist-h">같은 입력 <code>"파일 정리해줘"</code></div>
            <div class="fan">
              <div class="fan-src">동일 input</div>
              <div class="fan-arms">
                <div class="arm a"><span class="arm-line"></span><div class="arm-end">Claude → <b>A 방식</b><i>날짜별 폴더로</i></div></div>
                <div class="arm b"><span class="arm-line"></span><div class="arm-end">GPT → <b>B 방식</b><i>확장자별로</i></div></div>
                <div class="arm c"><span class="arm-line"></span><div class="arm-end">Gemini → <b>C 방식</b><i>먼저 되묻기</i></div></div>
              </div>
            </div>
            <div class="dist-cap">우열이 아니라 <b>서로 다른 방향</b> — 모델마다 학습된 확률분포가 달라 같은 input에도 output·action이 갈린다</div>
          </div>
        </div>
        <div class="sync-flow">
          <div class="sf">🧠 모델의 generation 습성</div>
          <div class="sf-ar">→</div>
          <div class="sf">📝 그에 맞춘 prompt·context 설계</div>
          <div class="sf-ar">→</div>
          <div class="sf hot">🔧 툴이 그 모델에 deep하게 튜닝</div>
        </div>
        <div class="punch-line">모델과 툴이 <b>함께 개발·sync</b>될 때 최상의 성능 — 그래서 "모델 전용 툴"이 강하다</div>
      </div>`
  },

  /* 벤치마크의 함정 */
  {
    html: `
      <h2><span class="dot"></span> 벤치마크 점수의 함정</h2>
      <div class="sbody">
        <div class="bench-wrap">
          <div class="bench-col">
            <div class="bench-cap">📊 벤치마크 점수</div>
            <div class="bench-bars">
              <div class="bb"><span style="--h:96%"></span><label>GLM</label></div>
              <div class="bb"><span style="--h:94%"></span><label>Kimi</label></div>
              <div class="bb"><span style="--h:95%"></span><label>Gemini</label></div>
              <div class="bb"><span style="--h:97%" class="claude"></span><label>Claude</label></div>
            </div>
            <div class="bench-note">숫자는 오픈소스·타사도 <b>매우 우수</b></div>
          </div>
          <div class="bench-arrow">실전 코딩 →</div>
          <div class="bench-col">
            <div class="bench-cap">⌨️ 실제 코딩 체감</div>
            <div class="bench-bars">
              <div class="bb"><span style="--h:60%"></span><label>GLM</label></div>
              <div class="bb"><span style="--h:58%"></span><label>Kimi</label></div>
              <div class="bb"><span style="--h:66%"></span><label>Gemini</label></div>
              <div class="bb"><span style="--h:95%" class="claude"></span><label>Claude<br>·Codex</label></div>
            </div>
            <div class="bench-note hot">툴과 함께 쓰면 <b>격차가 벌어진다</b></div>
          </div>
        </div>
        <div class="punch-line">전용 <b>툴</b> × 그 툴에 <b>핏하게 훈련된 모델</b>의 조합이 승부를 가른다</div>
      </div>`
  },

  /* 툴 생태계 */
  {
    html: `
      <h2><span class="dot"></span> 그래서 지금은 "에이전트 툴" 전쟁</h2>
      <div class="sbody">
        <div class="tool-grid">
          <div class="tool-card pop"><div class="tc-logo a"><img src="/avatars/claude.svg" alt=""></div><div class="tc-n">Claude Code</div><div class="tc-d">Anthropic · 터미널 에이전트</div></div>
          <div class="tool-card pop" style="--d:.08s"><div class="tc-logo b"><img src="/avatars/openai.svg" alt=""></div><div class="tc-n">Codex</div><div class="tc-d">OpenAI · 코딩 에이전트</div></div>
          <div class="tool-card pop" style="--d:.16s"><div class="tc-logo c"><img src="/avatars/gemini.svg" alt=""></div><div class="tc-n">Antigravity</div><div class="tc-d">Google · 에이전틱 IDE</div></div>
          <div class="tool-card pop" style="--d:.24s"><div class="tc-logo d"><img src="/avatars/gemini.svg" alt=""></div><div class="tc-n">Stitch</div><div class="tc-d">Google · UI 생성</div></div>
          <div class="tool-card pop hot" style="--d:.32s"><div class="tc-logo e"><img src="/avatars/salesforce.svg" alt=""></div><div class="tc-n">사내 Slackbot</div><div class="tc-d">Salesforce · 워크스페이스 에이전트</div></div>
        </div>
        <div class="punch-line">모델은 평준화되고, <b>"어디에 어떻게 심느냐(툴)"</b>가 유용성을 가른다</div>
      </div>`
  },

  /* ═══════════════════════════════ PART 3 divider */
  {
    cls: 'slide-section',
    html: `<div class="sec-wrap"><div class="sec-num">03</div><div class="sec-meta"><div class="sec-eyebrow">PART THREE</div><h1>바이브 코딩</h1><p>요구사항만 말하면, AI가 만든다</p></div></div>`
  },

  /* AI×코드 3단계 */
  {
    html: `
      <h2><span class="dot"></span> AI × 코드 · 3단계 진화</h2>
      <div class="sbody">
        <div class="stages">
          <div class="stage-card pop"><div class="snum">1</div>
            <svg viewBox="0 0 120 90" class="ill"><rect x="8" y="14" width="46" height="62" rx="6" class="fill-soft"/><rect x="66" y="14" width="46" height="62" rx="6" class="fill-soft2"/><path d="M54 45 H66" class="arrow anim-dash"/><circle cx="31" cy="34" r="4" class="ink"/><rect x="20" y="46" width="22" height="4" rx="2" class="ink"/><text x="86" y="48" class="emojitext">🧑‍💻</text></svg>
            <div class="slab">챗봇 복붙</div><div class="ssub">사람이 중간다리</div></div>
          <div class="flow-arrow">➜</div>
          <div class="stage-card pop" style="--d:.2s"><div class="snum">2</div>
            <svg viewBox="0 0 120 90" class="ill"><rect x="20" y="14" width="80" height="62" rx="6" class="fill-soft"/><rect x="30" y="26" width="40" height="5" rx="2" class="ink"/><rect x="30" y="38" width="60" height="5" rx="2" class="ghost anim-fill"/><rect x="30" y="50" width="34" height="5" rx="2" class="ink"/></svg>
            <div class="slab">자동완성 (FIM)</div><div class="ssub">AI가 빈칸 채움</div></div>
          <div class="flow-arrow">➜</div>
          <div class="stage-card pop hot" style="--d:.4s"><div class="snum">3</div>
            <svg viewBox="0 0 120 90" class="ill"><rect x="14" y="14" width="92" height="62" rx="6" class="fill-dark"/><circle cx="24" cy="24" r="3" class="r"/><circle cx="34" cy="24" r="3" class="y"/><circle cx="44" cy="24" r="3" class="g"/><rect x="22" y="38" width="50" height="5" rx="2" class="termline anim-type"/><rect x="22" y="50" width="70" height="5" rx="2" class="termline2"/><text x="84" y="66" class="emojitext">🤖</text></svg>
            <div class="slab">에이전트</div><div class="ssub">AI가 직접 실행</div></div>
        </div>
        <div class="human-shrink"><span>사람의 역할</span><div class="shrink-bar"><i style="--w:120px"></i><i style="--w:66px"></i><i style="--w:22px"></i></div></div>
      </div>`
  },

  /* Claude Code란? */
  {
    html: `
      <h2><span class="dot"></span> Claude Code = "셸을 쥔 에이전트"</h2>
      <div class="sbody">
        <div class="cc-split">
          <div class="cc-old"><div class="cc-h">기존 챗봇</div><ul><li>답변만 출력</li><li>복사 → 붙여넣기 → 실행은 사람이</li><li>파일·터미널 접근 ✕</li></ul></div>
          <div class="cc-vs">VS</div>
          <div class="cc-new"><div class="cc-h hot">Claude Code</div><ul><li>터미널 명령 직접 실행 ✓</li><li>파일 읽고·쓰고·수정 ✓</li><li>테스트·디버깅까지 반복 ✓</li></ul></div>
        </div>
        <div class="punch-line">사람은 <b>요구사항만</b> 말하고, AI가 <b>구현 전 과정</b>을 수행</div>
      </div>`
  },

  /* 바이브 코딩이란? */
  {
    html: `
      <h2><span class="dot"></span> "바이브 코딩"이란?</h2>
      <div class="sbody">
        <div class="flow-3">
          <div class="f3"><div class="f3-ico">💬</div><div class="f3-t">의도를 말한다</div><div class="f3-s">"이런 게 필요해"</div></div>
          <div class="f3-ar">→</div>
          <div class="f3"><div class="f3-ico">🤖</div><div class="f3-t">AI가 구현</div><div class="f3-s">코드·실행·수정</div></div>
          <div class="f3-ar">→</div>
          <div class="f3"><div class="f3-ico">👀</div><div class="f3-t">사람이 판단</div><div class="f3-s">맞는지 검증·방향</div></div>
        </div>
        <div class="quote-card">"문법을 외워 타이핑"하던 코딩에서 → <b>"의도를 설계하고 결과를 판단"</b>하는 코딩으로</div>
      </div>`
  },

  /* 가능 / 한계 */
  {
    html: `
      <h2><span class="dot"></span> 무엇이 가능하고, 무엇이 함정인가</h2>
      <div class="sbody">
        <div class="two-col">
          <div class="tc-can"><div class="tc-head">✅ 강력한 것</div><ul><li>아이디어 → 동작하는 프로토타입</li><li>반복·정형 작업 자동화</li><li>낯선 언어·프레임워크도 즉시</li><li>구현 난이도↓ 비용↓ 속도↑</li></ul></div>
          <div class="tc-cant"><div class="tc-head bad">⚠️ 한계·함정</div><ul><li>시야가 좁다 — 큰 그림은 못 봄</li><li>요청 품질 = 결과 품질</li><li>그럴듯하게 <b>조용히 틀린다</b></li><li>복잡할수록 비용 증가</li></ul></div>
        </div>
        <div class="punch-line">AI는 <b>"어떻게 만들지"</b>를 풀지만, <b>"무엇이 옳은지"</b>는 사람이 정한다</div>
      </div>`
  },

  /* ═══════════════════════════════ PART 4 divider */
  {
    cls: 'slide-section',
    html: `<div class="sec-wrap"><div class="sec-num">04</div><div class="sec-meta"><div class="sec-eyebrow">PART FOUR</div><h1>그래도 SaaS가 강하다</h1><p>구현이 쉬워질수록 — 진짜 가치는 다른 곳에</p></div></div>`
  },

  /* 구현은 원래 쉬웠다 */
  {
    html: `
      <h2><span class="dot"></span> 사실, "구현"은 원래도 어렵지 않았다</h2>
      <div class="sbody">
        <div class="logos-row"><span>Google</span><span>AWS</span><span>삼성SDS</span><span>LG CNS</span></div>
        <div class="mid-statement">우수한 개발자를 가진 곳은 <b>구현 자체로 고생하지 않았다</b></div>
        <div class="punch-line">AI가 구현 비용을 낮춘 건 맞지만 — 그게 SW의 <b>핵심 난제</b>는 아니었다</div>
      </div>`
  },

  /* 빙산 */
  {
    html: `
      <h2><span class="dot"></span> 진짜 어려움은 "구현"이 아니다</h2>
      <div class="sbody iceberg-body">
        <div class="iceberg">
          <div class="berg-cap top">⬆ 수면 위 · <b>AI가 잘하는 영역</b></div>
          <svg viewBox="0 0 520 380" preserveAspectRatio="xMidYMid meet">
            <rect x="0" y="150" width="520" height="230" class="sea"/>
            <line x1="0" y1="150" x2="520" y2="150" class="sealine"/>
            <g class="berg-top">
              <polygon points="260,28 212,150 308,150" class="ice-light"/>
              <text x="260" y="118" class="berg-label">구현</text>
            </g>
            <g class="berg-bot">
              <polygon points="212,150 308,150 372,360 148,360" class="ice-dark"/>
              <text x="260" y="200" class="berg-label2">유지보수</text>
              <text x="260" y="240" class="berg-label2">신규기능 충돌 · 회귀</text>
              <text x="260" y="280" class="berg-label2">보안 · 엣지케이스</text>
              <text x="260" y="320" class="berg-label2">조직 간 커뮤니케이션</text>
            </g>
          </svg>
          <div class="berg-cap bot">⬇ 수면 아래 · <b>사람 · 조직 · 시스템이 해결</b></div>
        </div>
      </div>`
  },

  /* 자동차 비유 — 만들 수 있다 ≠ 직접 만든다 */
  {
    html: `
      <h2><span class="dot"></span> 직접 만들 수 있다고, 직접 만드시겠어요?</h2>
      <div class="sbody">
        <div class="car-q">
          <div class="car-opt diy"><div class="car-ico">🔧🤖</div><div class="car-t">AI·로봇으로<br>내 차 직접 제작</div></div>
          <div class="car-vs">VS</div>
          <div class="car-opt brand"><div class="car-ico">🚗</div><div class="car-t">현대·도요타·테슬라의<br>차를 구매</div></div>
        </div>
        <div class="car-cases">
          <span>🚲 인증된 자전거를 산다</span>
          <span>🚙 더 좋은 브랜드 차를 산다</span>
          <span>🧊 중국 저가 가전 두고 LG·삼성을 산다</span>
        </div>
        <div class="punch-line">그 가전들도 상당수 <b>OEM 중국 생산</b> — 그래도 산다. "만드는 것"은 중요하지만 <b>핵심이 아니다</b></div>
      </div>`
  },

  /* 조립 컴퓨터 vs 완제품 서버 비유 — 개발자에게 더 와닿는 build-vs-buy */
  {
    html: `
      <h2><span class="dot"></span> 더 와닿는 예 — 조립 PC vs Dell 서버</h2>
      <div class="sbody">
        <div class="car-q">
          <div class="car-opt diy"><div class="car-ico">🔩</div><div class="car-t">부품 사서<br>직접 조립</div></div>
          <div class="car-vs">VS</div>
          <div class="car-opt brand"><div class="car-ico">🖥️</div><div class="car-t">Dell·HP 완제품<br>서버 구매</div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">조립이 <b>더 싸고 스펙도 더 좋을 수</b> 있다 — 그런데도 기업은 완제품을 산다</div>
          <div class="dl">이유: <b>AS·워런티</b>(고장 나면 벤더가 책임) · <b>리스크</b>(호환성·안정성 검증됨) · <b>시간</b>(조립·테스트 안 해도 됨)</div>
          <div class="dl hot">"직접 하면 싸다"는 <b>눈에 보이는 비용</b>만 — AS·리스크·시간이라는 <b>숨은 비용</b>이 더 크다</div>
        </div>
        <div class="punch-line">SaaS도 똑같다 — 만들 수 있어도, <b>책임·안정성·시간</b>을 사는 것이 더 합리적일 때가 많다</div>
      </div>`
  },

  /* 요리 비유 — 비용 수용성 / 가격 민감도가 결정을 좌우 */
  {
    html: `
      <h2><span class="dot"></span> 그런데 — "가격"이 오르면 얘기가 달라진다 🍳</h2>
      <div class="sbody">
        <div class="car-q">
          <div class="car-opt diy"><div class="car-ico">🍳</div><div class="car-t">직접 요리<br>(재료 사서)</div></div>
          <div class="car-vs">VS</div>
          <div class="car-opt brand"><div class="car-ico">🍽️</div><div class="car-t">사 먹기<br>(외식·배달)</div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">직접 하면 <b>더 싸고 맛있을 수</b> 있지만 — 장보기·요리·설거지·남는 재료까지 치면 <b>사 먹는 게 경제적</b>일 때가 많다</div>
          <div class="dl">그런데 <b>외식 물가가 오르자</b> "그냥 해 먹자"가 늘었다 — 판단이 <b>가격에 따라 뒤집힌다</b></div>
          <div class="dl hot">즉 <b>비용 수용성(가격 민감도)</b>이 build-vs-buy를 좌우한다 — 절대적 정답은 없다</div>
        </div>
        <div class="punch-line">SaaS도 마찬가지 — <b>비용 통제·가격 최적화</b>가 도입만큼 <b>핵심 운영 요소</b>다</div>
      </div>`
  },

  /* 기술부채 / 인지부채 */
  {
    html: `
      <h2><span class="dot"></span> 기술부채는 앞으로 더 심해진다</h2>
      <div class="sbody">
        <div class="debt-lead">CICD · 버전관리 · 디버그 역량 없이도 <b>누구나 SaaS를 만들게</b> 된다. 그렇게 만든 시스템은 —</div>
        <div class="debt-grid">
          <div class="debt-card pop"><div class="debt-ico">🐛</div><div class="debt-t">작은 버그 하나에<br>쉽게 망가진다</div></div>
          <div class="debt-card pop" style="--d:.1s"><div class="debt-ico">🕳️</div><div class="debt-t">작은 엣지케이스<br>대응이 안 된다</div></div>
          <div class="debt-card pop" style="--d:.2s"><div class="debt-ico">🔓</div><div class="debt-t">작은 공격에도<br>뚫린다</div></div>
          <div class="debt-card pop" style="--d:.3s"><div class="debt-ico">📈</div><div class="debt-t">커질수록 비효율이<br>기하급수로 증가</div></div>
          <div class="debt-card pop" style="--d:.4s"><div class="debt-ico">🏝️</div><div class="debt-t">담당자는 365일<br>휴가도 못 간다</div></div>
        </div>
        <div class="punch-line">이것이 <b>기술부채 · 인지부채</b> — 결국 전부 <b>비용</b>이다. 이미 다들 알고 있다</div>
      </div>`
  },

  /* 방송국 비유 */
  {
    html: `
      <h2><span class="dot"></span> SaaS의 경제학 = 방송국 구조</h2>
      <div class="sbody">
        <div class="broadcast">
          <div class="tower"><svg viewBox="0 0 100 120"><polygon points="50,8 70,100 30,100" class="fill-soft"/><line x1="30" y1="100" x2="70" y2="100" class="ink"/><circle cx="50" cy="18" r="6" class="beacon"/><g class="wave-group"><path d="M58 20 q14 8 0 20" class="wave w1"/><path d="M64 14 q24 14 0 32" class="wave w2"/><path d="M70 8 q34 20 0 44" class="wave w3"/></g></svg><div class="fixed-cost">제작비 고정</div></div>
          <div class="viewers">
            <div class="vrow"><span>👤</span><span class="cnt">시청자 1명</span><b class="per">비용/명 ▮▮▮▮▮</b></div>
            <div class="vrow"><span>👥👥👥</span><span class="cnt">시청자 ↑</span><b class="per">비용/명 ▮▮</b></div>
            <div class="vrow hot"><span>👥👥👥👥👥</span><span class="cnt">시청자 100만</span><b class="per">비용/명 ▮</b></div>
          </div>
        </div>
        <div class="punch-line">고객 ↑ → 1인당 비용 → <span class="zero">0</span> · 개발·운영비는 고정, 시장이 클수록 유리</div>
      </div>`
  },

  /* SaaS가 오히려 싸다 — 기회비용 / build vs buy */
  {
    html: `
      <h2><span class="dot"></span> 그래서 — 사실 SaaS가 더 "싸다"</h2>
      <div class="sbody">
        <div class="ask-compare">
          <div class="ac-col bad">
            <div class="ac-tag">🔨 직접 구축 (Build)</div>
            <code>비싼 개발자 N명 × 수년<br>+ 인프라·보안·운영·유지보수<br>+ 24/7 장애 대응</code>
            <div class="ac-note">non-core에 <b>최상급 인력·시간</b>을 태움 (기회비용 ↑)</div>
          </div>
          <div class="ac-col good">
            <div class="ac-tag">💳 사서 쓰기 (Buy)</div>
            <code>구독료 (여러 고객이 분담)<br>= 구축·운영비보다 훨씬 저렴</code>
            <div class="ac-note">개발자는 <b>회사의 core value</b>에 집중</div>
          </div>
        </div>
        <div class="debrief-list">
          <div class="dl">방송국 구조 → 수많은 고객이 비용을 <b>분담</b>하니, 내가 혼자 만드는 것보다 <b>1인당 훨씬 쌈</b></div>
          <div class="dl hot">진짜 비용은 라이선스가 아니라 <b>기회비용</b> — 비싼 인재를 non-core에 묶어두는 손실</div>
        </div>
        <div class="punch-line"><b>Core는 직접, Non-core는 사서.</b> 꼭 필요하지만 핵심이 아닌 시스템은 SaaS가 정답</div>
      </div>`
  },

  /* 커스터마이징의 함정 — 순정 + 파트너를 써야 SaaS 가치를 누린다 */
  {
    html: `
      <h2><span class="dot"></span> 그 가치를 누리려면 — "순정"으로 써야 한다</h2>
      <div class="sbody">
        <div class="ask-compare">
          <div class="ac-col bad">
            <div class="ac-tag">⚠️ 과도한 커스터마이징</div>
            <code>표준 기능 대신<br>우리만의 방식으로 다 뜯어고침</code>
            <div class="ac-note">공유 인프라(규모의 경제)에서 <b>이탈</b> — 나 혼자 부담</div>
          </div>
          <div class="ac-col good">
            <div class="ac-tag">✅ 순정 기능 + 파트너 활용</div>
            <code>표준 기능을 최대한 그대로,<br>부족하면 검증된 파트너 앱으로</code>
            <div class="ac-note">업그레이드·보안·베스트프랙티스를 <b>공짜로 상속</b></div>
          </div>
        </div>
        <div class="debrief-list">
          <div class="dl">커스텀이 많을수록 <b>신규 기능 적용이 막힌다</b> — 자동 업그레이드가 내 커스텀과 충돌</div>
          <div class="dl">버그가 나면 <b>혼자 고쳐야</b> — 벤더·커뮤니티 지원 밖의 영역</div>
          <div class="dl hot">이미 있는 걸 또 만드는 <b>중복 개발</b> — SaaS를 쓰는 이유를 스스로 지운다</div>
        </div>
      </div>`
  },

  /* = Salesforce */
  {
    html: `
      <h2><span class="dot"></span> 그 운영을 30년간 시스템화한 것 = <img class="blogo big" src="/avatars/salesforce.svg" alt="">Salesforce</h2>
      <div class="sbody">
        <div class="three-up">
          <div class="tu-card pop"><div class="tu-ico">🖥️</div><div class="tu-t">24/7 인프라</div><div class="tu-s">무중단 운영</div></div>
          <div class="tu-card pop" style="--d:.15s"><div class="tu-ico">🛡️</div><div class="tu-t">모니터링·회귀</div><div class="tu-s">품질 유지</div></div>
          <div class="tu-card pop" style="--d:.3s"><div class="tu-ico">🔄</div><div class="tu-t">기능 도입·진화</div><div class="tu-s">고객 요구 반영</div></div>
        </div>
        <div class="crm-pill glow">구현이 아니라 <b>운영·신뢰·표준화</b> — 그게 SaaS의 해자(垓字)</div>
      </div>`
  },

  /* 두 번째 이유 ②-A · 모델과 툴은 한 세트 */
  {
    html: `
      <h2><span class="dot"></span> 두 번째 이유 ① · 모델과 툴은 "한 세트"다</h2>
      <div class="sbody">
        <div class="set-eq">
          <div class="set-card"><div class="set-ico">🧠</div><div class="set-t">모델의 generation 방식</div></div>
          <div class="set-link">＋</div>
          <div class="set-card"><div class="set-ico">📝</div><div class="set-t">거기 맞춘 prompt·context·logic</div></div>
          <div class="set-link">＝</div>
          <div class="set-card win"><div class="set-ico">🚀</div><div class="set-t">혁명적 성능</div></div>
        </div>
        <div class="set-evidence">
          <div class="se-row good">✅ <img class="blogo" src="/avatars/claude.svg" alt=""><b>Claude × Claude Code</b> — 모델·툴이 한 몸이라 시너지가 폭발</div>
          <div class="se-row bad">⚠️ <b>Claude Code × <img class="blogo" src="/avatars/gemini.svg" alt="">Gemini / <img class="blogo" src="/avatars/openai.svg" alt="">GPT</b> — 모델은 좋지만 prompt·동작 방식이 어긋나 아쉽다</div>
          <div class="se-row">💡 Gemini가 아쉬운 건 모델이 나빠서가 아니라 — <b>툴의 범용성·고점</b>이 부족해서다</div>
        </div>
        <div class="punch-line">LLM은 확률 계산기다 — 아키텍처가 바뀌지 않는 한 <b>prompt에서 자유로울 수 없다</b></div>
      </div>`
  },

  /* 두 번째 이유 ②-B · 진짜 해자 = 경험과 노하우 */
  {
    html: `
      <h2><span class="dot"></span> 두 번째 이유 ② · 정확히는 "경험과 노하우"가 해자다</h2>
      <div class="sbody">
        <div class="market-split">
          <div class="mkt-card"><div class="mkt-h">모델을 잘 <u>만드는</u> 싸움</div><div class="mkt-logos"><img src="/avatars/openai.svg" alt="OpenAI"><img src="/avatars/gemini.svg" alt="Google"><img src="/avatars/claude.svg" alt="Anthropic"></div></div>
          <div class="mkt-vs">≠ 별개의 시장 ≠</div>
          <div class="mkt-card hot"><div class="mkt-h">모델을 잘 <u>쓰는</u> 싸움</div><div class="mkt-s">Cursor·Windsurf<br>고가 인수가 증명</div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">📉 <b>데이터 부족</b>은 언젠가 따라잡힌다 — 시간이 지나면 정복당할 가능성이 크다</div>
          <div class="dl hot">🏆 하지만 <b>어떤 시스템이 CRM에 가장 알맞은지</b>, 어떻게 설계해야 가장 <b>안정적</b>이고 사용자에게 <b>도움</b>이 되는지, <b>없으면 불편해지는 경험</b>을 어떻게 만드는지 — 이건 절대적 강점이다</div>
        </div>
        <div class="punch-line">그리고 그건 <b>Salesforce가 가장 잘하는 영역</b> — 30년간 쌓은 경험과 노하우다</div>
      </div>`
  },

  /* 두 번째 이유 ②-C · 모델과 툴은 한 세트 — Salesforce × Anthropic */
  {
    html: `
      <h2><span class="dot"></span> 그리고 — "모델과 툴은 한 세트다" 🤝</h2>
      <div class="sbody">
        <div class="punch-line"><img class="blogo" src="/avatars/salesforce.svg" alt="">Salesforce <b>×</b> <img class="blogo" src="/avatars/claude.svg" alt="">Anthropic 전략적 파트너십 <span class="mut">(Dreamforce 2025.10, 계속 확장 중)</span></div>
        <div class="debrief-list">
          <div class="dl"><img class="blogo" src="/avatars/claude.svg" alt=""><b>Claude가 Agentforce 360의 preferred 모델</b> — Salesforce 신뢰 경계(VPC) 안에서 동작, 금융·헬스케어·보안·생명과학 등 규제 산업 대응</div>
          <div class="dl"><img class="blogo" src="/avatars/claude.svg" alt=""><b>Claude ↔ Slack 양방향</b> — Slack MCP로 Claude가 채널·CRM·Tableau 맥락을 읽고, Slack 안에서 Claude 호출 (<b>Claude Tag</b>)</div>
          <div class="dl"><img class="blogo" src="/avatars/salesforce.svg" alt=""><b>Salesforce는 Claude Code를 전사 엔지니어링에 도입</b>, Anthropic은 내부 세일즈에 Slack+Claude 사용 — 서로의 제품을 쓴다</div>
        </div>
        <div class="punch-line hot">Claude 생태계가 커질수록 Salesforce 접근성이 쉬워지고 <b>종합 생산성이 함께 증대</b>되는 선순환</div>
      </div>`
  },

  /* 두 번째 이유 마무리 · 그래도 안심은 금물 — 살아남는 쪽의 조건 */
  {
    html: `
      <h2><span class="dot"></span> 그렇다고 — 안심하자는 이야기는 아니다 ⚠️</h2>
      <div class="sbody">
        <div class="punch-line">SaaS의 <b>논리</b>가 살아있다는 것이지, <b>아무것도 안 해도 살아남는다</b>는 뜻이 아니다</div>
        <div class="debrief-list">
          <div class="dl">🌫️ 지금은 <b>미래를 예측하기 굉장히 어려운</b> 지점에 서 있다</div>
          <div class="dl hot">💡 SaaS의 본질 = <b>비용(절감) 대비 생산성 증대</b> — 이 경험을 얼마나 크게 줄 수 있느냐가 <b>더욱 부각</b>되는 시점</div>
        </div>
        <div class="ask-compare">
          <div class="ac-col good"><div class="ac-tag">① 못 풀던 걸 푼다</div><div class="ac-note">컴퓨터만으로 해결 못 하던 일을 <b>AI로 어떻게 해결할 것인가</b><br><br><img class="blogo" src="/avatars/palantir.svg" alt=""><b>Palantir</b> — 전쟁의 판도를 바꾼 사례</div></div>
          <div class="ac-col good"><div class="ac-tag">② 하던 걸 더 싸게</div><div class="ac-note">기존 방식보다 <b>더 쉽고·빠르고·싸게</b> 어떻게 해줄 것인가<br><br><img class="blogo" src="/avatars/claude.svg" alt=""><b>Claude Code</b> — 개발비·시간을 삭제한 사례</div></div>
        </div>
        <div class="punch-line hot">이 두 질문에 <b>답을 가진 쪽</b>이 살아남는다</div>
        <div class="sub">다만 — 지금 <b>뭘 가지고 있는가</b>보다 <b>뭘 만들어 가는가</b>가 중요한 시점인 것은 분명하다</div>
      </div>`
  },

  /* 사례 갤러리 · AI를 등에 업고 폭발 성장한 회사들 */
  {
    html: `
      <h2><span class="dot"></span> AI를 등에 업고 폭발 성장한 회사들 — 특징이 자명하다 🚀</h2>
      <div class="sbody">
        <div class="case-grid">
          <div class="case hot"><div class="case-logo"><img src="/avatars/palantir.svg" alt=""></div><div class="case-body"><div class="case-name">Palantir <span class="mut">· 못 풀던 걸 푼다 ①</span></div><div class="case-desc"><b>전쟁·현실의 예측(prediction) 오차</b>를 압도적으로 줄임 — 기존 시스템으론 불가능했던 정밀도</div></div><div class="case-badge">전장 의사결정<br>재정의</div></div>
          <div class="case hot"><div class="case-logo"><img src="/avatars/tesla.svg" alt=""></div><div class="case-body"><div class="case-name">Tesla <span class="mut">· 못 풀던 걸 푼다 ①</span></div><div class="case-desc">카메라·<b>소프트웨어만으로 주행</b>을 현실화 — v12에서 규칙코드 30만 줄을 삭제하고 end-to-end 학습으로</div></div><div class="case-badge">FSD 누적<br>100억 마일</div></div>
          <div class="case hot"><div class="case-logo"><img src="/avatars/applovin.svg" alt=""></div><div class="case-body"><div class="case-name">AppLovin <span class="mut">· 못 풀던 걸 푼다 ①</span></div><div class="case-desc">AI 추천엔진으로 <b>더 치밀하고 정교한 광고 노출</b>을 현실화 — 사람이 못 짜던 타겟팅 정밀도</div></div><div class="case-badge">시총 $24B→<br>$123B (4년)</div></div>
          <div class="case buy"><div class="case-logo"><img src="/avatars/claude.svg" alt=""></div><div class="case-body"><div class="case-name">Claude Code <span class="mut">· 하던 걸 더 싸게 ②</span></div><div class="case-desc">기존에 하던 개발을 — <b>개발비와 개발 시간을 말 그대로 삭제</b>시킴</div></div><div class="case-badge">Dev 비용·시간<br>붕괴</div></div>
        </div>
      </div>`
  },

  /* 통찰 · 시장은 지금 ①에 쏠려 있다 → 초기 단계의 특징 */
  {
    html: `
      <h2><span class="dot"></span> 이렇게 보면 — 지금 시장의 무게중심이 보인다 🧭</h2>
      <div class="sbody">
        <div class="market-split">
          <div class="mkt-card hot"><div class="mkt-h">① 못 풀던 걸 푼다</div><div class="mkt-s">밸류에이션·매출이<br><b>여기 집중</b></div></div>
          <div class="mkt-vs">지금 →</div>
          <div class="mkt-card"><div class="mkt-h">② 하던 걸 더 싸게</div><div class="mkt-s">경제성 경쟁<br><b>이제 시작</b></div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">📈 밸류·매출이 <b>①에 쏠린 건 기술의 초기 단계</b>에서 벌어지는 일 — 새로 열린 시장이 먼저 폭발한다</div>
          <div class="dl">⚙️ 기술이 <b>숙련 단계</b>로 넘어갈수록 <b>경제성(②)</b>이 더 중요한 이슈가 된다 — AI는 아직 <b>발전 단계</b>에 머물러 있다</div>
          <div class="dl hot"><img class="blogo" src="/avatars/salesforce.svg" alt=""><b>Salesforce는 명백히 ② 영역에 포지셔닝</b> — 고객에게 주는 메시지도 그만큼 명확하다</div>
        </div>
        <div class="punch-line hot">다만 이건 <b>이제 막 전투가 시작되는 영역</b> — <b>어떤 가치를 만들어내느냐</b>에 따라 미래가 달라진다</div>
      </div>`
  },

  /* ═══════════════════════════════ HANDS-ON A divider (매출의 정의 — stage 함정) */
  {
    cls: 'slide-section hands-divider',
    html: `<div class="sec-wrap"><div class="sec-num lab">🧪</div><div class="sec-meta"><div class="sec-eyebrow hot">HANDS-ON A · 영업 실적 대시보드</div><h1>"누가 1등인가"</h1><p>AI에게 매출 대시보드를 시킨다 — 숫자는 거짓말을 하지 않는다, 정말?</p></div></div>`
  },

  /* A · 준비 */
  {
    html: `
      <h2><span class="dot"></span> 준비 · 모두 Claude Code를 켜주세요</h2>
      <div class="sbody">
        <div class="setup-steps">
          <div class="ss"><div class="ss-n">1</div><div class="ss-b"><b>실습 폴더 만들기</b><span>빈 폴더 하나 + 터미널에서 그 폴더로 이동</span></div></div>
          <div class="ss"><div class="ss-n">2</div><div class="ss-b"><b>Claude Code 실행</b><span>터미널에 <code>claude</code> 입력</span></div></div>
          <div class="ss"><div class="ss-n">3</div><div class="ss-b"><b>데이터는 API로 제공</b><span>다운로드 X — 아래 API를 그대로 끌어다 씁니다</span></div></div>
        </div>
        <div class="prompt-box"><div class="pb-head"><span class="pb-dot"></span> 우리가 제공하는 핸즈온 API</div><code>GET  /api/opportunities          전체 딜 60건 (JSON)
GET  /api/opportunities?stage=Closed Won
GET  /api/schema                  필드 설명</code></div>
        <div class="hint">💡 베이스 URL은 강사가 화면에 띄워드립니다 — 모두 같은 데이터를 봅니다</div>
      </div>`
  },

  /* A · 데이터 구조 */
  {
    html: `
      <h2><span class="dot"></span> API 응답 구조 · 필드 살펴보기</h2>
      <div class="sbody">
        <table class="data-table">
          <tr><th>필드</th><th>의미</th><th>예시</th></tr>
          <tr><td><code>owner_ae</code></td><td>딜을 담당한 영업(AE)</td><td>박영희</td></tr>
          <tr><td><code>account_name</code></td><td>고객사</td><td>Samsung Electronics</td></tr>
          <tr><td><code>stage</code></td><td>영업 단계</td><td><b>Closed Won</b> · Negotiation · Proposal</td></tr>
          <tr><td><code>arr</code></td><td>ARR (만원)</td><td>12,000</td></tr>
          <tr><td><code>product</code> · <code>close_date</code></td><td>제품 · 종료일</td><td>Sales Cloud · 2025-08-04</td></tr>
        </table>
        <div class="hint">💡 60건의 딜 — <code>stage</code>는 딜이 <b>어느 단계</b>인지를 말해줍니다</div>
      </div>`
  },

  /* A · ① 예시 프롬프트 */
  {
    html: `
      <h2><span class="step-tag">STEP 1</span> 이 프롬프트로 대시보드를 만들어 보세요</h2>
      <div class="sbody">
        <div class="prompt-box big"><div class="pb-head"><span class="pb-dot"></span> Claude Code 프롬프트 — 복사해서 붙여넣기</div><code>{BASE_URL}/api/opportunities 를 fetch 해서
AE(영업담당)별 매출 합계를 막대그래프로 보여주는
대시보드를 만들어줘. 단일 HTML(dashboard.html).
누가 매출 1등인지 한눈에 보이게.</code></div>
        <div class="expect"><b>"구현되었나요?"</b> · 네 — 에러 0, 화면 깔끔, 막대그래프 완성 ✅</div>
        <div class="assume">⌨️ 완성되면 — <b>누가 1등</b>으로 나오나요?</div>
      </div>`
  },

  /* A · ② 틀린 결과 */
  {
    html: `
      <h2><span class="dot"></span> ② 만들어진 대시보드 — 정수빈 1위 🏆</h2>
      <div class="sbody">
        <div class="rankflip single">
          <div class="rf-col">
            <div class="rf-head bad">AI가 만든 "매출" 랭킹 (에러 0)</div>
            <div class="rf-row top"><span class="rf-rank">1</span><span class="rf-name">정수빈</span><span class="rf-val">30억</span></div>
            <div class="rf-row"><span class="rf-rank">2</span><span class="rf-name">김철수</span><span class="rf-val">26억</span></div>
            <div class="rf-row"><span class="rf-rank">3</span><span class="rf-name">이민준</span><span class="rf-val">22억</span></div>
            <div class="rf-row"><span class="rf-rank">4</span><span class="rf-name">박영희</span><span class="rf-val">19억</span></div>
          </div>
        </div>
        <div class="trap-note">화면도 멀쩡, 에러도 없음. <b>정수빈이 매출 1등</b> — 이대로 경영 보고하면 될까요?</div>
      </div>`
  },

  /* A · ③ 제대로 된 결과 */
  {
    html: `
      <h2><span class="dot"></span> ③ 그런데 "확정 매출"만 보면… 🔄</h2>
      <div class="sbody">
        <div class="rankflip">
          <div class="rf-col">
            <div class="rf-head bad">AI가 만든 것 (전체 합산)</div>
            <div class="rf-row top"><span class="rf-rank">1</span><span class="rf-name">정수빈</span><span class="rf-val">30억</span></div>
            <div class="rf-row"><span class="rf-rank">2</span><span class="rf-name">김철수</span><span class="rf-val">26억</span></div>
            <div class="rf-row"><span class="rf-rank">4</span><span class="rf-name">박영희</span><span class="rf-val">19억</span></div>
          </div>
          <div class="rf-mid"><div class="rf-ar">→</div><div class="rf-cap">Closed Won만</div></div>
          <div class="rf-col">
            <div class="rf-head good">실제 확정 매출 — 진짜 실적</div>
            <div class="rf-row top up"><span class="rf-rank">1</span><span class="rf-name">박영희</span><span class="rf-val">18억</span><span class="rf-delta">▲3</span></div>
            <div class="rf-row up"><span class="rf-rank">2</span><span class="rf-name">한지우</span><span class="rf-val">12억</span><span class="rf-delta">▲4</span></div>
            <div class="rf-row down"><span class="rf-rank">6</span><span class="rf-name">정수빈</span><span class="rf-val">8억</span><span class="rf-delta">▼5</span></div>
          </div>
        </div>
        <div class="trap-note">1등 정수빈은 사실 <b>6등</b>. 진짜 1등은 <b>박영희</b>. 순위가 통째로 뒤집혔습니다.</div>
      </div>`
  },

  /* A · ④ 뭐가 문제였나 */
  {
    html: `
      <h2><span class="dot"></span> ④ 뭐가 문제였을까요?</h2>
      <div class="sbody">
        <div class="collide">
          <div class="basis b1 pop"><div class="b-ico">📊</div><div class="b-name">전체 파이프라인</div><div class="b-sub">제안+협상+완료 모두 합산</div></div>
          <div class="crash"><span>≠</span></div>
          <div class="basis b2 pop" style="--d:.2s"><div class="b-ico">💰</div><div class="b-name">확정 매출</div><div class="b-sub">Closed Won만 = 실제 돈</div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">AI는 "매출 합계"를 시킨 대로 <b>완벽히</b> 더했다 — 코드는 틀리지 않았다</div>
          <div class="dl">정수빈은 <b>아직 안 닫힌 가망 딜</b>이 많아 부풀려졌을 뿐 (실제 입금 X)</div>
          <div class="dl hot">"가망 딜도 매출로 칠 것인가"는 <b>비즈니스 정의</b> — AI는 알 수 없다</div>
        </div>
      </div>`
  },

  /* A · ⑤ 이렇게 요청했어야 */
  {
    html: `
      <h2><span class="dot"></span> ⑤ 사실 이렇게 요청했어야 합니다</h2>
      <div class="sbody">
        <div class="ask-compare">
          <div class="ac-col bad">
            <div class="ac-tag">❌ 우리가 준 프롬프트</div>
            <code>AE별 매출 합계를 보여줘</code>
            <div class="ac-note">'매출'의 정의를 AI에 맡김 → 가망 딜까지 전부 합산</div>
          </div>
          <div class="ac-col good">
            <div class="ac-tag">✅ 이렇게 명시했어야</div>
            <code>매출은 계약이 완료된 것<br>(stage = Closed Won)만 인정해.<br>진행 중인 딜은 빼고 집계해줘.</code>
            <div class="ac-note">판단 기준을 사람이 정의 → AI가 정확히 구현</div>
          </div>
        </div>
        <div class="punch-line">AI는 <b>구현</b>을 대신할 뿐, <b>"무엇이 매출인가"</b>는 사람이 정의해야 한다</div>
      </div>`
  },

  /* A · 착지 (CRM) */
  {
    html: `
      <h2><span class="dot"></span> 그래서 — 판단을 시스템화한 것이 CRM</h2>
      <div class="sbody">
        <div class="verdict">
          <div class="v-ai"><div class="v-ico">🤖</div><div class="v-can">구현은 한다</div></div>
          <div class="v-but">하지만</div>
          <div class="v-cant"><div class="v-ico">❓</div><div class="v-txt">"무엇이 매출인가"<br>정의는 못 한다</div></div>
        </div>
        <div class="final-arrow">↓</div>
        <div class="crm-pill glow">Stage · Forecast Category · Revenue Recognition<br>그 정의를 조직 전체에 일관 강제 = <b>Salesforce</b></div>
      </div>`
  },

  /* ═══════════════════════════════ HANDS-ON B divider (페이지네이션 — API 구조 함정) */
  {
    cls: 'slide-section hands-divider',
    html: `<div class="sec-wrap"><div class="sec-num lab">🧪</div><div class="sec-meta"><div class="sec-eyebrow hot">HANDS-ON B · 대용량 매출 대시보드</div><h1>"총 매출 43억"</h1><p>구현은 완벽하다 — 그런데 그 숫자, 정말 맞는 걸까?</p></div></div>`
  },

  /* B · 준비 */
  {
    html: `
      <h2><span class="dot"></span> 준비 · 새 데이터 API</h2>
      <div class="sbody">
        <div class="setup-steps">
          <div class="ss"><div class="ss-n">1</div><div class="ss-b"><b>새 빈 폴더</b><span>터미널에서 그 폴더로 이동 후 <code>claude</code></span></div></div>
          <div class="ss"><div class="ss-n">2</div><div class="ss-b"><b>매출 트랜잭션 데이터</b><span>거래 데이터를 제공하는 API</span></div></div>
        </div>
        <div class="prompt-box"><div class="pb-head"><span class="pb-dot"></span> 핸즈온 API</div><code>GET  /api/sales              거래 데이터 목록 (JSON)
GET  /api/sales?region=Seoul  region/channel/category/segment 필터
GET  /api/sales/schema        필드 설명</code></div>
        <div class="hint">💡 필드: region · channel · category · segment · amount · units · date</div>
      </div>`
  },

  /* B · ① 예시 프롬프트 */
  {
    html: `
      <h2><span class="step-tag">STEP 1</span> 이 프롬프트로 대시보드를 만들어 보세요</h2>
      <div class="sbody">
        <div class="prompt-box big"><div class="pb-head"><span class="pb-dot"></span> Claude Code 프롬프트 — 복사해서 붙여넣기</div><code>Salesforce Tableau 스타일의 매출 대시보드를 만들어줘.
단일 HTML(dashboard.html). 데이터: {BASE_URL}/api/sales
(스키마: {BASE_URL}/api/sales/schema)
- region·channel·category·segment 필터
- 전체 매출(amount) 합계·거래 건수 KPI를 보여줘.</code></div>
        <div class="expect"><b>"구현되었나요?"</b> · 네 — 에러 0, KPI 카드·차트·필터 전부 완성 ✅</div>
        <div class="assume">⌨️ <b>총 매출</b>이 얼마로 나오나요?</div>
      </div>`
  },

  /* B · ② 틀린 결과 */
  {
    html: `
      <h2><span class="dot"></span> ② 만들어진 대시보드 — 총 매출 43억 💳</h2>
      <div class="sbody">
        <div class="ba-row single">
          <div class="ba-card bad">
            <div class="ba-tag">AI가 만든 대시보드 (에러 0)</div>
            <div class="ba-clock">43<span>억</span></div>
            <div class="ba-sub">총 매출 · 거래 100건 · KPI/차트 완벽 동작</div>
          </div>
        </div>
        <div class="trap-note">화면 멀쩡, 에러 없음, 필터도 잘 됨. <b>총 매출 43억</b> — 이대로 보고하면 될까요?</div>
      </div>`
  },

  /* B · ③ 제대로 된 결과 */
  {
    html: `
      <h2><span class="dot"></span> ③ 그런데 데이터를 전부 세어보면… 😱</h2>
      <div class="sbody">
        <div class="ba-row">
          <div class="ba-card bad">
            <div class="ba-tag">AI 대시보드</div>
            <div class="ba-clock">43<span>억</span></div>
            <div class="ba-sub">거래 100건 집계</div>
            <div class="ba-bar"><i style="--w:1%"></i></div>
          </div>
          <div class="ba-ar">→</div>
          <div class="ba-card good">
            <div class="ba-tag">실제 전체 데이터</div>
            <div class="ba-clock">7,425<span>억</span></div>
            <div class="ba-sub">거래 15,000건 집계</div>
            <div class="ba-bar"><i style="--w:100%"></i></div>
          </div>
        </div>
        <div class="trap-note">실제의 <b>0.58%</b>만 집계돼 있었습니다 — <b>약 172배</b> 과소. 화면은 완벽한데 숫자는 완전히 틀렸습니다.</div>
      </div>`
  },

  /* B · ④ 뭐가 문제였나 */
  {
    html: `
      <h2><span class="dot"></span> ④-1 문제 ① — 사실 페이지네이션이 있었다 📄</h2>
      <div class="sbody">
        <div class="collide">
          <div class="basis b1 pop"><div class="b-ico">📄</div><div class="b-name">API가 준 것</div><div class="b-sub">첫 100건 (전부인 것처럼 보임)</div></div>
          <div class="crash"><span>≠</span></div>
          <div class="basis b2 pop" style="--d:.2s"><div class="b-ico">🗄️</div><div class="b-name">실제 데이터</div><div class="b-sub">15,000건 = 100건씩 150페이지</div></div>
        </div>
        <div class="debrief-list">
          <div class="dl">API는 조용히 <b>첫 100건만</b> 반환했다 — <code>total</code>도 <code>next</code>도 없어 "전부"처럼 보였다</div>
          <div class="dl hot"><b>다 가져오려면 150페이지를 전부 순회</b>해야 한다 — 모르는 데이터는 AI도 못 가져온다</div>
        </div>
      </div>`
  },

  /* B · ④-2 딜레이/캐싱 */
  {
    html: `
      <h2><span class="dot"></span> ④-2 문제 ② — 근데 왜 이렇게 느리죠? ⏳</h2>
      <div class="sbody">
        <div class="perf-row">
          <div class="perf-card slow">
            <div class="pf-ico">🐌</div>
            <div class="pf-t">페이지마다 지연</div>
            <div class="pf-clock">0.5<span>초</span></div>
            <div class="pf-d">150페이지 = 75초… 필터 누를 때마다 또!</div>
          </div>
          <div class="perf-plus">→</div>
          <div class="perf-card good">
            <div class="pf-ico">⚡</div>
            <div class="pf-t">한 번만 받고 캐시</div>
            <div class="pf-clock">0<span>초</span></div>
            <div class="pf-d">전부 순회는 1회 · 이후 필터는 즉시</div>
          </div>
        </div>
        <div class="debrief-list">
          <div class="dl">데이터가 많고 느린 API — <b>매 필터마다 다시 순회하면</b> 매번 수십 초 멈춘다</div>
          <div class="dl hot"><b>캐싱으로 해결</b>할 수 있지만 — "이 데이터는 고정이니 한 번만 받아라"를 <b>AI는 미리 알 수 없다</b></div>
        </div>
      </div>`
  },

  /* B · ⑤ 이렇게 요청했어야 */
  {
    html: `
      <h2><span class="dot"></span> ⑤ 사실 이렇게 했어야 합니다</h2>
      <div class="sbody">
        <div class="ask-compare">
          <div class="ac-col bad">
            <div class="ac-tag">❌ 우리가 준 프롬프트</div>
            <code>매출 대시보드를 만들어줘</code>
            <div class="ac-note">API 구조를 모른 채 시킴 → 0.58%만 집계 + 느림</div>
          </div>
          <div class="ac-col good">
            <div class="ac-tag">✅ 구조를 파악하고 지시했어야</div>
            <code>이 API는 100건씩 페이지네이션이야.<br>전부 순회해서 집계하고, 데이터는<br>고정이니 한 번만 받아 캐싱해줘.</code>
            <div class="ac-note">완전성(순회) + 성능(캐싱), 둘 다 사람이 알아야 지시할 수 있다</div>
          </div>
        </div>
        <div class="punch-line">AI는 <b>주어진 정보 안에서만</b> 완벽하다 — API 구조·시스템 설계는 <b>사람의 몫</b></div>
      </div>`
  },

  /* B · 착지 */
  {
    html: `
      <h2><span class="dot"></span> 그래서 — 완벽한 시스템은 "이해한 사람"이 만든다</h2>
      <div class="sbody">
        <div class="verdict">
          <div class="v-ai"><div class="v-ico">🤖</div><div class="v-can">주어진 것으로<br>완벽히 구현</div></div>
          <div class="v-but">하지만</div>
          <div class="v-cant"><div class="v-ico">🔍</div><div class="v-txt">"무엇이 전부인가"<br>정보 확보는 사람 몫</div></div>
        </div>
        <div class="final-arrow">↓</div>
        <div class="crm-pill glow">데이터 구조 · API 계약 · stakeholder 이해<br>충분히 파악한 사람만 <b>완전한 시스템</b>을 만든다</div>
      </div>`
  },

  /* ═══════════════════════════════ HANDS-ON C divider (API 미로 — 에이전트 만들기) */
  {
    cls: 'slide-section hands-divider',
    html: `<div class="sec-wrap"><div class="sec-num lab">🤖</div><div class="sec-meta"><div class="sec-eyebrow hot">HANDS-ON C · 에이전트 만들기</div><h1>API 미로를 푸는 에이전트</h1><p>두뇌는 Haiku 고정 — 똑똑한 모델이 아니라 "잘 설계한 에이전트"가 미로를 푼다</p></div></div>`
  },

  /* C · 과제 개요 */
  {
    html: `
      <h2><span class="dot"></span> 무엇을 하나요?</h2>
      <div class="sbody">
        <div class="maze-intro">
          <div class="mi-line"><span class="mi-ico">🤖</span><div>Claude Code로 <b>"미로를 스스로 푸는 에이전트"를 만듭니다.</b> 에이전트가 뭔지 — 직접 만들어보며 체험하는 과정입니다.</div></div>
          <div class="mi-line"><span class="mi-ico">🚪</span><div>API 미로가 열립니다. 에이전트가 <b>API를 자율 탐색</b>하며 관문을 순서대로 통과하면 <b>최종 FLAG</b>를 얻습니다.</div></div>
          <div class="mi-line"><span class="mi-ico">🧠</span><div>에이전트의 두뇌는 <b>Haiku로 고정</b>입니다. 똑똑한 모델이 대신 풀어주는 게 아니라 — <b>여러분이 설계한 에이전트의 실력</b>이 드러납니다.</div></div>
        </div>
        <div class="hint">💡 구현은 Claude Code가 돕지만, <b>"어떻게 푸는 에이전트를 만들지"</b> 설계는 여러분 몫입니다</div>
      </div>`
  },

  /* C · 복붙용 초기 프롬프트 (8개 조건 = 프롬프트 그 자체) */
  {
    cls: 'maze-prompt-slide',
    html: `
      <h2><span class="dot"></span> 이 프롬프트를 Claude Code에 그대로 붙여넣으세요 📋</h2>
      <div class="sbody">
        <div class="prompt-box big maze-prompt"><div class="pb-head"><span class="pb-dot"></span> 초기 명령어 — 복사해서 붙여넣기 <button id="copy-maze-prompt" class="copy-btn">📋 복사</button></div><code id="maze-prompt-text">🤖 Agent 개발 실습입니다. Agent를 어떻게 만드는지 체험하는 과정입니다.

1. tool call·입출력을 모두 볼 수 있는 챗봇형 frontend(웹 UI)가 있는 에이전트로 만들 것 (호출이 많아질 것을 대비해 스크롤 가능한 UI로 만들 것)
2. 자신의 Claude Code Bedrock 설정을 참고하여 LLM을 사용할 것
3. Claude Code의 직접 개입 없이, 순수하게 구현된 에이전트가 스스로 미로를 풀도록 구현할 것
4. 모든 문제는 API로 주어집니다. API를 자율 탐색·사용하도록 에이전트에 bash tool을 제공할 것
5. 에이전트가 쓰는 LLM 모델은 "claude-haiku-4-5-20251001" 로 고정할 것
6. 게이트웨이 호출법: ~/.claude/settings.json 의 env에서 ANTHROPIC_BEDROCK_BASE_URL·ANTHROPIC_AUTH_TOKEN·NODE_EXTRA_CA_CERTS 를 읽어, OpenAI 호환 형식(POST {ROOT}/v1/chat/completions, 헤더 Authorization: Bearer <토큰>, body {"model":"claude-haiku-4-5-20251001",...})으로 호출. (@anthropic-ai/sdk 기본 /v1/messages 는 안 됨)
7. 출발 API: POST {BASE_URL}/maze/start  (body: {"name":"(닉네임)"}) — 응답에 이후 API 목록·규칙이 들어있음
8. 구현 후 실행 가능한 상태로 만들고, 실행 및 미로 풀이 trigger는 사람에게 시킬 것</code></div>
        <div class="assume">⌨️ <code>(닉네임)</code> 은 자동으로 여러분 닉네임으로 채워집니다 · <code>{BASE_URL}</code> 도 실제 주소로 치환됩니다</div>
      </div>`
  },

  /* C · 실시간 리더보드 (app.js가 채움) */
  {
    cls: 'maze-board-slide',
    html: `
      <h2><span class="dot"></span> 🏁 실시간 리더보드 <span class="lb-live">LIVE</span></h2>
      <div class="sbody">
        <div id="maze-board" class="maze-board"><div class="mb-empty">아직 참가자가 없습니다 — 미로를 시작하면 여기에 실시간으로 나타납니다!</div></div>
      </div>`
  },

  /* C · 마무리 메시지 */
  {
    html: `
      <h2><span class="dot"></span> 방금 만든 것이 바로 "에이전트"입니다</h2>
      <div class="sbody">
        <div class="debrief-list">
          <div class="dl">한 번 묻고 끝이 아니라 — <b>관찰하고, 기억하고, 다음 행동을 정하는</b> 루프를 만들었습니다</div>
          <div class="dl">미로는 규칙을 다 알려주지 않았습니다 — <b>탐험하며 알아내는 것</b>이 에이전트의 일</div>
          <div class="dl hot">구현은 Claude가 했지만, <b>"어떻게 풀지" 설계</b>는 여러분이 했습니다 — 그게 실력입니다</div>
        </div>
        <div class="punch-line">바이브 코딩으로 구현이 쉬워질수록 — <b>무엇을·어떻게 만들지 아는 사람</b>이 더 강해집니다</div>
      </div>`
  },

  /* 클로징 */
  {
    cls: 'slide-title closing-slide',
    html: `
      <div class="title-wrap">
        <div class="kicker">THANK YOU</div>
        <h1 class="grad-title">감사합니다</h1>
        <p class="sub">AI는 <b>구현</b>을 — 사람은 <b>판단</b>을 — Salesforce는 <b>시스템</b>을</p>
        <div class="title-chips"><span>🧠 확률기계</span><span>🛠️ 모델 + 툴</span><span>🏢 운영의 해자</span></div>
        <button class="feedback-cta" id="feedback-open">📝 피드백 남기기</button>
      </div>`
  },
];
