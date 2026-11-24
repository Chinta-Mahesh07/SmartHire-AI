import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllJobs();
      setJobs(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load all platform jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await adminAPI.updateJobStatus(jobId, newStatus);
      showToast(`Job status changed to ${newStatus}.`, 'success');
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (err) {
      showToast('Failed to update job status.', 'error');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting from the platform?')) return;
    try {
      await adminAPI.deleteJob(jobId);
      showToast('Job posting deleted.', 'info');
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Job Governance</h1>
          <p className="text-xs text-slate-500">
            Audit, activate, pause, or remove job listings across all registered employers.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-7 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter jobs by title or company name..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No job postings found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Job Title & Employer</th>
                  <th className="p-4">Type & Location</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Posted Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">{j.title}</p>
                        <p className="text-blue-600 font-medium text-[11px]">{j.company_name}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {j.job_type.replace('_', ' ')} • {j.location}
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {j.views_count || 0}
                    </td>
                    <td className="p-4">
                      <select
                        value={j.status}
                        onChange={(e) => handleStatusChange(j.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PAUSED">PAUSED</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(j.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/jobs/${j.id}`}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          title="View Live Job"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(j.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
