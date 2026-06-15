"""Celery email tasks. In dev (CELERY_TASK_ALWAYS_EAGER) these run inline and
print to the console email backend; in prod they run on the worker.
"""
from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name="accounts.send_verification_email")
def send_verification_email(user_id: str, email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify/{token}"
    send_mail(
        subject="Verify your MealBuddy email",
        message=(
            "Welcome to MealBuddy!\n\n"
            f"Confirm your email to start getting recommendations:\n{link}\n\n"
            "This link expires in 24 hours."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


@shared_task(name="accounts.send_password_reset_email")
def send_password_reset_email(user_id: str, email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/auth/reset/{user_id}.{token}"
    send_mail(
        subject="Reset your MealBuddy password",
        message=(
            "We received a request to reset your password.\n\n"
            f"Reset it here (expires in 1 hour):\n{link}\n\n"
            "If you didn't request this, you can safely ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
