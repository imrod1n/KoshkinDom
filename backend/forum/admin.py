from django.contrib import admin

from .models import ForumReply, ForumTopic

admin.site.register(ForumTopic)
admin.site.register(ForumReply)
