from django.db import models
from django.conf import settings
from jobs.models import Job
from candidates.models import CandidateProfile, Resume

class JobApplication(models.Model):
    STATUS_CHOICES = (
        ('APPLIED', 'Applied'),
        ('UNDER_REVIEW', 'Under Review'),
        ('SHORTLISTED', 'Shortlisted'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('SELECTED', 'Selected'),
        ('REJECTED', 'Rejected'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    cover_note = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='APPLIED')
    ai_match_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    match_details = models.JSONField(default=dict, blank=True)
    recruiter_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'candidate')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.candidate.user.get_full_name() or self.candidate.user.username} - {self.job.title} ({self.status})"
