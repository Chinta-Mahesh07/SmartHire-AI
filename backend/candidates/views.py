from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import (
    CandidateProfile,
    Skill,
    CandidateSkill,
    Education,
    Experience,
    Resume,
    SavedJob
)
from .serializers import (
    CandidateProfileSerializer,
    SkillSerializer,
    CandidateSkillSerializer,
    EducationSerializer,
    ExperienceSerializer,
    ResumeSerializer,
    SavedJobSerializer
)
from accounts.permissions import IsCandidateRole
from ai_analyzer.services import extract_text_from_pdf, extract_skills_from_text, estimate_experience_years
from applications.models import JobApplication
from interviews.models import Interview

class CandidateProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = CandidateProfileSerializer

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile


class SkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        query = self.request.query_params.get('search')
        if query:
            qs = qs.filter(name__icontains=query)
        return qs


class CandidateSkillListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = CandidateSkillSerializer

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return CandidateSkill.objects.filter(candidate=profile)

    def create(self, request, *args, **kwargs):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        skill_id = request.data.get('skill')
        skill_name = request.data.get('skill_name')

        if skill_name and not skill_id:
            skill_obj, _ = Skill.objects.get_or_create(name=skill_name.strip().title())
            skill_id = skill_obj.id

        if not skill_id:
            return Response({'error': 'Skill or skill_name is required.'}, status=status.HTTP_400_BAD_REQUEST)

        skill = get_object_or_404(Skill, pk=skill_id)
        candidate_skill, created = CandidateSkill.objects.update_or_create(
            candidate=profile,
            skill=skill,
            defaults={
                'proficiency_level': request.data.get('proficiency_level', 'INTERMEDIATE'),
                'years_of_experience': request.data.get('years_of_experience', 1.0)
            }
        )
        return Response(CandidateSkillSerializer(candidate_skill).data, status=status.HTTP_201_CREATED)


class CandidateSkillDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get_queryset(self):
        profile = get_object_or_404(CandidateProfile, user=self.request.user)
        return CandidateSkill.objects.filter(candidate=profile)


class EducationListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = EducationSerializer

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return Education.objects.filter(candidate=profile)

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class EducationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = EducationSerializer

    def get_queryset(self):
        profile = get_object_or_404(CandidateProfile, user=self.request.user)
        return Education.objects.filter(candidate=profile)


class ExperienceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return Experience.objects.filter(candidate=profile)

    def perform_create(self, serializer):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        serializer.save(candidate=profile)


class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        profile = get_object_or_404(CandidateProfile, user=self.request.user)
        return Experience.objects.filter(candidate=profile)


class ResumeUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        resumes = Resume.objects.filter(candidate=profile)
        return Response(ResumeSerializer(resumes, many=True, context={'request': request}).data)

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        file = request.FILES.get('file')
        title = request.data.get('title', 'My Resume')

        if not file:
            return Response({'error': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

        if not file.name.lower().endswith('.pdf'):
            return Response({'error': 'Only PDF format is accepted for resumes.'}, status=status.HTTP_400_BAD_REQUEST)

        # Max size 10MB
        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size must not exceed 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark other resumes as non-primary
        Resume.objects.filter(candidate=profile).update(is_primary=False)

        resume = Resume.objects.create(
            candidate=profile,
            file=file,
            title=title,
            is_primary=True
        )

        # Extract text from PDF
        try:
            resume.file.open('rb')
            extracted_text = extract_text_from_pdf(resume.file)
            resume.file.close()
            resume.extracted_text = extracted_text
            resume.save()

            # Automatically detect skills and add to profile if empty
            if extracted_text:
                detected_skills = extract_skills_from_text(extracted_text)
                for s_name in detected_skills:
                    skill_obj, _ = Skill.objects.get_or_create(name=s_name.title())
                    CandidateSkill.objects.get_or_create(
                        candidate=profile,
                        skill=skill_obj,
                        defaults={'proficiency_level': 'INTERMEDIATE', 'years_of_experience': 1.0}
                    )

                # Update candidate total experience years if not set
                if profile.total_experience_years == 0:
                    est_years = estimate_experience_years(extracted_text)
                    profile.total_experience_years = est_years
                    profile.save()

        except Exception as e:
            pass

        return Response({
            'message': 'Resume uploaded and analyzed successfully.',
            'resume': ResumeSerializer(resume, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)


class ResumeDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get_queryset(self):
        profile = get_object_or_404(CandidateProfile, user=self.request.user)
        return Resume.objects.filter(candidate=profile)


class SavedJobToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        saved = SavedJob.objects.filter(candidate=profile)
        return Response(SavedJobSerializer(saved, many=True, context={'request': request}).data)

    def post(self, request, job_id):
        from jobs.models import Job
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        job = get_object_or_404(Job, pk=job_id)

        saved_item = SavedJob.objects.filter(candidate=profile, job=job).first()
        if saved_item:
            saved_item.delete()
            return Response({'saved': False, 'message': 'Job removed from saved jobs.'})
        else:
            SavedJob.objects.create(candidate=profile, job=job)
            return Response({'saved': True, 'message': 'Job saved successfully.'})


class CandidateDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        total_applied = JobApplication.objects.filter(candidate=profile).count()
        under_review = JobApplication.objects.filter(candidate=profile, status='UNDER_REVIEW').count()
        interviews_scheduled = JobApplication.objects.filter(candidate=profile, status='INTERVIEW_SCHEDULED').count()
        shortlisted = JobApplication.objects.filter(candidate=profile, status='SHORTLISTED').count()
        offers = JobApplication.objects.filter(candidate=profile, status='SELECTED').count()
        saved_jobs = SavedJob.objects.filter(candidate=profile).count()

        upcoming_interviews = Interview.objects.filter(
            candidate=profile,
            status='SCHEDULED'
        ).count()

        # Recent applications
        apps = JobApplication.objects.filter(candidate=profile).select_related('job__company').order_by('-applied_at')[:5]
        apps_data = [
            {
                "id": a.id,
                "job_id": a.job.id,
                "job_title": a.job.title,
                "company_name": a.job.company.name,
                "applied_at": a.applied_at.isoformat(),
                "status": a.status,
                "ai_match_score": float(a.ai_match_score)
            }
            for a in apps
        ]

        return Response({
            "stats": {
                "total_applied": total_applied,
                "under_review": under_review,
                "shortlisted": shortlisted,
                "interviews_scheduled": interviews_scheduled,
                "offers": offers,
                "saved_jobs": saved_jobs,
                "upcoming_interviews": upcoming_interviews
            },
            "recent_applications": apps_data
        })
