from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("user", "stars", "plan", "created_at")
    list_filter = ("stars",)
    search_fields = ("user__email",)
