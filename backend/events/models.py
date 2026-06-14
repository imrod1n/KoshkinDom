from django.conf import settings
from django.db import models


class Event(models.Model):
    class EventType(models.TextChoices):
        EXHIBITION = 'exhibition', 'Выставка'
        MEETUP = 'meetup', 'Встреча владельцев'
        OTHER = 'other', 'Другое'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.MEETUP)
    location = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('starts_at',)
        verbose_name = 'Мероприятие'
        verbose_name_plural = 'Мероприятия'


class EventAttendance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendees')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')
