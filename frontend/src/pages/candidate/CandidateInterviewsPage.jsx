import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { interviewsAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const CandidateInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewsAPI.getCandidateInterviews()
      .then((res) => setInterviews(res.data.results || res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scheduled Interviews</h1>
        <p className="text-xs text-slate-500">
          Manage upcoming video calls and in-person recruiter interviews.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading interview schedule...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No scheduled interviews yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When recruiters schedule interviews for your submitted applications, they will appear here with calendar details and meeting links.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{item.company_name}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.title}</h3>
                  <p className="text-xs text-slate-500">Position: {item.job_title}</p>
                </div>

                {item.interview_type === 'ONLINE' && item.meeting_link && (
                  <a
                    href={item.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {new Date(item.scheduled_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {item.duration_minutes} Minutes
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Video className="w-4 h-4 text-slate-400" />
                  Format: {item.interview_type}
                </span>
              </div>

              {item.feedback && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Recruiter Feedback / Notes:</p>
                  <p className="italic leading-relaxed">{item.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewsPage;
