import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const portFile = join(__dirname, '../backend/.port')
const backendPort = existsSync(portFile) ? readFileSync(portFile, 'utf-8').trim() : '3001'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 30000 + Math.floor(Math.random() * 30000),
    strictPort: false,
    proxy: {
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true
      }
    }
  }
})
