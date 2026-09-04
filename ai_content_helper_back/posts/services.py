import os
import time
from openai import OpenAI
from rest_framework.exceptions import ValidationError
from .models import AIPlatform

class PostGenerationService:
    @staticmethod
    def _get_ai_client():
        base_url = os.getenv("OPENAI_BASE_URL", "https://openai.com")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        return OpenAI(api_key=api_key, base_url=base_url)

    @classmethod
    def generate_post_text(cls, prompt: str, platform_code: str) -> str:
        # Динамически ищем системную инструкцию в базе данных
        try:
            platform_obj = AIPlatform.objects.get(code=platform_code)
            system_instruction = platform_obj.system_instruction
        except AIPlatform.DoesNotExist:
            system_instruction = "Напиши вовлекающий пост на заданную тему."

        client = cls._get_ai_client()

        # Режим заглушки
        if not client or os.getenv("AI_MOCK_MODE", "False") == "True":
            time.sleep(2)
            return f"[MOCK AI - {platform_code.upper()}]: Отличный пост по теме '{prompt}'. Подключите рабочий API-ключ!"

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Тема поста: {prompt}"}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            raise ValidationError({
                "error": "Ошибка генерации контента через внешнюю нейросеть.",
                "details": str(e)
            })
