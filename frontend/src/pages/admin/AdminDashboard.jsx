import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Building,
  Award,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { adminAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const COLORS = ['#2563EB', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading admin analytics console...</p>
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const statusData = analytics?.status_breakdown || [];
  const categoryData = analytics?.category_distribution || [];
  const trendData = analytics?.trends || [];

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Root Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Analytics & Governance</h1>
          <p className="text-xs text-slate-500">Real-time health, placement conversion rates, and ecosystem metrics.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/recruiters"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
          >
            Review Approvals
          </Link>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-extrabold text-slate-900">{stats.total_users || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Active Platform Accounts</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recruiters</p>
          <p className="text-2xl font-extrabold text-blue-600">{stats.total_recruiters || 0}</p>
          <span className="text-[10px] text-slate-400">Employers & HR</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Candidates</p>
          <p className="text-2xl font-extrabold text-indigo-600">{stats.total_candidates || 0}</p>
          <span className="text-[10px] text-slate-400">Job Seekers</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Jobs</p>
          <p className="text-2xl font-extrabold text-slate-900">{stats.total_jobs || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{stats.active_jobs || 0} currently active</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applications</p>
          <p className="text-2xl font-extrabold text-purple-600">{stats.total_applications || 0}</p>
          <span className="text-[10px] text-slate-400">Candidate Submissions</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Placements</p>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.successful_placements || 0}</p>
          <span className="text-[10px] text-emerald-600 font-bold">{stats.placement_rate || 0}% Success Rate</span>
        </div>
      </div>

      {/* Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recruitment Activity Growth Curve */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application & Placement Growth Trends</h3>
              <p className="text-xs text-slate-400">Monthly candidate velocity across platform roles</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              Cumulative Growth
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                <Area type="monotone" dataKey="placements" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlacements)" name="Placements" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Pipeline Breakdown (Pie/Donut) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Application Pipeline Status</h3>
            <p className="text-xs text-slate-400">Current candidate distribution in funnel</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
            {statusData.map((item, idx) => (
              <div key={item.status} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <span className="font-bold text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs by Category Bar Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Job Postings by Discipline / Category</h3>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
              />
              <Bar dataKey="jobs_count" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Active Roles" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
