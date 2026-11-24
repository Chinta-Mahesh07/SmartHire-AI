from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import RecruiterProfile
from .serializers import RecruiterProfileSerializer
from accounts.permissions import IsRecruiterRole
from jobs.models import Job
from applications.models import JobApplication
from interviews.models import Interview

class RecruiterProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = RecruiterProfileSerializer

    def get_object(self):
        profile, _ = RecruiterProfile.objects.get_or_create(user=self.request.user)
        return profile


class RecruiterDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]

    def get(self, request):
        user = request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None

        # Scope by recruiter's company or user
        if company:
            jobs_qs = Job.objects.filter(company=company)
        else:
            jobs_qs = Job.objects.filter(recruiter=user)

        total_jobs = jobs_qs.count()
        active_jobs = jobs_qs.filter(status='ACTIVE').count()

        applications_qs = JobApplication.objects.filter(job__in=jobs_qs)
        total_applications = applications_qs.count()
        shortlisted = applications_qs.filter(status='SHORTLISTED').count()
        interviews_scheduled = applications_qs.filter(status='INTERVIEW_SCHEDULED').count()
        hired = applications_qs.filter(status='SELECTED').count()
        rejected = applications_qs.filter(status='REJECTED').count()

        upcoming_interviews = Interview.objects.filter(
            recruiter=user,
            status='SCHEDULED'
        ).count()

        # Recent applications
        recent_apps = applications_qs.select_related('candidate__user', 'job').order_by('-applied_at')[:5]
        recent_apps_data = [
            {
                "id": app.id,
                "candidate_name": app.candidate.user.get_full_name() or app.candidate.user.username,
                "job_title": app.job.title,
                "applied_at": app.applied_at.isoformat(),
                "status": app.status,
                "ai_match_score": float(app.ai_match_score)
            }
            for app in recent_apps
        ]

        return Response({
            "company_name": company.name if company else "Not Assigned",
            "stats": {
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "total_applications": total_applications,
                "shortlisted": shortlisted,
                "interviews_scheduled": interviews_scheduled,
                "hired": hired,
                "rejected": rejected,
                "upcoming_interviews": upcoming_interviews
            },
            "recent_applications": recent_apps_data
        })
