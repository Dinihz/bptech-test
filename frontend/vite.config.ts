import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Removed Tailwind Vite plugin because project uses Tailwind v3

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
})
