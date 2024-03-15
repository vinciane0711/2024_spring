import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import dsv from '@rollup/plugin-dsv'

// https://vitejs.dev/config/
// https://vitejs.dev/guide/static-deploy#github-pages
export default defineConfig({
  base: '/2024_spring/',
  plugins: [vue(), dsv()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
  },
})
