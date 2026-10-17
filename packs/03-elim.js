// 內容包：加減消去法解二元一次聯立方程式
// 格式說明見 docs/pack-format.md；誘答卡、診斷規則、三層提示的寫法可以照這個檔案仿寫。
(function () {
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  const elim = {
    id: 'elim', grade: '七下', title: '加減消去法', unit: '二元一次聯立方程式（加減消去）',
    pitch: '交叉乘倍數讓 y 的係數相同，判斷相加或相減，消去 y 後求 x，再代回求 y。',
    kinds: {
      self_coef: '乘的倍數配錯', rhs_not_scaled: '等號右邊沒有一起乘', partial_scale: '只乘了部分的項',
      add_sub: '加減選錯，y 沒有消去', sub_sign: '等號右邊的加減算錯', not_divided: '忘了除以係數',
      sign_error: '答案正負號錯', sign_not_flipped: '移項沒有變號',
    },
    stepLabels: { multiply: '乘倍數', scaled: '兩式乘開', eliminate: '相加或相減', solvex: '求 x', back: '代回求 y' },
    make: makeWith('elim', (rng) => {
      const x0 = nz(rng, -6, 6), y0 = nz(rng, -6, 6);
      const B = [1, 2, 3, 4, 5];
      const ab1 = pick(rng, B), ab2 = pick(rng, B);
      if (ab1 === ab2 || gcd(ab1, ab2) !== 1) return null;
      const b1 = ab1 * (rng() < 0.5 ? -1 : 1), b2 = ab2 * (rng() < 0.5 ? -1 : 1);
      const a1 = nz(rng, -5, 5), a2 = nz(rng, -5, 5);
      if (a1 * b2 - a2 * b1 === 0) return null;
      const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
      if (Math.abs(c1) > 40 || Math.abs(c2) > 40) return null;
      const m1 = ab2, m2 = ab1, Lc = ab1 * ab2;
      const A1 = m1 * a1, B1 = m1 * b1, C1 = m1 * c1, A2 = m2 * a2, B2 = m2 * b2, C2 = m2 * c2;
      const same = Math.sign(B1) === Math.sign(B2);
      const A = same ? A1 - A2 : A1 + A2, K = same ? C1 - C2 : C1 + C2;
      if (!A || K % A !== 0 || K / A !== x0) return null;
      const s1 = buildStep({
        key: 'multiply', goal: '兩式各乘上多少，y 的係數絕對值才會相同？',
        line: ['① ×', { slot: 'm1' }, '　② ×', { slot: 'm2' }],
        cards: [
          { key: 'k1', text: num(m1) }, { key: 'k2', text: num(m2) },
          { key: 'd1', text: num(m1 + m2) },
          Lc !== m1 && Lc !== m2 && Lc !== m1 + m2 && { key: 'd2', text: num(Lc) },
        ],
        accept: [{ m1: 'k1', m2: 'k2' }],
        diagnose: [{ when: { m1: 'k2', m2: 'k1' }, kind: 'self_coef', fb: `乘上自己的係數，y 會變成 ${term(b1 * m2, 'y')} 和 ${term(b2 * m1, 'y')}，絕對值不同。要「交叉」乘對方的 y 係數。` }],
        fallback: `檢查：① 的 y 係數 ${num(b1)} 乘上第一格、② 的 y 係數 ${num(b2)} 乘上第二格，絕對值要相同。`,
        hints: [`看 y 的係數：① 是 ${num(b1)}、② 是 ${num(b2)}。`, `讓兩個 y 係數都變成 ${Lc} 或 −${Lc}。`, `① 要乘 ${m1}。`],
      }, rng);
      const big = m1 !== 1 ? 1 : 2; // 至少有一式的倍數不是 1
      const s2 = buildStep({
        key: 'scaled', goal: '把兩式乘開：等號兩邊的每一項都要乘',
        scaffold: `① × ${m1}，② × ${m2}`,
        line: ['①′', { slot: 'p' }, { br: 1 }, '②′', { slot: 'q' }],
        cards: [
          { key: 'e1', text: eqXY(A1, B1, C1) }, { key: 'e2', text: eqXY(A2, B2, C2) },
          m1 !== 1 && { key: 'r1', text: eqXY(A1, B1, c1), trap: 'rhs_not_scaled' },
          m2 !== 1 && { key: 'r2', text: eqXY(A2, B2, c2), trap: 'rhs_not_scaled' },
          big === 1 ? { key: 'pp', text: eqXY(A1, b1, C1), trap: 'partial_scale' } : { key: 'pp', text: eqXY(A2, b2, C2), trap: 'partial_scale' },
        ],
        accept: [{ p: 'e1', q: 'e2' }],
        diagnose: [
          { when: { p: 'r1' }, kind: 'rhs_not_scaled', fb: `等號右邊的 ${num(c1)} 也要乘 ${m1}，變成 ${num(C1)}。` },
          { when: { q: 'r2' }, kind: 'rhs_not_scaled', fb: `等號右邊的 ${num(c2)} 也要乘 ${m2}，變成 ${num(C2)}。` },
          { when: { p: 'pp' }, kind: 'partial_scale', fb: `① 的每一項都要乘 ${m1}，y 項也是。` },
          { when: { q: 'pp' }, kind: 'partial_scale', fb: `② 的每一項都要乘 ${m2}，y 項也是。` },
        ],
        fallback: '①′ 來自 ① 乘倍數、②′ 來自 ② 乘倍數，檢查有沒有放反。',
        hints: ['等號兩邊的每一項都要乘上同一個數。', `①′ 的 y 項是 ${term(B1, 'y')}，②′ 的 y 項是 ${term(B2, 'y')}。`, `①′ 是 ${eqXY(A1, B1, C1)}。`],
      }, rng);
      const Aw = same ? A1 + A2 : A1 - A2, Bw = same ? B1 + B2 : B1 - B2, Kw = same ? C1 + C2 : C1 - C2;
      const Ke = same ? C1 + C2 : C1 - C2;
      const s3 = buildStep({
        key: 'eliminate', goal: 'y 的係數同號要相減、異號要相加，才能消去 y',
        line: [{ slot: 'o' }, '，得', { slot: 'r' }],
        cards: [
          { key: 'oa', text: '①′ + ②′' }, { key: 'os', text: '①′ − ②′' },
          { key: 'ok', text: `${term(A, 'x')} = ${num(K)}` },
          { key: 'tw', text: eqXY(Aw, Bw, Kw), trap: 'add_sub' },
          Ke !== K && `${term(A, 'x')} = ${num(Ke)}` !== eqXY(Aw, Bw, Kw) && { key: 'tk', text: `${term(A, 'x')} = ${num(Ke)}`, trap: 'sub_sign' },
        ],
        accept: [{ o: same ? 'os' : 'oa', r: 'ok' }],
        diagnose: [
          { when: { o: same ? 'oa' : 'os' }, kind: 'add_sub', fb: `${term(B1, 'y')} 和 ${term(B2, 'y')} ${same ? '同號，要相減' : '異號，要相加'}才會消去。` },
          { when: { r: 'tw' }, kind: 'add_sub', fb: '這是用錯運算的結果，y 沒有消去。' },
          { when: { r: 'tk' }, kind: 'sub_sign', fb: `等號右邊也要${same ? '相減' : '相加'}：${num(C1)} ${same ? op(-C2) : op(C2)} = ${num(K)}。` },
        ],
        hints: [`看 y 的係數：${term(B1, 'y')} 和 ${term(B2, 'y')}。`, same ? '同號相減會變成 0。' : '一正一負相加會變成 0。', `用 ${same ? '①′ − ②′' : '①′ + ②′'}。`],
      }, rng);
      const s4 = buildStep({
        key: 'solvex', goal: '求出 x',
        line: ['x =', { slot: 'v' }],
        cards: [
          { key: 'v', text: num(x0) },
          Math.abs(A) !== 1 && { key: 'nd', text: num(K), trap: 'not_divided' },
          { key: 'ng', text: num(-x0), trap: 'sign_error' },
        ],
        accept: [{ v: 'v' }],
        diagnose: [
          { when: { v: 'nd' }, kind: 'not_divided', fb: `${term(A, 'x')} = ${num(K)}，還要兩邊同除以 ${num(A)}。` },
          { when: { v: 'ng' }, kind: 'sign_error', fb: `${num(K)} ÷ ${pn(A)} 是${x0 > 0 ? '正' : '負'}數。` },
        ],
        hints: ['兩邊同除以 x 的係數。', `x = ${num(K)} ÷ ${pn(A)}`, `x = ${num(x0)}`],
      }, rng);
      const R1 = c1 - a1 * x0;
      const s5 = buildStep({
        key: 'back', goal: '把 x 代回 ①，求出 y',
        scaffold: `代入 ①：${num(a1)} × ${pn(x0)} ${b1 < 0 ? '−' : '+'} ${term(Math.abs(b1), 'y')} = ${num(c1)}`,
        line: [{ slot: 'k' }, '，y =', { slot: 'y' }],
        cards: [
          { key: 'k', text: `${term(b1, 'y')} = ${num(R1)}` },
          { key: 'kw', text: `${term(b1, 'y')} = ${num(c1 + a1 * x0)}`, trap: 'sign_not_flipped' },
          { key: 'y', text: num(y0) },
          { key: 'yn', text: num(-y0), trap: 'sign_error' },
          Math.abs(b1) !== 1 && { key: 'yd', text: num(R1), trap: 'not_divided' },
        ],
        accept: [{ k: 'k', y: 'y' }],
        diagnose: [
          { when: { k: 'kw' }, kind: 'sign_not_flipped', fb: `${num(a1 * x0)} 移到右邊要變號：${num(c1)} ${op(-a1 * x0)} = ${num(R1)}。` },
          { when: { y: 'yn' }, kind: 'sign_error', fb: `${num(R1)} ÷ ${pn(b1)} 是${y0 > 0 ? '正' : '負'}數。` },
          { when: { y: 'yd' }, kind: 'not_divided', fb: `${term(b1, 'y')} = ${num(R1)}，還要兩邊同除以 ${num(b1)}。` },
        ],
        hints: [`先算 ${num(a1)} × ${pn(x0)} = ${num(a1 * x0)}。`, `把 ${num(a1 * x0)} 移到右邊。`, `${term(b1, 'y')} = ${num(R1)}。`],
      }, rng);
      return {
        stem: [`① ${eqXY(a1, b1, c1)}`, `② ${eqXY(a2, b2, c2)}`], params: { a1, b1, c1, a2, b2, c2 },
        answer: { x: x0, y: y0 }, answerText: `x = ${num(x0)}，y = ${num(y0)}`, steps: [s1, s2, s3, s4, s5],
      };
    }),
  };

  SB.register(elim);
})();
