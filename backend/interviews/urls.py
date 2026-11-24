from django.urls import path
from .views import (
    ScheduleInterviewView,
    RecruiterInterviewsListView,
    CandidateInterviewsListView,
    InterviewDetailUpdateView
)

urlpatterns = [
    path('schedule/', ScheduleInterviewView.as_view(), name='schedule_interview'),
    path('recruiter/', RecruiterInterviewsListView.as_view(), name='recruiter_interviews'),
    path('candidate/', CandidateInterviewsListView.as_view(), name='candidate_interviews'),
    path('<int:pk>/', InterviewDetailUpdateView.as_view(), name='interview_detail_update'),
]
