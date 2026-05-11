import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = path.resolve('dist/sw.js');
      if (!fs.existsSync(swPath)) return;
      const content = fs.readFileSync(swPath, 'utf-8');
      fs.writeFileSync(
        swPath,
        content.replace('__SW_VERSION__', Date.now().toString(36))
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), swVersionPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
