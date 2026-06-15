from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from services.auth_service import AuthError, AuthService

from .models import Profile
from .serializers import (
    EmailOnlySerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
    VerifyEmailSerializer,
)


class _AuthThrottle(ScopedRateThrottle):
    scope = "auth"


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [_AuthThrottle]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = AuthService.register(**serializer.validated_data)
        return Response(
            {
                "user": UserSerializer(result["user"]).data,
                "tokens": result["tokens"],
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [_AuthThrottle]

    @extend_schema(request=LoginSerializer, responses={200: UserSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = AuthService.login(serializer.validated_data["user"])
        return Response(
            {"user": UserSerializer(result["user"]).data, "tokens": result["tokens"]}
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={205: None})
    def post(self, request):
        # Blacklist the refresh token if supplied so it can't be reused.
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except TokenError:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=VerifyEmailSerializer, responses={200: OpenApiResponse()})
    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = AuthService.verify_email(serializer.validated_data["token"])
        except AuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Email verified.", "email": user.email})


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [_AuthThrottle]

    @extend_schema(request=EmailOnlySerializer, responses={200: OpenApiResponse()})
    def post(self, request):
        serializer = EmailOnlySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.resend_verification(serializer.validated_data["email"])
        return Response({"detail": "If that account exists, a new link is on its way."})


class _ResetThrottle(ScopedRateThrottle):
    scope = "password_reset"


class PasswordForgotView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [_ResetThrottle]

    @extend_schema(request=PasswordResetRequestSerializer, responses={200: OpenApiResponse()})
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AuthService.request_password_reset(serializer.validated_data["email"])
        return Response({"detail": "If that account exists, a reset link is on its way."})


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [_ResetThrottle]

    @extend_schema(request=PasswordResetConfirmSerializer, responses={200: OpenApiResponse()})
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            AuthService.confirm_password_reset(**serializer.validated_data)
        except AuthError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Password updated. You can now sign in."})


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return ProfileSerializer
