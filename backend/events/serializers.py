from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Event, EventAttendance


class EventSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    attendees_count = serializers.SerializerMethodField()
    is_attending = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = (
            'id', 'title', 'description', 'event_type', 'location',
            'starts_at', 'ends_at', 'organizer', 'created_at',
            'attendees_count', 'is_attending',
        )
        read_only_fields = ('id', 'organizer', 'created_at')

    def get_attendees_count(self, obj):
        return obj.attendees.count()

    def get_is_attending(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.attendees.filter(user=request.user).exists()

    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)
