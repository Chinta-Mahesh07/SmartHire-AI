from rest_framework import serializers
from .models import RecruiterProfile
from companies.serializers import CompanySerializer
from accounts.serializers import UserSerializer

class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company_details = CompanySerializer(source='company', read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'company', 'company_details', 'designation',
            'department', 'approval_status', 'approval_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'approval_status', 'approval_notes', 'created_at', 'updated_at']
