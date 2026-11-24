from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from companies.models import Company
from jobs.models import Job, JobCategory
from candidates.models import CandidateProfile, Skill, CandidateSkill, Resume
from recruiters.models import RecruiterProfile
from applications.models import JobApplication
from interviews.models import Interview
from notifications.models import Notification
from ai_analyzer.services import ResumeAnalyzer, JobRecommendationEngine, extract_skills_from_text

User = get_user_model()

class SmartHireAITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin_test@smarthire.ai',
            password='testpassword123',
            role='ADMIN'
        )

        # Recruiter user
        self.recruiter = User.objects.create_user(
            username='recruiter_test',
            email='recruiter_test@smarthire.ai',
            password='testpassword123',
            role='RECRUITER',
            is_approved=True
        )

        # Company
        self.company = Company.objects.create(
            name='Test Corp',
            industry='AI Software',
            created_by=self.recruiter
        )

        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter,
            company=self.company,
            approval_status='APPROVED'
        )

        # Candidate user
        self.candidate = User.objects.create_user(
            username='candidate_test',
            email='candidate_test@smarthire.ai',
            password='testpassword123',
            role='CANDIDATE'
        )
        self.candidate_profile = CandidateProfile.objects.create(
            user=self.candidate,
            headline='Python & Django Backend Engineer',
            total_experience_years=3.5
        )

        # Skills
        self.python_skill = Skill.objects.create(name='Python', category='TECHNICAL')
        self.django_skill = Skill.objects.create(name='Django', category='TECHNICAL')
        self.react_skill = Skill.objects.create(name='React', category='TECHNICAL')

        CandidateSkill.objects.create(candidate=self.candidate_profile, skill=self.python_skill)
        CandidateSkill.objects.create(candidate=self.candidate_profile, skill=self.django_skill)

        # Category and Job
        self.category = JobCategory.objects.create(name='Software Engineering')
        self.job = Job.objects.create(
            title='Python Backend Specialist',
            company=self.company,
            recruiter=self.recruiter,
            category=self.category,
            job_type='FULL_TIME',
            min_experience_years=2,
            min_salary=90000,
            max_salary=120000,
            location='San Francisco, CA',
            description='Build robust Python APIs.',
            requirements='Must know Python, Django, and REST APIs.',
            status='ACTIVE'
        )
        self.job.required_skills.add(self.python_skill, self.django_skill)

    def test_authentication_jwt_login(self):
        """Test authentication returns JWT token."""
        response = self.client.post('/api/auth/login/', {
            'email': 'candidate_test@smarthire.ai',
            'password': 'testpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_ai_skill_extraction(self):
        """Test NLP skill extraction from sample resume text."""
        sample_resume = "Experienced software engineer with proficiency in Python, Django, Docker, and PostgreSQL with 4 years experience."
        skills = extract_skills_from_text(sample_resume)
        self.assertIn('Python', skills)
        self.assertIn('Django', skills)
        self.assertIn('Docker', skills)
        self.assertIn('Sql', skills)

    def test_ai_resume_analyzer_fallback(self):
        """Test rule-based AI analyzer evaluates score and missing skills."""
        sample_resume = "Junior developer with basic Python and Git knowledge. 1 year of experience."
        result = ResumeAnalyzer.analyze_resume_text(sample_resume, target_job=self.job)
        self.assertIn('resume_score', result)
        self.assertGreater(result['resume_score'], 0)
        self.assertIn('identified_skills', result)
        self.assertIn('improvement_suggestions', result)

    def test_job_application_flow(self):
        """Test candidate applying for a job triggers AI scoring and recruiter notification."""
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post('/api/applications/apply/', {
            'job': self.job.id,
            'cover_note': 'I am an expert Python and Django developer.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('application', response.data)
        self.assertGreater(float(response.data['application']['ai_match_score']), 0)

        # Check notification was created for recruiter
        notif = Notification.objects.filter(recipient=self.recruiter).first()
        self.assertIsNotNone(notif)
        self.assertIn('New Applicant', notif.title)

    def test_interview_scheduling_flow(self):
        """Test recruiter scheduling interview updates application status and sends notification."""
        # First candidate applies
        self.client.force_authenticate(user=self.candidate)
        self.client.post('/api/applications/apply/', {'job': self.job.id})
        app = JobApplication.objects.get(job=self.job, candidate=self.candidate_profile)

        # Recruiter schedules interview
        self.client.force_authenticate(user=self.recruiter)
        import datetime
        sched_time = (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat()
        response = self.client.post('/api/interviews/schedule/', {
            'application': app.id,
            'title': 'Technical Screening',
            'scheduled_at': sched_time,
            'interview_type': 'ONLINE',
            'meeting_link': 'https://meet.google.com/test-meet'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check application status updated
        app.refresh_from_db()
        self.assertEqual(app.status, 'INTERVIEW_SCHEDULED')

        # Check notification sent to candidate
        cand_notif = Notification.objects.filter(recipient=self.candidate, notification_type='INTERVIEW').first()
        self.assertIsNotNone(cand_notif)

    def test_admin_analytics_endpoint(self):
        """Test admin analytics API permissions and aggregation."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/auth/admin/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('stats', response.data)
        self.assertEqual(response.data['stats']['total_users'], 3)

    def test_ai_agent_chat_endpoint(self):
        """Test AI agent conversational chat and mock interview intent."""
        self.client.force_authenticate(user=self.candidate)
        response = self.client.post('/api/ai/agent/chat/', {
            'message': 'Can you conduct a mock technical interview for me?',
            'target_job_id': self.job.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reply', response.data)
        self.assertIn('Mock Technical', response.data['reply'])

    def test_ai_agent_prompts_endpoint(self):
        """Test AI agent starter prompt chips."""
        self.client.force_authenticate(user=self.candidate)
        response = self.client.get('/api/ai/agent/prompts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('prompts', response.data)
        self.assertGreater(len(response.data['prompts']), 0)

