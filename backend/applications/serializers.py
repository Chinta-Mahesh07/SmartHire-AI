from rest_framework import serializers
from .models import JobApplication
from candidates.serializers import CandidateProfileSerializer, ResumeSerializer
from jobs.serializers import JobSerializer

class JobApplicationSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.user.get_full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.user.email', read_only=True)
    candidate_phone = serializers.CharField(source='candidate.user.phone', read_only=True)
    candidate_headline = serializers.CharField(source='candidate.headline', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company.name', read_only=True)
    resume_details = ResumeSerializer(source='resume', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'company_name',
            'candidate', 'candidate_name', 'candidate_email', 'candidate_phone', 'candidate_headline',
            'resume', 'resume_details', 'cover_note', 'status',
            'ai_match_score', 'match_details', 'recruiter_notes',
            'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'candidate', 'ai_match_score', 'match_details', 'applied_at', 'updated_at']


class JobApplicationDetailSerializer(JobApplicationSerializer):
    candidate_profile = CandidateProfileSerializer(source='candidate', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)

    class Meta(JobApplicationSerializer.Meta):
        fields = JobApplicationSerializer.Meta.fields + ['candidate_profile', 'job_details']


class ApplyJobSerializer(serializers.Serializer):
    job = serializers.IntegerField()
    resume = serializers.IntegerField(required=False, allow_null=True)
    cover_note = serializers.CharField(required=False, allow_blank=True)


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ['status', 'recruiter_notes']
