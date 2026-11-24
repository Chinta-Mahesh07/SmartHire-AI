# SmartHire AI – AI-Powered Recruitment & Job Management Platform

SmartHire AI is a full-stack, enterprise-grade AI-powered recruitment management platform that seamlessly connects **Job Seekers (Candidates)**, **Recruiters (Employers)**, and **Administrators**.

Built with a **React.js + Vite** frontend, a **Django REST Framework + MySQL** backend, and an integrated **AI Resume Analyzer & Job Matching Recommendation Engine**, SmartHire AI automates resume screening, computes real-time candidate compatibility scores, streamlines interview workflows, and delivers deep recruitment governance analytics.

---

## 🌟 Key Highlights & Features

### 👑 1. Advanced Admin Console
- **Platform Analytics & Governance**: Real-time KPI counters: Total Users, Total Recruiters, Total Candidates, Total Jobs, Applications, and Placement Success Rate.
- **Interactive Visualizations (Recharts)**: Monthly applicant velocity curves, funnel status distribution charts, and job breakdown by category.
- **User Governance**: Audit, activate, or deactivate candidate and recruiter accounts.
- **Recruiter Account Verification**: Review pending recruiter registrations, corporate credentials, and approve or reject access.
- **Job Listing Oversight**: Supervise, pause, activate, or remove any job opening across all companies.
- **Executive Recruitment Reports**: Printable and exportable recruitment audit reports.

### 💼 2. Recruiter Hub
- **Job Lifecycle Management**: Multi-step job authoring with rich requirements, responsibilities, salary ranges, remote toggles, and taxonomy-indexed skill tags.
- **Applicant Pipeline & Scoring**: Review candidates filtered by job opening, hiring stage, and minimum AI match score.
- **Instant Resume Access**: Inspect extracted resume text and download original PDF resumes.
- **Candidate Stage Progression**: Seamlessly transition applicants across: `Applied` ➔ `Under Review` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Selected` ➔ `Rejected`.
- **Integrated Interview Scheduling**: Schedule Google Meet / Zoom or in-person interviews directly from candidate profiles, automatically dispatching calendar invitations and notifications.
- **Evaluation & Feedback**: Submit 1–5 star ratings and evaluation notes to candidate records.
- **Company Profile Hub**: Manage organization details, logo, website, headquarters, company size, and mission.

### 🎓 3. Candidate Career Hub
- **Smart Profile Management**: Manage career headline, bio, experience duration, target compensation, and portfolio links (GitHub, LinkedIn).
- **PDF Resume Upload & Text Extraction**: Upload PDF resumes with automated background text parsing, skill identification, and ATS scoring.
- **Skills Portfolio**: Curate technical, framework, and language competencies with customizable proficiency ratings.
- **Education & Work Experience**: Track academic degrees, institutions, and chronological employment history.
- **Job Search & Multi-Faceted Filtering**: Filter jobs by title, skill keywords, location, employment type, seniority band, and remote availability.
- **One-Click Apply with Instant AI Match**: Submit applications with attached resumes and custom pitches; receive real-time compatibility scores immediately upon application.
- **Dynamic Job Recommendations**: An algorithmic recommendation engine that compares candidate skills and experience against active roles to rank jobs descending by match percentage.
- **Interview Coordination**: Review scheduled video interviews, upcoming dates, and meeting links.
- **Bookmarked Jobs**: Save opportunities to apply later.

### 🤖 4. AI Resume Analyzer & Recommendation Engine
- **Automated Text Extraction**: Native `pypdf` extraction from uploaded PDF resumes.
- **Taxonomical Skill Parsing**: 250+ technology taxonomy mapping programming languages, frameworks, cloud platforms, and DevOps tools.
- **Dual AI Processing**:
  - **OpenAI API Integration**: Connects with GPT models (`gpt-4o-mini`) using structured JSON output schema when `OPENAI_API_KEY` is provided.
  - **Built-in NLP Rule-Based Fallback**: An intelligent local analyzer calculating ATS scores (0–100), identifying matching skills, pinpointing missing keywords, estimating seniority levels, and recommending concrete resume improvements.
- **Dynamic Job Matching Algorithm**: Computes compatibility based on weighted skill overlap (60%), experience duration (25%), and title/semantic affinity (15%).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Tailwind CSS, Lucide React Icons, Recharts |
| **Backend** | Python 3.13, Django 5+, Django REST Framework (DRF), SimpleJWT Authentication, Django ORM |
| **Database** | MySQL (with SQLite fallback configured for local development), PyMySQL |
| **AI / NLP** | OpenAI API, `pypdf`, Scikit-Learn, Custom Technical Taxonomy & Regex NLP Parser |

---

## 📂 Project Architecture

```
smarthire-ai/
├── backend/
│   ├── config/               # Django root settings, wsgi, urls
│   ├── accounts/             # Custom User model, JWT Auth, Admin management & analytics
│   ├── candidates/           # CandidateProfile, Skills, Education, Experience, Resumes, SavedJobs
│   ├── recruiters/           # RecruiterProfile, hiring stats
│   ├── companies/            # Company entities and profile management
│   ├── jobs/                 # Job Categories and Job listings
│   ├── applications/         # JobApplication model, candidate application & recruiter review
│   ├── interviews/           # Interview scheduling, Google Meet links, feedback & ratings
│   ├── notifications/        # In-app notifications with unread badge tracking
│   ├── ai_analyzer/          # OpenAI integration, PDF text parser, recommendation engine
│   ├── seed_data.py          # Database seeding script with realistic dummy data
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variable template
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Navbar, Footer, StatusBadge, NotificationDropdown)
    │   ├── context/          # AuthContext (state & JWT), ToastContext
    │   ├── layouts/          # MainLayout (public) and DashboardLayout (sidebar + topbar)
    │   ├── pages/
    │   │   ├── candidate/    # Candidate portal pages
    │   │   ├── recruiter/    # Recruiter portal pages
    │   │   ├── admin/        # Admin governance pages
    │   │   ├── LandingPage.jsx
    │   │   ├── JobsPage.jsx
    │   │   ├── JobDetailPage.jsx
    │   │   ├── ResumeAnalyzerPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── routes/           # AppRoutes with Protected & RoleRoute guards
    │   ├── services/         # Axios API service client
    │   └── styles/           # Tailwind CSS directives
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Quick Start & Setup Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- **MySQL 8.0+** (Optional: SQLite fallback is active by default in `.env` for zero-configuration testing)

