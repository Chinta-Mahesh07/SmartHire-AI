import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  Calendar,
  Sparkles,
  Bookmark,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Award
} from 'lucide-react';
import { candidatesAPI, aiAPI, interviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      candidatesAPI.getDashboardStats(),
      aiAPI.getRecommendations(),
      interviewsAPI.getCandidateInterviews()
    ])
      .then(([statsRes, recsRes, intRes]) => {
        setStats(statsRes.data.stats || {});
        setRecommendations(recsRes.data.recommendations?.slice(0, 3) || []);
        const interviews = intRes.data.results || intRes.data || [];
        setUpcomingInterviews(interviews.filter(i => i.status === 'SCHEDULED'));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading your candidate dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Job Seeker Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            You have {stats?.total_applied || 0} active application{stats?.total_applied !== 1 ? 's' : ''} and {upcomingInterviews.length} upcoming interview{upcomingInterviews.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <Link
          to="/candidate/profile"
          className="px-6 py-3 rounded-2xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          <span>Update Resume & Skills</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Total Applied</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.total_applied || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Shortlisted</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.shortlisted || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Interviews</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.interviews_scheduled || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Saved Jobs</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.saved_jobs || 0}</p>
        </div>
      </div>

      {/* Upcoming Interview Alert Box (if scheduled) */}
      {upcomingInterviews.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Scheduled Interview</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Confirmed
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold">{upcomingInterviews[0].title}</h3>
            <p className="text-xs text-purple-200">
              {upcomingInterviews[0].job_title} at {upcomingInterviews[0].company_name}
            </p>
            <p className="text-xs text-purple-200 pt-1">
              🗓️ {new Date(upcomingInterviews[0].scheduled_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })} ({upcomingInterviews[0].duration_minutes} mins)
            </p>
          </div>

          {upcomingInterviews[0].meeting_link && (
            <div className="pt-2">
              <a
                href={upcomingInterviews[0].meeting_link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Join Video Meeting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations & Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: AI Recommended Jobs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Smart Recommendations</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Top AI Job Matches</h3>
            </div>
            <Link to="/candidate/recommendations" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Upload your resume in Profile to receive AI recommendations.
              </div>
            ) : (
              recommendations.map((job) => (
                <div key={job.job_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-xs font-semibold text-blue-600">{job.company_name}</p>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{job.job_title}</h4>
                    <p className="text-[11px] text-slate-500">{job.location} • {job.job_type.replace('_', ' ')}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {job.match_score}% Match
                    </span>
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Tools & Tips */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Career Tools</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">AI Resume Optimization</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Did you know? Recruiters receive hundreds of applications per role. Optimize your resume with SmartHire AI to uncover missing skills and maximize ATS parsing scores.
            </p>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
              <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Latest AI Resume Evaluation
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Run an instant benchmark scan against current industry benchmarks or any specific active opening.
              </p>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Link
              to="/resume-analyzer"
              className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold text-center shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              Run AI Resume Scan
            </Link>
            <Link
              to="/candidate/applications"
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 text-xs font-bold text-center hover:bg-slate-50 transition-all"
            >
              My Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
