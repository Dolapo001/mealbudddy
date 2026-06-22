from django.contrib import admin
from .models import MLModel, Recommendation, RecommendationItem, MealPlan, MealPlanItem

@admin.register(MLModel)
class MLModelAdmin(admin.ModelAdmin): pass

@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin): pass

@admin.register(RecommendationItem)
class RecommendationItemAdmin(admin.ModelAdmin): pass

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin): pass

@admin.register(MealPlanItem)
class MealPlanItemAdmin(admin.ModelAdmin): pass
