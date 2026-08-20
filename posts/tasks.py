from celery import shared_task
from .models import GeneratedPost
from .services import PostGenerationService

@shared_task
def task_generate_ai_post(post_id):
    """Фоновая задача для генерации текста постов через API нейросети"""
    try:
        post = GeneratedPost.objects.get(id=post_id)
    except GeneratedPost.DoesNotExist:
        return f"Пост с ID {post_id} не найден."

    try:
        # Тяжелый запрос в AI, воркер зависнет на пару секунд, но юзер этого не заметит
        generated_text = PostGenerationService.generate_post_text(post.prompt, post.platform)
        
        # Обновляем пост
        post.text = generated_text
        post.status = 'completed'
        post.save()
        return f"Пост {post_id} успешно сгенерирован."
        
    except Exception as e:
        post.status = 'failed'
        post.save()
        return f"Ошибка при генерации поста {post_id}: {str(e)}"
