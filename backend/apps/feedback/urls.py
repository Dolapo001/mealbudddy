from django.urls import path

from .views import FeedbackCreateView, MyFeedbackView

feedback_urlpatterns = [
    path("feedback", FeedbackCreateView.as_view(), name="feedback"),
    path("feedback/mine", MyFeedbackView.as_view(), name="feedback-mine"),
]
