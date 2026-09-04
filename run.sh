#!/bin/bash

# Останавливаем скрипт при любой ошибке
set -e

echo "🚀 Запуск AI Content Helper..."

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "⚠️  Файл .env не найден. Копирую из .env.example..."
        cp .env.example .env
        echo "🛑 Пожалуйста, откройте файл .env, заполните OPENAI_API_KEY и запустите run.sh снова."
        exit 1
    else
        echo "❌ Ошибка: Файлы .env и .env.example отсутствуют!"
        exit 1
    fi
fi

# Запуск контейнеров в фоновом режиме (detached)
echo "📦 Сборка и запуск Docker контейнеров..."
docker compose up --build -d

echo "🟢 Проект успешно запущен!"
echo "💻 Фронтенд (Caddy): http://localhost"
echo "⚙️  Бэкенд API:       http://localhost/api/"
echo "👑 Админка Django:   http://localhost/admin/"
echo ""
echo "📝 Для просмотра логов в реальном времени используйте: docker compose logs -f"
