import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// STRICT REQUIREMENT: base must match the GitHub repository name exactly,
// or all asset paths (JS/CSS/icons) will 404 on GitHub Pages.
// If you rename the repo, update this value to match.
const REPO_NAME = 'Remote-Script-Automation-Trigger-Panel'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Remote Script & Automation Trigger Panel',
        short_name: 'Script Trigger',
        description:
          'Securely trigger pre-configured maintenance scripts (n8n webhooks / cloud functions) from the plant floor, gated behind Face ID.',
        theme_color: '#14171A',
        background_color: '#14171A',
        display: 'standalone',
        orientation: 'portrait',
        scope: `/${REPO_NAME}/`,
        start_url: `/${REPO_NAME}/`,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // App shell + static assets are cached for offline use.
        // Webhook POST requests are intentionally NOT cached — a stale
        // "success" for a script trigger would be actively dangerous.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: `/${REPO_NAME}/index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'app-shell' }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
