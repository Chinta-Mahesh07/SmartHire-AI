from django.urls import path
from .views import RecruiterProfileView, RecruiterDashboardStatsView

urlpatterns = [
    path('profile/', RecruiterProfileView.as_view(), name='recruiter_profile'),
    path('dashboard/stats/', RecruiterDashboardStatsView.as_view(), name='recruiter_dashboard_stats'),
]
