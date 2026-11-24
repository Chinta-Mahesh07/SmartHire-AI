import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Briefcase, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';
import { aiAPI } from '../../services/api';

const CandidateRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getRecommendations()
      .then((res) => setRecommendations(res.data.recommendations || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dynamic Skill & Experience Matching</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Recommended Jobs</h1>
        <p className="text-xs text-slate-500">
          Ranked dynamically based on your profile skills, years of experience, and target role relevance.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Computing AI job matches...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No active job recommendations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add skills and upload your primary PDF resume in your Profile to generate personalized job matches.
          </p>
          <Link to="/candidate/profile" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs">
            Complete Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((job) => (
            <div
              key={job.job_id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-blue-600">{job.company_name}</span>
                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/jobs/${job.job_id}`} className="hover:text-blue-600 transition-colors">
                      {job.job_title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.job_type.replace('_', ' ')}</span>
                    {job.is_remote && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Remote
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700">
                    {job.match_score}% Match
                  </span>
                  <Link
                    to={`/jobs/${job.job_id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Skills overlap */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {job.matching_skills?.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Matching Profile Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.matching_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.missing_skills?.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Missing Requirement Keywords
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.missing_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateRecommendationsPage;
