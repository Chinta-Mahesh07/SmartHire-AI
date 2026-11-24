from rest_framework import serializers
from django.contrib.auth import get_user_model
from candidates.models import CandidateProfile
from recruiters.models import RecruiterProfile
from companies.models import Company

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    recruiter_approval = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'avatar', 'is_approved', 'is_active',
            'company_name', 'recruiter_approval', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_company_name(self, obj):
        if obj.role == 'RECRUITER' and hasattr(obj, 'recruiter_profile') and obj.recruiter_profile.company:
            return obj.recruiter_profile.company.name
        return None

    def get_recruiter_approval(self, obj):
        if obj.role == 'RECRUITER' and hasattr(obj, 'recruiter_profile'):
            return obj.recruiter_profile.approval_status
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'company_name']

    def validate_role(self, value):
        if value not in ['CANDIDATE', 'RECRUITER']:
            raise serializers.ValidationError("Role must be either CANDIDATE or RECRUITER.")
        return value

    def create(self, validated_data):
        company_name = validated_data.pop('company_name', None)
        password = validated_data.pop('password')
        role = validated_data.get('role', 'CANDIDATE')

        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        
        # Candidate accounts are active and approved by default.
        # Recruiter accounts start with pending approval if policy requires, or approved for seamless demo.
        if role == 'RECRUITER':
            user.is_approved = True  # Can be approved immediately or toggled by admin
        user.save()

        # Create appropriate profile
        if role == 'CANDIDATE':
            CandidateProfile.objects.create(user=user)
        elif role == 'RECRUITER':
            company = None
            if company_name:
                company, _ = Company.objects.get_or_create(
                    name=company_name.strip(),
                    defaults={'created_by': user}
                )
            RecruiterProfile.objects.create(
                user=user,
                company=company,
                approval_status='APPROVED' # Default to approved so recruiters can post jobs right away
            )

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'avatar']


class AdminUserManageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'is_approved']
