import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Some environments behave inconsistently with localhost vs 127.0.0.1.
    // 0.0.0.0 keeps it reachable via both localhost and LAN IP.
    host: '0.0.0.0', // listen on all interfaces
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true
      }
    }
  }
})
