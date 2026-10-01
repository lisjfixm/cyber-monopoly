import path from 'path';
import { defineConfig } from '@lark-apaas/fullstack-vite-preset';

export default defineConfig({
  // 相對路徑：讓靜態產物可部署到 GitHub Pages 子路徑（/cyber-monopoly/）
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
});
