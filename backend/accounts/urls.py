from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    CurrentUserView,
    AdminUserListView,
    AdminUserDetailView,
    AdminRecruiterApprovalView,
    AdminDashboardAnalyticsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', CurrentUserView.as_view(), name='user_profile'),

    # Admin Management & Analytics
    path('admin/analytics/', AdminDashboardAnalyticsView.as_view(), name='admin_analytics'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users_list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/recruiters/<int:pk>/approval/', AdminRecruiterApprovalView.as_view(), name='admin_recruiter_approval'),
]
