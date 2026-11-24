import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Users, Eye, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';

const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getRecruiterJobs();
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load your jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsAPI.deleteJob(id);
      showToast('Job posting deleted.', 'info');
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Job Openings</h1>
          <p className="text-xs text-slate-500">
            Create, edit, pause, and review applicant counts for your company's published roles.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Job</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No jobs published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by posting your first job opening to attract top qualified candidates.
          </p>
          <Link to="/recruiter/jobs/new" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs">
            Create First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-slate-400 font-medium">
                    Posted on {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  <Link to={`/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                    {job.title}
                  </Link>
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.job_type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>Min {job.min_experience_years} yrs exp</span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">{job.views_count || 0}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Views</p>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{job.applications_count || 0}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Applicants</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                  <Link
                    to={`/recruiter/applicants?job_id=${job.id}`}
                    className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="View Applicants"
                  >
                    <Users className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Edit Job"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2.5 rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecruiterJobsPage;
