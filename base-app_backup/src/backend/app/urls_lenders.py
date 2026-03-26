from django.urls import path
from app.views import LenderViewSet

urlpatterns = [
    path('', LenderViewSet.as_view({'get': 'list'}), name='lender-list'),
    path('<int:pk>/', LenderViewSet.as_view({'get': 'retrieve'}), name='lender-detail'),
]
