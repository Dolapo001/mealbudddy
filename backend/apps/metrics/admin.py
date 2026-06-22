from django.contrib import admin
from .models import BodyMetric, HealthGoal

@admin.register(BodyMetric)
class BodyMetricAdmin(admin.ModelAdmin): pass

@admin.register(HealthGoal)
class HealthGoalAdmin(admin.ModelAdmin): pass
