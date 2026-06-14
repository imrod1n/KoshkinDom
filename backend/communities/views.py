from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Community, CommunityMembership
from .serializers import CommunitySerializer
from .services import sync_member_to_chat


class CommunityListCreateView(generics.ListCreateAPIView):
    queryset = Community.objects.select_related('owner', 'conversation').prefetch_related('members')
    serializer_class = CommunitySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    lookup_field = 'slug'


class CommunityDetailView(generics.RetrieveAPIView):
    queryset = Community.objects.select_related('conversation')
    serializer_class = CommunitySerializer
    lookup_field = 'slug'


class JoinCommunityView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, slug):
        community = Community.objects.filter(slug=slug).select_related('conversation').first()
        if not community:
            return Response({'detail': 'Не найдено'}, status=404)
        _, created = CommunityMembership.objects.get_or_create(user=request.user, community=community)
        if created:
            sync_member_to_chat(community, request.user, joined=True)
        return Response({
            'detail': 'Вы вступили в сообщество',
            'conversation_id': community.conversation_id,
        })

    def delete(self, request, slug):
        community = Community.objects.filter(slug=slug).select_related('conversation').first()
        if not community:
            return Response({'detail': 'Не найдено'}, status=404)
        if community.owner_id == request.user.id:
            return Response({'detail': 'Создатель не может покинуть сообщество'}, status=400)
        deleted, _ = CommunityMembership.objects.filter(
            user=request.user, community=community
        ).delete()
        if deleted:
            sync_member_to_chat(community, request.user, joined=False)
        return Response({'detail': 'Вы покинули сообщество'})
