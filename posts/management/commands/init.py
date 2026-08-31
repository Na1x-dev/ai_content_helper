import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Автоматическая настройка Sites, Google Auth и суперпользователя при старте"

    def handle(self, *args, **options):
        self.stdout.write("🛠️ Запуск инициализации данных...")

        # 1. Настройка Django Site (allauth привязывает приложения к сайтам)
        site_id = int(os.getenv("SITE_ID", 1))
        domain = "localhost:8000"  # или ваш домен разработки
        
        site, created = Site.objects.get_or_create(id=site_id)
        site.domain = domain
        site.name = "AI Content Studio"
        site.save()
        self.stdout.write(f"✅ Django Site настроен: {domain} (ID: {site_id})")

        # 2. Настройка Google OAuth приложения из переменных окружения (.env)
        client_id = os.getenv("VITE_GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

        if client_id and client_secret:
            # Создаем или обновляем настройки провайдера
            app, app_created = SocialApp.objects.get_or_create(
                provider="google",
                name="Google OAuth Front"
            )
            app.client_id = client_id
            app.secret = client_secret
            app.sites.set([site])  # Привязываем к текущему сайту
            app.save()
            self.stdout.write("✅ Настройки Google Auth успешно применены!")
        else:
            self.stdout.write(self.style.WARNING("⚠️ ВНИМАНИЕ: VITE_GOOGLE_CLIENT_ID или SECRET не найдены в .env. Настройка Google Auth пропущена."))

        # 3. Бонус: Автоматическое создание суперпользователя для админки, если его нет
        admin_user = os.getenv("ADMIN_USER", "admin")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "1234")

        if not User.objects.filter(username=admin_user).exists():
            User.objects.create_superuser(
                username=admin_user, 
                email=admin_email, 
                password=admin_password
            )
            self.stdout.write(f"👑 Суперпользователь создан! Логин: {admin_user}, Пароль: {admin_password}")
        else:
            self.stdout.write("ℹ️ Суперпользователь уже существует.")

        self.stdout.write(self.style.SUCCESS("🎉 Инициализация базы данных успешно завершена!"))
