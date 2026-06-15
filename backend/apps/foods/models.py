import uuid

from django.db import models


class DietaryTag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Machine key (e.g. "high_protein") + human label.
    key = models.SlugField(unique=True)
    label = models.CharField(max_length=60)

    class Meta:
        ordering = ["label"]

    def __str__(self) -> str:
        return self.label


class Food(models.Model):
    """An entry from the Nigerian Food Composition Table (NFCT)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=160, db_index=True)
    nfct_code = models.CharField(max_length=32, unique=True, null=True, blank=True)
    origin = models.CharField(max_length=80, default="Nigeria")
    emoji = models.CharField(max_length=8, default="🍽️")
    description = models.TextField(blank=True)
    serving_size = models.CharField(max_length=80, blank=True)

    # Per-serving macros.
    kcal = models.PositiveIntegerField()
    protein_g = models.FloatField(default=0)
    carbs_g = models.FloatField(default=0)
    fat_g = models.FloatField(default=0)

    tags = models.ManyToManyField(DietaryTag, through="FoodTagMap", related_name="foods", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["nfct_code"]),
        ]

    def __str__(self) -> str:
        return self.name


class FoodTagMap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    tag = models.ForeignKey(DietaryTag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("food", "tag")
