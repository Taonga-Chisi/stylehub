from django.urls import path
from .views import (
    SignUpView, LoginView, LogoutView, MeView,
    AdminSalonsView, AdminSalonDecisionView, AdminSalonListingView, AdminMonthlyCommissionsView,
)

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path("login/",  LoginView.as_view(),  name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/",     MeView.as_view(),     name="auth-me"),
    path("admin/salons/", AdminSalonsView.as_view(), name="admin-salons"),
    path("admin/salons/<str:salon_id>/decision/", AdminSalonDecisionView.as_view(), name="admin-salon-decision"),
    path("admin/salons/<str:salon_id>/listing/", AdminSalonListingView.as_view(), name="admin-salon-listing"),
    path("admin/commissions/", AdminMonthlyCommissionsView.as_view(), name="admin-monthly-commissions"),
]
