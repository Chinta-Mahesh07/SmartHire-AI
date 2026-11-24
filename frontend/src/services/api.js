import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh or errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          if (res.status === 200) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
};

// Jobs APIs
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs/', { params }),
  getJobDetail: (id) => api.get(`/jobs/${id}/`),
  getCategories: () => api.get('/jobs/categories/'),
  getRecruiterJobs: () => api.get('/jobs/recruiter/manage/'),
  createJob: (jobData) => api.post('/jobs/recruiter/manage/', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/recruiter/manage/${id}/`, jobData),
  deleteJob: (id) => api.delete(`/jobs/recruiter/manage/${id}/`),
};

// Applications APIs
export const applicationsAPI = {
  applyJob: (data) => api.post('/applications/apply/', data),
  getCandidateApplications: () => api.get('/applications/candidate/my-applications/'),
  getRecruiterApplications: (params) => api.get('/applications/recruiter/manage/', { params }),
  getApplicationDetail: (id) => api.get(`/applications/recruiter/manage/${id}/`),
  updateStatus: (id, data) => api.patch(`/applications/recruiter/manage/${id}/`, data),
};

// Candidate APIs
export const candidatesAPI = {
  getProfile: () => api.get('/candidates/profile/'),
  updateProfile: (data) => api.patch('/candidates/profile/', data),
  getDashboardStats: () => api.get('/candidates/dashboard/stats/'),
  getSkills: (search) => api.get('/candidates/skills/', { params: { search } }),
  addSkill: (data) => api.post('/candidates/my-skills/', data),
  removeSkill: (id) => api.delete(`/candidates/my-skills/${id}/`),
  addEducation: (data) => api.post('/candidates/education/', data),
  updateEducation: (id, data) => api.put(`/candidates/education/${id}/`, data),
  removeEducation: (id) => api.delete(`/candidates/education/${id}/`),
  addExperience: (data) => api.post('/candidates/experience/', data),
  updateExperience: (id, data) => api.put(`/candidates/experience/${id}/`, data),
  removeExperience: (id) => api.delete(`/candidates/experience/${id}/`),
  getResumes: () => api.get('/candidates/resumes/'),
  uploadResume: (formData) => api.post('/candidates/resumes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteResume: (id) => api.delete(`/candidates/resumes/${id}/`),
  getSavedJobs: () => api.get('/candidates/saved-jobs/'),
  toggleSaveJob: (jobId) => api.post(`/candidates/saved-jobs/${jobId}/toggle/`),
};

// Recruiter APIs
export const recruitersAPI = {
  getProfile: () => api.get('/recruiters/profile/'),
  updateProfile: (data) => api.patch('/recruiters/profile/', data),
  getDashboardStats: () => api.get('/recruiters/dashboard/stats/'),
  getMyCompany: () => api.get('/companies/me/'),
  updateCompany: (id, data) => api.patch(`/companies/${id}/`, data),
  createCompany: (data) => api.post('/companies/', data),
};

// Interviews APIs
export const interviewsAPI = {
  scheduleInterview: (data) => api.post('/interviews/schedule/', data),
  getRecruiterInterviews: () => api.get('/interviews/recruiter/'),
  getCandidateInterviews: () => api.get('/interviews/candidate/'),
  updateInterview: (id, data) => api.patch(`/interviews/${id}/`, data),
};

// Notifications APIs
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/read-all/'),
};

// AI Analyzer APIs
export const aiAPI = {
  analyzeResume: (formDataOrData, isMultipart = false) => {
    const headers = isMultipart ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.post('/ai/analyze-resume/', formDataOrData, { headers });
  },
  getRecommendations: () => api.get('/ai/recommendations/'),
  getHistory: () => api.get('/ai/history/'),

  // AI Agent Copilot
  agentChat: (data) => api.post('/ai/agent/chat/', data),
  getAgentPrompts: () => api.get('/ai/agent/prompts/'),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => api.get('/auth/admin/analytics/'),
  getUsers: (params) => api.get('/auth/admin/users/', { params }),
  updateUser: (id, data) => api.patch(`/auth/admin/users/${id}/`, data),
  approveRecruiter: (id, data) => api.post(`/auth/admin/recruiters/${id}/approval/`, data),
  getAllJobs: () => api.get('/jobs/admin/all/'),
  updateJobStatus: (id, status) => api.patch(`/jobs/admin/${id}/status/`, { status }),
  deleteJob: (id) => api.delete(`/jobs/admin/${id}/status/`),
};

export default api;
