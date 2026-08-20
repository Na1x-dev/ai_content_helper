from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    PLAN_CHOICES = [
        ('free', 'Бесплатный'),
        ('premium', 'Премиум'),
    ]

    # OneToOneField гарантирует, что у одного юзера может быть строго один профиль
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', verbose_name="Пользователь")
    
    # Текущий тарифный план
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free', verbose_name="Тариф")
    
    # Сколько генераций осталось на сегодня
    generations_left = models.IntegerField(default=3, verbose_name="Осталось генераций")
    
    # Дата последнего обновления лимитов (чтобы сбрасывать счетчик раз в сутки)
    last_reset = models.DateField(auto_now_add=True, verbose_name="Дата сброса лимитов")

    def __str__(self):
        return f"Профиль {self.user.username} | Тариф: {self.plan} | Лимит: {self.generations_left}"

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"


# --- СИГНАЛЫ АВТОСОЗДАНИЯ ПРОФИЛЯ ---
# Этот код автоматически создаст UserProfile, как только в базе появится новый User
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class GeneratedPost(models.Model):
    PLATFORM_CHOICES = [
        ('tg', 'Telegram'),
        ('vc', 'VC.ru'),
        ('tw', 'Twitter/X'),
    ]

    STATUS_CHOICES = [
        ('processing', 'Генерируется ИИ'),
        ('completed', 'Готово'),
        ('failed', 'Ошибка генерации'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    prompt = models.CharField(max_length=255, verbose_name="Запрос пользователя")
    text = models.TextField(verbose_name="Текст поста", blank=True, null=True)
    platform = models.CharField(max_length=2, choices=PLATFORM_CHOICES, default='tg', verbose_name="Платформа")
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='processing', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Сгенерированный пост"
        verbose_name_plural = "Сгенерированные посты"
        ordering = ['-created_at']
