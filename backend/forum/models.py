from django.conf import settings
from django.db import models


class ForumTopic(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_topics'
    )
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_expert_question = models.BooleanField('Вопрос эксперту', default=False)
    is_answered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Тема форума'
        verbose_name_plural = 'Темы форума'


class ForumReply(models.Model):
    topic = models.ForeignKey(ForumTopic, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forum_replies'
    )
    body = models.TextField()
    is_expert_answer = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)
        verbose_name = 'Ответ на форуме'
        verbose_name_plural = 'Ответы на форуме'
