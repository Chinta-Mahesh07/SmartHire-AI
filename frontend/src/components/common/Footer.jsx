import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SmartHire <span className="text-blue-500">AI</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering next-generation recruiting with AI resume parsing, candidate scoring, and seamless job lifecycle tracking.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Explore Jobs</Link></li>
              <li><Link to="/resume-analyzer" className="hover:text-white transition-colors">AI Resume Analyzer</Link></li>
              <li><Link to="/candidate/dashboard" className="hover:text-white transition-colors">Candidate Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Recruiters</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/register" className="hover:text-white transition-colors">Post Openings</Link></li>
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Dashboard</Link></li>
              <li><Link to="/recruiter/applicants" className="hover:text-white transition-colors">Candidate Ranking</Link></li>
              <li><Link to="/recruiter/interviews" className="hover:text-white transition-colors">Interview Scheduler</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Contact & Support</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>smarthire@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                <span>+91 7815850325</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Hyderabad, Telangana, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SmartHire AI Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
