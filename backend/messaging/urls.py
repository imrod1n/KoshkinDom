from django.urls import path

from .views import (
    ConversationDetailView,
    ConversationListCreateView,
    MessageListCreateView,
    StartDirectChatView,
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view()),
    path('conversations/<int:pk>/', ConversationDetailView.as_view()),
    path('conversations/<int:conversation_id>/messages/', MessageListCreateView.as_view()),
    path('start/<int:user_id>/', StartDirectChatView.as_view()),
]
