from django.db import models
from candidates.models import Resume, CandidateProfile
from jobs.models import Job

class ResumeAnalysis(models.Model):
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='analyses')
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='resume_analyses')
    target_job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name='resume_analyses')
    resume_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    identified_skills = models.JSONField(default=list, blank=True)
    matching_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    experience_analysis = models.JSONField(default=dict, blank=True)
    improvement_suggestions = models.JSONField(default=list, blank=True)
    raw_analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Resume Analyses'

    def __str__(self):
        job_title = self.target_job.title if self.target_job else "General Assessment"
        return f"Analysis for {self.candidate.user.username} ({self.resume_score}%) - {job_title}"
