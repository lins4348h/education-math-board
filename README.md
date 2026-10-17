# 拖移解題板（education-math-board）

給國中數學老師的課堂遊戲起手包。學生把卡片拖進算式的空格，一行一行組出解題過程；**每一張錯的卡片都對準一個常見誤解**，選錯了系統會說出錯在哪裡。玩完會出現一張紀錄卡，學生截圖傳給老師。

用 AI Agent 打開這個專案，告訴它你要做的單元，它會照 [AGENTS.md](AGENTS.md) 做出新的內容包、自動驗算數學、產生網頁。

- 試玩：https://lins4348h.github.io/education-math-board/
- 驗算結果：https://lins4348h.github.io/education-math-board/test.html

---

## 三句話開始

1. 用 AI Agent（Claude Code、Codex、Gemini CLI、Antigravity 等）**打開這個資料夾**。
2. 告訴它：「**照 AGENTS.md，幫我新增一個內容包：八上 乘法公式。**」
3. 確認它整理的解題步驟和常見錯誤，等它跑完驗算、建置，打開 `index.html` 試玩。

## 第一次使用前

| 準備 | 說明 |
|------|------|
| GitHub 帳號 | 到 https://github.com 免費註冊 |
| AI Agent | 能讀寫檔案、執行指令的 AI 工具 |
| Node.js | 跑驗算與建置用。Agent 會先檢查，沒有的話到 https://nodejs.org 下載 **LTS 版** |

## 完整流程

1. **取得自己的一份**：在本頁右上角按 **Fork**。
2. **開啟 GitHub Pages**：照 [docs/github-pages.md](docs/github-pages.md) 做，約 3 分鐘，之後會得到一個學生可以打開的網址。
3. **把專案下載到電腦**，用 Agent 打開。
4. **新增內容包**：把入口頁「給老師」區塊裡的提示詞貼給 Agent，填好單元、步驟、常見錯誤。
5. **上傳**：Agent 跑完驗算與建置後，請它上傳（git push），1～2 分鐘後網站自動更新。
6. **發給學生**：投影網址的 QR 碼；網址最後加 `#代號` 可以直接進某個內容包。
7. **收紀錄**：學生按「結束，看紀錄」，把紀錄卡截圖傳給你。

## 現有內容包

| 代號 | 年級 | 內容 | 步驟 |
|------|------|------|------|
| `paren` | 七上 | 去括號解方程式 | 去括號 → 移項 → 合併 → 係數化為 1 |
| `word1` | 七上 | 一元一次應用題 | 設未知數 → 列式 → 化簡 → 解出並作答 |
| `elim` | 七下 | 加減消去法 | 乘倍數 → 兩式乘開 → 相加或相減 → 求 x → 代回求 y |
| `subst` | 七下 | 代入消去法 | 代入 → 去括號 → 移項合併 → 求 x → 求 y |
| `word2` | 七下 | 二元一次應用題 | 設未知數 → 數量式 → 總值式 → 消去 → 求解 |

每個內容包都有兩種玩法：**練習**（自己的節奏）和**魔王對戰**（4 分鐘內打倒未知數魔王，每完成一步攻擊一次）。

## 適合哪些單元

拖移解題板適合「**解題過程可以拆成一行一行的等式或算式**」的單元。

| 適合 | 不適合 |
|------|--------|
| 一元一次方程式、二元一次聯立方程式 | 幾何作圖、尺規作圖 |
| 方程式應用題（設未知數、列式） | 需要看圖判斷的題目 |
| 乘法公式、多項式的運算 | 機率實驗、統計圖表判讀 |
| 因式分解 | 坐標平面上的作圖與移動 |
| 比例式、一元一次不等式 | 純記憶的定義與性質 |

不適合的單元，Agent 會先說明原因，並建議改用三師爸 [math-game-templates](https://github.com/mathruffian-dot/math-game-templates) 的其他模板（棋盤策略、全班主持、單人闖關等）。

## 數學會不會算錯？

每次建置前都會自動驗算：每個內容包隨機產生題目，把**每一張正解卡放回算式、代入答案**檢查等號兩邊相等，並確認每張誘答卡都有對應的錯誤回饋。驗算沒過，就不會產生網頁。

- Agent 用指令跑：`node test/run.mjs`（每個內容包 1500 題）
- 老師自己看：用瀏覽器打開 `test.html`（每個內容包 500 題），看到「全部通過」就沒問題

## 資料夾

```
index.html          給學生的網頁（建置產生，不要手改）
test.html           給老師的驗算頁（建置產生）
AGENTS.md           給 Agent 的工作守則（最重要）
CLAUDE.md、GEMINI.md 指向 AGENTS.md
packs/              內容包，一個單元一個檔案；_template.js 是範本
designs/            每個內容包的設計文件；_template.md 是範本
src/                引擎與網頁介面（不要改）
test/               自動驗算（不要改）
scripts/            建置程式
docs/
  github-pages.md   發佈到 GitHub Pages
  pack-format.md    內容包格式
  design-rules.md   回推八步驟、兩問檢驗、誘答卡原則
  workshop.md       研習流程
materials/          放教材原檔（不會上傳）
```

指令：

```bash
node test/run.mjs          # 驗算全部內容包
node test/run.mjs paren    # 只驗算一個
node scripts/build.mjs     # 驗算通過後產生 index.html、test.html
```

## 隱私與版權

- 課本、習作原檔有著作權，請放在 `materials/`（不會上傳），網站上只放改寫過的題目。
- 學生只填「班級-座號」，不要輸入真實姓名。紀錄只存在學生自己的裝置上，不會上傳到任何地方。

## 授權與致謝

程式與文件採 [MIT 授權](LICENSE)。

遊戲機制與設計規範（拖拉解題板、回推八步驟、兩問檢驗）參考三師爸的開源專案 [mathruffian-dot/math-game-templates](https://github.com/mathruffian-dot/math-game-templates)（MIT 授權）。本專案的引擎、介面與五個內容包為重新撰寫。
