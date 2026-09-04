import os
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GeneratedPost, UserProfile, AITone
from .serializers import GeneratedPostSerializer
from .tasks import task_generate_ai_post

from django.db import transaction
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
    @transaction.atomic
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
        tone_code = self.request.data.get('tone', 'neutral')
        try:
            tone_obj = AITone.objects.get(code=tone_code)
            selected_tone_instruction = tone_obj.instruction_text
        except AITone.DoesNotExist:
            selected_tone_instruction = "Тональность: нейтральная."

        # 2. ИЗВЛЕКАЕМ ДЛИНУ ТЕКСТА (Новая логика!)
        length_code = self.request.data.get('length', 'medium')
        length_mapping = {
            "short": "Объём: ультра-краткий емкий текст, не более 100 слов. Пиши строго по сути.",
            "medium": "Объём: сбалансированный текст средней длины, примерно 200-250 слов.",
            "long": "Объём: подробный развернутый лонгрид, около 500 слов, с глубоким раскрытием темы."
        }
        selected_length_instruction = length_mapping.get(length_code, length_mapping["medium"])


        # Склеиваем основной текст промпта с инструкцией тональности для OpenAI
        full_prompt = f"{serializer.validated_data['prompt']} [{selected_tone_instruction}] [{selected_length_instruction}]"

        if 'length' in serializer.validated_data:
            serializer.validated_data.pop('length')
        
        # Сохраняем пост в БД со статусом 'processing' и отправляем в Celery
        post = serializer.save(user=user, prompt=full_prompt)
        transaction.on_commit(lambda: task_generate_ai_post.delay(post.id))


class GoogleLogin(SocialLoginView):
    """Эндпоинт для входа через Google Account"""
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client

    @property
    def callback_url(self):
        return os.getenv("GOOGLE_AUTH_CALLBACK_URL", "http://localhost:5173")

    def post(self, request, *args, **kwargs):
        if 'access_token' in request.data and 'id_token' not in request.data:
            request.data['id_token'] = request.data['access_token']
        return super().post(request, *args, **kwargs)



class PricingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    permission_classes = [AllowAny]
