import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Briefcase, User, LogOut, Menu, X, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAdmin, isRecruiter, isCandidate } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">SmartHire <span className="text-blue-600">AI</span></span>
              <span className="hidden sm:inline-block ml-1 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">PRO</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Find Jobs
            </Link>
            <Link to="/resume-analyzer" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              AI Resume Analyzer
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.first_name || user.username}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  {profileDropdownOpen && (
                    <div
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>

                      {isCandidate && (
                        <Link
                          to="/candidate/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Profile & Resume
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden gap-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Find Jobs
          </Link>
          <Link
            to="/resume-analyzer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            AI Resume Analyzer
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <Link
                to={getDashboardPath()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                Go to Dashboard ({user.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
