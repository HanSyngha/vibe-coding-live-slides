// Live Slides — dependency-free Node server.
// SSE broadcast for real-time questions + reactions. In-memory state only.
// Designed for a single replica (forge EKS App, replicas: 1).

const http = require('http');
const fs = require('fs');
const path = require('path');
const { OPPORTUNITIES, SCHEMA } = require('./data');
const { SALES, SCHEMA2 } = require('./data2');
const maze = require('./maze');

// Hands-on B deliberately-slow endpoint latency (ms). Data is large (paginated, 100/page)
// AND slow. Two lessons: (1) must traverse all pages for completeness, (2) it's slow so
// you must fetch-once + cache, not re-fetch per filter. Kept short per-page so a full
// 150-page traversal (~75s) stays realistic in a live class.
const SALES_DELAY_MS = Number(process.env.SALES_DELAY_MS || 500);

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'public');
// Presenter key. Override in deployment via env PRESENT_KEY.
const PRESENT_KEY = process.env.PRESENT_KEY || 'change-me';

// ---- In-memory state -------------------------------------------------------
const state = {
  slide: 0,                 // current slide index (driven by presenter)
  questions: [],            // { id, text, ts, votes }
  reactions: { up: 0, confused: 0 }, // cumulative counts
  feedback: [],             // { q1, q2, q3 (1-5), text, ts }
};
let nextQuestionId = 1;
let nextFeedbackId = 1;

// ---- SSE client registry ---------------------------------------------------
// Map: http.ServerResponse -> { name, presenter } so we can show who's connected.
const clients = new Map();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients.keys()) {
    res.write(payload);
  }
}

// Live presence: audience only (presenters excluded from count AND list). Each entry
// carries the avatar slug so the list can show a logo. count = live audience connections.
let presenceTimer = null;
function presenceData() {
  const list = [];
  for (const info of clients.values()) {
    if (!info.presenter) list.push({ name: info.name || '익명', avatar: info.avatar || '' });
  }
  return { count: list.length, names: list };
}
function broadcastPresence() {
  if (presenceTimer) return;
  presenceTimer = setTimeout(() => {
    presenceTimer = null;
    broadcast('presence', presenceData());
  }, 200);
}

// Throttled maze leaderboard broadcast (many agents hammer the API concurrently).
let mazeTimer = null;
function broadcastMaze() {
  if (mazeTimer) return;
  mazeTimer = setTimeout(() => {
    mazeTimer = null;
    broadcast('maze', { leaderboard: maze.leaderboard() });
  }, 300);
}

// ---- Helpers ---------------------------------------------------------------
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    // CORS open: hands-on dashboards built by Claude Code fetch this from file:// or other origins
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  });
  res.end(body);
}

