from django.contrib import admin

from .models import DietaryTag, Food, FoodTagMap


class FoodTagInline(admin.TabularInline):
    model = FoodTagMap
    extra = 1


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ("name", "kcal", "protein_g", "carbs_g", "fat_g", "nfct_code")
    search_fields = ("name", "nfct_code")
    inlines = [FoodTagInline]


@admin.register(DietaryTag)
class DietaryTagAdmin(admin.ModelAdmin):
    list_display = ("label", "key")
