from datetime import datetime, time

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserFollow
from communities.models import CommunityMembership
from events.models import Event
from posts.models import Post
from reminders.models import Reminder
from .serializers import RegisterSerializer, UserFollowSerializer, UserSerializer

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


class NotificationListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        now = timezone.now()
        today = timezone.localdate()

        following_ids = UserFollow.objects.filter(follower=user).values_list('following_id', flat=True)
        upcoming_events = Event.objects.filter(attendees__user=user, starts_at__gte=now).order_by('starts_at')[:5]
        new_posts = Post.objects.filter(
            Q(author_id__in=following_ids) | Q(community__members__user=user)
        ).exclude(author=user).distinct().order_by('-created_at')[:5]
        upcoming_reminders = Reminder.objects.filter(
            pet__owner=user, is_done=False, due_date__gte=today
        ).order_by('due_date')[:5]

        notifications = []
        for ev in upcoming_events:
            notifications.append({
                'id': f'event-{ev.id}',
                'type': 'event',
                'title': f'Запись на событие "{ev.title}"',
                'message': f'Мероприятие состоится {ev.starts_at.strftime("%d.%m.%Y %H:%M")}',
                'url': f'/events',
                'created_at': ev.starts_at,
            })
        for post in new_posts:
            source = post.community.name if post.community else f'@{post.author.username}'
            message = post.content_text[:120] if post.content_text else ''
            notifications.append({
                'id': f'post-{post.id}',
                'type': 'post',
                'title': f'Новый пост от {source}',
                'message': message,
                'url': '/',
                'created_at': post.created_at,
            })
        for rem in upcoming_reminders:
            notifications.append({
                'id': f'reminder-{rem.id}',
                'type': 'reminder',
                'title': f'Напоминание по {rem.pet.name}',
                'message': f'{rem.title} на {rem.due_date}',
                'url': '/reminders',
                'created_at': datetime.combine(rem.due_date, time.min),
            })

        notifications.sort(key=lambda item: item['created_at'], reverse=True)
        return Response({'results': notifications})
