import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import JobsPage from '../pages/JobsPage';
import JobDetailPage from '../pages/JobDetailPage';
import ResumeAnalyzerPage from '../pages/ResumeAnalyzerPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Candidate Pages
import CandidateDashboard from '../pages/candidate/CandidateDashboard';
import CandidateProfilePage from '../pages/candidate/CandidateProfilePage';
import CandidateApplicationsPage from '../pages/candidate/CandidateApplicationsPage';
import CandidateInterviewsPage from '../pages/candidate/CandidateInterviewsPage';
import CandidateRecommendationsPage from '../pages/candidate/CandidateRecommendationsPage';
import CandidateSavedJobsPage from '../pages/candidate/CandidateSavedJobsPage';
import CandidateCopilotPage from '../pages/candidate/CandidateCopilotPage';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import RecruiterJobsPage from '../pages/recruiter/RecruiterJobsPage';
import PostJobPage from '../pages/recruiter/PostJobPage';
import RecruiterApplicantsPage from '../pages/recruiter/RecruiterApplicantsPage';
import RecruiterInterviewsPage from '../pages/recruiter/RecruiterInterviewsPage';
import CompanyProfilePage from '../pages/recruiter/CompanyProfilePage';
import RecruiterCopilotPage from '../pages/recruiter/RecruiterCopilotPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminRecruitersPage from '../pages/admin/AdminRecruitersPage';
import AdminJobsPage from '../pages/admin/AdminJobsPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

// Role Guard Component
const RoleRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Candidate Dashboard Routes */}
      <Route
        path="/candidate"
        element={
          <RoleRoute allowedRoles={['CANDIDATE']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfilePage />} />
        <Route path="applications" element={<CandidateApplicationsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
        <Route path="recommendations" element={<CandidateRecommendationsPage />} />
        <Route path="copilot" element={<CandidateCopilotPage />} />
        <Route path="saved-jobs" element={<CandidateSavedJobsPage />} />
        <Route path="ai-analyzer" element={<ResumeAnalyzerPage />} />
      </Route>

      {/* Recruiter Dashboard Routes */}
      <Route
        path="/recruiter"
        element={
          <RoleRoute allowedRoles={['RECRUITER', 'ADMIN']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<RecruiterJobsPage />} />
        <Route path="jobs/new" element={<PostJobPage />} />
        <Route path="jobs/:id/edit" element={<PostJobPage />} />
        <Route path="applicants" element={<RecruiterApplicantsPage />} />
        <Route path="interviews" element={<RecruiterInterviewsPage />} />
        <Route path="copilot" element={<RecruiterCopilotPage />} />
        <Route path="company" element={<CompanyProfilePage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="recruiters" element={<AdminRecruitersPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
