// 內容包：一元一次應用題（買東西、年齡、剪緞帶三種題型）
// 格式說明見 docs/pack-format.md；誘答卡、診斷規則、三層提示的寫法可以照這個檔案仿寫。
(function () {
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  function wordBuy(rng) {
    const n = rnd(rng, 3, 8), x = rnd(rng, 8, 30), p = rnd(rng, 4, 16) * 5, T = n * x + p;
    return {
      story: `小安買了 ${n} 枝原子筆和 1 本 ${p} 元的筆記本，共付了 ${T} 元。每枝原子筆多少元？`,
      params: { t: 'buy', n, x, p, T }, x,
      define: { ok: '每枝原子筆 x 元', traps: [['總共 x 元', `總共 ${T} 元是已知的，要把「題目問的量」設成 x。`], ['筆記本 x 元', `筆記本 ${p} 元是已知的，題目問的是原子筆。`]] },
      eq: {
        L: `${n}x + ${p}`, R: `${T}`,
        traps: [
          [`x + ${p}`, 'miss_multiplier', `買了 ${n} 枝，原子筆的錢是 ${n} × x = ${n}x。`],
          [`${n}(x + ${p})`, 'wrong_grouping', `${n}(x + ${p}) 表示買了 ${n} 組「筆＋筆記本」，但筆記本只買 1 本。`],
        ],
      },
      simp: {
        accept: [[term(n, 'x'), num(T - p)]],
        traps: [[num(T + p), 'sign_not_flipped', `把 +${p} 移到右邊要變號：${T} − ${p} = ${T - p}。`]],
        hint: `${n}x + ${p} = ${T}，把 ${p} 移到右邊。`,
      },
      coef: n, K: T - p,
      ans: { ok: `每枝原子筆 ${x} 元`, trap: [`筆記本 ${x} 元`, '題目問的是原子筆，不是筆記本。'] },
    };
  }
  function wordAge(rng) {
    const D = rnd(rng, 6, 14), k = pick(rng, [2, 3]), x = rnd(rng, 2, 10), F = k * (D + x) - x;
    if (F < 28 || F > 55) return null;
    return {
      story: `爸爸今年 ${F} 歲，女兒今年 ${D} 歲。再過幾年，爸爸的年齡會是女兒的 ${k} 倍？`,
      params: { t: 'age', D, k, x, F }, x,
      define: { ok: 'x 年後', traps: [['女兒 x 歲', `女兒今年 ${D} 歲是已知的，題目問的是「幾年後」。`], ['爸爸 x 歲', `爸爸今年 ${F} 歲是已知的，題目問的是「幾年後」。`]] },
      eq: {
        L: `${F} + x`, R: `${k}(${D} + x)`,
        traps: [
          [`${F} − x`, 'direction', `x 年後，爸爸會長大 x 歲，是 ${F} + x。`],
          [`${k} × ${D} + x`, 'times_scope', `女兒 x 年後是 ${D} + x 歲，整個要乘 ${k}：${k}(${D} + x)。`],
          [`${D} + x`, 'times_missing', `爸爸的年齡是女兒的 ${k} 倍，女兒那邊要乘 ${k}。`],
        ],
      },
      simp: {
        accept: [[term(k - 1, 'x'), num(F - k * D)], [term(1 - k, 'x'), num(k * D - F)]],
        traps: [
          [num(F + k * D), 'sign_not_flipped', `${k * D} 移到另一邊要變號。`],
          [num(F - D), 'dist_first_only', `${k}(${D} + x) 要把 ${k} 乘進 ${D} 和 x：${k * D} + ${k}x。`],
        ],
        hint: `先去括號：${k}(${D} + x) = ${k * D} + ${k}x，再把 x 項放同一邊。`,
      },
      coef: k - 1, K: F - k * D,
      ans: { ok: `${x} 年後`, trap: [`女兒 ${D + x} 歲`, '題目問的是「幾年後」，不是女兒幾歲。'] },
    };
  }
  function wordRope(rng) {
    const x = rnd(rng, 8, 40), k = pick(rng, [2, 3]), m = rnd(rng, 3, 15), L = x + k * x + m;
    return {
      story: `一條長 ${L} 公分的緞帶剪成長、短兩段，長段比短段的 ${k} 倍多 ${m} 公分。短段是多少公分？`,
      params: { t: 'rope', x, k, m, L }, x,
      define: { ok: '短段 x 公分', traps: [['全長 x 公分', `全長 ${L} 公分是已知的，要設題目問的短段。`], ['長段比短段多 x 公分', '這個量題目沒有問，設成 x 列不出方程式。']] },
      eq: {
        L: `x + (${k}x + ${m})`, R: `${L}`,
        traps: [
          [`x + ${k}x`, 'miss_more', `長段是「${k} 倍多 ${m}」，要寫成 ${k}x + ${m}。`],
          [`x + (${k}x − ${m})`, 'more_less', `「多 ${m} 公分」要用加的。`],
          [`x + ${k}(x + ${m})`, 'times_scope', `是短段的 ${k} 倍「再多 ${m}」，${m} 不在括號裡。`],
        ],
      },
      simp: {
        accept: [[term(k + 1, 'x'), num(L - m)]],
        traps: [
          [term(k, 'x'), 'combine_error', `x + ${k}x = ${k + 1}x，x 本身也是 1x。`],
          [num(L + m), 'sign_not_flipped', `把 +${m} 移到右邊要變號：${L} − ${m} = ${L - m}。`],
        ],
        hint: `左邊：x + ${k}x + ${m}，x 項合併，${m} 移到右邊。`,
      },
      coef: k + 1, K: L - m,
      ans: { ok: `短段 ${x} 公分`, trap: [`長段 ${x} 公分`, '題目問的是短段。'] },
    };
  }
  const word1 = {
    id: 'word1', grade: '七上', title: '一元一次應用題', unit: '一元一次方程式的應用（列式）',
    pitch: '從文字題設未知數、拖出方程式、化簡、解出並作答。列式是學生最卡的一步。',
    kinds: {
      wrong_unknown: '設錯未知數（設成已知量）', miss_multiplier: '列式漏乘數量', wrong_grouping: '括號範圍錯',
      direction: '「幾年後」方向錯', times_scope: '倍數只乘到一部分', times_missing: '漏了倍數關係',
      miss_more: '漏了「多幾」', more_less: '「多、少」用錯運算', sign_not_flipped: '移項沒有變號',
      dist_first_only: '分配律只乘到第一項', combine_error: '合併同類項算錯', not_divided: '忘了除以係數',
      sign_error: '答案正負號錯', answer_entity: '答非所問',
    },
    stepLabels: { define: '設未知數', equation: '列方程式', simplify: '化簡', solve: '解出並作答' },
    make: makeWith('word1', (rng) => {
      const w = pick(rng, [wordBuy, wordAge, wordRope])(rng);
      if (!w) return null;
      const s1 = buildStep({
        key: 'define', goal: '設未知數：把「題目問的量」設成 x',
        line: ['設', { slot: 'u' }],
        cards: [{ key: 'ok', text: w.define.ok }, ...w.define.traps.map(([t], i) => ({ key: `t${i}`, text: t, trap: 'wrong_unknown' }))],
        accept: [{ u: 'ok' }],
        diagnose: w.define.traps.map(([, fb], i) => ({ when: { u: `t${i}` }, kind: 'wrong_unknown', fb })),
        hints: ['先找題目最後問的是什麼。', '已經知道的數字不用設成 x。', `設「${w.define.ok}」。`],
      }, rng);
      const s2 = buildStep({
        key: 'equation', goal: '列方程式：找出「相等」的兩個量，分別放在等號兩邊',
        line: [{ slot: 'l' }, '=', { slot: 'r' }],
        cards: [{ key: 'L', text: w.eq.L }, { key: 'R', text: w.eq.R }, ...w.eq.traps.map(([t, k], i) => ({ key: `t${i}`, text: t, trap: k }))],
        accept: [{ l: 'L', r: 'R' }, { l: 'R', r: 'L' }],
        diagnose: w.eq.traps.flatMap(([, k, fb], i) => [{ when: { l: `t${i}` }, kind: k, fb }, { when: { r: `t${i}` }, kind: k, fb }]),
        hints: ['想一想：題目裡哪兩個量會相等？', `一邊用 x 表示，另一邊是題目給的數。`, `其中一邊是 ${w.eq.L}。`],
      }, rng);
      const sa = w.simp.accept;
      const s3 = buildStep({
        key: 'simplify', goal: '化簡成「ax = 數」',
        line: [{ slot: 'l' }, '=', { slot: 'r' }],
        cards: [
          ...sa.flatMap(([cx, kk], i) => [{ key: `c${i}`, text: cx }, { key: `k${i}`, text: kk }]),
          ...w.simp.traps.map(([t, k], i) => ({ key: `t${i}`, text: t, trap: k })),
        ],
        accept: sa.map((_, i) => ({ l: `c${i}`, r: `k${i}` })),
        diagnose: w.simp.traps.flatMap(([t, k, fb], i) => (/x$/.test(t) ? [{ when: { l: `t${i}` }, kind: k, fb }] : [{ when: { r: `t${i}` }, kind: k, fb }])),
        fallback: '左右兩格要配成同一個等式：x 項和常數要對應。',
        hints: ['去括號、移項、合併，整理成「幾 x ＝ 一個數」。', w.simp.hint, `左邊是 ${sa[0][0]}。`],
      }, rng);
      const X = w.x;
      const s4 = buildStep({
        key: 'solve', goal: '解出 x，並用完整的句子回答',
        line: ['x =', { slot: 'v' }, '　答：', { slot: 'a' }],
        cards: [
          { key: 'v', text: num(X) },
          w.coef !== 1 && w.K !== X && { key: 'nd', text: num(w.K), trap: 'not_divided' },
          w.params.t === 'age' && { key: 'ng', text: num(-X), trap: 'sign_error' },
          { key: 'a', text: w.ans.ok },
          { key: 'ae', text: w.ans.trap[0], trap: 'answer_entity' },
        ],
        accept: [{ v: 'v', a: 'a' }],
        diagnose: [
          { when: { v: 'nd' }, kind: 'not_divided', fb: `${term(w.coef, 'x')} = ${num(w.K)}，還要兩邊同除以 ${w.coef}。` },
          { when: { v: 'ng' }, kind: 'sign_error', fb: '年數不會是負的，檢查化簡時 x 的係數正負號。' },
          { when: { a: 'ae' }, kind: 'answer_entity', fb: w.ans.trap[1] },
        ],
        hints: ['兩邊同除以 x 的係數。', `x = ${num(w.K)} ÷ ${w.coef}。`, `x = ${num(X)}，再回頭看題目問什麼。`],
      }, rng);
      return { story: w.story, stem: [], params: w.params, answer: { x: X }, answerText: w.ans.ok, steps: [s1, s2, s3, s4] };
    }),
  };

  SB.register(word1);
})();
