from unittest.mock import patch
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from posts.models import PricingPlan, UserProfile, GeneratedPost, AIPlatform
from posts.services import PostGenerationService


class AIContentAppTestCase(APITestCase):

    def setUp(self):
        """[Arrange] Создаем базовое окружение для всех тестов."""
        # 1. Создаем тарифные планы
        self.free_plan = PricingPlan.objects.create(
            code="free", title="Базовый", subtitle="Free", 
            price=0, period="/навсегда", generations_limit=3, features=[]
        )
        self.pro_plan = PricingPlan.objects.create(
            code="pro", title="Продвинутый", subtitle="Pro", 
            price=900, period="/месяц", generations_limit=50, features=[]
        )

        # 2. Создаем системную инструкцию для платформы (нужно для сервиса)
        self.platform_tg = AIPlatform.objects.create(
            code="tg", name="Telegram", 
            system_instruction="Ты блогер. Пиши кратко."
        )

        # 3. Создаем пользователя
        self.user = User.objects.create_user(
            username="dev_user", password="securepassword123"
        )
        self.profile = self.user.profile
        
        # Ссылки на эндпоинты
        self.limits_url = reverse('posts-user-limits')
        self.buy_premium_url = reverse('posts-buy-premium')
        self.posts_list_url = reverse('posts-list')

    # =========================================================================
    # БЛОК 1: ТЕСТЫ ЛИМИТОВ И ДОСТУПА 
    # =========================================================================
    def test_user_limits_returns_correct_data(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.limits_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["generations_left"], 3)

    def test_user_limits_unauthorized_fails(self):
        response = self.client.get(self.limits_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================================================================
    # БЛОК 2: ТЕСТЫ СМЕНЫ ТАРИФА
    # =========================================================================
    def test_buy_premium_successfully_changes_plan(self):
        """Проверяем, что при отправке кода тарифа лимиты обновляются."""
        self.client.force_authenticate(user=self.user)
        
        # Отправляем POST запрос на покупку тарифа 'pro'
        response = self.client.post(self.buy_premium_url, data={"plan": "pro"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        # Перепроверяем профиль в базе данных
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.plan, self.pro_plan)
        self.assertEqual(self.profile.generations_left, 50)  # Лимит вырос до 50

    def test_buy_premium_invalid_plan_fails(self):
        """Проверяем реакцию на несуществующий тариф."""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(self.buy_premium_url, data={"plan": "unexisting_slug"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    # =========================================================================
    # БЛОК 3: ТЕСТЫ ЛОГИКИ СОЗДАНИЯ ПОСТА И СПИСАНИЯ ЛИМИТОВ
    # =========================================================================
    def test_create_post_deducts_generation_limit(self):
        """Проверяем, что создание поста списывает 1 генерацию."""
        self.client.force_authenticate(user=self.user)
        
        post_data = {
            "prompt": "Как выучить Python за неделю",
            "platform": "tg",
            "tone": "neutral",
            "length": "short"
        }
        
        # Отправляем запрос на генерацию
        response = self.client.post(self.posts_list_url, data=post_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Проверяем, что лимит уменьшился: было 3, стало 2
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.generations_left, 2)

    def test_create_post_fails_when_limit_is_zero(self):
        """Проверяем защиту: нельзя генерировать, если лимит исчерпан."""
        self.client.force_authenticate(user=self.user)
        
        # Искусственно обнуляем лимит пользователя
        self.profile.generations_left = 0
        self.profile.save()

        post_data = {"prompt": "Любая тема", "platform": "tg"}
        
        response = self.client.post(self.posts_list_url, data=post_data)
        
        # Сервер должен выдать ошибку валидации (400 Bad Request)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"], "Вы исчерпали дневной лимит генераций.")

    # =========================================================================
    # БЛОК 4: ЮНИТ-ТЕСТ СЕРВИСА И MOCK СИМУЛЯЦИЯ ИИ
    # =========================================================================
    @patch('posts.services.os.getenv')
    def test_post_generation_service_mock_mode(self, mock_getenv):
        """
        Проверяем, как ведет себя сервис, когда включен режим заглушки 
        (AI_MOCK_MODE=True). Реальный ИИ не вызывается.
        """
        # Симулируем, что getenv возвращает AI_MOCK_MODE = "True"
        mock_getenv.side_effect = lambda key, default=None: "True" if key == "AI_MOCK_MODE" else default

        result = PostGenerationService.generate_post_text(
            prompt="Тестовый промпт", platform_code="tg"
        )
        
        # Проверяем, что вернулась ожидаемая строка-заглушка
        self.assertIn("[MOCK AI - TG]", result)

    @patch('posts.services.OpenAI')
    def test_post_generation_service_real_api_call(self, mock_openai_class):
        """
        [Продвинутый тест] Проверяем логику обработки ответа от OpenAI.
        Мы подменяем настоящий класс OpenAI его "фальшивой" копией (Mock).
        """
        # Настраиваем структуру фальшивого ответа, которую ожидает наш сервис:
        # client.chat.completions.create().choices[0].message.content
        mock_client = mock_openai_class.return_value
        mock_response = mock_client.chat.completions.create.return_value
        mock_message = mock_response.choices[0].message
        mock_message.content = "Это потрясающий текст, сгенерированный ИИ!"

        # Принудительно отключаем mock-режим для этого теста
        with patch('posts.services.os.getenv', return_value="False"):
            result = PostGenerationService.generate_post_text(
                prompt="Пишем про юнит-тесты", platform_code="tg"
            )

        # Сервер должен вернуть именно тот текст, который мы подложили в Mock
        self.assertEqual(result, "Это потрясающий текст, сгенерированный ИИ!")
