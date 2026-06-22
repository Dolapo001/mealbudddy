from django.contrib import admin
from .models import FoodItem, BowenFood

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin): pass

@admin.register(BowenFood)
class BowenFoodAdmin(admin.ModelAdmin): pass
