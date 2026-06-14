from django.urls import path

from .views import ForumReplyCreateView, ForumTopicDetailView, ForumTopicListCreateView

urlpatterns = [
    path('topics/', ForumTopicListCreateView.as_view()),
    path('topics/<int:pk>/', ForumTopicDetailView.as_view()),
    path('topics/<int:pk>/replies/', ForumReplyCreateView.as_view()),
]
