# 用 GitHub Pages 把遊戲發給學生

GitHub Pages 會把這個專案變成一個網址，例如：

```
https://你的帳號.github.io/education-math-board/
```

學生用手機或平板打開就能玩，不用安裝、不用登入。以下步驟只要做一次。

---

## 1. 取得自己的一份專案

1. 登入 GitHub（沒有帳號就先到 https://github.com 免費註冊）。
2. 打開 https://github.com/lins4348h/education-math-board
3. 按右上角的 **Fork**，再按綠色的 **Create fork**。

完成後，網址會變成 `https://github.com/你的帳號/education-math-board`，這就是你自己的那一份，之後新增的內容包都放在這裡。

> 想改名字：在自己的那一份按 **Settings**，最上面的 **Repository name** 可以改（例如 `math-game-715`）。改名後，網址裡的 `education-math-board` 也要跟著換。

## 2. 開啟 GitHub Pages

1. 在自己的那一份，按上方的 **Settings**（齒輪圖示）。
2. 左邊選單找到 **Pages**。
3. **Source** 選 **Deploy from a branch**。
4. **Branch** 選 **main**，旁邊的資料夾選 **/ (root)**，按 **Save**。
5. 等 1～2 分鐘，重新整理這一頁，上方會出現「Your site is live at …」和網址。

打開那個網址，看到「拖移解題館」就成功了。

## 3. 新增內容包之後

請 Agent 照 `AGENTS.md` 做完內容包、建置、上傳（git push）之後，等 1～2 分鐘，網站就會自動更新。

沒有用 git 的話，也可以手動上傳：

1. 在自己的那一份按 **Add file → Upload files**。
2. 把新的 `packs/` 檔案，以及重新建置後的 `index.html`、`test.html` 拖進去。
3. 按 **Commit changes**。

## 4. 發給學生

- **整個解題館**：`https://你的帳號.github.io/education-math-board/`
- **直接進某個內容包**：網址最後加 `#代號`，例如 `…/education-math-board/#paren`
- **直接進魔王對戰**：加 `#代號-boss`，例如 `…/education-math-board/#elim-boss`

現有代號：

| 代號 | 內容 |
|------|------|
| `paren` | 去括號解方程式（七上） |
| `word1` | 一元一次應用題（七上） |
| `elim` | 加減消去法（七下） |
| `subst` | 代入消去法（七下） |
| `word2` | 二元一次應用題（七下） |

把網址做成 QR 碼投影在螢幕上最方便。Chrome 瀏覽器可以在網址列按右鍵 →「為這個網頁建立 QR 圖碼」。

## 5. 收學生的紀錄

學生玩完按「結束，看紀錄」，畫面會出現一張**紀錄卡**，上面有班級座號、完成題數、首次正確率、誤解排行。請學生截圖，傳到班級的 Google Classroom、LINE 群組或作業區。

紀錄只存在學生自己的裝置上，離開頁面就不見了，所以要提醒學生**先截圖再關掉**。

## 常見問題

| 狀況 | 怎麼辦 |
|------|--------|
| 網址打開是 404 | 剛開啟 Pages 要等 1～2 分鐘；確認 **Branch** 選的是 `main` 和 `/ (root)`。 |
| 網站沒有更新 | 等 1～2 分鐘後重新整理；手機可以關掉分頁重開。 |
| 新的內容包沒出現 | 確認有重新建置（`node scripts/build.mjs`），而且新的 `index.html` 有上傳。 |
| 想暫時隱藏某個內容包 | 把檔名改成底線開頭（例：`_03-elim.js`），重新建置後上傳。 |
