from django.db import transaction
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from services.metrics_service import MetricsService

from .models import MetricProfile
from .serializers import MetricProfileInputSerializer, MetricProfileSerializer


def _current_metrics(user):
    return MetricProfile.objects.filter(user=user, is_current=True).first()


class MetricsView(APIView):
    """GET = list the user's metric history. POST = create a new current
    snapshot (server computes all derivations and supersedes the previous)."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MetricProfileSerializer(many=True)})
    def get(self, request):
        qs = MetricProfile.objects.filter(user=request.user)
        return Response(MetricProfileSerializer(qs, many=True).data)

    @extend_schema(request=MetricProfileInputSerializer, responses={201: MetricProfileSerializer})
    @transaction.atomic
    def post(self, request):
        serializer = MetricProfileInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        derived = MetricsService.derive(
            weight_kg=data["weight_kg"],
            height_cm=data["height_cm"],
            age=data["age"],
            sex=data["sex"],
            activity=data["activity"],
            goal=data["goal"],
        )

        MetricProfile.objects.filter(user=request.user, is_current=True).update(is_current=False)
        metric = MetricProfile.objects.create(
            user=request.user,
            age=data["age"],
            sex=data["sex"],
            weight_kg=data["weight_kg"],
            height_cm=data["height_cm"],
            activity_multiplier=MetricsService.activity_multiplier(data["activity"]),
            goal=data["goal"],
            goal_offset_kcal=derived.goal_offset_kcal,
            bmi=derived.bmi,
            bmr=derived.bmr,
            tdee=derived.tdee,
            target_kcal=derived.target_kcal,
            protein_target_g=derived.protein_target_g,
            carb_target_g=derived.carb_target_g,
            fat_target_g=derived.fat_target_g,
            is_current=True,
        )
        return Response(MetricProfileSerializer(metric).data, status=status.HTTP_201_CREATED)


class CurrentMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MetricProfileSerializer})
    def get(self, request):
        metric = _current_metrics(request.user)
        if not metric:
            return Response({"detail": "No metrics on file."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MetricProfileSerializer(metric).data)


class DerivedMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: MetricProfileSerializer})
    def get(self, request):
        metric = _current_metrics(request.user)
        if not metric:
            return Response({"detail": "No metrics on file."}, status=status.HTTP_404_NOT_FOUND)
        return Response(
            {
                "bmi": metric.bmi,
                "bmi_category": MetricsService.bmi_category(metric.bmi),
                "bmr": metric.bmr,
                "tdee": metric.tdee,
                "target_kcal": metric.target_kcal,
                "protein_target_g": metric.protein_target_g,
                "carb_target_g": metric.carb_target_g,
                "fat_target_g": metric.fat_target_g,
            }
        )
