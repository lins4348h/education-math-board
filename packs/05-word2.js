// 內容包：二元一次應用題（買票、雞兔同籠、硬幣三種題型）
// 格式說明見 docs/pack-format.md；誘答卡、診斷規則、三層提示的寫法可以照這個檔案仿寫。
(function () {
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  const W2 = [
    { t: 'ticket', i1: '全票', i2: '學生票', u: '張', },
    { t: 'chicken', i1: '雞', i2: '兔子', u: '隻' },
    { t: 'coin', i1: '5 元硬幣', i2: '10 元硬幣', u: '枚' },
  ];
  const word2 = {
    id: 'word2', grade: '七下', title: '二元一次應用題', unit: '二元一次聯立方程式的應用（列式）',
    pitch: '設兩個未知數，拖出兩個方程式，用加減消去求解。張數和錢數不要混在一起。',
    kinds: {
      unit_confusion: '把單價當成未知數', wrong_unknown: '設錯未知數（設成已知量）', mix_total: '數量和總值混在同一式',
      swap_value: '單價（腳數）配錯對象', wrong_multiplier: '消去時乘錯數', rhs_not_scaled: '等號右邊沒有一起乘',
      not_divided: '忘了除以係數', swap_answer: 'x、y 答案對調', back_sub: '代回時沒有減',
    },
    stepLabels: { define: '設未知數', eq1: '數量的方程式', eq2: '總值的方程式', eliminate: '消去 x', solve: '求出解' },
    make: makeWith('word2', (rng) => {
      const T = pick(rng, W2);
      let v1, v2, x0, y0, story, val, vw;
      if (T.t === 'ticket') {
        v1 = pick(rng, [250, 300, 350, 400]); v2 = pick(rng, [120, 150, 180, 200]);
        x0 = rnd(rng, 2, 12); y0 = rnd(rng, 3, 18);
      } else if (T.t === 'chicken') { v1 = 2; v2 = 4; x0 = rnd(rng, 4, 20); y0 = rnd(rng, 3, 15); }
      else { v1 = 5; v2 = 10; x0 = rnd(rng, 3, 20); y0 = rnd(rng, 3, 20); }
      if (x0 === y0) return null;
      const N = x0 + y0, V = v1 * x0 + v2 * y0;
      vw = T.t === 'chicken' ? '總腳數' : '總金額';
      if (T.t === 'ticket') { story = `音樂會全票每張 ${v1} 元、學生票每張 ${v2} 元。某班共買了 ${N} 張票，花了 ${V} 元。全票和學生票各買了幾張？`; val = '元'; }
      else if (T.t === 'chicken') { story = `籠子裡有雞和兔子共 ${N} 隻，腳共有 ${V} 隻。雞和兔子各有幾隻？`; val = '隻腳'; }
      else { story = `撲滿裡只有 5 元和 10 元硬幣，共 ${N} 枚，總共 ${V} 元。5 元和 10 元硬幣各有幾枚？`; val = '元'; }
      const okDef = `${T.i1} x ${T.u}、${T.i2} y ${T.u}`;
      const unitTrap = T.t === 'chicken' ? `雞 x 隻腳、兔子 y 隻腳` : T.t === 'ticket' ? '全票每張 x 元、學生票每張 y 元' : '5 元硬幣 x 元、10 元硬幣 y 元';
      const s1 = buildStep({
        key: 'define', goal: '設兩個未知數：題目問的是「各有幾' + T.u + '」',
        line: ['設', { slot: 'u' }],
        cards: [
          { key: 'ok', text: okDef },
          { key: 'uc', text: unitTrap, trap: 'unit_confusion' },
          { key: 'wu', text: `共 x ${T.u}、共 y ${val}`, trap: 'wrong_unknown' },
        ],
        accept: [{ u: 'ok' }],
        diagnose: [
          { when: { u: 'uc' }, kind: 'unit_confusion', fb: T.t === 'chicken' ? '雞 2 隻腳、兔子 4 隻腳是已知的，要設的是隻數。' : '單價（面額）題目已經告訴你了，要設的是數量。' },
          { when: { u: 'wu' }, kind: 'wrong_unknown', fb: `共 ${N} ${T.u}、共 ${V} ${val}都是已知的。` },
        ],
        hints: ['題目最後問什麼？', `問的是兩種各有幾${T.u}。`, `設「${okDef}」。`],
      }, rng);
      const s2 = buildStep({
        key: 'eq1', goal: `第一個方程式：用「${T.u}數」相等列式`,
        line: ['①', { slot: 'e' }],
        cards: [
          { key: 'ok', text: `x + y = ${N}` },
          { key: 't1', text: `x + y = ${V}`, trap: 'mix_total' },
          { key: 't2', text: `${v1}x + ${v2}y = ${N}`, trap: 'mix_total' },
        ],
        accept: [{ e: 'ok' }],
        diagnose: [
          { when: { e: 't1' }, kind: 'mix_total', fb: `x + y 是${T.u}數，要等於 ${N}；${V} 是${vw}。` },
          { when: { e: 't2' }, kind: 'mix_total', fb: `${v1}x + ${v2}y 算的是${vw}，不是${T.u}數。` },
        ],
        hints: [`兩種的${T.u}數加起來是多少？`, `x + y 是總${T.u}數。`, `x + y = ${N}。`],
      }, rng);
      const s3 = buildStep({
        key: 'eq2', goal: `第二個方程式：用「${vw}」相等列式`,
        line: ['②', { slot: 'e' }],
        cards: [
          { key: 'ok', text: `${v1}x + ${v2}y = ${V}` },
          { key: 'sw', text: `${v2}x + ${v1}y = ${V}`, trap: 'swap_value' },
          { key: 'mt', text: `${v1}x + ${v2}y = ${N}`, trap: 'mix_total' },
        ],
        accept: [{ e: 'ok' }],
        diagnose: [
          { when: { e: 'sw' }, kind: 'swap_value', fb: `x 是${T.i1}，要乘${T.i1}的 ${v1}；y 是${T.i2}，乘 ${v2}。` },
          { when: { e: 'mt' }, kind: 'mix_total', fb: `${v1}x + ${v2}y 算的是${vw}，要等於 ${V}。` },
        ],
        hints: [`每一${T.u}${T.i1}是 ${v1}、每一${T.u}${T.i2}是 ${v2}。`, `${T.i1}的部分是 ${v1}x。`, `${v1}x + ${v2}y = ${V}。`],
      }, rng);
      const D = v2 - v1, R = V - v1 * N;
      const s4 = buildStep({
        key: 'eliminate', goal: '加減消去：② 減去 ① 的幾倍，可以消去 x？',
        line: ['② − ① ×', { slot: 'k' }, '：', { slot: 'r' }],
        cards: [
          { key: 'k', text: num(v1) },
          { key: 'kw', text: num(v2), trap: 'wrong_multiplier' },
          { key: 'r', text: `${term(D, 'y')} = ${num(R)}` },
          { key: 'rw', text: `${term(D, 'y')} = ${num(V - N)}`, trap: 'rhs_not_scaled' },
        ],
        accept: [{ k: 'k', r: 'r' }],
        diagnose: [
          { when: { k: 'kw' }, kind: 'wrong_multiplier', fb: `要消去 x：② 的 x 係數是 ${v1}，所以 ① 要乘 ${v1}。` },
          { when: { r: 'rw' }, kind: 'rhs_not_scaled', fb: `① 乘 ${v1} 時右邊也要乘：${V} − ${v1} × ${N} = ${R}。` },
        ],
        hints: [`② 的 x 係數是 ${v1}，① 的 x 係數是 1。`, `① × ${v1} 後再相減，x 就消去了。`, `${V} − ${v1} × ${N} = ${R}。`],
      }, rng);
      const s5 = buildStep({
        key: 'solve', goal: '先求 y，再代回 ① 求 x',
        scaffold: `${term(D, 'y')} = ${num(R)}，y = ${num(R)} ÷ ${D}；再由 x + y = ${N} 求 x`,
        line: ['x =', { slot: 'x' }, '，y =', { slot: 'y' }],
        cards: [
          { key: 'cx', text: num(x0) }, { key: 'cy', text: num(y0) },
          D !== 1 && R !== y0 && R !== x0 && R !== N && { key: 'nd', text: num(R), trap: 'not_divided' },
          { key: 'n', text: num(N), trap: 'back_sub' },
        ],
        accept: [{ x: 'cx', y: 'cy' }],
        diagnose: [
          { when: { x: 'cy', y: 'cx' }, kind: 'swap_answer', fb: `x 是${T.i1}、y 是${T.i2}，答案放反了。` },
          { when: { y: 'nd' }, kind: 'not_divided', fb: `${term(D, 'y')} = ${num(R)}，還要除以 ${D}。` },
          { when: { x: 'nd' }, kind: 'not_divided', fb: `先由 ${term(D, 'y')} = ${num(R)} 求 y，再求 x。` },
          { when: { x: 'n' }, kind: 'back_sub', fb: `x = ${N} − y = ${N} − ${y0} = ${x0}。` },
        ],
        hints: [`y = ${num(R)} ÷ ${D}。`, `y = ${y0}，代回 x + y = ${N}。`, `x = ${N} − ${y0} = ${x0}。`],
      }, rng);
      return {
        story, stem: [], params: { t: T.t, v1, v2, N, V }, answer: { x: x0, y: y0 },
        answerText: `${T.i1} ${x0} ${T.u}、${T.i2} ${y0} ${T.u}`, steps: [s1, s2, s3, s4, s5],
      };
    }),
  };

  SB.register(word2);
})();
