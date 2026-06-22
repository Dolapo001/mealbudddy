import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        USER = "user", "User"
        ADMIN = "admin", "Admin"
        SUPER_ADMIN = "super_admin", "Super admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_code = models.CharField(max_length=30, unique=True, db_index=True)
    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    email = models.EmailField(unique=True, db_index=True, max_length=120)
    department = models.CharField(max_length=100, null=True, blank=True)

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)

    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = ["student_code", "first_name", "last_name"]

    class Meta:
        db_table = "students"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["student_code"]),
        ]

    def __str__(self) -> str:
        return self.email

    @property
    def is_staff_role(self) -> bool:
        return self.role in {self.Role.ADMIN, self.Role.SUPER_ADMIN}

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(update_fields=["deleted_at", "is_active", "updated_at"])


class DietaryPreference(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="dietary_preferences")
    preference_tag = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "dietary_preferences"
        unique_together = ("user", "preference_tag")

    def __str__(self) -> str:
        return f"{self.user.email} - {self.preference_tag}"
