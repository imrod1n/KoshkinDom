from django.contrib import admin

from .models import Comment, Like, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'community', 'created_at', 'likes_count')
    fieldsets = (
        ('Основное', {'fields': ('author', 'community', 'content_text')}),
        ('Медиа', {'fields': ('image', 'video'), 'classes': ('collapse',)}),
        ('Метаданные', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ('created_at', 'updated_at')

    @admin.display(description='Лайки')
    def likes_count(self, obj):
        return obj.likes.count()


admin.site.register(Like)
admin.site.register(Comment)
