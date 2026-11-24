from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to Admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_superuser))


class IsRecruiterRole(permissions.BasePermission):
    """Allows access only to Recruiter users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'RECRUITER' or request.user.role == 'ADMIN' or request.user.is_superuser))


class IsCandidateRole(permissions.BasePermission):
    """Allows access only to Candidate users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'CANDIDATE' or request.user.role == 'ADMIN' or request.user.is_superuser))
