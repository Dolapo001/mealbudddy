from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Profile, User


@receiver(post_save, sender=User)
def ensure_profile(sender, instance, created, **kwargs):
    """Every user has exactly one profile row."""
    if created:
        Profile.objects.get_or_create(user=instance)
