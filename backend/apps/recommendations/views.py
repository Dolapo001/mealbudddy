from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from core.permissions import IsOwner
from services.recommendation_service import RecommendationError, RecommendationService
from tasks.recommendations import generate_recommendations

from .models import MealPlan, MealPlanItem
from .serializers import (
    GenerateRequestSerializer,
    MealPlanItemSerializer,
    MealPlanItemUpdateSerializer,
    MealPlanSerializer,
)


class _GenerateThrottle(ScopedRateThrottle):
    scope = "generate"


class GenerateView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [_GenerateThrottle]

    @extend_schema(request=GenerateRequestSerializer, responses={201: MealPlanSerializer})
    def post(self, request):
        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tags = serializer.validated_data["dietary_tags"]

        # Async path: enqueue on Celery, notify via WebSocket when ready.
        if serializer.validated_data["async_mode"]:
            generate_recommendations.delay(str(request.user.id), tags)
            return Response({"status": "queued"}, status=status.HTTP_202_ACCEPTED)

        try:
            plan = RecommendationService.generate(request.user, dietary_tags=tags)
        except RecommendationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MealPlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class CurrentPlanView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MealPlanSerializer})
    def get(self, request):
        plan = (
            MealPlan.objects.filter(user=request.user, status=MealPlan.Status.ACTIVE)
            .prefetch_related("items__food__tags")
            .first()
        )
        if not plan:
            return Response({"detail": "No active plan."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MealPlanSerializer(plan).data)


class PlanDetailView(generics.RetrieveAPIView):
    serializer_class = MealPlanSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = MealPlan.objects.prefetch_related("items__food__tags").all()
    lookup_url_kwarg = "plan_id"


class PlanRefreshView(APIView):
    permission_classes = [IsAuthenticated, IsOwner]
    throttle_classes = [_GenerateThrottle]

    @extend_schema(request=GenerateRequestSerializer, responses={201: MealPlanSerializer})
    def post(self, request, plan_id):
        plan = generics.get_object_or_404(MealPlan, id=plan_id)
        self.check_object_permissions(request, plan)
        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            new_plan = RecommendationService.regenerate(
                request.user, plan, dietary_tags=serializer.validated_data["dietary_tags"]
            )
        except RecommendationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MealPlanSerializer(new_plan).data, status=status.HTTP_201_CREATED)


class PlanItemView(generics.RetrieveUpdateDestroyAPIView):
    """Swap / adjust / remove a single meal in the plan."""

    permission_classes = [IsAuthenticated, IsOwner]
    queryset = MealPlanItem.objects.select_related("food", "plan__user")
    lookup_url_kwarg = "item_id"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return MealPlanItemUpdateSerializer
        return MealPlanItemSerializer

    def check_object_permissions(self, request, obj):
        # Ownership hangs off the parent plan.
        if obj.plan.user != request.user:
            self.permission_denied(request, message="Not your meal plan.")
