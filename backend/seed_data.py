import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company
from candidates.models import CandidateProfile, Skill, CandidateSkill, Education, Experience, Resume, SavedJob
from recruiters.models import RecruiterProfile
from jobs.models import JobCategory, Job
from applications.models import JobApplication
from interviews.models import Interview
from notifications.models import Notification

User = get_user_model()

def seed_database():
    print("🌱 Starting SmartHire AI Database Seeding...")

    # 1. Admin User
    admin_user, created = User.objects.get_or_create(
        email='admin@smarthire.ai',
        defaults={
            'username': 'admin',
            'first_name': 'Chief',
            'last_name': 'Administrator',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'is_approved': True
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"✅ Admin created: admin@smarthire.ai / admin123")

    # 2. Skills
    skills_data = [
        ("Python", "TECHNICAL"), ("Django", "TECHNICAL"), ("FastAPI", "TECHNICAL"),
        ("JavaScript", "TECHNICAL"), ("TypeScript", "TECHNICAL"), ("React", "TECHNICAL"),
        ("Node.js", "TECHNICAL"), ("Next.js", "TECHNICAL"), ("Vue.js", "TECHNICAL"),
        ("PostgreSQL", "TECHNICAL"), ("MySQL", "TECHNICAL"), ("MongoDB", "TECHNICAL"),
        ("Redis", "TECHNICAL"), ("Docker", "TOOL"), ("Kubernetes", "TOOL"),
        ("AWS", "TOOL"), ("Azure", "TOOL"), ("Google Cloud", "TOOL"),
        ("Git", "TOOL"), ("CI/CD", "TOOL"), ("GraphQL", "TECHNICAL"),
        ("REST API", "TECHNICAL"), ("Machine Learning", "TECHNICAL"), ("Deep Learning", "TECHNICAL"),
        ("NLP", "TECHNICAL"), ("PyTorch", "TECHNICAL"), ("TensorFlow", "TECHNICAL"),
        ("Scikit-Learn", "TECHNICAL"), ("Tailwind CSS", "TOOL"), ("HTML5/CSS3", "TECHNICAL"),
        ("Microservices", "TECHNICAL"), ("Agile/Scrum", "SOFT"), ("Communication", "SOFT"),
        ("Problem Solving", "SOFT"), ("Leadership", "SOFT")
    ]
    skill_objs = {}
    for name, cat in skills_data:
        obj, _ = Skill.objects.get_or_create(name=name, defaults={'category': cat})
        skill_objs[name] = obj
    print(f"✅ Created {len(skill_objs)} standard skills.")

    # 3. Companies
    companies_data = [
        {
            "name": "TechPulse Innovations",
            "industry": "Software & AI Solutions",
            "company_size": "51-200",
            "headquarters": "San Francisco, CA",
            "website": "https://techpulse.io",
            "description": "TechPulse builds modern cloud platforms and enterprise intelligence software powering millions of transactions daily.",
            "founded_year": 2018,
            "is_verified": True
        },
        {
            "name": "CloudScale Systems",
            "industry": "Cloud Infrastructure & DevOps",
            "company_size": "201-500",
            "headquarters": "Seattle, WA",
            "website": "https://cloudscale.com",
            "description": "CloudScale delivers next-generation distributed container orchestration and cloud optimization tools for global tech companies.",
            "founded_year": 2015,
            "is_verified": True
        },
        {
            "name": "FinTechX Labs",
            "industry": "Financial Technology & Security",
            "company_size": "11-50",
            "headquarters": "New York, NY",
            "website": "https://fintechx.com",
            "description": "Pioneering secure real-time cross-border payment rails and algorithmic treasury operations with automated risk analytics.",
            "founded_year": 2021,
            "is_verified": True
        }
    ]
    company_objs = {}
    for cdata in companies_data:
        comp, _ = Company.objects.get_or_create(name=cdata["name"], defaults=cdata)
        company_objs[cdata["name"]] = comp
    print(f"✅ Created {len(company_objs)} companies.")

    # 4. Recruiters
    recruiters_data = [
        {
            "email": "sarah.recruiter@techpulse.io",
            "username": "sarah_recruiter",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "company": company_objs["TechPulse Innovations"],
            "designation": "Lead Technical Recruiter",
            "department": "Engineering Talent Acquisition"
        },
        {
            "email": "david.hr@cloudscale.com",
            "username": "david_hr",
            "first_name": "David",
            "last_name": "Miller",
            "company": company_objs["CloudScale Systems"],
            "designation": "Director of Talent",
            "department": "People & Operations"
        }
    ]
    recruiter_users = []
    for rdata in recruiters_data:
        comp = rdata.pop("company")
        desig = rdata.pop("designation")
        dept = rdata.pop("department")
        user, _ = User.objects.get_or_create(
            email=rdata["email"],
            defaults={
                'username': rdata["username"],
                'first_name': rdata["first_name"],
                'last_name': rdata["last_name"],
                'role': 'RECRUITER',
                'is_approved': True
            }
        )
        user.set_password('recruiter123')
        user.save()
        recruiter_users.append(user)

        RecruiterProfile.objects.update_or_create(
            user=user,
            defaults={
                'company': comp,
                'designation': desig,
                'department': dept,
                'approval_status': 'APPROVED'
            }
        )
    print(f"✅ Created recruiters: sarah.recruiter@techpulse.io / recruiter123")

    # 5. Job Categories
    categories_data = [
        ("Software Engineering", "Full-stack, frontend, and backend engineering roles.", "Code"),
        ("Data Science & AI", "Machine learning, LLMs, NLP, and advanced predictive analytics.", "Cpu"),
        ("DevOps & Cloud", "Cloud architecture, Kubernetes, CI/CD, and site reliability.", "Cloud"),
        ("Product Management", "Strategic product roadmaps, user growth, and agile delivery.", "Compass"),
        ("Cybersecurity", "Information security, ethical hacking, and compliance.", "Shield"),
    ]
    cat_objs = {}
    for name, desc, icon in categories_data:
        c, _ = JobCategory.objects.get_or_create(name=name, defaults={'description': desc, 'icon': icon, 'is_active': True})
        cat_objs[name] = c
    print(f"✅ Created {len(cat_objs)} job categories.")

    # 6. Jobs
    jobs_data = [
        {
            "title": "Senior Full Stack Python/React Developer",
            "company": company_objs["TechPulse Innovations"],
            "recruiter": recruiter_users[0],
            "category": cat_objs["Software Engineering"],
            "job_type": "FULL_TIME",
            "experience_level": "SENIOR",
            "min_experience_years": 4,
            "min_salary": 120000,
            "max_salary": 160000,
            "salary_negotiable": True,
            "location": "San Francisco, CA",
            "is_remote": True,
            "description": "We are seeking a high-performing Senior Full Stack Engineer to lead architectural development of our core cloud recruitment platform.",
            "requirements": "Proficiency in Python (Django/DRF or FastAPI), modern React with TypeScript, PostgreSQL, and Docker containerization.",
            "responsibilities": "Design scalable RESTful APIs, develop high-performance React user interfaces, and collaborate with product teams on high-throughput microservices.",
            "benefits": "Competitive equity package, comprehensive medical/dental/vision coverage, flexible remote stipend, 401(k) matching.",
            "skills": ["Python", "Django", "React", "TypeScript", "PostgreSQL", "Docker", "REST API"],
            "status": "ACTIVE"
        },
        {
            "title": "AI & Machine Learning Engineer",
            "company": company_objs["TechPulse Innovations"],
            "recruiter": recruiter_users[0],
            "category": cat_objs["Data Science & AI"],
            "job_type": "FULL_TIME",
            "experience_level": "MID",
            "min_experience_years": 3,
            "min_salary": 135000,
            "max_salary": 175000,
            "salary_negotiable": False,
            "location": "San Francisco, CA",
            "is_remote": True,
            "description": "Join our AI Intelligence team building state-of-the-art NLP resume parsing models, vector matching algorithms, and predictive candidate scoring pipelines.",
            "requirements": "Hands-on experience with Python, PyTorch or TensorFlow, NLP transformers, OpenAI APIs, vector databases, and model deployment.",
            "responsibilities": "Develop fine-tuned NLP pipelines, optimize resume-to-job matching embeddings, and benchmark ranking accuracy.",
            "benefits": "Generous compute budget, annual learning stipend, health coverage, flexible working hours.",
            "skills": ["Python", "Machine Learning", "NLP", "PyTorch", "OpenAI", "Docker"],
            "status": "ACTIVE"
        },
        {
            "title": "Cloud DevOps & Platform Engineer",
            "company": company_objs["CloudScale Systems"],
            "recruiter": recruiter_users[1],
            "category": cat_objs["DevOps & Cloud"],
            "job_type": "FULL_TIME",
            "experience_level": "SENIOR",
            "min_experience_years": 5,
            "min_salary": 140000,
            "max_salary": 180000,
            "salary_negotiable": True,
            "location": "Seattle, WA",
            "is_remote": True,
            "description": "CloudScale is looking for a seasoned DevOps Architect to supervise multi-region Kubernetes clusters and automated CI/CD deployment pipelines.",
            "requirements": "Deep expertise in AWS, Kubernetes, Terraform, Docker, GitHub Actions, and Linux systems engineering.",
            "responsibilities": "Maintain 99.99% availability, orchestrate zero-downtime canary deployments, and enforce infrastructure security postures.",
            "benefits": "Top-tier health benefits, unlimited PTO, home office equipment budget, annual performance bonus.",
            "skills": ["AWS", "Kubernetes", "Docker", "CI/CD", "Git", "Microservices"],
            "status": "ACTIVE"
        },
        {
            "title": "Frontend React Engineer",
            "company": company_objs["FinTechX Labs"],
            "recruiter": recruiter_users[0],
            "category": cat_objs["Software Engineering"],
            "job_type": "FULL_TIME",
            "experience_level": "MID",
            "min_experience_years": 2,
            "min_salary": 95000,
            "max_salary": 130000,
            "salary_negotiable": True,
            "location": "New York, NY",
            "is_remote": False,
            "description": "Looking for a creative and meticulous Frontend Engineer to craft sleek financial dashboards and data-dense analytics views in React and Tailwind CSS.",
            "requirements": "Demonstrated mastery of React, JavaScript (ES6+), Tailwind CSS, State Management, and responsive web development.",
            "responsibilities": "Build responsive web applications, translate Figma prototypes into pixel-perfect components, and optimize client-side rendering.",
            "benefits": "Commuter subsidies, wellness reimbursement, competitive salary, and team lunches.",
            "skills": ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML5/CSS3"],
            "status": "ACTIVE"
        }
    ]

    job_objs = []
    for jdata in jobs_data:
        skills = jdata.pop("skills")
        job = Job.objects.create(**jdata)
        for s_name in skills:
            if s_name in skill_objs:
                job.required_skills.add(skill_objs[s_name])
        job_objs.append(job)
    print(f"✅ Created {len(job_objs)} active job postings.")

    # 7. Candidates
    candidates_info = [
        {
            "email": "alex.dev@gmail.com",
            "username": "alex_dev",
            "first_name": "Alex",
            "last_name": "Morgan",
            "headline": "Full Stack Python & React Developer | 4+ Years Experience",
            "bio": "Passionate software engineer experienced in building scalable web applications with Django, React, and AWS. Loves clean architecture and performance tuning.",
            "location": "San Francisco, CA",
            "experience_years": 4.5,
            "expected_salary": 130000,
            "skills": [("Python", "EXPERT", 4.5), ("Django", "EXPERT", 4.0), ("React", "ADVANCED", 3.5), ("JavaScript", "ADVANCED", 4.0), ("Docker", "INTERMEDIATE", 2.0), ("PostgreSQL", "ADVANCED", 3.5), ("Git", "ADVANCED", 4.0)],
            "educations": [
                {"institution": "University of California, Berkeley", "degree": "Bachelor of Science", "field_of_study": "Computer Science", "start_year": 2016, "end_year": 2020, "grade_or_gpa": "3.8 GPA"}
            ],
            "experiences": [
                {"company_name": "Silicon Scale Labs", "job_title": "Full Stack Software Engineer", "location": "San Francisco, CA", "start_date": datetime.date(2021, 6, 1), "is_current": True, "description": "Developed cloud microservices with Django REST Framework and dynamic frontend components with React. Improved page load times by 40%."},
                {"company_name": "Apex Digital", "job_title": "Junior Python Developer", "location": "Oakland, CA", "start_date": datetime.date(2020, 7, 1), "end_date": datetime.date(2021, 5, 30), "is_current": False, "description": "Constructed automated backend ETL pipelines and REST API endpoints."}
            ]
        },
        {
            "email": "priya.sharma@gmail.com",
            "username": "priya_sharma",
            "first_name": "Priya",
            "last_name": "Sharma",
            "headline": "Senior Cloud & DevOps Engineer | Kubernetes & AWS Specialist",
            "bio": "Infrastructure engineer focused on automated deployment pipelines, infrastructure as code, and cloud cost efficiency.",
            "location": "Seattle, WA",
            "experience_years": 6.0,
            "expected_salary": 155000,
            "skills": [("AWS", "EXPERT", 6.0), ("Kubernetes", "EXPERT", 5.0), ("Docker", "EXPERT", 5.0), ("CI/CD", "ADVANCED", 4.5), ("Python", "ADVANCED", 3.0), ("Git", "EXPERT", 6.0)],
            "educations": [
                {"institution": "University of Washington", "degree": "Master of Science", "field_of_study": "Information Systems", "start_year": 2017, "end_year": 2019, "grade_or_gpa": "3.9 GPA"}
            ],
            "experiences": [
                {"company_name": "Vortex Cloud Inc.", "job_title": "Lead Cloud Infrastructure Engineer", "location": "Seattle, WA", "start_date": datetime.date(2019, 8, 1), "is_current": True, "description": "Architected multi-region AWS EKS clusters and reduced deployment lead times from days to 15 minutes."}
            ]
        }
    ]

    candidate_profiles = []
    for c_info in candidates_info:
        user, _ = User.objects.get_or_create(
            email=c_info["email"],
            defaults={
                'username': c_info["username"],
                'first_name': c_info["first_name"],
                'last_name': c_info["last_name"],
                'role': 'CANDIDATE',
                'is_approved': True
            }
        )
        user.set_password('candidate123')
        user.save()

        profile, _ = CandidateProfile.objects.update_or_create(
            user=user,
            defaults={
                'headline': c_info["headline"],
                'bio': c_info["bio"],
                'current_location': c_info["location"],
                'total_experience_years': c_info["experience_years"],
                'expected_salary': c_info["expected_salary"],
                'github_url': 'https://github.com/example',
                'linkedin_url': 'https://linkedin.com/in/example'
            }
        )
        candidate_profiles.append(profile)

        # Add candidate skills
        for s_name, prof, yrs in c_info["skills"]:
            if s_name in skill_objs:
                CandidateSkill.objects.update_or_create(
                    candidate=profile,
                    skill=skill_objs[s_name],
                    defaults={'proficiency_level': prof, 'years_of_experience': yrs}
                )

        # Add candidate education
        for edu in c_info["educations"]:
            Education.objects.update_or_create(
                candidate=profile,
                institution=edu["institution"],
                degree=edu["degree"],
                defaults=edu
            )

        # Add candidate experience
        for exp in c_info["experiences"]:
            Experience.objects.update_or_create(
                candidate=profile,
                company_name=exp["company_name"],
                job_title=exp["job_title"],
                defaults=exp
            )

        # Add Primary Resume text
        Resume.objects.update_or_create(
            candidate=profile,
            title=f"{c_info['first_name']}_Resume_2026.pdf",
            defaults={
                'extracted_text': f"{c_info['headline']}\n{c_info['bio']}\nSkills: {', '.join([s[0] for s in c_info['skills']])}\nExperience: {c_info['experience_years']} years.",
                'is_primary': True
            }
        )
    print(f"✅ Created candidates: alex.dev@gmail.com / candidate123 and priya.sharma@gmail.com / candidate123")

    # 8. Applications
    app1, _ = JobApplication.objects.update_or_create(
        job=job_objs[0], # Senior Full Stack Python/React
        candidate=candidate_profiles[0], # Alex Morgan
        defaults={
            'status': 'INTERVIEW_SCHEDULED',
            'ai_match_score': 94.5,
            'match_details': {
                'resume_score': 94.5,
                'matching_skills': ['Python', 'Django', 'React', 'Docker', 'PostgreSQL'],
                'missing_skills': ['TypeScript'],
                'experience_analysis': {'level': 'Senior Engineer', 'estimated_years': 4.5}
            },
            'cover_note': "I have extensive experience architecting production-grade Django backend APIs and high-performance React user interfaces."
        }
    )

    app2, _ = JobApplication.objects.update_or_create(
        job=job_objs[2], # Cloud DevOps & Platform Engineer
        candidate=candidate_profiles[1], # Priya Sharma
        defaults={
            'status': 'SHORTLISTED',
            'ai_match_score': 96.0,
            'match_details': {
                'resume_score': 96.0,
                'matching_skills': ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Git'],
                'missing_skills': ['Microservices'],
                'experience_analysis': {'level': 'Senior Cloud Architect', 'estimated_years': 6.0}
            },
            'cover_note': "With 6 years leading enterprise cloud infrastructure at scale, I am confident I can accelerate CloudScale's deployment efficiency."
        }
    )

    app3, _ = JobApplication.objects.update_or_create(
        job=job_objs[3], # Frontend React Engineer
        candidate=candidate_profiles[0], # Alex Morgan
        defaults={
            'status': 'UNDER_REVIEW',
            'ai_match_score': 88.0,
            'match_details': {
                'resume_score': 88.0,
                'matching_skills': ['React', 'JavaScript', 'HTML5/CSS3'],
                'missing_skills': ['Tailwind CSS'],
                'experience_analysis': {'level': 'Mid-Senior Level', 'estimated_years': 4.5}
            },
            'cover_note': "Excited about building financial products with modern frontend best practices."
        }
    )
    print("✅ Created job applications with AI match scoring.")

    # 9. Interview
    interview_time = datetime.datetime.now() + datetime.timedelta(days=2, hours=3)
    Interview.objects.update_or_create(
        application=app1,
        recruiter=recruiter_users[0],
        candidate=candidate_profiles[0],
        defaults={
            'title': 'Technical Architecture & Coding Interview',
            'scheduled_at': interview_time,
            'duration_minutes': 60,
            'interview_type': 'ONLINE',
            'meeting_link': 'https://meet.google.com/smarthire-tech-interview',
            'status': 'SCHEDULED',
            'feedback': 'Candidate has an impressive track record in Django and React.'
        }
    )
    print("✅ Created scheduled interview.")

    # 10. Saved Jobs
    SavedJob.objects.update_or_create(
        candidate=candidate_profiles[0],
        job=job_objs[1]
    )

    # 11. Notifications
    Notification.objects.create(
        recipient=candidate_profiles[0].user,
        title="Interview Scheduled for Senior Full Stack Developer",
        message="Sarah Jenkins has scheduled your Technical Interview for 2 days from now. Please review the Google Meet link.",
        notification_type="INTERVIEW"
    )

    Notification.objects.create(
        recipient=recruiter_users[0],
        title="High AI Match Application Received",
        message="Alex Morgan applied for 'Senior Full Stack Python/React Developer' with an AI Match score of 94.5%.",
        notification_type="APPLICATION"
    )

    print("🎉 Database seeding completed successfully!")
    print("\nDefault Accounts for Testing:")
    print("--------------------------------------------------")
    print("👑 Admin:     admin@smarthire.ai       / admin123")
    print("💼 Recruiter: sarah.recruiter@techpulse.io / recruiter123")
    print("🎓 Candidate: alex.dev@gmail.com       / candidate123")
    print("--------------------------------------------------\n")

if __name__ == '__main__':
    seed_database()
