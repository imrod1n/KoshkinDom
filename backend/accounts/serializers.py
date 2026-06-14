from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User, UserFollow


class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'bio', 'city', 'favorite_breed', 'date_joined',
            'followers_count', 'following_count', 'is_following',
        )
        read_only_fields = ('id', 'date_joined')

    def get_followers_count(self, obj):
        return obj.followers_set.count()

    def get_following_count(self, obj):
        return obj.following_set.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserFollow.objects.filter(
            follower=request.user, following=obj
        ).exists()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Пароли не совпадают'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)


class UserFollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)

    class Meta:
        model = UserFollow
        fields = ('id', 'follower', 'following', 'created_at')
