from django.contrib import admin
from django.urls import path, include
from app.views import health

urlpatterns = [
    path('health/', health, name='health'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('app.urls_auth')),
    path('api/offers/', include('app.urls_offers')),
    path('api/lenders/', include('app.urls_lenders')),
    path('api/profile/', include('app.urls_profile')),
    path('api/notifications/', include('app.urls_notifications')),
]
