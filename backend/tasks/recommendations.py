"""Heavy-path recommendation generation runs on Celery (blueprint J).

When the plan is ready the user is notified over their Channels group so the
dashboard can update live without polling.
"""
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

from apps.accounts.models import User
from services.recommendation_service import RecommendationError, RecommendationService


def _notify(user_id: str, payload: dict) -> None:
    layer = get_channel_layer()
    if layer is None:
        return
    async_to_sync(layer.group_send)(
        f"user_{user_id}", {"type": "plan.ready", "payload": payload}
    )


@shared_task(name="recommendations.generate")
def generate_recommendations(user_id: str, dietary_tags: list[str] | None = None) -> dict:
    user = User.objects.get(id=user_id)
    try:
        plan = RecommendationService.generate(user, dietary_tags=dietary_tags)
    except RecommendationError as exc:
        _notify(user_id, {"status": "error", "detail": str(exc)})
        return {"status": "error", "detail": str(exc)}

    result = {"status": "ready", "plan_id": str(plan.id)}
    _notify(user_id, result)
    return result


@shared_task(name="recommendations.retrain_signal")
def retrain_signal(feedback_id: str) -> None:
    """Placeholder hook: real feedback is logged for the eventual model
    retraining pipeline. No-op until the trained model lands."""
    return None
