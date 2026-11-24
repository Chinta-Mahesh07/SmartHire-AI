from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import JobApplication
from .serializers import (
    JobApplicationSerializer,
    JobApplicationDetailSerializer,
    ApplyJobSerializer,
    ApplicationStatusUpdateSerializer
)
from accounts.permissions import IsCandidateRole, IsRecruiterRole, IsAdminUserRole
from candidates.models import CandidateProfile, Resume
from jobs.models import Job
from notifications.models import Notification
from ai_analyzer.services import ResumeAnalyzer

class ApplyJobView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def post(self, request):
        serializer = ApplyJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job_id = serializer.validated_data['job']
        resume_id = serializer.validated_data.get('resume')
        cover_note = serializer.validated_data.get('cover_note', '')

        job = get_object_or_404(Job, pk=job_id)
        if job.status != 'ACTIVE':
            return Response({'error': 'This job posting is no longer active.'}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        # Check existing application
        if JobApplication.objects.filter(job=job, candidate=profile).exists():
            return Response({'error': 'You have already applied for this position.'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch resume
        resume = None
        if resume_id:
            resume = Resume.objects.filter(pk=resume_id, candidate=profile).first()
        if not resume:
            resume = Resume.objects.filter(candidate=profile, is_primary=True).first()

        # Compute AI match score
        resume_text = resume.extracted_text if resume else ""
        if not resume_text:
            # Aggregate skills and headline if no extracted resume text
            cand_skills = [cs.skill.name for cs in profile.skills.all()]
            resume_text = f"{profile.headline} {profile.bio} Skills: {', '.join(cand_skills)}"

        ai_result = ResumeAnalyzer.analyze_resume_text(resume_text, target_job=job)
        score = ai_result.get('resume_score', 75.0)

        application = JobApplication.objects.create(
            job=job,
            candidate=profile,
            resume=resume,
            cover_note=cover_note,
            ai_match_score=score,
            match_details=ai_result,
            status='APPLIED'
        )

        # Notify Recruiter
        Notification.objects.create(
            recipient=job.recruiter,
            title=f"New Applicant for {job.title}",
            message=f"{request.user.get_full_name() or request.user.username} has applied for '{job.title}' with an AI match score of {score}%.",
            notification_type='APPLICATION',
            reference_id=str(application.id)
        )

        # Notify Candidate
        Notification.objects.create(
            recipient=request.user,
            title="Application Submitted Successfully",
            message=f"You successfully applied for '{job.title}' at {job.company.name}.",
            notification_type='APPLICATION',
            reference_id=str(application.id)
        )

        return Response({
            'message': 'Application submitted successfully.',
            'application': JobApplicationSerializer(application, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class CandidateApplicationsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = JobApplicationDetailSerializer

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return JobApplication.objects.filter(candidate=profile).select_related('job__company', 'resume').order_by('-applied_at')


class RecruiterApplicationsListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None

        if company:
            qs = JobApplication.objects.filter(job__company=company)
        else:
            qs = JobApplication.objects.filter(job__recruiter=user)

        job_id = self.request.query_params.get('job_id')
        app_status = self.request.query_params.get('status')
        min_score = self.request.query_params.get('min_score')

        if job_id:
            qs = qs.filter(job_id=job_id)
        if app_status:
            qs = qs.filter(status=app_status)
        if min_score:
            try:
                qs = qs.filter(ai_match_score__gte=float(min_score))
            except ValueError:
                pass

        return qs.select_related('candidate__user', 'job', 'resume').order_by('-applied_at')


class RecruiterApplicationDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = JobApplicationDetailSerializer

    def get_queryset(self):
        user = self.request.user
        company = getattr(user.recruiter_profile, 'company', None) if hasattr(user, 'recruiter_profile') else None
        if company:
            return JobApplication.objects.filter(job__company=company)
        return JobApplication.objects.filter(job__recruiter=user)

    def patch(self, request, *args, **kwargs):
        application = self.get_object()
        new_status = request.data.get('status')
        recruiter_notes = request.data.get('recruiter_notes')

        if new_status and new_status in dict(JobApplication.STATUS_CHOICES).keys():
            old_status = application.status
            application.status = new_status
            if recruiter_notes is not None:
                application.recruiter_notes = recruiter_notes
            application.save()

            # Trigger notification to candidate on status change
            if old_status != new_status:
                Notification.objects.create(
                    recipient=application.candidate.user,
                    title=f"Application Update: {application.job.title}",
                    message=f"Your application status for '{application.job.title}' has been updated to: {application.get_status_display()}.",
                    notification_type='STATUS_UPDATE',
                    reference_id=str(application.id)
                )

            return Response({
                'message': f"Application status updated to {application.get_status_display()}.",
                'application': JobApplicationDetailSerializer(application, context={'request': request}).data
            })
        return Response({'error': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)
