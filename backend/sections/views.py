from rest_framework import generics, permissions

from .models import Article, Section
from .serializers import ArticleSerializer, SectionSerializer


class SectionListView(generics.ListAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = (permissions.AllowAny,)


class SectionDetailView(generics.RetrieveAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    lookup_field = 'category'


class ArticleListCreateView(generics.ListCreateAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Article.objects.select_related('section', 'author')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(section__category=category)
        return qs


class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
