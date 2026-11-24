import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { applicationsAPI, jobsAPI, interviewsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';

const RecruiterApplicantsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialJobId = searchParams.get('job_id') || '';

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filters
  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('');
  const [minScore, setMinScore] = useState('');

  // Modals state
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);

  // Interview Schedule Form
  const [interviewData, setInterviewData] = useState({
    title: 'Technical Round 1',
    scheduled_at: '',
    duration_minutes: 45,
    interview_type: 'ONLINE',
    meeting_link: 'https://meet.google.com/smarthire-interview',
    location_details: '',
  });

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJob) params.job_id = selectedJob;
      if (statusFilter) params.status = statusFilter;
      if (minScore) params.min_score = minScore;

      const res = await applicationsAPI.getRecruiterApplications(params);
      setApplicants(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    jobsAPI.getRecruiterJobs().then((res) => {
      setJobs(res.data.results || res.data || []);
    });
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [selectedJob, statusFilter, minScore]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationsAPI.updateStatus(appId, { status: newStatus });
      showToast(`Candidate status updated to ${newStatus.replace('_', ' ')}.`, 'success');
      setApplicants((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleOpenInterview = (app) => {
    setSelectedApp(app);
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);

    setInterviewData((prev) => ({
      ...prev,
      title: `Technical Interview – ${app.job_title}`,
      scheduled_at: localISOTime,
    }));
    setInterviewModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!interviewData.scheduled_at) {
      showToast('Please select interview date and time.', 'warning');
      return;
    }

    try {
      await interviewsAPI.scheduleInterview({
        application: selectedApp.id,
        ...interviewData,
      });
      showToast('Interview scheduled and invitation sent to candidate!', 'success');
      setInterviewModalOpen(false);
      fetchApplicants();
    } catch (err) {
      showToast('Failed to schedule interview.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Pipeline & Applicants</h1>
        <p className="text-xs text-slate-500">
          Screen candidates, review AI match scores, inspect resumes, and coordinate interview stages.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Job Filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
          >
            <option value="">All Job Postings</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* AI Match Filter */}
        <div>
          <select
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
          >
            <option value="">Any AI Match Score</option>
            <option value="90">90%+ Match (Top Tier)</option>
            <option value="80">80%+ Match (High Fit)</option>
            <option value="70">70%+ Match (Moderate Fit)</option>
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading applicants...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or check back once candidates apply to your job listings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{app.candidate_name}</h3>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-blue-600 font-medium">Applied for: {app.job_title}</p>
                  {app.candidate_headline && (
                    <p className="text-xs text-slate-500 italic max-w-xl">{app.candidate_headline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {app.candidate_email}</span>
                    {app.candidate_phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {app.candidate_phone}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Score & Modals button */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      {app.ai_match_score}% AI Match
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setDetailsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Match Breakdown</span>
                  </button>
                </div>
              </div>

              {/* Cover Note */}
              {app.cover_note && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Cover Note: </span>
                  <span>{app.cover_note}</span>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {app.resume_details?.file_url ? (
                    <a
                      href={app.resume_details.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resume (PDF)</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">No PDF attached</span>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInterview(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Interview</span>
                  </button>

                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="SHORTLISTED">Shortlist</option>
                    <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                    <option value="SELECTED">Hire / Select</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Match Breakdown Modal */}
      {detailsModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Match Evaluation</h3>
                <p className="text-xs text-slate-500">{selectedApp.candidate_name} • {selectedApp.job_title}</p>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-center p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <p className="text-xs font-semibold text-blue-900">Calculated Compatibility Score</p>
              <p className="text-4xl font-extrabold text-blue-600">{selectedApp.ai_match_score}%</p>
              <p className="text-xs text-blue-800">
                {selectedApp.match_details?.experience_analysis?.level || 'Proficient Candidate'}
              </p>
            </div>

            {/* Matching & Missing Skills */}
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Matching Skills Found:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.match_details?.matching_skills?.length > 0 ? (
                    selectedApp.match_details.matching_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold text-[11px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None detected</span>
                  )}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />
                  Missing Skills Required:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.match_details?.missing_skills?.length > 0 ? (
                    selectedApp.match_details.missing_skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 font-semibold text-[11px]">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">All required skills fulfilled</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setDetailsModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {interviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleScheduleSubmit} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Interview</h3>
                <p className="text-xs text-slate-500">{selectedApp.candidate_name} • {selectedApp.job_title}</p>
              </div>
              <button type="button" onClick={() => setInterviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Interview Title</label>
              <input
                type="text"
                value={interviewData.title}
                onChange={(e) => setInterviewData({ ...interviewData, title: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={interviewData.scheduled_at}
                  onChange={(e) => setInterviewData({ ...interviewData, scheduled_at: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                <select
                  value={interviewData.duration_minutes}
                  onChange={(e) => setInterviewData({ ...interviewData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Format</label>
              <div className="flex gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={interviewData.interview_type === 'ONLINE'}
                    onChange={() => setInterviewData({ ...interviewData, interview_type: 'ONLINE' })}
                  />
                  <span>Online (Video)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={interviewData.interview_type === 'OFFLINE'}
                    onChange={() => setInterviewData({ ...interviewData, interview_type: 'OFFLINE' })}
                  />
                  <span>In-Person (Office)</span>
                </label>
              </div>
            </div>

            {interviewData.interview_type === 'ONLINE' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Meet / Zoom Link</label>
                <input
                  type="url"
                  value={interviewData.meeting_link}
                  onChange={(e) => setInterviewData({ ...interviewData, meeting_link: e.target.value })}
                  placeholder="https://meet.google.com/xyz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Office Location / Address</label>
                <input
                  type="text"
                  value={interviewData.location_details}
                  onChange={(e) => setInterviewData({ ...interviewData, location_details: e.target.value })}
                  placeholder="Suite 400, 100 Main St"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicantsPage;
