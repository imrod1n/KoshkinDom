from django.conf import settings
from django.db import models


class Post(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts'
    )
    community = models.ForeignKey(
        'communities.Community', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='posts'
    )
    content_raw = models.JSONField('Контент Draft.js', default=dict)
    content_text = models.TextField('Текст', blank=True)
    image = models.ImageField('Фото', upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    repost_of = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='reposts'
    )

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Публикация'
        verbose_name_plural = 'Публикации'


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'


class Comment(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments'
    )
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
