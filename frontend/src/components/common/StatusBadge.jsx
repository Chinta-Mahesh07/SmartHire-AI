import React from 'react';

const statusConfig = {
  APPLIED: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  SHORTLISTED: { label: 'Shortlisted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  SELECTED: { label: 'Selected / Hired', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  REJECTED: { label: 'Not Selected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  DRAFT: { label: 'Draft', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  PAUSED: { label: 'Paused', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  CLOSED: { label: 'Closed', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },

  SCHEDULED: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

const StatusBadge = ({ status, className = '' }) => {
  const conf = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {conf.label}
    </span>
  );
};

export default StatusBadge;
