from django.conf import settings
from django.db import models


class AIChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_messages', null=True, blank=True
    )
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Диалог с ИИ'
        verbose_name_plural = 'Диалоги с ИИ'
