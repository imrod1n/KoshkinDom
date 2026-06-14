from django.conf import settings
from django.db import models


class Pet(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pets'
    )
    name = models.CharField(max_length=80)
    breed = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Питомец'
        verbose_name_plural = 'Питомцы'

    def __str__(self):
        return self.name


class Reminder(models.Model):
    class ReminderType(models.TextChoices):
        VACCINATION = 'vaccination', 'Вакцинация'
        PARASITE = 'parasite', 'Обработка от паразитов'
        OTHER = 'other', 'Другое'

    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=ReminderType.choices)
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    is_done = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('due_date',)
        verbose_name = 'Напоминание'
        verbose_name_plural = 'Напоминания'
