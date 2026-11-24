import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Building,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  Bookmark,
  Share2,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import { jobsAPI, candidatesAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Application Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);

  useEffect(() => {
    jobsAPI.getJobDetail(id)
      .then((res) => {
        setJob(res.data);
        setHasApplied(res.data.has_applied);
        setIsSaved(res.data.is_saved);
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load job details.', 'error');
      })
      .finally(() => setLoading(false));

    if (isCandidate) {
      candidatesAPI.getResumes().then((res) => {
        const list = res.data.results || res.data || [];
        setResumes(list);
        const primary = list.find((r) => r.is_primary);
        if (primary) setSelectedResumeId(primary.id);
        else if (list.length > 0) setSelectedResumeId(list[0].id);
      }).catch(() => {});
    }
  }, [id, isCandidate]);

  const handleToggleSave = async () => {
    if (!user) {
      showToast('Please sign in to save jobs.', 'info');
      navigate('/login');
      return;
    }
    try {
      const res = await candidatesAPI.toggleSaveJob(id);
      setIsSaved(res.data.saved);
      showToast(res.data.saved ? 'Job bookmarked!' : 'Job removed from bookmarks.', 'info');
    } catch (err) {
      showToast('Error updating bookmark.', 'error');
    }
  };

  const handleOpenApplyModal = () => {
    if (!user) {
      showToast('Please log in as a candidate to apply.', 'info');
      navigate('/login');
      return;
    }
    if (!isCandidate) {
      showToast('Only candidate accounts can submit job applications.', 'warning');
      return;
    }
    setModalOpen(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await applicationsAPI.applyJob({
        job: parseInt(id),
        resume: selectedResumeId,
        cover_note: coverNote,
      });
      setHasApplied(true);
      setApplicationResult(res.data.application);
      showToast('Application submitted successfully!', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit application.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-xs text-slate-500">The job you are looking for may have been removed or closed.</p>
        <Link to="/jobs" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{job.company_name}</span>
              {job.is_remote && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Remote
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                {job.job_type.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </span>
              {job.min_salary && (
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  ${(job.min_salary / 1000).toFixed(0)}k - ${(job.max_salary / 1000).toFixed(0)}k / year
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Min {job.min_experience_years} years experience
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-4 h-4" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
            {hasApplied ? (
              <div className="px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Applied</span>
              </div>
            ) : (
              <button
                onClick={handleOpenApplyModal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply with AI Match</span>
              </button>
            )}

            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border transition-all ${
                isSaved
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Saved' : 'Save job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Required Skills Badges */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Required Skills & Technologies</p>
          <div className="flex flex-wrap gap-2">
            {job.required_skills_list?.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About the Role</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Key Responsibilities</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Requirements */}
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Requirements & Qualifications</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </div>

          {/* Benefits */}
          {job.benefits && (
            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">Benefits & Perks</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.benefits}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Company Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">About the Company</h3>
            <div>
              <p className="text-base font-bold text-slate-900">{job.company_name}</p>
              {job.company_details?.industry && (
                <p className="text-xs text-blue-600 font-medium mt-0.5">{job.company_details.industry}</p>
              )}
            </div>

            {job.company_details?.description && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.company_details.description}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              {job.company_details?.headquarters && (
                <div className="flex justify-between">
                  <span>Headquarters</span>
                  <span className="font-medium text-slate-800">{job.company_details.headquarters}</span>
                </div>
              )}
              {job.company_details?.company_size && (
                <div className="flex justify-between">
                  <span>Company Size</span>
                  <span className="font-medium text-slate-800">{job.company_details.company_size} employees</span>
                </div>
              )}
              {job.company_details?.founded_year && (
                <div className="flex justify-between">
                  <span>Founded</span>
                  <span className="font-medium text-slate-800">{job.company_details.founded_year}</span>
                </div>
              )}
            </div>

            {job.company_details?.website && (
              <a
                href={job.company_details.website}
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Visit Company Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 animate-in fade-in">
            {applicationResult ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your application for <strong>{job.title}</strong> has been delivered to the hiring team.
                </p>

                {/* Instant AI Match Score Badge */}
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <p className="text-xs font-semibold text-blue-900">Calculated AI Match Score</p>
                  <p className="text-3xl font-extrabold text-blue-600">{applicationResult.ai_match_score}%</p>
                  <p className="text-[11px] text-blue-700">
                    High match candidate profile matching {applicationResult.match_details?.matching_skills?.length || 0} core requirements.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setApplicationResult(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Close
                  </button>
                  <Link
                    to="/candidate/applications"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold text-center"
                  >
                    Track Applications
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Apply for Position</h3>
                    <p className="text-xs text-slate-500">{job.title} • {job.company_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Resume Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Select Resume (PDF)</span>
                    <Link to="/candidate/profile" className="text-blue-600 text-[11px] hover:underline">
                      + Upload New Resume
                    </Link>
                  </label>

                  {resumes.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                      <span>No resume found on your profile. Upload one in Profile to enable AI matching.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map((r) => (
                        <label
                          key={r.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                            selectedResumeId === r.id
                              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name="resume_selection"
                              checked={selectedResumeId === r.id}
                              onChange={() => setSelectedResumeId(r.id)}
                              className="text-blue-600"
                            />
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>{r.title}</span>
                          </div>
                          {r.is_primary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                              Primary
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cover Note / Brief Pitch</label>
                  <textarea
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly highlight why your background aligns with this role..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
