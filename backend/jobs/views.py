from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from .models import JobCategory, Job
from .serializers import (
    JobCategorySerializer,
    JobSerializer,
    JobDetailSerializer,
    JobCreateUpdateSerializer
)
from accounts.permissions import IsRecruiterRole, IsAdminUserRole
from companies.models import Company

class JobCategoryListView(generics.ListCreateAPIView):
    queryset = JobCategory.objects.filter(is_active=True)
    serializer_class = JobCategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUserRole()]
        return [permissions.AllowAny()]


class JobListView(generics.ListAPIView):
    """Public and candidate job search with multi-faceted filtering."""
    permission_classes = [permissions.AllowAny]
    serializer_class = JobSerializer

    def get_queryset(self):
        qs = Job.objects.filter(status='ACTIVE').select_related('company', 'category').prefetch_related('required_skills')

        search = self.request.query_params.get('search')
        location = self.request.query_params.get('location')
        category_id = self.request.query_params.get('category')
        job_type = self.request.query_params.get('job_type')
        experience_level = self.request.query_params.get('experience_level')
        min_salary = self.request.query_params.get('min_salary')
        is_remote = self.request.query_params.get('is_remote')
        skill = self.request.query_params.get('skill')

        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(requirements__icontains=search) |
                Q(company__name__icontains=search)
            )

        if location:
            qs = qs.filter(location__icontains=location)

        if category_id:
            qs = qs.filter(category_id=category_id)

        if job_type:
            qs = qs.filter(job_type=job_type)

        if experience_level:
            qs = qs.filter(experience_level=experience_level)

        if min_salary:
            try:
                qs = qs.filter(max_salary__gte=float(min_salary))
            except ValueError:
                pass

        if is_remote is not None and is_remote != '':
            qs = qs.filter(is_remote=(str(is_remote).lower() in ['true', '1']))

        if skill:
            qs = qs.filter(required_skills__name__icontains=skill)

        return qs.distinct().order_by('-created_at')


class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Job.objects.select_related('company', 'category').prefetch_related('required_skills')
    serializer_class = JobDetailSerializer

    def get_object(self):
        obj = super().get_object()
        # Increment view count
        Job.objects.filter(pk=obj.pk).update(views_count=F('views_count') + 1)
        obj.views_count += 1
        return obj


class RecruiterJobListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        user = self.request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None
        if company:
            return Job.objects.filter(company=company).order_by('-created_at')
        return Job.objects.filter(recruiter=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None
        if not company:
            # Auto create or link company for recruiter
            company, _ = Company.objects.get_or_create(
                name=f"{user.first_name or user.username}'s Company",
                defaults={'created_by': user}
            )
            if hasattr(user, 'recruiter_profile'):
                user.recruiter_profile.company = company
                user.recruiter_profile.save()

        serializer.save(recruiter=user, company=company)


class RecruiterJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobSerializer

    def get_queryset(self):
        user = self.request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None
        if company:
            return Job.objects.filter(company=company)
        return Job.objects.filter(recruiter=user)


class AdminJobListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = JobSerializer
    queryset = Job.objects.all().select_related('company', 'recruiter').order_by('-created_at')


class AdminJobStatusView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        new_status = request.data.get('status')
        if new_status in ['ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT']:
            job.status = new_status
            job.save()
            return Response({'message': f'Job status updated to {new_status}.', 'status': job.status})
        return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        job.delete()
        return Response({'message': 'Job deleted successfully.'})
