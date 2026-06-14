from django.db.models import Q
from django.http import Http404
from rest_framework import generics, permissions
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly

from accounts.models import UserFollow
from .models import Comment, Like, Post
from .serializers import CommentSerializer, PostSerializer


class PostListCreateView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny] 
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        qs = Post.objects.select_related('author', 'repost_of').prefetch_related(
            'likes', 'comments__author'
        )
        feed = self.request.query_params.get('feed')
        if feed == 'following' and self.request.user.is_authenticated:
            following_ids = UserFollow.objects.filter(
                follower=self.request.user
            ).values_list('following_id', flat=True)
            qs = qs.filter(
                Q(author_id__in=following_ids) | Q(author=self.request.user)
            )
        author = self.request.query_params.get('author')
        if author:
            qs = qs.filter(author__username=author)
        return qs


class PostDetailView(generics.RetrieveDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            self.permission_denied(self.request)
        instance.delete()


class LikeToggleView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        post = Post.objects.filter(pk=pk).first()
        if not post:
            return Response({'detail': 'Не найдено'}, status=404)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': post.likes.count()})
        return Response({'liked': True, 'likes_count': post.likes.count()})


class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        post = Post.objects.filter(pk=self.kwargs['pk']).first()
        if not post:
            raise Http404
        serializer.save(author=self.request.user, post=post)


class RepostView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        original = Post.objects.filter(pk=pk).first()
        if not original:
            return Response({'detail': 'Не найдено'}, status=404)
        if Post.objects.filter(author=request.user, repost_of=original).exists():
            return Response({'detail': 'Уже репостили'}, status=400)
        repost = Post.objects.create(
            author=request.user,
            content_text=f'Репост от @{original.author.username}',
            content_raw={'blocks': [], 'entityMap': {}},
            repost_of=original,
        )
        return Response(PostSerializer(repost, context={'request': request}).data, status=201)
