from django.urls import path
from .views import SignUpView, LoginView, LogoutView, MeView

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path("login/",  LoginView.as_view(),  name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/",     MeView.as_view(),     name="auth-me"),
]
