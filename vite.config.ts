import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from'vite-plugin-mkcert'
import macrosPlugin from 'vite-plugin-babel-macros'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(), 
    mkcert(), 
    macrosPlugin(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: '오픈하냥',
        short_name: '오픈하냥',
        description: '한양대학교 ERICA캠퍼스 배리어프리맵',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg',
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg',
          },
        ],
      },
    }),
  ],  
  define: {
    'process.env': process.env
  },
})
