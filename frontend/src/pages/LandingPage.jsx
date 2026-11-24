import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Shield,
  Clock,
  Cpu,
  Search,
  Users,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import { jobsAPI } from '../services/api';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    jobsAPI.getCategories()
      .then(res => setCategories(res.data.results || res.data || []))
      .catch(err => console.error(err));

    jobsAPI.getJobs({ limit: 4 })
      .then(res => setRecentJobs(res.data.results || res.data || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-100/50 via-indigo-100/30 to-purple-100/20 blur-3xl -z-10 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold animate-pulse">
            <Sparkles className="w-4 h-4" />
            <span>SmartHire AI 2.0 – Intelligent Recruitment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Hire Smarter. Apply Faster. Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI Intelligence</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The next-generation recruitment ecosystem connecting top talent with industry leaders. Automatic PDF resume scoring, instant skill matching, and unified recruitment workflows.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/resume-analyzer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Test AI Resume Analyzer</span>
            </Link>
          </div>

          {/* Key Metrics Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">95%+</p>
              <p className="text-xs font-medium text-slate-500 mt-1">AI Match Accuracy</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">10x</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Faster Screening</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">250+</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Technical Skills Indexed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Role-Based Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">End-to-End Recruitment</span>
          <h2 className="text-3xl font-bold text-slate-900">How SmartHire AI Works</h2>
          <p className="text-sm text-slate-600">
            A frictionless pipeline designed for both candidates striving for career growth and recruiters scouting top talent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Create Profile & Upload PDF</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Job seekers upload their PDF resumes. Our engine extracts clean text and analyzes core competencies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI Resume Scoring</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated NLP compares candidate skills against industry requirements to identify strengths and skill gaps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Smart Job Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive ranked job recommendations sorted dynamically by percentage match based on actual experience and skills.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Seamless Interviews</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Recruiters shortlist candidates and schedule Google Meet interviews directly within the platform.
            </p>
          </div>
        </div>
      </section>

      {/* AI Resume Analyzer Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-14 overflow-hidden relative shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen ATS Parser</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Inspect and Optimize Your Resume Before You Apply
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                SmartHire AI breaks down your resume through multi-layer NLP. Get comprehensive ATS evaluation, missing skill alerts, and tailored suggestions to boost interview invites.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant 0-100 Match Scoring for targeted roles</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Automatic extraction of 35+ technology disciplines</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Pinpoints high-impact keywords and missing ATS tags</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/resume-analyzer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/30 transition-all"
                >
                  <span>Launch Free AI Analyzer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Card Mock */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                <div>
                  <p className="text-xs text-slate-400">Target Role</p>
                  <p className="text-sm font-bold text-white">Senior Full Stack Engineer</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
                  94.5% MATCH
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Resume ATS Score</span>
                  <span className="text-emerald-400 font-bold">92 / 100</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[92%] rounded-full" />
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Identified Core Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'Django', 'React', 'TypeScript', 'Docker', 'PostgreSQL', 'REST API'].map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-slate-700/70 text-slate-200 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                </p>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Add metrics like "Reduced response latency by 35%" to amplify work impact rating.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Opportunities</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Job Openings</h2>
          </div>
          <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View all positions</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentJobs.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-400">Loading live jobs...</div>
          ) : (
            recentJobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold text-blue-600">{job.company_name}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{job.location} • {job.job_type.replace('_', ' ')}</p>
                    </div>
                    {job.is_remote && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Remote
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.required_skills_list?.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {job.min_salary && (
                      <span className="text-xs font-bold text-slate-900">
                        ${(job.min_salary / 1000).toFixed(0)}k - ${(job.max_salary / 1000).toFixed(0)}k/yr
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">User Stories</span>
          <h2 className="text-3xl font-bold text-slate-900">Loved by Candidates & Recruiters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "The AI resume score helped me realize I was missing crucial keywords for Senior Django roles. Within two weeks of refining it, I received 3 interview requests!"
            </p>
            <div className="pt-2 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-900">Alex Morgan</p>
              <p className="text-[11px] text-slate-400">Full Stack Engineer at TechPulse</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "SmartHire AI cut our initial resume screening time from hours down to seconds. The match score ranking surfaces our ideal candidates instantly."
            </p>
            <div className="pt-2 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
              <p className="text-[11px] text-slate-400">Lead Recruiter at TechPulse Innovations</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "As an admin, having full oversight over recruiter approvals, applicant metrics, and job analytics in one unified dashboard is exceptional."
            </p>
            <div className="pt-2 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-900">Elena Rostova</p>
              <p className="text-[11px] text-slate-400">Platform Operations Director</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
