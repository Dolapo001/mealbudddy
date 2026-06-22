from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, DietaryPreference


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("-created_at",)
    list_display = ("email", "student_code", "first_name", "last_name", "role", "is_email_verified", "is_active")
    list_filter = ("role", "is_email_verified", "is_active")
    search_fields = ("email", "student_code", "first_name", "last_name")
    readonly_fields = ("created_at", "updated_at", "last_login")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Identity", {"fields": ("first_name", "last_name", "student_code", "department", "role", "is_email_verified")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups")}),
        ("Audit", {"fields": ("created_at", "updated_at", "last_login")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "student_code", "first_name", "last_name", "password1", "password2", "role"),
            },
        ),
    )

@admin.register(DietaryPreference)
class DietaryPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "preference_tag", "created_at")
    search_fields = ("user__email", "preference_tag")
