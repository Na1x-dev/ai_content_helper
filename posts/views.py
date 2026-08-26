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
from rest_framework.decorators import action
from rest_framework.response import Response
import os




class GeneratedPostViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedPostSerializer
    
    def get_queryset(self):
        return GeneratedPost.objects.filter(user=self.request.user)

 # --- НОВЫЙ МЕТОД ДЛЯ ПОЛУЧЕНИЯ ЛИМИТОВ ---
    @action(detail=False, methods=['get'], url_path='user-limits')
    def user_limits(self, request):
        """Возвращает информацию о текущем тарифе и лимитах пользователя"""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        
        # Проверяем и сбрасываем лимит, если наступил новый день
        today = timezone.now().date()
        if profile.last_reset < today:
            profile.generations_left = 3 if profile.plan == 'free' else 100
            profile.last_reset = today
            profile.save()

        return Response({
            "plan": profile.get_plan_display(), # Вернет "Бесплатный" или "Премиум" вместо free/premium
            "generations_left": profile.generations_left
        })


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
    Использует стандартный GoogleOAuth2Adapter, но дублирует токен в id_token.
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = 'http://127.0.0'

    @property
    def callback_url_computed(self):
        return self.callback_url

    def post(self, request, *args, **kwargs):
        # Из-за новой кнопки Google Identity Services фронтенд присылает нам JWT-токен.
        # Чтобы allauth не шел в сеть и не падал, мы дублируем его в поле 'id_token'.
        if 'access_token' in request.data and 'id_token' not in request.data:
            request.data['id_token'] = request.data['access_token']
            
        return super().post(request, *args, **kwargs)
