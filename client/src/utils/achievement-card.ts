export interface AchievementCardOptions {
  name: string;
  description: string;
  icon?: string;
  unlockedAt: string;
  playerName: string;
}

const CANVAS_SIZE = 1080;
const PADDING = 60;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCyberBackground(ctx: CanvasRenderingContext2D): void {
  // 深色漸變背景
  const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  bgGradient.addColorStop(0, '#0a0a1a');
  bgGradient.addColorStop(0.5, '#0d0d20');
  bgGradient.addColorStop(1, '#1a0a20');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // 網格線
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < CANVAS_SIZE; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_SIZE; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_SIZE, y);
    ctx.stroke();
  }

  // 霓虹光暈點
  const glow1 = ctx.createRadialGradient(200, 200, 0, 200, 200, 400);
  glow1.addColorStop(0, 'rgba(0, 255, 255, 0.15)');
  glow1.addColorStop(1, 'rgba(0, 255, 255, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 600, 600);

  const glow2 = ctx.createRadialGradient(880, 880, 0, 880, 880, 400);
  glow2.addColorStop(0, 'rgba(255, 0, 200, 0.15)');
  glow2.addColorStop(1, 'rgba(255, 0, 200, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(480, 480, 600, 600);
}

function drawNeonBorder(ctx: CanvasRenderingContext2D): void {
  const borderWidth = 3;
  const radius = 40;

  // 外層發光
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 30;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = borderWidth;
  roundRect(ctx, PADDING, PADDING, CANVAS_SIZE - PADDING * 2, CANVAS_SIZE - PADDING * 2, radius);
  ctx.stroke();

  // 內層粉色發光（角落）
  ctx.shadowColor = '#ff00cc';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(255, 0, 204, 0.6)';
  ctx.lineWidth = 2;

  // 左上角
  ctx.beginPath();
  ctx.moveTo(PADDING + radius, PADDING + 20);
  ctx.lineTo(PADDING + 20, PADDING + 20);
  ctx.lineTo(PADDING + 20, PADDING + radius);
  ctx.stroke();

  // 右下角
  ctx.beginPath();
  ctx.moveTo(CANVAS_SIZE - PADDING - radius, CANVAS_SIZE - PADDING - 20);
  ctx.lineTo(CANVAS_SIZE - PADDING - 20, CANVAS_SIZE - PADDING - 20);
  ctx.lineTo(CANVAS_SIZE - PADDING - 20, CANVAS_SIZE - PADDING - radius);
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function drawIcon(
  ctx: CanvasRenderingContext2D,
  iconSymbol: string,
  x: number,
  y: number,
  size: number,
): void {
  // 圓形背景
  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(255, 204, 0, 0.15)';
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 內圈
  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, size / 2 + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 圖標文字（用 Unicode 符號替代）
  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffcc00';
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconSymbol, x, y);
  ctx.restore();
}

function getIconSymbol(iconName: string | undefined): string {
  const iconMap: Record<string, string> = {
    Trophy: '獎盃',
    Landmark: '地標',
    Building2: '大樓',
    Hotel: '酒店',
    Layers: '書籍',
    TrendingUp: '上漲',
    Lock: '鎖',
    Sparkles: '閃耀',
    Handshake: '握手',
    Gavel: '天平',
    Coins: '金幣',
    Crown: '皇冠',
    GraduationCap: '畢業',
    Backpack: '背包',
    Dices: '骰子',
    Sun: '太陽',
    Skull: '骷髏',
    Flame: '火焰',
  };
  return iconMap[iconName || ''] || '星';
}

export function generateAchievementCard(options: AchievementCardOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  drawCyberBackground(ctx);
  drawNeonBorder(ctx);

  const centerX = CANVAS_SIZE / 2;

  // 成就圖標
  const iconSymbol = getIconSymbol(options.icon);
  drawIcon(ctx, iconSymbol, centerX, 340, 120);

  // 成就名稱
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 56px "Orbitron", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.name, centerX, 520);
  ctx.restore();

  // 成就描述
  ctx.save();
  ctx.fillStyle = 'rgba(200, 200, 220, 0.85)';
  ctx.font = '28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 自動換行
  const maxWidth = CANVAS_SIZE - PADDING * 4;
  const words = (options.description || '').split('');
  let line = '';
  let lineY = 600;
  const lineHeight = 40;
  for (let i = 0; i < words.length; i += 1) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, centerX, lineY);
      line = words[i];
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, centerX, lineY);
  ctx.restore();

  // 分隔裝飾線
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(PADDING + 100, 720);
  ctx.lineTo(CANVAS_SIZE - PADDING - 100, 720);
  ctx.stroke();

  // 兩側小方塊
  ctx.fillStyle = '#ff00cc';
  ctx.shadowColor = '#ff00cc';
  ctx.shadowBlur = 15;
  ctx.fillRect(PADDING + 90, 715, 10, 10);
  ctx.fillRect(CANVAS_SIZE - PADDING - 100, 715, 10, 10);
  ctx.restore();

  // 玩家暱稱
  ctx.save();
  ctx.shadowColor = '#ff00cc';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ff80e5';
  ctx.font = 'bold 32px "Orbitron", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`玩家 ${options.playerName}`, centerX, 780);
  ctx.restore();

  // 獲得時間
  ctx.save();
  ctx.fillStyle = 'rgba(150, 150, 180, 0.7)';
  ctx.font = '22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const date = new Date(options.unlockedAt);
  const dateStr = Number.isNaN(date.getTime())
    ? options.unlockedAt
    : date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
  ctx.fillText(`解鎖於 ${dateStr}`, centerX, 830);
  ctx.restore();

  // 底部遊戲名稱
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 28px "Orbitron", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('賽博大富翁', PADDING + 80, CANVAS_SIZE - 100);
  ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('CYBER MONOPOLY', PADDING + 80, CANVAS_SIZE - 65);
  ctx.restore();

  // 二維碼佔位（右下角）
  const qrSize = 100;
  const qrX = CANVAS_SIZE - PADDING - 80 - qrSize;
  const qrY = CANVAS_SIZE - PADDING - 80 - qrSize;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 8);
  ctx.stroke();

  // 模擬二維碼的小方塊
  ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
  ctx.shadowBlur = 0;
  const cellSize = 8;
  const cellsPerSide = 10;
  const startX = qrX + (qrSize - cellsPerSide * cellSize) / 2;
  const startY = qrY + (qrSize - cellsPerSide * cellSize) / 2;
  // 固定偽隨機圖案
  const pattern = [
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  ];
  for (let row = 0; row < cellsPerSide; row += 1) {
    for (let col = 0; col < cellsPerSide; col += 1) {
      if (pattern[row][col]) {
        ctx.fillRect(startX + col * cellSize, startY + row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }

  // 掃碼文字
  ctx.fillStyle = 'rgba(150, 150, 180, 0.6)';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('掃碼遊玩', qrX + qrSize / 2, qrY + qrSize + 20);
  ctx.restore();

  return canvas;
}

// 批量生成組合卡（多個成就，3x3 網格最多9個）
export function generateAchievementComboCard(
  achievements: AchievementCardOptions[],
  playerName: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  drawCyberBackground(ctx);
  drawNeonBorder(ctx);

  const centerX = CANVAS_SIZE / 2;

  // 標題
  ctx.save();
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 48px "Orbitron", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('成就收藏', centerX, 130);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(200, 200, 220, 0.6)';
  ctx.font = '24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${playerName} 已解鎖 ${achievements.length} 項成就`, centerX, 180);
  ctx.restore();

  // 網格佈局
  const maxShow = Math.min(achievements.length, 9);
  const cols = maxShow <= 4 ? 2 : 3;
  const rows = Math.ceil(maxShow / cols);
  const cellWidth = 280;
  const cellHeight = 220;
  const gridWidth = cols * cellWidth;
  const startX = (CANVAS_SIZE - gridWidth) / 2;
  const startY = 240;

  for (let i = 0; i < maxShow; i += 1) {
    const ach = achievements[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * cellWidth + cellWidth / 2;
    const cy = startY + row * cellHeight + cellHeight / 2;

    // 卡片邊框
    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)';
    ctx.lineWidth = 2;
    roundRect(ctx, cx - cellWidth / 2 + 10, cy - cellHeight / 2 + 10, cellWidth - 20, cellHeight - 20, 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 204, 0, 0.05)';
    ctx.fill();
    ctx.restore();

    // 小圖標
    const iconSymbol = getIconSymbol(ach.icon);
    ctx.save();
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffcc00';
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(iconSymbol, cx, cy - 35);
    ctx.restore();

    // 名稱
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ach.name, cx, cy + 20);
    ctx.restore();
  }

  // 底部遊戲名
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 28px "Orbitron", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('賽博大富翁 CYBER MONOPOLY', centerX, CANVAS_SIZE - 80);
  ctx.restore();

  return canvas;
}

// canvas 轉 data URL
export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

// 下載 PNG
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 分享（Web Share API）
export async function shareImage(dataUrl: string, title: string, text: string): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    // 將 dataURL 轉 Blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], 'achievement.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    }

    // 不支援文件分享時，僅分享文字
    await navigator.share({ title, text });
    return true;
  } catch {
    return false;
  }
}
