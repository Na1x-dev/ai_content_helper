from django.contrib import admin
from .models import GeneratedPost, UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'generations_left', 'last_reset')
    list_filter = ('plan', 'last_reset')
    search_fields = ('user__username', 'user__email')

@admin.register(GeneratedPost)
class GeneratedPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'prompt', 'platform', 'created_at')
    list_filter = ('platform', 'created_at', 'user')
    search_fields = ('prompt', 'text')
