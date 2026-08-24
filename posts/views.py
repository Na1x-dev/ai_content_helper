from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User

from .models import GeneratedPost, UserProfile
from .serializers import GeneratedPostSerializer
from .tasks import task_generate_ai_post  # Импортируем задачу

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
import os


class GeneratedPostViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedPostSerializer
    
    def get_queryset(self):
        return GeneratedPost.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        today = timezone.now().date()
        
        if profile.last_reset < today:
            profile.generations_left = 3 if profile.plan == 'free' else 100
            profile.last_reset = today
            profile.save()

        if profile.generations_left <= 0:
            raise ValidationError({"error": "Вы исчерпали дневной лимит генераций."})

        # Списываем лимит сразу при отправке в очередь
        profile.generations_left -= 1
        profile.save()

        # Сохраняем пост в базу со статусом по умолчанию ('processing')
        # Так как text теперь необязателен на уровне БД, передавать пустую строку не нужно
        post = serializer.save(user=user)
        task_generate_ai_post.delay(post.id)


class GoogleLogin(SocialLoginView):
    """
    Эндпоинт для входа через Google Account.
    Фронтенд отправляет нам 'access_token' или 'code' от Google,
    а этот класс проверяет его, регистрирует юзера и возвращает JWT.
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    
    # URL, который мы указали в Google Cloud Console на Шаге 1
    callback_url = 'http://127.0.0.1:8000/accounts/google/login/callback/'

    @property
    def callback_url_computed(self):
        return self.callback_url
