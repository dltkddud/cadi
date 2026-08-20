import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages는 https://<user>.github.io/cadi/ 하위 경로로 서비스되므로
  // 프로덕션 빌드에서만 base를 지정한다. (dev 서버는 루트 유지)
  base: command === 'build' ? '/cadi/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
