from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    total_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'slug', 'website', 'logo', 'industry',
            'company_size', 'headquarters', 'description', 'founded_year',
            'is_verified', 'created_by', 'total_jobs_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_by', 'is_verified', 'created_at', 'updated_at']

    def get_total_jobs_count(self, obj):
        return obj.jobs.filter(status='ACTIVE').count()
