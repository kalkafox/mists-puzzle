import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('lottie')) {
            return 'lottie'
          }

          if (id.includes('iconify')) {
            return 'iconify'
          }

          if (id.includes('radix')) {
            return 'radix'
          }

          if (id.includes('react')) {
            return 'react'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
