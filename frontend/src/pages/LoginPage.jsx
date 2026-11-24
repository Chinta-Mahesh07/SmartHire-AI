import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email, password });
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Invalid email or password.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Fillers
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign in to SmartHire AI</h1>
          <p className="text-xs text-slate-500">Access your candidate portal, recruiter suite, or admin console</p>
        </div>

        {/* Demo One-Click Login Pills */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900 text-center">
            🚀 Quick 1-Click Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@smarthire.ai', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition-all text-center flex flex-col items-center gap-0.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('sarah.recruiter@techpulse.io', 'recruiter123')}
              className="px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition-all text-center flex flex-col items-center gap-0.5"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('alex.dev@gmail.com', 'candidate123')}
              className="px-2 py-1.5 rounded-lg bg-white border border-blue-200 text-[11px] font-semibold text-slate-800 hover:bg-blue-600 hover:text-white transition-all text-center flex flex-col items-center gap-0.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidate</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <a href="#" className="text-[11px] font-medium text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
