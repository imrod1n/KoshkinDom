from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import Community, CommunityMembership
from .services import create_community_chat, ensure_owner_membership


class CommunitySerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    conversation_id = serializers.IntegerField(source='conversation.id', read_only=True, default=None)

    class Meta:
        model = Community
        fields = (
            'id', 'name', 'slug', 'description', 'avatar', 'owner',
            'created_at', 'members_count', 'is_member', 'conversation_id',
        )
        read_only_fields = ('id', 'owner', 'created_at', 'conversation_id')

    def get_members_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.members.filter(user=request.user).exists()

    def create(self, validated_data):
        owner = self.context['request'].user
        validated_data['owner'] = owner
        community = super().create(validated_data)
        ensure_owner_membership(community, owner)
        create_community_chat(community, owner)
        return community


class CommunityMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    community = CommunitySerializer(read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ('id', 'user', 'community', 'joined_at')
