#!/bin/bash
echo "🚀 Запуск процесса развертывания AI Content Helper..."

# Создаем .env из примера, если его нет
if [ ! -f .env ]; then
    echo "📄 Создаю файл .env на основе шаблона..."
    cp .env.example .env
fi

echo "📦 Сборка и запуск контейнеров в Docker..."
docker compose down
docker compose up --build -d

echo "✨ Готово! Сервис поднимается:"
echo "🔗 Фронтенд: http://localhost:5173"
echo "🔗 Бэкенд API: http://localhost:8000/api/"
docker compose logs -f web
