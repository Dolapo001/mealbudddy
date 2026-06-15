"""Development settings.

Tuned so the backend runs with **no external services** (no Redis, no Docker) —
just SQLite. Celery tasks execute inline and Channels uses an in-memory layer,
so register/feedback/recommendations all work from `python manage.py runserver`.
Set CELERY_TASK_ALWAYS_EAGER=False + a real REDIS_URL to use a worker instead.
"""
from .base import *  # noqa: F401,F403
from .base import REST_FRAMEWORK, env

DEBUG = True
ALLOWED_HOSTS = ["*"]

# Run Celery tasks synchronously in-process unless a broker is explicitly wired.
CELERY_TASK_ALWAYS_EAGER = env("CELERY_TASK_ALWAYS_EAGER", default=True)
CELERY_TASK_EAGER_PROPAGATES = False

# In-memory channel layer so WebSockets work without Redis in local dev.
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# Helpful browsable API while developing.
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ),
}
