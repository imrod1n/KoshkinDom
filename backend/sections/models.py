from django.conf import settings
from django.db import models


class Section(models.Model):
    class Category(models.TextChoices):
        BREEDS = 'breeds', 'Породы'
        CARE = 'care', 'Уход'
        HEALTH = 'health', 'Здоровье'
        NUTRITION = 'nutrition', 'Питание'
        TRAINING = 'training', 'Воспитание'

    category = models.CharField(max_length=20, choices=Category.choices, unique=True)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Тематический раздел'
        verbose_name_plural = 'Тематические разделы'

    def __str__(self):
        return self.title


class Article(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='articles')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=200)
    content_raw = models.JSONField(default=dict)
    content_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
        verbose_name = 'Статья'
        verbose_name_plural = 'Статьи'
