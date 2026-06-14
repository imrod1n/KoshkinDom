from django.urls import path

from .views import CommentCreateView, LikeToggleView, PostDetailView, PostListCreateView, RepostView

urlpatterns = [
    path('', PostListCreateView.as_view(), name='post-list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/like/', LikeToggleView.as_view(), name='post-like'),
    path('<int:pk>/comments/', CommentCreateView.as_view(), name='post-comment'),
    path('<int:pk>/repost/', RepostView.as_view(), name='post-repost'),
]
