import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_API_PROXY = process.env.VITE_DEV_API_ORIGIN || 'http://127.0.0.1:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: DEV_API_PROXY,
        changeOrigin: true,
      },
      '/uploads': {
        target: DEV_API_PROXY,
        changeOrigin: true,
      },
    },
  },
})
