// Hands-on dataset #2 — "real-time responsive dashboard" (the CACHING / architecture trap).
//
// THE TRAP (intentional): the dataset is LARGE (15,000 events) and the API is SLOW
// (artificial ~4.5s latency, optionally chunked/streamed). The data NEVER changes.
//
//   - No architecture knowledge → "real-time" is read as "keep polling" / "re-fetch on
//     every filter click". Result: a 4.5s spinner on every interaction. The opposite of
//     responsive — yet it runs with zero errors.
//   - With architecture knowledge → data is static, so "real-time responsive" means the
//     UI must feel instant: fetch ONCE, cache in memory, do all filtering/aggregation
//     client-side, never poll. First paint waits ~4.5s; everything after is instant.
//
// Only someone who understands caching / client-side state asks for the right thing.
// Deterministic (LCG) so the numbers are stable across restarts.

const REGIONS = ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'];
const CHANNELS = ['Web', 'Mobile', 'Partner', 'Direct', 'Marketplace'];
const CATEGORIES = ['Cloud', 'License', 'Support', 'Training', 'Hardware'];
const SEGMENTS = ['Enterprise', 'Mid-Market', 'SMB'];

let seed = 991117;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }

function build(n) {
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const month = 1 + Math.floor(rnd() * 12);
    const day = 1 + Math.floor(rnd() * 27);
    rows.push({
      txn_id: 'TXN-' + String(i).padStart(6, '0'),
      region: pick(REGIONS),
      channel: pick(CHANNELS),
      category: pick(CATEGORIES),
      segment: pick(SEGMENTS),
      amount: Math.floor(50 + rnd() * 9950), // 만원
      units: 1 + Math.floor(rnd() * 40),
      date: `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }
  return rows;
}

// 15,000 rows — big enough that re-fetching on every interaction is painfully slow.
const SALES = build(15000);

const SCHEMA2 = {
  description: '매출 트랜잭션(Sales) 데이터. 각 행은 하나의 거래. 데이터는 고정입니다.',
  fields: [
    { name: 'txn_id', type: 'string', desc: '거래 고유 ID' },
    { name: 'region', type: 'string', desc: '지역 (Seoul, Busan, …)' },
    { name: 'channel', type: 'string', desc: '판매 채널 (Web, Mobile, Partner, …)' },
    { name: 'category', type: 'string', desc: '제품 카테고리 (Cloud, License, …)' },
    { name: 'segment', type: 'string', desc: '고객 세그먼트 (Enterprise, Mid-Market, SMB)' },
    { name: 'amount', type: 'number', desc: '거래 금액, 단위: 만원' },
    { name: 'units', type: 'number', desc: '판매 수량' },
    { name: 'date', type: 'string', desc: '거래일 (YYYY-MM-DD)' },
  ],
  endpoints: [
    { method: 'GET', path: '/api/sales', desc: '거래 데이터 목록 (JSON 배열, 응답: {sales:[...]})' },
    { method: 'GET', path: '/api/sales?region=Seoul', desc: 'region 필터' },
    { method: 'GET', path: '/api/sales/schema', desc: '필드 설명' },
  ],
};

module.exports = { SALES, SCHEMA2 };
