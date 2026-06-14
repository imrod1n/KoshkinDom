from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event, EventAttendance
from .serializers import EventSerializer


class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        qs = Event.objects.select_related('organizer').prefetch_related('attendees')
        month = self.request.query_params.get('month')
        if month:
            qs = qs.filter(starts_at__month=month)
        return qs


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class AttendEventView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        event = Event.objects.filter(pk=pk).first()
        if not event:
            return Response({'detail': 'Не найдено'}, status=404)
        EventAttendance.objects.get_or_create(user=request.user, event=event)
        return Response({'detail': 'Вы записались на мероприятие'})

    def delete(self, request, pk):
        event = Event.objects.filter(pk=pk).first()
        if not event:
            return Response({'detail': 'Не найдено'}, status=404)
        EventAttendance.objects.filter(user=request.user, event=event).delete()
        return Response({'detail': 'Запись отменена'})
