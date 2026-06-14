from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserFollow
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
