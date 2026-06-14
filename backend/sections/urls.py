from django.urls import path

from .views import ArticleDetailView, ArticleListCreateView, SectionDetailView, SectionListView

urlpatterns = [
    path('', SectionListView.as_view()),
    path('articles/', ArticleListCreateView.as_view()),
    path('articles/<int:pk>/', ArticleDetailView.as_view()),
    path('<str:category>/', SectionDetailView.as_view()),
]
