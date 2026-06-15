from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import ForumReply, ForumTopic


class ForumReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    parent_id = serializers.PrimaryKeyRelatedField(
        source='parent', queryset=ForumReply.objects.all(), required=False, allow_null=True
    )
    children = serializers.SerializerMethodField()

    class Meta:
        model = ForumReply
        fields = ('id', 'author', 'body', 'parent_id', 'children', 'is_expert_answer', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')

    def get_children(self, obj):
        return ForumReplySerializer(obj.children.all(), many=True, context=self.context).data


class ForumTopicSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = ForumTopic
        fields = (
            'id', 'author', 'title', 'body', 'is_expert_question', 'is_answered',
            'created_at', 'replies', 'replies_count',
        )
        read_only_fields = ('id', 'author', 'is_answered', 'created_at')

    def get_replies(self, obj):
        replies = obj.replies.filter(parent__isnull=True).prefetch_related('author', 'children__author')
        return ForumReplySerializer(replies, many=True, context=self.context).data

    def get_replies_count(self, obj):
        return obj.replies.count()

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ForumReplyCreateSerializer(serializers.ModelSerializer):
    parent_id = serializers.PrimaryKeyRelatedField(
        source='parent', queryset=ForumReply.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = ForumReply
        fields = ('body', 'parent_id', 'is_expert_answer')

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
