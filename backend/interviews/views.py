from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Interview
from .serializers import InterviewSerializer
from applications.models import JobApplication
from accounts.permissions import IsRecruiterRole, IsCandidateRole
from notifications.models import Notification

class ScheduleInterviewView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = InterviewSerializer

    def perform_create(self, serializer):
        application_id = self.request.data.get('application')
        application = get_object_or_404(JobApplication, pk=application_id)

        interview = serializer.save(
            recruiter=self.request.user,
            candidate=application.candidate,
            application=application
        )

        # Update application status to INTERVIEW_SCHEDULED
        application.status = 'INTERVIEW_SCHEDULED'
        application.save()

        # Send notification to candidate
        meeting_info = f"Meeting Link: {interview.meeting_link}" if interview.interview_type == 'ONLINE' else f"Location: {interview.location_details}"
        Notification.objects.create(
            recipient=application.candidate.user,
            title=f"Interview Scheduled: {application.job.title}",
            message=f"You have been invited for '{interview.title}' on {interview.scheduled_at.strftime('%b %d, %Y at %I:%M %p')}. {meeting_info}",
            notification_type='INTERVIEW',
            reference_id=str(interview.id)
        )


class RecruiterInterviewsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        return Interview.objects.filter(recruiter=self.request.user).select_related(
            'application__job__company',
            'candidate__user'
        ).order_by('scheduled_at')


class CandidateInterviewsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = InterviewSerializer

    def get_queryset(self):
        if hasattr(self.request.user, 'candidate_profile'):
            return Interview.objects.filter(candidate=self.request.user.candidate_profile).select_related(
                'application__job__company',
                'recruiter'
            ).order_by('scheduled_at')
        return Interview.objects.none()


class InterviewDetailUpdateView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = InterviewSerializer
    queryset = Interview.objects.all()

    def perform_update(self, serializer):
        old_status = self.get_object().status
        interview = serializer.save()

        # If status changed or feedback added, notify candidate
        if old_status != interview.status and interview.status == 'COMPLETED':
            Notification.objects.create(
                recipient=interview.candidate.user,
                title=f"Interview Completed: {interview.title}",
                message=f"Your interview for '{interview.application.job.title}' has been marked as completed.",
                notification_type='INTERVIEW',
                reference_id=str(interview.id)
            )
