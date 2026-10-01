# 賽博大富翁 Cyber Monopoly

賽博朋克風格的大富翁網頁遊戲，支援**同屏雙人、人機對戰、聯機對戰**三種模式，並內建多種小遊戲、股票系統、技能樹、每日任務、簽到、排行榜、公會等豐富系統。

## 功能特色

- 🎲 三種核心模式：本地雙人、人機 AI（多難度/性格）、線上聯機（房間碼配對）
- 🗺️ 36 格賽博棋盤：地產、命運卡、機會卡、禁閉區、縮圈（大逃殺）等
- 🛠️ 道具與技能：雙倍骰子、隱形、電磁脈衝、技能樹、職業加成
- 📈 股票市場、拍賣會、黑市、地下市場、債券、貸款
- 🎮 內建小遊戲：記憶對戰、射擊挑戰、節奏大師、駭客入侵、賽車、拍賣師、資料礦工
- 📅 每日任務、每週任務、連續簽到、成就系統、戰鬥通行證
- 🏆 排位賽（ELO）、排行榜、觀戰、錄影回放、分享卡
- 👥 好友、私訊、公會、聊天、彈幕、表情
- 🎨 賽博霓虹主題、多語言（繁中/簡中/英文/日文）、行動端響應式

## 技術架構

```
server/modules/   # NestJS 後端：房間管理、遊戲引擎、AI、帳號、排行、好友、簽到、GM
client/src/       # React 前端（Vite）：頁面、元件、hooks、i18n
shared/           # 共享型別與遊戲引擎（game-engine.ts，供前後端共用）
```

- 全棧 **NestJS + React（Vite）**
- 遊戲核心邏輯執行於服務端，客戶端負責渲染與互動
- 聯機對戰透過短輪詢同步狀態（POST 操作 + GET 拉取）
- 遊戲狀態與帳號資料儲存於 **PostgreSQL**（JSONB 欄位）

## 本地開發

需求：Node.js ≥ 22、npm ≥ 10

```bash
npm install
npm run dev          # 同時啟動 server（:3000）與 client（Vite）
```

型別檢查 / 建置：

```bash
npm run type:check   # server + client 型別檢查
npm run build        # 生產建置（輸出到 dist/）
```

## 部署（線上 H5）

專案可部署為手機瀏覽器直接開啟的網頁應用（H5）。需要一個能執行 Node.js 的伺服器與 PostgreSQL 資料庫。

### 1. 建置產物

```bash
npm ci
npm run build
```

產物位於 `dist/`，包含 `server/main.js` 與 `dist/client/` 前端頁面。

### 2. 設定環境變數

複製 `.env.example` 為 `.env`，填入：

| 變數 | 說明 | 必填 |
|------|------|------|
| `SERVER_HOST` | 伺服器監聽位址（0.0.0.0） | 是 |
| `SERVER_PORT` | 伺服器監聽埠（預設 3000） | 否 |
| `SUDA_DATABASE_URL` | PostgreSQL 連線字串 | 是 |
| `GM_PASSWORD` | GM 後台密碼 | 否 |
| `OAUTH_*` | OAuth 登入相關金鑰（若啟用） | 否 |

### 3. 啟動

```bash
cd dist
NODE_ENV=production node server/main.js
```

### 4. 建議部署方式

- **Render / Railway / Fly.io**：連動本 GitHub 倉庫，建置指令 `npm ci && npm run build`，啟動指令 `cd dist && NODE_ENV=production node server/main.js`，並掛載 PostgreSQL 外掛後填入 `SUDA_DATABASE_URL`。
- **VPS / 雲主機**：建置後以 PM2 / systemd 常駐，反向代理（Nginx）綁定網域並轉發 3000 埠。
- 部署完成後，手機開啟網域即可遊玩，可「加到主畫面」獲得 App 般體驗。

## 遊戲設計

- 棋盤：36 格 10×10 外圈，順時針；0 號起點，10 號禁閉區，20/33 號命運區
- 模式參數：經典（$15000 起始）、快速（$8000、地價 0.6×）、瘋狂（$20000、命運卡 2×）
- AI 決策：依現金與地價比決定購買機率，保留安全墊

詳細規則見 `AGENTS.md`。
