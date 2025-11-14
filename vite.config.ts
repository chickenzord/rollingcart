import { defineConfig } from 'vite'
import RubyPlugin from 'vite-plugin-ruby'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    RubyPlugin(),
    react(),
  ],
  define: {
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV),
  },
})
