from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .serializers import MessageSerializer


def serialize_message(message, request=None):
    return MessageSerializer(message, context={'request': request}).data


def broadcast_message(conversation_id, message_data):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        f'chat_{conversation_id}',
        {'type': 'chat.message', 'message': message_data},
    )
