from django.urls import path
from .views import (
    CandidateProfileView,
    SkillListCreateView,
    CandidateSkillListCreateView,
    CandidateSkillDeleteView,
    EducationListCreateView,
    EducationDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    ResumeUploadView,
    ResumeDeleteView,
    SavedJobToggleView,
    CandidateDashboardStatsView
)

urlpatterns = [
    path('profile/', CandidateProfileView.as_view(), name='candidate_profile'),
    path('dashboard/stats/', CandidateDashboardStatsView.as_view(), name='candidate_dashboard_stats'),
    path('skills/', SkillListCreateView.as_view(), name='skill_list_create'),
    path('my-skills/', CandidateSkillListCreateView.as_view(), name='candidate_skills_list_create'),
    path('my-skills/<int:pk>/', CandidateSkillDeleteView.as_view(), name='candidate_skills_delete'),
    path('education/', EducationListCreateView.as_view(), name='education_list_create'),
    path('education/<int:pk>/', EducationDetailView.as_view(), name='education_detail'),
    path('experience/', ExperienceListCreateView.as_view(), name='experience_list_create'),
    path('experience/<int:pk>/', ExperienceDetailView.as_view(), name='experience_detail'),
    path('resumes/', ResumeUploadView.as_view(), name='resume_upload_list'),
    path('resumes/<int:pk>/', ResumeDeleteView.as_view(), name='resume_delete'),
    path('saved-jobs/', SavedJobToggleView.as_view(), name='saved_jobs_list'),
    path('saved-jobs/<int:job_id>/toggle/', SavedJobToggleView.as_view(), name='saved_job_toggle'),
]
