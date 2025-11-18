import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tailwindcss from '@tailwindcss/vite';
import RailsPlugin from 'vite-plugin-rails'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    devtools(),
    tailwindcss(),
    RailsPlugin(),
    react(),
  ]
})
