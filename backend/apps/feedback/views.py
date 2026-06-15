from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tasks.recommendations import retrain_signal

from .models import Feedback
from .serializers import FeedbackCreateSerializer, FeedbackSerializer


class FeedbackCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Feedback.objects.none()
        return Feedback.objects.filter(user=self.request.user)

    @extend_schema(request=FeedbackCreateSerializer, responses={201: FeedbackSerializer})
    def post(self, request, *args, **kwargs):
        serializer = FeedbackCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        feedback = Feedback.objects.create(
            user=request.user,
            plan_id=data.get("plan_id"),
            stars=data["stars"],
            reason_chips=data["reason_chips"],
            comment=data["comment"],
        )
        # Fire the (placeholder) retraining signal asynchronously.
        retrain_signal.delay(str(feedback.id))
        return Response(FeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)


class MyFeedbackView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FeedbackSerializer
    queryset = Feedback.objects.none()

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Feedback.objects.none()
        return Feedback.objects.filter(user=self.request.user)
