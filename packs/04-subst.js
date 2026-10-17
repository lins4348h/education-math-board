// 內容包：代入消去法解二元一次聯立方程式
// 格式說明見 docs/pack-format.md；誘答卡、診斷規則、三層提示的寫法可以照這個檔案仿寫。
(function () {
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  const subst = {
    id: 'subst', grade: '七下', title: '代入消去法', unit: '二元一次聯立方程式（代入消去）',
    pitch: '把 ① 的 y 整個代入 ②，記得加括號；去括號、合併求 x，再代回 ① 求 y。',
    kinds: {
      no_paren: '代入時沒加括號', copy_sign: '代入時抄錯正負號', dist_first_only: '分配律只乘到第一項',
      dist_sign: '分配時正負號錯', sign_not_flipped: '移項沒有變號', combine_error: '合併同類項算錯',
      not_divided: '忘了除以係數', sign_error: '答案正負號錯', forgot_const: '漏加常數項',
    },
    stepLabels: { sub: '代入', expand: '去括號', combine: '移項合併', solvex: '求 x', solvey: '求 y' },
    make: makeWith('subst', (rng) => {
      const p = nz(rng, -4, 4), q = nz(rng, -8, 8), a = nz(rng, -5, 5), b = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
      const x0 = nz(rng, -5, 5), y0 = p * x0 + q;
      if (!y0 || Math.abs(y0) > 15) return null;
      const c = a * x0 + b * y0, A = a + b * p;
      if (!A || Math.abs(c) > 50) return null;
      const yexp = lin([[p, 'x'], [q, '']]);
      const bp = b * p, bq = b * q, K = c - bq;
      const s1 = buildStep({
        key: 'sub', goal: '把 ① 的 y 代入 ②（y 是一整個式子）',
        line: [`${term(a, 'x')} + ${pn(b)} ×`, { slot: 's' }, `= ${num(c)}`],
        cards: [
          { key: 'ok', text: `(${yexp})` },
          { key: 'np', text: yexp, trap: 'no_paren' },
          { key: 'cs', text: `(${lin([[p, 'x'], [-q, '']])})`, trap: 'copy_sign' },
        ],
        accept: [{ s: 'ok' }],
        diagnose: [
          { when: { s: 'np' }, kind: 'no_paren', fb: `y 是一整個式子，代入要加括號：${pn(b)} × (${yexp})。不加括號，${num(b)} 只會乘到第一項。` },
          { when: { s: 'cs' }, kind: 'copy_sign', fb: `① 是 y = ${yexp}，常數項是 ${sg(q)}，抄的時候正負號要一樣。` },
        ],
        hints: ['② 裡的 y，換成 ① 等號右邊的式子。', '代入的是「一整個」式子，要加括號。', `放 (${yexp})。`],
      }, rng);
      const s2 = buildStep({
        key: 'expand', goal: '去括號：括號前的數乘進每一項',
        line: [term(a, 'x'), { slot: 'u' }, { slot: 'v' }, '=', num(c)],
        cards: [
          { key: 'u', text: term(bp, 'x', true) }, { key: 'v', text: sg(bq) },
          { key: 't1', text: sg(q), trap: 'dist_first_only' },
          { key: 't2', text: sg(-bq), trap: 'dist_sign' },
          { key: 't3', text: term(-bp, 'x', true), trap: 'dist_sign' },
        ],
        accept: [{ u: 'u', v: 'v' }],
        diagnose: [
          { when: { v: 't1' }, kind: 'dist_first_only', fb: `${pn(b)} 要乘進括號裡的每一項：${pn(b)} × ${pn(q)} = ${num(bq)}。` },
          { when: { v: 't2' }, kind: 'dist_sign', fb: `${pn(b)} × ${pn(q)} 要連同正負號算，等於 ${num(bq)}。` },
          { when: { u: 't3' }, kind: 'dist_sign', fb: `${pn(b)} × ${term(p, 'x')} = ${term(bp, 'x')}。` },
        ],
        hints: [`${pn(b)} 要乘括號裡的每一項。`, `${pn(b)} × ${term(p, 'x')}，以及 ${pn(b)} × ${pn(q)}。`, `x 項是 ${term(bp, 'x', true)}。`],
      }, rng);
      const s3 = buildStep({
        key: 'combine', goal: '合併 x 項，常數移到右邊',
        line: [{ slot: 'l' }, '=', { slot: 'r' }],
        cards: [
          { key: 'l', text: term(A, 'x') }, { key: 'r', text: num(K) },
          { key: 'kw', text: num(c + bq), trap: 'sign_not_flipped' },
          a - bp !== 0 && a - bp !== A && { key: 'cw', text: term(a - bp, 'x'), trap: 'combine_error' },
        ],
        accept: [{ l: 'l', r: 'r' }],
        diagnose: [
          { when: { r: 'kw' }, kind: 'sign_not_flipped', fb: `${sg(bq)} 移到右邊要變號：${num(c)} ${op(-bq)} = ${num(K)}。` },
          { when: { l: 'cw' }, kind: 'combine_error', fb: `${term(a, 'x')} ${term(bp, 'x', true).replace(/^([+−])/, '$1 ')} 要連同正負號算，等於 ${term(A, 'x')}。` },
        ],
        hints: ['兩個 x 項合併，常數移到等號右邊。', `x 的係數：${num(a)} ${op(bp)} = ${num(A)}。`, `右邊是 ${num(c)} ${op(-bq)} = ${num(K)}。`],
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
      const s5 = buildStep({
        key: 'solvey', goal: '把 x 代回 ①，求出 y',
        line: [`y = ${num(p)} × ${pn(x0)} ${op(q)} =`, { slot: 'y' }],
        cards: [
          { key: 'y', text: num(y0) },
          { key: 'fc', text: num(p * x0), trap: 'forgot_const' },
          { key: 'yn', text: num(-y0), trap: 'sign_error' },
        ],
        accept: [{ y: 'y' }],
        diagnose: [
          { when: { y: 'fc' }, kind: 'forgot_const', fb: `${num(p)} × ${pn(x0)} = ${num(p * x0)}，還要 ${op(q)}。` },
          { when: { y: 'yn' }, kind: 'sign_error', fb: `${num(p * x0)} ${op(q)} 是${y0 > 0 ? '正' : '負'}數。` },
        ],
        hints: ['先乘再加。', `${num(p)} × ${pn(x0)} = ${num(p * x0)}。`, `${num(p * x0)} ${op(q)} = ${num(y0)}。`],
      }, rng);
      return {
        stem: [`① y = ${yexp}`, `② ${eqXY(a, b, c)}`], params: { p, q, a, b, c },
        answer: { x: x0, y: y0 }, answerText: `x = ${num(x0)}，y = ${num(y0)}`, steps: [s1, s2, s3, s4, s5],
      };
    }),
  };

  SB.register(subst);
})();
