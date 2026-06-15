from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.permissions import IsAuthenticated

from .filters import FoodFilter
from .models import DietaryTag, Food
from .serializers import DietaryTagSerializer, FoodSerializer


class FoodListView(generics.ListAPIView):
    """Searchable / filterable NFCT catalogue.

    `?search=` matches name/description; `?tags=high_protein,vegan` filters by
    dietary tag; macro ranges via `?min_protein=`, `?max_kcal=`, etc.
    """

    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticated]
    queryset = Food.objects.prefetch_related("tags").all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FoodFilter
    search_fields = ["name", "description"]
    ordering_fields = ["name", "kcal", "protein_g"]
    ordering = ["name"]


class FoodDetailView(generics.RetrieveAPIView):
    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticated]
    queryset = Food.objects.prefetch_related("tags").all()
    lookup_field = "slug"


class FoodTagsView(generics.ListAPIView):
    serializer_class = DietaryTagSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = DietaryTag.objects.all()
