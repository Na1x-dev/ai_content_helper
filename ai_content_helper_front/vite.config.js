import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Загружаем локальный .env ТОЛЬКО если он физически существует локально (для разработки вне Docker)
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// https://vite.dev
export default defineConfig({
  plugins: [react(), tailwindcss()],
  /* 
     Блок define для VITE_ переменных больше НЕ нужен! 
     Vite сам автоматически подставит их в import.meta.env, 
     если они объявлены в системном окружении контейнера.
  */
});
