from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('RECRUITER', 'Recruiter'),
        ('CANDIDATE', 'Candidate'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CANDIDATE')
    phone = models.CharField(max_length=25, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_approved = models.BooleanField(default=True) # Recruiters may require admin approval
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_recruiter(self):
        return self.role == 'RECRUITER'

    @property
    def is_candidate(self):
        return self.role == 'CANDIDATE'

    @property
    def is_admin_user(self):
        return self.role == 'ADMIN' or self.is_superuser
