import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import dotenv from 'dotenv'

// Явно загружаем файл .env из корня проекта (на один уровень выше)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// https://vite.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(process.env.GOOGLE_CLIENT_ID)
  }
})
