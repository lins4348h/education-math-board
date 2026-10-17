// 內容包範本：複製成 packs/NN-<代號>.js 再修改（底線開頭的檔案不會被載入）。
// 這個範本本身就能跑：解 x + b = c（移項 → 算出 x）。完整格式說明見 docs/pack-format.md。
(function () {
  // 可用的工具（說明見 docs/pack-format.md「工具」一節）
  const { buildStep, makeWith, divideStep, rnd, pick, nz, gcd, num, sg, pn, op, term, lin, eqXY, fracText } = SB.tools;

  const pack = {
    id: 'one-step',                 // 代號：小寫英文、數字、連字號；網址 #one-step 會直接進入
    grade: '七上',                   // 入口頁依年級分組
    title: '一步移項',               // 卡片標題
    unit: '一元一次方程式（移項）',    // 單元名稱
    pitch: '把常數移到等號右邊，再算出 x。', // 一句話介紹
    // 誤解代碼 → 中文名稱（紀錄卡的誤解排行會用到；每個代碼都必須能被某條診斷規則觸發）
    kinds: {
      sign_not_flipped: '移項沒有變號',
      combine_error: '計算錯誤',
    },
    // 步驟代碼 → 中文名稱
    stepLabels: { move: '移項', solve: '算出 x' },

    // make(rng) 產生一題。用 makeWith 包起來：回傳 null 會自動重新出題（例如數字不合適、卡片文字重複）。
    make: makeWith('one-step', (rng) => {
      const x = nz(rng, -9, 9);       // 先決定答案，保證是整數
      const b = nz(rng, -9, 9);
      const c = x + b;
      if (!c) return null;            // 不想要的題目就回傳 null

      // 第 1 步：x = c [空格]
      const s1 = buildStep({
        key: 'move',
        goal: `把 ${sg(b)} 移到等號右邊`,
        line: ['x =', num(c), { slot: 'k' }],           // 字串是固定文字，{ slot } 是空格
        cards: [
          { key: 'ok', text: sg(-b) },                     // 正解卡
          { key: 'nf', text: sg(b), trap: 'sign_not_flipped' }, // 誘答卡：trap 寫誤解代碼
        ],
        accept: [{ k: 'ok' }],                             // 可接受的放法（等價寫法可以列好幾組）
        diagnose: [                                        // 放錯時的回饋：when 寫「哪個空格放了哪張卡」
          { when: { k: 'nf' }, kind: 'sign_not_flipped', fb: `${sg(b)} 移到右邊要變號，變成 ${sg(-b)}。` },
        ],
        hints: ['常數移到等號另一邊。', '移過去要變號。', `${sg(b)} 會變成 ${sg(-b)}。`], // 一定要三層
      }, rng);

      // 第 2 步：x = [空格]
      const s2 = buildStep({
        key: 'solve',
        goal: '算出 x',
        line: ['x =', { slot: 'v' }],
        cards: [
          { key: 'ok', text: num(x) },
          c + b !== x && { key: 'cw', text: num(c + b), trap: 'combine_error' }, // 條件不成立時寫 false，卡片會被略過
        ],
        accept: [{ v: 'ok' }],
        diagnose: [
          { when: { v: 'cw' }, kind: 'combine_error', fb: `照上一行算：${num(c)} ${op(-b)} = ${num(x)}。` },
        ],
        hints: ['照上一行，把右邊算出來。', `算 ${num(c)} ${op(-b)}。`, `等於 ${num(x)}。`],
      }, rng);

      return {
        stem: [`x ${op(b)} = ${num(c)}`],  // 一行＝方程式；兩行＝聯立；應用題用 [] 並另寫 story
        params: { b, c },                  // 產生這一題的參數（除錯用）
        answer: { x },                     // 驗算會把答案代回每一行算式；恆等式寫 { identity: true }
        answerText: `x = ${num(x)}`,       // 完成畫面顯示的答案
        steps: [s1, s2],
      };
    }),
  };

  SB.register(pack);
})();
