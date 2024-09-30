import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from'vite-plugin-mkcert'
import macrosPlugin from 'vite-plugin-babel-macros'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), mkcert(), macrosPlugin()],  
  define: {
    'process.env': process.env
  },
})
