from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    UserUpdateSerializer,
    AdminUserManageSerializer
)
from .permissions import IsAdminUserRole
from notifications.models import Notification

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)

        # Trigger welcome notification
        Notification.objects.create(
            recipient=user,
            title="Welcome to SmartHire AI!",
            message=f"Hello {user.first_name or user.username}, your account has been successfully created as a {user.get_role_display()}.",
            notification_type='ACCOUNT'
        )

        return Response({
            'message': 'Registration successful.',
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate with email (USERNAME_FIELD is email)
        user = authenticate(request, username=email, password=password)
        if not user:
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'error': 'Your account has been deactivated. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Login successful.',
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')

        if role:
            qs = qs.filter(role=role.upper())
        if search:
            qs = qs.filter(
                Q(email__icontains=search) |
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)

        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUserRole]
    queryset = User.objects.all()
    serializer_class = AdminUserManageSerializer

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        is_active = request.data.get('is_active')
        is_approved = request.data.get('is_approved')

        if is_active is not None:
            user.is_active = bool(is_active)
        if is_approved is not None:
            user.is_approved = bool(is_approved)

        user.save()
        return Response({
            'message': 'User status updated successfully.',
            'user': UserSerializer(user, context={'request': request}).data
        })


class AdminRecruiterApprovalView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role='RECRUITER')
            action = request.data.get('action', 'approve').lower() # 'approve' or 'reject'
            notes = request.data.get('notes', '')

            recruiter_profile = getattr(user, 'recruiter_profile', None)
            if not recruiter_profile:
                return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

            if action == 'approve':
                recruiter_profile.approval_status = 'APPROVED'
                user.is_approved = True
                notification_msg = "Your recruiter account has been approved by the Administrator. You may now post jobs and manage candidates."
            else:
                recruiter_profile.approval_status = 'REJECTED'
                user.is_approved = False
                notification_msg = f"Your recruiter account application was not approved. Reason: {notes or 'Information incomplete'}."

            recruiter_profile.approved_by = request.user
            recruiter_profile.approval_notes = notes
            recruiter_profile.save()
            user.save()

            # Create notification
            Notification.objects.create(
                recipient=user,
                title="Recruiter Account Status Update",
                message=notification_msg,
                notification_type='ACCOUNT'
            )

            return Response({
                'message': f"Recruiter successfully {recruiter_profile.approval_status.lower()}.",
                'approval_status': recruiter_profile.approval_status
            })
        except User.DoesNotExist:
            return Response({'error': 'Recruiter user not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminDashboardAnalyticsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        from jobs.models import Job, JobCategory
        from applications.models import JobApplication
        from companies.models import Company

        total_users = User.objects.count()
        total_recruiters = User.objects.filter(role='RECRUITER').count()
        total_candidates = User.objects.filter(role='CANDIDATE').count()
        total_companies = Company.objects.count()
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(status='ACTIVE').count()
        total_applications = JobApplication.objects.count()
        successful_placements = JobApplication.objects.filter(status='SELECTED').count()

        # Placement rate
        placement_rate = round((successful_placements / max(total_applications, 1)) * 100, 1)

        # Applications by Status Breakdown
        status_counts = []
        status_labels = dict(JobApplication.STATUS_CHOICES)
        for code, label in status_labels.items():
            count = JobApplication.objects.filter(status=code).count()
            status_counts.append({
                'status': code,
                'label': label,
                'count': count
            })

        # Jobs by Category
        categories = JobCategory.objects.all()
        category_distribution = []
        for cat in categories:
            j_count = cat.jobs.count()
            if j_count > 0:
                category_distribution.append({
                    'name': cat.name,
                    'jobs_count': j_count
                })

        # Recent activities
        recent_users = User.objects.order_by('-created_at')[:5]
        recent_apps = JobApplication.objects.select_related('candidate__user', 'job__company').order_by('-applied_at')[:5]

        recent_users_data = [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': u.role,
                'is_active': u.is_active,
                'created_at': u.created_at.isoformat()
            }
            for u in recent_users
        ]

        recent_apps_data = [
            {
                'id': a.id,
                'candidate_name': a.candidate.user.get_full_name() or a.candidate.user.username,
                'job_title': a.job.title,
                'company_name': a.job.company.name,
                'status': a.status,
                'ai_match_score': float(a.ai_match_score),
                'applied_at': a.applied_at.isoformat()
            }
            for a in recent_apps
        ]

        # Growth trends mock/computed data for recharts
        trends = [
            {'month': 'Jan', 'applications': 14, 'jobs': 5, 'placements': 2},
            {'month': 'Feb', 'applications': 28, 'jobs': 8, 'placements': 4},
            {'month': 'Mar', 'applications': 45, 'jobs': 12, 'placements': 7},
            {'month': 'Apr', 'applications': 62, 'jobs': 15, 'placements': 11},
            {'month': 'May', 'applications': 89, 'jobs': 22, 'placements': 16},
            {'month': 'Jun', 'applications': max(total_applications, 110), 'jobs': max(total_jobs, 28), 'placements': max(successful_placements, 21)},
        ]

        return Response({
            'stats': {
                'total_users': total_users,
                'total_recruiters': total_recruiters,
                'total_candidates': total_candidates,
                'total_companies': total_companies,
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'total_applications': total_applications,
                'successful_placements': successful_placements,
                'placement_rate': placement_rate
            },
            'status_breakdown': status_counts,
            'category_distribution': category_distribution,
            'trends': trends,
            'recent_users': recent_users_data,
            'recent_applications': recent_apps_data
        })

