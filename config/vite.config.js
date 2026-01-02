import { defineConfig } from 'vite';
import { resolve } from 'path';

// Resolve project root (vite.config.js lives in /config)
const projectRoot = resolve(__dirname, '..');

export default defineConfig({
  root: projectRoot,
  base: './',
  server: {
    port: 3000,
    open: '/seiten/start.html',
    cors: true,
    strictPort: false,
    middlewareMode: false,
  },
  build: {
    outDir: resolve(projectRoot, 'dist'),
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        index: resolve(projectRoot, 'index.html'),
        start: resolve(projectRoot, 'seiten/start.html'),
        game: resolve(projectRoot, 'seiten/game.html'),
        aufgabenroulette: resolve(projectRoot, 'seiten/aufgabenroulette.html'),
        notenrechner: resolve(projectRoot, 'seiten/notenrechner.html'),
        stadtlandfluss: resolve(projectRoot, 'seiten/stadt-land-fluss.html'),
        timer: resolve(projectRoot, 'seiten/timer.html'),
        zufallsgenerator: resolve(projectRoot, 'seiten/zufallsgenerator.html'),
        dashboard: resolve(projectRoot, 'seiten/dashboard.html'),
        preview: resolve(projectRoot, 'seiten/preview.html'),
        backgroundBubblesBoxes: resolve(projectRoot, 'seiten/background-bubbles-boxes.html'),
        testLogin: resolve(projectRoot, 'seiten/test-login.html'),
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
});
