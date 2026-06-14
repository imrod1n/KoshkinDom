import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import Conversation, Message
from .utils import broadcast_message, serialize_message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = int(self.scope['url_route']['kwargs']['conversation_id'])
        self.room_group_name = f'chat_{self.conversation_id}'
        user = self.scope.get('user')

        if isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close()
            return

        is_member = await self._is_participant(user.id, self.conversation_id)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        user = self.scope['user']
        if isinstance(user, AnonymousUser):
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            return

        text = (payload.get('text') or '').strip()
        if not text:
            return

        message = await self._create_message(user.id, self.conversation_id, text)
        data = await self._serialize(message)
        await broadcast_message(self.conversation_id, data)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def _is_participant(self, user_id, conversation_id):
        return Conversation.objects.filter(
            pk=conversation_id, participants__id=user_id
        ).exists()

    @database_sync_to_async
    def _create_message(self, user_id, conversation_id, text):
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        User = get_user_model()
        conv = Conversation.objects.get(pk=conversation_id)
        msg = Message.objects.create(
            conversation=conv,
            sender=User.objects.get(pk=user_id),
            text=text,
        )
        conv.updated_at = timezone.now()
        conv.save(update_fields=['updated_at'])
        return msg

    @database_sync_to_async
    def _serialize(self, message):
        return serialize_message(message)
