from rest_framework import serializers
from .models import GeneratedPost

class GeneratedPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedPost
        fields = ['id', 'prompt', 'text', 'platform', 'created_at', 'status']
        # Говорим DRF, что id, text и created_at фронтенд присылать НЕ должен
        read_only_fields = ['id', 'text', 'created_at', 'status']
