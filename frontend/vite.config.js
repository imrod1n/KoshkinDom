import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Draft.js и зависимости ожидают Node-глобал `global` (в браузере его нет)
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('draft-js') || id.includes('draftjs-to-html') || id.includes('html-to-draftjs')) {
            return 'draft';
          }
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/bootstrap')) {
            return 'bootstrap';
          }
        },
      },
    },
  },
})
