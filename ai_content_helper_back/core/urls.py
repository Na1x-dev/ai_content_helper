
from django.contrib import admin
from django.urls import path, include
from posts.views import GoogleLogin

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('posts.urls')),
        # Эндпоинты аутентификации (вход, выход, смена пароля)
    path('api/auth/', include('dj_rest_auth.urls')),
    # Эндпоинт регистрации
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    # Новый эндпоинт для авторизации через Google!
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    
    
]


