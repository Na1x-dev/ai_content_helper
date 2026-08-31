from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneratedPostViewSet
from .views import PricingPlanViewSet
# Роутер DRF автоматически генерирует правильные URL-адреса для всех CRUD операций
router = DefaultRouter()
router.register(r'posts', GeneratedPostViewSet, basename='posts')

urlpatterns = [
    path('', include(router.urls)),
]


router.register(r'plans', PricingPlanViewSet, basename='plans')
