import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// daga-clone 前端构建配置
// 关键：启用 @vitejs/plugin-react 以使用 automatic JSX runtime，
// 否则 esbuild 默认 classic transform 会生成 React.createElement，
// 而仅 `import { useState } from 'react'` 的页面会因 React 未定义而崩溃。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
});
