from django.contrib import admin

from .models import Community, CommunityMembership

admin.site.register(Community)
admin.site.register(CommunityMembership)
