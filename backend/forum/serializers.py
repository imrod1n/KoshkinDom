from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import ForumReply, ForumTopic


class ForumReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = ForumReply
        fields = ('id', 'author', 'body', 'is_expert_answer', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class ForumTopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = ForumReplySerializer(many=True, read_only=True)
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = (
            'id', 'author', 'title', 'body', 'is_expert_question', 'is_answered',
            'created_at', 'replies', 'replies_count',
        )
        read_only_fields = ('id', 'author', 'is_answered', 'created_at')

    def get_replies_count(self, obj):
        return obj.replies.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ForumReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForumReply
        fields = ('body', 'is_expert_answer')

    def create(self, validated_data):
        topic = ForumTopic.objects.get(pk=self.context['topic_id'])
        reply = ForumReply.objects.create(
            topic=topic,
            author=self.context['request'].user,
            **validated_data,
        )
        if validated_data.get('is_expert_answer'):
            topic.is_answered = True
            topic.save(update_fields=['is_answered'])
        return reply
