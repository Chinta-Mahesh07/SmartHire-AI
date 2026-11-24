from django.db import models
from django.conf import settings

class CandidateProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidate_profile'
    )
    headline = models.CharField(max_length=250, blank=True)
    bio = models.TextField(blank=True)
    current_location = models.CharField(max_length=150, blank=True)
    preferred_locations = models.CharField(max_length=255, blank=True)
    total_experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    expected_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}'s Profile"


class Skill(models.Model):
    CATEGORY_CHOICES = (
        ('TECHNICAL', 'Technical'),
        ('SOFT', 'Soft Skill'),
        ('TOOL', 'Tool / Framework'),
        ('LANGUAGE', 'Language'),
    )
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='TECHNICAL')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class CandidateSkill(models.Model):
    PROFICIENCY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
        ('EXPERT', 'Expert'),
    )
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='candidate_skills'
    )
    proficiency_level = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='INTERMEDIATE')
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, default=1.0)

    class Meta:
        unique_together = ('candidate', 'skill')

    def __str__(self):
        return f"{self.candidate.user.username} - {self.skill.name} ({self.proficiency_level})"


class Education(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='educations'
    )
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150)
    start_year = models.IntegerField()
    end_year = models.IntegerField(null=True, blank=True)
    grade_or_gpa = models.CharField(max_length=50, blank=True)
    is_current = models.BooleanField(default=False)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.degree} in {self.field_of_study} - {self.institution}"


class Experience(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    company_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"


class Resume(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='resumes'
    )
    file = models.FileField(upload_to='resumes/')
    title = models.CharField(max_length=200, default='My Resume')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    extracted_text = models.TextField(blank=True)
    is_primary = models.BooleanField(default=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.candidate.user.username} - {self.title}"


class SavedJob(models.Model):
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='saved_by_candidates'
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('candidate', 'job')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.candidate.user.username} saved {self.job.title}"
