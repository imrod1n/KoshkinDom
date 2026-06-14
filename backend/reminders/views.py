from rest_framework import generics, permissions

from .models import Pet, Reminder
from .serializers import PetSerializer, ReminderSerializer


class PetListCreateView(generics.ListCreateAPIView):
    serializer_class = PetSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user).prefetch_related('reminders')


class PetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PetSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user)


class ReminderListCreateView(generics.ListCreateAPIView):
    serializer_class = ReminderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Reminder.objects.filter(pet__owner=self.request.user).select_related('pet')
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == '1':
            from django.utils import timezone
            qs = qs.filter(is_done=False, due_date__gte=timezone.localdate())
        return qs

    def perform_create(self, serializer):
        pet = serializer.validated_data['pet']
        if pet.owner != self.request.user:
            self.permission_denied(self.request)
        serializer.save()


class ReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReminderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Reminder.objects.filter(pet__owner=self.request.user)
