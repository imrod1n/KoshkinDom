from django.conf import settings
from django.db import models


class Community(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='communities/', blank=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_communities'
    )
    conversation = models.OneToOneField(
        'messaging.Conversation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='community',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Сообщество'
        verbose_name_plural = 'Сообщества'

    def __str__(self):
        return self.name


class CommunityMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'community')
        verbose_name = 'Участник сообщества'
        verbose_name_plural = 'Участники сообществ'
