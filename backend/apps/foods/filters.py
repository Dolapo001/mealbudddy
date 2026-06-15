from django_filters import rest_framework as filters

from .models import Food


class FoodFilter(filters.FilterSet):
    tags = filters.CharFilter(method="filter_tags")
    min_kcal = filters.NumberFilter(field_name="kcal", lookup_expr="gte")
    max_kcal = filters.NumberFilter(field_name="kcal", lookup_expr="lte")
    min_protein = filters.NumberFilter(field_name="protein_g", lookup_expr="gte")
    max_carbs = filters.NumberFilter(field_name="carbs_g", lookup_expr="lte")

    class Meta:
        model = Food
        fields = ["tags", "min_kcal", "max_kcal", "min_protein", "max_carbs"]

    def filter_tags(self, queryset, name, value):
        keys = [k.strip() for k in value.split(",") if k.strip()]
        for key in keys:
            queryset = queryset.filter(tags__key=key)
        return queryset.distinct()
