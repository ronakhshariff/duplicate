import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // changed from 3000 to avoid conflict with backend
    open: true,
    // proxy API calls to backend
    proxy: {
      '/dev': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  assetsInclude: ['**/*.PNG', '**/*.png']
})
