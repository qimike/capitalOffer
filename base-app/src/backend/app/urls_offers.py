from django.urls import path
from app.views import OfferViewSet, OfferDetailEndpoint

urlpatterns = [
    path('', OfferViewSet.as_view({'get': 'list', 'post': 'create'}), name='offer-list'),
    path('<int:pk>/', OfferViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='offer-detail'),
    path('<int:pk>/accept/', OfferDetailEndpoint.as_view(), name='offer-accept'),
    path('<int:pk>/decline/', OfferDetailEndpoint.as_view(), name='offer-decline'),
]
