from django.contrib import admin

from .models import MetricProfile


@admin.register(MetricProfile)
class MetricProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "goal", "bmi", "tdee", "target_kcal", "is_current", "created_at")
    list_filter = ("goal", "sex", "is_current")
    search_fields = ("user__email",)
    readonly_fields = ("created_at", "updated_at")
