from rest_framework import serializers
from .models import GeneratedPost
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import PricingPlan


class GeneratedPostSerializer(serializers.ModelSerializer):
    length = serializers.CharField(write_only=True, required=False, default='medium')


    class Meta:
        model = GeneratedPost
        fields = ['id', 'prompt', 'text', 'platform', 'created_at', 'status', 'length']
        # Говорим DRF, что id, text и created_at фронтенд присылать НЕ должен
        read_only_fields = ['id', 'text', 'created_at', 'status']


class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = '__all__'
