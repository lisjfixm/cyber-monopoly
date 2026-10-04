# syntax=docker/dockerfile:1

# ============================================================
#  Builder：安裝全部依賴並建置 server + client
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# 先複製依賴清單，利用 Docker layer cache
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --maxsockets 1

# 複製完整原始碼
COPY . .

# 建置後端（輸出 dist/server/ 與 dist/shared/）
ENV NODE_ENV=production
RUN npx nest build

# nest build 只會複製設定於 nest-cli.json 的 assets（*.json），
# 不會帶入 .sql 資源；standalone 模組 OnModuleInit 需要
# dist/server/database/init.sql 才能自動建表，此處手動補上。
RUN mkdir -p dist/server/database \
 && cp server/database/init.sql dist/server/database/init.sql

# 建置前端（輸出 dist/client/，vite base 為 ./ 相對路徑）
RUN NODE_OPTIONS="--max-old-space-size=4096" npx vite build --config vite.config.ts

# ============================================================
#  Runner：只含生產依賴與建置產物
# ============================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    SERVER_HOST=0.0.0.0 \
    SERVER_PORT=3000

# 只複製建置產物與依賴清單（不含原始碼 / devDependencies）
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 安裝生產依賴（npm ci 會先清空 node_modules 再依 lock 檔安裝）
RUN npm ci --ignore-scripts --maxsockets 1 --omit=dev \
 && npm cache clean --force \
 && chown -R node:node /app

# 不使用 root 執行
USER node

EXPOSE 3000

# cwd 必須為專案根（/app），因為 main.ts 以
# join(process.cwd(), 'dist/client') 與 join(process.cwd(), 'dist/server/database/init.sql') 定位資源
CMD ["node", "dist/server/main.js"]
