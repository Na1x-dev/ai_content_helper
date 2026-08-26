from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import GeneratedPost, UserProfile

# Позволяет редактировать профиль прямо внутри страницы пользователя
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Профиль SaaS'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'get_plan', 'get_limits', 'is_staff')
    
    def get_plan(self, instance):
        return instance.profile.get_plan_display()
    get_plan.short_description = 'Тариф'

    def get_limits(self, instance):
        return instance.profile.generations_left
    get_limits.short_description = 'Осталось генераций'

# Перерегистрируем стандартную модель User
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(GeneratedPost)
class GeneratedPostAdmin(admin.ModelAdmin):
    list_display = ('user', 'prompt', 'platform', 'status', 'created_at')
    list_filter = ('platform', 'status', 'created_at', 'user')
    search_fields = ('prompt', 'text')
