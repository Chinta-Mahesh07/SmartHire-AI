import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Building, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { applicationsAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const CandidateApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationsAPI.getCandidateApplications()
      .then((res) => setApplications(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Applications</h1>
        <p className="text-xs text-slate-500">
          Track real-time application statuses, recruiter reviews, and AI match ratings.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore curated job postings matching your skill profile and submit applications in 1-click.
          </p>
          <Link to="/jobs" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs">
            Search Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-blue-600">{app.company_name}</span>
                  <StatusBadge status={app.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  <Link to={`/jobs/${app.job}`} className="hover:text-blue-600 transition-colors">
                    {app.job_title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-500">
                  Applied on {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>

                {app.cover_note && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{app.cover_note}"
                  </p>
                )}
              </div>

              {/* AI Score Badge */}
              <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Match Rating</p>
                  <p className="text-xl font-extrabold text-blue-600">{app.ai_match_score}%</p>
                </div>

                <Link
                  to={`/jobs/${app.job}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <span>View Job</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateApplicationsPage;
