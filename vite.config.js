import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/desruelle': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
})
