from datetime import datetime, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from accounts.models import Notification, UserFollow
from communities.models import CommunityMembership
from events.models import Event
from posts.models import Post
from reminders.models import Reminder

User = get_user_model()


class Command(BaseCommand):
    help = 'Generate notifications for all users based on their subscriptions'

    def handle(self, *args, **options):
        Notification.objects.all().delete()  # Clear old notifications
        now = timezone.now()
        today = timezone.localdate()

        for user in User.objects.filter(is_active=True):
            following_ids = UserFollow.objects.filter(follower=user).values_list('following_id', flat=True)

            # Events notifications
            upcoming_events = Event.objects.filter(
                attendees__user=user, starts_at__gte=now
            ).order_by('starts_at')[:5]
            for ev in upcoming_events:
                Notification.objects.get_or_create(
                    user=user,
                    notification_type='event',
                    title=f'Запись на событие "{ev.title}"',
                    defaults={
                        'message': f'Мероприятие состоится {ev.starts_at.strftime("%d.%m.%Y %H:%M")}',
                        'url': f'/events',
                        'created_at': ev.starts_at,
                    }
                )

            # Posts notifications
            new_posts = Post.objects.filter(
                Q(author_id__in=following_ids) | Q(community__members__user=user)
            ).exclude(author=user).distinct().order_by('-created_at')[:5]
            for post in new_posts:
                source = post.community.name if post.community else f'@{post.author.username}'
                message = post.content_text[:120] if post.content_text else '[Пост с изображением]'
                Notification.objects.get_or_create(
                    user=user,
                    notification_type='post',
                    title=f'Новый пост от {source}',
                    defaults={
                        'message': message,
                        'url': f'post-{post.id}',  # Will be parsed on frontend
                        'created_at': post.created_at,
                    }
                )

            # Reminders notifications
            upcoming_reminders = Reminder.objects.filter(
                pet__owner=user, is_done=False, due_date__gte=today
            ).order_by('due_date')[:5]
            for rem in upcoming_reminders:
                Notification.objects.get_or_create(
                    user=user,
                    notification_type='reminder',
                    title=f'Напоминание по {rem.pet.name}',
                    defaults={
                        'message': f'{rem.title} на {rem.due_date}',
                        'url': '/reminders',
                        'created_at': datetime.combine(rem.due_date, time.min),
                    }
                )

        self.stdout.write(self.style.SUCCESS('Notifications generated successfully'))
