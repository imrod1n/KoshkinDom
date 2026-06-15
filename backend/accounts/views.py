from datetime import datetime, time

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserFollow, Notification
from accounts.serializers import RegisterSerializer, UserFollowSerializer, UserSerializer, NotificationSerializer
from communities.models import CommunityMembership
from events.models import Event
from posts.models import Post
from reminders.models import Reminder

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    search_fields = ('username', 'city', 'favorite_breed')


class FollowUserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, username):
        target = User.objects.filter(username=username).first()
        if not target:
            return Response({'detail': 'Пользователь не найден'}, status=404)
        if target == request.user:
            return Response({'detail': 'Нельзя подписаться на себя'}, status=400)
        UserFollow.objects.get_or_create(follower=request.user, following=target)
        return Response({'detail': 'Подписка оформлена'})

    def delete(self, request, username):
        target = User.objects.filter(username=username).first()
        if not target:
            return Response({'detail': 'Пользователь не найден'}, status=404)
        UserFollow.objects.filter(follower=request.user, following=target).delete()
        return Response({'detail': 'Подписка отменена'})


class FollowingListView(generics.ListAPIView):
    serializer_class = UserFollowSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = User.objects.filter(username=username).first()
        if not user:
            return UserFollow.objects.none()
        return UserFollow.objects.filter(follower=user).select_related('following')


class FollowersListView(generics.ListAPIView):
    serializer_class = UserFollowSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = User.objects.filter(username=username).first()
        if not user:
            return UserFollow.objects.none()
        return UserFollow.objects.filter(following=user).select_related('follower')


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationMarkAsReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'detail': 'Уведомление отмечено как прочитанное'})
        except Notification.DoesNotExist:
            return Response({'detail': 'Уведомление не найдено'}, status=404)


class NotificationMarkAllAsReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Mark all as read
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'Все уведомления отмечены как прочитанные'})
