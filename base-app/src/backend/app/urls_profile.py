from django.urls import path
from app.views import ProfileUpdateView

urlpatterns = [
    path('', ProfileUpdateView.as_view(), name='profile-view'),
]
