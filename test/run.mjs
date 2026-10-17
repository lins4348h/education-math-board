// 用 node 跑自動驗算：node test/run.mjs（全部）或 node test/run.mjs paren（只驗一個內容包）
import { loadAll } from '../scripts/load.mjs';

const only = process.argv[2];
const { SB, SBTest } = loadAll();
const packs = SB.PACKS.filter((p) => !only || p.id === only);
if (!packs.length) {
  console.error(`找不到內容包 ${only}。現有：${SB.PACKS.map((p) => p.id).join('、')}`);
  process.exit(1);
}
let failed = 0;
for (const pack of packs) {
  const r = SBTest.verifyPack(SB, pack, { n: 1500 });
  if (r.ok) console.log(`✔ ${r.id}（${r.title}）：${r.problems} 題、${r.steps} 步、${r.evalLines} 行算式代回答案都成立`);
  else {
    failed++;
    console.log(`✘ ${r.id}（${r.title}）`);
    for (const e of r.errors) console.log(`   - ${e}`);
  }
}
if (failed) { console.log(`\n${failed} 個內容包沒有通過，請修正後再跑一次。`); process.exit(1); }
console.log('\n全部通過。');
