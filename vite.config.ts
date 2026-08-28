import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  define: { __APP_BUILD__: JSON.stringify(mode === 'app') },
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 2048,
    emptyOutDir: false
  },
  server: { strictPort: true },
  clearScreen: false
}));
