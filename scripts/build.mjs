// 建置：先跑自動驗算，全部通過才把引擎＋內容包組成 index.html（給學生）與 test.html（給老師檢查）
// 用法：node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, packFiles, loadAll } from './load.mjs';

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// 1. 驗算（建置時每個內容包跑 300 題；完整的 1500 題用 node test/run.mjs）
const { SB, SBTest } = loadAll();
const results = SBTest.verifyAll(SB, { n: 300 });
const bad = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? '✔' : '✘'} ${r.id}（${r.title}）`);
if (bad.length) {
  for (const r of bad) { console.log(`\n${r.id} 沒有通過：`); r.errors.forEach((e) => console.log(`   - ${e}`)); }
  console.log('\n驗算沒有通過，沒有產生 index.html。請修正內容包後再建置。');
  process.exit(1);
}

// 2. 組裝（用函式取代，避免程式碼裡的 $& 等字元被當成取代語法）
const engine = read('src/engine.js');
const packs = packFiles().map((f) => `// ---- packs/${f} ----\n${read(`packs/${f}`)}`).join('\n');
const fill = (tpl) => tpl.replace('/*ENGINE*/', () => engine).replace('/*PACKS*/', () => packs).replace('/*VERIFY*/', () => read('test/verify-core.js'));
const banner = '<!-- 這個檔案由 node scripts/build.mjs 產生，請不要直接修改；要改內容請改 packs/ 再重新建置。 -->\n';

const withBanner = (html) => html.replace('<!doctype html>\n', () => `<!doctype html>\n${banner}`);
fs.writeFileSync(path.join(ROOT, 'index.html'), withBanner(fill(read('src/app.html'))));
fs.writeFileSync(path.join(ROOT, 'test.html'), withBanner(fill(read('src/test.html'))));
console.log(`\n已產生 index.html 與 test.html（${SB.PACKS.length} 個內容包：${SB.PACKS.map((p) => p.id).join('、')}）。`);
