from messaging.models import Conversation

from .models import CommunityMembership


def create_community_chat(community, owner):
    conv = Conversation.objects.create(
        is_group=True,
        title=community.name,
    )
    conv.participants.add(owner)
    community.conversation = conv
    community.save(update_fields=['conversation'])
    return conv


def sync_member_to_chat(community, user, joined=True):
    if not community.conversation_id:
        return
    if joined:
        community.conversation.participants.add(user)
    else:
        community.conversation.participants.remove(user)


def ensure_owner_membership(community, owner):
    CommunityMembership.objects.get_or_create(user=owner, community=community)
