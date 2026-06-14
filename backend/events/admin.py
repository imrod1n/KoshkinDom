from django.contrib import admin

from .models import Event, EventAttendance

admin.site.register(Event)
admin.site.register(EventAttendance)
