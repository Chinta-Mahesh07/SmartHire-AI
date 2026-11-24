from django.urls import path
from .views import (
    ApplyJobView,
    CandidateApplicationsListView,
    RecruiterApplicationsListView,
    RecruiterApplicationDetailView
)

urlpatterns = [
    path('apply/', ApplyJobView.as_view(), name='apply_job'),
    path('candidate/my-applications/', CandidateApplicationsListView.as_view(), name='candidate_applications'),
    path('recruiter/manage/', RecruiterApplicationsListView.as_view(), name='recruiter_applications'),
    path('recruiter/manage/<int:pk>/', RecruiterApplicationDetailView.as_view(), name='recruiter_application_detail'),
]
