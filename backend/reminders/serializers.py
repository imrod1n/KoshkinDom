from rest_framework import serializers

from .models import Pet, Reminder


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = (
            'id', 'pet', 'reminder_type', 'title', 'due_date',
            'is_done', 'notes', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class PetSerializer(serializers.ModelSerializer):
    reminders = ReminderSerializer(many=True, read_only=True)
    upcoming_count = serializers.SerializerMethodField()

    class Meta:
        model = Pet
        fields = ('id', 'name', 'breed', 'birth_date', 'notes', 'reminders', 'upcoming_count')
        read_only_fields = ('id',)

    def get_upcoming_count(self, obj):
        from django.utils import timezone
        today = timezone.localdate()
        return obj.reminders.filter(is_done=False, due_date__gte=today).count()

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
