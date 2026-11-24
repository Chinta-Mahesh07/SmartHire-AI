from rest_framework import serializers
from .models import ResumeAnalysis

class ResumeAnalysisSerializer(serializers.ModelSerializer):
    target_job_title = serializers.CharField(source='target_job.title', read_only=True)
    resume_title = serializers.CharField(source='resume.title', read_only=True)

    class Meta:
        model = ResumeAnalysis
        fields = [
            'id', 'resume', 'resume_title', 'candidate',
            'target_job', 'target_job_title', 'resume_score',
            'identified_skills', 'matching_skills', 'missing_skills',
            'experience_analysis', 'improvement_suggestions',
            'raw_analysis', 'created_at'
        ]
        read_only_fields = ['id', 'candidate', 'created_at']
