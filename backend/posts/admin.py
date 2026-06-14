from django.contrib import admin

from .models import Comment, Like, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'created_at', 'likes_count')

    @admin.display(description='Лайки')
    def likes_count(self, obj):
        return obj.likes.count()


admin.site.register(Like)
admin.site.register(Comment)
