import os
from celery import Celery

# Устанавливаем дефолтные настройки Django для Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # замени 'core' на имя твоей папки с settings.py

app = Celery('ai_saas')

# Читаем конфигурацию из settings.py, префикс настроек для Celery — CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически ищем задачи (tasks.py) во всех приложениях
app.autodiscover_tasks()
