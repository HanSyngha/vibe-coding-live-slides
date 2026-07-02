// Hands-on dataset #1 — Sales pipeline (the "what counts as revenue" trap).
//
// THE TRAP (intentional, do not "fix"): each deal has a `stage`. Only `Closed Won`
// is realized revenue; `Negotiation` / `Proposal` are open pipeline (not money yet).
// If you naively ask an AI for "AE별 매출 합계" it sums EVERYTHING — pipeline + won —
// with no error. The flashy rep with a huge OPEN pipeline looks #1, while the quiet
// rep who actually CLOSES deals is buried mid-pack. Filtering to Closed Won flips the
// ranking — that reversal is the teaching moment.
//
// Data is deterministic (LCG seed) so numbers are stable across restarts.

const GROUPS = {
  Samsung: ['Samsung Electronics', 'Samsung SDS', 'Samsung C&T', 'Samsung Fire'],
  Hyundai: ['Hyundai Motor', 'Hyundai Card', 'Hyundai E&C', 'Hyundai Mobis'],
  LG: ['LG Electronics', 'LG Chem', 'LG CNS', 'LG U+'],
  SK: ['SK Hynix', 'SK Telecom', 'SK Innovation'],
};
const GROUP_OF = {};
for (const [g, accs] of Object.entries(GROUPS)) accs.forEach((a) => (GROUP_OF[a] = g));
const ALL_ACCOUNTS = Object.values(GROUPS).flat();
const PRODUCTS = ['Sales Cloud', 'Service Cloud', 'Data Cloud', 'Marketing Cloud', 'Platform', 'Agentforce'];

// Per-AE profile, targets in 만원. won = realized (Closed Won), open = pipeline.
// Engineered so the total-sum ranking and the Closed-Won ranking DISAGREE sharply:
//   by total :  정수빈 > 김철수 > 이민준 > 박영희 > 최준서 > 한지우 > 오세훈 > 윤다은
//   by won   :  박영희 > 한지우 > 윤다은 > 김철수 > 이민준 > 정수빈 > 최준서 > 오세훈
const PROFILES = [
  { ae: '정수빈', won: 80000, open: 220000 },  // flashy: #1 total → #6 won
  { ae: '김철수', won: 100000, open: 160000 },
  { ae: '이민준', won: 90000, open: 130000 },
  { ae: '박영희', won: 180000, open: 10000 },  // quiet closer: #4 total → #1 won
  { ae: '최준서', won: 70000, open: 110000 },
  { ae: '한지우', won: 120000, open: 40000 },
  { ae: '오세훈', won: 60000, open: 90000 },
  { ae: '윤다은', won: 110000, open: 10000 },  // last by total → #3 won
];

let seed = 20260618;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

// Split a target sum into n deal amounts (만원), each >= 1500, summing EXACTLY to target.
function splitInto(target, n) {
  const weights = Array.from({ length: n }, () => 0.5 + rnd());
  const wsum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => Math.max(1500, Math.round((w / wsum) * target)));
  const drift = target - raw.reduce((a, b) => a + b, 0);
  raw[0] += drift; // absorb rounding error in the first deal
  return raw;
}

function dateIn2025() {
  const m = 1 + Math.floor(rnd() * 12);
  const d = 1 + Math.floor(rnd() * 27);
  return `2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function buildOpportunities() {
  const rows = [];
  let id = 1;
  for (const p of PROFILES) {
    // realized deals (Closed Won)
    const wonAmts = splitInto(p.won, 3 + Math.floor(rnd() * 3)); // 3–5 deals
    for (const arr of wonAmts) rows.push(makeRow(id++, p.ae, 'Closed Won', arr));
    // open pipeline (Negotiation / Proposal)
    if (p.open >= 1500) {
      const openAmts = splitInto(p.open, 2 + Math.floor(rnd() * 4)); // 2–5 deals
      for (const arr of openAmts) rows.push(makeRow(id++, p.ae, rnd() < 0.5 ? 'Negotiation' : 'Proposal', arr));
    }
  }
  // shuffle deterministically so rows aren't grouped by AE
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  // renumber ids in display order
  rows.forEach((r, i) => (r.opportunity_id = 'OPP-' + String(i + 1).padStart(3, '0')));
  return rows;
}

function makeRow(id, ae, stage, arr) {
  const account = pick(ALL_ACCOUNTS);
  return {
    opportunity_id: 'OPP-' + String(id).padStart(3, '0'),
    owner_ae: ae,
    account_name: account,
    account_group: GROUP_OF[account],
    stage,
    arr,
    product: pick(PRODUCTS),
    close_date: dateIn2025(),
  };
}

const OPPORTUNITIES = buildOpportunities();

const SCHEMA = {
  description: '영업 기회(Opportunity) 데이터. 각 행은 하나의 딜.',
  fields: [
    { name: 'opportunity_id', type: 'string', desc: '딜 고유 ID' },
    { name: 'owner_ae', type: 'string', desc: '딜을 담당한 영업(AE) 이름' },
    { name: 'account_name', type: 'string', desc: '고객사명' },
    { name: 'account_group', type: 'string', desc: '고객사가 속한 그룹사' },
    { name: 'stage', type: 'string', desc: '영업 단계: Closed Won(계약완료) · Negotiation(협상중) · Proposal(제안중)' },
    { name: 'arr', type: 'number', desc: '연간반복매출 ARR, 단위: 만원' },
    { name: 'product', type: 'string', desc: '제품명' },
    { name: 'close_date', type: 'string', desc: '예상/실제 종료일 (YYYY-MM-DD)' },
  ],
  endpoints: [
    { method: 'GET', path: '/api/opportunities', desc: '전체 딜 목록 (JSON 배열)' },
    { method: 'GET', path: '/api/opportunities?group=Samsung', desc: 'account_group으로 필터' },
    { method: 'GET', path: '/api/opportunities?ae=박영희', desc: 'owner_ae로 필터' },
    { method: 'GET', path: '/api/opportunities?stage=Closed%20Won', desc: 'stage로 필터' },
    { method: 'GET', path: '/api/schema', desc: '필드 설명' },
  ],
};

module.exports = { OPPORTUNITIES, SCHEMA };
