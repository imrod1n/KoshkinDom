from django.urls import path

from .views import AttendEventView, EventDetailView, EventListCreateView

urlpatterns = [
    path('', EventListCreateView.as_view()),
    path('<int:pk>/', EventDetailView.as_view()),
    path('<int:pk>/attend/', AttendEventView.as_view()),
]
