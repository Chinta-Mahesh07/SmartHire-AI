import os
import re
import json
import logging
from typing import Dict, List, Any, Optional
from pypdf import PdfReader

logger = logging.getLogger(__name__)

# Curated skill dictionary categorized for intelligent extraction
TECH_SKILLS_TAXONOMY = {
    # Programming Languages
    "python": ["python", "python3", "py"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "java": ["java", "core java", "j2ee"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp", ".net"],
    "ruby": ["ruby", "ruby on rails", "rails"],
    "php": ["php", "laravel", "symfony"],
    "go": ["golang", "go language"],
    "rust": ["rust"],
    "swift": ["swift", "ios"],
    "kotlin": ["kotlin", "android"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "t-sql", "pl/sql"],
    "nosql": ["mongodb", "cassandra", "couchbase", "dynamodb"],

    # Web & Frameworks
    "react": ["react", "react.js", "reactjs"],
    "angular": ["angular", "angularjs", "angular 2+"],
    "vue": ["vue", "vue.js", "vuejs"],
    "django": ["django", "django rest framework", "drf"],
    "fastapi": ["fastapi"],
    "flask": ["flask"],
    "node.js": ["node.js", "nodejs", "node"],
    "express": ["express", "express.js"],
    "next.js": ["next.js", "nextjs"],
    "spring boot": ["spring boot", "spring framework", "spring"],
    "html/css": ["html", "html5", "css", "css3", "sass", "tailwind", "tailwind css", "bootstrap"],
    "graphql": ["graphql", "apollo"],
    "rest api": ["rest api", "restful api", "restful", "web api"],

    # Cloud, DevOps & Infrastructure
    "aws": ["aws", "amazon web services", "ec2", "s3", "lambda"],
    "azure": ["azure", "microsoft azure"],
    "google cloud": ["gcp", "google cloud platform", "google cloud"],
    "docker": ["docker", "containerization"],
    "kubernetes": ["kubernetes", "k8s"],
    "ci/cd": ["ci/cd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "terraform": ["terraform", "infrastructure as code", "iac"],
    "linux": ["linux", "ubuntu", "bash", "shell scripting"],
    "git": ["git", "github", "gitlab", "version control"],

    # AI, ML & Data
    "machine learning": ["machine learning", "ml", "supervised learning", "unsupervised learning"],
    "deep learning": ["deep learning", "neural networks", "cnn", "rnn", "transformers"],
    "nlp": ["nlp", "natural language processing", "llm", "large language models"],
    "openai": ["openai", "chatgpt", "gpt-4", "langchain", "prompt engineering"],
    "pandas": ["pandas", "numpy", "scipy"],
    "data science": ["data science", "data analysis", "data visualization"],
    "pytorch": ["pytorch", "torch"],
    "tensorflow": ["tensorflow", "keras"],

    # Architecture & Tools
    "microservices": ["microservices", "distributed systems", "event-driven architecture"],
    "redis": ["redis", "caching", "memcached"],
    "rabbitmq": ["rabbitmq", "kafka", "message queue", "celery"],
    "agile": ["agile", "scrum", "kanban", "jira"],
    "testing": ["unit testing", "pytest", "jest", "selenium", "cypress", "tdd"],
}

EDUCATION_PATTERNS = [
    r"(?i)\b(ph\.?d|doctorate|doctor of philosophy)\b",
    r"(?i)\b(master(?:'s)?|m\.?s\.?|m\.?tech|m\.?sc|m\.?b\.?a)\b",
    r"(?i)\b(bachelor(?:'s)?|b\.?s\.?|b\.?tech|b\.?e\.?|b\.?sc|b\.?a)\b",
    r"(?i)\b(diploma|associate degree)\b",
]

def extract_text_from_pdf(file_obj) -> str:
    """Extract clean text content from uploaded PDF file."""
    text_parts = []
    try:
        reader = PdfReader(file_obj)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        return ""
    return "\n".join(text_parts).strip()


def extract_skills_from_text(text: str) -> List[str]:
    """Identify skills from text using taxonomical pattern matching."""
    text_lower = text.lower()
    found_skills = set()

    for canonical_name, aliases in TECH_SKILLS_TAXONOMY.items():
        for alias in aliases:
            pattern = r'(?:\b|_)' + re.escape(alias) + r'(?:\b|_)'
            if re.search(pattern, text_lower):
                found_skills.add(canonical_name.title())
                break
    return sorted(list(found_skills))


def estimate_experience_years(text: str) -> float:
    """Estimate total professional experience from text via regex heuristics."""
    exp_patterns = [
        r'(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)',
        r'experience\s*(?:of)?\s*:?\s*(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)',
        r'(\d+)\s*(?:-|to)\s*(\d+)\s*(?:years?|yrs?)\s+experience'
    ]
    years_found = []
    for pattern in exp_patterns:
        matches = re.findall(pattern, text, flags=re.IGNORECASE)
        for m in matches:
            if isinstance(m, tuple):
                for val in m:
                    if val and float(val) <= 40:
                        years_found.append(float(val))
            elif m and float(m) <= 40:
                years_found.append(float(m))

    if years_found:
        return max(years_found)

    # Secondary heuristic: Count distinct year ranges like (2019 - 2023)
    year_ranges = re.findall(r'\b(20[0-2]\d|199\d)\s*[-–—to]+\s*(20[0-2]\d|present|current)\b', text, flags=re.IGNORECASE)
    total_range_years = 0
    import datetime
    current_year = datetime.datetime.now().year

    for start, end in year_ranges:
        try:
            s_year = int(start)
            e_year = current_year if end.lower() in ['present', 'current'] else int(end)
            diff = max(0, min(e_year - s_year, 20))
            total_range_years += diff
        except Exception:
            pass

    if total_range_years > 0:
        return min(float(total_range_years), 30.0)

    return 1.5 # Default baseline


def extract_education_level(text: str) -> str:
    """Identify highest education credential from text."""
    for pattern in EDUCATION_PATTERNS:
        match = re.search(pattern, text)
        if match:
            found = match.group(0).strip()
            if re.search(r'ph\.?d|doctorate', found, re.IGNORECASE):
                return "Ph.D. / Doctorate"
            if re.search(r'master|m\.?s|m\.?tech|m\.?b\.?a', found, re.IGNORECASE):
                return "Master's Degree"
            if re.search(r'bachelor|b\.?s|b\.?tech|b\.?e', found, re.IGNORECASE):
                return "Bachelor's Degree"
            return "Diploma / Associate"
    return "Bachelor's Degree (Assumed)"


class ResumeAnalyzer:
    """
    AI-powered resume analyzer with OpenAI integration
    and robust fallback NLP/rule-based engine.
    """

    @classmethod
    def analyze_resume_text(cls, resume_text: str, target_job=None) -> Dict[str, Any]:
        api_key = os.getenv('OPENAI_API_KEY', '').strip()

        # If OpenAI API key is provided and non-dummy, attempt OpenAI analysis
        if api_key and not api_key.startswith('your_'):
            try:
                return cls._analyze_with_openai(resume_text, target_job, api_key)
            except Exception as e:
                logger.warning(f"OpenAI analysis failed, falling back to rule-based engine: {e}")

        # Fallback Rule-Based NLP Analyzer
        return cls._analyze_with_rules(resume_text, target_job)

    @classmethod
    def _analyze_with_openai(cls, resume_text: str, target_job, api_key: str) -> Dict[str, Any]:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        job_context = ""
        if target_job:
            req_skills = [s.name for s in target_job.required_skills.all()]
            job_context = f"""
            Target Job Title: {target_job.title}
            Job Description: {target_job.description}
            Job Requirements: {target_job.requirements}
            Required Skills: {', '.join(req_skills)}
            Required Experience: {target_job.min_experience_years} years
            """

        prompt = f"""
        You are an expert AI Technical Recruiter & Resume Evaluator for SmartHire AI.
        Analyze the following resume text against the target job (if provided) or for general software/tech roles.

        Resume Content:
        \"\"\"{resume_text[:4000]}\"\"\"

        {job_context}

        Return STRICT JSON format matching this schema:
        {{
            "resume_score": <number between 0 and 100>,
            "identified_skills": [<list of technical & professional skills found in resume>],
            "matching_skills": [<list of skills that match the target job or tech industry requirements>],
            "missing_skills": [<list of valuable skills missing for this role>],
            "experience_analysis": {{
                "estimated_years": <number>,
                "level": "<Junior|Mid-Level|Senior|Lead>",
                "summary": "<2-3 sentence overview of work history and domain strength>"
            }},
            "education_analysis": {{
                "degree": "<degree identified>",
                "field": "<field of study>"
            }},
            "improvement_suggestions": [
                "<actionable recommendation 1 with ATS impact>",
                "<actionable recommendation 2>",
                "<actionable recommendation 3>",
                "<actionable recommendation 4>"
            ]
        }}
        """

        response = client.chat.completions.create(
            model=os.getenv('AI_MODEL', 'gpt-4o-mini'),
            messages=[
                {"role": "system", "content": "You are a professional ATS resume analyzer returning JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1500
        )

        content = response.choices[0].message.content
        return json.loads(content)

    @classmethod
    def _analyze_with_rules(cls, resume_text: str, target_job=None) -> Dict[str, Any]:
        identified_skills = extract_skills_from_text(resume_text)
        exp_years = estimate_experience_years(resume_text)
        education = extract_education_level(resume_text)

        # Baseline Target skills
        if target_job:
            target_skills = [s.name.title() for s in target_job.required_skills.all()]
            if not target_skills:
                # Extract from requirements text
                target_skills = extract_skills_from_text(f"{target_job.requirements} {target_job.description}")
            min_exp = target_job.min_experience_years
        else:
            # General tech industry benchmark
            target_skills = ["Python", "Javascript", "React", "Sql", "Git", "Docker", "Rest Api", "Ci/Cd"]
            min_exp = 2

        # Compute skill overlap
        identified_lower = {s.lower() for s in identified_skills}
        matching_skills = [s for s in target_skills if s.lower() in identified_lower]
        missing_skills = [s for s in target_skills if s.lower() not in identified_lower]

        # Calculate matching score
        # 1. Skill coverage (50 pts)
        if target_skills:
            skill_ratio = len(matching_skills) / len(target_skills)
            skill_pts = skill_ratio * 50
        else:
            skill_pts = min(len(identified_skills) * 5, 50)

        # 2. Experience coverage (30 pts)
        if exp_years >= min_exp:
            exp_pts = 30.0
        else:
            exp_pts = (exp_years / max(min_exp, 1)) * 30.0

        # 3. Resume completeness & formatting (20 pts)
        text_length = len(resume_text)
        completeness_pts = min(max(text_length / 300, 5), 20)

        resume_score = round(min(skill_pts + exp_pts + completeness_pts, 98.0), 1)

        # Seniority level
        if exp_years < 2:
            seniority = "Junior / Entry Level"
        elif exp_years < 5:
            seniority = "Mid-Level Professional"
        elif exp_years < 8:
            seniority = "Senior Engineer"
        else:
            seniority = "Lead / Principal Specialist"

        # Actionable Suggestions
        suggestions = []
        if missing_skills:
            suggestions.append(f"Add key missing in-demand skills such as: {', '.join(missing_skills[:3])} to improve keyword ATS ranking.")
        if exp_years < min_exp:
            suggestions.append(f"Highlight hands-on project accomplishments and open-source contributions to compensate for {min_exp - exp_years:.1f} years experience gap.")
        if len(identified_skills) < 6:
            suggestions.append("Explicitly enumerate core tools, frameworks, and cloud technologies in a dedicated 'Technical Skills' section.")
        if not re.search(r'\b(metrics|increased|reduced|improved|boosted|%\b|\$\b)', resume_text, re.IGNORECASE):
            suggestions.append("Incorporate quantifiable impact metrics (e.g., 'Reduced API latency by 35%', 'Improved test coverage to 92%') into work experience bullet points.")
        suggestions.append("Ensure consistent reverse-chronological formatting and verify all links (GitHub, LinkedIn, Portfolio) are functional.")

        return {
            "resume_score": resume_score,
            "identified_skills": identified_skills,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "experience_analysis": {
                "estimated_years": exp_years,
                "level": seniority,
                "summary": f"Candidate demonstrates approximately {exp_years:.1f} years of relevant experience with proficiency in {len(identified_skills)} core technologies."
            },
            "education_analysis": {
                "degree": education,
                "field": "Computer Science / Information Technology"
            },
            "improvement_suggestions": suggestions
        }


class JobRecommendationEngine:
    """
    Ranks active jobs for a candidate based on actual skills,
    experience requirements, and role compatibility.
    """

    @classmethod
    def get_recommendations_for_candidate(cls, candidate_profile, limit: int = 20) -> List[Dict[str, Any]]:
        from jobs.models import Job

        # Retrieve candidate skills
        candidate_skills = list(candidate_profile.skills.select_related('skill').all())
        cand_skill_names = {cs.skill.name.lower() for cs in candidate_skills}

        # Also pull skills from primary resume if available
        primary_resume = candidate_profile.resumes.filter(is_primary=True).first()
        if primary_resume and primary_resume.extracted_text:
            resume_skills = extract_skills_from_text(primary_resume.extracted_text)
            for s in resume_skills:
                cand_skill_names.add(s.lower())

        cand_exp = float(candidate_profile.total_experience_years)
        active_jobs = Job.objects.filter(status='ACTIVE').select_related('company', 'category').prefetch_related('required_skills')

        recommendations = []

        for job in active_jobs:
            job_skills = [s.name.title() for s in job.required_skills.all()]
            if not job_skills:
                job_skills = extract_skills_from_text(f"{job.title} {job.requirements}")

            # Skill matching score (60%)
            if job_skills:
                matched_skills = [s for s in job_skills if s.lower() in cand_skill_names]
                missing_skills = [s for s in job_skills if s.lower() not in cand_skill_names]
                skill_score = (len(matched_skills) / len(job_skills)) * 60.0
            else:
                matched_skills = list(cand_skill_names)[:3]
                missing_skills = []
                skill_score = 45.0

            # Experience matching score (25%)
            if cand_exp >= job.min_experience_years:
                exp_score = 25.0
            else:
                diff = job.min_experience_years - cand_exp
                exp_score = max(0.0, 25.0 - (diff * 5.0))

            # Headline / Title semantic keyword affinity (15%)
            headline_text = f"{candidate_profile.headline} {candidate_profile.bio}".lower()
            title_words = [w for w in re.findall(r'\w+', job.title.lower()) if len(w) > 2]
            title_overlap = sum(1 for w in title_words if w in headline_text)
            title_score = min(15.0, (title_overlap * 5.0) + 5.0)

            total_match_score = round(min(max(skill_score + exp_score + title_score, 25.0), 98.0), 1)

            recommendations.append({
                "job_id": job.id,
                "job_title": job.title,
                "company_name": job.company.name,
                "company_logo": job.company.logo.url if job.company.logo else None,
                "location": job.location,
                "is_remote": job.is_remote,
                "job_type": job.job_type,
                "experience_level": job.experience_level,
                "min_salary": float(job.min_salary) if job.min_salary else None,
                "max_salary": float(job.max_salary) if job.max_salary else None,
                "category_name": job.category.name if job.category else None,
                "match_score": total_match_score,
                "matching_skills": matched_skills,
                "missing_skills": missing_skills,
                "created_at": job.created_at.isoformat(),
            })

        # Sort recommendations descending by match_score
        recommendations.sort(key=lambda x: x["match_score"], reverse=True)
        return recommendations[:limit]
