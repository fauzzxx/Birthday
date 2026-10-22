import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev-only: if a chapter imports a stylesheet that hasn't been saved yet,
 * use an empty one instead of showing an error, and reload once it appears.
 */
function tolerateMissingChapterCss(): Plugin {
  const EMPTY = '\0empty-chapter-css';
  return {
    name: 'tolerate-missing-chapter-css',
    apply: 'serve',
    resolveId(source, importer) {
      if (!importer || !source.endsWith('.css') || !importer.replace(/\\/g, '/').includes('/src/chapters/')) return null;
      const file = path.resolve(path.dirname(importer), source);
      return fs.existsSync(file) ? null : EMPTY;
    },
    load(id) {
      return id === EMPTY ? '' : null;
    },
    configureServer(server) {
      server.watcher.on('add', (file) => {
        const f = file.replace(/\\/g, '/');
        if (f.includes('/src/chapters/') && f.endsWith('.css')) {
          server.moduleGraph.invalidateAll();
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tolerateMissingChapterCss()],
  build: {
    target: 'es2020',
    cssTarget: 'chrome90',
    rollupOptions: {
      output: {
        manualChunks: { gsap: ['gsap', '@gsap/react'] },
      },
    },
  },
});
