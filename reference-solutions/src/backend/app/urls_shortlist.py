from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.views import ShortlistViewSet

router = DefaultRouter()
router.register(r'', ShortlistViewSet, basename='shortlist')

urlpatterns = router.urls
