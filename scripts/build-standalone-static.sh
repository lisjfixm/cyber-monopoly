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

# 其餘 hbs 佔位（內嵌 window 設定、__platform__、og/meta 標籤）在靜態環境
# 也不會被模板引擎填充，統一替換為固定值或空字串，避免殘留 {{...}}
python3 - "$INDEX" <<'PY'
import sys
path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    html = f.read()
desc = '賽博龐克風大富翁桌遊：本地多人、人機對戰、股票黑市、寵物坐騎、新模式與豐富玩法，在霓虹都市中買地收租、稱霸對手。'
# 先處理三括號 {{{...}}}（HTML 不轉義）
html = html.replace('{{{appAvatar}}}', './favicon.svg')
html = html.replace("{{{__platform__}}}", '{}')
# 雙括號佔位
repl = {
    '{{csrfToken}}': '',
    '{{userId}}': '',
    '{{tenantId}}': '',
    '{{appId}}': '',
    '{{environment}}': '',
    '{{basename}}': '',
    '{{currentUrl}}': '',
    '{{appName}}': '赛博大富翁',
    '{{appAvatar}}': './favicon.svg',
    '{{appDescription}}': desc,
}
for k, v in repl.items():
    html = html.replace(k, v)
with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
PY

if grep -q '\.\./' "$INDEX"; then
  echo "✗ 仍有未修正的相對路徑 ../" >&2
  exit 1
fi
if grep -q '{{' "$INDEX"; then
  echo "✗ 仍有未填充的 hbs 佔位 {{" >&2
  exit 1
fi
echo "✓ 靜態建置完成：$INDEX"
