import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Star, CheckCircle, MessageSquare } from 'lucide-react';
import { interviewsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';

const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Feedback modal state
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(4);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const fetchInterviews = async () => {
    try {
      const res = await interviewsAPI.getRecruiterInterviews();
      setInterviews(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load interviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenFeedback = (interview) => {
    setSelectedInterview(interview);
    setFeedback(interview.feedback || '');
    setRating(interview.rating || 4);
    setFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    try {
      await interviewsAPI.updateInterview(selectedInterview.id, {
        feedback,
        rating,
        status: 'COMPLETED',
      });
      showToast('Interview marked as Completed and feedback saved!', 'success');
      setFeedbackModalOpen(false);
      fetchInterviews();
    } catch (err) {
      showToast('Failed to save feedback.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Management</h1>
        <p className="text-xs text-slate-500">
          Conduct interviews, submit evaluation notes, and assign candidate ratings.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading scheduled interviews...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No interviews scheduled yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Schedule interviews directly from the Candidate Pipeline & Applicants page.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">
                    Candidate: {item.candidate_name} ({item.candidate_email})
                  </p>
                  <p className="text-xs text-slate-500">Position: {item.job_title}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenFeedback(item)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.feedback ? 'Edit Feedback' : 'Add Feedback & Rating'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  {new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                </span>
                <span>{item.duration_minutes} Minutes</span>
                <span>Type: {item.interview_type}</span>
                {item.meeting_link && (
                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Link
                  </a>
                )}
              </div>

              {item.feedback && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Recruiter Feedback:</span>
                    {item.rating && (
                      <div className="flex text-amber-500">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="italic">{item.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Feedback & Rating Modal */}
      {feedbackModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveFeedback} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Interview Evaluation</h3>
                <p className="text-xs text-slate-500">{selectedInterview.candidate_name} • {selectedInterview.job_title}</p>
              </div>
              <button type="button" onClick={() => setFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Rating (1 to 5 Stars)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      rating >= num ? 'bg-amber-500 text-white border-amber-600' : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    ★ {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Feedback & Notes</label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Candidate strengths, code quality, communication, areas of concern..."
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save Evaluation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewsPage;
