import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: {
    outDir: '../../dist/client',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/shared/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  }
})
