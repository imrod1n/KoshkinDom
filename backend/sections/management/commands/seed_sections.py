from django.core.management.base import BaseCommand

from sections.models import Section


class Command(BaseCommand):
    help = 'Создаёт тематические разделы'

    def handle(self, *args, **options):
        data = [
            (Section.Category.BREEDS, 'Породы кошек', 'Описание пород, характер, уход за разными типами.'),
            (Section.Category.CARE, 'Уход', 'Гигиена, когтеточки, лоток, сезонный уход.'),
            (Section.Category.HEALTH, 'Здоровье', 'Симптомы, визиты к ветеринару, профилактика.'),
            (Section.Category.NUTRITION, 'Питание', 'Рацион, корма, вода, аллергии.'),
            (Section.Category.TRAINING, 'Воспитание', 'Социализация, игры, коррекция поведения.'),
        ]
        for category, title, description in data:
            Section.objects.update_or_create(
                category=category,
                defaults={'title': title, 'description': description},
            )
        self.stdout.write(self.style.SUCCESS('Разделы созданы'))
