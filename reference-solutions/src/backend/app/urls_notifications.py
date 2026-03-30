from django.urls import path
from rest_framework.routers import DefaultRouter
from app.views import NotificationViewSet

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = router.urls
