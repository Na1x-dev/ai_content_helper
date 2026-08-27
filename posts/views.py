import os
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GeneratedPost, UserProfile
from .serializers import GeneratedPostSerializer
from .tasks import task_generate_ai_post

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

class GeneratedPostViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedPostSerializer

    def get_queryset(self):
        return GeneratedPost.objects.filter(user=self.request.user)

    # 1. Получение лимитов и автосброс раз в сутки с учетом новых тарифов
    @action(detail=False, methods=['get'], url_path='user-limits')
    def user_limits(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        today = timezone.now().date()
        
        if profile.last_reset < today:
            # Маппинг тарифов на количество ежедневных генераций
            limits_map = {
                'free': 3,
                'standard': 25,
                'pro': 50,
                'max': 100
            }
            profile.generations_left = limits_map.get(profile.plan, 3)
            profile.last_reset = today
            profile.save()
            
        return Response({
            "plan": profile.get_plan_display(),
            "plan_code": profile.plan, # Передаем код тарифа на фронтенд для подсветки активного
            "generations_left": profile.generations_left
        })


    # 2. Симуляция оплаты тарифа (теперь принимает тип тарифа в body)
        # posts/views.py внутри GeneratedPostViewSet
        # posts/views.py внутри GeneratedPostViewSet
    @action(detail=False, methods=['post'], url_path='buy-premium')
    def buy_premium(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        chosen_plan = request.data.get('plan')
        
        # Маппинг лимитов для всех доступных планов
        plan_limits = {
            'free': 3,
            'standard': 25,
            'pro': 50,
            'max': 100
        }
        
        if chosen_plan not in plan_limits:
            return Response({"success": False, "message": "Неверный тарифный план"}, status=400)
            
        # Меняем тариф на любой выбранный (хоть апгрейд, хоть даунгрейд)
        profile.plan = chosen_plan
        profile.generations_left = plan_limits[chosen_plan]
        profile.save()
        
        return Response({
            "success": True,
            "message": f"Вы успешно переключились на тариф «{profile.get_plan_display()}»!",
            "plan": profile.get_plan_display(),
            "generations_left": profile.generations_left
        })



    # 3. Улучшение: Перехват и внедрение тональности текста (Style/Tone)
    def perform_create(self, serializer):
        user = self.request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        today = timezone.now().date()
                # Находим эту строчку в perform_create и меняем старый if-else на динамический маппинг:
        if profile.last_reset < today:
            limits_map = {'free': 3, 'standard': 25, 'pro': 50, 'max': 100}
            profile.generations_left = limits_map.get(profile.plan, 3)
            profile.last_reset = today
            profile.save()

            
        if profile.generations_left <= 0:
            raise ValidationError({"error": "Вы исчерпали дневной лимит генераций."})
            
        # Списываем лимит
        profile.generations_left -= 1
        profile.save()

        # Вытаскиваем тональность из входящего JSON от фронтенда
        tone = self.request.data.get('tone', 'neutral')
        tone_labels = {
            'friendly': 'Тональность: дружелюбная, теплая и разговорная.',
            'business': 'Тональность: строгая, профессиональная, деловая.',
            'funny': 'Тональность: с юмором, легкой иронией или шутками.',
            'neutral': 'Тональность: сбалансированная, нейтральная.'
        }
        selected_tone_instruction = tone_labels.get(tone, '')

        # Склеиваем основной текст промпта с инструкцией тональности для OpenAI
        full_prompt = f"{serializer.validated_data['prompt']} [{selected_tone_instruction}]"
        
        # Сохраняем пост в БД со статусом 'processing' и отправляем в Celery
        post = serializer.save(user=user, prompt=full_prompt)
        task_generate_ai_post.delay(post.id)

class GoogleLogin(SocialLoginView):
    """Эндпоинт для входа через Google Account"""
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = 'http://127.0.0'

    @property
    def callback_url_computed(self):
        return self.callback_url

    def post(self, request, *args, **kwargs):
        if 'access_token' in request.data and 'id_token' not in request.data:
            request.data['id_token'] = request.data['access_token']
        return super().post(request, *args, **kwargs)
