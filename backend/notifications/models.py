from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = (
        ('SYSTEM', 'System Alert'),
        ('APPLICATION', 'Job Application'),
        ('INTERVIEW', 'Interview Update'),
        ('STATUS_UPDATE', 'Application Status'),
        ('RECOMMENDATION', 'Job Recommendation'),
        ('ACCOUNT', 'Account Status'),
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='SYSTEM')
    reference_id = models.CharField(max_length=100, blank=True)
    reference_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.email}: {self.title} ({'Read' if self.is_read else 'Unread'})"
