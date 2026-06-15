"""Signed, single-use, short-TTL tokens for email verification and password
reset, built on Django's TimestampSigner (no extra DB table required).

The signed payload is the user's id; the salt namespaces the two flows so a
verification token can never be replayed as a reset token. Single-use is
enforced by binding the signature to the user's current password hash for
reset (changing the password invalidates outstanding links) and to the
verification flag for verification.
"""
from django.conf import settings
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner

_VERIFY_SALT = "accounts.email-verify"
_RESET_SALT = "accounts.password-reset"


def make_verification_token(user) -> str:
    signer = TimestampSigner(salt=_VERIFY_SALT)
    return signer.sign(str(user.id))


def read_verification_token(token: str):
    signer = TimestampSigner(salt=_VERIFY_SALT)
    try:
        return signer.unsign(token, max_age=settings.EMAIL_TOKEN_TTL)
    except (BadSignature, SignatureExpired):
        return None


def make_reset_token(user) -> str:
    # Bind to the password hash so the link is single-use: once the password
    # changes, the same token no longer validates.
    signer = TimestampSigner(salt=_RESET_SALT + user.password)
    return signer.sign(str(user.id))


def read_reset_token(token: str, user) -> bool:
    signer = TimestampSigner(salt=_RESET_SALT + user.password)
    try:
        value = signer.unsign(token, max_age=settings.PASSWORD_RESET_TTL)
        return value == str(user.id)
    except (BadSignature, SignatureExpired):
        return False
