import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Building, Mail, Clock, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminRecruitersPage = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchRecruiters = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ role: 'RECRUITER' });
      setRecruiters(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load recruiters.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, []);

  const handleApproval = async (userId, action) => {
    try {
      await adminAPI.approveRecruiter(userId, { action, notes: `Reviewed by admin on ${new Date().toLocaleDateString()}` });
      showToast(`Recruiter account ${action}d successfully.`, 'success');
      fetchRecruiters();
    } catch (err) {
      showToast('Failed to process recruiter approval.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recruiter Account Verification</h1>
        <p className="text-xs text-slate-500">
          Review, approve, or reject recruiter registrations and employer authorization.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading recruiter accounts...</p>
        </div>
      ) : recruiters.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No recruiter accounts found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {recruiters.map((recruiter) => {
            const isApproved = recruiter.recruiter_approval === 'APPROVED';
            const isPending = recruiter.recruiter_approval === 'PENDING';
            const isRejected = recruiter.recruiter_approval === 'REJECTED';

            return (
              <div
                key={recruiter.id}
                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{recruiter.first_name ? `${recruiter.first_name} ${recruiter.last_name}` : recruiter.username}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {recruiter.recruiter_approval || 'APPROVED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    Company: <strong className="text-slate-900">{recruiter.company_name || 'Acme Inc.'}</strong>
                  </p>

                  <p className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {recruiter.email}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Registered {new Date(recruiter.created_at).toLocaleDateString()}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleApproval(recruiter.id, 'approve')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isApproved
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isApproved ? 'Approved' : 'Approve'}</span>
                  </button>

                  <button
                    onClick={() => handleApproval(recruiter.id, 'reject')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isRejected
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{isRejected ? 'Rejected' : 'Reject'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRecruitersPage;
