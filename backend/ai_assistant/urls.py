from django.urls import path

from .views import AIHistoryView, AskAIView, FAQListView

urlpatterns = [
    path('ask/', AskAIView.as_view()),
    path('history/', AIHistoryView.as_view()),
    path('faq/', FAQListView.as_view()),
]
