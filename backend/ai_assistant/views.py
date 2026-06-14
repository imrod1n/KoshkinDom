from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .knowledge import FAQ, find_answer
from .models import AIChatMessage
from .serializers import AIChatMessageSerializer


class AskAIView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        question = request.data.get('question', '').strip()
        if not question:
            return Response({'detail': 'Введите вопрос'}, status=400)
        answer = find_answer(question)
        user = request.user if request.user.is_authenticated else None
        msg = AIChatMessage.objects.create(user=user, question=question, answer=answer)
        return Response(AIChatMessageSerializer(msg).data)


class AIHistoryView(generics.ListAPIView):
    serializer_class = AIChatMessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return AIChatMessage.objects.filter(user=self.request.user)


class FAQListView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        items = [{'topic': ', '.join(f['keywords'][:2]), 'preview': f['answer'][:120] + '…'} for f in FAQ]
        return Response(items)
