// 拖移解題板引擎（純邏輯，沒有 DOM；瀏覽器與 node 測試共用）。老師與 Agent 都不要修改這個檔案。
// 內容包放在 packs/，每個檔案呼叫 SB.register(pack)。格式見 docs/pack-format.md。
//   拖的是解題過程不是答案、誘答卡對準誤解、三層提示、完成一步才得分、每一步留痕。
(function (root) {
  // ---------- 亂數與格式 ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, a) => a[Math.floor(rng() * a.length)];
  const nz = (rng, lo, hi) => { for (;;) { const v = rnd(rng, lo, hi); if (v) return v; } };
  function shuffle(rng, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

  const num = (n) => (n < 0 ? `−${-n}` : `${n}`);
  const sg = (n) => (n < 0 ? `−${-n}` : `+${n}`);
  const pn = (n) => (n < 0 ? `(−${-n})` : `${n}`);
  const op = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
  function term(c, v, signed) {
    if (!v) return signed ? sg(c) : num(c);
    const a = Math.abs(c);
    return (c < 0 ? '−' : signed ? '+' : '') + (a === 1 ? '' : a) + v;
  }
  function lin(parts) {
    let out = '';
    for (const [c, v] of parts) {
      if (!c) continue;
      const a = Math.abs(c);
      const t = v ? (a === 1 ? '' : a) + v : String(a);
      out += out ? ` ${c < 0 ? '−' : '+'} ${t}` : (c < 0 ? '−' : '') + t;
    }
    return out || '0';
  }
  const eqXY = (a, b, c) => `${lin([[a, 'x'], [b, 'y']])} = ${num(c)}`;
  const fracText = (n, d) => `${n * d < 0 ? '−' : ''}[frac:${Math.abs(n)}|${Math.abs(d)}]`;

  // ---------- 引擎 ----------
  function walk(line, visit) {
    for (const t of line || []) {
      if (t && typeof t === 'object' && t.frac) { walk(t.frac[0], visit); walk(t.frac[1], visit); }
      else visit(t);
    }
  }
  function slotIds(step) {
    const ids = [];
    walk(step.line, (t) => { if (t && typeof t === 'object' && t.slot) ids.push(t.slot); });
    return ids;
  }

  // spec.cards 可含 false（條件不成立的誘答），會被濾掉；引用不存在卡片的診斷規則也一併濾掉。
  // 回傳 null 表示卡片文字重複（呼叫端重新出題）。
  function buildStep(spec, rng) {
    const cards = spec.cards.filter(Boolean);
    const texts = cards.map((c) => c.text);
    if (new Set(texts).size !== texts.length) return null;
    const keys = new Set(cards.map((c) => c.key));
    const has = (k) => [].concat(k).every((x) => keys.has(x));
    const order = shuffle(rng, cards);
    const idOf = new Map(order.map((c, i) => [c.key, `c${i + 1}`]));
    const map = (k) => (Array.isArray(k) ? k.map(map) : idOf.get(k));
    const mapObj = (o) => Object.fromEntries(Object.entries(o).map(([s, k]) => [s, map(k)]));
    const diagnose = (spec.diagnose || []).filter(Boolean).filter((r) => Object.values(r.when).every(has));
    if (!spec.accept.every((a) => Object.values(a).every(has))) return null;
    return {
      key: spec.key, goal: spec.goal, scaffold: spec.scaffold || '', line: spec.line, hints: spec.hints, fallback: spec.fallback,
      cards: order.map(({ key, ...c }) => ({ id: idOf.get(key), ...c })),
      accept: spec.accept.map(mapObj),
      diagnose: diagnose.map((r) => ({ ...r, when: mapObj(r.when) })),
    };
  }

  function checkStep(step, pl) {
    const ids = slotIds(step);
    const missing = ids.filter((s) => !pl[s]);
    if (missing.length) return { ok: false, kind: 'incomplete', fb: '還有空格沒有放卡片。', wrong: missing };
    let best = null;
    for (const a of step.accept) {
      const w = ids.filter((s) => a[s] !== pl[s]);
      if (!best || w.length < best.length) best = w;
    }
    if (!best.length) return { ok: true, kind: 'ok', fb: '', wrong: [] };
    for (const r of step.diagnose) {
      if (Object.entries(r.when).every(([s, w]) => [].concat(w).includes(pl[s]))) {
        return { ok: false, kind: r.kind, fb: r.fb, wrong: r.slots || Object.keys(r.when) };
      }
    }
    return { ok: false, kind: 'other', fb: step.fallback || '對照上一行，再檢查紅框的格子。', wrong: best };
  }

  function revealHint(step, pl) {
    const a = step.accept[0];
    for (const s of slotIds(step)) if (pl[s] !== a[s]) return { slot: s, card: a[s] };
    return null;
  }

  const SCORING = { base: 10, hint: [0, 2, 4, 6], err: 1, errCap: 3, min: 3, clean: 5 };
  function stepScore(errors, hintLevel) {
    return Math.max(SCORING.min, SCORING.base - SCORING.hint[Math.min(hintLevel, 3)] - Math.min(errors * SCORING.err, SCORING.errCap));
  }

  function makeWith(name, tryMake) {
    return (rng = Math.random) => {
      for (let i = 0; i < 3000; i++) {
        const p = tryMake(rng);
        if (p && p.steps.every(Boolean)) return p;
      }
      throw new Error(`${name}：產生題目失敗`);
    };
  }

  // ---------- 共用步驟：x = n/d = r（整數解） ----------
  function divideStep(rng, { A, K, x, wrongCoef, label }) {
    return buildStep({
      key: 'divide',
      goal: '係數化為 1：兩邊同除以 x 的係數',
      line: ['x =', { frac: [[{ slot: 'n' }], [{ slot: 'd' }]] }, '=', { slot: 'r' }],
      cards: [
        { key: 'nK', text: num(K) },
        { key: 'dA', text: num(A) },
        wrongCoef !== undefined && wrongCoef !== A && { key: 'wa', text: num(wrongCoef), trap: 'divide_wrong_object' },
        { key: 'r', text: num(x) },
        { key: 'rn', text: num(-x), trap: 'sign_error' },
        Math.abs(x) > 1 && { key: 'ri', text: fracText(1, x), trap: 'frac_inverted' },
      ],
      accept: [{ n: 'nK', d: 'dA', r: 'r' }],
      diagnose: [
        { when: { n: 'dA', d: 'nK' }, kind: 'frac_inverted', fb: `${term(A, 'x')} = ${num(K)}，x ＝ 常數 ÷ 係數：${num(K)} 放分子、${num(A)} 放分母。` },
        { when: { d: 'wa' }, kind: 'divide_wrong_object', fb: `要除以合併後的係數 ${num(A)}，${label || '不是原本的係數'}。` },
        { when: { n: 'wa' }, kind: 'divide_wrong_object', fb: `分子是合併後的常數 ${num(K)}。` },
        { when: { r: 'rn' }, kind: 'sign_error', fb: `檢查正負號：${num(K)} ÷ ${pn(A)} 是${x > 0 ? '正' : '負'}數。` },
        { when: { r: 'ri' }, kind: 'frac_inverted', fb: '最後結果要等於左邊的分數，分子、分母不能對調。' },
      ],
      hints: ['兩邊同除以 x 的係數，x 的係數就變成 1。', `x ＝ ${num(K)} ÷ ${pn(A)}，分子放 ${num(K)}。`, `分母放 ${num(A)}，${num(K)} ÷ ${pn(A)} = ${num(x)}。`],
    }, rng);
  }

  // ---------- 內容包登記 ----------
  const PACKS = [];
  function register(pack) {
    for (const k of ['id', 'grade', 'title', 'unit', 'pitch', 'kinds', 'stepLabels', 'make']) {
      if (!pack[k]) throw new Error(`內容包缺少欄位 ${k}`);
    }
    if (!/^[a-z0-9-]{2,30}$/.test(pack.id)) throw new Error(`內容包 id 只能用小寫英文、數字、連字號：${pack.id}`);
    if (PACKS.some((p) => p.id === pack.id)) throw new Error(`內容包 id 重複：${pack.id}`);
    PACKS.push(pack);
  }

  // 內容包可用的工具
  const tools = { buildStep, makeWith, divideStep, rnd, pick, nz, shuffle, gcd, num, sg, pn, op, term, lin, eqXY, fracText };
  const api = { mulberry32, slotIds, checkStep, revealHint, stepScore, SCORING, PACKS, register, tools, walk };
  root.SB = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
