import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        // Объявляем глобальные переменные, чтобы линтер на них не ругался
        google: "readonly",
        process: "readonly",
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // --- ДОБАВЛЯЕМ ПРАВИЛА ИСКЛЮЧЕНИЙ ---
    rules: {
      // Переводим ошибку неиспользуемых переменных в разряд предупреждений (не ломает CI)
      "no-unused-vars": "warn",
      "react-refresh/only-export-components": "off",
    },
  },
]);
