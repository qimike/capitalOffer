from django.urls import path
from app.views import OfferViewSet, OfferDetailEndpoint

urlpatterns = [
    path('', OfferViewSet.as_view({'get': 'list', 'post': 'create'}), name='offer-list'),
    path('browse/', OfferViewSet.as_view({'get': 'browse_list'}), name='offer-browse-list'),
    path('<int:pk>/', OfferViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='offer-detail'),
    path('<int:pk>/actions/<str:action>/', OfferDetailEndpoint.as_view(), name='offer-action'),
]
