from django.urls import path
from .views import (
    JobCategoryListView,
    JobListView,
    JobDetailView,
    RecruiterJobListCreateView,
    RecruiterJobDetailView,
    AdminJobListView,
    AdminJobStatusView
)

urlpatterns = [
    # Public & candidate endpoints
    path('', JobListView.as_view(), name='job_list'),
    path('categories/', JobCategoryListView.as_view(), name='job_category_list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),

    # Recruiter endpoints
    path('recruiter/manage/', RecruiterJobListCreateView.as_view(), name='recruiter_job_list_create'),
    path('recruiter/manage/<int:pk>/', RecruiterJobDetailView.as_view(), name='recruiter_job_detail'),

    # Admin endpoints
    path('admin/all/', AdminJobListView.as_view(), name='admin_jobs_list'),
    path('admin/<int:pk>/status/', AdminJobStatusView.as_view(), name='admin_job_status'),
]
