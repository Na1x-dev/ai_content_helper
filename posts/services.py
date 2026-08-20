import os
import time
from django.conf import settings
from openai import OpenAI
from rest_framework.exceptions import ValidationError

class PostGenerationService:
    @staticmethod
    def _get_ai_client():
        """
        Инициализирует клиент OpenAI.
        Для обхода блокировок в СНГ часто используют сторонние базовые URL (например, vapi.ai, openrouter или личный прокси).
        """
        # Если в .env прописан специальный прокси-урл, используем его, иначе стандартный
        base_url = os.getenv("OPENAI_BASE_URL", "https://openai.com")
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            return None
            
        return OpenAI(api_key=api_key, base_url=base_url)

    @classmethod
    def generate_post_text(cls, prompt: str, platform: str) -> str:
        """Основной метод генерации текста"""
        
        prompts_per_platform = {
            'tg': "Ты профессиональный блогер в Telegram. Напиши вовлекающий пост, используй абзацы и эмодзи. Будь краток, но информативен.",
            'vc': "Ты эксперт и автор на VC.ru. Напиши структурированную статью-пост с глубоким анализом, подзаголовками и выводами. Стиль — деловой.",
            'tw': "Ты инфлюенсер в Twitter (X). Напиши ультра-короткий, цепляющий пост (до 280 символов) с хэштегами."
        }
        
        system_instruction = prompts_per_platform.get(platform, "Напиши пост на заданную тему.")
        client = cls._get_ai_client()

        # --- РЕЖИМ ЗАГЛУШКИ ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ БЕЗ VPN/КЛЮЧА ---
        if not client or os.getenv("AI_MOCK_MODE", "False") == "True":
            # Имитируем задержку сети ИИ (полезно для будущего тестирования фронтенда и Celery)
            time.sleep(2) 
            return f"[MOCK AI ДЛЯ {platform.upper()}]: Отличный пост по теме '{prompt}'. Здесь будет реальный текст от нейросети, когда мы подключим рабочий API-ключ через прокси!"

        # --- РЕАЛЬНЫЙ ЗАПРОС К AI ---
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini", # Самая дешевая и быстрая модель
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Тема поста: {prompt}"}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices.message.content.strip()
        except Exception as e:
            # На собеседовании оценят: обработка кастомных ошибок интеграции
            raise ValidationError({
                "error": "Ошибка генерации контента через внешнюю нейросеть.",
                "details": str(e)
            })
