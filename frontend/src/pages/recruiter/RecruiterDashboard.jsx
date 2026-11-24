import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Eye,
  Building
} from 'lucide-react';
import { recruitersAPI, jobsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruitersAPI.getDashboardStats()
      .then((res) => {
        setStats(res.data.stats || {});
        setRecentApps(res.data.recent_applications || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur">
            <Building className="w-3.5 h-3.5" />
            <span>{user?.company_name || 'Hiring Dashboard'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Recruiter Workspace: {user?.first_name || user?.username}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track candidates, monitor job postings, schedule interviews, and evaluate AI match ratings in real-time.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Active Job Postings</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.active_jobs || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Total Applicants</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.total_applications || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Upcoming Interviews</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.upcoming_interviews || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Selected / Hired</p>
          <p className="text-2xl font-bold text-slate-900">{stats?.hired || 0}</p>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Candidate Pipeline</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">Recent Applicants</h3>
          </div>
          <Link to="/recruiter/applicants" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View all applicants</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No applicants received yet for your job postings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Candidate</th>
                  <th className="p-3.5">Position</th>
                  <th className="p-3.5">AI Match</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{app.candidate_name}</td>
                    <td className="p-3.5 text-slate-600">{app.job_title}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700">
                        {app.ai_match_score}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/recruiter/applicants?id=${app.id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100 transition-colors inline-block"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
