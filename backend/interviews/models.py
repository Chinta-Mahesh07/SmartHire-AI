from django.db import models
from django.conf import settings
from applications.models import JobApplication
from candidates.models import CandidateProfile

class Interview(models.Model):
    TYPE_CHOICES = (
        ('ONLINE', 'Online (Video Call)'),
        ('OFFLINE', 'In-Person (Office)'),
    )

    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('RESCHEDULED', 'Rescheduled'),
    )

    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='interviews')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='conducted_interviews')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='interviews')
    title = models.CharField(max_length=200, default='Technical Interview')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=45)
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='ONLINE')
    meeting_link = models.URLField(blank=True)
    location_details = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    feedback = models.TextField(blank=True)
    rating = models.IntegerField(null=True, blank=True) # 1 - 5 stars
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} for {self.candidate.user.username} on {self.scheduled_at}"
