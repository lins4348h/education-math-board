// 在 node 裡載入引擎、所有內容包與驗算器（建置與測試共用）
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// packs/ 裡依檔名排序；底線開頭（例如 _template.js）不載入
export function packFiles() {
  return fs.readdirSync(path.join(ROOT, 'packs')).filter((f) => f.endsWith('.js') && !f.startsWith('_')).sort();
}

export function loadAll() {
  const ctx = vm.createContext({ console });
  ctx.globalThis = ctx;
  const run = (rel) => vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { filename: rel });
  run('src/engine.js');
  for (const f of packFiles()) run(`packs/${f}`);
  run('test/verify-core.js');
  return { SB: ctx.SB, SBTest: ctx.SBTest };
}
