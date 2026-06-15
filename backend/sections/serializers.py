import json

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from accounts.serializers import UserSerializer
from communities.models import Community
from communities.serializers import CommunitySerializer
from .models import Article, Section


class SectionSerializer(serializers.ModelSerializer):
    articles_count = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ('id', 'category', 'title', 'description', 'articles_count')

    def get_articles_count(self, obj):
        return obj.articles.count()


class ArticleSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    section = SectionSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)
    section_id = serializers.PrimaryKeyRelatedField(
        source='section', queryset=Section.objects.all(), write_only=True
    )
    community_id = serializers.PrimaryKeyRelatedField(
        source='community', queryset=Community.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Article
        fields = (
            'id', 'section', 'section_id', 'community', 'community_id', 'author', 'title', 'description',
            'content_raw', 'content_text', 'created_at',
        )
        read_only_fields = ('id', 'author', 'created_at')

    def validate_content_raw(self, value):
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as exc:
                raise serializers.ValidationError('Некорректный JSON') from exc
        return value

    def validate(self, attrs):
        community = attrs.get('community')
        request = self.context.get('request')
        if community and request and request.user.is_authenticated:
            if not community.members.filter(user=request.user).exists() and community.owner_id != request.user.id:
                raise ValidationError('Для публикации от сообщества необходимо быть участником или владельцем')
        return attrs

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
