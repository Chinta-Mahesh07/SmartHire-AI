from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer
from accounts.permissions import IsRecruiterRole, IsAdminUserRole

class CompanyListCreateView(generics.ListCreateAPIView):
    queryset = Company.objects.all().order_by('name')
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsRecruiterRole()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        company = serializer.save(created_by=self.request.user)
        # Automatically associate recruiter with this company
        if hasattr(self.request.user, 'recruiter_profile'):
            profile = self.request.user.recruiter_profile
            profile.company = company
            profile.save()


class CompanyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsRecruiterRole()]
        return [permissions.AllowAny()]

    def perform_update(self, serializer):
        # Admin or company creator can update
        serializer.save()


class MyCompanyView(generics.RetrieveUpdateAPIView):
    """Allows a recruiter to retrieve and update their associated company directly."""
    permission_classes = [permissions.IsAuthenticated, IsRecruiterRole]
    serializer_class = CompanySerializer

    def get_object(self):
        if hasattr(self.request.user, 'recruiter_profile') and self.request.user.recruiter_profile.company:
            return self.request.user.recruiter_profile.company
        return None

    def get(self, request, *args, **kwargs):
        company = self.get_object()
        if not company:
            return Response({'detail': 'No company linked to this recruiter profile yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CompanySerializer(company, context={'request': request}).data)
