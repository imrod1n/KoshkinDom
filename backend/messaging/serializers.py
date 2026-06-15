from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender', 'text', 'image', 'created_at', 'is_read')
        read_only_fields = ('id', 'sender', 'created_at')


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id', 'participants', 'participant_ids', 'is_group', 'title',
            'created_at', 'updated_at', 'last_message', 'unread_count',
        )

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        return MessageSerializer(msg).data if msg else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        user = self.context['request'].user
        conv = Conversation.objects.create(**validated_data)
        ids = set(participant_ids) | {user.id}
        conv.participants.set(ids)
        return conv
