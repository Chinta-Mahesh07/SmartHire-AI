import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, DollarSign, MapPin, Plus, X, ArrowLeft, CheckCircle } from 'lucide-react';
import { jobsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PostJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    job_type: 'FULL_TIME',
    experience_level: 'MID',
    min_experience_years: 2,
    min_salary: '',
    max_salary: '',
    salary_negotiable: true,
    location: '',
    is_remote: false,
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skill_names: ['Python', 'React'],
    status: 'ACTIVE',
  });

  useEffect(() => {
    jobsAPI.getCategories().then((res) => {
      const cats = res.data.results || res.data || [];
      setCategories(cats);
      if (cats.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: cats[0].id }));
      }
    });

    if (isEditing) {
      jobsAPI.getJobDetail(id).then((res) => {
        const j = res.data;
        setFormData({
          title: j.title || '',
          category: j.category || '',
          job_type: j.job_type || 'FULL_TIME',
          experience_level: j.experience_level || 'MID',
          min_experience_years: j.min_experience_years || 1,
          min_salary: j.min_salary || '',
          max_salary: j.max_salary || '',
          salary_negotiable: j.salary_negotiable || false,
          location: j.location || '',
          is_remote: j.is_remote || false,
          description: j.description || '',
          requirements: j.requirements || '',
          responsibilities: j.responsibilities || '',
          benefits: j.benefits || '',
          skill_names: j.required_skills_list || [],
          status: j.status || 'ACTIVE',
        });
      });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skill_names.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skill_names: [...prev.skill_names, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skill_names: prev.skill_names.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.requirements) {
      showToast('Please fill in title, description, and requirements.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await jobsAPI.updateJob(id, formData);
        showToast('Job posting updated successfully!', 'success');
      } else {
        await jobsAPI.createJob(formData);
        showToast('Job published successfully!', 'success');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      showToast('Failed to save job.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/recruiter/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isEditing ? 'Edit Job Opening' : 'Post a New Job Opening'}
        </h1>
        <p className="text-xs text-slate-500">
          Specify role requirements and core skills to initiate AI candidate matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Machine Learning Engineer"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Employment Type</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Experience Level</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
              >
                <option value="ENTRY">Entry Level (0-2 yrs)</option>
                <option value="MID">Mid Level (2-5 yrs)</option>
                <option value="SENIOR">Senior Level (5-8 yrs)</option>
                <option value="LEAD">Lead / Staff (8+ yrs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA or Remote"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Min Exp (Years)</label>
              <input
                type="number"
                name="min_experience_years"
                value={formData.min_experience_years}
                onChange={handleChange}
                min="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1 flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={formData.is_remote}
                  onChange={handleChange}
                  className="rounded text-blue-600"
                />
                <span>Remote Allowed</span>
              </label>
            </div>
          </div>

          {/* Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Min Salary ($/yr)</label>
              <input
                type="number"
                name="min_salary"
                value={formData.min_salary}
                onChange={handleChange}
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Max Salary ($/yr)</label>
              <input
                type="number"
                name="max_salary"
                value={formData.max_salary}
                onChange={handleChange}
                placeholder="150000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700">Required Skills for AI Matching</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Python, Docker, React, AWS)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.skill_names.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-blue-800">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Descriptions */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-700">Job Description *</label>
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Overview of the company, mission, and team context..."
              required
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Role Requirements & Qualifications *</label>
            <textarea
              rows={4}
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Specific technical proficiencies, frameworks, education, and years of experience..."
              required
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Responsibilities</label>
            <textarea
              rows={3}
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Day-to-day duties and deliverables..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Benefits & Perks</label>
            <textarea
              rows={3}
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="Health coverage, 401(k), equity, flexible hours, remote budget..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJobPage;
