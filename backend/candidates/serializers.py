from rest_framework import serializers
from .models import (
    CandidateProfile,
    Skill,
    CandidateSkill,
    Education,
    Experience,
    Resume,
    SavedJob
)
from accounts.serializers import UserSerializer

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_category = serializers.CharField(source='skill.category', read_only=True)

    class Meta:
        model = CandidateSkill
        fields = ['id', 'skill', 'skill_name', 'skill_category', 'proficiency_level', 'years_of_experience']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'field_of_study', 'start_year', 'end_year', 'grade_or_gpa', 'is_current']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company_name', 'job_title', 'location', 'start_date', 'end_date', 'is_current', 'description']


class ResumeSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'file', 'file_url', 'title', 'uploaded_at', 'extracted_text', 'is_primary']
        read_only_fields = ['id', 'uploaded_at', 'extracted_text']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None


class SavedJobSerializer(serializers.ModelSerializer):
    job_details = serializers.SerializerMethodField()

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_details', 'saved_at']

    def get_job_details(self, obj):
        from jobs.serializers import JobSerializer
        return JobSerializer(obj.job, context=self.context).data


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = CandidateSkillSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    resumes = ResumeSerializer(many=True, read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'headline', 'bio', 'current_location',
            'preferred_locations', 'total_experience_years', 'expected_salary',
            'github_url', 'linkedin_url', 'portfolio_url',
            'skills', 'educations', 'experiences', 'resumes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
