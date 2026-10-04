#!/usr/bin/env bash
# 賽博大富翁 standalone 靜態建置（gh-pages / H5 離線包用）
# 用法：bash scripts/build-standalone-static.sh
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "▸ vite build（standalone 靜態）"
NODE_OPTIONS="--max-old-space-size=4096" npx vite build --config vite.config.ts

INDEX="dist/client/index.html"

# 平台 vite 預設會把 index.html 建在 dist/client/client 後再移到 dist/client，
# 並注入 hbs 佔位；靜態部署需統一修正以下路徑與標題。
echo "▸ 修正靜態路徑與標題"
sed -i \
  -e 's|\.\./assets/|./assets/|g' \
  -e 's|\.\./manifest.json|./manifest.json|g' \
  -e 's|\.\./favicon.svg|./favicon.svg|g' \
  "$INDEX"
# 標題與 favicon 的 hbs 佔位在靜態環境不會被填充，改為固定值
sed -i 's|<title>{{appName}}</title>|<title>赛博大富翁</title>|' "$INDEX"
sed -i 's|rel="icon" href="{{appAvatar}}"|rel="icon" href="./favicon.svg"|' "$INDEX"

if grep -q '\.\./' "$INDEX"; then
  echo "✗ 仍有未修正的相對路徑 ../" >&2
  exit 1
fi
echo "✓ 靜態建置完成：$INDEX"
