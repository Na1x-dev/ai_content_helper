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

from .serializers import PricingPlanSerializer
from .models import PricingPlan
from rest_framework.permissions import AllowAny


class GeneratedPostViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedPostSerializer

    def get_queryset(self):
        return GeneratedPost.objects.filter(user=self.request.user)

       # 1. Получение лимитов и автосброс раз в сутки из параметров модели PricingPlan
    @action(detail=False, methods=['get'], url_path='user-limits')
    def user_limits(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        today = timezone.now().date()
        
        if profile.last_reset < today:
            # Больше никаких limits_map! Берем лимит напрямую из привязанного тарифа
            profile.generations_left = profile.plan.generations_limit
            profile.last_reset = today
            profile.save()
            
        return Response({
            "plan": profile.plan.title,
            "plan_code": profile.plan.code,
            "generations_left": profile.generations_left
        })

    # 2. Симуляция смены тарифа (динамический поиск в БД)
    @action(detail=False, methods=['post'], url_path='buy-premium')
    def buy_premium(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        chosen_plan_code = request.data.get('plan')
        
        # Ищем тариф в базе данных
        try:
            chosen_plan = PricingPlan.objects.get(code=chosen_plan_code)
        except PricingPlan.DoesNotExist:
            return Response({"success": False, "message": "Неверный тарифный план"}, status=400)
            
        # Меняем тариф и сразу обновляем дневной лимит
        profile.plan = chosen_plan
        profile.generations_left = chosen_plan.generations_limit
        profile.save()
        
        return Response({
            "success": True,
            "message": f"Вы успешно переключились на тариф «{chosen_plan.title}»!",
            "plan": chosen_plan.title,
            "generations_left": profile.generations_left
        })




    # 3. Улучшение: Перехват и внедрение тональности текста (Style/Tone)
    def perform_create(self, serializer):
        user = self.request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        today = timezone.now().date()
                # Находим эту строчку в perform_create и меняем старый if-else на динамический маппинг:
        if profile.last_reset < today:
            profile.generations_left = profile.plan.generations_limit
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
    callback_url = 'http://127.0.0.1'

    @property
    def callback_url_computed(self):
        return self.callback_url

    def post(self, request, *args, **kwargs):
        if 'access_token' in request.data and 'id_token' not in request.data:
            request.data['id_token'] = request.data['access_token']
        return super().post(request, *args, **kwargs)



class PricingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [AllowAny]
