import uuid

from django.db import models


class FoodItem(models.Model):
    """An entry from the Nigerian Food Composition Table (NFCT)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nfct_code = models.CharField(max_length=20, unique=True)
    food_name = models.CharField(max_length=150)
    local_name = models.CharField(max_length=150, null=True, blank=True)
    food_category = models.CharField(max_length=80, db_index=True)

    energy_kcal = models.DecimalField(max_digits=7, decimal_places=2)
    carbohydrate_g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    protein_g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    fat_g = models.DecimalField(max_digits=7, decimal_places=2, default=0)
    fibre_g = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    sugar_g = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)

    sodium_mg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    iron_mg = models.DecimalField(max_digits=7, decimal_places=3, null=True, blank=True)
    calcium_mg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    vitamin_c_mg = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    vitamin_a_ug = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    # Boolean flags
    is_high_protein = models.BooleanField(default=False)
    is_high_fibre = models.BooleanField(default=False)
    is_low_calorie = models.BooleanField(default=False)

    nfct_edition = models.PositiveSmallIntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "food_items"
        indexes = [
            models.Index(fields=["food_category"]),
        ]

    def __str__(self) -> str:
        return f"{self.nfct_code} - {self.food_name}"


class BowenFood(models.Model):
    """The 38 foods available at Bowen University."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    food_name = models.CharField(max_length=150)
    nfct_food = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True, related_name="bowen_foods")
    food_category = models.CharField(max_length=80, db_index=True)
    
    # Stored as comma-separated values
    meal_time = models.CharField(max_length=100, default="lunch,dinner")
    
    is_vegetarian = models.BooleanField(default=False)
    contains_gluten = models.BooleanField(default=False)
    contains_nuts = models.BooleanField(default=False)
    contains_pork = models.BooleanField(default=False)
    contains_fish = models.BooleanField(default=False)
    contains_lactose = models.BooleanField(default=False)

    is_available = models.BooleanField(default=True)
    availability_note = models.CharField(max_length=150, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bowen_foods"
        indexes = [
            models.Index(fields=["food_category"]),
            models.Index(fields=["is_available"]),
        ]

    def __str__(self) -> str:
        return self.food_name
