// 自動驗算（瀏覽器 test.html 與 node test/run.mjs 共用）
// 原則：不用內容包自己的算法，而是把「正解卡放進算式行」後的整行文字，用獨立的求值器代回答案檢查。
(function (root) {
  // ---------- 獨立求值器：+ − × ÷ 括號、隱含乘法、x y、次方（^、²、³）、分數 (a)/(b) ----------
  function evaluate(src, env) {
    const s = src.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3');
    const toks = s.match(/\d+(?:\.\d+)?|[xy]|[-+*/()^]/g) || [];
    let i = 0;
    const peek = () => toks[i];
    const next = () => toks[i++];
    function expr() {
      let v = term();
      while (peek() === '+' || peek() === '-') { const o = next(); const r = term(); v = o === '+' ? v + r : v - r; }
      return v;
    }
    function term() {
      let v = unary();
      for (;;) {
        const t = peek();
        if (t === '*' || t === '/') { next(); const r = unary(); v = t === '*' ? v * r : v / r; }
        else if (t !== undefined && (/^[\d.]+$|^[xy]$/.test(t) || t === '(')) v *= power();
        else return v;
      }
    }
    function unary() {
      if (peek() === '-') { next(); return -unary(); }
      if (peek() === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      const b = atom();
      if (peek() === '^') { next(); return Math.pow(b, unary()); }
      return b;
    }
    function atom() {
      const t = next();
      if (t === '(') { const v = expr(); if (next() !== ')') throw new Error('括號不成對'); return v; }
      if (t === 'x' || t === 'y') return env[t];
      if (t !== undefined && /^[\d.]+$/.test(t)) return +t;
      throw new Error(`看不懂的符號「${t}」`);
    }
    const v = expr();
    if (i !== toks.length) throw new Error('算式結尾有多餘的符號');
    return v;
  }

  // 把一個步驟的算式行，依放卡方式組成純文字
  function lineText(step, pl) {
    const card = (id) => (step.cards.find((c) => c.id === id) || {}).text || '';
    const tok = (t) => {
      if (typeof t === 'string') return t;
      if (t.slot) return card(pl[t.slot]);
      if (t.frac) return `(${t.frac[0].map(tok).join(' ')})/(${t.frac[1].map(tok).join(' ')})`;
      if (t.br) return '　';
      return '';
    };
    return step.line.map(tok).join(' ').replace(/\[frac:(\d+)\|(\d+)\]/g, '($1/$2)');
  }

  // 找出可以求值的等式片段（中文說明、編號會被略過）
  const MATH = /^[0-9xy+\-−×÷()\s=./^²³]+$/;
  function segments(text) {
    const out = [];
    for (let seg of text.split(/[，　：；]|得|答/)) {
      seg = seg.replace(/^[\s①②③④′]+/, '').replace(/^設.*/, '').trim();
      if (seg.includes('=') && MATH.test(seg)) out.push(seg);
    }
    return out;
  }
  // 回傳 true／false（等式鏈是否成立），或 null（沒有可求值的片段）
  function holds(text, envs) {
    const segs = segments(text);
    if (!segs.length) return null;
    for (const env of envs) {
      for (const seg of segs) {
        const parts = seg.split('=').map((p) => evaluate(p, env));
        if (parts.some((p) => !Number.isFinite(p) || Math.abs(p - parts[0]) > 1e-9)) return false;
      }
    }
    return true;
  }
  // 方程式：代入答案；恆等式（answer.identity）：代入幾組不同的數
  function envsFor(p) {
    if (p.answer && p.answer.identity) return [{ x: 2, y: 3 }, { x: -3, y: 5 }, { x: 7, y: -2 }];
    return [{ x: p.answer.x, y: p.answer.y ?? 0 }];
  }

  function verifyPack(SB, pack, { n = 300 } = {}) {
    const errors = [];
    const err = (m) => { if (errors.length < 20) errors.push(m); };
    const triggered = new Set();
    let problems = 0, steps = 0, evalLines = 0;
    for (let seed = 1; seed <= n; seed++) {
      let p;
      try { p = pack.make(SB.mulberry32(seed)); } catch (e) { err(`第 ${seed} 題產生失敗：${e.message}`); continue; }
      problems++;
      const where = `第 ${seed} 題`;
      if (!p || !Array.isArray(p.steps) || !p.steps.length) { err(`${where}：沒有步驟`); continue; }
      if (!Array.isArray(p.stem) || !p.answer || !p.answerText) { err(`${where}：缺少 stem／answer／answerText`); continue; }
      const envs = envsFor(p);
      let problemEval = 0;
      try {
        for (const st of p.stem) if (holds(st, envs) === false) err(`${where}：題目 ${st} 代入答案不成立`);
      } catch (e) { err(`${where}：題目無法求值（${e.message}）`); }
      p.steps.forEach((s, si) => {
        steps++;
        const at = `${where}第 ${si + 1} 步（${s.key}）`;
        const slots = SB.slotIds(s);
        if (slots.length < 1 || slots.length > 3) err(`${at}：空格要 1～3 個，現在 ${slots.length} 個`);
        if (new Set(slots).size !== slots.length) err(`${at}：空格代號重複`);
        if (new Set(s.cards.map((c) => c.text)).size !== s.cards.length) err(`${at}：卡片文字重複`);
        if (s.cards.length < slots.length + 1) err(`${at}：卡片至少要比空格多 1 張`);
        if (!Array.isArray(s.hints) || s.hints.length !== 3) err(`${at}：提示必須剛好三層`);
        if (!s.goal) err(`${at}：缺少 goal`);
        if (!pack.stepLabels[s.key]) err(`${at}：stepLabels 沒有 ${s.key}`);
        if (!s.accept.length) err(`${at}：沒有 accept`);
        for (const a of s.accept) {
          if (!SB.checkStep(s, a).ok) err(`${at}：accept 本身不成立`);
          for (const id of Object.values(a)) if ((s.cards.find((c) => c.id === id) || {}).trap) err(`${at}：誘答卡出現在 accept`);
          try {
            const h = holds(lineText(s, a), envs);
            if (h === false) err(`${at}：正解代入答案不成立 → ${lineText(s, a)}`);
            if (h !== null) { evalLines++; problemEval++; }
          } catch (e) { err(`${at}：算式行無法求值（${e.message}）→ ${lineText(s, a)}`); }
        }
        for (const r of s.diagnose) {
          const pl = { ...s.accept[0] };
          for (const [k, w] of Object.entries(r.when)) pl[k] = [].concat(w)[0];
          const res = SB.checkStep(s, pl);
          if (res.ok) err(`${at}：診斷規則 ${r.kind} 的放法竟然被接受`);
          else if (res.kind !== r.kind) err(`${at}：診斷規則 ${r.kind} 被前面的規則 ${res.kind} 搶走`);
          if (!pack.kinds[r.kind]) err(`${at}：誤解代碼 ${r.kind} 沒有寫在 kinds`);
          if (!r.fb) err(`${at}：診斷規則 ${r.kind} 沒有回饋句`);
          triggered.add(r.kind);
        }
        for (const c of s.cards.filter((x) => x.trap)) {
          if (!pack.kinds[c.trap]) err(`${at}：誘答卡 ${c.text} 的代碼 ${c.trap} 沒有寫在 kinds`);
          const has = s.diagnose.some((r) => r.kind === c.trap && Object.values(r.when).some((w) => [].concat(w).includes(c.id)));
          if (!has) err(`${at}：誘答卡 ${c.text}（${c.trap}）沒有對應的診斷規則`);
        }
      });
      if (!problemEval) err(`${where}：沒有任何一行可以自動驗算，至少要有一行純算式`);
    }
    for (const k of Object.keys(pack.kinds)) if (!triggered.has(k)) err(`誤解 ${k} 在 ${n} 題中從未被觸發（kinds 多寫了，或誘答卡條件太嚴）`);
    return { id: pack.id, title: pack.title, problems, steps, evalLines, ok: errors.length === 0, errors };
  }

  const api = { evaluate, holds, segments, verifyPack, verifyAll: (SB, opts) => SB.PACKS.map((p) => verifyPack(SB, p, opts)) };
  root.SBTest = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
