// 內容包：去括號解一元一次方程式 a(x + b) = cx + d
// 格式說明見 docs/pack-format.md；誘答卡、診斷規則、三層提示的寫法可以照這個檔案仿寫。
(function () {
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  const paren = {
    id: 'paren', grade: '七上', title: '去括號解方程式', unit: '一元一次方程式（分配律、移項、合併）',
    pitch: '先用分配律去括號，再移項、合併、係數化為 1。括號前是負數時最容易出錯。',
    kinds: {
      dist_first_only: '分配律只乘到第一項', dist_sign: '分配時正負號錯', sign_not_flipped: '移項沒有變號',
      unlike_terms: 'x 項與常數放錯邊', combine_error: '合併同類項算錯', divide_wrong_object: '除以錯的數',
      frac_inverted: '分子分母顛倒', sign_error: '答案正負號錯',
    },
    stepLabels: { expand: '去括號', move: '移項', combine: '合併同類項', divide: '係數化為 1' },
    make: makeWith('paren', (rng) => {
      const a = pick(rng, [-5, -4, -3, -2, 2, 3, 4, 5]);
      const b = nz(rng, -6, 6);
      const c = nz(rng, -6, 6);
      const A = a - c;
      if (!A || Math.abs(A) > 9) return null;
      const x = pick(rng, [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6]);
      const ab = a * b, d = A * x + ab, K = d - ab;
      if (!d || Math.abs(d) > 40) return null;
      const rhs = lin([[c, 'x'], [d, '']]);
      const stem = `${num(a)}(x ${op(b)}) = ${rhs}`;
      const s1 = buildStep({
        key: 'expand', goal: '去括號：括號外的數，要乘進括號裡的每一項',
        line: [{ slot: 'p' }, { slot: 'q' }, '=', rhs],
        cards: [
          { key: 'px', text: term(a, 'x') },
          { key: 'qk', text: sg(ab) },
          { key: 't1', text: sg(b), trap: 'dist_first_only' },
          { key: 't2', text: sg(-ab), trap: 'dist_sign' },
          { key: 't3', text: term(-a, 'x'), trap: 'dist_sign' },
        ],
        accept: [{ p: 'px', q: 'qk' }],
        diagnose: [
          { when: { q: 't1' }, kind: 'dist_first_only', fb: `括號外的 ${num(a)} 要乘進每一項：${pn(a)} × ${pn(b)} = ${num(ab)}，不能只乘 x。` },
          { when: { q: 't2' }, kind: 'dist_sign', fb: `${pn(a)} × ${pn(b)} 要連同正負號一起算，等於 ${num(ab)}。` },
          { when: { p: 't3' }, kind: 'dist_sign', fb: `${pn(a)} × x = ${term(a, 'x')}，括號外的正負號也要乘進去。` },
        ],
        hints: ['括號外的數要乘進括號裡的「每一項」。', `${num(a)}(x ${op(b)}) = ${pn(a)} × x + ${pn(a)} × ${pn(b)}`, `第一項是 ${term(a, 'x')}。`],
      }, rng);
      const s2 = buildStep({
        key: 'move', goal: '移項：x 項移到左邊、常數移到右邊，移過去要變號',
        line: [term(a, 'x'), { slot: 'm' }, '=', num(d), { slot: 'n' }],
        cards: [
          { key: 'mx', text: term(-c, 'x', true) },
          { key: 'px', text: term(c, 'x', true), trap: 'sign_not_flipped' },
          { key: 'mn', text: sg(-ab) },
          { key: 'pk', text: sg(ab), trap: 'sign_not_flipped' },
        ],
        accept: [{ m: 'mx', n: 'mn' }],
        diagnose: [
          { when: { m: ['mn', 'pk'] }, kind: 'unlike_terms', fb: `左邊這格要放「含 x 的項」：是右邊的 ${term(c, 'x')} 要搬過來。` },
          { when: { n: ['mx', 'px'] }, kind: 'unlike_terms', fb: `右邊這格要放常數：是左邊的 ${sg(ab)} 要搬過去。` },
          { when: { m: 'px' }, kind: 'sign_not_flipped', fb: `右邊的 ${term(c, 'x')} 移到左邊要變號，變成 ${term(-c, 'x', true)}。` },
          { when: { n: 'pk' }, kind: 'sign_not_flipped', fb: `左邊的 ${sg(ab)} 移到右邊要變號，變成 ${sg(-ab)}。` },
        ],
        hints: ['含 x 的項都到左邊，常數都到右邊。', '移項就是兩邊同時加或減同一個量，所以搬過去要變號。', `右邊的 ${term(c, 'x')} 搬到左邊會變成 ${term(-c, 'x', true)}。`],
      }, rng);
      const s3 = buildStep({
        key: 'combine', goal: '合併同類項：左邊合成一個 x 項，右邊合成一個數',
        line: [{ slot: 'l' }, '=', { slot: 'r' }],
        cards: [
          { key: 'cl', text: term(A, 'x') },
          { key: 'kr', text: num(K) },
          a + c !== 0 && { key: 'tw', text: term(a + c, 'x'), trap: 'combine_error' },
          { key: 'kw', text: num(d + ab), trap: 'combine_error' },
        ],
        accept: [{ l: 'cl', r: 'kr' }],
        diagnose: [
          { when: { l: 'tw' }, kind: 'combine_error', fb: `x 的係數要連同正負號算：${num(a)} ${op(-c)} = ${num(A)}。` },
          { when: { r: 'kw' }, kind: 'combine_error', fb: `常數要連同正負號算：${num(d)} ${op(-ab)} = ${num(K)}。` },
        ],
        hints: ['左邊兩個 x 項合併，右邊兩個數合併。', `x 的係數：${num(a)} ${op(-c)}；常數：${num(d)} ${op(-ab)}。`, `左邊合併後是 ${term(A, 'x')}。`],
      }, rng);
      const s4 = divideStep(rng, { A, K, x, wrongCoef: a, label: `不是括號外的 ${num(a)}` });
      return { stem: [stem], params: { a, b, c, d }, answer: { x }, answerText: `x = ${num(x)}`, steps: [s1, s2, s3, s4] };
    }),
  };

  SB.register(paren);
})();
