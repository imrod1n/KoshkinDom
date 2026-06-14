from rest_framework import generics, permissions

from .models import ForumReply, ForumTopic
from .serializers import ForumReplyCreateSerializer, ForumTopicSerializer


class ForumTopicListCreateView(generics.ListCreateAPIView):
    serializer_class = ForumTopicSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = ForumTopic.objects.select_related('author').prefetch_related('replies__author')
        expert = self.request.query_params.get('expert')
        if expert == '1':
            qs = qs.filter(is_expert_question=True)
        return qs


class ForumTopicDetailView(generics.RetrieveAPIView):
    queryset = ForumTopic.objects.prefetch_related('replies__author')
    serializer_class = ForumTopicSerializer


class ForumReplyCreateView(generics.CreateAPIView):
    serializer_class = ForumReplyCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['topic_id'] = self.kwargs['pk']
        return ctx
