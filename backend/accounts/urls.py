from django.urls import path

from .views import (
    FollowUserView,
    FollowersListView,
    FollowingListView,
    NotificationListView,
    ProfileView,
    RegisterView,
    UserDetailView,
    UserListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:username>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:username>/follow/', FollowUserView.as_view(), name='user-follow'),
    path('users/<str:username>/following/', FollowingListView.as_view(), name='following'),
    path('users/<str:username>/followers/', FollowersListView.as_view(), name='followers'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
]
