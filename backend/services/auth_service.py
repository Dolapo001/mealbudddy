"""AuthService — isolates all auth side effects behind a single seam so the
views stay thin and an OAuth adapter can slot in later (per the blueprint).
"""
from django.db import transaction

from apps.accounts.models import User
from apps.accounts.serializers import tokens_for_user
from apps.accounts.tokens import (
    make_reset_token,
    make_verification_token,
    read_reset_token,
    read_verification_token,
)
from tasks.email import send_password_reset_email, send_verification_email


class AuthError(Exception):
    """Raised for auth flow failures that should surface as 400s."""


class AuthService:
    @staticmethod
    @transaction.atomic
    def register(*, first_name, last_name, student_code, email, department, password) -> dict:
        user = User.objects.create_user(
            email=email,
            password=password,
            student_code=student_code,
            first_name=first_name,
            last_name=last_name,
            department=department or ""
        )
        AuthService.dispatch_verification(user)
        return {"user": user, "tokens": tokens_for_user(user)}

    @staticmethod
    def login(user) -> dict:
        return {"user": user, "tokens": tokens_for_user(user)}

    # --- email verification ------------------------------------------------ #
    @staticmethod
    def dispatch_verification(user) -> None:
        if user.is_email_verified:
            return
        token = make_verification_token(user)
        send_verification_email.delay(str(user.id), user.email, token)

    @staticmethod
    def verify_email(token: str) -> User:
        user_id = read_verification_token(token)
        if not user_id:
            raise AuthError("This verification link is invalid or has expired.")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthError("Account not found.")
        if not user.is_email_verified:
            user.is_email_verified = True
            user.save(update_fields=["is_email_verified", "updated_at"])
        return user

    @staticmethod
    def resend_verification(email: str) -> None:
        # Always succeed silently to avoid leaking which emails exist.
        user = User.objects.filter(email=email.lower()).first()
        if user:
            AuthService.dispatch_verification(user)

    # --- password reset ---------------------------------------------------- #
    @staticmethod
    def request_password_reset(email: str) -> None:
        user = User.objects.filter(email=email.lower()).first()
        if user:
            token = make_reset_token(user)
            send_password_reset_email.delay(str(user.id), user.email, token)

    @staticmethod
    def confirm_password_reset(*, uid: str, token: str, password: str) -> None:
        try:
            user = User.objects.get(id=uid)
        except (User.DoesNotExist, ValueError):
            raise AuthError("This reset link is invalid or has expired.")
        if not read_reset_token(token, user):
            raise AuthError("This reset link is invalid or has expired.")
        user.set_password(password)
        user.save(update_fields=["password", "updated_at"])
