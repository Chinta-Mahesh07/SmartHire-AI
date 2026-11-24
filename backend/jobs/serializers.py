from rest_framework import serializers
from .models import JobCategory, Job
from companies.serializers import CompanySerializer
from candidates.serializers import SkillSerializer
from candidates.models import Skill

class JobCategorySerializer(serializers.ModelSerializer):
    jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'is_active', 'jobs_count', 'created_at']

    def get_jobs_count(self, obj):
        return obj.jobs.filter(status='ACTIVE').count()


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_logo = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    required_skills_list = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'slug', 'company', 'company_name', 'company_logo',
            'category', 'category_name', 'job_type', 'experience_level',
            'min_experience_years', 'min_salary', 'max_salary', 'salary_negotiable',
            'location', 'is_remote', 'description', 'requirements', 'responsibilities',
            'benefits', 'required_skills', 'required_skills_list', 'status',
            'views_count', 'applications_count', 'deadline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'company', 'views_count', 'created_at', 'updated_at']

    def get_company_logo(self, obj):
        request = self.context.get('request')
        if obj.company and obj.company.logo:
            return request.build_absolute_uri(obj.company.logo.url) if request else obj.company.logo.url
        return None

    def get_required_skills_list(self, obj):
        return [skill.name for skill in obj.required_skills.all()]

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobDetailSerializer(JobSerializer):
    company_details = CompanySerializer(source='company', read_only=True)
    has_applied = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta(JobSerializer.Meta):
        fields = JobSerializer.Meta.fields + ['company_details', 'has_applied', 'is_saved']

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'candidate_profile'):
            return obj.applications.filter(candidate=request.user.candidate_profile).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(request.user, 'candidate_profile'):
            return obj.saved_by_candidates.filter(candidate=request.user.candidate_profile).exists()
        return False


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    skill_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False
    )

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'category', 'job_type', 'experience_level',
            'min_experience_years', 'min_salary', 'max_salary', 'salary_negotiable',
            'location', 'is_remote', 'description', 'requirements', 'responsibilities',
            'benefits', 'required_skills', 'skill_names', 'status', 'deadline'
        ]

    def create(self, validated_data):
        skill_names = validated_data.pop('skill_names', [])
        job = super().create(validated_data)
        
        for name in skill_names:
            skill_obj, _ = Skill.objects.get_or_create(name=name.strip().title())
            job.required_skills.add(skill_obj)
        return job

    def update(self, instance, validated_data):
        skill_names = validated_data.pop('skill_names', None)
        job = super().update(instance, validated_data)
        
        if skill_names is not None:
            job.required_skills.clear()
            for name in skill_names:
                skill_obj, _ = Skill.objects.get_or_create(name=name.strip().title())
                job.required_skills.add(skill_obj)
        return job
