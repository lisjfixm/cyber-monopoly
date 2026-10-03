import path from 'path';
import { defineConfig } from '@lark-apaas/fullstack-vite-preset';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // 離線單檔：所有 JS/CSS 內聯進 index.html，雙擊即可離線開啟
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
  ],
  build: {
    outDir: 'dist/offline',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
