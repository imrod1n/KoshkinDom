from django.urls import path

from .views import PetDetailView, PetListCreateView, ReminderDetailView, ReminderListCreateView

urlpatterns = [
    path('pets/', PetListCreateView.as_view()),
    path('pets/<int:pk>/', PetDetailView.as_view()),
    path('', ReminderListCreateView.as_view()),
    path('<int:pk>/', ReminderDetailView.as_view()),
]
