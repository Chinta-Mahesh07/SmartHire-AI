from django.db import models
from django.conf import settings
from django.utils.text import slugify
from companies.models import Company
from candidates.models import Skill

class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='Briefcase')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Job Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('INTERNSHIP', 'Internship'),
        ('REMOTE', 'Remote'),
    )

    EXPERIENCE_LEVEL_CHOICES = (
        ('ENTRY', 'Entry Level (0-2 yrs)'),
        ('MID', 'Mid Level (2-5 yrs)'),
        ('SENIOR', 'Senior Level (5-8 yrs)'),
        ('LEAD', 'Lead / Staff (8+ yrs)'),
        ('EXECUTIVE', 'Executive'),
    )

    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('PAUSED', 'Paused'),
        ('CLOSED', 'Closed'),
    )

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    recruiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name='jobs')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='FULL_TIME')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='MID')
    min_experience_years = models.IntegerField(default=1)
    min_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_negotiable = models.BooleanField(default=False)
    location = models.CharField(max_length=150)
    is_remote = models.BooleanField(default=False)
    description = models.TextField()
    requirements = models.TextField()
    responsibilities = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    required_skills = models.ManyToManyField(Skill, blank=True, related_name='required_for_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    views_count = models.IntegerField(default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            import uuid
            base_slug = slugify(self.title) or 'job'
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} at {self.company.name}"
