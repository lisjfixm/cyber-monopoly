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

## 獨立部署（Standalone / Docker）

Standalone 模式**不依賴任何平台**，標準架構為 **NestJS 後端 + PostgreSQL**：後端同時 serve 編譯後的前端靜態檔（`dist/client/`）與 `/api/*` 業務接口。首次啟動時後端會自動執行 `server/database/init.sql` 建表（重複執行安全）。

> 注意：本節使用明確的 `nest build` + `vite build` 指令，**不要**呼叫 `npm run build`——該 script 為平台專用流程。

### 1. 本機 Docker Compose（一鍵啟動）

需求：本機已安裝 Docker 與 Docker Compose v2。

```bash
# （可選）複製範本並修改密碼 / secret
cp .env.example .env

# 建置並背景啟動（含 PostgreSQL + 後端）
docker compose up -d --build

# 等待約 10 秒讓 PostgreSQL 就緒、後端自動建表後驗證
curl http://localhost:3000/                # 應回前端 index.html
curl http://localhost:3000/api/ranking    # 應回排行榜 JSON
```

常用指令：

```bash
docker compose logs -f server   # 即時查看後端日誌
docker compose down             # 停止（資料保留在 pgdata volume）
docker compose down -v          # 連同資料庫一併刪除
```

資料庫持久化在名為 `pgdata` 的 Docker volume；PostgreSQL 預設僅對容器內網路開放，不對外暴露埠。

### 2. Render 部署

1. 控制台 **New → Web Service**，連接本專案 GitHub 倉庫。
2. 設定：
   - **Runtime**：Node
   - **Build Command**：
     ```bash
     npm ci --ignore-scripts --maxsockets 1 && NODE_ENV=production npx nest build && NODE_OPTIONS="--max-old-space-size=4096" npx vite build --config vite.config.ts
     ```
   - **Start Command**：`node dist/server/main.js`
3. 新增 **PostgreSQL** 附加資源，建立後把內部連線字串（Internal Database URL）填入環境變數 `DATABASE_URL`（同時相容 `SUDA_DATABASE_URL`）。
4. 在 Environment 填入下表變數。首次部署後後端會自動建表，無需手動 migrate。

### 3. Railway 部署

1. **New Project → Deploy from GitHub repo**，選本倉庫。
2. Railway 會偵測 Node；進入 service **Settings**：
   - **Build Command**：`npm ci --ignore-scripts --maxsockets 1 && NODE_ENV=production npx nest build && NODE_OPTIONS="--max-old-space-size=4096" npx vite build --config vite.config.ts`
   - **Start Command**：`node dist/server/main.js`
3. **New → Database → PostgreSQL**，把 Postgres service 的連線字串以 `DATABASE_URL=${{ Postgres.DATABASE_URL }}` 參照進本 service。
4. 補上 `ACCOUNT_TOKEN_SECRET` 等環境變數即可。

### 4. VPS / 雲主機部署

需求：Node.js ≥ 22、npm ≥ 10、PostgreSQL 16。

```bash
git clone <repo> && cd cyber-monopoly
npm ci --ignore-scripts --maxsockets 1

# 建置
NODE_ENV=production npx nest build
NODE_OPTIONS="--max-old-space-size=4096" npx vite build --config vite.config.ts

# 設定環境變數（編輯 .env，至少填 DATABASE_URL / SUDA_DATABASE_URL）
cp .env.example .env

# 以 PM2 常駐（cwd 必須為專案根目錄）
npm i -g pm2
NODE_ENV=production pm2 start dist/server/main.js --name cyber-monopoly
pm2 save && pm2 startup
```

前置 PostgreSQL 需先建好資料庫（例如 `cyber_monopoly`）；後端首次啟動會自動建表。前端由後端直接 serve，建議於前方掛 Nginx 反向代理至 `127.0.0.1:3000` 並綁定網域 / 憑證。

### 5. 環境變數一覽

| 變數 | 說明 | 必填 | 預設 / 備註 |
|------|------|------|-------------|
| `DATABASE_URL` | PostgreSQL 連線字串（優先讀取） | 是 | 例 `postgres://user:pass@host:5432/cyber_monopoly` |
| `SUDA_DATABASE_URL` | 相容舊版連線字串 | 二選一 | 未設 `DATABASE_URL` 時使用 |
| `SERVER_HOST` | 監聽位址 | 否 | `0.0.0.0` |
| `SERVER_PORT` | 監聽埠 | 否 | `3000` |
| `NODE_ENV` | 執行環境 | 否 | 建議 `production` |
| `ACCOUNT_TOKEN_SECRET` | 帳號 token 簽章密鑰 | 強烈建議 | 未設使用開發用預設值，正式環境務必設定 |
| `GM_PASSWORD` | GM 後台密碼 | 否 | 未設時 GM 後台僅開放於開發環境 |
| `GM_HMAC_SECRET` | GM 後台 HMAC 簽章密鑰 | 否 | 空 |
| `OAUTH_GITHUB_CLIENT_ID` / `SECRET` | GitHub OAuth（選填） | 否 | 預設關閉 |
| `OAUTH_GOOGLE_CLIENT_ID` / `SECRET` | Google OAuth（選填） | 否 | 預設關閉 |

> Compose 預設以 `.env` 中的 `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` 建立資料庫並自動組出 `DATABASE_URL`；正式環境請務必覆蓋 `ACCOUNT_TOKEN_SECRET` 與資料庫密碼。

### 6. 本機無 Docker 的開發方式

需自行準備本機 PostgreSQL，建好資料庫後於 `.env` 填入 `DATABASE_URL`，然後：

```bash
npm install
npm run dev    # 同時啟動後端（:3000）與 Vite 開發伺服器
```

## 遊戲設計

- 棋盤：36 格 10×10 外圈，順時針；0 號起點，10 號禁閉區，20/33 號命運區
- 模式參數：經典（$15000 起始）、快速（$8000、地價 0.6×）、瘋狂（$20000、命運卡 2×）
- AI 決策：依現金與地價比決定購買機率，保留安全墊

詳細規則見 `AGENTS.md`。
