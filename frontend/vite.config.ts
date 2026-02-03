import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/costco-bill-splitter/',
  server: {
    port: 9000,
    host: '0.0.0.0',
    allowedHosts: [
      '0ad256c30ad7.ngrok-free.app',
      'f32a76712c69.ngrok-free.app',
      'bd8a28c9ca0b.ngrok-free.app',
      '75f626d0364c.ngrok-free.app',
      'b31d9b35cb4e.ngrok-free.app',
      '4dab41ade21b.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true
      }
    }
  }
})
