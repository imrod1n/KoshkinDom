from rest_framework import serializers

from .models import AIChatMessage


class AIChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatMessage
        fields = ('id', 'question', 'answer', 'created_at')
        read_only_fields = ('id', 'answer', 'created_at')
