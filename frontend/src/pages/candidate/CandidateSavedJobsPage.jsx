import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MapPin, DollarSign, Trash2, ChevronRight } from 'lucide-react';
import { candidatesAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CandidateSavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSaved = async () => {
    try {
      const res = await candidatesAPI.getSavedJobs();
      setSavedJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await candidatesAPI.toggleSaveJob(jobId);
      showToast('Job removed from bookmarks.', 'info');
      setSavedJobs((prev) => prev.filter((item) => item.job !== jobId));
    } catch (err) {
      showToast('Error removing job.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Job Bookmarks</h1>
        <p className="text-xs text-slate-500">
          Bookmarked opportunities saved for later application.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading saved jobs...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No bookmarked jobs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any job card to save it to this collection.
          </p>
          <Link to="/jobs" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((item) => {
            const job = item.job_details;
            if (!job) return null;
            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600">{job.company_name}</span>
                    {job.is_remote && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        Remote
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                      {job.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                    {job.min_salary && (
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        ${(job.min_salary / 1000).toFixed(0)}k - ${(job.max_salary / 1000).toFixed(0)}k/yr
                      </span>
                    )}
                    <span>Saved {new Date(item.saved_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleRemove(job.id)}
                    className="p-2.5 rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Job</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateSavedJobsPage;
