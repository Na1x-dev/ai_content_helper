import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.contrib.auth.models import User
from posts.models import PricingPlan
from posts.models import AIPlatform, AITone


        
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



        # 4. Инициализация тарифных планов в БД
        self.stdout.write("💳 Проверка и создание тарифных планов...")
        
        default_plans = [
            {
                "code": "free",
                "title": "Базовый доступ",
                "subtitle": "Для знакомства с платформой",
                "price": 0,
                "period": "/ навсегда",
                "generations_limit": 3,
                "features": ["3 публикации в сутки", "Поддержка Telegram, VC.ru, X", "Стандартная скорость"],
                "is_popular": False,
                "weight": 0
            },
            {
                "code": "standard",
                "title": "Стандартный",
                "subtitle": "Для начинающих авторов",
                "price": 500,
                "period": "/ месяц",
                "generations_limit": 25,
                "features": ["25 публикаций в сутки", "Повышенная скорость генерации", "Улучшенное качество текста"],
                "is_popular": False,
                "weight": 1
            },
            {
                "code": "pro",
                "title": "Продвинутый",
                "subtitle": "Для активных блогеров",
                "price": 900,
                "period": "/ месяц",
                "generations_limit": 50,
                "features": ["50 публикаций в сутки", "Максимальная скорость генерации", "Аналитика стилей автора", "Поддержка 24/7"],
                "is_popular": True,
                "weight": 2
            },
            {
                "code": "max",
                "title": "Максимальный",
                "subtitle": "Для контент-студий",
                "price": 1600,
                "period": "/ месяц",
                "generations_limit": 100,
                "features": ["100 публикаций в сутки", "Выделенный сервер для генераций", "Доступ ко всем новым ИИ-моделям"],
                "is_popular": False,
                "weight": 3
            }
        ]

        for plan_data in default_plans:
            plan, created = PricingPlan.objects.update_or_create(
                code=plan_data["code"],
                defaults=plan_data
            )
            if created:
                self.stdout.write(f"  ➕ Создан тариф: {plan.title}")
            else:
                self.stdout.write(f"  🔄 Обновлен тариф: {plan.title}")
    





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



        self.stdout.write(" Проверка базовых настроек ИИ (Платформы и Тональности)...")

        AIPlatform.objects.update_or_create(
            code="tg",
            defaults={"name": "Telegram", "system_instruction": "Ты профессиональный блогер в Telegram. Напиши вовлекающий пост, используй абзацы и эмодзи. Будь краток."}
        )
        AIPlatform.objects.update_or_create(
            code="vc",
            defaults={"name": "VC.ru", "system_instruction": "Ты эксперт на VC.ru. Напиши структурированную статью с глубоким анализом и подзаголовками."}
        )
        AIPlatform.objects.update_or_create(
            code="tw",
            defaults={"name": "Twitter / X", "system_instruction": "Ты инфлюенсер в X. Напиши короткий цепляющий пост до 280 символов с хэштегами."}
        )
        
        AITone.objects.update_or_create(code="neutral", defaults={"name": "Нейтральный", "instruction_text": "Стиль: нейтральный, сбалансированный."})
        AITone.objects.update_or_create(code="friendly", defaults={"name": "Дружелюбный", "instruction_text": "Стиль: дружелюбный, теплый, разговорный."})
        AITone.objects.update_or_create(code="business", defaults={"name": "Деловой", "instruction_text": "Стиль: строгий, профессиональный, бизнес-язык."})
        AITone.objects.update_or_create(code="funny", defaults={"name": "Юмористический", "instruction_text": "Стиль: с легким юмором, иронией или шутками."})

