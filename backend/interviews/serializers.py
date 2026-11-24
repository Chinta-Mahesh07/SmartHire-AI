from rest_framework import serializers
from .models import Interview
from applications.serializers import JobApplicationSerializer

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.user.get_full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.user.email', read_only=True)
    recruiter_name = serializers.CharField(source='recruiter.get_full_name', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'recruiter', 'recruiter_name',
            'candidate', 'candidate_name', 'candidate_email',
            'job_title', 'company_name',
            'title', 'scheduled_at', 'duration_minutes', 'interview_type',
            'meeting_link', 'location_details', 'status', 'feedback', 'rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'recruiter', 'candidate', 'created_at', 'updated_at']
