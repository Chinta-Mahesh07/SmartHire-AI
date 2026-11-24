import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Sparkles,
  Bookmark,
  Building,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  ShieldCheck,
  TrendingUp,
  Award,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from '../components/common/NotificationDropdown';
import AICopilotDrawer from '../components/agent/AICopilotDrawer';

const DashboardLayout = () => {
  const { user, logout, isAdmin, isRecruiter, isCandidate } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation Links tailored to role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Directory', path: '/admin/users', icon: Users },
        { label: 'Recruiter Approvals', path: '/admin/recruiters', icon: ShieldCheck },
        { label: 'Manage All Jobs', path: '/admin/jobs', icon: Briefcase },
        { label: 'Analytics & Reports', path: '/admin/reports', icon: TrendingUp },
      ];
    }
    if (isRecruiter) {
      return [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Job Postings', path: '/recruiter/jobs', icon: Briefcase },
        { label: 'Candidates & Applicants', path: '/recruiter/applicants', icon: Users },
        { label: 'Interview Schedules', path: '/recruiter/interviews', icon: Calendar },
        { label: 'AI Hiring Copilot', path: '/recruiter/copilot', icon: Sparkles },
        { label: 'Company Profile', path: '/recruiter/company', icon: Building },
      ];
    }
    // Candidate
    return [
      { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
      { label: 'Find Jobs', path: '/jobs', icon: Briefcase },
      { label: 'AI Recommended Jobs', path: '/candidate/recommendations', icon: Sparkles },
      { label: 'AI Career Copilot', path: '/candidate/copilot', icon: Bot },
      { label: 'My Applications', path: '/candidate/applications', icon: FileText },
      { label: 'Scheduled Interviews', path: '/candidate/interviews', icon: Calendar },
      { label: 'AI Resume Analyzer', path: '/candidate/ai-analyzer', icon: Award },
      { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
      { label: 'Profile & Resume', path: '/candidate/profile', icon: Settings },
    ];
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              SmartHire <span className="text-blue-400">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Tag */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-sm uppercase text-white shadow-inner">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {user?.role} PORTAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-75" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Workspace</span>
              <h2 className="text-sm font-bold text-slate-800">
                {user?.role === 'ADMIN' ? 'Platform Administration' : user?.role === 'RECRUITER' ? 'Recruitment Hub' : 'Career Hub'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Back to Site
            </Link>
          </div>
        </header>

        {/* Dynamic Nested View */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Recruitment & Career Copilot Drawer */}
      <AICopilotDrawer />
    </div>
  );
};

export default DashboardLayout;
