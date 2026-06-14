from django.http import Http404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .utils import broadcast_message, serialize_message


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages__sender')


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        conv_id = self.kwargs['conversation_id']
        conv = Conversation.objects.filter(
            pk=conv_id, participants=self.request.user
        ).first()
        if not conv:
            return Message.objects.none()
        Message.objects.filter(conversation=conv, is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        conv.updated_at = timezone.now()
        conv.save(update_fields=['updated_at'])
        return conv.messages.select_related('sender')

    def perform_create(self, serializer):
        conv = Conversation.objects.filter(
            pk=self.kwargs['conversation_id'], participants=self.request.user
        ).first()
        if not conv:
            raise Http404
        message = serializer.save(sender=self.request.user, conversation=conv)
        conv.updated_at = timezone.now()
        conv.save(update_fields=['updated_at'])
        data = serialize_message(message, self.request)
        broadcast_message(conv.id, data)


class StartDirectChatView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other = User.objects.filter(pk=user_id).exclude(pk=request.user.pk).first()
        if not other:
            return Response({'detail': 'Пользователь не найден'}, status=404)
        existing = Conversation.objects.filter(is_group=False).filter(
            participants=request.user
        ).filter(participants=other).first()
        if existing:
            return Response(ConversationSerializer(existing, context={'request': request}).data)
        conv = Conversation.objects.create(is_group=False)
        conv.participants.add(request.user, other)
        return Response(
            ConversationSerializer(conv, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
