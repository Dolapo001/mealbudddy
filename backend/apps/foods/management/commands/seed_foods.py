from django.core.management.base import BaseCommand
from django.db import transaction

from apps.foods.models import DietaryTag, Food, FoodTagMap
from apps.foods.seed_data import DIETARY_TAGS, FOODS


class Command(BaseCommand):
    help = "Seed the NFCT food catalogue and dietary tags (idempotent)."

    @transaction.atomic
    def handle(self, *args, **options):
        tags = {}
        for key, label in DIETARY_TAGS:
            tag, _ = DietaryTag.objects.update_or_create(key=key, defaults={"label": label})
            tags[key] = tag

        created, updated = 0, 0
        for item in FOODS:
            # Copy so the module-level seed list is never mutated (idempotency).
            fields = {k: v for k, v in item.items() if k != "tags"}
            tag_keys = item.get("tags", [])
            food, was_created = Food.objects.update_or_create(
                slug=fields["slug"], defaults=fields
            )
            created += was_created
            updated += not was_created
            FoodTagMap.objects.filter(food=food).delete()
            FoodTagMap.objects.bulk_create(
                [FoodTagMap(food=food, tag=tags[k]) for k in tag_keys if k in tags]
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(tags)} tags, {created} new + {updated} updated foods."
            )
        )
