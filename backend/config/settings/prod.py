"""Production settings — security headers, strict hosts, no browsable API."""
from .base import *  # noqa: F401,F403
from .base import env

DEBUG = False

if env("RENDER_EXTERNAL_HOSTNAME", default=None):
    ALLOWED_HOSTS.append(env("RENDER_EXTERNAL_HOSTNAME"))

# Security headers (per security brief).
SECURE_SSL_REDIRECT = env("SECURE_SSL_REDIRECT", default=True)
SECURE_HSTS_SECONDS = env("SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