// Presenter auth: key may arrive via ?key= query or x-present-key header.
function isPresenter(req) {
  const q = new URL(req.url, 'http://x').searchParams.get('key');
  return q === PRESENT_KEY || req.headers['x-present-key'] === PRESENT_KEY;
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy(); // basic flood guard
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

// Build the /source HTML page: embeds every project file as base64 and rebuilds a .zip
// in the browser (store-only, no deps). text/html so proxies don't block it.
function sendSourcePage(res) {
  const files = [
    'server.js', 'data.js', 'data2.js', 'maze.js', 'README.md', 'Dockerfile',
    'public/index.html', 'public/app.js', 'public/slides.js', 'public/styles.css',
  ];
  // include avatar svgs
  try {
    for (const f of fs.readdirSync(path.join(__dirname, 'public', 'avatars'))) {
      if (f.endsWith('.svg')) files.push('public/avatars/' + f);
    }
  } catch {}
  const bundle = [];
  for (const rel of files) {
    try {
      const b = fs.readFileSync(path.join(__dirname, rel));
      bundle.push({ name: 'live-slides/' + rel, b64: b.toString('base64') });
    } catch {}
  }
  const data = JSON.stringify(bundle);
  const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>소스 다운로드 · 바이브 코딩 Live Slides</title>
<style>
  body{font-family:-apple-system,'Pretendard',sans-serif;background:#f4f6fb;color:#14181f;margin:0;padding:48px 20px;line-height:1.6}
  .wrap{max-width:720px;margin:0 auto;background:#fff;border-radius:20px;padding:40px;box-shadow:0 10px 40px rgba(20,24,31,.08)}
  h1{font-size:26px;margin:0 0 6px}.sub{color:#5b6472;margin:0 0 28px}
  button{font-size:17px;font-weight:800;color:#fff;background:#3d4eff;border:0;border-radius:12px;padding:15px 28px;cursor:pointer;transition:.15s}
  button:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(61,78,255,.3)}
  button:disabled{opacity:.5;cursor:default;transform:none;box-shadow:none}
  code{background:#eef1f8;padding:2px 7px;border-radius:6px;font-size:14px}
  pre{background:#0f1320;color:#e6e9f2;padding:18px 20px;border-radius:12px;overflow:auto;font-size:13.5px}
  .files{margin:22px 0;font-size:14px;color:#5b6472}.files b{color:#14181f}
  .ok{color:#00a37a;font-weight:700}
</style></head><body>
<div class="wrap">
  <h1>📦 전체 소스 다운로드</h1>
  <p class="sub">이 강의 덱(실시간 슬라이드 + 핸즈온 API + 미로)의 <b>전체 소스</b>입니다. 받아서 로컬에서 그대로 실행할 수 있어요.</p>
  <button id="dl">⬇️ vibe-coding-live-slides.zip 받기</button>
  <p class="files" id="status"><b id="cnt">0</b>개 파일 준비됨</p>
  <h3>받은 뒤 실행</h3>
  <pre>unzip vibe-coding-live-slides.zip
cd live-slides
node server.js          # → http://localhost:8080

# 강사 화면:  http://localhost:8080/present   (키 기본값 change-me)
# 청중 화면:  http://localhost:8080/</pre>
  <p class="files">의존성 설치 불필요 — 순수 Node.js(http)만 있으면 됩니다.</p>
</div>
<script>
const FILES = ${data};
document.getElementById('cnt').textContent = FILES.length;
// --- minimal store-only ZIP writer (no compression, no deps) ---
function crc32(buf){let c,t=crc32.t;if(!t){t=crc32.t=[];for(let n=0;n<256;n++){c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}}c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=t[(c^buf[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function b64ToBytes(b64){const bin=atob(b64);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
function u16(n){return [n&0xFF,(n>>8)&0xFF];}
function u32(n){return [n&0xFF,(n>>8)&0xFF,(n>>16)&0xFF,(n>>24)&0xFF];}
function strBytes(s){return Array.from(new TextEncoder().encode(s));}
function buildZip(files){
  let parts=[],central=[],offset=0;
  for(const f of files){
    const nameB=strBytes(f.name), data=b64ToBytes(f.b64), crc=crc32(data);
    const local=[].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameB.length),u16(0),nameB);
    parts.push(new Uint8Array(local)); parts.push(data);
    central.push([].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameB));
    offset+=local.length+data.length;
  }
  const cd=[]; for(const c of central)cd.push(...c);
  const cdBytes=new Uint8Array(cd);
  const end=new Uint8Array([].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(cdBytes.length),u32(offset),u16(0)));
  const total=parts.reduce((a,p)=>a+p.length,0)+cdBytes.length+end.length;
  const out=new Uint8Array(total); let o=0;
  for(const p of parts){out.set(p,o);o+=p.length;} out.set(cdBytes,o);o+=cdBytes.length; out.set(end,o);
  return out;
}
document.getElementById('dl').addEventListener('click',()=>{
  const btn=document.getElementById('dl'); btn.disabled=true; btn.textContent='만드는 중…';
  try{
    const zip=buildZip(FILES);
    const blob=new Blob([zip],{type:'application/zip'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='vibe-coding-live-slides.zip'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    btn.textContent='✅ 다운로드 완료 — 다시 받기'; btn.disabled=false;
  }catch(e){ btn.textContent='⚠️ 오류: '+e.message; btn.disabled=false; }
});
</script></body></html>`;
  const body = Buffer.from(html);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-cache',
  });
  res.end(body);
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, content) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

// ---- Server ----------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // Health check for forge EKS App
  if (url === '/health') return sendJson(res, 200, { ok: true });

  // ---- Hands-on API (dummy sales data) -------------------------------------
  if (url === '/api/schema') return sendJson(res, 200, SCHEMA);

  if (url === '/api/opportunities') {
    const q = new URL(req.url, 'http://x').searchParams;
    let rows = OPPORTUNITIES;
    const group = q.get('group');
    const ae = q.get('ae');
    const stage = q.get('stage');
    if (group) rows = rows.filter((r) => r.account_group.toLowerCase() === group.toLowerCase());
    if (ae) rows = rows.filter((r) => r.owner_ae === ae);
    if (stage) rows = rows.filter((r) => r.stage.toLowerCase() === stage.toLowerCase());
    return sendJson(res, 200, { count: rows.length, opportunities: rows });
  }

  // ---- Hands-on #2 API (large sales dataset, deliberately slow) ------------
  if (url === '/api/sales/schema') return sendJson(res, 200, SCHEMA2);

  if (url === '/api/sales') {
    const q = new URL(req.url, 'http://x').searchParams;
    let rows = SALES;
    const region = q.get('region');
    const channel = q.get('channel');
    const category = q.get('category');
    const segment = q.get('segment');
    if (region) rows = rows.filter((r) => r.region.toLowerCase() === region.toLowerCase());
    if (channel) rows = rows.filter((r) => r.channel.toLowerCase() === channel.toLowerCase());
    if (category) rows = rows.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    if (segment) rows = rows.filter((r) => r.segment.toLowerCase() === segment.toLowerCase());

    // THE TRAP: the response silently returns only the first 100 rows and gives NO signal
    // that more exist — no next_cursor, no total, no page_size. It looks like the complete
    // dataset. Any agent (even Opus) reports it as "total sales" → silently aggregates
    // ~0.67% of 15,000. You cannot fetch what you don't know exists.
    //   "구현되었나요?" → 네 (화면 멀쩡, 에러 0).  "근데 이게 맞나요?" → 100건만 봤음.
    // LESSON: AI는 주어진 정보 안에서만 완벽하다. API 구조(전체 건수·페이지네이션 규칙)를
    // 모르면 AI도 한계가 있다. 데이터 제공자/stakeholder와 충분히 정보를 파악한 사람만이
    // 올바른 시스템을 만든다. (전체는 ?all=true / ?limit= 으로 받을 수 있으나 API가 광고하지 않음)
    if (q.get('all') === 'true') {
      setTimeout(() => sendJson(res, 200, { sales: rows, count: rows.length }), SALES_DELAY_MS);
      return;
    }
    const limit = q.get('limit') ? Math.max(1, parseInt(q.get('limit'), 10) || 100) : 100;
    // support both offset= and page= (1-based) pagination — whichever the agent tries.
    let offset = Math.max(0, parseInt(q.get('offset') || '0', 10) || 0);
    if (q.get('page')) offset = Math.max(0, (parseInt(q.get('page'), 10) - 1)) * limit;
    const page = rows.slice(offset, offset + limit);
    // deliberately bare: no total, no next_cursor — indistinguishable from a full list.
    // But an explicit offset/page beyond the data returns [] so a loop terminates correctly.
    setTimeout(() => sendJson(res, 200, { sales: page }), SALES_DELAY_MS);
    return;
  }

  // ---- Hands-on #2b: API Maze (build an agent) -----------------------------
  // All endpoints CORS-open (participant agents call from their own machines).
  if (url === '/maze/start' && req.method === 'POST') {
    const body = await readBody(req);
    const name = (body.name || '').toString().trim().slice(0, 24) || '익명';
    const sess = maze.newSession(name);
    broadcastMaze();
    return sendJson(res, 200, {
      session_id: sess.id, name: sess.name,
      message: '미로에 입장했습니다. 관문 1→5를 순서대로 통과하면 최종 FLAG를 얻습니다. 각 관문 응답의 note/message를 읽고 규칙을 스스로 파악하세요.',
      total_gates: 5,
      api: [
        'POST /maze/gate1        {session_id}                      → 단어 조각 1개(랜덤 순서)',
        'POST /maze/gate1/answer {session_id, sentence}            → 조각을 index순으로 조합해 제출',
        'POST /maze/gate2/move   {session_id, gate2_token, dir}    → 격자 한 칸 이동(N/S/E/W)',
        'POST /maze/gate3        {session_id, gate3_token, proof}    → 조건부 조각 수집',
        'POST /maze/gate4        {session_id, gate4_token, answer}  → 보안 관문(challenge에 answer로 응답)',
        'POST /maze/gate5        {session_id, gate5_token, at}     → 복구 관문(글리치 재시도)',
        'POST /maze/submit       {session_id, flag}                → 최종 제출',
      ],
      first_step: 'POST /maze/gate1 부터 시작하세요.',
    });
  }

  if (url === '/maze/gate1' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate1Next(sess);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/gate1/answer' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate1Answer(sess, body.sentence);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/gate2/move' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate2Move(sess, body.dir, body.gate2_token);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/gate3' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate3Next(sess, body.gate3_token, body.proof);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/gate4' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate4Next(sess, body.gate4_token, body);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/gate5' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    maze.touch(sess);
    const r = maze.gate5Advance(sess, body.gate5_token, body.at);
    broadcastMaze();
    return sendJson(res, 200, r);
  }
  if (url === '/maze/submit' && req.method === 'POST') {
    const body = await readBody(req);
    const sess = maze.getSession(body.session_id);
    if (!sess) return sendJson(res, 404, { error: 'unknown session_id' });
    if (sess.gate >= 4 && body.flag === sess.flag) {
      broadcastMaze();
      return sendJson(res, 200, { ok: true, message: '🎉 정답! 리더보드에 등록되었습니다.', name: sess.name, solvedAt: sess.solvedAt });
    }
    return sendJson(res, 200, { ok: false, message: 'FLAG가 일치하지 않거나 아직 모든 관문을 통과하지 않았습니다.' });
  }
  if (url === '/maze/leaderboard') {
    return sendJson(res, 200, { leaderboard: maze.leaderboard() });
  }

  // SSE stream
  if (url === '/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // hint proxies not to buffer
    });
    res.write('retry: 3000\n\n');
    // identify this connection (nickname + avatar + presenter flag) from the query string
    const qp = new URL(req.url, 'http://x').searchParams;
    const info = {
      name: (qp.get('name') || '').toString().trim().slice(0, 24) || '익명',
      avatar: (qp.get('avatar') || '').toString().trim().slice(0, 20),
      presenter: qp.get('presenter') === '1',
    };
    // send current snapshot immediately
    res.write(`event: snapshot\ndata: ${JSON.stringify(state)}\n\n`);
    res.write(`event: maze\ndata: ${JSON.stringify({ leaderboard: maze.leaderboard() })}\n\n`);
    clients.set(res, info);
    res.write(`event: presence\ndata: ${JSON.stringify(presenceData())}\n\n`);
    broadcastPresence(); // update live presence for everyone

    const drop = () => { if (clients.has(res)) { clients.delete(res); clearInterval(hb); broadcastPresence(); } };
    // heartbeat also detects dead connections: a failed write → drop the zombie so the
    // live count doesn't keep counting closed tabs (esp. behind the ALB).
    const hb = setInterval(() => {
      try { res.write(': ping\n\n'); } catch (e) { drop(); }
    }, 15000);
    req.on('close', drop);
    res.on('error', drop);
    return;
  }

  // Submit feedback (audience) — 3 star ratings (1-5) + free text + nickname
  if (url === '/feedback' && req.method === 'POST') {
    const body = await readBody(req);
    const clamp = (v) => { const n = Math.round(Number(v)); return n >= 1 && n <= 5 ? n : 0; };
    const fb = {
      id: nextFeedbackId++,
      name: (body.name || '').toString().trim().slice(0, 24) || '익명',
      q1: clamp(body.q1), q2: clamp(body.q2), q3: clamp(body.q3),
      text: (body.text || '').toString().trim().slice(0, 500),
      ts: Date.now(),
    };
    state.feedback.push(fb);
    return sendJson(res, 201, { ok: true });
  }

  // Feedback summary (presenter) — averages + overall + per-submission list
  if (url === '/feedback/summary') {
    if (!isPresenter(req)) return sendJson(res, 403, { error: 'forbidden' });
    const fbs = state.feedback;
    const avg = (k) => { const xs = fbs.map((f) => f[k]).filter((n) => n >= 1); return xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length) : 0; };
    const a1 = avg('q1'), a2 = avg('q2'), a3 = avg('q3');
    const nonzero = [a1, a2, a3].filter((v) => v > 0);
    const overall = nonzero.length ? nonzero.reduce((a, b) => a + b, 0) / nonzero.length : 0;
    return sendJson(res, 200, {
      count: fbs.length,
      avg: { q1: a1, q2: a2, q3: a3 },
      overall,
      items: fbs.slice().reverse().map((f) => ({ id: f.id, name: f.name, q1: f.q1, q2: f.q2, q3: f.q3, text: f.text, ts: f.ts })),
    });
  }

  // Clear all feedback (presenter)
  if (url === '/feedback/clear' && req.method === 'POST') {
    if (!isPresenter(req)) return sendJson(res, 403, { error: 'forbidden' });
    state.feedback = [];
    return sendJson(res, 200, { ok: true });
  }

  // Post a question
  if (url === '/questions' && req.method === 'POST') {
    const body = await readBody(req);
    const text = (body.text || '').toString().trim().slice(0, 280);
    if (!text) return sendJson(res, 400, { error: 'empty' });
    const name = (body.name || '').toString().trim().slice(0, 24) || '익명';
    const q = { id: nextQuestionId++, text, name, ts: Date.now(), votes: 0 };
    state.questions.push(q);
    broadcast('question', q);
    return sendJson(res, 201, q);
  }

  // Upvote a question
  if (url === '/questions/vote' && req.method === 'POST') {
    const body = await readBody(req);
    const q = state.questions.find((x) => x.id === Number(body.id));
    if (!q) return sendJson(res, 404, { error: 'not found' });
    q.votes++;
    broadcast('vote', { id: q.id, votes: q.votes });
    return sendJson(res, 200, { id: q.id, votes: q.votes });
  }

  // React (👍 / 🤔)
  if (url === '/react' && req.method === 'POST') {
    const body = await readBody(req);
    const kind = body.kind === 'confused' ? 'confused' : 'up';
    state.reactions[kind]++;
    broadcast('react', { kind, count: state.reactions[kind], total: state.reactions });
    return sendJson(res, 200, state.reactions);
  }

  // Presenter: change slide (key-guarded)
  if (url === '/slide' && req.method === 'POST') {
    if (!isPresenter(req)) return sendJson(res, 403, { error: 'forbidden' });
    const body = await readBody(req);
    state.slide = Math.max(0, Number(body.slide) || 0);
    broadcast('slide', { slide: state.slide });
    return sendJson(res, 200, { slide: state.slide });
  }

  // Presenter entry via clean path: /present or /present/<key>. Serves the shell;
  // the client reads the key from the path (see app.js). Keeps ?present=<key> working too.
  if (url === '/present' || url.startsWith('/present/')) {
    return serveStatic({ ...req, url: '/index.html' }, res);
  }

  // Hidden endpoint: view/download the full project source. Served as an HTML page
  // (text/html — passes corporate proxies that block binary/attachment downloads), which
  // embeds every source file as base64 and reconstructs a .zip *in the browser* via a
  // blob: download. A blob download is generated client-side and never crosses the proxy,
  // so it can't be intercepted the way a server-sent .tar.gz was (proxy returned a 503
  // login page for application/gzip attachments). Built live from disk = always current.
  // Not linked anywhere — share the URL directly. No secrets live in this dir.
  if (url === '/source' || url === '/source.tar.gz') {
    return sendSourcePage(res);
  }

  // Presenter: clear questions (key-guarded)
  if (url === '/admin/clear' && req.method === 'POST') {
    if (!isPresenter(req)) return sendJson(res, 403, { error: 'forbidden' });
    state.questions = [];
    broadcast('clear', {});
    return sendJson(res, 200, { ok: true });
  }

  return serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Live Slides running on :${PORT}`);
});
