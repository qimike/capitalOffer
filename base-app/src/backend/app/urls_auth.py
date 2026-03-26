from django.urls import path
from app.views import AuthLoginView, AuthSignupView, AuthLogoutView

urlpatterns = [
    path('signup/', AuthSignupView.as_view(), name='signup'),
    path('login/', AuthLoginView.as_view(), name='login'),
    path('logout/', AuthLogoutView.as_view(), name='logout'),
]
