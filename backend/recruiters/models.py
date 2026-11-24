from django.db import models
from django.conf import settings
from companies.models import Company

class RecruiterProfile(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recruiter_profile'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recruiters'
    )
    designation = models.CharField(max_length=120, blank=True)
    department = models.CharField(max_length=100, blank=True)
    approval_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_recruiters'
    )
    approval_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        company_name = self.company.name if self.company else "No Company"
        return f"{self.user.get_full_name() or self.user.username} - {company_name}"
