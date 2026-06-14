import json

from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Comment, Like, Post


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'author', 'text', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    repost_of_id = serializers.PrimaryKeyRelatedField(
        source='repost_of', queryset=Post.objects.all(), required=False, allow_null=True
    )
    repost_of_post = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'content_raw', 'content_text', 'image',
            'created_at', 'updated_at', 'repost_of_id', 'repost_of_post',
            'likes_count', 'comments_count', 'is_liked', 'comments',
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')

    def validate_content_raw(self, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError('Некорректный JSON') from exc
        return value

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()

    def get_repost_of_post(self, obj):
        if obj.repost_of:
            return PostSerializer(obj.repost_of, context=self.context).data
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            url = instance.image.url
            data['image'] = request.build_absolute_uri(url) if request else url
        return data

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'user', 'post', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
