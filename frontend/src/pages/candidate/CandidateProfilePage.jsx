import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  DollarSign,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Link as LinkIcon,
  Github,
  Linkedin
} from 'lucide-react';
import { candidatesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CandidateProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    current_location: '',
    total_experience_years: 0,
    expected_salary: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  // Modal states for adding skill, education, experience
  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency_level: 'INTERMEDIATE', years_of_experience: 1 });
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', field_of_study: '', start_year: 2020, end_year: 2024, grade_or_gpa: '' });
  const [newExperience, setNewExperience] = useState({ company_name: '', job_title: '', location: '', start_date: '2022-01-01', is_current: true, description: '' });

  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchFullProfile = async () => {
    try {
      const res = await candidatesAPI.getProfile();
      setProfile(res.data);
      setFormData({
        headline: res.data.headline || '',
        bio: res.data.bio || '',
        current_location: res.data.current_location || '',
        total_experience_years: res.data.total_experience_years || 0,
        expected_salary: res.data.expected_salary || '',
        github_url: res.data.github_url || '',
        linkedin_url: res.data.linkedin_url || '',
        portfolio_url: res.data.portfolio_url || '',
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await candidatesAPI.updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      refreshProfile();
      fetchFullProfile();
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name) return;
    try {
      await candidatesAPI.addSkill(newSkill);
      showToast(`Added skill: ${newSkill.skill_name}`, 'success');
      setNewSkill({ skill_name: '', proficiency_level: 'INTERMEDIATE', years_of_experience: 1 });
      fetchFullProfile();
    } catch (err) {
      showToast('Error adding skill.', 'error');
    }
  };

  const handleRemoveSkill = async (id) => {
    try {
      await candidatesAPI.removeSkill(id);
      showToast('Skill removed.', 'info');
      fetchFullProfile();
    } catch (err) {
      showToast('Error removing skill.', 'error');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await candidatesAPI.addEducation(newEducation);
      showToast('Education record added!', 'success');
      setNewEducation({ institution: '', degree: '', field_of_study: '', start_year: 2020, end_year: 2024, grade_or_gpa: '' });
      fetchFullProfile();
    } catch (err) {
      showToast('Error adding education.', 'error');
    }
  };

  const handleRemoveEducation = async (id) => {
    try {
      await candidatesAPI.removeEducation(id);
      showToast('Education deleted.', 'info');
      fetchFullProfile();
    } catch (err) {
      showToast('Error deleting education.', 'error');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    try {
      await candidatesAPI.addExperience(newExperience);
      showToast('Work experience added!', 'success');
      setNewExperience({ company_name: '', job_title: '', location: '', start_date: '2022-01-01', is_current: true, description: '' });
      fetchFullProfile();
    } catch (err) {
      showToast('Error adding experience.', 'error');
    }
  };

  const handleRemoveExperience = async (id) => {
    try {
      await candidatesAPI.removeExperience(id);
      showToast('Experience deleted.', 'info');
      fetchFullProfile();
    } catch (err) {
      showToast('Error deleting experience.', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showToast('Select a PDF resume file.', 'warning');
      return;
    }
    setUploadingResume(true);
    const fd = new FormData();
    fd.append('file', resumeFile);
    fd.append('title', resumeFile.name);

    try {
      await candidatesAPI.uploadResume(fd);
      showToast('Resume uploaded and parsed successfully!', 'success');
      setResumeFile(null);
      fetchFullProfile();
    } catch (err) {
      showToast('Resume upload failed.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await candidatesAPI.deleteResume(id);
      showToast('Resume removed.', 'info');
      fetchFullProfile();
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Profile & Resume</h1>
        <p className="text-xs text-slate-500">
          Manage your personal details, credentials, technical skill portfolio, and PDF resumes for AI matching.
        </p>
      </div>

      {/* 1. Personal & Professional Details */}
      <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Personal & Career Headline</h2>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Professional Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Senior Full Stack Python & React Engineer | Cloud Architecture"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Professional Summary / Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief summary of your background, architectural focus, and career aspirations..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Location</label>
              <input
                type="text"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="San Francisco, CA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Total Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                value={formData.total_experience_years}
                onChange={(e) => setFormData({ ...formData, total_experience_years: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Expected Salary ($/yr)</label>
              <input
                type="number"
                value={formData.expected_salary}
                onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                placeholder="130000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">GitHub Profile URL</label>
              <input
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Portfolio / Website</label>
              <input
                type="url"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.dev"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          Save Details
        </button>
      </form>

      {/* 2. Resumes (PDF Upload & Listing) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">PDF Resumes</h2>
          <p className="text-xs text-slate-500">Upload your PDF resumes. Text and skills are extracted automatically for AI job matching.</p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleResumeUpload} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
          <button
            type="submit"
            disabled={!resumeFile || uploadingResume}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploadingResume ? 'Extracting & Saving...' : 'Upload & Parse PDF'}
          </button>
        </form>

        {/* Existing Resumes */}
        <div className="space-y-3">
          {profile?.resumes?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No resumes uploaded yet.</p>
          ) : (
            profile?.resumes?.map((resume) => (
              <div
                key={resume.id}
                className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{resume.title}</p>
                      {resume.is_primary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {resume.file_url && (
                    <a
                      href={resume.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Skills Portfolio */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Technical Skills Portfolio</h2>
          <p className="text-xs text-slate-500">Skills are used by the AI Recommendation Engine to rank job opportunities.</p>
        </div>

        {/* Add Skill Form */}
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newSkill.skill_name}
            onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
            placeholder="Skill name (e.g. Python, React, AWS, Docker)"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <select
            value={newSkill.proficiency_level}
            onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: e.target.value })}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </form>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {profile?.skills?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No skills added yet.</p>
          ) : (
            profile?.skills?.map((cs) => (
              <span
                key={cs.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <span>{cs.skill_name}</span>
                <span className="text-[10px] text-blue-600 font-normal">({cs.proficiency_level})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(cs.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 4. Education History */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Education Details</h2>
          <p className="text-xs text-slate-500">Degree, institutions, and graduation records.</p>
        </div>

        <form onSubmit={handleAddEducation} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <input
            type="text"
            value={newEducation.institution}
            onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
            placeholder="University / College"
            required
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
          <input
            type="text"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            placeholder="Degree (e.g. B.S., M.S.)"
            required
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
          <input
            type="text"
            value={newEducation.field_of_study}
            onChange={(e) => setNewEducation({ ...newEducation, field_of_study: e.target.value })}
            placeholder="Field of Study (e.g. Computer Science)"
            required
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newEducation.start_year}
              onChange={(e) => setNewEducation({ ...newEducation, start_year: parseInt(e.target.value) || 2020 })}
              placeholder="Start Year"
              className="w-1/2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            />
            <input
              type="number"
              value={newEducation.end_year}
              onChange={(e) => setNewEducation({ ...newEducation, end_year: parseInt(e.target.value) || 2024 })}
              placeholder="End Year"
              className="w-1/2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs"
            >
              Add Education
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {profile?.educations?.map((edu) => (
            <div key={edu.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{edu.degree} in {edu.field_of_study}</h4>
                <p className="text-[11px] text-slate-500">{edu.institution} ({edu.start_year} - {edu.end_year || 'Present'})</p>
              </div>
              <button onClick={() => handleRemoveEducation(edu.id)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Work Experience */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Work Experience</h2>
          <p className="text-xs text-slate-500">Employment history and professional accomplishments.</p>
        </div>

        <form onSubmit={handleAddExperience} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <input
            type="text"
            value={newExperience.company_name}
            onChange={(e) => setNewExperience({ ...newExperience, company_name: e.target.value })}
            placeholder="Company Name"
            required
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
          <input
            type="text"
            value={newExperience.job_title}
            onChange={(e) => setNewExperience({ ...newExperience, job_title: e.target.value })}
            placeholder="Job Title"
            required
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          />
          <div className="sm:col-span-2">
            <textarea
              rows={2}
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              placeholder="Responsibilities and key achievements..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-white"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs"
            >
              Add Work Experience
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {profile?.experiences?.map((exp) => (
            <div key={exp.id} className="p-4 rounded-2xl border border-slate-100 flex items-start justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{exp.job_title} at {exp.company_name}</h4>
                <p className="text-[11px] text-slate-500">{exp.start_date} to {exp.is_current ? 'Present' : exp.end_date}</p>
                {exp.description && <p className="text-xs text-slate-600 mt-1">{exp.description}</p>}
              </div>
              <button onClick={() => handleRemoveExperience(exp.id)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
