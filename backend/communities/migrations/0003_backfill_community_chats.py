from django.db import migrations


def create_chats_for_existing_communities(apps, schema_editor):
    Community = apps.get_model('communities', 'Community')
    Conversation = apps.get_model('messaging', 'Conversation')
    CommunityMembership = apps.get_model('communities', 'CommunityMembership')

    for community in Community.objects.filter(conversation__isnull=True):
        conv = Conversation.objects.create(is_group=True, title=community.name)
        member_ids = set(
            CommunityMembership.objects.filter(community=community).values_list('user_id', flat=True)
        )
        member_ids.add(community.owner_id)
        conv.participants.set(member_ids)
        community.conversation_id = conv.id
        community.save(update_fields=['conversation_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('communities', '0002_community_conversation'),
    ]

    operations = [
        migrations.RunPython(create_chats_for_existing_communities, migrations.RunPython.noop),
    ]
