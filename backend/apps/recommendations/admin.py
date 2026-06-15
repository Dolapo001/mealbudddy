from django.contrib import admin

from .models import MealPlan, MealPlanItem


class MealPlanItemInline(admin.TabularInline):
    model = MealPlanItem
    extra = 0
    raw_id_fields = ("food",)


@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ("user", "week_start", "status", "target_kcal", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email",)
    inlines = [MealPlanItemInline]
