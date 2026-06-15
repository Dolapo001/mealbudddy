from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    LogoutView,
    MeView,
    MyProfileView,
    PasswordForgotView,
    PasswordResetView,
    RegisterView,
    ResendVerificationView,
    VerifyEmailView,
)

auth_urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("auth/verify-email", VerifyEmailView.as_view(), name="auth-verify-email"),
    path("auth/resend-verification", ResendVerificationView.as_view(), name="auth-resend"),
    path("auth/password/forgot", PasswordForgotView.as_view(), name="auth-password-forgot"),
    path("auth/password/reset", PasswordResetView.as_view(), name="auth-password-reset"),
]

accounts_urlpatterns = [
    path("accounts/me", MeView.as_view(), name="accounts-me"),
    path("accounts/me/profile", MyProfileView.as_view(), name="accounts-me-profile"),
]
