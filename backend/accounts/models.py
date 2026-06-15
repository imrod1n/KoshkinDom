from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    avatar = models.ImageField('Аватар', upload_to='avatars/', blank=True, null=True)
    bio = models.TextField('О себе', blank=True, max_length=500)
    city = models.CharField('Город', max_length=100, blank=True)
    favorite_breed = models.CharField('Любимая порода', max_length=100, blank=True)

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username


class UserFollow(models.Model):
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='following_set'
    )
    following = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='followers_set'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        verbose_name = 'Подписка на пользователя'
        verbose_name_plural = 'Подписки на пользователей'


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('event', 'Событие'),
        ('post', 'Пост'),
        ('reminder', 'Напоминание'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    url = models.CharField(max_length=500, default='/')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']
        
    def __str__(self):
        return f'{self.title} ({self.user.username})'
