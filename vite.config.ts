import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/hb-story/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1600,
    target: 'es2022',
  },
})