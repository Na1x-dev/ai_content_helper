# ai_content_helper_front/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

# Открываем порт Vite (по умолчанию 5173)
EXPOSE 5173

# Запускаем Vite с флагом --host, чтобы порт пробрасывался наружу
CMD ["npm", "run", "dev", "--", "--host"]
