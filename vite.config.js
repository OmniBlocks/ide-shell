import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, 
      },
      manifest: {
        name: 'OmniBlocks',
        short_name: 'OmniBlocks',
        start_url: '.',
        display: 'standalone',
        background_color: '#1e1e1e',
        theme_color: '#1e1e1e',
        description: 'A powerful IDE with both block-based programming and serious languages like JavaScript and Python.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  base: './',
})