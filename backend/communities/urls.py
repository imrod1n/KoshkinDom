from django.urls import path

from .views import CommunityDetailView, CommunityListCreateView, JoinCommunityView

urlpatterns = [
    path('', CommunityListCreateView.as_view()),
    path('<slug:slug>/', CommunityDetailView.as_view()),
    path('<slug:slug>/join/', JoinCommunityView.as_view()),
]
