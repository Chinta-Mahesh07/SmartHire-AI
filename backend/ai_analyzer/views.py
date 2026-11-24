from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ResumeAnalysis
from .serializers import ResumeAnalysisSerializer
from .services import ResumeAnalyzer, JobRecommendationEngine, extract_text_from_pdf
from candidates.models import CandidateProfile, Resume
from jobs.models import Job
from accounts.permissions import IsCandidateRole

class AnalyzeResumeView(APIView):
    """
    Analyzes an uploaded resume PDF or existing candidate resume.
    Can analyze in general or against a specific target job.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        candidate_profile = getattr(request.user, 'candidate_profile', None)
        if not candidate_profile and request.user.role == 'CANDIDATE':
            candidate_profile, _ = CandidateProfile.objects.get_or_create(user=request.user)

        target_job_id = request.data.get('target_job_id')
        target_job = None
        if target_job_id:
            target_job = get_object_or_404(Job, pk=target_job_id)

        resume = None
        resume_text = ""

        # Option A: Direct PDF file upload
        if 'file' in request.FILES:
            uploaded_file = request.FILES['file']
            if not uploaded_file.name.lower().endswith('.pdf'):
                return Response({'error': 'Uploaded resume must be a PDF file.'}, status=status.HTTP_400_BAD_REQUEST)

            extracted = extract_text_from_pdf(uploaded_file)
            resume_text = extracted

            if candidate_profile:
                # Store as new resume
                resume = Resume.objects.create(
                    candidate=candidate_profile,
                    file=uploaded_file,
                    title=request.data.get('title', uploaded_file.name),
                    extracted_text=extracted,
                    is_primary=not Resume.objects.filter(candidate=candidate_profile).exists()
                )

        # Option B: Existing resume ID
        elif 'resume_id' in request.data:
            resume = get_object_or_404(Resume, pk=request.data['resume_id'])
            resume_text = resume.extracted_text

        # Option C: Use primary resume
        elif candidate_profile:
            resume = Resume.objects.filter(candidate=candidate_profile, is_primary=True).first()
            if resume:
                resume_text = resume.extracted_text

        if not resume_text:
            return Response({
                'error': 'Please provide a PDF resume file or select an existing resume with readable text.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Run AI Evaluation
        analysis_data = ResumeAnalyzer.analyze_resume_text(resume_text, target_job=target_job)

        # If candidate is authenticated, save analysis record
        analysis_record = None
        if candidate_profile and resume:
            analysis_record = ResumeAnalysis.objects.create(
                resume=resume,
                candidate=candidate_profile,
                target_job=target_job,
                resume_score=analysis_data.get('resume_score', 70.0),
                identified_skills=analysis_data.get('identified_skills', []),
                matching_skills=analysis_data.get('matching_skills', []),
                missing_skills=analysis_data.get('missing_skills', []),
                experience_analysis=analysis_data.get('experience_analysis', {}),
                improvement_suggestions=analysis_data.get('improvement_suggestions', []),
                raw_analysis=analysis_data
            )

        return Response({
            'message': 'Resume evaluated successfully.',
            'analysis': analysis_data,
            'record_id': analysis_record.id if analysis_record else None
        }, status=status.HTTP_200_OK)


class CandidateRecommendationsView(APIView):
    """Returns AI recommended jobs matching candidate profile and resume."""
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        recommendations = JobRecommendationEngine.get_recommendations_for_candidate(profile)
        return Response({'recommendations': recommendations})


class ResumeAnalysisHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsCandidateRole]
    serializer_class = ResumeAnalysisSerializer

    def get_queryset(self):
        if hasattr(self.request.user, 'candidate_profile'):
            return ResumeAnalysis.objects.filter(candidate=self.request.user.candidate_profile).order_by('-created_at')
        return ResumeAnalysis.objects.none()


class AIAgentChatView(APIView):
    """
    Interactive conversational AI agent endpoint for Candidates, Recruiters, and Admins.
    Provides mock interviews, tailored cover notes, interview question kits, and hiring advice.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from .agent_service import AIAgentService
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        history = request.data.get('history', [])
        context_params = {
            'target_job_id': request.data.get('target_job_id'),
            'applicant_id': request.data.get('applicant_id'),
            'intent': request.data.get('intent'),
        }

        agent_result = AIAgentService.process_message(
            user=request.user,
            message=message,
            history=history,
            context_params=context_params
        )

        return Response(agent_result, status=status.HTTP_200_OK)


class AIAgentPromptsView(APIView):
    """Returns curated starter prompt chips based on user role."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = request.user.role
        if role == 'CANDIDATE':
            prompts = [
                {"label": "Simulate Mock Interview", "prompt": "Can you run a mock technical interview for me based on my skills?", "icon": "Target"},
                {"label": "Draft Tailored Pitch", "prompt": "Help me draft a tailored cover pitch highlighting my core technical strengths.", "icon": "FileText"},
                {"label": "Skill Acceleration Roadmap", "prompt": "What skills should I learn in the next 90 days to qualify for senior roles?", "icon": "TrendingUp"},
                {"label": "ATS Resume Check", "prompt": "How can I improve my resume keyword density and ATS score?", "icon": "Sparkles"},
            ]
        elif role == 'RECRUITER':
            prompts = [
                {"label": "Generate Interview Kit", "prompt": "Generate a structured technical interview question kit for evaluating senior engineers.", "icon": "ListChecks"},
                {"label": "Summarize Candidate Fit", "prompt": "How should I structure my screening review to identify top 10% talent?", "icon": "Users"},
                {"label": "Draft Interview Invitation", "prompt": "Write a friendly, professional interview invitation message for shortlisted candidates.", "icon": "Mail"},
                {"label": "Job Description Optimizer", "prompt": "What key requirements and benefits should I highlight to attract top developers?", "icon": "Briefcase"},
            ]
        else:
            prompts = [
                {"label": "Platform Health Summary", "prompt": "Summarize the platform's current recruitment activity and placement rate.", "icon": "Activity"},
                {"label": "Recruiter Verification Guidelines", "prompt": "What standards should I follow when approving new recruiter accounts?", "icon": "ShieldCheck"},
            ]

        return Response({"prompts": prompts, "role": role})