---

### Step 1: Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd smarthire-ai/backend
   ```

2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   # On Windows:
   copy .env.example .env
   # On macOS/Linux:
   cp .env.example .env
   ```
   *To use MySQL, set `DB_ENGINE=mysql` and update `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.*

5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

6. Seed the database with comprehensive sample data (Admin, Recruiters, Candidates, Jobs, and Interviews):
   ```bash
   python seed_data.py
   ```

7. Run automated backend tests to verify system health:
   ```bash
   python manage.py test accounts
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   Backend will run at: `http://127.0.0.1:8000/`

---

### Step 2: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd smarthire-ai/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run at: `http://localhost:5173/`

---

## 🔑 Pre-Configured Test Accounts

The seed script creates ready-to-test accounts across all 3 roles:

| Role | Email | Password | Permissions & Portal |
|---|---|---|---|
| 👑 **Administrator** | `admin@smarthire.ai` | `admin123` | Platform oversight, analytics charts, recruiter approvals, user governance |
| 💼 **Recruiter** | `sarah.recruiter@techpulse.io` | `recruiter123` | Job posting, candidate review, AI match filtering, interview scheduling |
| 🎓 **Candidate** | `alex.dev@gmail.com` | `candidate123` | Job search, AI recommendations, resume upload, application tracking |

*Quick 1-click login buttons are provided directly on the Login page for rapid demonstration.*

---

## 📋 Comprehensive API Reference

### 🔐 Authentication (`/api/auth/`)
- `POST /api/auth/register/` – Register as Candidate or Recruiter
- `POST /api/auth/login/` – Authenticate via email & password, returns JWT tokens
- `POST /api/auth/token/refresh/` – Refresh access token
- `GET/PATCH /api/auth/profile/` – Retrieve / update authenticated user profile
- `GET /api/auth/admin/analytics/` – Retrieve platform KPIs, status counts, and category distributions (Admin only)
- `GET /api/auth/admin/users/` – Filter & search all users (Admin only)
- `PATCH /api/auth/admin/users/<id>/` – Activate or deactivate user account
- `POST /api/auth/admin/recruiters/<id>/approval/` – Approve or reject recruiter accounts

### 💼 Job Management (`/api/jobs/`)
- `GET /api/jobs/` – Search & filter active jobs (keyword, location, category, job_type, salary, remote)
- `GET /api/jobs/<id>/` – Retrieve job details (increments view counter)
- `GET /api/jobs/categories/` – List job categories with active job counts
- `GET /api/jobs/recruiter/manage/` – List recruiter's company job postings
- `POST /api/jobs/recruiter/manage/` – Create a new job opening
- `PUT/PATCH /api/jobs/recruiter/manage/<id>/` – Update job details
- `DELETE /api/jobs/recruiter/manage/<id>/` – Delete job listing
- `GET /api/jobs/admin/all/` – Audit all platform jobs (Admin only)
- `PATCH /api/jobs/admin/<id>/status/` – Change job status (Admin only)

### 📄 Applications & Pipeline (`/api/applications/`)
- `POST /api/applications/apply/` – Candidate applies for a job with resume; calculates AI score and sends recruiter notification
- `GET /api/applications/candidate/my-applications/` – Candidate views application history and status
- `GET /api/applications/recruiter/manage/` – Recruiter reviews applicants filtered by job, status, or min AI score
- `PATCH /api/applications/recruiter/manage/<id>/` – Recruiter updates application status (`SHORTLISTED`, `SELECTED`, `REJECTED`, etc.)

### 🤖 AI Resume Analyzer & Recommendations (`/api/ai/`)
- `POST /api/ai/analyze-resume/` – Upload PDF or select existing resume; returns ATS score, extracted skills, and improvement suggestions
- `GET /api/ai/recommendations/` – Returns AI ranked jobs matching candidate's profile
- `GET /api/ai/history/` – View previous resume analysis history

### 📅 Interviews (`/api/interviews/`)
- `POST /api/interviews/schedule/` – Recruiter schedules interview with video link; notifies candidate
- `GET /api/interviews/recruiter/` – Recruiter interview calendar
- `GET /api/interviews/candidate/` – Candidate interview calendar
- `PATCH /api/interviews/<id>/` – Submit evaluation feedback and 1–5 star rating

### 🔔 Notifications (`/api/notifications/`)
- `GET /api/notifications/` – List notifications with unread count
- `PATCH /api/notifications/<id>/read/` – Mark single notification as read
- `POST /api/notifications/read-all/` – Mark all notifications as read

---

## 🔒 Security & Best Practices
- **Role-Based Permissions**: Granular `IsCandidateRole`, `IsRecruiterRole`, and `IsAdminUserRole` permission classes enforce strict boundary isolation.
- **Credential Protection**: API keys and database credentials are fully isolated in backend environment variables.
- **Upload Validation**: Enforces strict file extension verification (`.pdf`) and 10MB memory upload size limits.
- **JWT Lifetimes**: Configured with rotating refresh tokens and secure bearer headers.
